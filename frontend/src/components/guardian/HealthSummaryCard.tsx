import React from 'react';
import { Heart, Droplets, Thermometer, Activity, Eye } from 'lucide-react';

interface HealthSummaryCardProps {
  vitals?: {
    heartRate?: number;
    spo2?: number;
    temperature?: number;
    respirationRate?: number;
    activity?: string;
  };
}

export default function HealthSummaryCard({ vitals }: HealthSummaryCardProps) {
  if (!vitals) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center font-mono text-slate-500 text-xs">
        Health telemetry summary loading...
      </div>
    );
  }

  const cards = [
    { label: "Heart Rate", val: vitals.heartRate ? `${vitals.heartRate} BPM` : "Offline", icon: Heart, color: "text-rose-500 fill-rose-950/20" },
    { label: "Blood Oxygen SpO₂", val: vitals.spo2 ? `${vitals.spo2}%` : "Offline", icon: Droplets, color: "text-sky-400 fill-sky-950/20" },
    { label: "Body Temperature", val: vitals.temperature ? `${vitals.temperature}°C` : "Offline", icon: Thermometer, color: "text-amber-500 fill-amber-950/20" },
    { label: "Respiration Rate", val: vitals.respirationRate ? `${vitals.respirationRate}/min` : "Offline", icon: Eye, color: "text-indigo-400 fill-indigo-950/20" },
    { label: "Active Posture", val: vitals.activity || "--", icon: Activity, color: "text-emerald-450 fill-emerald-950/20" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono select-none">
      {cards.map((c, idx) => (
        <div key={idx} className="bg-slate-900 border border-slate-800 p-4.5 rounded-3xl shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
            <c.icon className={`w-4 h-4 ${c.color}`} />
          </div>
          <span className="text-xl font-black text-white mt-4 block">{c.val}</span>
        </div>
      ))}
    </div>
  );
}
export type { HealthSummaryCardProps };
