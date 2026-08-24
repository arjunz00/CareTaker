import React, { useState } from 'react';
import { Bell, AlertOctagon } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCenter from './NotificationCenter';

interface NotificationBellProps {
  role?: string;
  userId?: string;
}

export default function NotificationBell({ role = 'patient', userId = 'all' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    preferences,
    markRead,
    markAllRead,
    updatePreferences,
    acknowledgeEmergency,
    simulateEmergency
  } = useNotifications(role, userId);

  const hasCriticalUnread = notifications.some(n => !n.read && n.critical);

  return (
    <div className="relative inline-block select-none">
      
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Open Notifications Center"
        className={`relative p-2 rounded-xl border transition flex items-center justify-center shrink-0 ${
          hasCriticalUnread
            ? 'bg-rose-950/80 border-rose-600 text-rose-300 alarm-alert-active'
            : unreadCount > 0
              ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300 hover:bg-indigo-900/60'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
        }`}
      >
        {hasCriticalUnread ? (
          <AlertOctagon className="w-4.5 h-4.5 animate-pulse text-rose-400" />
        ) : (
          <Bell className="w-4.5 h-4.5" />
        )}

        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold font-mono rounded-full text-white shadow-md ${
            hasCriticalUnread ? 'bg-rose-600 animate-bounce' : 'bg-indigo-600'
          }`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Slide-out Modal / Drawer */}
      {isOpen && (
        <NotificationCenter
          role={role}
          notifications={notifications}
          unreadCount={unreadCount}
          preferences={preferences}
          onClose={() => setIsOpen(false)}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onUpdatePreferences={updatePreferences}
          onAcknowledge={acknowledgeEmergency}
          onSimulateEmergency={simulateEmergency}
        />
      )}

    </div>
  );
}
