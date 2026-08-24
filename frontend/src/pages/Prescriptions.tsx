import React from 'react';
import { usePrescriptions } from '../hooks/usePrescriptions';
import PrescriptionCard from '../components/PrescriptionCard';
import { Heart, Info } from 'lucide-react';

export default function Prescriptions() {
  const { prescriptions, adherence, loading, toggleAdherence } = usePrescriptions();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Heart className="w-5 h-5 text-indigo-400" />
            Active Clinical Prescriptions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Verify medication durations, frequencies, and adherence checklists.</p>
        </div>
      </div>

      {/* Main prescription list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prescriptions.map((rx) => (
          <PrescriptionCard 
            key={rx.id} 
            prescription={rx} 
            adherence={adherence} 
            onToggle={toggleAdherence} 
          />
        ))}
      </div>

      {/* Advisory warnings */}
      <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-2xl flex gap-3 items-start text-xs text-indigo-400 select-none max-w-2xl leading-relaxed">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block uppercase tracking-wider text-[10px] font-bold mb-1">Medication Adherence Safety Protocols</strong>
          The AI Care Assistant chatbot cannot alter or discontinue prescriptions independently. Medication adjustments must be done strictly under physician guidance. If you experience severe side effects, trigger the SOS alarm or call emergency services immediately.
        </div>
      </div>

    </div>
  );
}
