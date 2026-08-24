import React from 'react';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

interface LocationMapProps {
  sharingStatus: string;
  coords: { lat: number; lng: number } | null;
  patientName: string;
  isEmergency: boolean;
}

export default function LocationMap({
  sharingStatus,
  coords,
  patientName,
  isEmergency
}: LocationMapProps) {

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition duration-200 select-none">
      
      {/* Header */}
      <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live Location Tracker Map</span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Coordinating GPS coordinates fusions.</span>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono border ${
          isEmergency 
            ? 'bg-rose-950/40 text-rose-400 border-rose-900/60 animate-pulse' 
            : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
        }`}>
          Share Status: {sharingStatus}
        </span>
      </div>

      {coords ? (
        <div className="space-y-4">
          
          {/* Map canvas */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl h-44 relative flex flex-col justify-end p-3 overflow-hidden">
            {/* Grid dot overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-25"></div>
            
            {/* Coordinates ping */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center animate-ping"></div>
              <MapPin className="w-6 h-6 text-rose-500 absolute" />
            </div>

            {/* Locator metadata card */}
            <div className="relative z-10 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-[9px] text-slate-400 flex justify-between items-center font-mono">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                {patientName}'s Coordinates:
              </span>
              <span className="font-bold text-rose-500 font-mono">{coords.lat}° N, {coords.lng}° E</span>
            </div>
          </div>

          {/* Volunteer ETA tracking in emergency */}
          {isEmergency && (
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl flex justify-between items-center text-xs leading-normal font-mono text-slate-350">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>Approaching Volunteer:</span>
              </div>
              <span className="font-bold text-emerald-450">ETA 6 minutes (1.2 km away)</span>
            </div>
          )}

        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 h-48 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs gap-3">
          <AlertCircle className="w-8 h-8 text-slate-600" />
          <div>
            <strong>Location sharing locked</strong>
            <p className="text-[10px] text-slate-600 mt-1 max-w-xs mx-auto leading-normal">
              Coordinates sharing is restricted under "Emergency Only" patient privacy settings. Location will auto-unlock if safety status drops to Critical.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
export type { LocationMapProps };
