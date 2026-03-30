import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { impactHaptic, notificationHaptic } from '../utils/mobileNative';

const roleRouteMap = {
  operations_manager: '/dashboard',
  customer_service: '/dashboard',
  technician: '/tasks/daily',
};

export default function Login({ appMode = 'operations' }) {
  const { lang } = useLang();
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const technicianMode = appMode === 'technician' || location.pathname.includes('/mobile/technician');

  const copyMap = {
    en: {
      eyebrow: 'Internal access',
      title: 'Sign in to the internal request room',
      subtitle:
        'This version is restricted to customer service and the operations manager. No technician or public access is exposed here.',
      email: 'Email address',
      password: 'Password',
      submit: 'Sign in',
      loading: 'Signing in...',
      helper: 'Secure internal login',
    },
    techEn: {
      eyebrow: 'Technician access',
      title: 'Sign in to the field technician app',
      subtitle: 'Use your official technician account to open the daily workflow, alerts, and proof upload tools.',
      email: 'Email address',
      password: 'Password',
      submit: 'Open technician app',
      loading: 'Opening technician app...',
      helper: 'Official technician login',
    },
    ar: {
      eyebrow: 'دخول داخلي',
      title: 'سجّل الدخول إلى غرفة الطلبات الداخلية',
      subtitle:
        'هذه النسخة مخصصة فقط لخدمة العملاء ومدير العمليات. لا توجد هنا صلاحيات فنيين أو دخول عام.',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'دخول',
      loading: 'جارٍ تسجيل الدخول...',
      helper: 'دخول داخلي آمن',
    },
    techAr: {
      eyebrow: 'دخول الفني',
      title: 'سجّل الدخول إلى تطبيق الفني الميداني',
      subtitle: 'استخدم حساب الفني الرسمي لفتح المهام اليومية والتنبيهات ورفع الإثباتات من الجوال.',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'فتح تطبيق الفني',
      loading: 'جارٍ فتح تطبيق الفني...',
      helper: 'دخول الفني الرسمي',
    },
  };

  const copyKey = technicianMode ? (lang === 'ar' ? 'techAr' : 'techEn') : lang === 'ar' ? 'ar' : 'en';
  const copy = copyMap[copyKey];

  const onSubmit = async (event) => {
    event.preventDefault();
    await impactHaptic('light');
    const nextUser = await login(email, password);
    if (nextUser) {
      await notificationHaptic('success');
      navigate(location.state?.from || roleRouteMap[nextUser.role] || '/dashboard', { replace: true });
    } else {
      await notificationHaptic('error');
    }
  };

  return (
    <section className={`page-shell auth-page ${technicianMode ? 'mobile-auth-page' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="auth-layout">
        <div className="auth-info">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>

        <form className="auth-card" onSubmit={onSubmit}>
          <h2>{copy.helper}</h2>

          <label>{copy.email}</label>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label>{copy.password}</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? <p className="error-text">{error}</p> : null}

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? copy.loading : copy.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
