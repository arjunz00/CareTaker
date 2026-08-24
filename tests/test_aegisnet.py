import time
from app.database.db import db, TelemetryFrame, ConsentSettings, EmergencyEvent
from app.hub.detector import EdgeDetector
from app.hub.fusion import SensorFusionEngine
from app.hub.state import state_machine

def test_sensor_consent_toggles():
    """Verify consent toggles disable telemetry reads correctly."""
    db.consent = ConsentSettings(imu_enabled=False, ppg_enabled=True)
    db.telemetry_history.clear()
    
    # Generate 5 mock frames to satisfy minimum readings window
    for _ in range(5):
        frame = TelemetryFrame(
            timestamp=time.time(), acc_x=0, acc_y=0, acc_z=0, acc_mag=0,
            gyro_x=0, gyro_y=0, gyro_z=0, heart_rate=120, spo2=98,
            body_temp=36.5, env_temp=24.0, env_humidity=50.0,
            room_occupancy="LivingRoom", camera_pose="Walking"
        )
        db.add_telemetry(frame)
    
    # Run detector
    is_fall, _, _ = EdgeDetector.detect_fall(db.telemetry_history)
    is_vitals, _, _ = EdgeDetector.detect_vitals_anomaly(db.telemetry_history)
    
    assert is_fall is False  # Must be false because IMU is disabled
    assert is_vitals is True  # Must trigger vital anomaly (120 HR) since PPG is enabled

def test_fall_detection_heuristic():
    """Verify that a severe impact spike followed by stillness triggers fall detection."""
    db.consent = ConsentSettings(imu_enabled=True, ppg_enabled=True)
    db.edge_config["fall_threshold_g"] = 2.8
    db.edge_config["stillness_variance_threshold_g"] = 0.05
    
    # Simulate fall window: normal, then spike, then stillness
    window = []
    # 5 normal frames
    for _ in range(5):
        window.append(TelemetryFrame(
            timestamp=time.time(), acc_x=0, acc_y=0, acc_z=1.0, acc_mag=1.0,
            gyro_x=0.01, gyro_y=0.01, gyro_z=0.01, heart_rate=72, spo2=98,
            body_temp=36.5, env_temp=24.0, env_humidity=50.0,
            room_occupancy="LivingRoom", camera_pose="Walking"
        ))
    # Impact spike
    window.append(TelemetryFrame(
        timestamp=time.time(), acc_x=0.5, acc_y=0.5, acc_z=3.1, acc_mag=3.2,
        gyro_x=1.8, gyro_y=2.2, gyro_z=1.5, heart_rate=72, spo2=98,
        body_temp=36.5, env_temp=24.0, env_humidity=50.0,
        room_occupancy="LivingRoom", camera_pose="Unknown"
    ))
    # 10 stillness frames
    for _ in range(10):
        window.append(TelemetryFrame(
            timestamp=time.time(), acc_x=0.01, acc_y=0.01, acc_z=0.01, acc_mag=0.02,
            gyro_x=0.0, gyro_y=0.0, gyro_z=0.0, heart_rate=75, spo2=98,
            body_temp=36.5, env_temp=24.0, env_humidity=50.0,
            room_occupancy="LivingRoom", camera_pose="On Floor"
        ))
        
    is_fall, conf, reason = EdgeDetector.detect_fall(window)
    assert is_fall is True
    assert conf >= 0.70
    assert "Severe acceleration impact" in reason

def test_sensor_fusion_risk_escalation():
    """Verify that multi-sensor inputs correctly fuse to calculate emergency scores."""
    db.consent = ConsentSettings(imu_enabled=True, ppg_enabled=True, spo2_enabled=True, camera_livingroom=True)
    db.edge_config["fall_threshold_g"] = 2.8
    db.edge_config["stillness_variance_threshold_g"] = 0.05
    
    # 1. Simulate just a normal walk
    window = [TelemetryFrame(
        timestamp=time.time(), acc_x=0, acc_y=0, acc_z=1.0, acc_mag=1.0,
        gyro_x=0.01, gyro_y=0.01, gyro_z=0.01, heart_rate=72, spo2=98,
        body_temp=36.5, env_temp=24.0, env_humidity=50.0,
        room_occupancy="LivingRoom", camera_pose="Walking"
    ) for _ in range(25)]
    
    risk, forecast, details = SensorFusionEngine.evaluate_risk(window)
    assert risk < 30  # Should be normal/low risk
    
    # 2. Simulate fall + high HR + camera pose "On Floor"
    window_fall = []
    # Normal frames
    for _ in range(5):
        window_fall.append(TelemetryFrame(
            timestamp=time.time(), acc_x=0, acc_y=0, acc_z=1.0, acc_mag=1.0,
            gyro_x=0.01, gyro_y=0.01, gyro_z=0.01, heart_rate=72, spo2=98,
            body_temp=36.5, env_temp=24.0, env_humidity=50.0,
            room_occupancy="LivingRoom", camera_pose="Walking"
        ))
    # Fall impact
    window_fall.append(TelemetryFrame(
        timestamp=time.time(), acc_x=0, acc_y=0, acc_z=3.1, acc_mag=3.1,
        gyro_x=1.8, gyro_y=2.2, gyro_z=1.5, heart_rate=72, spo2=98,
        body_temp=36.5, env_temp=24.0, env_humidity=50.0,
        room_occupancy="LivingRoom", camera_pose="Unknown"
    ))
    # Post-fall stillness + Tachycardia + On Floor posture
    for _ in range(15):
        window_fall.append(TelemetryFrame(
            timestamp=time.time(), acc_x=0.01, acc_y=0.01, acc_z=0.01, acc_mag=0.02,
            gyro_x=0.0, gyro_y=0.0, gyro_z=0.0, heart_rate=125, spo2=98,
            body_temp=36.5, env_temp=24.0, env_humidity=50.0,
            room_occupancy="LivingRoom", camera_pose="On Floor"
        ))
        
    risk, forecast, details = SensorFusionEngine.evaluate_risk(window_fall)
    assert risk >= 75  # Must escalate to critical severity
    assert details["status"] == "CRITICAL"

def test_state_machine_countdown_to_dispatch():
    """Verify alarm transitions: Normal -> Warning -> Confirmed -> Escalated."""
    state_machine.state = "NORMAL"
    state_machine.active_event_id = None
    state_machine.countdown_started_at = None
    
    # 1. Send critical risk event to tick
    latest_frame = TelemetryFrame(
        timestamp=time.time(), acc_x=0, acc_y=0, acc_z=1.0, acc_mag=1.0,
        gyro_x=0, gyro_y=0, gyro_z=0, heart_rate=120, spo2=98,
        body_temp=36.5, env_temp=24.0, env_humidity=50.0,
        room_occupancy="LivingRoom", camera_pose="On Floor"
    )
    
    res = state_machine.tick(85, 90, {"reasons": ["Severe Fall"]}, latest_frame)
    assert res["state"] == "WARNING_COUNTDOWN"
    assert state_machine.active_event_id is not None
    
    # 2. Simulate countdown expiration (15 seconds grace period)
    state_machine.countdown_started_at = time.time() - 16.0
    res = state_machine.tick(85, 90, {"reasons": ["Severe Fall"]}, latest_frame)
    assert res["state"] == "CONFIRMED"
    
    event = db.events.get(state_machine.active_event_id)
    assert event is not None
    assert event.status in ["UNACKNOWLEDGED", "RESPONDING"] # status changes to RESPONDING when volunteer dispatched

def test_adaptive_threshold_feedback():
    """Verify that alarm cancellation adjusts edge thresholds upward."""
    db.edge_config["fall_threshold_g"] = 2.8
    state_machine.state = "WARNING_COUNTDOWN"
    state_machine.active_event_id = "test-evt"
    state_machine.countdown_started_at = time.time()
    
    # Log active event in DB
    db.events["test-evt"] = EmergencyEvent(
        id="test-evt", timestamp=time.time(), type="FALL", risk_score=80,
        status="WARNING_COUNTDOWN", location_coords={"lat": 0, "lng": 0},
        location_zone="LivingRoom", details="Spike"
    )
    
    # Click cancel (triggers feedback tuning)
    res = state_machine.cancel_alarm()
    assert res["status"] == "success"
    assert db.edge_config["fall_threshold_g"] > 2.8  # Threshold should have adapted upwards
    assert state_machine.state == "NORMAL"

def test_rag_engine_retrieval_and_responses():
    """Verify role-specific RAG context retrieval and response synthesis."""
    from app.hub.rag_engine import rag_engine

    # 1. Test Patient RAG retrieval
    pat_res = rag_engine.generate_response(role="patient", query="What does my SpO2 mean?")
    assert "SpO₂" in pat_res["response"] or "oxygen" in pat_res["response"].lower()
    assert pat_res["role"] == "patient"
    assert pat_res["is_critical"] is False

    # 2. Test Doctor RAG retrieval
    doc_res = rag_engine.generate_response(role="doctor", query="Explain clinical risk score triage")
    assert doc_res["role"] == "doctor"
    assert "Risk Score" in doc_res["response"] or "Clinical" in doc_res["response"]

    # 3. Test Volunteer RAG retrieval for CPR
    vol_res = rag_engine.generate_response(role="volunteer", query="How to perform CPR chest compressions?")
    assert vol_res["role"] == "volunteer"
    assert "CPR" in vol_res["response"] or "compressions" in vol_res["response"].lower()

    # 4. Test Safety Override on severe symptoms
    crit_res = rag_engine.generate_response(role="patient", query="I have severe chest pain")
    assert crit_res["is_critical"] is True
    assert "EMERGENCY" in crit_res["response"]

def test_notification_system_and_fcm_privacy():
    """Verify FCM token registration, privacy text sanitization, and notification filtering."""
    from app.hub.notification_service import notification_service

    # 1. FCM Token Registration
    res_fcm = notification_service.save_fcm_token("P001", "patient", "fcm-mock-token-12345")
    assert res_fcm["status"] == "success"

    # 2. Privacy Text Sanitization
    notif = notification_service.create_notification(
        role="doctor",
        type_="EMERGENCY_DETECTED",
        title="🚨 SOS Alert",
        body="Patient Savita Sharma has hypertension and stroke risk.",
        link="/doctor/emergencies",
        critical=True
    )
    assert "hypertension" not in notif["body"]
    assert "stroke" not in notif["body"]
    assert "medical status" in notif["body"]

    # 3. Notification Retrieval & Read Status
    notifs = notification_service.get_notifications("doctor")
    assert len(notifs) >= 1
    found_id = notifs[0]["id"]

    success_mark = notification_service.mark_read(found_id)
    assert success_mark is True


