import { useState, useEffect } from 'react';

export interface ClinicAppointment {
  id: string;
  patient_id: string;
  patient_name: string;
  time: string;
  reason: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctor/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/doctor/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" })
      });
      if (res.ok) {
        setAppointments(prev => 
          prev.map(a => a.id === id ? { ...a, status: 'Completed' } : a)
        );
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    markCompleted,
    refetch: fetchAppointments
  };
}
