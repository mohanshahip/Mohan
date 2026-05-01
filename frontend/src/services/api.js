import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5012/api';

/**
 * Robustly construct the API URL.
 * Ensures that it ends with '/api/' regardless of how the environment variable was set.
 */
const getBaseURL = (url) => {
  let cleanUrl = url.trim().replace(/\/+$/, ""); // Remove all trailing slashes
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl += '/api';
  }
  return `${cleanUrl}/`; // Always end with a single trailing slash for Axios relative paths
};

const API_URL = getBaseURL(rawApiUrl);

// Log the configured API URL for easier debugging in production
if (import.meta.env.PROD) {
  console.log('🔌 API Service BaseURL:', API_URL);
  console.log('📝 Raw VITE_API_URL:', rawApiUrl);
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Device ID for refresh token binding
const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
localStorage.setItem('deviceId', deviceId);
api.defaults.headers.common['x-device-id'] = deviceId;

// Interceptor to handle leading slashes in request URLs
// In Axios, if the URL starts with '/', it replaces the entire path in baseURL.
// To keep the '/api' prefix, we must ensure the request URL is relative (no leading slash).
api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }
  
  // Debug log for production connection issues (can be removed later)
  if (process.env.NODE_ENV === 'production') {
    console.log(`📡 API Request: ${config.baseURL}${config.url}`);
  }

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
