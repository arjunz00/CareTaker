import React, { useState } from 'react';
import { Settings as SettingsIcon, Lock, Bell } from 'lucide-react';

export default function Settings() {
  const [pass, setPass] = useState({ old: '••••••••', new: '', confirm: '' });
  const [alerts, setAlerts] = useState({ fall: true, statusChange: true, disconnect: true });

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            Guardian Portal Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Configure credentials security and custom alerts preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl text-xs leading-normal">
        
        {/* Passwords */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5 select-none font-mono">
            <Lock className="w-4 h-4 text-indigo-400" />
            Credentials Security
          </h4>
          <div className="space-y-3 select-none">
            <div>
              <label className="text-slate-500 block mb-1">Current Password</label>
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
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-505 font-mono placeholder-slate-705"
              />
            </div>
          </div>
        </div>

        {/* Alerts Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between select-none">
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-405 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5 font-mono">
              <Bell className="w-4.5 h-4.5 text-indigo-405" />
              Emergency alerts Preferences
            </h4>
            
            <div className="space-y-2 bg-slate-950 border border-slate-850 p-4 rounded-2xl">
              <label className="flex justify-between items-center text-slate-350 cursor-pointer">
                <span>SMS alerts on critical falls</span>
                <input 
                  type="checkbox" 
                  checked={alerts.fall} 
                  onChange={(e) => setAlerts(prev => ({ ...prev, fall: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                />
              </label>
              <label className="flex justify-between items-center text-slate-355 py-2 cursor-pointer border-t border-slate-900">
                <span>Push notifications on status changes</span>
                <input 
                  type="checkbox" 
                  checked={alerts.statusChange} 
                  onChange={(e) => setAlerts(prev => ({ ...prev, statusChange: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                />
              </label>
              <label className="flex justify-between items-center text-slate-355 pt-2 cursor-pointer border-t border-slate-900">
                <span>Disconnection alert sounds</span>
                <input 
                  type="checkbox" 
                  checked={alerts.disconnect} 
                  onChange={(e) => setAlerts(prev => ({ ...prev, disconnect: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-650"
                />
              </label>
            </div>
          </div>

          <p className="text-[9px] text-slate-550 italic leading-relaxed mt-4">
            * Critical emergency dispatch alerts cannot be silenced or muted under standard platform safety configurations.
          </p>
        </div>

      </div>

    </div>
  );
}
