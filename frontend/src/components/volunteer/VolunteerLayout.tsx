import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, ShieldCheck, LayoutDashboard, AlertTriangle, Map, ClipboardList } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import VolunteerSidebar from './VolunteerSidebar';
import { useAuth } from '../../hooks/useAuth';

export default function VolunteerLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const { session, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    nav('/volunteer/login');
  };

  const mobile = [
    ['Dashboard', '/volunteer/dashboard', LayoutDashboard],
    ['Emergencies', '/volunteer/emergencies', AlertTriangle],
    ['Map', '/volunteer/map', Map],
    ['Missions', '/volunteer/assignments', ClipboardList]
  ] as const;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      <VolunteerSidebar />
      <div className="flex-1 min-w-0 pb-16 md:pb-0">
        <header className="h-16 px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <Menu className="md:hidden w-5 h-5 text-slate-400" />
            <div>
              <h2 className="text-sm font-black">Community Response Console</h2>
              <p className="text-[9px] text-slate-500">{session?.email || 'Verified responder'}</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <NotificationBell role="volunteer" />
            <span className="hidden sm:flex gap-1.5 text-[10px] text-emerald-400 font-bold items-center">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Responder
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 transition"
            >
              <LogOut className="w-3.5 h-3.5 text-indigo-400" />
              Logout
            </button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900 border-t border-slate-800 flex justify-around p-2">
        {mobile.map(([label, to, Icon]) => (
          <Link
            key={to}
            to={to}
            className={`text-[9px] flex flex-col items-center ${
              loc.pathname === to ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
