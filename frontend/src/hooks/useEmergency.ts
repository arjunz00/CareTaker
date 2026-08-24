import { useState, useEffect } from 'react';

export interface EmergencyEvent {
  id: string;
  timestamp: number;
  type: string;
  risk_score: number;
  assigned_volunteer_id?: string;
  status: string; // "PENDING", "RESPONDING", "RESOLVED", "ESCALATED"
  resolved_at?: number;
}

export interface CareVolunteer {
  id: string;
  name: string;
  phone: string;
  college: string;
  status: string;
  hours_logged: number;
  credits: number;
  distance?: number;
  eta?: string;
}

export function useEmergency() {
  const [activeEmergency, setActiveEmergency] = useState<EmergencyEvent | null>(null);
  const [volunteer, setVolunteer] = useState<CareVolunteer | null>(null);
  const [history, setHistory] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerSOS = async () => {
    try {
      const res = await fetch("/api/sos", { method: "POST" });
      if (res.ok) {
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cancelEmergency = async () => {
    try {
      const res = await fetch("/api/cancel", { method: "POST" });
      if (res.ok) {
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resolveEmergency = async () => {
    try {
      const res = await fetch("/api/resolve", { method: "POST" });
      if (res.ok) {
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
    
    // Subscribe to WebSocket alerts
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/telemetry`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      ws = new WebSocket(wsUrl);
      ws.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data);
          const state = payload.state;
          
          if (state.state !== "NORMAL") {
            setActiveEmergency({
              id: state.active_event_id,
              timestamp: Date.now() / 1000 - state.elapsed_seconds,
              type: state.state === "WARNING_COUNTDOWN" ? "Possible Fall Alarm" : "Confirmed Emergency Alert",
              risk_score: payload.risk_score,
              status: state.state
            });

            // Fetch volunteer information if assigned
            if (state.active_event_id) {
              const vRes = await fetch("/api/volunteers");
              if (vRes.ok) {
                const volunteers = await vRes.json();
                // Filter the active responder
                const responder = volunteers.find((v: any) => v.status === "RESPONDING");
                if (responder) {
                  setVolunteer({
                    id: responder.id,
                    name: responder.name,
                    phone: "+91 99887 76655", // mock secure phone
                    college: responder.college,
                    status: responder.status,
                    hours_logged: responder.hours_logged,
                    credits: responder.credits,
                    distance: 1.2,
                    eta: "6 mins"
                  });
                } else {
                  setVolunteer(null);
                }
              }
            }
          } else {
            setActiveEmergency(null);
            setVolunteer(null);
          }
        } catch (e) {
          console.error("Error reading WebSocket emergency status:", e);
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

  return {
    activeEmergency,
    volunteer,
    history,
    loading,
    triggerSOS,
    cancelEmergency,
    resolveEmergency,
    refetchHistory: fetchHistory
  };
}
