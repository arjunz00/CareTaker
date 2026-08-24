import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wifi, Bell, Shield } from 'lucide-react';

import NotificationBell from '../notifications/NotificationBell';

interface DoctorTopBarProps {
  doctorName: string;
  doctorEmail: string;
  isOnline: boolean;
  onToggleSidebar?: () => void;
  activeCriticalCount?: number;
}

export default function DoctorTopBar({
  doctorName,
  doctorEmail,
  isOnline,
  onToggleSidebar,
  activeCriticalCount = 0
}: DoctorTopBarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("aegis_session");
    navigate("/doctor/login");
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-6 flex justify-between items-center shadow-md select-none shrink-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition md:block hidden"
          aria-label="Toggle Sidebar Navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            AegisNet Clinician Workspace
          </h2>
          <p className="text-[10px] text-slate-500 font-medium">Predictive Decision-Support Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time WebSocket connection state */}
        <span 
          className={`text-[10px] px-2.5 py-1 rounded-full border font-medium flex items-center gap-1.5 transition-all ${
            isOnline 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80' 
              : 'bg-rose-950/40 text-rose-400 border-rose-800/80'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-ping'}`}></span>
          {isOnline ? 'Gateway Link Connected' : 'Gateway Link Offline'}
        </span>

        {/* Notifications Alert Bell */}
        <NotificationBell role="doctor" />

        {/* Doctor Identity details */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="text-right">
            <span className="font-bold text-xs text-white block leading-tight">{doctorName}</span>
            <span className="text-[9px] text-slate-500 font-mono block leading-none mt-0.5">{doctorEmail}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-350 py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
