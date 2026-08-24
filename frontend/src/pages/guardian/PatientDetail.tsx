import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientDetail } from '../../hooks/usePatientDetail';
import { useGuardianEmergency } from '../../hooks/guardian/useGuardianEmergency';
import SafetyStatusCard from '../../components/guardian/SafetyStatusCard';
import HealthSummaryCard from '../../components/guardian/HealthSummaryCard';
import DeviceStatusCard from '../../components/guardian/DeviceStatusCard';
import LocationMap from '../../components/guardian/LocationMap';
import EmergencyTimeline from '../../components/guardian/EmergencyTimeline';
import EmergencyActionPanel from '../../components/guardian/EmergencyActionPanel';
import AIExplanationCard from '../../components/doctor/AIExplanationCard';
import RiskForecastChart from '../../components/doctor/RiskForecastChart';
import { 
  ChevronLeft, 
  Heart, 
  MapPin, 
  Clock, 
  Pill, 
  Users, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Info,
  AlertCircle 
} from 'lucide-react';

export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patient, history, loading, error, refetch } = usePatientDetail(patientId || '');
  const { reportEmergency } = useGuardianEmergency();
  const [activeTab, setActiveTab] = useState<'health' | 'risk' | 'emergency' | 'location' | 'care' | 'medication' | 'privacy'>('health');
  
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('Patient fell');
  const [reportMsg, setReportMsg] = useState('');

  // Privacy consents config mock check
  const [privacyScopes, setPrivacyScopes] = useState<any>({
    health_summary: true,
    vitals: true,
    location: "emergency_only",
    prescriptions: true,
    doctor_notes: false,
    radar: "summary_only",
    camera: false
  });

  const [meds, setMeds] = useState<any[]>([]);
  const [docUpdates, setDocUpdates] = useState<any[]>([]);

  useEffect(() => {
    const fetchAuxDetails = async () => {
      if (!patientId) return;
      try {
        const mRes = await fetch(`/api/guardian/patients/${patientId}/medications`);
        if (mRes.ok) {
          const mData = await mRes.ok ? await mRes.json() : [];
          setMeds(mData);
        }
        const dRes = await fetch(`/api/guardian/patients/${patientId}/doctor-updates`);
        if (dRes.ok) {
          const dData = await dRes.ok ? await dRes.json() : [];
          setDocUpdates(dData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAuxDetails();
  }, [patientId]);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await reportEmergency(patientId || '', reportType, reportMsg);
    if (success) {
      alert("Manual SOS dispatch sent. Emergency coordinators notified.");
      setReportOpen(false);
      setReportMsg('');
      refetch();
    }
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
        Error loading patient profile details: {error || "Patient not found"}
      </div>
    );
  }

  const p = patient.profile;
  const v = patient.vitals;

  const getStatusColor = (status: string) => {
    if (status === "Critical") return "bg-rose-950/40 text-rose-455 border border-rose-900/60";
    if (status === "Monitor") return "bg-amber-950/40 text-amber-455 border border-amber-900/60";
    return "bg-emerald-950/40 text-emerald-450 border border-emerald-900/60";
  };

  const getStatusLabel = (status: string) => {
    if (status === "Critical") return "🚨 EMERGENCY";
    if (status === "Monitor") return "🟡 ATTENTION";
    return "🟢 SAFE";
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Back button and profile header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/guardian/family")}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">{p.name}</h1>
              <span className={`text-[9px] font-black px-2.5 py-0.5 rounded font-mono ${getStatusColor(patient.status)}`}>
                {getStatusLabel(patient.status)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Patient Ref: {patient.id} | Age: {p.age} | Gender: {p.gender}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-850 flex flex-wrap gap-1.5 select-none text-xs font-bold bg-slate-950/40 p-1.5 rounded-xl w-full max-w-4xl">
        <button 
          onClick={() => setActiveTab('health')}
          className={`flex-1 py-2 text-center rounded-lg transition min-w-[90px] ${activeTab === 'health' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Health status
        </button>
        <button 
          onClick={() => setActiveTab('risk')}
          className={`flex-1 py-2 text-center rounded-lg transition min-w-[90px] ${activeTab === 'risk' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          AI Risk Score
        </button>
        <button 
          onClick={() => setActiveTab('emergency')}
          className={`flex-1 py-2 text-center rounded-lg transition min-w-[90px] ${activeTab === 'emergency' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Emergencies
        </button>
        <button 
          onClick={() => setActiveTab('location')}
          className={`flex-1 py-2 text-center rounded-lg transition min-w-[90px] ${activeTab === 'location' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          GPS Location
        </button>
        <button 
          onClick={() => setActiveTab('care')}
          className={`flex-1 py-2 text-center rounded-lg transition min-w-[90px] ${activeTab === 'care' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Care Team
        </button>
        <button 
          onClick={() => setActiveTab('medication')}
          className={`flex-1 py-2 text-center rounded-lg transition min-w-[90px] ${activeTab === 'medication' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Medications
        </button>
        <button 
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-2 text-center rounded-lg transition min-w-[90px] ${activeTab === 'privacy' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Privacy scopes
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <SafetyStatusCard status={patient.status} riskScore={patient.risk_score} />
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Real-time physiological telemetry</span>
              <HealthSummaryCard vitals={patient.vitals} />
            </div>

            {/* mmWave Radar */}
            {privacyScopes.radar !== 'none' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl select-none">
                <div className="border-b border-slate-850 pb-3 mb-4">
                  <span className="text-xs font-bold text-slate-405 uppercase tracking-wider block flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-405" />
                    Non-Contact mmWave Radar tracking
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Estimated by radar. Clearly labeled non-clinical parameters.</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase">Radar Link</span>
                    <span className="text-xs font-bold text-emerald-450 mt-1 block">Connected</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase">Estimated HR</span>
                    <span className="text-sm font-bold text-white mt-1 block">{v.radarHeartRate || 0} BPM</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase">Estimated Resp</span>
                    <span className="text-sm font-bold text-white mt-1 block">{v.radarRespiration || 0}/min</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase">Gait posture</span>
                    <span className="text-xs font-bold text-indigo-400 mt-1 block">{v.activity || "Standing"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-4 space-y-6">
            <DeviceStatusCard heartRate={v.heartRate} />
            <EmergencyActionPanel 
              patientPhone={p.phone} 
              doctorPhone="+91 91234 56789" 
              volunteerPhone="+91 98765 43210" 
              isEmergency={patient.status === 'Critical'}
              onManualSOS={() => setReportOpen(true)}
            />
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RiskForecastChart score={patient.risk_score} />
          <AIExplanationCard score={patient.risk_score} conditions={p.conditions || ""} />
        </div>
      )}

      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <EmergencyTimeline activeEmergency={patient.status === 'Critical'} />
          </div>
          <div className="lg:col-span-4">
            <EmergencyActionPanel 
              patientPhone={p.phone} 
              doctorPhone="+91 91234 56789" 
              volunteerPhone="+91 98765 43210" 
              isEmergency={patient.status === 'Critical'}
              onManualSOS={() => setReportOpen(true)}
            />
          </div>
        </div>
      )}

      {activeTab === 'location' && (
        <div className="max-w-2xl mx-auto">
          <LocationMap 
            sharingStatus={privacyScopes.location === 'always' ? 'Always ON' : 'Emergency Only'} 
            coords={privacyScopes.location === 'always' || patient.status === 'Critical' ? { lat: 19.076, lng: 72.877 } : null}
            patientName={p.name}
            isEmergency={patient.status === 'Critical'}
          />
        </div>
      )}

      {activeTab === 'care' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none text-xs">
          
          {/* Doctor details */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block border-b border-slate-850 pb-2.5">Clinician Coordinator</span>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Dr. Arvind Swamy</h4>
              <p className="text-slate-400">Primary Cardiologist | Narayana Health Clinic</p>
              <div className="flex justify-between font-mono pt-2 border-t border-slate-850/60 text-[10px]">
                <span>Status:</span> <span className="text-emerald-400 font-bold">🟢 Available</span>
              </div>
            </div>
          </div>

          {/* Volunteer details */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block border-b border-slate-850 pb-2.5">Allied volunteer responder</span>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Rahul</h4>
              <p className="text-slate-400">Verified Community Responder</p>
              <div className="flex justify-between font-mono pt-2 border-t border-slate-850/60 text-[10px]">
                <span>Dispatch status:</span> <span className="text-emerald-450 font-bold">✓ Matched</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'medication' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-2.5 select-none">Medication Adherence Log</span>
          
          <div className="space-y-3 max-w-xl">
            {meds.length === 0 ? (
              <p className="text-slate-500 font-mono text-xs">No active medications records parsed or shared.</p>
            ) : (
              meds.map((m, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex justify-between items-center select-none text-xs">
                  <div>
                    <span className="font-bold text-white block text-sm">{m.medicine}</span>
                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Scheduled at: {m.time}</span>
                  </div>
                  <span className={`font-mono text-[9px] font-black px-2 py-0.5 rounded border ${
                    m.status === 'taken' 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' 
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {m.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 max-w-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-2.5 select-none">Guardian Access Permissions scopes</span>
          
          <div className="space-y-3 font-mono text-xs select-none">
            <div className="flex justify-between items-center py-2 border-b border-slate-850 last:border-0">
              <span className="text-slate-400">Health summary details:</span>
              <span className="text-emerald-405 font-bold">✓ Allowed</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-850 last:border-0">
              <span className="text-slate-400">GPS location coordinate tracking:</span>
              <span className="text-indigo-405 font-bold">Emergency Only</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-850 last:border-0">
              <span className="text-slate-400">Prescriptions listing:</span>
              <span className="text-emerald-405 font-bold">✓ Allowed</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-850 last:border-0">
              <span className="text-slate-400">Doctor consultation notes:</span>
              <span className="text-rose-500 font-bold">✕ Private (Blocked)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-850 last:border-0">
              <span className="text-slate-400">Edge camera images:</span>
              <span className="text-rose-500 font-bold">✕ Disabled (Opt-out)</span>
            </div>
          </div>
        </div>
      )}

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
export type { PatientDetail };
