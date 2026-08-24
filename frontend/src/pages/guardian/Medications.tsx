import React, { useState, useEffect } from 'react';
import { Pill, Info } from 'lucide-react';

export default function Medications() {
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const res = await fetch("/api/guardian/patients/P001/medications");
        if (res.ok) {
          const data = await res.json();
          setMeds(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMeds();
  }, []);

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Pill className="w-5 h-5 text-indigo-400" />
            Medication Adherence overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Monitor today's medications logs and dosage confirmations.</p>
        </div>
      </div>

      <div className="max-w-xl space-y-4">
        {loading ? (
          <div className="text-center py-6"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : meds.length === 0 ? (
          <p className="text-slate-500 font-mono text-xs">Medication list unavailable or not authorized under patient scope settings.</p>
        ) : (
          <div className="space-y-3">
            {meds.map((m, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-4.5 rounded-3xl shadow-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block text-sm">{m.medicine}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Time: {m.time}</span>
                </div>
                <span className={`font-mono text-[9px] font-black px-2.5 py-0.5 rounded border ${
                  m.status === 'taken' 
                    ? 'bg-emerald-950/40 text-emerald-450 border-emerald-900/60' 
                    : 'bg-slate-950 text-slate-500 border-slate-850'
                }`}>
                  {m.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-3xl flex gap-3 items-start text-xs text-indigo-400 select-none max-w-xl leading-relaxed">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block uppercase tracking-wider text-[10px] font-bold mb-1 font-mono">Medication Safety policy</strong>
          Family guardians cannot adjust, override, or stop clinical prescriptions. All modification tasks must be directed strictly to the assigned doctor.
        </div>
      </div>

    </div>
  );
}
