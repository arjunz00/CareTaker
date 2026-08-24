import { useState, useEffect } from 'react';

export interface RiskState {
  score: number;
  forecast15: number;
  forecast30: number;
  trend: 'stable' | 'increasing' | 'decreasing';
  reasons: string[];
  lastUpdated: string;
}

export function useRisk() {
  const [risk, setRisk] = useState<RiskState>({
    score: 12,
    forecast15: 14,
    forecast30: 16,
    trend: 'stable',
    reasons: ["Resting posture aligned with normal profile", "Vitals baseline stabilized"],
    lastUpdated: "Just now"
  });

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/telemetry`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          let trend: 'stable' | 'increasing' | 'decreasing' = 'stable';
          if (payload.forecast_score > payload.risk_score + 5) {
            trend = 'increasing';
          } else if (payload.forecast_score < payload.risk_score - 5) {
            trend = 'decreasing';
          }

          setRisk({
            score: payload.risk_score,
            forecast15: Math.round(payload.risk_score * 1.1),
            forecast30: payload.forecast_score,
            trend,
            reasons: payload.analysis.reasons.length > 0 ? payload.analysis.reasons : ["Vitals stable", "No anomalies identified in edge window"],
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
        } catch (e) {
          console.error("Error reading WebSocket risk:", e);
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
  }, []);

  return risk;
}
