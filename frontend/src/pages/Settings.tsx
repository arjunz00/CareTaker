import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Lock, Bell, BellOff } from 'lucide-react';

export default function Settings() {
  const [pass, setPass] = useState({ old: '••••••••', new: '', confirm: '' });
  const [notif, setNotif] = useState(true);
  const [tfa, setTfa] = useState(false);

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            System Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Configure secure passwords, connected networks, and alert thresholds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none text-xs">
        
        {/* Security & Password settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
            <Lock className="w-4 h-4 text-indigo-400" />
            Portal Security & Password
          </h4>
          
          <div className="space-y-3.5">
            <div>
              <label className="text-slate-400 block mb-1">Old Password</label>
              <input 
                type="password" 
                value={pass.old} 
                disabled
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-500 font-mono cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">New Password</label>
              <input 
                type="password" 
                value={pass.new} 
                onChange={(e) => setPass(prev => ({ ...prev, new: e.target.value }))}
                placeholder="Enter new password"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850 mt-2">
              <div>
                <span className="font-bold text-white block">Two-Factor Authentication</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Placeholder secure authentication gate.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={tfa} 
                  onChange={(e) => setTfa(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Thresholds and Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <Shield className="w-4.5 h-4.5 text-indigo-400" />
              Gateway Threshold Calibration
            </h4>
            
            <div className="space-y-3 text-slate-450 leading-relaxed font-sans">
              <div className="flex justify-between">
                <span>Fall Detection Impact Threshold:</span>
                <span className="font-bold text-slate-200 font-mono">3.2 G-force</span>
              </div>
              <div className="flex justify-between">
                <span>Inactivity confirmation time:</span>
                <span className="font-bold text-slate-200 font-mono">60 seconds stillness</span>
              </div>
              <div className="flex justify-between border-t border-slate-850 pt-2.5">
                <span>Heart Rate anomaly low/high limit:</span>
                <span className="font-bold text-slate-200 font-mono">50 - 120 BPM</span>
              </div>
              <div className="flex justify-between">
                <span>SpO₂ warning floor limit:</span>
                <span className="font-bold text-rose-500 font-mono">92% saturation</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850/60 text-[10px] text-slate-500 leading-normal mt-4">
            <strong>Calibration Notice:</strong> These thresholds are automatically adjusted by the edge machine learning models based on your historical gait pace. Manual calibration requires clinician supervision.
          </div>
        </div>

      </div>

    </div>
  );
}
