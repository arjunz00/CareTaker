import React from 'react';
import { Users, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useEmergency } from '../hooks/useEmergency';

export default function CareTeamCard() {
  const { volunteer } = useEmergency();

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 shadow-xl transition duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 select-none">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-heading">
          <Users className="w-4 h-4 text-teal-400" />
          My Care Network
        </h4>
        <span className="text-[10px] text-teal-400 font-mono bg-teal-950 px-2 py-0.5 rounded-full border border-teal-900">
          3 Active Guardians
        </span>
      </div>

      <div className="space-y-3">
        {/* Son / Guardian */}
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
                alt="Rahul Sharma" 
                className="w-9 h-9 rounded-full object-cover border border-slate-700"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Rahul Sharma</span>
              <span className="text-[10px] text-slate-400 font-mono block">Primary Guardian / Son</span>
            </div>
          </div>
          <a 
            href="tel:+919988776655" 
            className="p-2 bg-slate-900 hover:bg-slate-800 text-teal-400 rounded-xl transition border border-slate-800"
            title="Call Guardian"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Doctor */}
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200" 
                alt="Dr. Arvind Swamy" 
                className="w-9 h-9 rounded-full object-cover border border-slate-700"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-teal-400 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Dr. Arvind Swamy</span>
              <span className="text-[10px] text-slate-400 font-mono block">Primary Cardiologist</span>
            </div>
          </div>
          <a 
            href="tel:+919123456789" 
            className="p-2 bg-slate-900 hover:bg-slate-800 text-teal-400 rounded-xl transition border border-slate-800"
            title="Call Doctor"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Verified Responder (if dispatched) */}
        {volunteer ? (
          <div className="bg-teal-950/40 border border-teal-900 p-3.5 rounded-xl space-y-2 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" 
                  alt={volunteer.name} 
                  className="w-9 h-9 rounded-full object-cover border border-teal-500"
                />
                <div>
                  <span className="font-bold text-xs text-teal-300 flex items-center gap-1">
                    {volunteer.name} <ShieldCheck className="w-3 h-3 text-teal-400" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">Verified Emergency Volunteer</span>
                </div>
              </div>
              <a 
                href={`tel:${volunteer.phone}`} 
                className="p-2 bg-teal-900 text-teal-200 rounded-xl transition"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex justify-between text-[10px] text-teal-200 border-t border-teal-900/60 pt-2 font-mono">
              <span>Distance: {volunteer.distance} km</span>
              <span className="font-bold text-teal-400">ETA {volunteer.eta} (En Route)</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> All care responders stand-by ready.
          </div>
        )}
      </div>

    </div>
  );
}
