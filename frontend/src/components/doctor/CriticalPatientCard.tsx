import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Phone, User, Heart, Shield, CheckCircle } from 'lucide-react';
import { PatientListItem } from '../../hooks/usePatients';

interface CriticalPatientCardProps {
  patient: PatientListItem;
}

export default function CriticalPatientCard({ patient }: CriticalPatientCardProps) {
  const navigate = useNavigate();

  const handleOpenPatient = () => {
    navigate(`/doctor/patients/${patient.id}`);
  };

  const handleEmergencyDetails = () => {
    navigate(`/doctor/emergencies`);
  };

  return (
    <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-rose-400 transition relative overflow-hidden">
      
      {/* Visual Emergency ping backdrop */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full filter blur-xl animate-pulse"></div>

      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-850 pb-3 mb-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-rose-950 text-rose-500 flex items-center justify-center font-bold text-xs">
            {patient.profile.name[0]}
          </div>
          <div>
            <span className="font-bold text-xs text-white block">{patient.profile.name}</span>
            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Patient Ref: {patient.id} | Age: {patient.profile.age}</span>
          </div>
        </div>

        {/* Level Flag */}
        <span className="bg-rose-950/40 text-rose-500 border border-rose-800/80 text-[9px] font-bold px-2 py-0.5 rounded font-mono flex items-center gap-1">
          <AlertOctagon className="w-3 h-3 animate-bounce" />
          CRITICAL ({patient.risk_score}/100)
        </span>
      </div>

      {/* Biometric indicators grid */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center font-mono select-none">
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-850/80">
          <span className="text-[9px] text-slate-500 block uppercase">PPG Heart Rate</span>
          <span className="text-sm font-bold text-rose-400 mt-1 block flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-rose-950" />
            {patient.vitals.heartRate > 0 ? `${patient.vitals.heartRate} BPM` : "Offline"}
          </span>
        </div>
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-850/80">
          <span className="text-[9px] text-slate-500 block uppercase">Oxygen SpO₂</span>
          <span className="text-sm font-bold text-white mt-1 block">
            {patient.vitals.spo2 > 0 ? `${patient.vitals.spo2}%` : "Offline"}
          </span>
        </div>
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-850/80">
          <span className="text-[9px] text-slate-500 block uppercase">Activity pose</span>
          <span className="text-xs font-semibold text-indigo-400 mt-1.5 block">
            {patient.vitals.activity}
          </span>
        </div>
      </div>

      {/* Care Coordination nodes status */}
      <div className="space-y-2 text-[10px] bg-slate-950/40 p-3 rounded-xl border border-slate-850/60 mb-4 select-none">
        <div className="flex justify-between items-center text-slate-400">
          <span>Guardian Status:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Notified & Verified
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Allied Volunteer:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Shield className="w-3 h-3" /> Matched (ETA 6m)
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-900">
          <span>Last gateway update:</span>
          <span className="text-slate-500 font-mono">2s ago</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleEmergencyDetails}
          className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-350 font-bold text-[10px] py-2.5 rounded-xl uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1"
        >
          Emergency details
        </button>
        <button
          onClick={handleOpenPatient}
          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] py-2.5 rounded-xl uppercase tracking-wider shadow-lg shadow-rose-900/20 transition active:scale-95"
        >
          Open Patient Roster
        </button>
      </div>

    </div>
  );
}
export type { CriticalPatientCardProps };
