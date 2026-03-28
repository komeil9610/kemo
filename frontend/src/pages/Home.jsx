import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { homeService, operationsService } from '../services/api';

const copy = {
  en: {
    heroKicker: 'Official workflow',
    heroTitle: 'Build smarter installation operations.',
    heroSubtitle: 'Manage technicians, jobs, and field execution across Saudi Arabia from one dashboard.',
    primaryButton: 'Open dashboard',
    secondaryButton: 'Open technician view',
    note: 'SMS workflows and full automation are intentionally left for a later phase so the MVP stays fast and practical.',
    summaryTitle: "Today's summary",
    stats: [
      { label: 'Orders waiting for assignment' },
      { label: 'Active jobs' },
      { label: 'Completed orders' },
      { label: 'Extras revenue' },
    ],
    roadmapKicker: 'MVP roadmap',
    roadmapTitle: 'How is the app structured?',
    steps: [
      {
        title: '1. Capture the order',
        text: 'Log the customer name, location, and AC types from the admin dashboard in under a minute.',
      },
      {
        title: '2. Assign the technician',
        text: 'Pick the right technician by region and availability so the task appears instantly in the technician view.',
      },
      {
        title: '3. Execute and document',
        text: 'Update the status, calculate copper and base extras, then upload post-install photos to keep quality records.',
      },
    ],
  },
  ar: {
    heroKicker: 'الواجهة الرسمية',
    heroTitle: 'إدارة عمليات التركيب بذكاء.',
    heroSubtitle: 'إدارة الفنيين والطلبات والتنفيذ الميداني في السعودية من لوحة واحدة.',
    primaryButton: 'فتح لوحة الإدارة',
    secondaryButton: 'فتح صفحة الفني',
    note: 'تم تأجيل الرسائل النصية والأتمتة الكاملة إلى مرحلة لاحقة حتى يبقى الإصدار الأول سريعًا وعمليًا.',
    summaryTitle: 'ملخص اليوم',
    stats: [
      { label: 'طلبات بانتظار التعيين' },
      { label: 'مهام نشطة' },
      { label: 'طلبات مكتملة' },
      { label: 'إيرادات الإضافات' },
    ],
    roadmapKicker: 'خريطة MVP',
    roadmapTitle: 'كيف تم تقسيم التطبيق؟',
    steps: [
      {
        title: '1. تسجيل الطلب',
        text: 'سجّل اسم العميل والموقع وأنواع المكيفات من لوحة الإدارة في أقل من دقيقة.',
      },
      {
        title: '2. تعيين الفني',
        text: 'اختر الفني المناسب حسب المنطقة والتوفر لتظهر المهمة فورًا في صفحة الفني.',
      },
      {
        title: '3. التنفيذ والتوثيق',
        text: 'حدّث الحالة، احسب الإضافات، وارفع صور ما بعد التركيب لحفظ السجل والجودة.',
      },
    ],
  },
};

export default function Home() {
  const { lang } = useLang();
  const [homeSettings, setHomeSettings] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [homeResponse, dashboardResponse] = await Promise.all([homeService.get(), operationsService.getDashboard()]);
      setHomeSettings(homeResponse.data?.homeSettings || null);
      setSummary(dashboardResponse.data?.summary || null);
    };

    load();
    window.addEventListener('operations-updated', load);
    return () => window.removeEventListener('operations-updated', load);
  }, []);

  const t = copy[lang] || copy.en;
  const stats = lang === 'ar' ? t.stats : (homeSettings?.stats?.length ? homeSettings.stats : t.stats);

  return (
    <section className="home-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">{lang === 'ar' ? t.heroKicker : homeSettings?.heroKicker || t.heroKicker}</p>
          <h1>{lang === 'ar' ? t.heroTitle : homeSettings?.heroTitle || t.heroTitle}</h1>
          <p className="hero-text">{lang === 'ar' ? t.heroSubtitle : homeSettings?.heroSubtitle || t.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="btn-primary" to={homeSettings?.primaryButtonUrl || '/dashboard'}>
              {lang === 'ar' ? t.primaryButton : homeSettings?.primaryButtonText || t.primaryButton}
            </Link>
            <Link className="btn-light" to={homeSettings?.secondaryButtonUrl || '/tasks'}>
              {lang === 'ar' ? t.secondaryButton : homeSettings?.secondaryButtonText || t.secondaryButton}
            </Link>
          </div>
          <div className="hero-note">{lang === 'ar' ? t.note : homeSettings?.heroNote || t.note}</div>
        </div>

        <div className="hero-card">
          <h3>{t.summaryTitle}</h3>
          <div className="mini-stats">
            <article>
              <strong>{summary?.pendingOrders ?? 0}</strong>
              <span>{t.stats[0].label}</span>
            </article>
            <article>
              <strong>{summary?.activeOrders ?? 0}</strong>
              <span>{t.stats[1].label}</span>
            </article>
            <article>
              <strong>{summary?.completedOrders ?? 0}</strong>
              <span>{t.stats[2].label}</span>
            </article>
            <article>
              <strong>{summary?.extrasRevenue ?? 0} SAR</strong>
              <span>{t.stats[3].label}</span>
            </article>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={`${item.label}-${item.value || ''}`}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>

      <div className="feature-section">
        <div className="section-heading">
          <p className="eyebrow">{t.roadmapKicker}</p>
          <h2>{t.roadmapTitle}</h2>
        </div>
        <div className="workflow-grid">
          {t.steps.map((step) => (
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
