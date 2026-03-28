import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Login() {
  const { lang } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTechnicianAccess = location.pathname.includes('/mobile/technician') || location.state?.app === 'technician';
  const accessMode = isTechnicianAccess ? 'technician' : 'official';

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
          <p className="eyebrow">{accessMode === 'technician' ? (lang === 'ar' ? 'دخول الفني' : 'Technician access') : lang === 'ar' ? 'دخول رسمي' : 'Official access'}</p>
          <h1>
            {accessMode === 'technician'
              ? lang === 'ar'
                ? 'تسجيل الدخول إلى برنامج الفني'
                : 'Sign in to the technician app'
              : lang === 'ar'
                ? 'تسجيل الدخول إلى تركيب برو'
                : 'Sign in to Tarkeeb Pro'}
          </h1>
          <p>
            {lang === 'ar'
              ? accessMode === 'technician'
                ? 'هذا المسار مخصص للفنيين فقط ومربوط مباشرة بالخلفية الرسمية.'
                : 'تسجيل الدخول هنا رسمي ومربوط مباشرة بالخلفية. الحسابات الإدارية محمية ولا تُعرض كاختصارات.'
              : accessMode === 'technician'
                ? 'This route is for technicians only and is connected directly to the official backend.'
                : 'Sign in here is fully connected to the backend. Official admin accounts are protected and are not shown as shortcuts.'}
          </p>
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

          {isTechnicianAccess ? (
            <p className="muted">
              {lang === 'ar' ? 'إذا كنت موظفًا جديدًا، استخدم بوابة التوظيف الرسمية.' : 'If you are a new hire, use the official technician hiring portal.'}{' '}
              <Link to="/mobile/technician/register">{lang === 'ar' ? 'فتح بوابة التوظيف' : 'Open hiring portal'}</Link>
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
