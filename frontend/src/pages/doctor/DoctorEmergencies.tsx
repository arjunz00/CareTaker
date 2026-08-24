import React from 'react';
import { useEmergency } from '../../hooks/useEmergency';
import EmergencyTimeline from '../../components/EmergencyTimeline';
import { AlertOctagon, Phone, ShieldAlert, CheckCircle, Navigation, Users, Shield } from 'lucide-react';

export default function DoctorEmergencies() {
  const { activeEmergency, volunteer, history, loading, triggerSOS, cancelEmergency, resolveEmergency } = useEmergency();

  const handleEscalate = () => {
    alert("[Demo Emergency Escalation] Dispatching ambulance support via local gateway services...");
  };

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
            <AlertOctagon className="w-5 h-5 text-indigo-400" />
            Emergency Center & Dispatch Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Acknowledge critical alerts, contact responders, and escalate support dispatches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left active details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeEmergency ? (
            <div className="space-y-6">
              
              {/* Critical active flag card */}
              <div className="bg-rose-950/20 border-2 border-rose-500 p-6 rounded-2xl space-y-4 shadow-2xl select-none alarm-alert-active text-center">
                <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto animate-bounce" />
                <div>
                  <h3 className="text-lg font-black text-rose-300 uppercase tracking-wider">🚨 Active Fall Incident detected</h3>
                  <p className="text-xs text-rose-200 mt-1">Sensing nodes verify patient is currently inactive. Responder dispatched.</p>
                </div>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-2.5 justify-center pt-3">
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
                  <button 
                    onClick={handleEscalate}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-xl border border-rose-550 transition shadow-lg active:scale-95 uppercase tracking-wider mt-1"
                  >
                    Demo Emergency Escalation (Ambulance)
                  </button>
                </div>
              </div>

              {/* Responder Timeline */}
              <EmergencyTimeline 
                activeEmergency={activeEmergency} 
                volunteer={volunteer} 
              />

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center select-none text-slate-500 space-y-3 shadow-xl">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Clinician Hub Secure</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">No active patient fall alarms currently registered. Edge nodes monitoring normally.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right maps & coordinator details (5 cols) */}
        <div className="lg:col-span-5 space-y-6 select-none text-xs">
          
          {/* Mock GPS locator Map */}
          {activeEmergency && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block border-b border-slate-850 pb-2.5 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-indigo-400" />
                Live GPS Incident Map
              </span>
              
              {/* Map container */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 h-48 relative flex flex-col justify-end overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-25"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500 flex items-center justify-center animate-ping"></div>
                  <div className="w-4 h-4 rounded-full bg-rose-500 absolute"></div>
                </div>
                
                <div className="relative z-10 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[9px] text-slate-400 flex justify-between items-center">
                  <span>Incident Location: Home coordinates</span>
                  <span className="font-bold text-rose-500 uppercase font-mono">19.076° N, 72.877° E</span>
                </div>
              </div>

              {/* Responders ETA details */}
              {volunteer && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Responder ETA:</span>
                  </div>
                  <span className="font-bold text-emerald-400 font-mono">6 mins ({volunteer.distance} km)</span>
                </div>
              )}
            </div>
          )}

          {/* Incident Log directory */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block border-b border-slate-850 pb-2">
              Recent Emergency incidents ledger
            </span>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-6 font-mono text-slate-500 text-[10px]">No logs recorded.</div>
              ) : (
                history.map((ev) => (
                  <div key={ev.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-1.5 font-mono text-[9px]">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{ev.type}</span>
                      <span className={`px-2 py-0.5 rounded border ${getStatusColor(ev.status)}`}>{ev.status}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>ID: {ev.id}</span>
                      <span>Score: {ev.risk_score}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
