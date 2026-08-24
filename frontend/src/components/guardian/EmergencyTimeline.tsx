import React from 'react';
import { Clock, CheckCircle, CircleDot } from 'lucide-react';

interface EmergencyTimelineProps {
  activeEmergency?: boolean;
}

export default function EmergencyTimeline({ activeEmergency = false }: EmergencyTimelineProps) {
  // Static deterministic timeline steps for presentation
  const steps = [
    { time: "20:18:02", desc: "Possible fall anomaly detected by MPU6050 Accelerometer", status: "completed" },
    { time: "20:18:03", desc: "Wearable gateway verification countdown started", status: "completed" },
    { time: "20:18:08", desc: "Patient confirmation response timed out (No response)", status: "completed" },
    { time: "20:18:10", desc: "Guardian notification SMS & push dispatches completed", status: "completed" },
    { time: "20:18:11", desc: "Clinician on-call alert queued to workspace dashboard", status: "completed" },
    { time: "20:18:20", desc: "Allied volunteer responder search triggered in Navi Mumbai", status: "completed" },
    { time: "20:18:30", desc: "Volunteer accepted dispatch task (ETA 6m, 1.2km)", status: "completed" },
    { time: "20:19:00", desc: "Volunteer responder approaching target location", status: activeEmergency ? "active" : "completed" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-850 pb-3 select-none flex items-center gap-2">
        <Clock className="w-4.5 h-4.5 text-indigo-405" />
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Incident Response Timeline</span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Websocket-synchronized dispatcher log.</span>
        </div>
      </div>

      {/* Timeline Steps list */}
      <div className="relative border-l border-slate-850 pl-5.5 space-y-5 font-mono text-[10px] select-none py-1 ml-2.5">
        {steps.map((s, idx) => (
          <div key={idx} className="relative">
            {/* Step dot */}
            <span className="absolute -left-8 top-0.5 flex items-center justify-center bg-slate-900 rounded-full">
              {s.status === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-emerald-450 fill-slate-950" />
              ) : (
                <CircleDot className="w-4 h-4 text-rose-500 fill-slate-950 animate-pulse" />
              )}
            </span>

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-1.5 leading-normal">
              <span className="text-slate-350">{s.desc}</span>
              <span className="text-slate-500 text-[9px]">{s.time}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
