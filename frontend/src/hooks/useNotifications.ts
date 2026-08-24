import { useState, useEffect, useCallback } from 'react';

export interface AppNotification {
  id: string;
  role: string;
  type: string;
  title: string;
  body: string;
  link: string;
  critical: boolean;
  read: boolean;
  timestamp: number;
  formatted_time: string;
  metadata?: any;
}

export function useNotifications(role: string = 'patient', userId: string = 'all') {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Play audio chime for alerts
  const playAlertSound = useCallback((isCritical: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = isCritical ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, audioCtx.currentTime); // A5 or D5
      if (isCritical) {
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);
      }

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);

      // Trigger device vibration if available
      if (navigator.vibrate && isCritical) {
        navigator.vibrate([300, 150, 300]);
      }
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?role=${role}&user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: AppNotification) => !n.read).length);
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    } finally {
      setLoading(false);
    }
  }, [role, userId]);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications/preferences?role=${role}&user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (e) {
      console.error("Failed to fetch notification preferences:", e);
    }
  }, [role, userId]);

  // Save FCM Token
  const registerFCMToken = useCallback(async (token: string) => {
    try {
      await fetch('/api/notifications/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role, token })
      });
    } catch (e) {
      console.error("Failed to register FCM token:", e);
    }
  }, [role, userId]);

  // Initial fetch and WebSocket connection
  useEffect(() => {
    fetchNotifications();
    fetchPreferences();

    // WebSocket subscription for live notification stream
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'NOTIFICATION' && msg.data) {
            const newNotif: AppNotification = msg.data;
            if (newNotif.role === 'all' || newNotif.role === role) {
              setNotifications(prev => [newNotif, ...prev]);
              setUnreadCount(prev => prev + 1);
              playAlertSound(newNotif.critical);
            }
          } else if (msg.type === 'EMERGENCY_ALERT' && msg.notifications) {
            msg.notifications.forEach((n: AppNotification) => {
              if (n.role === 'all' || n.role === role) {
                setNotifications(prev => [n, ...prev]);
                setUnreadCount(prev => prev + 1);
                playAlertSound(true);
              }
            });
          }
        } catch (err) {
          // Ignore non-json telemetry frames
        }
      };
    } catch (e) {
      console.warn("WebSocket notification error:", e);
    }

    return () => {
      if (socket) socket.close();
    };
  }, [role, userId, fetchNotifications, fetchPreferences, playAlertSound]);

  const markRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await fetch(`/api/notifications/mark-read/${id}`, { method: 'POST' });
    } catch (e) {
      console.error("Mark read error:", e);
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      await fetch(`/api/notifications/mark-all-read?role=${role}&user_id=${userId}`, { method: 'POST' });
    } catch (e) {
      console.error("Mark all read error:", e);
    }
  };

  const updatePreferences = async (newPrefs: any) => {
    try {
      setPreferences(newPrefs);
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role, preferences: newPrefs })
      });
    } catch (e) {
      console.error("Update preferences error:", e);
    }
  };

  const acknowledgeEmergency = async (eventId: string, acknowledgedBy: string) => {
    try {
      await fetch(`/api/notifications/acknowledge/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, acknowledged_by: acknowledgedBy, role })
      });
      fetchNotifications();
    } catch (e) {
      console.error("Acknowledge emergency error:", e);
    }
  };

  const simulateEmergency = async () => {
    try {
      const res = await fetch('/api/demo/simulate-emergency', { method: 'POST' });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error("Simulate emergency error:", e);
    }
  };

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    markRead,
    markAllRead,
    updatePreferences,
    acknowledgeEmergency,
    simulateEmergency,
    registerFCMToken,
    refetch: fetchNotifications
  };
}
