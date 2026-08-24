import React from 'react';
import HealthAssistant from '../../components/HealthAssistant';
import { ShieldAlert, LifeBuoy } from 'lucide-react';

export default function VolunteerAssistant() {
  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-indigo-400" />
            First Responder RAG Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Query CPR/First-Aid protocols, scene navigation instructions, and Proof of Care logging via Voice & RAG.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Chat Area (8 cols) */}
        <div className="lg:col-span-8">
          <HealthAssistant
            role="volunteer"
            title="AegisNet First Responder RAG Assistant"
          />
        </div>

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs text-slate-400 leading-relaxed font-sans">
            <span className="text-xs font-bold text-slate-400 uppercase block border-b border-slate-850 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
              Responder Guidelines
            </span>
            <p>
              Always prioritize your personal safety before approaching an unverified incident scene.
            </p>
            <p>
              Log your Proof of Care arrival by scanning the patient's verified QR code or transferring custody to arriving emergency paramedics.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
