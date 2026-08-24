import React from 'react';
import { Pill, CheckCircle, Clock } from 'lucide-react';
import { Prescription, AdherenceLog } from '../hooks/usePrescriptions';

interface PrescriptionCardProps {
  prescription: Prescription;
  adherence: AdherenceLog[];
  onToggle: (timeSlot: string, medicine: string, currentStatus: 'taken' | 'pending') => void;
}

export default function PrescriptionCard({
  prescription,
  adherence,
  onToggle
}: PrescriptionCardProps) {

  // Schedules based on frequency
  const timeSlots = [
    { label: "Morning (08:00)", time: "08:00" },
    { label: "Afternoon (14:00)", time: "14:00" },
    { label: "Night (20:00)", time: "20:00" }
  ];

  const getAdherenceStatus = (time: string) => {
    const record = adherence.find(a => a.time_slot === time && a.medicine === prescription.medicine);
    return record ? record.status : 'pending';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition duration-200 space-y-4">
      
      {/* Title & Medicine name */}
      <div className="flex justify-between items-start border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-950/60 border border-indigo-900 text-indigo-400 rounded-xl">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white block">{prescription.medicine}</h4>
            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Rx Ref: {prescription.id}</span>
          </div>
        </div>
        <span className="text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
          {prescription.status}
        </span>
      </div>

      {/* Details list */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div><span className="text-slate-500 font-mono">Dosage:</span> <span className="text-slate-200 font-medium ml-1">{prescription.dosage}</span></div>
        <div><span className="text-slate-500 font-mono">Frequency:</span> <span className="text-slate-200 font-medium ml-1">{prescription.frequency}</span></div>
        <div><span className="text-slate-500 font-mono">Duration:</span> <span className="text-slate-200 font-medium ml-1">{prescription.duration}</span></div>
        <div><span className="text-slate-500 font-mono">Doctor:</span> <span className="text-slate-200 font-semibold ml-1">{prescription.doctor}</span></div>
        <div className="col-span-2 mt-1 border-t border-slate-850/60 pt-1.5">
          <span className="text-slate-500 font-mono block">Instructions:</span>
          <span className="text-slate-300 italic text-[11px] block mt-0.5">"{prescription.instructions}"</span>
        </div>
      </div>

      {/* Adherence Checkboxes */}
      <div className="border-t border-slate-850 pt-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Medication Adherence Tracker</span>
        <div className="space-y-2">
          {timeSlots.map((slot) => {
            const status = getAdherenceStatus(slot.time);
            return (
              <div 
                key={slot.time}
                onClick={() => onToggle(slot.time, prescription.medicine, status)}
                className={`flex justify-between items-center p-2.5 rounded-xl border cursor-pointer select-none transition ${
                  status === 'taken' 
                    ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400' 
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{slot.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {status === 'taken' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Taken</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 border border-slate-800 rounded-full"></div>
                      <span className="text-[10px] uppercase tracking-wider">Mark Taken</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
export type { PrescriptionCardProps };
