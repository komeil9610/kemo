import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { homeService, operationsService } from '../services/api';

const workflowSteps = [
  {
    title: '1. Capture the order',
    text: 'Log the customer name, location, and AC type from the admin dashboard in under a minute.',
  },
  {
    title: '2. Assign the technician',
    text: 'Pick the right technician by region and availability so the task appears instantly in the technician view.',
  },
  {
    title: '3. Execute and document',
    text: 'Update the status, calculate copper and base extras, then upload post-install photos to keep quality records.',
  },
];

export default function Home() {
  const { lang } = useLang();
  const [homeSettings, setHomeSettings] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [homeResponse, dashboardResponse] = await Promise.all([
        homeService.get(),
        operationsService.getDashboard(),
      ]);
      setHomeSettings(homeResponse.data?.homeSettings || null);
      setSummary(dashboardResponse.data?.summary || null);
    };

    load();
    window.addEventListener('operations-updated', load);
    return () => window.removeEventListener('operations-updated', load);
  }, []);

  const stats = homeSettings?.stats || [];

  return (
    <section className="home-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">{homeSettings?.heroKicker}</p>
          <h1>{homeSettings?.heroTitle}</h1>
          <p className="hero-text">{homeSettings?.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="btn-primary" to={homeSettings?.primaryButtonUrl || '/dashboard'}>
              {homeSettings?.primaryButtonText || (lang === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard')}
            </Link>
            <Link className="btn-light" to={homeSettings?.secondaryButtonUrl || '/tasks'}>
              {homeSettings?.secondaryButtonText || (lang === 'ar' ? 'واجهة الفني' : 'Technician View')}
            </Link>
          </div>
          <div className="hero-note">
            {lang === 'ar'
              ? 'تركنا الرسائل النصية والأتمتة الكاملة لمرحلة لاحقة حتى يبقى الإصدار الأول سريعًا وعمليًا.'
              : 'SMS workflows and full automation are intentionally left for a later phase so the MVP stays fast and practical.'}
          </div>
        </div>

        <div className="hero-card">
          <h3>{lang === 'ar' ? 'ملخص اليوم' : "Today's summary"}</h3>
          <div className="mini-stats">
            <article>
              <strong>{summary?.pendingOrders ?? 0}</strong>
              <span>{lang === 'ar' ? 'طلبات بانتظار التعيين' : 'Orders waiting for assignment'}</span>
            </article>
            <article>
              <strong>{summary?.activeOrders ?? 0}</strong>
              <span>{lang === 'ar' ? 'مهام نشطة' : 'Active jobs'}</span>
            </article>
            <article>
              <strong>{summary?.completedOrders ?? 0}</strong>
              <span>{lang === 'ar' ? 'طلبات مكتملة' : 'Completed orders'}</span>
            </article>
            <article>
              <strong>{summary?.extrasRevenue ?? 0} SAR</strong>
              <span>{lang === 'ar' ? 'إيرادات الإضافات' : 'Extras revenue'}</span>
            </article>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={`${item.label}-${item.value}`}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>

      <div className="feature-section">
        <div className="section-heading">
          <p className="eyebrow">MVP roadmap</p>
          <h2>{lang === 'ar' ? 'كيف تم تقسيم التطبيق؟' : 'How is the app structured?'}</h2>
        </div>
        <div className="workflow-grid">
          {workflowSteps.map((step) => (
            <article className="workflow-card" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
