import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const modeCopy = {
  admin: {
    ar: {
      eyebrow: 'تطبيق المسؤول',
      title: 'نسخة الجوال المخصصة للمسؤول',
      subtitle: 'واجهة سريعة لفتح لوحة الإدارة الرسمية ومتابعة الطلبات والفنيين.',
      action: 'الدخول إلى لوحة الإدارة',
    },
    en: {
      eyebrow: 'Admin mobile app',
      title: 'Mobile experience for the admin team',
      subtitle: 'A focused app entry for managing orders, technicians, and official operations.',
      action: 'Open admin dashboard',
    },
    target: '/dashboard',
    role: 'admin',
  },
  technician: {
    ar: {
      eyebrow: 'تطبيق الفني',
      title: 'نسخة الجوال المخصصة للفنيين',
      subtitle: 'واجهة عملية لفتح المهام والتنبيهات والتحديثات الميدانية بسرعة.',
      action: 'الدخول إلى صفحة المهام',
      secondaryAction: 'تسجيل فني جديد',
    },
    en: {
      eyebrow: 'Technician mobile app',
      title: 'Mobile experience for field technicians',
      subtitle: 'A focused app entry for tasks, alerts, and installation workflow.',
      action: 'Open technician tasks',
      secondaryAction: 'Register technician',
    },
    target: '/tasks',
    secondaryTarget: '/mobile/technician/register',
    role: 'technician',
  },
};

export default function MobileEntry({ mode }) {
  const { lang } = useLang();
  const { token, user } = useAuth();
  const [notificationState, setNotificationState] = useState(() => (typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'unsupported'));

  const config = modeCopy[mode] || modeCopy.admin;
  const text = config[lang] || config.en;
  const showNotificationCard = mode === 'technician';

  useEffect(() => {
    if (!showNotificationCard || typeof window === 'undefined' || !('Notification' in window)) return;
    setNotificationState(window.Notification.permission);
  }, [showNotificationCard]);

  const requestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationState('unsupported');
      return;
    }
    const result = await window.Notification.requestPermission();
    setNotificationState(result);
  };

  if (token && user?.role === config.role) {
    return <Navigate to={config.target} replace />;
  }

  if (token && user?.role && user.role !== config.role) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/tasks'} replace />;
  }

  return (
    <section className="page-shell mobile-entry" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="panel mobile-entry-card">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p className="section-subtitle">{text.subtitle}</p>

        {showNotificationCard ? (
          <div className="notification-card">
            <div>
              <strong>{lang === 'ar' ? 'تنبيهات فورية للمهام' : 'Instant job alerts'}</strong>
              <p>{lang === 'ar' ? 'فعّل الإشعارات حتى تصلك المهام الجديدة والمتأخرة مباشرة.' : 'Enable notifications so new and overdue jobs reach you immediately.'}</p>
            </div>
            <button className="btn-secondary" type="button" onClick={requestNotifications}>
              {notificationState === 'granted'
                ? lang === 'ar'
                  ? 'الإشعارات مفعلة'
                  : 'Notifications enabled'
                : lang === 'ar'
                  ? 'تفعيل الإشعارات'
                  : 'Enable notifications'}
            </button>
          </div>
        ) : null}

        <div className="mobile-entry-actions">
          <Link className="btn-primary" to={mode === 'technician' ? '/mobile/technician/login' : '/mobile/admin/login'} state={{ from: config.target, app: mode }}>
            {text.action}
          </Link>
          {mode === 'technician' ? (
            <Link className="btn-secondary" to={config.secondaryTarget}>
              {text.secondaryAction}
            </Link>
          ) : null}
          <Link className="btn-light" to="/">
            {lang === 'ar' ? 'العودة للموقع' : 'Back to website'}
          </Link>
        </div>
      </div>
    </section>
  );
}
