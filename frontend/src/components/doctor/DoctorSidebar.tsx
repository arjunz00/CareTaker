import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  AlertOctagon, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Pill, 
  ShieldCheck, 
  Settings,
  Activity
} from 'lucide-react';

interface DoctorSidebarProps {
  collapsed?: boolean;
}

export default function DoctorSidebar({ collapsed = false }: DoctorSidebarProps) {
  const menuItems = [
    { name: "Console Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
    { name: "My Patient Roster", path: "/doctor/patients", icon: Users },
    { name: "Emergency Center", path: "/doctor/emergencies", icon: AlertOctagon },
    { name: "Clinical Assistant", path: "/doctor/assistant", icon: MessageSquare },
    { name: "Clinic Appointments", path: "/doctor/appointments", icon: Calendar },
    { name: "Medication Prescriptions", path: "/doctor/prescriptions", icon: Pill },
    { name: "Privacy & Auditing", path: "/doctor/privacy", icon: ShieldCheck },
    { name: "Settings Calibration", path: "/doctor/settings", icon: Settings },
  ];

  return (
    <aside 
      className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 select-none ${collapsed ? 'w-20' : 'w-64'}`}
      aria-label="Doctor Main Navigation"
    >
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        
        {/* Brand Header */}
        <div className="flex items-center px-6 mb-8 gap-3 overflow-hidden">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-650/20 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-none">AegisNet</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold font-mono mt-1">Clinician Console</p>
            </div>
          )}
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-3 space-y-1 bg-slate-900" role="menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              role="menuitem"
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-xs font-semibold rounded-xl transition duration-200 group gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-655 text-white shadow-md shadow-indigo-950/20'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0 group-hover:scale-105 transition" aria-hidden="true" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-850 text-center shrink-0">
        {!collapsed ? (
          <div className="text-[10px] text-slate-500 font-mono">
            AegisNet Clinician v1.0.4
          </div>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
        )}
      </div>
    </aside>
  );
}
