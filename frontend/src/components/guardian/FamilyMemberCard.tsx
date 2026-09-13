import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Wifi, ShieldCheck } from 'lucide-react';
import { FamilyMember } from '../../hooks/guardian/useFamily';

interface FamilyMemberCardProps {
  member: FamilyMember;
}

export default function FamilyMemberCard({ member }: FamilyMemberCardProps) {
  const navigate = useNavigate();

  const getStatusStyle = (status: string) => {
    if (status === "Critical") return "bg-rose-950/60 text-rose-300 border border-rose-800";
    if (status === "Monitor") return "bg-amber-950/60 text-amber-300 border border-amber-800";
    return "bg-teal-950/60 text-teal-300 border border-teal-800";
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-teal-500/40 transition flex flex-col justify-between space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-2 select-none">
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" 
            alt={member.name} 
            className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-md"
          />
          <div>
            <h3 className="font-heading font-extrabold text-sm text-white block">{member.name}</h3>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Age: {member.age} yrs | ID: {member.id}</span>
          </div>
        </div>
        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full font-mono uppercase tracking-wider ${getStatusStyle(member.status)}`}>
          {member.status === "Critical" ? "🚨 Emergency" : member.status === "Monitor" ? "⚠️ Needs Monitor" : "🟢 Normal"}
        </span>
      </div>

      {/* Main risk stats */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono select-none">
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col justify-center">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">AI Safety Risk</span>
          <span className="text-xl font-extrabold text-white mt-1 block">{member.risk_score} / 100</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col justify-center">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Gateway Sync</span>
          <span className={`text-xs font-bold mt-1.5 block flex items-center gap-1.5 ${
            member.device_status === 'Connected' ? 'text-teal-400' : 'text-rose-400'
          }`}>
            <Wifi className="w-3.5 h-3.5" />
            {member.device_status}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800 pt-3 select-none">
        <span>Last update: {member.last_update}</span>
        <button
          onClick={() => navigate(`/guardian/patient/${member.id}`)}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 active:scale-95 text-xs shadow-md shadow-teal-500/20"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Status</span>
        </button>
      </div>

    </div>
  );
}
