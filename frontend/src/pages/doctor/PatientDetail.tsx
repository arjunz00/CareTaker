import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientDetail } from '../../hooks/usePatientDetail';
import { useDoctorNotes } from '../../hooks/useDoctorNotes';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import VitalCard from '../../components/VitalCard';
import VitalChart from '../../components/VitalChart';
import RiskForecastChart from '../../components/doctor/RiskForecastChart';
import AIExplanationCard from '../../components/doctor/AIExplanationCard';
import SensorFusionCard from '../../components/doctor/SensorFusionCard';
import PrescriptionForm from '../../components/doctor/PrescriptionForm';
import ClinicalNotesPanel from '../../components/doctor/ClinicalNotesPanel';
import ReportExportModal from '../../components/ReportExportModal';
import { 
  Heart, 
  Droplets, 
  Thermometer, 
  Layers, 
  Activity, 
  User, 
  Clock, 
  ChevronLeft, 
  FileText, 
  Pill, 
  MessageSquare,
  ShieldCheck,
  Download
} from 'lucide-react';

export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patient, history, loading, error, refetch } = usePatientDetail(patientId || '');
  const { notes, addNote } = useDoctorNotes(patientId || '');
  const { prescriptions, toggleAdherence, refetch: refetchRx } = usePrescriptions();
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'activity' | 'airisk' | 'rx' | 'notes'>('overview');
  const [rxFormOpen, setRxFormOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Filter prescriptions for this patient
  const patientEmail = patient?.email || '';
  const patientRx = prescriptions.filter(r => r.status === 'Active');

  const getStatusColor = (status: string) => {
    if (status === "Critical") return "bg-rose-950/40 text-rose-450 border border-rose-900/60";
    if (status === "Monitor") return "bg-amber-950/40 text-amber-450 border border-amber-900/60";
    return "bg-emerald-950/40 text-emerald-400 border border-emerald-900/60";
  };

  const getStatusLabel = (status: string) => {
    if (status === "Critical") return "🔴 CRITICAL";
    if (status === "Monitor") return "🟡 MONITOR";
    return "🟢 STABLE";
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6 text-center text-rose-500 font-mono font-bold">
        Error loading patient records: {error || "Patient not found"}
      </div>
    );
  }

  const p = patient.profile;
  const v = patient.vitals;

  return (
    <div className="p-6 space-y-6">
      
      {/* Back button and profile header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/doctor/patients")}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{p.name}</h1>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded font-mono ${getStatusColor(patient.status)}`}>
                {getStatusLabel(patient.status)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Patient ID: {patient.id} | Age: {p.age} | Gender: {p.gender}</p>
          </div>
        </div>

        <button 
          onClick={() => setReportOpen(true)}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold py-2.5 px-5 rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Compile Clinical Report</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="border-b border-slate-850 flex gap-2 select-none text-xs font-bold bg-slate-950/40 p-1 rounded-xl w-full max-w-2xl">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-center rounded-lg transition ${activeTab === 'overview' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('vitals')}
          className={`flex-1 py-2 text-center rounded-lg transition ${activeTab === 'vitals' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Vitals Monitoring
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-2 text-center rounded-lg transition ${activeTab === 'activity' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Activity baseline
        </button>
        <button 
          onClick={() => setActiveTab('airisk')}
          className={`flex-1 py-2 text-center rounded-lg transition ${activeTab === 'airisk' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          AI Decision Support
        </button>
        <button 
          onClick={() => setActiveTab('rx')}
          className={`flex-1 py-2 text-center rounded-lg transition ${activeTab === 'rx' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Prescriptions
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 text-center rounded-lg transition ${activeTab === 'notes' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Clinical Notes
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Medical Summary Details (8 cols) */}
          <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-indigo-400" />
              Patient Physiological baseline
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-500 block uppercase">Height</span>
                <span className="font-bold text-white block mt-1">{p.height} cm</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-500 block uppercase">Weight</span>
                <span className="font-bold text-white block mt-1">{p.weight} kg</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-500 block uppercase">BMI Index</span>
                <span className="font-bold text-white block mt-1">{p.bmi}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-500 block uppercase">Blood Group</span>
                <span className="font-bold text-white block mt-1">{p.blood_group || "--"}</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold">Chronic Conditions:</span>
                <span className="text-slate-350 block mt-0.5">{p.conditions || "None logged"}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Known Allergies:</span>
                <span className="text-rose-400 block mt-0.5">{p.allergies || "No known allergies"}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Active Medications:</span>
                <span className="text-slate-300 block mt-0.5">{p.medications || "None"}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Mobility Status:</span>
                <span className="text-slate-300 block mt-0.5">{p.mobility_status || "Ambulatory"}</span>
              </div>
            </div>
          </div>

          {/* KPI Vitals card (4 cols) */}
          <div className="md:col-span-4 space-y-6">
            <SensorFusionCard score={patient.risk_score} />
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs select-none">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block border-b border-slate-850 pb-2">Edge Gateway pairing</span>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between"><span>ESP32 Processor:</span> <span className="text-emerald-400 font-bold">Online</span></div>
                <div className="flex justify-between"><span>MPU6050 Motion:</span> <span className="text-emerald-400 font-bold">Working</span></div>
                <div className="flex justify-between"><span>MAX30102 PPG:</span> <span className="text-emerald-400 font-bold">Working</span></div>
                <div className="flex justify-between"><span>mmWave Occupancy:</span> <span className="text-emerald-400 font-bold">Online</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VITALS MONITORING */}
      {activeTab === 'vitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VitalCard
            title="Heart Rate (PPG)"
            value={v.heartRate}
            unit="BPM"
            icon={Heart}
            iconColor="text-rose-500"
            rangeLabel="60 - 90 BPM"
            statusLabel={v.heartRate > 100 || v.heartRate < 50 ? "Anomaly" : "Stable"}
            statusColor={v.heartRate > 100 || v.heartRate < 50 ? "red" : "green"}
          >
            <VitalChart data={history} dataKey="hr" strokeColor="#ef4444" />
          </VitalCard>

          <VitalCard
            title="Blood Oxygen (SpO₂)"
            value={v.spo2}
            unit="%"
            icon={Droplets}
            iconColor="text-sky-400"
            rangeLabel="95% - 100%"
            statusLabel={v.spo2 < 93 ? "Hypoxia" : "Stable"}
            statusColor={v.spo2 < 93 ? "red" : "green"}
          >
            <VitalChart data={history} dataKey="spo2" strokeColor="#38bdf8" />
          </VitalCard>

          <VitalCard
            title="Skin Temperature"
            value={v.temperature}
            unit="°C"
            icon={Thermometer}
            iconColor="text-amber-500"
            rangeLabel="36.2 - 37.2 °C"
            statusLabel="Normal"
            statusColor="green"
          >
            <VitalChart data={history} dataKey="temp" strokeColor="#f59e0b" />
          </VitalCard>

          {/* mmWave Radar estimates */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div className="border-b border-slate-850 pb-3 select-none">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Non-Contact mmWave Radar estimates
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Estimations derived from chest motions. Clearly labeled non-clinical measurements.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 my-4 text-center font-mono select-none">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 block uppercase">Radar HR Estimate</span>
                <span className="text-lg font-bold text-white block mt-1">{v.radarHeartRate} BPM</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 block uppercase">Radar Respiration</span>
                <span className="text-lg font-bold text-white block mt-1">{v.radarRespiration}/min</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal bg-slate-950 p-2.5 rounded-lg border border-slate-850">
              <strong>Disclaimer:</strong> Radar estimates are not clinical parameters. They are decision-support motion signals only.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY BASELINE */}
      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2 select-none">
              <Activity className="w-4.5 h-4.5 text-indigo-400" />
              Posture Timeline & Baseline deviation
            </h4>
            <div className="space-y-4 text-xs font-mono select-none">
              <div className="flex justify-between">
                <span>Today's active walking:</span>
                <span className="font-bold text-white">72% of average</span>
              </div>
              <div className="flex justify-between">
                <span>Personal Baseline average:</span>
                <span className="font-bold text-slate-400">84% active</span>
              </div>
              <div className="flex justify-between text-rose-450 border-t border-slate-850 pt-2">
                <span>Deviation:</span>
                <span className="font-bold">-12% deviation pattern</span>
              </div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-[10px] text-slate-550 leading-relaxed">
              <strong>AI Decision Observation:</strong> Patient activity has decreased over the last 3 hours compared with their recent baseline. Review walking profiles.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI DECISION SUPPORT */}
      {activeTab === 'airisk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RiskForecastChart score={patient.risk_score} />
          <AIExplanationCard score={patient.risk_score} conditions={p.conditions || ""} />
        </div>
      )}

      {/* TAB 5: PRESCRIPTIONS */}
      {activeTab === 'rx' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-3 select-none">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4.5 h-4.5 text-indigo-400" />
              Prescribed Medications Record
            </h4>
            <button 
              onClick={() => setRxFormOpen(true)}
              className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-[10px] py-2 px-4 rounded-xl uppercase tracking-wider shadow-lg transition active:scale-95"
            >
              Add Prescription
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientRx.length === 0 ? (
              <div className="text-center py-6 font-mono text-xs text-slate-500 col-span-2">No active prescriptions written for this patient.</div>
            ) : (
              patientRx.map((rx) => (
                <div key={rx.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 text-xs leading-normal">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white block">{rx.medicine}</span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded uppercase font-mono">{rx.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-400 font-mono text-[10px]">
                    <div>Dosage: <span className="text-white ml-1">{rx.dosage}</span></div>
                    <div>Frequency: <span className="text-white ml-1">{rx.frequency}</span></div>
                    <div>Duration: <span className="text-white ml-1">{rx.duration}</span></div>
                    <div>Date: <span className="text-white ml-1">{rx.date}</span></div>
                  </div>
                  <div className="border-t border-slate-900 pt-2 text-[10px] text-slate-450 italic">
                    "{rx.instructions}"
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CLINICAL NOTES */}
      {activeTab === 'notes' && (
        <ClinicalNotesPanel
          notes={notes}
          onSave={addNote}
        />
      )}

      {/* Modals */}
      <PrescriptionForm
        patientId={patient.id}
        patientName={p.name}
        isOpen={rxFormOpen}
        onClose={() => setRxFormOpen(false)}
        onSuccess={() => {
          refetchRx();
          alert("Prescription added successfully. Patient notified.");
        }}
      />

      <ReportExportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />

    </div>
  );
}
