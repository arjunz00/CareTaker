import React from 'react';
import { useDoctorNotes } from '../../hooks/useDoctorNotes';
import ClinicalNotesPanel from '../../components/doctor/ClinicalNotesPanel';
import { FileText } from 'lucide-react';

export default function DoctorNotes() {
  const { notes, addNote, loading } = useDoctorNotes('P001');

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
            <FileText className="w-5 h-5 text-indigo-400" />
            Clinical Notes Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Review private clinical assessments and patient-visible guidance logs.</p>
        </div>
      </div>

      <ClinicalNotesPanel
        notes={notes}
        onSave={addNote}
      />

    </div>
  );
}
