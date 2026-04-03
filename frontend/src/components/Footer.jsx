import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { useLang } from '../context/LangContext';
import { footerService } from '../services/api';

const socialIcons = {
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
  x: FaXTwitter,
  twitter: FaXTwitter,
};

const isInternalLink = (url = '') => url.startsWith('/');

const linkLabelMap = {
  Home: 'الرئيسية',
  Login: 'تسجيل الدخول',
  'Internal Dashboard': 'اللوحة الداخلية',
  Support: 'الدعم',
  'Call us': 'اتصل بنا',
  WhatsApp: 'واتساب',
};

const fallbackFooter = {
  aboutText: 'مساحة داخلية مبسطة لإدارة الطلبات بين خدمة العملاء ومدير العمليات فقط.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'Login', url: '/login' },
  ],
  customerServiceLinks: [
    { label: 'Support', url: 'tel:+966558232644' },
    { label: 'WhatsApp', url: 'https://wa.me/966558232644' },
    { label: 'Call us', url: 'tel:+966558232644' },
  ],
  socialLinks: [
    { platform: 'whatsapp', url: 'https://wa.me/966558232644' },
    { platform: 'x', url: 'https://x.com/tarkeebpro' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/tarkeebpro' },
  ],
  copyrightText: 'Tarkeeb Pro Internal',
};

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

  const footerConfig = { ...fallbackFooter, ...(footer || {}) };
  const usefulLinks = footerConfig.usefulLinks?.length ? footerConfig.usefulLinks : fallbackFooter.usefulLinks;
  const customerServiceLinks = footerConfig.customerServiceLinks?.length
    ? footerConfig.customerServiceLinks
    : fallbackFooter.customerServiceLinks;
  const socialLinks = footerConfig.socialLinks?.length ? footerConfig.socialLinks : fallbackFooter.socialLinks;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-card">
          <span className="footer-eyebrow">{lang === 'ar' ? 'تشغيل داخلي' : 'Internal operations'}</span>
          <h3>
            {lang === 'ar'
              ? 'إنشاء الطلب من خدمة العملاء وتحديثه حصراً من مدير العمليات.'
              : 'Requests are created by customer service and updated only by the operations manager.'}
          </h3>
          <p>{footerConfig.aboutText}</p>
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
        <span>{footerConfig.copyrightText || fallbackFooter.copyrightText}</span>
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
