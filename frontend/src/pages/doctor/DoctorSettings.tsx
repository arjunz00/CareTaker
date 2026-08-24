import React, { useState } from 'react';
import { Settings, Shield, Lock, Bell, Activity } from 'lucide-react';

export default function DoctorSettings() {
  const [pass, setPass] = useState({ old: '••••••••', new: '', confirm: '' });
  const [alerts, setAlerts] = useState({ fall: true, disconnect: true, risk: true });

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Calibration & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Verify system calibrations, connected gateway networks, and alert triggers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none text-xs leading-normal">
        
        {/* Clinician account password */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
            <Lock className="w-4 h-4 text-indigo-400" />
            Credentials Security
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-slate-500 block mb-1">Old Password</label>
              <input 
                type="password" 
                value={pass.old} 
                disabled
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-600 font-mono cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">New Password</label>
              <input 
                type="password" 
                value={pass.new} 
                onChange={(e) => setPass(prev => ({ ...prev, new: e.target.value }))}
                placeholder="Enter new password"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono placeholder-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Global triage notification settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-405 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <Bell className="w-4.5 h-4.5 text-indigo-405" />
              Triage Alerts Routing Configuration
            </h4>
            
            <div className="space-y-2 bg-slate-950 border border-slate-850 p-4 rounded-xl">
              <label className="flex justify-between items-center text-slate-350 cursor-pointer">
                <span>Critical fall alerts routing</span>
                <input 
                  type="checkbox" 
                  checked={alerts.fall} 
                  onChange={(e) => setAlerts(prev => ({ ...prev, fall: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                />
              </label>
              <label className="flex justify-between items-center text-slate-355 py-2 cursor-pointer border-t border-slate-900">
                <span>Device offline disconnection warnings</span>
                <input 
                  type="checkbox" 
                  checked={alerts.disconnect} 
                  onChange={(e) => setAlerts(prev => ({ ...prev, disconnect: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                />
              </label>
              <label className="flex justify-between items-center text-slate-355 pt-2 cursor-pointer border-t border-slate-900">
                <span>Predictive risk score updates (&gt;40)</span>
                <input 
                  type="checkbox" 
                  checked={alerts.risk} 
                  onChange={(e) => setAlerts(prev => ({ ...prev, risk: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                />
              </label>
            </div>
          </div>

          <p className="text-[10px] text-slate-550 italic leading-relaxed mt-4">
            * High-frequency alarms route through secure clinical networks. Disabling these thresholds does not alter gateway physical triggers.
          </p>
        </div>

      </div>

    </div>
  );
}
