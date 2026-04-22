import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const copy = {
  en: {
    eyebrow: 'Secure access',
    title: 'Connect TrkeebPro',
    subtitle: 'Review the requested app access before continuing.',
    app: 'Application',
    redirect: 'Redirect URL',
    scopes: 'Requested access',
    approve: 'Approve',
    deny: 'Deny',
    close: 'Close',
    approved: 'Access approved. You can return to the app.',
    denied: 'Access denied. No permission was granted.',
    unknownApp: 'TrkeebPro mobile app',
    unknownRedirect: 'No redirect URL provided',
    defaultScope: 'Basic account access',
    noteTitle: 'Private workspace',
    noteText: 'Only authenticated internal users can access operations data.',
  },
  ar: {
    eyebrow: 'وصول آمن',
    title: 'ربط تركيب برو',
    subtitle: 'راجع صلاحيات التطبيق المطلوبة قبل المتابعة.',
    app: 'التطبيق',
    redirect: 'رابط الرجوع',
    scopes: 'الصلاحيات المطلوبة',
    approve: 'موافقة',
    deny: 'رفض',
    close: 'إغلاق',
    approved: 'تمت الموافقة على الوصول. يمكنك الرجوع للتطبيق.',
    denied: 'تم رفض الوصول ولم يتم منح أي صلاحية.',
    unknownApp: 'تطبيق تركيب برو',
    unknownRedirect: 'لا يوجد رابط رجوع',
    defaultScope: 'وصول أساسي للحساب',
    noteTitle: 'مساحة عمل خاصة',
    noteText: 'بيانات العمليات متاحة فقط للمستخدمين الداخليين بعد تسجيل الدخول.',
  },
};

const readParam = (params, keys) => {
  for (const key of keys) {
    const value = params.get(key);
    if (value) {
      return value;
    }
  }
  return '';
};

export default function OAuthConsent() {
  const { lang, isRTL } = useLang();
  const { search } = useLocation();
  const t = copy[lang] || copy.en;
  const [result, setResult] = useState('');
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const appName = readParam(params, ['client_name', 'app', 'name']) || t.unknownApp;
  const redirectUrl = readParam(params, ['redirect_uri', 'redirectUrl', 'return_to']) || '';
  const scopes = (readParam(params, ['scope', 'scopes']) || t.defaultScope)
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const complete = (nextResult) => {
    setResult(nextResult);
    if (redirectUrl) {
      const url = new URL(redirectUrl, window.location.origin);
      url.searchParams.set('consent', nextResult);
      window.setTimeout(() => {
        window.location.href = url.toString();
      }, 450);
    }
  };

  return (
    <section className="page-shell oauth-consent-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="oauth-consent-layout">
        <aside className="oauth-consent-hero">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="oauth-consent-subtitle">{t.subtitle}</p>
          <span className="oauth-consent-badge">{appName}</span>
          <div className="oauth-consent-note">
            <strong>{t.noteTitle}</strong>
            <p>{t.noteText}</p>
          </div>
        </aside>

        <section className="oauth-consent-card">
          <div className="oauth-consent-summary">
            <article>
              <span>{t.app}</span>
              <strong>{appName}</strong>
            </article>
            <article>
              <span>{t.redirect}</span>
              <strong className="oauth-consent-mono">{redirectUrl || t.unknownRedirect}</strong>
            </article>
          </div>

          <div className="oauth-consent-scopes">
            <div className="oauth-consent-section-head">
              <h2>{t.scopes}</h2>
            </div>
            <div className="oauth-consent-scope-list">
              {scopes.map((scope) => (
                <span className="oauth-scope-chip" key={scope}>
                  {scope}
                </span>
              ))}
            </div>
          </div>

          {result ? (
            <div className={`oauth-consent-result ${result === 'approved' ? 'approved' : 'denied'}`}>
              <strong>{result === 'approved' ? t.approved : t.denied}</strong>
            </div>
          ) : (
            <div className="oauth-consent-actions">
              <button className="btn-primary" type="button" onClick={() => complete('approved')}>
                {t.approve}
              </button>
              <button className="btn-danger" type="button" onClick={() => complete('denied')}>
                {t.deny}
              </button>
            </div>
          )}

          <div className="oauth-consent-footer">
            <button className="btn-light" type="button" onClick={() => window.close()}>
              {t.close}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
