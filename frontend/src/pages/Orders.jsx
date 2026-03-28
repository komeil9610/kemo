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

const servicesCatalog = {
  en: [
    { description: 'Supply and install rubber pads for outdoor units', price: 45, unit: 'per set' },
    { description: 'Supply and install water drain pipes', price: 30, unit: 'per meter' },
    { description: 'Supply and install a power socket', price: 40, unit: 'per piece' },
    { description: 'Supply and install electrical cable with protective sleeve', price: 25, unit: 'per meter' },
    { description: 'Supply and install copper pipes - Asian copper', price: 70, unit: 'per meter' },
    { description: 'Supply and install copper pipes - American copper', price: 100, unit: 'per meter' },
    { description: 'Welding new copper pipes to old pipes with different sizes', price: 30, unit: 'per meter' },
    { description: 'Supply and install wooden frame for window AC unit', price: 30, unit: 'per frame' },
    { description: 'Removal fee for an old split AC unit', price: 100, unit: 'per unit' },
    { description: 'Removal fee for an old window AC unit', price: 50, unit: 'per unit' },
    { description: 'Supply and install wall bracket for 12K / 18K / 24K BTU units', price: 60, unit: 'per bracket' },
    { description: 'Supply and install wall bracket for units above 24K BTU', price: 80, unit: 'per bracket' },
    { description: 'One-floor scaffold', price: 100, unit: 'fixed' },
    { description: 'Two-floor scaffold', price: 200, unit: 'fixed' },
  ],
  ar: [
    { description: 'توريد وتركيب قواعد مطاطية للوحدات الخارجية', price: 45, unit: 'لكل مجموعة' },
    { description: 'توريد وتركيب أنابيب تصريف المياه', price: 30, unit: 'لكل متر' },
    { description: 'توريد وتركيب مقبس كهربائي', price: 40, unit: 'لكل قطعة' },
    { description: 'توريد وتركيب كابل كهربائي مع غلاف واق', price: 25, unit: 'لكل متر' },
    { description: 'توريد وتركيب أنابيب نحاسية - نحاس (اسيوي)', price: 70, unit: 'لكل متر' },
    { description: 'توريد وتركيب أنابيب نحاسية - نحاس (امريكي)', price: 100, unit: 'لكل متر' },
    { description: 'لحام أنابيب نحاسية جديدة مع الأنابيب القديمة (بمقاسات مختلفة)', price: 30, unit: 'لكل متر' },
    { description: 'توريد وتركيب إطار خشبي لوحدة تكييف الشباك', price: 30, unit: 'لكل إطار' },
    { description: 'رسوم إزالة وحدة تكييف سبليت قديمة', price: 100, unit: 'لكل وحدة' },
    { description: 'رسوم إزالة وحدة تكييف شباك قديمة', price: 50, unit: 'لكل وحدة' },
    { description: 'توريد وتركيب حامل جداري لوحدات تكييف بسعات 12K / 18K / 24K BTU', price: 60, unit: 'لكل حامل' },
    { description: 'توريد وتركيب حامل جداري للوحدات التي تزيد سعتها عن 24K BTU', price: 80, unit: 'لكل حامل' },
    { description: 'سقالة دور واحد', price: 100, unit: 'ثابت' },
    { description: 'سقالة دورين', price: 200, unit: 'ثابت' },
  ],
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

      <div className="panel">
        <div className="panel-header">
          <h2>{lang === 'ar' ? 'قائمة الخدمات والأسعار' : 'Service pricing list'}</h2>
          <p>{lang === 'ar' ? 'الأسعار الرسمية المعتمدة للفنيين داخل النظام.' : 'Official service pricing used by technicians inside the system.'}</p>
        </div>
        <div className="service-table">
          <div className="service-table-head">
            <span>{lang === 'ar' ? 'السعر' : 'Price'}</span>
            <span>{lang === 'ar' ? 'وصف الخدمة' : 'Service description'}</span>
            <span>{lang === 'ar' ? 'الوحدة' : 'Unit'}</span>
          </div>
          {servicesCatalog[lang].map((item) => (
            <div className="service-table-row" key={item.description}>
              <strong>{item.price}</strong>
              <span>{item.description}</span>
              <span>{item.unit}</span>
            </div>
          ))}
        </div>
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
