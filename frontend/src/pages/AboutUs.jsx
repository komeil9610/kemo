import React from 'react';
import { useLang } from '../context/LangContext';
import { legalBrandStatement, legalIdentity } from '../utils/legalInfo';

export default function AboutUs() {
  const { lang } = useLang();
  const statement = legalBrandStatement[lang] || legalBrandStatement.ar;

  return (
    <section className="legal-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="legal-page-hero">
        <span className="legal-page-kicker">{lang === 'ar' ? 'من نحن' : 'About Us'}</span>
        <h1>{lang === 'ar' ? 'من نحن' : 'About Us'}</h1>
        <p>
          {lang === 'ar'
            ? 'تركيب برو هي علامة تجارية لخدمات تركيب وصيانة المكيفات، مع توضيح المالك القانوني والموقع الرسمي بشكل واضح.'
            : 'TrkeebPro is a service brand for AC installation and maintenance, with the legal owner and official website presented clearly.'}
        </p>
      </div>

      <div className="legal-page-grid">
        <article className="legal-card legal-card-wide">
          <h2>{lang === 'ar' ? 'الهوية الرسمية للعلامة' : 'Official brand identity'}</h2>
          {statement.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            {lang === 'ar'
              ? 'تركيب برو هي علامة تجارية مملوكة ومدارة بواسطة هاشم محسن آل درويش، صنع بحب بواسطة كميل ال نهاب.'
              : 'TrkeebPro is the service brand for AC installation and maintenance, owned and managed by Hashem Mohsen Al Darwish.'}
          </p>
        </article>

        <article className="legal-card">
          <h2>{lang === 'ar' ? 'ما الذي نقدمه' : 'What we do'}</h2>
          <p>
            {lang === 'ar'
              ? 'نقدّم خدمات تركيب وصيانة المكيفات وجدولة الطلبات والمتابعة التشغيلية وخدمة العملاء عبر قنوات رسمية واضحة.'
              : 'We provide AC installation and maintenance, order scheduling, operational follow-up, and customer support through clear official channels.'}
          </p>
        </article>

        <article className="legal-card">
          <h2>{lang === 'ar' ? 'الموقع الرسمي' : 'Official website'}</h2>
          <a className="legal-contact-item" href={legalIdentity.websiteUrl} target="_blank" rel="noreferrer">
            {legalIdentity.websiteHost}
          </a>
          <p>
            {lang === 'ar'
              ? 'الموقع الرسمي هو المرجع الرئيسي للعروض والخدمات والصفحات القانونية التابعة للعلامة.'
              : 'The official website is the main reference for offers, services, and legal pages related to the brand.'}
          </p>
        </article>

        <article className="legal-card legal-card-wide">
          <h2>{lang === 'ar' ? 'المستندات الرسمية' : 'Official documents'}</h2>
          <div className="legal-link-grid">
            <a className="legal-link-card" href={legalIdentity.commercialRegisterPdfUrl} target="_blank" rel="noreferrer">
              <strong>{lang === 'ar' ? 'السجل التجاري' : 'Commercial register'}</strong>
              <span>{lang === 'ar' ? 'عرض الملف الرسمي' : 'Open official file'}</span>
            </a>
            <a className="legal-link-card" href={legalIdentity.vatCertificatePdfUrl} target="_blank" rel="noreferrer">
              <strong>{lang === 'ar' ? 'شهادة الرقم الضريبي' : 'VAT certificate'}</strong>
              <span>{lang === 'ar' ? 'عرض الملف الرسمي' : 'Open official file'}</span>
            </a>
            <a className="legal-link-card" href={legalIdentity.commercialRegisterShortcutUrl} target="_blank" rel="noreferrer">
              <strong>{lang === 'ar' ? 'التحقق من السجل التجاري' : 'Commercial register verification'}</strong>
              <span>{lang === 'ar' ? 'فتح رابط الاختصار الرسمي' : 'Open official shortcut link'}</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
