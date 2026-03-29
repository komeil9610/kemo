import axios from 'axios';

const STORAGE_KEY = 'tarkeeb-pro-db';
const NOTIFICATIONS_STORAGE_KEY = 'tarkeeb-pro-notifications';

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

const readStoredNotifications = () => safeJson(readStorage(NOTIFICATIONS_STORAGE_KEY), []);

const writeStoredNotifications = (items) => {
  writeStorage(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items || []));
  window.dispatchEvent(new CustomEvent('operations-updated'));
};

const writeSession = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    return;
  }
};

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

export const formatSaudiPhoneDisplay = (value) => {
  const normalized = normalizeSaudiPhoneNumber(value);
  return normalized || String(value || '');
};

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const allowDemoFallback =
  process.env.REACT_APP_ALLOW_DEMO_FALLBACK === 'true' ||
  process.env.NODE_ENV === 'development' ||
  isLocalhost;

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalhost ? 'http://127.0.0.1:5000/api' : '/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = readStorage('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const defaultTimeStandards = [
  {
    standardKey: 'split_installation',
    label: 'Wall split installation',
    arLabel: 'تركيب مكيف سبليت جداري',
    durationMinutes: 120,
    sortOrder: 1,
  },
  {
    standardKey: 'cassette_installation',
    label: 'Cassette AC installation',
    arLabel: 'تركيب مكيف كاسيت',
    durationMinutes: 180,
    sortOrder: 2,
  },
  {
    standardKey: 'preventive_maintenance',
    label: 'Preventive maintenance',
    arLabel: 'صيانة وقائية',
    durationMinutes: 45,
    sortOrder: 3,
  },
];

export const defaultAreaClusters = [
  {
    city: 'Dammam',
    district: 'Al Shatea',
    areaKey: 'zone-a',
    label: 'Zone A',
    arLabel: 'المنطقة أ',
    sortOrder: 1,
  },
  {
    city: 'Dammam',
    district: 'Al Zuhour',
    areaKey: 'zone-a',
    label: 'Zone A',
    arLabel: 'المنطقة أ',
    sortOrder: 1,
  },
  {
    city: 'Dammam',
    district: 'Al Fakhriyah',
    areaKey: 'zone-b',
    label: 'Zone B',
    arLabel: 'المنطقة ب',
    sortOrder: 2,
  },
  {
    city: 'Riyadh',
    district: 'Al Yasmin',
    areaKey: 'riyadh-north-1',
    label: 'North Riyadh 1',
    arLabel: 'شمال الرياض 1',
    sortOrder: 3,
  },
];

const defaultState = {
  users: [
    {
      id: 'admin-1',
      firstName: 'Tarkeeb',
      lastName: 'Pro',
      name: 'Tarkeeb Pro Admin',
      email: 'admin@tarkeebpro.sa',
      phone: '0500000001',
      password: 'Tarkeeb@123',
      role: 'admin',
    },
    {
      id: 'tech-user-1',
      firstName: 'Tarkeeb',
      lastName: 'Technician',
      name: 'Tarkeeb Pro Technician',
      email: 'technician@tarkeebpro.sa',
      phone: '0500000002',
      password: 'Tarkeeb@123',
      role: 'technician',
      technicianId: 'tech-1',
    },
    {
      id: 'tech-user-2',
      firstName: 'Mahmoud',
      lastName: 'Kumeel',
      name: 'Mahmoud Kumeel',
      email: 'moreme112982@gmail.com',
      phone: '05041102100',
      password: 'Tarkeeb@123',
      role: 'technician',
      technicianId: 'tech-2',
    },
  ],
  pricing: {
    includedCopperMeters: 3,
    copperPricePerMeter: 85,
    basePrice: 180,
  },
  timeStandards: defaultTimeStandards,
  areaClusters: defaultAreaClusters,
  technicians: [
    {
      id: 'tech-1',
      userId: 'tech-user-1',
      name: 'Tarkeeb Pro Technician',
      firstName: 'Tarkeeb',
      lastName: 'Technician',
      email: 'technician@tarkeebpro.sa',
      phone: '0500000002',
      region: 'Saudi Arabia',
      zone: 'Saudi Arabia',
      status: 'available',
      notes: 'Official Tarkeeb Pro field coverage.',
    },
    {
      id: 'tech-2',
      userId: 'tech-user-2',
      name: 'Mahmoud Kumeel',
      firstName: 'Mahmoud',
      lastName: 'Kumeel',
      email: 'moreme112982@gmail.com',
      phone: '05041102100',
      region: 'Riyadh',
      zone: 'Riyadh',
      status: 'available',
      notes: 'Riyadh coverage for Tarkeeb Pro.',
    },
  ],
  orders: [
    {
      id: 'ORD-1001',
      numericId: 1001,
      customerName: 'Abu Khaled',
      phone: '0555000111',
      district: 'Al Yasmin',
      city: 'Riyadh',
      address: 'Al Yasmin District - Riyadh',
      acType: 'Split AC 24,000 BTU',
      acCount: 1,
      serviceCategory: 'split_installation',
      standardDurationMinutes: 120,
      workStartedAt: null,
      completionNote: '',
      delayReason: '',
      delayNote: '',
      workType: 'Split AC installation',
      status: 'pending',
      scheduledDate: '2026-03-29',
      scheduledTime: '09:00',
      source: 'zamil',
      notes: 'Second floor - elevator available',
      technicianId: 'tech-1',
      technicianName: 'Tarkeeb Pro Technician',
      createdAt: '2026-03-28T08:15:00.000Z',
      updatedAt: '2026-03-28T08:15:00.000Z',
      extras: {
        copperMeters: 2,
        baseIncluded: true,
        totalPrice: 350,
      },
      serviceItems: [],
      photos: [],
      proofStatus: 'pending_review',
      approvalStatus: 'pending',
      approvedAt: null,
      approvedBy: '',
      clientSignature: '',
      zamilClosureStatus: 'idle',
      zamilCloseRequestedAt: null,
      zamilOtpCode: '',
      zamilOtpSubmittedAt: null,
      zamilClosedAt: null,
      suspensionReason: '',
      suspensionNote: '',
      suspendedAt: null,
      exceptionStatus: 'none',
      auditLog: [],
    },
  ],
};

const defaultHomeSettings = {
  heroKicker: 'Tarkeeb Pro Operations',
  heroTitle: 'Manage AC installation orders from your office to the customer site.',
  heroSubtitle:
    'One dashboard to log orders, assign technicians, track execution, and calculate copper and base extras instantly.',
  primaryButtonText: 'Open Admin Dashboard',
  primaryButtonUrl: '/dashboard',
  secondaryButtonText: 'Open Technician View',
  secondaryButtonUrl: '/tasks',
  stats: [
    { value: '1', label: 'Active technicians' },
    { value: '4', label: 'Live order states' },
    { value: '85 SAR', label: 'Copper meter price' },
  ],
};

const defaultFooter = {
  aboutText: 'Tarkeeb Pro keeps orders and field operations organized from one clear screen.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'Admin Dashboard', url: '/dashboard' },
    { label: 'Technician Tasks', url: '/tasks' },
  ],
  customerServiceLinks: [
    { label: 'Support', url: 'tel:+966558232644' },
    { label: 'WhatsApp', url: 'https://wa.me/966558232644' },
    { label: 'Call us', url: 'tel:+966558232644' },
  ],
  socialLinks: [
    { platform: 'instagram', url: 'https://instagram.com/tarkeebpro' },
    { platform: 'x', url: 'https://x.com/tarkeebpro' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/tarkeebpro' },
  ],
  copyrightText: 'Tarkeeb Pro',
};

const delay = (value) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), 120);
  });

const clone = (value) => JSON.parse(JSON.stringify(value));

const mergeSeedData = (primaryItems = [], fallbackItems = [], key) => {
  const seen = new Set();
  const merged = [];

  [...primaryItems, ...fallbackItems].forEach((item) => {
    const identifier = String(item?.[key] ?? '').toLowerCase();
    if (!identifier || seen.has(identifier)) {
      return;
    }

    seen.add(identifier);
    merged.push(item);
  });

  return merged;
};

const mergeTimeStandards = (primaryItems = [], fallbackItems = []) => {
  const seen = new Set();
  const merged = [];

  [...(primaryItems || []), ...(fallbackItems || [])].forEach((item, index) => {
    const standardKey = String(item?.standardKey || '').trim();
    if (!standardKey || seen.has(standardKey)) {
      return;
    }

    seen.add(standardKey);
    merged.push({
      standardKey,
      label: String(item?.label || '').trim() || standardKey,
      arLabel: String(item?.arLabel || '').trim() || String(item?.label || '').trim() || standardKey,
      durationMinutes: Math.max(1, Number(item?.durationMinutes) || 1),
      sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : index + 1,
    });
  });

  return merged.sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
};

const normalizeAreaText = (value) => String(value || '').trim().toLowerCase();

const mergeAreaClusters = (primaryItems = [], fallbackItems = []) => {
  const seen = new Set();
  const merged = [];

  [...(primaryItems || []), ...(fallbackItems || [])].forEach((item, index) => {
    const city = String(item?.city || '').trim();
    const district = String(item?.district || '').trim();
    const key = `${normalizeAreaText(city)}::${normalizeAreaText(district)}`;
    if (!city || !district || seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push({
      city,
      district,
      areaKey: String(item?.areaKey || item?.label || key).trim() || key,
      label: String(item?.label || item?.areaKey || key).trim() || key,
      arLabel:
        String(item?.arLabel || item?.label || item?.areaKey || `${city} - ${district}`).trim() ||
        `${city} - ${district}`,
      sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : index + 1,
    });
  });

  return merged.sort(
    (left, right) =>
      left.sortOrder - right.sortOrder ||
      left.label.localeCompare(right.label) ||
      left.city.localeCompare(right.city) ||
      left.district.localeCompare(right.district)
  );
};

const normalizeState = (state = {}) => ({
  ...clone(defaultState),
  ...state,
  users: mergeSeedData(defaultState.users, state.users, 'email'),
  technicians: mergeSeedData(defaultState.technicians, state.technicians, 'id'),
  timeStandards: mergeTimeStandards(state.timeStandards, defaultState.timeStandards),
  areaClusters: mergeAreaClusters(state.areaClusters, defaultState.areaClusters),
});

const buildToken = (user) => btoa(`${user.role}:${user.email}:${Date.now()}`);

const safeJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getActiveAuthUser = () => safeJson(readStorage('authUser'), null);

const nextNotificationId = (items = []) =>
  items.reduce((maxId, item) => Math.max(maxId, Number(item?.id) || 0), 0) + 1;

const appendNotificationsForUsers = (userIds = [], payload = {}) => {
  const normalizedUserIds = Array.from(new Set((userIds || []).map((item) => String(item || '').trim()).filter(Boolean)));
  if (!normalizedUserIds.length) {
    return;
  }

  const items = readStoredNotifications();
  let currentId = nextNotificationId(items);
  const createdAt = new Date().toISOString();

  const nextItems = [
    ...normalizedUserIds.map((userId) => ({
      id: currentId++,
      userId,
      title: String(payload.title || '').trim() || 'Notification',
      body: String(payload.body || '').trim() || '',
      kind: String(payload.kind || 'status_update').trim(),
      relatedOrderId: payload.relatedOrderId || null,
      isRead: false,
      createdAt,
    })),
    ...items,
  ].slice(0, 120);

  writeStoredNotifications(nextItems);
};

const notifyLocalAdmins = (state, payload = {}) => {
  const adminUserIds = (state?.users || [])
    .filter((user) => String(user?.role || '').trim() === 'admin')
    .map((user) => String(user.id));
  appendNotificationsForUsers(adminUserIds, payload);
};

const notifyLocalTechnicianUser = (state, technicianId, payload = {}) => {
  const technician = (state?.technicians || []).find((entry) => String(entry.id) === String(technicianId));
  if (!technician?.userId) {
    return;
  }
  appendNotificationsForUsers([String(technician.userId)], payload);
};

const readState = () => {
  const raw = readStorage(STORAGE_KEY);
  if (!raw) {
    writeStorage(STORAGE_KEY, JSON.stringify(defaultState));
    return clone(defaultState);
  }

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    writeStorage(STORAGE_KEY, JSON.stringify(defaultState));
    return clone(defaultState);
  }
};

const writeState = (nextState) => {
  writeStorage(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent('operations-updated'));
  return clone(nextState);
};

const getState = () => clone(readState());

const calculateExtrasTotal = (copperMeters, baseIncluded) => {
  const state = readState();
  const meters = Math.max(0, Number(copperMeters) || 0);
  return meters * state.pricing.copperPricePerMeter + (baseIncluded ? state.pricing.basePrice : 0);
};

const statusLabelMap = {
  pending: 'Pending',
  en_route: 'En route',
  in_progress: 'In progress',
  completed: 'Completed',
  canceled: 'Canceled',
  suspended: 'Suspended',
};

export const technicianStatusOptions = [
  { value: 'available', label: 'Available', arLabel: 'متاح' },
  { value: 'busy', label: 'Busy', arLabel: 'مشغول' },
];

export const delayReasonOptions = [
  {
    value: 'electrical_issue',
    label: 'Electrical foundation issue',
    arLabel: 'تأسيس الكهرباء كان خاطئاً',
  },
  {
    value: 'client_added_scope',
    label: 'Client added extra requests',
    arLabel: 'العميل أضاف طلبات جديدة',
  },
  {
    value: 'copper_difficulty',
    label: 'Copper routing difficulty',
    arLabel: 'صعوبة في التمديد النحاسي',
  },
  {
    value: 'site_not_ready',
    label: 'Site was not ready on time',
    arLabel: 'الموقع لم يكن جاهزاً في الوقت المناسب',
  },
  {
    value: 'waiting_customer',
    label: 'Customer delayed access or approval',
    arLabel: 'تأخر العميل في التجهيز أو الاعتماد',
  },
];

export const getTimeStandardLabel = (standard, lang = 'en') =>
  lang === 'ar' ? standard?.arLabel || standard?.label || '' : standard?.label || standard?.arLabel || '';

export const getAreaClusterLabel = (cluster, lang = 'en') =>
  lang === 'ar'
    ? cluster?.arLabel || cluster?.internalAreaArLabel || cluster?.label || cluster?.internalAreaLabel || ''
    : cluster?.label || cluster?.internalAreaLabel || cluster?.arLabel || cluster?.internalAreaArLabel || '';

export const findTimeStandard = (standards = [], standardKey) =>
  (standards || []).find((entry) => String(entry.standardKey) === String(standardKey)) || null;

export const findAreaCluster = (clusters = [], city, district) =>
  (clusters || []).find(
    (entry) =>
      normalizeAreaText(entry?.city) === normalizeAreaText(city) &&
      normalizeAreaText(entry?.district) === normalizeAreaText(district)
  ) || null;

export const resolveInternalAreaCluster = (order, clusters = defaultAreaClusters) => {
  const district = String(order?.district || '').trim();
  const city = String(order?.city || '').trim();
  const matched = findAreaCluster(clusters, city, district);
  const fallbackLabel = [district, city].filter(Boolean).join(' - ') || 'General pool';
  const fallbackArLabel = [district, city].filter(Boolean).join(' - ') || 'منطقة عامة';

  return {
    internalAreaKey:
      String(
        matched?.areaKey ||
          `${normalizeAreaText(city || 'general') || 'general'}-${normalizeAreaText(district || 'general') || 'general'}`
      ).trim() || 'general',
    internalAreaLabel: String(matched?.label || fallbackLabel).trim() || fallbackLabel,
    internalAreaArLabel: String(matched?.arLabel || fallbackArLabel).trim() || fallbackArLabel,
    internalAreaSortOrder: Math.max(1, Number(matched?.sortOrder) || 999),
    internalAreaMatched: Boolean(matched),
  };
};

export const compareOrdersByInternalArea = (left, right) => {
  if ((left?.internalAreaSortOrder || 999) !== (right?.internalAreaSortOrder || 999)) {
    return (left?.internalAreaSortOrder || 999) - (right?.internalAreaSortOrder || 999);
  }

  if (String(left?.internalAreaLabel || '').localeCompare(String(right?.internalAreaLabel || '')) !== 0) {
    return String(left?.internalAreaLabel || '').localeCompare(String(right?.internalAreaLabel || ''));
  }

  return `${left?.scheduledDate || ''} ${left?.scheduledTime || ''} ${left?.id || ''}`.localeCompare(
    `${right?.scheduledDate || ''} ${right?.scheduledTime || ''} ${right?.id || ''}`
  );
};

const decorateOrderWithArea = (order, areaClusters = defaultAreaClusters) => ({
  ...order,
  ...resolveInternalAreaCluster(order, areaClusters),
});

const decorateOrdersWithArea = (orders = [], areaClusters = defaultAreaClusters) =>
  (orders || []).map((order) => decorateOrderWithArea(order, areaClusters));

export const inferServiceCategory = (value) => {
  const text = String(value || '').trim().toLowerCase();
  if (!text) {
    return 'split_installation';
  }
  if (text.includes('cassette') || text.includes('كاسيت')) {
    return 'cassette_installation';
  }
  if (
    text.includes('maintenance') ||
    text.includes('preventive') ||
    text.includes('صيانة') ||
    text.includes('وقائية')
  ) {
    return 'preventive_maintenance';
  }
  return 'split_installation';
};

const resolveOrderStandardMinutes = (order, standards = defaultTimeStandards) => {
  const stored = Math.max(0, Number(order?.standardDurationMinutes) || 0);
  if (stored) {
    return stored;
  }
  const matched = findTimeStandard(standards, order?.serviceCategory);
  return Math.max(1, Number(matched?.durationMinutes) || 120);
};

export const buildEscalationSnapshot = (order, standards = defaultTimeStandards) => {
  const standardDurationMinutes = resolveOrderStandardMinutes(order, standards);
  const workStartedAt = order?.workStartedAt ? new Date(order.workStartedAt) : null;
  const closedAt = order?.zamilClosedAt || order?.approvedAt || null;
  const finishedAt = closedAt ? new Date(closedAt) : null;
  const hasValidStart = workStartedAt && Number.isFinite(workStartedAt.getTime());
  const hasValidFinish = finishedAt && Number.isFinite(finishedAt.getTime());
  const activeEnd = hasValidFinish ? finishedAt.getTime() : Date.now();
  const elapsedMinutes = hasValidStart ? Math.max(0, Math.round((activeEnd - workStartedAt.getTime()) / 60000)) : 0;
  const warningThresholdMinutes = Math.ceil(standardDurationMinutes * 1.15);
  const criticalThresholdMinutes = Math.ceil(standardDurationMinutes * 1.3);
  const escalationLevel =
    !hasValidStart || ['completed', 'canceled', 'suspended'].includes(order?.status)
      ? elapsedMinutes > criticalThresholdMinutes
        ? 2
        : elapsedMinutes > warningThresholdMinutes
          ? 1
          : 0
      : elapsedMinutes > criticalThresholdMinutes
        ? 2
        : elapsedMinutes > warningThresholdMinutes
          ? 1
          : 0;
  const overtimeMinutes = Math.max(0, elapsedMinutes - standardDurationMinutes);
  return {
    serviceCategory: order?.serviceCategory || inferServiceCategory(order?.workType),
    standardDurationMinutes,
    workStartedAt: order?.workStartedAt || null,
    elapsedMinutes,
    warningThresholdMinutes,
    criticalThresholdMinutes,
    escalationLevel,
    isWarning: escalationLevel === 1,
    isCritical: escalationLevel === 2,
    isDelayed: overtimeMinutes > 0,
    overtimeMinutes,
    needsDelayReason: overtimeMinutes > 0,
  };
};

const resolveTechnicianStatus = (technician, activeOrders = []) => {
  const hasActiveWork = activeOrders.some((order) => ['en_route', 'in_progress'].includes(order.status));
  const storedStatus = technician?.status === 'busy' ? 'busy' : 'available';
  return hasActiveWork ? 'busy' : storedStatus;
};

const serviceCatalog = [
  { id: 'rubber_pads', price: 45, unit: 'per set' },
  { id: 'drain_pipes', price: 30, unit: 'per meter' },
  { id: 'electric_socket', price: 40, unit: 'per piece' },
  { id: 'electric_cable', price: 25, unit: 'per meter' },
  { id: 'copper_asian', price: 70, unit: 'per meter' },
  { id: 'copper_american', price: 100, unit: 'per meter' },
  { id: 'copper_welding', price: 30, unit: 'per meter' },
  { id: 'window_frame', price: 30, unit: 'per frame' },
  { id: 'split_removal', price: 100, unit: 'per unit' },
  { id: 'window_removal', price: 50, unit: 'per unit' },
  { id: 'bracket_u24', price: 60, unit: 'per bracket' },
  { id: 'bracket_gt24', price: 80, unit: 'per bracket' },
  { id: 'scaffold_one', price: 100, unit: 'fixed' },
  { id: 'scaffold_two', price: 200, unit: 'fixed' },
];

export const serviceCatalogItems = serviceCatalog;

const normalizeServiceItems = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const catalogItem = serviceCatalog.find((entry) => entry.id === item?.id);
      const quantity = Math.max(0, Number(item?.quantity) || 1);
      const price = Number(item?.price ?? catalogItem?.price ?? 0) || 0;
      const totalPrice = Number(item?.totalPrice ?? price * quantity) || 0;
      const description = String(item?.description || '').trim() || catalogItem?.id || '';
      const unit = String(item?.unit || catalogItem?.unit || '').trim();

      if (!catalogItem || !description || !price) {
        return null;
      }

      return {
        id: catalogItem.id,
        description,
        price,
        unit,
        quantity,
        totalPrice,
      };
    })
    .filter(Boolean);

const calculateServiceItemsTotal = (items = []) =>
  normalizeServiceItems(items).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

const normalizeOrderId = (orderId) => {
  const value = String(orderId || '');
  return value.startsWith('ORD-') ? value.replace('ORD-', '') : value;
};

const buildAuditEntry = (type, actor, message) => ({
  id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  actor,
  message,
  createdAt: new Date().toISOString(),
});

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

const computeSummary = (orders, technicians) => {
  const financialTotals = orders.reduce(
    (totals, order) => ({
      extrasRevenue: totals.extrasRevenue + (order.extras?.totalPrice || 0),
      copperMeters: totals.copperMeters + (Number(order.extras?.copperMeters) || 0),
      basesCount: totals.basesCount + (order.extras?.baseIncluded ? 1 : 0),
    }),
    { extrasRevenue: 0, copperMeters: 0, basesCount: 0 }
  );

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    activeOrders: orders.filter((order) => ['en_route', 'in_progress'].includes(order.status)).length,
    completedOrders: orders.filter((order) => order.status === 'completed').length,
    availableTechnicians: technicians.filter((tech) => tech.status === 'available').length,
    ...financialTotals,
  };
};

const localAuthService = {
  async login(email, password) {
    const state = readState();
    const matchedUser = state.users.find(
      (user) => user.email.toLowerCase() === String(email).trim().toLowerCase() && user.password === password
    );

    if (!matchedUser) {
      throw new Error('Invalid login details');
    }

    const technician = matchedUser.technicianId
      ? state.technicians.find((entry) => entry.id === matchedUser.technicianId)
      : null;

    const safeUser = {
      ...matchedUser,
      technicianId: matchedUser.technicianId || technician?.id || null,
      region: technician?.region || matchedUser.region || null,
      zone: technician?.zone || matchedUser.zone || null,
      technicianName: technician?.name || matchedUser.name || null,
    };
    delete safeUser.password;

    if (technician) {
      safeUser.technician = technician;
    }
    return delay({ data: { token: buildToken(safeUser), user: safeUser } });
  },

  async register(userData) {
    const name = userData?.name?.trim();
    const email = userData?.email?.trim();

    if (!name || !email) {
      throw new Error('Name and email are required');
    }

    const user = { id: `temp-${Date.now()}`, name, email, role: 'viewer' };
    return delay({ data: { token: buildToken(user), user } });
  },
};

const localOperationsService = {
  async getDashboard() {
    const state = getState();
    const users = state.users.map(({ password: _password, ...user }) => user);
    const technicians = state.technicians.map((technician) => {
      const assignedOrders = state.orders.filter((order) => String(order.technicianId) === String(technician.id));
      return {
        ...technician,
        status: resolveTechnicianStatus(technician, assignedOrders),
      };
    });
    return delay({
      data: {
        ...state,
        areaClusters: state.areaClusters,
        users,
        technicians,
        orders: decorateOrdersWithArea(state.orders, state.areaClusters),
        summary: computeSummary(state.orders, technicians),
      },
    });
  },

  async createOrder(payload) {
    const state = readState();
    const selectedTechnician = state.technicians.find((tech) => tech.id === payload.technicianId) || null;
    const serviceItems = normalizeServiceItems(payload.serviceItems);
    const numericId = Date.now();
    const serviceCategory = String(payload?.serviceCategory || inferServiceCategory(payload?.workType || payload?.acType)).trim();
    const matchedStandard = findTimeStandard(state.timeStandards, serviceCategory);
    const standardDurationMinutes = Math.max(
      1,
      Number(payload?.standardDurationMinutes) || Number(matchedStandard?.durationMinutes) || 120
    );
    const district = String(payload?.district || '').trim();
    const city = String(payload?.city || '').trim();
    const address = String(payload?.address || '').trim();
    const acCount = Math.max(1, Number(payload?.acCount) || 1);
    const workType = String(payload?.workType || payload?.acType || '').trim();
    const scheduledTime = String(payload?.scheduledTime || '').trim();
    const source = String(payload?.source || 'manual').trim();
    const order = {
      id: `ORD-${numericId}`,
      numericId,
      customerName: payload.customerName,
      phone: normalizeSaudiPhoneNumber(payload.phone),
      district,
      city,
      address: address || [district, city].filter(Boolean).join(' - '),
      acType: payload.acType,
      acCount,
      serviceCategory,
      standardDurationMinutes,
      workStartedAt: null,
      completionNote: '',
      delayReason: '',
      delayNote: '',
      workType,
      status: 'pending',
      scheduledDate: payload.scheduledDate,
      scheduledTime,
      source,
      notes: payload.notes || '',
      technicianId: selectedTechnician?.id || '',
      technicianName: selectedTechnician?.name || 'Unassigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      extras: { copperMeters: 0, baseIncluded: false, totalPrice: calculateServiceItemsTotal(serviceItems) },
      serviceItems,
      photos: [],
      proofStatus: 'pending_review',
      approvalStatus: 'pending',
      approvedAt: null,
      approvedBy: '',
      clientSignature: '',
      zamilClosureStatus: 'idle',
      zamilCloseRequestedAt: null,
      zamilOtpCode: '',
      zamilOtpSubmittedAt: null,
      zamilClosedAt: null,
      suspensionReason: '',
      suspensionNote: '',
      suspendedAt: null,
      exceptionStatus: 'none',
      auditLog: [
        {
          id: `audit-${numericId}`,
          type: 'created',
          actor: 'admin',
          message: `Order created for ${payload.customerName}`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    writeState({ ...state, orders: [order, ...state.orders] });
    return delay({ data: { order } });
  },

  async updateOrder(orderId, changes) {
    const state = readState();
    const nextOrders = state.orders.map((order) => {
      if (String(order.id) !== String(orderId)) {
        return order;
      }

      const nextOrder = { ...order, ...changes };
      if (changes.phone !== undefined) {
        nextOrder.phone = normalizeSaudiPhoneNumber(changes.phone);
      }
      if (changes.customerName !== undefined) {
        nextOrder.customerName = String(changes.customerName || '').trim();
      }
      if (changes.address !== undefined || changes.district !== undefined || changes.city !== undefined) {
        nextOrder.address =
          String(changes.address ?? nextOrder.address ?? '').trim() ||
          [changes.district ?? nextOrder.district, changes.city ?? nextOrder.city].filter(Boolean).join(' - ');
      }
      nextOrder.updatedAt = new Date().toISOString();
      if (changes.serviceCategory !== undefined) {
        const matchedStandard = findTimeStandard(state.timeStandards, changes.serviceCategory);
        nextOrder.serviceCategory = changes.serviceCategory;
        if (changes.standardDurationMinutes === undefined && matchedStandard) {
          nextOrder.standardDurationMinutes = Number(matchedStandard.durationMinutes) || nextOrder.standardDurationMinutes;
        }
      }
      if (changes.serviceItems !== undefined) {
        nextOrder.serviceItems = normalizeServiceItems(changes.serviceItems);
      }
      if (changes.technicianId) {
        const technician = state.technicians.find((entry) => entry.id === changes.technicianId);
        nextOrder.technicianName = technician?.name || 'Unassigned';
      }
      if (changes.technicianId === '') {
        nextOrder.technicianName = 'Unassigned';
      }

      const serviceItemsTotal = calculateServiceItemsTotal(nextOrder.serviceItems || []);
      if (nextOrder.extras) {
        nextOrder.extras = {
          ...nextOrder.extras,
          totalPrice: calculateExtrasTotal(nextOrder.extras.copperMeters, nextOrder.extras.baseIncluded) + serviceItemsTotal,
        };
      }

      return nextOrder;
    });

    const nextState = writeState({ ...state, orders: nextOrders });
    return delay({ data: { order: nextState.orders.find((entry) => String(entry.id) === String(orderId)) } });
  },

  async updateTechnicianStatus(orderId, status, payload = {}) {
    const state = readState();
    const target = state.orders.find((order) => String(order.id) === String(orderId));

    if (!target) {
      throw new Error('Order not found');
    }

    if (status === 'completed') {
      throw new Error('Use the Zamil closure flow to complete this order');
    }

    return this.updateOrder(orderId, {
      status,
      workStartedAt: status === 'in_progress' ? target.workStartedAt || new Date().toISOString() : target.workStartedAt || null,
      ...payload,
    });
  },

  async requestClosure(orderId, payload = {}) {
    const state = readState();
    const target = state.orders.find((order) => String(order.id) === String(orderId));

    if (!target) {
      throw new Error('Order not found');
    }

    if (!(target.photos || []).length) {
      throw new Error('Upload at least one proof photo before requesting the OTP');
    }

    const timing = buildEscalationSnapshot(target, state.timeStandards);
    const completionNote = String(payload.completionNote ?? target.completionNote ?? '').trim();
    const delayReason = String(payload.delayReason ?? target.delayReason ?? '').trim();
    const delayNote = String(payload.delayNote ?? target.delayNote ?? '').trim();

    if (timing.needsDelayReason && !delayReason) {
      throw new Error('Delay reason is required before closing an overdue task');
    }

    const requestedAt = new Date().toISOString();
    const response = await this.updateOrder(orderId, {
      status: ['pending', 'en_route'].includes(target.status) ? 'in_progress' : target.status,
      workStartedAt: target.workStartedAt || new Date().toISOString(),
      completionNote,
      delayReason,
      delayNote,
      zamilClosureStatus: 'requested',
      zamilCloseRequestedAt: requestedAt,
      zamilOtpCode: '',
      zamilOtpSubmittedAt: null,
      zamilClosedAt: null,
      approvalStatus: 'pending',
      proofStatus: 'pending_review',
      auditLog: [
        ...(target.auditLog || []),
        buildAuditEntry('zamil_request', 'technician', 'طلب الفني بدء إغلاق الزامل'),
      ],
    });
    notifyLocalAdmins(state, {
      title: 'جاهز لإغلاق الزامل',
      body: `الفني ${target.technicianName || 'الميداني'} جاهز لإغلاق الطلب #${normalizeOrderId(orderId)} للعميل ${target.customerName}.`,
      relatedOrderId: normalizeOrderId(orderId),
    });
    return response;
  },

  async submitClosureOtp(orderId, otpCode) {
    const state = readState();
    const target = state.orders.find((order) => String(order.id) === String(orderId));

    if (!target) {
      throw new Error('Order not found');
    }

    const code = String(otpCode || '').replace(/\s+/g, '').trim();
    if (!code) {
      throw new Error('OTP code is required');
    }

    if (!['requested', 'otp_submitted'].includes(target.zamilClosureStatus || 'idle')) {
      throw new Error('Request the Zamil OTP first');
    }

    const response = await this.updateOrder(orderId, {
      zamilClosureStatus: 'otp_submitted',
      zamilOtpCode: code,
      zamilOtpSubmittedAt: new Date().toISOString(),
      auditLog: [
        ...(target.auditLog || []),
        buildAuditEntry('zamil_otp', 'technician', 'أرسل الفني رمز OTP للإدارة'),
      ],
    });
    notifyLocalAdmins(state, {
      title: 'تم استلام OTP',
      body: `وصل رمز OTP للطلب #${normalizeOrderId(orderId)} من الفني ${target.technicianName || 'الميداني'}.`,
      relatedOrderId: normalizeOrderId(orderId),
    });
    return response;
  },

  async approveClosure(orderId) {
    const state = readState();
    const target = state.orders.find((order) => String(order.id) === String(orderId));

    if (!target) {
      throw new Error('Order not found');
    }

    if ((target.zamilClosureStatus || 'idle') !== 'otp_submitted') {
      throw new Error('OTP has not been submitted yet');
    }

    const approvedAt = new Date().toISOString();
    const response = await this.updateOrder(orderId, {
      status: 'completed',
      approvalStatus: 'approved',
      proofStatus: 'approved',
      approvedAt,
      approvedBy: 'Operations Admin',
      exceptionStatus: 'none',
      zamilClosureStatus: 'closed',
      zamilClosedAt: approvedAt,
      auditLog: [
        ...(target.auditLog || []),
        buildAuditEntry('zamil_closed', 'admin', 'اعتمدت الإدارة إغلاق الطلب بعد قبول OTP في بوابة الزامل'),
      ],
    });
    notifyLocalTechnicianUser(state, target.technicianId, {
      title: 'تم اعتماد الإغلاق',
      body: `اعتمدت الإدارة إغلاق الطلب #${normalizeOrderId(orderId)} ويمكنك مغادرة الموقع.`,
      relatedOrderId: normalizeOrderId(orderId),
    });
    return response;
  },

  async cancelOrder(orderId, reason = '') {
    return this.updateOrder(orderId, {
      status: 'canceled',
      notes: reason ? String(reason) : undefined,
    });
  },

  async getTechnicianOrders(technicianId) {
    const state = getState();
    const technicianOrders = state.orders.filter((order) => String(order.technicianId) === String(technicianId));
    const technicianRecord = state.technicians.find((entry) => String(entry.id) === String(technicianId)) || null;
    return delay({
      data: {
        technician: technicianRecord
          ? {
              ...technicianRecord,
              status: resolveTechnicianStatus(technicianRecord, technicianOrders),
            }
          : null,
        pricing: state.pricing,
        timeStandards: state.timeStandards,
        areaClusters: state.areaClusters,
        orders: decorateOrdersWithArea(technicianOrders, state.areaClusters),
      },
    });
  },

  async updateTimeStandards(standards) {
    const state = readState();
    const timeStandards = mergeTimeStandards(standards, defaultTimeStandards);
    writeState({ ...state, timeStandards });
    return delay({ data: { timeStandards } });
  },

  async updateAreaClusters(clusters) {
    const state = readState();
    const areaClusters = mergeAreaClusters(clusters, []);
    if (!areaClusters.length) {
      throw new Error('At least one internal area mapping is required');
    }
    writeState({ ...state, areaClusters });
    return delay({ data: { areaClusters } });
  },

  async createTechnician(payload) {
    const state = readState();
    const firstName = String(payload?.firstName || '').trim();
    const lastName = String(payload?.lastName || '').trim();
    const email = String(payload?.email || '').trim().toLowerCase();
    const phone = String(payload?.phone || '').trim();
    const password = String(payload?.password || '').trim();
    const region = String(payload?.region || '').trim();
    const notes = String(payload?.notes || '').trim();
    const status = String(payload?.status || 'available').trim().toLowerCase();

    if (!firstName || !lastName || !email || !phone || !password || !region) {
      throw new Error('All technician fields are required');
    }

    if (!['available', 'busy'].includes(status)) {
      throw new Error('Invalid technician status');
    }

    if (state.users.some((user) => user.email.toLowerCase() === email)) {
      throw new Error('This email is already registered');
    }

    const technicianId = `tech-${Date.now()}`;
    const userId = `tech-user-${Date.now()}`;
    const name = `${firstName} ${lastName}`.trim();

    const user = {
      id: userId,
      firstName,
      lastName,
      name,
      email,
      phone: normalizeSaudiPhoneNumber(phone),
      password,
      role: 'technician',
      technicianId,
      region,
    };

    const technician = {
      id: technicianId,
      userId,
      name,
      firstName,
      lastName,
      email,
      phone: normalizeSaudiPhoneNumber(phone),
      region,
      zone: region,
      status,
      notes,
    };

    writeState({
      ...state,
      users: [user, ...state.users],
      technicians: [technician, ...state.technicians],
    });

    const safeUser = { ...user };
    delete safeUser.password;
    return delay({ data: { user: safeUser, technician } });
  },

  async updateTechnicianAvailability(technicianId, status) {
    const nextStatus = String(status || '').trim().toLowerCase();
    if (!['available', 'busy'].includes(nextStatus)) {
      throw new Error('Invalid technician status');
    }

    const state = readState();
    const nextTechnicians = state.technicians.map((technician) =>
      String(technician.id) === String(technicianId) ? { ...technician, status: nextStatus } : technician
    );
    writeState({ ...state, technicians: nextTechnicians });
    const technician = nextTechnicians.find((entry) => String(entry.id) === String(technicianId)) || null;
    return delay({ data: { technician } });
  },

  async updateTechnician(technicianId, payload) {
    const state = readState();
    const target = state.technicians.find((technician) => String(technician.id) === String(technicianId));

    if (!target) {
      throw new Error('Technician not found');
    }

    const firstName = String(payload?.firstName || '').trim();
    const lastName = String(payload?.lastName || '').trim();
    const email = String(payload?.email || '').trim().toLowerCase();
    const phone = normalizeSaudiPhoneNumber(payload?.phone);
    const region = String(payload?.region || '').trim();
    const notes = String(payload?.notes || '').trim();
    const status = String(payload?.status || 'available').trim().toLowerCase();
    const password = String(payload?.password || '').trim();
    const name = `${firstName} ${lastName}`.trim();

    if (!name || !email || !phone || !region) {
      throw new Error('All technician fields are required');
    }

    if (!['available', 'busy'].includes(status)) {
      throw new Error('Invalid technician status');
    }

    const duplicateUser = state.users.find(
      (user) => String(user.email || '').toLowerCase() === email && String(user.id) !== String(target.userId)
    );

    if (duplicateUser) {
      throw new Error('This email is already registered');
    }

    const nextUsers = state.users.map((user) =>
      String(user.id) === String(target.userId)
        ? {
            ...user,
            firstName,
            lastName,
            name,
            email,
            phone,
            region,
            ...(password ? { password } : {}),
          }
        : user
    );

    const nextTechnicians = state.technicians.map((technician) =>
      String(technician.id) === String(technicianId)
        ? {
            ...technician,
            firstName,
            lastName,
            name,
            email,
            phone,
            region,
            zone: region,
            status,
            notes,
          }
        : technician
    );

    writeState({ ...state, users: nextUsers, technicians: nextTechnicians });
    const technician = nextTechnicians.find((entry) => String(entry.id) === String(technicianId)) || null;
    return delay({ data: { technician } });
  },

  async deleteTechnician(technicianId) {
    const state = readState();
    const target = state.technicians.find((technician) => String(technician.id) === String(technicianId));

    if (!target) {
      throw new Error('Technician not found');
    }

    const hasActiveOrders = state.orders.some(
      (order) =>
        String(order.technicianId) === String(technicianId) &&
        ['pending', 'en_route', 'in_progress'].includes(order.status)
    );

    if (hasActiveOrders) {
      throw new Error('Cannot delete a technician with active assigned orders');
    }

    writeState({
      ...state,
      users: state.users.filter((user) => String(user.id) !== String(target.userId)),
      technicians: state.technicians.filter((technician) => String(technician.id) !== String(technicianId)),
    });

    return delay({ data: { ok: true } });
  },

  async updateExtras(orderId, { copperMeters, baseIncluded }) {
    const state = readState();
    const nextOrders = state.orders.map((order) =>
      String(order.id) === String(orderId)
        ? {
            ...order,
            extras: {
              copperMeters: Number(copperMeters) || 0,
              baseIncluded: Boolean(baseIncluded),
              totalPrice:
                calculateExtrasTotal(copperMeters, Boolean(baseIncluded)) +
                calculateServiceItemsTotal(order.serviceItems || []),
            },
          }
        : order
    );
    const nextState = writeState({ ...state, orders: nextOrders });
    return delay({ data: { order: nextState.orders.find((entry) => String(entry.id) === String(orderId)) } });
  },

  async uploadPhoto(orderId, photo) {
    const state = readState();
    const nextOrders = state.orders.map((order) =>
      String(order.id) === String(orderId)
        ? {
            ...order,
            updatedAt: new Date().toISOString(),
            photos: [
              ...(order.photos || []),
              { id: `photo-${Date.now()}`, ...photo, uploadedAt: new Date().toISOString() },
            ],
          }
        : order
    );
    const nextState = writeState({ ...state, orders: nextOrders });
    return delay({ data: { order: nextState.orders.find((entry) => String(entry.id) === String(orderId)) } });
  },

  async resetSampleData() {
    writeStorage(STORAGE_KEY, JSON.stringify(defaultState));
    window.dispatchEvent(new CustomEvent('operations-updated'));
    return delay({ data: { ok: true } });
  },

  async clearSampleData() {
    const state = readState();
    const nextUsers = state.users.filter(
      (user) => !['technician@tarkeebpro.sa'].includes(String(user.email || '').toLowerCase())
    );
    const nextTechnicians = state.technicians.filter(
      (technician) => !['tech-1'].includes(String(technician.id))
    );
    writeState({
      ...state,
      users: nextUsers,
      technicians: nextTechnicians,
      orders: [],
    });
    return delay({ data: { ok: true } });
  },

  calculateExtrasTotal,
  getStatusLabel(status) {
    return statusLabelMap[status] || status;
  },
};

const remoteOperationsService = {
  getDashboard: () => apiClient.get('/operations/dashboard'),
  getSummary: () => apiClient.get('/operations/summary'),
  createOrder: (data) => apiClient.post('/operations/orders', data),
  updateOrder: (orderId, data) => apiClient.put(`/operations/orders/${normalizeOrderId(orderId)}`, data),
  getTechnicianOrders: () => apiClient.get('/operations/technician/orders'),
  createTechnician: (data) => apiClient.post('/operations/technicians', data),
  updateTechnician: (technicianId, data) => apiClient.put(`/operations/technicians/${technicianId}`, data),
  deleteTechnician: (technicianId) => apiClient.delete(`/operations/technicians/${technicianId}`),
  updateTechnicianStatus: (orderId, data) =>
    apiClient.put(`/operations/orders/${normalizeOrderId(orderId)}/status`, data),
  updateTechnicianAvailability: (technicianId, status) =>
    apiClient.put(`/operations/technicians/${technicianId}/status`, { status }),
  cancelOrder: (orderId, reason) =>
    apiClient.post(`/operations/orders/${normalizeOrderId(orderId)}/cancel`, { reason }),
  updateExtras: (orderId, data) =>
    apiClient.put(`/operations/orders/${normalizeOrderId(orderId)}/extras`, data),
  uploadPhoto: (orderId, data) =>
    apiClient.post(`/operations/orders/${normalizeOrderId(orderId)}/photos`, data),
  requestClosure: (orderId, data) =>
    apiClient.post(`/operations/orders/${normalizeOrderId(orderId)}/close-request`, data),
  submitClosureOtp: (orderId, data) =>
    apiClient.post(`/operations/orders/${normalizeOrderId(orderId)}/close-otp`, data),
  approveClosure: (orderId) =>
    apiClient.post(`/operations/orders/${normalizeOrderId(orderId)}/close-approve`),
  updateTimeStandards: (data) =>
    apiClient.put('/operations/time-standards', { standards: data }),
  updateAreaClusters: (data) =>
    apiClient.put('/operations/area-clusters', { clusters: data }),
  resetSampleData: () => apiClient.post('/operations/admin/sample/reset'),
  clearSampleData: () => apiClient.delete('/operations/admin/sample'),
};

export const authService = {
  login: (email, password) =>
    withFallback(
      () => apiClient.post('/auth/login', { email, password }),
      () => localAuthService.login(email, password)
    ),
  register: (userData) =>
    withFallback(
      () => apiClient.post('/auth/register', userData),
      () => localAuthService.register(userData)
    ),
  logout: () => removeStorage('authToken'),
};

export const operationsService = {
  getDashboard: () =>
    withFallback(
      () => remoteOperationsService.getDashboard(),
      () => localOperationsService.getDashboard()
    ),
  createTechnician: (data) =>
    withFallback(
      () => remoteOperationsService.createTechnician(data),
      () => localOperationsService.createTechnician(data)
    ),
  updateTechnician: (technicianId, data) =>
    withFallback(
      () => remoteOperationsService.updateTechnician(technicianId, data),
      () => localOperationsService.updateTechnician(technicianId, data)
    ),
  deleteTechnician: (technicianId) =>
    withFallback(
      () => remoteOperationsService.deleteTechnician(technicianId),
      () => localOperationsService.deleteTechnician(technicianId)
    ),
  updateTechnicianAvailability: (technicianId, status) =>
    withFallback(
      () => remoteOperationsService.updateTechnicianAvailability(technicianId, status),
      () => localOperationsService.updateTechnicianAvailability(technicianId, status)
    ),
  createOrder: (data) =>
    withFallback(
      () => remoteOperationsService.createOrder(data),
      () => localOperationsService.createOrder(data)
    ),
  updateOrder: (orderId, data) =>
    withFallback(
      () => remoteOperationsService.updateOrder(orderId, data),
      () => localOperationsService.updateOrder(orderId, data)
    ),
  getTechnicianOrders: (technicianId) =>
    withFallback(
      () => remoteOperationsService.getTechnicianOrders(),
      () => localOperationsService.getTechnicianOrders(technicianId)
    ),
  updateTechnicianStatus: (orderId, status, payload = {}) =>
    withFallback(
      () => remoteOperationsService.updateTechnicianStatus(orderId, { status, ...payload }),
      () => localOperationsService.updateTechnicianStatus(orderId, status, payload)
    ),
  cancelOrder: (orderId, reason) =>
    withFallback(
      () => remoteOperationsService.cancelOrder(orderId, reason),
      () => localOperationsService.cancelOrder(orderId, reason)
    ),
  updateExtras: (orderId, data) =>
    withFallback(
      () => remoteOperationsService.updateExtras(orderId, data),
      () => localOperationsService.updateExtras(orderId, data)
    ),
  uploadPhoto: (orderId, data) =>
    withFallback(
      () => remoteOperationsService.uploadPhoto(orderId, data),
      () => localOperationsService.uploadPhoto(orderId, data)
    ),
  requestClosure: (orderId, data = {}) =>
    withFallback(
      () => remoteOperationsService.requestClosure(orderId, data),
      () => localOperationsService.requestClosure(orderId, data)
    ),
  submitClosureOtp: (orderId, otpCode) =>
    withFallback(
      () => remoteOperationsService.submitClosureOtp(orderId, { otpCode }),
      () => localOperationsService.submitClosureOtp(orderId, otpCode)
    ),
  approveClosure: (orderId) =>
    withFallback(
      () => remoteOperationsService.approveClosure(orderId),
      () => localOperationsService.approveClosure(orderId)
    ),
  updateTimeStandards: (standards) =>
    withFallback(
      () => remoteOperationsService.updateTimeStandards(standards),
      () => localOperationsService.updateTimeStandards(standards)
    ),
  updateAreaClusters: (clusters) =>
    withFallback(
      () => remoteOperationsService.updateAreaClusters(clusters),
      () => localOperationsService.updateAreaClusters(clusters)
    ),
  getSummary: () =>
    withFallback(
      () => remoteOperationsService.getSummary(),
      async () => {
        const response = await localOperationsService.getDashboard();
        return { data: { summary: response.data?.summary || null } };
      }
    ),
  resetSampleData: () =>
    withFallback(
      () => remoteOperationsService.resetSampleData(),
      () => localOperationsService.resetSampleData()
    ),
  clearSampleData: () =>
    withFallback(
      () => remoteOperationsService.clearSampleData(),
      () => localOperationsService.clearSampleData()
    ),
  calculateExtrasTotal,
  getStatusLabel(status) {
    return statusLabelMap[status] || status;
  },
};

export const notificationsService = {
  list: async (sinceId = 0) => {
    try {
      const response = await apiClient.get('/notifications', {
        params: sinceId ? { sinceId } : undefined,
      });
      writeSession('localNotifications', JSON.stringify(response.data?.notifications || []));
      return response;
    } catch (error) {
      if (!allowDemoFallback) {
        throw error;
      }

      const activeUser = getActiveAuthUser();
      const allItems = readStoredNotifications();
      const items = allItems.filter(
        (item) =>
          String(item?.userId || '') === String(activeUser?.id || '') &&
          (!sinceId || Number(item?.id) > Number(sinceId || 0))
      );
      return { data: { notifications: items, unreadCount: items.filter((item) => !item.isRead).length } };
    }
  },
  markRead: async (id) => {
    try {
      return await apiClient.put(`/notifications/${id}/read`);
    } catch (error) {
      if (!allowDemoFallback) {
        throw error;
      }

      const activeUser = getActiveAuthUser();
      const allItems = readStoredNotifications().map((item) =>
        String(item?.id) === String(id) && String(item?.userId || '') === String(activeUser?.id || '')
          ? { ...item, isRead: true }
          : item
      );
      writeStoredNotifications(allItems);
      return { data: { ok: true } };
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
      const allItems = readStoredNotifications().map((item) =>
        String(item?.userId || '') === String(activeUser?.id || '') ? { ...item, isRead: true } : item
      );
      writeStoredNotifications(allItems);
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
