import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  Info, 
  Users, 
  Cpu, 
  CheckCircle,
  EyeOff
} from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Step 1: Personal Details
  const [profile, setProfile] = useState({
    name: 'Savita Sharma',
    dob: '1954-08-12',
    age: 72,
    gender: 'Female',
    phone: '+91 98765 43210',
    email: 'savita.sharma@gmail.com',
    address: 'B-402, Seawoods Towers, Sector 40, Navi Mumbai',
    emergency_location: 'B-402, Seawoods Towers, Sector 40, Navi Mumbai'
  });

  // Step 2: Health Info
  const [health, setHealth] = useState({
    height: 158,
    weight: 62,
    bmi: 24.8,
    blood_group: 'O+',
    conditions: 'Mild Hypertension, Post-Stroke mobility tracking',
    allergies: 'Penicillin',
    surgeries: 'Appendectomy (1998)',
    medications: 'Amlodipine 5mg morning, Atorvastatin 10mg night',
    mobility_status: 'Uses cane for outdoor walking',
    fall_history: 'Mild trip in kitchen (Jan 2026)',
    lifestyle: 'Sedentary, light garden walks'
  });

  // Step 3: Contacts
  const [contacts, setContacts] = useState([
    { name: 'Rahul Sharma', relationship: 'Son / Guardian', phone: '+91 99887 76655', email: 'rahul.sharma@gmail.com' },
    { name: 'Dr. Arvind Swamy', relationship: 'Primary Cardiologist', phone: '+91 91234 56789', email: 'arvind.swamy@narayana.org', hospital: 'Narayana Health Clinic' }
  ]);

  // Step 4: Device setup
  const [deviceId, setDeviceId] = useState('AEGIS-GATEWAY-102');
  const [sensors, setSensors] = useState({
    esp32: 'Connected',
    mpu6050: 'Connected',
    max30102: 'Connected',
    radar: 'Connected'
  });

  // Step 5: Privacy
  const [privacy, setPrivacy] = useState({
    health_data: true,
    location: true,
    radar: true,
    camera: true,
    doctor_access: true,
    guardian_access: true,
    volunteer_access: true
  });

  const handleDobChange = (dobVal: string) => {
    const birthYear = new Date(dobVal).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;
    setProfile(prev => ({ ...prev, dob: dobVal, age: calculatedAge }));
  };

  const handleHeightWeightChange = (key: 'height' | 'weight', val: number) => {
    setHealth(prev => {
      const next = { ...prev, [key]: val };
      const h = next.height / 100;
      if (h > 0 && next.weight > 0) {
        next.bmi = Number((next.weight / (h * h)).toFixed(1));
      }
      return next;
    });
  };

  const triggerRegister = async () => {
    setStep(6); // Show Loader / Ready screen
    try {
      const payload = {
        profile: { ...profile, ...health },
        contacts,
        device_id: deviceId,
        consent: privacy
      };

      const res = await fetch("/api/patient/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        // Auto-save session
        const session = {
          authenticated: true,
          email: profile.email,
          name: profile.name,
          role: "patient",
          token: "jwt-registration-token-mock"
        };
        localStorage.setItem("aegis_session", JSON.stringify(session));
        setTimeout(() => {
          navigate("/patient/dashboard");
        }, 1500);
      }
    } catch (e) {
      console.error("Failed to register profile baseline:", e);
      alert("Registration failed. Please make sure the app server is online.");
      setStep(5);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative space-y-6">
        
        {/* Step Indicator Header */}
        {step < 6 && (
          <div className="flex justify-between items-center select-none border-b border-slate-800 pb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step {step} of 5</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <div key={s} className={`w-3.5 h-1.5 rounded-full ${s <= step ? 'bg-indigo-650' : 'bg-slate-800'}`}></div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-indigo-400" />
              1. Personal Information
            </h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={profile.dob} 
                    onChange={(e) => handleDobChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Gender</label>
                  <select 
                    value={profile.gender} 
                    onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={profile.phone} 
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Emergency Dispatch Location</label>
                <textarea 
                  value={profile.emergency_location} 
                  onChange={(e) => setProfile(prev => ({ ...prev, emergency_location: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>
            </div>
            
            <button onClick={() => setStep(2)} className="w-full bg-indigo-650 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl border border-indigo-500 transition shadow-lg select-none">
              Next: Body & Health profile
            </button>
          </div>
        )}

        {/* STEP 2: Health baseline */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-indigo-400" />
              2. Body / Health Profile
            </h3>
            
            <div className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Height (cm)</label>
                  <input 
                    type="number" 
                    value={health.height} 
                    onChange={(e) => handleHeightWeightChange("height", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={health.weight} 
                    onChange={(e) => handleHeightWeightChange("weight", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">BMI Index</label>
                  <input 
                    type="text" 
                    value={health.bmi} 
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Blood Group</label>
                  <input 
                    type="text" 
                    value={health.blood_group} 
                    onChange={(e) => setHealth(prev => ({ ...prev, blood_group: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mobility Status</label>
                  <input 
                    type="text" 
                    value={health.mobility_status} 
                    onChange={(e) => setHealth(prev => ({ ...prev, mobility_status: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Existing Conditions</label>
                <input 
                  type="text" 
                  value={health.conditions} 
                  onChange={(e) => setHealth(prev => ({ ...prev, conditions: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Current Medications</label>
                <input 
                  type="text" 
                  value={health.medications} 
                  onChange={(e) => setHealth(prev => ({ ...prev, medications: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-450 text-xs py-2.5 rounded-xl border border-slate-750 font-bold transition">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-indigo-650 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-xl border border-indigo-500 font-bold transition shadow-lg">Next: Care Team Contacts</button>
            </div>
          </div>
        )}

        {/* STEP 3: Emergency Contacts */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-indigo-400" />
              3. Emergency Contacts
            </h3>
            
            <div className="space-y-4">
              {/* Guardian */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">1. Family / Guardian Contact</span>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    value={contacts[0].name} 
                    onChange={(e) => setContacts(prev => {
                      const next = [...prev]; next[0].name = e.target.value; return next;
                    })}
                    placeholder="Guardian Name" 
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    value={contacts[0].phone} 
                    placeholder="Guardian Phone" 
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>
              {/* Doctor */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">2. Clinical Cardiologist / Physician Contact</span>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    value={contacts[1].name} 
                    placeholder="Doctor Name" 
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    value={contacts[1].phone} 
                    placeholder="Doctor Phone" 
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-450 text-xs py-2.5 rounded-xl border border-slate-750 font-bold transition">Back</button>
              <button onClick={() => setStep(4)} className="flex-1 bg-indigo-650 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-xl border border-indigo-500 font-bold transition shadow-lg">Next: Device Pairing</button>
            </div>
          </div>
        )}

        {/* STEP 4: Device setup */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-indigo-400" />
              4. Hardware Gateway Setup
            </h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-slate-400 block mb-1">Enter AegisNet Gateway Device ID</label>
                <input 
                  type="text" 
                  value={deviceId} 
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Sensor statuses */}
              <div className="space-y-2 border-t border-slate-850 pt-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Paired edge sensors diagnostics:</span>
                
                <div className="flex justify-between items-center text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span>ESP32 Core Processor:</span>
                  <span className="text-emerald-400 font-bold font-mono">CONNECTED</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span>MPU6050 Accelerometer:</span>
                  <span className="text-emerald-400 font-bold font-mono">WORKING</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span>MAX30102 PPG & SpO₂:</span>
                  <span className="text-emerald-400 font-bold font-mono">WORKING</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span>mmWave Occupancy Radar:</span>
                  <span className="text-emerald-400 font-bold font-mono">CONNECTED</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-450 text-xs py-2.5 rounded-xl border border-slate-750 font-bold transition">Back</button>
              <button onClick={() => setStep(5)} className="flex-1 bg-indigo-650 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-xl border border-indigo-500 font-bold transition shadow-lg">Next: Consent</button>
            </div>
          </div>
        )}

        {/* STEP 5: Privacy consent */}
        {step === 5 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <EyeOff className="w-4.5 h-4.5 text-indigo-400" />
              5. Privacy Controls & Consent
            </h3>
            
            <div className="space-y-2 bg-slate-950 border border-slate-850 p-4 rounded-xl max-h-56 overflow-y-auto custom-scrollbar">
              <label className="flex justify-between items-center text-slate-300 border-b border-slate-900 pb-2 cursor-pointer select-none">
                <span>Vitals data sharing</span>
                <input 
                  type="checkbox" 
                  checked={privacy.health_data} 
                  onChange={(e) => setPrivacy(prev => ({ ...prev, health_data: e.target.checked }))}
                  className="rounded text-indigo-600 bg-slate-900 border-slate-800"
                />
              </label>
              <label className="flex justify-between items-center text-slate-300 border-b border-slate-900 py-2 cursor-pointer select-none">
                <span>Emergency location mapping</span>
                <input 
                  type="checkbox" 
                  checked={privacy.location} 
                  onChange={(e) => setPrivacy(prev => ({ ...prev, location: e.target.checked }))}
                  className="rounded text-indigo-600 bg-slate-900 border-slate-800"
                />
              </label>
              <label className="flex justify-between items-center text-slate-300 border-b border-slate-900 py-2 cursor-pointer select-none">
                <span>mmWave Radar scanning</span>
                <input 
                  type="checkbox" 
                  checked={privacy.radar} 
                  onChange={(e) => setPrivacy(prev => ({ ...prev, radar: e.target.checked }))}
                  className="rounded text-indigo-600 bg-slate-900 border-slate-800"
                />
              </label>
              <label className="flex justify-between items-center text-slate-300 border-b border-slate-900 py-2 cursor-pointer select-none">
                <span>Local Edge posturing camera</span>
                <input 
                  type="checkbox" 
                  checked={privacy.camera} 
                  onChange={(e) => setPrivacy(prev => ({ ...prev, camera: e.target.checked }))}
                  className="rounded text-indigo-600 bg-slate-900 border-slate-800"
                />
              </label>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal bg-slate-950 p-2.5 rounded-lg border border-slate-850">
              <strong>GDPR & India DPDP (2023) Notice:</strong> Camera feeds are processed strictly locally. AegisNet gateway discards raw video within 90-second rolling purges, transmitting only parsed event text tags.
            </p>
            
            <div className="flex gap-2">
              <button onClick={() => setStep(4)} className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-450 text-xs py-2.5 rounded-xl border border-slate-750 font-bold transition">Back</button>
              <button onClick={triggerRegister} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-xl border border-indigo-500 font-bold transition shadow-lg">Complete Registration</button>
            </div>
          </div>
        )}

        {/* STEP 6: Loading redirection screen */}
        {step === 6 && (
          <div className="text-center py-10 space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <div>
              <h3 className="text-lg font-black text-white">Your Care Profile is Ready</h3>
              <p className="text-xs text-slate-400 mt-1">Bootstrapping AegisNet Dashboard workspace...</p>
            </div>
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

      </div>
    </div>
  );
}
