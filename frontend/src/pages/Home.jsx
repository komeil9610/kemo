import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { buildWhatsAppUrl, homeService } from '../services/api';
import { createDefaultHomeSettings, localizeHomeSettings, normalizeHomeSettings } from '../utils/homepageSettings';

const heroFallbackImage = '/home-hero-collage.png';

const copy = {
  ar: {
    adminCta: 'إدارة الصفحة الرئيسية',
    heroVisualTitle: 'خدماتنا الأساسية',
    featuredWork: 'أعمال مختارة',
    contactPhone: 'رقم الجوال',
    contactWhatsapp: 'واتساب',
    contactCoverage: 'نطاق الخدمة',
    contactHours: 'ساعات العمل',
    footerNote: 'نرتب لك الزيارة سريعًا ونخدم جميع أنواع المكيفات باحترافية.',
  },
  en: {
    adminCta: 'Edit homepage',
    heroVisualTitle: 'Core services',
    featuredWork: 'Featured work',
    contactPhone: 'Phone',
    contactWhatsapp: 'WhatsApp',
    contactCoverage: 'Coverage',
    contactHours: 'Working hours',
    footerNote: 'Fast response across Saudi Arabia for installation, maintenance, and AC relocation.',
  },
};

const isExternalUrl = (url = '') => /^(https?:|tel:|mailto:)/i.test(url);
const isHashUrl = (url = '') => String(url || '').startsWith('#');

function ActionButton({ className, label, url }) {
  if (isHashUrl(url) || isExternalUrl(url)) {
    return (
      <a
        className={className}
        href={url}
        rel={isExternalUrl(url) && !String(url).startsWith('tel:') ? 'noreferrer' : undefined}
        target={String(url).startsWith('http') ? '_blank' : undefined}
      >
        {label}
      </a>
    );
  }

  return (
    <Link className={className} to={url || '/'}>
      {label}
    </Link>
  );
}

export default function Home() {
  const { lang } = useLang();
  const { user, isAdmin } = useAuth();
  const ui = copy[lang] || copy.ar;
  const [homeSettings, setHomeSettings] = useState(() => createDefaultHomeSettings());
  const displaySettings = useMemo(() => localizeHomeSettings(homeSettings, lang), [homeSettings, lang]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await homeService.get();
        if (mounted) {
          setHomeSettings(normalizeHomeSettings(response.data?.homeSettings));
        }
      } catch {
        if (mounted) {
          setHomeSettings(createDefaultHomeSettings());
        }
      }
    };

    load();
    window.addEventListener('home-settings-updated', load);

    return () => {
      mounted = false;
      window.removeEventListener('home-settings-updated', load);
    };
  }, []);

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(displaySettings.whatsappNumber || displaySettings.phone),
    [displaySettings.phone, displaySettings.whatsappNumber]
  );
  const galleryImages = useMemo(
    () => displaySettings.galleryImages.filter((item) => item.imageUrl),
    [displaySettings.galleryImages]
  );

  const contactCards = [
    { label: ui.contactPhone, value: displaySettings.phone, url: `tel:${displaySettings.phone}` },
    { label: ui.contactWhatsapp, value: displaySettings.whatsappNumber || displaySettings.phone, url: whatsappUrl },
    { label: ui.contactCoverage, value: displaySettings.coverageText, url: null },
    { label: ui.contactHours, value: displaySettings.hoursText, url: null },
  ];

  return (
    <section className="home-page marketing-home" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="home-hero-shell">
        <div className="home-hero-copy">
          {isAdmin ? (
            <div className="home-admin-bar">
              <span>{user?.email}</span>
              <Link className="btn-light" to="/admin/homepage">
                {ui.adminCta}
              </Link>
            </div>
          ) : null}

          <p className="eyebrow">{displaySettings.heroKicker}</p>
          <h1>{displaySettings.heroTitle}</h1>
          <p className="hero-text">{displaySettings.heroSubtitle}</p>

          <div className="home-highlight-row">
            {displaySettings.heroHighlights.map((item) => (
              <span className="home-highlight-pill" key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="hero-actions">
            <ActionButton className="btn-primary" label={displaySettings.primaryButtonText} url={displaySettings.primaryButtonUrl} />
            <ActionButton
              className="btn-light"
              label={displaySettings.secondaryButtonText}
              url={displaySettings.secondaryButtonUrl || whatsappUrl}
            />
          </div>

          <div className="hero-note">{displaySettings.heroNote}</div>
        </div>

        <div className="home-hero-visual">
          <div className="home-hero-image-card">
            <img alt={displaySettings.heroTitle} src={heroFallbackImage} />
          </div>

          <div className="home-hero-side-panel">
            <div className="panel">
              <div className="panel-header">
                <p className="eyebrow">{ui.heroVisualTitle}</p>
                <h2>{displaySettings.servicesTitle}</h2>
              </div>
              <div className="home-service-mini-list">
                {displaySettings.services.slice(0, 4).map((item) => (
                  <span className="home-service-mini-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="home-stats-grid">
              {displaySettings.stats.map((item) => (
                <article className="stat-card" key={`${item.value}-${item.label}`}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel home-about-panel">
        <div className="section-heading">
          <p className="eyebrow">{displaySettings.aboutTitle}</p>
          <h2>{displaySettings.aboutTitle}</h2>
        </div>
        <p className="home-section-body">{displaySettings.aboutText}</p>
      </div>

      <div className="feature-section">
        <div className="section-heading">
          <p className="eyebrow">{displaySettings.servicesTitle}</p>
          <h2>{displaySettings.servicesTitle}</h2>
        </div>
        <div className="home-service-grid">
          {displaySettings.services.map((item) => (
            <article className="home-service-card" key={item}>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="feature-section">
        <div className="section-heading">
          <p className="eyebrow">{displaySettings.featuresTitle}</p>
          <h2>{displaySettings.featuresTitle}</h2>
        </div>
        <div className="home-why-grid">
          {displaySettings.features.map((item) => (
            <article className="workflow-card home-why-card" key={item}>
              <h3>{item}</h3>
              <p>{ui.footerNote}</p>
            </article>
          ))}
        </div>
      </div>

      {galleryImages.length ? (
        <div className="feature-section">
          <div className="section-heading">
            <p className="eyebrow">{ui.featuredWork}</p>
            <h2>{displaySettings.galleryTitle}</h2>
          </div>
          <div className="home-gallery-grid">
            {galleryImages.map((item, index) => (
              <article className="home-gallery-card" key={`${item.imageUrl}-${index}`}>
                <img alt={item.title || displaySettings.galleryTitle} src={item.imageUrl} />
                {item.title || item.caption ? (
                  <div className="home-gallery-copy">
                    {item.title ? <strong>{item.title}</strong> : null}
                    {item.caption ? <p>{item.caption}</p> : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="feature-section">
        <div className="section-heading">
          <p className="eyebrow">{displaySettings.testimonialsTitle}</p>
          <h2>{displaySettings.testimonialsTitle}</h2>
        </div>
        <div className="home-testimonials-grid">
          {displaySettings.testimonials.map((item) => (
            <article className="home-testimonial-card" key={item}>
              <p>"{item}"</p>
            </article>
          ))}
        </div>
      </div>

      <div className="home-contact-section" id="contact">
        <div className="panel home-contact-panel">
          <div className="section-heading">
            <p className="eyebrow">{displaySettings.contactTitle}</p>
            <h2>{displaySettings.contactTitle}</h2>
          </div>

          <div className="home-contact-grid">
            {contactCards.map((item) => (
              <article className="home-contact-card" key={item.label}>
                <span>{item.label}</span>
                {item.url ? (
                  <a href={item.url} rel={String(item.url).startsWith('http') ? 'noreferrer' : undefined} target={String(item.url).startsWith('http') ? '_blank' : undefined}>
                    {item.value}
                  </a>
                ) : (
                  <strong>{item.value}</strong>
                )}
              </article>
            ))}
          </div>

          <div className="hero-actions">
            <ActionButton className="btn-primary" label={homeSettings.primaryButtonText} url={`tel:${homeSettings.phone}`} />
            <ActionButton className="btn-light" label={homeSettings.secondaryButtonText} url={whatsappUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
