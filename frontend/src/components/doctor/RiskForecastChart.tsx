import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface RiskForecastChartProps {
  score: number;
}

export default function RiskForecastChart({ score }: RiskForecastChartProps) {
  // Generate predictive coordinates
  const forecast15 = Math.min(100, Math.round(score * 1.1));
  const forecast30 = Math.min(100, Math.round(score * 1.25));
  const forecast60 = Math.min(100, Math.round(score * 1.35));

  const data = [
    { time: 'Current', risk: score },
    { time: '+15m', risk: forecast15 },
    { time: '+30m', risk: forecast30 },
    { time: '+60m', risk: forecast60 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 hover:border-slate-700 transition duration-200">
      
      <div className="border-b border-slate-850 pb-3 select-none">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Predictive AI Risk Forecast Trajectory</span>
        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">60-minute short-term risk vector forecast coordinates.</span>
      </div>

      <div className="h-48 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.15)" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#64748b', fontSize: 9 }} 
              axisLine={{ stroke: '#334155' }} 
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fill: '#64748b', fontSize: 9 }} 
              axisLine={{ stroke: '#334155' }} 
              tickLine={{ stroke: '#334155' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#334155', 
                color: '#f8fafc',
                fontSize: '10px',
                fontFamily: 'monospace'
              }} 
            />
            <Line
              type="monotone"
              dataKey="risk"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4 }}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trajectory statistics */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-850 font-mono text-center text-xs">
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-500 block uppercase">15m Forecast</span>
          <span className="font-bold text-white mt-1 block">{forecast15} / 100</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-500 block uppercase">30m Forecast</span>
          <span className="font-bold text-white mt-1 block">{forecast30} / 100</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-500 block uppercase">60m Forecast</span>
          <span className="font-bold text-indigo-400 mt-1 block">{forecast60} / 100</span>
        </div>
      </div>

    </div>
  );
}
