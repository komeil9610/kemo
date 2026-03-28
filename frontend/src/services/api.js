import axios from 'axios';

const STORAGE_KEY = 'tarkeeb-pro-db';

export const normalizeSaudiPhoneNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('966')) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith('5') && digits.length === 9) {
    return `0${digits}`;
  }

  if (digits.startsWith('0')) {
    return digits;
  }

  return digits.length === 9 ? `0${digits}` : digits;
};

export const formatSaudiPhoneDisplay = (value) => {
  const normalized = normalizeSaudiPhoneNumber(value);
  return normalized || String(value || '');
};

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalhost ? 'http://127.0.0.1:5000/api' : '/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const defaultState = {
  users: [
    {
      id: 'admin-1',
      firstName: 'Bob',
      lastName: 'Kumeel',
      name: 'Bob Kumeel',
      email: 'bobkumeel@gmail.com',
      phone: '0500000001',
      password: 'Kom123asd@',
      role: 'admin',
    },
    {
      id: 'tech-user-1',
      firstName: 'Kumeel',
      lastName: 'Alnahab',
      name: 'Eastern Technician',
      email: 'kumeelalnahab@gmail.com',
      phone: '0500000002',
      password: 'Komeil@123',
      role: 'technician',
      technicianId: 'tech-1',
    },
  ],
  pricing: {
    includedCopperMeters: 3,
    copperPricePerMeter: 85,
    basePrice: 180,
  },
  technicians: [
    {
      id: 'tech-1',
      userId: 'tech-user-1',
      name: 'Eastern Technician',
      firstName: 'Kumeel',
      lastName: 'Alnahab',
      email: 'kumeelalnahab@gmail.com',
      phone: '0500000002',
      region: 'Eastern Province',
      zone: 'Eastern Province',
      status: 'available',
      notes: 'Eastern region coverage across Saudi Arabia.',
    },
  ],
  orders: [
    {
      id: 'ORD-1001',
      numericId: 1001,
      customerName: 'Abu Khaled',
      phone: '0555000111',
      address: 'Al Yasmin District - Riyadh',
      acType: 'Split AC 24,000 BTU',
      status: 'pending',
      scheduledDate: '2026-03-29',
      notes: 'Second floor - elevator available',
      technicianId: 'tech-1',
      technicianName: 'Eastern Technician',
      createdAt: '2026-03-28T08:15:00.000Z',
      extras: {
        copperMeters: 2,
        baseIncluded: true,
        totalPrice: 350,
      },
      photos: [],
    },
  ],
};

const defaultHomeSettings = {
  heroKicker: 'PWA + Admin + Technician Workflow',
  heroTitle: 'Manage AC installation orders from your office to the customer site.',
  heroSubtitle:
    'One dashboard to log orders, assign technicians, track execution, and calculate copper and base extras instantly.',
  primaryButtonText: 'Open Admin Dashboard',
  primaryButtonUrl: '/dashboard',
  secondaryButtonText: 'Open Technician View',
  secondaryButtonUrl: '/tasks',
  stats: [
    { value: '1', label: 'Active technicians' },
    { value: '4', label: 'Live order states' },
    { value: '85 SAR', label: 'Copper meter price' },
  ],
};

const defaultFooter = {
  aboutText: 'Tarkeeb Pro keeps orders and field operations organized from one clear screen.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'Admin Dashboard', url: '/dashboard' },
    { label: 'Technician Tasks', url: '/tasks' },
  ],
  customerServiceLinks: [
    { label: 'Support', url: 'mailto:ops@tarkeebpro.sa' },
    { label: 'WhatsApp', url: 'https://wa.me/966500000000' },
    { label: 'Call us', url: 'tel:+966500000000' },
  ],
  socialLinks: [
    { platform: 'instagram', url: 'https://instagram.com/tarkeebpro' },
    { platform: 'x', url: 'https://x.com/tarkeebpro' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/tarkeebpro' },
  ],
  copyrightText: 'Tarkeeb Pro - MVP release',
};

const delay = (value) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), 120);
  });

const clone = (value) => JSON.parse(JSON.stringify(value));

const mergeSeedData = (primaryItems = [], fallbackItems = [], key) => {
  const seen = new Set();
  const merged = [];

  [...primaryItems, ...fallbackItems].forEach((item) => {
    const identifier = String(item?.[key] ?? '').toLowerCase();
    if (!identifier || seen.has(identifier)) {
      return;
    }

    seen.add(identifier);
    merged.push(item);
  });

  return merged;
};

const normalizeState = (state = {}) => ({
  ...clone(defaultState),
  ...state,
  users: mergeSeedData(defaultState.users, state.users, 'email'),
  technicians: mergeSeedData(defaultState.technicians, state.technicians, 'id'),
});

const buildToken = (user) => btoa(`${user.role}:${user.email}:${Date.now()}`);

const safeJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return clone(defaultState);
  }

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return clone(defaultState);
  }
};

const writeState = (nextState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent('operations-updated'));
  return clone(nextState);
};

const getState = () => clone(readState());

const calculateExtrasTotal = (copperMeters, baseIncluded) => {
  const state = readState();
  const meters = Math.max(0, Number(copperMeters) || 0);
  return meters * state.pricing.copperPricePerMeter + (baseIncluded ? state.pricing.basePrice : 0);
};

const statusLabelMap = {
  pending: 'Pending',
  en_route: 'En route',
  in_progress: 'In progress',
  completed: 'Completed',
  canceled: 'Canceled',
};

const serviceCatalog = [
  { id: 'rubber_pads', price: 45, unit: 'per set' },
  { id: 'drain_pipes', price: 30, unit: 'per meter' },
  { id: 'electric_socket', price: 40, unit: 'per piece' },
  { id: 'electric_cable', price: 25, unit: 'per meter' },
  { id: 'copper_asian', price: 70, unit: 'per meter' },
  { id: 'copper_american', price: 100, unit: 'per meter' },
  { id: 'copper_welding', price: 30, unit: 'per meter' },
  { id: 'window_frame', price: 30, unit: 'per frame' },
  { id: 'split_removal', price: 100, unit: 'per unit' },
  { id: 'window_removal', price: 50, unit: 'per unit' },
  { id: 'bracket_u24', price: 60, unit: 'per bracket' },
  { id: 'bracket_gt24', price: 80, unit: 'per bracket' },
  { id: 'scaffold_one', price: 100, unit: 'fixed' },
  { id: 'scaffold_two', price: 200, unit: 'fixed' },
];

export const serviceCatalogItems = serviceCatalog;

const normalizeServiceItems = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const catalogItem = serviceCatalog.find((entry) => entry.id === item?.id);
      const quantity = Math.max(0, Number(item?.quantity) || 1);
      const price = Number(item?.price ?? catalogItem?.price ?? 0) || 0;
      const totalPrice = Number(item?.totalPrice ?? price * quantity) || 0;
      const description = String(item?.description || '').trim() || catalogItem?.id || '';
      const unit = String(item?.unit || catalogItem?.unit || '').trim();

      if (!catalogItem || !description || !price) {
        return null;
      }

      return {
        id: catalogItem.id,
        description,
        price,
        unit,
        quantity,
        totalPrice,
      };
    })
    .filter(Boolean);

const calculateServiceItemsTotal = (items = []) =>
  normalizeServiceItems(items).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

const normalizeOrderId = (orderId) => {
  const value = String(orderId || '');
  return value.startsWith('ORD-') ? value.replace('ORD-', '') : value;
};

const withFallback = async (remoteAction, localAction) => {
  try {
    return await remoteAction();
  } catch (error) {
    const status = error?.response?.status;
    if (status && status < 500 && status !== 404) {
      throw error;
    }

    return localAction();
  }
};

const computeSummary = (orders, technicians) => {
  const financialTotals = orders.reduce(
    (totals, order) => ({
      extrasRevenue: totals.extrasRevenue + (order.extras?.totalPrice || 0),
      copperMeters: totals.copperMeters + (Number(order.extras?.copperMeters) || 0),
      basesCount: totals.basesCount + (order.extras?.baseIncluded ? 1 : 0),
    }),
    { extrasRevenue: 0, copperMeters: 0, basesCount: 0 }
  );

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    activeOrders: orders.filter((order) => ['en_route', 'in_progress'].includes(order.status)).length,
    completedOrders: orders.filter((order) => order.status === 'completed').length,
    availableTechnicians: technicians.filter((tech) => tech.status === 'available').length,
    ...financialTotals,
  };
};

const localAuthService = {
  async login(email, password) {
    const state = readState();
    const matchedUser = state.users.find(
      (user) => user.email.toLowerCase() === String(email).trim().toLowerCase() && user.password === password
    );

    if (!matchedUser) {
      throw new Error('Invalid login details');
    }

    const technician = matchedUser.technicianId
      ? state.technicians.find((entry) => entry.id === matchedUser.technicianId)
      : null;

    const safeUser = {
      ...matchedUser,
      technicianId: matchedUser.technicianId || technician?.id || null,
      region: technician?.region || matchedUser.region || null,
      zone: technician?.zone || matchedUser.zone || null,
      technicianName: technician?.name || matchedUser.name || null,
    };
    delete safeUser.password;

    if (technician) {
      safeUser.technician = technician;
    }
    return delay({ data: { token: buildToken(safeUser), user: safeUser } });
  },

  async register(userData) {
    const name = userData?.name?.trim();
    const email = userData?.email?.trim();

    if (!name || !email) {
      throw new Error('Name and email are required');
    }

    const user = { id: `temp-${Date.now()}`, name, email, role: 'viewer' };
    return delay({ data: { token: buildToken(user), user } });
  },
};

const localOperationsService = {
  async getDashboard() {
    const state = getState();
    const users = state.users.map(({ password: _password, ...user }) => user);
    return delay({
      data: {
        ...state,
        users,
        summary: computeSummary(state.orders, state.technicians),
      },
    });
  },

  async createOrder(payload) {
    const state = readState();
    const selectedTechnician = state.technicians.find((tech) => tech.id === payload.technicianId) || null;
    const serviceItems = normalizeServiceItems(payload.serviceItems);
    const numericId = Date.now();
    const order = {
      id: `ORD-${numericId}`,
      numericId,
      customerName: payload.customerName,
      phone: normalizeSaudiPhoneNumber(payload.phone),
      address: payload.address,
      acType: payload.acType,
      status: 'pending',
      scheduledDate: payload.scheduledDate,
      notes: payload.notes || '',
      technicianId: selectedTechnician?.id || '',
      technicianName: selectedTechnician?.name || 'Unassigned',
      createdAt: new Date().toISOString(),
      extras: { copperMeters: 0, baseIncluded: false, totalPrice: calculateServiceItemsTotal(serviceItems) },
      serviceItems,
      photos: [],
    };

    writeState({ ...state, orders: [order, ...state.orders] });
    return delay({ data: { order } });
  },

  async updateOrder(orderId, changes) {
    const state = readState();
    const nextOrders = state.orders.map((order) => {
      if (String(order.id) !== String(orderId)) {
        return order;
      }

      const nextOrder = { ...order, ...changes };
      if (changes.serviceItems !== undefined) {
        nextOrder.serviceItems = normalizeServiceItems(changes.serviceItems);
      }
      if (changes.technicianId) {
        const technician = state.technicians.find((entry) => entry.id === changes.technicianId);
        nextOrder.technicianName = technician?.name || 'Unassigned';
      }

      const serviceItemsTotal = calculateServiceItemsTotal(nextOrder.serviceItems || []);
      if (nextOrder.extras) {
        nextOrder.extras = {
          ...nextOrder.extras,
          totalPrice: calculateExtrasTotal(nextOrder.extras.copperMeters, nextOrder.extras.baseIncluded) + serviceItemsTotal,
        };
      }

      return nextOrder;
    });

    const nextState = writeState({ ...state, orders: nextOrders });
    return delay({ data: { order: nextState.orders.find((entry) => String(entry.id) === String(orderId)) } });
  },

  async updateTechnicianStatus(orderId, status) {
    return this.updateOrder(orderId, { status });
  },

  async cancelOrder(orderId, reason = '') {
    return this.updateOrder(orderId, {
      status: 'canceled',
      notes: reason ? String(reason) : undefined,
    });
  },

  async getTechnicianOrders(technicianId) {
    const state = getState();
    return delay({
      data: {
        technician: state.technicians.find((entry) => entry.id === technicianId) || null,
        pricing: state.pricing,
        orders: state.orders.filter((order) => order.technicianId === technicianId),
      },
    });
  },

  async createTechnician(payload) {
    const state = readState();
    const firstName = String(payload?.firstName || '').trim();
    const lastName = String(payload?.lastName || '').trim();
    const email = String(payload?.email || '').trim().toLowerCase();
    const phone = String(payload?.phone || '').trim();
    const password = String(payload?.password || '').trim();
    const region = String(payload?.region || '').trim();
    const notes = String(payload?.notes || '').trim();

    if (!firstName || !lastName || !email || !phone || !password || !region) {
      throw new Error('All technician fields are required');
    }

    if (state.users.some((user) => user.email.toLowerCase() === email)) {
      throw new Error('This email is already registered');
    }

    const technicianId = `tech-${Date.now()}`;
    const userId = `tech-user-${Date.now()}`;
    const name = `${firstName} ${lastName}`.trim();

    const user = {
      id: userId,
      firstName,
      lastName,
      name,
      email,
      phone: normalizeSaudiPhoneNumber(phone),
      password,
      role: 'technician',
      technicianId,
      region,
    };

    const technician = {
      id: technicianId,
      userId,
      name,
      firstName,
      lastName,
      email,
      phone: normalizeSaudiPhoneNumber(phone),
      region,
      zone: region,
      status: 'available',
      notes,
    };

    writeState({
      ...state,
      users: [user, ...state.users],
      technicians: [technician, ...state.technicians],
    });

    const safeUser = { ...user };
    delete safeUser.password;
    return delay({ data: { user: safeUser, technician } });
  },

  async updateExtras(orderId, { copperMeters, baseIncluded }) {
    const state = readState();
    const nextOrders = state.orders.map((order) =>
      String(order.id) === String(orderId)
        ? {
            ...order,
            extras: {
              copperMeters: Number(copperMeters) || 0,
              baseIncluded: Boolean(baseIncluded),
              totalPrice:
                calculateExtrasTotal(copperMeters, Boolean(baseIncluded)) +
                calculateServiceItemsTotal(order.serviceItems || []),
            },
          }
        : order
    );
    const nextState = writeState({ ...state, orders: nextOrders });
    return delay({ data: { order: nextState.orders.find((entry) => String(entry.id) === String(orderId)) } });
  },

  async uploadPhoto(orderId, photo) {
    const state = readState();
    const nextOrders = state.orders.map((order) =>
      String(order.id) === String(orderId)
        ? {
            ...order,
            photos: [
              ...(order.photos || []),
              { id: `photo-${Date.now()}`, ...photo, uploadedAt: new Date().toISOString() },
            ],
          }
        : order
    );
    const nextState = writeState({ ...state, orders: nextOrders });
    return delay({ data: { order: nextState.orders.find((entry) => String(entry.id) === String(orderId)) } });
  },

  async resetDemoData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    window.dispatchEvent(new CustomEvent('operations-updated'));
    return delay({ data: { ok: true } });
  },

  calculateExtrasTotal,
  getStatusLabel(status) {
    return statusLabelMap[status] || status;
  },
};

const remoteOperationsService = {
  getDashboard: () => apiClient.get('/operations/dashboard'),
  createOrder: (data) => apiClient.post('/operations/orders', data),
  updateOrder: (orderId, data) => apiClient.put(`/operations/orders/${normalizeOrderId(orderId)}`, data),
  getTechnicianOrders: () => apiClient.get('/operations/technician/orders'),
  createTechnician: (data) => apiClient.post('/operations/technicians', data),
  updateTechnicianStatus: (orderId, status) =>
    apiClient.put(`/operations/orders/${normalizeOrderId(orderId)}/status`, { status }),
  cancelOrder: (orderId, reason) =>
    apiClient.post(`/operations/orders/${normalizeOrderId(orderId)}/cancel`, { reason }),
  updateExtras: (orderId, data) =>
    apiClient.put(`/operations/orders/${normalizeOrderId(orderId)}/extras`, data),
  uploadPhoto: (orderId, data) =>
    apiClient.post(`/operations/orders/${normalizeOrderId(orderId)}/photos`, data),
};

export const authService = {
  login: (email, password) =>
    withFallback(
      () => apiClient.post('/auth/login', { email, password }),
      () => localAuthService.login(email, password)
    ),
  register: (userData) =>
    withFallback(
      () => apiClient.post('/auth/register', userData),
      () => localAuthService.register(userData)
    ),
  logout: () => localStorage.removeItem('authToken'),
};

export const operationsService = {
  getDashboard: () =>
    withFallback(
      () => remoteOperationsService.getDashboard(),
      () => localOperationsService.getDashboard()
    ),
  createTechnician: (data) =>
    withFallback(
      () => remoteOperationsService.createTechnician(data),
      () => localOperationsService.createTechnician(data)
    ),
  createOrder: (data) =>
    withFallback(
      () => remoteOperationsService.createOrder(data),
      () => localOperationsService.createOrder(data)
    ),
  updateOrder: (orderId, data) =>
    withFallback(
      () => remoteOperationsService.updateOrder(orderId, data),
      () => localOperationsService.updateOrder(orderId, data)
    ),
  getTechnicianOrders: (technicianId) =>
    withFallback(
      () => remoteOperationsService.getTechnicianOrders(),
      () => localOperationsService.getTechnicianOrders(technicianId)
    ),
  updateTechnicianStatus: (orderId, status) =>
    withFallback(
      () => remoteOperationsService.updateTechnicianStatus(orderId, status),
      () => localOperationsService.updateTechnicianStatus(orderId, status)
    ),
  cancelOrder: (orderId, reason) =>
    withFallback(
      () => remoteOperationsService.cancelOrder(orderId, reason),
      () => localOperationsService.cancelOrder(orderId, reason)
    ),
  updateExtras: (orderId, data) =>
    withFallback(
      () => remoteOperationsService.updateExtras(orderId, data),
      () => localOperationsService.updateExtras(orderId, data)
    ),
  uploadPhoto: (orderId, data) =>
    withFallback(
      () => remoteOperationsService.uploadPhoto(orderId, data),
      () => localOperationsService.uploadPhoto(orderId, data)
    ),
  resetDemoData: () => localOperationsService.resetDemoData(),
  calculateExtrasTotal,
  getStatusLabel(status) {
    return statusLabelMap[status] || status;
  },
};

export const notificationsService = {
  list: async () => {
    try {
      return await apiClient.get('/notifications');
    } catch {
      const items = safeJson(sessionStorage.getItem('localNotifications'), []);
      return { data: { notifications: items, unreadCount: items.filter((item) => !item.isRead).length } };
    }
  },
  markRead: async (id) => {
    try {
      return await apiClient.put(`/notifications/${id}/read`);
    } catch {
      return { data: { ok: true } };
    }
  },
  markAllRead: async () => {
    try {
      return await apiClient.put('/notifications/read-all');
    } catch {
      return { data: { ok: true } };
    }
  },
};

export const footerService = {
  get: () => delay({ data: { footer: defaultFooter } }),
};

export const homeService = {
  get: () => delay({ data: { homeSettings: defaultHomeSettings } }),
};

export default apiClient;
