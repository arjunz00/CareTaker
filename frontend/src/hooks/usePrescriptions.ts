import { useState, useEffect } from 'react';

export interface Prescription {
  id: string;
  doctor: string;
  date: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: string;
}

export interface AdherenceLog {
  time_slot: string;
  medicine: string;
  status: 'taken' | 'pending';
}

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [adherence, setAdherence] = useState<AdherenceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const getEmail = () => {
    const sessionStr = localStorage.getItem("aegis_session");
    if (sessionStr) {
      try {
        return JSON.parse(sessionStr).email;
      } catch (e) {
        return "savita.sharma@gmail.com";
      }
    }
    return "savita.sharma@gmail.com";
  };

  const fetchPrescriptions = async () => {
    try {
      const email = getEmail();
      const res = await fetch(`/api/patient/prescriptions?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data);
      }
      
      const adhRes = await fetch(`/api/patient/adherence?email=${encodeURIComponent(email)}`);
      if (adhRes.ok) {
        const logs = await adhRes.json();
        
        // Map database logs to AdherenceLog shape
        const mappedLogs: AdherenceLog[] = logs.map((l: any) => ({
          time_slot: l.time_slot,
          medicine: l.medicine,
          status: l.status
        }));
        setAdherence(mappedLogs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdherence = async (timeSlot: string, medicine: string, currentStatus: 'taken' | 'pending') => {
    const nextStatus = currentStatus === 'taken' ? 'pending' : 'taken';
    
    // Update local immediately for latency compensation
    setAdherence(prev => {
      const filtered = prev.filter(a => !(a.time_slot === timeSlot && a.medicine === medicine));
      return [...filtered, { time_slot: timeSlot, medicine, status: nextStatus }];
    });

    try {
      const email = getEmail();
      await fetch(`/api/patient/adherence?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time_slot: timeSlot,
          medicine: medicine,
          status: nextStatus
        })
      });
    } catch (e) {
      console.error("Failed to log adherence:", e);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return {
    prescriptions,
    adherence,
    loading,
    toggleAdherence,
    refetch: fetchPrescriptions
  };
}
