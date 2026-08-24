import React from 'react';
import { AlertOctagon } from 'lucide-react';
import EmergencyTimeline from '../../components/guardian/EmergencyTimeline';
import EmergencyActionPanel from '../../components/guardian/EmergencyActionPanel';

export default function Emergencies() {
  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-indigo-405" />
            Emergency dispatch Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Locate, contact, and check status timeline of active incidents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl">
        <div className="lg:col-span-8">
          <EmergencyTimeline activeEmergency={false} />
        </div>
        <div className="lg:col-span-4">
          <EmergencyActionPanel
            patientPhone="+91 98765 43210"
            doctorPhone="+91 91234 56789"
            volunteerPhone="+91 98765 43210"
            isEmergency={false}
          />
        </div>
      </div>

    </div>
  );
}
