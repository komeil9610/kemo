import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';

const CHANNEL_ID = 'tarkeeb-mobile-alerts';
const NOTIFICATION_CACHE_KEY = 'tarkeeb-mobile-native-alerts';

const impactMap = {
  light: ImpactStyle.Light,
  medium: ImpactStyle.Medium,
  heavy: ImpactStyle.Heavy,
};

const notificationTypeMap = {
  success: NotificationType.Success,
  warning: NotificationType.Warning,
  error: NotificationType.Error,
};

const isBrowserNotificationSupported =
  typeof window !== 'undefined' && typeof window.Notification !== 'undefined';

const safeStorageRead = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(NOTIFICATION_CACHE_KEY) || '[]');
  } catch {
    return [];
  }
};

const safeStorageWrite = (value) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify(value.slice(-120)));
  } catch {
    return;
  }
};

const rememberNotification = (key) => {
  const current = safeStorageRead();
  if (current.includes(key)) {
    return false;
  }
  safeStorageWrite([...current, key]);
  return true;
};

const isNativeApp = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

const ensureLocalChannel = async () => {
  if (!isNativeApp()) {
    return;
  }

  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Tarkeeb Mobile Alerts',
      description: 'Operational alerts and task updates',
      importance: 4,
      visibility: 1,
      vibration: true,
      sound: 'default',
    });
  } catch {
    return;
  }
};

const nextNotificationId = (key) => {
  return Array.from(String(key || 'tarkeeb-alert')).reduce((sum, char) => sum + char.charCodeAt(0), 1000);
};

export { isNativeApp };

export const getNotificationPermissionState = async () => {
  if (isNativeApp()) {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display || 'prompt';
    } catch {
      return 'prompt';
    }
  }

  if (isBrowserNotificationSupported) {
    return window.Notification.permission;
  }

  return 'unsupported';
};

export const requestNotificationPermissions = async () => {
  if (isNativeApp()) {
    try {
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') {
        await ensureLocalChannel();
      }
      return result.display || 'prompt';
    } catch {
      return 'prompt';
    }
  }

  if (isBrowserNotificationSupported) {
    return window.Notification.requestPermission();
  }

  return 'unsupported';
};

export const selectionHaptic = async () => {
  if (isNativeApp()) {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
      return;
    } catch {
      return;
    }
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(12);
  }
};

export const impactHaptic = async (style = 'light') => {
  if (isNativeApp()) {
    try {
      await Haptics.impact({ style: impactMap[style] || ImpactStyle.Light });
      return;
    } catch {
      return;
    }
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(style === 'heavy' ? 32 : style === 'medium' ? 20 : 12);
  }
};

export const notificationHaptic = async (type = 'success') => {
  if (isNativeApp()) {
    try {
      await Haptics.notification({ type: notificationTypeMap[type] || NotificationType.Success });
      return;
    } catch {
      return;
    }
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(type === 'error' ? [24, 40, 24] : type === 'warning' ? [18, 28, 18] : [16, 18, 16]);
  }
};

export const sendAppNotification = async ({ key, title, body }) => {
  if (!title || !body) {
    return false;
  }

  const cacheKey = String(key || `${title}:${body}`);
  if (!rememberNotification(cacheKey)) {
    return false;
  }

  if (isNativeApp()) {
    try {
      const permission = await getNotificationPermissionState();
      if (permission !== 'granted') {
        return false;
      }

      await ensureLocalChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: nextNotificationId(cacheKey),
            title,
            body,
            channelId: CHANNEL_ID,
            sound: 'default',
            schedule: { at: new Date(Date.now() + 250) },
          },
        ],
      });
      return true;
    } catch {
      return false;
    }
  }

  if (isBrowserNotificationSupported && window.Notification.permission === 'granted') {
    try {
      new window.Notification(title, {
        body,
        tag: cacheKey,
        silent: false,
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
};
