import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { homeService, operationsService } from '../services/api';

const copy = {
  en: {
    heroKicker: 'Made for the handoff',
    heroTitle: 'Built with care for customer service and the operations manager.',
    heroSubtitle:
      'This program exists to make their day lighter: fewer scattered updates, faster request intake, and one clear path from a new Zamil request to final completion.',
    primaryButton: 'Sign in',
    secondaryButton: 'Sign in',
    note: 'When request volume grows, the system stays calm, readable, and easy to act on.',
    summaryTitle: "Today's snapshot",
    devicesLabel: 'Devices in active work',
    stats: [
      { label: 'Waiting for operations' },
      { label: 'Active requests' },
      { label: 'Canceled requests' },
      { label: 'In transit now' },
    ],
    promiseKicker: 'Why it exists',
    promiseTitle: 'A friendlier workflow for the two people carrying the operation every day',
    promises: [
      {
        title: 'Built for trust',
        text: 'Customer service and operations share one source of truth instead of chasing updates across calls and scattered notes.',
      },
      {
        title: 'Built for heavy volume',
        text: 'Large daily batches stay organized through clear statuses and filtered task lists that surface what needs action now.',
      },
      {
        title: 'Built for speed',
        text: 'The intake form stays simple, the next step is always obvious, and notifications return the important update instantly.',
      },
    ],
    workflowKicker: 'Smooth flow',
    workflowTitle: 'Everything is arranged to make huge order loads easier to manage',
    steps: [
      {
        title: '1. Fast intake from customer service',
        text: 'Enter request number, customer mobile, AC details, map link, and notes in one quick action without extra screens.',
      },
      {
        title: '2. Clear movement for operations',
        text: 'Move requests across pending, scheduled, and in transit from one focused workflow designed for quick decisions.',
      },
      {
        title: '3. Instant visibility back to customer service',
        text: 'The moment the team is on the way or the work is done, customer service is updated without refreshing or manual follow-up.',
      },
    ],
    featuresKicker: 'Operational value',
    featuresTitle: 'Why this version works better for the new mission',
    features: [
      {
        title: 'Role focus',
        text: 'Only two roles are present, so every screen stays relevant and uncluttered.',
      },
      {
        title: 'High-volume clarity',
        text: 'The workspace keeps new and active requests separate for faster scanning under pressure.',
      },
      {
        title: 'Direct communication',
        text: 'The workflow is intentionally private between customer service and the operations manager.',
      },
      {
        title: 'Status certainty',
        text: 'Each request follows one controlled path, reducing confusion when many requests arrive together.',
      },
    ],
  },
  ar: {
    heroKicker: 'مصمم من أجل رحلة الفريق',
    heroTitle: 'هذا البرنامج صُمم بكل عناية لتسهيل رحلة خدمة العملاء ومدير العمليات.',
    heroSubtitle:
      'فكرته أن يخفف الضغط عنهما: إدخال أسرع للطلبات، متابعة أوضح للحالات، ومسار واحد مرتب من لحظة ورود طلب الزامل حتى اكتماله.',
    primaryButton: 'تسجيل الدخول',
    secondaryButton: 'تسجيل الدخول',
    note: 'حتى عندما تتضاعف الطلبات، يبقى النظام هادئاً وواضحاً وسهلاً في اتخاذ القرار.',
    summaryTitle: 'ملخص سريع',
    devicesLabel: 'إجمالي الأجهزة في العمل',
    stats: [
      { label: 'بانتظار العمليات' },
      { label: 'طلبات نشطة' },
      { label: 'طلبات ملغاة' },
      { label: 'في الطريق الآن' },
    ],
    promiseKicker: 'لماذا هذا النظام؟',
    promiseTitle: 'تجربة أهدأ وأوضح للطرفين اللذين يحملان عبء التشغيل يومياً',
    promises: [
      {
        title: 'مبني على الوضوح',
        text: 'خدمة العملاء ومدير العمليات يشاهدان نفس الحقيقة من شاشة واحدة بدلاً من التشتت بين المكالمات والملاحظات المتفرقة.',
      },
      {
        title: 'مبني للضغط العالي',
        text: 'حتى مع تدفق الطلبات الكبير يومياً، تبقى الحالات منظمة وقوائم العمل واضحة وما يحتاج تدخلاً يظهر بسرعة.',
      },
      {
        title: 'مبني للسرعة',
        text: 'نموذج الإدخال بسيط، والخطوة التالية واضحة دائماً، والتنبيه المهم يعود فوراً إلى خدمة العملاء.',
      },
    ],
    workflowKicker: 'سلاسة التشغيل',
    workflowTitle: 'كل شيء مرتب لتسهيل إدارة الطلبات الهائلة',
    steps: [
      {
        title: '1. إدخال سريع من خدمة العملاء',
        text: 'رقم الطلب، جوال العميل، تفاصيل المكيفات، رابط الموقع، والملاحظات كلها من خطوة واحدة بلا تعقيد.',
      },
      {
        title: '2. تحريك واضح من مدير العمليات',
        text: 'ينقل الطلب بين بانتظار العمليات، تمت الجدولة، وفي الطريق من مسار واحد واضح ومصمم للقرار السريع.',
      },
      {
        title: '3. عودة فورية للمعلومة إلى خدمة العملاء',
        text: 'عند تحرك الفريق أو انتهاء العمل تصل المعلومة مباشرة من غير تحديث يدوي أو متابعة مشتتة.',
      },
    ],
    featuresKicker: 'قيمة تشغيلية',
    featuresTitle: 'لماذا هذه النسخة أنسب لمهمة الموقع الجديدة',
    features: [
      {
        title: 'تركيز كامل على الدورين',
        text: 'وجود دورين فقط يجعل كل شاشة مرتبطة بالعمل الفعلي من دون عناصر زائدة.',
      },
      {
        title: 'وضوح تحت الضغط',
        text: 'فصل الطلبات الجديدة والنشطة داخل قوائم واضحة يسهّل القراءة عند ارتفاع العدد.',
      },
      {
        title: 'تواصل مباشر',
        text: 'سير العمل مقصود أن يكون خاصاً ومباشراً بين خدمة العملاء ومدير العمليات.',
      },
      {
        title: 'يقين في الحالة',
        text: 'كل طلب يسير في مسار واحد مضبوط، مما يقلل الارتباك عندما تتزاحم الطلبات.',
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
      try {
        const [homeResponse, summaryResponse] = await Promise.all([homeService.get(), operationsService.getSummary()]);
        setHomeSettings(homeResponse.data?.homeSettings || null);
        setSummary(summaryResponse.data?.summary || null);
      } catch {
        setHomeSettings(null);
        setSummary(null);
      }
    };

    load();
    window.addEventListener('operations-updated', load);
    return () => window.removeEventListener('operations-updated', load);
  }, []);

  const t = copy[lang] || copy.en;
  const stats = lang === 'ar' ? t.stats : homeSettings?.stats?.length ? homeSettings.stats : t.stats;

  return (
    <section className="home-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">{lang === 'ar' ? t.heroKicker : homeSettings?.heroKicker || t.heroKicker}</p>
          <h1>{lang === 'ar' ? t.heroTitle : homeSettings?.heroTitle || t.heroTitle}</h1>
          <p className="hero-text">{lang === 'ar' ? t.heroSubtitle : homeSettings?.heroSubtitle || t.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="btn-primary" to="/login">
              {lang === 'ar' ? t.primaryButton : homeSettings?.primaryButtonText || t.primaryButton}
            </Link>
            <Link className="btn-light" to="/login">
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
              <strong>{summary?.canceledOrders ?? 0}</strong>
              <span>{t.stats[2].label}</span>
            </article>
            <article>
              <strong>{summary?.inTransitOrders ?? 0}</strong>
              <span>{t.stats[3].label}</span>
            </article>
            <article>
              <strong>{summary?.totalDevices ?? 0}</strong>
              <span>{t.devicesLabel}</span>
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
          <p className="eyebrow">{t.promiseKicker}</p>
          <h2>{t.promiseTitle}</h2>
        </div>
        <div className="home-value-grid">
          {t.promises.map((item) => (
            <article className="workflow-card home-value-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="feature-section">
        <div className="section-heading">
          <p className="eyebrow">{t.workflowKicker}</p>
          <h2>{t.workflowTitle}</h2>
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

      <div className="feature-section">
        <div className="section-heading">
          <p className="eyebrow">{t.featuresKicker}</p>
          <h2>{t.featuresTitle}</h2>
        </div>
        <div className="home-feature-grid">
          {t.features.map((item) => (
            <article className="stat-card home-feature-card" key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
