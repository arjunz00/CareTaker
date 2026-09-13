import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ClipboardCheck, 
  FileText, 
  GraduationCap, 
  Heart, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Users,
  Bell
} from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { useAuth } from '../../hooks/useAuth';

const links = [
  ['Dashboard', '/college/dashboard', LayoutDashboard],
  ['Verification', '/college/verification', ClipboardCheck],
  ['Students', '/college/students', Users],
  ['Volunteers', '/college/volunteers', GraduationCap],
  ['Training', '/college/training', GraduationCap],
  ['Missions', '/college/missions', Heart],
  ['Care Credits', '/college/care-credits', Heart],
  ['Certificates', '/college/certificates', FileText],
  ['Programs', '/college/programs', Building2],
  ['Impact', '/college/impact', LayoutDashboard],
  ['Reports', '/college/reports', FileText],
  ['Notifications', '/college/notifications', Bell],
  ['Audit', '/college/audit', ClipboardCheck],
  ['Privacy', '/college/privacy', ClipboardCheck],
  ['College Profile', '/college/profile', Building2],
  ['Settings', '/college/settings', Settings]
] as const;

export default function CollegeLayout() {
  const nav = useNavigate();
  const { session, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    nav('/college/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-slate-900 border-r border-slate-800">
        <div className="p-6 flex gap-3 items-center">
          <span className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <b className="text-white text-sm">AegisNet</b>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Institution Hub</p>
          </div>
        </div>
        <nav className="px-3 space-y-1 overflow-auto custom-scrollbar flex-1 pb-6">
          {links.map(([label, to, Icon]) => (
            <Link
              key={to}
              to={to}
              className="flex gap-3 items-center rounded-xl px-3 py-2.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center shadow-md">
          <div>
            <b className="text-sm text-white">Institutional Community Care</b>
            <p className="text-[9px] text-slate-500">{session?.email || 'Admin session'} · Aggregate Administration</p>
          </div>
          <div className="flex gap-3 items-center">
            <NotificationBell role="college" />
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
    </div>
  );
}
