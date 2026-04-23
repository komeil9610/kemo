import React, { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { canUploadExcelSource, operationsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const copy = {
  en: {
    eyebrow: 'Admin',
    title: 'Excel import control',
    subtitle: 'Upload the Zamil Excel source, review its quality, then sync validated rows into the operations workflow.',
    uploaderEyebrow: 'Excel uploader',
    uploaderTitle: 'Excel upload room',
    uploaderSubtitle: 'This workspace is limited to receiving the Excel file, validating it, and sending synced requests to admin, operations, and assigned technicians.',
    sourceFile: 'Source file',
    upload: 'Upload Excel',
    uploading: 'Uploading...',
    import: 'Import preview',
    importing: 'Importing...',
    importProgress: ({ processed, total, currentChunk, totalChunks }) =>
      `Importing in batches: ${processed}/${total} rows, batch ${currentChunk}/${totalChunks}.`,
    readyToast: (valid, invalid, deduplicated) =>
      `Excel parsed. ${valid} valid rows${invalid ? `, ${invalid} need review` : ''}${deduplicated ? `, ${deduplicated} duplicates merged` : ''}.`,
    importToast: ({ imported, created, updated, archived, restored, unchanged, skipped }) =>
      `Excel sync complete. Processed ${imported}: created ${created}, updated ${updated}, archived ${archived}, restored ${restored}${unchanged ? `, unchanged ${unchanged}` : ''}${skipped ? `, skipped ${skipped}` : ''}.`,
    uploadFirst: 'Upload an Excel file first.',
    validRows: 'Valid rows',
    reviewRows: 'Need review',
    devices: 'Devices',
    followUp: 'Follow-up',
    assigned: 'Assigned tech',
    reviewAssignments: 'Assignment review',
    overdue: 'Overdue follow-up',
    withinSla: 'Within SLA',
    exceedSla: 'Exceed SLA',
    statusBreakdown: 'Status breakdown',
    cityBreakdown: 'City breakdown',
    technicianBreakdown: 'Technician codes',
    noPreview: 'Upload the latest Excel file to see import analytics before syncing.',
    rulesTitle: 'Import rules',
    rulesHint: 'The admin account owns the source data: upload, validate, deduplicate, and sync. Operations then works from the cleaned task board.',
    uploaderRulesHint: 'This account cannot access the rest of the system. Its only job is to upload the Excel file, validate it, and hand off the synced requests to the internal teams.',
    ruleOne: 'Rows are matched by SO ID where possible, so existing requests are updated instead of duplicated.',
    ruleTwo: 'Completed rows are archived automatically, while changed active rows are restored or updated.',
    ruleThree: 'Invalid rows stay in review and are not imported until the Excel source is corrected.',
    deliveryHint: 'After sync, new requests are sent to admin, the operations manager, and any assigned technician linked to the Excel code.',
    lastSync: 'Last sync',
    skipped: 'Skipped rows',
    openOperationsDate: 'End-of-day report',
    homepage: 'Homepage editor',
    orders: 'orders',
  },
  ar: {
    eyebrow: 'الإدارة',
    title: 'مركز رفع الإكسل',
    subtitle: 'ارفع ملف الزامل، راجع جودة البيانات، ثم زامن الصفوف الصالحة مع نظام العمليات.',
    uploaderEyebrow: 'رافع الإكسل',
    uploaderTitle: 'غرفة رفع الإكسل',
    uploaderSubtitle: 'هذه المساحة مخصصة فقط لاستقبال ملف الإكسل والتحقق منه ثم إرسال الطلبات المتزامنة إلى الإدارة ومدير العمليات والفنيين المعيّنين.',
    sourceFile: 'ملف المصدر',
    upload: 'رفع ملف إكسل',
    uploading: 'جارٍ الرفع...',
    import: 'استيراد المعاينة',
    importing: 'جارٍ الاستيراد...',
    importProgress: ({ processed, total, currentChunk, totalChunks }) =>
      `جارٍ الاستيراد على دفعات: ${processed}/${total} صف، الدفعة ${currentChunk}/${totalChunks}.`,
    readyToast: (valid, invalid, deduplicated) =>
      `تمت قراءة ملف الإكسل. ${valid} صف صالح${invalid ? ` و${invalid} يحتاج مراجعة` : ''}${deduplicated ? ` مع دمج ${deduplicated} صف مكرر` : ''}.`,
    importToast: ({ imported, created, updated, archived, restored, unchanged, skipped }) =>
      `اكتملت مزامنة الإكسل. تمت معالجة ${imported}: إنشاء ${created}، تحديث ${updated}، أرشفة ${archived}، استعادة ${restored}${unchanged ? `، بدون تغيير ${unchanged}` : ''}${skipped ? `، وتجاوز ${skipped}` : ''}.`,
    uploadFirst: 'ارفع ملف الإكسل أولاً.',
    validRows: 'صف صالح',
    reviewRows: 'بحاجة مراجعة',
    devices: 'الأجهزة',
    followUp: 'تحتاج متابعة',
    assigned: 'معيّن لفني',
    reviewAssignments: 'مراجعة التعيين',
    overdue: 'متابعة متأخرة',
    withinSla: 'ضمن المدة',
    exceedSla: 'متجاوزة للمدة',
    statusBreakdown: 'تحليل الحالات',
    cityBreakdown: 'تحليل المدن',
    technicianBreakdown: 'أكواد الفنيين',
    noPreview: 'ارفع أحدث ملف إكسل لعرض التحليل قبل الاستيراد.',
    rulesTitle: 'منطق الاستيراد',
    rulesHint: 'حساب الإدارة مسؤول عن مصدر البيانات: الرفع، التحقق، دمج المكرر، والمزامنة. بعدها يعمل مدير العمليات على لوحة مهام نظيفة.',
    uploaderRulesHint: 'هذا الحساب لا يصل إلى بقية النظام. مهمته الوحيدة رفع ملف الإكسل، التحقق من البيانات، ثم تسليم الطلبات المتزامنة لفرق العمل الداخلية.',
    ruleOne: 'تتم مطابقة الصفوف حسب SO ID قدر الإمكان حتى يتم تحديث الطلب بدل تكراره.',
    ruleTwo: 'الطلبات المكتملة تُؤرشف تلقائيًا، والطلبات النشطة المتغيرة تُستعاد أو تُحدّث.',
    ruleThree: 'الصفوف غير الصالحة تبقى للمراجعة ولا تُستورد حتى يتم تصحيح ملف الإكسل.',
    deliveryHint: 'بعد المزامنة تُرسل الطلبات الجديدة إلى الإدارة ومدير العمليات والفني المرتبط بكود الإكسل إن وجد.',
    lastSync: 'آخر مزامنة',
    skipped: 'صفوف متجاوزة',
    openOperationsDate: 'تقرير نهاية اليوم',
    homepage: 'إدارة الصفحة الرئيسية',
    orders: 'طلبات',
  },
};

const formatExcelIssueLine = (issue, lang) => {
  const rowLabel = lang === 'ar' ? 'الصف' : 'Row';
  const fieldLabel = lang === 'ar' ? 'الحقل' : 'Field';
  const parts = [`${rowLabel} ${issue?.rowNumber || '-'}`];
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
  return remaining
    ? `${visible.join('\n')}\n${lang === 'ar' ? `و${remaining} صفوف أخرى بها مشاكل` : `and ${remaining} more rows with issues`}`
    : visible.join('\n');
};

const buildImportPayload = (data = {}) => ({
  imported: Number(data?.importedCount) || 0,
  created: Number(data?.createdCount) || 0,
  updated: Number(data?.updatedCount) || 0,
  archived: Number(data?.archivedCount) || 0,
  restored: Number(data?.restoredCount) || 0,
  unchanged: Number(data?.unchangedCount) || 0,
  skipped: Number(data?.skippedCount) || 0,
});

export default function AdminExcelWorkspace({ workspaceMode = 'admin' }) {
  const { user } = useAuth();
  const { lang, isRTL } = useLang();
  const t = copy[lang] || copy.en;
  const isUploaderWorkspace = workspaceMode === 'excel_uploader';
  const uploadInputRef = useRef(null);
  const [fileName, setFileName] = useState('data.xlsx');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [importReport, setImportReport] = useState(null);

  const analytics = preview?.analytics || null;
  const installationSummary = preview?.installationSummary || null;
  const summary = preview?.summary || {};
  const validRows = Number(summary.validOrders || 0);
  const invalidRows = Number(preview?.invalidRows?.length || summary.invalidRows || 0);
  const topStatuses = useMemo(() => (analytics?.statusBreakdown || []).slice(0, 6), [analytics]);
  const topCities = useMemo(() => (analytics?.cityBreakdown || []).slice(0, 6), [analytics]);
  const topTechnicians = useMemo(() => (analytics?.technicianBreakdown || []).slice(0, 6), [analytics]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const response = await operationsService.uploadExcelSource(file);
      const nextPreview = response.data?.preview || null;
      const nextFileName = response.data?.savedFileName || response.data?.fileName || file.name || 'data.xlsx';
      setFileName(nextFileName);
      setPreview(nextPreview);
      setImportReport(null);
      setImportProgress(null);
      toast.success(
        t.readyToast(
          Number(nextPreview?.summary?.validOrders || 0),
          Number(nextPreview?.summary?.invalidRows || nextPreview?.invalidRows?.length || 0),
          Number(nextPreview?.summary?.deduplicatedRows || 0)
        )
      );
      if (Array.isArray(nextPreview?.invalidRows) && nextPreview.invalidRows.length) {
        toast.error(buildExcelIssuesToast(nextPreview.invalidRows, lang), { duration: 7000 });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || (lang === 'ar' ? 'تعذر رفع ملف الإكسل.' : 'Unable to upload Excel.'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!preview) {
      toast.error(t.uploadFirst);
      return;
    }

    try {
      setImporting(true);
      setImportProgress(null);
      const response = await operationsService.importOrdersFromExcel(fileName, preview, {
        chunkSize: 30,
        interChunkDelayMs: 120,
        maxRetries: 2,
        onProgress: (progress) => setImportProgress(progress),
      });
      setImportReport(response.data || null);
      setPreview(null);
      toast.success(t.importToast(buildImportPayload(response.data || {})));
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || (lang === 'ar' ? 'تعذر استيراد ملف الإكسل.' : 'Unable to import Excel.'));
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  };

  const metricCards = [
    { key: 'valid', label: t.validRows, value: validRows },
    { key: 'invalid', label: t.reviewRows, value: invalidRows },
    { key: 'devices', label: t.devices, value: Number(installationSummary?.totalDevices || analytics?.totals?.totalDevices || 0) },
    { key: 'follow-up', label: t.followUp, value: Number(installationSummary?.followUpOrders || analytics?.totals?.followUpOrders || 0) },
    { key: 'assigned', label: t.assigned, value: Number(installationSummary?.assignedTechOrders || analytics?.totals?.assignedTechOrders || 0) },
    { key: 'review', label: t.reviewAssignments, value: Number(installationSummary?.needsReviewOrders || analytics?.totals?.needsReviewOrders || 0) },
    { key: 'overdue', label: t.overdue, value: Number(analytics?.totals?.overdueFollowUpOrders || 0) },
    { key: 'within', label: t.withinSla, value: Number(installationSummary?.withinSLAOrders || analytics?.totals?.withinSLAOrders || 0) },
    { key: 'exceed', label: t.exceedSla, value: Number(installationSummary?.exceedSLAOrders || analytics?.totals?.exceedSLAOrders || 0) },
  ];

  return (
    <section className="page-shell admin-excel-shell" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="section-heading">
        <p className="eyebrow">{isUploaderWorkspace ? t.uploaderEyebrow : t.eyebrow}</p>
        <h1>{isUploaderWorkspace ? t.uploaderTitle : t.title}</h1>
        <p className="section-subtitle">{isUploaderWorkspace ? t.uploaderSubtitle : t.subtitle}</p>
      </div>

      <section className="panel admin-excel-control-panel">
        <div className="panel-header">
          <div>
            <h2>{t.sourceFile}</h2>
            <p>{fileName} - {user?.email || ''}</p>
          </div>
          <div className="helper-actions">
            <input accept=".xlsx,.xls" hidden onChange={handleUpload} ref={uploadInputRef} type="file" />
            {canUploadExcelSource ? (
              <button className="btn-light" disabled={uploading || importing} onClick={() => uploadInputRef.current?.click()} type="button">
                {uploading ? t.uploading : t.upload}
              </button>
            ) : null}
            <button className="btn-primary" disabled={!preview || importing || uploading} onClick={handleImport} type="button">
              {importing ? t.importing : t.import}
            </button>
          </div>
        </div>

        {importing && importProgress ? (
          <p className="muted">
            {t.importProgress({
              processed: Number(importProgress.processedRows) || 0,
              total: Number(importProgress.totalRows) || 0,
              currentChunk: Number(importProgress.currentChunk) || 0,
              totalChunks: Number(importProgress.totalChunks) || 0,
            })}
          </p>
        ) : null}

        <p className="muted">{t.deliveryHint}</p>

        <div className="ops-excel-summary admin-excel-summary-grid">
          {metricCards.map((item) => (
            <div key={item.key}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="admin-excel-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{t.rulesTitle}</h2>
              <p>{isUploaderWorkspace ? t.uploaderRulesHint : t.rulesHint}</p>
            </div>
          </div>
          <div className="order-reference-panel">
            {[t.ruleOne, t.ruleTwo, t.ruleThree].map((rule, index) => (
              <div className="reference-card" key={rule}>
                <span className="reference-label">{index + 1}</span>
                <p>{rule}</p>
              </div>
            ))}
          </div>
          {!isUploaderWorkspace ? (
            <div className="helper-actions">
              <Link className="btn-light" to="/admin/operations-date">{t.openOperationsDate}</Link>
              <Link className="btn-light" to="/admin/homepage">{t.homepage}</Link>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{t.statusBreakdown}</h2>
              <p>{preview ? fileName : t.noPreview}</p>
            </div>
          </div>
          {analytics ? (
            <div className="analytics-city-table">
              {topStatuses.map((item) => (
                <article className="analytics-city-row" key={`status-${item.key}`}>
                  <div>
                    <strong>{item.status || item.key}</strong>
                    <small>{item.followUpCount || 0} {t.followUp}</small>
                  </div>
                  <div className="analytics-city-numbers">
                    <span>{item.count || 0} {t.orders}</span>
                    <small>{item.devices || 0} {t.devices}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">{t.noPreview}</p>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{t.cityBreakdown}</h2>
              <p>{fileName}</p>
            </div>
          </div>
          {analytics ? (
            <div className="analytics-city-table">
              {topCities.map((item) => (
                <article className="analytics-city-row" key={`city-${item.key}`}>
                  <div>
                    <strong>{item.city || item.key}</strong>
                    <small>{item.followUpCount || 0} {t.followUp}</small>
                  </div>
                  <div className="analytics-city-numbers">
                    <span>{item.count || 0} {t.orders}</span>
                    <small>{item.devices || 0} {t.devices}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">{t.noPreview}</p>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{t.technicianBreakdown}</h2>
              <p>{fileName}</p>
            </div>
          </div>
          {analytics ? (
            <div className="ops-team-list">
              {topTechnicians.map((item) => (
                <article className="ops-team-card" key={`tech-${item.key}`}>
                  <div>
                    <strong>{item.techId || (lang === 'ar' ? 'غير معيّن' : 'Unassigned')}</strong>
                    <p>{[item.areaName, item.techShortName].filter(Boolean).join(' - ') || '-'}</p>
                    <small>{[item.areaCode, item.techCode].filter(Boolean).join(' - ')}</small>
                  </div>
                  <div className="analytics-city-numbers">
                    <span>{item.count || 0} {t.orders}</span>
                    <small>{item.devices || 0} {t.devices}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">{t.noPreview}</p>
          )}
        </section>
      </div>

      {importReport ? (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{t.lastSync}</h2>
              <p>{t.importToast(buildImportPayload(importReport))}</p>
            </div>
          </div>
          {Array.isArray(importReport.skippedOrders) && importReport.skippedOrders.length ? (
            <div className="coverage-list">
              <strong>{t.skipped}</strong>
              {importReport.skippedOrders.slice(0, 5).map((issue, index) => (
                <p key={`skipped-${index}`}>{formatExcelIssueLine(issue, lang)}</p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
