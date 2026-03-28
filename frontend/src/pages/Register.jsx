import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { operationsService } from '../services/api';

export default function Register() {
  const { lang } = useLang();
  const [message, setMessage] = useState('');

  const resetDemo = async () => {
    await operationsService.resetDemoData();
    setMessage('Demo data has been reset successfully');
  };

  return (
    <section className="page-shell" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="panel helper-panel">
        <p className="eyebrow">{lang === 'ar' ? 'الوصول السريع' : 'Quick access'}</p>
        <h1>{lang === 'ar' ? 'الحسابات الرسمية الجاهزة للاستخدام' : 'Official accounts ready for testing'}</h1>
        <p>
          {lang === 'ar'
            ? 'بدل إنشاء مستخدمين هنا، تعرض هذه الصفحة الحسابات الرسمية الجاهزة لتجربة الإدارة والفني مباشرة.'
            : 'Instead of creating users here, this page lists the official seeded accounts so you can test the admin and technician flows immediately.'}
        </p>

        <div className="demo-grid">
          <article className="preset-card static-card">
            <strong>{lang === 'ar' ? 'المسؤول' : 'Administrator'}</strong>
            <span>bobkumeel@gmail.com</span>
            <span>Kom123asd@</span>
          </article>
          <article className="preset-card static-card">
            <strong>{lang === 'ar' ? 'فني المنطقة الشرقية' : 'Eastern Technician'}</strong>
            <span>kumeelalnahab@gmail.com</span>
            <span>Komeil@123</span>
          </article>
        </div>

        <div className="helper-actions">
          <Link className="btn-primary" to="/login">{lang === 'ar' ? 'الانتقال لتسجيل الدخول' : 'Go to sign in'}</Link>
          <button className="btn-light" onClick={resetDemo} type="button">{lang === 'ar' ? 'إعادة ضبط البيانات' : 'Reset demo data'}</button>
        </div>

        {message ? <p className="success-text">{message}</p> : null}
      </div>
    </section>
  );
}
