import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { authService, formatSaudiPhoneDisplay, normalizeSaudiPhoneNumber } from '../services/api';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
};

export default function Register() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const copy = {
    ar: {
      eyebrow: 'بوابة التسجيل الرسمية',
      title: 'أنشئ حسابًا جديدًا للوصول إلى تركيب برو',
      subtitle: 'هذا النموذج متصل بالخلفية الرسمية ويُنشئ حساب عميل حقيقي مباشرة.',
      formTitle: 'تسجيل حساب جديد',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      email: 'البريد الإلكتروني',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      submit: 'إنشاء الحساب',
      loading: 'جارٍ إنشاء الحساب...',
      success: 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.',
      officialTitle: 'بوابة تسجيل رسمية',
      officialHint: 'هذا القسم مخصص للعملاء الجدد، بينما تبقى حسابات المسؤول والفني محمية وغير معروضة.',
      officialLogin: 'الانتقال إلى تسجيل الدخول',
      phonePlaceholder: '05xxxxxxxx',
      footerText: 'إذا كنت مسؤولًا أو فنيًا، استخدم صفحة الدخول الرسمية فقط.',
    },
    en: {
      eyebrow: 'Official registration portal',
      title: 'Create a new account for Tarkeeb Pro',
      subtitle: 'This form connects to the official backend and creates a real customer account.',
      formTitle: 'Register new account',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email address',
      phone: 'Mobile number',
      password: 'Password',
      submit: 'Create account',
      loading: 'Creating account...',
      success: 'Account created successfully. You can now sign in.',
      officialTitle: 'Official registration portal',
      officialHint: 'This section is for new customers only. Admin and technician accounts stay protected and hidden.',
      officialLogin: 'Go to sign in',
      phonePlaceholder: '05xxxxxxxx',
      footerText: 'If you are an admin or technician, use the official sign-in page only.',
    },
  }[lang || 'en'];

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setLoading(true);
      await authService.register({
        ...form,
        phone: normalizeSaudiPhoneNumber(form.phone),
      });
      setMessage(copy.success);
      setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell auth-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="auth-layout">
        <div className="auth-info">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          <p className="muted">{copy.officialHint}</p>
        </div>

        <form className="auth-card" onSubmit={onSubmit}>
          <h2>{copy.formTitle}</h2>

          <div className="grid-two">
            <div>
              <label>{copy.firstName}</label>
              <input
                className="input"
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                required
              />
            </div>
            <div>
              <label>{copy.lastName}</label>
              <input
                className="input"
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                required
              />
            </div>
          </div>

          <label>{copy.email}</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />

          <label>{copy.phone}</label>
          <input
            className="input"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder={copy.phonePlaceholder}
            required
          />
          <p className="muted">{formatSaudiPhoneDisplay(form.phone) ? formatSaudiPhoneDisplay(form.phone) : copy.phonePlaceholder}</p>

          <label>{copy.password}</label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />

          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? copy.loading : copy.submit}
          </button>

          <p className="muted">
            {copy.footerText}{' '}
            <Link to="/login">{copy.officialLogin}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
