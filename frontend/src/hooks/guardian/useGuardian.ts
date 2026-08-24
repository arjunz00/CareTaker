import { useState, useEffect } from 'react';

export interface GuardianProfile {
  name: string;
  email: string;
  phone: string;
  relations: string[];
}

export function useGuardian() {
  const [profile, setProfile] = useState<GuardianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSession = () => {
    const sessionStr = localStorage.getItem("aegis_session");
    if (sessionStr) {
      try {
        const s = JSON.parse(sessionStr);
        if (s.authenticated && s.role === 'guardian') {
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
      const res = await fetch("/api/guardian/login", {
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
      setProfile({
        name: "Rahul Sharma",
        email: session.email,
        phone: "+91 99887 76655",
        relations: ["P001", "P002", "P003"]
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
