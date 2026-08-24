import React, { useState } from 'react';
import { Download, AlertTriangle, X } from 'lucide-react';
import { useReports } from '../hooks/useReports';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportExportModal({
  isOpen,
  onClose
}: ReportExportModalProps) {
  const { downloading, error, downloadExcelReport } = useReports();
  const [selectedItems, setSelectedItems] = useState({
    profile: true,
    vitals: true,
    history: true,
    prescriptions: true,
    adherence: true,
    notes: true
  });

  const handleCheckboxChange = (key: keyof typeof selectedItems) => {
    setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerDownload = async () => {
    const success = await downloadExcelReport();
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-750 max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-5 relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-950/80 border border-indigo-900 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Compile Health Records</h3>
          <p className="text-[10px] text-slate-500 mt-1">Select sections to compile into an Excel spreadsheet.</p>
        </div>

        {/* Content list */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5 text-xs text-slate-300">
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={selectedItems.profile} 
              onChange={() => handleCheckboxChange("profile")}
              className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
            />
            Patient Profile Details
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={selectedItems.vitals} 
              onChange={() => handleCheckboxChange("vitals")}
              className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
            />
            Vitals Signs & Activity History
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={selectedItems.history} 
              onChange={() => handleCheckboxChange("history")}
              className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
            />
            SOS Emergency Timeline Records
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={selectedItems.prescriptions} 
              onChange={() => handleCheckboxChange("prescriptions")}
              className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
            />
            Active Doctor Prescriptions
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={selectedItems.adherence} 
              onChange={() => handleCheckboxChange("adherence")}
              className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
            />
            Medication Adherence Log
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={selectedItems.notes} 
              onChange={() => handleCheckboxChange("notes")}
              className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
            />
            Clinical Doctor Notes Summary
          </label>
        </div>

        {/* Warning Callout */}
        <div className="bg-amber-950/20 border border-amber-900/60 p-3 rounded-xl flex gap-2.5 items-start text-[10px] text-amber-400">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block uppercase tracking-wider text-[9px] font-bold mb-0.5">Sensitive Health Information</strong>
            This file contains protected personal biometrics, diagnoses, and medical histories. Store and transmit securely.
          </div>
        </div>

        {error && (
          <p className="text-[10px] text-rose-500 text-center font-mono font-bold animate-pulse">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2.5">
          <button 
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white font-bold text-xs py-2.5 rounded-xl border border-slate-750 transition"
          >
            Cancel
          </button>
          <button 
            onClick={triggerDownload}
            disabled={downloading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl border border-indigo-500 shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Compiling...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Continue Download
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
export type { ReportExportModalProps };
