import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { usePrivacy } from '../hooks/usePrivacy';
import PrivacyPanel from '../components/PrivacyPanel';

export default function Privacy() {
  const { privacy, loading, savePrivacy } = usePrivacy();

  const handleUpdate = (key: any, value: boolean) => {
    savePrivacy({ ...privacy, [key]: value });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Privacy Center & Consent Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Manage GDPR / DPDP (2023) consent toggles and check Edge Video flows.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Privacy Panel Grid (8 cols) */}
        <div className="lg:col-span-8">
          <PrivacyPanel 
            settings={privacy} 
            onUpdate={handleUpdate} 
          />
        </div>

        {/* Informational Sidebar (4 cols) */}
        <div className="lg:col-span-4 select-none space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs text-slate-400 leading-relaxed font-sans">
            <span className="text-xs font-bold text-slate-400 uppercase block border-b border-slate-850 pb-2 flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-indigo-400" />
              Consent Audit Ledger
            </span>
            <p>
              AegisNet operates a strict **consent-ledger**. Every change to your sharing configurations is cryptographically logged in the Edge gateway's local registry.
            </p>
            <p>
              No high-frequency accelerometer waves or camera frames are uploaded to external cloud storage. Telemetry is evaluated strictly locally and auto-purged on rolling 90-second cycles.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
