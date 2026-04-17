import { normalizeSaudiPhoneNumber } from '../services/api';

const OPERATIONAL_DATE_STORAGE_KEY = 'tarkeeb-pro-operational-date';
const reportStatusSequence = ['pending', 'scheduled', 'in_transit', 'completed', 'canceled'];

const acTypeLabels = {
  split: { ar: 'سبليت', en: 'Split' },
  window: { ar: 'شباك', en: 'Window' },
  duct: { ar: 'دكت', en: 'Duct' },
  cassette: { ar: 'كاسيت', en: 'Cassette' },
  concealed: { ar: 'مخفي', en: 'Concealed' },
};

const priorityLabels = {
  normal: { ar: 'عادية', en: 'Normal' },
  high: { ar: 'عالية', en: 'High' },
  urgent: { ar: 'عاجلة', en: 'Urgent' },
};

const deliveryTypeLabels = {
  none: { ar: 'بدون توصيل', en: 'No delivery' },
  standard: { ar: 'توصيل عادي', en: 'Standard delivery' },
  express_24h: { ar: 'توصيل سريع خلال 24 ساعة', en: 'Fast delivery within 24 hours' },
};

const customerActionLabels = {
  none: { ar: 'لا يوجد', en: 'None' },
  reschedule_requested: { ar: 'طلب إعادة جدولة', en: 'Reschedule requested' },
  cancel_requested: { ar: 'طلب إلغاء', en: 'Cancellation requested' },
};

const deliveryTaskStatuses = new Set([
  'ready to pickup',
  'pick up requested',
  'shipped',
  'delivered',
  'return request',
]);

export const statusLabels = {
  pending: { ar: 'طلب جديد', en: 'New request' },
  scheduled: { ar: 'تمت الجدولة', en: 'Scheduled' },
  in_transit: { ar: 'في الطريق', en: 'In transit' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  canceled: { ar: 'ملغي', en: 'Canceled' },
};

export const boardColumns = ['pending', 'scheduled', 'in_transit'];

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

const normalizeDateOnly = (value) => String(value || '').trim().slice(0, 10);

const extractExcelStatusFromNotes = (notes) => {
  const text = String(notes || '');
  const match = text.match(/(?:^|\n)Excel status:\s*(.+?)(?:\n|$)/i);
  return String(match?.[1] || '').trim();
};

const extractOrderImportReference = (order = {}, label) => {
  const directValue = String(order?.[label] || order?.[`${label}Id`] || order?.importMeta?.[label] || '').trim();
  if (directValue) {
    return directValue;
  }

  const text = String(order?.notes || '').trim();
  const escapedLabel = String(label || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`(?:^|\\n)${escapedLabel}\\s*:\\s*(.+?)(?:\\n|$)`, 'i'));
  return String(match?.[1] || '').trim();
};

export const getOrderStructuredField = (order = {}, label = '') =>
  String(order?.[label] || order?.[`${label}Id`] || extractOrderImportReference(order, label) || '').trim();

export const getOrderExternalStatus = (order = {}) =>
  String(order?.externalStatus || order?.excelStatus || order?.importMeta?.excelStatus || extractExcelStatusFromNotes(order?.notes)).trim();

export const getOrderSoId = (order = {}) =>
  String(order?.soId || extractOrderImportReference(order, 'soId') || extractOrderImportReference(order, 'SO ID') || order?.requestNumber || '')
    .trim();

export const getOrderWoId = (order = {}) =>
  String(order?.woId || extractOrderImportReference(order, 'woId') || extractOrderImportReference(order, 'WO ID') || '').trim();

export const getOrderEmail = (order = {}) => String(order?.email || extractOrderImportReference(order, 'Email') || '').trim();
export const getOrderDeliveryDate = (order = {}) =>
  normalizeDateOnly(order?.deliveryDate || extractOrderImportReference(order, 'Delivery date') || '');
export const getOrderPickupDate = (order = {}) =>
  normalizeDateOnly(order?.pickupDate || extractOrderImportReference(order, 'Pickup date') || '');
export const getOrderInstallationDate = (order = {}) =>
  normalizeDateOnly(order?.installationDate || extractOrderImportReference(order, 'Installation date') || '');
export const getOrderWithinSLA = (order = {}) =>
  String(order?.withinSLA || extractOrderImportReference(order, 'Completed within SLA') || '').trim();
export const getOrderExceedSLA = (order = {}) =>
  String(order?.exceedSLA || extractOrderImportReference(order, 'Completed Exceed SLA') || '').trim();
export const getOrderCourier = (order = {}) => String(order?.courier || extractOrderImportReference(order, 'Courier') || '').trim();
export const getOrderCourierNum = (order = {}) =>
  String(order?.courierNum || extractOrderImportReference(order, 'Courier number') || '').trim();
export const getOrderChatLog = (order = {}) =>
  String(order?.chatLog || extractOrderImportReference(order, 'Chat Log') || extractOrderImportReference(order, 'Chat message') || '').trim();
export const getOrderTechId = (order = {}) => String(order?.techId || extractOrderImportReference(order, 'Tech ID') || '').trim();
export const getOrderAreaCode = (order = {}) =>
  String(order?.areaCode || extractOrderImportReference(order, 'Area Code') || '').trim();
export const getOrderTechCode = (order = {}) =>
  String(order?.techCode || extractOrderImportReference(order, 'Tech Code') || '').trim();
export const getOrderAreaName = (order = {}) =>
  String(order?.areaName || extractOrderImportReference(order, 'Area Name') || '').trim();
export const getOrderTechShortName = (order = {}) =>
  String(order?.techShortName || extractOrderImportReference(order, 'Tech Short Name') || '').trim();

export const isDeliveryOnlyTaskOrder = (order = {}) => {
  const installationDate = getOrderInstallationDate(order);
  const deliveryDate = getOrderDeliveryDate(order);
  const pickupDate = getOrderPickupDate(order);
  const externalStatus = getOrderExternalStatus(order).toLowerCase();
  return !installationDate && Boolean(deliveryDate || pickupDate || deliveryTaskStatuses.has(externalStatus));
};

export const isDeliveryTaskOrder = (order = {}) =>
  deliveryTaskStatuses.has(getOrderExternalStatus(order).toLowerCase()) || isDeliveryOnlyTaskOrder(order);

export const getOrderTaskDate = (order = {}) => {
  const scheduledDate = normalizeDateOnly(order?.scheduledDate);
  if (scheduledDate) {
    return scheduledDate;
  }

  const preferredDate = normalizeDateOnly(order?.preferredDate);
  const deliveryDate = getOrderDeliveryDate(order);
  const installationDate = getOrderInstallationDate(order);
  const pickupDate = getOrderPickupDate(order);
  const createdDate = normalizeDateOnly(order?.createdAt);
  return deliveryDate || installationDate || preferredDate || pickupDate || createdDate || '';
};

export const orderMatchesDailyTaskDate = (order = {}, targetDate = '') => {
  const normalizedTargetDate = normalizeDateOnly(targetDate);
  if (!normalizedTargetDate) {
    return false;
  }

  const deliveryDate = getOrderDeliveryDate(order);
  const installationDate = getOrderInstallationDate(order);
  return deliveryDate === normalizedTargetDate || installationDate === normalizedTargetDate;
};

export const getOrderPrimaryReference = (order = {}) => getOrderSoId(order) || String(order?.requestNumber || order?.id || '').trim();

export const getOrderReferenceText = (order = {}, lang = 'ar') => {
  const soId = getOrderSoId(order);
  const woId = getOrderWoId(order);
  const soLabel = lang === 'ar' ? 'SO ID' : 'SO ID';
  const woLabel = lang === 'ar' ? 'WO ID' : 'WO ID';

  const parts = [
    soId ? `${soLabel}: ${soId}` : '',
    woId ? `${woLabel}: ${woId}` : '',
  ].filter(Boolean);

  return parts.join(' • ') || String(order?.requestNumber || order?.id || '—').trim() || '—';
};

export const orderMatchesSearchQuery = (order = {}, query = '') => {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    order?.id,
    order?.requestNumber,
    getOrderSoId(order),
    getOrderWoId(order),
    order?.customerName,
    order?.phone,
    normalizeSaudiPhoneNumber(order?.phone),
    order?.secondaryPhone,
    normalizeSaudiPhoneNumber(order?.secondaryPhone),
    order?.whatsappPhone,
    normalizeSaudiPhoneNumber(order?.whatsappPhone),
    order?.status,
    order?.externalStatus,
    getOrderEmail(order),
    getOrderCourier(order),
    getOrderCourierNum(order),
    getOrderTechId(order),
    getOrderAreaCode(order),
    getOrderTechCode(order),
    getOrderAreaName(order),
    getOrderTechShortName(order),
    getOrderChatLog(order),
    order?.city,
    order?.district,
    order?.region,
    order?.internalAreaLabel,
    order?.internalAreaArLabel,
    order?.address,
    order?.addressText,
    order?.technicianName,
    order?.workType,
    order?.serviceSummary,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedQuery);
};

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

const getDisplayStatusSortRank = (statusKey = '') => {
  const normalized = String(statusKey || '').trim().toLowerCase();
  const directIndex = reportStatusSequence.indexOf(normalized);
  if (directIndex !== -1) {
    return directIndex;
  }
  if (normalized === 'unknown') {
    return reportStatusSequence.length + 1;
  }
  return reportStatusSequence.length;
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

  return Array.from(bucketMap.values()).sort(
    (left, right) =>
      getDisplayStatusSortRank(left.key) - getDisplayStatusSortRank(right.key) ||
      left.label.localeCompare(right.label, 'ar')
  );
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

export const getAcTypeLabel = (type, lang = 'ar') => {
  const normalized = String(type || '').trim().toLowerCase();
  return acTypeLabels[normalized]?.[lang] || normalized || (lang === 'ar' ? 'غير محدد' : 'Unknown');
};

export const getOrderDeviceLines = (order = {}, lang = 'ar') =>
  (Array.isArray(order?.acDetails) ? order.acDetails : [])
    .flatMap((item) => {
      const quantity = Math.max(1, Number(item?.quantity) || 1);
      const label = getAcTypeLabel(item?.type, lang);
      return Array.from({ length: quantity }, (_, index) => `${label} ${quantity > 1 ? index + 1 : ''}`.trim());
    })
    .filter(Boolean);

export const getOrderSearchMetaLines = (order = {}, lang = 'ar') => {
  const phone = normalizeSaudiPhoneNumber(order?.phone);
  const soId = getOrderSoId(order);
  const woId = getOrderWoId(order);
  const deviceCount = getOrderDeviceCount(order);
  const email = getOrderEmail(order);
  const techId = getOrderTechId(order);
  const courier = getOrderCourier(order);
  const lines = [];

  if (phone) {
    lines.push(`${lang === 'ar' ? 'الجوال' : 'Phone'}: ${phone}`);
  }

  if (email) {
    lines.push(`${lang === 'ar' ? 'البريد' : 'Email'}: ${email}`);
  }

  const refs = [];
  if (soId) {
    refs.push(`SO ID: ${soId}`);
  }
  if (woId) {
    refs.push(`WO ID: ${woId}`);
  }
  refs.push(`${lang === 'ar' ? 'الأجهزة' : 'Devices'}: ${deviceCount}`);
  lines.push(refs.join(' • '));

  const logistics = [techId ? `${lang === 'ar' ? 'الفني' : 'Tech'}: ${techId}` : '', courier ? `${lang === 'ar' ? 'الشحن' : 'Courier'}: ${courier}` : '']
    .filter(Boolean)
    .join(' • ');
  if (logistics) {
    lines.push(logistics);
  }

  return lines.filter(Boolean);
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
    return orders.filter((order) => order.status === 'completed');
  }

  if (viewKey === 'in_transit') {
    return orders.filter((order) => order.status === 'in_transit');
  }

  if (viewKey === 'pending') {
    return orders.filter((order) => order.status === 'pending');
  }

  return [];
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildReportTitle = (scopeLabel, lang) => {
  const normalized = String(scopeLabel || '').trim();
  if (!normalized) {
    return lang === 'ar' ? 'تقرير الطلبات' : 'Orders report';
  }

  const aliases = {
    'csr-report': { ar: 'تقرير الإدارة', en: 'Admin report' },
    'ops-report': { ar: 'تقرير مدير العمليات', en: 'Operations manager report' },
    'csr-daily': { ar: 'تقرير الإدارة اليومي', en: 'Admin daily report' },
    'ops-daily': { ar: 'تقرير مدير العمليات اليومي', en: 'Operations manager daily report' },
    'daily-tasks': { ar: 'تقرير المهام اليومية', en: 'Daily tasks report' },
    'weekly-tasks': { ar: 'تقرير المهام الأسبوعية', en: 'Weekly tasks report' },
    'monthly-tasks': { ar: 'تقرير المهام الشهرية', en: 'Monthly tasks report' },
  };

  return aliases[normalized]?.[lang] || normalized.replace(/[-_]+/g, ' ');
};

const getPriorityLabel = (value, lang = 'ar') => priorityLabels[String(value || '').trim().toLowerCase()]?.[lang] || value || '—';
const getDeliveryTypeLabel = (value, lang = 'ar') =>
  deliveryTypeLabels[String(value || 'none').trim().toLowerCase()]?.[lang] || value || '—';
const getCustomerActionLabel = (value, lang = 'ar') =>
  customerActionLabels[String(value || 'none').trim().toLowerCase()]?.[lang] || value || '—';

const compareOrdersForReport = (left, right, lang = 'ar') => {
  const leftStatusKey = getOrderDisplayStatusKey(left, lang);
  const rightStatusKey = getOrderDisplayStatusKey(right, lang);
  const statusDiff = getDisplayStatusSortRank(leftStatusKey) - getDisplayStatusSortRank(rightStatusKey);
  if (statusDiff !== 0) {
    return statusDiff;
  }

  const cityDiff = `${left?.city || ''}`.localeCompare(`${right?.city || ''}`, 'ar');
  if (cityDiff !== 0) {
    return cityDiff;
  }

  const districtDiff = `${left?.district || ''}`.localeCompare(`${right?.district || ''}`, 'ar');
  if (districtDiff !== 0) {
    return districtDiff;
  }

  const scheduledDiff = `${getOrderTaskDate(left)}`.localeCompare(`${getOrderTaskDate(right)}`);
  if (scheduledDiff !== 0) {
    return scheduledDiff;
  }

  const referenceDiff = `${getOrderPrimaryReference(left)}`.localeCompare(`${getOrderPrimaryReference(right)}`, 'ar');
  if (referenceDiff !== 0) {
    return referenceDiff;
  }

  return `${left?.customerName || ''}`.localeCompare(`${right?.customerName || ''}`, 'ar');
};

const buildReportPayload = (orders = [], lang = 'ar', scopeLabel, fileDate = todayString(), reportTitle) => {
  const sortedOrders = (Array.isArray(orders) ? orders : []).slice().sort((left, right) => compareOrdersForReport(left, right, lang));
  const statusBuckets = buildDisplayStatusBuckets(sortedOrders, lang).map((bucket) => ({
    ...bucket,
    orders: sortedOrders.filter((order) => getOrderDisplayStatusKey(order, lang) === bucket.key),
  }));
  const title = reportTitle || buildReportTitle(scopeLabel, lang);
  const generatedAt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const excelHeader =
    lang === 'ar'
      ? [
          'المرجع',
          'اسم العميل',
          'الجوال',
          'واتساب',
          'المنطقة',
          'المدينة',
          'الحي',
          'الحالة',
          'عدد الأجهزة',
          'تفاصيل الأجهزة',
          'الأولوية',
          'نوع التوصيل',
          'الموعد المفضل',
          'الموعد المنسق',
          'ملخص الخدمة',
          'إجراء خدمة العملاء',
          'سبب إعادة الجدولة',
          'سبب الإلغاء',
          'ملاحظات',
          'آخر تحديث',
        ]
      : [
          'Reference',
          'Customer Name',
          'Phone',
          'WhatsApp',
          'Region',
          'City',
          'District',
          'Status',
          'Device Count',
          'Device Details',
          'Priority',
          'Delivery Type',
          'Preferred Slot',
          'Scheduled Slot',
          'Service Summary',
          'CSR Action',
          'Reschedule Reason',
          'Cancellation Reason',
          'Notes',
          'Last Update',
        ];

  const excelRows = sortedOrders.map((order) => [
    getOrderReferenceText(order, lang),
    order.customerName || '—',
    order.phone || '—',
    order.whatsappPhone || order.phone || '—',
    order.region || '—',
    order.city || '—',
    order.district || '—',
    getOrderDisplayStatus(order, lang),
    getOrderDeviceCount(order),
    getOrderDeviceLines(order, lang).join(' • ') || '—',
    getPriorityLabel(order.priority, lang),
    getDeliveryTypeLabel(order.deliveryType, lang),
    formatDateTimeLabel(order.preferredDate, order.preferredTime, lang),
    formatDateTimeLabel(order.scheduledDate, order.scheduledTime, lang),
    order.serviceSummary || order.workType || '—',
    getCustomerActionLabel(order.customerAction, lang),
    order.rescheduleReason || '—',
    order.cancellationReason || '—',
    order.notes || '—',
    formatDateTimeLabel(String(order.updatedAt || '').slice(0, 10), String(order.updatedAt || '').slice(11, 16), lang),
  ]);

  return {
    title,
    generatedAt,
    fileDate,
    sortedOrders,
    statusBuckets,
    totalDevices: sortedOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0),
    excelHeader,
    excelRows,
  };
};

const makeSheetName = (value, fallback) => {
  const normalized = String(value || '').replace(/[\\/?*[\]:]/g, ' ').trim();
  return (normalized || fallback).slice(0, 31);
};

const appendWorksheet = (workbook, XLSX, name, rows, columnWidths = []) => {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  if (columnWidths.length) {
    worksheet['!cols'] = columnWidths.map((width) => ({ wch: width }));
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, makeSheetName(name, 'Sheet'));
};

const exportOrdersExcel = async (payload, scopeLabel, lang) => {
  const XLSXModule = await import('xlsx');
  const XLSX = XLSXModule.default || XLSXModule;
  const workbook = XLSX.utils.book_new();
  const summaryLabels =
    lang === 'ar'
      ? {
          title: 'عنوان التقرير',
          period: 'الفترة',
          generatedAt: 'وقت الإنشاء',
          statuses: 'الحالات',
          count: 'العدد',
          totalDevices: 'إجمالي الأجهزة',
          totalOrders: 'إجمالي الطلبات',
        }
      : {
          title: 'Report title',
          period: 'Period',
          generatedAt: 'Generated at',
          statuses: 'Status',
          count: 'Count',
          totalDevices: 'Total devices',
          totalOrders: 'Total orders',
        };
  const summaryRows = [
    [summaryLabels.title, payload.title],
    [summaryLabels.period, payload.fileDate],
    [summaryLabels.generatedAt, payload.generatedAt],
    [],
    [summaryLabels.statuses, summaryLabels.count],
    ...payload.statusBuckets.map((bucket) => [bucket.label, bucket.orders.length]),
    [],
    [summaryLabels.totalDevices, payload.totalDevices],
    [summaryLabels.totalOrders, payload.sortedOrders.length],
  ];

  appendWorksheet(workbook, XLSX, 'Summary', summaryRows, [28, 18]);
  appendWorksheet(
    workbook,
    XLSX,
    'All Orders',
    [payload.excelHeader, ...payload.excelRows],
    [22, 20, 16, 16, 14, 14, 14, 16, 12, 28, 12, 18, 20, 20, 28, 20, 24, 24, 32, 18]
  );

  payload.statusBuckets.forEach((bucket) => {
    const bucketRows = bucket.orders.map((order) => [
      getOrderReferenceText(order, lang),
      order.customerName || '—',
      order.city || '—',
      order.district || '—',
      getOrderDeviceCount(order),
      getOrderDeviceLines(order, lang).join(' • ') || '—',
      formatDateTimeLabel(order.scheduledDate, order.scheduledTime, lang),
      order.serviceSummary || order.workType || '—',
      order.notes || '—',
    ]);

    appendWorksheet(
      workbook,
      XLSX,
      bucket.label,
      [
        [
          payload.excelHeader[0],
          payload.excelHeader[1],
          payload.excelHeader[5],
          payload.excelHeader[6],
          payload.excelHeader[8],
          payload.excelHeader[9],
          payload.excelHeader[13],
          payload.excelHeader[14],
          payload.excelHeader[18],
        ],
        ...bucketRows,
      ],
      [22, 18, 14, 14, 12, 24, 18, 28, 30]
    );
  });

  XLSX.writeFile(workbook, `${scopeLabel}-${payload.fileDate}.xlsx`);
};

const buildStatusSummaryCards = (payload, lang) =>
  payload.statusBuckets
    .map(
      (bucket) => `
        <div style="padding:12px 14px;border:1px solid #e8dfd0;border-radius:16px;background:#fffaf2;">
          <div style="font-size:12px;color:#8a6d4f;margin-bottom:4px;">${escapeHtml(bucket.label)}</div>
          <div style="font-size:24px;font-weight:800;color:#2f2418;">${bucket.orders.length}</div>
        </div>
      `
    )
    .join('');

const buildPdfSections = (payload, lang) =>
  payload.statusBuckets
    .map((bucket) => {
      const rows = bucket.orders
        .map(
          (order) => `
            <tr>
              <td>${escapeHtml(getOrderReferenceText(order, lang))}</td>
              <td>${escapeHtml(order.customerName || '—')}</td>
              <td>${escapeHtml([order.region, order.city, order.district].filter(Boolean).join(' - ') || '—')}</td>
              <td>${escapeHtml(getOrderDeviceLines(order, lang).join(' • ') || '—')}</td>
              <td>${escapeHtml(
                [
                  formatDateTimeLabel(order.preferredDate, order.preferredTime, lang),
                  formatDateTimeLabel(order.scheduledDate, order.scheduledTime, lang),
                ]
                  .filter((value, index, values) => value && value !== '—' && values.indexOf(value) === index)
                  .join(' / ') || '—'
              )}</td>
              <td>${escapeHtml(order.serviceSummary || order.workType || '—')}</td>
              <td>${escapeHtml(order.notes || '—')}</td>
            </tr>
          `
        )
        .join('');

      return `
        <section style="margin-top:22px;break-inside:avoid;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h2 style="margin:0;font-size:18px;color:#2f2418;">${escapeHtml(bucket.label)}</h2>
            <span style="display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:36px;padding:0 10px;border-radius:999px;background:#f4ead8;color:#7b4a1a;font-weight:800;">${bucket.orders.length}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:11px;">
            <thead>
              <tr>
                <th> ${escapeHtml(lang === 'ar' ? 'المرجع' : 'Reference')} </th>
                <th> ${escapeHtml(lang === 'ar' ? 'العميل' : 'Customer')} </th>
                <th> ${escapeHtml(lang === 'ar' ? 'الموقع' : 'Location')} </th>
                <th> ${escapeHtml(lang === 'ar' ? 'الأجهزة' : 'Devices')} </th>
                <th> ${escapeHtml(lang === 'ar' ? 'المواعيد' : 'Slots')} </th>
                <th> ${escapeHtml(lang === 'ar' ? 'الخدمة' : 'Service')} </th>
                <th> ${escapeHtml(lang === 'ar' ? 'الملاحظات' : 'Notes')} </th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </section>
      `;
    })
    .join('');

const exportOrdersPdf = async (payload, scopeLabel, lang) => {
  const html2pdfModule = await import('html2pdf.js/dist/html2pdf.bundle.js');
  const html2pdf = html2pdfModule.default || html2pdfModule;
  const wrapper = document.createElement('div');
  wrapper.dir = lang === 'ar' ? 'rtl' : 'ltr';
  wrapper.style.cssText = 'position:fixed;left:-99999px;top:0;width:1120px;background:#fff;color:#1f2937;font-family:Arial,sans-serif;padding:28px;';
  wrapper.innerHTML = `
    <style>
      h1,h2,p{margin:0}
      table th, table td{border:1px solid #eadfcf;padding:8px 10px;vertical-align:top;text-align:${lang === 'ar' ? 'right' : 'left'};}
      table thead th{background:#f8f2e8;color:#6f4b25;font-weight:800;}
      table tbody tr:nth-child(even) td{background:#fcfaf7;}
    </style>
    <header style="display:grid;gap:10px;padding:20px;border-radius:24px;background:linear-gradient(135deg,#fff7eb,#ffffff);border:1px solid #eadfcf;">
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
        <div style="display:grid;gap:6px;">
          <div style="font-size:12px;color:#8a6d4f;">${escapeHtml(lang === 'ar' ? 'تقرير منسق' : 'Formatted report')}</div>
          <h1 style="font-size:28px;color:#2f2418;">${escapeHtml(payload.title)}</h1>
        </div>
        <div style="display:grid;gap:6px;text-align:${lang === 'ar' ? 'left' : 'right'};">
          <div style="font-size:12px;color:#8a6d4f;">${escapeHtml(lang === 'ar' ? 'الفترة' : 'Period')}</div>
          <strong>${escapeHtml(payload.fileDate)}</strong>
          <div style="font-size:12px;color:#8a6d4f;">${escapeHtml(payload.generatedAt)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;">
        <div style="padding:12px 14px;border:1px solid #e8dfd0;border-radius:16px;background:#fff;">
          <div style="font-size:12px;color:#8a6d4f;margin-bottom:4px;">${escapeHtml(lang === 'ar' ? 'إجمالي الطلبات' : 'Total orders')}</div>
          <div style="font-size:24px;font-weight:800;color:#2f2418;">${payload.sortedOrders.length}</div>
        </div>
        <div style="padding:12px 14px;border:1px solid #e8dfd0;border-radius:16px;background:#fff;">
          <div style="font-size:12px;color:#8a6d4f;margin-bottom:4px;">${escapeHtml(lang === 'ar' ? 'إجمالي الأجهزة' : 'Total devices')}</div>
          <div style="font-size:24px;font-weight:800;color:#2f2418;">${payload.totalDevices}</div>
        </div>
        <div style="padding:12px 14px;border:1px solid #e8dfd0;border-radius:16px;background:#fff;">
          <div style="font-size:12px;color:#8a6d4f;margin-bottom:4px;">${escapeHtml(lang === 'ar' ? 'عدد الحالات' : 'Status groups')}</div>
          <div style="font-size:24px;font-weight:800;color:#2f2418;">${payload.statusBuckets.length}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;">
        ${buildStatusSummaryCards(payload, lang)}
      </div>
    </header>
    ${buildPdfSections(payload, lang)}
  `;

  document.body.appendChild(wrapper);
  try {
    await html2pdf()
      .set({
        filename: `${scopeLabel}-${payload.fileDate}.pdf`,
        margin: 8,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(wrapper)
      .save();
  } finally {
    wrapper.remove();
  }
};

export const exportOrdersReport = async ({ orders, lang = 'ar', scopeLabel = 'orders-report', fileDate = todayString(), format = 'excel', reportTitle }) => {
  const payload = buildReportPayload(orders, lang, scopeLabel, fileDate, reportTitle);
  if (format === 'pdf') {
    await exportOrdersPdf(payload, scopeLabel, lang);
    return;
  }
  await exportOrdersExcel(payload, scopeLabel, lang);
};

export const exportOrdersCsv = async (options) => exportOrdersReport({ ...options, format: 'excel' });
