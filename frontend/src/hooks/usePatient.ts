import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

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
  avatar?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  hospital?: string;
}

export function usePatient() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getEmail = useCallback(() => {
    return session?.email || "savita.sharma@gmail.com";
  }, [session]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const email = getEmail();
      const res = await fetch(`/api/patient/profile?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Failed to load patient profile.");
      const data = await res.json();
      
      const loadedProfile: PatientProfileData = {
        ...data.profile,
        // Prioritize authenticated session name & email if logged in via Google/Email
        name: session?.name && session.name !== "User" ? session.name : (data.profile?.name || "Patient User"),
        email: session?.email || data.profile?.email || email,
        phone: session?.phone || data.profile?.phone || "+91 98765 43210",
        avatar: session?.photoURL || undefined
      };

      setProfile(loadedProfile);
      setContacts(data.contacts || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [getEmail, session]);

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
  }, [fetchProfile]);

  return {
    profile,
    contacts,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile
  };
}
