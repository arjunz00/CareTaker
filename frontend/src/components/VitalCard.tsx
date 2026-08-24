import React from 'react';
import { LucideIcon } from 'lucide-react';

interface VitalCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  iconColor: string;
  rangeLabel: string;
  statusLabel: string;
  statusColor: 'green' | 'amber' | 'red';
  extraLabel?: string;
  children?: React.ReactNode;
}

export default function VitalCard({
  title,
  value,
  unit,
  icon: Icon,
  iconColor,
  rangeLabel,
  statusLabel,
  statusColor,
  extraLabel,
  children
}: VitalCardProps) {
  
  const statusClasses = {
    green: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60',
    amber: 'bg-amber-950/40 text-amber-400 border-amber-800/60',
    red: 'bg-rose-950/40 text-rose-400 border-rose-800/60'
  };

  const statusBullet = {
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-rose-500'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition duration-200">
      
      {/* Card Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${iconColor} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h4>
            {extraLabel && <span className="text-[9px] text-slate-500 font-medium italic block mt-0.5">{extraLabel}</span>}
          </div>
        </div>

        {/* Status Pill */}
        <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1.5 font-bold uppercase tracking-wider ${statusClasses[statusColor]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusBullet[statusColor]}`}></span>
          {statusLabel}
        </span>
      </div>

      {/* Numerical reading */}
      <div className="my-4">
        <span className="text-3xl font-black text-white font-mono">{value}</span>
        <span className="text-xs text-slate-500 font-semibold ml-1.5">{unit}</span>
      </div>

      {/* Chart container */}
      {children && (
        <div className="h-16 w-full mb-3 select-none">
          {children}
        </div>
      )}

      {/* Footer Baseline */}
      <div className="border-t border-slate-850 pt-2.5 flex justify-between text-[10px] text-slate-500 font-mono">
        <span>Personal range:</span>
        <span className="font-semibold text-slate-400">{rangeLabel}</span>
      </div>

    </div>
  );
}
export type { VitalCardProps };
