import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  User, 
  FileText, 
  Heart, 
  Stethoscope, 
  MessageSquare, 
  AlertTriangle, 
  ShieldCheck, 
  Settings, 
  Download
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const menuItems = [
    { name: "Dashboard", path: "/patient/dashboard", icon: LayoutDashboard },
    { name: "My Health", path: "/patient/health", icon: User },
    { name: "Live Vitals", path: "/patient/monitoring", icon: Activity },
    { name: "Prescriptions", path: "/patient/prescriptions", icon: Heart },
    { name: "My Doctor", path: "/patient/doctor", icon: Stethoscope },
    { name: "Care Assistant", path: "/patient/assistant", icon: MessageSquare },
    { name: "Emergency History", path: "/patient/emergency", icon: AlertTriangle },
    { name: "Health Reports", path: "/patient/reports", icon: Download },
    { name: "Privacy Center", path: "/patient/privacy", icon: ShieldCheck },
    { name: "Settings", path: "/patient/settings", icon: Settings },
  ];

  return (
    <aside className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 select-none ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        
        {/* Brand Header */}
        <div className="flex items-center px-6 mb-8 gap-3 overflow-hidden">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-black tracking-tight text-white">AegisNet</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold font-mono">Patient Portal</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 bg-slate-900">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-xs font-semibold rounded-xl transition duration-200 group gap-3 ${
                  isActive
                    ? 'bg-indigo-650 text-white shadow-md shadow-indigo-950/20'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0 group-hover:scale-105 transition" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Footer disclaimer */}
      <div className="p-4 border-t border-slate-850 text-center shrink-0">
        {!collapsed ? (
          <div className="text-[10px] text-slate-500 font-mono">
            AegisNet Monitoring System v1.0.4
          </div>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
        )}
      </div>
    </aside>
  );
}
