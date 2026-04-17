import React from 'react';
import { useLang } from '../context/LangContext';
import { legalBrandStatement, legalIdentity } from '../utils/legalInfo';

export default function ContactUs() {
  const { lang } = useLang();
  const statement = legalBrandStatement[lang] || legalBrandStatement.ar;

  return (
    <section className="legal-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="legal-page-hero">
        <span className="legal-page-kicker">{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</span>
        <h1>{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</h1>
        <p>
          {lang === 'ar'
            ? 'يمكنك التواصل مع تركيب برو عبر القنوات الرسمية التالية، مع توضيح أن التشغيل القانوني يتم بواسطة هاشم محسن آل درويش عبر kumeelalnahab.com.'
            : 'You can contact TrkeebPro through the official channels below. The service is legally operated by Hashem Mohsen Al Darwish through kumeelalnahab.com.'}
        </p>
      </div>

      <div className="legal-page-grid">
        <article className="legal-card legal-card-wide">
          <h2>{lang === 'ar' ? 'الهوية التجارية' : 'Brand identity'}</h2>
          {statement.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </article>

        <article className="legal-card">
          <h2>{lang === 'ar' ? 'قنوات البريد الرسمية' : 'Official email channels'}</h2>
          <div className="legal-contact-list">
            {legalIdentity.emails.map((email) => (
              <a key={email} href={`mailto:${email}`} className="legal-contact-item">
                {email}
              </a>
            ))}
          </div>
        </article>

        <article className="legal-card">
          <h2>{lang === 'ar' ? 'الموقع الرسمي' : 'Official website'}</h2>
          <a className="legal-contact-item" href={legalIdentity.websiteUrl} target="_blank" rel="noreferrer">
            {legalIdentity.websiteHost}
          </a>
          <p>
            {lang === 'ar'
              ? 'جميع الإشارات القانونية والرسمية في هذه الخدمة تعود إلى هذا النطاق.'
              : 'All official and legal references for this service point back to this domain.'}
          </p>
        </article>

        <article className="legal-card legal-card-wide">
          <h2>{lang === 'ar' ? 'المستندات والتحقق' : 'Documents and verification'}</h2>
          <div className="legal-link-grid">
            <a className="legal-link-card" href={legalIdentity.commercialRegisterPdfUrl} target="_blank" rel="noreferrer">
              <strong>{lang === 'ar' ? 'السجل التجاري' : 'Commercial register'}</strong>
              <span>{lang === 'ar' ? 'مستند رسمي بصيغة PDF' : 'Official PDF document'}</span>
            </a>
            <a className="legal-link-card" href={legalIdentity.vatCertificatePdfUrl} target="_blank" rel="noreferrer">
              <strong>{lang === 'ar' ? 'الرقم الضريبي' : 'VAT certificate'}</strong>
              <span>{lang === 'ar' ? 'مستند رسمي بصيغة PDF' : 'Official PDF document'}</span>
            </a>
            <a className="legal-link-card" href={legalIdentity.commercialRegisterShortcutUrl} target="_blank" rel="noreferrer">
              <strong>{lang === 'ar' ? 'التحقق من السجل التجاري' : 'Commercial register verification'}</strong>
              <span>{lang === 'ar' ? 'رابط الاختصار الرسمي' : 'Official shortcut link'}</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
