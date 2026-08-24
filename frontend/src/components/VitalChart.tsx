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

interface VitalChartProps {
  data: any[];
  dataKey: string;
  strokeColor: string;
  fillColor?: string;
  minDomain?: number | string;
  maxDomain?: number | string;
  showAxes?: boolean;
}

export default function VitalChart({
  data,
  dataKey,
  strokeColor,
  minDomain = 'auto',
  maxDomain = 'auto',
  showAxes = false
}: VitalChartProps) {
  
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950/20 rounded-xl border border-slate-850">
        <span className="text-[10px] text-slate-600 font-mono animate-pulse">Waiting for telemetry...</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        
        {showAxes && (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.15)" />
        )}
        
        {showAxes && (
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#64748b', fontSize: 9 }} 
            axisLine={{ stroke: '#334155' }} 
            tickLine={{ stroke: '#334155' }}
          />
        )}
        
        {showAxes && (
          <YAxis 
            domain={[minDomain, maxDomain]} 
            tick={{ fill: '#64748b', fontSize: 9 }} 
            axisLine={{ stroke: '#334155' }} 
            tickLine={{ stroke: '#334155' }}
          />
        )}
        
        {showAxes && (
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderColor: '#334155', 
              color: '#f8fafc',
              fontSize: '10px',
              fontFamily: 'monospace'
            }} 
          />
        )}

        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={strokeColor}
          strokeWidth={showAxes ? 2.5 : 1.8}
          dot={false}
          animationDuration={0}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
