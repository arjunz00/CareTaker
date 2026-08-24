import React, { useState, useEffect } from 'react';
import { useFamily, FamilyMember } from '../../hooks/guardian/useFamily';
import { useGuardianEmergency } from '../../hooks/guardian/useGuardianEmergency';
import SafetyStatusCard from '../../components/guardian/SafetyStatusCard';
import HealthSummaryCard from '../../components/guardian/HealthSummaryCard';
import DeviceStatusCard from '../../components/guardian/DeviceStatusCard';
import LocationMap from '../../components/guardian/LocationMap';
import EmergencyTimeline from '../../components/guardian/EmergencyTimeline';
import EmergencyActionPanel from '../../components/guardian/EmergencyActionPanel';
import AIExplanationCard from '../../components/doctor/AIExplanationCard';
import RiskForecastChart from '../../components/doctor/RiskForecastChart';
import { ShieldCheck, ShieldAlert, Users, Layers, AlertCircle, Info } from 'lucide-react';

export default function GuardianDashboard() {
  const { family, loading, refetch } = useFamily();
  const [selectedId, setSelectedId] = useState('P001');
  const [patientData, setPatientData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('Patient fell');
  const [reportMsg, setReportMsg] = useState('');
  const { reportEmergency } = useGuardianEmergency();

  // Selected member profile
  const activeMember = family.find(m => m.id === selectedId);

  const fetchPatientDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/guardian/patients/${id}/summary`);
      if (res.ok) {
        const data = await res.json();
        setPatientData(data);
      }
      
      const vRes = await fetch(`/api/guardian/patients/${id}/vitals`);
      if (vRes.ok) {
        const hData = await vRes.json();
        setHistory(hData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedId) fetchPatientDetails(selectedId);
  }, [selectedId, family]);

  // WebSocket real-time updates sync
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/telemetry`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          // Rajesh Kumar (P002) is emulator target
          if (selectedId === "P002") {
            setPatientData((prev: any) => {
              if (!prev) return null;
              const status = payload.state.state !== "NORMAL" ? "Critical" : payload.risk_score > 40 ? "Monitor" : "Stable";
              return {
                ...prev,
                status: status,
                risk_score: payload.risk_score,
                vitals: {
                  heartRate: payload.consent.ppg_enabled ? payload.latest.heart_rate : 0,
                  spo2: payload.consent.spo2_enabled ? payload.latest.spo2 : 0,
                  temperature: payload.latest.body_temp,
                  respirationRate: 16,
                  activity: payload.latest.camera_pose || "Resting"
                }
              };
            });
          }
        } catch (e) {
          console.error(e);
        }
      };
      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [selectedId]);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await reportEmergency(selectedId, reportType, reportMsg);
    if (success) {
      alert("Manual emergency SOS dispatched. Responders matching triggered.");
      setReportOpen(false);
      setReportMsg('');
      refetch();
    }
  };

  // Trigger Demo simulations loops
  const runDemoSimulation = async (stateKey: string) => {
    try {
      const res = await fetch(`/api/emulator/trigger?state=${stateKey}`, { method: 'POST' });
      if (res.ok) {
        refetch();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !activeMember) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Title & Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Good Evening, Rahul Sharma
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Your family's active safety and telemetry workspace.</p>
        </div>

        {/* Member dropdown switch */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 font-semibold shadow-md">
          <label className="mr-2 text-slate-500">Selected patient:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-transparent focus:outline-none text-white cursor-pointer"
          >
            {family.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900">{m.name} ({m.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Demo Presentation banner */}
      <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-3xl space-y-3 shadow-xl">
        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          Hackathon Presentation Demo Controller
        </span>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <button onClick={() => runDemoSimulation("NORMAL")} className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-800 transition active:scale-95">Stable Safe State</button>
          <button onClick={() => runDemoSimulation("RISK_INCREASE")} className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-800 transition active:scale-95">Elevate Risk score</button>
          <button onClick={() => runDemoSimulation("FALL_DETECTED")} className="bg-rose-950/60 hover:bg-rose-950 border border-rose-900/60 text-rose-400 py-1.5 px-3 rounded-lg transition active:scale-95 font-bold">Simulate Fall detected</button>
          <button onClick={() => runDemoSimulation("NO_RESPONSE")} className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-800 transition active:scale-95">No Response timeout</button>
          <button onClick={() => runDemoSimulation("GUARDIAN_NOTIFIED")} className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-800 transition active:scale-95">Guardian Notified</button>
          <button onClick={() => runDemoSimulation("DOCTOR_NOTIFIED")} className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-800 transition active:scale-95">Doctor Notified</button>
          <button onClick={() => runDemoSimulation("RESPONDER_ASSIGNED")} className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-800 transition active:scale-95">Volunteer approaching</button>
          <button onClick={() => runDemoSimulation("RESOLVED")} className="bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-900/60 text-emerald-450 py-1.5 px-3 rounded-lg transition active:scale-95 font-bold">Resolve emergency</button>
        </div>
      </div>

      {/* Prominent Large Safety Status Indicator */}
      <SafetyStatusCard 
        status={activeMember.status} 
        riskScore={activeMember.risk_score} 
      />

      {/* Main Grid: Left summaries, Right side status panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Health summary */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Current Health summary</h3>
            <HealthSummaryCard vitals={patientData?.vitals} />
          </div>

          {/* mmWave Radar details if permitted */}
          {patientData?.scopes?.radar !== 'none' && patientData?.radar && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl select-none">
              <div className="border-b border-slate-850 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Estimated Non-Contact mmWave Radar metrics
                </span>
                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Estimated by radar. Non-clinical parameters.</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 block uppercase">Radar Link</span>
                  <span className="text-xs font-bold text-emerald-450 mt-1 block">Connected</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 block uppercase">Estimated HR</span>
                  <span className="text-sm font-bold text-white mt-1 block">{patientData.radar.radarHeartRate} BPM</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 block uppercase">Estimated Respiration</span>
                  <span className="text-sm font-bold text-white mt-1 block">{patientData.radar.radarRespiration}/min</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 block uppercase">Posture Pose</span>
                  <span className="text-xs font-bold text-indigo-400 mt-1 block">{patientData.radar.posture}</span>
                </div>
              </div>
            </div>
          )}

          {/* AI explaining changes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RiskForecastChart score={activeMember.risk_score} />
            <AIExplanationCard score={activeMember.risk_score} conditions="Type 2 Diabetes" />
          </div>

          {/* Baseline Deviations */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-2 select-none font-mono">
              Personal Baseline Comparison indices
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono select-none">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
                <span className="text-[9px] text-slate-500 block uppercase">Today's Activity</span>
                <span className="text-lg font-black text-white mt-1 block">72%</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
                <span className="text-[9px] text-slate-500 block uppercase">Typical baseline</span>
                <span className="text-lg font-black text-slate-400 mt-1 block">84%</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
                <span className="text-[9px] text-slate-500 block uppercase">Difference</span>
                <span className="text-lg font-black text-rose-400 mt-1 block">-12% deviation</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-550 leading-relaxed font-sans mt-2 italic select-none">
              "Activity is slightly below the patient's recent baseline. Vitals remain within expected normal variations."
            </p>
          </div>

        </div>

        {/* Right Side (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Emergency timelines */}
          {activeMember.status === 'Critical' && (
            <div className="space-y-4 animate-pulse">
              <h3 className="text-rose-500 font-bold uppercase tracking-widest text-[10px] select-none">🔴 Active Emergency timelines</h3>
              <EmergencyTimeline activeEmergency={true} />
            </div>
          )}

          {/* Location map */}
          <LocationMap
            sharingStatus={patientData?.location?.sharing || "Emergency Only"}
            coords={patientData?.location?.coords}
            patientName={activeMember.name}
            isEmergency={activeMember.status === 'Critical'}
          />

          {/* Action Desk */}
          <EmergencyActionPanel
            patientPhone="+91 98765 43210"
            doctorPhone="+91 91234 56789"
            volunteerPhone="+91 98765 43210"
            isEmergency={activeMember.status === 'Critical'}
            onManualSOS={() => setReportOpen(true)}
          />

          {/* Device indicators */}
          <DeviceStatusCard heartRate={activeMember.device_status === 'Connected' ? 74 : 0} />

        </div>

      </div>

      {/* Manual Emergency Report Modal Form */}
      {reportOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none animate-fadeIn">
          <form onSubmit={handleReport} className="bg-slate-900 border border-slate-750 max-w-sm w-full p-6 rounded-3xl shadow-2xl relative space-y-4">
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-center flex items-center justify-center gap-1.5 text-rose-500">
              <AlertCircle className="w-5 h-5 animate-bounce" />
              Report Manual Emergency
            </h3>
            <p className="text-[10px] text-slate-500 text-center leading-normal">Manually trigger responders dispatch. Only use in true emergencies.</p>

            <div className="space-y-3.5 text-xs text-sans">
              <div>
                <label className="text-slate-400 block mb-1">What happened?</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-505"
                >
                  <option value="Patient fell">Patient fell</option>
                  <option value="Patient is unconscious">Patient is unconscious</option>
                  <option value="Patient is having difficulty breathing">Patient is having difficulty breathing</option>
                  <option value="Patient is missing/unreachable">Patient is missing/unreachable</option>
                  <option value="Other">Other emergency incident</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Additional description details (Optional)</label>
                <textarea
                  value={reportMsg}
                  onChange={(e) => setReportMsg(e.target.value)}
                  rows={2}
                  placeholder="Provide details about symptoms, current location, or status..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-505 placeholder-slate-700"
                />
              </div>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl flex gap-2 items-start text-[9px] text-indigo-400 leading-normal font-sans">
              <Info className="w-4 h-4 text-indigo-450 shrink-0 mt-0.5" />
              <span>
                <strong>System Notice:</strong> Manual emergency triggers automatically sync with the Doctor Workspace on-call queue and Navi Mumbai Allied Volunteers network. Not a substitute for official services.
              </span>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-450 font-bold py-2.5 rounded-xl transition border border-slate-750"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl border border-rose-550 shadow-lg active:scale-95 transition"
              >
                Confirm SOS Trigger
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
