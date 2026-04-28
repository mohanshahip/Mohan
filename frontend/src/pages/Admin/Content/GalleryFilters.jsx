import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, List, Grid, Tag, Filter, Globe } from 'lucide-react';
import CustomSelect from '../../../components/common/CustomSelect';
import '../../../styles/AdminCommon.css';

const GalleryFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  languageFilter,
  setLanguageFilter,
  onSearch,
  viewMode,
  setViewMode
}) => {
  const { t } = useTranslation();

  const categories = [
    { value: 'all', label: t('common.allCategories') },
    { value: 'projects', label: t('gallery.categories.projects') },
    { value: 'events', label: t('gallery.categories.events') },
    { value: 'travel', label: t('gallery.categories.travel') },
    { value: 'portraits', label: t('gallery.categories.portraits') },
    { value: 'nature', label: t('gallery.categories.nature') },
    { value: 'art', label: t('gallery.categories.art') },
    { value: 'food', label: t('gallery.categories.food') },
    { value: 'architecture', label: t('gallery.categories.architecture') },
    { value: 'other', label: t('gallery.categories.other') }
  ];

  const languages = [
    { value: 'all', label: t('common.allLanguages') },
    { value: 'en', label: t('common.languages.english') },
    { value: 'ne', label: t('common.languages.nepali') }
  ];

  const statuses = [
    { value: 'all', label: t('common.allStatus') },
    { value: 'published', label: t('common.published') },
    { value: 'draft', label: t('common.draft') }
  ];

  return (
    <div className="admin-filter-bar">
      {/* Search Bar */}
      <form onSubmit={onSearch} className="admin-search-wrapper">
        <Search className="admin-search-icon" size={18} />
        <input
          type="text"
          className="admin-search-input"
          placeholder={t('common.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Category Filter */}
      <div className="admin-filter-group">
        <CustomSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          icon={Tag}
          options={categories}
        />
      </div>

      {/* Status Filter */}
      <div className="admin-filter-group">
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          icon={Filter}
          options={statuses}
        />
      </div>

      {/* Language Filter */}
      <div className="admin-filter-group">
        <CustomSelect
          value={languageFilter}
          onChange={setLanguageFilter}
          icon={Globe}
          options={languages}
        />
      </div>

      {/* View Mode Toggles */}
      <div className="admin-view-toggles">
        <button
          className={`admin-view-btn ${viewMode === 'table' ? 'is-active' : ''}`}
          onClick={() => setViewMode('table')}
          title={t('common.tableView')}
        >
          <List size={20} />
        </button>
        <button
          className={`admin-view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
          onClick={() => setViewMode('grid')}
          title={t('common.gridView')}
        >
          <Grid size={20} />
        </button>
      </div>
    </div>
  );
};

export default GalleryFilters;
