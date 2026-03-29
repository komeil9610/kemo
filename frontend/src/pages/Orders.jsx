import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  buildEscalationSnapshot,
  compareOrdersByInternalArea,
  formatSaudiPhoneDisplay,
  getAreaClusterLabel,
  notificationsService,
  operationsService,
  technicianStatusOptions,
} from '../services/api';

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
  return order?.district || order?.region || order?.zone || technician?.region || technician?.zone || 'Saudi Arabia';
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
    title: 'Daily field workflow',
    subtitle: 'Today’s jobs, navigation, proof upload, and account controls built for one-handed use.',
    loading: 'Loading technician workspace...',
    generalTasksLink: 'General tasks',
    dailyTasksLink: 'Daily tasks',
    tabs: {
      today: 'Assigned tasks',
      history: 'History',
      notifications: 'Alerts',
      account: 'Account',
    },
    emptyToday: 'No assigned tasks match this date.',
    emptyHistory: 'No completed history yet.',
    emptyNotifications: 'No notifications right now.',
    dateFilter: 'Task date',
    allDates: 'All dates',
    standardTime: 'Standard',
    elapsedTime: 'Elapsed',
    customer: 'Customer',
    region: 'District',
    scheduled: 'Scheduled',
    workType: 'Work required',
    notes: 'Notes',
    quickActions: 'Quick actions',
    call: 'Call',
    route: 'Route',
    statusRail: 'Required status flow',
    proofTitle: 'Proof of completion',
    photoPrompt: 'Upload installation photo',
    signature: 'Client signature',
    signaturePlaceholder: 'Type the client name as signature',
    saveStatus: 'Update status',
    exceptionGuide: 'Field exceptions are handled from the daily page with required reason and proof.',
    accountTitle: 'My account',
    availability: 'Availability',
    logout: 'Log out',
    sync: 'Sync now',
    checklist: 'Daily checklist',
    notificationsTitle: 'Live notifications',
    statusLabels: {
      pending: 'Pending',
      en_route: 'On the way',
      in_progress: 'In progress',
      completed: 'Completed',
      suspended: 'Suspended',
      canceled: 'Canceled',
    },
    statusFlow: [
      { value: 'pending', label: 'Pending' },
      { value: 'en_route', label: 'Traveling' },
      { value: 'in_progress', label: 'Installing' },
    ],
    proofBadgePending: 'Need upload',
    proofBadgeDone: 'Proof uploaded',
    metrics: {
      today: 'Today jobs',
      active: 'Active now',
      done: 'Done',
      alerts: 'Needs attention',
    },
    messages: {
      statusUpdated: 'Task status updated.',
      photoUploaded: 'Proof photo uploaded.',
    },
    checklistItems: [
      'Call the customer before heading out.',
      'Open Maps from the task detail before departure.',
      'Take a clear photo after the installation.',
      'Move the task to completed only after proof is saved.',
    ],
  },
  ar: {
    eyebrow: 'تطبيق الفني',
    title: 'سير العمل اليومي للفني',
    subtitle: 'مهام اليوم، الملاحة، رفع الإثبات، وإعدادات الحساب في تجربة مبنية للاستخدام السريع بيد واحدة.',
    loading: 'جارٍ تحميل مساحة الفني...',
    generalTasksLink: 'المهام العامة',
    dailyTasksLink: 'المهام اليومية',
    tabs: {
      today: 'المهام المسندة',
      history: 'السجل',
      notifications: 'الإشعارات',
      account: 'حسابي',
    },
    emptyToday: 'لا توجد مهام مسندة مطابقة لهذا التاريخ.',
    emptyHistory: 'لا يوجد سجل منجز حتى الآن.',
    emptyNotifications: 'لا توجد إشعارات حالياً.',
    dateFilter: 'تاريخ المهمة',
    allDates: 'كل التواريخ',
    standardTime: 'المعياري',
    elapsedTime: 'المستغرق',
    customer: 'العميل',
    region: 'الحي',
    scheduled: 'الموعد',
    workType: 'العمل المطلوب',
    notes: 'ملاحظات',
    quickActions: 'إجراءات سريعة',
    call: 'اتصال',
    route: 'الموقع',
    statusRail: 'شريط الحالة الإجباري',
    proofTitle: 'إثبات الإنجاز',
    photoPrompt: 'رفع صورة التركيب',
    signature: 'توقيع العميل',
    signaturePlaceholder: 'اكتب اسم العميل كتوقيع',
    saveStatus: 'تحديث الحالة',
    exceptionGuide: 'معالجة المهام المتعثرة تتم من صفحة المهام اليومية مع سبب إجباري وصورة إثبات.',
    accountTitle: 'حسابي',
    availability: 'حالة التوفر',
    logout: 'تسجيل الخروج',
    sync: 'مزامنة الآن',
    checklist: 'قائمة اليوم',
    notificationsTitle: 'تنبيهات مباشرة',
    statusLabels: {
      pending: 'قيد الانتظار',
      en_route: 'في الطريق',
      in_progress: 'جاري العمل',
      completed: 'مكتملة',
      suspended: 'معلقة',
      canceled: 'ملغاة',
    },
    statusFlow: [
      { value: 'pending', label: 'انتظار' },
      { value: 'en_route', label: 'في الطريق' },
      { value: 'in_progress', label: 'جاري التنفيذ' },
    ],
    proofBadgePending: 'بحاجة لتوثيق',
    proofBadgeDone: 'تم رفع الإثبات',
    metrics: {
      today: 'مهام اليوم',
      active: 'نشطة الآن',
      done: 'مكتملة',
      alerts: 'تحتاج متابعة',
    },
    messages: {
      statusUpdated: 'تم تحديث حالة المهمة.',
      photoUploaded: 'تم رفع صورة الإثبات.',
    },
    checklistItems: [
      'اتصل بالعميل قبل التوجه للموقع.',
      'افتح خرائط Google من شاشة المهمة قبل الانطلاق.',
      'ارفع صورة واضحة بعد إنهاء التركيب.',
      'لا تغلق المهمة كمكتملة قبل حفظ الإثبات.',
    ],
  },
};

const statusOrder = {
  pending: 0,
  en_route: 1,
  in_progress: 2,
  completed: 3,
  suspended: 4,
  canceled: 5,
};

const sortOrders = (orders = []) =>
  [...orders].sort((left, right) => {
    const areaComparison = compareOrdersByInternalArea(left, right);
    if (areaComparison !== 0) {
      return areaComparison;
    }
    if ((statusOrder[left.status] || 99) !== (statusOrder[right.status] || 99)) {
      return (statusOrder[left.status] || 99) - (statusOrder[right.status] || 99);
    }
    return `${left.scheduledDate || ''} ${left.scheduledTime || ''}`.localeCompare(
      `${right.scheduledDate || ''} ${right.scheduledTime || ''}`
    );
  });

export default function Orders() {
  const { user, logout } = useAuth();
  const { lang, isRTL, toggleLang } = useLang();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [signatureDrafts, setSignatureDrafts] = useState({});

  const seenOrderIdsRef = useRef(new Set());
  const seenOverdueIdsRef = useRef(new Set());
  const seenNotificationIdsRef = useRef(new Set());
  const bootstrappedOrdersRef = useRef(false);
  const bootstrappedNotificationsRef = useRef(false);

  const t = useMemo(() => copy[lang] || copy.en, [lang]);

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
              body: `${order.customerName} - ${formatDate(order.scheduledDate, lang)}`,
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
        const nextNotifications = items.slice(0, 8);
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

  const technician = useMemo(() => payload?.technician || null, [payload]);
  const orders = useMemo(() => payload?.orders || [], [payload]);
  const timeStandards = useMemo(() => payload?.timeStandards || [], [payload]);

  const ordersWithMeta = useMemo(
    () =>
      sortOrders(
        orders.map((order) => ({
          ...order,
          region: resolveRegion(order, technician),
          overdue: isOverdueOrder(order),
          hasProof: Boolean(order.photos?.length),
          timing: buildEscalationSnapshot(order, timeStandards),
        }))
      ),
    [orders, technician, timeStandards]
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayOrders = useMemo(
    () =>
      ordersWithMeta.filter((order) => {
        if (selectedDateFilter !== 'all' && order.scheduledDate !== selectedDateFilter) {
          return false;
        }
        return true;
      }),
    [ordersWithMeta, selectedDateFilter]
  );

  const historyOrders = useMemo(
    () =>
      ordersWithMeta.filter(
        (order) =>
          ['completed', 'canceled', 'suspended'].includes(order.status) ||
          (order.scheduledDate && order.scheduledDate !== todayKey)
      ),
    [ordersWithMeta, todayKey]
  );

  const assignedDateOptions = useMemo(
    () =>
      Array.from(new Set(ordersWithMeta.map((order) => order.scheduledDate).filter(Boolean))).sort((left, right) =>
        String(left).localeCompare(String(right))
      ),
    [ordersWithMeta]
  );

  const alertOrders = useMemo(() => ordersWithMeta.filter((order) => order.overdue || order.status === 'pending').slice(0, 6), [ordersWithMeta]);

  useEffect(() => {
    const visibleOrders = activeTab === 'history' ? historyOrders : todayOrders;
    if (!visibleOrders.length) {
      setSelectedOrderId('');
      return;
    }
    if (!visibleOrders.some((order) => String(order.id) === String(selectedOrderId))) {
      setSelectedOrderId(String(visibleOrders[0].id));
    }
  }, [activeTab, historyOrders, selectedOrderId, todayOrders]);

  const selectedOrder = useMemo(
    () => ordersWithMeta.find((order) => String(order.id) === String(selectedOrderId)) || null,
    [ordersWithMeta, selectedOrderId]
  );

  const activeCount = ordersWithMeta.filter((order) => ['en_route', 'in_progress'].includes(order.status)).length;
  const completedCount = ordersWithMeta.filter((order) => order.status === 'completed').length;
  const attentionCount = ordersWithMeta.filter((order) => order.overdue || order.status === 'pending').length;

  const updateStatus = async (orderId, status) => {
    setMessage('');
    await operationsService.updateTechnicianStatus(orderId, status);
    setMessage(t.messages.statusUpdated);
    await loadOrders();
  };

  const updateAvailability = async (status) => {
    if (!technician?.id) {
      return;
    }

    try {
      setUpdatingAvailability(true);
      setMessage('');
      await operationsService.updateTechnicianAvailability(technician.id, status);
      await loadOrders();
    } finally {
      setUpdatingAvailability(false);
    }
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

  const saveSignature = async (order) => {
    const value = signatureDrafts[order.id];
    await operationsService.updateOrder(order.id, { clientSignature: value || order.clientSignature || '' });
    await loadOrders();
  };

  const tabItems = useMemo(
    () => [
      { id: 'today', label: t.tabs.today, count: todayOrders.length },
      { id: 'history', label: t.tabs.history, count: historyOrders.length },
      { id: 'notifications', label: t.tabs.notifications, count: notifications.length + alertOrders.length },
      { id: 'account', label: t.tabs.account, count: 0 },
    ],
    [alertOrders.length, historyOrders.length, notifications.length, t.tabs, todayOrders.length]
  );

  const openMapsUrl = selectedOrder
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.address || selectedOrder.region || '')}`
    : '#';

  if (loading) {
    return <section className="page-shell">{t.loading}</section>;
  }

  return (
    <section className="page-shell technician-app-shell" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="technician-app-header">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="section-subtitle">
            {technician?.name} - {technician?.region || technician?.zone}
          </p>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>
        <div className="status-actions">
          <Link className="btn-primary" to="/tasks">
            {t.generalTasksLink}
          </Link>
          <Link className="btn-light" to="/tasks/daily">
            {t.dailyTasksLink}
          </Link>
          <button className="btn-secondary language-switch" onClick={toggleLang} type="button">
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>

      {message ? <div className="flash-message">{message}</div> : null}

      <div className="technician-summary-strip">
        <article className="tech-summary-card">
          <span>{t.metrics.today}</span>
          <strong>{todayOrders.length}</strong>
        </article>
        <article className="tech-summary-card">
          <span>{t.metrics.active}</span>
          <strong>{activeCount}</strong>
        </article>
        <article className="tech-summary-card">
          <span>{t.metrics.done}</span>
          <strong>{completedCount}</strong>
        </article>
        <article className="tech-summary-card attention">
          <span>{t.metrics.alerts}</span>
          <strong>{attentionCount}</strong>
        </article>
      </div>

      <div className="technician-app-body">
        {activeTab === 'today' ? (
          <div className="technician-workspace">
            <section className="panel today-column">
              <div className="panel-header">
                <div>
                  <h2>{t.tabs.today}</h2>
                  <p>{todayOrders.length ? `${todayOrders.length}` : t.emptyToday}</p>
                </div>
                <label className="filter-field compact-filter">
                  <span>{t.dateFilter}</span>
                  <select className="input compact-input" value={selectedDateFilter} onChange={(event) => setSelectedDateFilter(event.target.value)}>
                    <option value="all">{t.allDates}</option>
                    {assignedDateOptions.map((date) => (
                      <option key={date} value={date}>
                        {formatDate(date, lang)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="tech-job-list">
                {todayOrders.length ? (
                  todayOrders.map((order) => (
                    <button
                      className={`tech-job-card ${order.status} ${String(selectedOrderId) === String(order.id) ? 'selected' : ''}`}
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(String(order.id))}
                    >
                      <div className="tech-job-top">
                        <span className="tech-job-time">{order.scheduledTime || order.scheduledDate || '—'}</span>
                        <span className={`status-badge ${order.status}`}>{t.statusLabels[order.status] || order.status}</span>
                      </div>
                      <strong>{order.customerName}</strong>
                      <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                      <span>{order.region}</span>
                      <span>{order.workType || order.acType}</span>
                      <small>
                        {t.standardTime}: {order.timing?.standardDurationMinutes || 0} min
                      </small>
                      {order.overdue ? <small className="alert-pill">{lang === 'ar' ? 'متأخرة' : 'Overdue'}</small> : null}
                    </button>
                  ))
                ) : (
                  <p className="muted">{t.emptyToday}</p>
                )}
              </div>
            </section>

            <section className="panel task-detail-panel">
              {selectedOrder ? (
                <>
                  <div className="task-detail-head">
                    <div>
                      <p className="task-region">{getAreaClusterLabel(selectedOrder, lang)}</p>
                      <p className="task-region">{selectedOrder.region}</p>
                      <h2>
                        #{formatOrderNumber(selectedOrder.id)} - {selectedOrder.customerName}
                      </h2>
                      <p>{formatSaudiPhoneDisplay(selectedOrder.phone)}</p>
                    </div>
                    <span className={`status-badge ${selectedOrder.status}`}>
                      {t.statusLabels[selectedOrder.status] || selectedOrder.status}
                    </span>
                  </div>

                  <div className="task-quick-actions">
                    <a className="btn-light" href={`tel:${selectedOrder.phone}`}>
                      {t.call}
                    </a>
                    <a className="btn-primary" href={openMapsUrl} rel="noreferrer" target="_blank">
                      {t.route}
                    </a>
                  </div>

                  <div className="task-detail-grid">
                    <div className="detail-card">
                      <span>{t.customer}</span>
                      <strong>{selectedOrder.customerName}</strong>
                    </div>
                    <div className="detail-card">
                      <span>{lang === 'ar' ? 'المنطقة الداخلية' : 'Internal zone'}</span>
                      <strong>{getAreaClusterLabel(selectedOrder, lang)}</strong>
                    </div>
                    <div className="detail-card">
                      <span>{t.region}</span>
                      <strong>{selectedOrder.region}</strong>
                    </div>
                    <div className="detail-card">
                      <span>{t.scheduled}</span>
                      <strong>
                        {formatDate(selectedOrder.scheduledDate, lang)} {selectedOrder.scheduledTime ? `• ${selectedOrder.scheduledTime}` : ''}
                      </strong>
                    </div>
                    <div className="detail-card">
                      <span>{t.workType}</span>
                      <strong>{selectedOrder.workType || selectedOrder.acType}</strong>
                    </div>
                    <div className="detail-card">
                      <span>{t.standardTime}</span>
                      <strong>{selectedOrder.timing?.standardDurationMinutes || 0} min</strong>
                    </div>
                    <div className="detail-card">
                      <span>{t.elapsedTime}</span>
                      <strong>{selectedOrder.timing?.elapsedMinutes || 0} min</strong>
                    </div>
                  </div>

                  <div className="panel inset-panel">
                    <h3>{t.quickActions}</h3>
                    <p>{selectedOrder.address}</p>
                    {selectedOrder.notes ? <p className="notes-box">{t.notes}: {selectedOrder.notes}</p> : null}
                    {(selectedOrder.serviceItems || []).length ? (
                      <div className="task-service-list">
                        {selectedOrder.serviceItems.map((item) => (
                          <article className="task-service-item" key={item.id}>
                            <strong>{item.description}</strong>
                            <span>
                              {item.quantity} x {item.price} SAR
                            </span>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="mandatory-status-panel">
                    <div className="panel-header">
                      <h3>{t.statusRail}</h3>
                    </div>
                    <div className="status-rail">
                      {t.statusFlow.map((step, index) => (
                        <button
                          className={`status-step ${selectedOrder.status === step.value ? 'active' : ''}`}
                          disabled={selectedOrder.status === 'canceled'}
                          key={step.value}
                          type="button"
                          onClick={() => updateStatus(selectedOrder.id, step.value)}
                        >
                          <span>{index + 1}</span>
                          <strong>{step.label}</strong>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="proof-shell">
                    <div className="panel inset-panel">
                      <div className="panel-header">
                        <h3>{t.proofTitle}</h3>
                        <p>{selectedOrder.hasProof ? t.proofBadgeDone : t.proofBadgePending}</p>
                      </div>
                      <label className="upload-box">
                        <span>{t.photoPrompt}</span>
                        <input type="file" accept="image/*" onChange={(event) => uploadPhoto(selectedOrder.id, event.target.files?.[0])} />
                      </label>
                      <div className="photo-grid">
                        {(selectedOrder.photos || []).map((photo) => (
                          <img alt={photo.name} className="photo-thumb" key={photo.id} src={photo.url} />
                        ))}
                      </div>
                    </div>

                    <div className="panel inset-panel">
                      <label className="filter-field">
                        <span>{t.signature}</span>
                        <input
                          className="input"
                          placeholder={t.signaturePlaceholder}
                          value={signatureDrafts[selectedOrder.id] ?? selectedOrder.clientSignature ?? ''}
                          onChange={(event) =>
                            setSignatureDrafts((current) => ({
                              ...current,
                              [selectedOrder.id]: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <div className="status-actions">
                        <button className="btn-light" type="button" onClick={() => saveSignature(selectedOrder)}>
                          {t.saveStatus}
                        </button>
                        <Link className="btn-danger" to="/tasks/daily">
                          {t.dailyTasksLink}
                        </Link>
                      </div>
                      <p className="muted">{t.exceptionGuide}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="muted">{t.emptyToday}</p>
              )}
            </section>
          </div>
        ) : null}

        {activeTab === 'history' ? (
          <section className="panel history-panel">
            <div className="panel-header">
              <h2>{t.tabs.history}</h2>
            </div>
            <div className="history-list">
              {historyOrders.length ? (
                historyOrders.map((order) => (
                  <article className="history-card" key={order.id}>
                    <div className="task-head">
                      <div>
                        <strong>#{formatOrderNumber(order.id)} - {order.customerName}</strong>
                        <p>{order.region}</p>
                        <p>{formatDate(order.scheduledDate, lang)}</p>
                      </div>
                      <span className={`status-badge ${order.status}`}>{t.statusLabels[order.status] || order.status}</span>
                    </div>
                    <p>{order.workType || order.acType}</p>
                  </article>
                ))
              ) : (
                <p className="muted">{t.emptyHistory}</p>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === 'notifications' ? (
          <section className="panel notifications-panel">
            <div className="panel-header">
              <h2>{t.notificationsTitle}</h2>
            </div>
            <div className="notification-stack">
              {alertOrders.map((order) => (
                <article className="alert-card" key={`${order.id}-${order.status}`}>
                  <strong>{order.customerName}</strong>
                  <p>{order.address}</p>
                  <span>{order.overdue ? (lang === 'ar' ? 'متأخرة' : 'Overdue') : t.statusLabels[order.status] || order.status}</span>
                </article>
              ))}
              {notifications.map((item) => (
                <article className={`notification-tile ${item.isRead ? 'read' : 'unread'}`} key={item.id}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </article>
              ))}
              {!notifications.length && !alertOrders.length ? <p className="muted">{t.emptyNotifications}</p> : null}
            </div>
          </section>
        ) : null}

        {activeTab === 'account' ? (
          <section className="panel account-panel">
            <div className="panel-header">
              <h2>{t.accountTitle}</h2>
            </div>
            <div className="technician-availability-card">
              <div>
                <span>{t.availability}</span>
                <strong>
                  {technician?.status === 'busy'
                    ? lang === 'ar'
                      ? 'مشغول'
                      : 'Busy'
                    : lang === 'ar'
                      ? 'متاح'
                      : 'Available'}
                </strong>
              </div>
              <select
                className="input compact-input"
                disabled={updatingAvailability}
                value={technician?.status === 'busy' ? 'busy' : 'available'}
                onChange={(event) => updateAvailability(event.target.value)}
              >
                {technicianStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {lang === 'ar' ? option.arLabel : option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="checklist-list">
              {t.checklistItems.map((item) => (
                <article className="checklist-item" key={item}>
                  <span className="check-icon">✓</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>

            <div className="status-actions">
              <button className="btn-light" type="button" onClick={() => loadOrders(false)}>
                {t.sync}
              </button>
              <button className="btn-danger" type="button" onClick={logout}>
                {t.logout}
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <nav className="bottom-tab-bar" aria-label="Technician navigation">
        {tabItems.map((item) => (
          <button
            className={activeTab === item.id ? 'active' : ''}
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
          >
            <strong>{item.label}</strong>
            {item.count ? <span>{item.count}</span> : null}
          </button>
        ))}
      </nav>
    </section>
  );
}
