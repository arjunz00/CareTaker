import os
import time
import json
import uuid
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger("aegisnet.notifications")

# Attempt Firebase Admin SDK import
FCM_AVAILABLE = False
try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    # If credentials path or env provided, initialize
    cred_file = os.environ.get("FIREBASE_CREDENTIALS_JSON", "")
    if cred_file and os.path.exists(cred_file):
        cred = credentials.Certificate(cred_file)
        firebase_admin.initialize_app(cred)
        FCM_AVAILABLE = True
        logger.info("Firebase Admin SDK initialized successfully.")
    else:
        logger.info("Firebase Admin SDK available. Running in dual FCM Web-Push emulation mode.")
except Exception as e:
    logger.info(f"Firebase Admin SDK not loaded ({e}). Running in native Web-Push & WebSocket notification mode.")

class NotificationService:
    def __init__(self):
        # Default notification settings per role
        self.default_preferences = {
            "emergency": True,
            "fall": True,
            "risk": True,
            "device": True,
            "volunteer": True,
            "doctor": True,
            "credits": True,
            "verification": True,
            "certificate": True,
            "resolved": True,
            "sound_enabled": True,
            "vibration_enabled": True
        }

    def _sanitize_privacy_body(self, body: str) -> str:
        """Strip raw sensitive clinical/medication names to protect lockscreen privacy."""
        sensitive_terms = ["penicillin", "amlodipine", "atorvastatin", "stroke", "ischemic", "hypertension"]
        clean_body = body
        for term in sensitive_terms:
            clean_body = clean_body.replace(term, "medical status")
        return clean_body

    def create_notification(
        self,
        role: str,
        type_: str,
        title: str,
        body: str,
        link: str = "/patient/emergency",
        critical: bool = False,
        user_id: str = "all",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Creates, persists, and dispatches a multi-channel notification."""
        from app.database.mongodb import db_client
        
        notification_id = f"NOTIF-{uuid.uuid4().hex[:8].upper()}"
        timestamp = time.time()
        clean_body = self._sanitize_privacy_body(body)

        notification_doc = {
            "id": notification_id,
            "role": role.lower(),
            "user_id": user_id,
            "type": type_,
            "title": title,
            "body": clean_body,
            "link": link,
            "critical": critical,
            "read": False,
            "timestamp": timestamp,
            "formatted_time": time.strftime("%H:%M:%S", time.localtime(timestamp)),
            "metadata": metadata or {}
        }

        # 1. Persist in database
        try:
            db_client.insert_one("notifications", notification_doc)
        except Exception as e:
            logger.error(f"Failed to persist notification in DB: {e}")

        # 2. Dispatch to FCM if token available
        self._send_fcm_push(role, user_id, title, clean_body, notification_doc)

        return notification_doc

    def _send_fcm_push(self, role: str, user_id: str, title: str, body: str, payload: Dict[str, Any]):
        """Dispatches push payload to registered FCM device tokens."""
        from app.database.mongodb import db_client
        
        # Retrieve tokens
        tokens_map = db_client.mock_data.get("fcm_tokens", {})
        target_tokens = []
        for key, tok in tokens_map.items():
            if user_id == "all" or key.startswith(f"{role}:{user_id}") or key.startswith(role):
                target_tokens.append(tok)

        if FCM_AVAILABLE and target_tokens:
            try:
                msg = messaging.MulticastMessage(
                    notification=messaging.Notification(title=title, body=body),
                    data={"payload": json.dumps(payload)},
                    tokens=target_tokens
                )
                messaging.send_multicast(msg)
                logger.info(f"FCM Push multicast sent to {len(target_tokens)} device tokens.")
            except Exception as e:
                logger.warning(f"FCM multicast dispatch warning: {e}")
        else:
            logger.info(f"[FCM Emulation Engine] Push dispatched for role='{role}' (target tokens: {len(target_tokens)}): '{title}' - '{body}'")

    def get_notifications(self, role: str, user_id: str = "all", limit: int = 50) -> List[Dict[str, Any]]:
        from app.database.mongodb import db_client
        
        role = role.lower()
        all_notifs = db_client.find_many("notifications", {}) or []
        
        filtered = [
            n for n in all_notifs 
            if n.get("role") in {role, "all"} or n.get("user_id") in {user_id, "all"}
        ]
        filtered.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
        return filtered[:limit]

    def mark_read(self, notification_id: str) -> bool:
        from app.database.mongodb import db_client
        
        try:
            db_client.update_one("notifications", {"id": notification_id}, {"read": True})
            return True
        except Exception as e:
            logger.error(f"Error marking notification read: {e}")
            return False

    def mark_all_read(self, role: str, user_id: str = "all") -> bool:
        from app.database.mongodb import db_client
        
        try:
            all_notifs = db_client.find_many("notifications", {}) or []
            for n in all_notifs:
                if n.get("role") in {role.lower(), "all"}:
                    db_client.update_one("notifications", {"id": n["id"]}, {"read": True})
            return True
        except Exception as e:
            logger.error(f"Error marking all notifications read: {e}")
            return False

    def save_fcm_token(self, user_id: str, role: str, token: str):
        from app.database.mongodb import db_client
        
        key = f"{role.lower()}:{user_id}"
        if "fcm_tokens" not in db_client.mock_data:
            db_client.mock_data["fcm_tokens"] = {}
        db_client.mock_data["fcm_tokens"][key] = token
        db_client.save_mock_file()
        return {"status": "success", "registered_key": key}

    def get_preferences(self, user_id: str, role: str) -> Dict[str, Any]:
        from app.database.mongodb import db_client
        
        key = f"{role.lower()}:{user_id}"
        prefs = db_client.mock_data.get("notification_preferences", {}).get(key)
        return prefs or self.default_preferences

    def update_preferences(self, user_id: str, role: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        from app.database.mongodb import db_client
        
        key = f"{role.lower()}:{user_id}"
        if "notification_preferences" not in db_client.mock_data:
            db_client.mock_data["notification_preferences"] = {}
        db_client.mock_data["notification_preferences"][key] = preferences
        db_client.save_mock_file()
        return preferences

notification_service = NotificationService()
