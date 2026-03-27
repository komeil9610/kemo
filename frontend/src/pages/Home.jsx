import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { homeService } from '../services/api';

const featured = [
  { id: '1', title: 'Gaming Gear', text: 'Top-tier consoles and accessories ready today.' },
  { id: '2', title: 'Event Costumes', text: 'Standout outfits for events, parties, and shows.' },
  { id: '3', title: 'Creative Equipment', text: 'Cameras, lighting, and studio tools on demand.' }
];

export default function Home() {
  const { t, isRTL } = useLang();
  const [homeSettings, setHomeSettings] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadHomeSettings = async () => {
      try {
        const response = await homeService.get();
        if (mounted) {
          setHomeSettings(response.data?.homeSettings || null);
        }
      } catch {
        if (mounted) {
          setHomeSettings(null);
        }
      }
    };

    loadHomeSettings();
    window.addEventListener('home-settings-updated', loadHomeSettings);
    return () => {
      mounted = false;
      window.removeEventListener('home-settings-updated', loadHomeSettings);
    };
  }, []);

  const stats = homeSettings?.stats?.length
    ? homeSettings.stats
    : [
        { value: '10K+', label: 'Trusted Users' },
        { value: '4.9/5', label: 'Average Rating' },
        { value: '35+', label: 'Cities Covered' },
      ];

  return (
    <section className="home" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="hero">
        <p className="hero-kicker">{homeSettings?.heroKicker || 'RentIT Marketplace'}</p>
        <h1>{homeSettings?.heroTitle || t('heroTitle')}</h1>
        <p>{homeSettings?.heroSubtitle || t('heroSubtitle')}</p>
        <div className="hero-actions">
          <Link className="btn-primary" to={homeSettings?.primaryButtonUrl || '/products'}>
            {homeSettings?.primaryButtonText || t('browse')}
          </Link>
          <Link className="btn-light" to={homeSettings?.secondaryButtonUrl || '/register'}>
            {homeSettings?.secondaryButtonText || t('getStarted')}
          </Link>
        </div>
      </div>
      <div className="stats">
        {stats.map((item, index) => (
          <div key={`${item.value}-${index}`}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <h2 className="section-title">{t('featured')}</h2>
      <div className="feature-grid">
        {featured.map((item) => (
          <article className="feature-card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <Link to={`/products/${item.id}`}>Explore</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
