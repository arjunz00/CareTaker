import React from 'react';
import HealthAssistant from '../../components/HealthAssistant';
import { MessageSquare, ShieldAlert } from 'lucide-react';

export default function Assistant() {
  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Guardian AI Care Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Query family member physiological metrics summaries and check connection statuses via Voice & RAG.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Chat window (8 cols) */}
        <div className="lg:col-span-8">
          <HealthAssistant
            role="guardian"
            title="AegisNet Guardian Safety Assistant"
          />
        </div>

        {/* Sidebar warning card (4 cols) */}
        <div className="lg:col-span-4 space-y-6 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs text-slate-400 leading-relaxed font-sans">
            <span className="text-xs font-bold text-slate-400 uppercase block border-b border-slate-850 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
              AI Assistant Disclaimer
            </span>
            <p>
              AI Care Assistant summaries verify baseline family metrics, display caregiver protocols, and outline sync issues.
            </p>
            <p>
              It <strong>does not</strong> formulate clinical diagnoses or alter patient medications.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
