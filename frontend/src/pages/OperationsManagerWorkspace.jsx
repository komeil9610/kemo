import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl, formatSaudiPhoneDisplay, operationsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { exportOrdersReport, getOperationalDate, getOrderDeviceCount, getOrderDisplayStatus, getOrderPrimaryReference, orderMatchesDailyTaskDate, nextDateString } from '../utils/internalOrders';
import { doesTechnicianCoverCity, getTechnicianCoverageLabels, technicianCoverageOptions } from '../utils/technicianCoverage';
import { canUserManageOperationsTeams, canUserPrintTaskReports } from '../utils/workspaceAccess';

const technicianStatusOptions = [
  { value: 'available', ar: 'متاح', en: 'Available' },
  { value: 'busy', ar: 'مشغول', en: 'Busy' },
];

const taskSort = (left, right) =>
  `${left.city || ''} ${left.district || ''} ${left.scheduledTime || ''}`.localeCompare(
    `${right.city || ''} ${right.district || ''} ${right.scheduledTime || ''}`,
    'ar'
  );

const compareTasksForMobile = (left, right) => {
  const assignmentDiff = Number(Boolean(left.technicianId)) - Number(Boolean(right.technicianId));
  if (assignmentDiff !== 0) {
    return assignmentDiff;
  }
  const priorityDiff = Number(String(right.priority || '') === 'urgent') - Number(String(left.priority || '') === 'urgent');
  if (priorityDiff !== 0) {
    return priorityDiff;
  }
  return taskSort(left, right);
};

const createTeamForm = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  excelTechnicianCode: '',
  coverageKeys: ['riyadh'],
  notes: '',
  status: 'available',
});

const copy = {
  en: {
    eyebrow: 'Operations manager',
    title: 'Field operations workspace',
    subtitle: 'A focused page for today and tomorrow tasks, Excel sync, and assigning installation teams.',
    loading: 'Loading operations workspace...',
    refresh: 'Refresh',
    dailyPdf: 'Print today PDF',
    dailyExcel: 'Export today Excel',
    today: 'Today tasks',
    tomorrow: 'Tomorrow tasks',
    excelTitle: 'Excel sync',
    excelHint: 'Upload the refreshed Excel file, preview the rows, then import only the validated orders from the admin or operations manager account.',
    excelAccessNote: 'Admin and operations manager accounts can upload and import the latest Zamil Excel file for all days and incoming requests.',
    uploadExcel: 'Upload Excel',
    uploadingExcel: 'Uploading...',
    importExcel: 'Import preview',
    importingExcel: 'Importing...',
    importingExcelProgress: ({ processed, total, currentChunk, totalChunks }) =>
      `Importing in batches: ${processed}/${total} rows, batch ${currentChunk}/${totalChunks}.`,
    excelValidRows: 'Valid rows',
    excelNeedReview: 'Need review',
    excelTotalDevices: 'Devices in file',
    excelFollowUp: 'Need follow-up',
    excelAssignedTech: 'Assigned tech',
    excelNeedsAssignmentReview: 'Assignment review',
    excelOverdueFollowUp: 'Overdue follow-up',
    excelWithinSla: 'Within SLA',
    excelExceedSla: 'Exceed SLA',
    excelTopStatuses: 'Top statuses',
    excelTopCities: 'Top cities',
    excelTopTechnicians: 'Top technicians',
    excelNoAnalytics: 'Upload the latest Excel file to view detailed analytics.',
    excelOrdersLabel: 'orders',
    excelDevicesLabel: 'devices',
    teamsTitle: 'Installation teams',
    teamsHint: 'Track availability, define city coverage for each technician, and assign work directly from the board.',
    teamLoadTitle: 'Technician organization',
    teamLoadHint: 'See each technician coverage and current load before assigning new orders.',
    assignmentsTitle: 'Assignments',
    assignmentHint: 'Match each order with the right team and update statuses without leaving the page.',
    quickSections: 'Quick sections',
    createTeam: 'Create team member',
    creatingTeam: 'Creating...',
    saveTeam: 'Save team changes',
    editingTeam: 'Editing team member',
    editTeam: 'Edit',
    deleteTeam: 'Delete',
    deletingTeam: 'Deleting...',
    cancelEdit: 'Cancel edit',
    assignLabel: 'Assigned team',
    unassigned: 'Unassigned',
    updateStatus: 'Update status',
    noTasks: 'No tasks in this list yet.',
    noTeams: 'No teams created yet.',
    devices: 'Devices',
    map: 'Map',
    city: 'City',
    district: 'District',
    preferredSlot: 'Preferred slot',
    scheduledSlot: 'Scheduled slot',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    call: 'Call',
    availableTeams: 'Available teams',
    busyTeams: 'Busy teams',
    unassignedOrders: 'Unassigned orders',
    remainingToday: 'Remaining today',
    tomorrowDevices: 'Tomorrow devices',
    todayUnassigned: 'Today unassigned',
    teamTodayLoad: 'Today load',
    teamTomorrowLoad: 'Tomorrow load',
    teamTotalLoad: 'Active load',
    teamTodayDevices: 'Today devices',
    teamTomorrowDevices: 'Tomorrow devices',
    jumpToday: 'Today board',
    jumpTomorrow: 'Tomorrow board',
    jumpTeams: 'Teams',
    jumpExcel: 'Excel',
    previewReady: (valid, invalid) => `${valid} valid rows ready${invalid ? `, ${invalid} need review` : ''}.`,
    assignmentSaved: 'Assignment updated.',
    statusSaved: 'Status updated.',
    availabilitySaved: 'Team availability updated.',
    teamCreated: 'Team member created.',
    teamUpdated: 'Team member updated.',
    teamDeleted: 'Team member deleted.',
    deleteConfirm: 'Delete this technician account?',
    coverageLabel: 'City coverage',
    coverageHelp: 'Choose one or more cities/regions this technician can cover.',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    excelTechnicianCode: 'Excel technician code',
    passwordEditHint: 'Leave blank to keep the current password.',
    excelTechnicianCodeHint: 'Use the technician shortcut from Excel, such as M, G, S, or the full code like J-W when needed.',
    notes: 'Team notes',
    availability: 'Availability',
    coveredCities: 'Covered cities',
    noMatchingTechnician: 'No technician currently covers this city.',
    assignmentOutsideCoverage: 'This technician does not cover the order city.',
    assignmentCoverageHint: 'Only technicians covering the order city are shown.',
    filterCoverage: 'Filter by coverage',
    allCoverage: 'All coverage',
  },
  ar: {
    eyebrow: 'مدير العمليات',
    title: 'واجهة التشغيل الميداني',
    subtitle: 'صفحة مركزة لمهام اليوم والغد، مزامنة الإكسل، وتعيين فرق التركيب على الطلبات.',
    loading: 'جارٍ تحميل واجهة مدير العمليات...',
    refresh: 'تحديث',
    dailyPdf: 'طباعة تقرير اليوم PDF',
    dailyExcel: 'تصدير تقرير اليوم إكسل',
    today: 'مهام اليوم',
    tomorrow: 'مهام الغد',
    excelTitle: 'مزامنة الإكسل',
    excelHint: 'ارفع ملف الإكسل المحدّث، راجع المعاينة، ثم استورد الطلبات الصالحة فقط من حساب الإدارة أو مدير العمليات.',
    excelAccessNote: 'تستطيع حسابات الإدارة ومدير العمليات رفع واستيراد آخر ملف إكسل من الزامل لكل الأيام وكل الطلبات الجديدة.',
    uploadExcel: 'رفع ملف إكسل',
    uploadingExcel: 'جارٍ الرفع...',
    importExcel: 'استيراد المعاينة',
    importingExcel: 'جارٍ الاستيراد...',
    importingExcelProgress: ({ processed, total, currentChunk, totalChunks }) =>
      `جارٍ الاستيراد على دفعات: ${processed}/${total} صف، الدفعة ${currentChunk}/${totalChunks}.`,
    excelValidRows: 'صف صالح',
    excelNeedReview: 'بحاجة مراجعة',
    excelTotalDevices: 'أجهزة الملف',
    excelFollowUp: 'تحتاج متابعة',
    excelAssignedTech: 'معيّن لفني',
    excelNeedsAssignmentReview: 'مراجعة تعيين',
    excelOverdueFollowUp: 'متابعة متأخرة',
    excelWithinSla: 'ضمن المدة',
    excelExceedSla: 'متجاوز للمدة',
    excelTopStatuses: 'أعلى الحالات',
    excelTopCities: 'أعلى المدن',
    excelTopTechnicians: 'أعلى الفنيين',
    excelNoAnalytics: 'ارفع أحدث ملف إكسل لعرض التحليل التفصيلي.',
    excelOrdersLabel: 'طلبات',
    excelDevicesLabel: 'أجهزة',
    teamsTitle: 'فرق التركيب',
    teamsHint: 'تابع حالة التوفر، حدّد تغطية المدن لكل فني، وعيّن الطلبات مباشرة من نفس الصفحة.',
    teamLoadTitle: 'تنظيم عمل الفنيين',
    teamLoadHint: 'اعرف تغطية كل فني وحمله الحالي قبل إسناد أي طلب جديد.',
    assignmentsTitle: 'تعيين الطلبات',
    assignmentHint: 'وزّع كل طلب على الفريق المناسب وحدّث الحالة بسرعة من نفس الواجهة.',
    quickSections: 'اختصارات سريعة',
    createTeam: 'إضافة عضو فريق',
    creatingTeam: 'جارٍ الإضافة...',
    saveTeam: 'حفظ التعديلات',
    editingTeam: 'تعديل بيانات الفني',
    editTeam: 'تعديل',
    deleteTeam: 'حذف',
    deletingTeam: 'جارٍ الحذف...',
    cancelEdit: 'إلغاء التعديل',
    assignLabel: 'الفريق المعيّن',
    unassigned: 'غير معيّن',
    updateStatus: 'تحديث الحالة',
    noTasks: 'لا توجد مهام في هذه القائمة حالياً.',
    noTeams: 'لا توجد فرق مضافة بعد.',
    devices: 'الأجهزة',
    map: 'الخريطة',
    city: 'المدينة',
    district: 'الحي',
    preferredSlot: 'الموعد المفضل',
    scheduledSlot: 'الموعد المنسق',
    contact: 'التواصل',
    whatsapp: 'واتساب',
    call: 'اتصال',
    availableTeams: 'فرق متاحة',
    busyTeams: 'فرق مشغولة',
    unassignedOrders: 'طلبات غير معيّنة',
    remainingToday: 'المتبقي اليوم',
    tomorrowDevices: 'أجهزة الغد',
    todayUnassigned: 'غير المعيّن اليوم',
    teamTodayLoad: 'مهام اليوم',
    teamTomorrowLoad: 'مهام الغد',
    teamTotalLoad: 'إجمالي الحمل',
    teamTodayDevices: 'أجهزة اليوم',
    teamTomorrowDevices: 'أجهزة الغد',
    jumpToday: 'لوحة اليوم',
    jumpTomorrow: 'لوحة الغد',
    jumpTeams: 'الفرق',
    jumpExcel: 'الإكسل',
    previewReady: (valid, invalid) => `المعاينة جاهزة. ${valid} صف صالح${invalid ? ` و${invalid} يحتاج مراجعة` : ''}.`,
    assignmentSaved: 'تم تحديث التعيين.',
    statusSaved: 'تم تحديث الحالة.',
    availabilitySaved: 'تم تحديث توفر الفريق.',
    teamCreated: 'تمت إضافة عضو الفريق.',
    teamUpdated: 'تم تحديث بيانات الفني.',
    teamDeleted: 'تم حذف الفني.',
    deleteConfirm: 'هل تريد حذف حساب هذا الفني؟',
    coverageLabel: 'تغطية المدن',
    coverageHelp: 'اختر مدينة أو أكثر، أو منطقة كاملة، بحسب تغطية الفني.',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'الجوال',
    password: 'كلمة المرور',
    excelTechnicianCode: 'كود الفني من الإكسل',
    passwordEditHint: 'اتركها فارغة إذا كنت لا تريد تغيير كلمة المرور الحالية.',
    excelTechnicianCodeHint: 'استخدم اختصار الفني الموجود في الإكسل مثل M أو G أو S، أو الكود الكامل مثل J-W عند الحاجة.',
    notes: 'ملاحظات الفريق',
    availability: 'التوفر',
    coveredCities: 'المدن المغطاة',
    noMatchingTechnician: 'لا يوجد فني يغطي هذه المدينة حاليًا.',
    assignmentOutsideCoverage: 'هذا الفني لا يغطي مدينة الطلب.',
    assignmentCoverageHint: 'تظهر فقط أسماء الفنيين الذين يغطون مدينة الطلب.',
    filterCoverage: 'تصفية حسب التغطية',
    allCoverage: 'كل التغطيات',
  },
};

export default function OperationsManagerWorkspace() {
  const { user } = useAuth();
  const { lang, isRTL } = useLang();
  const t = copy[lang] || copy.en;
  const canPrintReports = canUserPrintTaskReports(user);
  const canManageTeams = canUserManageOperationsTeams(user);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [printingFormat, setPrintingFormat] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [updatingTechnicianId, setUpdatingTechnicianId] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [deletingTechnicianId, setDeletingTechnicianId] = useState('');
  const [teamCoverageFilter, setTeamCoverageFilter] = useState('all');
  const [teamForm, setTeamForm] = useState(() => createTeamForm());
  const [editingTechnicianId, setEditingTechnicianId] = useState('');
  const operationalDate = getOperationalDate();
  const tomorrowDate = nextDateString(operationalDate);

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        const response = await operationsService.getDashboard();
        setDashboard(response.data || null);
      } catch (error) {
        if (!silent) {
          toast.error(
            error?.response?.data?.message ||
              error.message ||
              (lang === 'ar' ? 'تعذر تحميل واجهة مدير العمليات.' : 'Unable to load operations workspace')
          );
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };

    load();
    const onUpdate = () => load(true);
    window.addEventListener('operations-updated', onUpdate);
    window.addEventListener('operations-date-updated', onUpdate);
    return () => {
      window.removeEventListener('operations-updated', onUpdate);
      window.removeEventListener('operations-date-updated', onUpdate);
    };
  }, [lang]);

  const orders = useMemo(() => dashboard?.orders || [], [dashboard]);
  const technicians = useMemo(() => dashboard?.technicians || [], [dashboard]);
  const todayOrders = useMemo(
    () =>
      orders
        .filter((order) => orderMatchesDailyTaskDate(order, operationalDate) && !['completed', 'canceled'].includes(order.status))
        .slice()
        .sort(compareTasksForMobile),
    [operationalDate, orders]
  );
  const tomorrowOrders = useMemo(
    () =>
      orders
        .filter((order) => orderMatchesDailyTaskDate(order, tomorrowDate) && !['completed', 'canceled'].includes(order.status))
        .slice()
        .sort(compareTasksForMobile),
    [orders, tomorrowDate]
  );
  const todayDevices = useMemo(() => todayOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0), [todayOrders]);
  const tomorrowDevices = useMemo(() => tomorrowOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0), [tomorrowOrders]);
  const availableTeams = useMemo(() => technicians.filter((item) => item.status === 'available').length, [technicians]);
  const busyTeams = useMemo(() => technicians.filter((item) => item.status === 'busy').length, [technicians]);
  const unassignedOrders = useMemo(
    () => [...todayOrders, ...tomorrowOrders].filter((order) => !order.technicianId).length,
    [todayOrders, tomorrowOrders]
  );
  const todayUnassignedCount = useMemo(() => todayOrders.filter((order) => !order.technicianId).length, [todayOrders]);
  const technicianWorkloads = useMemo(
    () =>
      technicians
        .map((technician) => {
          const technicianTodayOrders = todayOrders.filter((order) => String(order.technicianId || '') === String(technician.id));
          const technicianTomorrowOrders = tomorrowOrders.filter((order) => String(order.technicianId || '') === String(technician.id));
          const activeAssignedOrders = orders.filter(
            (order) => String(order.technicianId || '') === String(technician.id) && !['completed', 'canceled'].includes(order.status)
          );

          return {
            ...technician,
            todayOrdersCount: technicianTodayOrders.length,
            tomorrowOrdersCount: technicianTomorrowOrders.length,
            activeOrdersCount: activeAssignedOrders.length,
            todayDevicesCount: technicianTodayOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0),
            tomorrowDevicesCount: technicianTomorrowOrders.reduce((sum, order) => sum + getOrderDeviceCount(order), 0),
          };
        })
        .sort(
          (left, right) =>
            right.todayOrdersCount - left.todayOrdersCount ||
            right.tomorrowOrdersCount - left.tomorrowOrdersCount ||
            right.activeOrdersCount - left.activeOrdersCount ||
            String(left.name || '').localeCompare(String(right.name || ''), 'ar')
        ),
    [orders, technicians, todayOrders, tomorrowOrders]
  );
  const filteredTechnicianWorkloads = useMemo(
    () =>
      teamCoverageFilter === 'all'
        ? technicianWorkloads
        : technicianWorkloads.filter((technician) =>
            doesTechnicianCoverCity(technician.coverageKeys || technician.zone, teamCoverageFilter)
          ),
    [teamCoverageFilter, technicianWorkloads]
  );

  const replaceOrder = (updatedOrder) => {
    if (!updatedOrder?.id) {
      return;
    }
    setDashboard((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        orders: (current.orders || []).map((order) => (String(order.id) === String(updatedOrder.id) ? updatedOrder : order)),
      };
    });
  };

  const replaceTechnician = (technician) => {
    if (!technician?.id) {
      return;
    }
    setDashboard((current) => {
      if (!current) {
        return current;
      }
      const exists = (current.technicians || []).some((item) => String(item.id) === String(technician.id));
      return {
        ...current,
        technicians: exists
          ? (current.technicians || []).map((item) => (String(item.id) === String(technician.id) ? technician : item))
          : [...(current.technicians || []), technician],
      };
    });
  };

  const removeTechnician = (technicianId) => {
    setDashboard((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        technicians: (current.technicians || []).filter((item) => String(item.id) !== String(technicianId)),
      };
    });
  };

  const handleAssignOrder = async (orderId, technicianId) => {
    const order = orders.find((item) => String(item.id) === String(orderId));
    const technician = technicians.find((item) => String(item.id) === String(technicianId));
    if (technicianId && order && technician && !doesTechnicianCoverCity(technician.coverageKeys || technician.zone, order.city)) {
      toast.error(t.assignmentOutsideCoverage);
      return;
    }
    try {
      setUpdatingOrderId(String(orderId));
      const response = await operationsService.updateOrder(orderId, { technicianId: technicianId || null });
      replaceOrder(response.data?.order);
      toast.success(t.assignmentSaved);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || (lang === 'ar' ? 'تعذر تحديث التعيين.' : 'Unable to update assignment'));
    } finally {
      setUpdatingOrderId('');
    }
  };

  const handleQuickStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(String(orderId));
      const response = await operationsService.updateOrderStatus(orderId, status);
      replaceOrder(response.data?.order);
      toast.success(t.statusSaved);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || (lang === 'ar' ? 'تعذر تحديث الحالة.' : 'Unable to update status'));
    } finally {
      setUpdatingOrderId('');
    }
  };

  const handleAvailability = async (technicianId, status) => {
    try {
      setUpdatingTechnicianId(String(technicianId));
      const response = await operationsService.updateTechnicianAvailability(technicianId, status);
      replaceTechnician(response.data?.technician);
      toast.success(t.availabilitySaved);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || (lang === 'ar' ? 'تعذر تحديث حالة التوفر.' : 'Unable to update availability'));
    } finally {
      setUpdatingTechnicianId('');
    }
  };

  const handleCreateTeam = async (event) => {
    event.preventDefault();
    try {
      setCreatingTeam(true);
      const response = editingTechnicianId
        ? await operationsService.updateTechnician(editingTechnicianId, teamForm)
        : await operationsService.createTechnician(teamForm);
      replaceTechnician(response.data?.technician);
      setTeamForm(createTeamForm());
      setEditingTechnicianId('');
      toast.success(editingTechnicianId ? t.teamUpdated : t.teamCreated);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          (lang === 'ar' ? 'تعذر حفظ بيانات الفني.' : 'Unable to save technician data')
      );
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleDeleteTechnician = async (technicianId) => {
    if (!window.confirm(t.deleteConfirm)) {
      return;
    }
    try {
      setDeletingTechnicianId(String(technicianId));
      await operationsService.deleteTechnician(technicianId);
      removeTechnician(technicianId);
      if (String(editingTechnicianId) === String(technicianId)) {
        setEditingTechnicianId('');
        setTeamForm(createTeamForm());
      }
      toast.success(t.teamDeleted);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || (lang === 'ar' ? 'تعذر حذف الفني.' : 'Unable to delete technician'));
    } finally {
      setDeletingTechnicianId('');
    }
  };

  const startEditingTechnician = (technician) => {
    const nameParts = String(technician?.name || '').trim().split(/\s+/);
    setEditingTechnicianId(String(technician?.id || ''));
    setTeamForm({
      firstName: nameParts.slice(0, -1).join(' ') || nameParts[0] || '',
      lastName: nameParts.slice(-1).join(' ') || '',
      email: technician?.email || '',
      phone: technician?.phone || '',
      password: '',
      excelTechnicianCode: technician?.excelTechnicianCode || '',
      coverageKeys: technician?.coverageKeys?.length ? technician.coverageKeys : [technician?.zone || 'central'],
      notes: technician?.notes || '',
      status: technician?.status || 'available',
    });
  };

  const handleDailyPrint = async (format) => {
    try {
      setPrintingFormat(format);
      await exportOrdersReport({
        orders: todayOrders,
        lang,
        scopeLabel: 'operations-manager-daily',
        fileDate: operationalDate,
        format,
        reportTitle: lang === 'ar' ? 'تقرير مهام مدير العمليات' : 'Operations manager daily report',
      });
    } catch (error) {
      toast.error(error?.message || (lang === 'ar' ? 'تعذر تصدير تقرير اليوم.' : 'Unable to export daily report.'));
    } finally {
      setPrintingFormat('');
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

  const renderTaskCard = (order) => {
    const eligibleTechnicians = technicians.filter((technician) =>
      doesTechnicianCoverCity(technician.coverageKeys || technician.zone, order.city)
    );
    const assignedTechnician = technicians.find((technician) => String(technician.id) === String(order.technicianId || ''));
    const assignedOutsideCoverage =
      assignedTechnician && !doesTechnicianCoverCity(assignedTechnician.coverageKeys || assignedTechnician.zone, order.city);

    return (
      <article className={`ops-task-card${order.technicianId ? '' : ' is-unassigned'}${order.priority === 'urgent' ? ' is-urgent' : ''}`} key={order.id}>
        <div className="ops-task-card-top">
          <div>
            <strong>{getOrderPrimaryReference(order)}</strong>
            <p>{order.customerName}</p>
          </div>
          <span className={`status-pill status-${order.status}`}>{getOrderDisplayStatus(order, lang)}</span>
        </div>

        <div className="ops-task-meta-grid">
          <span>{t.city}: {order.city || '—'}</span>
          <span>{t.district}: {order.district || '—'}</span>
          <span>{t.devices}: {getOrderDeviceCount(order)}</span>
          <span>{t.preferredSlot}: {[order.preferredDate, order.preferredTime].filter(Boolean).join(' - ') || '—'}</span>
          <span>{t.scheduledSlot}: {[order.scheduledDate, order.scheduledTime].filter(Boolean).join(' - ') || '—'}</span>
          <span>{t.assignLabel}: {order.technicianName || t.unassigned}</span>
        </div>

        <div className="ops-task-actions">
          <select
            className="input"
            disabled={updatingOrderId === String(order.id)}
            value={order.technicianId || ''}
            onChange={(event) => handleAssignOrder(order.id, event.target.value)}
          >
            <option value="">{t.unassigned}</option>
            {eligibleTechnicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name} - {getTechnicianCoverageLabels(technician.coverageKeys || technician.zone, lang).join('، ')}
              </option>
            ))}
          </select>
          <p className="muted ops-coverage-hint">
            {eligibleTechnicians.length ? t.assignmentCoverageHint : t.noMatchingTechnician}
          </p>
          {assignedOutsideCoverage ? <p className="ops-coverage-warning">{t.assignmentOutsideCoverage}</p> : null}

          <div className="ops-task-buttons">
            <button className="btn-light" disabled={updatingOrderId === String(order.id)} type="button" onClick={() => handleQuickStatus(order.id, 'scheduled')}>
              {lang === 'ar' ? 'تمت الجدولة' : 'Scheduled'}
            </button>
            <button className="btn-light" disabled={updatingOrderId === String(order.id)} type="button" onClick={() => handleQuickStatus(order.id, 'in_transit')}>
              {lang === 'ar' ? 'في الطريق' : 'In transit'}
            </button>
            <button className="btn-secondary" disabled={updatingOrderId === String(order.id)} type="button" onClick={() => handleQuickStatus(order.id, 'completed')}>
              {lang === 'ar' ? 'مكتمل' : 'Completed'}
            </button>
          </div>

          <div className="ops-task-contact">
            <a className="btn-light" href={`tel:${order.phone || ''}`}>{t.call}</a>
            <a className="btn-light" href={buildWhatsAppUrl(order.whatsappPhone || order.phone)} rel="noreferrer" target="_blank">{t.whatsapp}</a>
            {order.mapLink ? <a className="btn-light" href={order.mapLink} rel="noreferrer" target="_blank">{t.map}</a> : null}
            <span>{formatSaudiPhoneDisplay(order.phone)}</span>
          </div>
        </div>
      </article>
    );
  };

  const toggleCoverage = (coverageKey) => {
    setTeamForm((current) => {
      const currentKeys = Array.isArray(current.coverageKeys) ? current.coverageKeys : [];
      const exists = currentKeys.includes(coverageKey);
      const nextKeys = exists ? currentKeys.filter((item) => item !== coverageKey) : [...currentKeys, coverageKey];
      return {
        ...current,
        coverageKeys: nextKeys.length ? nextKeys : [coverageKey],
      };
    });
  };

  return (
    <section className="page-shell operations-manager-shell" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="section-heading">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="section-subtitle">{t.subtitle}</p>
      </div>

      <section className="panel ops-manager-hero-panel">
        <div className="panel-header">
          <div>
            <h2>{t.title}</h2>
            <p>{user?.email}</p>
          </div>
          <div className="helper-actions">
            <button className="btn-light" type="button" onClick={() => window.dispatchEvent(new CustomEvent('operations-updated'))}>
              {t.refresh}
            </button>
            {canPrintReports ? (
              <>
                <button className="btn-light" disabled={Boolean(printingFormat)} type="button" onClick={() => handleDailyPrint('excel')}>
                  {printingFormat === 'excel' ? '...' : t.dailyExcel}
                </button>
                <button className="btn-primary" disabled={Boolean(printingFormat)} type="button" onClick={() => handleDailyPrint('pdf')}>
                  {printingFormat === 'pdf' ? '...' : t.dailyPdf}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="ops-summary-grid">
          <article className="analytics-kpi-card">
            <span>{t.today}</span>
            <strong>{todayOrders.length}</strong>
          </article>
          <article className="analytics-kpi-card">
            <span>{t.remainingToday}</span>
            <strong>{todayOrders.length}</strong>
          </article>
          <article className="analytics-kpi-card">
            <span>{t.tomorrow}</span>
            <strong>{tomorrowOrders.length}</strong>
          </article>
          <article className="analytics-kpi-card">
            <span>{t.tomorrowDevices}</span>
            <strong>{tomorrowDevices}</strong>
          </article>
          <article className="analytics-kpi-card">
            <span>{t.availableTeams}</span>
            <strong>{availableTeams}</strong>
          </article>
          <article className="analytics-kpi-card">
            <span>{t.unassignedOrders}</span>
            <strong>{unassignedOrders}</strong>
          </article>
        </div>
      </section>

      <section className="panel ops-mobile-quick-panel">
        <div className="panel-header">
          <div>
            <h2>{t.quickSections}</h2>
            <p>{lang === 'ar' ? 'تنقل سريع بين أهم أقسام العمل على الجوال.' : 'Jump quickly between the most important mobile sections.'}</p>
          </div>
        </div>
        <div className="ops-quick-grid">
          <a className="ops-quick-card" href="#today-tasks">
            <strong>{todayOrders.length}</strong>
            <span>{t.jumpToday}</span>
          </a>
          <a className="ops-quick-card" href="#tomorrow-tasks">
            <strong>{tomorrowOrders.length}</strong>
            <span>{t.jumpTomorrow}</span>
          </a>
          <a className="ops-quick-card" href="#teams">
            <strong>{technicians.length}</strong>
            <span>{t.jumpTeams}</span>
          </a>
          <article className="ops-quick-card muted">
            <strong>{todayUnassignedCount}</strong>
            <span>{t.todayUnassigned}</span>
          </article>
          <article className="ops-quick-card muted">
            <strong>{availableTeams}</strong>
            <span>{t.availableTeams}</span>
          </article>
        </div>
      </section>

      <div className="ops-manager-grid">
        <section className="panel" id="assignments">
          <div className="panel-header">
            <div>
              <h2>{t.assignmentsTitle}</h2>
              <p>{t.assignmentHint}</p>
            </div>
            <span className="user-chip">{operationalDate}</span>
          </div>

          <div className="ops-task-columns">
            <div className="ops-task-column" id="today-tasks">
              <div className="ops-task-column-head">
                <h3>{t.today}</h3>
                <span>{todayDevices} {t.devices}</span>
              </div>
              {todayOrders.length ? todayOrders.map(renderTaskCard) : <p className="muted">{t.noTasks}</p>}
            </div>

            <div className="ops-task-column" id="tomorrow-tasks">
              <div className="ops-task-column-head">
                <h3>{t.tomorrow}</h3>
                <span>{tomorrowDevices} {t.devices}</span>
              </div>
              {tomorrowOrders.length ? tomorrowOrders.map(renderTaskCard) : <p className="muted">{t.noTasks}</p>}
            </div>
          </div>
        </section>

        <div className="ops-side-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>{t.teamsTitle}</h2>
                <p>{t.teamsHint}</p>
              </div>
              <span className="user-chip">{busyTeams} {t.busyTeams}</span>
            </div>

            <section className="ops-team-load-panel">
              <div className="panel-header">
                <div>
                  <h3>{t.teamLoadTitle}</h3>
                  <p>{t.teamLoadHint}</p>
                </div>
                <label className="ops-filter-select">
                  <span>{t.filterCoverage}</span>
                  <select className="input compact-input" value={teamCoverageFilter} onChange={(event) => setTeamCoverageFilter(event.target.value)}>
                    <option value="all">{t.allCoverage}</option>
                    {technicianCoverageOptions.map((item) => (
                      <option key={item.key} value={item.key}>
                        {lang === 'ar' ? item.ar : item.en}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="ops-team-list">
                {filteredTechnicianWorkloads.length ? (
                  filteredTechnicianWorkloads.map((technician) => (
                  <article className="ops-team-card" key={technician.id}>
                    <div>
                      <strong>{technician.name}</strong>
                      {technician.excelTechnicianCode ? <p>{t.excelTechnicianCode}: {technician.excelTechnicianCode}</p> : null}
                      <p>{t.coveredCities}</p>
                      <div className="ops-team-coverage-list">
                        {getTechnicianCoverageLabels(technician.coverageKeys || technician.zone, lang).map((label) => (
                          <span className="ops-team-coverage-chip" key={`${technician.id}-${label}`}>
                            {label}
                          </span>
                        ))}
                      </div>
                      <small>{technician.email || technician.phone}</small>
                    </div>
                    <div className="ops-team-card-actions">
                      <button className="btn-light" type="button" onClick={() => startEditingTechnician(technician)}>
                        {t.editTeam}
                      </button>
                      <button
                        className="btn-danger"
                        disabled={!canManageTeams || deletingTechnicianId === String(technician.id)}
                        type="button"
                        onClick={() => handleDeleteTechnician(technician.id)}
                      >
                        {deletingTechnicianId === String(technician.id) ? t.deletingTeam : t.deleteTeam}
                      </button>
                      <select
                        className="input"
                        disabled={!canManageTeams || updatingTechnicianId === String(technician.id)}
                        value={technician.status || 'available'}
                        onChange={(event) => handleAvailability(technician.id, event.target.value)}
                      >
                        {technicianStatusOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {lang === 'ar' ? item.ar : item.en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="ops-team-load-grid">
                      <div>
                        <span>{t.teamTodayLoad}</span>
                        <strong>{technician.todayOrdersCount}</strong>
                      </div>
                      <div>
                        <span>{t.teamTodayDevices}</span>
                        <strong>{technician.todayDevicesCount}</strong>
                      </div>
                      <div>
                        <span>{t.teamTomorrowLoad}</span>
                        <strong>{technician.tomorrowOrdersCount}</strong>
                      </div>
                      <div>
                        <span>{t.teamTomorrowDevices}</span>
                        <strong>{technician.tomorrowDevicesCount}</strong>
                      </div>
                      <div>
                        <span>{t.teamTotalLoad}</span>
                        <strong>{technician.activeOrdersCount}</strong>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <p className="muted">{t.noTeams}</p>
              )}
              </div>
            </section>

            {canManageTeams ? (
              <form className="ops-team-form" onSubmit={handleCreateTeam}>
                <div className="panel-header">
                  <h3>{editingTechnicianId ? t.editingTeam : t.createTeam}</h3>
                  {editingTechnicianId ? (
                    <button className="btn-light" type="button" onClick={() => {
                      setEditingTechnicianId('');
                      setTeamForm(createTeamForm());
                    }}>
                      {t.cancelEdit}
                    </button>
                  ) : null}
                </div>
                <div className="ops-team-form-grid">
                  <input className="input" placeholder={t.firstName} value={teamForm.firstName} onChange={(event) => setTeamForm((current) => ({ ...current, firstName: event.target.value }))} />
                  <input className="input" placeholder={t.lastName} value={teamForm.lastName} onChange={(event) => setTeamForm((current) => ({ ...current, lastName: event.target.value }))} />
                  <input className="input" placeholder={t.email} value={teamForm.email} onChange={(event) => setTeamForm((current) => ({ ...current, email: event.target.value }))} />
                  <input className="input" placeholder={t.phone} value={teamForm.phone} onChange={(event) => setTeamForm((current) => ({ ...current, phone: event.target.value }))} />
                  <input className="input" placeholder={t.password} value={teamForm.password} onChange={(event) => setTeamForm((current) => ({ ...current, password: event.target.value }))} />
                  <input className="input" placeholder={t.excelTechnicianCode} value={teamForm.excelTechnicianCode} onChange={(event) => setTeamForm((current) => ({ ...current, excelTechnicianCode: event.target.value.toUpperCase() }))} />
                  <select className="input" value={teamForm.status} onChange={(event) => setTeamForm((current) => ({ ...current, status: event.target.value }))}>
                    {technicianStatusOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {lang === 'ar' ? item.ar : item.en}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="muted">{t.excelTechnicianCodeHint}</p>
                <p className="muted">{editingTechnicianId ? t.passwordEditHint : t.coverageHelp}</p>
                <div className="ops-coverage-grid">
                  {technicianCoverageOptions.map((item) => {
                    const checked = (teamForm.coverageKeys || []).includes(item.key);
                    return (
                      <label className={`ops-coverage-option${checked ? ' active' : ''}`} key={item.key}>
                        <input
                          checked={checked}
                          onChange={() => toggleCoverage(item.key)}
                          type="checkbox"
                        />
                        <span>{lang === 'ar' ? item.ar : item.en}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="muted">{t.coverageHelp}</p>
                <textarea
                  className="input"
                  placeholder={t.notes}
                  rows="3"
                  value={teamForm.notes}
                  onChange={(event) => setTeamForm((current) => ({ ...current, notes: event.target.value }))}
                />
                <button className="btn-primary" disabled={creatingTeam} type="submit">
                  {creatingTeam ? t.creatingTeam : editingTechnicianId ? t.saveTeam : t.createTeam}
                </button>
              </form>
            ) : null}
          </section>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>{lang === 'ar' ? 'أوامر سريعة' : 'Quick links'}</h2>
            <p>{lang === 'ar' ? 'اختصارات لصفحات المهام المفصلة والتخطيط.' : 'Shortcuts to detailed planning pages.'}</p>
          </div>
          <div className="helper-actions">
            <Link className="btn-light" to="/operations-manager/daily">{t.today}</Link>
            <Link className="btn-light" to="/operations-manager/weekly">{lang === 'ar' ? 'الأسبوع' : 'Weekly'}</Link>
            <Link className="btn-light" to="/operations-manager/monthly">{lang === 'ar' ? 'الشهر' : 'Monthly'}</Link>
          </div>
        </div>
      </section>
    </section>
  );
}
