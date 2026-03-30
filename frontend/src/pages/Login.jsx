import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Login() {
  const { lang } = useLang();
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const copy = {
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
  }[lang || 'en'];

  const onSubmit = async (event) => {
    event.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate(location.state?.from || '/dashboard', { replace: true });
    }
  };

  return (
    <section className="page-shell auth-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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
