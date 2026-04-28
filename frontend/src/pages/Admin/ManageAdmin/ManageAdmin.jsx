// pages/Admin/ManageAdmins/ManageAdmins.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Trash2, X, Download, Plus, Users,
  Search, Filter, Eye, EyeOff, Edit, Clock, Calendar, Shield
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import CreateAdminForm from './CreateAdminForm';
import CustomSelect from '../../../components/common/CustomSelect'; // Import CustomSelect
import DataTable from '../../../components/common/DataTable'; // Import DataTable
import StatCard from '../../../components/common/StatCard';
import AdminFilters from './AdminFilters';

// Import styles
import '../../../styles/AdminCommon.css';
import '../../../styles/ManageAdmins.css';

const ManageAdmins = () => {
  const { t, i18n } = useTranslation();
  const { user, initialized, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [admins, setAdmins] = useState([]);
  // derived filtered admins via useMemo
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    dateRange: 'all',
    sortBy: 'newest'
  });
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, newThisMonth: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [apiError, setApiError] = useState('');
  const limit = 10;

  const { withLoading, isLoading } = useLoading();
  const confirm = useConfirm();

  const getInitials = (admin) => {
    if (admin.profile?.firstName && admin.profile?.lastName) {
      return `${admin.profile.firstName[0]}${admin.profile.lastName[0]}`.toUpperCase();
    }
    return admin.username ? admin.username[0].toUpperCase() : 'A';
  };

  const formatDate = useCallback((date) => {
    if (!date) return t('admin.never');
    const d = new Date(date);
    return d.toLocaleDateString(i18n.language === 'np' ? 'ne-NP' : 'en-US');
  }, [i18n.language, t]);

  // Fetch admins (simplified – adjust endpoint as needed)
  const fetchAdmins = useCallback(async () => {
    try {
      const params = {
        page,
        limit,
        search: searchTerm,
        status: filters.status !== 'all' ? filters.status : undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
        sortBy: filters.sortBy
      };
      const response = await withLoading(() => api.get('/admin/all-admins', { params }), t('common.loading'));
      setAdmins(response.data.admins || []);
      setTotalAdmins(response.data.total || 0);
      setTotalPages(Math.ceil((response.data.total || 0) / limit));
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      addToast(error.response?.data?.error || t('admin.failed-to-fetch-admins'), 'error');
    }
  }, [page, searchTerm, filters, withLoading, addToast, t]);

  const handleToggleStatus = useCallback(async (adminId, currentStatus) => {
    const ok = await confirm({
      title: currentStatus ? t('admin.deactivate') : t('admin.activate'),
      message: currentStatus ? t('admin.deactivate-confirm') : t('admin.activate-confirm'),
      type: 'warning',
      confirmText: currentStatus ? t('admin.deactivate') : t('admin.activate'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      await withLoading(() => api.put(`/admin/toggle-status/${adminId}`), t('common.updating'));
      fetchAdmins();
    } catch (error) {
      addToast(error.response?.data?.error || t('admin.failed-to-update-status'), 'error');
    }
  }, [confirm, t, withLoading, fetchAdmins, addToast]);

  // Define columns for DataTable
  const columns = useMemo(() => [
    {
      key: 'administrator',
      label: t('admin.administrator'),
      render: (_, admin) => (
        <div className="admin-user-info">
          <div className="admin-user-avatar">
            {getInitials(admin)}
          </div>
          <div className="admin-user-details">
            <div className="admin-user-name">
              {admin.profile?.firstName && admin.profile?.lastName
                ? `${admin.profile.firstName} ${admin.profile.lastName}`
                : admin.username}
            </div>
            <div className="admin-user-email">{admin.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: t('admin.role'),
      render: (role) => {
        const roleConfig = {
          superadmin: { label: t('admin.super-admin'), class: 'admin-badge--neutral' },
          moderator: { label: t('admin.moderator'), class: 'admin-badge--neutral' },
          admin: { label: t('admin.admin'), class: 'admin-badge--neutral' }
        };
        const config = roleConfig[role] || { label: role, class: 'admin-badge--neutral' };
        return (
          <span className={`admin-badge ${config.class}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (_, admin) => (
        <button
          className={`admin-badge border-none ${admin.isActive ? 'admin-badge--success' : 'admin-badge--error'} ${admin._id === user?.id ? 'cursor-default' : 'cursor-pointer'}`}
          onClick={() => admin._id !== user?.id && handleToggleStatus(admin._id, admin.isActive)}
          disabled={admin._id === user?.id}
        >
          {admin.isActive ? (
            <><Eye size={12} /> {t('common.active')}</>
          ) : (
            <><EyeOff size={12} /> {t('common.inactive')}</>
          )}
        </button>
      )
    },
    {
      key: 'lastActive',
      label: t('admin.last-active'),
      render: (_, admin) => (
        <span className="u-flex u-items-center u-gap-sm u-text-muted">
          <Clock size={14} />
          {formatDate(admin.lastLogin)}
        </span>
      )
    },
    {
      key: 'joined',
      label: t('admin.joined'),
      render: (_, admin) => (
        <span className="u-flex u-items-center u-gap-sm u-text-muted">
          <Calendar size={14} />
          {formatDate(admin.createdAt)}
        </span>
      )
    }
  ], [t, user?.id, handleToggleStatus, formatDate]);

  useEffect(() => {
    if (initialized && !authLoading && user) {
      fetchAdmins();
    }
  }, [fetchAdmins, initialized, authLoading, user]);

  // Use the fetched admins directly
  const displayedAdmins = admins;

  const handleRemoveAdminDirect = async (admin) => {
    if (admin._id === user?.id) return;
    const ok = await confirm({
      title: t('admin.remove-admin-title'),
      message: t('admin.remove-admin-confirm', { 
        username: admin.profile?.firstName && admin.profile?.lastName
          ? `${admin.profile.firstName} ${admin.profile.lastName}`
          : admin.username 
      }),
      type: 'danger',
      confirmText: t('admin.remove-admin'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      await withLoading(() => api.delete(`/admin/remove-admin/${admin._id}`), t('common.deleting'));
      fetchAdmins();
      setSelectedAdmins(prev => prev.filter(id => id !== admin._id));
      addToast(t('admin.admin-removed-success', { username: admin.username }), 'success');
    } catch (error) {
      addToast(error.response?.data?.error || t('admin.failed-to-remove-admin'), 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAdmins.length === 0) return;
    const ok = await confirm({
      title: t('admin.remove-multiple-admins-title'),
      message: t('admin.remove-multiple-admins-confirm', { count: selectedAdmins.length }),
      type: 'danger',
      confirmText: t('admin.remove-all'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      await withLoading(
        () => Promise.all(selectedAdmins.map(id => api.delete(`/admin/remove-admin/${id}`))),
        t('common.deleting')
      );
      fetchAdmins();
      setSelectedAdmins([]);
      addToast(t('admin.admins-removed-success', { count: selectedAdmins.length }), 'success');
    } catch (error) {
      addToast(t('admin.failed-to-remove-some-admins'), 'error');
    }
  };

  const handleExport = () => {
    if (displayedAdmins.length === 0) return;
    const data = displayedAdmins.map(admin => ({
      [t('admin.username')]: admin.username || '',
      [t('admin.email')]: admin.email || '',
      [t('admin.first-name')]: admin.profile?.firstName || '',
      [t('admin.last-name')]: admin.profile?.lastName || '',
      [t('common.status')]: admin.isActive ? t('common.active') : t('common.inactive'),
      [t('admin.last-active')]: admin.lastLogin ? formatDate(admin.lastLogin) : t('admin.never'),
      [t('admin.joined')]: formatDate(admin.createdAt)
    }));
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(value =>
      `"${String(value).replace(/"/g, '""')}"`
    ).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admins-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyBulkAction = async () => {
    if (!bulkAction || selectedAdmins.length === 0) return;
    if (bulkAction === 'delete') {
      await handleBulkDelete();
    }
  };

  const handleSelectAll = () => {
    if (selectedAdmins.length === displayedAdmins.length) {
      setSelectedAdmins([]);
    } else {
      setSelectedAdmins(displayedAdmins.map(a => a._id));
    }
  };

  const handleSelectAdmin = (id) => {
    setSelectedAdmins(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAdmins();
  };

  const handleCreateAdmin = async (adminData) => {
    try {
      setApiError('');
      const response = await withLoading(() => api.post('/admin/create-admin', adminData), t('admin.creating'));
      
      if (response.data?.success) {
        addToast(response.data.message || t('admin.admin-created-success'), 'success');
        setShowCreateForm(false);
        fetchAdmins();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || t('admin.failed-to-create-admin');
      setApiError(errorMsg);
      addToast(errorMsg, 'error');
    }
  };

  const handleUpdateAdmin = async (adminData) => {
    try {
      setApiError('');
      const response = await withLoading(
        () => api.put(`/admin/update-admin/${editingAdmin._id}`, adminData),
        t('common.updating')
      );
      
      if (response.data?.success) {
        addToast(response.data.message || t('admin.adminUpdatedSuccess'), 'success');
        setEditingAdmin(null);
        fetchAdmins();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || t('admin.failedToUpdateAdmin');
      setApiError(errorMsg);
      addToast(errorMsg, 'error');
    }
  };

  if (authLoading || !initialized) {
    return (
      <AdminPageLayout icon={<Users size={24} />} title={t('admin.manage-admins')}>
        <div className="u-flex u-items-center u-justify-center u-p-24" style={{ minHeight: '60vh' }}>
          <div className="loading-content-pro">
            <Loader2 size={48} className="spinner-pro" />
            <h3 className="loading-title">{t('common.loading')}</h3>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  if (user?.role !== 'superadmin') {
    return (
      <AdminPageLayout
        icon={<Shield size={24} />}
        title={t('admin.manage-admins')}
      >
        <div className="u-flex u-flex-direction-column u-items-center u-justify-center u-p-24" style={{ minHeight: '60vh' }}>
          <Shield size={64} className="u-text-muted u-mb-lg" />
          <h2 className="u-mb-sm">{t('common.accessDenied')}</h2>
          <p className="u-text-secondary">{t('admin.superAdminOnly') || 'This page is only accessible to SuperAdmins.'}</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      icon={<Users size={24} />}
      title={t('admin.manage-admins')}
      subtitle={t('admin.manageAdminsSubtitle') || 'Add, edit, and manage administrative users'}
      actions={
        <button 
          className="btn-admin btn-admin--primary"
          onClick={() => {
            setEditingAdmin(null);
            setShowCreateForm(true);
          }}
        >
          <Plus size={18} />
          <span>{t('admin.addNewAdmin')}</span>
        </button>
      }
    >
      <div className="admin-page__content-container">
        {/* Stats Grid */}
        <div className="admin-stats-grid u-mb-xl">
          <StatCard
            label={t('admin.total-admins')}
            value={stats.total}
            icon={Users}
            color="var(--primary-color)"
          />
          <StatCard
            label={t('common.active')}
            value={stats.active}
            icon={Shield}
            color="var(--success)"
          />
          <StatCard
            label={t('common.inactive')}
            value={stats.inactive}
            icon={EyeOff}
            color="var(--error)"
          />
          <StatCard
            label={t('admin.new-this-month')}
            value={stats.newThisMonth}
            icon={Calendar}
            color="var(--info)"
          />
        </div>

        {/* Filters */}
        <AdminFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={fetchAdmins}
        />

        {/* Data Table */}
        <div className="admin-section">
          <header className="admin-section__header">
            <h3 className="admin-section__title">
              <Users size={20} />
              {t('admin.adminList')}
            </h3>
            {selectedAdmins.length > 0 && (
              <button 
                className="btn-admin btn-admin--danger btn-admin--sm"
                onClick={handleBulkDelete}
              >
                <Trash2 size={14} />
                <span>{t('admin.delete-selected')} ({selectedAdmins.length})</span>
              </button>
            )}
          </header>

          <DataTable
            columns={columns}
            data={admins}
            loading={isLoading}
            pagination={{
              currentPage: page,
              pageSize: limit,
              total: totalAdmins,
              totalPages: totalPages
            }}
            onPageChange={setPage}
            onSearch={setSearchTerm}
            searchValue={searchTerm}
            selectable={true}
            selectedRows={selectedAdmins}
            onSelectRow={(id) => {
              setSelectedAdmins(prev => 
                prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
              );
            }}
            onSelectAll={() => {
              setSelectedAdmins(selectedAdmins.length === admins.length ? [] : admins.map(a => a._id));
            }}
            actions={(admin) => (
              <div className="admin-table-actions">
                <button
                  className="admin-table-icon-btn"
                  onClick={() => {
                    setEditingAdmin(admin);
                    setShowCreateForm(true);
                  }}
                  title={t('common.edit')}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="admin-table-icon-btn admin-table-icon-btn--danger"
                  onClick={() => handleRemoveAdminDirect(admin)}
                  disabled={admin._id === user?.id}
                  title={t('common.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {/* Create/Edit Admin Form */}
      {(showCreateForm || editingAdmin) && (
        <CreateAdminForm
          initialData={editingAdmin}
          onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingAdmin(null);
            setApiError('');
          }}
          isLoading={isLoading}
          apiError={apiError}
        />
      )}
    </AdminPageLayout>
  );
};

export default ManageAdmins;
