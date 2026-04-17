import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { notificationsService } from '../services/api';
import { getNotificationPermissionState, requestNotificationPermissions } from '../utils/mobileNative';
import {
  isIosInstallableDevice,
  isStandaloneApp,
  subscribeBrowserPush,
  supportsBrowserPush,
} from '../utils/pwa';

const INSTALL_DISMISS_KEY = 'tarkeeb-pwa-install-dismissed';
const ALERTS_DISMISS_KEY = 'tarkeeb-pwa-alerts-dismissed';

const readFlag = (key) => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

const writeFlag = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (value) {
      window.localStorage.setItem(key, '1');
      return;
    }

    window.localStorage.removeItem(key);
  } catch {
    return;
  }
};

export default function AppAccessBanner() {
  const { token } = useAuth();
  const { lang } = useLang();
  const [permission, setPermission] = useState('prompt');
  const [installDismissed, setInstallDismissed] = useState(() => readFlag(INSTALL_DISMISS_KEY));
  const [alertsDismissed, setAlertsDismissed] = useState(() => readFlag(ALERTS_DISMISS_KEY));
  const [isStandalone, setIsStandalone] = useState(() => isStandaloneApp());
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [enablingAlerts, setEnablingAlerts] = useState(false);
  const [subscriptionReady, setSubscriptionReady] = useState(false);

  const copy = useMemo(
    () =>
      lang === 'ar'
        ? {
            title: 'ثبت النظام على جوالك وفعّل التنبيهات',
            subtitle:
              'افتحه كتطبيق من الشاشة الرئيسية حتى تصل تحديثات الطلبات بسرعة إلى الإدارة ومدير العمليات والحسابات الداخلية.',
            install: 'إضافة إلى الشاشة',
            enableAlerts: 'تفعيل الإشعارات',
            close: 'إخفاء',
            iosHint: 'في آيفون افتح قائمة المشاركة في Safari ثم اختر "إضافة إلى الشاشة الرئيسية".',
            installDone: 'أصبح التطبيق جاهزًا على الشاشة الرئيسية.',
            installLater: 'يمكنك التثبيت لاحقًا من نفس المتصفح.',
            alertsDone: 'تم تفعيل تنبيهات الجوال لهذا الحساب.',
            alertsDenied: 'اسمح بالإشعارات من المتصفح أو النظام أولًا.',
            alertsUnavailable: 'الإشعارات الفورية غير متاحة حاليًا على هذا الجهاز.',
            alertsError: 'تعذر تفعيل الإشعارات الآن.',
            installBadge: 'وضع التطبيق',
            alertsBadge: 'تنبيهات مباشرة',
          }
        : {
            title: 'Install the workspace and enable alerts',
            subtitle:
              'Open it like a phone app so order updates reach admin and operations faster.',
            install: 'Add to home screen',
            enableAlerts: 'Enable notifications',
            close: 'Hide',
            iosHint: 'On iPhone, open Safari share sheet and tap "Add to Home Screen".',
            installDone: 'The app is ready from the home screen.',
            installLater: 'You can install it later from the browser menu.',
            alertsDone: 'Mobile alerts are now enabled for this account.',
            alertsDenied: 'Allow notifications from the browser or device first.',
            alertsUnavailable: 'Push notifications are not available on this device right now.',
            alertsError: 'Could not enable notifications right now.',
            installBadge: 'App mode',
            alertsBadge: 'Live alerts',
          },
    [lang]
  );

  useEffect(() => {
    getNotificationPermissionState().then((value) => setPermission(value || 'prompt'));
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setInstallDismissed(false);
      writeFlag(INSTALL_DISMISS_KEY, false);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setInstallDismissed(true);
      writeFlag(INSTALL_DISMISS_KEY, true);
      toast.success(copy.installDone);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [copy.installDone]);

  useEffect(() => {
    if (!token || permission !== 'granted' || subscriptionReady) {
      return;
    }

    const syncPushSubscription = async () => {
      if (!supportsBrowserPush()) {
        return;
      }

      try {
        const response = await notificationsService.getConfig();
        if (!response.data?.enabled || !response.data?.publicKey) {
          return;
        }

        const subscription = await subscribeBrowserPush(response.data.publicKey);
        if (!subscription) {
          return;
        }

        await notificationsService.subscribe(subscription.toJSON ? subscription.toJSON() : subscription);
        setSubscriptionReady(true);
        setAlertsDismissed(true);
        writeFlag(ALERTS_DISMISS_KEY, true);
      } catch {
        return;
      }
    };

    syncPushSubscription();
  }, [alertsDismissed, permission, subscriptionReady, token]);

  const showInstallAction = !isStandalone && !installDismissed && (Boolean(deferredPrompt) || isIosInstallableDevice());
  const showAlertsAction = Boolean(token) && permission !== 'granted' && !alertsDismissed;

  if (!showInstallAction && !showAlertsAction) {
    return null;
  }

  const handleDismiss = () => {
    setInstallDismissed(true);
    setAlertsDismissed(true);
    writeFlag(INSTALL_DISMISS_KEY, true);
    writeFlag(ALERTS_DISMISS_KEY, true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast(copy.iosHint);
      setInstallDismissed(true);
      writeFlag(INSTALL_DISMISS_KEY, true);
      return;
    }

    try {
      setInstalling(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice?.outcome === 'accepted') {
        setInstallDismissed(true);
        writeFlag(INSTALL_DISMISS_KEY, true);
        toast.success(copy.installDone);
      } else {
        toast(copy.installLater);
      }
    } catch {
      toast(copy.installLater);
    } finally {
      setDeferredPrompt(null);
      setInstalling(false);
    }
  };

  const handleEnableAlerts = async () => {
    try {
      setEnablingAlerts(true);
      const nextPermission = await requestNotificationPermissions();
      setPermission(nextPermission || 'prompt');

      if (nextPermission !== 'granted') {
        toast.error(copy.alertsDenied);
        return;
      }

      if (!supportsBrowserPush()) {
        setAlertsDismissed(true);
        writeFlag(ALERTS_DISMISS_KEY, true);
        toast.success(copy.alertsDone);
        return;
      }

      const response = await notificationsService.getConfig();
      if (!response.data?.enabled || !response.data?.publicKey) {
        toast.error(copy.alertsUnavailable);
        return;
      }

      const subscription = await subscribeBrowserPush(response.data.publicKey);
      if (!subscription) {
        toast.error(copy.alertsUnavailable);
        return;
      }

      await notificationsService.subscribe(subscription.toJSON ? subscription.toJSON() : subscription);
      setSubscriptionReady(true);
      setAlertsDismissed(true);
      writeFlag(ALERTS_DISMISS_KEY, true);
      toast.success(copy.alertsDone);
    } catch {
      toast.error(copy.alertsError);
    } finally {
      setEnablingAlerts(false);
    }
  };

  return (
    <section className="app-access-banner" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="app-access-copy">
        <div className="app-access-pills">
          {showInstallAction ? <span className="app-access-pill">{copy.installBadge}</span> : null}
          {showAlertsAction ? <span className="app-access-pill accent">{copy.alertsBadge}</span> : null}
        </div>
        <strong>{copy.title}</strong>
        <p>{showInstallAction && !deferredPrompt && isIosInstallableDevice() ? copy.iosHint : copy.subtitle}</p>
      </div>

      <div className="app-access-actions">
        {showInstallAction ? (
          <button className="btn-light" disabled={installing} onClick={handleInstall} type="button">
            {installing ? '...' : copy.install}
          </button>
        ) : null}

        {showAlertsAction ? (
          <button className="btn-primary" disabled={enablingAlerts} onClick={handleEnableAlerts} type="button">
            {enablingAlerts ? '...' : copy.enableAlerts}
          </button>
        ) : null}

        <button className="btn-language" onClick={handleDismiss} type="button">
          {copy.close}
        </button>
      </div>
    </section>
  );
}
