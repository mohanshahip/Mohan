import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../../context/ToastContext';
import DashboardContent from '../Dashboard/DashboardContent';
import '../../../styles/Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // Simulate data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data - in real app, fetch from API
        const mockStats = {
          visitors: 12458,
          pageViews: 89245,
          conversion: 4.8,
          revenue: 12540,
          activeUsers: 892,
          bounceRate: 32.5,
        };
        
        setStats(mockStats);
        setError(null);
      } catch (err) {
        setError(t('dashboard.failed-to-load'));
        console.error('Dashboard data error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [t]);

  // Handle refresh dashboard
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  }, []);

  // Handle export data
  const handleExport = useCallback(() => {
    // Implement export functionality
    addToast(t('dashboard.export-alert'), 'info');
  }, [t, addToast]);

  // Handle quick actions
  const handleQuickAction = useCallback((action) => {
    switch (action) {
      case 'create':
        navigate('/admin/content/create');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      default:
        break;
    }
  }, [navigate]);

  // Handle keyboard shortcuts for dashboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Refresh with F5
      if (e.key === 'F5') {
        e.preventDefault();
        handleRefresh();
      }
      
      // Export with Ctrl+E
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRefresh, handleExport]);

  return (
    <div className="dashboard-wrapper">
      {error && (
        <div className="dashboard-error">
          <div className="error-content">
            <h3>{t('dashboard.error-loading-dashboard')}</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              {t('dashboard.retry')}
            </button>
          </div>
        </div>
      )}
      
      <DashboardContent 
        isLoading={isLoading}
        stats={stats}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
};

export default Dashboard;
