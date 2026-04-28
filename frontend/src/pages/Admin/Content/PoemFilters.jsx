// components/admin/PoemFilters.jsx
import React from 'react';
import { Search, Filter, Tag, Globe, List, Grid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../../../components/common/CustomSelect'; // Import CustomSelect
import '../../../styles/AdminCommon.css';

const PoemFilters = ({
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
  onSearch
}) => {
  const { t } = useTranslation();

  const poemCategories = [
    { id: "all", label: t('common.all') },
    { id: "love", label: t('poems.categories.love') },
    { id: "nature", label: t('poems.categories.nature') },
    { id: "inspirational", label: t('poems.categories.inspirational') },
    { id: "philosophical", label: t('poems.categories.philosophical') },
    { id: "nostalgic", label: t('poems.categories.nostalgic') },
    { id: "spiritual", label: t('poems.categories.spiritual') },
    { id: "social", label: t('poems.categories.social') },
    { id: "humorous", label: t('poems.categories.humorous') },
    { id: "other", label: t('poems.categories.other') }
  ];

  return (
    <div className="admin-filter-bar">
      <form onSubmit={onSearch} className="admin-search-wrapper">
        <Search className="admin-search-icon" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('poems.search')}
          className="admin-search-input"
        />
      </form>

      <div className="admin-filter-group">
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          icon={Filter}
          options={[
            { value: 'all', label: t('poems.all-statuses') },
            { value: 'published', label: t('poems.published') },
            { value: 'draft', label: t('poems.draft') }
          ]}
        />
      </div>

      <div className="admin-filter-group">
        <CustomSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          icon={Tag}
          options={poemCategories.map(cat => ({ value: cat.id, label: cat.label }))}
        />
      </div>

      <div className="admin-filter-group">
        <CustomSelect
          value={languageFilter}
          onChange={setLanguageFilter}
          icon={Globe}
          options={[
            { value: 'all', label: t('poems.all-languages') },
            { value: 'en', label: t('common.languages.english') },
            { value: 'ne', label: t('common.languages.nepali') }
          ]}
        />
      </div>

      <div className="admin-view-toggles">
        <button
          onClick={() => setViewMode("table")}
          className={`admin-view-btn ${viewMode === "table" ? "is-active" : ""}`}
          title={t('projects.table-view')}
        >
          <List size={20} />
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`admin-view-btn ${viewMode === "grid" ? "is-active" : ""}`}
          title={t('projects.gallery-view')}
        >
          <Grid size={20} />
        </button>
      </div>
    </div>
  );
};

export default PoemFilters;