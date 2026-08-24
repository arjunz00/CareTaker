import React from 'react';
import { MapPin } from 'lucide-react';
import LocationMap from '../../components/guardian/LocationMap';

export default function Location() {
  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            Patient Location Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Locate family members dynamically in true emergency coordinates.</p>
        </div>
      </div>

      <div className="max-w-xl">
        <LocationMap
          sharingStatus="Emergency Only"
          coords={null} // Default stable is locked
          patientName="Savita Sharma"
          isEmergency={false}
        />
      </div>

    </div>
  );
}
