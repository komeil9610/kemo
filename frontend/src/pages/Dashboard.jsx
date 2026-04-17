import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import OrderDeviceBreakdown from '../components/OrderDeviceBreakdown';
import OrderMasterDetail from '../components/OrderMasterDetail';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  buildWhatsAppUrl,
  canUploadExcelSource,
  formatSaudiPhoneDisplay,
  operationsService,
} from '../services/api';
import {
  buildDisplayStatusBuckets,
  buildCallUrl,
  formatDateTimeLabel,
  getOperationalDate,
  getOrderAreaName,
  getOrderDeviceCount,
  getOrderDisplayStatus,
  getOrderEmail,
  getOrderExceedSLA,
  getOrderChatLog,
  getOrderCourier,
  getOrderCourierNum,
  getOrderInstallationDate,
  getOrderPrimaryReference,
  getOrderReferenceText,
  getOrderSearchMetaLines,
  getOrderPickupDate,
  getOrderTechId,
  getOrderTechShortName,
  getOrderTaskDate,
  getOrderWithinSLA,
  orderMatchesDisplayStatus,
  orderMatchesDailyTaskDate,
  getOrdersForView,
  nextStatusFor,
  todayString,
} from '../utils/internalOrders';
import { canUserPrintEndOfDayReports } from '../utils/workspaceAccess';
import { getWorkspaceBasePath } from '../utils/workspaceRoles';

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

const installationStatusOptions = [
  'Completed',
  'Partially Completed',
  'Scheduled',
  'Schedule Confirmed',
  'Assigned',
  'Ready To Pickup',
  'Pick Up Requested',
  'Shipped',
  'Delivered',
  'Rescheduled',
  'Waiting Customer Confirmation',
  'Return Request',
  'Canceled',
];

const createEmptyForm = (preferredDate = todayString()) => ({
  soId: '',
  woId: '',
  customer: '',
  email: '',
  phone: '',
  installationDate: preferredDate,
  pickupDate: '',
  devices: '',
  bundledItems: '1',
  status: 'Scheduled',
  shippingCity: '',
  shippingAddress: '',
  withinSLA: '',
  exceedSLA: '',
  courier: '',
  courierNum: '',
  chatLog: '',
});

const copy = {
  en: {
    eyebrow: 'Internal workspace',
    title: 'Customer service and operations requests',
    subtitle: 'Detailed intake, smooth coordination, and one daily rhythm for a heavy request flow.',
    loading: 'Loading dashboard...',
    stats: {
      pending: 'New requests',
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
      searchPlaceholder: 'Search by phone, SO ID, WO ID, customer, or city',
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
    operationsHint: 'Review incoming requests, update statuses, and follow up from the filtered task lists.',
    formHint: 'Enter the request manually using the same columns as the Excel source so manual and imported rows follow one structure.',
    excelImportTitle: 'Excel intake',
    excelImportHint: 'Upload an Excel file, sync rows by SO ID, update only changed orders, and archive completed requests automatically.',
    excelImportUpsertNote: 'Existing requests are updated automatically, new requests are added, and duplicate rows inside the same file are merged intelligently.',
    excelOnlyTitle: 'Manual intake follows the Excel schema',
    excelOnlyNotice: 'Use the same Zamil-style columns here so manual requests behave like imported Excel rows.',
    excelImportFile: 'Source file: latest uploaded Excel file',
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
    uploadExcelSource: 'Upload new Excel file',
    uploadingExcelSource: 'Uploading...',
    importExcel: 'Import Excel file',
    importingExcel: 'Importing...',
    importingExcelProgress: ({ processed, total, currentChunk, totalChunks }) =>
      `Importing in batches: ${processed}/${total} rows, batch ${currentChunk}/${totalChunks}.`,
    creating: 'Creating...',
    exportCsr: 'Export GM report',
    exportOps: 'Export team report',
    exportPdf: 'PDF file',
    exportExcel: 'Excel file',
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
    contactCustomer: 'Called customer',
    assignTechnician: 'Assign technician',
    assignTechnicianPrompt: 'Assigned technician',
    contactPrompt: 'Write the call note for the customer',
    coordination: 'Coordination',
    coordinationNote: 'Coordination note',
    saveSchedule: 'Save schedule',
    scheduling: 'Scheduling...',
    setSchedule: 'Coordinate slot',
    customerAction: 'Customer service action',
    noAction: 'No special action',
    roleBadges: {
      admin: 'Admin',
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
    deviceCount: 'Devices',
    devicesTitle: 'Devices in this request',
    successExcelUpload: (valid, invalid, deduplicated) =>
      `Excel file parsed successfully. ${valid} valid row${valid === 1 ? '' : 's'} ready${invalid ? `, ${invalid} row${invalid === 1 ? '' : 's'} need review` : ''}${deduplicated ? `, ${deduplicated} duplicate row${deduplicated === 1 ? '' : 's'} merged automatically` : ''}.`,
    successCreate: 'Request created successfully.',
    successImport: ({ imported, created, updated, archived, restored, unchanged, skipped }) =>
      `Excel sync complete. Processed ${imported} row${imported === 1 ? '' : 's'}: created ${created}, updated ${updated}, archived ${archived}, restored ${restored}${unchanged ? `, unchanged ${unchanged}` : ''}${skipped ? `, skipped ${skipped}` : ''}.`,
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
      pending: 'طلبات جديدة',
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
      searchPlaceholder: 'ابحث بالجوال أو SO ID أو WO ID أو اسم العميل أو المدينة',
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
    operationsHint: 'راجع الطلبات الواردة وحدّث حالاتها وتابع حسابات المناطق من قوائم المهام المفلترة.',
    formHint: 'أدخل الطلب يدويًا بنفس أعمدة ملف الإكسل حتى يتعامل النظام معه بنفس منطق الصفوف المستوردة.',
    excelImportTitle: 'استيراد الإكسل',
    excelImportHint: 'ارفع ملف الإكسل ليتم ربط الصفوف حسب SO ID، وتحديث الطلبات المتغيرة فقط، وأرشفة الطلبات المكتملة تلقائيًا.',
    excelImportUpsertNote: 'الطلبات الموجودة يتم تحديثها تلقائيًا، والطلبات الجديدة تُضاف، والصفوف المكررة داخل نفس الملف يتم دمجها بذكاء.',
    excelOnlyTitle: 'الإدخال اليدوي مطابق لجدول الإكسل',
    excelOnlyNotice: 'استخدم نفس أعمدة ملف الزامل هنا حتى يتعامل النظام مع الطلب اليدوي مثل صفوف الإكسل المستوردة.',
    excelImportFile: 'ملف المصدر: آخر ملف إكسل تم رفعه',
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
    uploadExcelSource: 'رفع ملف إكسل جديد',
    uploadingExcelSource: 'جارٍ الرفع...',
    importExcel: 'استيراد ملف إكسل',
    importingExcel: 'جارٍ الاستيراد...',
    importingExcelProgress: ({ processed, total, currentChunk, totalChunks }) =>
      `جارٍ الاستيراد على دفعات: ${processed}/${total} صف، الدفعة ${currentChunk}/${totalChunks}.`,
    creating: 'جارٍ الإنشاء...',
    exportCsr: 'تصدير تقرير للمدير العام',
    exportOps: 'تصدير تقرير تنسيق الفريق',
    exportPdf: 'ملف PDF',
    exportExcel: 'ملف إكسل',
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
    contactCustomer: 'تم التواصل مع العميل',
    assignTechnician: 'إسناد لفني',
    assignTechnicianPrompt: 'الفني المسند',
    contactPrompt: 'اكتب ملاحظة الاتصال مع العميل',
    coordination: 'تنسيق الموعد',
    coordinationNote: 'ملاحظة التنسيق',
    saveSchedule: 'حفظ الموعد',
    scheduling: 'جارٍ الحفظ...',
    setSchedule: 'تنسيق الموعد',
    customerAction: 'إجراء خدمة العملاء',
    noAction: 'لا يوجد إجراء خاص',
    roleBadges: {
      admin: 'الإدارة',
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
    deviceCount: 'عدد الأجهزة',
    devicesTitle: 'أجهزة هذا الطلب',
    successExcelUpload: (valid, invalid, deduplicated) =>
      `تمت قراءة ملف الإكسل بنجاح. يوجد ${valid} صف صالح للاستيراد${invalid ? ` و${invalid} صف يحتاج مراجعة` : ''}${deduplicated ? ` مع دمج ${deduplicated} صف مكرر تلقائيًا` : ''}.`,
    successCreate: 'تم إنشاء الطلب بنجاح.',
    successImport: ({ imported, created, updated, archived, restored, unchanged, skipped }) =>
      `اكتملت مزامنة الإكسل. تمت معالجة ${imported} صف، إنشاء ${created}، تحديث ${updated}، أرشفة ${archived}، استعادة ${restored}${unchanged ? `، بدون تغيير ${unchanged}` : ''}${skipped ? `، وتجاوز ${skipped}` : ''}.`,
    successStatus: 'تم تحديث الطلب بنجاح.',
    successSchedule: 'تم حفظ الموعد بنجاح.',
    successReport: 'تم تصدير التقرير بنجاح.',
    successInlineCompleted: 'تم تعليم الطلب كمكتمل.',
    successInlineRescheduled: 'تمت إعادة جدولة الطلب بنجاح.',
    confirmInlineStatus: (orderRef, nextStatus) => `هل تريد تغيير ${orderRef} إلى ${nextStatus}؟`,
    labels: {
      pending: 'طلب جديد',
      scheduled: 'تمت الجدولة',
      in_transit: 'في الطريق',
      completed: 'مكتمل',
      canceled: 'ملغي',
    },
  },
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
const formatExcelIssueLine = (issue, lang) => {
  const rowLabel = lang === 'ar' ? 'الصف' : 'Row';
  const fieldLabel = lang === 'ar' ? 'الحقل' : 'Field';
  const parts = [`${rowLabel} ${issue?.rowNumber || '—'}`];

  if (issue?.sheetName) {
    parts.push(issue.sheetName);
  }

  if (issue?.field) {
    parts.push(`${fieldLabel}: ${issue.field}`);
  }

  if (issue?.reason) {
    parts.push(issue.reason);
  }

  return parts.join(' - ');
};

const buildExcelIssuesToast = (issues = [], lang = 'ar', limit = 3) => {
  const visible = (Array.isArray(issues) ? issues : []).slice(0, limit).map((issue) => formatExcelIssueLine(issue, lang));
  if (!visible.length) {
    return '';
  }

  const remaining = Math.max(0, (issues?.length || 0) - visible.length);
  if (!remaining) {
    return visible.join('\n');
  }

  return `${visible.join('\n')}\n${lang === 'ar' ? `و${remaining} صفوف أخرى بها مشاكل` : `and ${remaining} more rows with issues`}`;
};

const buildExcelImportToastPayload = (data = {}) => ({
  imported: Number(data?.importedCount) || 0,
  created: Number(data?.createdCount) || 0,
  updated: Number(data?.updatedCount) || 0,
  archived: Number(data?.archivedCount) || 0,
  restored: Number(data?.restoredCount) || 0,
  unchanged: Number(data?.unchangedCount) || 0,
  skipped: Number(data?.skippedCount) || 0,
});

const getRegionByCity = (city) =>
  zamilCoverageByRegion.find((region) => region.cities.includes(String(city || '').trim())) || null;

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

const buildDashboardSummary = (orders = []) => ({
  totalOrders: orders.filter((order) => order.status !== 'canceled').length,
  pendingOrders: orders.filter((order) => order.status === 'pending').length,
  activeOrders: orders.filter((order) => ['scheduled', 'in_transit'].includes(order.status)).length,
  completedOrders: orders.filter((order) => order.status === 'completed').length,
  inTransitOrders: orders.filter((order) => order.status === 'in_transit').length,
  canceledOrders: orders.filter((order) => order.status === 'canceled').length,
});

const shiftDateString = (value, amount) => {
  const source = value || todayString();
  const date = new Date(`${source}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
};

const compareCities = (left, right) => `${left || ''}`.localeCompare(`${right || ''}`, 'ar');

const buildCityInsights = (orders = [], todayDate, tomorrowDate) => {
  const grouped = new Map();

  orders.forEach((order) => {
    const city = String(order.city || '').trim() || 'غير محدد';
    const current = grouped.get(city) || {
      city,
      totalOrders: 0,
      activeOrders: 0,
      todayOrders: 0,
      tomorrowOrders: 0,
      totalDevices: 0,
    };

    current.totalOrders += 1;
    current.totalDevices += getOrderDeviceCount(order);
    if (!['completed', 'canceled'].includes(order.status)) {
      current.activeOrders += 1;
    }
    if (orderMatchesDailyTaskDate(order, todayDate)) {
      current.todayOrders += 1;
    }
    if (orderMatchesDailyTaskDate(order, tomorrowDate)) {
      current.tomorrowOrders += 1;
    }

    grouped.set(city, current);
  });

  return [...grouped.values()].sort((left, right) => {
    const totalDiff = right.totalOrders - left.totalOrders;
    if (totalDiff !== 0) {
      return totalDiff;
    }

    const deviceDiff = right.totalDevices - left.totalDevices;
    if (deviceDiff !== 0) {
      return deviceDiff;
    }

    return compareCities(left.city, right.city);
  });
};

export default function Dashboard() {
  const { viewKey } = useParams();
  const { user, permissions } = useAuth();
  const { lang, isRTL } = useLang();
  const t = copy[lang] || copy.en;
  const workspaceBasePath = getWorkspaceBasePath(user?.role);
  const canPrintReports = canUserPrintEndOfDayReports(user);
  const analyticsCopy =
    lang === 'ar'
      ? {
          spotlight: 'المشهد التشغيلي',
          spotlightText: 'ملخص تحليلي سريع يوضح ضغط الطلبات وعدد الأجهزة ومهام اليوم والغد وترتيب المدن قبل النزول للتفاصيل.',
          today: 'مهام اليوم',
          tomorrow: 'مهام الغد',
          cityLoad: 'ترتيب المدن',
          activeOrders: 'طلبات نشطة',
          totalDevices: 'إجمالي الأجهزة',
          dueToday: 'مرتبطة بتاريخ اليوم',
          dueTomorrow: 'مرتبطة بتاريخ الغد',
          urgent: 'عاجلة أو بها توصيل',
          archive: 'مكتمل أو ملغي',
          openTasks: 'المتبقي لليوم',
          endOfDay: 'تقرير نهاية اليوم',
          endOfDayHint: 'نقطة واحدة للوصول إلى تقرير اليوم وإغلاقه بشكل منظم.',
          printOwner: 'الطباعة متاحة لهذا الحساب',
          restricted: 'طباعة تقارير اليوم محصورة بالحساب المعتمد.',
          devices: 'الأجهزة',
          active: 'نشطة',
          noToday: 'لا توجد مهام مرتبطة بتاريخ اليوم الحالي.',
          noTomorrow: 'لا توجد مهام مرتبطة بتاريخ الغد.',
          openBoard: 'فتح لوحة المهام',
        }
      : {
          spotlight: 'Operational snapshot',
          spotlightText: 'A concise analytical view of order pressure, devices, today and tomorrow tasks, and city load.',
          today: 'Today tasks',
          tomorrow: 'Tomorrow tasks',
          cityLoad: 'City ranking',
          activeOrders: 'Active orders',
          totalDevices: 'Total devices',
          dueToday: 'Linked to today',
          dueTomorrow: 'Linked to tomorrow',
          urgent: 'Urgent or delivery',
          archive: 'Completed or canceled',
          openTasks: 'Still open today',
          endOfDay: 'End-of-day report',
          endOfDayHint: 'One clear route for day reporting and orderly closure.',
          printOwner: 'Printing is enabled for this account',
          restricted: 'Daily report printing is limited to the approved account.',
          devices: 'Devices',
          active: 'Active',
          noToday: 'No tasks are linked to the active day.',
          noTomorrow: 'No tasks are linked to tomorrow yet.',
          openBoard: 'Open tasks board',
        };
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const saving = false;
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [schedulingId, setSchedulingId] = useState('');
  const [excelSourceFileName, setExcelSourceFileName] = useState('data.xlsx');
  const [excelPreview, setExcelPreview] = useState(null);
  const [excelImportReport, setExcelImportReport] = useState(null);
  const [excelImportProgress, setExcelImportProgress] = useState(null);
  const [operationalDate, setOperationalDateState] = useState(() => getOperationalDate());
  const [form, setForm] = useState(() => createEmptyForm(getOperationalDate()));
  const [scheduleDrafts, setScheduleDrafts] = useState({});
  const [expandedScheduleId, setExpandedScheduleId] = useState('');
  const [inlineStatusDrafts, setInlineStatusDrafts] = useState({});
  const formPanelRef = useRef(null);
  const excelUploadInputRef = useRef(null);

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        const response = await operationsService.getDashboard();
        setDashboard(response.data || null);
        const importedExcelOrder = (response.data?.orders || []).find((order) => String(order?.notes || '').includes('Sheet:'));
        if (importedExcelOrder) {
          setExcelSourceFileName((current) => current || 'data.xlsx');
        }
      } catch (error) {
        if (!silent) {
          toast.error(error?.response?.data?.message || error.message || 'Unable to load dashboard');
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };

    load();
    const intervalId = window.setInterval(() => load(true), 30000);
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
        installationDate:
          !current.installationDate || current.installationDate === operationalDate ? nextValue : current.installationDate,
      }));
    };

    window.addEventListener('operations-date-updated', syncOperationalDate);
    return () => window.removeEventListener('operations-date-updated', syncOperationalDate);
  }, [operationalDate]);

  const orders = useMemo(() => dashboard?.orders || [], [dashboard]);
  const technicians = useMemo(() => dashboard?.technicians || [], [dashboard]);
  const tomorrowDate = useMemo(() => shiftDateString(operationalDate, 1), [operationalDate]);
  const todayOrders = useMemo(
    () => orders.filter((order) => orderMatchesDailyTaskDate(order, operationalDate)).slice().sort(compareOrdersByOperationsRegion),
    [operationalDate, orders]
  );
  const tomorrowOrders = useMemo(
    () => orders.filter((order) => orderMatchesDailyTaskDate(order, tomorrowDate)).slice().sort(compareOrdersByOperationsRegion),
    [orders, tomorrowDate]
  );
  const cityInsights = useMemo(() => buildCityInsights(orders, operationalDate, tomorrowDate), [operationalDate, orders, tomorrowDate]);
  const totalDevices = useMemo(() => orders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0), [orders]);
  const todayDevices = useMemo(() => todayOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0), [todayOrders]);
  const tomorrowDevices = useMemo(() => tomorrowOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0), [tomorrowOrders]);
  const urgentOrdersCount = useMemo(
    () => orders.filter((order) => order.priority === 'urgent' || order.deliveryType !== 'none').length,
    [orders]
  );
  const archiveOrdersCount = useMemo(
    () => orders.filter((order) => ['completed', 'canceled'].includes(order.status)).length,
    [orders]
  );
  const openTodayCount = useMemo(
    () => todayOrders.filter((order) => !['completed', 'canceled'].includes(order.status)).length,
    [todayOrders]
  );
  const heroCards = useMemo(
    () => [
      { key: 'active', value: orders.filter((order) => !['completed', 'canceled'].includes(order.status)).length, label: analyticsCopy.activeOrders },
      { key: 'devices', value: totalDevices, label: analyticsCopy.totalDevices },
      { key: 'today', value: todayOrders.length, label: analyticsCopy.dueToday },
      { key: 'tomorrow', value: tomorrowOrders.length, label: analyticsCopy.dueTomorrow },
      { key: 'urgent', value: urgentOrdersCount, label: analyticsCopy.urgent },
      { key: 'archive', value: archiveOrdersCount, label: analyticsCopy.archive },
    ],
    [
      analyticsCopy.activeOrders,
      analyticsCopy.archive,
      analyticsCopy.dueToday,
      analyticsCopy.dueTomorrow,
      analyticsCopy.totalDevices,
      analyticsCopy.urgent,
      archiveOrdersCount,
      orders,
      todayOrders.length,
      tomorrowOrders.length,
      totalDevices,
      urgentOrdersCount,
    ]
  );
  const displayStatusBuckets = useMemo(
    () => buildDisplayStatusBuckets(orders, lang).filter((item) => item.key !== 'pending'),
    [orders, lang]
  );
  const detailOrders = useMemo(() => {
    const scopedOrders = displayStatusBuckets.some((item) => item.key === viewKey)
      ? orders.filter((order) => orderMatchesDisplayStatus(order, viewKey, lang))
      : getOrdersForView(orders, viewKey);
    return permissions.canManageStatuses ? scopedOrders.slice().sort(compareOrdersByOperationsRegion) : scopedOrders;
  }, [displayStatusBuckets, lang, orders, permissions.canManageStatuses, viewKey]);
  const previewIssues = useMemo(() => (Array.isArray(excelPreview?.invalidRows) ? excelPreview.invalidRows : []), [excelPreview]);

  const statCards = useMemo(
    () => displayStatusBuckets,
    [displayStatusBuckets]
  );

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

  const openScheduleEditor = (order) => {
    setExpandedScheduleId((current) => (current === order.id ? '' : order.id));
    setScheduleDrafts((current) => ({
      ...current,
      [order.id]: current[order.id] || {
        scheduledDate: order.scheduledDate || getOrderTaskDate(order) || todayString(),
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

  const onCreateOrder = async (event) => {
    event.preventDefault();

    if (!form.installationDate && !form.pickupDate) {
      toast.error(lang === 'ar' ? 'أدخل تاريخ التركيب أو تاريخ الاستلام على الأقل.' : 'Enter installation date or pickup date.');
      return;
    }

    try {
      await operationsService.createOrder(form);
      setForm(createEmptyForm(operationalDate));
      toast.success(t.successCreate);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || (lang === 'ar' ? 'تعذر إنشاء الطلب' : 'Unable to create request'));
    }
  };

  const onUploadExcelSource = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploadingExcel(true);
      const response = await operationsService.uploadExcelSource(file);
      const savedFileName = response.data?.savedFileName || response.data?.fileName || file.name || 'data.xlsx';
      const nextPreview = response.data?.preview || null;
      setExcelSourceFileName(savedFileName);
      setExcelPreview(nextPreview);
      setExcelImportReport(null);
      setExcelImportProgress(null);
      toast.success(
        t.successExcelUpload(
          Number(nextPreview?.summary?.validOrders) || 0,
          Number(nextPreview?.summary?.invalidRows) || 0,
          Number(nextPreview?.summary?.deduplicatedRows) || 0
        )
      );
      if (Array.isArray(nextPreview?.invalidRows) && nextPreview.invalidRows.length) {
        toast.error(buildExcelIssuesToast(nextPreview.invalidRows, lang), {
          duration: 7000,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || (lang === 'ar' ? 'تعذر رفع ملف الإكسل.' : 'Unable to upload Excel file'));
    } finally {
      setUploadingExcel(false);
      event.target.value = '';
    }
  };

  const onImportExcel = async () => {
    try {
      setImportingExcel(true);
      setExcelImportProgress(null);
      const response = await operationsService.importOrdersFromExcel(excelSourceFileName, excelPreview, {
        chunkSize: 30,
        interChunkDelayMs: 120,
        maxRetries: 2,
        onProgress: (progress) => setExcelImportProgress(progress),
      });
      const importedCount = Number(response.data?.importedCount) || 0;
      const skippedCount = Number(response.data?.skippedCount) || 0;

      if (!importedCount && !skippedCount) {
        toast.error(
          previewIssues.length
            ? buildExcelIssuesToast(previewIssues, lang)
            : lang === 'ar'
              ? 'لم يتم العثور على طلبات صالحة داخل ملف الإكسل.'
              : 'No valid Excel orders were found.'
        );
        return;
      }

      setExcelImportReport(response.data || null);
      toast.success(t.successImport(buildExcelImportToastPayload(response.data || {})));
      setExcelPreview(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || (lang === 'ar' ? 'تعذر استيراد طلبات الإكسل.' : 'Unable to import Excel orders'));
    } finally {
      setImportingExcel(false);
      setExcelImportProgress(null);
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
    const orderRef = getOrderPrimaryReference(order) || order.id;

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

  const onAssignTechnician = async (order, technicianId) => {
    try {
      setUpdatingId(order.id);
      const response = await operationsService.updateOrder(order.id, {
        technicianId: technicianId || null,
      });
      applyOrderUpdate(response.data?.order || null);
      toast.success(t.successStatus);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to assign technician');
    } finally {
      setUpdatingId('');
    }
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

      <div className="dashboard-hero-grid">
        <section className="panel analytics-hero-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow analytics-mini-kicker">{analyticsCopy.spotlight}</p>
              <h2>{analyticsCopy.spotlight}</h2>
              <p>{analyticsCopy.spotlightText}</p>
            </div>
            <div className="analytics-toolbar">
              <Link className="btn-light" to={`${workspaceBasePath}/daily`}>
                {analyticsCopy.openBoard}
              </Link>
              {canPrintReports ? (
                <Link className="btn-primary" to={`${workspaceBasePath}/operations-date`}>
                  {analyticsCopy.endOfDay}
                </Link>
              ) : (
                <span className="user-chip">{analyticsCopy.restricted}</span>
              )}
            </div>
          </div>

          <div className="analytics-kpi-grid">
            {heroCards.map((item) => (
              <article className="analytics-kpi-card" key={item.key}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="panel analytics-side-panel">
          <div className="panel-header">
            <div>
              <h2>{analyticsCopy.cityLoad}</h2>
              <p>{analyticsCopy.endOfDayHint}</p>
            </div>
            <span className="user-chip">{canPrintReports ? analyticsCopy.printOwner : analyticsCopy.restricted}</span>
          </div>

          <div className="analytics-city-table">
            {cityInsights.slice(0, 6).map((city) => (
              <div className="analytics-city-row" key={city.city}>
                <div>
                  <strong>{city.city}</strong>
                  <small>
                    {analyticsCopy.active}: {city.activeOrders} • {analyticsCopy.devices}: {city.totalDevices}
                  </small>
                </div>
                <div className="analytics-city-numbers">
                  <span>{city.totalOrders}</span>
                  <small>
                    {city.todayOrders}/{city.tomorrowOrders}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-insight-grid">
        <section className="panel analytics-orders-panel">
          <div className="panel-header">
            <div>
              <h2>{analyticsCopy.today}</h2>
              <p>
                {analyticsCopy.openTasks}: {openTodayCount} • {analyticsCopy.devices}: {todayDevices}
              </p>
            </div>
          </div>

          <div className="analytics-order-list">
            {todayOrders.length ? (
              todayOrders.slice(0, 6).map((order) => (
                <article className="analytics-order-item" key={`today-${order.id}`}>
                  <div>
                    <strong>{getOrderReferenceText(order, lang)}</strong>
                    <p>{`${order.customerName || '—'} • ${order.city || '—'}`}</p>
                  </div>
                  <div className="analytics-order-meta">
                    <span>{getOrderDeviceCount(order)} {analyticsCopy.devices}</span>
                    <small>{getOrderDisplayStatus(order, lang)}</small>
                  </div>
                </article>
              ))
            ) : (
              <p className="muted">{analyticsCopy.noToday}</p>
            )}
          </div>
        </section>

        <section className="panel analytics-orders-panel">
          <div className="panel-header">
            <div>
              <h2>{analyticsCopy.tomorrow}</h2>
              <p>
                {analyticsCopy.dueTomorrow}: {tomorrowOrders.length} • {analyticsCopy.devices}: {tomorrowDevices}
              </p>
            </div>
          </div>

          <div className="analytics-order-list">
            {tomorrowOrders.length ? (
              tomorrowOrders.slice(0, 6).map((order) => (
                <article className="analytics-order-item" key={`tomorrow-${order.id}`}>
                  <div>
                    <strong>{getOrderReferenceText(order, lang)}</strong>
                    <p>{`${order.customerName || '—'} • ${order.city || '—'}`}</p>
                  </div>
                  <div className="analytics-order-meta">
                    <span>{getOrderDeviceCount(order)} {analyticsCopy.devices}</span>
                    <small>{getOrderDisplayStatus(order, lang)}</small>
                  </div>
                </article>
              ))
            ) : (
              <p className="muted">{analyticsCopy.noTomorrow}</p>
            )}
          </div>
        </section>
      </div>

      <div className="dashboard-toolbar-links">
        <Link className="btn-light" to={`${workspaceBasePath}/daily`}>
          {t.dailyTasks}
        </Link>
        <Link className="btn-light" to={`${workspaceBasePath}/weekly`}>
          {lang === 'ar' ? 'المهام الأسبوعية' : 'Weekly tasks'}
        </Link>
        <Link className="btn-light" to={`${workspaceBasePath}/monthly`}>
          {lang === 'ar' ? 'المهام الشهرية' : 'Monthly tasks'}
        </Link>
        {canPrintReports ? (
          <Link className="btn-primary" to={`${workspaceBasePath}/operations-date`}>
            {analyticsCopy.endOfDay}
          </Link>
        ) : null}
      </div>

      <div className="internal-stats-grid dashboard-stats-links">
        {statCards.map((item) => (
          <Link
            className={`dashboard-stat-link ${viewKey === item.key ? 'active' : ''}`}
            key={item.key}
            to={item.key === viewKey ? workspaceBasePath : `${workspaceBasePath}/${item.key}`}
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
            <Link className="btn-light" to={workspaceBasePath}>
              {t.closeDetail}
            </Link>
          </div>

          <div className="dashboard-detail-list">
            <OrderMasterDetail
              emptySearchText={t.compactList.emptySearch}
              emptyText={t.emptyDetail}
              getCustomerName={(order) => order.customerName || '—'}
              getOrderReference={(order) => getOrderReferenceText(order, lang)}
              getStatusLabel={(order) => getOrderDisplayStatus(order, lang)}
              isRTL={isRTL}
              labels={t.compactList}
              orders={detailOrders}
              renderCustomerCell={(order) => (
                <div className="order-compact-cell-stack">
                  <strong>{order.customerName || '—'}</strong>
                  <div className="order-compact-meta">
                    {getOrderSearchMetaLines(order, lang).map((line) => (
                      <span key={`${order.id}-${line}`}>{line}</span>
                    ))}
                  </div>
                </div>
              )}
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
                    onAssignTechnician={onAssignTechnician}
                    technicians={technicians}
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
                <h2>{t.customerServicePanel}</h2>
                <p>{t.formHint}</p>
              </div>
              <div className="helper-actions">
                <input
                  accept=".xlsx,.xls"
                  hidden
                  onChange={onUploadExcelSource}
                  ref={excelUploadInputRef}
                  type="file"
                />
                {canUploadExcelSource ? (
                  <button
                    className="btn-light"
                    type="button"
                    disabled={uploadingExcel || importingExcel || saving}
                    onClick={() => excelUploadInputRef.current?.click()}
                  >
                    {uploadingExcel ? t.uploadingExcelSource : t.uploadExcelSource}
                  </button>
                ) : null}
                <button
                  className="btn-light"
                  type="button"
                  disabled={uploadingExcel || importingExcel || saving || !(Number(excelPreview?.summary?.validOrders) || 0)}
                  onClick={onImportExcel}
                >
                  {importingExcel ? t.importingExcel : t.importExcel}
                </button>
                <span className="user-chip">{t.roleBadges[user?.role]}</span>
              </div>
            </div>
            {importingExcel && excelImportProgress ? (
              <p className="muted">
                {t.importingExcelProgress({
                  processed: Number(excelImportProgress.processedRows) || 0,
                  total: Number(excelImportProgress.totalRows) || 0,
                  currentChunk: Number(excelImportProgress.currentChunk) || 0,
                  totalChunks: Number(excelImportProgress.totalChunks) || 0,
                })}
              </p>
            ) : null}

            <div className="order-reference-panel">
              <div className="reference-card">
                <span className="reference-label">{lang === 'ar' ? 'مرجع الإدخال' : 'Intake guide'}</span>
                <h3>{t.excelOnlyTitle}</h3>
                <p>{t.excelOnlyNotice}</p>
                <small>
                  {lang === 'ar'
                    ? 'الحقول الأساسية هنا هي نفسها: SO ID وWO ID واسم العميل والبريد والجوال والتواريخ والأجهزة والحالة والشحن والمندوب وسجل المحادثة.'
                    : 'The form mirrors the Excel columns: SO ID, WO ID, Customer, Email, Phone, Dates, Devices, Status, Shipping, Courier, and Chat Log.'}
                </small>
              </div>
              <div className="reference-card">
                <span className="reference-label">{lang === 'ar' ? 'قواعد الأجهزة' : 'Device rules'}</span>
                <h3>{lang === 'ar' ? 'تنسيق حقل Devices' : 'Devices field format'}</h3>
                <div className="coverage-list">
                  <p>{lang === 'ar' ? 'كل سطر يمثل جهازًا واحدًا.' : 'Each line represents one device.'}</p>
                  <p>{lang === 'ar' ? 'إذا كان السطر مثل 3 X Device Name فسيُحسب 3 أجهزة.' : 'A line like 3 X Device Name counts as 3 devices.'}</p>
                  <p>{lang === 'ar' ? 'يتم حذف * من البداية و ( With Installation ) من النهاية تلقائيًا.' : 'The parser strips leading * and trailing ( With Installation ) automatically.'}</p>
                </div>
              </div>
              <div className="reference-card">
                <span className="reference-label">{lang === 'ar' ? 'الحالة وسجل المحادثة' : 'Status and Chat Log'}</span>
                <h3>{lang === 'ar' ? 'مطابقة نفس منطق ملف الإكسل' : 'Same rules as the Excel import'}</h3>
                <div className="coverage-list">
                  <p>
                    {lang === 'ar'
                      ? 'يعتمد النظام على Delivery date أولًا كتاريخ المهمة، وإذا وُجد Installation date يُصنَّف الطلب كطلب تركيب.'
                      : 'The system uses Delivery date first as the task date. If Installation date exists, the request is classified as an installation task.'}
                  </p>
                  <p>
                    {lang === 'ar'
                      ? 'آخر كود فني صالح داخل سجل المحادثة هو الذي يُعتمد.'
                      : 'The last valid technician code found in Chat Log wins.'}
                  </p>
                  <p>
                    {lang === 'ar'
                      ? 'يمكنك استخدام حالات مثل Scheduled وAssigned وShipped وCompleted وCanceled وغيرها كما تظهر في ملف الإكسل.'
                      : 'Use statuses like Scheduled, Assigned, Shipped, Completed, Canceled, and the other Excel statuses as-is.'}
                  </p>
                </div>
              </div>
              <div className="reference-card">
                <span className="reference-label">{t.excelImportTitle}</span>
                <h3>{t.importExcel}</h3>
                <p>{t.excelImportHint}</p>
                <div className="coverage-list">
                  <small>
                    {excelPreview?.summary
                      ? `${excelSourceFileName} • ${Number(excelPreview.summary.validOrders) || 0} ${
                          lang === 'ar' ? 'صف صالح' : 'valid rows'
                        } • ${Number(excelPreview.summary.invalidRows) || 0} ${lang === 'ar' ? 'أخطاء' : 'issues'}${
                          Number(excelPreview.summary.deduplicatedRows)
                            ? ` • ${Number(excelPreview.summary.deduplicatedRows)} ${lang === 'ar' ? 'مكرر تم دمجه' : 'duplicates merged'}`
                            : ''
                        }${
                          Number(excelPreview.summary.completedOrders)
                            ? ` • ${Number(excelPreview.summary.completedOrders)} ${lang === 'ar' ? 'مكتمل' : 'completed'}`
                            : ''
                        }`
                      : excelSourceFileName}
                  </small>
                  <small>{t.excelImportUpsertNote}</small>
                </div>
                {excelImportReport ? (
                  <div className="coverage-list">
                    <p>
                      <strong>{lang === 'ar' ? 'آخر مزامنة:' : 'Last sync:'}</strong>{' '}
                      {t.successImport(buildExcelImportToastPayload(excelImportReport))}
                    </p>
                    {(excelImportReport.skippedOrders || []).slice(0, 3).map((issue, index) => (
                      <p key={`skip-${index}`}>{formatExcelIssueLine(issue, lang)}</p>
                    ))}
                  </div>
                ) : null}
                {excelPreview?.invalidRows?.length ? (
                  <div className="coverage-list">
                    {(excelPreview.invalidRows || []).slice(0, 4).map((issue, index) => (
                      <p key={`excel-issue-${index}`}>{formatExcelIssueLine(issue, lang)}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <form className="form-panel intake-form" onSubmit={onCreateOrder}>
              <div className="grid-two">
                <div>
                  <label>SO ID</label>
                  <input
                    className="input"
                    value={form.soId}
                    onChange={(event) => setForm((current) => ({ ...current, soId: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label>WO ID</label>
                  <input
                    className="input"
                    value={form.woId}
                    onChange={(event) => setForm((current) => ({ ...current, woId: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-three">
                <div>
                  <label>Customer</label>
                  <input
                    className="input"
                    value={form.customer}
                    onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </div>
                <div>
                  <label>Phone</label>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid-two">
                <div>
                  <label>{lang === 'ar' ? 'تاريخ التركيب' : 'Installation date'}</label>
                  <input
                    className="input"
                    type="date"
                    value={form.installationDate}
                    onChange={(event) => setForm((current) => ({ ...current, installationDate: event.target.value }))}
                  />
                </div>
                <div>
                  <label>{lang === 'ar' ? 'تاريخ الاستلام' : 'Pickup date'}</label>
                  <input
                    className="input"
                    type="date"
                    value={form.pickupDate}
                    onChange={(event) => setForm((current) => ({ ...current, pickupDate: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label>Devices</label>
                <textarea
                  className="input textarea"
                  rows={5}
                  value={form.devices}
                  onChange={(event) => setForm((current) => ({ ...current, devices: event.target.value }))}
                  placeholder={`* 2 X Cooline Split AC\n* Cooline Windows AC 17200 BTU Cold`}
                  required
                />
              </div>

              <div className="grid-three">
                <div>
                  <label>Bundled Items</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.bundledItems}
                    onChange={(event) => setForm((current) => ({ ...current, bundledItems: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label>Status</label>
                  <select
                    className="input"
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                    required
                  >
                    {installationStatusOptions.map((statusValue) => (
                      <option key={statusValue} value={statusValue}>
                        {statusValue}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Shipping City</label>
                  <input
                    className="input"
                    value={form.shippingCity}
                    onChange={(event) => setForm((current) => ({ ...current, shippingCity: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Shipping Address</label>
                <textarea
                  className="input textarea"
                  rows={3}
                  value={form.shippingAddress}
                  onChange={(event) => setForm((current) => ({ ...current, shippingAddress: event.target.value }))}
                  required
                />
              </div>

              <div className="grid-two">
                <div>
                  <label>Courier</label>
                  <input
                    className="input"
                    value={form.courier}
                    onChange={(event) => setForm((current) => ({ ...current, courier: event.target.value }))}
                  />
                </div>
                <div>
                  <label>Courier number</label>
                  <input
                    className="input"
                    value={form.courierNum}
                    onChange={(event) => setForm((current) => ({ ...current, courierNum: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-two">
                <label className="user-chip" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={form.withinSLA === 'Yes'}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        withinSLA: event.target.checked ? 'Yes' : '',
                        exceedSLA: event.target.checked ? '' : current.exceedSLA,
                      }))
                    }
                  />
                  <span>{lang === 'ar' ? 'مكتمل ضمن المدة' : 'Completed within SLA'}</span>
                </label>
                <label className="user-chip" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={form.exceedSLA === 'Yes'}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        exceedSLA: event.target.checked ? 'Yes' : '',
                        withinSLA: event.target.checked ? '' : current.withinSLA,
                      }))
                    }
                  />
                  <span>{lang === 'ar' ? 'مكتمل متجاوز للمدة' : 'Completed Exceed SLA'}</span>
                </label>
              </div>

              <div>
                <label>Chat Log</label>
                <textarea
                  className="input textarea"
                  rows={4}
                  value={form.chatLog}
                  onChange={(event) => setForm((current) => ({ ...current, chatLog: event.target.value }))}
                  placeholder={`* JED-W - by: trkeebpro comp.\n* customer requested Friday - by: trkeebpro comp.`}
                />
              </div>

              <div className="coverage-list">
                <p>
                  {lang === 'ar'
                    ? 'سيُستخرج كود الفني من سجل المحادثة تلقائيًا، وسيُستخدم آخر كود مطابق داخل الخلية.'
                    : 'The technician code is extracted from Chat Log automatically, and the last valid code wins.'}
                </p>
                <p>
                  {lang === 'ar'
                    ? 'تاريخ المهمة الفعلي يعتمد على Delivery date أولًا، ثم يُستخدم Installation date لتصنيف الطلب كتركيب عند وجوده.'
                    : 'The effective task date uses Delivery date first, while Installation date is used to classify the request as an installation when present.'}
                </p>
              </div>

              <div className="helper-actions">
                <button className="btn-primary" type="submit">
                  {t.create}
                </button>
                </div>
            </form>
          </section>
        ) : (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>{t.operationsPanel}</h2>
                <p>{t.operationsHint}</p>
              </div>
              <span className="user-chip">{t.roleBadges[user?.role]}</span>
            </div>
          </section>
        )}
      </div>

    </section>
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
  onAssignTechnician,
  technicians = [],
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
  const orderEmail = getOrderEmail(order);
  const pickupDate = getOrderPickupDate(order);
  const installationDate = getOrderInstallationDate(order);
  const courier = getOrderCourier(order);
  const courierNum = getOrderCourierNum(order);
  const withinSLA = getOrderWithinSLA(order);
  const exceedSLA = getOrderExceedSLA(order);
  const techId = getOrderTechId(order);
  const techShortName = getOrderTechShortName(order);
  const areaName = getOrderAreaName(order);
  const chatLog = getOrderChatLog(order);
  const taskDate = getOrderTaskDate(order);

  return (
    <>
      <div className="kanban-card-head">
        <div className="task-card-topline">
          <strong>{getOrderReferenceText(order, lang)}</strong>
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
          <span>{lang === 'ar' ? 'بيانات الإكسل' : 'Excel fields'}</span>
          <strong>{getOrderReferenceText(order, lang)}</strong>
          <small>{orderEmail || '—'}</small>
        </div>
        <div className="task-mini-panel">
          <span>{lang === 'ar' ? 'تواريخ المصدر' : 'Source dates'}</span>
          <strong>{taskDate || installationDate || pickupDate || '—'}</strong>
          <small>
            {pickupDate
              ? `${lang === 'ar' ? 'الاستلام' : 'Pickup'}: ${pickupDate}`
              : lang === 'ar'
                ? 'لا يوجد تاريخ استلام'
                : 'No pickup date'}
          </small>
        </div>
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

      <div className="task-mini-panel">
        <span>{t.deviceCount}</span>
        <strong>{getOrderDeviceCount(order)}</strong>
      </div>

      {(techId || techShortName || areaName) ? (
        <div className="task-mini-panel">
          <span>{lang === 'ar' ? 'إسناد الفني' : 'Technician assignment'}</span>
          <strong>{techId || '—'}</strong>
          <small>{[techShortName, areaName].filter(Boolean).join(' • ') || '—'}</small>
        </div>
      ) : null}

      {(courier || courierNum) ? (
        <div className="task-mini-panel">
          <span>{lang === 'ar' ? 'بيانات الشحن' : 'Courier details'}</span>
          <strong>{courier || '—'}</strong>
          <small>{courierNum || '—'}</small>
        </div>
      ) : null}

      {(withinSLA || exceedSLA) ? (
        <div className="task-mini-panel">
          <span>{lang === 'ar' ? 'مدة التنفيذ' : 'SLA'}</span>
          <strong>{withinSLA || exceedSLA || '—'}</strong>
          <small>
            {withinSLA
              ? lang === 'ar'
                ? 'مكتمل ضمن المدة'
                : 'Completed within SLA'
              : lang === 'ar'
                ? 'مكتمل متجاوز للمدة'
                : 'Completed exceed SLA'}
          </small>
        </div>
      ) : null}

      {order.deliveryType && order.deliveryType !== 'none' ? (
        <div className="task-mini-panel attention-panel">
          <span>{t.deliveryType}</span>
          <strong>{deliveryLabel(order.deliveryType, lang)}</strong>
          <small>{lang === 'ar' ? 'تم رفع الطلب كأولوية قصوى لمدير العمليات.' : 'Escalated to operations as top priority.'}</small>
        </div>
      ) : null}

      <OrderDeviceBreakdown lang={lang} order={order} title={t.devicesTitle} />

      {chatLog ? (
        <div className="task-mini-panel">
          <span>{lang === 'ar' ? 'Chat Log' : 'Chat Log'}</span>
          <strong style={{ whiteSpace: 'pre-wrap' }}>{chatLog}</strong>
        </div>
      ) : null}

      <div className="task-contact-actions">
        {displayPhones.map((phoneValue, index) => (
          <a className="btn-light" href={buildCallUrl(phoneValue)} key={`${order.id}-call-${index}`}>
            {t.call}: {formatSaudiPhoneDisplay(phoneValue)}
          </a>
        ))}
        <a
          className="btn-light"
          href={buildWhatsAppUrl(order.whatsappPhone || order.phone, `${t.requestNumber}: ${getOrderPrimaryReference(order)}`)}
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

        {canManageStatuses && !['completed', 'canceled'].includes(order.status) ? (
          <select
            className="input compact-input order-inline-select"
            disabled={updatingId === order.id}
            value={order.technicianId || ''}
            onChange={(event) => onAssignTechnician(order, event.target.value)}
          >
            <option value="">{t.assignTechnician}</option>
            {(technicians || []).map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>
        ) : null}

        {showCustomerActions ? (
          <>
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
