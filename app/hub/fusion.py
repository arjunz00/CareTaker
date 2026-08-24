from typing import List, Dict, Any, Tuple
import numpy as np
from app.database.db import db, TelemetryFrame
from app.hub.detector import EdgeDetector

class SensorFusionEngine:
    @staticmethod
    def evaluate_risk(history: List[TelemetryFrame]) -> Tuple[int, int, Dict[str, Any]]:
        """
        Sensor Fusion Algorithm:
        Fuses IMU, PPG, SpO2, Environmental variables, and Edge Vision tags.
        Calculates:
        1. Current Emergency Risk Score (0-100)
        2. Forecasted Risk Score for next 30 minutes (0-100)
        3. Detailed diagnostic rationale
        """
        if not history:
            return 10, 10, {"status": "Offline", "reason": "No sensor readings registered"}

        latest_frame = history[-1]
        
        # 1. Run individual edge detector passes
        is_fall, fall_conf, fall_reason = EdgeDetector.detect_fall(history[-30:])
        is_inactive, inactive_conf, inactive_reason = EdgeDetector.detect_inactivity(history)
        is_vitals_alert, vitals_conf, vitals_reason = EdgeDetector.detect_vitals_anomaly(history)

        # 2. Extract context parameters
        room = latest_frame.room_occupancy
        camera_pose = latest_frame.camera_pose
        is_camera_bedroom_allowed = db.consent.camera_bedroom
        is_camera_livingroom_allowed = db.consent.camera_livingroom

        # Base calculations
        current_score = 10
        diagnostics = []

        # --- Sensor Fusion Logic ---
        
        # IMU Fall Weight (Base 45 points)
        if is_fall:
            current_score += int(fall_conf * 45)
            diagnostics.append(f"IMU Anomaly: Fall event flag ({int(fall_conf*100)}% confidence)")
        
        # Inactivity Weight (Base 25 points)
        if is_inactive:
            current_score += int(inactive_conf * 25)
            diagnostics.append(f"Behavioral Anomaly: Sustained inactivity ({int(inactive_conf*100)}% confidence)")

        # Vitals weight (Base 20 points)
        if is_vitals_alert:
            current_score += int(vitals_conf * 20)
            diagnostics.append(f"Physiological Anomaly: {vitals_reason}")

        # Edge Vision Posture Fusion (Base 15 points)
        # Checks privacy consent before factoring camera posture
        vision_active = False
        if room == "Bedroom" and is_camera_bedroom_allowed:
            vision_active = True
        elif room == "LivingRoom" and is_camera_livingroom_allowed:
            vision_active = True

        if vision_active and camera_pose in ["On Floor", "Lying"]:
            # If camera confirms person is on the floor, escalate score
            current_score += 15
            diagnostics.append(f"Vision Anomaly: Edge vision confirmed posture '{camera_pose}' in {room}")
        elif vision_active and camera_pose in ["Standing", "Walking"] and is_fall:
            # False-Alarm Suppression: Camera confirms person is standing/walking, despite IMU fall spike
            current_score -= 30
            diagnostics.append("False Alarm Filter: Camera confirms patient upright post-impact spike")

        # Environmental Temperature/Humidity weights (Base 5 points)
        # Contextual anomaly e.g. high heat indicates gas leak/fire risk or bathroom steam risk
        if latest_frame.env_temp > 45.0:
            current_score += 5
            diagnostics.append("Ambient Context: Dangerous room temperature (>45°C)")

        # Cap current score
        current_score = max(0, min(100, current_score))

        # --- Time-Series Predictive Forecasting AI (30-Minute Risk Trend) ---
        # Analyze temporal trends in the vitals and activity variance over the window
        forecast_score = current_score

        if len(history) >= 20:
            # 1. Analyze SpO2 trend
            spo2_trend = np.polyfit(range(len(history[-20:])), [f.spo2 for f in history[-20:]], 1)[0]
            # 2. Analyze Heart rate trend
            hr_trend = np.polyfit(range(len(history[-20:])), [f.heart_rate for f in history[-20:]], 1)[0]
            # 3. Analyze activity variance trend
            acc_var_trend = np.polyfit(range(len(history[-20:])), [f.acc_mag for f in history[-20:]], 1)[0]

            # If SpO2 is decreasing and heart rate is rising, forecast increased risk
            if spo2_trend < -0.1 and hr_trend > 0.1:
                forecast_score += 25
                diagnostics.append("Forecast AI Alert: Short-term risk elevated due to SpO₂ drop + HR climb")
            
            # If activity level is steadily decaying to zero (accumulating inactivity)
            if acc_var_trend < -0.05 and is_inactive:
                forecast_score += 15
                diagnostics.append("Forecast AI Alert: Gradual decay in movement vectors projects risk warning")
        
        forecast_score = max(0, min(100, forecast_score))

        # Classify severity
        if current_score >= 75:
            severity = "CRITICAL"
        elif current_score >= 50:
            severity = "HIGH"
        elif current_score >= 30:
            severity = "WARNING"
        else:
            severity = "NORMAL"

        return current_score, forecast_score, {
            "status": severity,
            "reasons": diagnostics,
            "fall_conf": fall_conf if is_fall else 0.0,
            "vitals_alert": is_vitals_alert,
            "inactivity_active": is_inactive
        }
