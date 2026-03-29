import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  buildEscalationSnapshot,
  compareOrdersByInternalArea,
  defaultAreaClusters,
  defaultTimeStandards,
  formatSaudiPhoneDisplay,
  getAreaClusterLabel,
  getTimeStandardLabel,
  operationsService,
  serviceCatalogItems,
} from '../services/api';

const todayString = () => new Date().toISOString().slice(0, 10);

const emptyOrderForm = {
  customerName: '',
  phone: '',
  district: '',
  city: 'Riyadh',
  address: '',
  acCount: 1,
  serviceCategory: 'split_installation',
  standardDurationMinutes: 120,
  workType: '',
  acType: '',
  scheduledDate: todayString(),
  scheduledTime: '09:00',
  technicianId: '',
  notes: '',
  source: 'zamil',
  serviceItems: [],
};

const emptyTechnicianForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  region: 'Riyadh Region',
  status: 'available',
  notes: '',
};

const regionOptions = [
  { value: 'Riyadh Region', ar: 'منطقة الرياض' },
  { value: 'Makkah Region', ar: 'منطقة مكة المكرمة' },
  { value: 'Madinah Region', ar: 'منطقة المدينة المنورة' },
  { value: 'Eastern Province', ar: 'المنطقة الشرقية' },
  { value: 'Qassim Region', ar: 'منطقة القصيم' },
  { value: 'Asir Region', ar: 'منطقة عسير' },
  { value: 'Tabuk Region', ar: 'منطقة تبوك' },
  { value: 'Hail Region', ar: 'منطقة حائل' },
  { value: 'Northern Borders', ar: 'الحدود الشمالية' },
  { value: 'Jazan Region', ar: 'منطقة جازان' },
  { value: 'Najran Region', ar: 'منطقة نجران' },
  { value: 'Al Bahah Region', ar: 'منطقة الباحة' },
  { value: 'Al Jawf Region', ar: 'منطقة الجوف' },
];

const serviceDescriptions = {
  en: {
    rubber_pads: 'Rubber pads for outdoor units',
    drain_pipes: 'Drain pipes',
    electric_socket: 'Power socket',
    electric_cable: 'Electrical cable with sleeve',
    copper_asian: 'Asian copper pipes',
    copper_american: 'American copper pipes',
    copper_welding: 'Copper welding',
    window_frame: 'Window AC wooden frame',
    split_removal: 'Old split unit removal',
    window_removal: 'Old window unit removal',
    bracket_u24: 'Wall bracket 12K-24K',
    bracket_gt24: 'Wall bracket above 24K',
    scaffold_one: 'One-floor scaffold',
    scaffold_two: 'Two-floor scaffold',
  },
  ar: {
    rubber_pads: 'قواعد مطاطية للوحدات الخارجية',
    drain_pipes: 'أنابيب تصريف المياه',
    electric_socket: 'مقبس كهربائي',
    electric_cable: 'كابل كهربائي مع غلاف',
    copper_asian: 'أنابيب نحاس آسيوي',
    copper_american: 'أنابيب نحاس أمريكي',
    copper_welding: 'لحام أنابيب نحاس',
    window_frame: 'إطار خشبي لمكيف الشباك',
    split_removal: 'إزالة مكيف سبليت قديم',
    window_removal: 'إزالة مكيف شباك قديم',
    bracket_u24: 'حامل جداري 12K-24K',
    bracket_gt24: 'حامل جداري أعلى من 24K',
    scaffold_one: 'سقالة دور واحد',
    scaffold_two: 'سقالة دورين',
  },
};

const copy = {
  en: {
    eyebrow: 'Operator dashboard',
    title: 'Operations dispatch room',
    subtitle:
      'Turn daily Zamil requests into live technician assignments, proof-of-work approvals, and billing exports.',
    loading: 'Loading the operations room...',
    stats: {
      incoming: 'Incoming requests',
      active: 'Active site jobs',
      proof: 'Pending proof review',
      approved: 'Approved jobs',
    },
    intakeTitle: 'Quick intake and bulk upload',
    intakeHint: 'Log single requests in seconds or import a daily spreadsheet batch before dispatching.',
    quickEntry: 'Quick add',
    bulkEntry: 'Excel import',
    customerName: 'Customer name',
    phone: 'Phone',
    district: 'District',
    city: 'City',
    address: 'Address details',
    acCount: 'AC count',
    workType: 'Work type',
    standardSetupTitle: 'Standard time setup',
    standardSetupHint: 'Define the expected minutes for each service so escalation and monthly efficiency stay consistent.',
    serviceCategory: 'Service category',
    standardMinutes: 'Standard minutes',
    saveStandards: 'Save standards',
    internalAreasTitle: 'Internal area zoning',
    internalAreasHint: 'Map neighboring districts into one internal zone so dispatch can cluster jobs without GPS or paid maps.',
    saveAreas: 'Save internal zones',
    addAreaRow: 'Add mapping row',
    areaCode: 'Zone code',
    areaLabel: 'Zone label',
    areaArabicLabel: 'Arabic zone label',
    sortOrder: 'Display order',
    efficiencyTitle: 'Monthly efficiency report',
    efficiencyHint: 'Compares started jobs against the configured standard times for the last 30 days.',
    fastestTech: 'Fastest technician',
    repeatedDelays: 'Repeated delays',
    topDelayedService: 'Most delayed service',
    onTimeRate: 'On-time rate',
    scheduledDate: 'Scheduled date',
    scheduledTime: 'Time slot',
    assignTechnician: 'Assign technician',
    notes: 'Notes',
    source: 'Request source',
    createOrder: 'Create task',
    creating: 'Creating...',
    orderCreated: 'Task created successfully.',
    bulkHint:
      'Upload a CSV exported from Excel or paste rows copied from Excel. Supported columns: customer, phone, district, city, AC count, work type, date, time, notes.',
    analyzeFile: 'Analyze rows',
    importRows: 'Create imported tasks',
    importing: 'Importing...',
    pasteTable: 'Paste table data',
    parsedRows: 'Ready rows',
    dispatchTitle: 'Dispatch board',
    dispatchHint: 'Drag a request into a technician lane to group work by area and reduce travel time.',
    orderManagementTitle: 'Submitted orders management',
    orderManagementHint: 'The system manager can reopen any submitted task details here and update the location, schedule, notes, or assignment after creation.',
    systemManagerBadge: 'System manager access',
    saveOrderEdit: 'Save order changes',
    incomingList: 'New requests',
    laneLabel: 'Today lane',
    unassigned: 'Unassigned',
    proofTitle: 'Proof of completion',
    proofHint: 'Review photos, confirm the client signature, then approve the job for billing.',
    approve: 'Approve proof',
    revoke: 'Reopen review',
    reviewer: 'Reviewed by',
    signature: 'Client signature name',
    approvedBadge: 'Approved',
    pendingBadge: 'Waiting review',
    noPhotos: 'No proof photos uploaded yet.',
    billingTitle: 'Billing and reports',
    billingHint: 'Collect only approved jobs, then export a client-ready summary for weekly or monthly claims.',
    weekly: 'Last 7 days',
    monthly: 'Last 30 days',
    exportCsv: 'Export Excel CSV',
    exportPdf: 'Print PDF',
    approvedJobs: 'Approved jobs',
    reportValue: 'Claim value',
    reportCount: 'Billable jobs',
    teamTitle: 'Technician roster',
    teamHint: 'Keep team availability visible beside dispatch.',
    addTechnician: 'Add technician',
    saveTechnician: 'Save technician',
    cancelEdit: 'Cancel',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    password: 'Password',
    region: 'Coverage region',
    status: 'Availability',
    available: 'Available',
    busy: 'Busy',
    quickMapTitle: 'Coverage snapshot',
    searchPlaceholder: 'Search orders, customers, districts, or technicians',
    noRows: 'No rows ready for import yet.',
    noIncoming: 'No waiting requests right now.',
    noCompleted: 'No completed jobs to review yet.',
    noApproved: 'No approved jobs in this period.',
    sourceOptions: {
      zamil: 'Zamil batch',
      manual: 'Manual intake',
      repeat: 'Repeat visit',
    },
    successTech: 'Technician saved successfully.',
    deletedTech: 'Technician deleted successfully.',
    edit: 'Edit',
    delete: 'Delete',
    statusOptions: {
      pending: 'Pending',
      en_route: 'En route',
      in_progress: 'In progress',
      completed: 'Completed',
      canceled: 'Canceled',
    },
    importSummary: 'Rows will create new pending tasks.',
    sampleTools: 'Sample data tools',
    resetSampleDataButton: 'Restore sample data',
    clearSampleDataButton: 'Delete sample data',
    dailyManagement: 'Daily management page',
  },
  ar: {
    eyebrow: 'لوحة تشغيل الشركة',
    title: 'غرفة توزيع وتشغيل الطلبات',
    subtitle:
      'حوّل طلبات الزامل اليومية إلى مهام فعلية للفنيين، ثم راجع الإثباتات واعتمد المستخلصات من شاشة واحدة.',
    loading: 'جارٍ تحميل غرفة العمليات...',
    stats: {
      incoming: 'طلبات جديدة',
      active: 'مهام ميدانية نشطة',
      proof: 'بانتظار اعتماد الإنجاز',
      approved: 'مهام معتمدة',
    },
    intakeTitle: 'الإدخال السريع والرفع الجماعي',
    intakeHint: 'أضف طلباً فردياً خلال ثوانٍ أو استورد دفعة يومية كاملة قبل بدء التوزيع.',
    quickEntry: 'إضافة سريعة',
    bulkEntry: 'استيراد Excel',
    customerName: 'اسم العميل',
    phone: 'رقم الجوال',
    district: 'الحي',
    city: 'المدينة',
    address: 'تفاصيل الموقع',
    acCount: 'عدد المكيفات',
    workType: 'نوع المهمة',
    standardSetupTitle: 'إعداد الوقت المعياري',
    standardSetupHint: 'حدد الدقائق المتوقعة لكل خدمة ليعمل التصعيد وتقرير الكفاءة الشهري بشكل صحيح.',
    serviceCategory: 'تصنيف الخدمة',
    standardMinutes: 'الدقائق المعيارية',
    saveStandards: 'حفظ المعايير',
    internalAreasTitle: 'الفرز المناطقي الداخلي',
    internalAreasHint: 'اربط الأحياء المتجاورة بمنطقة تشغيل واحدة حتى يجمّع النظام المهام بدون GPS أو خرائط مدفوعة.',
    saveAreas: 'حفظ المناطق الداخلية',
    addAreaRow: 'إضافة سطر منطقة',
    areaCode: 'رمز المنطقة',
    areaLabel: 'اسم المنطقة',
    areaArabicLabel: 'اسم المنطقة بالعربية',
    sortOrder: 'ترتيب الظهور',
    efficiencyTitle: 'تقرير الكفاءة الشهري',
    efficiencyHint: 'يقارن المهام التي بدأها الفني بالوقت المعياري المضبوط خلال آخر 30 يوماً.',
    fastestTech: 'أسرع فني',
    repeatedDelays: 'تأخيرات متكررة',
    topDelayedService: 'أكثر خدمة فيها تأخير',
    onTimeRate: 'نسبة الالتزام',
    scheduledDate: 'تاريخ التنفيذ',
    scheduledTime: 'الفترة الزمنية',
    assignTechnician: 'إسناد الفني',
    notes: 'ملاحظات',
    source: 'مصدر الطلب',
    createOrder: 'إنشاء المهمة',
    creating: 'جارٍ الإنشاء...',
    orderCreated: 'تم إنشاء المهمة بنجاح.',
    bulkHint:
      'ارفع ملف CSV محفوظ من Excel أو الصق الجدول مباشرة من Excel. الأعمدة المدعومة: العميل، الجوال، الحي، المدينة، عدد المكيفات، نوع المهمة، التاريخ، الوقت، الملاحظات.',
    analyzeFile: 'تحليل الصفوف',
    importRows: 'إنشاء المهام المستوردة',
    importing: 'جارٍ الاستيراد...',
    pasteTable: 'لصق الجدول',
    parsedRows: 'صفوف جاهزة',
    dispatchTitle: 'لوحة التوزيع',
    dispatchHint: 'اسحب الطلب إلى مسار الفني المناسب لتجميع أعمال الحي نفسه وتقليل الوقت والبنزين.',
    orderManagementTitle: 'إدارة الطلبات بعد الإرسال',
    orderManagementHint: 'يمكن لمدير النظام تعديل الموقع والموعد والملاحظات والإسناد لأي طلب بعد إنشائه من هنا.',
    systemManagerBadge: 'صلاحيات مدير النظام',
    saveOrderEdit: 'حفظ تعديلات الطلب',
    incomingList: 'الطلبات الجديدة',
    laneLabel: 'جدول اليوم',
    unassigned: 'غير مسند',
    proofTitle: 'إثبات الإنجاز',
    proofHint: 'راجع الصور، ثبّت اسم الموقّع، ثم اعتمد المهمة لتدخل تلقائياً في المستخلص.',
    approve: 'اعتماد الإنجاز',
    revoke: 'إعادة للمراجعة',
    reviewer: 'تمت المراجعة بواسطة',
    signature: 'اسم توقيع العميل',
    approvedBadge: 'معتمد',
    pendingBadge: 'بانتظار الاعتماد',
    noPhotos: 'لا توجد صور توثيق مرفوعة حتى الآن.',
    billingTitle: 'المستخلصات والتقارير',
    billingHint: 'جمّع المهام المعتمدة فقط ثم صدّر ملفاً جاهزاً للمطالبة الأسبوعية أو الشهرية.',
    weekly: 'آخر 7 أيام',
    monthly: 'آخر 30 يوماً',
    exportCsv: 'تصدير Excel CSV',
    exportPdf: 'طباعة PDF',
    approvedJobs: 'مهام معتمدة',
    reportValue: 'قيمة المستخلص',
    reportCount: 'عدد المهام المفوترة',
    teamTitle: 'طاقم الفنيين',
    teamHint: 'أبقِ التغطية وحالة التوفر ظاهرة بجانب لوحة التوزيع.',
    addTechnician: 'إضافة فني',
    saveTechnician: 'حفظ الفني',
    cancelEdit: 'إلغاء',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    region: 'منطقة التغطية',
    status: 'الحالة',
    available: 'متاح',
    busy: 'مشغول',
    quickMapTitle: 'ملخص التغطية',
    searchPlaceholder: 'ابحث في الطلبات أو العملاء أو الأحياء أو الفنيين',
    noRows: 'لا توجد صفوف جاهزة للاستيراد بعد.',
    noIncoming: 'لا توجد طلبات منتظرة حالياً.',
    noCompleted: 'لا توجد مهام مكتملة للمراجعة حالياً.',
    noApproved: 'لا توجد مهام معتمدة ضمن هذه الفترة.',
    sourceOptions: {
      zamil: 'دفعة الزامل',
      manual: 'إدخال يدوي',
      repeat: 'زيارة إعادة',
    },
    successTech: 'تم حفظ بيانات الفني بنجاح.',
    deletedTech: 'تم حذف الفني بنجاح.',
    edit: 'تعديل',
    delete: 'حذف',
    statusOptions: {
      pending: 'قيد الانتظار',
      en_route: 'في الطريق',
      in_progress: 'جاري التنفيذ',
      completed: 'مكتمل',
      canceled: 'ملغي',
    },
    importSummary: 'سيتم إنشاء مهام جديدة بحالة انتظار التوزيع.',
    sampleTools: 'أدوات البيانات الافتراضية',
    resetSampleDataButton: 'استعادة البيانات الافتراضية',
    clearSampleDataButton: 'حذف البيانات الافتراضية',
    dailyManagement: 'صفحة الإدارة اليومية',
  },
};

const getRegionLabel = (lang, value) => regionOptions.find((entry) => entry.value === value)?.[lang] || value;
const formatOrderNumber = (value) => String(value || '').replace(/^ORD-/, '');

const buildServiceItems = (lang, current = []) => {
  const currentMap = new Map((current || []).map((item) => [item.id, item]));
  return serviceCatalogItems.map((entry) => {
    const existing = currentMap.get(entry.id);
    return {
      id: entry.id,
      description: serviceDescriptions[lang]?.[entry.id] || serviceDescriptions.en[entry.id] || entry.id,
      price: entry.price,
      unit:
        lang === 'ar'
          ? entry.unit
              .replace('per set', 'لكل مجموعة')
              .replace('per meter', 'لكل متر')
              .replace('per piece', 'لكل قطعة')
              .replace('per frame', 'لكل إطار')
              .replace('per unit', 'لكل وحدة')
              .replace('per bracket', 'لكل حامل')
              .replace('fixed', 'ثابت')
          : entry.unit,
      selected: Boolean(existing),
      quantity: existing?.quantity || 1,
      totalPrice: existing?.totalPrice || entry.price,
    };
  });
};

const serviceTotal = (items = []) =>
  (items || []).reduce((sum, item) => sum + (Number(item.totalPrice || item.price * (item.quantity || 1)) || 0), 0);

const isRecentWithinDays = (value, days) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
};

const normalizeHeader = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const parseDelimitedLine = (line, delimiter) => {
  const cells = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const parseSpreadsheetText = (value) => {
  const rows = String(value || '')
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (!rows.length) {
    return [];
  }

  const delimiter = rows[0].includes('\t') ? '\t' : ',';
  const rawHeaders = parseDelimitedLine(rows[0], delimiter);
  const aliasMap = {
    customerName: ['customer', 'customer name', 'name', 'اسم العميل', 'العميل'],
    phone: ['phone', 'mobile', 'رقم الجوال', 'الجوال'],
    district: ['district', 'neighborhood', 'area', 'الحي', 'المنطقة'],
    city: ['city', 'المدينة'],
    address: ['address', 'location', 'العنوان', 'الموقع'],
    acCount: ['ac count', 'units', 'qty', 'quantity', 'عدد المكيفات', 'العدد'],
    workType: ['work type', 'job type', 'service', 'نوع المهمة', 'نوع الخدمة'],
    scheduledDate: ['scheduled date', 'date', 'التاريخ', 'الموعد'],
    scheduledTime: ['time', 'timeslot', 'scheduled time', 'الوقت', 'الفترة'],
    notes: ['notes', 'remark', 'ملاحظات'],
    technician: ['technician', 'الفني'],
  };

  const resolveField = (header) => {
    const normalized = normalizeHeader(header);
    return Object.entries(aliasMap).find(([, aliases]) => aliases.includes(normalized))?.[0] || normalized;
  };

  const headers = rawHeaders.map(resolveField);

  return rows.slice(1).map((line, rowIndex) => {
    const cells = parseDelimitedLine(line, delimiter);
    const entry = { __row: rowIndex + 2 };
    headers.forEach((header, columnIndex) => {
      entry[header] = cells[columnIndex] || '';
    });
    return entry;
  });
};

const downloadBlob = (filename, type, content) => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

const buildLocationLabel = (order) =>
  [order.district, order.city].filter(Boolean).join(' - ') || order.address || order.region || '—';

export default function Dashboard() {
  const { permissions } = useAuth();
  const { lang } = useLang();
  const [dashboard, setDashboard] = useState(null);
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [technicianForm, setTechnicianForm] = useState(emptyTechnicianForm);
  const [editingTechnicianId, setEditingTechnicianId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingTechnician, setSavingTechnician] = useState(false);
  const [savingStandards, setSavingStandards] = useState(false);
  const [savingAreas, setSavingAreas] = useState(false);
  const [savingOrderEditId, setSavingOrderEditId] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [intakeMode, setIntakeMode] = useState('quick');
  const [bulkText, setBulkText] = useState('');
  const [bulkRows, setBulkRows] = useState([]);
  const [importingBulk, setImportingBulk] = useState(false);
  const [proofDrafts, setProofDrafts] = useState({});
  const [orderEditDrafts, setOrderEditDrafts] = useState({});
  const [reportRange, setReportRange] = useState('week');
  const [runningAdminTool, setRunningAdminTool] = useState(false);
  const [timeStandardsDraft, setTimeStandardsDraft] = useState(defaultTimeStandards);
  const [areaClustersDraft, setAreaClustersDraft] = useState(defaultAreaClusters);

  const t = copy[lang] || copy.en;

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await operationsService.getDashboard();
      setDashboard(response.data);
      setTimeStandardsDraft(response.data?.timeStandards || defaultTimeStandards);
      setAreaClustersDraft(response.data?.areaClusters || defaultAreaClusters);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    window.addEventListener('operations-updated', loadDashboard);
    return () => window.removeEventListener('operations-updated', loadDashboard);
  }, []);

  const technicians = useMemo(() => dashboard?.technicians || [], [dashboard]);
  const orders = useMemo(() => dashboard?.orders || [], [dashboard]);
  const timeStandards = useMemo(() => dashboard?.timeStandards || defaultTimeStandards, [dashboard]);
  const areaClusters = useMemo(() => dashboard?.areaClusters || defaultAreaClusters, [dashboard]);

  const searchableOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return orders;
    }

    return orders.filter((order) =>
      [
        order.id,
        formatOrderNumber(order.id),
        order.customerName,
        order.phone,
        formatSaudiPhoneDisplay(order.phone),
        order.address,
        order.district,
        order.city,
        order.internalAreaLabel,
        order.internalAreaArLabel,
        order.technicianName,
        order.workType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [orders, search]);

  const stats = useMemo(() => {
    const incoming = orders.filter((order) => order.status === 'pending').length;
    const active = orders.filter((order) => ['en_route', 'in_progress'].includes(order.status)).length;
    const proof = orders.filter((order) => order.status === 'completed' && order.approvalStatus !== 'approved').length;
    const approved = orders.filter((order) => order.approvalStatus === 'approved').length;
    return [
      { label: t.stats.incoming, value: incoming },
      { label: t.stats.active, value: active },
      { label: t.stats.proof, value: proof },
      { label: t.stats.approved, value: approved },
    ];
  }, [orders, t]);

  const incomingOrders = useMemo(() => {
    const pending = searchableOrders.filter((order) => order.status === 'pending');
    const unassigned = pending.filter((order) => !order.technicianId);
    return (unassigned.length ? unassigned : pending).sort((left, right) => {
      const areaComparison = compareOrdersByInternalArea(left, right);
      if (areaComparison !== 0) {
        return areaComparison;
      }
      return String(left.createdAt || '').localeCompare(String(right.createdAt || ''));
    });
  }, [searchableOrders]);

  const technicianLanes = useMemo(
    () =>
      technicians.map((technician) => {
        const assignedOrders = searchableOrders
          .filter((order) => String(order.technicianId) === String(technician.id))
          .filter((order) => !['completed', 'canceled'].includes(order.status))
          .sort((left, right) => compareOrdersByInternalArea(left, right));

        return {
          ...technician,
          assignedOrders,
        };
      }),
    [searchableOrders, technicians]
  );

  const proofQueue = useMemo(
    () =>
      searchableOrders
        .filter((order) => order.status === 'completed')
        .sort((left, right) => {
          if (left.approvalStatus === right.approvalStatus) {
            return String(right.updatedAt || right.createdAt || '').localeCompare(
              String(left.updatedAt || left.createdAt || '')
            );
          }
          return left.approvalStatus === 'approved' ? 1 : -1;
        }),
    [searchableOrders]
  );

  const editableOrders = useMemo(() => searchableOrders.slice(0, 12), [searchableOrders]);

  const reportOrders = useMemo(() => {
    const days = reportRange === 'month' ? 30 : 7;
    return orders.filter(
      (order) =>
        order.approvalStatus === 'approved' &&
        isRecentWithinDays(order.approvedAt || order.scheduledDate || order.createdAt, days)
    );
  }, [orders, reportRange]);

  const coverageSummary = useMemo(() => {
    const counts = new Map();
    searchableOrders.forEach((order) => {
      const key = getAreaClusterLabel(
        {
          label: order.internalAreaLabel,
          arLabel: order.internalAreaArLabel,
        },
        lang
      );
      if (!key || key === '—') {
        return;
      }
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6);
  }, [lang, searchableOrders]);

  const orderFormServices = useMemo(() => buildServiceItems(lang, orderForm.serviceItems), [lang, orderForm.serviceItems]);
  const reportTotal = useMemo(
    () => reportOrders.reduce((sum, order) => sum + (Number(order.extras?.totalPrice) || 0), 0),
    [reportOrders]
  );
  const monthlyEfficiency = useMemo(() => {
    const completedOrders = orders
      .filter((order) => order.workStartedAt && (order.zamilClosedAt || order.approvedAt || order.status === 'completed'))
      .filter((order) => isRecentWithinDays(order.zamilClosedAt || order.approvedAt || order.updatedAt || order.createdAt, 30))
      .map((order) => ({
        ...order,
        timing: buildEscalationSnapshot(order, timeStandards),
      }));

    const byTechnician = new Map();
    const byService = new Map();

    completedOrders.forEach((order) => {
      const technicianName = order.technicianName || t.unassigned;
      const currentTech = byTechnician.get(technicianName) || {
        technicianName,
        total: 0,
        onTime: 0,
        delayed: 0,
        overtimeMinutes: 0,
      };
      currentTech.total += 1;
      currentTech.onTime += order.timing?.isDelayed ? 0 : 1;
      currentTech.delayed += order.timing?.isDelayed ? 1 : 0;
      currentTech.overtimeMinutes += order.timing?.overtimeMinutes || 0;
      byTechnician.set(technicianName, currentTech);

      const serviceKey = order.serviceCategory || order.workType || order.acType;
      const currentService = byService.get(serviceKey) || { serviceKey, delayed: 0, total: 0 };
      currentService.total += 1;
      currentService.delayed += order.timing?.isDelayed ? 1 : 0;
      byService.set(serviceKey, currentService);
    });

    const techniciansRank = Array.from(byTechnician.values()).map((item) => ({
      ...item,
      onTimeRate: item.total ? Math.round((item.onTime / item.total) * 100) : 0,
    }));

    const fastestTech =
      techniciansRank
        .filter((item) => item.total > 0)
        .sort((left, right) => right.onTimeRate - left.onTimeRate || left.overtimeMinutes - right.overtimeMinutes)[0] || null;

    const repeatedDelays =
      techniciansRank
        .filter((item) => item.delayed > 0)
        .sort((left, right) => right.delayed - left.delayed || right.overtimeMinutes - left.overtimeMinutes)[0] || null;

    const topDelayedService =
      Array.from(byService.values())
        .filter((item) => item.delayed > 0)
        .sort((left, right) => right.delayed - left.delayed || right.total - left.total)[0] || null;

    return {
      completedOrders,
      fastestTech,
      repeatedDelays,
      topDelayedService,
    };
  }, [orders, t.unassigned, timeStandards]);

  const updateOrderServiceCategory = (serviceCategory) => {
    const matched = timeStandards.find((entry) => entry.standardKey === serviceCategory);
    setOrderForm((current) => ({
      ...current,
      serviceCategory,
      standardDurationMinutes: Number(matched?.durationMinutes) || current.standardDurationMinutes,
    }));
  };

  const saveTimeStandards = async () => {
    try {
      setSavingStandards(true);
      setMessage('');
      await operationsService.updateTimeStandards(timeStandardsDraft);
      setMessage(lang === 'ar' ? 'تم حفظ معايير الوقت بنجاح.' : 'Time standards saved successfully.');
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || error.message || 'Failed to save time standards.');
    } finally {
      setSavingStandards(false);
    }
  };

  const saveAreaClusters = async () => {
    try {
      setSavingAreas(true);
      setMessage('');
      await operationsService.updateAreaClusters(areaClustersDraft);
      setMessage(lang === 'ar' ? 'تم حفظ المناطق الداخلية بنجاح.' : 'Internal area zones saved successfully.');
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || error.message || 'Failed to save internal zones.');
    } finally {
      setSavingAreas(false);
    }
  };

  const toggleOrderFormService = (serviceId) => {
    setOrderForm((current) => {
      const existing = current.serviceItems.find((item) => item.id === serviceId);
      const catalogItem = serviceCatalogItems.find((item) => item.id === serviceId);
      const nextItems = existing
        ? current.serviceItems.filter((item) => item.id !== serviceId)
        : [
            ...current.serviceItems,
            {
              ...catalogItem,
              description: serviceDescriptions[lang]?.[serviceId] || serviceDescriptions.en[serviceId],
              quantity: 1,
              selected: true,
              totalPrice: catalogItem?.price || 0,
            },
          ];
      return { ...current, serviceItems: nextItems };
    });
  };

  const changeOrderFormServiceQuantity = (serviceId, quantity) => {
    setOrderForm((current) => ({
      ...current,
      serviceItems: current.serviceItems.map((item) =>
        item.id === serviceId
          ? {
              ...item,
              quantity: Math.max(1, Number(quantity) || 1),
              totalPrice: (serviceCatalogItems.find((entry) => entry.id === serviceId)?.price || 0) * Math.max(1, Number(quantity) || 1),
            }
          : item
      ),
    }));
  };

  const submitOrder = async (event) => {
    event.preventDefault();

    try {
      setSavingOrder(true);
      setMessage('');
      await operationsService.createOrder({
        ...orderForm,
        address: orderForm.address || [orderForm.district, orderForm.city].filter(Boolean).join(' - '),
        acType: orderForm.acType || `${orderForm.acCount} x ${orderForm.workType}`.trim(),
        serviceCategory: orderForm.serviceCategory,
        standardDurationMinutes: orderForm.standardDurationMinutes,
        serviceItems: orderForm.serviceItems.filter((item) => item.selected),
      });
      setOrderForm(emptyOrderForm);
      setMessage(t.orderCreated);
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || error.message || t.orderCreated);
    } finally {
      setSavingOrder(false);
    }
  };

  const submitTechnician = async (event) => {
    event.preventDefault();

    try {
      setSavingTechnician(true);
      setMessage('');
      if (editingTechnicianId) {
        await operationsService.updateTechnician(editingTechnicianId, technicianForm);
      } else {
        await operationsService.createTechnician(technicianForm);
      }
      setEditingTechnicianId('');
      setTechnicianForm(emptyTechnicianForm);
      setMessage(t.successTech);
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || error.message || t.successTech);
    } finally {
      setSavingTechnician(false);
    }
  };

  const startEditingTechnician = (technician) => {
    const nameParts = String(technician?.name || '').split(/\s+/).filter(Boolean);
    setEditingTechnicianId(String(technician.id));
    setTechnicianForm({
      firstName: technician.firstName || nameParts[0] || '',
      lastName: technician.lastName || nameParts.slice(1).join(' '),
      email: technician.email || '',
      phone: technician.phone || '',
      password: '',
      region: technician.region || emptyTechnicianForm.region,
      status: technician.status || 'available',
      notes: technician.notes || '',
    });
  };

  const deleteTechnician = async (technician) => {
    const confirmed = window.confirm(
      lang === 'ar' ? `هل تريد حذف الفني ${technician.name}؟` : `Delete technician ${technician.name}?`
    );
    if (!confirmed) {
      return;
    }

    try {
      await operationsService.deleteTechnician(technician.id);
      setMessage(t.deletedTech);
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || error.message || t.deletedTech);
    }
  };

  const updateTechnicianAvailability = async (technicianId, status) => {
    await operationsService.updateTechnicianAvailability(technicianId, status);
    await loadDashboard();
  };

  const handleDropOnTechnician = async (event, technicianId) => {
    event.preventDefault();
    const orderId = event.dataTransfer.getData('text/order-id');
    if (!orderId) {
      return;
    }
    await operationsService.updateOrder(orderId, { technicianId }, t.orderCreated);
    await loadDashboard();
  };

  const handleBulkAnalyze = async () => {
    setBulkRows(parseSpreadsheetText(bulkText));
  };

  const handleBulkFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    setBulkText(text);
    setBulkRows(parseSpreadsheetText(text));
  };

  const resolveBulkTechnician = (row) => {
    const technicianName = String(row.technician || '').trim().toLowerCase();
    if (technicianName) {
      const matchedByName = technicians.find((technician) =>
        String(technician.name || '').trim().toLowerCase().includes(technicianName)
      );
      if (matchedByName) {
        return matchedByName.id;
      }
    }
    return '';
  };

  const importBulkRows = async () => {
    if (!bulkRows.length) {
      return;
    }

    try {
      setImportingBulk(true);
      setMessage('');
      for (const row of bulkRows) {
        if (!row.customerName || !row.phone) {
          continue;
        }
        const acCount = Math.max(1, Number(row.acCount) || 1);
        const workType = row.workType || row.acType || (lang === 'ar' ? 'تركيب مكيف سبليت' : 'Split AC installation');
        await operationsService.createOrder({
          customerName: row.customerName,
          phone: row.phone,
          district: row.district || '',
          city: row.city || 'Riyadh',
          address: row.address || [row.district, row.city].filter(Boolean).join(' - '),
          acCount,
          workType,
          acType: `${acCount} x ${workType}`,
          scheduledDate: row.scheduledDate || todayString(),
          scheduledTime: row.scheduledTime || '09:00',
          technicianId: resolveBulkTechnician(row),
          notes: row.notes || '',
          source: 'zamil',
          serviceItems: [],
        });
      }
      setBulkRows([]);
      setBulkText('');
      setMessage(lang === 'ar' ? 'تم إنشاء المهام المستوردة بنجاح.' : 'Imported tasks created successfully.');
      await loadDashboard();
    } finally {
      setImportingBulk(false);
    }
  };

  const setProofDraft = (orderId, key, value) => {
    setProofDrafts((current) => ({
      ...current,
      [orderId]: {
        ...current[orderId],
        [key]: value,
      },
    }));
  };

  const getOrderEditDraft = (order) =>
    orderEditDrafts[order.id] || {
      customerName: order.customerName || '',
      phone: order.phone || '',
      district: order.district || '',
      city: order.city || '',
      address: order.address || '',
      scheduledDate: order.scheduledDate || todayString(),
      scheduledTime: order.scheduledTime || '',
      technicianId: order.technicianId || '',
      serviceCategory: order.serviceCategory || 'split_installation',
      standardDurationMinutes: order.standardDurationMinutes || 120,
      notes: order.notes || '',
    };

  const updateOrderEditDraft = (order, key, value) => {
    setOrderEditDrafts((current) => ({
      ...current,
      [order.id]: {
        ...getOrderEditDraft(order),
        [key]: value,
      },
    }));
  };

  const saveOrderEdit = async (order) => {
    const draft = getOrderEditDraft(order);

    try {
      setSavingOrderEditId(String(order.id));
      setMessage('');
      await operationsService.updateOrder(order.id, {
        customerName: draft.customerName,
        phone: draft.phone,
        district: draft.district,
        city: draft.city,
        address: draft.address || [draft.district, draft.city].filter(Boolean).join(' - '),
        scheduledDate: draft.scheduledDate,
        scheduledTime: draft.scheduledTime,
        technicianId: draft.technicianId,
        serviceCategory: draft.serviceCategory,
        standardDurationMinutes: draft.standardDurationMinutes,
        notes: draft.notes,
      });
      setMessage(lang === 'ar' ? 'تم تحديث بيانات الطلب بنجاح.' : 'Order details updated successfully.');
      await loadDashboard();
    } finally {
      setSavingOrderEditId('');
    }
  };

  const approveProof = async (order) => {
    const draft = proofDrafts[order.id] || {};
    await operationsService.updateOrder(order.id, {
      approvalStatus: 'approved',
      proofStatus: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: draft.approvedBy || order.approvedBy || '',
      clientSignature: draft.clientSignature || order.clientSignature || '',
    });
    await loadDashboard();
  };

  const reopenProof = async (order) => {
    await operationsService.updateOrder(order.id, {
      approvalStatus: 'pending',
      proofStatus: 'pending_review',
    });
    await loadDashboard();
  };

  const exportReportCsv = () => {
    if (!reportOrders.length) {
      return;
    }
    const lines = [
      ['Order', 'Customer', 'District', 'Technician', 'Scheduled Date', 'Approved At', 'Total SAR', 'Reviewed By'].join(','),
      ...reportOrders.map((order) =>
        [
          formatOrderNumber(order.id),
          order.customerName,
          order.district || order.city || order.address,
          order.technicianName || t.unassigned,
          order.scheduledDate || '',
          order.approvedAt || '',
          Number(order.extras?.totalPrice || 0),
          order.approvedBy || '',
        ]
          .map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];
    downloadBlob('billing-report.csv', 'text/csv;charset=utf-8', lines.join('\n'));
  };

  const printReport = () => {
    if (!reportOrders.length) {
      return;
    }
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');
    if (!popup) {
      return;
    }
    const title = lang === 'ar' ? 'مستخلص التشغيل' : 'Operations claim report';
    const rows = reportOrders
      .map(
        (order) => `
          <tr>
            <td>${formatOrderNumber(order.id)}</td>
            <td>${order.customerName}</td>
            <td>${buildLocationLabel(order)}</td>
            <td>${order.technicianName || t.unassigned}</td>
            <td>${order.scheduledDate || ''}</td>
            <td>${Number(order.extras?.totalPrice || 0)} SAR</td>
          </tr>
        `
      )
      .join('');
    popup.document.write(`
      <html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #17212b; }
            h1 { margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d5dbe3; padding: 10px; text-align: ${lang === 'ar' ? 'right' : 'left'}; }
            th { background: #eef4f7; }
            .meta { display: flex; gap: 24px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">
            <strong>${t.reportCount}: ${reportOrders.length}</strong>
            <strong>${t.reportValue}: ${reportTotal} SAR</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>${lang === 'ar' ? 'رقم الطلب' : 'Order'}</th>
                <th>${t.customerName}</th>
                <th>${t.district}</th>
                <th>${t.assignTechnician}</th>
                <th>${t.scheduledDate}</th>
                <th>${lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const runSampleDataAction = async (action) => {
    try {
      setRunningAdminTool(true);
      if (action === 'clear') {
        await operationsService.clearSampleData();
      } else {
        await operationsService.resetSampleData();
      }
      await loadDashboard();
    } finally {
      setRunningAdminTool(false);
    }
  };

  if (loading) {
    return <section className="page-shell">{t.loading}</section>;
  }

  return (
    <section className="page-shell ops-dashboard" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="section-heading admin-daily-header">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="section-subtitle">{t.subtitle}</p>
          {permissions?.canManageSystem ? <span className="internal-area-pill">{t.systemManagerBadge}</span> : null}
        </div>
        <div className="status-actions">
          <Link className="btn-light" to="/dashboard/daily">
            {t.dailyManagement}
          </Link>
        </div>
      </div>

      {message ? <div className="flash-message">{message}</div> : null}

      <div className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>

      <div className="ops-layout">
        <div className="ops-main">
          <section className="panel ops-section">
            <div className="panel-header">
              <h2>{t.intakeTitle}</h2>
              <p>{t.intakeHint}</p>
            </div>

            <div className="segmented-control">
              <button
                className={intakeMode === 'quick' ? 'active' : ''}
                type="button"
                onClick={() => setIntakeMode('quick')}
              >
                {t.quickEntry}
              </button>
              <button
                className={intakeMode === 'bulk' ? 'active' : ''}
                type="button"
                onClick={() => setIntakeMode('bulk')}
              >
                {t.bulkEntry}
              </button>
            </div>

            {intakeMode === 'quick' ? (
              <form className="ops-form-grid" onSubmit={submitOrder}>
                <label className="filter-field">
                  <span>{t.customerName}</span>
                  <input
                    className="input"
                    value={orderForm.customerName}
                    onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })}
                    required
                  />
                </label>

                <label className="filter-field">
                  <span>{t.phone}</span>
                  <input
                    className="input"
                    value={orderForm.phone}
                    onChange={(event) => setOrderForm({ ...orderForm, phone: event.target.value })}
                    required
                  />
                </label>

                <label className="filter-field">
                  <span>{t.district}</span>
                  <input
                    className="input"
                    value={orderForm.district}
                    onChange={(event) => setOrderForm({ ...orderForm, district: event.target.value })}
                    required
                  />
                </label>

                <label className="filter-field">
                  <span>{t.city}</span>
                  <input
                    className="input"
                    value={orderForm.city}
                    onChange={(event) => setOrderForm({ ...orderForm, city: event.target.value })}
                    required
                  />
                </label>

                <label className="filter-field">
                  <span>{t.address}</span>
                  <input
                    className="input"
                    value={orderForm.address}
                    onChange={(event) => setOrderForm({ ...orderForm, address: event.target.value })}
                  />
                </label>

                <label className="filter-field">
                  <span>{t.acCount}</span>
                  <input
                    className="input"
                    min="1"
                    type="number"
                    value={orderForm.acCount}
                    onChange={(event) => setOrderForm({ ...orderForm, acCount: Math.max(1, Number(event.target.value) || 1) })}
                    required
                  />
                </label>

                <label className="filter-field">
                  <span>{t.serviceCategory}</span>
                  <select
                    className="input"
                    value={orderForm.serviceCategory}
                    onChange={(event) => updateOrderServiceCategory(event.target.value)}
                  >
                    {timeStandards.map((standard) => (
                      <option key={standard.standardKey} value={standard.standardKey}>
                        {getTimeStandardLabel(standard, lang)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="filter-field">
                  <span>{t.workType}</span>
                  <input
                    className="input"
                    value={orderForm.workType}
                    onChange={(event) => setOrderForm({ ...orderForm, workType: event.target.value })}
                    placeholder={lang === 'ar' ? 'تركيب 3 مكيفات سبليت زامل' : 'Install 3 Zamil split AC units'}
                    required
                  />
                </label>

                <label className="filter-field">
                  <span>{t.standardMinutes}</span>
                  <input
                    className="input"
                    min="1"
                    type="number"
                    value={orderForm.standardDurationMinutes}
                    onChange={(event) =>
                      setOrderForm({ ...orderForm, standardDurationMinutes: Math.max(1, Number(event.target.value) || 1) })
                    }
                    required
                  />
                </label>

                <label className="filter-field">
                  <span>{t.source}</span>
                  <select
                    className="input"
                    value={orderForm.source}
                    onChange={(event) => setOrderForm({ ...orderForm, source: event.target.value })}
                  >
                    {Object.entries(t.sourceOptions).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="filter-field">
                  <span>{t.scheduledDate}</span>
                  <input
                    className="input"
                    type="date"
                    value={orderForm.scheduledDate}
                    onChange={(event) => setOrderForm({ ...orderForm, scheduledDate: event.target.value })}
                    required
                  />
                </label>

                <label className="filter-field">
                  <span>{t.scheduledTime}</span>
                  <input
                    className="input"
                    type="time"
                    value={orderForm.scheduledTime}
                    onChange={(event) => setOrderForm({ ...orderForm, scheduledTime: event.target.value })}
                  />
                </label>

                <label className="filter-field">
                  <span>{t.assignTechnician}</span>
                  <select
                    className="input"
                    value={orderForm.technicianId}
                    onChange={(event) => setOrderForm({ ...orderForm, technicianId: event.target.value })}
                  >
                    <option value="">{t.unassigned}</option>
                    {technicians.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name} - {getRegionLabel(lang, technician.region || technician.zone)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="filter-field ops-field-span">
                  <span>{t.notes}</span>
                  <textarea
                    className="input textarea"
                    rows={3}
                    value={orderForm.notes}
                    onChange={(event) => setOrderForm({ ...orderForm, notes: event.target.value })}
                  />
                </label>

                <div className="order-addon-panel ops-field-span">
                  <h4>{lang === 'ar' ? 'خدمات إضافية داخل المهمة' : 'Service add-ons'}</h4>
                  <div className="service-select-grid">
                    {orderFormServices.map((service) => (
                      <label className={`service-option ${service.selected ? 'selected' : ''}`} key={service.id}>
                        <input
                          type="checkbox"
                          checked={service.selected}
                          onChange={() => toggleOrderFormService(service.id)}
                        />
                        <span>
                          <strong>{service.price} SAR</strong>
                          <small>{service.description}</small>
                          <small>{service.unit}</small>
                        </span>
                        {service.selected ? (
                          <input
                            className="input compact-input"
                            min="1"
                            type="number"
                            value={service.quantity}
                            onChange={(event) => changeOrderFormServiceQuantity(service.id, event.target.value)}
                          />
                        ) : null}
                      </label>
                    ))}
                  </div>
                  <div className="order-addon-total">
                    <span>{lang === 'ar' ? 'إجمالي الخدمات' : 'Services total'}</span>
                    <strong>{serviceTotal(orderForm.serviceItems)} SAR</strong>
                  </div>
                </div>

                <button className="btn-primary" disabled={savingOrder} type="submit">
                  {savingOrder ? t.creating : t.createOrder}
                </button>
              </form>
            ) : (
              <div className="bulk-import-grid">
                <div className="panel inset-panel bulk-upload-card">
                  <p className="muted">{t.bulkHint}</p>
                  <label className="upload-box">
                    <span>{t.bulkEntry}</span>
                    <input accept=".csv,.txt" type="file" onChange={handleBulkFile} />
                  </label>
                  <label className="filter-field">
                    <span>{t.pasteTable}</span>
                    <textarea
                      className="input textarea"
                      rows={8}
                      value={bulkText}
                      onChange={(event) => setBulkText(event.target.value)}
                    />
                  </label>
                  <div className="status-actions">
                    <button className="btn-light" type="button" onClick={handleBulkAnalyze}>
                      {t.analyzeFile}
                    </button>
                    <button className="btn-primary" disabled={!bulkRows.length || importingBulk} type="button" onClick={importBulkRows}>
                      {importingBulk ? t.importing : t.importRows}
                    </button>
                  </div>
                </div>

                <div className="panel inset-panel bulk-preview-card">
                  <div className="panel-header">
                    <h3>{t.parsedRows}</h3>
                    <p>{t.importSummary}</p>
                  </div>
                  {bulkRows.length ? (
                    <div className="bulk-row-list">
                      {bulkRows.map((row) => (
                        <article className="bulk-row-card" key={`${row.__row}-${row.phone}`}>
                          <strong>{row.customerName || '—'}</strong>
                          <span>{row.phone || '—'}</span>
                          <span>{[row.district, row.city].filter(Boolean).join(' - ') || row.address || '—'}</span>
                          <span>{row.workType || '—'}</span>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">{t.noRows}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="panel ops-section">
            <div className="panel-header">
              <h2>{t.dispatchTitle}</h2>
              <p>{t.dispatchHint}</p>
            </div>

            <div className="dashboard-toolbar">
              <label className="filter-field">
                <span>{lang === 'ar' ? 'البحث التشغيلي' : 'Operational search'}</span>
                <input
                  className="input"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.searchPlaceholder}
                />
              </label>
              <div className="dashboard-toolbar-count">
                <strong>{searchableOrders.length}</strong>
                <span>{lang === 'ar' ? 'طلبات مطابقة' : 'Matching jobs'}</span>
              </div>
            </div>

            <div className="dispatch-board">
              <div className="dispatch-inbox">
                <div className="dispatch-column-head">
                  <h3>{t.incomingList}</h3>
                  <span>{incomingOrders.length}</span>
                </div>
                {incomingOrders.length ? (
                  incomingOrders.map((order) => (
                    <article
                      className="dispatch-job-card"
                      draggable
                      key={order.id}
                      onDragStart={(event) => event.dataTransfer.setData('text/order-id', order.id)}
                    >
                      <div className="dispatch-job-top">
                        <strong>#{formatOrderNumber(order.id)}</strong>
                        <span className={`status-badge ${order.status}`}>{t.statusOptions[order.status] || order.status}</span>
                      </div>
                      <p>{order.customerName}</p>
                      <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                      <p>{buildLocationLabel(order)}</p>
                      <p>{order.workType || order.acType}</p>
                      <small>{order.technicianName || t.unassigned}</small>
                    </article>
                  ))
                ) : (
                  <p className="muted">{t.noIncoming}</p>
                )}
              </div>

              <div className="dispatch-lanes">
                {technicianLanes.map((technician) => (
                  <section
                    className="dispatch-lane"
                    key={technician.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDropOnTechnician(event, technician.id)}
                  >
                    <div className="dispatch-column-head">
                      <div>
                        <h3>{technician.name}</h3>
                        <p>{getRegionLabel(lang, technician.region || technician.zone)}</p>
                      </div>
                      <span>{technician.assignedOrders?.length || technician.assignedOrders.length}</span>
                    </div>
                    <div className="lane-meta">
                      <span className={`status-badge ${technician.status}`}>{technician.status === 'busy' ? t.busy : t.available}</span>
                      <small>{t.laneLabel}</small>
                    </div>
                    <div className="lane-job-list">
                      {technician.assignedOrders.length ? (
                        technician.assignedOrders.map((order) => (
                          <article className="lane-job-card" key={order.id}>
                            <strong>{order.customerName}</strong>
                            <span className="internal-area-pill">{getAreaClusterLabel(order, lang)}</span>
                            <span>{buildLocationLabel(order)}</span>
                            <span>{order.scheduledTime || order.scheduledDate || '—'}</span>
                            <span className={`status-badge ${order.status}`}>{t.statusOptions[order.status] || order.status}</span>
                          </article>
                        ))
                      ) : (
                        <p className="muted">{lang === 'ar' ? 'اسحب طلباً إلى هذا المسار' : 'Drop a request into this lane'}</p>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>

          <section className="panel ops-section">
            <div className="panel-header">
              <h2>{t.proofTitle}</h2>
              <p>{t.proofHint}</p>
            </div>

            <div className="proof-grid">
              {proofQueue.length ? (
                proofQueue.map((order) => {
                  const draft = proofDrafts[order.id] || {};
                  return (
                    <article className="proof-card" key={order.id}>
                      <div className="proof-card-top">
                        <div>
                          <strong>
                            #{formatOrderNumber(order.id)} - {order.customerName}
                          </strong>
                          <p>{buildLocationLabel(order)}</p>
                          <p>{order.technicianName || t.unassigned}</p>
                        </div>
                        <span className={`status-badge ${order.approvalStatus === 'approved' ? 'completed' : 'pending'}`}>
                          {order.approvalStatus === 'approved' ? t.approvedBadge : t.pendingBadge}
                        </span>
                      </div>

                      <div className="photo-grid">
                        {(order.photos || []).length ? (
                          (order.photos || []).map((photo) => (
                            <img alt={photo.name} className="photo-thumb" key={photo.id} src={photo.url} />
                          ))
                        ) : (
                          <p className="muted">{t.noPhotos}</p>
                        )}
                      </div>

                      <div className="grid-two">
                        <label className="filter-field">
                          <span>{t.reviewer}</span>
                          <input
                            className="input"
                            value={draft.approvedBy ?? order.approvedBy ?? ''}
                            onChange={(event) => setProofDraft(order.id, 'approvedBy', event.target.value)}
                          />
                        </label>
                        <label className="filter-field">
                          <span>{t.signature}</span>
                          <input
                            className="input"
                            value={draft.clientSignature ?? order.clientSignature ?? ''}
                            onChange={(event) => setProofDraft(order.id, 'clientSignature', event.target.value)}
                          />
                        </label>
                      </div>

                      <div className="status-actions">
                        <button className="btn-primary" type="button" onClick={() => approveProof(order)}>
                          {t.approve}
                        </button>
                        {order.approvalStatus === 'approved' ? (
                          <button className="btn-light" type="button" onClick={() => reopenProof(order)}>
                            {t.revoke}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="muted">{t.noCompleted}</p>
              )}
            </div>
          </section>

          {permissions?.canEditSubmittedOrders ? (
            <section className="panel ops-section">
              <div className="panel-header">
                <h2>{t.orderManagementTitle}</h2>
                <p>{t.orderManagementHint}</p>
              </div>

              <div className="proof-grid">
                {editableOrders.length ? (
                  editableOrders.map((order) => {
                    const draft = getOrderEditDraft(order);
                    return (
                      <article className="proof-card" key={`edit-${order.id}`}>
                        <div className="proof-card-top">
                          <div>
                            <strong>
                              #{formatOrderNumber(order.id)} - {order.customerName}
                            </strong>
                            <p>{buildLocationLabel(order)}</p>
                            <small className="internal-area-pill">{getAreaClusterLabel(order, lang)}</small>
                          </div>
                          <span className={`status-badge ${order.status}`}>{t.statusOptions[order.status] || order.status}</span>
                        </div>

                        <div className="grid-two">
                          <label className="filter-field">
                            <span>{t.customerName}</span>
                            <input
                              className="input"
                              value={draft.customerName}
                              onChange={(event) => updateOrderEditDraft(order, 'customerName', event.target.value)}
                            />
                          </label>
                          <label className="filter-field">
                            <span>{t.phone}</span>
                            <input
                              className="input"
                              value={draft.phone}
                              onChange={(event) => updateOrderEditDraft(order, 'phone', event.target.value)}
                            />
                          </label>
                        </div>

                        <div className="grid-two">
                          <label className="filter-field">
                            <span>{t.district}</span>
                            <input
                              className="input"
                              value={draft.district}
                              onChange={(event) => updateOrderEditDraft(order, 'district', event.target.value)}
                            />
                          </label>
                          <label className="filter-field">
                            <span>{t.city}</span>
                            <input
                              className="input"
                              value={draft.city}
                              onChange={(event) => updateOrderEditDraft(order, 'city', event.target.value)}
                            />
                          </label>
                        </div>

                        <label className="filter-field">
                          <span>{t.address}</span>
                          <input
                            className="input"
                            value={draft.address}
                            onChange={(event) => updateOrderEditDraft(order, 'address', event.target.value)}
                          />
                        </label>

                        <div className="grid-two">
                          <label className="filter-field">
                            <span>{t.scheduledDate}</span>
                            <input
                              className="input"
                              type="date"
                              value={draft.scheduledDate}
                              onChange={(event) => updateOrderEditDraft(order, 'scheduledDate', event.target.value)}
                            />
                          </label>
                          <label className="filter-field">
                            <span>{t.scheduledTime}</span>
                            <input
                              className="input"
                              type="time"
                              value={draft.scheduledTime}
                              onChange={(event) => updateOrderEditDraft(order, 'scheduledTime', event.target.value)}
                            />
                          </label>
                        </div>

                        <div className="grid-two">
                          <label className="filter-field">
                            <span>{t.serviceCategory}</span>
                            <select
                              className="input"
                              value={draft.serviceCategory}
                              onChange={(event) => {
                                updateOrderEditDraft(order, 'serviceCategory', event.target.value);
                                const matched = timeStandards.find((entry) => entry.standardKey === event.target.value);
                                if (matched) {
                                  updateOrderEditDraft(order, 'standardDurationMinutes', Number(matched.durationMinutes) || draft.standardDurationMinutes);
                                }
                              }}
                            >
                              {timeStandards.map((entry) => (
                                <option key={entry.standardKey} value={entry.standardKey}>
                                  {getTimeStandardLabel(entry, lang)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="filter-field">
                            <span>{t.standardMinutes}</span>
                            <input
                              className="input"
                              min="1"
                              type="number"
                              value={draft.standardDurationMinutes}
                              onChange={(event) =>
                                updateOrderEditDraft(order, 'standardDurationMinutes', Math.max(1, Number(event.target.value) || 1))
                              }
                            />
                          </label>
                        </div>

                        <div className="grid-two">
                          <label className="filter-field">
                            <span>{t.assignTechnician}</span>
                            <select
                              className="input"
                              value={draft.technicianId}
                              onChange={(event) => updateOrderEditDraft(order, 'technicianId', event.target.value)}
                            >
                              <option value="">{t.unassigned}</option>
                              {technicians.map((technician) => (
                                <option key={technician.id} value={technician.id}>
                                  {technician.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="filter-field">
                            <span>{t.notes}</span>
                            <input
                              className="input"
                              value={draft.notes}
                              onChange={(event) => updateOrderEditDraft(order, 'notes', event.target.value)}
                            />
                          </label>
                        </div>

                        <div className="status-actions">
                          <button
                            className="btn-primary"
                            disabled={savingOrderEditId === String(order.id)}
                            type="button"
                            onClick={() => saveOrderEdit(order)}
                          >
                            {savingOrderEditId === String(order.id) ? t.creating : t.saveOrderEdit}
                          </button>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="muted">{t.noIncoming}</p>
                )}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="ops-sidebar">
          <section className="panel ops-section">
            <div className="panel-header">
              <h2>{t.standardSetupTitle}</h2>
              <p>{t.standardSetupHint}</p>
            </div>

            <div className="nested-form">
              {timeStandardsDraft.map((standard, index) => (
                <article className="order-card report-order-card" key={standard.standardKey}>
                  <strong>{getTimeStandardLabel(standard, lang)}</strong>
                  <div className="grid-two">
                    <label className="filter-field">
                      <span>{lang === 'ar' ? 'الاسم الإنجليزي' : 'English label'}</span>
                      <input
                        className="input"
                        value={standard.label}
                        onChange={(event) =>
                          setTimeStandardsDraft((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                    <label className="filter-field">
                      <span>{lang === 'ar' ? 'الاسم العربي' : 'Arabic label'}</span>
                      <input
                        className="input"
                        value={standard.arLabel}
                        onChange={(event) =>
                          setTimeStandardsDraft((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, arLabel: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                  </div>
                  <label className="filter-field">
                    <span>{t.standardMinutes}</span>
                    <input
                      className="input"
                      min="1"
                      type="number"
                      value={standard.durationMinutes}
                      onChange={(event) =>
                        setTimeStandardsDraft((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, durationMinutes: Math.max(1, Number(event.target.value) || 1) } : item
                          )
                        )
                      }
                    />
                  </label>
                </article>
              ))}
              <button className="btn-primary" disabled={savingStandards} type="button" onClick={saveTimeStandards}>
                {savingStandards ? t.creating : t.saveStandards}
              </button>
            </div>
          </section>

          <section className="panel ops-section">
            <div className="panel-header">
              <h2>{t.internalAreasTitle}</h2>
              <p>{t.internalAreasHint}</p>
            </div>

            <div className="nested-form">
              {areaClustersDraft.map((cluster, index) => (
                <article className="order-card report-order-card" key={`${cluster.city}-${cluster.district}-${index}`}>
                  <div className="grid-two">
                    <label className="filter-field">
                      <span>{t.city}</span>
                      <input
                        className="input"
                        value={cluster.city}
                        onChange={(event) =>
                          setAreaClustersDraft((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, city: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                    <label className="filter-field">
                      <span>{t.district}</span>
                      <input
                        className="input"
                        value={cluster.district}
                        onChange={(event) =>
                          setAreaClustersDraft((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, district: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="grid-two">
                    <label className="filter-field">
                      <span>{t.areaCode}</span>
                      <input
                        className="input"
                        value={cluster.areaKey}
                        onChange={(event) =>
                          setAreaClustersDraft((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, areaKey: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                    <label className="filter-field">
                      <span>{t.sortOrder}</span>
                      <input
                        className="input"
                        min="1"
                        type="number"
                        value={cluster.sortOrder}
                        onChange={(event) =>
                          setAreaClustersDraft((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, sortOrder: Math.max(1, Number(event.target.value) || 1) } : item
                            )
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="grid-two">
                    <label className="filter-field">
                      <span>{t.areaLabel}</span>
                      <input
                        className="input"
                        value={cluster.label}
                        onChange={(event) =>
                          setAreaClustersDraft((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                    <label className="filter-field">
                      <span>{t.areaArabicLabel}</span>
                      <input
                        className="input"
                        value={cluster.arLabel}
                        onChange={(event) =>
                          setAreaClustersDraft((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, arLabel: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                  </div>
                </article>
              ))}
              <div className="status-actions">
                <button
                  className="btn-light"
                  type="button"
                  onClick={() =>
                    setAreaClustersDraft((current) => [
                      ...current,
                      {
                        city: '',
                        district: '',
                        areaKey: `zone-${current.length + 1}`,
                        label: `Zone ${current.length + 1}`,
                        arLabel: `المنطقة ${current.length + 1}`,
                        sortOrder: current.length + 1,
                      },
                    ])
                  }
                >
                  {t.addAreaRow}
                </button>
                <button className="btn-primary" disabled={savingAreas} type="button" onClick={saveAreaClusters}>
                  {savingAreas ? t.creating : t.saveAreas}
                </button>
              </div>
            </div>
          </section>

          <section className="panel ops-section">
            <div className="panel-header">
              <h2>{t.efficiencyTitle}</h2>
              <p>{t.efficiencyHint}</p>
            </div>

            <div className="finance-grid">
              <article className="finance-card">
                <span>{t.fastestTech}</span>
                <strong>{monthlyEfficiency.fastestTech?.technicianName || '—'}</strong>
                <small>{monthlyEfficiency.fastestTech ? `${t.onTimeRate}: ${monthlyEfficiency.fastestTech.onTimeRate}%` : ''}</small>
              </article>
              <article className="finance-card">
                <span>{t.repeatedDelays}</span>
                <strong>{monthlyEfficiency.repeatedDelays?.technicianName || '—'}</strong>
                <small>
                  {monthlyEfficiency.repeatedDelays
                    ? `${monthlyEfficiency.repeatedDelays.delayed} / ${monthlyEfficiency.repeatedDelays.total}`
                    : ''}
                </small>
              </article>
              <article className="finance-card">
                <span>{t.topDelayedService}</span>
                <strong>
                  {monthlyEfficiency.topDelayedService
                    ? getTimeStandardLabel(
                        timeStandards.find((entry) => entry.standardKey === monthlyEfficiency.topDelayedService.serviceKey) || {
                          label: monthlyEfficiency.topDelayedService.serviceKey,
                          arLabel: monthlyEfficiency.topDelayedService.serviceKey,
                        },
                        lang
                      )
                    : '—'}
                </strong>
              </article>
            </div>
          </section>

          <section className="panel ops-section">
            <div className="panel-header">
              <h2>{t.teamTitle}</h2>
              <p>{t.teamHint}</p>
            </div>

            <div className="coverage-map">
              <h3>{t.quickMapTitle}</h3>
              <div className="coverage-chip-grid">
                {coverageSummary.length ? (
                  coverageSummary.map((entry) => (
                    <button className="coverage-chip" key={entry.label} type="button" onClick={() => setSearch(entry.label)}>
                      <strong>{entry.count}</strong>
                      <span>{entry.label}</span>
                    </button>
                  ))
                ) : (
                  <p className="muted">{lang === 'ar' ? 'لا توجد كثافات أحياء حالياً.' : 'No demand clusters yet.'}</p>
                )}
              </div>
              {areaClusters.length ? (
                <p className="muted">{lang === 'ar' ? `المناطق الداخلية المضبوطة: ${areaClusters.length}` : `Configured internal zones: ${areaClusters.length}`}</p>
              ) : null}
            </div>

            <div className="tech-list compact-tech-list">
              {technicians.map((technician) => (
                <article className="tech-card" key={technician.id}>
                  <div>
                    <strong>{technician.name}</strong>
                    <p>{getRegionLabel(lang, technician.region || technician.zone)}</p>
                    <p>{formatSaudiPhoneDisplay(technician.phone)}</p>
                  </div>
                  <div className="technician-status-control">
                    <select
                      className="input compact-input"
                      value={technician.status}
                      onChange={(event) => updateTechnicianAvailability(technician.id, event.target.value)}
                    >
                      <option value="available">{t.available}</option>
                      <option value="busy">{t.busy}</option>
                    </select>
                    <div className="status-actions">
                      <button className="btn-light" type="button" onClick={() => startEditingTechnician(technician)}>
                        {t.edit}
                      </button>
                      <button className="btn-danger" type="button" onClick={() => deleteTechnician(technician)}>
                        {t.delete}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <form className="nested-form" onSubmit={submitTechnician}>
              <div className="grid-two">
                <label className="filter-field">
                  <span>{t.firstName}</span>
                  <input
                    className="input"
                    value={technicianForm.firstName}
                    onChange={(event) => setTechnicianForm({ ...technicianForm, firstName: event.target.value })}
                    required
                  />
                </label>
                <label className="filter-field">
                  <span>{t.lastName}</span>
                  <input
                    className="input"
                    value={technicianForm.lastName}
                    onChange={(event) => setTechnicianForm({ ...technicianForm, lastName: event.target.value })}
                    required
                  />
                </label>
              </div>

              <label className="filter-field">
                <span>{t.email}</span>
                <input
                  className="input"
                  type="email"
                  value={technicianForm.email}
                  onChange={(event) => setTechnicianForm({ ...technicianForm, email: event.target.value })}
                  required
                />
              </label>

              <label className="filter-field">
                <span>{t.phone}</span>
                <input
                  className="input"
                  value={technicianForm.phone}
                  onChange={(event) => setTechnicianForm({ ...technicianForm, phone: event.target.value })}
                  required
                />
              </label>

              <label className="filter-field">
                <span>{t.password}</span>
                <input
                  className="input"
                  type="password"
                  value={technicianForm.password}
                  onChange={(event) => setTechnicianForm({ ...technicianForm, password: event.target.value })}
                  required={!editingTechnicianId}
                />
              </label>

              <div className="grid-two">
                <label className="filter-field">
                  <span>{t.region}</span>
                  <select
                    className="input"
                    value={technicianForm.region}
                    onChange={(event) => setTechnicianForm({ ...technicianForm, region: event.target.value })}
                  >
                    {regionOptions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {lang === 'ar' ? region.ar : region.value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="filter-field">
                  <span>{t.status}</span>
                  <select
                    className="input"
                    value={technicianForm.status}
                    onChange={(event) => setTechnicianForm({ ...technicianForm, status: event.target.value })}
                  >
                    <option value="available">{t.available}</option>
                    <option value="busy">{t.busy}</option>
                  </select>
                </label>
              </div>

              <label className="filter-field">
                <span>{t.notes}</span>
                <textarea
                  className="input textarea"
                  value={technicianForm.notes}
                  onChange={(event) => setTechnicianForm({ ...technicianForm, notes: event.target.value })}
                />
              </label>

              <div className="status-actions">
                <button className="btn-secondary" disabled={savingTechnician} type="submit">
                  {savingTechnician ? t.creating : t.saveTechnician}
                </button>
                {editingTechnicianId ? (
                  <button
                    className="btn-light"
                    type="button"
                    onClick={() => {
                      setEditingTechnicianId('');
                      setTechnicianForm(emptyTechnicianForm);
                    }}
                  >
                    {t.cancelEdit}
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="panel ops-section">
            <div className="panel-header">
              <h2>{t.billingTitle}</h2>
              <p>{t.billingHint}</p>
            </div>

            <div className="segmented-control compact-control">
              <button
                className={reportRange === 'week' ? 'active' : ''}
                type="button"
                onClick={() => setReportRange('week')}
              >
                {t.weekly}
              </button>
              <button
                className={reportRange === 'month' ? 'active' : ''}
                type="button"
                onClick={() => setReportRange('month')}
              >
                {t.monthly}
              </button>
            </div>

            <div className="finance-grid">
              <article className="finance-card">
                <span>{t.reportCount}</span>
                <strong>{reportOrders.length}</strong>
              </article>
              <article className="finance-card">
                <span>{t.reportValue}</span>
                <strong>{reportTotal} SAR</strong>
              </article>
            </div>

            <div className="status-actions">
              <button className="btn-light" disabled={!reportOrders.length} type="button" onClick={exportReportCsv}>
                {t.exportCsv}
              </button>
              <button className="btn-primary" disabled={!reportOrders.length} type="button" onClick={printReport}>
                {t.exportPdf}
              </button>
            </div>

            <div className="order-list compact-order-list">
              {reportOrders.length ? (
                reportOrders.map((order) => (
                  <article className="order-card report-order-card" key={order.id}>
                    <strong>
                      #{formatOrderNumber(order.id)} - {order.customerName}
                    </strong>
                    <p>{buildLocationLabel(order)}</p>
                    <p>{order.technicianName || t.unassigned}</p>
                    <p>{Number(order.extras?.totalPrice || 0)} SAR</p>
                  </article>
                ))
              ) : (
                <p className="muted">{t.noApproved}</p>
              )}
            </div>
          </section>

          <section className="panel ops-section">
            <div className="panel-header">
              <h2>{t.sampleTools}</h2>
            </div>
            <div className="status-actions">
              <button
                className="btn-light"
                disabled={runningAdminTool}
                type="button"
                onClick={() => runSampleDataAction('reset')}
              >
                {t.resetSampleDataButton}
              </button>
              <button
                className="btn-danger"
                disabled={runningAdminTool}
                type="button"
                onClick={() => runSampleDataAction('clear')}
              >
                {t.clearSampleDataButton}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
