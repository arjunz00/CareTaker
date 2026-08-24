import React, { useState } from 'react';
import { usePatient } from '../hooks/usePatient';
import { useVitals } from '../hooks/useVitals';
import { useRisk } from '../hooks/useRisk';
import { useEmergency } from '../hooks/useEmergency';
import { usePrescriptions } from '../hooks/usePrescriptions';
import VitalCard from '../components/VitalCard';
import VitalChart from '../components/VitalChart';
import RiskCard from '../components/RiskCard';
import DeviceStatusCard from '../components/DeviceStatusCard';
import DoctorCard from '../components/DoctorCard';
import CareTeamCard from '../components/CareTeamCard';
import HealthAssistant from '../components/HealthAssistant';
import ReportExportModal from '../components/ReportExportModal';
import { Heart, Droplets, Thermometer, User, Compass, Download, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const { profile, loading: patientLoading } = usePatient();
  const { vitals, history } = useVitals();
  const risk = useRisk();
  const { activeEmergency, volunteer } = useEmergency();
  const { prescriptions } = usePrescriptions();
  const [reportOpen, setReportOpen] = useState(false);

  const getRiskColorClass = (s: number) => {
    if (s >= 70) return 'text-rose-500 font-bold';
    if (s >= 40) return 'text-amber-500 font-bold';
    return 'text-emerald-400 font-bold';
  };

  const getHealthStatusText = (s: number) => {
    if (s >= 70) return 'UNSTABLE (CRITICAL)';
    if (s >= 40) return 'UNSTABLE (MODERATE)';
    return 'STABLE';
  };

  // Demo presentation triggers matching backend endpoints
  const triggerDemoAction = async (action: string) => {
    try {
      if (action === 'fall') {
        // Trigger simulated IMU fall in backend
        await fetch("/api/fall", { method: "POST" });
      } else if (action === 'normal') {
        // Cancel active alarm
        await fetch("/api/cancel", { method: "POST" });
      } else if (action === 'accept') {
        // Dispatch volunteer matching
        await fetch("/api/volunteers/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            volunteer_id: "V101",
            event_id: activeEmergency?.id || "E101",
            action: "ACCEPT"
          })
        });
      } else if (action === 'complete') {
        // Complete volunteer care
        await fetch("/api/volunteers/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            volunteer_id: "V101",
            event_id: activeEmergency?.id || "E101",
            action: "COMPLETE"
          })
        });
      }
    } catch (e) {
      console.error("Demo action trigger failed:", e);
    }
  };

  if (patientLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Presentation Demo Banner */}
      <div className="bg-slate-900 border border-indigo-900/60 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 select-none shadow-xl">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div>
            <strong className="text-xs text-white block uppercase tracking-wide">Presentation Demo Dashboard Controller</strong>
            <p className="text-[10px] text-slate-500 mt-0.5">Use these buttons to demonstrate system escalation workflows to judges.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => triggerDemoAction('fall')}
            className="flex-1 md:flex-none bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 text-[10px] font-bold py-2 px-3.5 rounded-lg border border-rose-900/50 transition active:scale-95 uppercase tracking-wider"
          >
            🚨 Trigger Fall Anomaly
          </button>
          <button 
            onClick={() => triggerDemoAction('accept')}
            disabled={!activeEmergency}
            className="flex-1 md:flex-none bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-400 text-[10px] font-bold py-2 px-3.5 rounded-lg border border-indigo-900/50 transition active:scale-95 uppercase tracking-wider disabled:opacity-40"
          >
            🤝 Dispatch Responder
          </button>
          <button 
            onClick={() => triggerDemoAction('complete')}
            disabled={!volunteer}
            className="flex-1 md:flex-none bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 text-[10px] font-bold py-2 px-3.5 rounded-lg border border-emerald-900/50 transition active:scale-95 uppercase tracking-wider disabled:opacity-40"
          >
            ✓ Complete Care
          </button>
          <button 
            onClick={() => triggerDemoAction('normal')}
            className="flex-1 md:flex-none bg-slate-950 hover:bg-slate-800 text-slate-400 text-[10px] font-bold py-2 px-3.5 rounded-lg border border-slate-850 transition active:scale-95 uppercase tracking-wider"
          >
            Reset System
          </button>
        </div>
      </div>

      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white leading-tight">Good Evening, {profile?.name || "Savita Sharma"}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Edge monitoring system is running. Vitals stable.</p>
        </div>
        <button 
          onClick={() => setReportOpen(true)}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold py-2.5 px-5 rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Download Health Record</span>
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none font-mono">
        
        {/* Risk Score */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl shadow-lg flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">AI Risk Score</span>
            <span className={`text-2xl font-black block mt-0.5 ${getRiskColorClass(risk.score)}`}>{risk.score} / 100</span>
          </div>
          <span className="text-[10px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-slate-400">Predictive</span>
        </div>

        {/* Health Status */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl shadow-lg flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Assessment Status</span>
            <span className={`text-sm font-black block mt-1.5 ${getRiskColorClass(risk.score)}`}>
              {getHealthStatusText(risk.score)}
            </span>
          </div>
        </div>

        {/* IoT pairing Status */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl shadow-lg flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Sensor Wearable</span>
            <span className="text-emerald-400 text-sm font-black block mt-1.5">CONNECTED</span>
          </div>
        </div>

        {/* Global alarm status */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl shadow-lg flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Gateway Status</span>
            <span className={`text-sm font-black block mt-1.5 ${
              activeEmergency ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
            }`}>
              {activeEmergency ? activeEmergency.status.replace("_", " ") : "SECURED"}
            </span>
          </div>
        </div>

      </div>

      {/* Risk Assessment block */}
      <RiskCard />

      {/* Biometrics Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Heart Rate */}
        <VitalCard
          title="PPG Heart Rate"
          value={vitals.heartRate}
          unit="BPM"
          icon={Heart}
          iconColor="text-rose-500"
          rangeLabel="65 - 85 BPM"
          statusLabel={vitals.heartRate > 100 || vitals.heartRate < 50 ? "Anomaly" : "Stable"}
          statusColor={vitals.heartRate > 100 || vitals.heartRate < 50 ? "red" : "green"}
        >
          <VitalChart data={history} dataKey="hr" strokeColor="#ef4444" />
        </VitalCard>

        {/* Oxygen SpO2 */}
        <VitalCard
          title="Oxygen Saturation"
          value={vitals.spo2}
          unit="%"
          icon={Droplets}
          iconColor="text-sky-400"
          rangeLabel="96% - 100%"
          statusLabel={vitals.spo2 < 93 ? "Hypoxia Alert" : "Stable"}
          statusColor={vitals.spo2 < 93 ? "red" : "green"}
        >
          <VitalChart data={history} dataKey="spo2" strokeColor="#38bdf8" />
        </VitalCard>

        {/* Temp */}
        <VitalCard
          title="Skin Temperature"
          value={vitals.temperature}
          unit="°C"
          icon={Thermometer}
          iconColor="text-amber-500"
          rangeLabel="36.2°C - 37.2°C"
          statusLabel={vitals.temperature > 38.0 ? "Fever Warning" : "Normal"}
          statusColor={vitals.temperature > 38.0 ? "amber" : "green"}
        >
          <VitalChart data={history} dataKey="temp" strokeColor="#f59e0b" />
        </VitalCard>

      </div>

      {/* Secondary Grid (Topology, Care Team, Chat Care Assistant) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left column (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <DeviceStatusCard />
          <CareTeamCard />
        </div>

        {/* Right column (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <DoctorCard />
          <HealthAssistant 
            currentVitals={vitals}
            prescriptions={prescriptions}
            riskScore={risk.score}
          />
        </div>

      </div>

      {/* Export excel Modal */}
      <ReportExportModal 
        isOpen={reportOpen} 
        onClose={() => setReportOpen(false)} 
      />

    </div>
  );
}
