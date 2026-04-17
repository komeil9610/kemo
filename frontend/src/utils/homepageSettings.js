const clone = (value) => JSON.parse(JSON.stringify(value));
const isEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export const HOMEPAGE_STORAGE_KEY = 'tarkeeb-pro-homepage-settings-v2';

const HOME_SETTINGS_DEFAULTS = {
  ar: {
    contentVersion: 2,
    heroKicker: 'تركيب برو',
    heroTitle: 'تركيب وصيانة المكيفات باحترافية عالية',
    heroSubtitle: 'خدمة سريعة | أسعار منافسة | ضمان على العمل',
    heroNote:
      'متخصصون في تركيب وصيانة جميع أنواع المكيفات بخبرة عالية وفريق فني محترف، مع اهتمام بالتفاصيل وسرعة في التنفيذ.',
    primaryButtonText: 'احجز الآن',
    primaryButtonUrl: 'mailto:bookings@kumeelalnahab.com',
    secondaryButtonText: 'تواصل عبر واتساب',
    secondaryButtonUrl: 'https://wa.me/966558232644',
    heroHighlights: ['خدمة سريعة', 'أسعار منافسة', 'ضمان على العمل'],
    stats: [
      { value: '6', label: 'خدمات رئيسية' },
      { value: '24/7', label: 'استجابة سريعة' },
      { value: '100%', label: 'اهتمام بالنظافة والجودة' },
    ],
    aboutTitle: 'من نحن',
    aboutText:
      'نحن في "تركيب برو" متخصصون في تركيب وصيانة جميع أنواع المكيفات، بخبرة عالية وفريق فني محترف. نضمن لك جودة العمل وسرعة التنفيذ بأفضل الأسعار.',
    servicesTitle: 'خدماتنا',
    services: [
      'تركيب مكيفات سبليت',
      'تركيب مكيفات شباك',
      'فك ونقل المكيفات',
      'صيانة وتنظيف المكيفات',
      'تعبئة فريون',
      'كشف الأعطال',
    ],
    featuresTitle: 'لماذا تختارنا؟',
    features: ['فنيين محترفين', 'سرعة في الوصول', 'أسعار مناسبة', 'ضمان على الخدمة', 'خدمة عملاء ممتازة'],
    galleryTitle: 'أعمالنا',
    galleryImages: [
      {
        title: 'تركيب احترافي',
        caption: 'تنفيذ مرتب واهتمام كامل بالتفاصيل وجودة التشطيب.',
        imageUrl: '/home-gallery-1.jpg',
      },
      {
        title: 'خدمة ميدانية سريعة',
        caption: 'وصول سريع وتجهيز كامل لخدمة جميع أنواع المكيفات.',
        imageUrl: '/home-gallery-2.webp',
      },
      {
        title: 'صيانة وتنظيف',
        caption: 'حلول صيانة وتنظيف تعيد كفاءة التبريد وتحافظ على عمر الجهاز.',
        imageUrl: '/home-gallery-3.jpg',
      },
    ],
    testimonialsTitle: 'آراء العملاء',
    testimonials: ['خدمة ممتازة وسريعة، أنصح فيهم', 'أسعارهم مناسبة وشغلهم نظيف'],
    contactTitle: 'تواصل معنا',
    phone: '0558232644',
    whatsappNumber: '0558232644',
    coverageText: 'نخدم جميع مناطق المملكة',
    hoursText: 'بالمواعيد',
  },
  en: {
    contentVersion: 2,
    heroKicker: 'TrkeebPro',
    heroTitle: 'Professional AC Installation and Maintenance',
    heroSubtitle: 'Fast service | Competitive prices | Workmanship guarantee',
    heroNote:
      'We specialize in installing and maintaining all types of air conditioners with an experienced technical team, careful execution, and fast response.',
    primaryButtonText: 'Book now',
    primaryButtonUrl: 'mailto:bookings@kumeelalnahab.com',
    secondaryButtonText: 'Chat on WhatsApp',
    secondaryButtonUrl: 'https://wa.me/966558232644',
    heroHighlights: ['Fast service', 'Competitive prices', 'Workmanship guarantee'],
    stats: [
      { value: '6', label: 'Main services' },
      { value: '24/7', label: 'Fast response' },
      { value: '100%', label: 'Clean work and quality' },
    ],
    aboutTitle: 'About us',
    aboutText:
      'At TrkeebPro, we specialize in installing and maintaining all types of air conditioners with an experienced team of technicians. We guarantee quality work, fast execution, and competitive pricing.',
    servicesTitle: 'Our services',
    services: [
      'Split AC installation',
      'Window AC installation',
      'AC dismantling and relocation',
      'AC maintenance and cleaning',
      'Freon refill',
      'Fault detection',
    ],
    featuresTitle: 'Why choose us?',
    features: ['Professional technicians', 'Fast arrival', 'Competitive pricing', 'Service guarantee', 'Excellent customer support'],
    galleryTitle: 'Our work',
    galleryImages: [
      {
        title: 'Professional installation',
        caption: 'Clean execution with close attention to detail and finishing quality.',
        imageUrl: '/home-gallery-1.jpg',
      },
      {
        title: 'Fast field service',
        caption: 'Quick arrival and full readiness to handle all AC service needs.',
        imageUrl: '/home-gallery-2.webp',
      },
      {
        title: 'Maintenance and cleaning',
        caption: 'Maintenance and cleaning solutions that restore cooling efficiency and extend unit life.',
        imageUrl: '/home-gallery-3.jpg',
      },
    ],
    testimonialsTitle: 'Customer reviews',
    testimonials: ['Excellent and fast service. I highly recommend them.', 'Fair prices and very clean work.'],
    contactTitle: 'Contact us',
    phone: '0558232644',
    whatsappNumber: '0558232644',
    coverageText: 'We serve all regions of Saudi Arabia',
    hoursText: 'By appointment',
  },
};

export const createDefaultHomeSettings = (lang = 'ar') => clone(HOME_SETTINGS_DEFAULTS[lang] || HOME_SETTINGS_DEFAULTS.ar);

const normalizeText = (value, fallback = '') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

const normalizeStringList = (value, fallback = []) => {
  const items = (Array.isArray(value) ? value : [])
    .map((item) => normalizeText(item))
    .filter(Boolean);
  return items.length ? items : clone(fallback);
};

const normalizeStats = (value, fallback = []) => {
  const items = (Array.isArray(value) ? value : [])
    .map((item) => ({
      value: normalizeText(item?.value),
      label: normalizeText(item?.label),
    }))
    .filter((item) => item.value && item.label);
  return items.length ? items : clone(fallback);
};

const normalizeGalleryImages = (value, fallback = []) => {
  const defaults = clone(fallback);
  const items = (Array.isArray(value) ? value : []).map((item, index) => ({
    title: normalizeText(item?.title, defaults[index]?.title || ''),
    caption: normalizeText(item?.caption, defaults[index]?.caption || ''),
    imageUrl: normalizeText(item?.imageUrl, defaults[index]?.imageUrl || ''),
  }));

  const merged = defaults.map((item, index) => ({
    ...item,
    ...(items[index] || {}),
  }));

  return merged.length ? merged : defaults;
};

export const normalizeHomeSettings = (value) => {
  const defaults = createDefaultHomeSettings('ar');
  const raw = value && typeof value === 'object' ? value : {};
  const hasModernContent =
    Number(raw.contentVersion || 0) >= 2 ||
    raw.aboutTitle ||
    raw.aboutText ||
    Array.isArray(raw.services) ||
    Array.isArray(raw.heroHighlights);

  if (!hasModernContent) {
    return defaults;
  }

  return {
    contentVersion: 2,
    heroKicker: normalizeText(raw.heroKicker, defaults.heroKicker),
    heroTitle: normalizeText(raw.heroTitle, defaults.heroTitle),
    heroSubtitle: normalizeText(raw.heroSubtitle, defaults.heroSubtitle),
    heroNote: normalizeText(raw.heroNote, defaults.heroNote),
    primaryButtonText: normalizeText(raw.primaryButtonText, defaults.primaryButtonText),
    primaryButtonUrl: normalizeText(raw.primaryButtonUrl, defaults.primaryButtonUrl),
    secondaryButtonText: normalizeText(raw.secondaryButtonText, defaults.secondaryButtonText),
    secondaryButtonUrl: normalizeText(raw.secondaryButtonUrl, defaults.secondaryButtonUrl),
    heroHighlights: normalizeStringList(raw.heroHighlights, defaults.heroHighlights),
    stats: normalizeStats(raw.stats, defaults.stats),
    aboutTitle: normalizeText(raw.aboutTitle, defaults.aboutTitle),
    aboutText: normalizeText(raw.aboutText, defaults.aboutText),
    servicesTitle: normalizeText(raw.servicesTitle, defaults.servicesTitle),
    services: normalizeStringList(raw.services, defaults.services),
    featuresTitle: normalizeText(raw.featuresTitle, defaults.featuresTitle),
    features: normalizeStringList(raw.features, defaults.features),
    galleryTitle: normalizeText(raw.galleryTitle, defaults.galleryTitle),
    galleryImages: normalizeGalleryImages(raw.galleryImages, defaults.galleryImages),
    testimonialsTitle: normalizeText(raw.testimonialsTitle, defaults.testimonialsTitle),
    testimonials: normalizeStringList(raw.testimonials, defaults.testimonials),
    contactTitle: normalizeText(raw.contactTitle, defaults.contactTitle),
    phone: normalizeText(raw.phone, defaults.phone),
    whatsappNumber: normalizeText(raw.whatsappNumber, defaults.whatsappNumber),
    coverageText: normalizeText(raw.coverageText, defaults.coverageText),
    hoursText: normalizeText(raw.hoursText, defaults.hoursText),
  };
};

export const getStoredHomeSettings = (value) => normalizeHomeSettings(value ? JSON.parse(value) : null);

export const localizeHomeSettings = (settings, lang = 'ar') => {
  if (lang !== 'en') {
    return settings;
  }

  const arabicDefaults = createDefaultHomeSettings('ar');
  const englishDefaults = createDefaultHomeSettings('en');
  const current = normalizeHomeSettings(settings);
  const pick = (key) => (isEqual(current[key], arabicDefaults[key]) ? clone(englishDefaults[key]) : current[key]);

  return {
    ...current,
    heroKicker: pick('heroKicker'),
    heroTitle: pick('heroTitle'),
    heroSubtitle: pick('heroSubtitle'),
    heroNote: pick('heroNote'),
    primaryButtonText: pick('primaryButtonText'),
    primaryButtonUrl: pick('primaryButtonUrl'),
    secondaryButtonText: pick('secondaryButtonText'),
    secondaryButtonUrl: pick('secondaryButtonUrl'),
    heroHighlights: pick('heroHighlights'),
    stats: pick('stats'),
    aboutTitle: pick('aboutTitle'),
    aboutText: pick('aboutText'),
    servicesTitle: pick('servicesTitle'),
    services: pick('services'),
    featuresTitle: pick('featuresTitle'),
    features: pick('features'),
    galleryTitle: pick('galleryTitle'),
    galleryImages: pick('galleryImages'),
    testimonialsTitle: pick('testimonialsTitle'),
    testimonials: pick('testimonials'),
    contactTitle: pick('contactTitle'),
    coverageText: pick('coverageText'),
    hoursText: pick('hoursText'),
  };
};
