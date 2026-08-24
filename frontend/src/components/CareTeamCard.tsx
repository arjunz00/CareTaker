import React from 'react';
import { Users, Heart, Phone, Shield } from 'lucide-react';
import { useEmergency } from '../hooks/useEmergency';

export default function CareTeamCard() {
  const { volunteer } = useEmergency();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4 select-none">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          My Care Team
        </h4>
      </div>

      <div className="space-y-4">
        {/* Son / Guardian */}
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs">
              R
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Rahul Sharma</span>
              <span className="text-[9px] text-slate-500 font-mono block">Primary Guardian / Son</span>
            </div>
          </div>
          <a href="tel:+919988776655" className="text-slate-400 hover:text-white p-1 hover:bg-slate-900 rounded transition">
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Doctor */}
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-950 text-blue-400 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Dr. Arvind Swamy</span>
              <span className="text-[9px] text-slate-500 font-mono block">Primary Cardiologist</span>
            </div>
          </div>
          <a href="tel:+919123456789" className="text-slate-400 hover:text-white p-1 hover:bg-slate-900 rounded transition">
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Verified Responder (if dispatched) */}
        {volunteer ? (
          <div className="bg-emerald-950/20 border border-emerald-900/60 p-3.5 rounded-xl space-y-2 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-emerald-400 block">{volunteer.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono block">Verified Allied Health Responder</span>
                </div>
              </div>
              <a href={`tel:${volunteer.phone}`} className="text-slate-400 hover:text-white p-1 hover:bg-slate-900 rounded transition">
                <Phone className="w-4 h-4" />
              </a>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 border-t border-emerald-900/40 pt-1.5 font-mono">
              <span>Distance: {volunteer.distance} km</span>
              <span className="font-bold text-emerald-400">ETA {volunteer.eta} (Responding)</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-[10px] text-slate-500 font-mono">
            No active volunteer assigned. (Dispatches activate on confirmed emergencies).
          </div>
        )}
      </div>

    </div>
  );
}
