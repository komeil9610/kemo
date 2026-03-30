import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { operationsService } from '../services/api';
import { exportOrdersCsv, getOperationalDate, getOrderTaskDate, nextDateString, setOperationalDate } from '../utils/internalOrders';

const copy = {
  en: {
    eyebrow: 'Operations day',
    title: 'Operational date and day export',
    subtitle: 'A shared page for customer service and operations manager to control the active operating date and close the day cleanly.',
    loading: 'Loading day controls...',
    backDashboard: 'Back to dashboard',
    date: 'Operational date',
    updateDate: 'Update date',
    exportDay: 'Export current day reports',
    closeDay: 'Export day and move forward',
    hint: 'Closing the day exports both customer service and operations reports for the active date before moving to the next day.',
    dateUpdated: 'Operational date updated.',
    dayExported: 'Current day reports exported.',
    dayClosed: 'Current day reports exported and the system moved to the next date.',
    roleBadges: {
      customer_service: 'Customer service',
      operations_manager: 'Operations manager',
    },
  },
  ar: {
    eyebrow: 'يوم التشغيل',
    title: 'تاريخ التشغيل وتصدير اليوم',
    subtitle: 'صفحة مشتركة بين خدمة العملاء ومدير العمليات للتحكم بتاريخ التشغيل وإغلاق اليوم بشكل منظم.',
    loading: 'جارٍ تحميل صفحة التشغيل...',
    backDashboard: 'العودة إلى اللوحة',
    date: 'تاريخ التشغيل',
    updateDate: 'تحديث التاريخ',
    exportDay: 'تصدير تقارير اليوم',
    closeDay: 'تصدير اليوم والانتقال لليوم التالي',
    hint: 'عند إغلاق اليوم يتم تصدير تقارير خدمة العملاء ومدير العمليات لنفس تاريخ التشغيل أولاً ثم الانتقال إلى التاريخ التالي.',
    dateUpdated: 'تم تحديث تاريخ التشغيل.',
    dayExported: 'تم تصدير تقارير اليوم الحالي.',
    dayClosed: 'تم تصدير تقارير اليوم الحالي والانتقال إلى اليوم التالي.',
    roleBadges: {
      customer_service: 'خدمة العملاء',
      operations_manager: 'مدير العمليات',
    },
  },
};

export default function OperationsDatePage() {
  const { user } = useAuth();
  const { lang, isRTL } = useLang();
  const t = copy[lang] || copy.en;
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [operationalDate, setOperationalDateState] = useState(() => getOperationalDate());

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        const response = await operationsService.getDashboard();
        setOrders(response.data?.orders || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || 'Unable to load day controls');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };

    const syncDate = (event) => setOperationalDateState(event?.detail?.date || getOperationalDate());
    const reloadListener = () => load(true);

    load();
    const intervalId = window.setInterval(() => load(true), 12000);
    window.addEventListener('operations-updated', reloadListener);
    window.addEventListener('operations-date-updated', syncDate);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('operations-updated', reloadListener);
      window.removeEventListener('operations-date-updated', syncDate);
    };
  }, []);

  const reportOrders = useMemo(() => orders.slice().sort((a, b) => `${b.updatedAt}`.localeCompare(`${a.updatedAt}`)), [orders]);
  const dailyOrders = useMemo(
    () => reportOrders.filter((order) => getOrderTaskDate(order) === operationalDate),
    [operationalDate, reportOrders]
  );

  const exportCurrentDay = (showToast = true) => {
    exportOrdersCsv({ orders: dailyOrders, lang, scopeLabel: 'csr-daily', fileDate: operationalDate });
    exportOrdersCsv({ orders: dailyOrders, lang, scopeLabel: 'ops-daily', fileDate: operationalDate });
    if (showToast) {
      toast.success(t.dayExported);
    }
  };

  const onSaveDate = () => {
    const applied = setOperationalDate(operationalDate);
    setOperationalDateState(applied);
    toast.success(t.dateUpdated);
  };

  const onCloseDay = () => {
    exportCurrentDay(false);
    const nextDate = setOperationalDate(nextDateString(operationalDate));
    setOperationalDateState(nextDate);
    toast.success(t.dayClosed);
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
    <section className="page-shell" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="section-heading">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="section-subtitle">{t.subtitle}</p>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>{t.title}</h2>
            <p>{t.hint}</p>
          </div>
          <div className="helper-actions">
            <Link className="btn-light" to="/dashboard">
              {t.backDashboard}
            </Link>
            <span className="user-chip">{t.roleBadges[user?.role]}</span>
          </div>
        </div>

        <div className="operations-date-panel">
          <div>
            <label>{t.date}</label>
            <input
              className="input"
              type="date"
              value={operationalDate}
              onChange={(event) => setOperationalDateState(event.target.value)}
            />
          </div>
          <button className="btn-light" type="button" onClick={onSaveDate}>
            {t.updateDate}
          </button>
          <button className="btn-secondary" type="button" onClick={exportCurrentDay}>
            {t.exportDay}
          </button>
          <button className="btn-primary" type="button" onClick={onCloseDay}>
            {t.closeDay}
          </button>
          <p className="muted">{t.hint}</p>
        </div>
      </section>
    </section>
  );
}
