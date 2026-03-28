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
              ? 'الحسابات الرسمية جاهزة للاستخدام من المسؤول والفني، مع ربط كامل بالخلفية.'
              : 'Official administrator and technician accounts are ready to use with full backend integration.'}
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
              <strong>{lang === 'ar' ? 'المسؤول' : 'Administrator'}</strong>
              <span>bobkumeel@gmail.com</span>
              <span>Kom123asd@</span>
            </button>
            <button
              className="preset-card"
              onClick={() => {
                setEmail(presets.technician.email);
                setPassword(presets.technician.password);
              }}
              type="button"
            >
              <strong>{lang === 'ar' ? 'الفني' : 'Technician'}</strong>
              <span>kumeelalnahab@gmail.com</span>
              <span>Komeil@123</span>
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
            {lang === 'ar' ? 'تحتاج نظرة سريعة على الحسابات الجاهزة؟' : 'Need a quick look at the seeded accounts?'}{' '}
            <Link to="/register">{lang === 'ar' ? 'افتح الحسابات الرسمية' : 'Open official accounts'}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
