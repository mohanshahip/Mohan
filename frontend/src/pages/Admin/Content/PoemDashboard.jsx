// components/admin/PoemDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Download,
  RefreshCw,
  Plus,
  Loader,
} from "lucide-react";
import PoemList from "./PoemList";
import '../../../styles/PoemAdmin.css';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';
import { useToast } from '../../../context/ToastContext';
import '../../../styles/PoemDashboard.css';
import AdminPageLayout from '../../../components/common/AdminPageLayout';

import useAdminData from '../../../hooks/useAdminData';

const PoemDashboard = () => { // Remove onClose prop
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { withLoading } = useLoading();
  const confirm = useConfirm();

  const {
    data: poems,
    loading,
    page,
    setPage,
    totalPages,
    total: totalPoems,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    stats,
    setStats,
    refresh: fetchPoems
  } = useAdminData('/poems/admin/all', {
    status: 'all',
    category: 'all',
    language: 'all'
  }, 'poems', ['new_activity']);

  const [viewMode, setViewMode] = useState("table");
  const [selectedPoems, setSelectedPoems] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const language = i18n.language || "en";

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/poems/stats', { params: { lang: language, admin: true } });
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [language, setStats]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useAdminData's searchQuery state
    // but we can trigger a manual refresh if needed
    fetchPoems();
  };

  // Export poems
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await withLoading(() => api.get('/poems/admin/all', { params: { limit: 1000, lang: language } }), t('poems.exporting'));
      if (response.data?.success) {
        const jsonString = JSON.stringify(response.data.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `poems-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast(t('poems.export-success'), 'success');
      }
    } catch (error) {
      console.error("Error exporting poems:", error);
      addToast(t('common.error'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle bulk action
  const applyBulkAction = async () => {
    if (!bulkAction || selectedPoems.length === 0) return;

    const actionVerb = bulkAction === 'delete'
      ? t('common.delete')
      : (bulkAction === 'publish' ? t('poems.published') : bulkAction === 'unpublish' ? t('poems.draft') : bulkAction === 'feature' ? t('poems.feature') : t('poems.unfeature'));
    const ok = await confirm({
      title: t('common.confirm'),
      message: t('poems.bulk-action-confirm', { count: selectedPoems.length, action: actionVerb }),
      type: bulkAction === 'delete' ? 'danger' : 'warning',
      confirmText: t('common.apply'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      const promises = selectedPoems.map(poemId => {
        switch (bulkAction) {
          case 'publish':
            return api.patch(`/poems/${poemId}/toggle-publish`, { isPublished: true });
          case 'unpublish':
            return api.patch(`/poems/${poemId}/toggle-publish`, { isPublished: false });
          case 'feature':
          case 'unfeature':
            return api.patch(`/poems/${poemId}/toggle-featured`);
          case 'delete':
            return api.delete(`/poems/${poemId}`);
          default:
            return Promise.resolve();
        }
      });
      await withLoading(() => Promise.all(promises), t('common.updating'));
      addToast(t('poems.bulk-action-success'), 'success');
      fetchPoems();
      fetchStats();
      setSelectedPoems([]);
      setBulkAction("");
    } catch (error) {
      console.error("Error applying bulk action:", error);
      addToast(t('common.error'), 'error');
    }
  };

  // Initialize stats
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleEdit = (poem) => {
    navigate(`/admin/poems/edit/${poem._id}`);
  };

  // Handle successful poem operation
  const handlePoemSuccess = (message) => {
    addToast(message, 'success');
    fetchPoems();
    fetchStats();
  };

 // In PoemDashboard.jsx, update the handleAddNewPoem function
const handleAddNewPoem = () => {
  navigate('/admin/poems/new');
};

  return (
    <AdminPageLayout
      icon={<BookOpen size={24} />}
      title={t('poems.admin')}
      subtitle={t('poems.manage')}
      actions={
        <>
          <button
            className="btn-admin btn-admin--secondary"
            onClick={() => {
              fetchPoems();
              fetchStats();
            }}
            title={t('common.refresh')}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            className="btn-admin btn-admin--secondary"
            onClick={handleExport}
            disabled={isExporting}
            title={t('common.download')}
          >
            {isExporting ? <div className="spinner" /> : <Download size={20} />}
          </button>
          <button
            className="btn-admin btn-admin--primary"
            onClick={handleAddNewPoem}
          >
            <Plus size={20} />
            {t('poems.add-new')}
          </button>
        </>
      }
    >
      <PoemList
        poems={poems}
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
        selectedPoems={selectedPoems}
        setSelectedPoems={setSelectedPoems}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        page={page}
        totalPages={totalPages}
        totalPoems={totalPoems}
        onPageChange={setPage}
        onSearch={handleSearch}
        onBulkAction={applyBulkAction}
        onEdit={handleEdit}
        onDelete={async (poemId) => {
          const ok = await confirm({
            title: t('common.delete'),
            message: t('poems.delete-confirm'),
            type: 'danger',
            confirmText: t('common.delete'),
            cancelText: t('common.cancel')
          });
          if (!ok) return;
          try {
            await withLoading(() => api.delete(`/poems/${poemId}`), t('common.deleting'));
            handlePoemSuccess(t('poems.deleted-success'));
          } catch (e) {
            console.error(e);
          }
        }}
        onTogglePublish={fetchPoems}
        onToggleFeatured={fetchPoems}
        stats={stats}
      />
    </AdminPageLayout>
  );
};

export default PoemDashboard;
