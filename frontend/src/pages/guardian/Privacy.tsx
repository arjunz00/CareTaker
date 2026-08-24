import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Privacy & Permissions Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Verify patient-authorized health scopes and privacy topologies.</p>
        </div>
      </div>

      <div className="max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 select-none text-xs leading-normal">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-2.5 font-mono">My Access permissions scopes</span>
        <div className="space-y-3 font-mono text-[11px] text-slate-350">
          <div className="flex justify-between py-1.5 border-b border-slate-850">
            <span>Physiological Health Summary:</span> <span className="text-emerald-450 font-bold">✓ Authorized</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-850">
            <span>GPS Locator coordinates:</span> <span className="text-indigo-405 font-bold">Emergency Only</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-850">
            <span>Clinician Prescriptions lists:</span> <span className="text-emerald-450 font-bold">✓ Authorized</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-850">
            <span>Doctor Private Notes:</span> <span className="text-rose-500 font-bold">✕ Access Blocked</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Privacy Edge Camera poses:</span> <span className="text-rose-500 font-bold">✕ Opted Out</span>
          </div>
        </div>
      </div>

    </div>
  );
}
