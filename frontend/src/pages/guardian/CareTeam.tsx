import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

export default function CareTeam() {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/guardian/patients/P001/care-team");
        if (res.ok) {
          const data = await res.json();
          setTeam(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Care Team Network
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Contact primary doctors and assigned volunteer emergency responders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl select-none text-xs leading-normal">
        {loading ? (
          <div className="text-center py-6 col-span-2"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : !team ? (
          <p className="text-slate-505">Care team database offline.</p>
        ) : (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono block border-b border-slate-850 pb-2">Clinician On-Call</span>
              <h4 className="font-bold text-white text-sm">{team.doctor.name}</h4>
              <p className="text-slate-400">{team.doctor.hospital}</p>
              <div className="flex justify-between font-mono border-t border-slate-850/60 pt-2 text-[10px]">
                <span>Status:</span> <span className="text-emerald-450 font-bold">🟢 {team.doctor.status}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono block border-b border-slate-850 pb-2">Volunteer Responder</span>
              <h4 className="font-bold text-white text-sm">{team.volunteer.name}</h4>
              <p className="text-slate-400">Verified Community Dispatcher</p>
              <div className="flex justify-between font-mono border-t border-slate-850/60 pt-2 text-[10px]">
                <span>Dispatch:</span> <span className="text-indigo-405 font-bold">{team.volunteer.status}</span>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
