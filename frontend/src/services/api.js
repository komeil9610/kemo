import axios from 'axios';
import {
  HOMEPAGE_STORAGE_KEY,
  createDefaultHomeSettings,
  normalizeHomeSettings,
} from '../utils/homepageSettings';

const STORAGE_KEY = 'tarkeeb-pro-internal-db-v2';
const LEGACY_STORAGE_KEY = 'tarkeeb-pro-internal-db';
const NOTIFICATIONS_STORAGE_KEY = 'tarkeeb-pro-internal-notifications';
const FOOTER_STORAGE_KEY = 'tarkeeb-pro-footer-settings-v2';

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
const extractImportReferenceValue = (order, label) => {
  const directValue = String(order?.[label] || order?.[`${label}Id`] || order?.importMeta?.[label] || '').trim();
  if (directValue) {
    return directValue;
  }

  const text = String(order?.notes || '').trim();
  const escapedLabel = String(label || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`(?:^|\\n)${escapedLabel}\\s*:\\s*(.+?)(?:\\n|$)`, 'i'));
  return String(match?.[1] || '').trim();
};
const normalizeDateOnly = (value) => String(value || '').trim().slice(0, 10);
const getLocalOrderTaskDate = (order = {}) => {
  const scheduledDate = normalizeDateOnly(order?.scheduledDate || order?.scheduled_date);
  if (scheduledDate) {
    return scheduledDate;
  }

  const preferredDate = normalizeDateOnly(order?.preferredDate || order?.preferred_date);
  const deliveryDate = normalizeDateOnly(order?.deliveryDate || extractImportReferenceValue(order, 'Delivery date'));
  const installationDate = normalizeDateOnly(order?.installationDate || extractImportReferenceValue(order, 'Installation date'));
  const pickupDate = normalizeDateOnly(order?.pickupDate || extractImportReferenceValue(order, 'Pickup date'));
  const createdDate = normalizeDateOnly(order?.createdAt || order?.created_at);
  return deliveryDate || installationDate || preferredDate || pickupDate || createdDate || '';
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

const normalizeRole = (role) => role || '';
const normalizeWorkspaceRoles = (roles = [], fallbackRole = '') => {
  const merged = [...(Array.isArray(roles) ? roles : [roles]), fallbackRole]
    .map((role) => normalizeRole(role))
    .filter(Boolean);
  return [...new Set(merged)];
};
const resolveWorkspaceRole = (requestedRole, roles = [], fallbackRole = '') => {
  const workspaceRoles = normalizeWorkspaceRoles(roles, fallbackRole);
  const normalizedRequestedRole = normalizeRole(requestedRole);
  if (normalizedRequestedRole && workspaceRoles.includes(normalizedRequestedRole)) {
    return normalizedRequestedRole;
  }
  if (workspaceRoles.includes('admin')) {
    return 'admin';
  }
  if (workspaceRoles.includes('operations_manager')) {
    return 'operations_manager';
  }
  return workspaceRoles[0] || '';
};

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
const TECH_ASSIGNMENT_REGEX = /\*\s*([A-Z]{1,4}-[A-Z])\s*-\s*by:/gm;
const REVERSED_TECH_ASSIGNMENT_OVERRIDES = new Map([['W-J', 'J-W']]);
const KNOWN_TECH_AREA_CODES = new Set([
  'A',
  'B',
  'BR',
  'BUR',
  'D',
  'DH',
  'G',
  'H',
  'HB',
  'J',
  'JD',
  'JED',
  'KHF',
  'KH',
  'M',
  'MD',
  'Q',
  'QAS',
  'R',
  'RAS',
  'RE',
  'RS',
  'S',
  'W',
  'Y',
  'YAN',
  'YNB',
]);
const KNOWN_TECH_SHORT_CODES = new Set(['A', 'D', 'E', 'G', 'H', 'J', 'M', 'Q', 'R', 'S', 'W', 'Y']);
const AREA_NAME_BY_CODE = new Map([
  ['BUR', 'Buraidah'],
  ['D', 'Dammam'],
  ['DH', 'Dhahran'],
  ['H', 'Al Ahsa'],
  ['J', 'Jubail'],
  ['JED', 'Jeddah'],
  ['KH', 'Khobar'],
  ['MD', 'Madinah'],
  ['Q', 'Qatif'],
  ['QAS', 'Qassim'],
  ['R', 'Riyadh'],
  ['RAS', 'Ras Tanura'],
  ['RS', 'Ras Tanura'],
  ['YAN', 'Yanbu'],
  ['YNB', 'Yanbu'],
]);
const TECH_SHORT_NAME_BY_CODE = new Map([
  ['A', 'Ali'],
  ['G', 'Ghulam'],
  ['M', 'Mohsin'],
  ['R', 'Rashid'],
  ['W', 'Waseem'],
]);

const normalizeImportedInstallationStatus = (value) => {
  const status = String(value || '').trim().toLowerCase();
  if (!status) {
    return 'pending';
  }
  if (status.includes('canceled') || status.includes('cancelled') || status.includes('cancel')) {
    return 'canceled';
  }
  if (status.includes('completed') || status.includes('partially completed') || status.includes('done')) {
    return 'completed';
  }
  if (
    status.includes('scheduled') ||
    status.includes('assigned') ||
    status.includes('shipped') ||
    status.includes('delivered') ||
    status.includes('ready to pickup') ||
    status.includes('pick up requested') ||
    status.includes('return request') ||
    status.includes('rescheduled') ||
    status.includes('waiting customer confirmation')
  ) {
    return 'scheduled';
  }
  return 'pending';
};

const parseExcelLikeDateString = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  const dayFirstMatch = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
  if (dayFirstMatch) {
    const [, day, month, year] = dayFirstMatch;
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const yearFirstMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
  if (yearFirstMatch) {
    const [, year, month, day] = yearFirstMatch;
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return normalized;
};

const cleanDeviceLine = (value) =>
  String(value || '')
    .trim()
    .replace(/^\*\s*/, '')
    .replace(/\s*\(\s*With Installation\s*\)\s*$/i, '')
    .trim();

const parseDeviceLines = (value) => {
  const rawLines = String(value || '')
    .split(/\r?\n/)
    .map((line) => cleanDeviceLine(line))
    .filter(Boolean);
  const expandedLines = [];

  rawLines.forEach((line) => {
    const quantityMatch = line.match(/^(\d+)\s*[Xx]\s*(.+)$/);
    const quantity = quantityMatch ? Math.max(1, Number(quantityMatch[1]) || 1) : 1;
    const deviceName = cleanDeviceLine(quantityMatch ? quantityMatch[2] : line);
    for (let index = 0; index < quantity; index += 1) {
      expandedLines.push(deviceName);
    }
  });

  return {
    rawLines,
    expandedLines,
  };
};

const inferAcTypeFromDeviceName = (value) => {
  const text = String(value || '').trim().toLowerCase();
  if (text.includes('window') || text.includes('شباك')) {
    return 'window';
  }
  if (text.includes('cassette') || text.includes('كاسيت')) {
    return 'cassette';
  }
  if (text.includes('duct') || text.includes('دكت')) {
    return 'duct';
  }
  if (text.includes('concealed') || text.includes('مخفي')) {
    return 'concealed';
  }
  return 'split';
};

const buildAcDetailsFromDeviceLines = (devicesText, bundledItems = 0) => {
  const { expandedLines } = parseDeviceLines(devicesText);
  const counts = new Map();

  expandedLines.forEach((deviceName) => {
    const type = inferAcTypeFromDeviceName(deviceName);
    counts.set(type, (counts.get(type) || 0) + 1);
  });

  if (!counts.size) {
    counts.set('split', Math.max(1, Number(bundledItems) || 1));
  }

  return Array.from(counts.entries()).map(([type, quantity], index) => ({
    id: `ac-${index}-${type}`,
    type,
    quantity,
  }));
};

const extractDistrictFromShippingAddress = (shippingAddress, shippingCity) => {
  const city = String(shippingCity || '').trim().toLowerCase();
  const parts = String(shippingAddress || '')
    .replace(/^.*?\s-\s*/, '')
    .split(',')
    .map((part) => String(part || '').trim())
    .filter(Boolean);

  if (!parts.length) {
    return String(shippingCity || '').trim();
  }

  const cityIndex = parts.findIndex((part) => String(part || '').trim().toLowerCase() === city);
  if (cityIndex > 0) {
    return parts[cityIndex - 1];
  }

  return parts[1] || parts[0] || String(shippingCity || '').trim();
};

const parseTechnicianAssignment = (value) => {
  const matches = Array.from(String(value || '').matchAll(TECH_ASSIGNMENT_REGEX));
  const rawTechId = String(matches.at(-1)?.[1] || '').trim().toUpperCase();
  const techId = REVERSED_TECH_ASSIGNMENT_OVERRIDES.get(rawTechId) || rawTechId || null;
  if (!techId) {
    return {
      techId: null,
      areaCode: null,
      techCode: null,
      areaName: null,
      techShortName: null,
    };
  }

  const [areaCode = '', techCode = ''] = techId.split('-');
  return {
    techId,
    areaCode: areaCode || null,
    techCode: techCode || null,
    areaName: AREA_NAME_BY_CODE.get(areaCode) || null,
    techShortName: TECH_SHORT_NAME_BY_CODE.get(techCode) || null,
  };
};

const readMappedTechnicianAssignment = (order = {}) => {
  const directTechId = String(order.techId || extractImportReferenceValue(order, 'Tech ID') || '').trim();
  if (directTechId) {
    return parseTechnicianAssignment(`* ${directTechId} - by:`);
  }

  const directAreaCode = String(order.areaCode || extractImportReferenceValue(order, 'Area Code') || '').trim();
  const directTechCode = String(order.techCode || extractImportReferenceValue(order, 'Tech Code') || '').trim();
  const combinedCode = [directAreaCode, directTechCode].filter(Boolean).join('-');
  if (combinedCode) {
    return parseTechnicianAssignment(`* ${combinedCode} - by:`);
  }

  return parseTechnicianAssignment(
    order.chatLog || extractImportReferenceValue(order, 'Chat Log') || extractImportReferenceValue(order, 'Chat message') || ''
  );
};

const getTechnicianAssignmentIssues = (assignment = {}) => {
  const techId = String(assignment.techId || '').trim().toUpperCase();
  const areaCode = String(assignment.areaCode || techId.split('-')[0] || '').trim().toUpperCase();
  const techCode = String(assignment.techCode || techId.split('-').slice(1).join('-') || '').trim().toUpperCase();
  const missingAreaCode = Boolean(techId) && (!areaCode || !KNOWN_TECH_AREA_CODES.has(areaCode));
  const missingTechCode = Boolean(techId) && (!techCode || !KNOWN_TECH_SHORT_CODES.has(techCode));

  return {
    techId: techId || null,
    areaCode: areaCode || null,
    techCode: techCode || null,
    missingAreaCode,
    missingTechCode,
    needsReview: missingAreaCode || missingTechCode,
  };
};

const buildGoogleMapsLink = (value) => {
  const query = String(value || '').trim();
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
};

const buildStructuredNotes = (lines = []) =>
  lines
    .filter(([, value]) => String(value || '').trim())
    .map(([label, value]) => `${label}: ${String(value || '').trim()}`)
    .join('\n');

const normalizeManualExcelStyleOrderPayload = (payload = {}) => {
  const soId = String(payload.soId || payload.requestNumber || '').trim();
  const woId = String(payload.woId || '').trim();
  const customerName = String(payload.customer || payload.customerName || '').trim();
  const email = String(payload.email || '').trim();
  const phone = String(payload.phone || '').trim();
  const deliveryDate = parseExcelLikeDateString(payload.deliveryDate);
  const installationDate = parseExcelLikeDateString(payload.installationDate || payload.instDate || payload.preferredDate);
  const pickupDate = parseExcelLikeDateString(payload.pickupDate);
  const preferredDate = deliveryDate || installationDate || pickupDate;
  const externalStatus = String(payload.status || 'Scheduled').trim();
  const shippingCity = String(payload.shippingCity || payload.city || '').trim();
  const shippingAddress = String(payload.shippingAddress || payload.addressText || payload.address || '').trim();
  const devicesText = String(payload.devices || '').trim();
  const bundledItems = Math.max(0, Number(payload.bundledItems) || 0);
  const withinSLA = payload.withinSLA === 'Yes' || payload.withinSLA === true ? 'Yes' : '';
  const exceedSLA = payload.exceedSLA === 'Yes' || payload.exceedSLA === true ? 'Yes' : '';
  const courier = String(payload.courier || '').trim();
  const courierNum = String(payload.courierNum || '').trim();
  const chatLog = String(payload.chatLog || payload.chat_message || '').trim();
  const deviceInfo = parseDeviceLines(devicesText);
  const devCount = Math.max(bundledItems, deviceInfo.expandedLines.length);
  const acDetails = buildAcDetailsFromDeviceLines(devicesText, bundledItems);
  const technicianAssignment = parseTechnicianAssignment(chatLog);
  const technicianAssignmentReview = getTechnicianAssignmentIssues(technicianAssignment);

  if (!soId || !customerName || !phone || !preferredDate || !devicesText || !shippingCity || !shippingAddress) {
    return {
      error: 'SO ID, Customer, Phone, Delivery/Installation/Pickup date, Devices, Shipping City, and Shipping Address are required.',
    };
  }

  const notes = buildStructuredNotes([
    ['SO ID', soId],
    ['WO ID', woId],
    ['Customer', customerName],
    ['Email', email],
    ['Phone', phone],
    ['Delivery date', deliveryDate],
    ['Pickup date', pickupDate],
    ['Installation date', installationDate],
    ['Excel status', externalStatus],
    ['Bundled items', bundledItems ? String(bundledItems) : ''],
    ['Device count', devCount ? String(devCount) : ''],
    ['Shipping city', shippingCity],
    ['Shipping address', shippingAddress],
    ['Devices', deviceInfo.rawLines.join(' | ')],
    ['Completed within SLA', withinSLA],
    ['Completed Exceed SLA', exceedSLA],
    ['Courier', courier],
    ['Courier number', courierNum],
    ['Chat Log', chatLog],
    ['Tech ID', technicianAssignment.techId],
    ['Area Code', technicianAssignment.areaCode],
    ['Tech Code', technicianAssignment.techCode],
    ['Area Name', technicianAssignment.areaName],
    ['Tech Short Name', technicianAssignment.techShortName],
  ]);

  return {
    requestNumber: soId,
    soId,
    woId,
    customerName,
    email,
    phone: normalizeSaudiPhoneNumber(phone),
    secondaryPhone: '',
    whatsappPhone: normalizeSaudiPhoneNumber(phone),
    city: shippingCity,
    district: extractDistrictFromShippingAddress(shippingAddress, shippingCity),
    addressText: shippingAddress,
    landmark: '',
    mapLink: buildGoogleMapsLink(shippingAddress),
    sourceChannel: 'Manual Excel-style intake',
    serviceSummary: deviceInfo.rawLines.join(' | ') || `${devCount} device(s)`,
    acDetails,
    acCount: Math.max(1, devCount),
    priority: 'normal',
    deliveryType: 'none',
    deliveryDate,
    installationDate,
    pickupDate,
    preferredDate,
    preferredTime: '09:00',
    scheduledDate: '',
    scheduledTime: '',
    coordinationNote: '',
    notes,
    status: normalizeImportedInstallationStatus(externalStatus),
    externalStatus,
    withinSLA,
    exceedSLA,
    courier,
    courierNum,
    chatLog,
    techId: technicianAssignment.techId,
    areaCode: technicianAssignment.areaCode,
    techCode: technicianAssignment.techCode,
    areaName: technicianAssignment.areaName,
    techShortName: technicianAssignment.techShortName,
    technicianAssignmentReview,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
};

const defaultState = {
  users: [
    {
      id: 'user-bob-customer-service',
      name: 'كميل',
      email: 'bobmorgann2@gmail.com',
      password: 'Komeil9610@@@',
      role: 'admin',
      workspaceRoles: ['admin'],
      status: 'active',
    },
    {
      id: 'user-tarkeebpro-operations',
      name: 'مدير العمليات',
      email: 'tarkeebpro@gmail.com',
      password: 'manger123@',
      role: 'operations_manager',
      workspaceRoles: ['operations_manager'],
      status: 'active',
    },
  ],
  orders: [],
};

const defaultHomeSettings = createDefaultHomeSettings();

const defaultFooter = {
  aboutText:
    'تركيب برو لخدمات تركيب وصيانة المكيفات بخبرة عالية، سرعة في الوصول، وضمان على جودة العمل.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'Login', url: '/login' },
  ],
  customerServiceLinks: [
    { label: 'Support', url: 'tel:0558232644' },
    { label: 'WhatsApp', url: 'https://wa.me/966558232644' },
    { label: 'Call us', url: 'mailto:bookings@kumeelalnahab.com' },
  ],
  socialLinks: [
    { platform: 'whatsapp', url: 'https://wa.me/966558232644' },
  ],
  copyrightText: '© 2026 TrkeebPro',
};

const readStoredHomeSettings = () => {
  const raw = readStorage(HOMEPAGE_STORAGE_KEY);
  if (!raw) {
    return clone(defaultHomeSettings);
  }

  try {
    return normalizeHomeSettings(JSON.parse(raw));
  } catch {
    return clone(defaultHomeSettings);
  }
};

const writeStoredHomeSettings = (settings) => {
  const nextSettings = normalizeHomeSettings(settings);
  writeStorage(HOMEPAGE_STORAGE_KEY, JSON.stringify(nextSettings));
  window.dispatchEvent(new CustomEvent('home-settings-updated'));
  return clone(nextSettings);
};

const readStoredFooterSettings = () => {
  const raw = readStorage(FOOTER_STORAGE_KEY);
  if (!raw) {
    return clone(defaultFooter);
  }

  try {
    return { ...defaultFooter, ...(JSON.parse(raw) || {}) };
  } catch {
    return clone(defaultFooter);
  }
};

const writeStoredFooterSettings = (settings) => {
  const nextSettings = { ...defaultFooter, ...(settings || {}) };
  writeStorage(FOOTER_STORAGE_KEY, JSON.stringify(nextSettings));
  window.dispatchEvent(new CustomEvent('footer-settings-updated'));
  return clone(nextSettings);
};

const normalizePersistedState = (state) => {
  const incoming = safeJson(JSON.stringify(state), {}) || {};
  const persistedUsers = Array.isArray(incoming.users) ? incoming.users : [];
  const mergedUsers = defaultState.users.map((defaultUser) => {
    const persisted = persistedUsers.find(
      (user) => String(user?.id || '') === defaultUser.id || String(user?.role || '') === defaultUser.role
    );
    const mergedUser = { ...persisted, ...defaultUser };
    return {
      ...mergedUser,
      workspaceRoles: normalizeWorkspaceRoles(mergedUser.workspaceRoles, mergedUser.role),
      role: resolveWorkspaceRole(mergedUser.role, mergedUser.workspaceRoles, defaultUser.role),
    };
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
  const workspaceRoles = normalizeWorkspaceRoles(user.workspaceRoles, user.role);
  return {
    ...user,
    role: resolveWorkspaceRole(user.role, workspaceRoles, user.role),
    workspaceRoles,
  };
};

const readActiveWorkspaceRole = () => normalizeRole(getActiveAuthUser()?.role);

const countRemainingTodayOrders = (orders = [], selectedDate = todayString()) =>
  orders.filter((order) => {
    const taskDate = getLocalOrderTaskDate(order);
    return taskDate === selectedDate && !['completed', 'canceled'].includes(String(order.status || '').trim());
  }).length;

const appendOperationsRemainingSummary = (body, orders = [], selectedDate = todayString()) =>
  `${String(body || '').trim()}\nالمتبقي في مهام اليوم: ${countRemainingTodayOrders(orders, selectedDate)} طلب.`;

const nextNotificationId = (items = []) =>
  items.reduce((maxId, item) => Math.max(maxId, Number(item?.id) || 0), 0) + 1;

const appendNotificationsForRoles = (state, roles = [], payload = {}) => {
  const recipients = (state.users || []).flatMap((user) => {
    const workspaceRoles = normalizeWorkspaceRoles(user.workspaceRoles, user.role);
    return normalizeWorkspaceRoles(roles)
      .filter((role) => workspaceRoles.includes(role))
      .map((role) => ({
        userId: String(user.id),
        targetRole: role,
      }));
  });

  if (!recipients.length) {
    return;
  }

  const items = readStoredNotifications();
  let currentId = nextNotificationId(items);
  const createdAt = nowIso();
  const nextItems = [
    ...recipients.map(({ userId, targetRole }) => ({
      id: currentId++,
      userId,
      targetRole,
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

    const taskDateDiff = `${getLocalOrderTaskDate(left) || ''}`.localeCompare(`${getLocalOrderTaskDate(right) || ''}`);
    if (taskDateDiff !== 0) {
      return taskDateDiff;
    }

    const timeDiff = `${left.scheduledTime || left.preferredTime || ''}`.localeCompare(
      `${right.scheduledTime || right.preferredTime || ''}`
    );
    if (timeDiff !== 0) {
      return timeDiff;
    }

    return `${right.updatedAt || right.createdAt || ''}`.localeCompare(`${left.updatedAt || left.createdAt || ''}`);
  });

const extractLocalOrderIdentifiers = (order = {}) => ({
  requestNumber: String(order.requestNumber || order.request_number || '').trim(),
  soId:
    String(
      order.soId ||
        extractImportReferenceValue(order, 'soId') ||
        extractImportReferenceValue(order, 'SO ID') ||
        order.requestNumber ||
        order.request_number ||
        ''
    ).trim(),
  woId: String(order.woId || extractImportReferenceValue(order, 'woId') || extractImportReferenceValue(order, 'WO ID') || '').trim(),
});

const findDuplicateLocalOrder = (orders = [], candidate = {}, excludeId = '') => {
  const refs = extractLocalOrderIdentifiers(candidate);
  const normalizedExcludeId = String(excludeId || '').trim();

  return (
    (orders || []).find((order) => {
      if (normalizedExcludeId && String(order.id) === normalizedExcludeId) {
        return false;
      }

      const existingRefs = extractLocalOrderIdentifiers(order);
      return (
        (refs.requestNumber && existingRefs.requestNumber === refs.requestNumber) ||
        (refs.soId && existingRefs.soId === refs.soId) ||
        (refs.woId && existingRefs.woId === refs.woId)
      );
    }) || null
  );
};

const buildLocalDuplicateMessage = (order, candidate = {}) => {
  const existingRefs = extractLocalOrderIdentifiers(order);
  const refs = extractLocalOrderIdentifiers(candidate);

  if (refs.woId && existingRefs.woId === refs.woId) {
    return `WO ID already exists: ${refs.woId}`;
  }

  if (refs.soId && existingRefs.soId === refs.soId) {
    return `SO ID already exists: ${refs.soId}`;
  }

  return `Request number already exists: ${refs.requestNumber}`;
};

const getOrderDeviceCountForSummary = (order = {}) =>
  Math.max(
    0,
    Number(order?.acCount || order?.ac_count) ||
      normalizeAcDetails(order?.acDetails || order?.serviceItems).reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0)
  ) || 0;

const mapRemoteOrder = (order = {}) => {
  const technicianAssignment = readMappedTechnicianAssignment(order);

  return {
    id: order.id || `ORD-${order.numericId || Date.now()}`,
    numericId: Number(order.numericId) || Number(String(order.id || '').replace(/\D/g, '')) || Date.now(),
    requestNumber: order.requestNumber || order.request_number || order.source || order.id,
    soId:
      order.soId ||
      extractImportReferenceValue(order, 'soId') ||
      extractImportReferenceValue(order, 'SO ID') ||
      order.requestNumber ||
      order.request_number ||
      '',
    woId: order.woId || extractImportReferenceValue(order, 'woId') || extractImportReferenceValue(order, 'WO ID') || '',
    customerName: order.customerName || order.customer_name || '',
    email: order.email || extractImportReferenceValue(order, 'Email') || '',
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
    pickupDate: order.pickupDate || extractImportReferenceValue(order, 'Pickup date') || '',
    installationDate: order.installationDate || extractImportReferenceValue(order, 'Installation date') || '',
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
    withinSLA: order.withinSLA || extractImportReferenceValue(order, 'Completed within SLA') || '',
    exceedSLA: order.exceedSLA || extractImportReferenceValue(order, 'Completed Exceed SLA') || '',
    courier: order.courier || extractImportReferenceValue(order, 'Courier') || '',
    courierNum: order.courierNum || extractImportReferenceValue(order, 'Courier number') || '',
    chatLog: order.chatLog || extractImportReferenceValue(order, 'Chat Log') || extractImportReferenceValue(order, 'Chat message') || '',
    techId: technicianAssignment.techId || '',
    areaCode: technicianAssignment.areaCode || '',
    techCode: technicianAssignment.techCode || '',
    areaName: technicianAssignment.areaName || order.areaName || extractImportReferenceValue(order, 'Area Name') || '',
    techShortName: technicianAssignment.techShortName || order.techShortName || extractImportReferenceValue(order, 'Tech Short Name') || '',
    photos: Array.isArray(order.photos) ? order.photos : [],
    extras: order.extras || null,
    createdByUserId: order.createdByUserId || order.created_by_user_id || '',
    createdByName: order.createdByName || order.created_by_name || '',
    createdAt: order.createdAt || order.created_at || nowIso(),
    updatedAt: order.updatedAt || order.updated_at || nowIso(),
    auditLog: Array.isArray(order.auditLog) ? order.auditLog : [],
  };
};

const buildSummary = (orders = []) => ({
  totalOrders: orders.filter((order) => order.status !== 'canceled').length,
  pendingOrders: orders.filter((order) => order.status === 'pending').length,
  activeOrders: orders.filter((order) => ['scheduled', 'in_transit'].includes(order.status)).length,
  completedOrders: orders.filter((order) => order.status === 'completed').length,
  inTransitOrders: orders.filter((order) => order.status === 'in_transit').length,
  canceledOrders: orders.filter((order) => order.status === 'canceled').length,
  totalDevices: orders.reduce((sum, order) => sum + getOrderDeviceCountForSummary(order), 0),
});

const orderMatchesLocalDailyTaskDate = (order = {}, selectedDate = todayString()) => {
  const normalizedDate = selectedDate || todayString();
  const deliveryDate = normalizeDateOnly(order?.deliveryDate || extractImportReferenceValue(order, 'Delivery date'));
  const installationDate = normalizeDateOnly(order?.installationDate || extractImportReferenceValue(order, 'Installation date'));
  return deliveryDate === normalizedDate || installationDate === normalizedDate;
};

const getDailyTasksPayload = (orders = [], selectedDate = todayString()) => {
  const normalizedDate = selectedDate || todayString();
  const todayOrders = orders.filter((order) => {
    return orderMatchesLocalDailyTaskDate(order, normalizedDate) && order.status !== 'canceled';
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

const shouldInvalidateSession = (error) => {
  const status = Number(error?.response?.status || 0);
  const message = String(error?.response?.data?.message || error?.message || '').toLowerCase();
  return status === 401 || (status === 403 && /internal access required|unauthorized/.test(message));
};

const notifyInvalidSession = () => {
  removeStorage('authToken');
  removeStorage('authUser');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-invalidated'));
  }
};

const normalizeLocalApiBaseUrl = (value, port) => {
  if (!isLocalhost || typeof window === 'undefined') {
    return value;
  }

  const fallbackUrl = `http://${window.location.hostname}:${port}/api`;
  if (!value) {
    return fallbackUrl;
  }

  try {
    const parsed = new URL(value);
    if (['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      parsed.hostname = window.location.hostname;
      return parsed.toString().replace(/\/$/, '');
    }
  } catch {
    return value;
  }

  return value;
};

const API_BASE_URL =
  normalizeLocalApiBaseUrl(process.env.REACT_APP_API_URL, 8787) ||
  (isLocalhost ? `http://${window.location.hostname}:8787/api` : '/api');
const BACKEND_API_BASE_URL =
  normalizeLocalApiBaseUrl(process.env.REACT_APP_BACKEND_API_URL, 5000) ||
  (isLocalhost ? `http://${window.location.hostname}:5000/api` : '');

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

export const canUploadExcelSource = true;

apiClient.interceptors.request.use((config) => {
  const token = readStorage('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const workspaceRole = readActiveWorkspaceRole();
  if (workspaceRole) {
    config.headers['X-Workspace-Role'] = workspaceRole;
  }
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (shouldInvalidateSession(error)) {
      notifyInvalidSession();
    }
    return Promise.reject(error);
  }
);
if (backendApiClient) {
  backendApiClient.interceptors.request.use((config) => {
    const token = readStorage('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const workspaceRole = readActiveWorkspaceRole();
    if (workspaceRole) {
      config.headers['X-Workspace-Role'] = workspaceRole;
    }
    return config;
  });
  backendApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (shouldInvalidateSession(error)) {
        notifyInvalidSession();
      }
      return Promise.reject(error);
    }
  );
}

const buildMultipartHeaders = () => {
  const headers = {};
  const token = readStorage('authToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const workspaceRole = readActiveWorkspaceRole();
  if (workspaceRole) {
    headers['X-Workspace-Role'] = workspaceRole;
  }
  return headers;
};

const postMultipartForm = async (url, formData) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: buildMultipartHeaders(),
    body: formData,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof payload === 'string' ? payload : payload?.message || `Request failed with status code ${response.status}`
    );
    error.response = {
      status: response.status,
      data: typeof payload === 'string' ? { message: payload } : payload,
    };
    throw error;
  }

  return {
    data: payload,
  };
};

const wait = (delayMs = 0) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(0, Number(delayMs) || 0));
  });

const isTransientImportError = (error) => [502, 503, 504].includes(Number(error?.response?.status || 0));

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
  async login(email, password, workspaceRole = '') {
    const state = readState();
    const user = state.users.find(
      (entry) =>
        String(entry.email || '').toLowerCase() === String(email || '').trim().toLowerCase() &&
        entry.password === password
    );
    if (!user) {
      throw new Error('Invalid login details');
    }
    const workspaceRoles = normalizeWorkspaceRoles(user.workspaceRoles, user.role);
    const safeUser = {
      ...user,
      role: resolveWorkspaceRole(workspaceRole, workspaceRoles, user.role),
      workspaceRoles,
    };
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
        technicians: [],
        timeStandards: [],
        areaClusters: [],
      },
    });
  },

  async createOrder(payload) {
    const activeUser = getActiveAuthUser();
    if (!activeUser || !['admin', 'customer_service'].includes(activeUser.role)) {
      throw new Error('Only admin or customer service can create requests');
    }

    const normalized = normalizeManualExcelStyleOrderPayload(payload);
    if (normalized.error) {
      throw new Error(normalized.error);
    }

    const state = readState();
    const duplicate = findDuplicateLocalOrder(state.orders || [], normalized);
    if (duplicate) {
      throw new Error(buildLocalDuplicateMessage(duplicate, normalized));
    }

    const createdOrder = {
      id: `ORD-${Date.now()}`,
      numericId: Date.now(),
      ...normalized,
      auditLog: [
        buildAuditEntry(
          activeUser.role === 'admin' ? 'admin' : 'customer_service',
          `تم إنشاء الطلب ${normalized.requestNumber} يدويًا بنفس مخطط ملف Excel.`
        ),
      ],
      createdByUserId: activeUser.id,
      createdByName: activeUser.name,
      technicianId: '',
      technicianUserId: '',
      technicianName: normalized.techId || '',
      photos: [],
      extras: null,
      customerAction: 'none',
      rescheduleReason: '',
      cancellationReason: '',
      approvalStatus: 'pending',
      proofStatus: 'pending_review',
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
    };

    const nextOrders = sortOrders([createdOrder, ...(state.orders || [])]);
    writeState({ ...state, orders: nextOrders });
    appendNotificationsForRoles(state, ['operations_manager'], {
      title: 'طلب جديد',
      body: appendOperationsRemainingSummary(`تم إنشاء الطلب رقم ${normalized.requestNumber} يدويًا وفق جدول Excel.`, nextOrders),
      relatedOrderId: createdOrder.id,
    });
    if (normalized.technicianAssignmentReview?.needsReview) {
      const issueSummary = [
        normalized.technicianAssignmentReview.missingAreaCode
          ? `رمز المنطقة ${normalized.technicianAssignmentReview.areaCode || '-'} غير موجود`
          : '',
        normalized.technicianAssignmentReview.missingTechCode
          ? `رمز الفني ${normalized.technicianAssignmentReview.techCode || '-'} غير موجود`
          : '',
      ]
        .filter(Boolean)
        .join('، ');

      appendNotificationsForRoles(state, ['admin', 'operations_manager'], {
        title: 'مراجعة تعيين الفني مطلوبة',
        body: `الطلب رقم ${normalized.requestNumber} يحتوي على كود تعيين يحتاج مراجعة (${normalized.technicianAssignmentReview.techId || '-'}). ${issueSummary}. يرجى تعيين الفني يدويًا لهذا الطلب.`,
        relatedOrderId: createdOrder.id,
        kind: 'assignment_review',
      });
    }

    return delay({ data: { order: createdOrder } });
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

    if (['customer_service', 'admin'].includes(activeUser.role)) {
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
          buildAuditEntry(activeUser.role === 'admin' ? 'admin' : 'customer_service', `طلبت الإدارة إعادة جدولة الطلب. ${nextOrder.rescheduleReason}`),
        ];
      }

      if (changes.status === 'canceled') {
        nextOrder.status = 'canceled';
        nextOrder.customerAction = 'cancel_requested';
        nextOrder.cancellationReason = String(changes.cancellationReason || '').trim();
        nextOrder.canceledAt = nowIso();
        nextOrder.auditLog = [
          ...(nextOrder.auditLog || []),
          buildAuditEntry(activeUser.role === 'admin' ? 'admin' : 'customer_service', `ألغت الإدارة الطلب. ${nextOrder.cancellationReason}`),
        ];
      }
    }

    if (['operations_manager', 'admin'].includes(activeUser.role)) {
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
          activeUser.role === 'admin' ? 'admin' : 'operations_manager',
          changes.contactCustomerNote
            ? `${activeUser.role === 'admin' ? 'سجلت الإدارة' : 'سجل مدير العمليات'} تواصلاً مع العميل. ${String(changes.contactCustomerNote || '').trim()}`
            : activeUser.role === 'admin'
              ? 'قامت الإدارة بتحديث تنسيق الموعد أو الحالة.'
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

    const duplicate = findDuplicateLocalOrder(state.orders || [], nextOrder, orderId);
    if (duplicate) {
      throw new Error(buildLocalDuplicateMessage(duplicate, nextOrder));
    }

    if (nextOrder.deliveryType === 'express_24h' && !isFastDeliveryCity(nextOrder.city)) {
      throw new Error('Fast delivery is only available in the listed major cities');
    }

    const nextOrders = (state.orders || []).map((order) => (String(order.id) === String(orderId) ? nextOrder : order));
    writeState({ ...state, orders: nextOrders });

    if (['operations_manager', 'admin'].includes(activeUser.role) && changes.status !== undefined && nextOrder.status !== previousStatus) {
      appendNotificationsForRoles(state, ['admin', 'customer_service'], {
        title: 'تم تحديث حالة الطلب',
        body: `تم تحديث حالة الطلب رقم ${nextOrder.requestNumber} إلى ${ORDER_STATUS_AR_LABELS[nextOrder.status] || nextOrder.status}.`,
        relatedOrderId: nextOrder.id,
      });
    }

    if (['operations_manager', 'admin'].includes(activeUser.role) && (changes.scheduledDate !== undefined || changes.scheduledTime !== undefined)) {
      appendNotificationsForRoles(state, ['admin', 'customer_service'], {
        title: 'تم تنسيق موعد الطلب',
        body: `تم تحديد موعد ${nextOrder.requestNumber} بتاريخ ${nextOrder.scheduledDate || '-'} الساعة ${nextOrder.scheduledTime || '-'}.`,
        relatedOrderId: nextOrder.id,
      });
    }

    if (['customer_service', 'admin'].includes(activeUser.role) && nextOrder.status !== previousStatus) {
      appendNotificationsForRoles(state, ['operations_manager'], {
        title: 'تم تحديث حالة الطلب',
        body: appendOperationsRemainingSummary(
          `تم تحديث حالة الطلب رقم ${nextOrder.requestNumber} إلى ${ORDER_STATUS_AR_LABELS[nextOrder.status] || nextOrder.status}.`,
          nextOrders
        ),
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
  createImportJob: (data) => apiClient.post('/operations/orders/import-jobs', data),
  getImportJob: (jobId) => apiClient.get(`/operations/orders/import-jobs/${String(jobId)}`),
  processImportJob: (jobId, data) => apiClient.post(`/operations/orders/import-jobs/${String(jobId)}/process`, data),
  uploadExcelSource: (formData) => apiClient.post('/operations/excel-import/preview-upload', formData),
  createTechnician: (data) => apiClient.post('/operations/technicians', data),
  updateTechnician: (technicianId, data) => apiClient.put(`/operations/technicians/${String(technicianId)}`, data),
  deleteTechnician: (technicianId) => apiClient.delete(`/operations/technicians/${String(technicianId)}`),
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
  login: (email, password, workspaceRole = '') =>
    withFallback(
      () => apiClient.post('/auth/login', { email, password, workspaceRole }),
      () => localAuthService.login(email, password, workspaceRole)
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
            technicians: Array.isArray(response.data?.technicians) ? response.data.technicians : [],
            timeStandards: Array.isArray(response.data?.timeStandards) ? response.data.timeStandards : [],
            areaClusters: Array.isArray(response.data?.areaClusters) ? response.data.areaClusters : [],
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
  importOrdersFromExcel: async (fileName = 'data.xlsx', uploadedPreview = null, options = {}) => {
    if (!uploadedPreview && backendApiClient) {
      throw new Error('Upload the Excel file again before importing');
    }

    const preview = uploadedPreview ? { data: uploadedPreview } : await axios.get('/excel-import/orders.json');
    const previewData = preview.data || null;
<<<<<<< Updated upstream
    const orders = Array.isArray(previewData?.orders) ? previewData.orders.filter((order) => order.importStatus !== 'completed') : [];
=======
    const orders = Array.isArray(previewData?.orders) ? previewData.orders : [];
    const previewToken = String(previewData?.previewToken || '').trim();
    const validPreviewRows = Number(previewData?.summary?.validOrders || orders.length || 0);
>>>>>>> Stashed changes

    if (!previewToken && !orders.length) {
      return {
        data: {
          importedCount: 0,
          skippedCount: 0,
          skippedOrders: [],
          preview: previewData,
        },
      };
    }

<<<<<<< Updated upstream
    const chunkSize = 100;
    let importedCount = 0;
    let skippedCount = 0;
    const skippedOrders = [];
=======
    const chunkSize = Math.max(1, Number(options?.chunkSize) || 30);
    const interChunkDelayMs = Math.max(0, Number(options?.interChunkDelayMs) || 120);
    const maxRetries = Math.max(0, Number(options?.maxRetries) || 2);
    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;
    const totalRows = Math.max(0, validPreviewRows);
    const totalChunks = Math.max(1, Math.ceil(totalRows / chunkSize));
    const createJobResponse = await remoteOperationsService.createImportJob({
      fileName,
      previewToken: previewToken || undefined,
      orders: previewToken ? undefined : orders,
      chunkSize,
    });
    const jobId = createJobResponse.data?.job?.id;
    const backgroundQueued = createJobResponse.data?.backgroundQueued !== false;
    if (!jobId) {
      throw new Error('Unable to create import job');
    }
>>>>>>> Stashed changes

    let job = createJobResponse.data?.job || null;
    if (onProgress && job) {
      onProgress({
        currentChunk: Math.min(totalChunks, Math.ceil((Number(job.processedRows) || 0) / chunkSize) || 1),
        totalChunks,
        processedRows: Number(job.processedRows) || 0,
        totalRows: Number(job.totalRows) || totalRows,
        importedCount: Number(job.importedCount) || 0,
        createdCount: Number(job.createdCount) || 0,
        updatedCount: Number(job.updatedCount) || 0,
        archivedCount: Number(job.archivedCount) || 0,
        restoredCount: Number(job.restoredCount) || 0,
        unchangedCount: Number(job.unchangedCount) || 0,
        skippedCount: Number(job.skippedCount) || 0,
        jobId,
        status: job.status,
      });
<<<<<<< Updated upstream
      importedCount += Number(response.data?.importedCount) || 0;
      skippedCount += Number(response.data?.skippedCount) || 0;
      skippedOrders.push(...(response.data?.skippedOrders || []));
=======
    }

    const readJobStatus = async () => {
      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          const response = await remoteOperationsService.getImportJob(jobId);
          return response.data?.job || null;
        } catch (error) {
          if (!isTransientImportError(error) || attempt === maxRetries) {
            throw error;
          }
          attempt += 1;
          await wait(300 * attempt);
        }
      }
      return null;
    };

    while (!job || !['completed', 'failed'].includes(String(job.status || '').trim())) {
      if (backgroundQueued) {
        await wait(Math.max(800, interChunkDelayMs));
        job = await readJobStatus();
      } else {
        let response = null;
        let attempt = 0;
        while (attempt <= maxRetries) {
          try {
            response = await remoteOperationsService.processImportJob(jobId, {});
            break;
          } catch (error) {
            if (!isTransientImportError(error) || attempt === maxRetries) {
              throw error;
            }
            attempt += 1;
            await wait(300 * attempt);
          }
        }
        job = response.data?.job || (await readJobStatus()) || null;
      }

      if (!job) {
        throw new Error('Import job status could not be read');
      }

      if (onProgress) {
        onProgress({
          currentChunk: Math.min(totalChunks, Math.ceil((Number(job.processedRows) || 0) / chunkSize) || 1),
          totalChunks,
          processedRows: Number(job.processedRows) || 0,
          totalRows: Number(job.totalRows) || totalRows,
          importedCount: Number(job.importedCount) || 0,
          createdCount: Number(job.createdCount) || 0,
          updatedCount: Number(job.updatedCount) || 0,
          archivedCount: Number(job.archivedCount) || 0,
          restoredCount: Number(job.restoredCount) || 0,
          unchangedCount: Number(job.unchangedCount) || 0,
          skippedCount: Number(job.skippedCount) || 0,
          jobId,
          status: job.status,
        });
      }

      if (job.status === 'failed') {
        throw new Error(job.lastError || 'Import job failed');
      }

      if (!backgroundQueued && job.status !== 'completed' && interChunkDelayMs > 0) {
        await wait(interChunkDelayMs);
      }
>>>>>>> Stashed changes
    }

    window.dispatchEvent(new CustomEvent('operations-updated'));
    return {
      data: {
        fileName,
<<<<<<< Updated upstream
        importedCount,
        skippedCount,
        skippedOrders,
=======
        jobId,
        status: job.status,
        importedCount: Number(job.importedCount) || 0,
        createdCount: Number(job.createdCount) || 0,
        updatedCount: Number(job.updatedCount) || 0,
        archivedCount: Number(job.archivedCount) || 0,
        restoredCount: Number(job.restoredCount) || 0,
        unchangedCount: Number(job.unchangedCount) || 0,
        skippedCount: Number(job.skippedCount) || 0,
        skippedOrders: Array.isArray(job.skippedOrders) ? job.skippedOrders : [],
>>>>>>> Stashed changes
        preview: previewData,
      },
    };
  },
  uploadExcelSource: async (file) => {
    if (!file) {
      throw new Error('Choose an Excel file first');
    }

    const buildFormData = () => {
      const formData = new FormData();
      formData.append('file', file);
      return formData;
    };

    try {
      return await postMultipartForm(`${API_BASE_URL}/operations/excel-import/preview-upload`, buildFormData());
    } catch (error) {
      if (!backendApiClient || (error?.response?.status && error.response.status < 500 && error.response.status !== 404)) {
        throw error;
      }

      return postMultipartForm(`${BACKEND_API_BASE_URL}/operations/excel-import/upload`, buildFormData());
    }
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
  updateTechnician: (technicianId, data) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.updateTechnician(technicianId, data);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      async () => {
        throw new Error('Technician updates are unavailable in local mode');
      }
    ),
  deleteTechnician: (technicianId) =>
    withFallback(
      async () => {
        const response = await remoteOperationsService.deleteTechnician(technicianId);
        window.dispatchEvent(new CustomEvent('operations-updated'));
        return response;
      },
      async () => {
        throw new Error('Technician deletion is unavailable in local mode');
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
        return {
          ...response,
          data: {
            ...response.data,
            order: response.data?.order ? mapRemoteOrder(response.data.order) : null,
          },
        };
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
      const activeRole = normalizeRole(activeUser?.role);
      const items = readStoredNotifications().filter(
        (item) =>
          String(item.userId) === String(activeUser?.id || '') &&
          (!item.targetRole || normalizeRole(item.targetRole) === activeRole)
      );
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
      const activeRole = normalizeRole(activeUser?.role);
      const nextItems = readStoredNotifications().map((item) =>
        String(item.userId) === String(activeUser?.id || '') &&
        (!item.targetRole || normalizeRole(item.targetRole) === activeRole)
          ? { ...item, isRead: true }
          : item
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
      () => delay({ data: { footer: readStoredFooterSettings() } })
    ),
  adminGet: () =>
    withFallback(
      () => apiClient.get('/admin/footer'),
      () => delay({ data: { footer: readStoredFooterSettings() } })
    ),
  update: (payload) =>
    withFallback(
      () => apiClient.put('/admin/footer', payload),
      () => delay({ data: { message: 'Footer updated', footer: writeStoredFooterSettings(payload) } })
    ),
};

export const homeService = {
  get: () =>
    withFallback(
      () => apiClient.get('/home-settings'),
      () => delay({ data: { homeSettings: readStoredHomeSettings() } })
    ),
  adminGet: () =>
    withFallback(
      () => apiClient.get('/admin/home-settings'),
      () => delay({ data: { homeSettings: readStoredHomeSettings() } })
    ),
  update: (payload) =>
    withFallback(
      () => apiClient.put('/admin/home-settings', payload),
      () => delay({ data: { message: 'Home settings updated', homeSettings: writeStoredHomeSettings(payload) } })
    ),
};

export default apiClient;
