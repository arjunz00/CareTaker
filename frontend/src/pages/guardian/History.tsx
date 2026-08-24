import React, { useState, useEffect } from 'react';
import { FileText, Clock } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/guardian/audit-log");
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Compliance Access Audits Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Check secure telemetry query trails logged under your credentials.</p>
        </div>
      </div>

      <div className="max-w-xl space-y-3 font-mono text-[10px]">
        {loading ? (
          <div className="text-center py-6"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : history.length === 0 ? (
          <p className="text-slate-500 text-xs">No audits registered.</p>
        ) : (
          history.map((h, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-white block text-xs">{h.action}</span>
                <span className="text-slate-500 text-[9px] block mt-0.5">Executor: {h.guardian || h.doctor} {h.patient ? `| Patient: ${h.patient}` : ''}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] bg-slate-950 text-emerald-450 border border-slate-850 px-2 py-0.5 rounded uppercase font-bold">{h.status}</span>
                <span className="text-[8px] text-slate-500 block mt-1">{new Date(h.timestamp * 1000).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
