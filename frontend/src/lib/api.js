import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_user');
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/register' &&
          window.location.pathname !== '/admin') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
  resetPasswordWithToken: (token, newPassword) => api.post('/auth/reset-password', { token, new_password: newPassword }),
};

// Posts
export const postsAPI = {
  getAll: () => api.get('/posts'),
  getOne: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
};

// Products
export const productsAPI = {
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Events
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  rsvp: (id) => api.post(`/events/${id}/rsvp`),
  cancelRsvp: (id) => api.delete(`/events/${id}/rsvp`),
  getRsvps: (id) => api.get(`/events/${id}/rsvps`),
  getMyRsvps: () => api.get('/my-rsvps'),
};

// Actions
export const actionsAPI = {
  getAll: () => api.get('/actions'),
  getOne: (id) => api.get(`/actions/${id}`),
  create: (data) => api.post('/actions', data),
  update: (id, data) => api.put(`/actions/${id}`, data),
  delete: (id) => api.delete(`/actions/${id}`),
  signup: (id, data = {}) => api.post(`/actions/${id}/signup`, data),
  cancelSignup: (id) => api.delete(`/actions/${id}/signup`),
  getParticipants: (id) => api.get(`/actions/${id}/participants`),
  getMySignups: () => api.get('/my-signups'),
};

// Cart
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, quantity) => api.put(`/cart/${itemId}?quantity=${quantity}`),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Notify Me
export const notifyAPI = {
  subscribe: (email) => api.post('/notify', { email }),
  getSubscribers: () => api.get('/notify/subscribers'),
  unsubscribe: (email) => api.delete(`/notify/${email}`),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  resetUserPassword: (userId) => api.post(`/admin/users/${userId}/reset-password`),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  seed: () => api.post('/seed'),
};

export default api;
