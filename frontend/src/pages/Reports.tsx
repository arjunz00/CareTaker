import React, { useState } from 'react';
import { Download, AlertTriangle, Info, CheckSquare } from 'lucide-react';
import { useReports } from '../hooks/useReports';

export default function Reports() {
  const { downloading, error, downloadExcelReport } = useReports();
  const [range, setRange] = useState<'today' | '7d' | '30d'>('7d');
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
    await downloadExcelReport();
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            Health Reports & Record Compilation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Download encrypted medical parameters and sensor history logs in Excel format.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left config (7 cols) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Step 1: Range */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">1. Select Record Time Range</span>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850 select-none">
                <button 
                  onClick={() => setRange("today")}
                  className={`py-2 text-[10px] font-bold rounded-lg transition ${
                    range === "today" ? "bg-indigo-650 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Today (24h)
                </button>
                <button 
                  onClick={() => setRange("7d")}
                  className={`py-2 text-[10px] font-bold rounded-lg transition ${
                    range === "7d" ? "bg-indigo-650 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Last 7 Days
                </button>
                <button 
                  onClick={() => setRange("30d")}
                  className={`py-2 text-[10px] font-bold rounded-lg transition ${
                    range === "30d" ? "bg-indigo-650 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Last 30 Days
                </button>
              </div>
            </div>

            {/* Step 2: Columns */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">2. Check Sections to Include</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-300">
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.profile} 
                    onChange={() => toggleSelect("profile")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
                  />
                  Patient Profile details
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.vitals} 
                    onChange={() => toggleSelect("vitals")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
                  />
                  Vitals & Activity log
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.history} 
                    onChange={() => toggleSelect("history")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
                  />
                  SOS Emergency timeline logs
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.prescriptions} 
                    onChange={() => toggleSelect("prescriptions")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
                  />
                  Physician Prescriptions
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.adherence} 
                    onChange={() => toggleSelect("adherence")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
                  />
                  Medication Adherence log
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.notes} 
                    onChange={() => toggleSelect("notes")}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-650"
                  />
                  Clinical consultations summary
                </label>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[10px] text-rose-500 text-center font-mono font-bold animate-pulse">{error}</p>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl border border-indigo-500 shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 uppercase tracking-wider"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Compiling Excel Spreadsheet...
              </>
            ) : (
              <>
                <Download className="w-4.5 h-4.5" />
                Compile and Download Health Record
              </>
            )}
          </button>
        </div>

        {/* Right warnings info (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          {/* Warning display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs select-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              PHI Security Disclaimer
            </span>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-[10px] text-slate-400 leading-relaxed font-sans">
              <strong>Patient health record protection:</strong> AegisNet compiles records in accordance with HIPAA standards. Downloaded spreadsheets contain unencrypted names, biometrics, and baseline prescriptions. Store safely. Do not share on public networks.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
