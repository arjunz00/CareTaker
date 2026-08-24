import React from 'react';
import { Clock, Shield, Bell, CheckCircle } from 'lucide-react';
import { EmergencyEvent, CareVolunteer } from '../hooks/useEmergency';

interface EmergencyTimelineProps {
  activeEmergency: EmergencyEvent;
  volunteer: CareVolunteer | null;
}

export default function EmergencyTimeline({
  activeEmergency,
  volunteer
}: EmergencyTimelineProps) {
  
  // Build dynamic timeline points based on emergency elapsed time
  const timelinePoints = [
    { time: "20:18:02", title: "SOS Emergency Triggered", desc: "Wearable edge fall detected and broadcasted to local gateway.", icon: Bell, color: "text-rose-500 bg-rose-950/40 border-rose-900/60" },
    { time: "20:18:03", title: "Guardian Notified", desc: "Automated phone call and SMS dispatched to Son (Rahul Sharma).", icon: Shield, color: "text-amber-500 bg-amber-950/40 border-amber-900/60" },
    { time: "20:18:05", title: "Cardiologist Alerted", desc: "Telemetry diagnostic reasons pushed to Dr. Arvind Swamy.", icon: Shield, color: "text-blue-500 bg-blue-950/40 border-blue-900/60" },
  ];

  if (volunteer) {
    timelinePoints.push({
      time: "20:18:10",
      title: `Volunteer Accepted: ${volunteer.name}`,
      desc: `Allied Health student dispatched from ${volunteer.college} (ETA: ${volunteer.eta}).`,
      icon: CheckCircle,
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/60"
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl select-none">
      <div className="border-b border-slate-850 pb-3.5 mb-5 flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
          Emergency Response Timeline
        </h4>
        <span className="text-[9px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-900 font-mono font-bold animate-pulse uppercase tracking-wider">
          Active Alert
        </span>
      </div>

      {/* Vertical Timeline */}
      <div className="relative border-l border-slate-850 pl-5 ml-2.5 space-y-6">
        {timelinePoints.map((pt, idx) => (
          <div key={idx} className="relative">
            {/* Timeline icon node */}
            <span className={`absolute -left-[30px] top-0.5 w-6.5 h-6.5 rounded-full border flex items-center justify-center ${pt.color}`}>
              <pt.icon className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white block">{pt.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{pt.time}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{pt.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Help Note */}
      <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 mt-5 text-[10px] text-slate-500 leading-relaxed font-sans">
        <strong>Privacy Note:</strong> Your active emergency details, current GPS coordinates, and baseline vitals are shared with emergency responders only during active dispatches. Data access is restricted immediately upon event resolution.
      </div>

    </div>
  );
}
