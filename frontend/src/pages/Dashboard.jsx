import React, { useEffect, useMemo, useState } from 'react';
import { useLang } from '../context/LangContext';
import { formatSaudiPhoneDisplay, operationsService, serviceCatalogItems } from '../services/api';

const emptyOrderForm = {
  customerName: '',
  phone: '',
  address: '',
  acType: '',
  scheduledDate: '',
  technicianId: '',
  notes: '',
  serviceItems: [],
};

const emptyTechnicianForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  region: 'Eastern Province',
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
    rubber_pads: 'Supply and install rubber pads for outdoor units',
    drain_pipes: 'Supply and install water drain pipes',
    electric_socket: 'Supply and install a power socket',
    electric_cable: 'Supply and install electrical cable with protective sleeve',
    copper_asian: 'Supply and install copper pipes - Asian copper',
    copper_american: 'Supply and install copper pipes - American copper',
    copper_welding: 'Welding new copper pipes to old pipes with different sizes',
    window_frame: 'Supply and install wooden frame for window AC unit',
    split_removal: 'Removal fee for an old split AC unit',
    window_removal: 'Removal fee for an old window AC unit',
    bracket_u24: 'Supply and install wall bracket for 12K / 18K / 24K BTU units',
    bracket_gt24: 'Supply and install wall bracket for units above 24K BTU',
    scaffold_one: 'One-floor scaffold',
    scaffold_two: 'Two-floor scaffold',
  },
  ar: {
    rubber_pads: 'توريد وتركيب قواعد مطاطية للوحدات الخارجية',
    drain_pipes: 'توريد وتركيب أنابيب تصريف المياه',
    electric_socket: 'توريد وتركيب مقبس كهربائي',
    electric_cable: 'توريد وتركيب كابل كهربائي مع غلاف واق',
    copper_asian: 'توريد وتركيب أنابيب نحاسية - نحاس (اسيوي)',
    copper_american: 'توريد وتركيب أنابيب نحاسية - نحاس (امريكي)',
    copper_welding: 'لحام أنابيب نحاسية جديدة مع الأنابيب القديمة (بمقاسات مختلفة)',
    window_frame: 'توريد وتركيب إطار خشبي لوحدة تكييف الشباك',
    split_removal: 'رسوم إزالة وحدة تكييف سبليت قديمة',
    window_removal: 'رسوم إزالة وحدة تكييف شباك قديمة',
    bracket_u24: 'توريد وتركيب حامل جداري لوحدات تكييف بسعات 12K / 18K / 24K BTU',
    bracket_gt24: 'توريد وتركيب حامل جداري للوحدات التي تزيد سعتها عن 24K BTU',
    scaffold_one: 'سقالة دور واحد',
    scaffold_two: 'سقالة دورين',
  },
};

const buildServiceItems = (lang, current = []) => {
  const currentMap = new Map((current || []).map((item) => [item.id, item]));
  return serviceCatalogItems.map((entry) => {
    const existing = currentMap.get(entry.id);
    return {
      id: entry.id,
      description: serviceDescriptions[lang]?.[entry.id] || serviceDescriptions.en[entry.id] || entry.id,
      price: entry.price,
      unit: lang === 'ar' ? entry.unit.replace('per set', 'لكل مجموعة').replace('per meter', 'لكل متر').replace('per piece', 'لكل قطعة').replace('per frame', 'لكل إطار').replace('per unit', 'لكل وحدة').replace('per bracket', 'لكل حامل').replace('fixed', 'ثابت') : entry.unit,
      selected: Boolean(existing),
      quantity: existing?.quantity || 1,
      totalPrice: existing?.totalPrice || entry.price,
    };
  });
};

const serviceTotal = (items = []) =>
  (items || []).reduce((sum, item) => sum + (Number(item.totalPrice || item.price * (item.quantity || 1)) || 0), 0);

const copy = {
  en: {
    eyebrow: 'Official admin dashboard',
    title: 'Operations control room',
    subtitle: 'Manage installation jobs, assign technicians, and create official accounts from one place.',
    loading: 'Loading the admin dashboard...',
    stats: {
      totalOrders: 'Total orders',
      pendingOrders: 'Pending orders',
      activeOrders: 'Active orders',
      availableTechnicians: 'Available technicians',
    },
    orderForm: 'Create a new order',
    orderFormHint: 'Log the customer details first, then assign the correct technician for the region.',
    technicianForm: 'Create a technician account',
    technicianFormHint: 'Add a technician profile, login account, and Saudi region in one step.',
    createOrderButton: 'Create order',
    createTechnicianButton: 'Create technician',
    creating: 'Creating...',
    saving: 'Saving...',
    services: 'Services and add-ons',
    selectedServices: 'Selected services',
    servicesTotal: 'Services total',
    servicesHint: 'Choose the services and extras that belong to the order.',
    orderSearchPlaceholder: 'Search by order number, customer, phone, or address',
    orderSearchLabel: 'Search orders',
    orderNumber: 'Order #',
    customerName: 'Customer name',
    phone: 'Phone number',
    location: 'Location',
    acType: 'AC types',
    scheduledDate: 'Scheduled date',
    assignTechnician: 'Assign technician',
    notes: 'Notes',
    technicianInfo: 'Live technician info',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    password: 'Password',
    region: 'Saudi region',
    technicalHint: 'Coverage notes, specialization, or any extra information',
    orderTracking: 'Order tracking',
    orderTrackingHint: 'Change the technician or update the status from the same screen.',
    technicianLabel: 'Technician',
    statusLabel: 'Status',
    extrasLabel: 'Collected extras',
    orderSearchResult: 'Matching orders',
    noTechnicians: 'No technicians have been added yet.',
    statusOptions: {
      pending: 'Pending',
      en_route: 'En route',
      in_progress: 'In progress',
      completed: 'Completed',
      canceled: 'Canceled',
    },
    regionLabel: 'Region',
    regionSearchPlaceholder: 'All regions',
    acPlaceholder: 'Example: Split AC 24,000 BTU\nWindow AC 12,000 BTU\nCassette AC 48,000 BTU',
    phonePlaceholder: '05xxxxxxxx',
    messageCreatedOrder: 'Order created and assigned successfully.',
    messageCreatedTechnician: 'Technician account created successfully.',
    messageUpdatedTechnician: 'Technician updated successfully.',
    messageUpdatedStatus: 'Order status updated.',
    messageUnableOrder: 'Unable to create the order.',
    messageUnableTechnician: 'Unable to create the technician account.',
    orderNumberLabel: 'Order number',
    orderSummary: 'Order summary',
    technicianBusy: 'Busy',
    technicianAvailable: 'Available',
  },
  ar: {
    eyebrow: 'لوحة الإدارة الرسمية',
    title: 'غرفة تحكم العمليات',
    subtitle: 'إدارة الطلبات وتعيين الفنيين وإنشاء الحسابات الرسمية من مكان واحد.',
    loading: 'جارٍ تحميل لوحة الإدارة...',
    stats: {
      totalOrders: 'إجمالي الطلبات',
      pendingOrders: 'طلبات بانتظار التعيين',
      activeOrders: 'طلبات نشطة',
      availableTechnicians: 'الفنيون المتاحون',
    },
    orderForm: 'إنشاء طلب جديد',
    orderFormHint: 'سجّل بيانات العميل أولًا ثم عيّن الفني المناسب للمنطقة.',
    technicianForm: 'إنشاء حساب فني',
    technicianFormHint: 'أضف بيانات الفني وحساب الدخول والمنطقة السعودية في خطوة واحدة.',
    createOrderButton: 'إنشاء الطلب',
    createTechnicianButton: 'إنشاء الفني',
    creating: 'جارٍ الإنشاء...',
    saving: 'جارٍ الحفظ...',
    services: 'الخدمات والإضافات',
    selectedServices: 'الخدمات المختارة',
    servicesTotal: 'إجمالي الخدمات',
    servicesHint: 'اختر الخدمات والإضافات التي تخص هذا الطلب.',
    orderSearchPlaceholder: 'ابحث برقم الطلب أو اسم العميل أو الجوال أو العنوان',
    orderSearchLabel: 'البحث في الطلبات',
    orderNumber: 'رقم الطلب',
    customerName: 'اسم العميل',
    phone: 'رقم الجوال',
    location: 'الموقع',
    acType: 'أنواع المكيفات',
    scheduledDate: 'موعد الجدولة',
    assignTechnician: 'إسناد الفني',
    notes: 'ملاحظات',
    technicianInfo: 'معلومات الفني المباشرة',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    region: 'المنطقة السعودية',
    technicalHint: 'ملاحظات التغطية أو التخصص أو أي معلومات إضافية',
    orderTracking: 'متابعة الطلبات',
    orderTrackingHint: 'عدّل الفني أو الحالة من نفس الشاشة.',
    technicianLabel: 'الفني',
    statusLabel: 'الحالة',
    extrasLabel: 'الإضافات المحصلة',
    orderSearchResult: 'الطلبات المطابقة',
    noTechnicians: 'لم يتم إضافة أي فنيين بعد.',
    statusOptions: {
      pending: 'قيد الانتظار',
      en_route: 'في الطريق',
      in_progress: 'جاري التنفيذ',
      completed: 'مكتمل',
      canceled: 'ملغى',
    },
    regionLabel: 'المنطقة',
    regionSearchPlaceholder: 'كل المناطق',
    acPlaceholder: 'مثال: سبليت 24000\nشباك 12000\nكاسيت 48000',
    phonePlaceholder: '05xxxxxxxx',
    messageCreatedOrder: 'تم إنشاء الطلب وتعيينه بنجاح.',
    messageCreatedTechnician: 'تم إنشاء حساب الفني بنجاح.',
    messageUpdatedTechnician: 'تم تحديث الفني بنجاح.',
    messageUpdatedStatus: 'تم تحديث حالة الطلب.',
    messageUnableOrder: 'تعذر إنشاء الطلب.',
    messageUnableTechnician: 'تعذر إنشاء حساب الفني.',
    orderNumberLabel: 'رقم الطلب',
    orderSummary: 'ملخص الطلب',
    technicianBusy: 'مشغول',
    technicianAvailable: 'متاح',
  },
};

const getRegionLabel = (lang, value) => regionOptions.find((entry) => entry.value === value)?.[lang] || value;

const formatOrderNumber = (value) => String(value || '').replace(/^ORD-/, '');

export default function Dashboard() {
  const { lang } = useLang();
  const [dashboard, setDashboard] = useState(null);
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [technicianForm, setTechnicianForm] = useState(emptyTechnicianForm);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingTechnician, setSavingTechnician] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const t = copy[lang] || copy.en;

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await operationsService.getDashboard();
      setDashboard(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    window.addEventListener('operations-updated', loadDashboard);
    return () => window.removeEventListener('operations-updated', loadDashboard);
  }, []);

  const stats = useMemo(() => {
    if (!dashboard?.summary) {
      return [];
    }

    return [
      { label: t.stats.totalOrders, value: dashboard.summary.totalOrders },
      { label: t.stats.pendingOrders, value: dashboard.summary.pendingOrders },
      { label: t.stats.activeOrders, value: dashboard.summary.activeOrders },
      { label: t.stats.availableTechnicians, value: dashboard.summary.availableTechnicians },
    ];
  }, [dashboard, t]);

  const orderFormServices = useMemo(() => buildServiceItems(lang, orderForm.serviceItems), [lang, orderForm.serviceItems]);

  const technicianWorkload = useMemo(() => {
    const orders = dashboard?.orders || [];

    return (dashboard?.technicians || []).map((technician) => {
      const assignedOrders = orders.filter((order) => String(order.technicianId) === String(technician.id));
      const activeOrders = assignedOrders.filter((order) => ['pending', 'en_route', 'in_progress'].includes(order.status));
      const lastOrder = assignedOrders[0] || null;

      return {
        ...technician,
        assignedOrdersCount: assignedOrders.length,
        activeOrdersCount: activeOrders.length,
        lastOrderNumber: lastOrder ? formatOrderNumber(lastOrder.id) : null,
        lastOrderStatus: lastOrder?.status || null,
      };
    });
  }, [dashboard]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const orders = dashboard?.orders || [];

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const haystack = [
        order.id,
        formatOrderNumber(order.id),
        order.customerName,
        order.phone,
        formatSaudiPhoneDisplay(order.phone),
        order.address,
        order.acType,
        order.technicianName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [dashboard, search]);

  const submitOrder = async (event) => {
    event.preventDefault();
    try {
      setSavingOrder(true);
      setMessage('');
      await operationsService.createOrder({
        ...orderForm,
        serviceItems: orderForm.serviceItems.filter((item) => item.selected),
      });
      setOrderForm(emptyOrderForm);
      setMessage(t.messageCreatedOrder);
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || error.message || t.messageUnableOrder);
    } finally {
      setSavingOrder(false);
    }
  };

  const submitTechnician = async (event) => {
    event.preventDefault();
    try {
      setSavingTechnician(true);
      setMessage('');
      await operationsService.createTechnician(technicianForm);
      setTechnicianForm(emptyTechnicianForm);
      setMessage(t.messageCreatedTechnician);
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || error.message || t.messageUnableTechnician);
    } finally {
      setSavingTechnician(false);
    }
  };

  const updateOrder = async (orderId, changes, successText) => {
    setMessage('');
    await operationsService.updateOrder(orderId, changes);
    setMessage(successText);
    await loadDashboard();
  };

  const updateExtras = async (orderId, extras) => {
    setMessage('');
    await operationsService.updateExtras(orderId, extras);
    setMessage(lang === 'ar' ? 'تم تحديث الإضافات بنجاح.' : 'Add-ons updated successfully.');
    await loadDashboard();
  };

  const updateServiceItems = async (orderId, serviceItems) => {
    setMessage('');
    await operationsService.updateOrder(orderId, { serviceItems });
    setMessage(lang === 'ar' ? 'تم تحديث الخدمات بنجاح.' : 'Services updated successfully.');
    await loadDashboard();
  };

  const cancelOrder = async (orderId) => {
    const reason = window.prompt(lang === 'ar' ? 'أدخل سبب إلغاء الطلب' : 'Enter the cancellation reason') || '';
    setMessage('');
    await operationsService.cancelOrder(orderId, reason);
    setMessage(lang === 'ar' ? 'تم إلغاء الطلب.' : 'Order canceled.');
    await loadDashboard();
  };

  const toggleOrderFormService = (serviceId) => {
    setOrderForm((current) => {
      const existing = current.serviceItems.find((item) => item.id === serviceId);
      const nextItems = existing
        ? current.serviceItems.filter((item) => item.id !== serviceId)
        : [
            ...current.serviceItems,
            {
              ...serviceCatalogItems.find((item) => item.id === serviceId),
              description: serviceDescriptions[lang]?.[serviceId] || serviceDescriptions.en[serviceId],
              quantity: 1,
              selected: true,
              totalPrice: serviceCatalogItems.find((item) => item.id === serviceId)?.price || 0,
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

  if (loading) {
    return <section className="page-shell">{t.loading}</section>;
  }

  return (
    <section className="page-shell" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="section-heading">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="section-subtitle">{t.subtitle}</p>
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

      <div className="dashboard-grid">
        <form className="panel form-panel" onSubmit={submitOrder}>
          <div className="panel-header">
            <h2>{t.orderForm}</h2>
            <p>{t.orderFormHint}</p>
          </div>

          <label>{t.customerName}</label>
          <input
            className="input"
            value={orderForm.customerName}
            onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })}
            required
          />

          <label>{t.phone}</label>
          <input
            className="input"
            value={orderForm.phone}
            onChange={(event) => setOrderForm({ ...orderForm, phone: event.target.value })}
            placeholder={t.phonePlaceholder}
            required
          />

          <label>{t.location}</label>
          <input
            className="input"
            value={orderForm.address}
            onChange={(event) => setOrderForm({ ...orderForm, address: event.target.value })}
            required
          />

          <label>{t.acType}</label>
          <textarea
            className="input textarea"
            value={orderForm.acType}
            onChange={(event) => setOrderForm({ ...orderForm, acType: event.target.value })}
            placeholder={t.acPlaceholder}
            rows={4}
            required
          />

          <label>{t.scheduledDate}</label>
          <input
            className="input"
            type="date"
            value={orderForm.scheduledDate}
            onChange={(event) => setOrderForm({ ...orderForm, scheduledDate: event.target.value })}
            required
          />

          <label>{t.assignTechnician}</label>
          <select
            className="input"
            value={orderForm.technicianId}
            onChange={(event) => setOrderForm({ ...orderForm, technicianId: event.target.value })}
            required
          >
            <option value="">{lang === 'ar' ? 'اختر الفني' : 'Choose a technician'}</option>
            {dashboard?.technicians?.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name} - {getRegionLabel(lang, technician.region || technician.zone)} -{' '}
                {technician.status === 'available' ? t.technicianAvailable : t.technicianBusy}
              </option>
            ))}
          </select>

          <label>{t.notes}</label>
          <textarea
            className="input textarea"
            value={orderForm.notes}
            onChange={(event) => setOrderForm({ ...orderForm, notes: event.target.value })}
            placeholder={lang === 'ar' ? 'ملاحظات الوصول أو ملاحظات العميل' : 'Access instructions or customer notes'}
          />

          <div className="order-addon-panel">
            <h4>{t.services}</h4>
            <p className="muted">{t.servicesHint}</p>
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
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(event) => changeOrderFormServiceQuantity(service.id, event.target.value)}
                    />
                  ) : null}
                </label>
              ))}
            </div>
            <div className="order-addon-total">
              <span>{t.servicesTotal}</span>
              <strong>{serviceTotal(orderForm.serviceItems)} SAR</strong>
            </div>
          </div>

          <button className="btn-primary" disabled={savingOrder} type="submit">
            {savingOrder ? t.creating : t.createOrderButton}
          </button>
        </form>

        <div className="panel dashboard-sidebar">
          <form className="nested-form" onSubmit={submitTechnician}>
            <div className="panel-header">
              <h2>{t.technicianForm}</h2>
              <p>{t.technicianFormHint}</p>
            </div>

            <div className="grid-two">
              <div>
                <label>{t.firstName}</label>
                <input
                  className="input"
                  value={technicianForm.firstName}
                  onChange={(event) => setTechnicianForm({ ...technicianForm, firstName: event.target.value })}
                  required
                />
              </div>
              <div>
                <label>{t.lastName}</label>
                <input
                  className="input"
                  value={technicianForm.lastName}
                  onChange={(event) => setTechnicianForm({ ...technicianForm, lastName: event.target.value })}
                  required
                />
              </div>
            </div>

            <label>{t.email}</label>
            <input
              className="input"
              type="email"
              value={technicianForm.email}
              onChange={(event) => setTechnicianForm({ ...technicianForm, email: event.target.value })}
              required
            />

            <label>{t.phone}</label>
            <input
              className="input"
              value={technicianForm.phone}
              onChange={(event) => setTechnicianForm({ ...technicianForm, phone: event.target.value })}
              placeholder={t.phonePlaceholder}
              required
            />

            <label>{t.password}</label>
            <input
              className="input"
              type="password"
              value={technicianForm.password}
              onChange={(event) => setTechnicianForm({ ...technicianForm, password: event.target.value })}
              required
            />

            <label>{t.region}</label>
            <select
              className="input"
              value={technicianForm.region}
              onChange={(event) => setTechnicianForm({ ...technicianForm, region: event.target.value })}
              required
            >
              {regionOptions.map((region) => (
                <option key={region.value} value={region.value}>
                  {lang === 'ar' ? region.ar : region.value}
                </option>
              ))}
            </select>

            <label>{t.technicianInfo}</label>
            <textarea
              className="input textarea"
              value={technicianForm.notes}
              onChange={(event) => setTechnicianForm({ ...technicianForm, notes: event.target.value })}
              placeholder={t.technicalHint}
            />

            <button className="btn-secondary" disabled={savingTechnician} type="submit">
              {savingTechnician ? t.creating : t.createTechnicianButton}
            </button>
          </form>

          <div className="finance-grid">
            <article className="finance-card">
              <span>{lang === 'ar' ? 'الإيرادات من الإضافات' : 'Revenue from copper and bases'}</span>
              <strong>{dashboard?.summary?.extrasRevenue || 0} SAR</strong>
            </article>
            <article className="finance-card">
              <span>{lang === 'ar' ? 'إجمالي أمتار النحاس' : 'Total copper meters'}</span>
              <strong>{dashboard?.summary?.copperMeters || 0} m</strong>
            </article>
            <article className="finance-card">
              <span>{lang === 'ar' ? 'عدد القواعد المباعة' : 'Bases sold'}</span>
              <strong>{dashboard?.summary?.basesCount || 0}</strong>
            </article>
          </div>

          <div className="tech-list">
            <h3>{lang === 'ar' ? 'حمولة عمل الفنيين المباشرة' : 'Live technician workload'}</h3>
            {technicianWorkload.length ? (
              technicianWorkload.map((technician) => (
                <article className="tech-card" key={technician.id}>
                  <div>
                    <strong>{technician.name}</strong>
                    <p>{getRegionLabel(lang, technician.region || technician.zone)}</p>
                    <p>{formatSaudiPhoneDisplay(technician.phone)}</p>
                    <p>{technician.email}</p>
                    {technician.notes ? <p className="muted">{technician.notes}</p> : null}
                    <div className="tech-metrics">
                      <span>
                        <strong>{technician.assignedOrdersCount}</strong>
                        <small>{lang === 'ar' ? 'طلبات مسندة' : 'Assigned orders'}</small>
                      </span>
                      <span>
                        <strong>{technician.activeOrdersCount}</strong>
                        <small>{lang === 'ar' ? 'نشطة الآن' : 'Active now'}</small>
                      </span>
                      <span>
                        <strong>{technician.lastOrderNumber || '—'}</strong>
                        <small>{lang === 'ar' ? 'آخر طلب' : 'Last order'}</small>
                      </span>
                    </div>
                  </div>
                  <span className={`status-badge ${technician.status}`}>
                    {technician.status === 'available' ? t.technicianAvailable : t.technicianBusy}
                  </span>
                </article>
              ))
            ) : (
              <p className="muted">{t.noTechnicians}</p>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>{t.orderTracking}</h2>
          <p>{t.orderTrackingHint}</p>
        </div>

        <div className="dashboard-toolbar">
          <label className="filter-field">
            <span>{t.orderSearchLabel}</span>
            <input
              className="input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.orderSearchPlaceholder}
            />
          </label>
          <div className="dashboard-toolbar-count">
            <strong>{filteredOrders.length}</strong>
            <span>{t.orderSearchResult}</span>
          </div>
        </div>

        <div className="order-list">
          {filteredOrders.map((order) => (
            <article className="order-card" key={order.id}>
                  <div className="order-main">
                    <div>
                      <div className="order-topline">
                        <strong>
                          {t.orderNumber} {formatOrderNumber(order.id)}
                    </strong>
                    <span className={`status-badge ${order.status}`}>
                      {t.statusOptions[order.status] || order.status}
                    </span>
                  </div>
                  <p>{order.customerName}</p>
                  <p>{formatSaudiPhoneDisplay(order.phone)}</p>
                  <p>{order.address}</p>
                  <p className="order-ac-type">{order.acType}</p>
                  <p>
                    {t.technicianLabel}: {order.technicianName}
                  </p>
                  <p>
                    {t.scheduledDate}: {order.scheduledDate}
                  </p>
                  <p>
                    {t.extrasLabel}: {order.extras?.totalPrice || 0} SAR
                  </p>

                  <div className="order-addon-panel">
                    <h4>{t.services}</h4>
                    <p className="muted">{lang === 'ar' ? 'الخدمات التالية تُحفظ داخل الطلب وتُحسب تلقائيًا.' : 'These services are stored with the order and totalized automatically.'}</p>
                    <div className="grid-two">
                      <label>
                        {lang === 'ar' ? 'متر النحاس' : 'Copper meters'}
                        <input
                          className="input"
                          type="number"
                          min="0"
                          value={order.extras?.copperMeters || 0}
                          onChange={(event) =>
                            updateExtras(order.id, {
                              copperMeters: Number(event.target.value) || 0,
                              baseIncluded: Boolean(order.extras?.baseIncluded),
                            })
                          }
                        />
                      </label>
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={Boolean(order.extras?.baseIncluded)}
                          onChange={(event) =>
                            updateExtras(order.id, {
                              copperMeters: Number(order.extras?.copperMeters) || 0,
                              baseIncluded: event.target.checked,
                            })
                          }
                        />
                        <span>{lang === 'ar' ? 'قاعدة إضافية' : 'Base unit'}</span>
                      </label>
                    </div>
                    <div className="service-select-grid">
                      {buildServiceItems(lang, order.serviceItems).map((service) => (
                        <label className={`service-option ${service.selected ? 'selected' : ''}`} key={service.id}>
                          <input
                            type="checkbox"
                            checked={service.selected}
                            onChange={() =>
                              updateServiceItems(
                                order.id,
                                service.selected
                                  ? order.serviceItems.filter((item) => item.id !== service.id)
                                  : [
                                      ...(order.serviceItems || []),
                                      {
                                        id: service.id,
                                        description: service.description,
                                        price: service.price,
                                        unit: service.unit,
                                        quantity: 1,
                                        totalPrice: service.price,
                                      },
                                    ]
                              )
                            }
                          />
                          <span>
                            <strong>{service.price} SAR</strong>
                            <small>{service.description}</small>
                            <small>{service.unit}</small>
                          </span>
                          {service.selected ? (
                            <input
                              className="input compact-input"
                              type="number"
                              min="1"
                              value={service.quantity}
                              onChange={(event) =>
                                updateServiceItems(
                                  order.id,
                                  (order.serviceItems || []).map((item) =>
                                    item.id === service.id
                                      ? {
                                          ...item,
                                          quantity: Math.max(1, Number(event.target.value) || 1),
                                          totalPrice: service.price * Math.max(1, Number(event.target.value) || 1),
                                        }
                                      : item
                                  )
                                )
                              }
                            />
                          ) : null}
                        </label>
                      ))}
                    </div>
                    <div className="order-addon-total">
                      <span>{t.servicesTotal}</span>
                      <strong>{serviceTotal(order.serviceItems)} SAR</strong>
                    </div>
                    <div className="order-addon-total final-total">
                      <span>{lang === 'ar' ? 'الإجمالي النهائي' : 'Final total'}</span>
                      <strong>{order.extras?.totalPrice || 0} SAR</strong>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <select
                    className="input compact-input"
                    value={order.technicianId}
                    onChange={(event) =>
                      updateOrder(order.id, { technicianId: event.target.value }, t.messageUpdatedTechnician)
                    }
                  >
                    {dashboard?.technicians?.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="input compact-input"
                    value={order.status}
                    onChange={(event) => updateOrder(order.id, { status: event.target.value }, t.messageUpdatedStatus)}
                  >
                    {Object.entries(t.statusOptions).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {['completed', 'canceled'].includes(order.status) ? null : (
                    <button className="btn-danger" type="button" onClick={() => cancelOrder(order.id)}>
                      {lang === 'ar' ? 'إلغاء الطلب' : 'Cancel order'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
