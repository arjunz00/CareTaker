import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Menu } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { useAuth } from '../../hooks/useAuth';

interface GuardianTopBarProps {
  guardianName?: string;
  guardianEmail?: string;
  guardianAvatar?: string;
  isOnline: boolean;
  onToggleSidebar?: () => void;
  activeEmergencyCount?: number;
}

export default function GuardianTopBar({
  guardianName,
  guardianEmail,
  guardianAvatar,
  isOnline,
  onToggleSidebar,
  activeEmergencyCount = 0
}: GuardianTopBarProps) {
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  const displayName = guardianName || session?.name || "Rahul Sharma";
  const displayEmail = guardianEmail || session?.email || "guardian@aegisnet.org";
  const avatarUrl = guardianAvatar || session?.photoURL;

  const handleLogout = async () => {
    await logout();
    navigate("/guardian/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || "G";
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 py-3.5 px-6 flex justify-between items-center shadow-md select-none shrink-0 z-30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition md:block hidden"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-heading font-extrabold text-white tracking-wide uppercase">AegisNet Family Guardian</h2>
            <p className="text-[10px] text-teal-400 font-medium">Continuous Loved-One Safety Monitor</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection status */}
        <span 
          className={`text-[10px] px-3 py-1 rounded-full border font-bold flex items-center gap-1.5 transition-all ${
            isOnline 
              ? 'bg-teal-950/60 text-teal-300 border-teal-800' 
              : 'bg-rose-950/60 text-rose-300 border-rose-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          {isOnline ? 'Family Sync Active' : 'Sync Offline'}
        </span>

        {/* Notifications Alert Bell */}
        <NotificationBell role="guardian" />

        {/* User Identity Details with Gmail photo / avatar */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="w-8 h-8 rounded-full object-cover border border-teal-500/50 shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-bold text-xs flex items-center justify-center border border-teal-500/40 shadow-sm">
              {getInitials(displayName)}
            </div>
          )}
          <div className="text-right hidden sm:block">
            <span className="font-bold text-xs text-white block leading-tight">{displayName}</span>
            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{displayEmail}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            title="Log Out Session"
          >
            <LogOut className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
export type { GuardianTopBarProps };
