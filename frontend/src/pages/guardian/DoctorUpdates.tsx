import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function DoctorUpdates() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch("/api/guardian/patients/P001/doctor-updates");
        if (res.ok) {
          const data = await res.json();
          setUpdates(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Clinician Doctor Updates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Review patient-visible clinical instructions and follow-up updates.</p>
        </div>
      </div>

      <div className="max-w-xl space-y-4">
        {loading ? (
          <div className="text-center py-6"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : updates.length === 0 ? (
          <p className="text-slate-500 font-mono text-xs">No clinician updates logged for this family member.</p>
        ) : (
          updates.map((u, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-3 text-xs leading-normal select-none">
              <div className="flex justify-between text-[10px] text-slate-550 border-b border-slate-850 pb-2 font-mono">
                <span>Clinician: {u.doctor}</span>
                <span>Date: {u.date}</span>
              </div>
              <p className="text-slate-300 italic">"{u.notes}"</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
