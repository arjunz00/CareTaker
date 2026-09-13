import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Geolocation } from '@capacitor/geolocation';

/**
 * Check if app is running inside a native mobile container (iOS or Android)
 */
export const isNativeMobile = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Get current platform ('web' | 'android' | 'ios')
 */
export const getMobilePlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Trigger native hardware haptic vibration (e.g. on SOS Panic Button trigger)
 */
export const triggerNativeHaptics = async (type: 'impact' | 'notification' | 'selection' = 'impact') => {
  if (!isNativeMobile()) {
    // Fallback to web vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
    return;
  }
  try {
    if (type === 'impact') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else if (type === 'notification') {
      await Haptics.notification({ type: NotificationType.Error });
    } else {
      await Haptics.selectionStart();
    }
  } catch (e) {
    console.warn("Haptics unavailable:", e);
  }
};

/**
 * Get native mobile GPS position
 */
export const getMobileLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    if (isNativeMobile()) {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') return null;
      }
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    }
    // Web Geolocation fallback
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  } catch (e) {
    return null;
  }
};
