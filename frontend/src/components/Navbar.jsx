import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { lang, isRTL, toggleLang, t } = useLang();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="nav-wrap" dir={isRTL ? 'rtl' : 'ltr'}>
      <nav className="nav">
        <Link className="brand" to="/">{t('brand')}</Link>
        <div className="nav-links">
          <NavLink to="/">{t('home')}</NavLink>
          <NavLink to="/products">{t('products')}</NavLink>
          <NavLink to="/cart">{t('cart')}</NavLink>
          {isAdmin ? <NavLink to="/dashboard">{t('dashboard')}</NavLink> : null}
        </div>
        <div className="nav-actions">
          <button className="btn-light" onClick={toggleLang} type="button">
            {lang === 'en' ? 'AR' : 'EN'}
          </button>
          {!token ? (
            <>
              <Link className="btn-light" to="/login">{t('login')}</Link>
              <Link className="btn-primary" to="/register">{t('register')}</Link>
            </>
          ) : (
            <>
              <span className="user-chip">{isAdmin ? 'Admin' : (user?.name || user?.email || 'Member')}</span>
              <button className="btn-danger" onClick={logout} type="button">{t('logout')}</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
