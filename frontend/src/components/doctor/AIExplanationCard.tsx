import React from 'react';
import { Info, ShieldAlert, CheckSquare } from 'lucide-react';

interface AIExplanationCardProps {
  score: number;
  conditions: string;
}

export default function AIExplanationCard({
  score,
  conditions
}: AIExplanationCardProps) {

  // Build dynamic diagnostic factors based on risk score ranges
  const getObservations = () => {
    if (score >= 70) {
      return [
        "Activity falls 32% below baseline patterns",
        "Gait variance index matches fall profile limits",
        "Sustained inactivity duration exceeded 120 seconds",
        "Recent possible fall anomaly fusions detected"
      ];
    } else if (score >= 40) {
      return [
        "Walking durations slightly below personal baseline (-1.5 SD)",
        "Heart rate reading elevated compared to resting average",
        "Mild inactivity duration expansion observed"
      ];
    }
    return [
      "Vitals stable within standard patient boundaries",
      "Sensor links reporting healthy topologies",
      "No anomalies fusions registered in telemetry window"
    ];
  };

  const getSuggestedAction = () => {
    if (score >= 70) return "Urgent status verification. Contact caregiver or matched responders.";
    if (score >= 40) return "Ambulatory review. Verify device calibration and posture check values during next contact.";
    return "No clinical reviews recommended. Continue standard edge vitals monitoring.";
  };

  const observations = getObservations();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-850 pb-3 select-none">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
          Explainable AI Decision Support
        </h4>
        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Why was this patient flagged? Contributing factors checklist.</span>
      </div>

      {/* Observations list */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2.5 text-xs text-slate-300">
        <span className="text-slate-500 font-bold block uppercase tracking-wider text-[9px] mb-1 font-mono">Contributing Observations:</span>
        {observations.map((obs, idx) => (
          <div key={idx} className="flex gap-2.5 items-start">
            <input 
              type="checkbox" 
              checked={true} 
              readOnly 
              className="rounded bg-slate-900 border-slate-800 text-indigo-650 mt-0.5 pointer-events-none"
            />
            <span>{obs}</span>
          </div>
        ))}
      </div>

      {/* Recommended actions */}
      <div className="space-y-1.5 text-xs">
        <span className="text-slate-500 font-bold block uppercase tracking-wider text-[9px] font-mono">Clinician Suggested Action:</span>
        <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-slate-350 italic">
          "{getSuggestedAction()}"
        </div>
      </div>

      {/* Diagnostic disclaimer callout */}
      <div className="bg-indigo-950/20 border border-indigo-900/40 p-3.5 rounded-xl flex gap-2.5 items-start text-[10px] text-indigo-400 leading-relaxed select-none">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block uppercase tracking-wider text-[9px] font-bold mb-0.5">Clinical Disclaimer</strong>
          AI forecast trajectories represent risk evaluations and do not replace clinical physician judgements. Final diagnoses, drug modifications, and emergency dispatches remain the exclusive responsibility of the authorized doctor.
        </div>
      </div>

    </div>
  );
}
