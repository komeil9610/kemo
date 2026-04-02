import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLang } from '../context/LangContext';
import {
  buildEscalationSnapshot,
  buildDisplayStatusBuckets,
  compareOrdersByInternalArea,
  formatSaudiPhoneDisplay,
  getAreaClusterLabel,
  notificationsService,
  operationsService,
} from '../services/api';
import { getOrderDeviceCount, getOrderDisplayStatus, orderMatchesDisplayStatus } from '../utils/internalOrders';
import { sendAppNotification } from '../utils/mobileNative';

const todayString = () => new Date().toISOString().slice(0, 10);
const formatOrderNumber = (value) => String(value || '').replace(/^ORD-/, '');

const formatDate = (value, lang) => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T12:00:00`));
};

const formatDateTime = (value, lang) => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const buildLocationLabel = (order) =>
  [order.district, order.city].filter(Boolean).join(' - ') || order.address || order.region || '—';

const isExceptionOrder = (order) => order.status === 'suspended' || order.exceptionStatus === 'open';

const resolveErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const copy = {
  en: {
    eyebrow: 'Admin daily operations',
    title: 'Daily task control board',
    subtitle:
      'Track technician workloads by date, handle field exceptions, and close Zamil jobs only after the OTP succeeds on the official portal.',
    loading: 'Loading admin control board...',
    backDashboard: 'Back to dashboard',
    sync: 'Sync',
    notificationsTitle: 'Live manager alerts',
    notificationsHint: 'OTP requests and OTP receipts appear here immediately and refresh the dashboard automatically.',
    emptyNotifications: 'No new manager notifications right now.',
    markAllRead: 'Mark all as read',
    dateLabel: 'Operation date',
    searchLabel: 'Search',
    searchPlaceholder: 'Search customer, area, order, or technician',
    regionLabel: 'Region',
    technicianLabel: 'Technician',
    statusLabel: 'Status',
    allRegions: 'All regions',
    allTechnicians: 'All technicians',
    allStatuses: 'All statuses',
    today: 'Today',
    clearFilters: 'Clear filters',
    stats: {
      total: 'Tasks on selected date',
      unassigned: 'Unassigned',
      active: 'In field',
      completed: 'Completed',
      exceptions: 'Open exceptions',
      closeRequests: 'Waiting for OTP request',
      otpReady: 'OTP received',
      critical: 'Urgent delays',
    },
    urgentAlertsTitle: 'Urgent escalation alerts',
    urgentAlertsHint: 'Yellow means the technician crossed 115% of the standard time. Red means 130% and needs immediate intervention.',
    noUrgentAlerts: 'No escalation alerts right now.',
    escalationLabels: {
      0: 'Within standard time',
      1: 'Early warning',
      2: 'Manager intervention',
    },
    elapsedTime: 'Elapsed',
    standardTime: 'Standard',
    zamilRoomTitle: 'Zamil closure room',
    zamilRoomHint: 'This is the handoff lane between the field technician and the Zamil portal you operate manually.',
    closeRequestsTitle: 'Ready for Zamil OTP request',
    closeRequestsHint: 'When a card appears here, open the Zamil portal and trigger the OTP to the customer.',
    otpReadyTitle: 'OTP received from field',
    otpReadyHint: 'Enter the code in the Zamil portal. If it succeeds there, approve the job here.',
    noCloseRequests: 'No technicians are waiting for an OTP request right now.',
    noOtpReady: 'No OTP codes received yet.',
    portalStep: 'Next step in portal',
    portalStepHint: 'Trigger OTP from Zamil',
    submittedOtp: 'Submitted OTP',
    approveClosure: 'Approve task and close custody',
    closeRequestedAt: 'Requested at',
    approvedMessage: 'Task closed successfully.',
    closeStatusLabels: {
      idle: 'Not started',
      requested: 'Waiting for OTP request',
      otp_submitted: 'OTP received',
      closed: 'Approved',
    },
    exceptionQueue: 'Exceptions queue',
    exceptionHint: 'Any suspended task lands here immediately and waits for coordinator action.',
    noExceptions: 'No open exceptions right now.',
    routeTitle: 'Internal zoning suggestions',
    routeHint: 'Suggestions are based on your internal neighborhood zones plus the lightest technician load for the chosen date.',
    noSuggestions: 'No route clustering suggestions for the current filters.',
    loadTitle: 'Technician workload by date',
    loadHint: 'Drag a suspended order into any lane to reschedule it for the selected date.',
    noDateJobs: 'No tasks match the current date and filters.',
    unassignedLane: 'Unassigned queue',
    laneMetrics: {
      total: 'Total',
      active: 'Active',
      done: 'Done',
    },
    workload: 'Workload',
    scheduleFor: 'Schedule for',
    statusOptions: {
      pending: 'Pending',
      scheduled: 'Scheduled',
      in_transit: 'In transit',
      completed: 'Completed',
      suspended: 'Suspended',
      canceled: 'Canceled',
    },
    taskMeta: {
      customer: 'Customer',
      location: 'Location',
      time: 'Time',
      devices: 'Devices',
      proof: 'Proof',
      source: 'Source',
    },
    contactCustomer: 'Called customer',
    contactPrompt: 'Write the customer call note',
    proofPending: 'Needs proof review',
    proofApproved: 'Approved',
    latestAudit: 'Latest audit',
    auditLog: 'Audit log',
    moveToDate: 'Move to selected date',
    saveMessage: 'Task updated.',
    dropHint: 'Drop exception here',
  },
  ar: {
    eyebrow: 'تشغيل الإدارة اليومي',
    title: 'لوحة التحكم اليومية للمهام',
    subtitle:
      'تابع أحمال الفنيين حسب التاريخ، عالج المهام المتعثرة، وأغلق طلبات الزامل داخلياً فقط بعد نجاح OTP في البوابة الرسمية.',
    loading: 'جارٍ تحميل لوحة التحكم اليومية...',
    backDashboard: 'العودة للوحة الإدارة',
    sync: 'مزامنة',
    notificationsTitle: 'تنبيهات المسؤول المباشرة',
    notificationsHint: 'طلبات OTP ووصول الرمز تظهر هنا فوراً ويتم معها تحديث اللوحة تلقائياً.',
    emptyNotifications: 'لا توجد تنبيهات جديدة للمسؤول حالياً.',
    markAllRead: 'تعليم الكل كمقروء',
    dateLabel: 'تاريخ التشغيل',
    searchLabel: 'البحث',
    searchPlaceholder: 'ابحث بالعميل أو المنطقة أو رقم الطلب أو اسم الفني',
    regionLabel: 'المنطقة',
    technicianLabel: 'الفني',
    statusLabel: 'الحالة',
    allRegions: 'كل المناطق',
    allTechnicians: 'كل الفنيين',
    allStatuses: 'كل الحالات',
    today: 'اليوم',
    clearFilters: 'تصفير الفلاتر',
    stats: {
      total: 'مهام التاريخ المختار',
      unassigned: 'غير مسندة',
      active: 'في الميدان',
      completed: 'مكتملة',
      exceptions: 'استثناءات مفتوحة',
      closeRequests: 'بانتظار طلب OTP',
      otpReady: 'OTP مستلم',
      critical: 'تأخيرات عاجلة',
    },
    urgentAlertsTitle: 'تنبيهات التصعيد العاجلة',
    urgentAlertsHint: 'الأصفر يعني تجاوز 115% من الوقت المعياري، والأحمر يعني 130% ويحتاج تدخل الإدارة فوراً.',
    noUrgentAlerts: 'لا توجد تنبيهات تصعيد حالياً.',
    escalationLabels: {
      0: 'ضمن الوقت المعياري',
      1: 'تحذير مبكر',
      2: 'تدخل إداري',
    },
    elapsedTime: 'المستغرق',
    standardTime: 'المعياري',
    zamilRoomTitle: 'غرفة إغلاق الزامل',
    zamilRoomHint: 'هذا هو مسار التسليم بين الفني الميداني وبين بوابة الزامل التي تديرها أنت يدوياً.',
    closeRequestsTitle: 'جاهز لطلب OTP من الزامل',
    closeRequestsHint: 'عند ظهور بطاقة هنا افتح بوابة الزامل واطلب إرسال OTP إلى العميل.',
    otpReadyTitle: 'OTP وصل من الميدان',
    otpReadyHint: 'أدخل الرمز في بوابة الزامل، وإذا تم قبوله هناك فاعتمد المهمة هنا.',
    noCloseRequests: 'لا يوجد فني بانتظار طلب OTP حالياً.',
    noOtpReady: 'لا يوجد أي رمز OTP مستلم بعد.',
    portalStep: 'الخطوة التالية في البوابة',
    portalStepHint: 'اطلب OTP من الزامل',
    submittedOtp: 'الرمز المستلم',
    approveClosure: 'اعتماد المهمة وإغلاق العهدة',
    closeRequestedAt: 'وقت الطلب',
    approvedMessage: 'تم إغلاق المهمة بنجاح.',
    closeStatusLabels: {
      idle: 'لم يبدأ',
      requested: 'بانتظار طلب OTP',
      otp_submitted: 'تم استلام OTP',
      closed: 'تم الاعتماد',
    },
    exceptionQueue: 'قائمة المهام المتعثرة',
    exceptionHint: 'أي مهمة يعلقها الفني تهبط هنا فوراً بانتظار تصرف المنسق.',
    noExceptions: 'لا توجد استثناءات مفتوحة الآن.',
    routeTitle: 'اقتراحات الفرز المناطقي الداخلي',
    routeHint: 'الاقتراحات مبنية على مناطقك الداخلية المربوطة بالأحياء مع أخف حمولة فني في التاريخ المختار.',
    noSuggestions: 'لا توجد اقتراحات تجميع جغرافي ضمن الفلاتر الحالية.',
    loadTitle: 'أحمال الفنيين حسب التاريخ',
    loadHint: 'اسحب المهمة المتعثرة إلى أي مسار لإعادة جدولتها على التاريخ المختار.',
    noDateJobs: 'لا توجد مهام مطابقة للتاريخ والفلاتر الحالية.',
    unassignedLane: 'قائمة غير المسند',
    laneMetrics: {
      total: 'الإجمالي',
      active: 'نشطة',
      done: 'مكتملة',
    },
    workload: 'حمولة العمل',
    scheduleFor: 'إعادة الجدولة إلى',
    statusOptions: {
      pending: 'قيد الانتظار',
      scheduled: 'تمت الجدولة',
      in_transit: 'في الطريق',
      completed: 'مكتملة',
      suspended: 'معلقة',
      canceled: 'ملغاة',
    },
    taskMeta: {
      customer: 'العميل',
      location: 'الموقع',
      time: 'الوقت',
      devices: 'عدد الأجهزة',
      proof: 'الإثبات',
      source: 'المصدر',
    },
    contactCustomer: 'تم التواصل مع العميل',
    contactPrompt: 'اكتب ملاحظة الاتصال مع العميل',
    proofPending: 'بانتظار اعتماد الإثبات',
    proofApproved: 'الإثبات معتمد',
    latestAudit: 'آخر حركة',
    auditLog: 'سجل التدقيق',
    moveToDate: 'نقل إلى التاريخ المختار',
    saveMessage: 'تم تحديث المهمة.',
    dropHint: 'أسقط المهمة هنا',
  },
};

export default function AdminDailyTasks() {
  const { lang } = useLang();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [draggingOrderId, setDraggingOrderId] = useState('');
  const [approvalOrderId, setApprovalOrderId] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    region: 'all',
    technician: 'all',
    status: 'all',
  });
  const alertedCriticalRef = useRef(new Set());
  const seenNotificationIdsRef = useRef(new Set());
  const latestNotificationIdRef = useRef(0);
  const bootstrappedNotificationsRef = useRef(false);

  const t = copy[lang] || copy.en;

  const loadDashboard = useCallback(
    async ({ silently = false } = {}) => {
      try {
        if (!silently) {
          setLoading(true);
        }
        const response = await operationsService.getDashboard();
        setDashboard(response.data || {});
      } finally {
        if (!silently) {
          setLoading(false);
        }
      }
    },
    []
  );

  const loadNotifications = useCallback(async (silent = false) => {
    try {
      const response = await notificationsService.list(latestNotificationIdRef.current || 0);
      const freshItems = response.data?.notifications || [];

      if (freshItems.length) {
        latestNotificationIdRef.current = Math.max(
          latestNotificationIdRef.current,
          ...freshItems.map((item) => Number(item.id) || 0)
        );
      }

      setNotifications((current) => {
        const merged = [...freshItems, ...current]
          .filter(
            (item, index, items) =>
              items.findIndex((entry) => String(entry.id) === String(item.id)) === index
          )
          .slice(0, 10);
        return merged;
      });

      const unseenItems = freshItems.filter((item) => !seenNotificationIdsRef.current.has(String(item.id)));
      unseenItems.forEach((item) => seenNotificationIdsRef.current.add(String(item.id)));

      if (bootstrappedNotificationsRef.current && unseenItems.length) {
        unseenItems.forEach((item) => {
          toast(item.title, { duration: 5000 });
          sendAppNotification({ key: `admin-daily-${item.id}`, title: item.title, body: item.body });
        });

        await loadDashboard({ silently: true });
      }

      bootstrappedNotificationsRef.current = true;
    } catch {
      if (!silent) {
        return;
      }
    }
  }, [loadDashboard]);

  useEffect(() => {
    loadDashboard();
    loadNotifications(false);
    window.addEventListener('operations-updated', loadDashboard);
    window.addEventListener('operations-updated', loadNotifications);
    return () => {
      window.removeEventListener('operations-updated', loadDashboard);
      window.removeEventListener('operations-updated', loadNotifications);
    };
  }, [loadDashboard, loadNotifications]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadDashboard({ silently: true });
      loadNotifications(true);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [loadDashboard, loadNotifications]);

  const technicians = useMemo(() => dashboard?.technicians || [], [dashboard]);
  const timeStandards = useMemo(() => dashboard?.timeStandards || [], [dashboard]);
  const orders = useMemo(
    () =>
      (dashboard?.orders || []).map((order) => ({
        ...order,
        region: buildLocationLabel(order),
        timing: buildEscalationSnapshot(order, timeStandards),
        latestAuditEntry: Array.isArray(order.auditLog) && order.auditLog.length ? order.auditLog[order.auditLog.length - 1] : null,
      })),
    [dashboard, timeStandards]
  );

  const regionOptions = useMemo(() => {
    const values = new Set();
    orders.forEach((order) => {
      if (order.region) {
        values.add(order.region);
      }
    });
    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [orders]);
  const displayStatusOptions = useMemo(
    () => buildDisplayStatusBuckets(orders.filter((order) => order.scheduledDate === selectedDate), lang),
    [lang, orders, selectedDate]
  );

  useEffect(() => {
    if (filters.status !== 'all' && !displayStatusOptions.some((item) => item.key === filters.status)) {
      setFilters((current) => ({ ...current, status: 'all' }));
    }
  }, [displayStatusOptions, filters.status]);

  const searchTerm = filters.search.trim().toLowerCase();

  const searchMatches = useCallback(
    (order) => {
      if (!searchTerm) {
        return true;
      }

      const haystack = [
        order.id,
        formatOrderNumber(order.id),
        order.customerName,
        order.phone,
        formatSaudiPhoneDisplay(order.phone),
        order.region,
        getOrderDisplayStatus(order, 'ar'),
        getOrderDisplayStatus(order, 'en'),
        order.internalAreaLabel,
        order.internalAreaArLabel,
        order.address,
        order.technicianName,
        order.workType,
        order.suspensionReason,
        order.suspensionNote,
        order.zamilOtpCode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchTerm);
    },
    [searchTerm]
  );

  const filteredDailyOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (order.scheduledDate !== selectedDate) {
          return false;
        }

        const matchesRegion = filters.region === 'all' || order.region === filters.region;
        const matchesTechnician =
          filters.technician === 'all' || String(order.technicianId || '') === String(filters.technician);
        const matchesStatus = filters.status === 'all' || orderMatchesDisplayStatus(order, filters.status, lang);

        return matchesRegion && matchesTechnician && matchesStatus && searchMatches(order);
      }),
    [filters.region, filters.status, filters.technician, lang, orders, searchMatches, selectedDate]
  );

  const closeRequestOrders = useMemo(
    () =>
      orders
        .filter((order) => order.zamilClosureStatus === 'requested' && searchMatches(order))
        .sort((left, right) =>
          `${right.zamilCloseRequestedAt || right.updatedAt || ''}${right.id}`.localeCompare(
            `${left.zamilCloseRequestedAt || left.updatedAt || ''}${left.id}`
          )
        ),
    [orders, searchMatches]
  );

  const otpReadyOrders = useMemo(
    () =>
      orders
        .filter((order) => order.zamilClosureStatus === 'otp_submitted' && searchMatches(order))
        .sort((left, right) =>
          `${right.zamilOtpSubmittedAt || right.updatedAt || ''}${right.id}`.localeCompare(
            `${left.zamilOtpSubmittedAt || left.updatedAt || ''}${left.id}`
          )
        ),
    [orders, searchMatches]
  );

  const exceptionOrders = useMemo(
    () =>
      orders
        .filter((order) => isExceptionOrder(order) && searchMatches(order))
        .sort((left, right) => `${right.suspendedAt || right.updatedAt || ''}${right.id}`.localeCompare(`${left.suspendedAt || left.updatedAt || ''}${left.id}`)),
    [orders, searchMatches]
  );

  const urgentEscalationOrders = useMemo(
    () =>
      orders
        .filter((order) => ['scheduled', 'in_transit'].includes(order.status) && (order.timing?.escalationLevel || 0) > 0 && searchMatches(order))
        .sort((left, right) => (right.timing?.escalationLevel || 0) - (left.timing?.escalationLevel || 0) || (right.timing?.overtimeMinutes || 0) - (left.timing?.overtimeMinutes || 0)),
    [orders, searchMatches]
  );

  const stats = useMemo(() => {
    const total = filteredDailyOrders.length;
    const unassigned = filteredDailyOrders.filter((order) => !order.technicianId).length;
    const active = filteredDailyOrders.filter((order) => ['scheduled', 'in_transit'].includes(order.status)).length;
    const completed = filteredDailyOrders.filter((order) => order.status === 'completed').length;
    const exceptions = exceptionOrders.length;

    return [
      { label: t.stats.total, value: total },
      { label: t.stats.unassigned, value: unassigned },
      { label: t.stats.active, value: active },
      { label: t.stats.completed, value: completed },
      { label: t.stats.exceptions, value: exceptions },
      { label: t.stats.closeRequests, value: closeRequestOrders.length },
      { label: t.stats.otpReady, value: otpReadyOrders.length },
      { label: t.stats.critical, value: urgentEscalationOrders.filter((order) => (order.timing?.escalationLevel || 0) === 2).length },
    ];
  }, [closeRequestOrders.length, exceptionOrders.length, filteredDailyOrders, otpReadyOrders.length, t.stats, urgentEscalationOrders]);

  const technicianRoster = useMemo(() => {
    const unassignedOrders = filteredDailyOrders
      .filter((order) => !order.technicianId && !isExceptionOrder(order))
      .sort((left, right) => compareOrdersByInternalArea(left, right));

    const lanes = technicians.map((technician) => {
      const assignedOrders = filteredDailyOrders
        .filter((order) => String(order.technicianId || '') === String(technician.id))
        .sort((left, right) => compareOrdersByInternalArea(left, right));

      return {
        ...technician,
        assignedOrders,
        total: assignedOrders.length,
        active: assignedOrders.filter((order) => ['scheduled', 'in_transit'].includes(order.status)).length,
        done: assignedOrders.filter((order) => order.status === 'completed').length,
      };
    });

    const maxLoad = Math.max(1, ...lanes.map((lane) => lane.total));

    return {
      unassignedOrders,
      lanes: lanes
        .map((lane) => ({
          ...lane,
          loadPercent: Math.round((lane.total / maxLoad) * 100),
        }))
        .sort((left, right) => right.total - left.total || String(left.name || '').localeCompare(String(right.name || ''))),
    };
  }, [filteredDailyOrders, technicians]);

  const routeSuggestions = useMemo(() => {
    const regionMap = new Map();

    filteredDailyOrders.forEach((order) => {
      const key = order.internalAreaLabel || order.region || '—';
      if (!regionMap.has(key)) {
        regionMap.set(key, []);
      }
      regionMap.get(key).push(order);
    });

    return Array.from(regionMap.entries())
      .filter(([, regionOrders]) => regionOrders.length > 1)
      .map(([region, regionOrders]) => {
        const sortedCandidates = [...technicianRoster.lanes].sort((left, right) => left.total - right.total);
        const nearest =
          sortedCandidates.find((lane) => {
            const scope = `${lane.region || lane.zone || ''}`.toLowerCase();
            return scope && region.toLowerCase().includes(scope);
          }) || sortedCandidates[0];

        return {
          region,
          count: regionOrders.length,
          technicianName: nearest?.name || t.unassignedLane,
          technicianId: nearest?.id || '',
        };
      })
      .slice(0, 8);
  }, [filteredDailyOrders, technicianRoster.lanes, t.unassignedLane]);

  useEffect(() => {
    const criticalIds = urgentEscalationOrders
      .filter((order) => (order.timing?.escalationLevel || 0) === 2)
      .map((order) => String(order.id));

    const hasNewCritical = criticalIds.some((id) => !alertedCriticalRef.current.has(id));
    if (!hasNewCritical) {
      return;
    }

    criticalIds.forEach((id) => alertedCriticalRef.current.add(id));

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.36);
    } catch {
      return;
    }
  }, [urgentEscalationOrders]);

  const buildAuditEntry = (type, actor, messageText) => ({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    actor,
    message: messageText,
    createdAt: new Date().toISOString(),
  });

  const updateOrder = async (order, changes, auditMessage) => {
    await operationsService.updateOrder(order.id, {
      ...changes,
      auditLog: auditMessage
        ? [...(order.auditLog || []), buildAuditEntry('admin', 'admin', auditMessage)]
        : order.auditLog || [],
    });
    setMessage(t.saveMessage);
    await loadDashboard({ silently: true });
  };

  const handleTechnicianChange = async (order, technicianId) => {
    const technician = technicians.find((entry) => String(entry.id) === String(technicianId));
    await updateOrder(
      order,
      { technicianId: technicianId || '', exceptionStatus: order.status === 'suspended' ? 'open' : order.exceptionStatus },
      lang === 'ar'
        ? `أعاد المنسق إسناد المهمة إلى ${technician?.name || t.unassignedLane}`
        : `Coordinator reassigned the task to ${technician?.name || t.unassignedLane}`
    );
  };

  const handleStatusChange = async (order, status) => {
    await updateOrder(
      order,
      {
        status,
        exceptionStatus: status === 'suspended' ? 'open' : status === 'pending' ? 'rescheduled' : order.exceptionStatus,
      },
      lang === 'ar' ? `غيّر المنسق الحالة إلى ${t.statusOptions[status] || status}` : `Coordinator changed status to ${status}`
    );
  };

  const handleApproveClosure = async (order) => {
    try {
      setApprovalOrderId(String(order.id));
      await operationsService.approveClosure(order.id);
      setMessage(t.approvedMessage);
      await loadDashboard({ silently: true });
    } catch (error) {
      toast.error(resolveErrorMessage(error, t.approvedMessage));
    } finally {
      setApprovalOrderId('');
    }
  };

  const handleContactCustomer = async (order) => {
    const note = window.prompt(t.contactPrompt, '');
    if (!note) {
      return;
    }

    try {
      await updateOrder(
        order,
        { contactCustomerNote: note },
        lang === 'ar' ? `تم التواصل مع العميل. الملاحظة: ${note}` : `Customer was contacted. Note: ${note}`
      );
    } catch (error) {
      toast.error(resolveErrorMessage(error, t.contactCustomer));
    }
  };

  const rescheduleException = async (technicianId) => {
    const order = exceptionOrders.find((entry) => String(entry.id) === String(draggingOrderId));
    if (!order) {
      return;
    }

    const technician = technicians.find((entry) => String(entry.id) === String(technicianId));
    await updateOrder(
      order,
      {
        technicianId,
        scheduledDate: selectedDate,
        status: 'pending',
        exceptionStatus: 'rescheduled',
      },
      lang === 'ar'
        ? `أعاد المنسق جدولة المهمة إلى ${formatDate(selectedDate, lang)} مع ${technician?.name || t.unassignedLane}`
        : `Coordinator rescheduled the task to ${selectedDate} with ${technician?.name || t.unassignedLane}`
    );
    setDraggingOrderId('');
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      region: 'all',
      technician: 'all',
      status: 'all',
    });
  };

  if (loading) {
    return <section className="page-shell">{t.loading}</section>;
  }

  return (
    <section className="page-shell admin-daily-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="section-heading admin-daily-header">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>
        <div className="status-actions">
          <button className="btn-light" type="button" onClick={() => loadDashboard()}>
            {t.sync}
          </button>
          <Link className="btn-light" to="/dashboard">
            {t.backDashboard}
          </Link>
        </div>
      </div>

      {message ? <div className="flash-message">{message}</div> : null}

      <div className="panel admin-daily-filters">
        <label className="filter-field">
          <span>{t.dateLabel}</span>
          <input className="input" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>

        <label className="filter-field">
          <span>{t.searchLabel}</span>
          <input
            className="input"
            type="search"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder={t.searchPlaceholder}
          />
        </label>

        <label className="filter-field">
          <span>{t.regionLabel}</span>
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

        <label className="filter-field">
          <span>{t.technicianLabel}</span>
          <select
            className="input"
            value={filters.technician}
            onChange={(event) => setFilters((current) => ({ ...current, technician: event.target.value }))}
          >
            <option value="all">{t.allTechnicians}</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>{t.statusLabel}</span>
          <select
            className="input"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="all">{t.allStatuses}</option>
            {displayStatusOptions.map((statusItem) => (
              <option key={statusItem.key} value={statusItem.key}>
                {statusItem.label}
              </option>
            ))}
          </select>
        </label>

        <div className="status-actions">
          <button className="btn-light" type="button" onClick={() => setSelectedDate(todayString())}>
            {t.today}
          </button>
          <button className="btn-secondary" type="button" onClick={resetFilters}>
            {t.clearFilters}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>

      <div className="admin-daily-layout">
        <aside className="admin-daily-sidebar">
          <section className="panel admin-daily-section">
            <div className="panel-header">
              <div>
                <h2>{t.notificationsTitle}</h2>
                <p>{t.notificationsHint}</p>
              </div>
              {notifications.some((item) => !item.isRead) ? (
                <button
                  className="btn-light"
                  type="button"
                  onClick={async () => {
                    await notificationsService.markAllRead();
                    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
                  }}
                >
                  {t.markAllRead}
                </button>
              ) : null}
            </div>
            <div className="notification-stack">
              {notifications.length ? (
                notifications.map((item) => (
                  <article className={`notification-tile ${item.isRead ? 'read' : 'unread'}`} key={`admin-note-${item.id}`}>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </article>
                ))
              ) : (
                <p className="muted">{t.emptyNotifications}</p>
              )}
            </div>
          </section>

          <section className="panel admin-daily-section admin-escalation-panel">
            <div className="panel-header">
              <div>
                <h2>{t.urgentAlertsTitle}</h2>
                <p>{t.urgentAlertsHint}</p>
              </div>
            </div>
            <div className="admin-urgent-list">
              {urgentEscalationOrders.length ? (
                urgentEscalationOrders.map((order) => (
                  <article className={`admin-urgent-card ${order.timing?.escalationLevel === 2 ? 'critical-escalation-card' : 'warning-escalation-card'}`} key={`esc-${order.id}`}>
                    <div className="dispatch-job-top">
                      <strong>#{formatOrderNumber(order.id)}</strong>
                      <span className={`close-stage-pill ${order.timing?.escalationLevel === 2 ? 'otp_submitted' : 'requested'}`}>
                        {t.escalationLabels[order.timing?.escalationLevel || 0]}
                      </span>
                    </div>
                    <p>{order.customerName}</p>
                    <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                    <p>{order.technicianName || t.unassignedLane}</p>
                    <small>
                      {t.elapsedTime}: {order.timing?.elapsedMinutes || 0} min
                    </small>
                    <small>
                      {t.taskMeta.devices}: {getOrderDeviceCount(order)}
                    </small>
                    <small>
                      {t.standardTime}: {order.timing?.standardDurationMinutes || 0} min
                    </small>
                  </article>
                ))
              ) : (
                <p className="muted">{t.noUrgentAlerts}</p>
              )}
            </div>
          </section>

          <section className="panel admin-daily-section zamil-room-panel">
            <div className="panel-header">
              <div>
                <h2>{t.zamilRoomTitle}</h2>
                <p>{t.zamilRoomHint}</p>
              </div>
            </div>

            <div className="zamil-room-grid">
              <div className="admin-urgent-list">
                <div className="panel-header">
                  <div>
                    <h3>{t.closeRequestsTitle}</h3>
                    <p>{t.closeRequestsHint}</p>
                  </div>
                </div>
                {closeRequestOrders.length ? (
                  closeRequestOrders.map((order) => (
                    <article className="admin-urgent-card zamil-request-card" key={order.id}>
                      <div className="dispatch-job-top">
                        <strong>#{formatOrderNumber(order.id)}</strong>
                        <span className="close-stage-pill requested">{t.closeStatusLabels.requested}</span>
                      </div>
                      <p>{order.customerName}</p>
                      <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                      <p>{order.technicianName || t.unassignedLane}</p>
                      <small>{order.region}</small>
                      <small>
                        {t.taskMeta.devices}: {getOrderDeviceCount(order)}
                      </small>
                      <small>
                        {t.closeRequestedAt}: {formatDateTime(order.zamilCloseRequestedAt, lang)}
                      </small>
                      <div className="portal-step-card">
                        <span>{t.portalStep}</span>
                        <strong>{t.portalStepHint}</strong>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="muted">{t.noCloseRequests}</p>
                )}
              </div>

              <div className="admin-urgent-list">
                <div className="panel-header">
                  <div>
                    <h3>{t.otpReadyTitle}</h3>
                    <p>{t.otpReadyHint}</p>
                  </div>
                </div>
                {otpReadyOrders.length ? (
                  otpReadyOrders.map((order) => (
                    <article className="admin-urgent-card otp-ready-card" key={order.id}>
                      <div className="dispatch-job-top">
                        <strong>#{formatOrderNumber(order.id)}</strong>
                        <span className="close-stage-pill otp_submitted">{t.closeStatusLabels.otp_submitted}</span>
                      </div>
                      <p>{order.customerName}</p>
                      <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                      <p>{order.technicianName || t.unassignedLane}</p>
                      <small>{order.region}</small>
                      <small>
                        {t.taskMeta.devices}: {getOrderDeviceCount(order)}
                      </small>
                      <div className="otp-code-preview large">
                        <span>{t.submittedOtp}</span>
                        <strong>{order.zamilOtpCode || '—'}</strong>
                      </div>
                      <button
                        className="btn-primary"
                        disabled={approvalOrderId === String(order.id)}
                        type="button"
                        onClick={() => handleApproveClosure(order)}
                      >
                        {t.approveClosure}
                      </button>
                    </article>
                  ))
                ) : (
                  <p className="muted">{t.noOtpReady}</p>
                )}
              </div>
            </div>
          </section>

          <section className="panel admin-daily-section admin-exception-panel">
            <div className="panel-header">
              <h2>{t.exceptionQueue}</h2>
              <p>{t.exceptionHint}</p>
            </div>
            <div className="admin-urgent-list exception-list">
              {exceptionOrders.length ? (
                exceptionOrders.map((order) => (
                  <article
                    className="admin-urgent-card exception-card"
                    draggable
                    key={order.id}
                    onDragStart={() => setDraggingOrderId(String(order.id))}
                    onDragEnd={() => setDraggingOrderId('')}
                  >
                    <div className="dispatch-job-top">
                      <strong>#{formatOrderNumber(order.id)}</strong>
                      <span className="status-badge suspended">{t.statusOptions.suspended}</span>
                    </div>
                    <p>{order.customerName}</p>
                    <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                    <p>{order.region}</p>
                    <small>
                      {t.taskMeta.devices}: {getOrderDeviceCount(order)}
                    </small>
                    <small>{order.suspensionReason || order.suspensionNote || t.exceptionQueue}</small>
                    <small>
                      {t.scheduleFor}: {formatDate(selectedDate, lang)}
                    </small>
                  </article>
                ))
              ) : (
                <p className="muted">{t.noExceptions}</p>
              )}
            </div>
          </section>

          <section className="panel admin-daily-section">
            <div className="panel-header">
              <h2>{t.routeTitle}</h2>
              <p>{t.routeHint}</p>
            </div>
            <div className="coverage-chip-grid">
              {routeSuggestions.length ? (
                routeSuggestions.map((item) => (
                  <article className="coverage-chip route-suggestion-card" key={`${item.region}-${item.technicianId || 'none'}`}>
                    <strong>{item.count}</strong>
                    <span>{item.region}</span>
                    <small>{item.technicianName}</small>
                  </article>
                ))
              ) : (
                <p className="muted">{t.noSuggestions}</p>
              )}
            </div>
          </section>
        </aside>

        <div className="admin-daily-main">
          <section className="panel admin-daily-section">
            <div className="panel-header">
              <h2>{t.loadTitle}</h2>
              <p>{t.loadHint}</p>
            </div>

            {!filteredDailyOrders.length && !technicianRoster.unassignedOrders.length ? <p className="muted">{t.noDateJobs}</p> : null}

            <div className="admin-daily-roster">
              <section
                className={`dispatch-lane admin-technician-lane admin-unassigned-lane ${draggingOrderId ? 'lane-drop-target' : ''}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => rescheduleException('')}
              >
                <div className="dispatch-column-head">
                  <div>
                    <h3>{t.unassignedLane}</h3>
                    <p>{technicianRoster.unassignedOrders.length}</p>
                  </div>
                  {draggingOrderId ? <span>{t.dropHint}</span> : null}
                </div>

                <div className="lane-job-list">
                  {technicianRoster.unassignedOrders.length ? (
                    technicianRoster.unassignedOrders.map((order) => (
                      <article
                        className={`admin-task-row ${order.timing?.escalationLevel === 2 ? 'escalation-critical' : order.timing?.escalationLevel === 1 ? 'escalation-warning' : ''}`}
                        key={order.id}
                      >
                        <div className="admin-task-row-main">
                          <strong>
                            #{formatOrderNumber(order.id)} - {order.customerName}
                          </strong>
                          <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                          <p>
                            {t.taskMeta.location}: {order.region}
                          </p>
                          <p>
                            {t.taskMeta.time}: {order.scheduledTime || '—'}
                          </p>
                          <p>
                            {t.taskMeta.devices}: {getOrderDeviceCount(order)}
                          </p>
                          <small>
                            {t.standardTime}: {order.timing?.standardDurationMinutes || 0} min • {t.elapsedTime}:{' '}
                            {order.timing?.elapsedMinutes || 0} min
                          </small>
                        </div>
                        <div className="admin-task-row-controls">
                          <select
                            className="input compact-input"
                            value={order.technicianId || ''}
                            onChange={(event) => handleTechnicianChange(order, event.target.value)}
                          >
                            <option value="">{t.unassignedLane}</option>
                            {technicians.map((technician) => (
                              <option key={technician.id} value={technician.id}>
                                {technician.name}
                              </option>
                            ))}
                          </select>
                          <button className="btn-light" type="button" onClick={() => handleContactCustomer(order)}>
                            {t.contactCustomer}
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="muted">{t.noDateJobs}</p>
                  )}
                </div>
              </section>

              {technicianRoster.lanes.map((technician) => (
                <section
                  className={`dispatch-lane admin-technician-lane ${draggingOrderId ? 'lane-drop-target' : ''}`}
                  key={technician.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => rescheduleException(String(technician.id))}
                >
                  <div className="dispatch-column-head">
                    <div>
                      <h3>{technician.name}</h3>
                      <p>{technician.region || technician.zone || '—'}</p>
                    </div>
                    {draggingOrderId ? <span>{t.dropHint}</span> : <span>{technician.total}</span>}
                  </div>

                  <div className="admin-lane-metrics">
                    <article>
                      <strong>{technician.total}</strong>
                      <span>{t.laneMetrics.total}</span>
                    </article>
                    <article>
                      <strong>{technician.active}</strong>
                      <span>{t.laneMetrics.active}</span>
                    </article>
                    <article>
                      <strong>{technician.done}</strong>
                      <span>{t.laneMetrics.done}</span>
                    </article>
                  </div>

                  <div className="load-meter">
                    <div className="load-meter-top">
                      <span>{t.workload}</span>
                      <strong>{technician.loadPercent}%</strong>
                    </div>
                    <div className="load-meter-track">
                      <span style={{ width: `${technician.loadPercent}%` }} />
                    </div>
                  </div>

                  <div className="lane-job-list">
                    {technician.assignedOrders.length ? (
                      technician.assignedOrders.map((order) => (
                        <article
                          className={`admin-task-row ${order.timing?.escalationLevel === 2 ? 'escalation-critical' : order.timing?.escalationLevel === 1 ? 'escalation-warning' : ''}`}
                          key={order.id}
                        >
                          <div className="admin-task-row-main">
                            <div className="dispatch-job-top">
                              <strong>
                                #{formatOrderNumber(order.id)} - {order.customerName}
                              </strong>
                              <div className="task-badges">
                                <span className={`status-badge ${order.status}`}>{getOrderDisplayStatus(order, lang)}</span>
                                {order.zamilClosureStatus && order.zamilClosureStatus !== 'idle' ? (
                                  <span className={`close-stage-pill ${order.zamilClosureStatus}`}>
                                    {t.closeStatusLabels[order.zamilClosureStatus]}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                            <p>
                              {t.taskMeta.location}: {order.region}
                            </p>
                            <p>
                              {t.taskMeta.time}: {order.scheduledTime || '—'}
                            </p>
                            <p>
                              {t.taskMeta.devices}: {getOrderDeviceCount(order)}
                            </p>
                            <p>{order.workType || order.acType}</p>
                            <small>{order.approvalStatus === 'approved' ? t.proofApproved : t.proofPending}</small>
                            <small>
                              {t.standardTime}: {order.timing?.standardDurationMinutes || 0} min • {t.elapsedTime}:{' '}
                              {order.timing?.elapsedMinutes || 0} min
                            </small>

                            {order.latestAuditEntry ? (
                              <div className="audit-log-preview">
                                <span>{t.latestAudit}</span>
                                <strong>{order.latestAuditEntry.message}</strong>
                              </div>
                            ) : null}

                            {(order.auditLog || []).length ? (
                              <details className="audit-log-list">
                                <summary>{t.auditLog}</summary>
                                <div className="audit-log-body">
                                  {(order.auditLog || []).slice().reverse().map((entry) => (
                                    <article className="audit-log-item" key={entry.id || `${entry.createdAt}-${entry.message}`}>
                                      <strong>{entry.message}</strong>
                                      <small>{entry.actor}</small>
                                      <small>{entry.createdAt}</small>
                                    </article>
                                  ))}
                                </div>
                              </details>
                            ) : null}

                          </div>

                          <div className="admin-task-row-controls">
                            <select
                              className="input compact-input"
                              value={order.technicianId || ''}
                              onChange={(event) => handleTechnicianChange(order, event.target.value)}
                            >
                              <option value="">{t.unassignedLane}</option>
                              {technicians.map((entry) => (
                                <option key={entry.id} value={entry.id}>
                                  {entry.name}
                                </option>
                              ))}
                            </select>

                            <select
                              className="input compact-input"
                              value={order.status}
                              onChange={(event) => handleStatusChange(order, event.target.value)}
                            >
                              {Object.entries(t.statusOptions).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            <button className="btn-light" type="button" onClick={() => handleContactCustomer(order)}>
                              {t.contactCustomer}
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <p className="muted">{t.noDateJobs}</p>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
