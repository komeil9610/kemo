import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { formatSaudiPhoneDisplay, notificationsService, operationsService } from '../services/api';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const isValidDate = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime());
};

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const resolveRegion = (order, technician) => {
  return order?.region || order?.zone || technician?.region || technician?.zone || 'Saudi Arabia';
};

const isOverdueOrder = (order) => {
  if (!order?.scheduledDate || order.status === 'completed') {
    return false;
  }

  const scheduled = new Date(`${order.scheduledDate}T12:00:00`);
  if (!isValidDate(scheduled)) {
    return false;
  }

  return scheduled < startOfToday();
};

const formatDate = (value, lang) => {
  if (!value || !isValidDate(new Date(value))) {
    return value || '—';
  }

  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T12:00:00`));
};

const formatOrderNumber = (value) => String(value || '').replace(/^ORD-/, '');

const copy = {
  en: {
    eyebrow: 'Technician app',
    title: 'Technician operations hub',
    titleLine: 'Today’s jobs, alerts, pricing, and proof-of-work tools built for field execution.',
    languageButton: 'العربية',
    quickNav: 'Quick navigation',
    overview: 'Overview',
    pricingTitle: 'Pricing snapshot',
    filtersTitle: 'Task filters',
    alertsTitle: 'Live alerts',
    checklistTitle: 'Daily checklist',
    allStatuses: 'All statuses',
    allRegions: 'All regions',
    searchPlaceholder: 'Search order number, customer, phone, or address',
    orderNumber: 'Order #',
    summaryLabel: 'Today summary',
    attentionLabel: 'Needs attention',
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
    showing: 'Showing',
    of: 'of',
    tasks: 'tasks',
    newTasks: 'New tasks',
    overdueTasks: 'Overdue tasks',
    noAlerts: 'No live alerts right now.',
    navigationLinks: [
      { label: 'Summary', href: '#technician-summary' },
      { label: 'Tasks', href: '#technician-tasks' },
      { label: 'Pricing', href: '#technician-pricing' },
      { label: 'Checklist', href: '#technician-checklist' },
    ],
    statusLabels: {
      pending: 'Pending',
      en_route: 'On the way',
      in_progress: 'Installing',
      completed: 'Completed',
      canceled: 'Canceled',
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
    title: 'مركز عمليات الفني',
    titleLine: 'مهام اليوم والتنبيهات والتسعير والتوثيق في مساحة مخصصة للفني فقط.',
    languageButton: 'English',
    quickNav: 'تنقل سريع',
    overview: 'نظرة عامة',
    pricingTitle: 'ملخص التسعير',
    filtersTitle: 'تصفية المهام',
    alertsTitle: 'تنبيهات فورية',
    checklistTitle: 'قائمة المراجعة اليومية',
    allStatuses: 'كل الحالات',
    allRegions: 'كل المناطق',
    searchPlaceholder: 'ابحث برقم الطلب أو اسم العميل أو الجوال أو العنوان',
    orderNumber: 'رقم الطلب',
    summaryLabel: 'ملخص اليوم',
    attentionLabel: 'يحتاج متابعة',
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
    showing: 'عرض',
    of: 'من',
    tasks: 'مهام',
    newTasks: 'مهام جديدة',
    overdueTasks: 'مهام متأخرة',
    noAlerts: 'لا توجد تنبيهات حية الآن.',
    navigationLinks: [
      { label: 'الملخص', href: '#technician-summary' },
      { label: 'المهام', href: '#technician-tasks' },
      { label: 'التسعير', href: '#technician-pricing' },
      { label: 'المراجعة', href: '#technician-checklist' },
    ],
    statusLabels: {
      pending: 'قيد الانتظار',
      en_route: 'في الطريق',
      in_progress: 'جاري التركيب',
      completed: 'مكتمل',
      canceled: 'ملغى',
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

const workflowChecklist = {
  en: [
    'Confirm site access and customer contact details.',
    'Select the correct service items and record quantities.',
    'Move the job through en route, in progress, and completed.',
    'Upload a clear post-install photo for the record.',
  ],
  ar: [
    'تأكيد موقع العميل وبيانات التواصل قبل الانطلاق.',
    'اختيار بنود الخدمة الصحيحة وتسجيل الكميات.',
    'تحديث الحالة إلى في الطريق ثم جاري التركيب ثم مكتمل.',
    'رفع صورة واضحة بعد التركيب لحفظ التوثيق.',
  ],
};

export default function Orders() {
  const { user } = useAuth();
  const { lang, isRTL, toggleLang } = useLang();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'all', region: 'all' });

  const seenOrderIdsRef = useRef(new Set());
  const seenOverdueIdsRef = useRef(new Set());
  const seenNotificationIdsRef = useRef(new Set());
  const bootstrappedOrdersRef = useRef(false);
  const bootstrappedNotificationsRef = useRef(false);

  const t = useMemo(() => copy[lang] || copy.en, [lang]);
  const checklist = useMemo(() => workflowChecklist[lang] || workflowChecklist.en, [lang]);
  const catalog = useMemo(() => servicesCatalog[lang] || servicesCatalog.en, [lang]);

  const loadOrders = useCallback(
    async (silent = false) => {
      if (!user) {
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      try {
        if (!silent) {
          setLoading(true);
        }

        const response = await operationsService.getTechnicianOrders(user?.technicianId);
        const nextPayload = response.data || {};
        setPayload(nextPayload);

        const nextOrders = nextPayload.orders || [];
        const nextOrderIds = new Set();
        const nextOverdueIds = new Set();
        const overdueAlerts = [];

        nextOrders.forEach((order) => {
          const orderId = String(order.id);
          nextOrderIds.add(orderId);

          const overdue = isOverdueOrder(order);
          if (overdue) {
            nextOverdueIds.add(orderId);
          }

          if (bootstrappedOrdersRef.current && overdue && !seenOverdueIdsRef.current.has(orderId) && overdueAlerts.length < 6) {
            overdueAlerts.push({
              id: `overdue-${orderId}`,
              title: lang === 'ar' ? 'مهمة متأخرة' : 'Overdue task',
              body:
                lang === 'ar'
                  ? `${order.customerName} - ${formatDate(order.scheduledDate, lang)}`
                  : `${order.customerName} - ${formatDate(order.scheduledDate, lang)}`,
            });
          }
        });

        seenOrderIdsRef.current = nextOrderIds;
        seenOverdueIdsRef.current = nextOverdueIds;
        bootstrappedOrdersRef.current = true;

        if (overdueAlerts.length) {
          overdueAlerts.forEach((alert) => toast(alert.title, { duration: 4500 }));
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [lang, user]
  );

  const loadNotifications = useCallback(
    async (silent = false) => {
      if (!user) {
        return;
      }

      try {
        const response = await notificationsService.list();
        const items = response.data?.notifications || [];
        const nextNotifications = items.slice(0, 5);
        setNotifications(nextNotifications);

        const nextIds = new Set(nextNotifications.map((item) => String(item.id)));
        const freshItems = nextNotifications.filter((item) => !seenNotificationIdsRef.current.has(String(item.id)));

        if (bootstrappedNotificationsRef.current && freshItems.length) {
          freshItems.forEach((item) => toast(item.title, { duration: 4500 }));
        }

        seenNotificationIdsRef.current = nextIds;
        bootstrappedNotificationsRef.current = true;
      } catch {
        if (!silent) {
          return;
        }
      }
    },
    [user]
  );

  useEffect(() => {
    if (user?.role !== 'technician' && !user?.technicianId) {
      setLoading(false);
      return;
    }

    loadOrders(false);
    loadNotifications(false);

    const refresh = () => {
      loadOrders(true);
      loadNotifications(true);
    };

    window.addEventListener('operations-updated', refresh);
    const intervalId = window.setInterval(refresh, 15000);

    return () => {
      window.removeEventListener('operations-updated', refresh);
      window.clearInterval(intervalId);
    };
  }, [loadNotifications, loadOrders, user?.role, user?.technicianId]);

  const updateStatus = async (orderId, status) => {
    setMessage('');
    await operationsService.updateTechnicianStatus(orderId, status);
    setMessage(t.messages.statusUpdated);
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

  const cancelOrder = async (orderId) => {
    setMessage('');
    await operationsService.cancelOrder(orderId, lang === 'ar' ? 'تم رفض الطلب من العميل' : 'Customer rejected the order');
    setMessage(lang === 'ar' ? 'تم إلغاء الطلب.' : 'Order canceled.');
    await loadOrders();
  };

  const orders = useMemo(() => payload?.orders || [], [payload]);
  const technician = useMemo(() => payload?.technician || null, [payload]);

  const ordersWithMeta = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        region: resolveRegion(order, technician),
        overdue: isOverdueOrder(order),
      })),
    [orders, technician]
  );

  const filteredOrders = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return ordersWithMeta
      .filter((order) => {
        const matchesStatus = filters.status === 'all' || order.status === filters.status;
        const matchesRegion = filters.region === 'all' || order.region === filters.region;

        if (!searchTerm) {
          return matchesStatus && matchesRegion;
        }

        const haystack = [
          order.id,
          order.numericId,
          order.customerName,
          order.phone,
          formatSaudiPhoneDisplay(order.phone),
          order.address,
          order.acType,
          order.technicianName,
          order.region,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return matchesStatus && matchesRegion && haystack.includes(searchTerm);
      })
      .sort((a, b) => {
        if (a.overdue !== b.overdue) {
          return a.overdue ? -1 : 1;
        }

        const rank = {
          pending: 0,
          en_route: 1,
          in_progress: 2,
          completed: 3,
        };

        if ((rank[a.status] || 9) !== (rank[b.status] || 9)) {
          return (rank[a.status] || 9) - (rank[b.status] || 9);
        }

        return String(a.scheduledDate || '').localeCompare(String(b.scheduledDate || ''));
      });
  }, [filters.region, filters.search, filters.status, ordersWithMeta]);

  const regionOptions = useMemo(() => {
    const options = new Set();
    ordersWithMeta.forEach((order) => {
      if (order.region) {
        options.add(order.region);
      }
    });
    if (technician?.region) {
      options.add(technician.region);
    }
    if (technician?.zone) {
      options.add(technician.zone);
    }
    return Array.from(options);
  }, [ordersWithMeta, technician]);

  const activeCount = ordersWithMeta.filter((order) => ['en_route', 'in_progress'].includes(order.status)).length;
  const completedCount = ordersWithMeta.filter((order) => order.status === 'completed').length;
  const pendingCount = ordersWithMeta.filter((order) => order.status === 'pending').length;
  const overdueCount = ordersWithMeta.filter((order) => order.overdue).length;
  const attentionCount = pendingCount + overdueCount;
  const liveNotifications = notifications.slice(0, 4);
  const newTaskAlerts = ordersWithMeta.filter((order) => order.status === 'pending').slice(0, 3);
  const overdueAlerts = ordersWithMeta.filter((order) => order.overdue).slice(0, 3);
  const alertCards = [...overdueAlerts, ...newTaskAlerts];

  const resetFilters = () => {
    setFilters({ search: '', status: 'all', region: 'all' });
  };

  if (loading) {
    return <section className="page-shell">{t.loading}</section>;
  }

  return (
    <section className="page-shell technician-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="technician-hero" id="technician-summary">
        <div className="section-heading technician-heading">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="section-subtitle">
              {technician?.name} - {technician?.region || technician?.zone}
            </p>
            <p className="section-subtitle">{t.titleLine}</p>
          </div>
          <button className="btn-secondary language-switch" onClick={toggleLang} type="button">
            {t.languageButton}
          </button>
        </div>

        <div className="technician-grid">
          <article className="stat-card technician-stat">
            <span>{lang === 'ar' ? 'المهام النشطة' : 'Active jobs'}</span>
            <strong>{activeCount}</strong>
          </article>
          <article className="stat-card technician-stat">
            <span>{lang === 'ar' ? 'المهام المكتملة' : 'Completed jobs'}</span>
            <strong>{completedCount}</strong>
          </article>
          <article className="stat-card technician-stat">
            <span>{lang === 'ar' ? 'قيد الانتظار' : 'Pending jobs'}</span>
            <strong>{pendingCount}</strong>
          </article>
          <article className="stat-card technician-stat">
            <span>{lang === 'ar' ? 'سعر متر النحاس' : 'Copper meter price'}</span>
            <strong>{payload?.pricing?.copperPricePerMeter || 0} SAR</strong>
          </article>
        </div>
      </div>

      {message ? <div className="flash-message">{message}</div> : null}

      <div className="pricing-strip">
        <span>{t.meter}: {payload?.pricing?.copperPricePerMeter || 0} SAR</span>
        <span>{t.base}: {payload?.pricing?.basePrice || 0} SAR</span>
        <span>{t.included}: {payload?.pricing?.includedCopperMeters || 0} m</span>
        <span>{t.overdueTasks}: {overdueCount}</span>
      </div>

      <div className="technician-layout">
        <div className="technician-main">
          <div className="panel" id="technician-tasks">
            <div className="panel-header">
              <h2>{t.filtersTitle}</h2>
              <p>
                {t.showing} {filteredOrders.length} {t.of} {ordersWithMeta.length} {t.tasks}
              </p>
            </div>

            <div className="filter-bar">
              <label className="filter-field">
                <span>{lang === 'ar' ? 'البحث' : 'Search'}</span>
                <input
                  className="input"
                  type="search"
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder={t.searchPlaceholder}
                />
              </label>

              <label className="filter-field">
                <span>{lang === 'ar' ? 'الحالة' : 'Status'}</span>
                <select
                  className="input"
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="all">{t.allStatuses}</option>
                  {Object.entries(t.statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="filter-field">
                <span>{lang === 'ar' ? 'المنطقة' : 'Region'}</span>
                <select
                  className="input"
                  value={filters.region}
                  onChange={(event) => setFilters((current) => ({ ...current, region: event.target.value }))}
                >
                  <option value="all">{t.allRegions}</option>
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>

              <button className="btn-light filter-reset" type="button" onClick={resetFilters}>
                {lang === 'ar' ? 'إعادة الضبط' : 'Reset'}
              </button>
            </div>
          </div>

          <div className="panel" id="technician-pricing">
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
              {catalog.map((item) => (
                <div className="service-table-row" key={item.description}>
                  <strong>{item.price}</strong>
                  <span>{item.description}</span>
                  <span>{item.unit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-list">
            {filteredOrders.length ? (
              filteredOrders.map((order) => (
                <article className="task-card technician-task" key={order.id}>
                  <div className="task-head">
                    <div>
                      <p className="task-region">{order.region}</p>
                      <strong>{order.customerName}</strong>
                      <p>{formatSaudiPhoneDisplay(order.phone)}</p>
                      <p className="task-order-number">{t.orderNumber} {formatOrderNumber(order.id)}</p>
                      <p>{order.address}</p>
                      <p className="task-ac-type">{order.acType}</p>
                    </div>
                    <div className="task-badges">
                      {order.overdue ? <span className="alert-pill">{lang === 'ar' ? 'متأخرة' : 'Overdue'}</span> : null}
                      <span className={`status-badge ${order.status}`}>{t.statusLabels[order.status] || order.status}</span>
                    </div>
                  </div>

                  <div className="task-meta-grid">
                    <div className="task-meta-item">
                      <span>{lang === 'ar' ? 'الموعد' : 'Scheduled'}</span>
                      <strong>{formatDate(order.scheduledDate, lang)}</strong>
                    </div>
                    <div className="task-meta-item">
                      <span>{lang === 'ar' ? 'المنطقة' : 'Region'}</span>
                      <strong>{order.region}</strong>
                    </div>
                    <div className="task-meta-item">
                      <span>{lang === 'ar' ? 'الإضافات' : 'Extras'}</span>
                      <strong>{order.extras?.totalPrice || 0} SAR</strong>
                    </div>
                    <div className="task-meta-item">
                      <span>{lang === 'ar' ? 'الفني' : 'Technician'}</span>
                      <strong>{order.technicianName}</strong>
                    </div>
                  </div>

                  <div className="status-actions">
                    {t.actions.map((action) => (
                      <button
                        key={action.value}
                        className="btn-light"
                        type="button"
                        disabled={['completed', 'canceled'].includes(order.status)}
                        onClick={() => updateStatus(order.id, action.value)}
                      >
                        {action.label}
                      </button>
                    ))}
                    {['completed', 'canceled'].includes(order.status) ? null : (
                      <button className="btn-danger" type="button" onClick={() => cancelOrder(order.id)}>
                        {lang === 'ar' ? 'إلغاء الطلب' : 'Cancel order'}
                      </button>
                    )}
                  </div>

                  <div className="task-grid">
                    <div className="panel inset-panel">
                      <h3>{t.calcTitle}</h3>
                      <div className="quote-box">
                        <span>{lang === 'ar' ? 'تفاصيل الإضافات' : 'Add-on details'}</span>
                        <strong>{order.extras?.totalPrice || 0} SAR</strong>
                      </div>
                      <p className="muted">
                        {t.meter}: {order.extras?.copperMeters || 0}
                      </p>
                      <p className="muted">
                        {t.base}: {order.extras?.baseIncluded ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}
                      </p>
                      <p className="muted">{lang === 'ar' ? 'تعديل الإضافات للمسؤول فقط.' : 'Add-ons are editable by the admin only.'}</p>
                    </div>

                    <div className="panel inset-panel">
                      <h3>{t.photoTitle}</h3>
                      <label className="upload-box">
                        <span>{t.photoPrompt}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => uploadPhoto(order.id, event.target.files?.[0])}
                        />
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
        </div>

        <aside className="technician-sidebar">
          <div className="panel sticky-panel technician-side-panel">
            <div className="sidebar-counter">
              <span>{t.summaryLabel}</span>
              <strong>{attentionCount}</strong>
              <small>{t.attentionLabel}</small>
            </div>
            <div className="panel-header">
              <h2>{t.quickNav}</h2>
              <p>{lang === 'ar' ? 'شريط تنقل سريع للفني، مع متابعة التنبيهات والمهام المتأخرة.' : 'A fast technician-only side rail for navigation, alerts, and overdue jobs.'}</p>
            </div>
            <div className="side-nav">
              {t.navigationLinks.map((item) => (
                <a key={item.href} className="side-nav-link" href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="panel sticky-panel technician-side-panel">
            <div className="panel-header">
              <h2>{t.alertsTitle}</h2>
              <p>{lang === 'ar' ? 'التنبيهات الأحدث من النظام والمهام التي تحتاج متابعة اليوم.' : 'The newest alerts from the system and the jobs that need attention today.'}</p>
            </div>
            <div className="alert-stack">
              {alertCards.length ? (
                alertCards.map((order) => (
                  <article className="alert-card" key={`${order.id}-${order.status}`}>
                    <strong>{order.customerName}</strong>
                    <p>{order.address}</p>
                    <span>{order.overdue ? (lang === 'ar' ? 'متأخرة' : 'Overdue') : (lang === 'ar' ? 'جديدة' : 'New')}</span>
                  </article>
                ))
              ) : (
                <p className="muted">{t.noAlerts}</p>
              )}
            </div>
          </div>

          <div className="panel sticky-panel technician-side-panel" id="technician-checklist">
            <div className="panel-header">
              <h2>{t.checklistTitle}</h2>
              <p>{lang === 'ar' ? 'اتباع هذه النقاط يحافظ على جودة التنفيذ والتوثيق.' : 'Following these steps keeps execution and documentation consistent.'}</p>
            </div>
            <div className="checklist-list">
              {checklist.map((item) => (
                <article className="checklist-item" key={item}>
                  <span className="check-icon">✓</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="panel sticky-panel technician-side-panel">
            <div className="panel-header">
              <h2>{lang === 'ar' ? 'تنبيهات النظام' : 'System notifications'}</h2>
              <p>{lang === 'ar' ? 'الرسائل الأخيرة المرتبطة بالحساب والمهام.' : 'The latest messages linked to the account and assigned jobs.'}</p>
            </div>
            <div className="notification-stack">
              {liveNotifications.length ? (
                liveNotifications.map((item) => (
                  <article className={`notification-tile ${item.isRead ? 'read' : 'unread'}`} key={item.id}>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </article>
                ))
              ) : (
                <p className="muted">{t.noAlerts}</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
