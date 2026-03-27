import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const LangContext = createContext();

const translations = {
  en: {
    brand: 'RentIT',
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    orders: 'Orders',
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    heroTitle: 'Rent smarter. Own less. Do more.',
    heroSubtitle: 'Discover verified rentals for devices, costumes, and services across Saudi Arabia.',
    browse: 'Browse Products',
    getStarted: 'Get Started',
    featured: 'Featured Rentals'
  },
  ar: {
    brand: 'رنتت',
    home: 'الرئيسية',
    products: 'المنتجات',
    cart: 'السلة',
    orders: 'طلباتي',
    dashboard: 'لوحة التحكم',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    heroTitle: 'استأجر بذكاء. امتلك أقل. أنجز أكثر.',
    heroSubtitle: 'اكتشف منتجات وخدمات للإيجار بشكل موثوق في جميع أنحاء السعودية.',
    browse: 'تصفح المنتجات',
    getStarted: 'ابدأ الآن',
    featured: 'منتجات مميزة'
  }
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const toggleLang = useCallback(() => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    localStorage.setItem('lang', next);
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      isRTL: lang === 'ar',
      toggleLang,
      t: (key) => translations[lang][key] || key
    }),
    [lang, toggleLang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within LangProvider');
  }
  return context;
};
