import React from 'react';
import { Cpu, Battery, RefreshCw, Layers } from 'lucide-react';

interface DeviceState {
  wearableConnected: boolean;
  esp32Connected: boolean;
  imuStatus: 'Working' | 'Offline';
  ppgStatus: 'Working' | 'Offline';
  radarConnected: boolean;
  battery: number;
}

export default function DeviceStatusCard() {
  // Mock device state (would normally fetch from /api/patient/devices)
  const device: DeviceState = {
    wearableConnected: true,
    esp32Connected: true,
    imuStatus: 'Working',
    ppgStatus: 'Working',
    radarConnected: true,
    battery: 82
  };

  const getStatusBadge = (connected: boolean) => {
    return connected 
      ? <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 text-[9px] font-bold px-2 py-0.5 rounded font-mono">CONNECTED</span>
      : <span className="bg-rose-950/40 text-rose-400 border border-rose-900/60 text-[9px] font-bold px-2 py-0.5 rounded font-mono">OFFLINE</span>;
  };

  const getSensorStatus = (status: 'Working' | 'Offline') => {
    return status === 'Working'
      ? <span className="text-emerald-400 font-bold font-mono">Working</span>
      : <span className="text-rose-500 font-bold font-mono">Offline</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition duration-200 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4 select-none">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          IoT Device Topology
        </h4>
        <span className="text-[9px] text-slate-500 font-mono">Sync: 2s ago</span>
      </div>

      {/* Network Nodes status */}
      <div className="space-y-3.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">AegisWatch Node:</span>
          {getStatusBadge(device.wearableConnected)}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">ESP32 Core Microcontroller:</span>
          {getStatusBadge(device.esp32Connected)}
        </div>
        <div className="flex justify-between items-center border-t border-slate-850/60 pt-2.5">
          <span className="text-slate-400 font-medium">MPU6050 Accelerometer:</span>
          {getSensorStatus(device.imuStatus)}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-medium">MAX30102 PPG & SpO₂:</span>
          {getSensorStatus(device.ppgStatus)}
        </div>
        
        {/* mmWave Radar section */}
        <div className="flex justify-between items-center border-t border-slate-850/60 pt-2.5">
          <span className="text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            mmWave Occupancy Radar:
          </span>
          {getStatusBadge(device.radarConnected)}
        </div>
      </div>

      {/* Battery status */}
      <div className="mt-4 pt-3.5 border-t border-slate-850 flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Battery className="w-4 h-4 text-emerald-400" />
          <span>Battery Charge:</span>
        </div>
        <span className="font-bold text-white font-mono">{device.battery}%</span>
      </div>

      {/* Action */}
      <button className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs py-2 rounded-xl mt-4 transition active:scale-98">
        View Device Details
      </button>

    </div>
  );
}
