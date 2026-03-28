import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { operationsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const copy = {
  en: {
    eyebrow: 'Technician app',
    title: 'Field technician workspace',
    titleLine: 'Work orders, update status, and upload proof of work from one place.',
    languageButton: 'العربية',
    pricingTitle: 'Pricing snapshot',
    meter: 'Extra copper meter',
    base: 'Base unit',
    included: 'Included copper meters',
    calcTitle: 'Cost calculator',
    photoTitle: 'Post-install documentation',
    photoPrompt: 'Choose a photo from the phone or camera',
    finalPrice: 'Final customer price',
    notesPrefix: 'Note:',
    empty: 'No assigned tasks yet.',
    loading: 'Loading technician tasks...',
    statusLabels: {
      pending: 'Pending',
      en_route: 'On the way',
      in_progress: 'Installing',
      completed: 'Completed',
    },
    actions: [
      { value: 'en_route', label: 'I am on site' },
      { value: 'in_progress', label: 'Start installation' },
      { value: 'completed', label: 'Mark as done' },
    ],
    messages: {
      statusUpdated: 'Task status updated.',
      photoUploaded: 'Documentation photo uploaded.',
    },
  },
  ar: {
    eyebrow: 'تطبيق الفني',
    title: 'واجهة الفني الميداني',
    titleLine: 'تنفيذ الطلبات، تحديث الحالة، ورفع صور التوثيق من مكان واحد.',
    languageButton: 'English',
    pricingTitle: 'ملخص التسعير',
    meter: 'متر نحاس إضافي',
    base: 'قاعدة إضافية',
    included: 'الأمتار المشمولة',
    calcTitle: 'حاسبة التكلفة',
    photoTitle: 'توثيق ما بعد التركيب',
    photoPrompt: 'اختر صورة من الجوال أو الكاميرا',
    finalPrice: 'السعر النهائي للعميل',
    notesPrefix: 'ملاحظة:',
    empty: 'لا توجد مهام مخصصة حتى الآن.',
    loading: 'جارٍ تحميل مهام الفني...',
    statusLabels: {
      pending: 'قيد الانتظار',
      en_route: 'في الطريق',
      in_progress: 'جاري التركيب',
      completed: 'مكتمل',
    },
    actions: [
      { value: 'en_route', label: 'وصلت للموقع' },
      { value: 'in_progress', label: 'بدء التركيب' },
      { value: 'completed', label: 'تم الإنجاز' },
    ],
    messages: {
      statusUpdated: 'تم تحديث حالة المهمة.',
      photoUploaded: 'تم رفع صورة التوثيق.',
    },
  },
};

export default function Orders() {
  const { user } = useAuth();
  const { lang, isRTL, toggleLang } = useLang();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const t = useMemo(() => copy[lang] || copy.en, [lang]);

  const loadOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await operationsService.getTechnicianOrders(user?.technicianId);
      setPayload(response.data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'technician' && !user?.technicianId) {
      setLoading(false);
      return;
    }

    loadOrders();
    window.addEventListener('operations-updated', loadOrders);
    return () => window.removeEventListener('operations-updated', loadOrders);
  }, [loadOrders, user?.role, user?.technicianId]);

  const updateStatus = async (orderId, status) => {
    setMessage('');
    await operationsService.updateTechnicianStatus(orderId, status);
    setMessage(t.messages.statusUpdated);
    await loadOrders();
  };

  const updateExtras = async (orderId, currentExtras, changes) => {
    const nextExtras = { ...currentExtras, ...changes };
    await operationsService.updateExtras(orderId, nextExtras);
    await loadOrders();
  };

  const uploadPhoto = async (orderId, file) => {
    if (!file) {
      return;
    }

    const url = await fileToDataUrl(file);
    await operationsService.uploadPhoto(orderId, { name: file.name, url });
    setMessage(t.messages.photoUploaded);
    await loadOrders();
  };

  if (loading) {
    return <section className="page-shell">{t.loading}</section>;
  }

  return (
    <section className="page-shell technician-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="section-heading technician-heading">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="section-subtitle">
            {payload?.technician?.name} - {payload?.technician?.region || payload?.technician?.zone}
          </p>
          <p className="section-subtitle">{t.titleLine}</p>
        </div>
        <button className="btn-secondary language-switch" onClick={toggleLang} type="button">
          {t.languageButton}
        </button>
      </div>

      {message ? <div className="flash-message">{message}</div> : null}

      <div className="pricing-strip">
        <span>{t.meter}: {payload?.pricing?.copperPricePerMeter || 0} SAR</span>
        <span>{t.base}: {payload?.pricing?.basePrice || 0} SAR</span>
        <span>{t.included}: {payload?.pricing?.includedCopperMeters || 0} m</span>
      </div>

      <div className="order-list">
        {payload?.orders?.length ? (
          payload.orders.map((order) => (
            <article className="task-card" key={order.id}>
              <div className="task-head">
                <div>
                  <strong>{order.customerName}</strong>
                  <p>{order.phone}</p>
                  <p>{order.address}</p>
                  <p>{order.acType}</p>
                </div>
                <span className={`status-badge ${order.status}`}>{t.statusLabels[order.status] || order.status}</span>
              </div>

              <div className="status-actions">
                {t.actions.map((action) => (
                  <button
                    key={action.value}
                    className="btn-light"
                    type="button"
                    onClick={() => updateStatus(order.id, action.value)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              <div className="task-grid">
                <div className="panel inset-panel">
                  <h3>{t.calcTitle}</h3>
                  <label>{t.meter}</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={order.extras?.copperMeters || 0}
                    onChange={(event) =>
                      updateExtras(order.id, order.extras, { copperMeters: Number(event.target.value) || 0 })
                    }
                  />

                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={Boolean(order.extras?.baseIncluded)}
                      onChange={(event) =>
                        updateExtras(order.id, order.extras, { baseIncluded: event.target.checked })
                      }
                    />
                    <span>{t.base}</span>
                  </label>

                  <div className="quote-box">
                    <span>{t.finalPrice}</span>
                    <strong>{order.extras?.totalPrice || 0} SAR</strong>
                  </div>
                </div>

                <div className="panel inset-panel">
                  <h3>{t.photoTitle}</h3>
                  <label className="upload-box">
                    <span>{t.photoPrompt}</span>
                    <input type="file" accept="image/*" onChange={(event) => uploadPhoto(order.id, event.target.files?.[0])} />
                  </label>

                  <div className="photo-grid">
                    {(order.photos || []).map((photo) => (
                      <img alt={photo.name} className="photo-thumb" key={photo.id} src={photo.url} />
                    ))}
                  </div>
                </div>
              </div>

              {order.notes ? <div className="notes-box">{t.notesPrefix} {order.notes}</div> : null}
            </article>
          ))
        ) : (
          <article className="panel">
            <p className="muted">{t.empty}</p>
          </article>
        )}
      </div>
    </section>
  );
}
