import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// API call logging for diagnostics
const apiCallLog = [];
const MAX_LOG_SIZE = 20;

const logApiCall = (entry) => {
  apiCallLog.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  if (apiCallLog.length > MAX_LOG_SIZE) {
    apiCallLog.pop();
  }
  // Also log to console for debugging
  console.log(`[API ${entry.status}] ${entry.method} ${entry.url}`, entry.error || '');
};

export const getApiCallLog = () => [...apiCallLog];

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token and log
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config._startTime = Date.now();
  return config;
});

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    logApiCall({
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration: Date.now() - (response.config._startTime || Date.now()),
    });
    return response;
  },
  (error) => {
    const status = error.response?.status || 0;
    const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
    
    logApiCall({
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: status,
      error: errorMessage,
      duration: Date.now() - (error.config?._startTime || Date.now()),
    });
    
    if (status === 401) {
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_user');
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/register' &&
          window.location.pathname !== '/reset-password' &&
          window.location.pathname !== '/admin') {
        window.location.href = '/login';
      }
    }
    
    // Enhance error object with more details
    error.apiStatus = status;
    error.apiMessage = errorMessage;
    error.isNetworkError = !error.response;
    error.isAuthError = status === 401;
    error.isPermissionError = status === 403;
    error.isServerError = status >= 500;
    
    return Promise.reject(error);
  }
);

// Retry logic for transient failures (network, 502/503) - NOT for 401/403/404/500
const retryableStatuses = [502, 503, 504];
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

export const apiWithRetry = async (apiCall, retries = MAX_RETRIES) => {
  try {
    return await apiCall();
  } catch (error) {
    const shouldRetry = 
      (error.isNetworkError || retryableStatuses.includes(error.apiStatus)) && 
      retries > 0;
    
    if (shouldRetry) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return apiWithRetry(apiCall, retries - 1);
    }
    throw error;
  }
};

// Helper to get user-friendly error message
export const getErrorMessage = (error) => {
  if (error.isNetworkError) return 'Network error - please check your connection';
  if (error.isAuthError) return 'Session expired - please log in again';
  if (error.isPermissionError) return 'You do not have permission for this action';
  if (error.isServerError) return 'Server error - please try again later';
  return error.apiMessage || 'An error occurred';
};

// Image Upload
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Default post image URL
export const DEFAULT_POST_IMAGE = '/default-post.jpg';

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
  getAll: (params = {}) => api.get('/posts', { params }),
  getLatest: (limit = 6) => api.get(`/posts/latest?limit=${limit}`),
  getPending: () => api.get('/posts/pending'),
  getMyPosts: () => api.get('/posts/my'),
  getOne: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  moderate: (id, action, rejectionReason = null) => api.post(`/posts/${id}/moderate`, { action, rejection_reason: rejectionReason }),
};

// Comments
export const commentsAPI = {
  getForPost: (postId) => api.get(`/posts/${postId}/comments`),
  create: (postId, body) => api.post(`/posts/${postId}/comments`, { body }),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
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
  getPending: () => api.get('/actions/pending'),
  getMyActions: () => api.get('/actions/my'),
  getOne: (id) => api.get(`/actions/${id}`),
  create: (data) => api.post('/actions', data),
  update: (id, data) => api.put(`/actions/${id}`, data),
  delete: (id) => api.delete(`/actions/${id}`),
  moderate: (id, action, rejectionReason = null) => api.post(`/actions/${id}/moderate`, { action, rejection_reason: rejectionReason }),
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

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  getUser: (userId) => api.get(`/profile/${userId}`),
  update: (data) => api.put('/profile', data),
};

// Health
export const healthAPI = {
  check: () => api.get('/health'),
  authStatus: () => api.get('/debug/auth-status'),
};

export default api;
