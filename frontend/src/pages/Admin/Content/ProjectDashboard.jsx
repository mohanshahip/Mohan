// pages/Admin/Content/ProjectDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  Download,
  RefreshCw,
  Plus,
  Loader,
} from "lucide-react";
import ProjectList from "./ProjectList";
import ProjectStats from "./ProjectStats";
import '../../../styles/ProjectDashboard.css';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';
import { useToast } from '../../../context/ToastContext';
import AdminPageLayout from '../../../components/common/AdminPageLayout';

import useAdminData from '../../../hooks/useAdminData';

const ProjectDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { withLoading } = useLoading();
  const confirm = useConfirm();

  const {
    data: projects,
    loading,
    page,
    setPage,
    totalPages,
    total: totalProjects,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    stats,
    setStats,
    refresh: fetchProjects
  } = useAdminData('/projects/admin/all', {
    status: 'all',
    category: 'all',
    published: 'all',
    language: 'all'
  }, 'projects', ['new_activity']);

  const [viewMode, setViewMode] = useState("table");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const language = (i18n.language === "np" ? "ne" : (i18n.language || "en"));

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      // For projects, we calculate from the data or have a separate endpoint
      if (projects.length > 0) {
        const statsData = {
          totalProjects: projects.length,
          published: projects.filter(p => p.isPublished).length,
          featured: projects.filter(p => p.isFeatured).length,
          inProgress: projects.filter(p => p.status === 'in-progress').length,
          completed: projects.filter(p => p.status === 'completed').length,
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  }, [projects, setStats]);

  // Update stats when projects change
  useEffect(() => {
    fetchStats();
  }, [projects, fetchStats]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  // Export projects
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await withLoading(() => api.get('/projects/admin/all', { params: { limit: 1000, lang: language } }), t('projects.exporting'));

      if (response.data?.success) {
        const jsonString = JSON.stringify(response.data.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `projects-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addToast(t('projects.export-success'), 'success');
      }
    } catch (error) {
      console.error("Error exporting projects:", error);
      addToast(t('projects.export-failed') || t('common.error'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle bulk action
  const applyBulkAction = async () => {
    if (!bulkAction || selectedProjects.length === 0) return;

    try {
      const actionVerb = bulkAction === 'delete'
        ? t('common.delete')
        : (bulkAction === 'publish' ? t('common.publish') : bulkAction === 'unpublish' ? t('common.unpublish') : bulkAction === 'feature' ? t('common.feature') : t('common.unfeature'));
      const ok = await confirm({
        title: t('common.confirm'),
        message: t('projects.bulk-action-confirm', { count: selectedProjects.length, action: actionVerb }),
        type: bulkAction === 'delete' ? 'danger' : 'warning',
        confirmText: t('common.apply'),
        cancelText: t('common.cancel')
      });
      if (!ok) return;
      const promises = selectedProjects.map(projectId => {
        switch (bulkAction) {
          case 'publish':
            return api.patch(`/projects/${projectId}/toggle-publish`, { isPublished: true });
          case 'unpublish':
            return api.patch(`/projects/${projectId}/toggle-publish`, { isPublished: false });
          case 'feature':
          case 'unfeature':
            return api.patch(`/projects/${projectId}/toggle-featured`);
          case 'delete':
            return api.delete(`/projects/${projectId}`);
          default:
            return Promise.resolve();
        }
      });

      await withLoading(() => Promise.all(promises), t('common.updating'));
      addToast(t('projects.bulk-action-success'), 'success');
      fetchProjects();
      setSelectedProjects([]);
      setBulkAction("");

    } catch (error) {
      console.error("Error applying bulk action:", error);
      addToast(t('common.error'), 'error');
    }
  };

  const handleEdit = (project) => {
    navigate(`/admin/projects/edit/${project._id}`);
  };

  // Handle successful project operation
  const handleProjectSuccess = (message) => {
    addToast(message, 'success');
    fetchProjects();
  };

  const handleAddNewProject = () => {
    navigate('/admin/projects/new');
  };

  return (
    <AdminPageLayout
      icon={<FolderOpen size={24} />}
      title={t('projects.title')}
      subtitle={t('projects.manage')}
      actions={
        <>
          <button
            className="btn-admin btn-admin--secondary"
            onClick={() => {
              fetchProjects();
            }}
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
            onClick={handleAddNewProject}
          >
            <Plus size={20} />
            {t('projects.add-new')}
          </button>
        </>
      }
    >
      <ProjectList
        projects={projects}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={filters.status}
        setStatusFilter={(val) => setFilters({ status: val })}
        categoryFilter={filters.category}
        setCategoryFilter={(val) => setFilters({ category: val })}
        publishedFilter={filters.published}
        setPublishedFilter={(val) => setFilters({ published: val })}
        languageFilter={filters.language}
        setLanguageFilter={(val) => setFilters({ language: val })}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedProjects={selectedProjects}
        setSelectedProjects={setSelectedProjects}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        page={page}
        totalPages={totalPages}
        totalProjects={totalProjects}
        onPageChange={setPage}
        onSearch={handleSearch}
        onBulkAction={applyBulkAction}
        onEdit={handleEdit}
        onDelete={async (projectId) => {
          const ok = await confirm({
            title: t('common.delete'),
            message: t('projects.delete-confirmation'),
            type: 'danger',
            confirmText: t('common.delete'),
            cancelText: t('common.cancel')
          });
          if (!ok) return;
          try {
            await withLoading(() => api.delete(`/projects/${projectId}`), t('common.deleting'));
            handleProjectSuccess(t('projects.delete-success'));
          } catch (e) {
            console.error(e);
          }
        }}
        onTogglePublish={fetchProjects}
        onToggleFeatured={fetchProjects}
        stats={stats}
      />
    </AdminPageLayout>
  );
};

export default ProjectDashboard;
