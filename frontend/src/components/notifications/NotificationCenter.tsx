import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, CheckCheck, Settings, AlertOctagon, Bell, ExternalLink, Play, CheckCircle, ShieldAlert 
} from 'lucide-react';
import { AppNotification } from '../../hooks/useNotifications';

interface NotificationCenterProps {
  role: string;
  notifications: AppNotification[];
  unreadCount: number;
  preferences: any;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onUpdatePreferences: (prefs: any) => void;
  onAcknowledge: (eventId: string, name: string) => void;
  onSimulateEmergency: () => void;
}

export default function NotificationCenter({
  role,
  notifications,
  unreadCount,
  preferences,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onUpdatePreferences,
  onAcknowledge,
  onSimulateEmergency
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const navigate = useNavigate();

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'critical') return n.critical;
    return true;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      onMarkRead(notif.id);
    }
    if (notif.link) {
      onClose();
      navigate(notif.link);
    }
  };

  const handleSavePreferences = () => {
    onUpdatePreferences(localPrefs);
    setShowSettings(false);
  };

  const roleUserNames: Record<string, string> = {
    patient: "Savita Sharma",
    doctor: "Dr. Arvind Swamy",
    guardian: "Ramesh Sharma",
    volunteer: "Rahul Sharma (V101)",
    college: "Dr. Meera Iyer (Admin)"
  };

  const userName = roleUserNames[role.toLowerCase()] || "System User";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      
      {/* Slide-out Panel */}
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-850 px-5 py-4 flex justify-between items-center select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-950 border border-indigo-900 text-indigo-400 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AegisNet Notification Center</h3>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Role: {role.toUpperCase()} • FCM Push Enabled</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Notification Preferences"
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Controls & Simulation Controller */}
        <div className="bg-slate-950/60 border-b border-slate-850 p-3 space-y-2 select-none">
          
          <div className="flex items-center justify-between gap-2 text-xs">
            {/* Filter Tabs */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                  filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                  filter === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                  filter === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Critical
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 border border-indigo-900/60 bg-indigo-950/40 px-2 py-1 rounded-lg transition active:scale-95"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* Interactive Demo "Simulate Emergency" Button */}
          <button
            onClick={onSimulateEmergency}
            className="w-full bg-rose-950/90 hover:bg-rose-900 border border-rose-800 text-rose-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-rose-950/40"
          >
            <Play className="w-3.5 h-3.5 fill-rose-300 text-rose-300 animate-pulse" />
            Simulate Emergency (Full 5-Role Dispatch)
          </button>
        </div>

        {/* Settings Overlay View */}
        {showSettings ? (
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs select-none">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" /> Push & FCM Notification Preferences
            </h4>

            <div className="space-y-3 text-slate-300 font-sans">
              <label className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span>🚨 Emergency & SOS Push Alerts</span>
                <input
                  type="checkbox"
                  checked={localPrefs.emergency ?? true}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, emergency: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span>🔴 Motion & Fall Detection Alerts</span>
                <input
                  type="checkbox"
                  checked={localPrefs.fall ?? true}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, fall: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span>🟡 AI Risk Increase Notifications</span>
                <input
                  type="checkbox"
                  checked={localPrefs.risk ?? true}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, risk: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span>🧑‍⚕️ Volunteer Dispatch & Care Credits</span>
                <input
                  type="checkbox"
                  checked={localPrefs.volunteer ?? true}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, volunteer: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span>🔊 Audio Sound Chime</span>
                <input
                  type="checkbox"
                  checked={localPrefs.sound_enabled ?? true}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, sound_enabled: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={handleSavePreferences}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition text-center"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Notifications List */
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950/20">
            {filteredNotifications.length === 0 ? (
              <div className="text-slate-500 font-mono text-center py-16 text-xs">
                No notifications found for this view filter.
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition text-xs flex flex-col gap-2 ${
                    n.critical
                      ? 'bg-rose-950/40 border-rose-900/60 shadow-lg shadow-rose-950/20'
                      : !n.read
                        ? 'bg-slate-850 border-slate-750 font-medium'
                        : 'bg-slate-900/80 border-slate-850 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      {n.critical && <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      <span className={n.critical ? 'text-rose-300 font-black' : 'text-slate-200'}>
                        {n.title}
                      </span>
                    </div>

                    <span className="text-[9px] text-slate-500 font-mono shrink-0">
                      {n.formatted_time}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                    {n.body}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 mt-1 select-none">
                    {/* Emergency Acknowledgement Button */}
                    {n.metadata?.event_id && n.critical && (
                      <button
                        onClick={() => onAcknowledge(n.metadata.event_id, userName)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition active:scale-95 flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-3 h-3" /> Acknowledge Emergency
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {!n.read && (
                        <button
                          onClick={() => onMarkRead(n.id)}
                          className="text-[9px] text-slate-400 hover:text-slate-200 font-mono"
                        >
                          Mark read
                        </button>
                      )}

                      <button
                        onClick={() => handleNotificationClick(n)}
                        className="text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded-lg transition flex items-center gap-1"
                      >
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-850 px-5 py-3 text-[10px] text-slate-500 font-mono flex justify-between items-center select-none">
          <span>End-to-End Privacy Encrypted</span>
          <span>AegisNet v2.4</span>
        </div>

      </div>

    </div>
  );
}
