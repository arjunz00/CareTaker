import { useState, useEffect } from 'react';

export interface PatientProfileData {
  name: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergency_location: string;
  height?: number;
  weight?: number;
  bmi?: number;
  blood_group?: string;
  conditions?: string;
  allergies?: string;
  surgeries?: string;
  medications?: string;
  mobility_status?: string;
  fall_history?: string;
  lifestyle?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  hospital?: string;
}

export function usePatient() {
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = getEmail();
      const res = await fetch(`/api/patient/profile?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Failed to load patient profile.");
      const data = await res.json();
      setProfile(data.profile);
      setContacts(data.contacts || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedProfile: PatientProfileData) => {
    try {
      const email = getEmail();
      const res = await fetch(`/api/patient/profile?email=${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
      });
      if (!res.ok) throw new Error("Failed to update profile.");
      setProfile(updatedProfile);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    contacts,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile
  };
}
