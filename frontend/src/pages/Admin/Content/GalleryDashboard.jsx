import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ImageIcon, Plus, RefreshCw, Download, 
  LayoutGrid, List as ListIcon 
} from 'lucide-react';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';
import { useToast } from '../../../context/ToastContext';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import useAdminData from '../../../hooks/useAdminData';
import GalleryList from './GalleryList';

const GalleryDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { withLoading } = useLoading();
  const confirm = useConfirm();

  const {
    data: galleries,
    loading,
    page,
    setPage,
    totalPages,
    total: totalGalleries,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    stats,
    setStats,
    refresh: fetchGalleries
  } = useAdminData('/gallery/admin/all', {
    status: 'all',
    category: 'all',
    language: 'all'
  }, 'galleries', ['new_activity']);

  const [viewMode, setViewMode] = useState("grid"); // Default to grid for gallery
  const [selectedGalleries, setSelectedGalleries] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const language = i18n.language || "en";

  // Fetch stats (optional, could be calculated from data)
  const fetchStats = useCallback(async () => {
    try {
      // For now, we calculate from current data or just show total
      const statsData = {
        total: totalGalleries,
        published: galleries.filter(g => g.isPublished).length,
      };
      setStats(statsData);
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  }, [galleries, totalGalleries, setStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGalleries();
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await withLoading(
        () => api.get('/gallery/admin/all', { params: { limit: 1000, lang: language } }), 
        t('common.exporting')
      );
      if (response.data?.success) {
        const jsonString = JSON.stringify(response.data.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gallery-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast(t('common.exportSuccess'), 'success');
      }
    } catch (error) {
      console.error("Error exporting gallery:", error);
      addToast(t('common.error'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const applyBulkAction = async () => {
    if (!bulkAction || selectedGalleries.length === 0) return;

    const actionVerb = bulkAction === 'delete'
      ? t('common.delete')
      : (bulkAction === 'publish' ? t('common.publish') : t('common.unpublish'));
      
    const ok = await confirm({
      title: t('common.confirm'),
      message: t('gallery.admin.bulkActionConfirm', { count: selectedGalleries.length, action: actionVerb }),
      type: bulkAction === 'delete' ? 'danger' : 'warning',
      confirmText: t('common.apply'),
      cancelText: t('common.cancel')
    });
    
    if (!ok) return;

    try {
      const promises = selectedGalleries.map(id => {
        switch (bulkAction) {
          case 'publish':
            return api.patch(`/gallery/${id}/toggle-publish`, { isPublished: true });
          case 'unpublish':
            return api.patch(`/gallery/${id}/toggle-publish`, { isPublished: false });
          case 'delete':
            return api.delete(`/gallery/${id}`);
          default:
            return Promise.resolve();
        }
      });

      await withLoading(() => Promise.all(promises), t('common.updating'));
      addToast(t('common.bulkActionSuccess'), 'success');
      fetchGalleries();
      setSelectedGalleries([]);
      setBulkAction("");
    } catch (error) {
      console.error("Error applying bulk action:", error);
      addToast(t('common.error'), 'error');
    }
  };

  const handleEdit = (gallery) => {
    navigate(`/admin/gallery/edit/${gallery._id}`);
  };

  const handleAddNew = () => {
    navigate('/admin/gallery/new');
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await withLoading(() => api.patch(`/gallery/${id}/toggle-publish`), t('common.updating'));
      fetchGalleries();
      addToast(t('messages.status-update-success'), 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: t('common.delete'),
      message: t('gallery.admin.confirm-delete'),
      type: 'danger',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;

    try {
      await withLoading(() => api.delete(`/gallery/${id}`), t('gallery.admin.deleting'));
      fetchGalleries();
      addToast(t('gallery.admin.deleted-success'), 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <AdminPageLayout
      icon={<ImageIcon size={24} />}
      title={t('gallery.title')}
      subtitle={t('gallery.admin.subtitle')}
      actions={
        <>
          <button
            className="btn-admin btn-admin--secondary"
            onClick={fetchGalleries}
            title={t('common.refresh')}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            className="btn-admin btn-admin--secondary"
            onClick={handleExport}
            disabled={isExporting}
            title={t('common.export')}
          >
            {isExporting ? <div className="spinner" /> : <Download size={20} />}
          </button>
          <button
            className="btn-admin btn-admin--primary"
            onClick={handleAddNew}
          >
            <Plus size={20} />
            {t('gallery.admin.addNew')}
          </button>
        </>
      }
    >
      <GalleryList
        galleries={galleries}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={filters.status}
        setStatusFilter={(val) => setFilters({ status: val })}
        categoryFilter={filters.category}
        setCategoryFilter={(val) => setFilters({ category: val })}
        languageFilter={filters.language}
        setLanguageFilter={(val) => setFilters({ language: val })}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedGalleries={selectedGalleries}
        setSelectedGalleries={setSelectedGalleries}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        page={page}
        totalPages={totalPages}
        totalGalleries={totalGalleries}
        onPageChange={setPage}
        onSearch={handleSearch}
        onBulkAction={applyBulkAction}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        stats={stats}
      />
    </AdminPageLayout>
  );
};

export default GalleryDashboard;
