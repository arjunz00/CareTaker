import React, { useState } from 'react';
import { FileText, Plus, Shield, MessageSquare } from 'lucide-react';
import { DoctorNote } from '../../hooks/useDoctorNotes';

interface ClinicalNotesPanelProps {
  notes: DoctorNote[];
  onSave: (patientVisible: string, privateNote: string) => Promise<boolean>;
}

export default function ClinicalNotesPanel({
  notes,
  onSave
}: ClinicalNotesPanelProps) {
  const [patientVisible, setPatientVisible] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientVisible.trim() && !privateNote.trim()) return;

    setSubmitting(true);
    const success = await onSave(patientVisible, privateNote);
    if (success) {
      setPatientVisible('');
      setPrivateNote('');
      alert("Clinical notes updated.");
    }
    setSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Note Editor Form (5 cols) */}
      <form onSubmit={handleSubmit} className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5 select-none">
          <Plus className="w-4.5 h-4.5 text-indigo-400" />
          Log Clinical Notes
        </h4>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Patient-Visible Instructions
            </label>
            <textarea
              required
              value={patientVisible}
              onChange={(e) => setPatientVisible(e.target.value)}
              rows={3}
              placeholder="e.g. Continue monitoring activity and attend follow-up."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-650"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Private Clinician Comments
            </label>
            <textarea
              required
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              rows={3}
              placeholder="Private diagnosis codes, observations of baseline deviations, diagnostic comments..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-650"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl border border-indigo-550 shadow-md transition active:scale-95 disabled:opacity-50 uppercase tracking-wider"
        >
          {submitting ? "Saving note..." : "Save clinical notes"}
        </button>
      </form>

      {/* Historical List (7 cols) */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col max-h-[500px]">
        <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-850 pb-2.5 select-none">
          <FileText className="w-4.5 h-4.5 text-indigo-400" />
          Clinical Log History
        </h4>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-10 font-mono text-xs text-slate-500">No clinical notes recorded.</div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 text-xs leading-normal">
                <div className="flex justify-between items-center text-[10px] text-slate-500 select-none font-mono">
                  <span>Author: {note.doctor_name}</span>
                  <span>{note.date}</span>
                </div>
                
                {/* Guidelines */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Patient Instructions:</span>
                  <p className="text-slate-350 italic">"{note.patient_visible}"</p>
                </div>

                {/* Private comments */}
                <div className="border-t border-slate-900 pt-2.5 space-y-1 bg-slate-900/30 p-2.5 rounded-lg border border-slate-850/50">
                  <span className="text-[9px] text-rose-450 font-bold uppercase tracking-wider block font-mono flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Private Comments:
                  </span>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{note.private_note}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
