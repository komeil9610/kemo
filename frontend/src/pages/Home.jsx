import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const featured = [
  { id: '1', title: 'Gaming Gear', text: 'Top-tier consoles and accessories ready today.' },
  { id: '2', title: 'Event Costumes', text: 'Standout outfits for events, parties, and shows.' },
  { id: '3', title: 'Creative Equipment', text: 'Cameras, lighting, and studio tools on demand.' }
];

export default function Home() {
  const { t, isRTL } = useLang();

  return (
    <section className="home" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="hero">
        <p className="hero-kicker">RentIT Marketplace</p>
        <h1>{t('heroTitle')}</h1>
        <p>{t('heroSubtitle')}</p>
        <div className="hero-actions">
          <Link className="btn-primary" to="/products">{t('browse')}</Link>
          <Link className="btn-light" to="/register">{t('getStarted')}</Link>
        </div>
      </div>
      <div className="stats">
        <div><strong>10K+</strong><span>Trusted Users</span></div>
        <div><strong>4.9/5</strong><span>Average Rating</span></div>
        <div><strong>35+</strong><span>Cities Covered</span></div>
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
