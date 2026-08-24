import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Heart, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Pill, 
  ShieldAlert, 
  FileText, 
  MessageCircle, 
  Bell, 
  ShieldCheck, 
  Settings, 
  Activity 
} from 'lucide-react';

interface GuardianSidebarProps {
  collapsed?: boolean;
}

export default function GuardianSidebar({ collapsed = false }: GuardianSidebarProps) {
  const menuItems = [
    { name: "Dashboard", path: "/guardian/dashboard", icon: Home },
    { name: "My Family", path: "/guardian/family", icon: Users },
    { name: "Health Summary", path: "/guardian/health", icon: Heart },
    { name: "AI Safety Status", path: "/guardian/risk", icon: TrendingUp },
    { name: "Emergency Dispatch", path: "/guardian/emergencies", icon: ShieldAlert },
    { name: "Patient Location", path: "/guardian/location", icon: MapPin },
    { name: "Doctor Updates", path: "/guardian/doctor-updates", icon: Clock },
    { name: "Medication Adherence", path: "/guardian/medications", icon: Pill },
    { name: "Care Network", path: "/guardian/care-team", icon: Users },
    { name: "Emergency History", path: "/guardian/history", icon: FileText },
    { name: "Care AI Assistant", path: "/guardian/assistant", icon: MessageCircle },
    { name: "Notification Inbox", path: "/guardian/notifications", icon: Bell },
    { name: "Privacy & Permissions", path: "/guardian/privacy", icon: ShieldCheck },
    { name: "Console Settings", path: "/guardian/settings", icon: Settings }
  ];

  return (
    <aside 
      className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 select-none ${collapsed ? 'w-20' : 'w-64'}`}
      aria-label="Guardian Main Navigation"
    >
      <div className="flex-grow pt-5 pb-4 overflow-y-auto max-h-[90vh]">
        
        {/* Brand Header */}
        <div className="flex items-center px-6 mb-6 gap-3 overflow-hidden">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-black text-white leading-none">AegisNet</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-1">Guardian Hub</p>
            </div>
          )}
        </div>

        {/* Menu Navigation */}
        <nav className="px-3 space-y-1.5" role="menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              role="menuitem"
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl transition duration-150 group gap-3 focus:outline-none ${
                  isActive
                    ? 'bg-indigo-655 text-white shadow-md'
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

      <div className="p-4 border-t border-slate-850 text-center shrink-0">
        <span className="text-[10px] text-slate-500 font-mono">
          {!collapsed ? "AegisNet Guardian v1.0" : "v1.0"}
        </span>
      </div>
    </aside>
  );
}
