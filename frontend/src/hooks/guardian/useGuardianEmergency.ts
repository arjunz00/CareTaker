import { useState } from 'react';

export function useGuardianEmergency() {
  const [submitting, setSubmitting] = useState(false);

  const reportEmergency = async (patientId: string, type: string, message: string): Promise<boolean> => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/guardian/emergency/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          emergency_type: type,
          message
        })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const acknowledgeEmergency = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/guardian/emergency/${id}/acknowledge`, { method: "POST" });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return {
    submitting,
    reportEmergency,
    acknowledgeEmergency
  };
}
