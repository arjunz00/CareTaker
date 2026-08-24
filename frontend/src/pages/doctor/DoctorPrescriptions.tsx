import React, { useState } from 'react';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { Pill, Info } from 'lucide-react';
import PrescriptionForm from '../../components/doctor/PrescriptionForm';

export default function DoctorPrescriptions() {
  const { prescriptions, adherence, loading, refetch } = usePrescriptions();
  const [rxFormOpen, setRxFormOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('P001');

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
            <Pill className="w-5 h-5 text-indigo-400" />
            Medication Prescription Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Manage clinical prescriptions, write new directives, and verify dosage audits.</p>
        </div>
        <button 
          onClick={() => setRxFormOpen(true)}
          className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl uppercase tracking-wider shadow-lg transition active:scale-95"
        >
          Create Prescription
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition space-y-3.5 text-xs">
            <div className="flex justify-between items-start border-b border-slate-850 pb-3">
              <div>
                <span className="font-bold text-white block text-sm">{rx.medicine}</span>
                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Rx Ref: {rx.id}</span>
              </div>
              <span className="text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded uppercase font-mono">
                {rx.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[10px]">
              <div>Dosage: <span className="text-white font-sans font-medium ml-1">{rx.dosage}</span></div>
              <div>Frequency: <span className="text-white font-sans font-medium ml-1">{rx.frequency}</span></div>
              <div>Duration: <span className="text-white font-sans font-medium ml-1">{rx.duration}</span></div>
              <div>Clinician: <span className="text-white font-sans font-semibold ml-1">{rx.doctor}</span></div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-[10px] text-slate-350 italic mt-2">
              "{rx.instructions}"
            </div>
          </div>
        ))}
      </div>

      {/* Warning disclaimers */}
      <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-2xl flex gap-3 items-start text-xs text-indigo-400 select-none max-w-2xl leading-relaxed">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block uppercase tracking-wider text-[10px] font-bold mb-1">Medication Safety Protocols</strong>
          The AI Care Assistant chatbot cannot alter or discontinue prescriptions independently. Medication adjustments must be done strictly under physician guidance. If you experience severe side effects, trigger the SOS alarm or call emergency services immediately.
        </div>
      </div>

      {/* Prescription Form Modal */}
      <PrescriptionForm
        patientId={selectedPatientId}
        patientName="Savita Sharma"
        isOpen={rxFormOpen}
        onClose={() => setRxFormOpen(false)}
        onSuccess={() => {
          refetch();
          alert("Prescription added successfully. Patient notified.");
        }}
      />

    </div>
  );
}
