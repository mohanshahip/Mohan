import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Briefcase, Image, Code, Eye, Heart,
  MessageSquare, Download, RefreshCw, DownloadIcon,
  Activity, BarChart3, AlertCircle, Loader2, FileText,
  Users, Mail, Share2, ExternalLink, Filter, Calendar,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  LayoutDashboard, PieChart
} from 'lucide-react';
import '../../../styles/Dashboard.css';
import api from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';

import StatCard from '../../../components/common/StatCard';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import ActivityItem from './ActivityItem';
import VisitsChart from './VisitsChart';
import ContentPerformanceChart from './ContentPerformanceChart';
import PieChartComponent from './PieChartComponent';
import CustomSelect from '../../../components/common/CustomSelect'; // Import CustomSelect
import { generateAnalyticsData, formatNumber, exportData } from '../../../utils/dashboardData';

const DashboardContent = ({ initialTab = 'overview' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { initialized, user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/admin/dashboard-stats');
      
      if (response.data?.success) {
        const { counts, engagement, recentActivity: activities } = response.data.data;
        
        setStats({
          content: counts,
          engagement: {
            ...engagement,
            comments: Math.floor(engagement.totalLikes * 0.3), // Mocking some engagement for UI
            shares: Math.floor(engagement.totalLikes * 0.2),
          },
          performance: {
            avgSessionTime: '4m 32s',
            bounceRate: '32%',
            conversionRate: '2.4%',
            topPage: counts.projects > counts.poems ? '/projects' : '/poems'
          }
        });

        setRecentActivity(activities.map(act => ({
          id: act.id,
          type: act.action.toLowerCase().includes('poem') ? 'poem' : 
                act.action.toLowerCase().includes('project') ? 'project' : 
                act.action.toLowerCase().includes('gallery') ? 'gallery' : 'system',
          status: act.action.toLowerCase().includes('create') ? 'new' : 'published',
          content: act.details,
          user: act.user,
          time: new Date(act.timestamp).toLocaleDateString(),
          icon: act.action.toLowerCase().includes('poem') ? FileText : 
                act.action.toLowerCase().includes('project') ? Briefcase : 
                act.action.toLowerCase().includes('gallery') ? Image : Activity
        })));

        setAnalytics(generateAnalyticsData(counts.poems, counts.projects, counts.gallery, counts.skills, timeRange));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (initialized && !authLoading && user) {
      fetchDashboardData();
    } else if (initialized && !authLoading && !user) {
      // Optionally handle unauthenticated state, e.g., redirect to login
      // navigate('/login'); 
    }
  }, [fetchDashboardData, initialized, authLoading, user]);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNewActivity = (activity) => {
      setRecentActivity(prev => [
        {
          id: activity.id || Date.now(),
          type: activity.type || 'system',
          status: 'new',
          content: activity.details,
          user: activity.user || 'System',
          time: t('common.justNow'),
          icon: activity.type === 'poem' ? FileText : 
                activity.type === 'project' ? Briefcase : 
                activity.type === 'gallery' ? Image : Activity
        },
        ...prev.slice(0, 5)
      ]);
      
      // Also refresh stats when new activity happens
      fetchDashboardData();
    };

    const handleStatsUpdate = (newStats) => {
      setStats(prev => ({
        ...prev,
        ...newStats
      }));
    };

    socket.on("new_activity", handleNewActivity);
    socket.on("stats_update", handleStatsUpdate);

    return () => {
      socket.off("new_activity", handleNewActivity);
      socket.off("stats_update", handleStatsUpdate);
    };
  }, [socket, fetchDashboardData, t]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExport = useCallback(() => {
    const data = {
      stats,
      analytics,
      recentActivity,
      exportedAt: new Date().toISOString()
    };
    exportData(data, 'full');
  }, [stats, analytics, recentActivity]);

  const handleExportAnalytics = useCallback(() => {
    exportData({ analytics, exportedAt: new Date().toISOString() }, 'analytics');
  }, [analytics]);

  if ((loading && !stats) || authLoading || !initialized) {
    return (
      <div className="dashboard-loading-overlay">
        <div className="loading-content-pro">
          <div className="spinner-wrapper">
            <Loader2 size={48} className="spinner-pro" strokeWidth={2} />
          </div>
          <h3 className="loading-title">{t('common.loading')}</h3>
          <p className="loading-subtitle">{t('dashboard.fetching-analytics')}</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="dashboard-error-overlay">
        <div className="error-content-pro">
          <div className="error-icon-wrapper">
            <AlertCircle size={48} className="error-icon-pro" strokeWidth={2} />
          </div>
          <h3 className="error-title">{t('common.error')}</h3>
          <p className="error-subtitle">{error}</p>
          <button onClick={handleRefresh} className="btn-admin btn-admin--primary retry-btn-pro">
            <RefreshCw size={18} />
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminPageLayout
      icon={<LayoutDashboard size={24} />}
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
      actions={
        <>
          <button className="btn-admin btn-admin--secondary" onClick={handleExport}>
            <Download size={18} strokeWidth={2} />
            <span>{t('common.export')}</span>
          </button>
          <button className="btn-admin btn-admin--primary" onClick={handleRefresh}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} strokeWidth={2} />
            <span>{t('common.refresh')}</span>
          </button>
          
          <div className="time-range-selector">
            <CustomSelect
              value={timeRange}
              onChange={(value) => setTimeRange(value)}
              icon={Calendar}
              options={[
                { value: 'day', label: t('dashboard.time-range-today') },
                { value: 'week', label: t('dashboard.time-range-week') },
                { value: 'month', label: t('dashboard.time-range-month') },
              ]}
            />
          </div>
        </>
      }
    >
      <div className="dashboard-content-wrapper">
        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} strokeWidth={2} />
            {t('dashboard.overview')}
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <PieChart size={18} strokeWidth={2} />
            {t('dashboard.analytics')}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="tab-content-transition-wrapper">
            <div className="dashboard-sections">
              {/* Content Stats */}
              <section className="admin-section">
                <header className="admin-section__header">
                  <h2 className="admin-section__title">
                    <BookOpen size={20} className="u-mr-sm" />
                    {t('dashboard.content-overview')}
                  </h2>
                </header>
                
                <div className="admin-stats-grid">
                  <StatCard 
                    title={t('dashboard.poems')} 
                    value={stats.content?.poems || 0} 
                    icon={FileText}
                    description={t('dashboard.published-poems')}
                    color="var(--error)"
                    trend={{ value: '12%', up: true }}
                  />
                  <StatCard 
                    title={t('dashboard.projects')} 
                    value={stats.content?.projects || 0} 
                    icon={Briefcase}
                    description={t('dashboard.completed-projects')}
                    color="var(--primary-color)"
                    trend={{ value: '5%', up: true }}
                  />
                  <StatCard 
                    title={t('dashboard.gallery-items')} 
                    value={stats.content?.gallery || 0} 
                    icon={Image}
                    description={t('dashboard.images-galleries')}
                    color="var(--secondary-500)"
                    trend={{ value: '2%', up: false }}
                  />
                  <StatCard 
                    title={t('dashboard.skills')} 
                    value={stats.content?.skills || 0} 
                    icon={Code}
                    description={t('dashboard.technical-skills')}
                    color="var(--accent-500)"
                    trend={{ value: '8%', up: true }}
                  />
                </div>
              </section>

              {/* Engagement Stats */}
              <section className="admin-section">
                <header className="admin-section__header">
                  <h2 className="admin-section__title">
                    <Activity size={20} className="u-mr-sm" />
                    {t('dashboard.engagement-metrics')}
                  </h2>
                </header>
                <div className="admin-stats-grid">
                  <StatCard 
                    title={t('dashboard.total-views')} 
                    value={formatNumber(stats.engagement?.totalViews || 0)} 
                    icon={Eye}
                    color="var(--info)"
                    trend={{ value: '24%', up: true }}
                  />
                  <StatCard 
                    title={t('dashboard.total-likes')} 
                    value={formatNumber(stats.engagement?.totalLikes || 0)} 
                    icon={Heart}
                    color="var(--error)"
                    trend={{ value: '18%', up: true }}
                  />
                  <StatCard 
                    title={t('dashboard.total-comments')} 
                    value={formatNumber(stats.engagement?.comments || 0)} 
                    icon={MessageSquare}
                    color="var(--warning)"
                    trend={{ value: '10%', up: true }}
                  />
                  <StatCard 
                    title={t('dashboard.total-shares')} 
                    value={formatNumber(stats.engagement?.shares || 0)} 
                    icon={Share2}
                    color="var(--secondary-500)"
                    trend={{ value: '5%', up: true }}
                  />
                </div>
              </section>

              <div className="dashboard-main-grid">
                <div className="admin-card charts-container">
                  <div className="admin-card__header">
                    <h3 className="admin-card__title">
                      <BarChart3 size={18} />
                      {t('dashboard.traffic-analytics')}
                    </h3>
                    <div className="admin-card__actions">
                       <button className="btn-admin btn-admin--secondary btn-admin--icon" onClick={handleExportAnalytics} title="Download Report">
                          <DownloadIcon size={16} />
                       </button>
                    </div>
                  </div>
                  <div className="admin-card__body">
                    <VisitsChart data={analytics?.visits || []} timeRange={timeRange} />
                  </div>
                </div>
                
                <div className="admin-card activity-container">
                  <div className="admin-card__header">
                    <h3 className="admin-card__title">
                      <Activity size={18} />
                      {t('dashboard.recent-activity')}
                    </h3>
                    <button className="btn-admin btn-admin--secondary btn-admin--sm" onClick={() => navigate('/admin/activity-log')}>
                      {t('common.viewAll')}
                      <ExternalLink size={14} className="u-ml-sm" />
                    </button>
                  </div>
                  <div className="admin-card__body">
                    <div className="activity-list">
                      {recentActivity.length > 0 ? (
                        recentActivity.map(activity => (
                          <ActivityItem key={activity.id} activity={activity} />
                        ))
                      ) : (
                        <div className="no-activity">
                          <Activity size={48} strokeWidth={1} />
                          <p>{t('dashboard.no-recent-activity')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && stats && (
          <div className="tab-content-transition-wrapper">
            <div className="dashboard-sections">
              <div className="analytics-grid">
                <div className="admin-card">
                  <div className="admin-card__header">
                    <h3 className="admin-card__title">
                      <Activity size={18} />
                      {t('dashboard.content-performance')}
                    </h3>
                  </div>
                  <div className="admin-card__body">
                    <ContentPerformanceChart data={analytics?.contentViews || []} />
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-card__header">
                    <h3 className="admin-card__title">
                      <PieChart size={18} />
                      {t('dashboard.traffic-sources')}
                    </h3>
                  </div>
                  <div className="admin-card__body">
                    <PieChartComponent data={analytics?.trafficSources || []} />
                  </div>
                </div>
              </div>
              
              <div className="performance-metrics u-mt-lg">
                <div className="admin-card metric-card">
                  <span className="metric-label">{t('dashboard.avg-session-time')}</span>
                  <span className="metric-value">{stats.performance?.avgSessionTime}</span>
                  <span className="metric-trend up"><ArrowUpRight size={14} strokeWidth={3} /> 12%</span>
                </div>
                <div className="admin-card metric-card">
                  <span className="metric-label">{t('dashboard.bounce-rate')}</span>
                  <span className="metric-value">{stats.performance?.bounceRate}</span>
                  <span className="metric-trend down"><ArrowDownRight size={14} strokeWidth={3} /> 5%</span>
                </div>
                <div className="admin-card metric-card">
                  <span className="metric-label">{t('dashboard.conversion-rate')}</span>
                  <span className="metric-value">{stats.performance?.conversionRate}</span>
                  <span className="metric-trend up"><ArrowUpRight size={14} strokeWidth={3} /> 3%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default DashboardContent;
