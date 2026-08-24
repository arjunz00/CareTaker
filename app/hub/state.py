import time
import uuid
from typing import Dict, Any, Optional
from app.database.db import db, EmergencyEvent
from app.hub.detector import EdgeDetector

class HubStateMachine:
    def __init__(self):
        self.state = "NORMAL"  # "NORMAL", "WARNING_COUNTDOWN", "CONFIRMED", "ESCALATED"
        self.active_event_id: Optional[str] = None
        self.countdown_started_at: Optional[float] = None
        self.grace_duration = 15.0  # seconds

    def tick(self, current_risk: int, forecast_risk: int, details: Dict[str, Any], latest_telemetry: Any) -> Dict[str, Any]:
        """
        State Machine Clock Tick:
        Evaluates the current risk score and coordinates transitions.
        """
        now = time.time()
        
        # Action mappings based on state
        if self.state == "NORMAL":
            if current_risk >= 50:
                # Transition to warning countdown
                self.state = "WARNING_COUNTDOWN"
                self.active_event_id = str(uuid.uuid4())[:8]
                self.countdown_started_at = now
                
                # Determine event type based on flags
                event_type = "FALL"
                if details.get("inactivity_active"):
                    event_type = "INACTIVITY"
                elif details.get("vitals_alert"):
                    event_type = "VITALS_ANOMALY"

                # Log warning to DB
                db.events[self.active_event_id] = EmergencyEvent(
                    id=self.active_event_id,
                    timestamp=now,
                    type=event_type,
                    risk_score=current_risk,
                    status="WARNING_COUNTDOWN",
                    location_zone=latest_telemetry.room_occupancy if latest_telemetry else "Unknown",
                    location_coords={"lat": 19.0760, "lng": 72.8777}, # Patient base coords
                    details=", ".join(details.get("reasons", ["Anomaly detected"]))
                )
                
                # Audible Wearable Trigger
                db.log_notification("LOCAL_ALARM", "Wearable Device", f"🚨 BEEP! Possible {event_type} detected. Grace window active.")

        elif self.state == "WARNING_COUNTDOWN":
            # Check if countdown elapsed
            elapsed = now - self.countdown_started_at
            if elapsed >= self.grace_duration:
                # User failed to cancel. Confirm emergency.
                self.state = "CONFIRMED"
                event = db.events.get(self.active_event_id)
                if event:
                    event.status = "UNACKNOWLEDGED"
                    
                    # Dispatch caregiver SMS/Push alerts
                    db.log_notification(
                        "SMS", 
                        "Primary Caregiver (+91 98333 11111)", 
                        f"🚨 EMERGENCY: {event.type} detected at home in {event.location_zone}. Risk Score: {event.risk_score}."
                    )
                    db.log_notification(
                        "PUSH_NOTIFICATION",
                        "Caregiver App",
                        f"Urgent: Medical anomaly detected. View Live Dashboard: http://localhost:8000"
                    )
                    
                    # Auto-assign nearest available volunteer
                    self.dispatch_volunteer(self.active_event_id)

        elif self.state == "CONFIRMED":
            # Check if volunteer or doctor acknowledged
            event = db.events.get(self.active_event_id)
            if event and event.status == "RESPONDING":
                # Responding: keep monitoring
                pass
            elif event and event.status == "UNACKNOWLEDGED":
                # If unacknowledged for too long (simulated escalation), trigger EMS
                elapsed = now - (self.countdown_started_at + self.grace_duration)
                if elapsed >= 30.0:  # 30 seconds for simulation demo
                    self.state = "ESCALATED"
                    event.status = "ESCALATED"
                    db.log_notification(
                        "SMS_EMERGENCY",
                        "Emergency Services Dispatch (108)",
                        f"🚨 ESCALATED MEDICAL ALARM: Unresponsive elder at latitude 19.0760, longitude 72.8777. Send dispatch immediately."
                    )

        return {
            "state": self.state,
            "active_event_id": self.active_event_id,
            "elapsed_seconds": round(now - self.countdown_started_at, 1) if self.countdown_started_at else 0,
            "grace_duration": self.grace_duration
        }

    def cancel_alarm(self) -> Dict[str, Any]:
        """
        Patient cancels alarm via Wearable interface.
        Triggers learning reinforcement.
        """
        if self.state not in ["WARNING_COUNTDOWN", "CONFIRMED"]:
            return {"status": "error", "message": "No active alarm countdown"}

        event = db.events.get(self.active_event_id)
        if event:
            event.status = "FALSE_ALARM"
            event.resolved_at = time.time()
            # Tune thresholds based on cancellation
            # In a simulation, we use a default peak magnitude for the event type
            peak_mag = 3.1 if event.type == "FALL" else 0.0
            EdgeDetector.tune_feedback(event.type, peak_mag)
            db.log_audit("ALARM_CANCELLED", f"User manually cancelled alarm {self.active_event_id}. Event marked false alarm.")

        self.state = "NORMAL"
        self.active_event_id = None
        self.countdown_started_at = None
        return {"status": "success", "message": "Alarm successfully cancelled. Thresholds adjusted."}

    def resolve_alarm(self) -> Dict[str, Any]:
        """
        Caregiver resolves alarm from the dashboard.
        """
        if not self.active_event_id:
            return {"status": "error", "message": "No active alarm to resolve"}

        event = db.events.get(self.active_event_id)
        if event:
            event.status = "RESOLVED"
            event.resolved_at = time.time()
            db.log_audit("ALARM_RESOLVED", f"Caregiver marked alarm {self.active_event_id} as RESOLVED.")
            
            # Release volunteer if assigned
            if event.assigned_volunteer_id:
                vol = db.volunteers.get(event.assigned_volunteer_id)
                if vol:
                    vol.status = "AVAILABLE"

        self.state = "NORMAL"
        self.active_event_id = None
        self.countdown_started_at = None
        return {"status": "success", "message": "Alarm resolved successfully."}

    def dispatch_volunteer(self, event_id: str):
        """
        Identifies and dispatches the closest available student volunteer.
        """
        event = db.events.get(event_id)
        if not event:
            return

        # Find closest AVAILABLE volunteer
        best_vol_id = None
        min_dist = float("inf")
        
        # Patient location coords
        p_lat, p_lng = event.location_coords["lat"], event.location_coords["lng"]

        for vol_id, vol in db.volunteers.items():
            if vol.status == "AVAILABLE":
                # Heuristic distance calculation
                v_lat, v_lng = vol.coords["lat"], vol.coords["lng"]
                dist = (v_lat - p_lat)**2 + (v_lng - p_lng)**2  # simple Euclidean squared
                if dist < min_dist:
                    min_dist = dist
                    best_vol_id = vol_id

        if best_vol_id:
            vol = db.volunteers[best_vol_id]
            vol.status = "RESPONDING"
            event.assigned_volunteer_id = best_vol_id
            event.status = "RESPONDING"
            
            # Send notification to volunteer app channel
            db.log_notification(
                "VOLUNTEER_ALERT",
                vol.name,
                f"🚨 URGENT: Emergency dispatch. Patient in {event.location_zone} zone. Confirm accept."
            )
            db.log_audit("VOLUNTEER_DISPATCHED", f"Volunteer {vol.name} dispatched to assist event {event_id}.")
        else:
            db.log_notification(
                "VOLUNTEER_ALERT_FAILED",
                "System Router",
                "Warning: No available first-responders located within operational radius."
            )

state_machine = HubStateMachine()
