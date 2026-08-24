import { useState, useEffect } from 'react';

export interface DoctorNote {
  id: string;
  patient_id: string;
  doctor_name: string;
  date: string;
  patient_visible: string;
  private_note: string;
  timestamp: number;
}

export function useDoctorNotes(patientId: string) {
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctor/notes/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (patientVisible: string, privateNote: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/doctor/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          patient_visible: patientVisible,
          private_note: privateNote
        })
      });
      if (res.ok) {
        fetchNotes();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  useEffect(() => {
    if (patientId) fetchNotes();
  }, [patientId]);

  return {
    notes,
    loading,
    addNote,
    refetch: fetchNotes
  };
}
