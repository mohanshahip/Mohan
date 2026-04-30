
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5012/api';
// Ensure BACKEND_URL is just the domain without /api or trailing slash
const BACKEND_URL = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

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
