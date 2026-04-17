import React from 'react';
import { useLang } from '../context/LangContext';
import { legalBrandStatement, legalIdentity } from '../utils/legalInfo';

export default function PrivacyPolicy() {
  const { lang } = useLang();
  const statement = legalBrandStatement[lang] || legalBrandStatement.ar;

  return (
    <section className="legal-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="legal-page-hero">
        <span className="legal-page-kicker">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
        <h1>{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1>
        <p>
          {lang === 'ar'
            ? 'نوضح هنا هوية الجهة المشغلة للموقع وكيفية التعامل مع بيانات العملاء وطلبات الخدمة عبر نطاق kumeelalnahab.com.'
            : 'This page explains the legal operator of the website and how customer information is handled through kumeelalnahab.com.'}
        </p>
      </div>

      <div className="legal-page-grid">
        <article className="legal-card legal-card-wide">
          <h2>{lang === 'ar' ? 'الهوية القانونية' : 'Legal identity'}</h2>
          {statement.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            {lang === 'ar'
              ? 'الاسم القانوني الظاهر في المستندات الرسمية هو هاشم محسن آل درويش.'
              : 'The legal name shown in the official documents is Hashem Mohsen Al Darwish.'}
          </p>
        </article>

        <article className="legal-card">
          <h2>{lang === 'ar' ? 'ما الذي نجمعه' : 'What we collect'}</h2>
          <ul className="legal-list">
            <li>{lang === 'ar' ? 'بيانات التواصل مثل الاسم ورقم الجوال والبريد الإلكتروني.' : 'Contact details such as name, phone number, and email address.'}</li>
            <li>{lang === 'ar' ? 'بيانات الطلب والعنوان والملاحظات المتعلقة بخدمة التركيب أو الصيانة.' : 'Order, address, and service notes related to installation or maintenance.'}</li>
            <li>{lang === 'ar' ? 'البيانات التشغيلية اللازمة لمتابعة الطلبات وخدمة العملاء.' : 'Operational information needed to manage orders and customer support.'}</li>
          </ul>
        </article>

        <article className="legal-card">
          <h2>{lang === 'ar' ? 'كيف نستخدم البيانات' : 'How we use data'}</h2>
          <ul className="legal-list">
            <li>{lang === 'ar' ? 'لتأكيد الحجوزات ومتابعة تنفيذ الطلبات وخدمة ما بعد البيع.' : 'To confirm bookings, process service orders, and provide after-sales support.'}</li>
            <li>{lang === 'ar' ? 'للتواصل مع العميل بشأن المواعيد والتحديثات والوثائق ذات الصلة.' : 'To contact customers about appointments, updates, and related documentation.'}</li>
            <li>{lang === 'ar' ? 'للامتثال للمتطلبات التجارية والتنظيمية المعمول بها.' : 'To comply with applicable business and regulatory requirements.'}</li>
          </ul>
        </article>

        <article className="legal-card legal-card-wide">
          <h2>{lang === 'ar' ? 'الموقع والمستندات الرسمية' : 'Official website and documents'}</h2>
          <div className="legal-link-grid">
            <a className="legal-link-card" href={legalIdentity.websiteUrl} target="_blank" rel="noreferrer">
              <strong>{lang === 'ar' ? 'الموقع الرسمي' : 'Official website'}</strong>
              <span>{legalIdentity.websiteHost}</span>
            </a>
            <a className="legal-link-card" href={legalIdentity.commercialRegisterPdfUrl} target="_blank" rel="noreferrer">
              <strong>{lang === 'ar' ? 'السجل التجاري' : 'Commercial register'}</strong>
              <span>{lang === 'ar' ? 'عرض ملف PDF' : 'View PDF'}</span>
            </a>
            <a className="legal-link-card" href={legalIdentity.vatCertificatePdfUrl} target="_blank" rel="noreferrer">
              <strong>{lang === 'ar' ? 'شهادة الرقم الضريبي' : 'VAT certificate'}</strong>
              <span>{lang === 'ar' ? 'عرض ملف PDF' : 'View PDF'}</span>
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
