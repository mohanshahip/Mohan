
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5012/api';
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

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
