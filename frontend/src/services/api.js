// Frontend API Service
import axios from 'axios';

const CART_STORAGE_KEY = 'rentitCart';

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalhost
    ? 'http://127.0.0.1:8787/api'
    : '/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service
export const authService = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => localStorage.removeItem('authToken'),
};

// Products Service
export const productService = {
  getAll: (filters) => apiClient.get('/products', { params: filters }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
};

export const adminService = {
  getProducts: () => apiClient.get('/admin/products'),
  getUsers: () => apiClient.get('/admin/users'),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  getBookings: () => apiClient.get('/admin/bookings'),
  updateBooking: (id, data) => apiClient.put(`/admin/bookings/${id}`, data),
};

// Bookings Service
export const bookingService = {
  getAll: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/bookings', data),
  cancel: (id) => apiClient.put(`/bookings/${id}/cancel`),
};

export const orderService = {
  getAll: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  cancel: (id) => apiClient.put(`/bookings/${id}/cancel`),
};

export const cartService = {
  checkout: (items) => apiClient.post('/cart/checkout', { items }),
};

const readCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  return items;
};

const clampCartQuantity = (quantity, maxQuantity) =>
  Math.max(1, Math.min(Number(quantity || 1), Number(maxQuantity || quantity || 1)));

export const cartStorage = {
  getItems: () => readCart(),
  addItem: (item) => {
    const items = readCart();
    const existingIndex = items.findIndex(
      (entry) =>
        String(entry.productId) === String(item.productId) &&
        entry.startDate === item.startDate &&
        entry.endDate === item.endDate
    );

    if (existingIndex >= 0) {
      const current = items[existingIndex];
      items[existingIndex] = {
        ...current,
        quantity: clampCartQuantity(
          Number(current.quantity || 0) + Number(item.quantity || 1),
          current.availableQuantity || item.availableQuantity
        ),
      };
    } else {
      items.push({
        ...item,
        quantity: clampCartQuantity(item.quantity, item.availableQuantity),
      });
    }

    return writeCart(items);
  },
  updateItem: (cartItemId, nextValues) => {
    const items = readCart().map((item) =>
      item.id === cartItemId
        ? {
            ...item,
            ...nextValues,
            quantity: clampCartQuantity(
              nextValues.quantity ?? item.quantity,
              item.availableQuantity
            ),
          }
        : item
    );
    return writeCart(items);
  },
  removeItem: (cartItemId) => writeCart(readCart().filter((item) => item.id !== cartItemId)),
  clear: () => writeCart([]),
};

// Payments Service
export const paymentService = {
  createPayment: (data) => apiClient.post('/payments', data),
  getPaymentStatus: (id) => apiClient.get(`/payments/${id}`),
};

export default apiClient;
