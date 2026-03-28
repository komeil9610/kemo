import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaLinkedinIn, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { footerService } from '../services/api';

const socialIcons = {
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
  x: FaXTwitter,
  twitter: FaXTwitter,
  tiktok: FaTiktok,
  youtube: FaYoutube,
};

const isInternalLink = (url = '') => url.startsWith('/');
const linkLabelMap = {
  Home: 'الرئيسية',
  'Admin Dashboard': 'لوحة الإدارة',
  'Technician Tasks': 'صفحة الفني',
  Summary: 'الملخص',
  Tasks: 'المهام',
  Pricing: 'التسعير',
  Checklist: 'المراجعة',
  Support: 'الدعم',
  'Call us': 'اتصل بنا',
  'Call support': 'اتصل بالدعم',
  Dispatch: 'الإسناد',
  WhatsApp: 'واتساب',
};

const defaultFooter = {
  aboutText: 'Tarkeeb Pro keeps orders and field operations organized from one clear screen.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'Admin Dashboard', url: '/dashboard' },
    { label: 'Technician Tasks', url: '/tasks' },
  ],
  customerServiceLinks: [
    { label: 'Support', url: 'mailto:ops@tarkeebpro.sa' },
    { label: 'WhatsApp', url: 'https://wa.me/966500000000' },
    { label: 'Call us', url: 'tel:+966500000000' },
  ],
  socialLinks: [
    { platform: 'instagram', url: 'https://instagram.com/tarkeebpro' },
    { platform: 'x', url: 'https://x.com/tarkeebpro' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/tarkeebpro' },
  ],
  copyrightText: 'Tarkeeb Pro',
};

const technicianFooter = {
  aboutText: 'The technician workspace is focused on today’s jobs, alerts, service pricing, and proof of work.',
  usefulLinks: [
    { label: 'Summary', url: '/tasks#technician-summary' },
    { label: 'Tasks', url: '/tasks#technician-tasks' },
    { label: 'Pricing', url: '/tasks#technician-pricing' },
    { label: 'Checklist', url: '/tasks#technician-checklist' },
  ],
  customerServiceLinks: [
    { label: 'Dispatch', url: 'mailto:ops@tarkeebpro.sa' },
    { label: 'WhatsApp', url: 'https://wa.me/966500000000' },
    { label: 'Call support', url: 'tel:+966500000000' },
  ],
  socialLinks: [
    { platform: 'whatsapp', url: 'https://wa.me/966500000000' },
    { platform: 'x', url: 'https://x.com/tarkeebpro' },
  ],
  copyrightText: 'Technician workspace - Tarkeeb Pro',
};

export default function Footer() {
  const { user } = useAuth();
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
    window.addEventListener('footer-settings-updated', loadFooter);
    return () => {
      mounted = false;
      window.removeEventListener('footer-settings-updated', loadFooter);
    };
  }, []);

  const isTechnician = user?.role === 'technician';
  const footerConfig = isTechnician
    ? { ...(footer || {}), ...technicianFooter }
    : { ...defaultFooter, ...(footer || {}) };

  const usefulLinks = footerConfig.usefulLinks?.length ? footerConfig.usefulLinks : defaultFooter.usefulLinks;
  const customerServiceLinks = footerConfig.customerServiceLinks?.length
    ? footerConfig.customerServiceLinks
    : defaultFooter.customerServiceLinks;
  const socialLinks = footerConfig.socialLinks?.length ? footerConfig.socialLinks : defaultFooter.socialLinks;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-card">
          <span className="footer-eyebrow">{isTechnician ? (lang === 'ar' ? 'مساحة الفني' : 'Technician space') : 'Tarkeeb Pro'}</span>
          <h3>
            {isTechnician
              ? lang === 'ar'
                ? 'كل ما يحتاجه الفني في شاشة واحدة.'
                : 'Everything a technician needs in one focused workspace.'
              : lang === 'ar'
                ? 'تشغيل أسرع، متابعة أوضح، وتسليم أنظف.'
                : 'Faster operations, clearer tracking, cleaner handoffs.'}
          </h3>
          <p>{footerConfig.aboutText}</p>
          <div className="footer-socials">
            {socialLinks.map((item, index) => {
              const key = String(item.platform || '').toLowerCase();
              const Icon = socialIcons[key] || FaLinkedinIn;
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
          <FooterColumn title={lang === 'ar' ? 'خدمة العملاء' : 'Customer care'} links={customerServiceLinks} />
        </div>
      </div>

      <div className="footer-bottom">
        <span>{footerConfig.copyrightText || defaultFooter.copyrightText}</span>
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
        {links.map((item, index) => (
          isInternalLink(item.url) ? (
            <Link key={`${item.label}-${index}`} to={item.url}>
              {lang === 'ar' ? linkLabelMap[item.label] || item.label : item.label}
            </Link>
          ) : (
            <a key={`${item.label}-${index}`} href={item.url} target="_blank" rel="noreferrer">
              {lang === 'ar' ? linkLabelMap[item.label] || item.label : item.label}
            </a>
          )
        ))}
      </div>
    </div>
  );
}
