import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, FileText, UserCheck } from 'lucide-react';

export interface AuditLogItem {
  timestamp: number;
  action: string;
  patient?: string;
  doctor: string;
  status: string;
}

export default function DoctorPrivacy() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/doctor/audit-logs");
        if (res.ok) {
          const data = await res.ok ? await res.json() : [];
          setLogs(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Compliance, Privacy & Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Audit active data access streams and check secure clinical credential access lists.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Audit Log Trail (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col overflow-hidden max-h-[520px]">
          <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-850 pb-2.5 select-none">
            <Clock className="w-4.5 h-4.5 text-indigo-400" />
            Data Access Log Ledger
          </h4>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {loading ? (
              <div className="text-center py-6"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 font-mono text-slate-500 text-[10px]">No compliance actions recorded.</div>
            ) : (
              logs.map((log, idx) => {
                const dateStr = new Date(log.timestamp * 1000).toLocaleString();
                return (
                  <div key={idx} className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex justify-between items-center font-mono text-[10px]">
                    <div className="space-y-1">
                      <span className="font-bold text-white block text-xs">{log.action}</span>
                      <span className="text-[9px] text-slate-500 block">Clinician: {log.doctor} {log.patient ? `| Patient: ${log.patient}` : ''}</span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded uppercase font-bold">{log.status}</span>
                      <span className="text-[8px] text-slate-500 block">{dateStr}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Informative Side Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6 select-none leading-relaxed">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <UserCheck className="w-4.5 h-4.5 text-indigo-400" />
              Clinician Scope Permissions
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <p>
                <strong>✓ Patient Directory Scope:</strong> Access is limited strictly to patients registered under your narration.
              </p>
              <p>
                <strong>✓ Security Auditing:</strong> Every action including viewing profile summaries, reading prescriptions, and downloading Excel files writes a cryptographic log event.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
