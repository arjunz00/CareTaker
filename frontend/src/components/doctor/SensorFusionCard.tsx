import React from 'react';
import { Layers, ShieldCheck, HelpCircle } from 'lucide-react';

interface SensorFusionCardProps {
  score: number;
}

export default function SensorFusionCard({ score }: SensorFusionCardProps) {
  
  const getModalityStatus = (key: 'wearable' | 'radar' | 'vision') => {
    if (key === 'wearable') {
      return (
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">AegisWatch IMU + PPG:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            ✓ Motion anomaly parsed
          </span>
        </div>
      );
    } else if (key === 'radar') {
      return (
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">mmWave Occupancy Radar:</span>
          <span className={`font-bold flex items-center gap-1 ${
            score >= 70 ? 'text-amber-450' : 'text-emerald-400'
          }`}>
            ✓ Posture check: {score >= 70 ? "Lying (Floor)" : "Standing/Resting"}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Privacy-Preserving Edge Vision:</span>
          <span className="text-slate-500 font-medium italic">
            ○ Disabled (Opted out)
          </span>
        </div>
      );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-850 pb-3 select-none">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4.5 h-4.5 text-indigo-400" />
          Multimodal Sensor Fusion Evidence
        </h4>
        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Coordinating signals fusions from distinct edge nodes.</span>
      </div>

      {/* Checklist */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 font-mono">
        {getModalityStatus("wearable")}
        {getModalityStatus("radar")}
        {getModalityStatus("vision")}

        {/* Fused Confidence */}
        <div className="border-t border-slate-900 pt-2.5 flex justify-between items-center text-xs">
          <span className="text-slate-400">Fused Event Confidence:</span>
          <span className={`font-black ${score >= 70 ? 'text-rose-500' : 'text-emerald-400'}`}>
            {score >= 70 ? "92% (High Correlation)" : "Stable Check (Normal)"}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 leading-normal select-none font-sans">
        <strong>Fusion explanation:</strong> System increases diagnostic accuracy and cuts false alarms by verifying wearable signals against room mmWave occupancy grids and edge cameras.
      </p>

    </div>
  );
}
export type { SensorFusionCardProps };
