import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaLinkedinIn, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from 'react-icons/fa6';
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
const defaultFooter = {
  aboutText: 'Rent It منصة موثوقة لتأجير المنتجات والخدمات بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
  usefulLinks: [
    { label: 'الرئيسية', url: '/' },
    { label: 'المنتجات', url: '/products' },
    { label: 'طلباتي', url: '/orders' },
  ],
  customerServiceLinks: [
    { label: 'الدعم الفني', url: 'mailto:support@rentit.app' },
    { label: 'واتساب', url: 'https://wa.me/966500000000' },
    { label: 'الأسئلة الشائعة', url: '/products' },
  ],
  socialLinks: [
    { platform: 'instagram', url: 'https://instagram.com/rentit.app' },
    { platform: 'x', url: 'https://x.com/rentitapp' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/rentit' },
  ],
  copyrightText: 'جميع الحقوق محفوظة لكميل',
};

export default function Footer() {
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

  const usefulLinks = footer?.usefulLinks?.length ? footer.usefulLinks : defaultFooter.usefulLinks;
  const customerServiceLinks = footer?.customerServiceLinks?.length ? footer.customerServiceLinks : defaultFooter.customerServiceLinks;
  const socialLinks = footer?.socialLinks?.length ? footer.socialLinks : defaultFooter.socialLinks;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-card">
          <span className="footer-eyebrow">Rent It</span>
          <h3>تأجير أسهل، تجربة أوضح، وثقة أكبر.</h3>
          <p>{footer?.aboutText || defaultFooter.aboutText}</p>
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
          <FooterColumn title="روابط تهمك" links={usefulLinks} />
          <FooterColumn title="خدمة العملاء" links={customerServiceLinks} />
        </div>
      </div>

      <div className="footer-bottom">
        <span>{footer?.copyrightText || defaultFooter.copyrightText}</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="footer-column">
      <h4>{title}</h4>
      <div className="footer-column-links">
        {links.map((item, index) => (
          isInternalLink(item.url) ? (
            <Link key={`${item.label}-${index}`} to={item.url}>
              {item.label}
            </Link>
          ) : (
            <a key={`${item.label}-${index}`} href={item.url} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          )
        ))}
      </div>
    </div>
  );
}
