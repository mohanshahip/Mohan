import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5012/api';
// Ensure no trailing slash for consistency
const API_URL = rawApiUrl.replace(/\/$/, "");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,               // send cookies automatically
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,                      // 10 second timeout to prevent hanging
});

// Device ID for refresh token binding (already in your code)
const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
localStorage.setItem('deviceId', deviceId);
api.defaults.headers.common['x-device-id'] = deviceId;

// Attach CSRF token from cookie for state-changing requests
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const match = document.cookie.match(/(?:^|; )csrfToken=([^;]+)/);
    const csrfToken = match ? decodeURIComponent(match[1]) : null;
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(api(prom.originalRequest));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log detailed error information for debugging connection issues
    if (!error.response) {
      console.error('🌐 Network/Connection Error:', {
        message: error.message,
        baseURL: api.defaults.baseURL,
        url: error.config?.url
      });
    } else {
      console.error(`❌ API Error (${error.response.status}):`, {
        url: error.config?.url,
        data: error.response.data
      });
    }

    const originalRequest = error.config;

    // If the error is not 401 or the request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Do not try to refresh if the failing request is an auth public endpoint
    const skipRefreshEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/forgot-password', '/auth/verify-email', '/auth/verify-otp'];
    if (skipRefreshEndpoints.some(endpoint => originalRequest.url.includes(endpoint))) {
      // For refresh-token, we specifically want to trigger the unauthorized event
      if (originalRequest.url.includes('/auth/refresh-token')) {
        window.dispatchEvent(new CustomEvent('unauthorized'));
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request while token is being refreshed
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call the refresh endpoint – refresh token is sent via cookie automatically
      await api.post('/auth/refresh-token');

      // Refresh successful – retry all queued requests
      processQueue(null);
      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed – clear queue and force logout
      processQueue(refreshError);
      window.dispatchEvent(new CustomEvent('unauthorized'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
