import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import OrderMasterDetail from '../components/OrderMasterDetail';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  buildWhatsAppUrl,
  formatSaudiPhoneDisplay,
  normalizeSaudiPhoneNumber,
  operationsService,
} from '../services/api';
import {
  boardColumns,
  buildDisplayStatusBuckets,
  buildCallUrl,
  exportOrdersCsv,
  formatDateTimeLabel,
  getOperationalDate,
  getOrderDisplayStatus,
  orderMatchesDisplayStatus,
  getOrdersForView,
  nextStatusFor,
  todayString,
} from '../utils/internalOrders';

const acTypeOptions = [
  { value: 'split', ar: 'سبليت', en: 'Split' },
  { value: 'window', ar: 'شباك', en: 'Window' },
  { value: 'duct', ar: 'دكت', en: 'Duct' },
  { value: 'cassette', ar: 'كاسيت', en: 'Cassette' },
  { value: 'concealed', ar: 'مخفي', en: 'Concealed' },
];

const priorityOptions = [
  { value: 'normal', ar: 'عادية', en: 'Normal' },
  { value: 'high', ar: 'عالية', en: 'High' },
  { value: 'urgent', ar: 'عاجلة', en: 'Urgent' },
];

const deliveryOptions = [
  { value: 'none', ar: 'بدون توصيل', en: 'No delivery' },
  { value: 'standard', ar: 'توصيل عادي', en: 'Standard delivery' },
  { value: 'express_24h', ar: 'توصيل سريع خلال 24 ساعة', en: 'Fast delivery within 24 hours' },
];

const inlineStatusOptions = [
  { value: 'completed', ar: 'مكتمل', en: 'Completed' },
  { value: 'rescheduled', ar: 'أعيدت جدولته', en: 'Rescheduled' },
];

const zamilCoverageByRegion = [
  {
    key: 'east',
    ar: 'المنطقة الشرقية',
    en: 'Eastern region',
    cities: ['الدمام', 'الخبر', 'الظهران', 'القطيف', 'رأس تنورة', 'الجبيل', 'بقيق', 'الأحساء'],
  },
  { key: 'west', ar: 'المنطقة الغربية', en: 'Western region', cities: ['جدة', 'مكة', 'المدينة المنورة', 'الطائف', 'ينبع'] },
  { key: 'south', ar: 'المنطقة الجنوبية', en: 'Southern region', cities: ['جازان', 'أبو عريش'] },
  { key: 'central', ar: 'المنطقة الوسطى', en: 'Central region', cities: ['الرياض', 'القصيم'] },
];

const regionOptions = zamilCoverageByRegion.map((region) => ({
  key: region.key,
  ar: region.ar,
  en: region.en,
}));

const fastDeliveryCities = ['الدمام', 'جدة', 'الرياض', 'الخبر', 'الظهران', 'جازان', 'رأس تنورة'];

const createEmptyForm = (preferredDate = todayString()) => ({
  requestNumber: '',
  customerName: '',
  phone: '',
  secondaryPhone: '',
  whatsappPhone: '',
  region: 'central',
  city: 'الرياض',
  district: '',
  addressText: '',
  landmark: '',
  mapLink: '',
  sourceChannel: 'الزامل',
  serviceSummary: '',
  priority: 'normal',
  deliveryType: 'none',
  preferredDate,
  preferredTime: '',
  notes: '',
  acDetails: [{ id: `ac-${Date.now()}`, type: 'split', quantity: 1 }],
});

const createFormFromOrder = (order) => ({
  requestNumber: String(order?.requestNumber || '').trim(),
  customerName: String(order?.customerName || '').trim(),
  phone: String(order?.phone || '').trim(),
  secondaryPhone: String(order?.secondaryPhone || '').trim(),
  whatsappPhone: String(order?.whatsappPhone || order?.phone || '').trim(),
  region: getRegionByCity(order?.city)?.key || 'central',
  city: String(order?.city || 'الرياض').trim(),
  district: String(order?.district || '').trim(),
  addressText: String(order?.addressText || order?.address || '').trim(),
  landmark: String(order?.landmark || '').trim(),
  mapLink: String(order?.mapLink || '').trim(),
  sourceChannel: String(order?.sourceChannel || order?.source || 'الزامل').trim(),
  serviceSummary: String(order?.serviceSummary || order?.workType || '').trim(),
  priority: String(order?.priority || 'normal').trim(),
  deliveryType: String(order?.deliveryType || 'none').trim(),
  preferredDate: String(order?.preferredDate || order?.scheduledDate || getOperationalDate()).trim(),
  preferredTime: String(order?.preferredTime || order?.scheduledTime || '').trim(),
  notes: String(order?.notes || '').trim(),
  acDetails: (order?.acDetails || []).length
    ? order.acDetails.map((item, index) => ({
        id: String(item?.id || `ac-edit-${Date.now()}-${index}`),
        type: String(item?.type || 'split').trim(),
        quantity: Math.max(1, Number(item?.quantity) || 1),
      }))
    : [{ id: `ac-${Date.now()}`, type: 'split', quantity: 1 }],
});

const copy = {
  en: {
    eyebrow: 'Internal workspace',
    title: 'Customer service and operations requests',
    subtitle: 'Detailed intake, smooth coordination, and one daily rhythm for a heavy request flow.',
    loading: 'Loading dashboard...',
    stats: {
      pending: 'Waiting for operations',
      active: 'Active requests',
      completed: 'Archive',
      inTransit: 'In transit now',
    },
    statsHint: 'Open tasks for this group',
    detailTitle: 'Focused task page',
    detailHint: 'A filtered page for the selected workload.',
    closeDetail: 'Back to full board',
    compactList: {
      search: 'Search orders',
      searchPlaceholder: 'Search by order ID, customer, or city',
      orderId: 'Order ID',
      status: 'Status',
      customer: 'Customer',
      actions: 'Actions',
      updateStatus: 'Update status',
      updatingStatus: 'Updating...',
      drawerTitle: 'Order details',
      close: 'Close',
      results: (shown, total) => `${shown} of ${total} orders`,
      emptySearch: 'No orders match this search.',
    },
    dailyTasks: 'Daily tasks',
    customerServicePanel: 'Customer service intake',
    operationsPanel: 'Operations coordination',
    formHint: 'Capture the request in full detail so the operations manager can coordinate clearly from the first touch.',
    excelImportTitle: 'Excel intake',
    excelImportHint: 'Read all rows from the Excel file in backend/data/data.xlsx, keep the SO ID inside each request, and create the orders automatically.',
    excelImportFile: 'Source file: backend/data/data.xlsx',
    operationsDate: 'Operations date',
    saveOperationsDate: 'Update date',
    moveToNextDate: 'Export day and move forward',
    dateFlowHint: 'Customer service can advance the operating date after exporting the current day reports.',
    dateUpdated: 'Operations date updated.',
    dayClosed: 'Current day reports exported and the system moved to the next date.',
    requestNumber: 'Request number',
    customerName: 'Customer name',
    phone: 'Primary mobile',
    secondaryPhone: 'Secondary mobile',
    whatsappPhone: 'WhatsApp number',
    region: 'Region',
    city: 'City',
    district: 'District',
    addressText: 'Address details',
    landmark: 'Landmark',
    mapLink: 'Google Maps link',
    sourceChannel: 'Source',
    serviceSummary: 'Service summary',
    priority: 'Priority',
    deliveryType: 'Delivery type',
    intakeGuide: 'Customer service reference',
    fastDeliveryTitle: 'Fast delivery terms',
    fastDeliveryText:
      'Valid for delivery within 24 hours inside major cities during official working days only, with limited quantities.',
    packageOfferNote: 'Free installation does not apply to package offers.',
    coverageTitle: 'Delivery and installation coverage',
    deliveryEscalationHint: 'Any order with delivery is automatically escalated to the operations manager as top priority.',
    expressCityError: 'Fast delivery is only available in the listed major cities.',
    preferredDate: 'Preferred date',
    preferredTime: 'Preferred time',
    notes: 'Notes for operations',
    acDetails: 'AC details',
    acType: 'Type',
    quantity: 'Quantity',
    addAc: 'Add another AC type',
    remove: 'Remove',
    create: 'Create request',
    importExcel: 'Import Excel file',
    importingExcel: 'Importing...',
    update: 'Update request',
    creating: 'Creating...',
    updating: 'Updating...',
    editOrder: 'Edit request',
    cancelEdit: 'Cancel editing',
    editingPanel: 'Editing request',
    editingHint: 'Customer service can revise approved requests here after the customer calls back.',
    exportCsr: 'Export GM report',
    exportOps: 'Export team report',
    boardTitle: 'Kanban board',
    boardHint: 'Operations work is grouped by region here, with each regional box showing its own status counters and sorted request flow.',
    boardRegionHint: 'Each region box keeps its own queue, status counters, and sorted cities for direct operations follow-up.',
    resetBoardFocus: 'Show all regions',
    emptyColumn: 'No requests here yet.',
    emptyDetail: 'No tasks in this category right now.',
    preferredSlot: 'Preferred slot',
    scheduledSlot: 'Scheduled slot',
    serviceTitle: 'Service details',
    contact: 'Contact',
    call: 'Call',
    whatsapp: 'WhatsApp',
    map: 'Map',
    moveTo: 'Move to',
    quickActions: 'Customer service actions',
    requestReschedule: 'Request reschedule',
    operationsReschedule: 'Reschedule task',
    cancelOrder: 'Cancel request',
    acceptTask: 'Accept and coordinate',
    rejectTask: 'Reject request',
    reschedulePrompt: 'Write the reschedule reason for operations',
    cancelPrompt: 'Write the cancellation reason',
    coordination: 'Coordination',
    coordinationNote: 'Coordination note',
    saveSchedule: 'Save schedule',
    scheduling: 'Scheduling...',
    setSchedule: 'Coordinate slot',
    customerAction: 'Customer service action',
    noAction: 'No special action',
    roleBadges: {
      customer_service: 'Customer service',
      operations_manager: 'Operations manager',
    },
    nextStatus: {
      scheduled: 'Mark scheduled',
      in_transit: 'Mark in transit',
      completed: 'Mark completed',
    },
    columnLabels: {
      pending: 'New requests',
      scheduled: 'Scheduled',
      in_transit: 'In transit',
      completed: 'Completed',
    },
    regionTaskCount: 'Requests in this region',
    successCreate: 'Request created successfully.',
    successImport: (imported, skipped) =>
      `Imported ${imported} request${imported === 1 ? '' : 's'} from Excel${skipped ? ` and skipped ${skipped} duplicate or invalid row${skipped === 1 ? '' : 's'}` : ''}.`,
    successStatus: 'Request updated successfully.',
    successSchedule: 'Schedule saved successfully.',
    successReport: 'Report exported successfully.',
    successInlineCompleted: 'Order marked as completed.',
    successInlineRescheduled: 'Order rescheduled successfully.',
    confirmInlineStatus: (orderRef, nextStatus) => `Change ${orderRef} to ${nextStatus}?`,
    labels: {
      pending: 'Pending',
      scheduled: 'Scheduled',
      in_transit: 'In transit',
      completed: 'Completed',
      canceled: 'Canceled',
    },
  },
  ar: {
    eyebrow: 'مساحة العمل الداخلية',
    title: 'طلبات خدمة العملاء ومدير العمليات',
    subtitle: 'إدخال مفصل، تنسيق أوضح، ومسار يومي منظم للتعامل مع ضغط الطلبات الكبير بثقة وسلاسة.',
    loading: 'جارٍ تحميل اللوحة...',
    stats: {
      pending: 'بانتظار العمليات',
      active: 'طلبات نشطة',
      completed: 'سجل الطلبات',
      inTransit: 'في الطريق الآن',
    },
    statsHint: 'فتح مهام هذا التصنيف',
    detailTitle: 'صفحة مهام مركزة',
    detailHint: 'عرض مخصص للمهام التابعة للمربع الذي اخترته.',
    closeDetail: 'العودة إلى اللوحة الكاملة',
    compactList: {
      search: 'بحث الطلبات',
      searchPlaceholder: 'ابحث برقم الطلب أو اسم العميل أو المدينة',
      orderId: 'رقم الطلب',
      status: 'الحالة',
      customer: 'العميل',
      actions: 'الإجراء',
      updateStatus: 'تحديث الحالة',
      updatingStatus: 'جارٍ التحديث...',
      drawerTitle: 'تفاصيل الطلب',
      close: 'إغلاق',
      results: (shown, total) => `${shown} من أصل ${total} طلب`,
      emptySearch: 'لا توجد طلبات مطابقة لهذا البحث.',
    },
    dailyTasks: 'المهام اليومية',
    customerServicePanel: 'إدخال خدمة العملاء',
    operationsPanel: 'تنسيق مدير العمليات',
    formHint: 'اكتب الطلب كاملاً وبوضوح حتى يستطيع مدير العمليات فهم الحالة وتنسيق الموعد دون أي نقص.',
    excelImportTitle: 'استيراد Excel',
    excelImportHint: 'يتم قراءة جميع صفوف ملف Excel الموجود داخل backend/data/data.xlsx مع حفظ SO ID داخل كل طلب وإنشاء الطلبات تلقائياً.',
    excelImportFile: 'ملف المصدر: backend/data/data.xlsx',
    operationsDate: 'تاريخ التشغيل',
    saveOperationsDate: 'تحديث التاريخ',
    moveToNextDate: 'تصدير اليوم والانتقال لليوم التالي',
    dateFlowHint: 'يمكن لخدمة العملاء تغيير تاريخ التشغيل بعد تصدير تقارير اليوم الحالي.',
    dateUpdated: 'تم تحديث تاريخ التشغيل.',
    dayClosed: 'تم تصدير تقارير اليوم الحالي والانتقال إلى اليوم التالي.',
    requestNumber: 'رقم الطلب',
    customerName: 'اسم العميل',
    phone: 'الجوال الأساسي',
    secondaryPhone: 'جوال إضافي',
    whatsappPhone: 'رقم واتساب',
    region: 'المنطقة',
    city: 'المدينة',
    district: 'الحي',
    addressText: 'تفاصيل العنوان',
    landmark: 'علامة بارزة',
    mapLink: 'رابط خرائط جوجل',
    sourceChannel: 'مصدر الطلب',
    serviceSummary: 'ملخص الخدمة',
    priority: 'الأولوية',
    deliveryType: 'نوع التوصيل',
    intakeGuide: 'مرجع خدمة العملاء',
    fastDeliveryTitle: 'شروط التوصيل السريع',
    fastDeliveryText:
      'يسري العرض على التوصيل خلال 24 ساعة داخل المدن الرئيسية، وذلك خلال أيام العمل الرسمية، والكمية محدودة.',
    packageOfferNote: 'التركيب المجاني لا يشمل عروض البكجات.',
    coverageTitle: 'مدن التوصيل والتركيب',
    deliveryEscalationHint: 'أي طلب فيه توصيل يتم رفعه تلقائياً إلى مدير العمليات كأولوية قصوى.',
    expressCityError: 'التوصيل السريع متاح فقط داخل المدن الرئيسية المذكورة.',
    preferredDate: 'التاريخ المفضل',
    preferredTime: 'الوقت المفضل',
    notes: 'ملاحظات للعمليات',
    acDetails: 'تفاصيل المكيفات',
    acType: 'النوع',
    quantity: 'الكمية',
    addAc: 'إضافة نوع مكيف آخر',
    remove: 'حذف',
    create: 'إنشاء الطلب',
    importExcel: 'استيراد ملف Excel',
    importingExcel: 'جارٍ الاستيراد...',
    update: 'تحديث الطلب',
    creating: 'جارٍ الإنشاء...',
    updating: 'جارٍ التحديث...',
    editOrder: 'تعديل الطلب',
    cancelEdit: 'إلغاء التعديل',
    editingPanel: 'تعديل طلب قائم',
    editingHint: 'يمكن لخدمة العملاء تعديل الطلب المقبول هنا عندما يعود العميل للتواصل مرة أخرى.',
    exportCsr: 'تصدير تقرير للمدير العام',
    exportOps: 'تصدير تقرير تنسيق الفريق',
    boardTitle: 'لوحة Kanban',
    boardHint: 'هنا يتم تنظيم عمل مدير العمليات حسب المناطق، مع عداد حالات مستقل وفرز المدن والطلبات داخل كل مربع.',
    boardRegionHint: 'كل مربع منطقة يعرض عداد حالاته الخاص، ومدنه التابعة، وترتيب الطلبات داخله بشكل تشغيلي واضح.',
    resetBoardFocus: 'عرض كل المناطق',
    emptyColumn: 'لا توجد طلبات هنا حالياً.',
    emptyDetail: 'لا توجد مهام في هذا التصنيف حالياً.',
    preferredSlot: 'الموعد المفضل',
    scheduledSlot: 'الموعد المنسق',
    serviceTitle: 'تفاصيل الخدمة',
    contact: 'التواصل',
    call: 'اتصال',
    whatsapp: 'واتساب',
    map: 'الموقع',
    moveTo: 'نقل إلى',
    quickActions: 'إجراءات خدمة العملاء',
    requestReschedule: 'طلب إعادة جدولة',
    operationsReschedule: 'إعادة جدولة المهمة',
    cancelOrder: 'إلغاء الطلب',
    acceptTask: 'قبول المهمة وتنسيقها',
    rejectTask: 'رفض الطلب',
    reschedulePrompt: 'اكتب سبب إعادة الجدولة ليطلع عليه مدير العمليات',
    cancelPrompt: 'اكتب سبب الإلغاء',
    coordination: 'تنسيق الموعد',
    coordinationNote: 'ملاحظة التنسيق',
    saveSchedule: 'حفظ الموعد',
    scheduling: 'جارٍ الحفظ...',
    setSchedule: 'تنسيق الموعد',
    customerAction: 'إجراء خدمة العملاء',
    noAction: 'لا يوجد إجراء خاص',
    roleBadges: {
      customer_service: 'خدمة العملاء',
      operations_manager: 'مدير العمليات',
    },
    nextStatus: {
      scheduled: 'تعيين: تمت الجدولة',
      in_transit: 'تعيين: في الطريق',
      completed: 'تعيين: مكتمل',
    },
    columnLabels: {
      pending: 'طلبات جديدة',
      scheduled: 'تمت الجدولة',
      in_transit: 'في الطريق',
      completed: 'مكتمل',
    },
    regionTaskCount: 'طلبات هذه المنطقة',
    successCreate: 'تم إنشاء الطلب بنجاح.',
    successImport: (imported, skipped) =>
      `تم استيراد ${imported} طلب${imported === 1 ? '' : 'ات'} من ملف Excel${skipped ? ` مع تجاوز ${skipped} صف${skipped === 1 ? '' : 'وف'} مكرر أو غير صالح` : ''}.`,
    successStatus: 'تم تحديث الطلب بنجاح.',
    successSchedule: 'تم حفظ الموعد بنجاح.',
    successReport: 'تم تصدير التقرير بنجاح.',
    successInlineCompleted: 'تم تعليم الطلب كمكتمل.',
    successInlineRescheduled: 'تمت إعادة جدولة الطلب بنجاح.',
    confirmInlineStatus: (orderRef, nextStatus) => `هل تريد تغيير ${orderRef} إلى ${nextStatus}؟`,
    labels: {
      pending: 'بانتظار العمليات',
      scheduled: 'تمت الجدولة',
      in_transit: 'في الطريق',
      completed: 'مكتمل',
      canceled: 'ملغي',
    },
  },
};

const acTypeLabel = (type, lang) => {
  const match = acTypeOptions.find((item) => item.value === type);
  return match ? (lang === 'ar' ? match.ar : match.en) : type;
};

const priorityLabel = (value, lang) => {
  const match = priorityOptions.find((item) => item.value === value);
  return match ? (lang === 'ar' ? match.ar : match.en) : value;
};

const deliveryLabel = (value, lang) => {
  const match = deliveryOptions.find((item) => item.value === value);
  return match ? (lang === 'ar' ? match.ar : match.en) : value;
};

const getRegionConfig = (regionKey) => zamilCoverageByRegion.find((region) => region.key === regionKey) || null;

const getRegionByCity = (city) =>
  zamilCoverageByRegion.find((region) => region.cities.includes(String(city || '').trim())) || null;

const isFastDeliveryCity = (city) => fastDeliveryCities.includes(String(city || '').trim());

const getOrderRegionKey = (order) => getRegionByCity(order.city)?.key || 'other';

const getOrderRegionLabel = (order, lang) => {
  const region = getRegionByCity(order.city);
  return region ? (lang === 'ar' ? region.ar : region.en) : lang === 'ar' ? 'منطقة غير مصنفة' : 'Unmapped region';
};

const compareOrdersByOperationsRegion = (left, right) => {
  const leftRegionIndex = zamilCoverageByRegion.findIndex((region) => region.key === getOrderRegionKey(left));
  const rightRegionIndex = zamilCoverageByRegion.findIndex((region) => region.key === getOrderRegionKey(right));
  const regionDiff = (leftRegionIndex === -1 ? 99 : leftRegionIndex) - (rightRegionIndex === -1 ? 99 : rightRegionIndex);
  if (regionDiff !== 0) {
    return regionDiff;
  }

  const leftRegion = getRegionByCity(left.city);
  const rightRegion = getRegionByCity(right.city);
  const leftCityIndex = leftRegion ? leftRegion.cities.indexOf(left.city) : -1;
  const rightCityIndex = rightRegion ? rightRegion.cities.indexOf(right.city) : -1;
  const cityDiff = (leftCityIndex === -1 ? 99 : leftCityIndex) - (rightCityIndex === -1 ? 99 : rightCityIndex);
  if (cityDiff !== 0) {
    return cityDiff;
  }

  return `${right.updatedAt || right.createdAt || ''}`.localeCompare(`${left.updatedAt || left.createdAt || ''}`);
};

const customerActionLabel = (value, lang) =>
  (
    {
      none: { ar: 'لا يوجد إجراء خاص', en: 'No special action' },
      reschedule_requested: { ar: 'طلب إعادة جدولة', en: 'Reschedule requested' },
      cancel_requested: { ar: 'طلب إلغاء', en: 'Cancel requested' },
    }[value] || { ar: value, en: value }
  )[lang];

const getBoardOrders = (orders, statusKey) => {
  if (statusKey === 'completed') {
    return orders.filter((order) => ['completed', 'canceled'].includes(order.status));
  }

  return orders.filter((order) => order.status === statusKey);
};

const buildDashboardSummary = (orders = []) => ({
  totalOrders: orders.filter((order) => order.status !== 'canceled').length,
  pendingOrders: orders.filter((order) => order.status === 'pending').length,
  activeOrders: orders.filter((order) => ['scheduled', 'in_transit'].includes(order.status)).length,
  completedOrders: orders.filter((order) => order.status === 'completed').length,
  inTransitOrders: orders.filter((order) => order.status === 'in_transit').length,
  canceledOrders: orders.filter((order) => order.status === 'canceled').length,
});

export default function Dashboard() {
  const { viewKey } = useParams();
  const { user, permissions } = useAuth();
  const { lang, isRTL } = useLang();
  const t = copy[lang] || copy.en;
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [schedulingId, setSchedulingId] = useState('');
  const [editingOrderId, setEditingOrderId] = useState('');
  const [selectedBoardRegion, setSelectedBoardRegion] = useState('');
  const [selectedBoardStatus, setSelectedBoardStatus] = useState('');
  const [operationalDate, setOperationalDateState] = useState(() => getOperationalDate());
  const [form, setForm] = useState(() => createEmptyForm(getOperationalDate()));
  const [scheduleDrafts, setScheduleDrafts] = useState({});
  const [expandedScheduleId, setExpandedScheduleId] = useState('');
  const [inlineStatusDrafts, setInlineStatusDrafts] = useState({});
  const formPanelRef = useRef(null);
  const isEditingOrder = Boolean(editingOrderId);
  const effectivePriority = form.deliveryType === 'none' ? form.priority : 'urgent';
  const selectedRegion = getRegionConfig(form.region) || zamilCoverageByRegion[0];
  const cityOptions = selectedRegion?.cities || [];

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        const response = await operationsService.getDashboard();
        setDashboard(response.data || null);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || 'Unable to load dashboard');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };

    load();
    const intervalId = window.setInterval(() => load(true), 12000);
    const reloadFromEvent = () => load(true);
    window.addEventListener('operations-updated', reloadFromEvent);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('operations-updated', reloadFromEvent);
    };
  }, []);

  useEffect(() => {
    const syncOperationalDate = (event) => {
      const nextValue = event?.detail?.date || getOperationalDate();
      setOperationalDateState(nextValue);
      setForm((current) => ({
        ...current,
        preferredDate: !current.preferredDate || current.preferredDate === operationalDate ? nextValue : current.preferredDate,
      }));
    };

    window.addEventListener('operations-date-updated', syncOperationalDate);
    return () => window.removeEventListener('operations-date-updated', syncOperationalDate);
  }, [operationalDate]);

  const orders = useMemo(() => dashboard?.orders || [], [dashboard]);
  const displayStatusBuckets = useMemo(() => buildDisplayStatusBuckets(orders, lang), [orders, lang]);
  const detailOrders = useMemo(() => {
    const scopedOrders = displayStatusBuckets.some((item) => item.key === viewKey)
      ? orders.filter((order) => orderMatchesDisplayStatus(order, viewKey, lang))
      : getOrdersForView(orders, viewKey);
    return permissions.canManageStatuses ? scopedOrders.slice().sort(compareOrdersByOperationsRegion) : scopedOrders;
  }, [displayStatusBuckets, lang, orders, permissions.canManageStatuses, viewKey]);

  const regionBoard = useMemo(
    () =>
      zamilCoverageByRegion.map((region) => {
        const regionOrders = orders.filter((order) => getOrderRegionKey(order) === region.key).slice().sort(compareOrdersByOperationsRegion);
        const sections = boardColumns.reduce(
          (result, statusKey) => ({
            ...result,
            [statusKey]: getBoardOrders(regionOrders, statusKey),
          }),
          {}
        );

        return {
          ...region,
          orders: regionOrders,
          displayStatusBuckets: buildDisplayStatusBuckets(regionOrders, lang),
          counters: boardColumns.reduce(
            (result, statusKey) => ({
              ...result,
              [statusKey]: sections[statusKey]?.length || 0,
            }),
            {}
          ),
          sections,
        };
      }),
    [lang, orders]
  );
  const visibleRegionBoard = useMemo(
    () => (selectedBoardRegion ? regionBoard.filter((region) => region.key === selectedBoardRegion) : regionBoard),
    [regionBoard, selectedBoardRegion]
  );
  const visibleBoardStatuses = selectedBoardStatus ? [selectedBoardStatus] : boardColumns;

  const statCards = useMemo(
    () => displayStatusBuckets,
    [displayStatusBuckets]
  );

  const reportOrders = useMemo(() => orders.slice().sort((a, b) => `${b.updatedAt}`.localeCompare(`${a.updatedAt}`)), [orders]);

  const applyOrderUpdate = (updatedOrder) => {
    if (!updatedOrder?.id) {
      return;
    }

    setDashboard((current) => {
      if (!current) {
        return current;
      }

      const nextOrders = (current.orders || []).map((order) => (String(order.id) === String(updatedOrder.id) ? updatedOrder : order));
      return {
        ...current,
        orders: nextOrders,
        summary: buildDashboardSummary(nextOrders),
      };
    });
  };

  const updateAcRow = (id, key, value) => {
    setForm((current) => ({
      ...current,
      acDetails: current.acDetails.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  };

  const addAcRow = () => {
    setForm((current) => ({
      ...current,
      acDetails: [
        ...current.acDetails,
        { id: `ac-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: 'split', quantity: 1 },
      ],
    }));
  };

  const removeAcRow = (id) => {
    setForm((current) => ({
      ...current,
      acDetails: current.acDetails.length === 1 ? current.acDetails : current.acDetails.filter((item) => item.id !== id),
    }));
  };

  const openScheduleEditor = (order) => {
    setExpandedScheduleId((current) => (current === order.id ? '' : order.id));
    setScheduleDrafts((current) => ({
      ...current,
      [order.id]: current[order.id] || {
        scheduledDate: order.scheduledDate || order.preferredDate || todayString(),
        scheduledTime: order.scheduledTime || order.preferredTime || '',
        coordinationNote: order.coordinationNote || '',
      },
    }));
  };

  const updateScheduleDraft = (orderId, key, value) => {
    setScheduleDrafts((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] || {}),
        [key]: value,
      },
    }));
  };

  const onEditOrder = (order) => {
    setEditingOrderId(order.id);
    setForm(createFormFromOrder(order));
    setExpandedScheduleId('');
    window.setTimeout(() => {
      formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
  };

  const onCancelEditOrder = () => {
    setEditingOrderId('');
    setForm(createEmptyForm(getOperationalDate()));
  };

  const onCreateOrder = async (event) => {
    event.preventDefault();
    if (form.deliveryType === 'express_24h' && !isFastDeliveryCity(form.city)) {
      toast.error(t.expressCityError);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        priority: effectivePriority,
        phone: normalizeSaudiPhoneNumber(form.phone),
        secondaryPhone: normalizeSaudiPhoneNumber(form.secondaryPhone),
        whatsappPhone: normalizeSaudiPhoneNumber(form.whatsappPhone || form.phone),
        acDetails: form.acDetails.map((item) => ({
          type: item.type,
          quantity: Math.max(1, Number(item.quantity) || 1),
        })),
      };
      if (editingOrderId) {
        await operationsService.updateOrder(editingOrderId, payload);
        setEditingOrderId('');
        toast.success(t.successStatus);
      } else {
        await operationsService.createOrder(payload);
        toast.success(t.successCreate);
      }
      setForm(createEmptyForm(operationalDate));
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to save request');
    } finally {
      setSaving(false);
    }
  };

  const onImportExcel = async () => {
    try {
      setImportingExcel(true);
      const response = await operationsService.importOrdersFromExcel('data.xlsx');
      const importedCount = Number(response.data?.importedCount) || 0;
      const skippedCount = Number(response.data?.skippedCount) || 0;

      if (!importedCount && !skippedCount) {
        toast.error(lang === 'ar' ? 'لم يتم العثور على طلبات صالحة داخل ملف Excel.' : 'No valid Excel orders were found.');
        return;
      }

      toast.success(t.successImport(importedCount, skippedCount));
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to import Excel orders');
    } finally {
      setImportingExcel(false);
    }
  };

  const moveOrderToStatus = async (orderId, targetStatus) => {
    try {
      setUpdatingId(orderId);
      const response = await operationsService.updateOrderStatus(orderId, targetStatus);
      applyOrderUpdate(response.data?.order || null);
      toast.success(t.successStatus);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to update request');
    } finally {
      setUpdatingId('');
    }
  };

  const onInlineStatusDraftChange = (orderId, value) => {
    setInlineStatusDrafts((current) => ({
      ...current,
      [orderId]: value,
    }));
  };

  const onInlineStatusChange = async (order, nextStatus) => {
    if (!nextStatus) {
      return;
    }

    const statusLabel =
      inlineStatusOptions.find((option) => option.value === nextStatus)?.[lang === 'ar' ? 'ar' : 'en'] || nextStatus;
    const orderRef = order.requestNumber || order.id;

    onInlineStatusDraftChange(order.id, nextStatus);

    if (!window.confirm(t.confirmInlineStatus(orderRef, statusLabel))) {
      onInlineStatusDraftChange(order.id, '');
      return;
    }

    try {
      setUpdatingId(order.id);
      const response = await operationsService.quickUpdateOrderStatus(order.id, nextStatus);
      applyOrderUpdate(response.data?.order || null);
      toast.success(nextStatus === 'completed' ? t.successInlineCompleted : t.successInlineRescheduled);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to update request');
    } finally {
      setUpdatingId('');
      onInlineStatusDraftChange(order.id, '');
    }
  };

  const onAdvanceStatus = async (order) => {
    const nextStatus = nextStatusFor(order.status);
    if (!nextStatus) {
      return;
    }
    await moveOrderToStatus(order.id, nextStatus);
  };

  const onDragEnd = async (result) => {
    if (!permissions.canManageStatuses) {
      return;
    }

    const parseDroppable = (value) => {
      const [regionKey = '', statusKey = ''] = String(value || '').split(':');
      return { regionKey, statusKey };
    };
    const destination = parseDroppable(result.destination?.droppableId);
    const source = parseDroppable(result.source?.droppableId);
    const destinationStatus = destination.statusKey;
    const sourceStatus = source.statusKey;
    const orderId = result.draggableId;

    if (!destinationStatus || !boardColumns.includes(destinationStatus) || !sourceStatus || !boardColumns.includes(sourceStatus)) {
      return;
    }

    if (destination.regionKey !== source.regionKey || destinationStatus === sourceStatus) {
      return;
    }

    await moveOrderToStatus(orderId, destinationStatus);
  };

  const onSaveSchedule = async (order) => {
    const draft = scheduleDrafts[order.id];
    if (!draft?.scheduledDate || !draft?.scheduledTime) {
      toast.error(lang === 'ar' ? 'أدخل التاريخ والوقت أولاً.' : 'Choose date and time first.');
      return;
    }

    try {
      setSchedulingId(order.id);
      await operationsService.updateOrder(order.id, {
        scheduledDate: draft.scheduledDate,
        scheduledTime: draft.scheduledTime,
        coordinationNote: draft.coordinationNote,
        status: order.status === 'pending' ? 'scheduled' : order.status,
        customerAction: 'none',
      });
      setExpandedScheduleId('');
      toast.success(t.successSchedule);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to save schedule');
    } finally {
      setSchedulingId('');
    }
  };

  const onRequestReschedule = async (order) => {
    const reason = window.prompt(t.reschedulePrompt, order.rescheduleReason || '');
    if (!reason) {
      return;
    }

    try {
      setUpdatingId(order.id);
      await operationsService.updateOrder(order.id, {
        customerAction: 'reschedule_requested',
        rescheduleReason: reason,
      });
      toast.success(t.successStatus);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to request reschedule');
    } finally {
      setUpdatingId('');
    }
  };

  const onCancelOrder = async (order) => {
    const reason = window.prompt(t.cancelPrompt, order.cancellationReason || '');
    if (!reason) {
      return;
    }

    try {
      setUpdatingId(order.id);
      await operationsService.updateOrder(order.id, {
        status: 'canceled',
        cancellationReason: reason,
      });
      toast.success(t.successStatus);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to cancel request');
    } finally {
      setUpdatingId('');
    }
  };

  const onExport = (scopeLabel) => {
    exportOrdersCsv({
      orders: reportOrders,
      lang,
      scopeLabel,
    });
    toast.success(t.successReport);
  };

  const onSelectBoardRegion = (regionKey) => {
    setSelectedBoardRegion((current) => {
      if (current === regionKey) {
        setSelectedBoardStatus('');
        return '';
      }
      return regionKey;
    });
    setSelectedBoardStatus('');
  };

  const onSelectBoardStatus = (regionKey, statusKey) => {
    setSelectedBoardRegion(regionKey);
    setSelectedBoardStatus((current) => (selectedBoardRegion === regionKey && current === statusKey ? '' : statusKey));
  };

  if (loading) {
    return (
      <section className="page-shell" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="panel">
          <p className="muted">{t.loading}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell internal-dashboard" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="section-heading">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="section-subtitle">{t.subtitle}</p>
      </div>

      <div className="dashboard-toolbar-links">
        <Link className="btn-light" to="/dashboard/daily">
          {t.dailyTasks}
        </Link>
        <button
          className="btn-primary"
          type="button"
          onClick={() => onExport(permissions.canCreateOrders ? 'csr-report' : 'ops-report')}
        >
          {permissions.canCreateOrders ? t.exportCsr : t.exportOps}
        </button>
      </div>

      <div className="internal-stats-grid dashboard-stats-links">
        {statCards.map((item) => (
          <Link
            className={`dashboard-stat-link ${viewKey === item.key ? 'active' : ''}`}
            key={item.key}
            to={item.key === viewKey ? '/dashboard' : `/dashboard/${item.key}`}
          >
            <strong>{item.count}</strong>
            <span>{item.label}</span>
            <small>{t.statsHint}</small>
          </Link>
        ))}
      </div>

      {viewKey ? (
        <section className="panel dashboard-detail-panel">
          <div className="panel-header">
            <div>
              <h2>{t.detailTitle}</h2>
              <p>{t.detailHint}</p>
            </div>
            <Link className="btn-light" to="/dashboard">
              {t.closeDetail}
            </Link>
          </div>

          <div className="dashboard-detail-list">
            <OrderMasterDetail
              emptySearchText={t.compactList.emptySearch}
              emptyText={t.emptyDetail}
              getCustomerName={(order) => order.customerName || '—'}
              getOrderReference={(order) => order.requestNumber || order.id || '—'}
              getStatusLabel={(order) => getOrderDisplayStatus(order, lang)}
              isRTL={isRTL}
              labels={t.compactList}
              orders={detailOrders}
              renderRowActions={
                permissions.canManageStatuses
                  ? (order) => {
                      const isInlineUpdating = updatingId === order.id;
                      const isDisabled = isInlineUpdating || ['completed', 'canceled'].includes(order.status);

                      return (
                        <div className="order-inline-status">
                          <select
                            aria-label={t.compactList.updateStatus}
                            className="input compact-input order-inline-select"
                            disabled={isDisabled}
                            onChange={(event) => onInlineStatusChange(order, event.target.value)}
                            value={inlineStatusDrafts[order.id] || ''}
                          >
                            <option value="">{isInlineUpdating ? t.compactList.updatingStatus : t.compactList.updateStatus}</option>
                            {inlineStatusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option[lang === 'ar' ? 'ar' : 'en']}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                  : undefined
              }
              renderOrderDetails={(order) => (
                <div className="drawer-task-content">
                  <TaskCardBody
                    order={order}
                    lang={lang}
                    t={t}
                    canManageStatuses={permissions.canManageStatuses}
                    canCreateOrders={permissions.canCreateOrders}
                    nextStatus={nextStatusFor(order.status)}
                    onAdvanceStatus={onAdvanceStatus}
                    onRequestReschedule={onRequestReschedule}
                    onCancelOrder={onCancelOrder}
                    onEditOrder={onEditOrder}
                    onOpenSchedule={openScheduleEditor}
                    scheduleDraft={scheduleDrafts[order.id]}
                    updateScheduleDraft={updateScheduleDraft}
                    onSaveSchedule={onSaveSchedule}
                    expandedScheduleId={expandedScheduleId}
                    updatingId={updatingId}
                    schedulingId={schedulingId}
                  />
                </div>
              )}
              renderResultsSummary={t.compactList.results}
              searchPlaceholder={t.compactList.searchPlaceholder}
            />
          </div>
        </section>
      ) : null}

      <div className="internal-dashboard-grid">
        {permissions.canCreateOrders ? (
          <section className="panel" ref={formPanelRef}>
            <div className="panel-header">
              <div>
                <h2>{isEditingOrder ? t.editingPanel : t.customerServicePanel}</h2>
                <p>{isEditingOrder ? t.editingHint : t.formHint}</p>
              </div>
              <div className="helper-actions">
                <button className="btn-light" type="button" disabled={importingExcel || saving} onClick={onImportExcel}>
                  {importingExcel ? t.importingExcel : t.importExcel}
                </button>
                {isEditingOrder ? (
                  <button className="btn-light" type="button" onClick={onCancelEditOrder}>
                    {t.cancelEdit}
                  </button>
                ) : null}
                <span className="user-chip">{t.roleBadges[user?.role]}</span>
              </div>
            </div>

            <div className="order-reference-panel">
              <div className="reference-card">
                <span className="reference-label">{t.intakeGuide}</span>
                <h3>{t.fastDeliveryTitle}</h3>
                <p>
                  {lang === 'ar'
                    ? 'يسري العرض على التوصيل خلال 24 ساعة داخل المدن الرئيسية (الدمام – جدة – الرياض – الخبر – الظهران – جازان – رأس تنورة)، وذلك خلال أيام العمل الرسمية، والكمية محدودة.'
                    : `${t.fastDeliveryText} ${fastDeliveryCities.join(', ')}.`}
                </p>
                <small>{t.packageOfferNote}</small>
              </div>
              <div className="reference-card">
                <span className="reference-label">{t.coverageTitle}</span>
                <div className="coverage-list">
                  {zamilCoverageByRegion.map((region) => (
                    <p key={region.key}>
                      <strong>{lang === 'ar' ? region.ar : region.en}:</strong> {region.cities.join(' - ')}
                    </p>
                  ))}
                </div>
              </div>
              <div className="reference-card">
                <span className="reference-label">{t.excelImportTitle}</span>
                <h3>{t.importExcel}</h3>
                <p>{t.excelImportHint}</p>
                <small>{t.excelImportFile}</small>
              </div>
            </div>

            <form className="form-panel intake-form" onSubmit={onCreateOrder}>
              <div className="grid-two">
                <div>
                  <label>{t.requestNumber}</label>
                  <input
                    className="input"
                    value={form.requestNumber}
                    onChange={(event) => setForm((current) => ({ ...current, requestNumber: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label>{t.customerName}</label>
                  <input
                    className="input"
                    value={form.customerName}
                    onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid-three">
                <div>
                  <label>{t.phone}</label>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label>{t.secondaryPhone}</label>
                  <input
                    className="input"
                    value={form.secondaryPhone}
                    onChange={(event) => setForm((current) => ({ ...current, secondaryPhone: event.target.value }))}
                  />
                </div>
                <div>
                  <label>{t.whatsappPhone}</label>
                  <input
                    className="input"
                    value={form.whatsappPhone}
                    onChange={(event) => setForm((current) => ({ ...current, whatsappPhone: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-three">
                <div>
                  <label>{t.region}</label>
                  <select
                    className="input"
                    value={form.region}
                    onChange={(event) =>
                      setForm((current) => {
                        const nextRegion = event.target.value;
                        const nextRegionConfig = getRegionConfig(nextRegion) || zamilCoverageByRegion[0];
                        return {
                          ...current,
                          region: nextRegion,
                          city: nextRegionConfig?.cities?.[0] || '',
                        };
                      })
                    }
                    required
                  >
                    {regionOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {lang === 'ar' ? option.ar : option.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>{t.city}</label>
                  <select
                    className="input"
                    value={form.city}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        city: event.target.value,
                        region: getRegionByCity(event.target.value)?.key || current.region,
                      }))
                    }
                    required
                  >
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>{t.district}</label>
                  <input
                    className="input"
                    value={form.district}
                    onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label>{t.landmark}</label>
                  <input
                    className="input"
                    value={form.landmark}
                    onChange={(event) => setForm((current) => ({ ...current, landmark: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-two">
                <div>
                  <label>{t.addressText}</label>
                  <textarea
                    className="input textarea"
                    rows={3}
                    value={form.addressText}
                    onChange={(event) => setForm((current) => ({ ...current, addressText: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label>{t.mapLink}</label>
                  <input
                    className="input"
                    type="url"
                    value={form.mapLink}
                    onChange={(event) => setForm((current) => ({ ...current, mapLink: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid-three">
                <div>
                  <label>{t.sourceChannel}</label>
                  <input
                    className="input"
                    value={form.sourceChannel}
                    onChange={(event) => setForm((current) => ({ ...current, sourceChannel: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label>{t.priority}</label>
                  <select
                    className="input"
                    value={effectivePriority}
                    disabled={form.deliveryType !== 'none'}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {lang === 'ar' ? option.ar : option.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>{t.serviceSummary}</label>
                  <input
                    className="input"
                    value={form.serviceSummary}
                    onChange={(event) => setForm((current) => ({ ...current, serviceSummary: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid-two">
                <div>
                  <label>{t.deliveryType}</label>
                  <select
                    className="input"
                    value={form.deliveryType}
                    onChange={(event) => setForm((current) => ({ ...current, deliveryType: event.target.value }))}
                  >
                    {deliveryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {lang === 'ar' ? option.ar : option.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="delivery-help-block">
                  <label>{lang === 'ar' ? 'تنبيه التشغيل' : 'Operations alert'}</label>
                  <div className={`delivery-alert ${form.deliveryType === 'none' ? '' : 'delivery-alert-active'}`}>
                    <strong>{form.deliveryType === 'express_24h' ? deliveryLabel('express_24h', lang) : deliveryLabel(form.deliveryType, lang)}</strong>
                    <small>
                      {form.deliveryType === 'express_24h'
                        ? lang === 'ar'
                          ? 'التوصيل السريع خلال 24 ساعة داخل المدن الرئيسية فقط، وفي أيام العمل الرسمية، والكمية محدودة.'
                          : 'Fast delivery applies within 24 hours in the listed major cities, on official workdays, with limited quantities.'
                        : form.deliveryType !== 'none'
                          ? t.deliveryEscalationHint
                          : lang === 'ar'
                            ? 'بدون مسار توصيل خاص.'
                            : 'No special delivery flow.'}
                    </small>
                  </div>
                </div>
              </div>

              <div className="grid-two">
                <div>
                  <label>{t.preferredDate}</label>
                  <input
                    className="input"
                    type="date"
                    value={form.preferredDate}
                    onChange={(event) => setForm((current) => ({ ...current, preferredDate: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label>{t.preferredTime}</label>
                  <input
                    className="input"
                    type="time"
                    value={form.preferredTime}
                    onChange={(event) => setForm((current) => ({ ...current, preferredTime: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="ac-details-panel">
                <div className="panel-header compact-panel-header">
                  <div>
                    <h3>{t.acDetails}</h3>
                  </div>
                  <button className="btn-light" type="button" onClick={addAcRow}>
                    {t.addAc}
                  </button>
                </div>

                <div className="ac-details-list">
                  {form.acDetails.map((item) => (
                    <div className="ac-detail-row" key={item.id}>
                      <div>
                        <label>{t.acType}</label>
                        <select
                          className="input"
                          value={item.type}
                          onChange={(event) => updateAcRow(item.id, 'type', event.target.value)}
                        >
                          {acTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {lang === 'ar' ? option.ar : option.en}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>{t.quantity}</label>
                        <input
                          className="input"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateAcRow(item.id, 'quantity', event.target.value)}
                          required
                        />
                      </div>
                      <div className="ac-detail-remove">
                        <button className="btn-danger" type="button" onClick={() => removeAcRow(item.id)}>
                          {t.remove}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label>{t.notes}</label>
                <textarea
                  className="input textarea"
                  rows={4}
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                />
              </div>

              <div className="helper-actions">
                <button className="btn-primary" disabled={saving} type="submit">
                  {saving ? (isEditingOrder ? t.updating : t.creating) : isEditingOrder ? t.update : t.create}
                </button>
                {isEditingOrder ? (
                  <button className="btn-light" type="button" onClick={onCancelEditOrder}>
                    {t.cancelEdit}
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        ) : (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>{t.operationsPanel}</h2>
                <p>{t.boardHint}</p>
              </div>
              <span className="user-chip">{t.roleBadges[user?.role]}</span>
            </div>
          </section>
        )}
      </div>

      <section className="panel internal-board-panel">
        <div className="panel-header">
          <div>
            <h2>{t.boardTitle}</h2>
            <p>{t.boardHint}</p>
          </div>
          {selectedBoardRegion || selectedBoardStatus ? (
            <button className="btn-light" type="button" onClick={() => {
              setSelectedBoardRegion('');
              setSelectedBoardStatus('');
            }}>
              {t.resetBoardFocus}
            </button>
          ) : null}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-grid kanban-grid-four">
            {visibleRegionBoard.map((region) => (
              <OperationsRegionKanban
                key={region.key}
                region={region}
                visibleStatuses={visibleBoardStatuses}
                isActive={selectedBoardRegion === region.key}
                activeStatus={selectedBoardStatus}
                emptyText={t.emptyColumn}
                lang={lang}
                t={t}
                canManageStatuses={permissions.canManageStatuses}
                canCreateOrders={permissions.canCreateOrders}
                onAdvanceStatus={onAdvanceStatus}
                onRequestReschedule={onRequestReschedule}
                onCancelOrder={onCancelOrder}
                onEditOrder={onEditOrder}
                onOpenSchedule={openScheduleEditor}
                scheduleDrafts={scheduleDrafts}
                updateScheduleDraft={updateScheduleDraft}
                onSaveSchedule={onSaveSchedule}
                expandedScheduleId={expandedScheduleId}
                updatingId={updatingId}
                schedulingId={schedulingId}
                onSelectRegion={onSelectBoardRegion}
                onSelectStatus={onSelectBoardStatus}
              />
            ))}
          </div>
        </DragDropContext>
      </section>
    </section>
  );
}

function OperationsRegionKanban({
  region,
  visibleStatuses,
  isActive,
  activeStatus,
  emptyText,
  lang,
  t,
  canManageStatuses,
  canCreateOrders,
  onAdvanceStatus,
  onRequestReschedule,
  onCancelOrder,
  onEditOrder,
  onOpenSchedule,
  scheduleDrafts,
  updateScheduleDraft,
  onSaveSchedule,
  expandedScheduleId,
  updatingId,
  schedulingId,
  onSelectRegion,
  onSelectStatus,
}) {
  const ignoreBoardFocusClick = (event) =>
    event.target.closest('a, button, input, textarea, select, label') || event.target.closest('.kanban-card');

  return (
    <div
      className={`kanban-column region-kanban-column ${isActive ? 'active' : ''}`}
      onClick={(event) => {
        if (ignoreBoardFocusClick(event) || event.target.closest('.region-kanban-section')) {
          return;
        }
        onSelectRegion(region.key);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectRegion(region.key);
        }
      }}
    >
      <div className="kanban-column-head">
        <div>
          <h3>{lang === 'ar' ? region.ar : region.en}</h3>
          <p className="muted">{region.cities.join(' - ')}</p>
        </div>
        <span>{region.orders.length}</span>
      </div>

      <div className="region-kanban-counter-row">
        {region.displayStatusBuckets.map((statusItem) => (
          <div className="region-status-counter" key={`${region.key}-${statusItem.key}`}>
            <small>{statusItem.label}</small>
            <strong>{statusItem.count || 0}</strong>
          </div>
        ))}
      </div>

      <p className="muted region-kanban-hint">{t.boardRegionHint}</p>

      <div className="region-kanban-sections">
        {visibleStatuses.map((statusKey) => (
          <Droppable droppableId={`${region.key}:${statusKey}`} key={`${region.key}:${statusKey}`}>
            {(provided, snapshot) => (
              <div
                className={`region-kanban-section ${snapshot.isDraggingOver ? 'drag-over' : ''} ${
                  activeStatus === statusKey ? 'active' : ''
                }`}
                ref={provided.innerRef}
                {...provided.droppableProps}
                onClick={(event) => {
                  event.stopPropagation();
                  if (ignoreBoardFocusClick(event)) {
                    return;
                  }
                  onSelectStatus(region.key, statusKey);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    onSelectStatus(region.key, statusKey);
                  }
                }}
              >
                <div className="region-kanban-section-head">
                  <h4>{t.columnLabels[statusKey]}</h4>
                  <span>{region.counters[statusKey] || 0}</span>
                </div>
                <div className="kanban-card-list">
                  {(region.sections[statusKey] || []).length ? (
                    region.sections[statusKey].map((order, index) => (
                      <Draggable
                        key={order.id}
                        draggableId={order.id}
                        index={index}
                        isDragDisabled={!canManageStatuses || ['completed', 'canceled'].includes(order.status) || updatingId === order.id}
                      >
                        {(dragProvided) => (
                          <article
                            className={`kanban-card ${order.status || ''}`}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <TaskCardBody
                              order={order}
                              lang={lang}
                              t={t}
                              canManageStatuses={canManageStatuses}
                              canCreateOrders={canCreateOrders}
                              nextStatus={nextStatusFor(order.status)}
                              onAdvanceStatus={onAdvanceStatus}
                              onRequestReschedule={onRequestReschedule}
                              onCancelOrder={onCancelOrder}
                              onEditOrder={onEditOrder}
                              onOpenSchedule={onOpenSchedule}
                              scheduleDraft={scheduleDrafts[order.id]}
                              updateScheduleDraft={updateScheduleDraft}
                              onSaveSchedule={onSaveSchedule}
                              expandedScheduleId={expandedScheduleId}
                              updatingId={updatingId}
                              schedulingId={schedulingId}
                            />
                          </article>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="muted">{emptyText}</p>
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </div>
  );
}

function TaskCardBody({
  order,
  lang,
  t,
  canManageStatuses,
  canCreateOrders,
  nextStatus,
  onAdvanceStatus,
  onRequestReschedule,
  onCancelOrder,
  onEditOrder,
  onOpenSchedule,
  scheduleDraft,
  updateScheduleDraft,
  onSaveSchedule,
  expandedScheduleId,
  updatingId,
  schedulingId,
}) {
  const scheduleOpen = expandedScheduleId === order.id;
  const displayStatus = getOrderDisplayStatus(order, lang);
  const showCustomerActions = canCreateOrders && !['completed', 'canceled'].includes(order.status);
  const showSchedule = canManageStatuses && !['completed', 'canceled'].includes(order.status);
  const displayPhones = [order.phone, order.secondaryPhone].filter(Boolean);
  const showAcceptAction = canManageStatuses && order.status === 'pending';
  const showRejectAction = canManageStatuses && !['completed', 'canceled'].includes(order.status);

  return (
    <>
      <div className="kanban-card-head">
        <div className="task-card-topline">
          <strong>{order.requestNumber || order.id}</strong>
          <span>{order.customerName}</span>
        </div>
        <span className={`status-badge ${order.status || ''}`}>{displayStatus}</span>
      </div>

      <div className="task-rich-meta">
        <p>{`${getOrderRegionLabel(order, lang)}${order.city ? ` - ${order.city}` : ''}${order.district ? ` - ${order.district}` : ''}`}</p>
        <p>{order.addressText || order.address || '—'}</p>
        <p>{order.landmark || '—'}</p>
      </div>

      <div className="task-timing-grid">
        <div className="task-mini-panel">
          <span>{t.preferredSlot}</span>
          <strong>{formatDateTimeLabel(order.preferredDate, order.preferredTime, lang)}</strong>
        </div>
        <div className="task-mini-panel">
          <span>{t.scheduledSlot}</span>
          <strong>{formatDateTimeLabel(order.scheduledDate, order.scheduledTime, lang)}</strong>
        </div>
      </div>

      <div className="task-mini-panel">
        <span>{t.serviceTitle}</span>
        <strong>{order.serviceSummary || order.workType || '—'}</strong>
        <small>{priorityLabel(order.priority, lang)}</small>
      </div>

      {order.deliveryType && order.deliveryType !== 'none' ? (
        <div className="task-mini-panel attention-panel">
          <span>{t.deliveryType}</span>
          <strong>{deliveryLabel(order.deliveryType, lang)}</strong>
          <small>{lang === 'ar' ? 'تم رفع الطلب كأولوية قصوى لمدير العمليات.' : 'Escalated to operations as top priority.'}</small>
        </div>
      ) : null}

      <div className="kanban-ac-list">
        {(order.acDetails || []).map((item, index) => (
          <span className="internal-area-pill" key={`${order.id}-ac-${index}`}>
            {acTypeLabel(item.type, lang)} x {item.quantity}
          </span>
        ))}
      </div>

      <div className="task-contact-actions">
        {displayPhones.map((phoneValue, index) => (
          <a className="btn-light" href={buildCallUrl(phoneValue)} key={`${order.id}-call-${index}`}>
            {t.call}: {formatSaudiPhoneDisplay(phoneValue)}
          </a>
        ))}
        <a
          className="btn-light"
          href={buildWhatsAppUrl(order.whatsappPhone || order.phone, `${t.requestNumber}: ${order.requestNumber}`)}
          target="_blank"
          rel="noreferrer"
        >
          {t.whatsapp}
        </a>
        {order.mapLink ? (
          <a className="btn-light" href={order.mapLink} target="_blank" rel="noreferrer">
            {t.map}
          </a>
        ) : null}
      </div>

      {order.coordinationNote ? (
        <div className="task-mini-panel">
          <span>{t.coordination}</span>
          <strong>{order.coordinationNote}</strong>
        </div>
      ) : null}

      {order.customerAction && order.customerAction !== 'none' ? (
        <div className="task-mini-panel attention-panel">
          <span>{t.customerAction}</span>
          <strong>{customerActionLabel(order.customerAction, lang)}</strong>
          {order.rescheduleReason ? <small>{order.rescheduleReason}</small> : null}
          {order.cancellationReason ? <small>{order.cancellationReason}</small> : null}
        </div>
      ) : null}

      {order.notes ? <p className="muted">{order.notes}</p> : null}

      <div className="helper-actions task-action-row">
        {canManageStatuses && nextStatus && order.status !== 'pending' ? (
          <button
            className="btn-primary"
            type="button"
            disabled={updatingId === order.id}
            onClick={() => onAdvanceStatus(order)}
          >
            {updatingId === order.id ? '...' : t.nextStatus[nextStatus]}
          </button>
        ) : null}

        {showSchedule ? (
          <button className="btn-light" type="button" onClick={() => onOpenSchedule(order)}>
            {showAcceptAction ? t.acceptTask : t.operationsReschedule}
          </button>
        ) : null}

        {showRejectAction ? (
          <button className="btn-danger" type="button" disabled={updatingId === order.id} onClick={() => onCancelOrder(order)}>
            {showAcceptAction ? t.rejectTask : t.cancelOrder}
          </button>
        ) : null}

        {showCustomerActions ? (
          <>
            <button className="btn-secondary" type="button" disabled={updatingId === order.id} onClick={() => onEditOrder(order)}>
              {t.editOrder}
            </button>
            <button className="btn-light" type="button" disabled={updatingId === order.id} onClick={() => onRequestReschedule(order)}>
              {t.requestReschedule}
            </button>
            <button className="btn-danger" type="button" disabled={updatingId === order.id} onClick={() => onCancelOrder(order)}>
              {t.cancelOrder}
            </button>
          </>
        ) : null}
      </div>

      {scheduleOpen && canManageStatuses ? (
        <div className="schedule-editor">
          <div className="grid-two">
            <div>
              <label>{t.preferredDate}</label>
              <input
                className="input"
                type="date"
                value={scheduleDraft?.scheduledDate || ''}
                onChange={(event) => updateScheduleDraft(order.id, 'scheduledDate', event.target.value)}
              />
            </div>
            <div>
              <label>{t.preferredTime}</label>
              <input
                className="input"
                type="time"
                value={scheduleDraft?.scheduledTime || ''}
                onChange={(event) => updateScheduleDraft(order.id, 'scheduledTime', event.target.value)}
              />
            </div>
          </div>
          <div>
            <label>{t.coordinationNote}</label>
            <textarea
              className="input textarea"
              rows={3}
              value={scheduleDraft?.coordinationNote || ''}
              onChange={(event) => updateScheduleDraft(order.id, 'coordinationNote', event.target.value)}
            />
          </div>
          <button className="btn-primary" type="button" disabled={schedulingId === order.id} onClick={() => onSaveSchedule(order)}>
            {schedulingId === order.id ? t.scheduling : t.saveSchedule}
          </button>
        </div>
      ) : null}
    </>
  );
}
