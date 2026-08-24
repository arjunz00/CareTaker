import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import EmergencyButton from './EmergencyButton';
import { 
  LayoutDashboard, 
  Activity, 
  User, 
  Heart, 
  MessageSquare,
  AlertTriangle 
} from 'lucide-react';

export default function PatientLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [session, setSession] = useState<{ email: string; name: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sessionStr = localStorage.getItem("aegis_session");
    if (!sessionStr) {
      navigate("/patient/login");
      return;
    }
    try {
      const s = JSON.parse(sessionStr);
      if (!s.authenticated || s.role !== 'patient') {
        navigate("/patient/login");
        return;
      }
      setSession(s);
    } catch (e) {
      navigate("/patient/login");
    }
  }, [navigate]);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-xs font-semibold">Authorizing Session...</span>
        </div>
      </div>
    );
  }

  // Mobile navigation tabs
  const mobileMenuItems = [
    { name: "Dash", path: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Profile", path: "/patient/health", icon: User },
    { name: "Vitals", path: "/patient/monitoring", icon: Activity },
    { name: "RX", path: "/patient/prescriptions", icon: Heart },
    { name: "Chat", path: "/patient/assistant", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Main content pane */}
      <div className="flex-1 flex flex-col overflow-hidden relative pb-16 md:pb-0">
        <TopBar 
          userName={session.name} 
          userEmail={session.email} 
          isOnline={true} 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Child Router Outlets */}
        <div className="flex-1 overflow-y-auto bg-slate-950">
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center py-2.5 z-40">
        {mobileMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold ${
                isActive ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Accidental-Proof Persistent SOS Button */}
      <EmergencyButton />
    </div>
  );
}
