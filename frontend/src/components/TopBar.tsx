import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wifi, WifiOff } from 'lucide-react';

import NotificationBell from './notifications/NotificationBell';

interface TopBarProps {
  userName: string;
  userEmail: string;
  isOnline: boolean;
  onToggleSidebar?: () => void;
}

export default function TopBar({ userName, userEmail, isOnline, onToggleSidebar }: TopBarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("aegis_session");
    navigate("/patient/login");
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-6 flex justify-between items-center shadow-md select-none shrink-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition md:block hidden"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">AegisNet Platform Console</h2>
          <p className="text-[10px] text-slate-500 font-medium">Early Warning AIoT Medical Guardian</p>
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
          {isOnline ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Gateway Connected
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
              Gateway Offline
            </>
          )}
        </span>

        {/* Notification Bell */}
        <NotificationBell role="patient" />

        {/* User Card */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="text-right">
            <span className="font-bold text-xs text-white block leading-tight">{userName}</span>
            <span className="text-[9px] text-slate-500 font-mono block leading-none mt-0.5">{userEmail}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1 active:scale-95"
            title="Log Out Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
