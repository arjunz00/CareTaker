import { useState, useEffect } from 'react';

export interface VitalsState {
  heartRate: number;
  spo2: number;
  temperature: number;
  activity: string;
  respirationRate: number;
  radarHeartRate: number;
  radarRespiration: number;
  lastUpdated: string;
  isOnline: boolean;
}

export interface VitalHistoryPoint {
  time: string;
  hr: number;
  spo2: number;
  temp: number;
}

export function useVitals() {
  const [vitals, setVitals] = useState<VitalsState>({
    heartRate: 75,
    spo2: 98,
    temperature: 36.6,
    activity: "Resting",
    respirationRate: 16,
    radarHeartRate: 74,
    radarRespiration: 16,
    lastUpdated: "Just now",
    isOnline: false
  });

  const [history, setHistory] = useState<VitalHistoryPoint[]>([]);

  useEffect(() => {
    // Bootstrap historical queue with baseline points
    const baseHistory: VitalHistoryPoint[] = [];
    const now = Date.now();
    for (let i = 20; i > 0; i--) {
      const t = new Date(now - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      baseHistory.push({
        time: t,
        hr: 70 + Math.floor(Math.random() * 8),
        spo2: 97 + Math.floor(Math.random() * 3),
        temp: 36.5 + (Math.random() * 0.3)
      });
    }
    setHistory(baseHistory);

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/telemetry`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setVitals(v => ({ ...v, isOnline: true }));
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const t = payload.latest;
          const consent = payload.consent;
          
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          setVitals({
            heartRate: consent.ppg_enabled ? t.heart_rate : 0,
            spo2: consent.spo2_enabled ? t.spo2 : 0,
            temperature: t.body_temp,
            activity: t.camera_pose || "Resting",
            respirationRate: 16 + (t.heart_rate % 3), // derived mock respiration
            radarHeartRate: consent.radar ? t.heart_rate - 1 : 0,
            radarRespiration: consent.radar ? 16 + (t.heart_rate % 3) : 0,
            lastUpdated: timeString,
            isOnline: true
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
          console.error("Error reading WebSocket vitals:", e);
        }
      };

      ws.onclose = () => {
        setVitals(v => ({ ...v, isOnline: false }));
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("Vitals WS error:", err);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  return { vitals, history };
}
