import React, { useState } from 'react';
import { Download, AlertTriangle, Info } from 'lucide-react';
import { useReports } from '../../hooks/useReports';

export default function DoctorReports() {
  const { downloading, error, downloadExcelReport } = useReports();
  const [selectedPatientId, setSelectedPatientId] = useState('P001');
  const [selectedItems, setSelectedItems] = useState({
    profile: true,
    vitals: true,
    history: true,
    prescriptions: true,
    adherence: true,
    notes: true
  });

  const toggleSelect = (key: keyof typeof selectedItems) => {
    setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = async () => {
    // Modify report hook or directly fetch doctor excel report API
    setExcelDownload();
  };

  const setExcelDownload = async () => {
    try {
      const res = await fetch(`/api/doctor/reports/excel?patient_id=${selectedPatientId}`);
      if (!res.ok) throw new Error("Failed to download Excel report.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AegisNet_ClinicalReport_${selectedPatientId}_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || "Failed to download spreadsheet.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            Patient Clinical Reports compiler
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Download clinical spreadsheets detailing patient profiles, historical vitals, notes, and audits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Config (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Patient Selector */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">1. Select Target Patient</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="P001">Savita Sharma (P001)</option>
                <option value="P002">Rajesh Kumar (P002)</option>
                <option value="P003">Ramesh Patel (P003)</option>
                <option value="P004">Lakshmi Iyer (P004)</option>
                <option value="P005">Gopinath Pillai (P005)</option>
                <option value="P006">Ananya Rao (P006)</option>
                <option value="P007">Vikram Mehta (P007)</option>
                <option value="P008">Sarla Devi (P008)</option>
                <option value="P009">Devendra Nath (P009)</option>
                <option value="P010">Meera Nair (P010)</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">2. Check Sections to include</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 select-none">
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.profile} 
                    onChange={() => toggleSelect("profile")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                  />
                  Patient Profile details
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.vitals} 
                    onChange={() => toggleSelect("vitals")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                  />
                  PPG Vitals & Activity history
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.history} 
                    onChange={() => toggleSelect("history")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                  />
                  Emergency timeline logs
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.prescriptions} 
                    onChange={() => toggleSelect("prescriptions")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                  />
                  Clinician Prescriptions
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.adherence} 
                    onChange={() => toggleSelect("adherence")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                  />
                  Medication Adherence logs
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.notes} 
                    onChange={() => toggleSelect("notes")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                  />
                  Doctor Clinical notes
                </label>
              </div>
            </div>

          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl border border-indigo-500 shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 uppercase tracking-wider"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Compiling spreadsheet...
              </>
            ) : (
              <>
                <Download className="w-4.5 h-4.5" />
                Compile and Download Clinical Report
              </>
            )}
          </button>

        </div>

        {/* Info warning (5 cols) */}
        <div className="lg:col-span-5 space-y-6 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              Protected Health Information (PHI)
            </h4>
            
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-[10px] text-slate-450 leading-relaxed font-sans">
              Spreadsheets compiled contain protected physiological data metrics, medical histories, and medications logs. Handle in compliance with health safety data sharing regulations. Downloads are registered to the security auditing ledger under your clinical credentials.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
