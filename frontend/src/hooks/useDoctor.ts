import { useState, useEffect } from 'react';

export interface DoctorProfile {
  name: string;
  specialization: string;
  hospital: string;
  contact: string;
  email: string;
  availability: string;
}

export function useDoctor() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSession = () => {
    const sessionStr = localStorage.getItem("aegis_session");
    if (sessionStr) {
      try {
        const s = JSON.parse(sessionStr);
        if (s.authenticated && s.role === 'doctor') {
          return s;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/doctor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Authentication failed.");
      }
      const data = await res.json();
      localStorage.setItem("aegis_session", JSON.stringify(data.session));
      setProfile(data.profile);
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("aegis_session");
    setProfile(null);
  };

  useEffect(() => {
    const session = getSession();
    if (session) {
      // Pull profile dynamically
      setProfile({
        name: "Dr. Arvind Swamy",
        specialization: "Cardiology / Vascular Medicine",
        hospital: "Narayana Health Clinic, Navi Mumbai",
        contact: "+91 91234 56789",
        email: session.email,
        availability: "Mon-Fri (09:00 - 13:00)"
      });
    }
    setLoading(false);
  }, []);

  return {
    profile,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!profile
  };
}
