import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { buildWhatsAppUrl, delayReasonOptions, formatSaudiPhoneDisplay, operationsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  getOperationalDate,
  getOrderDeliveryDate,
  getOrderDeviceCount,
  getOrderInstallationDate,
  getOrderPickupDate,
  getOrderPrimaryReference,
  getOrderTaskDate,
  isDeliveryOnlyTaskOrder,
  orderMatchesDailyTaskDate,
  nextDateString,
} from '../utils/internalOrders';

const copy = {
  en: {
    eyebrow: 'Field technician',
    title: 'Assigned tasks workspace',
    subtitle: 'Only the orders assigned to you appear here, with today and tomorrow grouped clearly.',
    loading: 'Loading assigned tasks...',
    today: 'Today tasks',
    tomorrow: 'Tomorrow tasks',
    myAccount: 'My account',
    noTasks: 'No assigned tasks in this section yet.',
    todayOrders: 'Today orders',
    todayDevices: 'Today devices',
    tomorrowOrders: 'Tomorrow orders',
    activeOrders: 'Active assigned orders',
    followUpJobs: 'Follow-up jobs',
    followUpHint: 'Unfinished assigned orders that are overdue, suspended, in transit, or waiting for closure.',
    followUpEmpty: 'No follow-up jobs need action right now.',
    followUpReason: 'Follow-up reason',
    overdueJob: 'Overdue task date',
    supportPending: 'Support request pending',
    closurePending: 'Closure pending',
    selectedTask: 'Selected task',
    customer: 'Customer',
    reference: 'Reference',
    city: 'City',
    district: 'District',
    address: 'Address',
    notes: 'Notes',
    scheduledSlot: 'Scheduled slot',
    preferredSlot: 'Preferred slot',
    devices: 'Devices',
    status: 'Status',
    availability: 'Availability',
    openMap: 'Map',
    whatsapp: 'WhatsApp',
    call: 'Call',
    startRoute: 'In transit',
    markCompleted: 'Mark completed',
    reschedule: 'Request reschedule',
    updating: 'Updating...',
    availabilitySaved: 'Availability updated.',
    statusSaved: 'Task updated.',
    attentionLine: 'Tap any task card to open its details.',
    available: 'Available',
    busy: 'Busy',
    noSelection: 'Choose a task to view its full details.',
    allTasks: 'All tasks',
    quickActions: 'Quick actions',
    accountHint: 'Keep your availability updated so the operations manager can distribute tasks correctly.',
    openDetails: 'Open full details',
    selectedTaskLabel: 'Current task',
    routeCount: 'Stops',
    workflowTitle: 'Task progress',
    assignedStage: 'Assigned',
    transitStage: 'On the way',
    completeStage: 'Completed',
    suspendedStage: 'Needs review',
    proofStatus: 'Proof status',
    zamilStatus: 'Zamil close',
    taskType: 'Task type',
    taskDate: 'Task date',
    deliveryOnly: 'Delivery only',
    installationTask: 'Installation task',
    supportTitle: 'Need help from operations?',
    supportHint: 'Send a structured reschedule request with a reason so the operations manager can act quickly.',
    supportReasonLabel: 'Reason',
    supportNoteLabel: 'Extra note',
    supportNotePlaceholder: 'Explain what is blocking the task or what you need from operations.',
    sendSupportRequest: 'Send support request',
    supportSaved: 'Support request sent to operations.',
    quickStatusTitle: 'Fast update',
    closureTitle: 'Task closure',
    closureHint: 'Upload at least one proof photo, then request the Zamil closure flow from the same task.',
    proofPhotos: 'Proof photos',
    uploadProof: 'Upload proof photo',
    uploadingProof: 'Uploading proof...',
    closureNoteLabel: 'Completion note',
    closureNotePlaceholder: 'Write a short note about what was completed at the site.',
    closureDelayReasonLabel: 'Delay reason',
    closureDelayNoteLabel: 'Delay note',
    closureDelayNotePlaceholder: 'Add any note if the task took longer than expected.',
    requestClosure: 'Request Zamil OTP',
    requestingClosure: 'Requesting...',
    otpLabel: 'OTP code',
    otpPlaceholder: 'Enter OTP after receiving it',
    submitOtp: 'Submit OTP',
    submittingOtp: 'Submitting...',
    proofUploaded: 'Proof photo uploaded.',
    closureRequested: 'Closure request sent.',
    otpSubmitted: 'OTP sent successfully.',
    proofEmpty: 'No proof photos uploaded yet.',
    photoHint: 'Use the phone camera or a saved image. The photo will be optimized before upload.',
    closureLocked: 'This task is waiting for review or already closed.',
    zamilRequested: 'OTP requested',
    zamilSubmitted: 'OTP submitted',
    zamilClosed: 'Closure approved',
  },
  ar: {
    eyebrow: 'الفني الميداني',
    title: 'لوحة المهام المسندة لك',
    subtitle: 'لن تظهر هنا إلا الطلبات المسندة لك فقط، مع فصل واضح بين مهام اليوم ومهام الغد.',
    loading: 'جارٍ تحميل المهام المسندة...',
    today: 'مهام اليوم',
    tomorrow: 'مهام الغد',
    myAccount: 'حسابي',
    noTasks: 'لا توجد مهام مسندة في هذا القسم حالياً.',
    todayOrders: 'طلبات اليوم',
    todayDevices: 'أجهزة اليوم',
    tomorrowOrders: 'طلبات الغد',
    activeOrders: 'إجمالي الطلبات المسندة',
    followUpJobs: 'متابعة الطلبات',
    followUpHint: 'طلباتك غير المنتهية التي فات تاريخها أو تحتاج دعمًا أو تنتظر إغلاق الزامل.',
    followUpEmpty: 'لا توجد طلبات متابعة تحتاج إجراء الآن.',
    followUpReason: 'سبب المتابعة',
    overdueJob: 'تاريخ المهمة فائت',
    supportPending: 'طلب دعم بانتظار المتابعة',
    closurePending: 'الإغلاق بانتظار الإكمال',
    selectedTask: 'الطلب المحدد',
    customer: 'العميل',
    reference: 'المرجع',
    city: 'المدينة',
    district: 'الحي',
    address: 'العنوان',
    notes: 'الملاحظات',
    scheduledSlot: 'الموعد المنسق',
    preferredSlot: 'الموعد المفضل',
    devices: 'الأجهزة',
    status: 'الحالة',
    availability: 'التوفر',
    openMap: 'الخريطة',
    whatsapp: 'واتساب',
    call: 'اتصال',
    startRoute: 'في الطريق',
    markCompleted: 'تعليم كمكتمل',
    reschedule: 'طلب إعادة جدولة',
    updating: 'جارٍ التحديث...',
    availabilitySaved: 'تم تحديث حالة التوفر.',
    statusSaved: 'تم تحديث المهمة.',
    attentionLine: 'اضغط على أي بطاقة طلب لفتح التفاصيل كاملة.',
    available: 'متاح',
    busy: 'مشغول',
    noSelection: 'اختر طلبًا من القائمة لعرض كل تفاصيله.',
    allTasks: 'كل المهام',
    quickActions: 'إجراءات سريعة',
    accountHint: 'حدّث حالة التوفر أولاً بأول حتى يعرف مدير العمليات توزيع المهام بشكل صحيح.',
    openDetails: 'فتح التفاصيل',
    selectedTaskLabel: 'المهمة الحالية',
    routeCount: 'المشوار',
    workflowTitle: 'مسار المهمة',
    assignedStage: 'تم الإسناد',
    transitStage: 'في الطريق',
    completeStage: 'مكتمل',
    suspendedStage: 'تحتاج مراجعة',
    proofStatus: 'حالة الإثبات',
    zamilStatus: 'إغلاق الزامل',
    taskType: 'نوع المهمة',
    taskDate: 'تاريخ المهمة',
    deliveryOnly: 'توصيل فقط',
    installationTask: 'تركيب',
    supportTitle: 'هل تحتاج دعمًا من العمليات؟',
    supportHint: 'أرسل طلب إعادة جدولة أو دعم بسبب واضح حتى يستطيع مدير العمليات التصرف بسرعة.',
    supportReasonLabel: 'السبب',
    supportNoteLabel: 'ملاحظة إضافية',
    supportNotePlaceholder: 'اكتب ما الذي يعيق تنفيذ المهمة أو ما الذي تحتاجه من مدير العمليات.',
    sendSupportRequest: 'إرسال طلب الدعم',
    supportSaved: 'تم إرسال طلب الدعم إلى مدير العمليات.',
    quickStatusTitle: 'تحديث سريع',
    closureTitle: 'إغلاق المهمة',
    closureHint: 'ارفع صورة إثبات واحدة على الأقل، ثم ابدأ طلب إغلاق الزامل من نفس المهمة.',
    proofPhotos: 'صور الإثبات',
    uploadProof: 'رفع صورة إثبات',
    uploadingProof: 'جارٍ رفع الإثبات...',
    closureNoteLabel: 'ملاحظة الإنجاز',
    closureNotePlaceholder: 'اكتب ملاحظة قصيرة عما تم إنجازه في الموقع.',
    closureDelayReasonLabel: 'سبب التأخير',
    closureDelayNoteLabel: 'ملاحظة التأخير',
    closureDelayNotePlaceholder: 'أضف ملاحظة إذا استغرقت المهمة وقتًا أطول من المتوقع.',
    requestClosure: 'طلب OTP من الزامل',
    requestingClosure: 'جارٍ الطلب...',
    otpLabel: 'رمز OTP',
    otpPlaceholder: 'أدخل رمز OTP بعد استلامه',
    submitOtp: 'إرسال OTP',
    submittingOtp: 'جارٍ الإرسال...',
    proofUploaded: 'تم رفع صورة الإثبات.',
    closureRequested: 'تم إرسال طلب الإغلاق.',
    otpSubmitted: 'تم إرسال OTP بنجاح.',
    proofEmpty: 'لا توجد صور إثبات مرفوعة حتى الآن.',
    photoHint: 'استخدم كاميرا الجوال أو صورة محفوظة، وسيتم تحسينها قبل الرفع.',
    closureLocked: 'هذه المهمة بانتظار المراجعة أو أُغلقت بالفعل.',
    zamilRequested: 'تم طلب OTP',
    zamilSubmitted: 'تم إرسال OTP',
    zamilClosed: 'تم اعتماد الإغلاق',
  },
};

const availabilityOptions = [
  { value: 'available', labelKey: 'available' },
  { value: 'busy', labelKey: 'busy' },
];

const sortAssignedOrders = (left, right) =>
  `${getOrderTaskDate(left) || ''} ${left.scheduledTime || left.preferredTime || ''} ${left.city || ''} ${left.district || ''}`.localeCompare(
    `${getOrderTaskDate(right) || ''} ${right.scheduledTime || right.preferredTime || ''} ${right.city || ''} ${right.district || ''}`,
    'ar'
  );

const formatSlot = (dateValue, timeValue) => [dateValue, timeValue].filter(Boolean).join(' - ') || '—';
const formatStatusChipLabel = (value, fallback = '—') => String(value || fallback).replace(/_/g, ' ');
const getTaskTypeLabel = (order, t) => (isDeliveryOnlyTaskOrder(order) ? t.deliveryOnly : t.installationTask);
const getTaskDateLabel = (order) => getOrderTaskDate(order) || getOrderDeliveryDate(order) || getOrderPickupDate(order) || getOrderInstallationDate(order) || '—';
const getStatusTone = (status) => {
  const normalized = String(status || '').trim();
  if (['completed'].includes(normalized)) {
    return 'success';
  }
  if (['in_transit', 'in_progress'].includes(normalized)) {
    return 'info';
  }
  if (['rescheduled', 'canceled'].includes(normalized)) {
    return 'warning';
  }
  return 'default';
};

const buildProgressSteps = (order, t) => {
  const status = String(order?.status || '').trim();
  return [
    {
      key: 'assigned',
      label: t.assignedStage,
      active: ['pending', 'scheduled', 'in_transit', 'completed', 'suspended'].includes(status),
    },
    {
      key: 'transit',
      label: t.transitStage,
      active: ['in_transit', 'completed'].includes(status),
    },
    {
      key: 'completed',
      label: status === 'suspended' ? t.suspendedStage : t.completeStage,
      active: ['completed', 'suspended'].includes(status),
    },
  ];
};

const getAvailableQuickActions = (order) => {
  const status = String(order?.status || '').trim();
  const actions = [];

  if (!['in_transit', 'completed'].includes(status)) {
    actions.push({ value: 'in_transit', labelKey: 'startRoute', variant: 'secondary' });
  }

  if (status !== 'completed') {
    actions.push({ value: 'completed', labelKey: 'markCompleted', variant: 'primary' });
  }

  if (!['completed', 'canceled', 'suspended'].includes(status)) {
    actions.push({ value: 'rescheduled', labelKey: 'reschedule', variant: 'light' });
  }

  return actions;
};

const getFollowUpReasonLabel = (order, operationalDate, t) => {
  const status = String(order?.status || '').trim();
  const zamilStatus = String(order?.zamilClosureStatus || '').trim();
  const taskDate = getOrderTaskDate(order);

  if (status === 'suspended' || status === 'rescheduled') {
    return t.supportPending;
  }
  if (['requested', 'otp_submitted'].includes(zamilStatus)) {
    return t.closurePending;
  }
  if (taskDate && operationalDate && taskDate < operationalDate) {
    return t.overdueJob;
  }
  if (status === 'in_transit') {
    return t.startRoute;
  }
  return t.followUpJobs;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });

const optimizeImageFile = async (file, maxDimension = 1600, quality = 0.78) => {
  if (!file || !String(file.type || '').startsWith('image/')) {
    return fileToDataUrl(file);
  }

  const sourceDataUrl = await fileToDataUrl(file);
  const image = await new Promise((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error('Unable to process image'));
    nextImage.src = sourceDataUrl;
  });

  const width = Number(image.width) || 0;
  const height = Number(image.height) || 0;
  if (!width || !height || typeof document === 'undefined') {
    return sourceDataUrl;
  }

  const ratio = Math.min(1, maxDimension / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const context = canvas.getContext('2d');
  if (!context) {
    return sourceDataUrl;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
};

const getClosureStateLabel = (status, t) => {
  const normalized = String(status || 'idle').trim();
  if (normalized === 'requested') {
    return t.zamilRequested;
  }
  if (normalized === 'otp_submitted') {
    return t.zamilSubmitted;
  }
  if (normalized === 'closed') {
    return t.zamilClosed;
  }
  return formatStatusChipLabel(normalized, 'idle');
};

const safeOpen = (targetUrl) => {
  if (!targetUrl || typeof window === 'undefined') {
    return;
  }
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
};

export default function TechnicianWorkspace() {
  const { user } = useAuth();
  const { lang, isRTL } = useLang();
  const navigate = useNavigate();
  const { viewKey = '' } = useParams();
  const t = copy[lang] || copy.en;
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
  const [supportReason, setSupportReason] = useState('');
  const [supportNote, setSupportNote] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [requestingClosure, setRequestingClosure] = useState(false);
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [closureNote, setClosureNote] = useState('');
  const [closureDelayReason, setClosureDelayReason] = useState('');
  const [closureDelayNote, setClosureDelayNote] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const operationalDate = getOperationalDate();
  const tomorrowDate = nextDateString(operationalDate);
  const detailPanelRef = useRef(null);

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        const response = await operationsService.getTechnicianOrders(user?.technicianId);
        setPayload(response.data || null);
      } catch (error) {
        if (!silent) {
          toast.error(error?.response?.data?.message || error.message || 'Unable to load technician workspace');
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };

    load();
    const onUpdate = () => load(true);
    window.addEventListener('operations-updated', onUpdate);
    window.addEventListener('operations-date-updated', onUpdate);
    return () => {
      window.removeEventListener('operations-updated', onUpdate);
      window.removeEventListener('operations-date-updated', onUpdate);
    };
  }, [user?.technicianId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncViewport = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const technician = payload?.technician || user?.technician || null;
  const orders = useMemo(() => (payload?.orders || []).filter((order) => !['canceled'].includes(String(order.status || '').trim())), [payload]);
  const activeOrders = useMemo(
    () => orders.filter((order) => !['completed', 'canceled'].includes(String(order.status || '').trim())).sort(sortAssignedOrders),
    [orders]
  );
  const todayOrders = useMemo(
    () => activeOrders.filter((order) => orderMatchesDailyTaskDate(order, operationalDate)),
    [activeOrders, operationalDate]
  );
  const tomorrowOrders = useMemo(
    () => activeOrders.filter((order) => orderMatchesDailyTaskDate(order, tomorrowDate)),
    [activeOrders, tomorrowDate]
  );
  const followUpOrders = useMemo(
    () =>
      activeOrders.filter((order) => {
        const status = String(order.status || '').trim();
        const zamilStatus = String(order.zamilClosureStatus || '').trim();
        const taskDate = getOrderTaskDate(order);
        return (
          ['suspended', 'rescheduled', 'in_transit'].includes(status) ||
          ['requested', 'otp_submitted'].includes(zamilStatus) ||
          (taskDate && taskDate < operationalDate)
        );
      }),
    [activeOrders, operationalDate]
  );
  const activeSectionKey = ['today', 'tomorrow', 'follow-up', 'account'].includes(String(viewKey || '').trim()) ? String(viewKey).trim() : 'overview';
  const visibleOrders =
    activeSectionKey === 'today'
      ? todayOrders
      : activeSectionKey === 'tomorrow'
        ? tomorrowOrders
        : activeSectionKey === 'follow-up'
          ? followUpOrders
          : activeOrders;
  const todayDevices = useMemo(() => todayOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0), [todayOrders]);

  useEffect(() => {
    const availablePool = visibleOrders.length ? visibleOrders : activeOrders;
    const nextSelected = availablePool.find((order) => String(order.id) === String(selectedOrderId)) || availablePool[0] || null;
    setSelectedOrderId(nextSelected ? String(nextSelected.id) : '');
  }, [activeOrders, selectedOrderId, visibleOrders]);

  const selectedOrder =
    visibleOrders.find((order) => String(order.id) === String(selectedOrderId)) ||
    activeOrders.find((order) => String(order.id) === String(selectedOrderId)) ||
    null;
  const selectedReference = selectedOrder ? getOrderPrimaryReference(selectedOrder) : '—';
  const selectedProgressSteps = useMemo(() => buildProgressSteps(selectedOrder, t), [selectedOrder, t]);
  const selectedQuickActions = useMemo(() => getAvailableQuickActions(selectedOrder), [selectedOrder]);
  const tabCounts = {
    overview: activeOrders.length,
    today: todayOrders.length,
    tomorrow: tomorrowOrders.length,
    followUp: followUpOrders.length,
  };
  const tabs = [
    { key: 'overview', label: t.allTasks, count: tabCounts.overview, path: '/technician' },
    { key: 'today', label: t.today, count: tabCounts.today, path: '/technician/today' },
    { key: 'tomorrow', label: t.tomorrow, count: tabCounts.tomorrow, path: '/technician/tomorrow' },
    { key: 'follow-up', label: t.followUpJobs, count: tabCounts.followUp, path: '/technician/follow-up' },
    { key: 'account', label: t.myAccount, count: null, path: '/technician/account' },
  ];

  const replaceOrder = (nextOrder) => {
    if (!nextOrder?.id) {
      return;
    }
    setPayload((current) => ({
      ...(current || {}),
      orders: (current?.orders || []).map((order) => (String(order.id) === String(nextOrder.id) ? nextOrder : order)),
    }));
  };

  const handleStatusUpdate = async (order, status) => {
    try {
      setUpdatingOrderId(String(order.id));
      const response = await operationsService.updateTechnicianStatus(order.id, status);
      const nextOrder = response.data?.order || order;
      replaceOrder(nextOrder);
      setSelectedOrderId(String(nextOrder.id));
      toast.success(t.statusSaved);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t.updating);
    } finally {
      setUpdatingOrderId('');
    }
  };

  const handleAvailabilityChange = async (nextStatus) => {
    if (!technician?.id) {
      return;
    }
    try {
      setSavingAvailability(true);
      const response = await operationsService.updateTechnicianAvailability(technician.id, nextStatus);
      const nextTechnician = response.data?.technician || technician;
      setPayload((current) => ({
        ...(current || {}),
        technician: nextTechnician,
      }));
      toast.success(t.availabilitySaved);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t.updating);
    } finally {
      setSavingAvailability(false);
    }
  };

  useEffect(() => {
    setSupportReason(selectedOrder?.suspensionReason || '');
    setSupportNote(selectedOrder?.suspensionNote || '');
    setClosureNote(selectedOrder?.completionNote || '');
    setClosureDelayReason(selectedOrder?.delayReason || '');
    setClosureDelayNote(selectedOrder?.delayNote || '');
    setOtpCode(selectedOrder?.zamilOtpCode || '');
  }, [
    selectedOrder?.id,
    selectedOrder?.suspensionReason,
    selectedOrder?.suspensionNote,
    selectedOrder?.completionNote,
    selectedOrder?.delayReason,
    selectedOrder?.delayNote,
    selectedOrder?.zamilOtpCode,
  ]);

  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(String(orderId));
    if (isMobile && detailPanelRef.current) {
      window.setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleSupportRequest = async () => {
    if (!selectedOrder?.id) {
      return;
    }

    if (!supportReason.trim()) {
      toast.error(lang === 'ar' ? 'اختر سبب طلب الدعم أولاً.' : 'Choose a support reason first.');
      return;
    }

    try {
      setUpdatingOrderId(String(selectedOrder.id));
      const response = await operationsService.updateTechnicianStatus(selectedOrder.id, 'rescheduled', {
        suspensionReason: supportReason,
        suspensionNote: supportNote.trim(),
      });
      const nextOrder = response.data?.order || selectedOrder;
      replaceOrder(nextOrder);
      setSelectedOrderId(String(nextOrder.id));
      toast.success(t.supportSaved);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t.updating);
    } finally {
      setUpdatingOrderId('');
    }
  };

  const handleProofUpload = async (file) => {
    if (!selectedOrder?.id || !file) {
      return;
    }

    try {
      setUploadingProof(true);
      const optimizedDataUrl = await optimizeImageFile(file);
      const response = await operationsService.uploadPhoto(selectedOrder.id, {
        name: file.name || `proof-${Date.now()}.jpg`,
        url: optimizedDataUrl,
      });
      const nextOrder = response.data?.order || selectedOrder;
      replaceOrder(nextOrder);
      setSelectedOrderId(String(nextOrder.id));
      toast.success(t.proofUploaded);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t.updating);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleRequestClosure = async () => {
    if (!selectedOrder?.id) {
      return;
    }

    try {
      setRequestingClosure(true);
      const response = await operationsService.requestClosure(selectedOrder.id, {
        completionNote: closureNote.trim(),
        delayReason: closureDelayReason.trim(),
        delayNote: closureDelayNote.trim(),
      });
      const nextOrder = response.data?.order || selectedOrder;
      replaceOrder(nextOrder);
      setSelectedOrderId(String(nextOrder.id));
      toast.success(t.closureRequested);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t.updating);
    } finally {
      setRequestingClosure(false);
    }
  };

  const handleSubmitOtp = async () => {
    if (!selectedOrder?.id || !otpCode.trim()) {
      toast.error(lang === 'ar' ? 'أدخل رمز OTP أولاً.' : 'Enter the OTP code first.');
      return;
    }

    try {
      setSubmittingOtp(true);
      const response = await operationsService.submitClosureOtp(selectedOrder.id, otpCode.trim());
      const nextOrder = response.data?.order || selectedOrder;
      replaceOrder(nextOrder);
      setSelectedOrderId(String(nextOrder.id));
      setOtpCode(nextOrder.zamilOtpCode || otpCode.trim());
      toast.success(t.otpSubmitted);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t.updating);
    } finally {
      setSubmittingOtp(false);
    }
  };

  if (loading) {
    return (
      <section className="page-shell technician-app-shell" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="card">{t.loading}</div>
      </section>
    );
  }

  return (
    <section className="page-shell technician-app-shell" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="section-card technician-simple-shell">
        <header className="technician-app-header technician-simple-header">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="muted">{t.subtitle}</p>
          </div>
          <div className="technician-simple-summary">
            <button
              className={`tech-summary-card interactive-summary-card${activeSectionKey === 'today' ? ' is-active' : ''}`}
              onClick={() => navigate('/technician/today')}
              type="button"
            >
              <span>{t.todayOrders}</span>
              <strong>{todayOrders.length}</strong>
              <small>{t.attentionLine}</small>
            </button>
            <button
              className={`tech-summary-card attention interactive-summary-card${activeSectionKey === 'overview' ? ' is-active' : ''}`}
              onClick={() => navigate('/technician')}
              type="button"
            >
              <span>{t.todayDevices}</span>
              <strong>{todayDevices}</strong>
              <small>{operationalDate}</small>
            </button>
            <button
              className={`tech-summary-card success interactive-summary-card${activeSectionKey === 'tomorrow' ? ' is-active' : ''}`}
              onClick={() => navigate('/technician/tomorrow')}
              type="button"
            >
              <span>{t.tomorrowOrders}</span>
              <strong>{tomorrowOrders.length}</strong>
              <small>{tomorrowDate}</small>
            </button>
            <button
              className={`tech-summary-card follow-up interactive-summary-card${activeSectionKey === 'follow-up' ? ' is-active' : ''}`}
              onClick={() => navigate('/technician/follow-up')}
              type="button"
            >
              <span>{t.followUpJobs}</span>
              <strong>{followUpOrders.length}</strong>
              <small>{t.followUpHint}</small>
            </button>
            <button
              className={`tech-summary-card interactive-summary-card${activeSectionKey === 'account' ? ' is-active' : ''}`}
              onClick={() => navigate('/technician/account')}
              type="button"
            >
              <span>{t.activeOrders}</span>
              <strong>{activeOrders.length}</strong>
              <small>{technician?.name || user?.name}</small>
            </button>
          </div>
        </header>

        {selectedOrder ? (
          <section className="section-card technician-focus-strip">
            <div>
              <span className="muted">{t.selectedTaskLabel}</span>
              <strong>{selectedReference}</strong>
              <p className="muted">{selectedOrder.customerName || '—'}</p>
            </div>
            <div className="technician-focus-actions">
              <button className="btn-light" type="button" onClick={() => safeOpen(selectedOrder.mapLink)}>
                {t.openMap}
              </button>
              <button className="btn-light" type="button" onClick={() => safeOpen(buildWhatsAppUrl(selectedOrder.whatsappPhone || selectedOrder.phone))}>
                {t.whatsapp}
              </button>
            </div>
          </section>
        ) : null}

        <div className="technician-workspace ops-form-grid">
          <div className="today-column section-card" id={activeSectionKey === 'tomorrow' ? 'tomorrow' : 'today'}>
            <div className="task-detail-head">
              <div>
                <h3>
                  {activeSectionKey === 'tomorrow'
                    ? t.tomorrow
                    : activeSectionKey === 'follow-up'
                      ? t.followUpJobs
                      : activeSectionKey === 'account'
                        ? t.myAccount
                        : t.today}
                </h3>
                <p className="muted">
                  {activeSectionKey === 'tomorrow' ? tomorrowDate : activeSectionKey === 'follow-up' ? t.followUpHint : operationalDate}
                </p>
              </div>
            </div>

            {activeSectionKey === 'account' ? (
              <div className="technician-simple-grid">
                <article className="section-card technician-simple-card">
                  <div className="technician-simple-card-head">
                    <strong>{technician?.name || user?.name}</strong>
                    <span className={`status-badge ${technician?.status || 'available'}`}>{t[technician?.status || 'available'] || technician?.status}</span>
                  </div>
                  <p className="muted">{t.accountHint}</p>
                  <div className="technician-simple-meta">
                    <p>
                      <span>{t.myAccount}</span>
                      <strong>{user?.email || '—'}</strong>
                    </p>
                    <p>
                      <span>{t.availability}</span>
                      <strong>{technician?.region || technician?.zone || '—'}</strong>
                    </p>
                  </div>
                  <div className="technician-simple-actions">
                    <select
                      className="input"
                      disabled={savingAvailability}
                      value={technician?.status || 'available'}
                      onChange={(event) => handleAvailabilityChange(event.target.value)}
                    >
                      {availabilityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t[option.labelKey]}
                        </option>
                      ))}
                    </select>
                    {technician?.phone ? (
                      <button className="btn-light" type="button" onClick={() => safeOpen(`tel:${technician.phone}`)}>
                        {t.call}
                      </button>
                    ) : (
                      <button className="btn-light" disabled type="button">
                        {t.call}
                      </button>
                    )}
                  </div>
                </article>
              </div>
            ) : visibleOrders.length ? (
              <div className="technician-simple-grid">
                {visibleOrders.map((order) => (
                  <article
                    className={`tech-job-card ${order.status || 'pending'}${String(selectedOrderId) === String(order.id) ? ' selected' : ''}`}
                    key={order.id}
                  >
                    <button className="tech-job-select" onClick={() => handleSelectOrder(order.id)} type="button">
                      <div className="tech-job-top">
                        <div className="tech-job-title">
                          <strong>{order.customerName || '—'}</strong>
                          <small>{getOrderPrimaryReference(order)}</small>
                        </div>
                        <span className={`status-badge ${order.status || 'pending'} ${getStatusTone(order.status)}`}>{order.statusLabel || order.status}</span>
                      </div>
                      <div className="tech-job-route-line">
                        <span>{t.scheduledSlot}: {formatSlot(order.scheduledDate, order.scheduledTime)}</span>
                        <span>{t.routeCount}: {[order.district, order.city].filter(Boolean).join(' - ') || '—'}</span>
                      </div>
                      <div className="tech-job-meta-grid">
                        <span>{t.devices}: {getOrderDeviceCount(order)}</span>
                        <span>{t.status}: {order.statusLabel || order.status || '—'}</span>
                        <span>{t.taskType}: {getTaskTypeLabel(order, t)}</span>
                        <span>{t.taskDate}: {getTaskDateLabel(order)}</span>
                        {activeSectionKey === 'follow-up' ? (
                          <span>{t.followUpReason}: {getFollowUpReasonLabel(order, operationalDate, t)}</span>
                        ) : null}
                      </div>
                      <span className="tech-job-open-hint">{t.openDetails}</span>
                    </button>
                    <div className="tech-job-inline-actions">
                      <button className="btn-light" onClick={() => safeOpen(order.mapLink)} type="button">
                        {t.openMap}
                      </button>
                      <button className="btn-light" onClick={() => safeOpen(buildWhatsAppUrl(order.whatsappPhone || order.phone))} type="button">
                        {t.whatsapp}
                      </button>
                      <button className="btn-light" onClick={() => safeOpen(`tel:${order.phone || ''}`)} type="button">
                        {t.call}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="section-card tech-empty-state">{activeSectionKey === 'follow-up' ? t.followUpEmpty : t.noTasks}</div>
            )}
          </div>

          <div className="task-detail-panel section-card" id="account" ref={detailPanelRef}>
            <div className="task-detail-head">
              <div>
                <h3>{t.selectedTask}</h3>
                <p className="muted">{selectedOrder ? t.attentionLine : t.noSelection}</p>
              </div>
            </div>

            {selectedOrder ? (
              <div className="task-detail-stack">
                <article className="detail-card">
                  <div className="task-detail-grid">
                    <p>
                      <span>{t.customer}</span>
                      <strong>{selectedOrder.customerName || '—'}</strong>
                    </p>
                    <p>
                      <span>{t.reference}</span>
                      <strong>{getOrderPrimaryReference(selectedOrder)}</strong>
                    </p>
                    <p>
                      <span>{t.city}</span>
                      <strong>{selectedOrder.city || '—'}</strong>
                    </p>
                    <p>
                      <span>{t.district}</span>
                      <strong>{selectedOrder.district || '—'}</strong>
                    </p>
                    <p>
                      <span>{t.taskType}</span>
                      <strong>{getTaskTypeLabel(selectedOrder, t)}</strong>
                    </p>
                    <p>
                      <span>{t.taskDate}</span>
                      <strong>{getTaskDateLabel(selectedOrder)}</strong>
                    </p>
                    <p>
                      <span>{t.scheduledSlot}</span>
                      <strong>{formatSlot(selectedOrder.scheduledDate, selectedOrder.scheduledTime)}</strong>
                    </p>
                    <p>
                      <span>{t.preferredSlot}</span>
                      <strong>{formatSlot(selectedOrder.preferredDate, selectedOrder.preferredTime)}</strong>
                    </p>
                    <p>
                      <span>{t.devices}</span>
                      <strong>{getOrderDeviceCount(selectedOrder)}</strong>
                    </p>
                    <p>
                      <span>{t.status}</span>
                      <strong>{selectedOrder.statusLabel || selectedOrder.status || '—'}</strong>
                    </p>
                  </div>
                </article>

                <article className="detail-card technician-progress-panel">
                  <div className="task-detail-head compact">
                    <div>
                      <h4>{t.workflowTitle}</h4>
                      <p className="muted">{selectedReference}</p>
                    </div>
                  </div>
                  <div className="status-rail compact-status-rail">
                    {selectedProgressSteps.map((step, index) => (
                      <div className={`status-step${step.active ? ' active' : ''}`} key={step.key}>
                        <span>{index + 1}</span>
                        <strong>{step.label}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="task-status-chip-row">
                    <div className="task-status-chip">
                      <span>{t.status}</span>
                      <strong>{selectedOrder.statusLabel || selectedOrder.status || '—'}</strong>
                    </div>
                    <div className="task-status-chip">
                      <span>{t.proofStatus}</span>
                      <strong>{formatStatusChipLabel(selectedOrder.proofStatus)}</strong>
                    </div>
                    <div className="task-status-chip">
                      <span>{t.zamilStatus}</span>
                      <strong>{formatStatusChipLabel(selectedOrder.zamilClosureStatus)}</strong>
                    </div>
                  </div>
                </article>

                <article className="detail-card">
                  <div className="technician-simple-meta">
                    <p>
                      <span>{t.address}</span>
                      <strong>{selectedOrder.addressText || selectedOrder.address || selectedOrder.mapLink || '—'}</strong>
                    </p>
                    <p>
                      <span>{t.notes}</span>
                      <strong>{selectedOrder.notes || selectedOrder.coordinationNote || '—'}</strong>
                    </p>
                  </div>
                </article>

                <article className="detail-card quick-action-card">
                  <div className="task-detail-head compact">
                    <div>
                      <h4>{t.quickStatusTitle}</h4>
                      <p className="muted">{selectedReference}</p>
                    </div>
                  </div>
                  <div className="technician-simple-actions task-quick-grid">
                    <button className="btn-light" type="button" onClick={() => safeOpen(selectedOrder.mapLink)}>
                      {t.openMap}
                    </button>
                    <button className="btn-light" type="button" onClick={() => safeOpen(buildWhatsAppUrl(selectedOrder.whatsappPhone || selectedOrder.phone))}>
                      {t.whatsapp}
                    </button>
                    <button className="btn-light" type="button" onClick={() => safeOpen(`tel:${selectedOrder.phone || ''}`)}>
                      {t.call}
                    </button>
                  </div>
                </article>

                <div className="technician-simple-actions task-quick-grid">
                  {selectedQuickActions.map((option) => (
                    <button
                      className={option.variant === 'primary' ? 'btn-primary' : option.variant === 'light' ? 'btn-light' : 'btn-secondary'}
                      disabled={updatingOrderId === String(selectedOrder.id)}
                      key={option.value}
                      onClick={() => handleStatusUpdate(selectedOrder, option.value)}
                      type="button"
                    >
                      {updatingOrderId === String(selectedOrder.id) ? t.updating : t[option.labelKey]}
                    </button>
                  ))}
                </div>

                {!['completed', 'canceled'].includes(String(selectedOrder.status || '').trim()) ? (
                  <article className="detail-card support-request-panel">
                    <div className="task-detail-head compact">
                      <div>
                        <h4>{t.supportTitle}</h4>
                        <p className="muted">{t.supportHint}</p>
                      </div>
                    </div>
                    <div className="support-request-grid">
                      <label className="field">
                        <span className="field-label">{t.supportReasonLabel}</span>
                        <select className="input" value={supportReason} onChange={(event) => setSupportReason(event.target.value)}>
                          <option value="">{lang === 'ar' ? 'اختر السبب' : 'Choose reason'}</option>
                          {delayReasonOptions.map((option) => (
                            <option key={option.value} value={lang === 'ar' ? option.arLabel : option.label}>
                              {lang === 'ar' ? option.arLabel : option.label}
                            </option>
                          ))}
                          <option value={lang === 'ar' ? 'احتياج دعم من مدير العمليات' : 'Need operations manager support'}>
                            {lang === 'ar' ? 'احتياج دعم من مدير العمليات' : 'Need operations manager support'}
                          </option>
                        </select>
                      </label>
                      <label className="field">
                        <span className="field-label">{t.supportNoteLabel}</span>
                        <textarea
                          className="input"
                          placeholder={t.supportNotePlaceholder}
                          rows={3}
                          value={supportNote}
                          onChange={(event) => setSupportNote(event.target.value)}
                        />
                      </label>
                    </div>
                    <button
                      className="btn-secondary"
                      disabled={updatingOrderId === String(selectedOrder.id)}
                      type="button"
                      onClick={handleSupportRequest}
                    >
                      {updatingOrderId === String(selectedOrder.id) ? t.updating : t.sendSupportRequest}
                    </button>
                  </article>
                ) : null}

                <article className="detail-card closure-flow-panel">
                  <div className="task-detail-head compact">
                    <div>
                      <h4>{t.closureTitle}</h4>
                      <p className="muted">{t.closureHint}</p>
                    </div>
                  </div>

                  <div className="task-status-chip-row">
                    <div className="task-status-chip">
                      <span>{t.proofPhotos}</span>
                      <strong>{Array.isArray(selectedOrder.photos) ? selectedOrder.photos.length : 0}</strong>
                    </div>
                    <div className="task-status-chip">
                      <span>{t.proofStatus}</span>
                      <strong>{formatStatusChipLabel(selectedOrder.proofStatus)}</strong>
                    </div>
                    <div className="task-status-chip">
                      <span>{t.zamilStatus}</span>
                      <strong>{getClosureStateLabel(selectedOrder.zamilClosureStatus, t)}</strong>
                    </div>
                  </div>

                  <div className="closure-uploader-row">
                    <label className="btn-light ops-file-label closure-file-label">
                      <input
                        accept="image/*"
                        capture="environment"
                        hidden
                        type="file"
                        onChange={(event) => {
                          const nextFile = event.target.files?.[0] || null;
                          handleProofUpload(nextFile);
                          event.target.value = '';
                        }}
                      />
                      {uploadingProof ? t.uploadingProof : t.uploadProof}
                    </label>
                    <p className="muted">{t.photoHint}</p>
                  </div>

                  {Array.isArray(selectedOrder.photos) && selectedOrder.photos.length ? (
                    <div className="proof-photo-grid">
                      {selectedOrder.photos.map((photo) => (
                        <a className="proof-photo-card" href={photo.url} key={photo.id} rel="noreferrer" target="_blank">
                          <img alt={photo.name || 'proof'} loading="lazy" src={photo.url} />
                          <span>{photo.name || 'proof'}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="section-card tech-empty-state">{t.proofEmpty}</div>
                  )}

                  {['closed', 'completed'].includes(String(selectedOrder.zamilClosureStatus || '').trim()) ? (
                    <div className="mandatory-status-panel">
                      <strong>{t.zamilClosed}</strong>
                      <p className="muted">{t.closureLocked}</p>
                    </div>
                  ) : (
                    <>
                      <div className="support-request-grid">
                        <label className="field">
                          <span className="field-label">{t.closureNoteLabel}</span>
                          <textarea
                            className="input"
                            placeholder={t.closureNotePlaceholder}
                            rows={3}
                            value={closureNote}
                            onChange={(event) => setClosureNote(event.target.value)}
                          />
                        </label>
                        <label className="field">
                          <span className="field-label">{t.closureDelayReasonLabel}</span>
                          <select className="input" value={closureDelayReason} onChange={(event) => setClosureDelayReason(event.target.value)}>
                            <option value="">{lang === 'ar' ? 'اختياري' : 'Optional'}</option>
                            {delayReasonOptions.map((option) => (
                              <option key={option.value} value={lang === 'ar' ? option.arLabel : option.label}>
                                {lang === 'ar' ? option.arLabel : option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          <span className="field-label">{t.closureDelayNoteLabel}</span>
                          <textarea
                            className="input"
                            placeholder={t.closureDelayNotePlaceholder}
                            rows={2}
                            value={closureDelayNote}
                            onChange={(event) => setClosureDelayNote(event.target.value)}
                          />
                        </label>
                      </div>

                      <button
                        className="btn-primary"
                        disabled={requestingClosure || uploadingProof || !(selectedOrder.photos || []).length}
                        type="button"
                        onClick={handleRequestClosure}
                      >
                        {requestingClosure ? t.requestingClosure : t.requestClosure}
                      </button>

                      {['requested', 'otp_submitted'].includes(String(selectedOrder.zamilClosureStatus || '').trim()) ? (
                        <div className="otp-submit-row">
                          <label className="field">
                            <span className="field-label">{t.otpLabel}</span>
                            <input
                              className="input otp-code-input"
                              inputMode="numeric"
                              maxLength={8}
                              placeholder={t.otpPlaceholder}
                              value={otpCode}
                              onChange={(event) => setOtpCode(event.target.value.replace(/\s+/g, ''))}
                            />
                          </label>
                          <button className="btn-secondary" disabled={submittingOtp || !otpCode.trim()} type="button" onClick={handleSubmitOtp}>
                            {submittingOtp ? t.submittingOtp : t.submitOtp}
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </article>

                <article className="detail-card">
                  <div className="technician-simple-meta">
                    <p>
                      <span>{t.call}</span>
                      <strong>{formatSaudiPhoneDisplay(selectedOrder.phone) || '—'}</strong>
                    </p>
                    <p>
                      <span>{t.whatsapp}</span>
                      <strong>{formatSaudiPhoneDisplay(selectedOrder.whatsappPhone || selectedOrder.phone) || '—'}</strong>
                    </p>
                  </div>
                </article>
              </div>
            ) : (
              <div className="section-card tech-empty-state">{t.noSelection}</div>
            )}
          </div>
        </div>

        <nav className="bottom-tab-bar technician-mobile-tabbar" aria-label={t.title}>
          {tabs.map((tab) => (
            <button
              className={activeSectionKey === tab.key ? 'active' : ''}
              key={tab.key}
              onClick={() => navigate(tab.path)}
              type="button"
            >
              <strong>{tab.count ?? '•'}</strong>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
