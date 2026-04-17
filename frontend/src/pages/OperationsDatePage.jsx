import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { operationsService } from '../services/api';
import { exportOrdersReport, getOperationalDate, nextDateString, orderMatchesDailyTaskDate, setOperationalDate } from '../utils/internalOrders';
import { canUserPrintEndOfDayReports } from '../utils/workspaceAccess';
import { getWorkspaceBasePath } from '../utils/workspaceRoles';

const copy = {
  en: {
    eyebrow: 'Operations day',
    title: 'Operational date and day export',
    subtitle: 'An admin-only page to control the operational date and close the day cleanly.',
    loading: 'Loading day controls...',
    backDashboard: 'Back to dashboard',
    date: 'Operational date',
    updateDate: 'Update date',
    exportDayPdf: 'Export PDF reports',
    exportDayExcel: 'Export Excel reports',
    closeDay: 'Export day and move forward',
    hint: 'Closing the day exports the admin and operations reports for the active date before moving to the next day.',
    dateUpdated: 'Operational date updated.',
    dayExported: 'Current day reports exported.',
    dayClosed: 'Current day reports exported and the system moved to the next date.',
    roleBadges: {
      admin: 'Admin',
      customer_service: 'Customer service',
      operations_manager: 'Operations manager',
    },
  },
  ar: {
    eyebrow: 'يوم التشغيل',
    title: 'تاريخ التشغيل وتصدير اليوم',
    subtitle: 'صفحة خاصة بالإدارة للتحكم بتاريخ التشغيل وإغلاق اليوم بشكل منظم.',
    loading: 'جارٍ تحميل صفحة التشغيل...',
    backDashboard: 'العودة إلى اللوحة',
    date: 'تاريخ التشغيل',
    updateDate: 'تحديث التاريخ',
    exportDayPdf: 'تصدير تقارير PDF',
    exportDayExcel: 'تصدير تقارير إكسل',
    closeDay: 'تصدير اليوم والانتقال لليوم التالي',
    hint: 'عند إغلاق اليوم يتم تصدير تقارير الإدارة ومدير العمليات لنفس تاريخ التشغيل أولاً ثم الانتقال إلى التاريخ التالي.',
    dateUpdated: 'تم تحديث تاريخ التشغيل.',
    dayExported: 'تم تصدير تقارير اليوم الحالي.',
    dayClosed: 'تم تصدير تقارير اليوم الحالي والانتقال إلى اليوم التالي.',
    roleBadges: {
      admin: 'الإدارة',
      customer_service: 'خدمة العملاء',
      operations_manager: 'مدير العمليات',
    },
  },
};

export default function OperationsDatePage() {
  const { user } = useAuth();
  const { lang, isRTL } = useLang();
  const t = copy[lang] || copy.en;
  const workspaceBasePath = getWorkspaceBasePath(user?.role);
  const canPrintReports = canUserPrintEndOfDayReports(user);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [operationalDate, setOperationalDateState] = useState(() => getOperationalDate());
  const [exportingFormat, setExportingFormat] = useState('');

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        const response = await operationsService.getDashboard();
        setOrders(response.data?.orders || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || 'تعذر تحميل إعدادات يوم التشغيل.');
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

  const reportOrders = useMemo(() => orders.slice(), [orders]);
  const dailyOrders = useMemo(
    () => reportOrders.filter((order) => orderMatchesDailyTaskDate(order, operationalDate)),
    [operationalDate, reportOrders]
  );

  const exportCurrentDay = async (format, showToast = true) => {
    try {
      setExportingFormat(format);
      await exportOrdersReport({ orders: dailyOrders, lang, scopeLabel: 'csr-daily', fileDate: operationalDate, format });
      await exportOrdersReport({ orders: dailyOrders, lang, scopeLabel: 'ops-daily', fileDate: operationalDate, format });
      if (showToast) {
        toast.success(t.dayExported);
      }
      return true;
    } catch (error) {
      toast.error(error?.message || (lang === 'ar' ? 'تعذر تصدير تقارير اليوم.' : 'Unable to export day reports.'));
      return false;
    } finally {
      setExportingFormat('');
    }
  };

  const onSaveDate = () => {
    const applied = setOperationalDate(operationalDate);
    setOperationalDateState(applied);
    toast.success(t.dateUpdated);
  };

  const onCloseDay = async () => {
    const excelDone = await exportCurrentDay('excel', false);
    if (!excelDone) {
      return;
    }
    const pdfDone = await exportCurrentDay('pdf', false);
    if (!pdfDone) {
      return;
    }
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
            <Link className="btn-light" to={workspaceBasePath}>
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
          {canPrintReports ? (
            <>
              <button className="btn-secondary" disabled={Boolean(exportingFormat)} type="button" onClick={() => exportCurrentDay('pdf')}>
                {exportingFormat === 'pdf' ? '...' : t.exportDayPdf}
              </button>
              <button className="btn-secondary" disabled={Boolean(exportingFormat)} type="button" onClick={() => exportCurrentDay('excel')}>
                {exportingFormat === 'excel' ? '...' : t.exportDayExcel}
              </button>
              <button className="btn-primary" disabled={Boolean(exportingFormat)} type="button" onClick={onCloseDay}>
                {exportingFormat === 'excel' || exportingFormat === 'pdf' ? '...' : t.closeDay}
              </button>
            </>
          ) : null}
          <p className="muted">{t.hint}</p>
          {canPrintReports ? null : (
            <p className="muted">{lang === 'ar' ? 'طباعة وإغلاق اليوم متاحان فقط للحساب المعتمد.' : 'Printing and closing the day are only available to the approved account.'}</p>
          )}
        </div>
      </section>
    </section>
  );
}
