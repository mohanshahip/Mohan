import { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // your axios instance
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const toast = useToast();
  const { initialized, user, loading: authLoading } = useAuth();

  const fetchSettings = useCallback(async () => {
    if (!initialized || !user) return;
    
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings');
      setSettings(data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [initialized, user]);

  const saveSettings = useCallback(async (updatedSettings) => {
    try {
      setSaveError(null);
      const { data } = await api.put('/admin/settings', updatedSettings);
      setSettings(data.data);
      toast?.addToast('Settings saved successfully', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save settings';
      setSaveError(msg);
      toast?.addToast(msg, 'error');
      return { success: false, error: msg };
    }
  }, [toast]);

  useEffect(() => {
    if (initialized && !authLoading && user) {
      fetchSettings();
    }
  }, [fetchSettings, initialized, authLoading, user]);

  return { 
    settings, 
    loading: loading || authLoading || !initialized, 
    error, 
    saveError, 
    saveSettings, 
    refresh: fetchSettings 
  };
};