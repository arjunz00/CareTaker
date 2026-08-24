import React, { useState } from 'react';
import { MapPin, Navigation, Info } from 'lucide-react';

interface LocationCardProps {
  initialSharing: boolean;
  emergencyLocation: string;
}

export default function LocationCard({
  initialSharing,
  emergencyLocation
}: LocationCardProps) {
  const [sharing, setSharing] = useState(initialSharing);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition duration-200 space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-850 pb-3 select-none">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4.5 h-4.5 text-indigo-400" />
          Location Sharing & GPS
        </h4>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={sharing} 
            onChange={(e) => setSharing(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
        </label>
      </div>

      {/* Grid: Coordinates & Address */}
      <div className="space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850 select-none">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-mono block">GPS Latitude</span>
            <span className="text-xs font-bold text-white font-mono">{sharing ? "19.0760° N" : "--"}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-mono block">GPS Longitude</span>
            <span className="text-xs font-bold text-white font-mono">{sharing ? "72.8777° E" : "--"}</span>
          </div>
        </div>

        <div>
          <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Registered Dispatch Location:</span>
          <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex gap-2 items-start">
            <Navigation className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span className="text-slate-300 italic leading-relaxed">{emergencyLocation}</span>
          </div>
        </div>
      </div>

      {/* Map visual abstraction */}
      {sharing ? (
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 h-32 relative flex flex-col justify-end overflow-hidden select-none">
          {/* Mock Grid Lines Map */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-35"></div>
          {/* Signal Ping */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500 flex items-center justify-center animate-ping"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 absolute"></div>
          </div>
          
          <div className="relative z-10 bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-[9px] text-slate-400 flex justify-between items-center">
            <span>AegisWatch Node GPS broadcast: ACTIVE</span>
            <span className="font-bold text-indigo-400 uppercase tracking-widest">Living Room</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/40 border border-dashed border-slate-850 rounded-xl p-5 h-32 flex flex-col items-center justify-center text-center select-none text-slate-500 font-mono space-y-1.5">
          <MapPin className="w-6 h-6 text-slate-600" />
          <span className="text-[10px]">Location sharing is disabled. Responders will not see coordinates.</span>
        </div>
      )}

      {/* Safety Notice */}
      <div className="bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl flex gap-2.5 items-start text-[10px] text-indigo-400 select-none">
        <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy Override:</strong> Location metrics are transmitted securely. Authorized responders only query GPS signals during active dispatches.
        </p>
      </div>

    </div>
  );
}
export type { LocationCardProps };
