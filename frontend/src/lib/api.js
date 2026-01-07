import axios from 'axios';
import { STATIC_POSTS, STATIC_EVENTS, STATIC_ACTIONS, isStaticMode, FEATURES } from './staticData';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '';

// Check if backend is available
const isBackendAvailable = () => {
  return BACKEND_URL && BACKEND_URL !== '' && BACKEND_URL !== 'undefined';
};

// Default post image URL
export const DEFAULT_POST_IMAGE = '/default-post.jpg';

// Create axios instance only if backend is available
const api = isBackendAvailable() ? axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout - fail fast
}) : null;

// Request interceptor to add auth token
if (api) {
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
      const status = error.response?.status || 0;
      if (status === 401) {
        localStorage.removeItem('pp_token');
        localStorage.removeItem('pp_user');
      }
      error.apiStatus = status;
      error.apiMessage = error.response?.data?.detail || error.message || 'Unknown error';
      error.isNetworkError = !error.response;
      return Promise.reject(error);
    }
  );
}

// Helper to safely make API calls with static fallback
const safeApiCall = async (apiCall, fallbackData) => {
  if (!isBackendAvailable() || !api) {
    return { data: fallbackData };
  }
  try {
    return await apiCall();
  } catch (error) {
    console.warn('API call failed, using static data:', error.message);
    return { data: fallbackData };
  }
};

// Helper to get user-friendly error message
export const getErrorMessage = (error) => {
  if (!isBackendAvailable()) return 'Backend not configured';
  if (error.isNetworkError) return 'Network error - please check your connection';
  return error.apiMessage || 'An error occurred';
};

// Auth - requires backend, fails gracefully
export const authAPI = {
  register: (data) => api ? api.post('/auth/register', data) : Promise.reject(new Error('Backend not available')),
  login: (data) => api ? api.post('/auth/login', data) : Promise.reject(new Error('Backend not available')),
  adminLogin: (data) => api ? api.post('/auth/admin-login', data) : Promise.reject(new Error('Backend not available')),
  getMe: () => api ? api.get('/auth/me') : Promise.reject(new Error('Backend not available')),
  changePassword: (currentPassword, newPassword) => api ? api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }) : Promise.reject(new Error('Backend not available')),
  resetPasswordWithToken: (token, newPassword) => api ? api.post('/auth/reset-password', { token, new_password: newPassword }) : Promise.reject(new Error('Backend not available')),
};

// Posts - with static fallback
export const postsAPI = {
  getAll: (params = {}) => safeApiCall(
    () => api.get('/posts', { params }),
    { posts: STATIC_POSTS, total: STATIC_POSTS.length, page: 1, limit: 12, total_pages: 1 }
  ),
  getLatest: (limit = 6) => safeApiCall(
    () => api.get(`/posts/latest?limit=${limit}`),
    STATIC_POSTS.slice(0, limit)
  ),
  getPending: () => api ? api.get('/posts/pending') : Promise.resolve({ data: [] }),
  getMyPosts: () => api ? api.get('/posts/my') : Promise.resolve({ data: [] }),
  getOne: (id) => safeApiCall(
    () => api.get(`/posts/${id}`),
    STATIC_POSTS.find(p => p.id === id) || STATIC_POSTS[0]
  ),
  create: (data) => api ? api.post('/posts', data) : Promise.reject(new Error('Backend not available')),
  update: (id, data) => api ? api.put(`/posts/${id}`, data) : Promise.reject(new Error('Backend not available')),
  delete: (id) => api ? api.delete(`/posts/${id}`) : Promise.reject(new Error('Backend not available')),
  moderate: (id, action, rejectionReason = null) => api ? api.post(`/posts/${id}/moderate`, { action, rejection_reason: rejectionReason }) : Promise.reject(new Error('Backend not available')),
};

// Comments - requires backend
export const commentsAPI = {
  getForPost: (postId) => safeApiCall(() => api.get(`/posts/${postId}/comments`), []),
  create: (postId, body) => api ? api.post(`/posts/${postId}/comments`, { body }) : Promise.reject(new Error('Backend not available')),
  delete: (commentId) => api ? api.delete(`/comments/${commentId}`) : Promise.reject(new Error('Backend not available')),
};

// Events - with static fallback
export const eventsAPI = {
  getAll: () => safeApiCall(() => api.get('/events'), STATIC_EVENTS),
  getOne: (id) => safeApiCall(
    () => api.get(`/events/${id}`),
    STATIC_EVENTS.find(e => e.id === id) || STATIC_EVENTS[0]
  ),
  create: (data) => api ? api.post('/events', data) : Promise.reject(new Error('Backend not available')),
  update: (id, data) => api ? api.put(`/events/${id}`, data) : Promise.reject(new Error('Backend not available')),
  delete: (id) => api ? api.delete(`/events/${id}`) : Promise.reject(new Error('Backend not available')),
  rsvp: (id) => api ? api.post(`/events/${id}/rsvp`) : Promise.reject(new Error('Backend not available')),
  cancelRsvp: (id) => api ? api.delete(`/events/${id}/rsvp`) : Promise.reject(new Error('Backend not available')),
  getRsvps: (id) => api ? api.get(`/events/${id}/rsvps`) : Promise.resolve({ data: [] }),
  getMyRsvps: () => api ? api.get('/my-rsvps') : Promise.resolve({ data: { event_ids: [] } }),
};

// Actions - with static fallback
export const actionsAPI = {
  getAll: () => safeApiCall(() => api.get('/actions'), STATIC_ACTIONS),
  getPending: () => api ? api.get('/actions/pending') : Promise.resolve({ data: [] }),
  getMyActions: () => api ? api.get('/actions/my') : Promise.resolve({ data: [] }),
  getOne: (id) => safeApiCall(
    () => api.get(`/actions/${id}`),
    STATIC_ACTIONS.find(a => a.id === id) || STATIC_ACTIONS[0]
  ),
  create: (data) => api ? api.post('/actions', data) : Promise.reject(new Error('Backend not available')),
  update: (id, data) => api ? api.put(`/actions/${id}`, data) : Promise.reject(new Error('Backend not available')),
  delete: (id) => api ? api.delete(`/actions/${id}`) : Promise.reject(new Error('Backend not available')),
  moderate: (id, action, rejectionReason = null) => api ? api.post(`/actions/${id}/moderate`, { action, rejection_reason: rejectionReason }) : Promise.reject(new Error('Backend not available')),
  signup: (id, data = {}) => api ? api.post(`/actions/${id}/signup`, data) : Promise.reject(new Error('Backend not available')),
  cancelSignup: (id) => api ? api.delete(`/actions/${id}/signup`) : Promise.reject(new Error('Backend not available')),
  getParticipants: (id) => api ? api.get(`/actions/${id}/participants`) : Promise.resolve({ data: [] }),
  getMySignups: () => api ? api.get('/my-signups') : Promise.resolve({ data: { action_ids: [] } }),
};

// Products - with empty fallback
export const productsAPI = {
  getAll: () => safeApiCall(() => api.get('/products'), []),
  getOne: (id) => api ? api.get(`/products/${id}`) : Promise.reject(new Error('Backend not available')),
  create: (data) => api ? api.post('/products', data) : Promise.reject(new Error('Backend not available')),
  update: (id, data) => api ? api.put(`/products/${id}`, data) : Promise.reject(new Error('Backend not available')),
  delete: (id) => api ? api.delete(`/products/${id}`) : Promise.reject(new Error('Backend not available')),
};

// Cart - requires backend
export const cartAPI = {
  get: () => api ? api.get('/cart') : Promise.resolve({ data: { items: [], total: 0 } }),
  add: (data) => api ? api.post('/cart/add', data) : Promise.reject(new Error('Backend not available')),
  update: (itemId, quantity) => api ? api.put(`/cart/${itemId}?quantity=${quantity}`) : Promise.reject(new Error('Backend not available')),
  remove: (itemId) => api ? api.delete(`/cart/${itemId}`) : Promise.reject(new Error('Backend not available')),
  clear: () => api ? api.delete('/cart') : Promise.reject(new Error('Backend not available')),
};

// Notify Me - requires backend
export const notifyAPI = {
  subscribe: (email) => api ? api.post('/notify', { email }) : Promise.reject(new Error('Backend not available')),
  getSubscribers: () => api ? api.get('/notify/subscribers') : Promise.resolve({ data: [] }),
  unsubscribe: (email) => api ? api.delete(`/notify/${email}`) : Promise.reject(new Error('Backend not available')),
};

// Admin - requires backend
export const adminAPI = {
  getStats: () => api ? api.get('/admin/stats') : Promise.resolve({ data: {} }),
  getUsers: (params = {}) => api ? api.get('/admin/users', { params }) : Promise.resolve({ data: [] }),
  updateUser: (id, data) => api ? api.put(`/admin/users/${id}`, data) : Promise.reject(new Error('Backend not available')),
  resetUserPassword: (userId) => api ? api.post(`/admin/users/${userId}/reset-password`) : Promise.reject(new Error('Backend not available')),
  getAuditLogs: (params = {}) => api ? api.get('/admin/audit-logs', { params }) : Promise.resolve({ data: [] }),
  seed: () => api ? api.post('/seed') : Promise.reject(new Error('Backend not available')),
};

// Notifications - requires backend
export const notificationsAPI = {
  getAll: () => api ? api.get('/notifications') : Promise.resolve({ data: [] }),
  getUnreadCount: () => api ? api.get('/notifications/unread-count') : Promise.resolve({ data: { unread_count: 0 } }),
  markRead: (id) => api ? api.post(`/notifications/${id}/read`) : Promise.reject(new Error('Backend not available')),
  markAllRead: () => api ? api.post('/notifications/read-all') : Promise.reject(new Error('Backend not available')),
};

// Profile - requires backend
export const profileAPI = {
  get: () => api ? api.get('/profile') : Promise.reject(new Error('Backend not available')),
  getUser: (userId) => api ? api.get(`/profile/${userId}`) : Promise.reject(new Error('Backend not available')),
  update: (data) => api ? api.put('/profile', data) : Promise.reject(new Error('Backend not available')),
};

// Health - with fallback
export const healthAPI = {
  check: () => safeApiCall(() => api.get('/health'), { api: 'static', database: 'n/a' }),
  authStatus: () => api ? api.get('/debug/auth-status') : Promise.resolve({ data: {} }),
};

// Image Upload - requires backend
export const uploadAPI = {
  uploadImage: async (file) => {
    if (!api) return Promise.reject(new Error('Backend not available'));
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Export feature flags
export { FEATURES, isStaticMode };

export default api;
