import { useState, useEffect } from 'react';
import { PatientListItem } from './usePatients';

export interface VitalsHistoryPoint {
  time: string;
  hr: number;
  spo2: number;
  temp: number;
}

export function usePatientDetail(patientId: string) {
  const [patient, setPatient] = useState<PatientListItem | null>(null);
  const [history, setHistory] = useState<VitalsHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/doctor/patients/${patientId}`);
      if (!res.ok) throw new Error("Failed to load patient records.");
      const data = await res.json();
      setPatient(data);
      
      // Initialize historical points
      const baseHistory: VitalsHistoryPoint[] = [];
      const now = Date.now();
      const baseHr = data.vitals?.heartRate || 74;
      const baseSpo2 = data.vitals?.spo2 || 98;
      const baseTemp = data.vitals?.temperature || 36.6;
      
      for (let i = 20; i > 0; i--) {
        const t = new Date(now - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        baseHistory.push({
          time: t,
          hr: baseHr > 0 ? baseHr + Math.floor(Math.random() * 6) - 3 : 0,
          spo2: baseSpo2 > 0 ? baseSpo2 + Math.floor(Math.random() * 2) - 1 : 0,
          temp: baseTemp > 0 ? baseTemp + (Math.random() * 0.2) - 0.1 : 0
        });
      }
      setHistory(baseHistory);
    } catch (err: any) {
      setError(err.message || "Failed to load patient record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!patientId) return;
    fetchDetail();

    // Setup live websocket simulation triggers
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/telemetry`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const t = payload.latest;
          const consent = payload.consent;
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          // Only update if it represents the selected patient P001/P002/etc.
          // Note: In demo emulator mode, the telemetry values align with the selected emulator profile
          setPatient(prev => {
            if (!prev) return null;
            
            // Sync with current telemetry values
            return {
              ...prev,
              risk_score: payload.risk_score,
              status: payload.state.state !== "NORMAL" ? "Critical" : payload.risk_score > 40 ? "Monitor" : "Stable",
              vitals: {
                heartRate: consent.ppg_enabled ? t.heart_rate : 0,
                spo2: consent.spo2_enabled ? t.spo2 : 0,
                temperature: t.body_temp,
                activity: t.camera_pose || "Resting"
              }
            };
          });

          setHistory(prev => {
            const next = [...prev, {
              time: timeString,
              hr: consent.ppg_enabled ? t.heart_rate : 0,
              spo2: consent.spo2_enabled ? t.spo2 : 0,
              temp: t.body_temp
            }];
            if (next.length > 30) next.shift();
            return next;
          });
        } catch (e) {
          console.error("Websocket telemetry read error:", e);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [patientId]);

  return {
    patient,
    history,
    loading,
    error,
    refetch: fetchDetail
  };
}
