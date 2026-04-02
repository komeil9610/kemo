import { normalizeSaudiPhoneNumber } from '../services/api';

const OPERATIONAL_DATE_STORAGE_KEY = 'tarkeeb-pro-operational-date';

export const statusLabels = {
  pending: { ar: 'طلب جديد', en: 'New request' },
  scheduled: { ar: 'تمت الجدولة', en: 'Scheduled' },
  in_transit: { ar: 'في الطريق', en: 'In transit' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  canceled: { ar: 'ملغي', en: 'Canceled' },
};

export const boardColumns = ['pending', 'scheduled', 'in_transit', 'completed'];

export const todayString = () => new Date().toISOString().slice(0, 10);

const parseOperationalDate = (value) => {
  const normalized = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : '';
};

export const getOperationalDate = () => {
  if (typeof window === 'undefined') {
    return todayString();
  }

  try {
    return parseOperationalDate(window.localStorage.getItem(OPERATIONAL_DATE_STORAGE_KEY)) || todayString();
  } catch {
    return todayString();
  }
};

export const setOperationalDate = (value) => {
  const normalized = parseOperationalDate(value) || todayString();
  if (typeof window === 'undefined') {
    return normalized;
  }

  try {
    window.localStorage.setItem(OPERATIONAL_DATE_STORAGE_KEY, normalized);
  } catch {
    return normalized;
  }

  window.dispatchEvent(new CustomEvent('operations-date-updated', { detail: { date: normalized } }));
  return normalized;
};

export const nextDateString = (dateValue) => {
  const baseDate = new Date(`${parseOperationalDate(dateValue) || todayString()}T12:00:00`);
  if (Number.isNaN(baseDate.getTime())) {
    return todayString();
  }
  baseDate.setDate(baseDate.getDate() + 1);
  return baseDate.toISOString().slice(0, 10);
};

export const getOrderTaskDate = (order) =>
  order?.scheduledDate || order?.preferredDate || String(order?.createdAt || '').slice(0, 10) || '';

const extractExcelStatusFromNotes = (notes) => {
  const text = String(notes || '');
  const match = text.match(/(?:^|\n)Excel status:\s*(.+?)(?:\n|$)/i);
  return String(match?.[1] || '').trim();
};

export const getOrderExternalStatus = (order = {}) =>
  String(order?.externalStatus || order?.excelStatus || order?.importMeta?.excelStatus || extractExcelStatusFromNotes(order?.notes)).trim();

export const getOrderDisplayStatus = (order = {}, lang = 'ar') => {
  const externalStatus = getOrderExternalStatus(order);
  if (externalStatus) {
    return externalStatus;
  }
  return statusLabels[order.status]?.[lang] || String(order.status || '').trim() || (lang === 'ar' ? 'غير محدد' : 'Unknown');
};

export const getOrderDisplayStatusKey = (order = {}, lang = 'ar') => {
  const displayStatus = getOrderDisplayStatus(order, lang);
  const internalStatus = String(order?.status || '').trim();
  if (!displayStatus) {
    return internalStatus || 'unknown';
  }
  if (!getOrderExternalStatus(order) && internalStatus) {
    return internalStatus;
  }
  return displayStatus
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '') || 'unknown';
};

export const orderMatchesDisplayStatus = (order = {}, statusKey = '', lang = 'ar') =>
  getOrderDisplayStatusKey(order, lang) === String(statusKey || '').trim();

export const buildDisplayStatusBuckets = (orders = [], lang = 'ar') => {
  const bucketMap = new Map();

  for (const order of Array.isArray(orders) ? orders : []) {
    const key = getOrderDisplayStatusKey(order, lang);
    const label = getOrderDisplayStatus(order, lang);
    const current = bucketMap.get(key) || { key, label, count: 0 };
    current.count += 1;
    bucketMap.set(key, current);
  }

  return Array.from(bucketMap.values()).sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, 'ar'));
};

export const nextStatusFor = (status) => {
  const sequence = ['pending', 'scheduled', 'in_transit', 'completed'];
  const currentIndex = sequence.indexOf(status);
  return currentIndex === -1 ? null : sequence[currentIndex + 1] || null;
};

export const getOrderDeviceCount = (order = {}) => {
  const explicitCount = Math.max(0, Number(order?.acCount) || 0);
  if (explicitCount > 0) {
    return explicitCount;
  }

  const derivedCount = (Array.isArray(order?.acDetails) ? order.acDetails : []).reduce(
    (sum, item) => sum + Math.max(0, Number(item?.quantity) || 0),
    0
  );

  return derivedCount || 0;
};

export const buildCallUrl = (value) => {
  const normalized = normalizeSaudiPhoneNumber(value);
  if (!normalized) {
    return '#';
  }
  return normalized.startsWith('0') ? `tel:+966${normalized.slice(1)}` : `tel:${normalized}`;
};

export const formatDateTimeLabel = (dateValue, timeValue, lang) => {
  if (!dateValue && !timeValue) {
    return '—';
  }

  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  if (!dateValue) {
    return timeValue;
  }

  const parsed = new Date(`${dateValue}T${timeValue || '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return [dateValue, timeValue].filter(Boolean).join(' - ');
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...(timeValue ? { timeStyle: 'short' } : {}),
  }).format(parsed);
};

export const getOrdersForView = (orders, viewKey) => {
  if (viewKey === 'active') {
    return orders.filter((order) => ['scheduled', 'in_transit'].includes(order.status));
  }

  if (viewKey === 'completed') {
    return orders.filter((order) => ['completed', 'canceled'].includes(order.status));
  }

  if (viewKey === 'in_transit') {
    return orders.filter((order) => order.status === 'in_transit');
  }

  if (viewKey === 'pending') {
    return orders.filter((order) => order.status === 'pending');
  }

  return [];
};

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const exportOrdersCsv = ({ orders, lang, scopeLabel, fileDate = todayString() }) => {
  const header =
    lang === 'ar'
      ? [
          'رقم الطلب',
          'اسم العميل',
          'الجوال',
          'واتساب',
          'المدينة',
          'الحي',
          'الحالة',
          'الأولوية',
          'نوع التوصيل',
          'الموعد المفضل',
          'الموعد المنسق',
          'ملخص الخدمة',
          'إجراء خدمة العملاء',
          'سبب إعادة الجدولة',
          'سبب الإلغاء',
          'ملاحظات',
        ]
      : [
          'Request Number',
          'Customer Name',
          'Phone',
          'WhatsApp',
          'City',
          'District',
          'Status',
          'Priority',
          'Delivery Type',
          'Preferred Slot',
          'Scheduled Slot',
          'Service Summary',
          'CSR Action',
          'Reschedule Reason',
          'Cancellation Reason',
          'Notes',
        ];

  const rows = (orders || []).map((order) => [
    order.requestNumber,
    order.customerName,
    order.phone,
    order.whatsappPhone || order.phone,
    order.city,
    order.district,
    getOrderDisplayStatus(order, lang),
    order.priority,
    order.deliveryType || 'none',
    formatDateTimeLabel(order.preferredDate, order.preferredTime, lang),
    formatDateTimeLabel(order.scheduledDate, order.scheduledTime, lang),
    order.serviceSummary || order.workType,
    order.customerAction,
    order.rescheduleReason,
    order.cancellationReason,
    order.notes,
  ]);

  const csv = [header, ...rows].map((line) => line.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${scopeLabel}-${fileDate}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
