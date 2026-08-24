import { useState, useEffect } from 'react';
import { PrivacySettings } from '../components/PrivacyPanel';

export function usePrivacy() {
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    health_data: true,
    location: true,
    radar: true,
    camera: true,
    doctor_access: true,
    guardian_access: true,
    volunteer_access: true
  });
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

  const fetchPrivacy = async () => {
    try {
      const email = getEmail();
      const res = await fetch(`/api/patient/privacy?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setPrivacy(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const savePrivacy = async (updatedSettings: PrivacySettings) => {
    try {
      const email = getEmail();
      const res = await fetch(`/api/patient/privacy?email=${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        setPrivacy(updatedSettings);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  useEffect(() => {
    fetchPrivacy();
  }, []);

  return {
    privacy,
    loading,
    savePrivacy,
    refetch: fetchPrivacy
  };
}
export type { PrivacySettings };
