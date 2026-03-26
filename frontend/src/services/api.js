// Frontend API Service
import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalhost
    ? 'http://localhost:5000/api'
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
  getAll: () => apiClient.get('/bookings'),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  create: (data) => apiClient.post('/bookings', data),
  cancel: (id) => apiClient.put(`/bookings/${id}/cancel`),
};

// Payments Service
export const paymentService = {
  createPayment: (data) => apiClient.post('/payments', data),
  getPaymentStatus: (id) => apiClient.get(`/payments/${id}`),
};

export default apiClient;
