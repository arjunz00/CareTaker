import { useCallback, useEffect, useState } from 'react';

export type VolunteerProfile = { id: string; name: string; college: string; program: string; status: string; skills: string[]; hours: number; credits: number; rating: number; verification: { status: string; id: string } };
export type Mission = { id: string; event_id: string; event_type: string; distance_km: number; eta_minutes: number; risk_score: number; risk_level: string; patient_label: string; patient_response: string; doctor_notified: boolean; guardian_notified: boolean; status: string; location_available: boolean; evidence: string[] };

export function useVolunteer() {
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [nearby, setNearby] = useState<Mission[]>([]);
  const [assignments, setAssignments] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const [profileRes, nearbyRes, assignmentRes] = await Promise.all([fetch('/api/volunteer/profile'), fetch('/api/volunteer/emergencies/nearby'), fetch('/api/volunteer/assignments')]);
      if (profileRes.ok) setProfile(await profileRes.json());
      if (nearbyRes.ok) setNearby(await nearbyRes.json());
      if (assignmentRes.ok) setAssignments(await assignmentRes.json());
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws/telemetry`);
    ws.onmessage = () => refresh();
    return () => ws.close();
  }, [refresh]);
  const setStatus = async (status: string) => { const res = await fetch('/api/volunteer/status', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({status}) }); if (res.ok) refresh(); };
  return { profile, nearby, assignments, loading, refresh, setStatus };
}
