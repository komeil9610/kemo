import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  getNotificationPermissionState,
  impactHaptic,
  notificationHaptic,
  requestNotificationPermissions,
  sendAppNotification,
  selectionHaptic,
} from '../utils/mobileNative';

const modeCopy = {
  admin: {
    ar: {
      eyebrow: 'تطبيق المسؤول',
      title: 'نسخة الجوال المخصصة للمسؤول',
      subtitle: 'واجهة سريعة لفتح لوحة الإدارة الرسمية ومتابعة الطلبات والفنيين.',
      action: 'الدخول إلى لوحة الإدارة',
      features: [
        { title: 'غرفة التنسيق', body: 'متابعة المناطق، تنسيق المهام، وحالة الطلبات من شاشة واحدة.' },
        { title: 'لوحة اليوم', body: 'الوصول السريع إلى مهام اليوم وتاريخ التشغيل والتقارير.' },
      ],
    },
    en: {
      eyebrow: 'Admin mobile app',
      title: 'Mobile experience for the admin team',
      subtitle: 'A focused app entry for managing orders, technicians, and official operations.',
      action: 'Open admin dashboard',
      features: [
        { title: 'Dispatch room', body: 'Manage regions, request lanes, and operational approvals from one mobile entry.' },
        { title: 'Today board', body: 'Jump directly into operational date control and the day planning pages.' },
      ],
    },
    target: '/dashboard',
    role: 'operations_manager',
  },
  technician: {
    ar: {
      eyebrow: 'تطبيق الفني',
      title: 'نسخة الجوال المخصصة للفنيين',
      subtitle: 'واجهة عملية لفتح المهام والتنبيهات والتحديثات الميدانية بسرعة.',
      action: 'الدخول إلى المهام اليومية',
      secondaryAction: 'تسجيل فني جديد',
      features: [
        { title: 'تنفيذ بيد واحدة', body: 'بطاقات كبيرة، إجراءات سريعة، وشريط سفلي مناسب للمس.' },
        { title: 'تنبيهات محلية', body: 'استقبال تنبيه محلي على الجهاز عند وصول تنبيه جديد أو مهمة تحتاج متابعة.' },
      ],
    },
    en: {
      eyebrow: 'Technician mobile app',
      title: 'Mobile experience for field technicians',
      subtitle: 'A focused app entry for tasks, alerts, and installation workflow.',
      action: 'Open daily tasks',
      secondaryAction: 'Register technician',
      features: [
        { title: 'One-hand workflow', body: 'Large cards, quick actions, and a touch-first bottom bar for field work.' },
        { title: 'Local alerts', body: 'Receive native on-device alerts when new task notifications or overdue warnings arrive.' },
      ],
    },
    target: '/tasks/daily',
    secondaryTarget: '/mobile/technician/register',
    role: 'technician',
  },
};

export default function MobileEntry({ mode }) {
  const { lang } = useLang();
  const { token, user } = useAuth();
  const [notificationState, setNotificationState] = useState('prompt');

  const config = modeCopy[mode] || modeCopy.admin;
  const text = config[lang] || config.en;
  const showNotificationCard = mode === 'technician';

  useEffect(() => {
    if (!showNotificationCard) return;
    getNotificationPermissionState().then(setNotificationState);
  }, [showNotificationCard]);

  const requestNotifications = async () => {
    await selectionHaptic();
    const result = await requestNotificationPermissions();
    setNotificationState(result);
    if (result === 'granted') {
      await notificationHaptic('success');
      await sendAppNotification({
        key: `mobile-entry-${mode}`,
        title: lang === 'ar' ? 'تم تفعيل التنبيهات' : 'Alerts enabled',
        body:
          lang === 'ar'
            ? 'سيصلك تنبيه محلي عند ورود تحديثات تشغيلية جديدة.'
            : 'You will now receive native alerts for new operational updates.',
      });
      return;
    }
    await impactHaptic('light');
  };

  if (token && user?.role === config.role) {
    return <Navigate to={config.target} replace />;
  }

  if (token && user?.role && user.role !== config.role) {
    return <Navigate to={user.role === 'operations_manager' || user.role === 'customer_service' ? '/dashboard' : '/tasks/daily'} replace />;
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

        <div className="mobile-entry-feature-grid">
          {text.features.map((feature) => (
            <article className="mobile-entry-feature" key={feature.title}>
              <strong>{feature.title}</strong>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>

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
