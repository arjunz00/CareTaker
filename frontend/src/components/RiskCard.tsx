import React from 'react';
import { ShieldCheck, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useRisk } from '../hooks/useRisk';
import VitalChart from './VitalChart';

export default function RiskCard() {
  const { score, forecast15, forecast30, trend, reasons, lastUpdated } = useRisk();

  const getRiskColor = (s: number) => {
    if (s >= 70) return { border: 'border-rose-500', text: 'text-rose-500', bg: 'bg-rose-950/20', badge: '🟢 HIGH RISK' };
    if (s >= 40) return { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-950/20', badge: '🟡 MODERATE RISK' };
    return { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-950/20', badge: '🟢 LOW RISK' };
  };

  const colors = getRiskColor(score);

  // Generate mini trend points for charting
  const mockTrendData = [
    { time: 'Now', risk: score },
    { time: '+15m', risk: forecast15 },
    { time: '+30m', risk: forecast30 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition duration-200 grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* Risk Metrics Section (5 cols) */}
      <div className="md:col-span-5 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Predictive AI Risk Monitor</span>
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl border ${colors.border} ${colors.bg} flex items-center justify-center`}>
              <span className={`text-2xl font-black font-mono ${colors.text}`}>{score}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">{colors.badge}</span>
              <span className="text-[9px] text-slate-500 font-mono">Last assessment: {lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Forecast predictions */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-mono block">15m Forecast</span>
            <span className="text-sm font-bold text-white font-mono">{forecast15} / 100</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-mono block">30m Forecast</span>
            <span className="text-sm font-bold text-white font-mono">{forecast30} / 100</span>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex justify-between items-center text-xs border-t border-slate-850 pt-3 text-slate-400">
          <span>Short-term forecast:</span>
          <span className="font-bold flex items-center gap-1">
            {trend === 'increasing' && <><TrendingUp className="w-3.5 h-3.5 text-rose-500" /> Increasing</>}
            {trend === 'decreasing' && <><TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Decreasing</>}
            {trend === 'stable' && <><RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" /> Stable</>}
          </span>
        </div>
      </div>

      {/* Rationale & Micro Trend Graph (7 cols) */}
      <div className="md:col-span-7 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Explainable AI Diagnostics</span>
          <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl min-h-[96px] text-xs text-slate-400 font-mono leading-relaxed space-y-1.5">
            <span className="text-slate-500 block border-b border-slate-900 pb-1 uppercase tracking-wider text-[9px] font-bold">Why is my risk score changing?</span>
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex gap-2.5 items-start">
                <span className="text-indigo-400 font-bold">&#8226;</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Risk Trend Graph */}
        <div className="h-12 w-full mt-4 flex items-center justify-between border-t border-slate-850 pt-3">
          <span className="text-[10px] text-slate-500 font-mono">30-min risk trajectory</span>
          <div className="w-32 h-8 select-none">
            <VitalChart data={mockTrendData} dataKey="risk" strokeColor="#6366f1" />
          </div>
        </div>
      </div>

    </div>
  );
}
