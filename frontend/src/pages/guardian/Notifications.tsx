import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Wifi, Clock } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/guardian/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    if (type === 'EMERGENCY') return <ShieldAlert className="w-5 h-5 text-rose-500 animate-bounce" />;
    if (type === 'DISCONNECT') return <Wifi className="w-5 h-5 text-amber-500" />;
    return <Clock className="w-5 h-5 text-indigo-400" />;
  };

  const getStyle = (urgent: boolean) => {
    return urgent 
      ? 'border-rose-500/80 bg-rose-950/20' 
      : 'border-slate-850 bg-slate-950/30';
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Guardian Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Check alerts routing updates for your assigned family members.</p>
        </div>
      </div>

      <div className="max-w-xl space-y-3.5 select-none text-xs">
        {notifications.length === 0 ? (
          <p className="text-slate-500 font-mono">No notifications logged.</p>
        ) : (
          notifications.map((n, idx) => (
            <div key={idx} className={`border p-4 rounded-2xl flex gap-3.5 items-start transition ${getStyle(n.urgent)}`}>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                {getIcon(n.type)}
              </div>
              <div className="space-y-1">
                <span className="font-bold text-white block text-sm leading-tight">{n.title}</span>
                <p className="text-slate-350 leading-normal">{n.body}</p>
                <span className="text-[9px] text-slate-550 block font-mono mt-1">{n.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
