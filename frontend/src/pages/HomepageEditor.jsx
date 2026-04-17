import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { homeService } from '../services/api';
import { createDefaultHomeSettings, normalizeHomeSettings } from '../utils/homepageSettings';

const linesToItems = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const itemsToLines = (items = []) => (Array.isArray(items) ? items.join('\n') : '');

const copyMap = {
  ar: {
    eyebrow: 'إدارة المحتوى',
    title: 'التحكم الكامل بالصفحة الرئيسية',
    subtitle: 'أي تعديل تحفظه هنا سيظهر مباشرة في الصفحة الرئيسية العامة.',
    loading: 'جارٍ تحميل إعدادات الصفحة الرئيسية...',
    save: 'حفظ التعديلات',
    saving: 'جارٍ الحفظ...',
    preview: 'معاينة الصفحة',
    hero: 'الهيرو',
    about: 'من نحن',
    services: 'الخدمات',
    why: 'لماذا تختارنا',
    gallery: 'أعمالنا',
    reviews: 'آراء العملاء',
    contact: 'التواصل',
    stats: 'الأرقام السريعة',
    helperLines: 'أدخل كل عنصر في سطر مستقل.',
    helperStats: 'لكل سطر استخدم الصيغة: القيمة | العنوان',
    helperGallery: 'اترك رابط الصورة فارغًا لاستخدام الصور الافتراضية الموجودة داخل المشروع.',
    heroKicker: 'العنوان الصغير',
    heroTitle: 'العنوان الرئيسي',
    heroSubtitle: 'الوصف المختصر',
    heroNote: 'الملاحظة أسفل الأزرار',
    heroHighlights: 'نقاط الإبراز',
    primaryButtonText: 'نص زر الحجز',
    primaryButtonUrl: 'رابط زر الحجز',
    secondaryButtonText: 'نص زر واتساب',
    secondaryButtonUrl: 'رابط زر واتساب',
    aboutTitle: 'عنوان القسم',
    aboutText: 'نبذة مختصرة',
    servicesTitle: 'عنوان الخدمات',
    servicesItems: 'قائمة الخدمات',
    featuresTitle: 'عنوان المميزات',
    featuresItems: 'قائمة الأسباب',
    galleryTitle: 'عنوان الأعمال',
    testimonialsTitle: 'عنوان الآراء',
    testimonialsItems: 'نصوص الآراء',
    contactTitle: 'عنوان التواصل',
    phone: 'رقم الجوال',
    whatsappNumber: 'رقم واتساب',
    coverageText: 'نطاق الخدمة',
    hoursText: 'ساعات العمل',
    imageTitle: 'عنوان الصورة',
    imageCaption: 'وصف الصورة',
    imageUrl: 'رابط الصورة',
    saved: 'تم حفظ الصفحة الرئيسية بنجاح.',
    saveError: 'تعذر حفظ الصفحة الرئيسية الآن.',
  },
  en: {
    eyebrow: 'Content manager',
    title: 'Full homepage control',
    subtitle: 'Every change saved here appears directly on the public homepage.',
    loading: 'Loading homepage settings...',
    save: 'Save changes',
    saving: 'Saving...',
    preview: 'Preview page',
    hero: 'Hero',
    about: 'About',
    services: 'Services',
    why: 'Why choose us',
    gallery: 'Gallery',
    reviews: 'Testimonials',
    contact: 'Contact',
    stats: 'Quick stats',
    helperLines: 'Use one item per line.',
    helperStats: 'Use this format per line: value | label',
    helperGallery: 'Leave image URL empty to keep the bundled project images.',
    heroKicker: 'Small headline',
    heroTitle: 'Main headline',
    heroSubtitle: 'Short description',
    heroNote: 'Hero note',
    heroHighlights: 'Highlight points',
    primaryButtonText: 'Primary button text',
    primaryButtonUrl: 'Primary button URL',
    secondaryButtonText: 'Secondary button text',
    secondaryButtonUrl: 'Secondary button URL',
    aboutTitle: 'Section title',
    aboutText: 'Short copy',
    servicesTitle: 'Services title',
    servicesItems: 'Services list',
    featuresTitle: 'Features title',
    featuresItems: 'Reasons list',
    galleryTitle: 'Gallery title',
    testimonialsTitle: 'Testimonials title',
    testimonialsItems: 'Testimonials',
    contactTitle: 'Contact title',
    phone: 'Phone',
    whatsappNumber: 'WhatsApp number',
    coverageText: 'Coverage text',
    hoursText: 'Hours text',
    imageTitle: 'Image title',
    imageCaption: 'Image caption',
    imageUrl: 'Image URL',
    saved: 'Homepage saved successfully.',
    saveError: 'Unable to save homepage right now.',
  },
};

const parseStatsLines = (value) =>
  linesToItems(value)
    .map((line) => {
      const [valuePart, ...labelParts] = line.split('|');
      const statValue = String(valuePart || '').trim();
      const label = String(labelParts.join('|') || '').trim();
      if (!statValue || !label) {
        return null;
      }
      return { value: statValue, label };
    })
    .filter(Boolean);

export default function HomepageEditor() {
  const { lang } = useLang();
  const copy = copyMap[lang] || copyMap.ar;
  const [form, setForm] = useState(() => createDefaultHomeSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await homeService.adminGet();
        if (mounted) {
          setForm(normalizeHomeSettings(response.data?.homeSettings));
        }
      } catch {
        if (mounted) {
          setForm(createDefaultHomeSettings());
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setListField = (key, value) => {
    setForm((current) => ({ ...current, [key]: linesToItems(value) }));
  };

  const setStatsField = (value) => {
    setForm((current) => ({ ...current, stats: parseStatsLines(value) }));
  };

  const setGalleryField = (index, key, value) => {
    setForm((current) => ({
      ...current,
      galleryImages: current.galleryImages.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = normalizeHomeSettings(form);
      const response = await homeService.update(payload);
      setForm(normalizeHomeSettings(response.data?.homeSettings || payload));
      toast.success(copy.saved);
    } catch (error) {
      toast.error(error?.response?.data?.message || copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="page-shell homepage-editor-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="panel">
          <p>{copy.loading}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell homepage-editor-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="panel homepage-editor-hero">
        <div className="section-heading">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="section-subtitle">{copy.subtitle}</p>
        </div>

        <div className="hero-actions">
          <button className="btn-primary" disabled={saving} form="homepage-editor-form" type="submit">
            {saving ? copy.saving : copy.save}
          </button>
          <Link className="btn-light" to="/">
            {copy.preview}
          </Link>
        </div>
      </div>

      <form className="homepage-editor-grid" id="homepage-editor-form" onSubmit={handleSubmit}>
        <section className="panel form-panel">
          <div className="panel-header">
            <p className="eyebrow">{copy.hero}</p>
            <h2>{copy.hero}</h2>
          </div>
          <input className="input" onChange={(event) => setField('heroKicker', event.target.value)} placeholder={copy.heroKicker} value={form.heroKicker} />
          <input className="input" onChange={(event) => setField('heroTitle', event.target.value)} placeholder={copy.heroTitle} value={form.heroTitle} />
          <textarea className="input textarea" onChange={(event) => setField('heroSubtitle', event.target.value)} placeholder={copy.heroSubtitle} value={form.heroSubtitle} />
          <textarea className="input textarea" onChange={(event) => setField('heroNote', event.target.value)} placeholder={copy.heroNote} value={form.heroNote} />
          <div className="grid-two">
            <input className="input" onChange={(event) => setField('primaryButtonText', event.target.value)} placeholder={copy.primaryButtonText} value={form.primaryButtonText} />
            <input className="input" onChange={(event) => setField('primaryButtonUrl', event.target.value)} placeholder={copy.primaryButtonUrl} value={form.primaryButtonUrl} />
          </div>
          <div className="grid-two">
            <input className="input" onChange={(event) => setField('secondaryButtonText', event.target.value)} placeholder={copy.secondaryButtonText} value={form.secondaryButtonText} />
            <input className="input" onChange={(event) => setField('secondaryButtonUrl', event.target.value)} placeholder={copy.secondaryButtonUrl} value={form.secondaryButtonUrl} />
          </div>
          <label>{copy.heroHighlights}</label>
          <textarea className="input textarea" onChange={(event) => setListField('heroHighlights', event.target.value)} value={itemsToLines(form.heroHighlights)} />
          <small className="muted">{copy.helperLines}</small>
        </section>

        <section className="panel form-panel">
          <div className="panel-header">
            <p className="eyebrow">{copy.stats}</p>
            <h2>{copy.stats}</h2>
          </div>
          <textarea
            className="input textarea"
            onChange={(event) => setStatsField(event.target.value)}
            value={form.stats.map((item) => `${item.value} | ${item.label}`).join('\n')}
          />
          <small className="muted">{copy.helperStats}</small>
        </section>

        <section className="panel form-panel">
          <div className="panel-header">
            <p className="eyebrow">{copy.about}</p>
            <h2>{copy.about}</h2>
          </div>
          <input className="input" onChange={(event) => setField('aboutTitle', event.target.value)} placeholder={copy.aboutTitle} value={form.aboutTitle} />
          <textarea className="input textarea" onChange={(event) => setField('aboutText', event.target.value)} placeholder={copy.aboutText} value={form.aboutText} />
        </section>

        <section className="panel form-panel">
          <div className="panel-header">
            <p className="eyebrow">{copy.services}</p>
            <h2>{copy.services}</h2>
          </div>
          <input className="input" onChange={(event) => setField('servicesTitle', event.target.value)} placeholder={copy.servicesTitle} value={form.servicesTitle} />
          <textarea className="input textarea" onChange={(event) => setListField('services', event.target.value)} placeholder={copy.servicesItems} value={itemsToLines(form.services)} />
          <small className="muted">{copy.helperLines}</small>
        </section>

        <section className="panel form-panel">
          <div className="panel-header">
            <p className="eyebrow">{copy.why}</p>
            <h2>{copy.why}</h2>
          </div>
          <input className="input" onChange={(event) => setField('featuresTitle', event.target.value)} placeholder={copy.featuresTitle} value={form.featuresTitle} />
          <textarea className="input textarea" onChange={(event) => setListField('features', event.target.value)} placeholder={copy.featuresItems} value={itemsToLines(form.features)} />
          <small className="muted">{copy.helperLines}</small>
        </section>

        <section className="panel form-panel homepage-gallery-editor">
          <div className="panel-header">
            <p className="eyebrow">{copy.gallery}</p>
            <h2>{copy.gallery}</h2>
          </div>
          <input className="input" onChange={(event) => setField('galleryTitle', event.target.value)} placeholder={copy.galleryTitle} value={form.galleryTitle} />
          <small className="muted">{copy.helperGallery}</small>
          <div className="homepage-gallery-editor-grid">
            {form.galleryImages.map((item, index) => (
              <article className="homepage-gallery-editor-card" key={`gallery-editor-${index}`}>
                <input className="input" onChange={(event) => setGalleryField(index, 'title', event.target.value)} placeholder={copy.imageTitle} value={item.title} />
                <textarea className="input textarea" onChange={(event) => setGalleryField(index, 'caption', event.target.value)} placeholder={copy.imageCaption} value={item.caption} />
                <input className="input" onChange={(event) => setGalleryField(index, 'imageUrl', event.target.value)} placeholder={copy.imageUrl} value={item.imageUrl} />
              </article>
            ))}
          </div>
        </section>

        <section className="panel form-panel">
          <div className="panel-header">
            <p className="eyebrow">{copy.reviews}</p>
            <h2>{copy.reviews}</h2>
          </div>
          <input className="input" onChange={(event) => setField('testimonialsTitle', event.target.value)} placeholder={copy.testimonialsTitle} value={form.testimonialsTitle} />
          <textarea
            className="input textarea"
            onChange={(event) => setListField('testimonials', event.target.value)}
            placeholder={copy.testimonialsItems}
            value={itemsToLines(form.testimonials)}
          />
          <small className="muted">{copy.helperLines}</small>
        </section>

        <section className="panel form-panel">
          <div className="panel-header">
            <p className="eyebrow">{copy.contact}</p>
            <h2>{copy.contact}</h2>
          </div>
          <input className="input" onChange={(event) => setField('contactTitle', event.target.value)} placeholder={copy.contactTitle} value={form.contactTitle} />
          <div className="grid-two">
            <input className="input" onChange={(event) => setField('phone', event.target.value)} placeholder={copy.phone} value={form.phone} />
            <input className="input" onChange={(event) => setField('whatsappNumber', event.target.value)} placeholder={copy.whatsappNumber} value={form.whatsappNumber} />
          </div>
          <input className="input" onChange={(event) => setField('coverageText', event.target.value)} placeholder={copy.coverageText} value={form.coverageText} />
          <input className="input" onChange={(event) => setField('hoursText', event.target.value)} placeholder={copy.hoursText} value={form.hoursText} />
        </section>
      </form>
    </section>
  );
}
