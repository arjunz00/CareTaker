import React, { useState } from 'react';
import { User, Shield, Info } from 'lucide-react';
import { PatientProfileData } from '../hooks/usePatient';

interface ProfileFormProps {
  initialProfile: PatientProfileData;
  onSave: (data: PatientProfileData) => Promise<boolean>;
}

export default function ProfileForm({
  initialProfile,
  onSave
}: ProfileFormProps) {
  const [profile, setProfile] = useState<PatientProfileData>({ ...initialProfile });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (key: keyof PatientProfileData, value: any) => {
    setProfile(prev => {
      const updated = { ...prev, [key]: value };
      
      // Auto-calculate BMI if weight and height are provided
      if (key === 'weight' || key === 'height') {
        const w = Number(updated.weight);
        const h = Number(updated.height) / 100; // in meters
        if (w > 0 && h > 0) {
          updated.bmi = Number((w / (h * h)).toFixed(1));
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const ok = await onSave(profile);
    if (ok) {
      setMsg({ text: "Profile details updated successfully.", type: "success" });
    } else {
      setMsg({ text: "Failed to update profile details. Try again.", type: "error" });
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {msg && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold ${
          msg.type === 'success' 
            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/60' 
            : 'bg-rose-950/20 text-rose-400 border-rose-900/60'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Grid: Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        
        {/* Section 1: Demographics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
            <User className="w-4 h-4 text-indigo-400" />
            1. Personal Demographics
          </h4>
          
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={(e) => handleChange("name", e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  value={profile.dob} 
                  onChange={(e) => handleChange("dob", e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Gender</label>
                <select 
                  value={profile.gender} 
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
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
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  disabled
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Mailing Address</label>
              <textarea 
                value={profile.address} 
                onChange={(e) => handleChange("address", e.target.value)}
                required
                rows={2}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Health Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
            <Info className="w-4 h-4 text-indigo-400" />
            2. Physiological baseline
          </h4>
          
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  value={profile.height || ''} 
                  onChange={(e) => handleChange("height", Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  value={profile.weight || ''} 
                  onChange={(e) => handleChange("weight", Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">BMI Index</label>
                <input 
                  type="text" 
                  value={profile.bmi || ''} 
                  disabled
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Blood Group</label>
                <input 
                  type="text" 
                  value={profile.blood_group || ''} 
                  onChange={(e) => handleChange("blood_group", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                  placeholder="e.g. O+ (Positive)"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Mobility Status</label>
                <input 
                  type="text" 
                  value={profile.mobility_status || ''} 
                  onChange={(e) => handleChange("mobility_status", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                  placeholder="e.g. Ambulatory with cane"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Chronic Conditions</label>
              <input 
                type="text" 
                value={profile.conditions || ''} 
                onChange={(e) => handleChange("conditions", e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                placeholder="e.g. Hypertension, Post-stroke checks"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Known Allergies</label>
              <input 
                type="text" 
                value={profile.allergies || ''} 
                onChange={(e) => handleChange("allergies", e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                placeholder="e.g. Penicillin, Pollen"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Save Button */}
      <div className="flex justify-end select-none">
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-8 rounded-xl border border-indigo-500 shadow-lg shadow-indigo-600/10 transition active:scale-95 disabled:opacity-50 uppercase tracking-wider"
        >
          {saving ? "Saving Changes..." : "Save Profile baseline"}
        </button>
      </div>

    </form>
  );
}
