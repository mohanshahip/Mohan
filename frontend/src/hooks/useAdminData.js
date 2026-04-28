import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useLoading } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for standardizing admin data fetching (poems, projects, gallery, etc.)
 * @param {string} endpoint - The base API endpoint (e.g., '/poems/admin/all')
 * @param {Object} initialFilters - Initial filtering state
 * @param {string} entityName - Name of the entity for toast messages (e.g., 'poems')
 * @param {Array} socketEvents - Optional array of socket event names to listen for refreshes
 */
const useAdminData = (endpoint, initialFilters = {}, entityName = 'items', socketEvents = []) => {
  const { t, i18n } = useTranslation();
  const { withLoading } = useLoading();
  const { addToast } = useToast();
  const { socket } = useSocket();
  const { initialized, user, loading: authLoading } = useAuth();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [stats, setStats] = useState(null);

  const prevFiltersRef = useRef();
  const prevSearchRef = useRef();
  const prevPageRef = useRef();

  const currentLanguage = i18n.language === 'np' ? 'ne' : (i18n.language || 'en');

  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!initialized || !user) return;

    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        ...(searchQuery ? { search: searchQuery } : {}),
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => 
            value !== 'all' && value !== '' && key !== 'language'
          )
        )
      };

      // Add language filter only if it's not 'all'
      if (filters.language && filters.language !== 'all') {
        params.lang = filters.language;
      } else if (!filters.language) {
        // If no language filter is provided at all, use current UI language
        params.lang = currentLanguage;
      }
      // If filters.language is 'all', we don't add lang to params, so backend returns all data


      // Special case for published filter which backend expects as boolean or 'true'/'false'
      if (params.status === 'published') params.published = 'true';
      if (params.status === 'draft') params.published = 'false';
      if (params.status) delete params.status;

      const response = showLoading 
        ? await withLoading(() => api.get(endpoint, { params }), t('common.loading'))
        : await api.get(endpoint, { params });

      if (response.data?.success) {
        setData(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || response.data.pages || 1);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(response.data?.error || t('common.error'));
      }
    } catch (err) {
      console.error(`Error fetching ${entityName}:`, err);
      setError(err.message);
      
      // Auto-retry once for network/transient errors
      if (retryCount < 1 && !err.response) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchData(showLoading), 1500);
        return;
      }
      
      if (showLoading) addToast(err.message || t('common.error'), 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [endpoint, page, limit, searchQuery, filters, currentLanguage, entityName, t, withLoading, addToast, retryCount, initialized, user]);

  // Initial fetch and dependency-based refresh
  useEffect(() => {
    if (!initialized || authLoading || !user) return;

    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    const searchChanged = prevSearchRef.current !== searchQuery;
    const pageChanged = prevPageRef.current !== page;

    if (filtersChanged || searchChanged || pageChanged || !prevFiltersRef.current) {
      fetchData();
      
      prevFiltersRef.current = filters;
      prevSearchRef.current = searchQuery;
      prevPageRef.current = page;
    }
  }, [fetchData, filters, searchQuery, page, initialized, authLoading, user]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || socketEvents.length === 0 || !initialized || !user) return;

    const handleUpdate = (payload) => {
      console.log(`📡 Real-time update for ${entityName}:`, payload);
      
      // If it's a generic activity event, check if it matches our entity type
      if (payload && payload.type) {
        // e.g., if entityName is 'poems' and payload.type is 'poem'
        const normalizedEntity = entityName.toLowerCase().replace(/s$/, ''); // plural to singular
        if (payload.type.toLowerCase() === normalizedEntity) {
          fetchData(false);
        }
      } else {
        // For direct event matches
        fetchData(false);
      }
    };

    socketEvents.forEach(event => {
      socket.on(event, handleUpdate);
    });

    return () => {
      socketEvents.forEach(event => {
        socket.off(event, handleUpdate);
      });
    };
  }, [socket, socketEvents, fetchData, entityName, initialized, user]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    loading: loading || authLoading || !initialized,
    error,
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    searchQuery,
    setSearchQuery: handleSearch,
    filters,
    setFilters: handleFilterChange,
    stats,
    setStats,
    refresh
  };
};

export default useAdminData;
