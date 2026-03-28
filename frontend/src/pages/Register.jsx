import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { formatSaudiPhoneDisplay, normalizeSaudiPhoneNumber, operationsService } from '../services/api';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  region: 'Eastern Province',
  notes: '',
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
      eyebrow: 'توظيف فني جديد',
      title: 'سجّل الفني الجديد الذي ستوظفه داخل النظام',
      subtitle: 'هذا النموذج يرسل بيانات الفني مباشرة إلى الخلفية الرسمية لإنشاء حساب فني حقيقي.',
      formTitle: 'بيانات الفني الجديد',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      email: 'البريد الإلكتروني',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      region: 'المنطقة',
      notes: 'معلومات الفني',
      submit: 'توظيف الفني',
      loading: 'جارٍ حفظ الفني...',
      success: 'تم حفظ الفني بنجاح ويمكنه الآن تسجيل الدخول.',
      officialTitle: 'بوابة التوظيف الرسمية',
      officialHint: 'هذه الصفحة مخصصة لتسجيل الفنيين الجدد الذين ستوظفهم فقط.',
      officialLogin: 'الانتقال إلى تسجيل الدخول',
      phonePlaceholder: '05xxxxxxxx',
      footerText: 'يمكنك إضافة الفنيين الجدد من هنا ثم الدخول لهم من صفحة تسجيل الدخول الرسمية.',
    },
    en: {
      eyebrow: 'Technician hiring',
      title: 'Register a new technician you are hiring',
      subtitle: 'This form sends the technician data directly to the official backend and creates a real technician account.',
      formTitle: 'New technician details',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email address',
      phone: 'Mobile number',
      password: 'Password',
      region: 'Region',
      notes: 'Technician info',
      submit: 'Create technician',
      loading: 'Saving technician...',
      success: 'Technician saved successfully and can sign in now.',
      officialTitle: 'Official hiring portal',
      officialHint: 'This page is dedicated to the technicians you are hiring.',
      officialLogin: 'Go to sign in',
      phonePlaceholder: '05xxxxxxxx',
      footerText: 'Add new technicians here, then sign them in from the official login page.',
    },
  }[lang || 'en'];

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setLoading(true);
      await operationsService.createTechnician({
        ...form,
        phone: normalizeSaudiPhoneNumber(form.phone),
      });
      setMessage(copy.success);
      setTimeout(() => navigate('/dashboard', { replace: true }), 900);
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

          <label>{copy.region}</label>
          <select
            className="input"
            value={form.region}
            onChange={(event) => setForm({ ...form, region: event.target.value })}
            required
          >
            <option value="Eastern Province">{lang === 'ar' ? 'المنطقة الشرقية' : 'Eastern Province'}</option>
            <option value="Riyadh Region">{lang === 'ar' ? 'منطقة الرياض' : 'Riyadh Region'}</option>
            <option value="Makkah Region">{lang === 'ar' ? 'منطقة مكة المكرمة' : 'Makkah Region'}</option>
            <option value="Madinah Region">{lang === 'ar' ? 'منطقة المدينة المنورة' : 'Madinah Region'}</option>
          </select>

          <label>{copy.notes}</label>
          <textarea
            className="input textarea"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder={lang === 'ar' ? 'التخصص، الخبرة، أو أي ملاحظات تشغيلية' : 'Specialization, experience, or operational notes'}
            rows={4}
          />

          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? copy.loading : copy.submit}
          </button>

          <p className="muted">
            {copy.footerText}{' '}
            <Link to="/mobile/technician/login">{copy.officialLogin}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
