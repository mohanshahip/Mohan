// components/admin/PoemList.jsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // Add this import
import {
  Search,
  Filter,
  Tag,
  Globe,
  Grid,
  List,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Star,
  StarOff,
  User,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Loader
} from "lucide-react";
import PoemStats from "./PoemStats";
import PoemFilters from "./PoemFilters";
import PoemBulkActions from "./PoemBulkActions";
import PoemPagination from "./PoemPagination";
import DataTable from "../../../components/common/DataTable"; // Import DataTable
import PoemCard from './PoemCard'; // Import PoemCard

// Import styles
import '../../../styles/AdminCommon.css';
import '../../../styles/PoemList.css';
import '../../../styles/PoemBulkActions.css';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';

const PoemList = ({
  poems,
  loading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  languageFilter,
  setLanguageFilter,
  viewMode,
  setViewMode,
  selectedPoems,
  setSelectedPoems,
  bulkAction,
  setBulkAction,
  page,
  totalPages,
  totalPoems,
  onPageChange,
  onSearch,
  onBulkAction,
  onEdit, // Keep this if you still want to use it, or remove it
  onDelete,
  onTogglePublish,
  onToggleFeatured,
  stats
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // Initialize navigate
  const { withLoading } = useLoading();
  const confirm = useConfirm();

  // Handle poem selection
  const handleSelectPoem = (poemId) => {
    if (selectedPoems.includes(poemId)) {
      setSelectedPoems(selectedPoems.filter(id => id !== poemId));
    } else {
      setSelectedPoems([...selectedPoems, poemId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedPoems.length === poems.length) {
      setSelectedPoems([]);
    } else {
      setSelectedPoems(poems.map(poem => poem._id));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle publish status
  const togglePublish = async (poemId, currentStatus) => {
    const ok = await confirm({
      title: currentStatus ? t('common.unpublish') : t('common.publish'),
      message: currentStatus ? t('poems.confirm-unpublish') : t('poems.confirm-publish'),
      type: 'warning',
      confirmText: currentStatus ? t('common.unpublish') : t('common.publish'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      await withLoading(() => api.patch(`/poems/${poemId}/toggle-publish`), t('common.updating'));
      onTogglePublish();
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (poemId, currentStatus) => {
    const ok = await confirm({
      title: currentStatus ? t('common.unfeature') : t('common.feature'),
      message: currentStatus ? t('poems.confirm-unfeature') : t('poems.confirm-feature'),
      type: 'warning',
      confirmText: currentStatus ? t('common.unfeature') : t('common.feature'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      await withLoading(() => api.patch(`/poems/${poemId}/toggle-featured`), t('common.updating'));
      onToggleFeatured();
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const handleEditClick = (poem) => {
    navigate(`/admin/poems/edit/${poem._id}`);
  };

  const columns = [
    {
      key: 'title',
      label: t('common.title'),
      render: (_, poem) => (
        <div className="u-flex u-flex-direction-column">
          <div className="u-flex u-items-center u-gap-sm">
            <span className="u-font-bold">{poem.title}</span>
            {poem.isFeatured && (
              <Star size={14} className="u-text-warning" fill="currentColor" />
            )}
          </div>
          <div className="u-text-xs u-text-muted">
            {poem.excerpt?.substring(0, 40)}...
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: t('common.category'),
      render: (category) => (
        <span className="admin-badge admin-badge--info">
          {t(`poems.categories.${category}`)}
        </span>
      )
    },
    {
      key: 'author',
      label: t('admin.administrator'),
      render: (author) => author
    },
    {
      key: 'language',
      label: t('common.language'),
      render: (lang) => (
        <span className={`admin-badge ${lang === 'ne' ? 'admin-badge--warning' : 'admin-badge--info'}`}>
          {lang === 'ne' ? 'ने' : 'EN'}
        </span>
      )
    },
    {
      key: 'isPublished',
      label: t('common.status'),
      render: (_, poem) => (
        <button
          className={`admin-badge border-none cursor-pointer ${poem.isPublished ? 'admin-badge--success' : 'admin-badge--warning'}`}
          onClick={() => togglePublish(poem._id, poem.isPublished)}
          title={poem.isPublished ? t('common.unpublish') : t('common.publish')}
        >
          {poem.isPublished ? <Eye size={14} className="u-mr-xs" /> : <EyeOff size={14} className="u-mr-xs" />}
          {poem.isPublished ? t('poems.published') : t('poems.draft')}
        </button>
      )
    },
    {
      key: 'views',
      label: t('common.views'),
      render: (views) => views || 0
    },
    {
      key: 'createdAt',
      label: t('common.date'),
      render: (date) => formatDate(date)
    }
  ];

  return (
    <div className="poem-list-container">
      {/* Stats Overview */}
      <PoemStats stats={stats} />

      {/* Filters */}
      <PoemFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSearch={onSearch}
      />

      {/* Bulk Actions */}
      {selectedPoems.length > 0 && (
        <PoemBulkActions
          selectedCount={selectedPoems.length}
          bulkAction={bulkAction}
          setBulkAction={setBulkAction}
          onApply={onBulkAction}
          onClear={() => setSelectedPoems([])}
        />
      )}

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <div className="admin-card u-p-0">
          <DataTable
            columns={columns}
            data={poems}
            loading={loading}
            pagination={{
              currentPage: page,
              pageSize: 10,
              total: totalPoems,
              totalPages: totalPages
            }}
            onPageChange={onPageChange}
            selectable={true}
            selectedRows={selectedPoems}
            onSelectRow={handleSelectPoem}
            onSelectAll={handleSelectAll}
            actions={(poem) => (
              <div className="u-flex u-gap-sm">
                <button
                  className="btn-admin btn-admin--secondary btn-admin--icon"
                  onClick={() => handleEditClick(poem)}
                  title={t('common.edit')}
                >
                  <Edit size={16} />
                </button>
                <button
                  className={`btn-admin btn-admin--secondary btn-admin--icon ${poem.isFeatured ? 'u-text-warning' : ''}`}
                  onClick={() => toggleFeatured(poem._id, poem.isFeatured)}
                  title={poem.isFeatured ? t('common.unfeature') : t('common.feature')}
                >
                  {poem.isFeatured ? <StarOff size={16} /> : <Star size={16} />}
                </button>
                <button
                  className="btn-admin btn-admin--danger btn-admin--icon"
                  onClick={() => onDelete(poem._id)}
                  title={t('common.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </div>
      ) : loading ? (
        <div className="grid-loading-wrapper">
          <Loader className="animate-spin u-text-primary" size={48} />
          <p>{t('common.loading')}</p>
        </div>
      ) : poems.length === 0 ? (
        <div className="grid-empty-wrapper">
          <BookOpen size={64} className="grid-empty-icon" />
          <h3 className="grid-empty-title">{t('poems.no-poems')}</h3>
          <p className="grid-empty-desc">
            {searchQuery ? t('common.tryDifferentSearch') : t('poems.add-first')}
          </p>
        </div>
      ) : (
        <div className="poem-grid-container">
          <div className="admin-cards-grid">
            {poems.map(poem => (
              <PoemCard
                key={poem._id}
                poem={poem}
                t={t}
                navigate={navigate}
                handleEditClick={handleEditClick}
                onDelete={onDelete}
                togglePublish={togglePublish}
                toggleFeatured={toggleFeatured}
                isSelected={selectedPoems.includes(poem._id)}
                onSelect={handleSelectPoem}
                formatDate={formatDate}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="u-mt-xl u-flex u-justify-center">
              <PoemPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PoemList;
