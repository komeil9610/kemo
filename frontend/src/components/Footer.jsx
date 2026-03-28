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
          <span className="footer-eyebrow">Tarkeeb Pro</span>
          <h3>Faster operations, clearer tracking, cleaner handoffs.</h3>
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
          <FooterColumn title="Useful links" links={usefulLinks} />
          <FooterColumn title="Customer care" links={customerServiceLinks} />
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
