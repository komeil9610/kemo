import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { useLang } from '../context/LangContext';
import { footerService } from '../services/api';
import { legalBrandStatement, legalIdentity } from '../utils/legalInfo';

const socialIcons = {
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
  x: FaXTwitter,
  twitter: FaXTwitter,
};

const isInternalLink = (url = '') => url.startsWith('/');

const linkLabelMap = {
  Home: 'الرئيسية',
  'About Us': 'من نحن',
  'Privacy Policy': 'سياسة الخصوصية',
  'Contact Us': 'تواصل معنا',
  Login: 'تسجيل الدخول',
  Support: 'الدعم',
  'Call us': 'اتصل بنا',
  WhatsApp: 'واتساب',
  'Commercial Register': 'السجل التجاري',
  'CR Verification': 'التحقق من السجل التجاري',
  'VAT Certificate': 'شهادة الرقم الضريبي',
};

const fallbackFooter = {
  aboutText: 'تركيب برو لخدمات تركيب وصيانة المكيفات بخبرة عالية، وسرعة في الوصول، وضمان على جودة العمل.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'About Us', url: '/about' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Contact Us', url: '/contact' },
    { label: 'Login', url: '/login' },
  ],
  customerServiceLinks: [
    { label: 'Support', url: 'tel:0558232644' },
    { label: 'WhatsApp', url: 'https://wa.me/966558232644' },
    { label: 'Call us', url: 'tel:0558232644' },
  ],
  socialLinks: [{ platform: 'whatsapp', url: 'https://wa.me/966558232644' }],
  copyrightText: '© 2026 TrkeebPro',
};

const footerAboutTextEn =
  'TrkeebPro provides professional AC installation and maintenance with fast response, reliable workmanship, and competitive pricing.';
const isDefaultArabicFooterAbout = (value = '') =>
  /تركيب برو.*تركيب وصيانة المكيفات/i.test(String(value || ''));
const footerLegalCopy = {
  ar: ['© 2026 TrkeebPro', ...legalBrandStatement.ar],
  en: ['© 2026 TrkeebPro', ...legalBrandStatement.en],
};

const footerLegalLinks = [
  { label: 'About Us', url: '/about' },
  { label: 'Privacy Policy', url: '/privacy' },
  { label: 'Contact Us', url: '/contact' },
];

const footerDocumentLinks = [
  { label: 'Commercial Register', url: legalIdentity.commercialRegisterPdfUrl },
  { label: 'CR Verification', url: legalIdentity.commercialRegisterShortcutUrl },
  { label: 'VAT Certificate', url: legalIdentity.vatCertificatePdfUrl },
];

const hiddenSystemSignature = 'System developed and maintained by [Kumeel Taher Al Nahab / كميل طاهر ال نهاب]';

const isLegacyFooter = (footer) => /internal|داخلية|الداخلية/i.test(String(footer?.aboutText || ''));

export default function Footer() {
  const { lang } = useLang();
  const [footer, setFooter] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadFooter = async () => {
      try {
        const response = await footerService.get();
        if (mounted) {
          setFooter(response.data?.footer || null);
        }
      } catch {
        if (mounted) {
          setFooter(null);
        }
      }
    };

    loadFooter();
    return () => {
      mounted = false;
    };
  }, []);

  const footerConfig = isLegacyFooter(footer) ? fallbackFooter : { ...fallbackFooter, ...(footer || {}) };
  const usefulLinks = footerConfig.usefulLinks?.length ? footerConfig.usefulLinks : fallbackFooter.usefulLinks;
  const customerServiceLinks = footerConfig.customerServiceLinks?.length
    ? footerConfig.customerServiceLinks
    : fallbackFooter.customerServiceLinks;
  const socialLinks = footerConfig.socialLinks?.length ? footerConfig.socialLinks : fallbackFooter.socialLinks;
  const aboutText = lang === 'en' && isDefaultArabicFooterAbout(footerConfig.aboutText) ? footerAboutTextEn : footerConfig.aboutText;

  return (
    <footer className="site-footer">
      <span hidden data-system-signature={hiddenSystemSignature}>
        {hiddenSystemSignature}
      </span>
      <div className="site-footer-inner">
        <div className="footer-brand-card">
          <span className="footer-eyebrow">{lang === 'ar' ? 'خدمة موثوقة' : 'Trusted service'}</span>
          <h3>
            {lang === 'ar'
              ? 'تركيب وصيانة جميع أنواع المكيفات بخدمة سريعة وضمان على العمل.'
              : 'Professional AC installation and maintenance with fast response and workmanship guarantee.'}
          </h3>
          <p>{aboutText}</p>
          <div className="footer-socials">
            {socialLinks.map((item, index) => {
              const Icon = socialIcons[String(item.platform || '').toLowerCase()] || FaLinkedinIn;
              return (
                <a
                  key={`${item.platform}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.platform}
                  className="footer-social-link"
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>

        <div className="footer-links-grid">
          <FooterColumn title={lang === 'ar' ? 'روابط مهمة' : 'Useful links'} links={usefulLinks} />
          <FooterColumn title={lang === 'ar' ? 'التواصل' : 'Contact'} links={customerServiceLinks} />
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-legal-block">
          {(footerLegalCopy[lang] || footerLegalCopy.ar).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className="footer-legal-links">
          {footerLegalLinks.map((item) => (
            <Link key={item.label} to={item.url}>
              {lang === 'ar' ? linkLabelMap[item.label] || item.label : item.label}
            </Link>
          ))}
          {footerDocumentLinks.map((item) => (
            <a key={item.label} href={item.url} target="_blank" rel="noreferrer">
              {lang === 'ar' ? linkLabelMap[item.label] || item.label : item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  const { lang } = useLang();

  return (
    <div className="footer-column">
      <h4>{title}</h4>
      <div className="footer-column-links">
        {links.map((item, index) =>
          isInternalLink(item.url) ? (
            <Link key={`${item.label}-${index}`} to={item.url}>
              {lang === 'ar' ? linkLabelMap[item.label] || item.label : item.label}
            </Link>
          ) : (
            <a key={`${item.label}-${index}`} href={item.url} target="_blank" rel="noreferrer">
              {lang === 'ar' ? linkLabelMap[item.label] || item.label : item.label}
            </a>
          )
        )}
      </div>
    </div>
  );
}
