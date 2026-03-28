import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LangContext = createContext();

const translations = {
  en: {
    brand: 'Tarkeeb Pro',
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    orders: 'Orders',
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    heroTitle: 'Build smarter installation operations.',
    heroSubtitle: 'Manage technicians, jobs, and field execution across Saudi Arabia from one dashboard.',
    browse: 'Open dashboard',
    getStarted: 'Get started',
    featured: 'Featured operations'
  },
  ar: {
    brand: 'تركيب برو',
    home: 'الرئيسية',
    products: 'المنتجات',
    cart: 'السلة',
    orders: 'طلباتي',
    dashboard: 'لوحة التحكم',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    heroTitle: 'أدر عمليات التركيب بذكاء.',
    heroSubtitle: 'تابع الفنيين والطلبات والتنفيذ الميداني من لوحة واحدة داخل السعودية.',
    browse: 'افتح اللوحة',
    getStarted: 'ابدأ الآن',
    featured: 'عمليات مميزة'
  }
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

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
