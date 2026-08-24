import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface SafetyStatusCardProps {
  status: 'Stable' | 'Monitor' | 'Critical';
  riskScore: number;
}

export default function SafetyStatusCard({
  status,
  riskScore
}: SafetyStatusCardProps) {

  const getStatusDetails = () => {
    if (status === 'Critical') {
      return {
        label: "🔴 ACTIVE EMERGENCY ALARM",
        color: "border-rose-500 bg-rose-950/20 text-rose-450",
        icon: ShieldAlert,
        summary: "Emergency signals correlated. Possible fall or inactivity detected."
      };
    } else if (status === 'Monitor') {
      return {
        label: "🟡 ATTENTION REQUIRED",
        color: "border-amber-500 bg-amber-950/20 text-amber-450",
        icon: Shield,
        summary: "Physiological baseline variance flags detected. Activity is lower than baseline."
      };
    }
    return {
      label: "🟢 SAFE",
      color: "border-emerald-500 bg-emerald-950/20 text-emerald-450",
      icon: ShieldCheck,
      summary: "Current activity and vital trends are within the patient's recent baseline."
    };
  };

  const details = getStatusDetails();
  const IconComponent = details.icon;

  return (
    <div className={`border-2 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 transition duration-200 select-none ${details.color}`}>
      
      <div className="flex items-center gap-4">
        <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
          <IconComponent className="w-8 h-8 shrink-0" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest block font-mono">Patient Safety Status</span>
          <span className="text-xl font-black block mt-0.5">{details.label}</span>
          <p className="text-xs text-slate-300 mt-1 font-sans font-medium leading-relaxed">{details.summary}</p>
        </div>
      </div>

      <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-center font-mono shrink-0 w-full md:w-36">
        <span className="text-[9px] text-slate-500 block uppercase">AI Risk Score</span>
        <span className="text-2xl font-black text-white mt-1 block">{riskScore} / 100</span>
      </div>

    </div>
  );
}
export type { SafetyStatusCardProps };
