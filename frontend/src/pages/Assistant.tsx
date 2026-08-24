import React from 'react';
import HealthAssistant from '../components/HealthAssistant';
import { useVitals } from '../hooks/useVitals';
import { usePrescriptions } from '../hooks/usePrescriptions';
import { useRisk } from '../hooks/useRisk';
import { MessageSquare, ShieldAlert } from 'lucide-react';

export default function Assistant() {
  const { vitals } = useVitals();
  const { prescriptions } = usePrescriptions();
  const risk = useRisk();

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            AI Health Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Query questions about prescriptions, explaining vitals ranges, or wellness trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chat window (8 cols) */}
        <div className="lg:col-span-8">
          <HealthAssistant 
            currentVitals={vitals}
            prescriptions={prescriptions}
            riskScore={risk.score}
          />
        </div>

        {/* Sidebar help (4 cols) */}
        <div className="lg:col-span-4 space-y-6 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
              Chat Assistant boundaries
            </span>
            <div className="space-y-2.5 text-slate-400 leading-relaxed font-sans">
              <p>
                <strong>✓ Biometrics Guidance:</strong> AI parses your MAX30102 PPG pulse metrics and alerts you to general threshold warnings.
              </p>
              <p>
                <strong>✓ Prescription Guides:</strong> Explains clinical medicine uses and schedules.
              </p>
              <p>
                <strong>⚠️ Diagnosis Blockade:</strong> AI does not diagnose illnesses. Severe symptom queries trigger emergency warnings automatically.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
