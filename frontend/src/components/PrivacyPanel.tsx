import React from 'react';
import { ShieldCheck, EyeOff, Layout, ArrowRight } from 'lucide-react';

export interface PrivacySettings {
  health_data: boolean;
  location: boolean;
  radar: boolean;
  camera: boolean;
  doctor_access: boolean;
  guardian_access: boolean;
  volunteer_access: boolean;
}

interface PrivacyPanelProps {
  settings: PrivacySettings;
  onUpdate: (key: keyof PrivacySettings, value: boolean) => void;
}

export default function PrivacyPanel({
  settings,
  onUpdate
}: PrivacyPanelProps) {

  const toggleRow = (label: string, desc: string, key: keyof PrivacySettings) => {
    return (
      <div className="flex justify-between items-center py-3 border-b border-slate-850 last:border-b-0">
        <div className="max-w-[75%]">
          <span className="text-xs font-bold text-white block">{label}</span>
          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">{desc}</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={settings[key]} 
            onChange={(e) => onUpdate(key, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
        </label>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition duration-200 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-850 pb-3 mb-4 select-none">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
          Data Sharing & Compliance Settings
        </h4>
      </div>

      {/* Grid: Toggles */}
      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/80 divide-y divide-slate-850">
        {toggleRow("Clinical Health Data Sharing", "Enable streaming biometric telemetry to authorized caregivers and clinicians.", "health_data")}
        {toggleRow("GPS Coordinate Tracking", "Allow guardian and responders to identify location coordinates during dispatches.", "location")}
        {toggleRow("mmWave Radar Monitoring", "Allows estimated heart rate and respiration tracking via non-wearable radar nodes.", "radar")}
        {toggleRow("Privacy-Aware Edge Vision", "Allows gatekeeper camera nodes to parse occupancy poses. Feeds are processed strictly at local gateway.", "camera")}
        {toggleRow("Doctor Portal Access", "Grants Dr. Swamy active authorization to view long-term logs.", "doctor_access")}
        {toggleRow("Guardian Dashboard Access", "Enables your designated family monitor (Rahul Sharma) to verify your status.", "guardian_access")}
        {toggleRow("First-Responder Matching Access", "Authorize closest medical students to accept dispatches during emergency alerts.", "volunteer_access")}
      </div>

      {/* Edge Vision Flow Diagram */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 select-none">
        <div className="flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edge-Vision Architecture</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-normal">
          Raw video signals never leave the residence. Gait and posture checks are computed on-device (gateway) and converted strictly to metadata text tags before network uploads.
        </p>

        {/* Visual pipeline block */}
        <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-850/80 text-[9px] font-mono text-center">
          <div className="flex-1">
            <span className="text-rose-500 font-bold block">Raw Video Frame</span>
            <span className="text-slate-500 block mt-0.5">~120 KB (Local)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="flex-1">
            <span className="text-amber-500 font-bold block">Edge Vision Node</span>
            <span className="text-slate-500 block mt-0.5">Gateway Inference</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="flex-1">
            <span className="text-emerald-400 font-bold block">Event Metadata</span>
            <span className="text-slate-500 block mt-0.5">"On Floor" (0.1 KB)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
