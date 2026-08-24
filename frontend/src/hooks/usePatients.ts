import { useState, useEffect } from 'react';

export interface PatientListItem {
  id: string;
  email: string;
  profile: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    conditions: string;
    mobility_status: string;
    height?: number;
    weight?: number;
    bmi?: number;
    blood_group?: string;
    allergies?: string;
    medications?: string;
  };
  device_id: string;
  risk_score: number;
  status: 'Stable' | 'Monitor' | 'Critical';
  vitals: {
    heartRate: number;
    spo2: number;
    temperature: number;
    activity: string;
    radarHeartRate?: number;
    radarRespiration?: number;
  };
}

export function usePatients() {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/doctor/patients");
      if (!res.ok) throw new Error("Failed to load patient records.");
      const data = await res.json();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || "Failed to load patient records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients
  };
}
