import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, Wifi, AlertTriangle } from 'lucide-react';
import { FamilyMember } from '../../hooks/guardian/useFamily';

interface FamilyMemberCardProps {
  member: FamilyMember;
}

export default function FamilyMemberCard({ member }: FamilyMemberCardProps) {
  const navigate = useNavigate();

  const getStatusStyle = (status: string) => {
    if (status === "Critical") return "bg-rose-950/40 text-rose-400 border border-rose-900/60";
    if (status === "Monitor") return "bg-amber-950/40 text-amber-400 border border-amber-900/60";
    return "bg-emerald-950/40 text-emerald-450 border border-emerald-900/60";
  };

  const getStatusLabel = (status: string) => {
    if (status === "Critical") return "🔴 EMERGENCY ALERT";
    if (status === "Monitor") return "🟡 NEEDS ATTENTION";
    return "🟢 SAFE";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-850 pb-3 mb-2 select-none">
        <div>
          <h3 className="font-bold text-sm text-white block">{member.name}</h3>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Age: {member.age} | Patient ID: {member.id}</span>
        </div>
        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded font-mono ${getStatusStyle(member.status)}`}>
          {getStatusLabel(member.status)}
        </span>
      </div>

      {/* Main risk stats */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono select-none">
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex flex-col justify-center">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider block">AI Safety Risk</span>
          <span className="text-xl font-black text-white mt-1 block">{member.risk_score} / 100</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex flex-col justify-center">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Gateway Sync</span>
          <span className={`text-xs font-bold mt-1.5 block flex items-center gap-1.5 ${
            member.device_status === 'Connected' ? 'text-emerald-450' : 'text-rose-450'
          }`}>
            <Wifi className="w-3.5 h-3.5" />
            {member.device_status}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-550 border-t border-slate-850/60 pt-3 select-none">
        <span>Last update: {member.last_update}</span>
        <button
          onClick={() => navigate(`/guardian/patient/${member.id}`)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 active:scale-95 text-xs border border-indigo-500"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Dashboard</span>
        </button>
      </div>

    </div>
  );
}
