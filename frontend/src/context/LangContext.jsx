import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LangContext = createContext();

const readStorage = (key) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
};

const translations = {
  en: {
    brand: 'Tarkeeb Pro Internal',
    home: 'Home',
    orders: 'Board',
    dashboard: 'Dashboard',
    operationsDay: 'Operations day',
    weeklyTasks: 'Weekly tasks',
    monthlyTasks: 'Monthly tasks',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    heroTitle: 'Internal order handoff between customer service and operations.',
    heroSubtitle: 'Create requests fast, move them through four clear stages, and keep both sides aligned.',
    browse: 'Open dashboard',
    getStarted: 'Sign in',
    featured: 'Internal workflow',
  },
  ar: {
    brand: 'تركيب برو الداخلي',
    home: 'الرئيسية',
    orders: 'اللوحة',
    dashboard: 'لوحة الطلبات',
    operationsDay: 'يوم التشغيل',
    weeklyTasks: 'المهام الأسبوعية',
    monthlyTasks: 'المهام الشهرية',
    login: 'تسجيل الدخول',
    register: 'تسجيل',
    logout: 'تسجيل الخروج',
    heroTitle: 'نظام داخلي لربط خدمة العملاء بمدير العمليات.',
    heroSubtitle: 'أنشئ الطلب بسرعة، حرّكه عبر أربع حالات واضحة، وابقِ الطرفين على نفس الصورة.',
    browse: 'فتح اللوحة',
    getStarted: 'تسجيل الدخول',
    featured: 'سير العمل الداخلي',
  },
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => readStorage('lang') || 'ar');

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
    writeStorage('lang', next);
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      isRTL: lang === 'ar',
      toggleLang,
      t: (key) => translations[lang]?.[key] || key,
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
