import React from 'react';
import DoctorCard from '../components/DoctorCard';
import { Stethoscope, ShieldCheck } from 'lucide-react';

export default function Doctor() {
  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-indigo-400" />
            My Primary Physician
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">View doctor details, consultation records, and schedule follow-ups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Doctor Card */}
        <DoctorCard />

        {/* Doctor Info card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl select-none flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
              Doctor Authorization Status
            </h4>
            
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Active authorization:</span>
                <span className="text-emerald-400 font-bold">AUTHORIZED</span>
              </div>
              <div className="flex justify-between">
                <span>Authorized scopes:</span>
                <span className="text-slate-400">Vitals telemetry, medical baselines</span>
              </div>
              <div className="flex justify-between border-t border-slate-850 pt-2.5">
                <span>Encryption format:</span>
                <span className="text-slate-400 font-mono">End-to-End Encrypted</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-[10px] text-slate-500 leading-normal mt-4">
            <strong>Access Consent Policy:</strong> Clinical sharing is bound by privacy controls. You can revoke Dr. Swamy's dashboard access ledger at any time inside the **Privacy Center** page.
          </div>
        </div>

      </div>

    </div>
  );
}
