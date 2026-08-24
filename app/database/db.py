import time
from typing import Dict, List, Optional
from pydantic import BaseModel

# --- Data Models ---

class TelemetryFrame(BaseModel):
    timestamp: float
    acc_x: float
    acc_y: float
    acc_z: float
    acc_mag: float
    gyro_x: float
    gyro_y: float
    gyro_z: float
    heart_rate: int
    spo2: int
    body_temp: float
    env_temp: float
    env_humidity: float
    room_occupancy: str  # "Bedroom", "LivingRoom", "Bathroom", "Kitchen", "None"
    camera_pose: str     # "Standing", "Sitting", "Walking", "Lying", "On Floor", "Unknown"

class ConsentSettings(BaseModel):
    imu_enabled: bool = True
    ppg_enabled: bool = True
    spo2_enabled: bool = True
    temp_enabled: bool = True
    gps_enabled: bool = True
    camera_bedroom: bool = False
    camera_livingroom: bool = True
    retention_period: int = 90  # seconds

class EmergencyEvent(BaseModel):
    id: str
    timestamp: float
    type: str  # "FALL", "INACTIVITY", "VITALS_ANOMALY", "MANUAL_SOS"
    risk_score: int
    status: str  # "WARNING_COUNTDOWN", "UNACKNOWLEDGED", "RESPONDING", "RESOLVED", "FALSE_ALARM"
    location_zone: str
    location_coords: Dict[str, float]
    details: str
    assigned_volunteer_id: Optional[str] = None
    resolved_at: Optional[float] = None
    feedback_tuned: bool = False

class Volunteer(BaseModel):
    id: str
    name: str
    college: str
    program: str
    phone: str
    status: str  # "AVAILABLE", "RESPONDING", "OFFLINE"
    coords: Dict[str, float]
    hours_logged: float
    credits: int
    rating: float
    skills: List[str]

class ProofOfCare(BaseModel):
    id: str
    event_id: str
    volunteer_id: str
    volunteer_name: str
    college: str
    date: str
    duration_minutes: int
    credits_earned: int
    cryptographic_hash: str

# --- In-Memory Database State ---

class InMemoryDB:
    def __init__(self):
        self.telemetry_history: List[TelemetryFrame] = []
        self.consent = ConsentSettings()
        self.events: Dict[str, EmergencyEvent] = {}
        
        # Seed initial volunteers
        self.volunteers: Dict[str, Volunteer] = {
            "V101": Volunteer(
                id="V101",
                name="Rahul Sharma",
                college="XYZ College of Pharmacy",
                program="B.Pharm, 3rd Year",
                phone="+91 98765 43210",
                status="AVAILABLE",
                coords={"lat": 19.0762, "lng": 72.8761},
                hours_logged=42.5,
                credits=42,
                rating=4.8,
                skills=["Basic Emergency Response", "First Aid Certified", "Elderly Care"]
            ),
            "V102": Volunteer(
                id="V102",
                name="Priya Patel",
                college="XYZ College of Nursing",
                program="B.Sc Nursing, 2nd Year",
                phone="+91 98765 43211",
                status="AVAILABLE",
                coords={"lat": 19.0775, "lng": 72.8790},
                hours_logged=18.0,
                credits=18,
                rating=4.9,
                skills=["First Aid Certified", "CPR Trained", "Patient Transport"]
            ),
            "V103": Volunteer(
                id="V103",
                name="Amit Kumar",
                college="State Medical Institute",
                program="MBBS, 1st Year",
                phone="+91 98765 43212",
                status="AVAILABLE",
                coords={"lat": 19.0735, "lng": 72.8720},
                hours_logged=55.0,
                credits=55,
                rating=4.7,
                skills=["Advanced First Aid", "CPR Trained", "Clinical Triage"]
            )
        }
        self.certificates: Dict[str, ProofOfCare] = {}
        self.audit_log: List[dict] = []
        self.notification_log: List[dict] = []
        
        # Edge configuration settings
        self.edge_config = {
            "fall_threshold_g": 2.8,
            "stillness_variance_threshold_g": 0.05,
            "inactivity_seconds_threshold": 15,
            "hr_high_bpm": 110,
            "hr_low_bpm": 50,
            "spo2_low_pct": 90
        }

    # Telemetry operations with rolling purge
    def add_telemetry(self, frame: TelemetryFrame):
        self.telemetry_history.append(frame)
        self.purge_expired_telemetry()

    def purge_expired_telemetry(self):
        cutoff = time.time() - self.consent.retention_period
        self.telemetry_history = [
            f for f in self.telemetry_history if f.timestamp >= cutoff
        ]

    # Consent Audit Logging
    def update_consent(self, new_consent: ConsentSettings):
        old = self.consent.dict()
        self.consent = new_consent
        diff = {k: v for k, v in new_consent.dict().items() if old[k] != v}
        if diff:
            self.log_audit("CONSENT_CHANGE", f"Consent updated: {diff}")

    def log_audit(self, action: str, details: str):
        log_entry = {
            "timestamp": time.time(),
            "action": action,
            "details": details
        }
        self.audit_log.append(log_entry)
        print(f"[AUDIT] {action}: {details}")

    def log_notification(self, type: str, recipient: str, message: str):
        notification_entry = {
            "timestamp": time.time(),
            "type": type,
            "recipient": recipient,
            "message": message
        }
        self.notification_log.append(notification_entry)
        print(f"[NOTIFICATION] {type} to {recipient}: {message}")

db = InMemoryDB()
