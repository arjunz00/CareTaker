import React from 'react';
import { Phone, MapPin, User, ShieldAlert, Heart } from 'lucide-react';

interface EmergencyActionPanelProps {
  patientPhone: string;
  doctorPhone: string;
  volunteerPhone: string;
  onManualSOS?: () => void;
  isEmergency: boolean;
}

export default function EmergencyActionPanel({
  patientPhone,
  doctorPhone,
  volunteerPhone,
  onManualSOS,
  isEmergency
}: EmergencyActionPanelProps) {

  const triggerCall = (phone: string, label: string) => {
    alert(`[Demo Call Routing] Dialing ${label}: ${phone} via secure gateway links...`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition duration-200 select-none">
      
      {/* Header */}
      <div className="border-b border-slate-850 pb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Guardian Emergency Action Desk</span>
        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Access quick-call responders links and manual override commands.</span>
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 gap-3.5 text-xs text-center">
        
        <button
          onClick={() => triggerCall(patientPhone, "Patient")}
          className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 font-bold p-3 rounded-2xl transition flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <Phone className="w-4.5 h-4.5 text-indigo-400" />
          <span>Call Patient</span>
        </button>

        <button
          onClick={() => triggerCall(doctorPhone, "Clinician")}
          className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 font-bold p-3 rounded-2xl transition flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <User className="w-4.5 h-4.5 text-indigo-400" />
          <span>Contact Doctor</span>
        </button>

        <button
          onClick={() => triggerCall(volunteerPhone, "Responder")}
          disabled={!isEmergency}
          className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-350 font-bold p-3 rounded-2xl transition flex flex-col items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
        >
          <Heart className="w-4.5 h-4.5 text-indigo-400" />
          <span>Call Responder</span>
        </button>

        <button
          onClick={onManualSOS}
          className="bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/60 text-rose-400 font-black p-3 rounded-2xl transition flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
          <span>Trigger Emergency</span>
        </button>

      </div>

    </div>
  );
}
export type { EmergencyActionPanelProps };
