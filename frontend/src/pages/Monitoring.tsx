import React, { useState } from 'react';
import { useVitals } from '../hooks/useVitals';
import VitalChart from '../components/VitalChart';
import { Activity, Clock, Heart, Droplets, Thermometer, Layers } from 'lucide-react';

export default function Monitoring() {
  const { vitals, history } = useVitals();
  const [timeRange, setTimeRange] = useState<'live' | '1h' | '24h'>('live');

  const filterButtons = [
    { label: "Live Stream", value: "live" },
    { label: "Last 1 Hour", value: "1h" },
    { label: "Last 24 Hours", value: "24h" }
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Live Biometric Monitoring Channels
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">High-resolution physiological signals from AegisWatch & mmWave Radar.</p>
        </div>
        
        {/* Segmented Filter */}
        <div className="bg-slate-900 border border-slate-850 p-1 rounded-xl flex gap-1 select-none">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setTimeRange(btn.value as any)}
              className={`text-[10px] font-bold py-1.5 px-3 rounded-lg transition ${
                timeRange === btn.value 
                  ? 'bg-indigo-650 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Heart Rate detailed graph */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex justify-between items-center select-none font-mono">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Heart Rate telemetry (PPG)
            </span>
            <span className="text-sm font-bold text-rose-500">{vitals.heartRate} BPM</span>
          </div>
          <div className="h-64 select-none">
            <VitalChart 
              data={history} 
              dataKey="hr" 
              strokeColor="#ef4444" 
              minDomain={50} 
              maxDomain={120} 
              showAxes={true} 
            />
          </div>
        </div>

        {/* Oxygen Saturation graph */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex justify-between items-center select-none font-mono">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              Blood Oxygen saturation (SpO₂)
            </span>
            <span className="text-sm font-bold text-sky-400">{vitals.spo2}%</span>
          </div>
          <div className="h-64 select-none">
            <VitalChart 
              data={history} 
              dataKey="spo2" 
              strokeColor="#38bdf8" 
              minDomain={90} 
              maxDomain={100} 
              showAxes={true} 
            />
          </div>
        </div>

        {/* Temp detailed graph */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex justify-between items-center select-none font-mono">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-500" />
              Skin temperature trends
            </span>
            <span className="text-sm font-bold text-amber-500">{vitals.temperature}°C</span>
          </div>
          <div className="h-64 select-none">
            <VitalChart 
              data={history} 
              dataKey="temp" 
              strokeColor="#f59e0b" 
              minDomain={35} 
              maxDomain={40} 
              showAxes={true} 
            />
          </div>
        </div>

        {/* mmWave Radar card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-850 pb-3 select-none">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Non-Contact mmWave Radar readings
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Estimations based on room occupancy chest motions. (Unrestricted mobility range).</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 my-4 text-center font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Radar Heart Rate</span>
              <span className="text-xl font-bold text-white block mt-1">{vitals.radarHeartRate} BPM</span>
              <span className="text-[8px] text-indigo-400 font-bold block mt-1 uppercase tracking-widest">Estimated by Radar</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Radar Respiration</span>
              <span className="text-xl font-bold text-white block mt-1">{vitals.radarRespiration}/min</span>
              <span className="text-[8px] text-indigo-400 font-bold block mt-1 uppercase tracking-widest">Estimated by Radar</span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850/60 text-[10px] text-slate-500 select-none leading-relaxed">
            <strong>Estimated Readings disclaimer:</strong> mmWave Radar measurements represent physiological approximations computed via chest wall micro-motion tracking. They are not clinical parameters and do not replace ECG/MAX30102 pulse monitors.
          </div>
        </div>

      </div>

    </div>
  );
}
