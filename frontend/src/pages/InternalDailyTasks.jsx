import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, NavLink } from 'react-router-dom';
import OrderDeviceBreakdown from '../components/OrderDeviceBreakdown';
import OrderMasterDetail from '../components/OrderMasterDetail';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { buildWhatsAppUrl, formatSaudiPhoneDisplay, operationsService } from '../services/api';
import { canUserPrintTaskReports } from '../utils/workspaceAccess';
import { getWorkspaceBasePath } from '../utils/workspaceRoles';
import {
  buildCallUrl,
  buildDisplayStatusBuckets,
  exportOrdersReport,
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
  getOrderSoId,
  getOrderTaskDate,
  orderMatchesDailyTaskDate,
  getOrderTechId,
  getOrderTechShortName,
  getOrderPickupDate,
  getOrderWithinSLA,
  getOrderWoId,
  nextDateString,
  orderMatchesDisplayStatus,
} from '../utils/internalOrders';
import { getTechnicianCoverageLabel } from '../utils/technicianCoverage';

const operationsRegions = [
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

const statusOrder = ['pending', 'scheduled', 'in_transit', 'completed', 'canceled'];

const isDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '').trim());
const isMonthString = (value) => /^\d{4}-\d{2}$/.test(String(value || '').trim());

const shiftDateString = (value, amount) => {
  const source = isDateString(value) ? value : getOperationalDate();
  const date = new Date(`${source}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
};

const startOfWeekString = (value) => {
  const source = isDateString(value) ? value : getOperationalDate();
  const date = new Date(`${source}T12:00:00`);
  const diff = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0, 10);
};

const endOfMonthString = (monthValue) => {
  const month = isMonthString(monthValue) ? monthValue : getOperationalDate().slice(0, 7);
  const date = new Date(`${month}-01T12:00:00`);
  date.setMonth(date.getMonth() + 1, 0);
  return date.toISOString().slice(0, 10);
};

const getInitialScopeValue = (mode) => {
  const operationalDate = getOperationalDate();
  if (mode === 'weekly') {
    return startOfWeekString(operationalDate);
  }
  if (mode === 'monthly') {
    return operationalDate.slice(0, 7);
  }
  return operationalDate;
};

const getScopeMeta = (mode, scopeValue) => {
  if (mode === 'weekly') {
    const startDate = startOfWeekString(scopeValue);
    const endDate = shiftDateString(startDate, 6);
    return { inputType: 'date', startDate, endDate, exportLabel: `${startDate}-to-${endDate}` };
  }

  if (mode === 'monthly') {
    const monthValue = isMonthString(scopeValue) ? scopeValue : getOperationalDate().slice(0, 7);
    return { inputType: 'month', startDate: `${monthValue}-01`, endDate: endOfMonthString(monthValue), exportLabel: monthValue };
  }

  const dayValue = isDateString(scopeValue) ? scopeValue : getOperationalDate();
  const nextDayValue = nextDateString(dayValue);
  return { inputType: 'date', startDate: dayValue, endDate: nextDayValue, exportLabel: `${dayValue}-to-${nextDayValue}` };
};

const isWithinRange = (value, startDate, endDate) => {
  const normalized = String(value || '').slice(0, 10);
  return Boolean(normalized) && normalized >= startDate && normalized <= endDate;
};

const getRegionByCity = (city) =>
  operationsRegions.find((region) => region.cities.includes(String(city || '').trim())) || null;

const getOrderRegionKey = (order) => getRegionByCity(order.city)?.key || 'other';

const getOrderRegionLabel = (order, lang) => {
  const region = getRegionByCity(order.city);
  return region ? (lang === 'ar' ? region.ar : region.en) : lang === 'ar' ? 'منطقة غير مصنفة' : 'Unmapped region';
};

const compareOrdersByRegion = (left, right) => {
  const leftRegionIndex = operationsRegions.findIndex((region) => region.key === getOrderRegionKey(left));
  const rightRegionIndex = operationsRegions.findIndex((region) => region.key === getOrderRegionKey(right));
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

const compareOrdersByStatusThenRegion = (left, right) => {
  const statusDiff = statusOrder.indexOf(left.status) - statusOrder.indexOf(right.status);
  if (statusDiff !== 0) {
    return statusDiff;
  }
  return compareOrdersByRegion(left, right);
};

const compareOrdersByLatest = (left, right) => `${right.updatedAt || right.createdAt || ''}`.localeCompare(`${left.updatedAt || left.createdAt || ''}`);
const compareOrdersByCustomer = (left, right) => `${left.customerName || ''}`.localeCompare(`${right.customerName || ''}`, 'ar');
const getTechnicianCardSortLabel = (technician = {}, lang = 'ar') =>
  `${String(technician?.name || '').trim()} ${getTechnicianCoverageLabel(technician?.zone || technician?.region, lang)}`.trim();

const compareOrdersByTechnician = (left, right, technicianLookup = new Map(), lang = 'ar') => {
  const leftTechnician = technicianLookup.get(String(left?.technicianId || '').trim());
  const rightTechnician = technicianLookup.get(String(right?.technicianId || '').trim());
  const leftLabel = leftTechnician
    ? getTechnicianCardSortLabel(leftTechnician, lang)
    : lang === 'ar'
      ? 'غير معين'
      : 'Unassigned';
  const rightLabel = rightTechnician
    ? getTechnicianCardSortLabel(rightTechnician, lang)
    : lang === 'ar'
      ? 'غير معين'
      : 'Unassigned';
  const technicianDiff = leftLabel.localeCompare(rightLabel, 'ar');
  if (technicianDiff !== 0) {
    return technicianDiff;
  }
  return compareOrdersByRegion(left, right);
};

const getFilteredSummary = (orders, lang) => ({
  total: orders.length,
  buckets: buildDisplayStatusBuckets(orders, lang),
});

const copy = {
  en: {
    modes: {
      daily: {
        eyebrow: 'Today and tomorrow',
        title: 'Today and tomorrow task board',
        subtitle: 'A focused two-day view that keeps today and tomorrow tasks together for quick follow-up.',
        scopeLabel: 'Start date',
      },
      weekly: {
        eyebrow: 'Upcoming week',
        title: 'Next-week task board',
        subtitle: 'A structured weekly view that ignores today and starts planning from tomorrow onward.',
        scopeLabel: 'Week start',
      },
      monthly: {
        eyebrow: 'Upcoming month',
        title: 'Next-month task board',
        subtitle: 'A monthly workload view centered on upcoming tasks starting from tomorrow.',
        scopeLabel: 'Month',
      },
    },
    loading: 'Loading tasks...',
    dashboard: 'Back to dashboard',
    exportPdf: 'Export PDF',
    exportExcel: 'Export Excel',
    print: 'Print page',
    tabs: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    },
    regionsTitle: 'Technicians',
    regionsHint: 'Filter the period by technician, then review each technician coverage and current workload.',
    allRegions: 'All technicians',
    unassignedTechnician: 'Unassigned',
    technicianAvailability: 'Availability',
    technicianCoverage: 'Coverage',
    technicianCurrentTasks: 'Current tasks',
    technicianTaskSummary: 'Technician summary',
    technicianContact: 'Contact',
    noTechnicianTasks: 'No current tasks for this technician in the selected period.',
    sortBy: 'Sort by',
    statusFilter: 'Status',
    sortOptions: {
      region: 'Technician and city',
      status: 'Status flow',
      latest: 'Latest update',
      customer: 'Customer name',
    },
    statusOptions: {
      all: 'All statuses',
      pending: 'Pending',
      scheduled: 'Scheduled',
      in_transit: 'In transit',
      completed: 'Completed',
      canceled: 'Canceled',
    },
    summary: {
      total: 'Total tasks',
      pending: 'Pending',
      scheduled: 'Scheduled',
      inTransit: 'In transit',
      completed: 'Completed',
    },
    compactList: {
      search: 'Search orders',
      searchPlaceholder: 'Search by phone, SO ID, WO ID, customer, or city',
      orderId: 'Order ID',
      status: 'Status',
      customer: 'Customer',
      actions: 'Status',
      drawerTitle: 'Order details',
      close: 'Close',
      results: (shown, total) => `${shown} of ${total} orders`,
      emptySearch: 'No orders match this search.',
    },
    quickStatus: {
      placeholder: 'Change status',
      scheduled: 'Rescheduled',
      canceled: 'Canceled',
      completed: 'Completed',
      loading: 'Updating...',
      confirm: (label, customer) => `Change ${customer || 'this order'} to ${label}?`,
      success: {
        scheduled: 'Order marked as rescheduled.',
        canceled: 'Order marked as canceled.',
        completed: 'Order marked as completed.',
      },
    },
    empty: 'No tasks match this view yet.',
    requestNumber: 'Request number',
    preferred: 'Preferred slot',
    scheduled: 'Scheduled slot',
    call: 'Call',
    whatsapp: 'WhatsApp',
    map: 'Map',
    notes: 'Notes',
    deviceCount: 'Devices',
    devicesTitle: 'Devices in this order',
    contactCustomer: 'Called customer',
    assignTechnician: 'Assign technician',
    contactPrompt: 'Write the call note for the customer',
  },
  ar: {
    modes: {
      daily: {
        eyebrow: 'مهام اليوم والغد',
        title: 'صفحة مهام اليوم والغد',
        subtitle: 'عرض يومي يجمع مهام اليوم والغد معًا لتسهيل المتابعة السريعة.',
        scopeLabel: 'تاريخ البداية',
      },
      weekly: {
        eyebrow: 'مهام الأسبوع القادم',
        title: 'صفحة مهام أسبوعية قادمة',
        subtitle: 'عرض أسبوعي يبدأ من الغد ويتجاهل مهام اليوم الحالي عند التخطيط والمتابعة.',
        scopeLabel: 'بداية الأسبوع',
      },
      monthly: {
        eyebrow: 'مهام الشهر القادم',
        title: 'صفحة مهام شهرية قادمة',
        subtitle: 'عرض شهري يركز على المهام القادمة بدءًا من الغد مع نفس أدوات الفرز والطباعة.',
        scopeLabel: 'الشهر',
      },
    },
    loading: 'جارٍ تحميل المهام...',
    dashboard: 'العودة إلى اللوحة',
    exportPdf: 'تصدير PDF',
    exportExcel: 'تصدير إكسل',
    print: 'طباعة الصفحة',
    tabs: {
      daily: 'اليومية',
      weekly: 'الأسبوعية',
      monthly: 'الشهرية',
    },
    regionsTitle: 'الفنيون',
    regionsHint: 'قم بفرز الفترة حسب الفني، ثم راجع تغطية كل فني وحمله الحالي داخل كل مربع.',
    allRegions: 'كل الفنيين',
    unassignedTechnician: 'غير معيّن',
    technicianAvailability: 'الحالة',
    technicianCoverage: 'التغطية',
    technicianCurrentTasks: 'المهام الحالية',
    technicianTaskSummary: 'ملخص الفني',
    technicianContact: 'التواصل',
    noTechnicianTasks: 'لا توجد مهام حالية لهذا الفني داخل الفترة المحددة.',
    sortBy: 'الفرز حسب',
    statusFilter: 'الحالة',
    sortOptions: {
      region: 'الفني والمدينة',
      status: 'تسلسل الحالة',
      latest: 'آخر تحديث',
      customer: 'اسم العميل',
    },
    statusOptions: {
      all: 'كل الحالات',
      pending: 'طلب جديد',
      scheduled: 'تمت الجدولة',
      in_transit: 'في الطريق',
      completed: 'مكتمل',
      canceled: 'ملغي',
    },
    summary: {
      total: 'إجمالي المهام',
      pending: 'طلبات جديدة',
      scheduled: 'تمت الجدولة',
      inTransit: 'في الطريق',
      completed: 'مكتملة',
    },
    compactList: {
      search: 'بحث الطلبات',
      searchPlaceholder: 'ابحث بالجوال أو SO ID أو WO ID أو اسم العميل أو المدينة',
      orderId: 'رقم الطلب',
      status: 'الحالة',
      customer: 'العميل',
      actions: 'تغيير الحالة',
      drawerTitle: 'تفاصيل الطلب',
      close: 'إغلاق',
      results: (shown, total) => `${shown} من أصل ${total} طلب`,
      emptySearch: 'لا توجد طلبات مطابقة لهذا البحث.',
    },
    quickStatus: {
      placeholder: 'تغيير الحالة',
      scheduled: 'إعادة جدولة',
      canceled: 'ملغي',
      completed: 'مكتمل',
      loading: 'جارٍ التحديث...',
      confirm: (label, customer) => `تغيير حالة ${customer || 'الطلب'} إلى ${label}؟`,
      success: {
        scheduled: 'تم تحويل الطلب إلى إعادة جدولة.',
        canceled: 'تم تعليم الطلب كملغي.',
        completed: 'تم تعليم الطلب كمكتمل.',
      },
    },
    empty: 'لا توجد مهام مطابقة لهذه الفترة حالياً.',
    requestNumber: 'رقم الطلب',
    preferred: 'الموعد المفضل',
    scheduled: 'الموعد المنسق',
    call: 'اتصال',
    whatsapp: 'واتساب',
    map: 'الموقع',
    notes: 'الملاحظات',
    deviceCount: 'عدد الأجهزة',
    devicesTitle: 'أجهزة هذا الطلب',
    contactCustomer: 'تم التواصل مع العميل',
    assignTechnician: 'إسناد لفني',
    contactPrompt: 'اكتب ملاحظة الاتصال مع العميل',
  },
};

export function InternalTaskPlanner({ mode = 'daily' }) {
  const { user } = useAuth();
  const { lang, isRTL } = useLang();
  const t = copy[lang] || copy.en;
  const modeCopy = t.modes[mode] || t.modes.daily;
  const workspaceBasePath = getWorkspaceBasePath(user?.role);
  const canPrintReports = canUserPrintTaskReports(user);
  const [scopeValue, setScopeValue] = useState(() => getInitialScopeValue(mode));
  const [selectedTechnician, setSelectedTechnician] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortKey, setSortKey] = useState('region');
  const [orders, setOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingFormat, setExportingFormat] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [statusDrafts, setStatusDrafts] = useState({});
  const isTechnicianWorkspace = ['admin', 'operations_manager'].includes(user?.role);
  const resultsSectionRef = useRef(null);

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        const response = await operationsService.getDashboard();
        setOrders(response.data?.orders || []);
        setTechnicians(response.data?.technicians || []);
      } catch (error) {
        if (!silent) {
          toast.error(error?.response?.data?.message || error.message || 'Unable to load tasks');
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };

    const onSystemUpdated = () => load(true);
    const onDateUpdated = (event) => {
      const nextDate = nextDateString(event?.detail?.date || getOperationalDate());
      if (mode === 'daily') {
        setScopeValue(nextDate);
      } else if (mode === 'weekly') {
        setScopeValue(startOfWeekString(nextDate));
      } else {
        setScopeValue(nextDate.slice(0, 7));
      }
      load(true);
    };

    load();
    window.addEventListener('operations-updated', onSystemUpdated);
    window.addEventListener('operations-date-updated', onDateUpdated);

    return () => {
      window.removeEventListener('operations-updated', onSystemUpdated);
      window.removeEventListener('operations-date-updated', onDateUpdated);
    };
  }, [mode]);

  const scopeMeta = useMemo(() => getScopeMeta(mode, scopeValue), [mode, scopeValue]);
  const rangeOrders = useMemo(
    () =>
      orders.filter((order) =>
        mode === 'daily'
          ? orderMatchesDailyTaskDate(order, scopeMeta.startDate)
          : isWithinRange(getOrderTaskDate(order), scopeMeta.startDate, scopeMeta.endDate)
      ),
    [mode, orders, scopeMeta.endDate, scopeMeta.startDate]
  );

  const technicianLookup = useMemo(
    () => new Map((technicians || []).map((technician) => [String(technician.id), technician])),
    [technicians]
  );
  const regionCards = useMemo(
    () =>
      [
        ...operationsRegions.map((region) => ({
          ...region,
          orderCount: rangeOrders.filter((order) => getOrderRegionKey(order) === region.key).length,
        })),
        {
          key: 'other',
          ar: 'غير مصنف',
          en: 'Unmapped',
          orderCount: rangeOrders.filter((order) => getOrderRegionKey(order) === 'other').length,
        },
      ].filter((region) => region.orderCount > 0),
    [rangeOrders]
  );
  const technicianCards = useMemo(() => {
    const cards = (technicians || []).map((technician) => {
      const scopedOrders = rangeOrders.filter((order) => String(order.technicianId || '') === String(technician.id));
      return {
        ...technician,
        orderCount: scopedOrders.length,
        devicesCount: scopedOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0),
        activeTaskRefs: scopedOrders.slice(0, 6).map((order) => getOrderPrimaryReference(order)).filter(Boolean),
      };
    });

    return cards.sort(
      (left, right) =>
        right.orderCount - left.orderCount ||
        right.devicesCount - left.devicesCount ||
        getTechnicianCardSortLabel(left, lang).localeCompare(getTechnicianCardSortLabel(right, lang), 'ar')
    );
  }, [lang, rangeOrders, technicians]);

  const technicianScopedOrders = useMemo(() => {
    if (selectedTechnician === 'all') {
      return rangeOrders;
    }
    if (isTechnicianWorkspace && selectedTechnician === 'unassigned') {
      return rangeOrders.filter((order) => !String(order.technicianId || '').trim());
    }
    if (isTechnicianWorkspace) {
      return rangeOrders.filter((order) => String(order.technicianId || '') === String(selectedTechnician));
    }
    return rangeOrders.filter((order) => getOrderRegionKey(order) === selectedTechnician);
  }, [isTechnicianWorkspace, rangeOrders, selectedTechnician]);
  const displayStatusOptions = useMemo(() => buildDisplayStatusBuckets(technicianScopedOrders, lang), [lang, technicianScopedOrders]);

  useEffect(() => {
    if (selectedStatus !== 'all' && !displayStatusOptions.some((item) => item.key === selectedStatus)) {
      setSelectedStatus('all');
    }
  }, [displayStatusOptions, selectedStatus]);

  const filteredOrders = useMemo(() => {
    const statusScoped =
      selectedStatus === 'all' ? technicianScopedOrders : technicianScopedOrders.filter((order) => orderMatchesDisplayStatus(order, selectedStatus, lang));
    const sorted = statusScoped.slice();
    if (sortKey === 'status') {
      sorted.sort(compareOrdersByStatusThenRegion);
    } else if (sortKey === 'latest') {
      sorted.sort(compareOrdersByLatest);
    } else if (sortKey === 'customer') {
      sorted.sort(compareOrdersByCustomer);
    } else if (isTechnicianWorkspace) {
      sorted.sort((left, right) => compareOrdersByTechnician(left, right, technicianLookup, lang));
    } else {
      sorted.sort(compareOrdersByRegion);
    }
    return sorted;
  }, [isTechnicianWorkspace, lang, selectedStatus, sortKey, technicianLookup, technicianScopedOrders]);

  const summary = useMemo(() => getFilteredSummary(technicianScopedOrders, lang), [technicianScopedOrders, lang]);
  const visibleSummaryBuckets = useMemo(() => summary.buckets, [summary.buckets]);
  const selectedTechnicianRecord = useMemo(
    () => technicianCards.find((item) => String(item.id) === String(selectedTechnician)) || null,
    [selectedTechnician, technicianCards]
  );
  const selectedRegionRecord = useMemo(
    () => regionCards.find((item) => String(item.key) === String(selectedTechnician)) || null,
    [regionCards, selectedTechnician]
  );
  const sortOptions = useMemo(
    () => ({
      ...t.sortOptions,
      region: isTechnicianWorkspace
        ? t.sortOptions.region
        : lang === 'ar'
          ? 'المنطقة والمدينة'
          : 'Region and city',
    }),
    [isTechnicianWorkspace, lang, t.sortOptions]
  );

  const scrollToResults = () => {
    resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSummaryCardClick = (statusKey = 'all') => {
    setSelectedStatus(statusKey);
    scrollToResults();
  };

  const handleRegionCardClick = (regionKey = 'all') => {
    setSelectedTechnician(regionKey);
    scrollToResults();
  };

  const exportReport = async (format) => {
    try {
      setExportingFormat(format);
      await exportOrdersReport({
        orders: filteredOrders,
        lang,
        scopeLabel: `${mode}-tasks`,
        fileDate: scopeMeta.exportLabel,
        format,
      });
      toast.success(lang === 'ar' ? 'تم تصدير التقرير بنجاح.' : 'Report exported successfully.');
    } catch (error) {
      toast.error(error?.message || (lang === 'ar' ? 'تعذر تصدير التقرير.' : 'Unable to export report.'));
    } finally {
      setExportingFormat('');
    }
  };

  const printPage = () => {
    window.print();
  };

  const handleManagerQuickStatus = async (order, nextStatus) => {
    if (!nextStatus) {
      return;
    }

    const nextLabel = t.quickStatus[nextStatus] || nextStatus;
    const shouldProceed = window.confirm(t.quickStatus.confirm(nextLabel, order.customerName));
    if (!shouldProceed) {
      setStatusDrafts((current) => ({
        ...current,
        [order.id]: '',
      }));
      return;
    }

    try {
      setUpdatingOrderId(String(order.id));
      await operationsService.updateOrder(order.id, { status: nextStatus });
      setOrders((current) =>
        current.map((item) =>
          String(item.id) === String(order.id)
            ? {
                ...item,
                status: nextStatus,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );
      toast.success(t.quickStatus.success[nextStatus] || nextLabel);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || nextLabel);
    } finally {
      setUpdatingOrderId('');
      setStatusDrafts((current) => ({
        ...current,
        [order.id]: '',
      }));
    }
  };

  const handleAssignTechnician = async (order, technicianId) => {
    try {
      setUpdatingOrderId(String(order.id));
      await operationsService.updateOrder(order.id, {
        technicianId: technicianId || null,
      });
      toast.success(lang === 'ar' ? 'تم تحديث الإسناد.' : 'Assignment updated.');
      const response = await operationsService.getDashboard();
      setOrders(response.data?.orders || []);
      setTechnicians(response.data?.technicians || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t.assignTechnician);
    } finally {
      setUpdatingOrderId('');
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
    <section className="page-shell daily-tasks-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="section-heading print-area-header">
        <p className="eyebrow">{modeCopy.eyebrow}</p>
        <h1>{modeCopy.title}</h1>
        <p className="section-subtitle">{modeCopy.subtitle}</p>
      </div>

      <div className="dashboard-toolbar-links print-hidden">
        <Link className="btn-light" to={workspaceBasePath}>
          {t.dashboard}
        </Link>
        {canPrintReports ? (
          <>
            <button className="btn-secondary" type="button" onClick={printPage}>
              {t.print}
            </button>
            <button className="btn-primary" disabled={Boolean(exportingFormat)} type="button" onClick={() => exportReport('pdf')}>
              {exportingFormat === 'pdf' ? '...' : t.exportPdf}
            </button>
            <button className="btn-secondary" disabled={Boolean(exportingFormat)} type="button" onClick={() => exportReport('excel')}>
              {exportingFormat === 'excel' ? '...' : t.exportExcel}
            </button>
          </>
        ) : (
          <span className="user-chip">{lang === 'ar' ? 'الطباعة محصورة بالحساب المعتمد' : 'Printing is limited to the approved account'}</span>
        )}
      </div>

      <div className="planning-tabs print-hidden">
        <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`${workspaceBasePath}/daily`}>
          {t.tabs.daily}
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`${workspaceBasePath}/weekly`}>
          {t.tabs.weekly}
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={`${workspaceBasePath}/monthly`}>
          {t.tabs.monthly}
        </NavLink>
      </div>

      <section className="panel print-hidden">
        <div className="planning-controls">
          <div>
            <label>{modeCopy.scopeLabel}</label>
            <input
              className="input"
              type={scopeMeta.inputType}
              value={scopeValue}
              onChange={(event) => setScopeValue(event.target.value)}
            />
          </div>
          <div>
            <label>{t.sortBy}</label>
            <select className="input" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
              {Object.entries(sortOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>{t.statusFilter}</label>
            <select className="input" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
              <option value="all">{t.statusOptions.all}</option>
              {displayStatusOptions.map((statusItem) => (
                <option key={statusItem.key} value={statusItem.key}>
                  {statusItem.label}
                </option>
              ))}
            </select>
          </div>
        </div>

      <div className="daily-summary-grid">
        <button className={`dashboard-stat-link summary-filter-card ${selectedStatus === 'all' ? 'active' : ''}`} type="button" onClick={() => handleSummaryCardClick('all')}>
          <strong>{summary.total}</strong>
          <span>{t.summary.total}</span>
        </button>
        <button className={`dashboard-stat-link summary-filter-card ${selectedStatus === 'all' ? 'active' : ''}`} type="button" onClick={() => handleSummaryCardClick('all')}>
          <strong>{technicianScopedOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0)}</strong>
          <span>{t.deviceCount}</span>
        </button>
        {visibleSummaryBuckets.map((statusItem) => (
          <button
            className={`dashboard-stat-link summary-filter-card ${selectedStatus === statusItem.key ? 'active' : ''}`}
            key={statusItem.key}
            type="button"
            onClick={() => handleSummaryCardClick(statusItem.key)}
          >
            <strong>{statusItem.count}</strong>
            <span>{statusItem.label}</span>
          </button>
        ))}
        </div>
      </section>

      <section className="panel print-hidden">
        <div className="panel-header">
          <div>
            <h2>{isTechnicianWorkspace ? t.regionsTitle : lang === 'ar' ? 'المناطق' : 'Areas'}</h2>
            <p>
              {isTechnicianWorkspace
                ? t.regionsHint
                : lang === 'ar'
                  ? 'صفّ المهام حسب منطقة العميل أو مدينته خلال الفترة المحددة.'
                  : 'Group tasks by the customer region or city for the selected period.'}
            </p>
          </div>
        </div>

        <div className="daily-region-grid">
          <button
            className={`dashboard-stat-link region-entry-card ${selectedTechnician === 'all' ? 'active' : ''}`}
            type="button"
            onClick={() => handleRegionCardClick('all')}
          >
            <strong>{rangeOrders.length}</strong>
            <span>{isTechnicianWorkspace ? t.allRegions : lang === 'ar' ? 'كل المناطق' : 'All areas'}</span>
            <small>{lang === 'ar' ? 'عرض كل مهام الفترة' : 'Show all tasks in this period'}</small>
          </button>
          {isTechnicianWorkspace ? (
            <>
              <button
                className={`dashboard-stat-link region-entry-card ${selectedTechnician === 'unassigned' ? 'active' : ''}`}
                type="button"
                onClick={() => handleRegionCardClick('unassigned')}
              >
                <strong>{rangeOrders.filter((order) => !String(order.technicianId || '').trim()).length}</strong>
                <span>{t.unassignedTechnician}</span>
                <small>{lang === 'ar' ? 'طلبات تحتاج إسنادًا يدويًا' : 'Orders that still need assignment'}</small>
              </button>
              {technicianCards.map((technician) => (
                <button
                  className={`dashboard-stat-link region-entry-card ${selectedTechnician === technician.id ? 'active' : ''}`}
                  key={technician.id}
                  type="button"
                  onClick={() => handleRegionCardClick(technician.id)}
                >
                  <strong>{technician.orderCount}</strong>
                  <span>{technician.name}</span>
                  <small>{getTechnicianCoverageLabel(technician.zone || technician.region, lang)}</small>
                </button>
              ))}
            </>
          ) : (
            regionCards.map((region) => (
              <button
                className={`dashboard-stat-link region-entry-card ${selectedTechnician === region.key ? 'active' : ''}`}
                key={region.key}
                type="button"
                onClick={() => handleRegionCardClick(region.key)}
              >
                <strong>{region.orderCount}</strong>
                <span>{lang === 'ar' ? region.ar : region.en}</span>
                <small>{lang === 'ar' ? 'تجميع حسب المنطقة' : 'Grouped by region'}</small>
              </button>
            ))
          )}
        </div>

        {isTechnicianWorkspace && selectedTechnician === 'unassigned' ? (
          <div className="task-mini-panel" style={{ marginTop: 16 }}>
            <span>{t.technicianTaskSummary}</span>
            <strong>{t.unassignedTechnician}</strong>
            <small>{lang === 'ar' ? 'الطلبات الظاهرة هنا غير مرتبطة بأي فني حتى الآن.' : 'The visible orders here are not assigned to any technician yet.'}</small>
          </div>
        ) : isTechnicianWorkspace && selectedTechnicianRecord ? (
          <div className="task-mini-panel" style={{ marginTop: 16 }}>
            <span>{t.technicianTaskSummary}</span>
            <strong>{selectedTechnicianRecord.name}</strong>
            <small>
              {[
                `${t.technicianCoverage}: ${getTechnicianCoverageLabel(selectedTechnicianRecord.zone || selectedTechnicianRecord.region, lang)}`,
                `${t.technicianAvailability}: ${
                  selectedTechnicianRecord.status === 'busy'
                    ? lang === 'ar'
                      ? 'مشغول'
                      : 'Busy'
                    : lang === 'ar'
                      ? 'متاح'
                      : 'Available'
                }`,
                `${lang === 'ar' ? 'الطلبات' : 'Orders'}: ${selectedTechnicianRecord.orderCount || 0}`,
                `${t.deviceCount}: ${selectedTechnicianRecord.devicesCount || 0}`,
                selectedTechnicianRecord.phone
                  ? `${t.technicianContact}: ${formatSaudiPhoneDisplay(selectedTechnicianRecord.phone)}`
                  : selectedTechnicianRecord.email || '',
              ]
                .filter(Boolean)
                .join(' • ')}
            </small>
            <small>
              {selectedTechnicianRecord.activeTaskRefs?.length
                ? `${t.technicianCurrentTasks}: ${selectedTechnicianRecord.activeTaskRefs.join(' • ')}`
                : t.noTechnicianTasks}
            </small>
          </div>
        ) : selectedRegionRecord ? (
          <div className="task-mini-panel" style={{ marginTop: 16 }}>
            <span>{lang === 'ar' ? 'ملخص المنطقة' : 'Area summary'}</span>
            <strong>{lang === 'ar' ? selectedRegionRecord.ar : selectedRegionRecord.en}</strong>
            <small>
              {[
                `${lang === 'ar' ? 'الطلبات' : 'Orders'}: ${selectedRegionRecord.orderCount || 0}`,
                `${t.deviceCount}: ${technicianScopedOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0)}`,
              ].join(' • ')}
            </small>
            <small>
              {technicianScopedOrders.length
                ? technicianScopedOrders.slice(0, 6).map((order) => getOrderPrimaryReference(order)).filter(Boolean).join(' • ')
                : lang === 'ar'
                  ? 'لا توجد مهام حالية في هذه المنطقة.'
                  : 'No current tasks in this area.'}
            </small>
          </div>
        ) : null}
      </section>

      <section className="panel print-panel" ref={resultsSectionRef}>
        <OrderMasterDetail
          emptySearchText={t.compactList.emptySearch}
          emptyText={t.empty}
          getCustomerName={(order) => order.customerName || '—'}
          getOrderReference={(order) => getOrderReferenceText(order, lang)}
          getStatusLabel={(order) => getOrderDisplayStatus(order, lang)}
          isRTL={isRTL}
          labels={t.compactList}
          orders={filteredOrders}
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
          renderOrderDetails={(order) => (
            <DailyTaskDetailContent
              canAssignTechnician={isTechnicianWorkspace}
              lang={lang}
              onAssignTechnician={handleAssignTechnician}
              order={order}
              t={t}
              technicians={technicians}
            />
          )}
          renderRowActions={
            isTechnicianWorkspace
              ? (order) => (
                  <div className="order-inline-status manager-inline-status">
                    <select
                      className="input compact-input order-inline-select manager-inline-select"
                      disabled={updatingOrderId === String(order.id)}
                      value={statusDrafts[order.id] ?? ''}
                      onChange={(event) => {
                        const nextStatus = event.target.value;
                        setStatusDrafts((current) => ({
                          ...current,
                          [order.id]: nextStatus,
                        }));
                        handleManagerQuickStatus(order, nextStatus);
                      }}
                    >
                      <option value="">
                        {updatingOrderId === String(order.id) ? t.quickStatus.loading : t.quickStatus.placeholder}
                      </option>
                      <option value="scheduled">{t.quickStatus.scheduled}</option>
                      <option value="canceled">{t.quickStatus.canceled}</option>
                      <option value="completed">{t.quickStatus.completed}</option>
                    </select>
                  </div>
                )
              : undefined
          }
          renderResultsSummary={t.compactList.results}
          searchPlaceholder={t.compactList.searchPlaceholder}
        />
      </section>
    </section>
  );
}

function DailyTaskDetailContent({ order, lang, t, canAssignTechnician, onAssignTechnician, technicians = [] }) {
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
    <div className="daily-task-card drawer-task-content">
      <div className="task-timing-grid">
        <div className="task-mini-panel">
          <span>{lang === 'ar' ? 'حقول الإكسل' : 'Excel fields'}</span>
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
          <span>{t.preferred}</span>
          <strong>{formatDateTimeLabel(order.preferredDate, order.preferredTime, lang)}</strong>
        </div>
        <div className="task-mini-panel">
          <span>{t.scheduled}</span>
          <strong>{formatDateTimeLabel(order.scheduledDate, order.scheduledTime, lang)}</strong>
        </div>
        <div className="task-mini-panel">
          <span>{t.deviceCount}</span>
          <strong>{getOrderDeviceCount(order)}</strong>
        </div>
      </div>

      <div className="task-rich-meta">
        <p>{`${getOrderRegionLabel(order, lang)}${order.city ? ` - ${order.city}` : ''}${order.district ? ` - ${order.district}` : ''}`}</p>
        <p>{order.addressText || order.address || '—'}</p>
        <p>{getOrderReferenceText(order, lang)}</p>
        <p>{order.serviceSummary || order.workType || '—'}</p>
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

      <OrderDeviceBreakdown lang={lang} order={order} title={t.devicesTitle} />

      <div className="task-contact-actions">
        <a className="btn-light" href={buildCallUrl(order.phone)}>
          {t.call}: {formatSaudiPhoneDisplay(order.phone)}
        </a>
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
        {canAssignTechnician ? (
          <select className="input compact-input order-inline-select" value={order.technicianId || ''} onChange={(event) => onAssignTechnician(order, event.target.value)}>
            <option value="">{t.assignTechnician}</option>
            {(technicians || []).map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {order.notes ? (
        <div className="task-mini-panel">
          <span>{t.notes}</span>
          <strong style={{ whiteSpace: 'pre-wrap' }}>{order.notes}</strong>
        </div>
      ) : null}

      {chatLog ? (
        <div className="task-mini-panel">
          <span>Chat Log</span>
          <strong style={{ whiteSpace: 'pre-wrap' }}>{chatLog}</strong>
        </div>
      ) : null}

      {getOrderSoId(order) || getOrderWoId(order) ? (
        <div className="task-mini-panel">
          <span>{lang === 'ar' ? 'مراجع الطلب' : 'Order references'}</span>
          <strong>{getOrderReferenceText(order, lang)}</strong>
        </div>
      ) : null}
    </div>
  );
}

export default function InternalDailyTasks() {
  return <InternalTaskPlanner mode="daily" />;
}
