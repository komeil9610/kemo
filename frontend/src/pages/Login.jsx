import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const presets = {
  admin: { email: 'bobkumeel@gmail.com', password: 'Kom123asd@' },
  technician: { email: 'kumeelalnahab@gmail.com', password: 'Komeil@123' },
};

export default function Login() {
  const { lang } = useLang();
  const [email, setEmail] = useState(presets.admin.email);
  const [password, setPassword] = useState(presets.admin.password);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (event) => {
    event.preventDefault();
    const success = await login(email, password);
    if (success) {
      const backTo = location.state?.from || '/';
      navigate(backTo, { replace: true });
    }
  };

  return (
    <section className="page-shell auth-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="auth-layout">
        <div className="auth-info">
          <p className="eyebrow">{lang === 'ar' ? 'دخول رسمي' : 'Official access'}</p>
          <h1>{lang === 'ar' ? 'تسجيل الدخول إلى تركيب برو' : 'Sign in to Tarkeeb Pro'}</h1>
          <p>
            {lang === 'ar'
              ? 'تسجيل الدخول هنا رسمي ومربوط مباشرة بالخلفية. الحسابات الإدارية والفنية محمية ولا تُعرض بياناتها على الشاشة.'
              : 'Sign in here is fully connected to the backend. Official admin and technician accounts are protected and their credentials are hidden from the screen.'}
          </p>

          <div className="demo-grid">
            <button
              className="preset-card"
              onClick={() => {
                setEmail(presets.admin.email);
                setPassword(presets.admin.password);
              }}
              type="button"
            >
              <strong>{lang === 'ar' ? 'حساب المسؤول' : 'Admin account'}</strong>
              <span>{lang === 'ar' ? 'اختصار داخلي للاستخدام السريع' : 'Internal shortcut for quick access'}</span>
            </button>
            <button
              className="preset-card"
              onClick={() => {
                setEmail(presets.technician.email);
                setPassword(presets.technician.password);
              }}
              type="button"
            >
              <strong>{lang === 'ar' ? 'حساب الفني' : 'Technician account'}</strong>
              <span>{lang === 'ar' ? 'اختصار داخلي للاختبار فقط' : 'Internal shortcut for testing only'}</span>
            </button>
          </div>
        </div>

        <form className="auth-card" onSubmit={onSubmit}>
          <label>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email address'}</label>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label>{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
          <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          {error ? <p className="error-text">{error}</p> : null}

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? (lang === 'ar' ? 'جارٍ الدخول...' : 'Signing in...') : lang === 'ar' ? 'دخول' : 'Sign in'}
          </button>

          <p className="muted">
            {lang === 'ar' ? 'لإنشاء حساب عميل جديد استخدم بوابة التسجيل الرسمية.' : 'Use the official registration portal to create a new customer account.'}{' '}
            <Link to="/register">{lang === 'ar' ? 'الانتقال إلى التسجيل' : 'Go to registration'}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
