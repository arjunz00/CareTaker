import React, { useState } from 'react';
import { Pill, X, AlertTriangle } from 'lucide-react';

interface PrescriptionFormProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PrescriptionForm({
  patientId,
  patientName,
  isOpen,
  onClose,
  onSuccess
}: PrescriptionFormProps) {
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [frequency, setFrequency] = useState('Once daily');
  const [duration, setDuration] = useState('30 days');
  const [instructions, setInstructions] = useState('Take in morning before meals');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/doctor/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          medicine,
          dosage,
          frequency,
          duration,
          instructions,
          notes
        })
      });

      if (!res.ok) throw new Error("Failed to write prescription.");
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-750 max-w-lg w-full p-6 rounded-3xl shadow-2xl relative space-y-4">
        
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center border-b border-slate-850 pb-3">
          <div className="w-12 h-12 bg-indigo-950/80 border border-indigo-900 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-lg">
            <Pill className="w-5.5 h-5.5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create New Prescription</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Drafting prescription for patient: <strong>{patientName} ({patientId})</strong></p>
        </div>

        {error && (
          <p className="text-[10px] text-rose-500 font-mono font-bold text-center animate-pulse">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <label className="text-slate-400 block mb-1">Medication Name & Strength</label>
              <input
                type="text"
                required
                value={medicine}
                onChange={(e) => setMedicine(e.target.value)}
                placeholder="e.g. Amlodipine (5mg)"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-650"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Dosage Form</label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 tablet"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Frequency</label>
              <input
                type="text"
                required
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Once daily"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Duration</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 30 days"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Timing / Instructions</label>
              <input
                type="text"
                required
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Take in morning before meals"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Private Clinician Notes (Unpublished)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Private comments, diagnoses baseline observations..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-650"
            />
          </div>

          <div className="bg-amber-950/20 border border-amber-900/60 p-3 rounded-xl flex gap-2 items-start text-[9px] text-amber-400 leading-normal">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Medication Safety Alert:</strong> By clicking submit, this prescription is logged to the patient's active card ledger and registered to the audit logging vault under your clinical doctor credentials.
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white font-bold py-2.5 rounded-xl border border-slate-750 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-650 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl border border-indigo-550 shadow-lg shadow-indigo-650/15 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Signing Prescr..." : "Create Prescription"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
export type { PrescriptionFormProps };
