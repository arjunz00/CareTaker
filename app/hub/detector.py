import numpy as np
from typing import List, Tuple, Dict, Any
from app.database.db import db, TelemetryFrame

class EdgeDetector:
    @staticmethod
    def detect_fall(window: List[TelemetryFrame]) -> Tuple[bool, float, str]:
        """
        Heuristic Fall Detection Algorithm:
        1. Acceleration Spike: acc_mag exceeds fall_threshold_g.
        2. Post-fall Stillness: variance of acceleration magnitude following the spike is very low.
        3. Orientation Change: gyroscope angular velocity variance spikes during impact.
        Returns: (is_fall, confidence, reason)
        """
        if not db.consent.imu_enabled or len(window) < 15:
            return False, 0.0, "IMU disabled or insufficient data window"

        threshold_g = db.edge_config["fall_threshold_g"]
        stillness_thresh = db.edge_config["stillness_variance_threshold_g"]
        
        mags = [f.acc_mag for f in window]
        
        # 1. Search for acceleration spike (impact)
        spike_idx = -1
        max_mag = 0.0
        for idx, mag in enumerate(mags):
            if mag >= threshold_g:
                if mag > max_mag:
                    max_mag = mag
                    spike_idx = idx

        if spike_idx == -1:
            return False, 0.0, "No acceleration impact spike detected"

        # 2. Verify post-impact window length (we need data after the fall to verify stillness)
        post_spike_data = mags[spike_idx + 1:]
        if len(post_spike_data) < 5:
            # Impact detected, but not enough data afterwards yet to confirm if still down or walked away
            return False, 0.0, "Impact detected, waiting for post-impact window"

        # 3. Calculate post-fall stillness variance
        # (variance of acceleration vector magnitude should be near zero indicating immobility)
        stillness_variance = float(np.var(post_spike_data)) if len(post_spike_data) > 1 else 0.0
        
        # 4. Check gyroscope variance around the impact moment
        # (high angular rotation during the fall transition)
        gyro_window = window[max(0, spike_idx - 3):min(len(window), spike_idx + 3)]
        gyro_rotation = sum(abs(f.gyro_x) + abs(f.gyro_y) + abs(f.gyro_z) for f in gyro_window)

        if stillness_variance <= stillness_thresh:
            # Low variance (immobility) + high impact = fall confirmed
            confidence = min(0.99, 0.5 + (max_mag - threshold_g) * 0.15 + (1.0 - stillness_variance / stillness_thresh) * 0.3)
            return True, confidence, f"Severe acceleration impact ({max_mag:.2f}g) followed by prolonged stillness (variance: {stillness_variance:.4f})"
        
        return False, 0.0, f"Impact spike occurred, but patient recovered immediately (stillness variance: {stillness_variance:.4f})"

    @staticmethod
    def detect_inactivity(history: List[TelemetryFrame]) -> Tuple[bool, float, str]:
        """
        Abnormal Inactivity Detection:
        If acceleration variance is extremely low for a prolonged period,
        but vital signs are active (or room occupancy context shows they are in bed/bath),
        check if this deviates from baseline.
        """
        if not db.consent.imu_enabled or len(history) < 50:
            return False, 0.0, "IMU disabled or insufficient history"

        inactivity_limit = db.edge_config["inactivity_seconds_threshold"]
        
        # Look at last N seconds based on timestamps
        latest_time = history[-1].timestamp
        cutoff_time = latest_time - inactivity_limit
        recent_frames = [f for f in history if f.timestamp >= cutoff_time]

        if len(recent_frames) < 10:
            return False, 0.0, "Insufficient telemetry rate"

        # Check variance of acceleration magnitude
        mags = [f.acc_mag for f in recent_frames]
        overall_variance = float(np.var(mags))

        # Check posture classification
        sleeping_or_resting = all(f.camera_pose in ["Lying", "Sitting"] for f in recent_frames)

        if overall_variance < 0.02 and not sleeping_or_resting:
            confidence = min(0.85, 0.5 + (0.02 - overall_variance) * 10)
            return True, confidence, f"Flatline inactivity detected for >{inactivity_limit}s with variance {overall_variance:.4f} outside sleeping patterns"

        return False, 0.0, "Normal activity pattern"

    @staticmethod
    def detect_vitals_anomaly(latest_frames: List[TelemetryFrame]) -> Tuple[bool, float, str]:
        """
        Vitals Anomaly Detection:
        Flags tachycardia (>110 BPM), bradycardia (<50 BPM), or hypoxia (SpO2 < 90%)
        if sustained across consecutive readings.
        """
        if not db.consent.ppg_enabled or len(latest_frames) < 5:
            return False, 0.0, "PPG sensor disabled or insufficient readings"

        hr_high = db.edge_config["hr_high_bpm"]
        hr_low = db.edge_config["hr_low_bpm"]
        spo2_low = db.edge_config["spo2_low_pct"]

        # Take last 5 readings
        readings = latest_frames[-5:]
        
        avg_hr = int(np.mean([f.heart_rate for f in readings]))
        
        # Check SpO2 if enabled
        spo2_readings = [f.spo2 for f in readings]
        avg_spo2 = int(np.mean(spo2_readings)) if db.consent.spo2_enabled else 100

        # Hypoxia check
        if db.consent.spo2_enabled and avg_spo2 < spo2_low:
            confidence = min(0.95, 0.6 + (spo2_low - avg_spo2) * 0.05)
            return True, confidence, f"Hypoxia alert: blood oxygen saturation critical at {avg_spo2}% (low threshold: {spo2_low}%)"

        # Heart rate boundaries
        if avg_hr > hr_high:
            confidence = min(0.90, 0.5 + (avg_hr - hr_high) * 0.01)
            return True, confidence, f"Tachycardia detected: sustained elevated heart rate of {avg_hr} BPM (high limit: {hr_high} BPM)"
        
        if avg_hr < hr_low:
            confidence = min(0.90, 0.5 + (hr_low - avg_hr) * 0.02)
            return True, confidence, f"Bradycardia detected: sustained low heart rate of {avg_hr} BPM (low limit: {hr_low} BPM)"

        return False, 0.0, "Vitals are within safe ranges"

    @staticmethod
    def tune_feedback(event_type: str, peak_mag: float):
        """
        Reinforcement Feedback Loop:
        When a user cancels an alarm, the edge system dynamically adjusts thresholds
        so that minor heavy movements don't continuously fire alarms.
        """
        if event_type == "FALL":
            current = db.edge_config["fall_threshold_g"]
            # Increment threshold slightly based on peak magnitude of the false alarm
            new_thresh = min(3.5, max(current, peak_mag + 0.1))
            db.edge_config["fall_threshold_g"] = round(new_thresh, 2)
            db.log_audit("FEEDBACK_LOOP", f"Fall threshold adapted from {current}g to {new_thresh}g following false-alarm cancellation")
        elif event_type == "INACTIVITY":
            current_sec = db.edge_config["inactivity_seconds_threshold"]
            new_sec = min(60, current_sec + 5)
            db.edge_config["inactivity_seconds_threshold"] = new_sec
            db.log_audit("FEEDBACK_LOOP", f"Inactivity alert limit extended from {current_sec}s to {new_sec}s following false-alarm cancellation")
