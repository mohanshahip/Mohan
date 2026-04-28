// components/admin/ProjectList.jsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Star,
  StarOff,
  ExternalLink,
  FolderOpen,
  Loader,
  Check
} from "lucide-react";
import ProjectStats from "./ProjectStats";
import ProjectFilters from "./ProjectFilter";
import ProjectBulkActions from "./ProjectBulkActions";
import ProjectPagination from "./ProjectPagination";
import ProjectCard from "./ProjectCard";
import DataTable from "../../../components/common/DataTable"; // Import DataTable

import '../../../styles/AdminCommon.css';
import '../../../styles/ProjectList.css';
import '../../../styles/ProjectBulkActions.css';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';

const ProjectList = ({
  projects,
  loading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  publishedFilter,
  setPublishedFilter,
  languageFilter,
  setLanguageFilter,
  viewMode,
  setViewMode,
  selectedProjects,
  setSelectedProjects,
  bulkAction,
  setBulkAction,
  page,
  totalPages,
  totalProjects,
  onPageChange,
  onSearch,
  onBulkAction,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleFeatured,
  stats
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { withLoading } = useLoading();
  const confirm = useConfirm();

  // Handle project selection
  const handleSelectProject = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(project => project._id));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'np' ? 'ne-NP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle publish status
  const togglePublish = async (projectId, currentStatus) => {
    const ok = await confirm({
      title: currentStatus ? t('common.unpublish') : t('common.publish'),
      message: currentStatus ? t('projects.confirm-unpublish') : t('projects.confirm-publish'),
      type: 'warning',
      confirmText: currentStatus ? t('common.unpublish') : t('common.publish'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      await withLoading(() => api.patch(`/projects/${projectId}/toggle-publish`), t('common.updating'));
      onTogglePublish();
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (projectId, currentStatus) => {
    const ok = await confirm({
      title: currentStatus ? t('common.unfeature') : t('common.feature'),
      message: currentStatus ? t('projects.confirm-unfeature') : t('projects.confirm-feature'),
      type: 'warning',
      confirmText: currentStatus ? t('common.unfeature') : t('common.feature'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      await withLoading(() => api.patch(`/projects/${projectId}/toggle-featured`), t('common.updating'));
      onToggleFeatured();
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const handleEditClick = (project) => {
    navigate(`/admin/projects/edit/${project._id}`);
  };

  // Get category display name
  const getCategoryName = (category) => {
    const categories = {
      'web-development': t('projects.categories.web-development'),
      'mobile-app': t('projects.categories.mobile-app'),
      'design': t('projects.categories.design'),
      'e-commerce': t('projects.categories.e-commerce'),
      'api': t('projects.categories.api'),
      'full-stack': t('projects.categories.full-stack'),
      'open-source': t('projects.categories.open-source'),
      'other': t('projects.categories.other')
    };
    return categories[category] || category;
  };

  // Get status display name
  const getStatusName = (status) => {
    const statuses = {
      'completed': t('projects.statuses.completed'),
      'in-progress': t('projects.statuses.in-progress'),
      'planned': t('projects.statuses.planned'),
      'archived': t('projects.statuses.archived')
    };
    return statuses[status] || status;
  };

  const columns = [
    {
      key: 'title',
      label: t('common.title'),
      render: (_, project) => (
        <div className="u-flex u-flex-direction-column">
          <div className="u-flex u-items-center u-gap-sm">
            <span className="u-font-bold">{project.title}</span>
            {project.isFeatured && (
              <Star size={14} className="u-text-warning" fill="currentColor" />
            )}
          </div>
          <div className="u-text-xs u-text-muted">
            {project.techStack?.slice(0, 3).join(', ')}
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: t('common.category'),
      render: (category) => (
        <span className="admin-badge admin-badge--info">
          {getCategoryName(category)}
        </span>
      )
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (status) => (
        <span className={`admin-badge ${status === 'completed' ? 'admin-badge--success' : status === 'in-progress' ? 'admin-badge--info' : 'admin-badge--warning'}`}>
          {getStatusName(status)}
        </span>
      )
    },
    {
      key: 'visibility',
      label: t('common.visibility'),
      render: (_, project) => (
        <button
          className={`admin-badge border-none cursor-pointer ${project.isPublished ? 'admin-badge--success' : 'admin-badge--warning'}`}
          onClick={() => togglePublish(project._id, project.isPublished)}
          title={project.isPublished ? t('common.unpublish') : t('common.publish')}
        >
          {project.isPublished ? <Eye size={14} className="u-mr-xs" /> : <EyeOff size={14} className="u-mr-xs" />}
          {project.isPublished ? t('projects.published') : t('projects.draft')}
        </button>
      )
    },
    {
      key: 'createdAt',
      label: t('common.created'),
      render: (date) => formatDate(date)
    }
  ];

  return (
    <div className="project-list-container">
      {/* Stats Overview */}
      <ProjectStats stats={stats} />

      {/* Filters */}
      <ProjectFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        publishedFilter={publishedFilter}
        setPublishedFilter={setPublishedFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSearch={onSearch}
      />

      {/* Bulk Actions */}
      {selectedProjects.length > 0 && (
        <ProjectBulkActions
          selectedCount={selectedProjects.length}
          bulkAction={bulkAction}
          setBulkAction={setBulkAction}
          onApply={onBulkAction}
          onClear={() => setSelectedProjects([])}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="project-list-loading">
          <Loader className="animate-spin" size={32} />
          <span>{t('common.loading')}</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="project-list-empty">
          <FolderOpen size={48} />
          <h3>{t('projects.no-projects-found')}</h3>
          <p>{searchQuery ? t('projects.try-different-search') : t('projects.add-your-first-project')}</p>
        </div>
      ) : viewMode === "table" ? (
        // Table View
        <div className="admin-card u-p-0">
          <DataTable
            columns={columns}
            data={projects}
            loading={loading}
            pagination={{
              currentPage: page,
              pageSize: 10,
              total: totalProjects,
              totalPages: totalPages
            }}
            onPageChange={onPageChange}
            selectable={true}
            selectedRows={selectedProjects}
            onSelectRow={handleSelectProject}
            onSelectAll={handleSelectAll}
            actions={(project) => (
              <div className="u-flex u-gap-sm">
                <button
                  className="btn-admin btn-admin--secondary btn-admin--icon"
                  onClick={() => handleEditClick(project)}
                  title={t('common.edit')}
                >
                  <Edit size={16} />
                </button>
                <button
                  className={`btn-admin btn-admin--secondary btn-admin--icon ${project.isFeatured ? 'u-text-warning' : ''}`}
                  onClick={() => toggleFeatured(project._id, project.isFeatured)}
                  title={project.isFeatured ? t('common.unfeature') : t('common.feature')}
                >
                  {project.isFeatured ? <StarOff size={16} /> : <Star size={16} />}
                </button>
                <button
                  className="btn-admin btn-admin--secondary btn-admin--icon"
                  onClick={() => window.open(`/projects/${project._id}`, '_blank')}
                  title={t('common.view')}
                >
                  <ExternalLink size={16} />
                </button>
                <button
                  className="btn-admin btn-admin--danger btn-admin--icon"
                  onClick={() => onDelete(project._id)}
                  title={t('common.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </div>
      ) : (
        // Grid View
        <div className="admin-cards-grid">
          {projects.map(project => (
            <ProjectCard
              key={project._id}
              project={project}
              t={t}
              navigate={navigate}
              handleEditClick={handleEditClick}
              onDelete={onDelete}
              toggleFeatured={toggleFeatured}
              isSelected={selectedProjects.includes(project._id)}
              onSelect={handleSelectProject}
              formatDate={formatDate}
              getStatusName={getStatusName}
              getCategoryName={getCategoryName}
            />
          ))}
        </div>
      )}

      {/* Pagination (only for grid view as DataTable has its own) */}
      {viewMode === 'grid' && totalPages > 1 && (
        <ProjectPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalProjects}
          limit={10}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default ProjectList;
