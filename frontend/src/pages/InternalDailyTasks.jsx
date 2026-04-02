import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, NavLink } from 'react-router-dom';
import OrderMasterDetail from '../components/OrderMasterDetail';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { buildWhatsAppUrl, formatSaudiPhoneDisplay, operationsService } from '../services/api';
import {
  buildCallUrl,
  buildDisplayStatusBuckets,
  exportOrdersCsv,
  formatDateTimeLabel,
  getOperationalDate,
  getOrderDeviceCount,
  getOrderDisplayStatus,
  getOrderTaskDate,
  orderMatchesDisplayStatus,
} from '../utils/internalOrders';

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
  return { inputType: 'date', startDate: dayValue, endDate: dayValue, exportLabel: dayValue };
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

const getFilteredSummary = (orders, lang) => ({
  total: orders.length,
  buckets: buildDisplayStatusBuckets(orders, lang),
});

const copy = {
  en: {
    modes: {
      daily: {
        eyebrow: 'Daily tasks',
        title: 'Daily task board',
        subtitle: 'A live day view that refreshes only when the system updates.',
        scopeLabel: 'Task date',
      },
      weekly: {
        eyebrow: 'Weekly tasks',
        title: 'Weekly task board',
        subtitle: 'A structured week view for planning, printing, and operational follow-up.',
        scopeLabel: 'Week start',
      },
      monthly: {
        eyebrow: 'Monthly tasks',
        title: 'Monthly task board',
        subtitle: 'A monthly workload page for broad planning, sorting, and clean print output.',
        scopeLabel: 'Month',
      },
    },
    loading: 'Loading tasks...',
    dashboard: 'Back to dashboard',
    export: 'Export report',
    print: 'Print page',
    tabs: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    },
    regionsTitle: 'Operations regions',
    regionsHint: 'Filter the period by region, then review the covered cities inside each box.',
    allRegions: 'All regions',
    sortBy: 'Sort by',
    statusFilter: 'Status',
    sortOptions: {
      region: 'Region and city',
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
      searchPlaceholder: 'Search by order ID, customer, or city',
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
    contactCustomer: 'Called customer',
    contactPrompt: 'Write the call note for the customer',
  },
  ar: {
    modes: {
      daily: {
        eyebrow: 'المهام اليومية',
        title: 'صفحة مهام يومية',
        subtitle: 'عرض يومي يتحدث فقط عند تحديث النظام، دون تحديثات تلقائية مستمرة.',
        scopeLabel: 'تاريخ المهام',
      },
      weekly: {
        eyebrow: 'المهام الأسبوعية',
        title: 'صفحة مهام أسبوعية',
        subtitle: 'عرض أسبوعي منظم للتخطيط، الطباعة، ومتابعة فرق التشغيل بشكل احترافي.',
        scopeLabel: 'بداية الأسبوع',
      },
      monthly: {
        eyebrow: 'المهام الشهرية',
        title: 'صفحة مهام شهرية',
        subtitle: 'عرض شهري شامل لتوزيع العمل، الفرز، والطباعة بشكل واضح ومهني.',
        scopeLabel: 'الشهر',
      },
    },
    loading: 'جارٍ تحميل المهام...',
    dashboard: 'العودة إلى اللوحة',
    export: 'تصدير التقرير',
    print: 'طباعة الصفحة',
    tabs: {
      daily: 'اليومية',
      weekly: 'الأسبوعية',
      monthly: 'الشهرية',
    },
    regionsTitle: 'مناطق مدير العمليات',
    regionsHint: 'قم بفرز الفترة حسب المنطقة، ثم راجع المدن التابعة داخل كل مربع.',
    allRegions: 'كل المناطق',
    sortBy: 'الفرز حسب',
    statusFilter: 'الحالة',
    sortOptions: {
      region: 'المنطقة والمدينة',
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
      searchPlaceholder: 'ابحث برقم الطلب أو اسم العميل أو المدينة',
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
    contactCustomer: 'تم التواصل مع العميل',
    contactPrompt: 'اكتب ملاحظة الاتصال مع العميل',
  },
};

export function InternalTaskPlanner({ mode = 'daily' }) {
  const { user } = useAuth();
  const { lang, isRTL } = useLang();
  const t = copy[lang] || copy.en;
  const modeCopy = t.modes[mode] || t.modes.daily;
  const [scopeValue, setScopeValue] = useState(() => getInitialScopeValue(mode));
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortKey, setSortKey] = useState('region');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [statusDrafts, setStatusDrafts] = useState({});
  const isOperationsManager = user?.role === 'operations_manager';

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        const response = await operationsService.getDashboard();
        setOrders(response.data?.orders || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || 'Unable to load tasks');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };

    const onSystemUpdated = () => load(true);
    const onDateUpdated = (event) => {
      const nextDate = event?.detail?.date || getOperationalDate();
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
        isWithinRange(getOrderTaskDate(order), scopeMeta.startDate, scopeMeta.endDate)
      ),
    [orders, scopeMeta.endDate, scopeMeta.startDate]
  );

  const regionCards = useMemo(
    () =>
      operationsRegions.map((region) => ({
        ...region,
        count: rangeOrders.filter((order) => getOrderRegionKey(order) === region.key).length,
      })),
    [rangeOrders]
  );
  const displayStatusOptions = useMemo(() => buildDisplayStatusBuckets(rangeOrders, lang), [lang, rangeOrders]);

  useEffect(() => {
    if (selectedStatus !== 'all' && !displayStatusOptions.some((item) => item.key === selectedStatus)) {
      setSelectedStatus('all');
    }
  }, [displayStatusOptions, selectedStatus]);

  const filteredOrders = useMemo(() => {
    const regionScoped = selectedRegion === 'all' ? rangeOrders : rangeOrders.filter((order) => getOrderRegionKey(order) === selectedRegion);
    const statusScoped =
      selectedStatus === 'all' ? regionScoped : regionScoped.filter((order) => orderMatchesDisplayStatus(order, selectedStatus, lang));
    const sorted = statusScoped.slice();
    if (sortKey === 'status') {
      sorted.sort(compareOrdersByStatusThenRegion);
    } else if (sortKey === 'latest') {
      sorted.sort(compareOrdersByLatest);
    } else if (sortKey === 'customer') {
      sorted.sort(compareOrdersByCustomer);
    } else {
      sorted.sort(compareOrdersByRegion);
    }
    return sorted;
  }, [lang, rangeOrders, selectedRegion, selectedStatus, sortKey]);

  const summary = useMemo(() => getFilteredSummary(filteredOrders, lang), [filteredOrders, lang]);
  const visibleSummaryBuckets = useMemo(
    () => summary.buckets.filter((item) => item.key !== 'pending'),
    [summary.buckets]
  );

  const exportReport = () => {
    exportOrdersCsv({
      orders: filteredOrders,
      lang,
      scopeLabel: `${mode}-tasks`,
      fileDate: scopeMeta.exportLabel,
    });
    toast.success(lang === 'ar' ? 'تم تصدير التقرير بنجاح.' : 'Report exported successfully.');
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

  const handleContactCustomer = async (order) => {
    const note = window.prompt(t.contactPrompt, '');
    if (!note) {
      return;
    }

    try {
      setUpdatingOrderId(String(order.id));
      await operationsService.updateOrder(order.id, {
        contactCustomerNote: note,
      });
      toast.success(t.contactCustomer);
      const response = await operationsService.getDashboard();
      setOrders(response.data?.orders || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t.contactCustomer);
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
        <Link className="btn-light" to="/dashboard">
          {t.dashboard}
        </Link>
        <button className="btn-secondary" type="button" onClick={printPage}>
          {t.print}
        </button>
        <button className="btn-primary" type="button" onClick={exportReport}>
          {t.export}
        </button>
      </div>

      <div className="planning-tabs print-hidden">
        <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to="/dashboard/daily">
          {t.tabs.daily}
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to="/dashboard/weekly">
          {t.tabs.weekly}
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to="/dashboard/monthly">
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
              {Object.entries(t.sortOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>{t.statusFilter}</label>
            <select className="input" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
              <option value="all">{t.allStatuses}</option>
              {displayStatusOptions.map((statusItem) => (
                <option key={statusItem.key} value={statusItem.key}>
                  {statusItem.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="daily-summary-grid">
          <article className="dashboard-stat-link">
            <strong>{summary.total}</strong>
            <span>{t.summary.total}</span>
          </article>
          {visibleSummaryBuckets.map((statusItem) => (
            <article className="dashboard-stat-link" key={statusItem.key}>
              <strong>{statusItem.count}</strong>
              <span>{statusItem.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel print-hidden">
        <div className="panel-header">
          <div>
            <h2>{t.regionsTitle}</h2>
            <p>{t.regionsHint}</p>
          </div>
        </div>

        <div className="daily-region-grid">
          <button
            className={`dashboard-stat-link region-entry-card ${selectedRegion === 'all' ? 'active' : ''}`}
            type="button"
            onClick={() => setSelectedRegion('all')}
          >
            <strong>{rangeOrders.length}</strong>
            <span>{t.allRegions}</span>
            <small>{lang === 'ar' ? 'عرض كل مهام الفترة' : 'Show all tasks in this period'}</small>
          </button>
          {regionCards.map((region) => (
            <button
              className={`dashboard-stat-link region-entry-card ${selectedRegion === region.key ? 'active' : ''}`}
              key={region.key}
              type="button"
              onClick={() => setSelectedRegion(region.key)}
            >
              <strong>{region.count}</strong>
              <span>{lang === 'ar' ? region.ar : region.en}</span>
              <small>{region.cities.join(' - ')}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel print-panel">
        <OrderMasterDetail
          emptySearchText={t.compactList.emptySearch}
          emptyText={t.empty}
          getCustomerName={(order) => order.customerName || '—'}
          getOrderReference={(order) => order.requestNumber || order.id || '—'}
          getStatusLabel={(order) => getOrderDisplayStatus(order, lang)}
          isRTL={isRTL}
          labels={t.compactList}
          orders={filteredOrders}
          renderOrderDetails={(order) => (
            <DailyTaskDetailContent
              canContactCustomer={isOperationsManager}
              lang={lang}
              onContactCustomer={handleContactCustomer}
              order={order}
              t={t}
            />
          )}
          renderRowActions={
            isOperationsManager
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

function DailyTaskDetailContent({ order, lang, t, canContactCustomer, onContactCustomer }) {
  return (
    <div className="daily-task-card drawer-task-content">
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
        <p>{order.serviceSummary || order.workType || '—'}</p>
      </div>

      <div className="task-contact-actions">
        <a className="btn-light" href={buildCallUrl(order.phone)}>
          {t.call}: {formatSaudiPhoneDisplay(order.phone)}
        </a>
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
        {canContactCustomer ? (
          <button className="btn-light" type="button" onClick={() => onContactCustomer(order)}>
            {t.contactCustomer}
          </button>
        ) : null}
      </div>

      {order.notes ? (
        <div className="task-mini-panel">
          <span>{t.notes}</span>
          <strong>{order.notes}</strong>
        </div>
      ) : null}
    </div>
  );
}

export default function InternalDailyTasks() {
  return <InternalTaskPlanner mode="daily" />;
}
