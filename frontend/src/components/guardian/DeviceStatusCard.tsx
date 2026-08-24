import React from 'react';
import { Wifi, AlertTriangle, Battery, Clock } from 'lucide-react';

interface DeviceStatusCardProps {
  heartRate: number;
}

export default function DeviceStatusCard({ heartRate }: DeviceStatusCardProps) {
  const isOnline = heartRate > 0;

  const devices = [
    { name: "ESP32 Core Processor", status: isOnline ? "Connected" : "Offline", color: isOnline ? "text-emerald-450" : "text-rose-500" },
    { name: "MPU6050 Accelerometer", status: isOnline ? "Working" : "Offline", color: isOnline ? "text-emerald-450" : "text-rose-500" },
    { name: "MAX30102 PPG Vitals Sensor", status: isOnline ? "Working" : "Offline", color: isOnline ? "text-emerald-450" : "text-rose-500" },
    { name: "mmWave Occupancy Radar", status: isOnline ? "Connected" : "Offline", color: isOnline ? "text-emerald-450" : "text-rose-500" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-850 pb-3 select-none flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">IoT Device pairing Diagnostic</span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Gateway node synchronization metrics.</span>
        </div>
        
        {/* Battery */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <Battery className="w-4 h-4 text-emerald-400" />
          <span>{isOnline ? "82%" : "--"}</span>
        </div>
      </div>

      {/* Disconnect warning */}
      {!isOnline && (
        <div className="bg-rose-950/20 border border-rose-900/40 p-3.5 rounded-2xl flex gap-2.5 items-start text-[10px] text-rose-450 leading-relaxed font-mono animate-pulse select-none">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <strong>Patient Wearable Disconnected!</strong>
            <p className="mt-0.5">The ESP32 gateway node has not synchronized with the caretaker cloud servers for 5 minutes. Check physical power links.</p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2.5 font-mono text-xs select-none">
        {devices.map((d, idx) => (
          <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-850/50 last:border-0">
            <span className="text-slate-450">{d.name}</span>
            <span className={`font-bold ${d.color}`}>{d.status}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-550 pt-2 border-t border-slate-850 select-none font-mono">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Last sync check: {isOnline ? "5 seconds ago" : "5 minutes ago"}
        </span>
      </div>

    </div>
  );
}
export type { DeviceStatusCardProps };
