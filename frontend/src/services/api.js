import axios from 'axios';

const STORAGE_KEY = 'tarkeeb-pro-internal-db-v2';
const LEGACY_STORAGE_KEY = 'tarkeeb-pro-internal-db';
const NOTIFICATIONS_STORAGE_KEY = 'tarkeeb-pro-internal-notifications';

const readStorage = (key) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
};

const removeStorage = (key) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
};

const clearLegacyOrders = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    return;
  }
};

const safeJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const FAST_DELIVERY_CITIES = ['الدمام', 'جدة', 'الرياض', 'الخبر', 'الظهران', 'جازان', 'رأس تنورة'];
const ORDER_STATUS_AR_LABELS = {
  pending: 'طلب جديد',
  scheduled: 'تمت الجدولة',
  in_transit: 'في الطريق',
  completed: 'مكتمل',
  canceled: 'ملغي',
};
const extractExcelStatusFromNotes = (notes) => {
  const text = String(notes || '');
  const match = text.match(/(?:^|\n)Excel status:\s*(.+?)(?:\n|$)/i);
  return String(match?.[1] || '').trim();
};
export const technicianStatusOptions = [
  { value: 'available', label: 'متاح', enLabel: 'Available' },
  { value: 'busy', label: 'مشغول', enLabel: 'Busy' },
  { value: 'offline', label: 'خارج الخدمة', enLabel: 'Offline' },
];
export const delayReasonOptions = [
  { value: 'traffic', label: 'Traffic delay', arLabel: 'ازدحام مروري' },
  { value: 'site_not_ready', label: 'Site not ready', arLabel: 'الموقع غير جاهز' },
  { value: 'client_delay', label: 'Customer delay', arLabel: 'تأخر العميل' },
  { value: 'material_issue', label: 'Material issue', arLabel: 'مشكلة في المواد أو القطع' },
  { value: 'technical_issue', label: 'Technical issue', arLabel: 'عائق فني بالموقع' },
];

export const normalizeSaudiPhoneNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  if (digits.startsWith('966')) {
    return `0${digits.slice(3)}`;
  }
  if (digits.startsWith('5') && digits.length === 9) {
    return `0${digits}`;
  }
  if (digits.startsWith('0')) {
    return digits;
  }
  return digits.length === 9 ? `0${digits}` : digits;
};

export const formatSaudiPhoneDisplay = (value) => normalizeSaudiPhoneNumber(value) || String(value || '');

export const buildWhatsAppUrl = (value, text = '') => {
  const normalized = normalizeSaudiPhoneNumber(value);
  const international = normalized.startsWith('0') ? `966${normalized.slice(1)}` : normalized;
  const message = text ? `?text=${encodeURIComponent(text)}` : '';
  return international ? `https://wa.me/${international}${message}` : '#';
};

export const getAreaClusterLabel = (order = {}, lang = 'ar') => {
  if (lang === 'ar') {
    return order.internalAreaArLabel || order.internalAreaLabel || [order.district, order.city].filter(Boolean).join(' - ') || 'غير محدد';
  }
  return order.internalAreaLabel || order.internalAreaArLabel || [order.district, order.city].filter(Boolean).join(' - ') || 'Unassigned';
};

export const compareOrdersByInternalArea = (left = {}, right = {}) => {
  const areaRank = (Number(left.internalAreaSortOrder) || 999) - (Number(right.internalAreaSortOrder) || 999);
  if (areaRank !== 0) {
    return areaRank;
  }

  const leftLabel = `${left.internalAreaLabel || left.internalAreaArLabel || left.city || ''} ${left.district || ''}`.trim();
  const rightLabel = `${right.internalAreaLabel || right.internalAreaArLabel || right.city || ''} ${right.district || ''}`.trim();
  const labelRank = leftLabel.localeCompare(rightLabel, 'ar');
  if (labelRank !== 0) {
    return labelRank;
  }

  const dateRank = `${left.scheduledDate || ''} ${left.scheduledTime || ''}`.localeCompare(
    `${right.scheduledDate || ''} ${right.scheduledTime || ''}`
  );
  if (dateRank !== 0) {
    return dateRank;
  }

  return `${left.customerName || ''}`.localeCompare(`${right.customerName || ''}`, 'ar');
};

export const getTimeStandardLabel = (standard, lang = 'ar') => {
  if (!standard) {
    return lang === 'ar' ? 'غير محدد' : 'Not assigned';
  }

  const label = lang === 'ar' ? standard.arLabel || standard.label : standard.label || standard.arLabel;
  return `${label} - ${Number(standard.durationMinutes) || 0} min`;
};

const normalizeRole = (role) => (role === 'admin' ? 'operations_manager' : role || '');

const todayString = () => new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const calculateElapsedMinutes = (startedAt, endedAt = null) => {
  const start = startedAt ? new Date(startedAt) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return 0;
  }

  const end = endedAt ? new Date(endedAt) : new Date();
  if (!end || Number.isNaN(end.getTime())) {
    return 0;
  }

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
};

export const buildEscalationSnapshot = (order = {}, timeStandards = []) => {
  const matchedStandard =
    (timeStandards || []).find((entry) => entry.standardKey === order.serviceCategory || entry.standardKey === order.standardKey) || null;
  const standardDurationMinutes =
    Math.max(1, Number(order.standardDurationMinutes) || Number(matchedStandard?.durationMinutes) || 120);
  const elapsedMinutes = calculateElapsedMinutes(
    order.workStartedAt,
    order.status === 'completed' ? order.completedAt || order.updatedAt : null
  );
  const warningThreshold = Math.round(standardDurationMinutes * 1.15);
  const criticalThreshold = Math.round(standardDurationMinutes * 1.3);
  const escalationLevel =
    elapsedMinutes >= criticalThreshold ? 2 : elapsedMinutes >= warningThreshold ? 1 : 0;

  return {
    matchedStandard,
    standardDurationMinutes,
    elapsedMinutes,
    warningThreshold,
    criticalThreshold,
    overtimeMinutes: Math.max(0, elapsedMinutes - standardDurationMinutes),
    escalationLevel,
    isWarning: escalationLevel === 1,
    isCritical: escalationLevel === 2,
    needsDelayReason: elapsedMinutes > standardDurationMinutes,
  };
};

const normalizeAcDetails = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const type = String(item?.type || '').trim().toLowerCase();
      const quantity = Math.max(1, Number(item?.quantity) || 1);
      if (!type) {
        return null;
      }
      return {
        id: String(item?.id || `ac-${index}-${type}`),
        type,
        quantity,
      };
    })
    .filter(Boolean);

const normalizeDeliveryType = (value) => {
  const normalized = String(value || 'none').trim().toLowerCase();
  return ['none', 'standard', 'express_24h'].includes(normalized) ? normalized : 'none';
};

const isFastDeliveryCity = (city) => FAST_DELIVERY_CITIES.includes(String(city || '').trim());

const defaultState = {
  users: [],
  orders: [],
};

const defaultHomeSettings = {
  heroKicker: 'Built for the team',
  heroTitle: 'Made with care to simplify the journey of customer service and the operations manager.',
  heroSubtitle:
    'A private request workspace that keeps intake fast, statuses clear, and heavy daily order volumes easier to manage.',
  primaryButtonText: 'Sign in',
  primaryButtonUrl: '/login',
  secondaryButtonText: 'Sign in',
  secondaryButtonUrl: '/login',
  stats: [
    { value: '3', label: 'Dedicated workspaces' },
    { value: '4', label: 'Regional accounts' },
    { value: '2', label: 'Core office roles' },
    { value: 'Instant', label: 'Customer service alerts' },
  ],
};

const defaultFooter = {
  aboutText:
    'A focused internal workspace for customer service, the operations manager, and the four regional accounts.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'Login', url: '/login' },
  ],
  customerServiceLinks: [
    { label: 'Support', url: 'tel:+966558232644' },
    { label: 'WhatsApp', url: 'https://wa.me/966558232644' },
    { label: 'Call us', url: 'tel:+966558232644' },
  ],
  socialLinks: [
    { platform: 'whatsapp', url: 'https://wa.me/966558232644' },
    { platform: 'x', url: 'https://x.com/tarkeebpro' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/tarkeebpro' },
  ],
  copyrightText: 'Tarkeeb Pro Internal',
};

const normalizePersistedState = (state) => {
  const incoming = safeJson(JSON.stringify(state), {}) || {};
  const persistedUsers = Array.isArray(incoming.users) ? incoming.users : [];
  const mergedUsers = defaultState.users.map((defaultUser) => {
    const persisted = persistedUsers.find(
      (user) => String(user?.id || '') === defaultUser.id || String(user?.role || '') === defaultUser.role
    );
    return { ...persisted, ...defaultUser };
  });

  return {
    ...defaultState,
    ...incoming,
    users: mergedUsers,
    orders: Array.isArray(incoming.orders)
      ? incoming.orders.map((order) => ({
          ...order,
          deliveryType: normalizeDeliveryType(order?.deliveryType),
        }))
      : defaultState.orders,
  };
};

const readStoredNotifications = () => safeJson(readStorage(NOTIFICATIONS_STORAGE_KEY), []);

const writeStoredNotifications = (items) => {
  writeStorage(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items || []));
  window.dispatchEvent(new CustomEvent('operations-updated'));
};

const readState = () => {
  clearLegacyOrders();
  const raw = readStorage(STORAGE_KEY);
  if (!raw) {
    writeStorage(STORAGE_KEY, JSON.stringify(defaultState));
    return clone(defaultState);
  }
  return normalizePersistedState(safeJson(raw, clone(defaultState)));
};

const writeState = (nextState) => {
  writeStorage(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent('operations-updated'));
  return clone(nextState);
};

const getState = () => clone(readState());

const getActiveAuthUser = () => {
  const user = safeJson(readStorage('authUser'), null);
  if (!user) {
    return null;
  }
  return { ...user, role: normalizeRole(user.role) };
};

const nextNotificationId = (items = []) =>
  items.reduce((maxId, item) => Math.max(maxId, Number(item?.id) || 0), 0) + 1;

const appendNotificationsForRoles = (state, roles = [], payload = {}) => {
  const targetUserIds = (state.users || [])
    .filter((user) => roles.includes(normalizeRole(user.role)))
    .map((user) => String(user.id));

  if (!targetUserIds.length) {
    return;
  }

  const items = readStoredNotifications();
  let currentId = nextNotificationId(items);
  const createdAt = nowIso();
  const nextItems = [
    ...targetUserIds.map((userId) => ({
      id: currentId++,
      userId,
      title: String(payload.title || 'Notification'),
      body: String(payload.body || ''),
      kind: String(payload.kind || 'status_update'),
      relatedOrderId: payload.relatedOrderId || null,
      isRead: false,
      createdAt,
    })),
    ...items,
  ].slice(0, 150);

  writeStoredNotifications(nextItems);
};

const statusOrder = {
  pending: 0,
  scheduled: 1,
  in_transit: 2,
  completed: 3,
  canceled: 4,
};

const sortOrders = (orders = []) =>
  [...orders].sort((left, right) => {
    const leftRank = statusOrder[left.status] ?? 99;
    const rightRank = statusOrder[right.status] ?? 99;
    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }
    return `${right.updatedAt || right.createdAt || ''}`.localeCompare(`${left.updatedAt || left.createdAt || ''}`);
  });

const mapRemoteOrder = (order = {}) => ({
  id: order.id || `ORD-${order.numericId || Date.now()}`,
  numericId: Number(order.numericId) || Number(String(order.id || '').replace(/\D/g, '')) || Date.now(),
  requestNumber: order.requestNumber || order.request_number || order.source || order.id,
  customerName: order.customerName || order.customer_name || '',
  phone: normalizeSaudiPhoneNumber(order.phone),
  secondaryPhone: normalizeSaudiPhoneNumber(order.secondaryPhone || order.secondary_phone || ''),
  whatsappPhone: normalizeSaudiPhoneNumber(order.whatsappPhone || order.whatsapp_phone || order.phone),
  city: order.city || '',
  district: order.district || '',
  addressText: order.addressText || order.address_text || order.address || '',
  landmark: order.landmark || '',
  mapLink: order.mapLink || order.map_link || order.address || '',
  sourceChannel: order.sourceChannel || order.source || 'الزامل',
  serviceSummary: order.serviceSummary || order.workType || order.work_type || '',
  acCount:
    Math.max(
      0,
      Number(order.acCount || order.ac_count) ||
        normalizeAcDetails(order.acDetails || order.serviceItems).reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0)
    ) || 0,
  priority: order.priority || 'normal',
  deliveryType: normalizeDeliveryType(order.deliveryType || order.delivery_type),
  preferredDate: order.preferredDate || order.preferred_date || order.scheduledDate || order.scheduled_date || '',
  preferredTime: order.preferredTime || order.preferred_time || order.scheduledTime || order.scheduled_time || '',
  scheduledDate: order.scheduledDate || order.scheduled_date || '',
  scheduledTime: order.scheduledTime || order.scheduled_time || '',
  coordinationNote: order.coordinationNote || order.coordination_note || '',
  notes: order.notes || '',
  acDetails: normalizeAcDetails(order.acDetails || order.serviceItems),
  acType: order.acType || order.ac_type || '',
  serviceCategory: order.serviceCategory || order.service_category || '',
  standardDurationMinutes: Number(order.standardDurationMinutes || order.standard_duration_minutes) || 120,
  workStartedAt: order.workStartedAt || order.work_started_at || null,
  completionNote: order.completionNote || order.completion_note || '',
  delayReason: order.delayReason || order.delay_reason || '',
  delayNote: order.delayNote || order.delay_note || '',
  status: order.status || 'pending',
  externalStatus: order.externalStatus || order.external_status || order.excelStatus || extractExcelStatusFromNotes(order.notes),
  customerAction: order.customerAction || order.customer_action || 'none',
  rescheduleReason: order.rescheduleReason || order.reschedule_reason || '',
  cancellationReason: order.cancellationReason || order.cancellation_reason || '',
  canceledAt: order.canceledAt || order.canceled_at || null,
  completedAt: order.completedAt || order.completed_at || null,
  approvalStatus: order.approvalStatus || order.approval_status || 'pending',
  proofStatus: order.proofStatus || order.proof_status || 'pending_review',
  approvedAt: order.approvedAt || order.approved_at || null,
  approvedBy: order.approvedBy || order.approved_by || '',
  clientSignature: order.clientSignature || order.client_signature || '',
  zamilClosureStatus: order.zamilClosureStatus || order.zamil_closure_status || 'idle',
  zamilCloseRequestedAt: order.zamilCloseRequestedAt || order.zamil_close_requested_at || null,
  zamilOtpCode: order.zamilOtpCode || order.zamil_otp_code || '',
  zamilOtpSubmittedAt: order.zamilOtpSubmittedAt || order.zamil_otp_submitted_at || null,
  zamilClosedAt: order.zamilClosedAt || order.zamil_closed_at || null,
  suspensionReason: order.suspensionReason || order.suspension_reason || '',
  suspensionNote: order.suspensionNote || order.suspension_note || '',
  suspendedAt: order.suspendedAt || order.suspended_at || null,
  exceptionStatus: order.exceptionStatus || order.exception_status || 'none',
  technicianId: order.technicianId || order.technician_id || '',
  technicianUserId: order.technicianUserId || order.technician_user_id || '',
  technicianName: order.technicianName || order.technician_name || '',
  photos: Array.isArray(order.photos) ? order.photos : [],
  extras: order.extras || null,
  createdByUserId: order.createdByUserId || order.created_by_user_id || '',
  createdByName: order.createdByName || order.created_by_name || '',
  createdAt: order.createdAt || order.created_at || nowIso(),
  updatedAt: order.updatedAt || order.updated_at || nowIso(),
  auditLog: Array.isArray(order.auditLog) ? order.auditLog : [],
});

const buildSummary = (orders = []) => ({
  totalOrders: orders.filter((order) => order.status !== 'canceled').length,
  pendingOrders: orders.filter((order) => order.status === 'pending').length,
  activeOrders: orders.filter((order) => ['scheduled', 'in_transit'].includes(order.status)).length,
  completedOrders: orders.filter((order) => order.status === 'completed').length,
  inTransitOrders: orders.filter((order) => order.status === 'in_transit').length,
  canceledOrders: orders.filter((order) => order.status === 'canceled').length,
});

const getDailyTasksPayload = (orders = [], selectedDate = todayString()) => {
  const normalizedDate = selectedDate || todayString();
  const todayOrders = orders.filter((order) => {
    const taskDate = order.scheduledDate || order.preferredDate || String(order.createdAt || '').slice(0, 10);
    return taskDate === normalizedDate && order.status !== 'canceled';
  });

  return {
    date: normalizedDate,
    orders: sortOrders(todayOrders),
    summary: {
      total: todayOrders.length,
      pending: todayOrders.filter((order) => order.status === 'pending').length,
      scheduled: todayOrders.filter((order) => order.status === 'scheduled').length,
      inTransit: todayOrders.filter((order) => order.status === 'in_transit').length,
      completed: todayOrders.filter((order) => order.status === 'completed').length,
    },
  };
};

const delay = (value) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), 80);
  });

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const allowDemoFallback = process.env.REACT_APP_ALLOW_DEMO_FALLBACK === 'true';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalhost ? 'http://127.0.0.1:5000/api' : '/api');
const BACKEND_API_BASE_URL =
  process.env.REACT_APP_BACKEND_API_URL ||
  (isLocalhost ? 'http://127.0.0.1:5000/api' : '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
const backendApiClient = BACKEND_API_BASE_URL
  ? axios.create({
      baseURL: BACKEND_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  : null;

apiClient.interceptors.request.use((config) => {
  const token = readStorage('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
if (backendApiClient) {
  backendApiClient.interceptors.request.use((config) => {
    const token = readStorage('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

const withFallback = async (remoteAction, localAction) => {
  try {
    return await remoteAction();
  } catch (error) {
    if (!allowDemoFallback) {
      throw error;
    }
    const status = error?.response?.status;
    if (status && status < 500 && status !== 404) {
      throw error;
    }
    return localAction();
  }
};

const buildAuditEntry = (actor, message) => ({
  id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: 'note',
  actor,
  message,
  createdAt: nowIso(),
});

const localAuthService = {
  async login(email, password) {
    const state = readState();
    const user = state.users.find(
      (entry) =>
        String(entry.email || '').toLowerCase() === String(email || '').trim().toLowerCase() &&
        entry.password === password
    );
    if (!user) {
      throw new Error('Invalid login details');
    }
    const safeUser = { ...user, role: normalizeRole(user.role) };
    delete safeUser.password;
    return delay({
      data: {
        token: btoa(`${safeUser.role}:${safeUser.email}:${Date.now()}`),
        user: safeUser,
      },
    });
  },
};

const localOperationsService = {
  async getDashboard() {
    const state = getState();
    const orders = sortOrders(state.orders || []);
    return delay({
      data: {
        orders,
        summary: buildSummary(orders),
      },
    });
  },

  async createOrder(payload) {
    const activeUser = getActiveAuthUser();
    if (!activeUser || activeUser.role !== 'customer_service') {
      throw new Error('Only customer service can create requests');
    }

    const requestNumber = String(payload?.requestNumber || '').trim();
    const customerName = String(payload?.customerName || '').trim();
    const phone = normalizeSaudiPhoneNumber(payload?.phone);
    const secondaryPhone = normalizeSaudiPhoneNumber(payload?.secondaryPhone);
    const whatsappPhone = normalizeSaudiPhoneNumber(payload?.whatsappPhone || payload?.phone);
    const city = String(payload?.city || '').trim();
    const district = String(payload?.district || '').trim();
    const addressText = String(payload?.addressText || '').trim();
    const landmark = String(payload?.landmark || '').trim();
    const mapLink = String(payload?.mapLink || '').trim();
    const sourceChannel = String(payload?.sourceChannel || 'الزامل').trim();
    const serviceSummary = String(payload?.serviceSummary || '').trim();
    const deliveryType = normalizeDeliveryType(payload?.deliveryType);
    const priority = deliveryType === 'none' ? String(payload?.priority || 'normal').trim() : 'urgent';
    const preferredDate = String(payload?.preferredDate || '').trim();
    const preferredTime = String(payload?.preferredTime || '').trim();
    const notes = String(payload?.notes || '').trim();
    const acDetails = normalizeAcDetails(payload?.acDetails);

    if (!requestNumber || !customerName || !phone || !city || !district || !addressText || !mapLink || !serviceSummary || !preferredDate || !preferredTime || !acDetails.length) {
      throw new Error('Please complete all required order details');
    }

    if (deliveryType === 'express_24h' && !isFastDeliveryCity(city)) {
      throw new Error('Fast delivery is only available in the listed major cities');
    }

    const state = readState();
    const numericId = Date.now();
    const order = {
      id: `ORD-${numericId}`,
      numericId,
      requestNumber,
      customerName,
      phone,
      secondaryPhone,
      whatsappPhone,
      city,
      district,
      addressText,
      landmark,
      mapLink,
      sourceChannel,
      serviceSummary,
      priority,
      deliveryType,
      preferredDate,
      preferredTime,
      scheduledDate: preferredDate,
      scheduledTime: '',
      coordinationNote: '',
      notes,
      acDetails,
      status: 'pending',
      customerAction: 'none',
      rescheduleReason: '',
      cancellationReason: '',
      canceledAt: null,
      completedAt: null,
      createdByUserId: activeUser.id,
      createdByName: activeUser.name,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      auditLog: [
        buildAuditEntry(
          'customer_service',
          `تم إنشاء الطلب ${requestNumber} للعميل ${customerName}${deliveryType !== 'none' ? ` مع ${deliveryType === 'express_24h' ? 'توصيل سريع' : 'طلب توصيل'}` : ''}`
        ),
      ],
    };

    writeState({
      ...state,
      orders: [order, ...(state.orders || [])],
    });

    appendNotificationsForRoles(state, ['operations_manager'], {
      title: deliveryType === 'none' ? 'طلب جديد بانتظار العمليات' : 'طلب توصيل بأولوية قصوى',
      body:
        deliveryType === 'none'
          ? `طلب ${requestNumber} للعميل ${customerName} جاهز للتنسيق والجدولة.`
          : `طلب ${requestNumber} للعميل ${customerName} يتضمن ${deliveryType === 'express_24h' ? 'توصيلاً سريعاً خلال 24 ساعة' : 'توصيلاً'} ويحتاج متابعة عاجلة.`,
      kind: 'new_order',
      relatedOrderId: order.id,
    });

    return delay({ data: { order } });
  },

  async updateOrder(orderId, changes = {}) {
    const activeUser = getActiveAuthUser();
    if (!activeUser) {
      throw new Error('Unauthorized');
    }

    const state = readState();
    const currentOrder = (state.orders || []).find((order) => String(order.id) === String(orderId));
    if (!currentOrder) {
      throw new Error('Request not found');
    }

    const nextOrder = { ...currentOrder };
    const previousStatus = String(currentOrder.status || '').trim();

    const setIfPresent = (key, transform = (value) => value) => {
      if (changes[key] !== undefined) {
        nextOrder[key] = transform(changes[key]);
      }
    };

    if (activeUser.role === 'customer_service') {
      [
        ['requestNumber', (v) => String(v || '').trim()],
        ['customerName', (v) => String(v || '').trim()],
        ['phone', (v) => normalizeSaudiPhoneNumber(v)],
        ['secondaryPhone', (v) => normalizeSaudiPhoneNumber(v)],
        ['whatsappPhone', (v) => normalizeSaudiPhoneNumber(v)],
        ['city', (v) => String(v || '').trim()],
        ['district', (v) => String(v || '').trim()],
        ['addressText', (v) => String(v || '').trim()],
        ['landmark', (v) => String(v || '').trim()],
        ['mapLink', (v) => String(v || '').trim()],
        ['sourceChannel', (v) => String(v || '').trim()],
        ['serviceSummary', (v) => String(v || '').trim()],
        ['priority', (v) => String(v || 'normal').trim()],
        ['preferredDate', (v) => String(v || '').trim()],
        ['preferredTime', (v) => String(v || '').trim()],
        ['notes', (v) => String(v || '').trim()],
      ].forEach(([key, transform]) => setIfPresent(key, transform));

      if (changes.deliveryType !== undefined) {
        nextOrder.deliveryType = normalizeDeliveryType(changes.deliveryType);
        if (nextOrder.deliveryType !== 'none') {
          nextOrder.priority = 'urgent';
        }
      }

      if (changes.acDetails !== undefined) {
        nextOrder.acDetails = normalizeAcDetails(changes.acDetails);
      }

      if (changes.customerAction === 'reschedule_requested') {
        nextOrder.customerAction = 'reschedule_requested';
        nextOrder.rescheduleReason = String(changes.rescheduleReason || '').trim();
        nextOrder.status = nextOrder.status === 'completed' ? 'completed' : 'pending';
        nextOrder.auditLog = [
          ...(nextOrder.auditLog || []),
          buildAuditEntry('customer_service', `طلبت خدمة العملاء إعادة جدولة الطلب. ${nextOrder.rescheduleReason}`),
        ];
        appendNotificationsForRoles(state, ['operations_manager'], {
          title: 'طلب إعادة جدولة',
          body: `تم طلب إعادة جدولة ${nextOrder.requestNumber} للعميل ${nextOrder.customerName}.`,
          relatedOrderId: nextOrder.id,
        });
      }

      if (changes.status === 'canceled') {
        nextOrder.status = 'canceled';
        nextOrder.customerAction = 'cancel_requested';
        nextOrder.cancellationReason = String(changes.cancellationReason || '').trim();
        nextOrder.canceledAt = nowIso();
        nextOrder.auditLog = [
          ...(nextOrder.auditLog || []),
          buildAuditEntry('customer_service', `ألغت خدمة العملاء الطلب. ${nextOrder.cancellationReason}`),
        ];
        appendNotificationsForRoles(state, ['operations_manager'], {
          title: 'تم إلغاء طلب',
          body: `تم إلغاء ${nextOrder.requestNumber} للعميل ${nextOrder.customerName}.`,
          relatedOrderId: nextOrder.id,
        });
      }
    }

    if (activeUser.role === 'operations_manager') {
      [
        ['scheduledDate', (v) => String(v || '').trim()],
        ['scheduledTime', (v) => String(v || '').trim()],
        ['coordinationNote', (v) => String(v || '').trim()],
        ['priority', (v) => String(v || 'normal').trim()],
        ['preferredDate', (v) => String(v || '').trim()],
        ['preferredTime', (v) => String(v || '').trim()],
        ['notes', (v) => String(v || '').trim()],
      ].forEach(([key, transform]) => setIfPresent(key, transform));

      if (changes.deliveryType !== undefined) {
        nextOrder.deliveryType = normalizeDeliveryType(changes.deliveryType);
        if (nextOrder.deliveryType !== 'none') {
          nextOrder.priority = 'urgent';
        }
      }

      if (changes.status !== undefined) {
        nextOrder.status = String(changes.status || nextOrder.status).trim();
        if (nextOrder.status === 'completed') {
          nextOrder.completedAt = nowIso();
        }
      }

      if (changes.customerAction !== undefined) {
        nextOrder.customerAction = String(changes.customerAction || 'none').trim();
      }

      if (changes.contactCustomerNote !== undefined) {
        const note = String(changes.contactCustomerNote || '').trim();
        if (note) {
          nextOrder.coordinationNote = [nextOrder.coordinationNote, `اتصل بالعميل: ${note}`].filter(Boolean).join('\n');
        }
      }

      nextOrder.auditLog = [
        ...(nextOrder.auditLog || []),
        buildAuditEntry(
          'operations_manager',
          changes.contactCustomerNote
            ? `سجل مدير العمليات تواصلاً مع العميل. ${String(changes.contactCustomerNote || '').trim()}`
            : 'قام مدير العمليات بتحديث تنسيق الموعد أو الحالة.'
        ),
      ];
    }

    if (activeUser.role === 'technician') {
      if (currentOrder.technicianUserId && String(currentOrder.technicianUserId) !== String(activeUser.id)) {
        throw new Error('This task is not assigned to the active technician');
      }

      const touchedKeys = Object.keys(changes || {}).filter((key) => changes[key] !== undefined);
      if (touchedKeys.some((key) => key !== 'clientSignature')) {
        throw new Error('Technicians can only update the client signature from this screen');
      }

      nextOrder.clientSignature = String(changes.clientSignature || '').trim();
      nextOrder.auditLog = [
        ...(nextOrder.auditLog || []),
        buildAuditEntry('technician', 'قام الفني بتحديث توقيع العميل.'),
      ];
    }

    nextOrder.updatedAt = nowIso();

    if (nextOrder.deliveryType === 'express_24h' && !isFastDeliveryCity(nextOrder.city)) {
      throw new Error('Fast delivery is only available in the listed major cities');
    }

    const nextOrders = (state.orders || []).map((order) => (String(order.id) === String(orderId) ? nextOrder : order));
    writeState({ ...state, orders: nextOrders });

    if (activeUser.role === 'operations_manager' && changes.status !== undefined && nextOrder.status !== previousStatus) {
      appendNotificationsForRoles(state, ['customer_service'], {
        title: 'تم تحديث حالة الطلب',
        body: `تم تحديث حالة الطلب رقم ${nextOrder.requestNumber} إلى ${ORDER_STATUS_AR_LABELS[nextOrder.status] || nextOrder.status}.`,
        relatedOrderId: nextOrder.id,
      });
    }

    if (activeUser.role === 'operations_manager' && (changes.scheduledDate !== undefined || changes.scheduledTime !== undefined)) {
      appendNotificationsForRoles(state, ['customer_service'], {
        title: 'تم تنسيق موعد الطلب',
        body: `تم تحديد موعد ${nextOrder.requestNumber} بتاريخ ${nextOrder.scheduledDate || '-'} الساعة ${nextOrder.scheduledTime || '-'}.`,
        relatedOrderId: nextOrder.id,
      });
    }

    if (activeUser.role === 'customer_service' && nextOrder.deliveryType !== 'none') {
      appendNotificationsForRoles(state, ['operations_manager'], {
        title: 'طلب توصيل بأولوية قصوى',
        body: `تم تحديث ${nextOrder.requestNumber} كطلب ${nextOrder.deliveryType === 'express_24h' ? 'توصيل سريع خلال 24 ساعة' : 'توصيل'} ويتطلب متابعة عاجلة.`,
        relatedOrderId: nextOrder.id,
      });
    }

    return delay({ data: { order: nextOrder } });
  },

  async updateOrderStatus(orderId, status) {
    return this.updateOrder(orderId, { status });
  },

  async quickUpdateOrderStatus(orderId, status) {
    const normalizedStatus = status === 'rescheduled' ? 'scheduled' : status;
    return this.updateOrder(orderId, { status: normalizedStatus });
  },

  async getDailyTasks(selectedDate = todayString()) {
    const state = getState();
    return delay({ data: getDailyTasksPayload(state.orders || [], selectedDate) });
  },

  async getSummary() {
    const state = getState();
    return delay({ data: { summary: buildSummary(state.orders || []) } });
  },
};

const remoteOperationsService = {
  getDashboard: () => apiClient.get('/operations/dashboard'),
  getTechnicianOrders: (technicianId) => apiClient.get('/operations/technician/orders', { params: { technicianId } }),
  createOrder: (data) => apiClient.post('/operations/orders', data),
  importOrders: (data) => apiClient.post('/operations/orders/import', data),
  createTechnician: (data) => apiClient.post('/operations/technicians', data),
  updateOrder: (orderId, data) => apiClient.put(`/operations/orders/${String(orderId).replace(/^ORD-/, '')}`, data),
  quickUpdateOrderStatus: (orderId, status) => apiClient.patch(`/orders/${String(orderId).replace(/^ORD-/, '')}`, { status }),
  updateOrderStatus: (orderId, status) =>
    apiClient.put(`/operations/orders/${String(orderId).replace(/^ORD-/, '')}/status`, { status }),
  updateTechnicianStatus: (orderId, payload) =>
    apiClient.put(`/operations/orders/${String(orderId).replace(/^ORD-/, '')}/status`, payload),
  updateTechnicianAvailability: (technicianId, status) =>
    apiClient.put(`/operations/technicians/${String(technicianId)}/status`, { status }),
  uploadPhoto: (orderId, data) => apiClient.post(`/operations/orders/${String(orderId).replace(/^ORD-/, '')}/photos`, data),
  requestClosure: (orderId, data) =>
    apiClient.post(`/operations/orders/${String(orderId).replace(/^ORD-/, '')}/close-request`, data),
  submitClosureOtp: (orderId, otpCode) =>
    apiClient.post(`/operations/orders/${String(orderId).replace(/^ORD-/, '')}/close-otp`, { otpCode }),
  approveClosure: (orderId) =>
    apiClient.post(`/operations/orders/${String(orderId).replace(/^ORD-/, '')}/close-approve`),
  getSummary: () => apiClient.get('/operations/summary'),
};

export const authService = {
  login: (email, password) =>
    withFallback(
      () => apiClient.post('/auth/login', { email, password }),
      () => localAuthService.login(email, password)
    ),
  logout: () => removeStorage('authToken'),
};

export const operationsService = {
  getDashboard: () =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.getDashboard();
        const orders = sortOrders((response.data?.orders || []).map(mapRemoteOrder));
        return {
          data: {
            ...response.data,
            orders,
            summary: response.data?.summary || buildSummary(orders),
          },
        };
      },
      () => localOperationsService.getDashboard()
    ),
  createOrder: (data) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.createOrder(data);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      () => localOperationsService.createOrder(data)
    ),
  importOrdersFromExcel: async (fileName = 'data.xlsx') => {
    const preview = backendApiClient
      ? await backendApiClient.get('/operations/excel-import/preview', {
          params: { fileName },
        })
      : await axios.get('/excel-import/orders.json');
    const orders = Array.isArray(preview.data?.orders) ? preview.data.orders : [];

    if (!orders.length) {
      return {
        data: {
          importedCount: 0,
          skippedCount: 0,
          skippedOrders: [],
          preview: preview.data || null,
        },
      };
    }

    const chunkSize = 100;
    let importedCount = 0;
    let skippedCount = 0;
    const skippedOrders = [];

    for (let index = 0; index < orders.length; index += chunkSize) {
      const chunk = orders.slice(index, index + chunkSize);
      const response = await remoteOperationsService.importOrders({
        fileName,
        orders: chunk,
      });
      importedCount += Number(response.data?.importedCount) || 0;
      skippedCount += Number(response.data?.skippedCount) || 0;
      skippedOrders.push(...(response.data?.skippedOrders || []));
    }

    window.dispatchEvent(new CustomEvent('operations-updated'));
    return {
      data: {
        fileName,
        importedCount,
        skippedCount,
        skippedOrders,
        preview: preview.data || null,
      },
    };
  },
  uploadExcelSource: async (file) => {
    if (!backendApiClient) {
      throw new Error('Excel upload requires the local backend at :5000');
    }

    if (!file) {
      throw new Error('Choose an Excel file first');
    }

    const formData = new FormData();
    formData.append('file', file);

    return backendApiClient.post('/operations/excel-import/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  createTechnician: (data) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.createTechnician(data);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      async () => {
        throw new Error('Technician creation is unavailable in local mode');
      }
    ),
  updateOrder: (orderId, data) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.updateOrder(orderId, data);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      () => localOperationsService.updateOrder(orderId, data)
    ),
  updateOrderStatus: (orderId, status) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.updateOrderStatus(orderId, status);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      () => localOperationsService.updateOrderStatus(orderId, status)
    ),
  quickUpdateOrderStatus: (orderId, status) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.quickUpdateOrderStatus(orderId, status);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return {
          ...response,
          data: {
            ...response.data,
            order: response.data?.order ? mapRemoteOrder(response.data.order) : null,
          },
        };
      },
      () => localOperationsService.quickUpdateOrderStatus(orderId, status)
    ),
  getTechnicianOrders: (technicianId) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.getTechnicianOrders(technicianId);
        const orders = sortOrders((response.data?.orders || []).map(mapRemoteOrder));
        return {
          data: {
            ...response.data,
            orders,
          },
        };
      },
      async () => {
        throw new Error('Technician orders are unavailable in local mode');
      }
    ),
  updateTechnicianStatus: (orderId, status, extra = {}) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.updateTechnicianStatus(orderId, { status, ...extra });
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      async () => {
        throw new Error('Technician status updates are unavailable in local mode');
      }
    ),
  updateTechnicianAvailability: (technicianId, status) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.updateTechnicianAvailability(technicianId, status);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      async () => {
        throw new Error('Technician availability updates are unavailable in local mode');
      }
    ),
  uploadPhoto: (orderId, data) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.uploadPhoto(orderId, data);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      async () => {
        throw new Error('Photo uploads are unavailable in local mode');
      }
    ),
  requestClosure: (orderId, data) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.requestClosure(orderId, data);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      async () => {
        throw new Error('Closure requests are unavailable in local mode');
      }
    ),
  submitClosureOtp: (orderId, otpCode) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.submitClosureOtp(orderId, otpCode);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      async () => {
        throw new Error('OTP submission is unavailable in local mode');
      }
    ),
  approveClosure: (orderId) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.approveClosure(orderId);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      async () => {
        throw new Error('Closure approval is unavailable in local mode');
      }
    ),
  getDailyTasks: (selectedDate) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.getDashboard();
        const orders = sortOrders((response.data?.orders || []).map(mapRemoteOrder));
        return { data: getDailyTasksPayload(orders, selectedDate) };
      },
      () => localOperationsService.getDailyTasks(selectedDate)
    ),
  getSummary: () =>
    withFallback(
      () => remoteOperationsService.getSummary(),
      () => localOperationsService.getSummary()
    ),
};

export const notificationsService = {
  getConfig: async () => {
    try {
      return await apiClient.get('/notifications/config');
    } catch (error) {
      if (!allowDemoFallback) {
        throw error;
      }

      return {
        data: {
          enabled: false,
          publicKey: null,
        },
      };
    }
  },
  subscribe: async (subscription) => {
    try {
      return await apiClient.post('/notifications/subscribe', subscription);
    } catch (error) {
      if (!allowDemoFallback) {
        throw error;
      }

      return {
        data: {
          ok: false,
          local: true,
        },
      };
    }
  },
  list: async () => {
    try {
      return await apiClient.get('/notifications');
    } catch (error) {
      if (!allowDemoFallback) {
        throw error;
      }

      const activeUser = getActiveAuthUser();
      const items = readStoredNotifications().filter((item) => String(item.userId) === String(activeUser?.id || ''));
      return {
        data: {
          notifications: items,
          unreadCount: items.filter((item) => !item.isRead).length,
        },
      };
    }
  },
  markAllRead: async () => {
    try {
      return await apiClient.put('/notifications/read-all');
    } catch (error) {
      if (!allowDemoFallback) {
        throw error;
      }
      const activeUser = getActiveAuthUser();
      const nextItems = readStoredNotifications().map((item) =>
        String(item.userId) === String(activeUser?.id || '') ? { ...item, isRead: true } : item
      );
      writeStoredNotifications(nextItems);
      return { data: { ok: true } };
    }
  },
};

export const footerService = {
  get: () =>
    withFallback(
      () => apiClient.get('/footer'),
      () => delay({ data: { footer: defaultFooter } })
    ),
};

export const homeService = {
  get: () =>
    withFallback(
      () => apiClient.get('/home-settings'),
      () => delay({ data: { homeSettings: defaultHomeSettings } })
    ),
};

export default apiClient;
