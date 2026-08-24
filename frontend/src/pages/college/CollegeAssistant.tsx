import React from 'react';
import HealthAssistant from '../../components/HealthAssistant';
import { ShieldAlert, Building2 } from 'lucide-react';

export default function CollegeAssistant() {
  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Campus Health RAG Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Query student health policy, dorm telemetry aggregation guides, and campus dispatch procedures via Voice & RAG.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Chat Area (8 cols) */}
        <div className="lg:col-span-8">
          <HealthAssistant
            role="college"
            title="AegisNet Campus Health RAG Assistant"
          />
        </div>

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs text-slate-400 leading-relaxed font-sans">
            <span className="text-xs font-bold text-slate-400 uppercase block border-b border-slate-850 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
              Institutional Privacy Policy
            </span>
            <p>
              Campus administration views anonymized, aggregate student health telemetry only.
            </p>
            <p>
              Direct student health records are restricted unless an emergency SOS dispatch is triggered inside university dormitories.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
