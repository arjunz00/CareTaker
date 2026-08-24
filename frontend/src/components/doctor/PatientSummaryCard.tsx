import React from 'react';
import { Users, CheckCircle, Eye, AlertTriangle, AlertOctagon } from 'lucide-react';

interface PatientSummaryCardProps {
  totalCount: number;
  stableCount: number;
  monitorCount: number;
  criticalCount: number;
  offlineCount: number;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function PatientSummaryCard({
  totalCount,
  stableCount,
  monitorCount,
  criticalCount,
  offlineCount,
  activeFilter,
  onFilterChange
}: PatientSummaryCardProps) {

  const cards = [
    { label: "Total Patients", count: totalCount, filter: "all", icon: Users, color: "text-slate-400 border-slate-800 bg-slate-900" },
    { label: "Stable (🟢)", count: stableCount, filter: "Stable", icon: CheckCircle, color: "text-emerald-400 border-emerald-900/60 bg-emerald-950/20" },
    { label: "Needs Monitor (🟡)", count: monitorCount, filter: "Monitor", icon: Eye, color: "text-amber-400 border-amber-900/60 bg-amber-950/20" },
    { label: "Critical triage (🔴)", count: criticalCount, filter: "Critical", icon: AlertTriangle, color: "text-rose-400 border-rose-900/60 bg-rose-950/20" },
    { label: "Device Offline", count: offlineCount, filter: "offline", icon: AlertOctagon, color: "text-slate-500 border-slate-800/80 bg-slate-950/50" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 select-none font-mono">
      {cards.map((c) => {
        const isActive = activeFilter === c.filter;
        return (
          <div
            key={c.filter}
            onClick={() => onFilterChange(c.filter)}
            className={`border p-4.5 rounded-2xl shadow-md cursor-pointer transition flex flex-col justify-between hover:scale-101 active:scale-98 ${
              isActive 
                ? 'ring-2 ring-indigo-500 border-transparent bg-slate-850'
                : 'border-slate-800 bg-slate-900'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
              <c.icon className={`w-4 h-4 ${c.color.split(' ')[0]}`} />
            </div>
            <span className="text-3xl font-black text-white mt-3 block">{c.count}</span>
          </div>
        );
      })}
    </div>
  );
}
