import { useState, useEffect } from 'react';

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: 'Stable' | 'Monitor' | 'Critical';
  risk_score: number;
  device_status: 'Connected' | 'Offline';
  last_update: string;
}

export function useFamily() {
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFamily = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/guardian/family");
      if (!res.ok) throw new Error("Failed to load family members.");
      const data = await res.json();
      setFamily(data);
    } catch (err: any) {
      setError(err.message || "Failed to load family members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();

    // Subscribe to live updates via WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/telemetry`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          // Rajesh Kumar (P002) is the main emulator patient
          // Dynamically update the state of Rajesh Kumar if payload is broadcasted
          setFamily(prev => prev.map(member => {
            if (member.id === "P002") {
              const status = payload.state.state !== "NORMAL" ? "Critical" : payload.risk_score > 40 ? "Monitor" : "Stable";
              return {
                ...member,
                risk_score: payload.risk_score,
                status: status,
                device_status: payload.consent.ppg_enabled ? "Connected" : "Offline",
                last_update: "Just now"
              };
            }
            return member;
          }));
        } catch (e) {
          console.error(e);
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
    family,
    loading,
    error,
    refetch: fetchFamily
  };
}
