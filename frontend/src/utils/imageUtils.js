
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5012/api';

/**
 * Robustly construct the Backend Root URL for images.
 * Ensures it's just the domain without '/api' or trailing slashes.
 */
const getBackendURL = (url) => {
  return url.trim()
    .replace(/\/+$/, "")      // Remove trailing slashes
    .replace(/\/api$/, "")    // Remove trailing /api
    .replace(/\/+$/, "");     // Remove trailing slashes again just in case
};

const BACKEND_URL = getBackendURL(rawApiUrl);

/**
 * Normalizes an image URL to ensure it points to the correct backend endpoint.
 * @param {string} url - The URL to normalize.
 * @returns {string} - The normalized URL.
 */
export const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  // Ensure the URL starts with a single forward slash
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
};
