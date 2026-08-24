import React from 'react';
import { useEmergency } from '../hooks/useEmergency';
import EmergencyTimeline from '../components/EmergencyTimeline';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Emergency() {
  const { activeEmergency, volunteer, history, loading, resolveEmergency, cancelEmergency } = useEmergency();

  const getStatusColor = (status: string) => {
    if (status === "RESOLVED") return "bg-emerald-950 text-emerald-400 border-emerald-900";
    if (status === "WARNING_COUNTDOWN") return "bg-amber-950 text-amber-400 border-amber-900 animate-pulse";
    return "bg-rose-950 text-rose-400 border-rose-900";
  };

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
            <AlertTriangle className="w-5 h-5 text-indigo-400" />
            Emergency Center & Matching Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Trigger urgent alarms, cancel false counts, and inspect volunteer dispatches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Emergency / Timeline columns (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeEmergency ? (
            <div className="space-y-6">
              {/* Critical Alert card */}
              <div className="bg-rose-950/20 border-2 border-rose-500 p-6 rounded-2xl space-y-4 shadow-2xl alarm-alert-active select-none text-center">
                <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto animate-bounce" />
                <div>
                  <h3 className="text-lg font-black text-rose-300 uppercase tracking-wider">🚨 Confirming Emergency Dispatch</h3>
                  <p className="text-xs text-rose-200 mt-1">AegisNet gateway is matching nearby responders. Stay calm.</p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 justify-center max-w-sm mx-auto pt-2">
                  <button 
                    onClick={cancelEmergency}
                    className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-350 text-xs font-bold py-2.5 rounded-xl border border-slate-800 transition active:scale-95"
                  >
                    False Alarm - Cancel
                  </button>
                  <button 
                    onClick={resolveEmergency}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl border border-emerald-500 transition shadow-lg active:scale-95"
                  >
                    Resolve Incident
                  </button>
                </div>
              </div>

              {/* Timeline matching */}
              <EmergencyTimeline 
                activeEmergency={activeEmergency} 
                volunteer={volunteer} 
              />
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center select-none text-slate-500 space-y-3 shadow-xl">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Armed & Secure</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">No active emergency alerts registered. Wearable sensors are running nominal baseline checks.</p>
              </div>
            </div>
          )}
        </div>

        {/* Emergency logs history (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col overflow-hidden max-h-[500px]">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 select-none">
            <Clock className="w-4 h-4 text-indigo-400" />
            Emergency History Records
          </h4>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-10 font-mono text-xs text-slate-500">No emergency logs available.</div>
            ) : (
              history.map((ev) => {
                const dateStr = new Date(ev.timestamp * 1000).toLocaleString();
                return (
                  <div key={ev.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-2 font-mono text-[10px]">
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>Ref ID: {ev.id}</span>
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{ev.type}</span>
                      <span className={`px-2 py-0.5 rounded border text-[8px] font-bold ${getStatusColor(ev.status)}`}>
                        {ev.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-550 border-t border-slate-900 pt-1.5 mt-1">
                      <span>Risk: {ev.risk_score}/100</span>
                      {ev.assigned_volunteer_id && <span>Responder matched</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
