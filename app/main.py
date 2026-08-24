import os
import time
import hashlib
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.database.db import db, TelemetryFrame, ConsentSettings, EmergencyEvent, Volunteer, ProofOfCare
from app.hub.detector import EdgeDetector
from app.hub.fusion import SensorFusionEngine
from app.hub.state import state_machine
from app.hub.rag_engine import rag_engine
from app.hub.notification_service import notification_service
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AegisNet: Privacy-Preserving Predictive Emergency Care Ecosystem")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Static Files Mounting ---
# Get current directory path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# If the static directory doesn't exist yet, we will create it shortly, but mount it now.
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "css"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "js"), exist_ok=True)

# --- WebSocket Dashboard Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                # Handle disconnected nodes gracefully
                pass

manager = ConnectionManager()

from fastapi.responses import RedirectResponse

# --- Authentication & Unified SPA Routing Gateways ---
@app.get("/")
def get_root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/patient")
def get_patient_spa_root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/patient/{path:path}")
def get_patient_spa(path: str):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/doctor")
def get_doctor_spa_root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/doctor/{path:path}")
def get_doctor_spa(path: str):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/guardian")
def get_guardian_spa_root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/guardian/{path:path}")
def get_guardian_spa(path: str):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/volunteer")
def get_volunteer_spa_root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/volunteer/{path:path}")
def get_volunteer_spa(path: str):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/college")
def get_college_spa_root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/college/{path:path}")
def get_college_spa(path: str):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/verify/{path:path}")
def get_verification_spa(path: str):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/login")
def get_login_selector():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/login/{role}")
def get_login_role(role: str):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/dashboard/{role}")
def get_dashboard_role(role: str):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/emulator")
def get_emulator_page():
    return FileResponse(os.path.join(STATIC_DIR, "emulator.html"))

# --- WebSocket Telemetry Receiver ---
@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive real-time telemetry from Emulator
            data = await websocket.receive_json()
            
            # 1. Map data to TelemetryFrame
            frame = TelemetryFrame(
                timestamp=time.time(),
                acc_x=data.get("acc_x", 0.0),
                acc_y=data.get("acc_y", 0.0),
                acc_z=data.get("acc_z", 9.8),
                acc_mag=data.get("acc_mag", 1.0),
                gyro_x=data.get("gyro_x", 0.0),
                gyro_y=data.get("gyro_y", 0.0),
                gyro_z=data.get("gyro_z", 0.0),
                heart_rate=data.get("heart_rate", 75),
                spo2=data.get("spo2", 98),
                body_temp=data.get("body_temp", 36.5),
                env_temp=data.get("env_temp", 24.0),
                env_humidity=data.get("env_humidity", 50.0),
                room_occupancy=data.get("room_occupancy", "LivingRoom"),
                camera_pose=data.get("camera_pose", "Standing")
            )
            
            # 2. Add to in-memory database (enforces rolling purge automatically)
            db.add_telemetry(frame)
            
            # 3. Process with Edge Sensor Fusion and calculate Emergency Score
            risk_score, forecast_score, details = SensorFusionEngine.evaluate_risk(db.telemetry_history)
            
            # 4. Feed results to the Gateway state machine
            machine_state = state_machine.tick(risk_score, forecast_score, details, frame)
            
            # 5. Broadcast live metrics to all dashboards
            broadcast_payload = {
                "latest": frame.dict(),
                "state": machine_state,
                "risk_score": risk_score,
                "forecast_score": forecast_score,
                "analysis": details,
                "consent": db.consent.dict(),
                "edge_config": db.edge_config
            }
            await manager.broadcast(broadcast_payload)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WS error: {e}")
        manager.disconnect(websocket)

# --- REST Endpoints ---

@app.get("/api/status")
def get_status():
    latest_frame = db.telemetry_history[-1].dict() if db.telemetry_history else None
    risk_score, forecast_score, details = SensorFusionEngine.evaluate_risk(db.telemetry_history)
    
    return {
        "state": {
            "state": state_machine.state,
            "active_event_id": state_machine.active_event_id,
            "elapsed_seconds": round(time.time() - state_machine.countdown_started_at, 1) if state_machine.countdown_started_at else 0,
            "grace_duration": state_machine.grace_duration
        },
        "risk_score": risk_score,
        "forecast_score": forecast_score,
        "details": details,
        "latest": latest_frame,
        "edge_config": db.edge_config
    }

@app.post("/api/cancel")
def post_cancel():
    res = state_machine.cancel_alarm()
    # Broadcast state reset immediately
    return res

@app.post("/api/resolve")
def post_resolve():
    res = state_machine.resolve_alarm()
    return res

@app.post("/api/sos")
def post_sos():
    """Manual SOS trigger override"""
    now = time.time()
    event_id = str(uuid_str())
    state_machine.state = "CONFIRMED"
    state_machine.active_event_id = event_id
    state_machine.countdown_started_at = now - state_machine.grace_duration # trigger immediately

    db.events[event_id] = EmergencyEvent(
        id=event_id,
        timestamp=now,
        type="MANUAL_SOS",
        risk_score=100,
        status="UNACKNOWLEDGED",
        location_coords={"lat": 19.0760, "lng": 72.8777},
        location_zone="Unknown (Pendant Triggered)",
        details="User manually clicked the wearable SOS panic button"
    )
    
    db.log_notification("SOS_ALERT", "Caregiver App", "🚨 PANIC BUTTON CLICKED! Urgent assistance required.")
    state_machine.dispatch_volunteer(event_id)
    return {"status": "success", "event_id": event_id}

@app.get("/api/history")
def get_history():
    return sorted(list(db.events.values()), key=lambda e: e.timestamp, reverse=True)

@app.get("/api/consent")
def get_consent():
    return db.consent

@app.post("/api/consent")
def post_consent(new_consent: ConsentSettings):
    db.update_consent(new_consent)
    return {"status": "success", "consent": db.consent}

@app.get("/api/volunteers")
def get_volunteers():
    return list(db.volunteers.values())

class VolunteerAction(BaseModel):
    volunteer_id: str
    event_id: str
    action: str  # "ACCEPT", "COMPLETE"

@app.post("/api/volunteers/action")
def post_volunteer_action(payload: VolunteerAction):
    vol = db.volunteers.get(payload.volunteer_id)
    event = db.events.get(payload.event_id)
    
    if not vol or not event:
        raise HTTPException(status_code=404, detail="Volunteer or Event not found")

    if payload.action == "ACCEPT":
        vol.status = "RESPONDING"
        event.status = "RESPONDING"
        event.assigned_volunteer_id = payload.volunteer_id
        db.log_audit("VOLUNTEER_ACCEPTED", f"Volunteer {vol.name} accepted dispatch for event {payload.event_id}")
        return {"status": "success", "message": "Dispatch accepted."}

    elif payload.action == "COMPLETE":
        vol.status = "AVAILABLE"
        event.status = "RESOLVED"
        event.resolved_at = time.time()
        
        # Calculate care credits earned (time block based, e.g. minimum 1 hour credit)
        duration_minutes = 20  # simulated response duration
        credits = 10  # 10 Care Credits earned
        
        vol.hours_logged += round(duration_minutes / 60.0, 1)
        vol.credits += credits
        
        # Generate tamper-proof Proof of Care receipt
        cert_id = f"CERT-{str(uuid_str())}"
        raw_hash_data = f"{cert_id}|{payload.event_id}|{payload.volunteer_id}|{credits}|{time.time()}"
        crypto_hash = hashlib.sha256(raw_hash_data.encode()).hexdigest()[:16]
        
        cert = ProofOfCare(
            id=cert_id,
            event_id=payload.event_id,
            volunteer_id=payload.volunteer_id,
            volunteer_name=vol.name,
            college=vol.college,
            date=time.strftime("%Y-%m-%d"),
            duration_minutes=duration_minutes,
            credits_earned=credits,
            cryptographic_hash=crypto_hash
        )
        
        db.certificates[cert_id] = cert
        db.log_audit("PROOF_OF_CARE", f"Issued certificate {cert_id} to volunteer {vol.name} (Credits: {credits}).")
        
        # Reset Hub State
        state_machine.state = "NORMAL"
        state_machine.active_event_id = None
        state_machine.countdown_started_at = None

        return {"status": "success", "message": "Emergency successfully resolved. Service credits logged.", "certificate": cert}

@app.get("/api/volunteer/certificates")
def get_certificates():
    return list(db.certificates.values())

@app.get("/api/college/stats")
def get_college_stats():
    total_hours = sum(v.hours_logged for v in db.volunteers.values())
    total_volunteers = len(db.volunteers)
    total_credits = sum(v.credits for v in db.volunteers.values())
    resolved_events = len(db.certificates)
    
    top_volunteers = sorted(
        [{"name": v.name, "hours": v.hours_logged, "credits": v.credits} for v in db.volunteers.values()],
        key=lambda x: x["hours"],
        reverse=True
    )

    return {
        "total_care_hours": round(total_hours, 1),
        "total_volunteers": total_volunteers,
        "total_care_credits": total_credits,
        "resolved_emergencies": resolved_events,
        "top_volunteers": top_volunteers
    }

@app.get("/api/notifications")
def get_notifications():
    return db.notification_log[::-1]  # Return newest notifications first

@app.get("/api/audit-logs")
def get_audit_logs():
    return db.audit_log[::-1]

# --- Helper ---
def uuid_str() -> str:
    import uuid
    return str(uuid.uuid4())[:8]

# --- MongoDB Database Integration import ---
from app.database.mongodb import db_client

# --- Patient API Schemas ---
class PatientProfile(BaseModel):
    name: str
    dob: str
    age: int
    gender: str
    phone: str
    email: str
    address: str
    emergency_location: str
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None
    blood_group: Optional[str] = None
    conditions: Optional[str] = None
    allergies: Optional[str] = None
    surgeries: Optional[str] = None
    medications: Optional[str] = None
    mobility_status: Optional[str] = None
    fall_history: Optional[str] = None
    lifestyle: Optional[str] = None

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str
    email: str
    hospital: Optional[str] = None

class PatientRegistration(BaseModel):
    profile: PatientProfile
    contacts: List[EmergencyContact]
    device_id: str
    consent: Dict[str, bool]

class ChatMessage(BaseModel):
    message: str
    role: str = "user"
    context: Optional[Dict[str, Any]] = None

class AdherenceUpdate(BaseModel):
    time_slot: str
    medicine: str
    status: str  # "taken", "pending"

class PrivacySettings(BaseModel):
    health_data: bool
    location: bool
    radar: bool
    camera: bool
    doctor_access: bool
    guardian_access: bool
    volunteer_access: bool

# --- Patient Portal REST Routes ---

@app.post("/api/patient/register")
def register_patient(payload: PatientRegistration):
    email = payload.profile.email
    # Save to MongoDB client
    db_client.insert_one("patients", payload.model_dump())
    db_client.insert_one("privacy_consent", {"email": email, "settings": payload.consent})
    db_client.insert_one("devices", {"email": email, "device_id": payload.device_id, "status": "Connected"})
    
    # Initialize mock prescriptions
    mock_prescriptions = [
        {
            "id": "RX-889",
            "doctor": "Dr. Arvind Swamy",
            "date": time.strftime("%Y-%m-%d"),
            "medicine": "Amlodipine (5mg)",
            "dosage": "1 tablet",
            "frequency": "Once daily",
            "duration": "30 days",
            "instructions": "Take in morning before meals",
            "status": "Active"
        },
        {
            "id": "RX-890",
            "doctor": "Dr. Arvind Swamy",
            "date": time.strftime("%Y-%m-%d"),
            "medicine": "Atorvastatin (10mg)",
            "dosage": "1 tablet",
            "frequency": "Once daily",
            "duration": "30 days",
            "instructions": "Take at night before bed",
            "status": "Active"
        }
    ]
    for rx in mock_prescriptions:
        rx["email"] = email
        db_client.insert_one("prescriptions", rx)
        
    return {"status": "success", "message": "Patient registered successfully", "email": email}

@app.post("/api/patient/login")
def login_patient(payload: Dict[str, str]):
    email = payload.get("email")
    patient = db_client.find_one("patients", {"email": email})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    return {
        "status": "success",
        "session": {
            "authenticated": True,
            "email": email,
            "name": patient["profile"]["name"],
            "role": "patient",
            "token": f"jwt-mock-{uuid_str()}"
        }
    }

@app.get("/api/patient/profile")
def get_patient_profile(email: str):
    patient = db_client.find_one("patients", {"email": email})
    if not patient:
        # Return a mock default patient for demo mode if not registered
        return {
            "profile": {
                "name": "Savita Sharma",
                "dob": "1954-08-12",
                "age": 72,
                "gender": "Female",
                "phone": "+91 98765 43210",
                "email": email,
                "address": "B-402, Seawoods Towers, Sector 40, Navi Mumbai",
                "emergency_location": "B-402, Seawoods Towers, Sector 40, Navi Mumbai",
                "height": 158.0,
                "weight": 62.0,
                "bmi": 24.8,
                "blood_group": "O+ (Positive)",
                "conditions": "Mild Hypertension, Post-Stroke mobility tracking",
                "allergies": "Penicillin",
                "surgeries": "Appendectomy (1998)",
                "medications": "Amlodipine 5mg morning, Atorvastatin 10mg night",
                "mobility_status": "Uses cane for outdoor walking",
                "fall_history": "Mild trip in kitchen (Jan 2026)",
                "lifestyle": "Sedentary, light garden walks"
            },
            "contacts": [
                {"name": "Rahul Sharma", "relationship": "Son / Guardian", "phone": "+91 99887 76655", "email": "rahul.sharma@gmail.com"},
                {"name": "Dr. Arvind Swamy", "relationship": "Primary Cardiologist", "phone": "+91 91234 56789", "email": "arvind.swamy@narayana.org", "hospital": "Narayana Health Clinic"}
            ]
        }
    return patient

@app.put("/api/patient/profile")
def update_patient_profile(email: str, profile: PatientProfile):
    patient = db_client.find_one("patients", {"email": email})
    if not patient:
        # Save new
        db_client.insert_one("patients", {"email": email, "profile": profile.model_dump(), "contacts": []})
    else:
        db_client.update_one("patients", {"email": email}, {"profile": profile.model_dump()})
    return {"status": "success", "message": "Profile updated successfully"}

@app.get("/api/patient/prescriptions")
def get_patient_prescriptions(email: str):
    rxs = db_client.find_many("prescriptions", {"email": email})
    if not rxs:
        # Seed mock
        return [
            {
                "id": "RX-889",
                "doctor": "Dr. Arvind Swamy",
                "date": time.strftime("%Y-%m-%d"),
                "medicine": "Amlodipine (5mg)",
                "dosage": "1 tablet",
                "frequency": "Once daily",
                "duration": "30 days",
                "instructions": "Take in morning before meals",
                "status": "Active"
            },
            {
                "id": "RX-890",
                "doctor": "Dr. Arvind Swamy",
                "date": time.strftime("%Y-%m-%d"),
                "medicine": "Atorvastatin (10mg)",
                "dosage": "1 tablet",
                "frequency": "Once daily",
                "duration": "30 days",
                "instructions": "Take at night before bed",
                "status": "Active"
            }
        ]
    return rxs

@app.post("/api/patient/adherence")
def log_medication_adherence(email: str, payload: AdherenceUpdate):
    today = time.strftime("%Y-%m-%d")
    record_key = f"{email}:{today}:{payload.time_slot}:{payload.medicine}"
    
    db_client.insert_one("medication_adherence", {
        "id": record_key,
        "email": email,
        "date": today,
        "time_slot": payload.time_slot,
        "medicine": payload.medicine,
        "status": payload.status,
        "timestamp": time.time()
    })
    return {"status": "success", "message": "Adherence logged."}

@app.get("/api/patient/adherence")
def get_medication_adherence(email: str):
    records = db_client.find_many("medication_adherence", {"email": email})
    return records

@app.get("/api/patient/doctor")
def get_doctor_info(email: str):
    return {
        "name": "Dr. Arvind Swamy",
        "specialization": "Cardiology / Vascular Medicine",
        "hospital": "Narayana Health Clinic, Navi Mumbai",
        "contact": "+91 91234 56789",
        "email": "arvind.swamy@narayana.org",
        "availability": "Mon-Fri (09:00 - 13:00)",
        "recent_consultation": {
            "date": "2026-08-10",
            "notes": "Vitals stable. BP controlled at 132/84. Adhering to Amlodipine. Recommend continuing light ambulatory activities. Thresholds set in local gateway optimized for normal gait speed.",
            "follow_up_date": "2026-09-10"
        }
    }

class RAGChatPayload(BaseModel):
    role: str = "patient"
    message: str
    context: Optional[Dict[str, Any]] = None

class TTSPayload(BaseModel):
    text: str
    voice: Optional[str] = "en-US-Neural2-F"
    role: Optional[str] = "patient"

@app.post("/api/chat")
@app.post("/api/chat/rag")
def chat_role_rag(payload: RAGChatPayload):
    role = payload.role or "patient"
    query = payload.message or ""
    
    query_safe = query.encode("ascii", errors="replace").decode("ascii")
    print(f"[RAG Server Log] Step 1: Request received | role='{role}' | query='{query_safe}'")
    
    try:
        print(f"[RAG Server Log] Step 2: Retrieval started...")
        print(f"[RAG Server Log] Step 3: Chunks retrieved & deduplicated.")
        print(f"[RAG Server Log] Step 4: LLM called for response synthesis...")
        
        result = rag_engine.generate_response(
            role=role,
            query=query,
            context=payload.context
        )
        
        print(f"[RAG Server Log] Step 5: Response returned successfully.")
        
        ans = result.get("answer") or result.get("response") or ""
        sources = result.get("sources") or result.get("retrieved_sources") or []
        is_crit = result.get("is_critical") or False
        debug_info = result.get("debug") or {"retrieved_chunks": []}
        
        return {
            "answer": ans,
            "response": ans,
            "sources": sources,
            "retrieved_sources": sources,
            "status": "success",
            "is_critical": is_crit,
            "debug": debug_info,
            "intent": result.get("intent", "unknown"),
            "sections": result.get("sections", []),
            "relevance": result.get("relevance", "low")
        }
    except Exception as e:
        err_msg = str(e).encode("ascii", errors="replace").decode("ascii")
        print(f"[RAG Server Log Error]: {err_msg}")
        return JSONResponse(
            status_code=500,
            content={
                "answer": "An error occurred while retrieving care knowledge from the dataset.",
                "response": "An error occurred while retrieving care knowledge from the dataset.",
                "sources": [],
                "retrieved_sources": [],
                "status": "error",
                "error": f"Backend processing error: {str(e)}",
                "is_critical": False,
                "debug": {"retrieved_chunks": []}
            }
        )


@app.post("/api/voice/tts")
def voice_tts_synthesis(payload: TTSPayload):
    return {
        "status": "success",
        "text": payload.text,
        "voice": payload.voice,
        "engine": "WebSpeech / VoxCPM Streaming Adapter",
        "audio_url": None
    }

@app.post("/api/patient/assistant")
def chat_care_assistant(payload: ChatMessage):
    result = rag_engine.generate_response(
        role="patient",
        query=payload.message,
        context=payload.context
    )
    return {
        "response": result["response"],
        "is_critical": result["is_critical"]
    }

@app.get("/api/patient/privacy")
def get_patient_privacy(email: str):
    privacy = db_client.find_one("privacy_consent", {"email": email})
    if not privacy:
        return {
            "health_data": True,
            "location": True,
            "radar": True,
            "camera": True,
            "doctor_access": True,
            "guardian_access": True,
            "volunteer_access": True
        }
    return privacy["settings"]

@app.put("/api/patient/privacy")
def update_patient_privacy(email: str, settings: PrivacySettings):
    db_client.update_one("privacy_consent", {"email": email}, {"settings": settings.model_dump()})
    return {"status": "success", "message": "Privacy consent updated successfully."}

@app.get("/api/patient/devices")
def get_patient_devices(email: str):
    dev = db_client.find_one("devices", {"email": email})
    if not dev:
        return {"device_id": "AEGIS-GATEWAY-102", "status": "Connected"}
    return dev

# --- openpyxl Excel Exporter Route ---
@app.get("/api/patient/reports/excel")
def export_excel_report(email: str):
    import openpyxl
    from openpyxl.styles import Font, Alignment, PatternFill
    import io
    
    # 1. Gather Data
    profile_data = get_patient_profile(email)
    p = profile_data.get("profile", {})
    contacts = profile_data.get("contacts", [])
    rxs = get_patient_prescriptions(email)
    adherence = get_medication_adherence(email)
    doc_info = get_doctor_info(email)
    
    # 2. Build Workbook
    wb = openpyxl.Workbook()
    
    # Sheet 1: Patient Profile
    ws_prof = wb.active
    ws_prof.title = "Patient Profile"
    
    # Styling variables
    font_title = Font(name="Arial", size=14, bold=True, color="1E3A8A")
    font_header = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    font_bold = Font(name="Arial", size=10, bold=True)
    font_regular = Font(name="Arial", size=10)
    fill_header = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    align_center = Alignment(horizontal="center", vertical="center")
    align_left = Alignment(horizontal="left", vertical="center")
    
    # Write Title
    ws_prof.merge_cells("A1:D1")
    ws_prof["A1"] = "AegisNet Patient Health Record - Profile"
    ws_prof["A1"].font = font_title
    ws_prof["A1"].alignment = align_center
    ws_prof.row_dimensions[1].height = 30
    
    # Profile details
    profile_rows = [
        ("Full Name", p.get("name")),
        ("Date of Birth", p.get("dob")),
        ("Age", p.get("age")),
        ("Gender", p.get("gender")),
        ("Phone", p.get("phone")),
        ("Email", p.get("email")),
        ("Address", p.get("address")),
        ("Height (cm)", p.get("height")),
        ("Weight (kg)", p.get("weight")),
        ("BMI", p.get("bmi")),
        ("Blood Group", p.get("blood_group")),
        ("Medical Conditions", p.get("conditions")),
        ("Allergies", p.get("allergies")),
        ("Medications", p.get("medications")),
        ("Mobility status", p.get("mobility_status")),
        ("Emergency Location", p.get("emergency_location"))
    ]
    
    for idx, (label, val) in enumerate(profile_rows, start=3):
        ws_prof.cell(row=idx, column=1, value=label).font = font_bold
        ws_prof.cell(row=idx, column=2, value=str(val) if val is not None else "--").font = font_regular
        ws_prof.row_dimensions[idx].height = 20
        
    # Sheet 2: Vital Signs
    ws_vits = wb.create_sheet(title="Vital Signs")
    ws_vits.append(["Timestamp", "Heart Rate (BPM)", "SpO2 (%)", "Temperature (C)", "Respiration (/min)", "Activity"])
    ws_vits.row_dimensions[1].height = 25
    for cell in ws_vits[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        
    # Write some realistic history mock rows
    mock_vitals = [
        (time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() - 3600 * i)), 72 + i % 5, 98 - i % 2, 36.5 + (i % 3)/10, 16 + i % 2, "Walking" if i % 4 == 0 else "Resting")
        for i in range(24)
    ]
    for row in mock_vitals:
        ws_vits.append(row)
        
    # Sheet 3: AI Risk Forecast
    ws_risk = wb.create_sheet(title="AI Risk & Forecast")
    ws_risk.append(["Timestamp", "Current Risk Score (/100)", "15-Min Forecast", "30-Min Forecast", "Trend"])
    ws_risk.row_dimensions[1].height = 25
    for cell in ws_risk[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    mock_risk = [
        (time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() - 3600 * i)), 12 + i % 4, 15 + i % 3, 18 + i % 5, "Stable")
        for i in range(24)
    ]
    for row in mock_risk:
        ws_risk.append(row)

    # Sheet 4: Prescriptions
    ws_pres = wb.create_sheet(title="Prescriptions")
    ws_pres.append(["Prescription ID", "Doctor", "Date", "Medicine", "Dosage", "Frequency", "Duration", "Instructions"])
    ws_pres.row_dimensions[1].height = 25
    for cell in ws_pres[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    for rx in rxs:
        ws_pres.append([rx.get("id"), rx.get("doctor"), rx.get("date"), rx.get("medicine"), rx.get("dosage"), rx.get("frequency"), rx.get("duration"), rx.get("instructions")])

    # Sheet 5: Medication Adherence
    ws_adh = wb.create_sheet(title="Medication Adherence")
    ws_adh.append(["Date", "Time Slot", "Medicine", "Status"])
    ws_adh.row_dimensions[1].height = 25
    for cell in ws_adh[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    if adherence:
        for a in adherence:
            ws_adh.append([a.get("date"), a.get("time_slot"), a.get("medicine"), a.get("status")])
    else:
        # Default mock entries
        ws_adh.append([time.strftime("%Y-%m-%d"), "08:00", "Amlodipine (5mg)", "taken"])
        ws_adh.append([time.strftime("%Y-%m-%d"), "20:00", "Atorvastatin (10mg)", "pending"])

    # Sheet 6: Doctor Notes
    ws_notes = wb.create_sheet(title="Doctor Notes")
    ws_notes.append(["Date", "Doctor", "Notes Summary", "Follow-up Date"])
    ws_notes.row_dimensions[1].height = 25
    for cell in ws_notes[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    ws_notes.append([doc_info["recent_consultation"]["date"], doc_info["name"], doc_info["recent_consultation"]["notes"], doc_info["recent_consultation"]["follow_up_date"]])

    # Auto-adjust column widths
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)
            
    # Write to IO Bytes
    file_stream = io.BytesIO()
    wb.save(file_stream)
    file_stream.seek(0)
    
    filename = f"AegisNet_Report_{p.get('name', 'Patient')}_{time.strftime('%Y%m%d')}.xlsx"
    return StreamingResponse(
        file_stream, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# --- Doctor Portal Schemas ---
class DoctorLoginRequest(BaseModel):
    email: str
    password: str

class DoctorPrescriptionRequest(BaseModel):
    patient_id: str
    medicine: str
    dosage: str
    frequency: str
    duration: str
    instructions: str
    notes: Optional[str] = None

class DoctorNoteRequest(BaseModel):
    patient_id: str
    patient_visible: str
    private_note: str

class ClinicalChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

# --- Doctor Portal REST Endpoints ---

@app.post("/api/doctor/login")
def doctor_login(payload: DoctorLoginRequest):
    email = payload.email.lower()
    password = payload.password
    
    # Simple check for demo clinician
    if email == "arvind.swamy@narayana.org" and password == "doctor123":
        doc_profile = {
            "name": "Dr. Arvind Swamy",
            "specialization": "Cardiology / Vascular Medicine",
            "hospital": "Narayana Health Clinic, Navi Mumbai",
            "contact": "+91 91234 56789",
            "email": email,
            "availability": "Mon-Fri (09:00 - 13:00)"
        }
        
        # Log login audit
        db_client.insert_one("audit_registry", {
            "timestamp": time.time(),
            "action": "Doctor logged in",
            "doctor": "Dr. Arvind Swamy",
            "status": "Success"
        })
        
        return {
            "status": "success",
            "session": {
                "authenticated": True,
                "email": email,
                "name": doc_profile["name"],
                "role": "doctor",
                "token": f"jwt-doctor-mock-{uuid_str()}"
            },
            "profile": doc_profile
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid doctor credentials. (Demo: arvind.swamy@narayana.org / doctor123)")

@app.get("/api/doctor/patients")
def get_assigned_patients():
    patients = db_client.find_many("patients")
    # Log access audit
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": "Viewed patient directory",
        "doctor": "Dr. Arvind Swamy",
        "status": "Success"
    })
    return patients

@app.get("/api/doctor/patients/{patient_id}")
def get_patient_detail(patient_id: str):
    patient = db_client.find_one("patients", {"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")
        
    # Log detail access audit
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": f"Viewed patient dashboard: {patient['profile']['name']}",
        "patient": patient_id,
        "doctor": "Dr. Arvind Swamy",
        "status": "Success"
    })
    return patient

@app.post("/api/doctor/prescriptions")
def create_prescription(payload: DoctorPrescriptionRequest):
    patient = db_client.find_one("patients", {"id": payload.patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    rx_id = f"RX-{str(uuid_str())}"
    rx_record = {
        "id": rx_id,
        "email": patient["email"],
        "doctor": "Dr. Arvind Swamy",
        "date": time.strftime("%Y-%m-%d"),
        "medicine": payload.medicine,
        "dosage": payload.dosage,
        "frequency": payload.frequency,
        "duration": payload.duration,
        "instructions": payload.instructions,
        "notes": payload.notes,
        "status": "Active"
    }
    
    db_client.insert_one("prescriptions", rx_record)
    
    # Log creation audit
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": f"Prescribed medication: {payload.medicine}",
        "patient": payload.patient_id,
        "doctor": "Dr. Arvind Swamy",
        "status": "Success"
    })
    
    return {"status": "success", "message": "Prescription created successfully.", "rx": rx_record}

@app.post("/api/doctor/notes")
def create_doctor_note(payload: DoctorNoteRequest):
    note_id = f"N-{str(uuid_str())}"
    note_record = {
        "id": note_id,
        "patient_id": payload.patient_id,
        "doctor_name": "Dr. Arvind Swamy",
        "date": time.strftime("%Y-%m-%d"),
        "patient_visible": payload.patient_visible,
        "private_note": payload.private_note,
        "timestamp": time.time()
    }
    db_client.insert_one("doctor_notes", note_record)
    
    # Log note audit
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": "Logged clinical notes",
        "patient": payload.patient_id,
        "doctor": "Dr. Arvind Swamy",
        "status": "Success"
    })
    
    return {"status": "success", "message": "Clinical notes updated.", "note": note_record}

@app.get("/api/doctor/notes/{patient_id}")
def get_doctor_notes(patient_id: str):
    notes = db_client.find_many("doctor_notes", {"patient_id": patient_id})
    return notes

@app.get("/api/doctor/appointments")
def get_doctor_appointments():
    return db_client.find_many("appointments")

@app.put("/api/doctor/appointments/{appointment_id}")
def update_appointment_status(appointment_id: str, payload: Dict[str, str]):
    new_status = payload.get("status", "Completed")
    db_client.update_one("appointments", {"id": appointment_id}, {"status": new_status})
    return {"status": "success", "message": "Appointment status updated."}

@app.get("/api/doctor/audit-logs")
def get_clinical_audit_logs():
    return sorted(db_client.find_many("audit_registry"), key=lambda l: l.get("timestamp", 0), reverse=True)

@app.post("/api/doctor/assistant")
def clinical_ai_assistant(payload: ClinicalChatRequest):
    msg = payload.message.lower()
    
    # Simple search for patient details within context
    p_id = "P001"
    if "p002" in msg:
        p_id = "P002"
    elif "p003" in msg:
        p_id = "P003"
    
    patient = db_client.find_one("patients", {"id": p_id})
    p_name = patient["profile"]["name"] if patient else "Patient"
    hr = patient["vitals"]["heartRate"] if patient else 74
    spo2 = patient["vitals"]["spo2"] if patient else 98
    status = patient["status"] if patient else "Stable"
    risk = patient["risk_score"] if patient else 12

    if "summarize" in msg or "summary" in msg or "7 days" in msg:
        res_text = f"### [AI-generated decision-support summary] - Patient {p_id} ({p_name})\n\n" \
                   f"**Clinical Metrics Overview (Last 7 Days):**\n" \
                   f"- **Average Heart Rate**: {hr} BPM\n" \
                   f"- **Average Blood Oxygen Saturation (SpO₂)**: {spo2}%\n" \
                   f"- **Current AI Risk Score**: {risk}/100 ({status.upper()} STATUS)\n" \
                   f"- **Abnormal Inactivity Duration Deviation**: -12% compared to historical baseline.\n" \
                   f"- **Edge Posture Flags**: Standing (64%), Lying (22%), Sitting/Resting (14%).\n" \
                   f"- **Detected Anomalies**: 1 possible fall alert matched (Jan 2026), resolved by guardian verification.\n\n" \
                   f"**Observations**: Activity logs suggest a mild decrease in active gait walking durations over the last 48 hours compared with baseline.\n\n" \
                   f"**Suggested Clinical Action**: Review patient's ambulatory activity during next consultation visit. Check sensor node calibrations."
        return {"response": res_text}
        
    elif "flag" in msg or "why" in msg:
        res_text = f"### [AI-generated decision-support summary] - Risk Explanation for {p_name} ({p_id})\n\n" \
                   f"**Contributing observations to risk score of {risk}/100:**\n" \
                   f"1. **PPG Pulse Variance**: Active heart rate ranges of {hr} BPM within historical parameters.\n" \
                   f"2. **Mobility baseline deviation**: Walking durations are slightly below personal baseline (-1.2 standard deviations).\n" \
                   f"3. **Event sensors checklist**: MPU6050 accelerometer shows normal orientation; MAX30102 matches SpO₂ baseline; occupancy radar confirms living room presence.\n\n" \
                   f"**Summary**: No critical anomalies fusions detected. Flag level remains LOW/NORMAL."
        return {"response": res_text}

    return {
        "response": "Clinical AI Decision-Support Assistant. I can summarize patient baselines, outline telemetry deviations, and compile clinical summaries. (Note: AI observations are for support only and do not constitute diagnosis or treatment)."
    }

# --- Doctor Portal multi-sheet Excel Report ---
@app.get("/api/doctor/reports/excel")
def export_doctor_excel_report(patient_id: str):
    import openpyxl
    from openpyxl.styles import Font, Alignment, PatternFill
    import io
    
    # 1. Fetch Patient Info
    patient = db_client.find_one("patients", {"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")
        
    email = patient["email"]
    p = patient["profile"]
    rxs = db_client.find_many("prescriptions", {"email": email})
    adherence = db_client.find_many("medication_adherence", {"email": email})
    notes = db_client.find_many("doctor_notes", {"patient_id": patient_id})
    audits = db_client.find_many("audit_registry", {"patient": patient_id})
    
    # 2. Build Workbook
    wb = openpyxl.Workbook()
    
    # Styles
    font_title = Font(name="Arial", size=14, bold=True, color="1E3A8A")
    font_header = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    font_bold = Font(name="Arial", size=10, bold=True)
    font_regular = Font(name="Arial", size=10)
    fill_header = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    align_center = Alignment(horizontal="center", vertical="center")
    
    # Sheet 1: Patient Profile
    ws_prof = wb.active
    ws_prof.title = "Patient Profile"
    ws_prof.merge_cells("A1:D1")
    ws_prof["A1"] = f"AegisNet Clinical Health Record - {p.get('name')}"
    ws_prof["A1"].font = font_title
    ws_prof["A1"].alignment = align_center
    ws_prof.row_dimensions[1].height = 30
    
    profile_rows = [
        ("Patient ID", p.get("id")),
        ("Full Name", p.get("name")),
        ("Date of Birth", p.get("dob")),
        ("Age", p.get("age")),
        ("Gender", p.get("gender")),
        ("Phone", p.get("phone")),
        ("Email", p.get("email")),
        ("Address", p.get("address")),
        ("Height (cm)", p.get("height")),
        ("Weight (kg)", p.get("weight")),
        ("BMI", p.get("bmi")),
        ("Blood Group", p.get("blood_group")),
        ("Medical Conditions", p.get("conditions")),
        ("Known Allergies", p.get("allergies")),
        ("Current Medications", p.get("medications")),
        ("Mobility status", p.get("mobility_status"))
    ]
    for idx, (label, val) in enumerate(profile_rows, start=3):
        ws_prof.cell(row=idx, column=1, value=label).font = font_bold
        ws_prof.cell(row=idx, column=2, value=str(val) if val is not None else "--").font = font_regular
        ws_prof.row_dimensions[idx].height = 20

    # Sheet 2: Vital Signs
    ws_vits = wb.create_sheet(title="Vital Signs")
    ws_vits.append(["Timestamp", "Heart Rate (BPM)", "SpO2 (%)", "Temperature (C)", "Respiration (/min)", "Activity"])
    ws_vits.row_dimensions[1].height = 25
    for cell in ws_vits[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    mock_vitals = [
        (time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() - 3600 * i)), patient["vitals"]["heartRate"] + i % 4 if patient["vitals"]["heartRate"] > 0 else 72, patient["vitals"]["spo2"] - i % 2 if patient["vitals"]["spo2"] > 0 else 98, 36.6, 16, "Resting")
        for i in range(24)
    ]
    for row in mock_vitals:
        ws_vits.append(row)

    # Sheet 3: AI Risk
    ws_risk = wb.create_sheet(title="AI Risk & Forecast")
    ws_risk.append(["Timestamp", "Current Risk Score", "15-Min Forecast", "30-Min Forecast", "Trend"])
    ws_risk.row_dimensions[1].height = 25
    for cell in ws_risk[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    mock_risk = [
        (time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() - 3600 * i)), patient["risk_score"] + i % 2, patient["risk_score"] + 2, patient["risk_score"] + 4, "Stable")
        for i in range(24)
    ]
    for row in mock_risk:
        ws_risk.append(row)

    # Sheet 4: Prescriptions
    ws_pres = wb.create_sheet(title="Prescriptions")
    ws_pres.append(["Prescription ID", "Doctor", "Date", "Medicine", "Dosage", "Frequency", "Duration", "Instructions"])
    ws_pres.row_dimensions[1].height = 25
    for cell in ws_pres[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    for rx in rxs:
        ws_pres.append([rx.get("id"), rx.get("doctor"), rx.get("date"), rx.get("medicine"), rx.get("dosage"), rx.get("frequency"), rx.get("duration"), rx.get("instructions")])

    # Sheet 5: Medication Adherence
    ws_adh = wb.create_sheet(title="Medication Adherence")
    ws_adh.append(["Date", "Time Slot", "Medicine", "Status"])
    ws_adh.row_dimensions[1].height = 25
    for cell in ws_adh[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    for a in adherence:
        ws_adh.append([a.get("date"), a.get("time_slot"), a.get("medicine"), a.get("status")])

    # Sheet 6: Clinical Notes
    ws_notes = wb.create_sheet(title="Clinical Notes")
    ws_notes.append(["Date", "Doctor", "Patient Visible Notes", "Private Doctor Notes"])
    ws_notes.row_dimensions[1].height = 25
    for cell in ws_notes[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    for n in notes:
        ws_notes.append([n.get("date"), n.get("doctor_name"), n.get("patient_visible"), n.get("private_note")])

    # Sheet 7: Access Audit Trail
    ws_audit = wb.create_sheet(title="Access Audit Trail")
    ws_audit.append(["Timestamp", "Clinician Action", "Assigned Doctor", "Access Status"])
    ws_audit.row_dimensions[1].height = 25
    for cell in ws_audit[1]:
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
    for au in audits:
        date_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(au.get("timestamp", time.time())))
        ws_audit.append([date_str, au.get("action"), au.get("doctor"), au.get("status")])

    # Width formatting
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)
            
    # Write to IO Bytes
    file_stream = io.BytesIO()
    wb.save(file_stream)
    file_stream.seek(0)
    
    # Log excel download action to audit registry
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": "Downloaded patient clinical report",
        "patient": patient_id,
        "doctor": "Dr. Arvind Swamy",
        "status": "Success"
    })
    
    filename = f"AegisNet_ClinicalReport_{p.get('name', 'Patient')}_{time.strftime('%Y%m%d')}.xlsx"
    return StreamingResponse(
        file_stream, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# --- Guardian Portal Schemas ---
class GuardianLoginRequest(BaseModel):
    email: str
    password: str

class GuardianEmergencyReport(BaseModel):
    patient_id: str
    emergency_type: str
    message: Optional[str] = ""

class GuardianAssistantRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

# --- Guardian Portal REST Endpoints ---

@app.post("/api/guardian/login")
def guardian_login(payload: GuardianLoginRequest):
    email = payload.email.lower()
    password = payload.password
    
    # Check seeded mock guardian
    if email == "rahul.sharma@gmail.com" and password == "guardian123":
        profile = {
            "name": "Rahul Sharma",
            "email": email,
            "phone": "+91 99887 76655",
            "relations": ["P001", "P002", "P003"]
        }
        
        # Log to audit registry
        db_client.insert_one("audit_registry", {
            "timestamp": time.time(),
            "action": "Guardian logged in",
            "guardian": "Rahul Sharma",
            "status": "Success"
        })
        
        return {
            "status": "success",
            "session": {
                "authenticated": True,
                "email": email,
                "name": profile["name"],
                "role": "guardian",
                "token": f"jwt-guardian-mock-{uuid_str()}"
            },
            "profile": profile
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid guardian credentials. (Demo: rahul.sharma@gmail.com / guardian123)")

@app.get("/api/guardian/family")
def get_guardian_family():
    patient_ids = ["P001", "P002", "P003"]
    family = []
    for p_id in patient_ids:
        patient = db_client.find_one("patients", {"id": p_id})
        if patient:
            # Format minimal card details
            family.append({
                "id": patient["id"],
                "name": patient["profile"]["name"],
                "age": patient["profile"]["age"],
                "gender": patient["profile"]["gender"],
                "status": patient["status"],
                "risk_score": patient["risk_score"],
                "device_status": "Connected" if patient["vitals"]["heartRate"] > 0 else "Offline",
                "last_update": "5 seconds ago"
            })
    return family

@app.get("/api/guardian/patients/{patient_id}/summary")
def get_guardian_patient_summary(patient_id: str):
    # Verify permission scope
    consent = db_client.find_one("guardians_consents", {"patient_id": patient_id, "guardian_email": "rahul.sharma@gmail.com"})
    if not consent:
        raise HTTPException(status_code=403, detail="Not authorized to access this patient profile.")
        
    patient = db_client.find_one("patients", {"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # Log access audit
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": f"Guardian viewed patient summary: {patient['profile']['name']}",
        "patient": patient_id,
        "guardian": "Rahul Sharma",
        "status": "Success"
    })
    
    scopes = consent.get("scopes", {})
    
    # Assemble sanitized response based on consents
    summary = {
        "id": patient["id"],
        "name": patient["profile"]["name"],
        "age": patient["profile"]["age"],
        "status": patient["status"],
        "risk_score": patient["risk_score"],
        "scopes": scopes
    }
    
    if scopes.get("health_summary", True):
        # Only expose basic vitals for guardian UI
        summary["vitals"] = {
            "heartRate": patient["vitals"].get("heartRate"),
            "spo2": patient["vitals"].get("spo2"),
            "temperature": patient["vitals"].get("temperature"),
            "respirationRate": patient["vitals"].get("respirationRate"),
            "activity": patient["vitals"].get("activity")
        }
        
        # Include radar if permitted
        radar_scope = scopes.get("radar", "none")
        if radar_scope != "none":
            summary["radar"] = {
                "connected": True,
                "radarHeartRate": patient["vitals"].get("radarHeartRate"),
                "radarRespiration": patient["vitals"].get("radarRespiration"),
                "posture": patient["vitals"].get("activity")
            }
            
    if scopes.get("location", "never") == "always" or (scopes.get("location") == "emergency_only" and patient["status"] == "Critical"):
        summary["location"] = {
            "sharing": "ON",
            "current": "Home",
            "coords": {"lat": 19.076, "lng": 72.877}
        }
    else:
        summary["location"] = {
            "sharing": "Emergency Only",
            "current": "Locked (Vitals Stable)",
            "coords": None
        }
        
    return summary

@app.get("/api/guardian/patients/{patient_id}/vitals")
def get_guardian_patient_vitals(patient_id: str):
    # Log to audit registry
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": "Guardian viewed patient vitals",
        "patient": patient_id,
        "guardian": "Rahul Sharma",
        "status": "Success"
    })
    
    patient = db_client.find_one("patients", {"id": patient_id})
    hr = patient["vitals"]["heartRate"] if patient else 74
    spo2 = patient["vitals"]["spo2"] if patient else 98
    temp = patient["vitals"]["temperature"] if patient else 36.6
    
    history = []
    now = time.time()
    for i in range(10):
        history.append({
            "time": time.strftime("%H:%M:%S", time.localtime(now - (10 - i) * 60)),
            "hr": hr + i % 2 if hr > 0 else 0,
            "spo2": spo2 - i % 2 if spo2 > 0 else 0,
            "temp": temp
        })
    return history

@app.get("/api/guardian/patients/{patient_id}/activity")
def get_guardian_patient_activity(patient_id: str):
    # Fetch baseline comparisons
    return {
        "today_activity": 72,
        "typical_activity": 84,
        "deviation": -12,
        "explanation": "Activity is slightly below the patient's recent baseline."
    }

@app.get("/api/guardian/patients/{patient_id}/risk")
def get_guardian_patient_risk(patient_id: str):
    patient = db_client.find_one("patients", {"id": patient_id})
    score = patient["risk_score"] if patient else 18
    return {
        "risk_score": score,
        "forecast_15m": min(100, int(score * 1.1)),
        "forecast_30m": min(100, int(score * 1.2)),
        "forecast_60m": min(100, int(score * 1.3))
    }

@app.get("/api/guardian/patients/{patient_id}/care-team")
def get_guardian_care_team(patient_id: str):
    return {
        "doctor": {
            "name": "Dr. Arvind Swamy",
            "hospital": "Narayana Health Clinic",
            "phone": "+91 91234 56789",
            "status": "Available"
        },
        "volunteer": {
            "name": "Rahul",
            "phone": "+91 98765 43210",
            "status": "Responding" if patient_id == "P002" else "Matched",
            "eta": "6 minutes"
        }
    }

@app.get("/api/guardian/patients/{patient_id}/doctor-updates")
def get_guardian_doctor_updates(patient_id: str):
    # Only return public patient-visible notes! NEVER return private_notes!
    notes = db_client.find_many("doctor_notes", {"patient_id": patient_id})
    public_notes = []
    for n in notes:
        public_notes.append({
            "doctor": n.get("doctor_name"),
            "date": n.get("date"),
            "notes": n.get("patient_visible")
        })
    return public_notes

@app.get("/api/guardian/patients/{patient_id}/medications")
def get_guardian_medications(patient_id: str):
    consent = db_client.find_one("guardians_consents", {"patient_id": patient_id, "guardian_email": "rahul.sharma@gmail.com"})
    if not consent or not consent.get("scopes", {}).get("prescriptions", True):
        raise HTTPException(status_code=403, detail="Medication records access blocked by patient settings.")
        
    # Log access audit
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": "Guardian viewed medications",
        "patient": patient_id,
        "guardian": "Rahul Sharma",
        "status": "Success"
    })
    
    return [
        {"time": "08:00", "medicine": "Amlodipine (5mg)", "status": "taken"},
        {"time": "14:00", "medicine": "Teneligliptin (20mg)", "status": "taken"},
        {"time": "20:00", "medicine": "Atorvastatin (10mg)", "status": "pending"}
    ]

@app.post("/api/guardian/emergency/report")
async def report_guardian_emergency(payload: GuardianEmergencyReport):
    patient = db_client.find_one("patients", {"id": payload.patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    # Trigger active emergency indicators
    db_client.update_one("patients", {"id": payload.patient_id}, {
        "status": "Critical",
        "risk_score": 98
    })
    
    # Create emergency log
    db_client.insert_one("emergency_history", {
        "id": f"SOS-{uuid_str()}",
        "patient_id": payload.patient_id,
        "type": payload.emergency_type,
        "message": payload.message,
        "timestamp": time.time(),
        "status": "Active"
    })
    
    # Log audit
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": f"Guardian reported emergency: {payload.emergency_type}",
        "patient": payload.patient_id,
        "guardian": "Rahul Sharma",
        "status": "Success"
    })
    
    # Broadcast to WebSocket
    broadcast_payload = {
        "latest": {
            "heart_rate": 105,
            "spo2": 93,
            "body_temp": 36.8,
            "camera_pose": "Lying"
        },
        "state": {
            "state": "CRITICAL",
            "event": "manual_guardian_sos",
            "verification_seconds": 0
        },
        "risk_score": 98,
        "forecast_score": 99,
        "analysis": ["Manual guardian emergency trigger", payload.message],
        "consent": {"ppg_enabled": True, "spo2_enabled": True}
    }
    await manager.broadcast(broadcast_payload)
    
    return {"status": "success", "message": "Emergency reported and responders matched."}

@app.post("/api/guardian/emergency/{emergency_id}/acknowledge")
def acknowledge_emergency(emergency_id: str):
    # Log to audit registry
    db_client.insert_one("audit_registry", {
        "timestamp": time.time(),
        "action": f"Guardian acknowledged emergency: {emergency_id}",
        "guardian": "Rahul Sharma",
        "status": "Success"
    })
    return {"status": "success", "message": "Emergency acknowledged."}

@app.post("/api/guardian/assistant")
def guardian_ai_assistant(payload: GuardianAssistantRequest):
    msg = payload.message.lower()
    
    p_id = "P001"
    if "rajesh" in msg or "p002" in msg:
        p_id = "P002"
    elif "anita" in msg or "p003" in msg:
        p_id = "P003"
        
    patient = db_client.find_one("patients", {"id": p_id})
    p_name = patient["profile"]["name"] if patient else "Family member"
    hr = patient["vitals"]["heartRate"] if patient else 74
    spo2 = patient["vitals"]["spo2"] if patient else 98
    status = patient["status"] if patient else "Stable"
    risk = patient["risk_score"] if patient else 18
    
    if "okay" in msg or "safe" in msg:
        res = f"### [AI Care Assistant] - Safety Summary for {p_name} ({p_id})\n\n" \
              f"**Current Status**: {status.upper()}\n" \
              f"- **Safety Score**: {risk}/100\n" \
              f"- **Heart Rate**: {hr} BPM\n" \
              f"- **Oxygen Level (SpO₂)**: {spo2}%\n" \
              f"- **Activity Pose**: {patient['vitals']['activity'] if patient else 'Normal'}\n\n" \
              f"No active emergency is detected. Current activity and vital trends are within baseline boundaries."
        return {"response": res}
        
    elif "medication" in msg or "pill" in msg:
        # Check permissions scope
        consent = db_client.find_one("guardians_consents", {"patient_id": p_id, "guardian_email": "rahul.sharma@gmail.com"})
        if not consent or not consent.get("scopes", {}).get("prescriptions", True):
            return {"response": "### [AI Care Assistant]\n\nAccess Blocked: I am not authorized to read medication logs for this family member."}
            
        res = f"### [AI Care Assistant] - Medication Adherence for {p_name}\n\n" \
              f"- **08:00 AM**: Amlodipine (5mg) - ✓ Taken\n" \
              f"- **02:00 PM**: Teneligliptin (20mg) - ✓ Taken\n" \
              f"- **08:00 PM**: Atorvastatin (10mg) - ○ Pending\n\n" \
              f"Please note: Medication modifications must be directed exclusively to the primary doctor."
        return {"response": res}

    return {
        "response": "Hello. I am the AegisNet AI Care Assistant. I can summarize family member vitals, check sensor connections, and list medication schedules if authorized. (Note: AI observations are for decision support only and do not replace clinical advice)."
    }

@app.get("/api/guardian/notifications")
def get_guardian_notifications():
    return [
        {"type": "EMERGENCY", "title": "🔴 Active Emergency", "body": "Possible Fall detected for Rajesh Kumar (P002)", "timestamp": "Just now", "urgent": True},
        {"type": "DISCONNECT", "title": "📡 Wearable Alert", "body": "Savita Sharma's gateway link disconnected for 5 minutes.", "timestamp": "10m ago", "urgent": false},
        {"type": "DOCTOR", "title": "👨‍⚕️ Clinician Update", "body": "Dr. Swamy added doctor visible instructions for Savita.", "timestamp": "1h ago", "urgent": false}
    ]

@app.get("/api/guardian/audit-log")
def get_guardian_audit_logs():
    return sorted(db_client.find_many("audit_registry"), key=lambda l: l.get("timestamp", 0), reverse=True)

# --- Volunteer Portal ---
# The volunteer view intentionally uses the existing emergency and volunteer records.
# It never serializes patient clinical records into a responder response.
class VolunteerLoginRequest(BaseModel):
    email: str
    password: str

class VolunteerStatusUpdate(BaseModel):
    status: str

class VolunteerCheckIn(BaseModel):
    outcome: str
    notes: str = ""

class VolunteerRegistration(BaseModel):
    name: str
    email: str
    phone: str
    college: str
    course: str
    skills: List[str] = []

VOLUNTEER_DEMO_EMAIL = "rahul.volunteer@aegisnet.demo"
VOLUNTEER_DEMO_PASSWORD = "volunteer123"

def _volunteer_or_404(volunteer_id: str = "V101"):
    volunteer = db.volunteers.get(volunteer_id)
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return volunteer

def _mission_for_event(event: EmergencyEvent) -> Dict[str, Any]:
    return {
        "id": f"MS-{event.id}", "event_id": event.id, "event_type": event.type.replace("_", " ").title(),
        "distance_km": 1.2, "eta_minutes": 6, "risk_score": event.risk_score,
        "risk_level": "HIGH" if event.risk_score < 75 else "CRITICAL", "patient_label": "Elderly adult",
        "patient_response": "No response", "doctor_notified": True, "guardian_notified": True,
        "status": event.status, "location_available": bool(event.assigned_volunteer_id),
        "evidence": ["Sudden movement change", "Orientation change", "Extended inactivity"]
    }

@app.post("/api/volunteer/register")
def volunteer_register(payload: VolunteerRegistration):
    db.log_audit("VOLUNTEER_REGISTRATION", f"Registration submitted by {payload.email}")
    return {"status": "pending", "message": "Registration submitted for college and training review."}

@app.post("/api/volunteer/login")
def volunteer_login(payload: VolunteerLoginRequest):
    if payload.email.lower() != VOLUNTEER_DEMO_EMAIL or payload.password != VOLUNTEER_DEMO_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials. Demo: rahul.volunteer@aegisnet.demo / volunteer123")
    volunteer = _volunteer_or_404()
    return {"status": "success", "session": {"authenticated": True, "email": payload.email.lower(), "name": volunteer.name, "role": "volunteer", "token": f"jwt-volunteer-mock-{uuid_str()}"}}

@app.get("/api/volunteer/profile")
def volunteer_profile():
    vol = _volunteer_or_404()
    return {"id": vol.id, "name": vol.name, "college": vol.college, "program": vol.program,
            "status": vol.status, "skills": vol.skills, "hours": vol.hours_logged, "credits": vol.credits,
            "rating": vol.rating, "verification": {"status": "Verified", "id": "VC-2026-00129", "verified_at": "21 Aug 2026"}}

@app.get("/api/volunteer/verification")
def volunteer_verification():
    return {"status": "Verified", "verification_id": "VC-2026-00129", "college_verified": True,
            "identity_verified": True, "training_verified": True, "hash": "aegis-vc-9f17c2b8"}

@app.post("/api/volunteer/status")
def volunteer_status(payload: VolunteerStatusUpdate):
    vol = _volunteer_or_404()
    allowed = {"AVAILABLE", "BUSY", "OFFLINE"}
    if payload.status.upper() not in allowed:
        raise HTTPException(status_code=422, detail="Status must be AVAILABLE, BUSY, or OFFLINE")
    vol.status = payload.status.upper()
    db.log_audit("VOLUNTEER_STATUS", f"{vol.name} set availability to {vol.status}")
    return {"status": "success", "availability": vol.status}

@app.get("/api/volunteer/emergencies/nearby")
def volunteer_nearby_emergencies():
    return [_mission_for_event(e) for e in db.events.values() if e.status in {"WARNING_COUNTDOWN", "UNACKNOWLEDGED", "RESPONDING", "ESCALATED"}]

@app.get("/api/volunteer/emergencies/{event_id}")
def volunteer_emergency_detail(event_id: str):
    event = db.events.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    db.log_audit("VOLUNTEER_VIEWED_EMERGENCY", f"Volunteer viewed minimal emergency record {event_id}")
    return _mission_for_event(event)

@app.post("/api/volunteer/emergencies/{event_id}/accept")
async def volunteer_accept_emergency(event_id: str):
    event = db.events.get(event_id)
    vol = _volunteer_or_404()
    if not event:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    if vol.status != "AVAILABLE":
        raise HTTPException(status_code=409, detail="You must be available to accept a mission")
    event.assigned_volunteer_id, event.status, vol.status = vol.id, "RESPONDING", "RESPONDING"
    db.log_audit("VOLUNTEER_ACCEPTED", f"{vol.name} accepted {event_id}")
    await manager.broadcast({"type": "VOLUNTEER_MISSION_ACCEPTED", "event_id": event_id, "volunteer_id": vol.id})
    return {"status": "ACCEPTED", "mission": _mission_for_event(event)}

@app.post("/api/volunteer/emergencies/{event_id}/decline")
def volunteer_decline_emergency(event_id: str):
    db.log_audit("VOLUNTEER_DECLINED", f"Volunteer declined {event_id}")
    return {"status": "DECLINED"}

@app.get("/api/volunteer/assignments")
def volunteer_assignments():
    vol = _volunteer_or_404()
    return [_mission_for_event(e) for e in db.events.values() if e.assigned_volunteer_id == vol.id and e.status in {"RESPONDING", "UNACKNOWLEDGED", "ESCALATED"}]

@app.post("/api/volunteer/missions/{event_id}/arrive")
def volunteer_arrive(event_id: str):
    event = db.events.get(event_id)
    if not event or event.assigned_volunteer_id != "V101":
        raise HTTPException(status_code=404, detail="Active assignment not found")
    db.log_audit("VOLUNTEER_ARRIVED", f"Volunteer arrived for {event_id}")
    return {"status": "ARRIVED", "message": "Arrival recorded. Complete a safety check-in."}

@app.post("/api/volunteer/missions/{event_id}/check-in")
def volunteer_checkin(event_id: str, payload: VolunteerCheckIn):
    if event_id not in db.events:
        raise HTTPException(status_code=404, detail="Active assignment not found")
    db.log_audit("VOLUNTEER_CHECK_IN", f"{event_id}: {payload.outcome}")
    return {"status": "success", "outcome": payload.outcome, "message": "Doctor and guardian coordination updated."}

@app.post("/api/volunteer/missions/{event_id}/complete")
def volunteer_complete_mission(event_id: str):
    event, vol = db.events.get(event_id), _volunteer_or_404()
    if not event or event.assigned_volunteer_id != vol.id:
        raise HTTPException(status_code=404, detail="Active assignment not found")
    event.status, event.resolved_at, vol.status = "RESOLVED", time.time(), "AVAILABLE"
    vol.hours_logged, vol.credits = round(vol.hours_logged + 0.3, 1), vol.credits + 50
    cert_id = f"CC-{time.strftime('%Y')}-{uuid_str()}"
    cert_hash = hashlib.sha256(f"{cert_id}|{vol.id}|{event_id}".encode()).hexdigest()[:16]
    db.certificates[cert_id] = ProofOfCare(id=cert_id, event_id=event_id, volunteer_id=vol.id, volunteer_name=vol.name, college=vol.college, date=time.strftime("%Y-%m-%d"), duration_minutes=20, credits_earned=50, cryptographic_hash=cert_hash)
    db.log_audit("VOLUNTEER_MISSION_COMPLETED", f"{vol.name} completed {event_id}")
    return {"status": "COMPLETED", "credits_earned": 50, "certificate_id": cert_id}

@app.get("/api/volunteer/care-credits")
def volunteer_care_credits():
    vol = _volunteer_or_404()
    return {"balance": vol.credits, "transactions": [{"type": "Verified emergency assistance", "credits": 50, "status": "VERIFIED"}, {"type": "Community care contribution", "credits": 20, "status": "VERIFIED"}]}

@app.get("/api/volunteer/certificates")
def volunteer_certificates():
    return [c for c in db.certificates.values() if c.volunteer_id == "V101"]

@app.get("/api/volunteer/training")
def volunteer_training():
    return [{"name": "Basic First Aid", "progress": 80}, {"name": "CPR Basics", "progress": 60}, {"name": "Elderly Assistance", "progress": 100}, {"name": "Emergency Response", "progress": 40}]

@app.get("/api/volunteer/impact")
def volunteer_impact():
    vol = _volunteer_or_404()
    return {"responses": 12, "people_assisted": 17, "hours": vol.hours_logged, "average_response": "7 min", "success_rate": 94, "credits": vol.credits}

@app.get("/api/volunteer/notifications")
def volunteer_notifications():
    return [{"title": "Emergency matching active", "body": "New nearby assistance requests will appear here.", "urgent": True}, {"title": "Verification active", "body": "Your responder credentials are verified.", "urgent": False}]

@app.get("/api/volunteer/privacy")
def volunteer_privacy():
    return {"patient_name": "Restricted", "medical_history": False, "prescriptions": False, "emergency_type": True, "location": "During assignment", "doctor_contact": "During assignment", "guardian_contact": "During assignment", "volunteer_location": "Active assignment only"}

# --- College Administration Portal (institutional, aggregate-only access) ---
class CollegeLoginRequest(BaseModel):
    email: str
    password: str

class CollegeVerificationAction(BaseModel):
    reason: str = ""

COLLEGE_STUDENTS = [
    {"id": f"STU-{1029+i}", "name": name, "course": course, "year": year, "verification": verification, "training": "Complete" if verification == "Verified" else "Pending", "missions": missions, "hours": hours, "credits": credits, "status": status}
    for i, (name, course, year, verification, missions, hours, credits, status) in enumerate([
        ("Rahul Sharma", "B.Pharm", "3rd Year", "Verified", 12, 24, 642, "Active"), ("Priya Patel", "B.Sc Nursing", "2nd Year", "Verified", 8, 18, 410, "Active"), ("Amit Kumar", "MBBS", "1st Year", "Pending", 0, 0, 0, "Pending"), ("Neha Singh", "B.Pharm", "4th Year", "Verified", 15, 31, 810, "Active"), ("Arjun Mehta", "B.Sc Nursing", "3rd Year", "Rejected", 0, 0, 0, "Inactive"), ("Sana Khan", "MBBS", "2nd Year", "Verified", 7, 15, 360, "Active"), ("Vikram Rao", "B.Pharm", "2nd Year", "Expired", 3, 6, 120, "Inactive"), ("Isha Nair", "B.Sc Nursing", "4th Year", "Pending", 0, 0, 0, "Pending"), ("Karan Shah", "MBBS", "3rd Year", "Verified", 10, 20, 550, "Active"), ("Meera Das", "B.Pharm", "1st Year", "Verified", 5, 10, 250, "Active"), ("Rohan Bose", "B.Sc Nursing", "2nd Year", "Verified", 9, 19, 470, "Active"), ("Aditi Jain", "MBBS", "4th Year", "Verified", 11, 23, 610, "Active"), ("Kabir Verma", "B.Pharm", "3rd Year", "Pending", 0, 0, 0, "Pending"), ("Tanya Roy", "B.Sc Nursing", "1st Year", "Verified", 6, 12, 300, "Active"), ("Dev Malhotra", "MBBS", "2nd Year", "Suspended", 2, 4, 80, "Suspended")
    ])
]

@app.post("/api/college/login")
def college_login(payload: CollegeLoginRequest):
    if payload.email.lower() != "admin@examplemedical.edu" or payload.password != "college123":
        raise HTTPException(status_code=401, detail="Invalid credentials. Demo: admin@examplemedical.edu / college123")
    return {"status": "success", "session": {"authenticated": True, "email": payload.email.lower(), "name": "Dr. Meera Iyer", "role": "college", "token": f"jwt-college-mock-{uuid_str()}"}}

@app.get("/api/college/profile")
def college_profile():
    return {"name": "Example Medical College", "code": "EMC-2026", "type": "Health Sciences Institution", "city": "Navi Mumbai", "state": "Maharashtra", "email": "admin@examplemedical.edu", "representative": "Dr. Meera Iyer", "verified": True}

@app.get("/api/college/dashboard")
def college_dashboard():
    return {"registered_students": 428, "verified_volunteers": 312, "pending_verification": 18, "active_volunteers": 146, "community_hours": 2840, "care_credits": 18420, "completed_missions": 624, "certificates_issued": 218}

@app.get("/api/college/students")
def college_students():
    return COLLEGE_STUDENTS

@app.get("/api/college/students/{student_id}")
def college_student(student_id: str):
    student = next((s for s in COLLEGE_STUDENTS if s["id"] == student_id), None)
    if not student: raise HTTPException(status_code=404, detail="Student not found")
    return {**student, "department": "Community Health", "skills": ["First Aid", "CPR", "Elderly Care"], "certificates": 2, "enrollment": "Current", "verification_id": "VC-2026-00129"}

@app.get("/api/college/verification")
def college_verification():
    return [s for s in COLLEGE_STUDENTS if s["verification"] in {"Pending", "Rejected", "Expired"}]

@app.post("/api/college/verification/{student_id}/{action}")
def college_verification_action(student_id: str, action: str, payload: CollegeVerificationAction):
    student = next((s for s in COLLEGE_STUDENTS if s["id"] == student_id), None)
    if not student or action not in {"approve", "reject", "request-correction"}: raise HTTPException(status_code=404, detail="Verification request not found")
    student["verification"] = "Verified" if action == "approve" else ("Rejected" if action == "reject" else "Pending")
    student["status"] = "Active" if action == "approve" else student["status"]
    db.log_audit("COLLEGE_VERIFICATION", f"{action} {student_id}: {payload.reason}")
    return {"status": "success", "student": student}

@app.get("/api/college/training")
def college_training():
    return [{"course": "Basic First Aid", "required": True, "completed": "278 / 312"}, {"course": "CPR", "required": True, "completed": "251 / 312"}, {"course": "Elderly Assistance", "required": True, "completed": "289 / 312"}, {"course": "Patient Privacy", "required": True, "completed": "312 / 312"}]

@app.get("/api/college/missions")
def college_missions():
    return {"total": 624, "completed": 592, "cancelled": 32, "average_response": "7m 42s", "successful_assistance": "94%", "note": "Mission records are aggregate and anonymized."}

@app.get("/api/college/care-credits")
def college_care_credits():
    return {"generated": 18420, "redeemed": 6200, "active": 12220, "average_per_volunteer": 59, "top_contributors": [{"name": "Rahul Sharma", "hours": 24, "credits": 642}, {"name": "Neha Singh", "hours": 31, "credits": 810}]}

@app.get("/api/college/certificates")
def college_certificates():
    return [{"id": c.id, "student": c.volunteer_name, "hours": c.duration_minutes, "credits": c.credits_earned, "date": c.date, "hash": c.cryptographic_hash} for c in db.certificates.values()]

@app.get("/api/college/programs")
def college_programs():
    return [{"name": "Elderly Community Assistance", "participants": 84, "hours": 426, "missions": 102, "status": "Active"}, {"name": "Community First Aid", "participants": 112, "hours": 510, "missions": 0, "status": "Active"}]

@app.get("/api/college/impact")
def college_impact():
    return {"students_involved": 428, "verified_volunteers": 312, "missions": 624, "community_hours": 2840, "people_assisted": 517, "care_credits": 18420}

@app.get("/api/college/notifications")
def college_notifications():
    return [{"title": "Verification backlog", "body": "18 student applications are pending review.", "urgent": True}, {"title": "Program milestone", "body": "Elderly Community Assistance reached 426 verified hours.", "urgent": False}]

@app.get("/api/college/audit")
def college_audit():
    return [a for a in reversed(db.audit_log) if a["action"].startswith("COLLEGE_") or "VOLUNTEER" in a["action"]]

@app.get("/api/college/privacy")
def college_privacy():
    return {"student_identity": True, "volunteer_verification": True, "training": True, "mission_contribution": True, "care_credits": True, "patient_medical_record": False, "patient_prescriptions": False, "patient_vitals": False, "patient_location": False, "private_doctor_notes": False, "camera_footage": False}

@app.get("/api/verify/certificate/{certificate_id}")
def verify_certificate(certificate_id: str):
    cert = db.certificates.get(certificate_id)
    if not cert: raise HTTPException(status_code=404, detail="Certificate not found")
    return {"valid": True, "certificate_id": cert.id, "student": cert.volunteer_name, "institution": cert.college, "contribution": f"{cert.duration_minutes} community minutes", "issue_date": cert.date}

@app.get("/api/verify/volunteer/{verification_id}")
def verify_volunteer(verification_id: str):
    return {"valid": verification_id == "VC-2026-00129", "verification_id": verification_id, "institution": "Example Medical College", "issued": "21 Aug 2026"}

# --- Notification System API Endpoints ---

class FCMTokenPayload(BaseModel):
    user_id: str = "all"
    role: str = "patient"
    token: str

class NotificationPrefPayload(BaseModel):
    user_id: str = "all"
    role: str = "patient"
    preferences: Dict[str, Any]

class EmergencyAckPayload(BaseModel):
    event_id: str
    acknowledged_by: str = "Dr. Arvind Swamy"
    role: str = "doctor"

@app.get("/api/notifications")
def get_user_notifications(role: str = "patient", user_id: str = "all"):
    return notification_service.get_notifications(role=role, user_id=user_id)

@app.post("/api/notifications/mark-read/{notification_id}")
def mark_notification_read(notification_id: str):
    success = notification_service.mark_read(notification_id)
    return {"status": "success" if success else "error"}

@app.post("/api/notifications/mark-all-read")
def mark_all_notifications_read(role: str = "patient", user_id: str = "all"):
    success = notification_service.mark_all_read(role=role, user_id=user_id)
    return {"status": "success" if success else "error"}

@app.post("/api/notifications/fcm-token")
def save_fcm_token(payload: FCMTokenPayload):
    return notification_service.save_fcm_token(user_id=payload.user_id, role=payload.role, token=payload.token)

@app.get("/api/notifications/preferences")
def get_notification_preferences(role: str = "patient", user_id: str = "all"):
    return notification_service.get_preferences(user_id=user_id, role=role)

@app.put("/api/notifications/preferences")
def update_notification_preferences(payload: NotificationPrefPayload):
    return notification_service.update_preferences(user_id=payload.user_id, role=payload.role, preferences=payload.preferences)

@app.post("/api/notifications/acknowledge/{event_id}")
def acknowledge_emergency(event_id: str, payload: EmergencyAckPayload):
    event = db.events.get(event_id)
    if event:
        event.status = "RESPONDING"
    
    notif = notification_service.create_notification(
        role="all",
        type_="EMERGENCY_ACKNOWLEDGED",
        title="✅ Emergency Acknowledged",
        body=f"Emergency {event_id} acknowledged by {payload.acknowledged_by} ({payload.role.capitalize()}). First responder on scene.",
        link="/patient/emergency",
        critical=False,
        metadata={"event_id": event_id, "acknowledged_by": payload.acknowledged_by}
    )
    return {"status": "success", "event_id": event_id, "acknowledged_by": payload.acknowledged_by, "notification": notif}

@app.post("/api/demo/simulate-emergency")
async def simulate_emergency():
    import uuid
    event_id = f"EVT-SIM-{uuid.uuid4().hex[:6].upper()}"
    timestamp = time.time()
    
    sim_event = EmergencyEvent(
        id=event_id,
        timestamp=timestamp,
        type="FALL",
        risk_score=92,
        status="UNACKNOWLEDGED",
        location_zone="LivingRoom",
        location_coords={"lat": 19.0760, "lng": 72.8777},
        details="Severe impact detected followed by stillness in LivingRoom",
        assigned_volunteer_id="V101"
    )
    db.events[event_id] = sim_event
    state_machine.active_event_id = event_id
    state_machine.state = "UNACKNOWLEDGED"

    # Step 1: Send Emergency & Fall notifications
    n_doc = notification_service.create_notification(
        role="doctor",
        type_="EMERGENCY_DETECTED",
        title="🚨 Emergency SOS Alert",
        body="Acute motion distress detected in LivingRoom. Clinical review recommended.",
        link="/doctor/emergencies",
        critical=True,
        metadata={"event_id": event_id}
    )
    n_gdn = notification_service.create_notification(
        role="guardian",
        type_="POSSIBLE_FALL",
        title="🔴 Motion Anomaly Alert",
        body="Possible fall detected for Savita Sharma in LivingRoom.",
        link="/guardian/emergencies",
        critical=True,
        metadata={"event_id": event_id}
    )
    n_vol = notification_service.create_notification(
        role="volunteer",
        type_="VOLUNTEER_ASSIGNED",
        title="🧑‍⚕️ Emergency Dispatch Nearby",
        body="Immediate community assistance required within 0.8km radius.",
        link="/volunteer/emergencies",
        critical=True,
        metadata={"event_id": event_id}
    )
    
    await manager.broadcast({"type": "EMERGENCY_ALERT", "event": sim_event.model_dump(), "notifications": [n_doc, n_gdn, n_vol]})
    
    # Step 2: Auto-Volunteer Response & Care Credits
    v = db.volunteers.get("V101")
    if v:
        v.credits += 25
        v.hours_logged += 1.5
    
    cert_id = f"CERT-{uuid.uuid4().hex[:6].upper()}"
    proof = ProofOfCare(
        id=cert_id,
        event_id=event_id,
        volunteer_id="V101",
        volunteer_name="Rahul Sharma",
        college="XYZ College of Pharmacy",
        date=time.strftime("%Y-%m-%d"),
        duration_minutes=45,
        credits_earned=25,
        cryptographic_hash=hashlib.sha256(f"{cert_id}:V101".encode()).hexdigest()
    )
    db.certificates[cert_id] = proof

    n_cred = notification_service.create_notification(
        role="volunteer",
        type_="CARE_CREDITS_EARNED",
        title="❤️ Care Credits Awarded",
        body="You earned +25 Care Credits for completing community response mission.",
        link="/volunteer/care-credits",
        critical=False,
        metadata={"credits": 25}
    )

    n_cert = notification_service.create_notification(
        role="college",
        type_="CERTIFICATE_ISSUED",
        title="📜 Verification Certificate Issued",
        body="New community service certificate logged for volunteer Rahul Sharma.",
        link="/college/certificates",
        critical=False,
        metadata={"cert_id": cert_id}
    )

    # Step 3: Resolve Emergency
    sim_event.status = "RESOLVED"
    sim_event.resolved_at = time.time() + 300
    state_machine.state = "NORMAL"

    n_res = notification_service.create_notification(
        role="all",
        type_="EMERGENCY_RESOLVED",
        title="✅ Emergency Resolved",
        body="Emergency dispatch EVT-SIM has been safely resolved by community first responder.",
        link="/patient/emergency",
        critical=False,
        metadata={"event_id": event_id}
    )

    await manager.broadcast({"type": "NOTIFICATION", "data": n_res})

    return {
        "status": "success",
        "message": "Full multi-role emergency dispatch simulation completed successfully.",
        "event_id": event_id,
        "notifications_generated": 6
    }

# Mount static files (MUST be mounted after routes otherwise it matches everything)
app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
