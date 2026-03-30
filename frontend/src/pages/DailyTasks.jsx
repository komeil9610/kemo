import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  buildEscalationSnapshot,
  compareOrdersByInternalArea,
  delayReasonOptions,
  formatSaudiPhoneDisplay,
  getAreaClusterLabel,
  getTimeStandardLabel,
  operationsService,
  technicianStatusOptions,
} from '../services/api';
import { notificationHaptic, sendAppNotification, selectionHaptic } from '../utils/mobileNative';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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

const resolveRegion = (order, technician) =>
  [order?.district, order?.city, technician?.region || technician?.zone].filter(Boolean).join(' - ') || '—';

const resolveErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const suspendReasons = [
  { value: 'client_no_answer', label: 'Client not answering', arLabel: 'العميل لا يرد' },
  { value: 'site_under_construction', label: 'Site under construction', arLabel: 'الموقع قيد الإنشاء' },
  { value: 'client_requested_delay', label: 'Client requested delay', arLabel: 'العميل طلب التأجيل' },
  { value: 'power_not_ready', label: 'Power extension not ready', arLabel: 'التمديد الكهربائي غير جاهز' },
  { value: 'need_scaffolding', label: 'Need scaffolding', arLabel: 'نحتاج سقالة للارتفاع' },
];

const copy = {
  en: {
    eyebrow: 'Technician daily execution',
    title: 'Today tasks only',
    subtitle:
      'The technician documents the work and sends the Zamil closure request, while the final completion stays with operations only.',
    loading: 'Loading today tasks...',
    todayBadge: 'Today',
    generalTasksLink: 'General tasks',
    sync: 'Sync',
    availability: 'Availability',
    empty: 'No active tasks assigned for today.',
    historyCount: 'Suspended or completed records',
    lastApproved: 'Latest approved closure',
    customer: 'Customer',
    district: 'Area',
    scheduled: 'Scheduled',
    workType: 'Work required',
    notes: 'Notes',
    call: 'Call',
    route: 'Route',
    statusRail: 'Execution flow',
    statusHint: 'Completion is locked until operations confirms the accepted OTP in Zamil.',
    proofTitle: 'Proof of completion',
    photoPrompt: 'Upload installation proof',
    proofReady: 'Proof ready',
    proofMissing: 'Proof photo required before the Zamil request',
    signature: 'Client signature',
    signaturePlaceholder: 'Write the client name',
    saveSignature: 'Save signature',
    closeFlowTitle: 'Zamil closure handoff',
    closeFlowHint:
      'When installation is finished, ask operations to trigger the OTP from the Zamil portal. Do not leave until approval appears here.',
    closeStatus: 'Closure status',
    closeRequestedAt: 'Request time',
    standardTime: 'Standard time',
    elapsedTime: 'Elapsed time',
    delayReason: 'Delay reason',
    delayNote: 'Delay note',
    delayNotePlaceholder: 'Explain what caused the delay for operations and Zamil records',
    completionNote: 'Post-completion note',
    completionNotePlaceholder: 'Mention any client issue or field note after finishing',
    otpInput: 'Client OTP',
    otpPlaceholder: 'Enter the OTP from the client',
    requestOtp: 'Request Zamil OTP',
    requestOtpAgain: 'Request a new OTP',
    submitOtp: 'Send OTP to operations',
    closeStepsTitle: 'Closure steps',
    closeSteps: [
      'Upload proof photo and save the client signature.',
      'Press Request Zamil OTP after finishing the installation.',
      'When the customer receives the OTP, type it here and send it to operations.',
      'Wait for the green approval before leaving the site.',
    ],
    waitingForOps: 'Waiting for operations to request the OTP from Zamil and send the final approval.',
    waitingForApproval: 'OTP sent. Stay on-site until the green approval appears.',
    sentOtpLabel: 'Submitted OTP',
    approvedLeave: 'Operations approved the closure. You may leave the site now.',
    closeStatusLabels: {
      idle: 'Not started',
      requested: 'Waiting for portal OTP request',
      otp_submitted: 'Waiting for manager approval',
      closed: 'Approved',
    },
    suspendTitle: 'Suspend job',
    suspendHint: 'Use this only when the site is not ready or the customer cannot receive the team.',
    suspendReason: 'Required reason',
    suspendNote: 'Coordinator note',
    suspendNotePlaceholder: 'Short field note for operations follow-up',
    suspendPhoto: 'Required site proof photo',
    suspendAction: 'Send to exceptions queue',
    requiredPhoto: 'Attach a site proof photo before suspending.',
    requiredReason: 'Choose a suspension reason first.',
    requiredOtp: 'Enter the OTP first.',
    requiredDelayReason: 'Choose a delay reason before closing this overdue task.',
    warningNotice: 'You are close to the standard time limit. Flag any issue before it becomes a delay.',
    criticalNotice: 'You exceeded the allowed time. Contact operations and log the delay reason before closure.',
    statusLabels: {
      pending: 'Pending',
      scheduled: 'Dispatched',
      in_transit: 'Installing',
      completed: 'Completed',
      suspended: 'Suspended',
    },
    statusFlow: [
      { value: 'pending', label: 'Pending' },
      { value: 'scheduled', label: 'Assigned' },
      { value: 'in_transit', label: 'Installing' },
    ],
    messages: {
      statusUpdated: 'Task status updated.',
      photoUploaded: 'Proof uploaded.',
      suspended: 'Task moved to exceptions queue.',
      signatureSaved: 'Signature saved.',
      closureRequested: 'Zamil OTP request sent to operations.',
      otpSubmitted: 'OTP sent to operations.',
    },
  },
  ar: {
    eyebrow: 'تنفيذ الفني اليومي',
    title: 'مهام اليوم فقط',
    subtitle:
      'الفني يوثق التنفيذ ويرسل طلب إغلاق الزامل، بينما يبقى اعتماد الإكمال النهائي بيد الإدارة فقط.',
    loading: 'جارٍ تحميل مهام اليوم...',
    todayBadge: 'اليوم',
    generalTasksLink: 'المهام العامة',
    sync: 'مزامنة',
    availability: 'حالة التوفر',
    empty: 'لا توجد مهام نشطة مخصصة لليوم.',
    historyCount: 'سجلات مكتملة أو معلقة',
    lastApproved: 'آخر مهمة تم اعتماد إغلاقها',
    customer: 'العميل',
    district: 'المنطقة',
    scheduled: 'الموعد',
    workType: 'العمل المطلوب',
    notes: 'ملاحظات',
    call: 'اتصال',
    route: 'الموقع',
    statusRail: 'مسار التنفيذ',
    statusHint: 'لا يمكن إنهاء المهمة من الفني قبل اعتماد الإدارة لرمز OTP المقبول في الزامل.',
    proofTitle: 'إثبات الإنجاز',
    photoPrompt: 'رفع صورة إثبات التركيب',
    proofReady: 'الإثبات جاهز',
    proofMissing: 'يلزم رفع صورة إثبات قبل طلب رمز الزامل',
    signature: 'توقيع العميل',
    signaturePlaceholder: 'اكتب اسم العميل',
    saveSignature: 'حفظ التوقيع',
    closeFlowTitle: 'تسليم إغلاق الزامل',
    closeFlowHint:
      'بعد انتهاء التركيب اطلب من الإدارة تشغيل رمز OTP من بوابة الزامل. لا تغادر الموقع حتى يظهر لك الاعتماد الأخضر هنا.',
    closeStatus: 'حالة الإغلاق',
    closeRequestedAt: 'وقت الطلب',
    standardTime: 'الوقت المعياري',
    elapsedTime: 'الوقت المستغرق',
    delayReason: 'سبب التأخير',
    delayNote: 'ملاحظة التأخير',
    delayNotePlaceholder: 'اشرح سبب التأخير لحفظه للتشغيل والزامل',
    completionNote: 'ملاحظة بعد الإنجاز',
    completionNotePlaceholder: 'اكتب أي ملاحظة عن العميل أو الموقع بعد الانتهاء',
    otpInput: 'رمز العميل',
    otpPlaceholder: 'اكتب رمز OTP الذي أخذه العميل',
    requestOtp: 'طلب رمز الزامل',
    requestOtpAgain: 'طلب رمز جديد',
    submitOtp: 'إرسال الرمز للإدارة',
    closeStepsTitle: 'خطوات الإغلاق',
    closeSteps: [
      'ارفع صورة الإثبات واحفظ توقيع العميل أولاً.',
      'بعد انتهاء التركيب اضغط طلب رمز الزامل.',
      'عندما يستلم العميل الرمز اكتبه هنا ثم اضغط إرسال الرمز للإدارة.',
      'لا تغادر الموقع حتى يظهر لك الاعتماد الأخضر.',
    ],
    waitingForOps: 'بانتظار الإدارة لتطلب OTP من بوابة الزامل ثم تكمل الاعتماد النهائي.',
    waitingForApproval: 'تم إرسال الرمز. ابقَ في الموقع حتى يظهر اعتماد الإدارة.',
    sentOtpLabel: 'الرمز المرسل',
    approvedLeave: 'تم اعتماد الإغلاق من الإدارة ويمكنك مغادرة الموقع الآن.',
    closeStatusLabels: {
      idle: 'لم يبدأ',
      requested: 'بانتظار طلب OTP من البوابة',
      otp_submitted: 'بانتظار اعتماد المسؤول',
      closed: 'تم الاعتماد',
    },
    suspendTitle: 'تعليق المهمة',
    suspendHint: 'استخدم هذا الخيار فقط عند عدم جاهزية الموقع أو تعذر استلام العميل للفريق.',
    suspendReason: 'سبب التعليق الإجباري',
    suspendNote: 'ملاحظة للمنسق',
    suspendNotePlaceholder: 'اكتب ملاحظة ميدانية قصيرة للمتابعة',
    suspendPhoto: 'صورة إثبات الموقع',
    suspendAction: 'إرسال إلى قائمة الاستثناءات',
    requiredPhoto: 'أرفق صورة إثبات للموقع قبل التعليق.',
    requiredReason: 'اختر سبب التعليق أولاً.',
    requiredOtp: 'اكتب رمز OTP أولاً.',
    requiredDelayReason: 'اختر سبب التأخير قبل إغلاق المهمة المتأخرة.',
    warningNotice: 'اقتربت من تجاوز الوقت المعياري. أخبر الإدارة إذا ظهرت مشكلة.',
    criticalNotice: 'تجاوزت الوقت المسموح. تواصل مع الإدارة وسجل سبب التأخير قبل الإغلاق.',
    statusLabels: {
      pending: 'قيد الانتظار',
      scheduled: 'تم الإسناد',
      in_transit: 'جاري التنفيذ',
      completed: 'مكتملة',
      suspended: 'معلقة',
    },
    statusFlow: [
      { value: 'pending', label: 'انتظار' },
      { value: 'scheduled', label: 'تم الإسناد' },
      { value: 'in_transit', label: 'جاري التنفيذ' },
    ],
    messages: {
      statusUpdated: 'تم تحديث حالة المهمة.',
      photoUploaded: 'تم رفع الإثبات.',
      suspended: 'تم تحويل المهمة إلى قائمة الاستثناءات.',
      signatureSaved: 'تم حفظ التوقيع.',
      closureRequested: 'تم إرسال طلب رمز الزامل إلى الإدارة.',
      otpSubmitted: 'تم إرسال رمز OTP إلى الإدارة.',
    },
  },
};

const statusOrder = {
  pending: 0,
  scheduled: 1,
  in_transit: 2,
  completed: 3,
  suspended: 4,
  canceled: 5,
};

export default function DailyTasks() {
  const { user } = useAuth();
  const { lang, isRTL } = useLang();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [signatureDrafts, setSignatureDrafts] = useState({});
  const [suspendDrafts, setSuspendDrafts] = useState({});
  const [suspendFiles, setSuspendFiles] = useState({});
  const [otpDrafts, setOtpDrafts] = useState({});
  const [completionDrafts, setCompletionDrafts] = useState({});
  const [delayDrafts, setDelayDrafts] = useState({});
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  const escalationLevelsRef = useRef(new Map());

  const t = copy[lang] || copy.en;

  const loadOrders = useCallback(
    async ({ silently = false } = {}) => {
      if (!user?.technicianId) {
        setLoading(false);
        return;
      }

      try {
        if (!silently) {
          setLoading(true);
        }
        const response = await operationsService.getTechnicianOrders(user.technicianId);
        setPayload(response.data || {});
      } finally {
        if (!silently) {
          setLoading(false);
        }
      }
    },
    [user?.technicianId]
  );

  useEffect(() => {
    loadOrders();
    window.addEventListener('operations-updated', loadOrders);
    return () => window.removeEventListener('operations-updated', loadOrders);
  }, [loadOrders]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadOrders({ silently: true });
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [loadOrders]);

  const technician = useMemo(() => payload?.technician || null, [payload]);
  const orders = useMemo(() => payload?.orders || [], [payload]);
  const timeStandards = useMemo(() => payload?.timeStandards || [], [payload]);
  const todayKey = todayString();

  const todayOrders = useMemo(
    () =>
      [...orders]
        .map((order) => ({
          ...order,
          region: resolveRegion(order, technician),
          hasProof: Boolean(order.photos?.length),
          timing: buildEscalationSnapshot(order, timeStandards),
        }))
        .filter((order) => order.scheduledDate === todayKey && !['completed', 'canceled', 'suspended'].includes(order.status))
        .sort((left, right) => {
          if ((statusOrder[left.status] || 99) !== (statusOrder[right.status] || 99)) {
            return (statusOrder[left.status] || 99) - (statusOrder[right.status] || 99);
          }
          return compareOrdersByInternalArea(left, right);
        }),
    [orders, technician, timeStandards, todayKey]
  );

  const historyCount = useMemo(
    () => orders.filter((order) => order.status === 'completed' || order.status === 'suspended').length,
    [orders]
  );

  const latestApprovedOrder = useMemo(
    () =>
      [...orders]
        .filter((order) => order.status === 'completed' && order.zamilClosureStatus === 'closed')
        .sort((left, right) =>
          `${right.zamilClosedAt || right.approvedAt || ''}${right.id}`.localeCompare(
            `${left.zamilClosedAt || left.approvedAt || ''}${left.id}`
          )
        )[0] || null,
    [orders]
  );

  useEffect(() => {
    if (!todayOrders.length) {
      setSelectedOrderId('');
      return;
    }

    if (!todayOrders.some((order) => String(order.id) === String(selectedOrderId))) {
      setSelectedOrderId(String(todayOrders[0].id));
    }
  }, [selectedOrderId, todayOrders]);

  const selectedOrder = useMemo(
    () => todayOrders.find((order) => String(order.id) === String(selectedOrderId)) || null,
    [selectedOrderId, todayOrders]
  );

  useEffect(() => {
    todayOrders.forEach((order) => {
      const previousLevel = escalationLevelsRef.current.get(String(order.id)) || 0;
      const nextLevel = order.timing?.escalationLevel || 0;
      if (nextLevel > previousLevel) {
        toast(nextLevel === 2 ? t.criticalNotice : t.warningNotice, { duration: 4500 });
        sendAppNotification({
          key: `task-escalation-${order.id}-${nextLevel}`,
          title: nextLevel === 2 ? (lang === 'ar' ? 'تنبيه حرج' : 'Critical alert') : lang === 'ar' ? 'تنبيه ميداني' : 'Field warning',
          body: `${order.customerName} - ${nextLevel === 2 ? t.criticalNotice : t.warningNotice}`,
        });
      }
      escalationLevelsRef.current.set(String(order.id), nextLevel);
    });
  }, [lang, t.criticalNotice, t.warningNotice, todayOrders]);

  const withAction = async (key, action) => {
    try {
      setActiveAction(key);
      await action();
    } finally {
      setActiveAction('');
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      setMessage('');
      await operationsService.updateTechnicianStatus(orderId, status);
      await notificationHaptic('success');
      setMessage(t.messages.statusUpdated);
      await loadOrders({ silently: true });
    } catch (error) {
      toast.error(resolveErrorMessage(error, t.messages.statusUpdated));
    }
  };

  const uploadPhoto = async (orderId, file) => {
    if (!file) {
      return;
    }

    try {
      const url = await fileToDataUrl(file);
      await operationsService.uploadPhoto(orderId, { name: file.name, url });
      await notificationHaptic('success');
      setMessage(t.messages.photoUploaded);
      await loadOrders({ silently: true });
    } catch (error) {
      toast.error(resolveErrorMessage(error, t.messages.photoUploaded));
    }
  };

  const saveSignature = async (order) => {
    try {
      await operationsService.updateOrder(order.id, {
        clientSignature: signatureDrafts[order.id] ?? order.clientSignature ?? '',
      });
      await notificationHaptic('success');
      setMessage(t.messages.signatureSaved);
      await loadOrders({ silently: true });
    } catch (error) {
      toast.error(resolveErrorMessage(error, t.messages.signatureSaved));
    }
  };

  const requestClosure = async (order) => {
    const delayReason = String(delayDrafts[order.id]?.reason || order.delayReason || '').trim();
    const delayNote = String(delayDrafts[order.id]?.note || order.delayNote || '').trim();
    const completionNote = String(completionDrafts[order.id] ?? order.completionNote ?? '').trim();

    if (order.timing?.needsDelayReason && !delayReason) {
      toast.error(t.requiredDelayReason);
      return;
    }

    try {
      setMessage('');
      await withAction(`request-${order.id}`, async () => {
        await operationsService.requestClosure(order.id, {
          completionNote,
          delayReason,
          delayNote,
        });
      });
      await notificationHaptic('success');
      setMessage(t.messages.closureRequested);
      await loadOrders({ silently: true });
    } catch (error) {
      toast.error(resolveErrorMessage(error, t.proofMissing));
    }
  };

  const submitOtp = async (order) => {
    const otpCode = String(otpDrafts[order.id] || '').replace(/\s+/g, '').trim();

    if (!otpCode) {
      toast.error(t.requiredOtp);
      return;
    }

    try {
      setMessage('');
      await withAction(`otp-${order.id}`, async () => {
        await operationsService.submitClosureOtp(order.id, otpCode);
      });
      await notificationHaptic('success');
      setOtpDrafts((current) => ({ ...current, [order.id]: '' }));
      setMessage(t.messages.otpSubmitted);
      await loadOrders({ silently: true });
    } catch (error) {
      toast.error(resolveErrorMessage(error, t.requiredOtp));
    }
  };

  const suspendOrder = async (order) => {
    const draft = suspendDrafts[order.id] || {};
    const file = suspendFiles[order.id];

    if (!draft.reason) {
      toast.error(t.requiredReason);
      return;
    }

    if (!file) {
      toast.error(t.requiredPhoto);
      return;
    }

    try {
      const url = await fileToDataUrl(file);
      await operationsService.uploadPhoto(order.id, { name: file.name, url });

      await operationsService.updateTechnicianStatus(order.id, 'suspended', {
        suspensionReason: draft.reason,
        suspensionNote: String(draft.note || '').trim(),
        exceptionStatus: 'open',
        auditLog: [
          ...(order.auditLog || []),
          {
            id: `audit-${Date.now()}`,
            type: 'suspended',
            actor: 'technician',
            message: `${draft.reason}${draft.note ? ` - ${draft.note}` : ''}`,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      await notificationHaptic('warning');
      setSuspendDrafts((current) => ({ ...current, [order.id]: { reason: '', note: '' } }));
      setSuspendFiles((current) => ({ ...current, [order.id]: null }));
      setMessage(t.messages.suspended);
      await loadOrders({ silently: true });
    } catch (error) {
      toast.error(resolveErrorMessage(error, t.messages.suspended));
    }
  };

  const updateAvailability = async (status) => {
    if (!technician?.id) {
      return;
    }

    try {
      setUpdatingAvailability(true);
      await operationsService.updateTechnicianAvailability(technician.id, status);
      await notificationHaptic('success');
      await loadOrders({ silently: true });
    } finally {
      setUpdatingAvailability(false);
    }
  };

  if (loading) {
    return <section className="page-shell">{t.loading}</section>;
  }

  return (
    <section className="page-shell technician-app-shell" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="technician-app-header">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="section-subtitle">{t.subtitle}</p>
          <p className="section-subtitle">
            {technician?.name} - {formatDate(todayKey, lang)} - {t.todayBadge}
          </p>
        </div>
        <div className="status-actions">
          <button className="btn-light" type="button" onClick={() => loadOrders()}>
            {t.sync}
          </button>
          <select
            className="input compact-input"
            disabled={updatingAvailability}
            value={technician?.status === 'busy' ? 'busy' : 'available'}
            onChange={(event) => updateAvailability(event.target.value)}
          >
            {technicianStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t.availability}: {lang === 'ar' ? option.arLabel : option.label}
              </option>
            ))}
          </select>
          <Link className="btn-primary" to="/tasks">
            {t.generalTasksLink}
          </Link>
        </div>
      </div>

      {message ? <div className="flash-message">{message}</div> : null}

      <div className="technician-summary-strip">
        <article className="tech-summary-card">
          <span>{t.todayBadge}</span>
          <strong>{todayOrders.length}</strong>
        </article>
        <article className="tech-summary-card attention">
          <span>{t.historyCount}</span>
          <strong>{historyCount}</strong>
        </article>
        {latestApprovedOrder ? (
          <article className="tech-summary-card success">
            <span>{t.lastApproved}</span>
            <strong>#{formatOrderNumber(latestApprovedOrder.id)}</strong>
            <small>{formatDateTime(latestApprovedOrder.zamilClosedAt || latestApprovedOrder.approvedAt, lang)}</small>
          </article>
        ) : null}
      </div>

      <div className="technician-workspace">
        <section className="panel today-column">
          <div className="panel-header">
            <h2>{formatDate(todayKey, lang)}</h2>
            <p>{todayOrders.length}</p>
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
                    <span className="tech-job-time">{order.scheduledTime || '—'}</span>
                    <span className={`status-badge ${order.status}`}>{t.statusLabels[order.status] || order.status}</span>
                  </div>
                  <strong>{order.customerName}</strong>
                  <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                  <span>{order.region}</span>
                  <span>{order.workType || order.acType}</span>
                  {order.zamilClosureStatus && order.zamilClosureStatus !== 'idle' ? (
                    <span className={`close-stage-pill ${order.zamilClosureStatus}`}>
                      {t.closeStatusLabels[order.zamilClosureStatus] || order.zamilClosureStatus}
                    </span>
                  ) : null}
                </button>
              ))
            ) : (
              <p className="muted">{t.empty}</p>
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
                <div className="task-badges">
                  <span className={`status-badge ${selectedOrder.status}`}>{t.statusLabels[selectedOrder.status] || selectedOrder.status}</span>
                  <span className={`close-stage-pill ${selectedOrder.zamilClosureStatus || 'idle'}`}>
                    {t.closeStatusLabels[selectedOrder.zamilClosureStatus || 'idle']}
                  </span>
                </div>
              </div>

              <div className="task-quick-actions">
                <a className="btn-light" href={`tel:${selectedOrder.phone}`}>
                  {t.call}
                </a>
                <a
                  className="btn-primary"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.address || selectedOrder.region || '')}`}
                  rel="noreferrer"
                  target="_blank"
                >
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
                  <span>{t.district}</span>
                  <strong>{selectedOrder.region}</strong>
                </div>
                <div className="detail-card">
                  <span>{t.scheduled}</span>
                  <strong>
                    {formatDate(selectedOrder.scheduledDate, lang)}
                    {selectedOrder.scheduledTime ? ` • ${selectedOrder.scheduledTime}` : ''}
                  </strong>
                </div>
                <div className="detail-card">
                  <span>{t.workType}</span>
                  <strong>{selectedOrder.workType || selectedOrder.acType}</strong>
                </div>
              </div>

              {selectedOrder.notes ? (
                <div className="panel inset-panel">
                  <p className="notes-box">
                    {t.notes}: {selectedOrder.notes}
                  </p>
                </div>
              ) : null}

              <div className="mandatory-status-panel">
                <div className="panel-header">
                  <div>
                    <h3>{t.statusRail}</h3>
                    <p>{t.statusHint}</p>
                  </div>
                </div>
                <div className="status-rail compact-status-rail">
                  {t.statusFlow.map((step, index) => (
                    <button
                      className={`status-step ${selectedOrder.status === step.value ? 'active' : ''}`}
                      key={step.value}
                      type="button"
                      onClick={async () => {
                        await selectionHaptic();
                        updateStatus(selectedOrder.id, step.value);
                      }}
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
                  </div>
                  <label className="upload-box">
                    <span>{t.photoPrompt}</span>
                    <input type="file" accept="image/*" capture="environment" onChange={(event) => uploadPhoto(selectedOrder.id, event.target.files?.[0])} />
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
                  <button className="btn-light" type="button" onClick={() => saveSignature(selectedOrder)}>
                    {t.saveSignature}
                  </button>
                </div>
              </div>

              <div className="panel inset-panel close-otp-panel">
                <div className="panel-header">
                  <div>
                    <h3>{t.closeFlowTitle}</h3>
                    <p>{t.closeFlowHint}</p>
                  </div>
                </div>

                <div className="close-flow-meta">
                  <article className="close-flow-card">
                    <span>{t.closeStatus}</span>
                    <strong>{t.closeStatusLabels[selectedOrder.zamilClosureStatus || 'idle']}</strong>
                  </article>
                  <article className="close-flow-card">
                    <span>{t.standardTime}</span>
                    <strong>
                      {getTimeStandardLabel(
                        timeStandards.find((entry) => entry.standardKey === selectedOrder.serviceCategory),
                        lang
                      ) || selectedOrder.workType}
                      {' • '}
                      {selectedOrder.timing?.standardDurationMinutes || selectedOrder.standardDurationMinutes} min
                    </strong>
                  </article>
                  <article className="close-flow-card">
                    <span>{t.elapsedTime}</span>
                    <strong>{selectedOrder.timing?.elapsedMinutes || 0} min</strong>
                  </article>
                  <article className="close-flow-card">
                    <span>{t.closeRequestedAt}</span>
                    <strong>{formatDateTime(selectedOrder.zamilCloseRequestedAt, lang)}</strong>
                  </article>
                </div>

                <div className="close-flow-meta">
                  <article className="close-flow-card">
                    <span>{t.proofTitle}</span>
                    <strong>{selectedOrder.hasProof ? t.proofReady : t.proofMissing}</strong>
                  </article>
                  <article className={`close-flow-card ${selectedOrder.timing?.isCritical ? 'timing-critical' : selectedOrder.timing?.isWarning ? 'timing-warning' : ''}`}>
                    <span>{t.delayReason}</span>
                    <strong>
                      {selectedOrder.delayReason ||
                        delayDrafts[selectedOrder.id]?.reason ||
                        (selectedOrder.timing?.isCritical ? t.criticalNotice : selectedOrder.timing?.isWarning ? t.warningNotice : '—')}
                    </strong>
                  </article>
                </div>

                <div className="panel inset-panel">
                  <div className="panel-header">
                    <h3>{t.closeStepsTitle}</h3>
                  </div>
                  <div className="audit-log-body">
                    {t.closeSteps.map((step) => (
                      <article className="audit-log-item" key={step}>
                        <strong>{step}</strong>
                      </article>
                    ))}
                  </div>
                </div>

                <label className="filter-field">
                  <span>{t.completionNote}</span>
                  <textarea
                    className="input"
                    placeholder={t.completionNotePlaceholder}
                    rows="3"
                    value={completionDrafts[selectedOrder.id] ?? selectedOrder.completionNote ?? ''}
                    onChange={(event) =>
                      setCompletionDrafts((current) => ({
                        ...current,
                        [selectedOrder.id]: event.target.value,
                      }))
                    }
                  />
                </label>

                {selectedOrder.timing?.needsDelayReason ? (
                  <div className="suspend-grid">
                    <label className="filter-field">
                      <span>{t.delayReason}</span>
                      <select
                        className="input"
                        value={delayDrafts[selectedOrder.id]?.reason || selectedOrder.delayReason || ''}
                        onChange={(event) =>
                          setDelayDrafts((current) => ({
                            ...current,
                            [selectedOrder.id]: {
                              ...(current[selectedOrder.id] || {}),
                              reason: event.target.value,
                            },
                          }))
                        }
                      >
                        <option value="">{t.delayReason}</option>
                        {delayReasonOptions.map((reason) => (
                          <option key={reason.value} value={lang === 'ar' ? reason.arLabel : reason.label}>
                            {lang === 'ar' ? reason.arLabel : reason.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="filter-field">
                      <span>{t.delayNote}</span>
                      <textarea
                        className="input"
                        placeholder={t.delayNotePlaceholder}
                        rows="3"
                        value={delayDrafts[selectedOrder.id]?.note || selectedOrder.delayNote || ''}
                        onChange={(event) =>
                          setDelayDrafts((current) => ({
                            ...current,
                            [selectedOrder.id]: {
                              ...(current[selectedOrder.id] || {}),
                              note: event.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                  </div>
                ) : null}

                {(selectedOrder.zamilClosureStatus || 'idle') === 'idle' ? (
                  <div className="close-flow-actions">
                    <p className="notes-box">{selectedOrder.hasProof ? t.waitingForOps : t.proofMissing}</p>
                    <button
                      className="btn-primary"
                      disabled={!selectedOrder.hasProof || activeAction === `request-${selectedOrder.id}`}
                      type="button"
                      onClick={async () => {
                        await selectionHaptic();
                        requestClosure(selectedOrder);
                      }}
                    >
                      {t.requestOtp}
                    </button>
                  </div>
                ) : null}

                {(selectedOrder.zamilClosureStatus || 'idle') === 'requested' ? (
                  <div className="close-flow-actions">
                    <p className="notes-box">{t.waitingForOps}</p>
                    <label className="filter-field">
                      <span>{t.otpInput}</span>
                      <input
                        className="input otp-code-input"
                        dir="ltr"
                        inputMode="numeric"
                        maxLength={8}
                        placeholder={t.otpPlaceholder}
                        value={otpDrafts[selectedOrder.id] || ''}
                        onChange={(event) =>
                          setOtpDrafts((current) => ({
                            ...current,
                            [selectedOrder.id]: event.target.value.replace(/[^\da-zA-Z]/g, '').slice(0, 8),
                          }))
                        }
                      />
                    </label>
                    <div className="status-actions">
                      <button
                        className="btn-primary"
                        disabled={activeAction === `otp-${selectedOrder.id}`}
                        type="button"
                        onClick={async () => {
                          await selectionHaptic();
                          submitOtp(selectedOrder);
                        }}
                      >
                        {t.submitOtp}
                      </button>
                      <button
                        className="btn-light"
                        disabled={activeAction === `request-${selectedOrder.id}`}
                        type="button"
                        onClick={async () => {
                          await selectionHaptic();
                          requestClosure(selectedOrder);
                        }}
                      >
                        {t.requestOtpAgain}
                      </button>
                    </div>
                  </div>
                ) : null}

                {(selectedOrder.zamilClosureStatus || 'idle') === 'otp_submitted' ? (
                  <div className="close-flow-actions">
                    <p className="notes-box">{t.waitingForApproval}</p>
                    <article className="otp-code-preview">
                      <span>{t.sentOtpLabel}</span>
                      <strong>{selectedOrder.zamilOtpCode || '—'}</strong>
                    </article>
                    <button
                      className="btn-light"
                      disabled={activeAction === `request-${selectedOrder.id}`}
                      type="button"
                      onClick={() => requestClosure(selectedOrder)}
                    >
                      {t.requestOtpAgain}
                    </button>
                  </div>
                ) : null}

                {(selectedOrder.zamilClosureStatus || 'idle') === 'closed' ? (
                  <div className="flash-message">{t.approvedLeave}</div>
                ) : null}
              </div>

              <div className="panel inset-panel suspend-panel">
                <div className="panel-header">
                  <h3>{t.suspendTitle}</h3>
                  <p>{t.suspendHint}</p>
                </div>
                <div className="suspend-grid">
                  <label className="filter-field">
                    <span>{t.suspendReason}</span>
                    <select
                      className="input"
                      value={suspendDrafts[selectedOrder.id]?.reason || ''}
                      onChange={(event) =>
                        setSuspendDrafts((current) => ({
                          ...current,
                          [selectedOrder.id]: {
                            ...(current[selectedOrder.id] || {}),
                            reason: event.target.value,
                          },
                        }))
                      }
                    >
                      <option value="">{t.suspendReason}</option>
                      {suspendReasons.map((reason) => (
                        <option key={reason.value} value={lang === 'ar' ? reason.arLabel : reason.label}>
                          {lang === 'ar' ? reason.arLabel : reason.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>{t.suspendPhoto}</span>
                    <input
                      className="input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) =>
                        setSuspendFiles((current) => ({
                          ...current,
                          [selectedOrder.id]: event.target.files?.[0] || null,
                        }))
                      }
                    />
                  </label>
                </div>

                <label className="filter-field">
                  <span>{t.suspendNote}</span>
                  <textarea
                    className="input"
                    placeholder={t.suspendNotePlaceholder}
                    rows="3"
                    value={suspendDrafts[selectedOrder.id]?.note || ''}
                    onChange={(event) =>
                      setSuspendDrafts((current) => ({
                        ...current,
                        [selectedOrder.id]: {
                          ...(current[selectedOrder.id] || {}),
                          note: event.target.value,
                        },
                      }))
                    }
                  />
                </label>

                <button className="btn-danger" type="button" onClick={async () => {
                  await selectionHaptic();
                  suspendOrder(selectedOrder);
                }}>
                  {t.suspendAction}
                </button>
              </div>
            </>
          ) : (
            <p className="muted">{t.empty}</p>
          )}
        </section>
      </div>
    </section>
  );
}
