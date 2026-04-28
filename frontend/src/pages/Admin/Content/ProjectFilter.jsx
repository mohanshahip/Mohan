// components/admin/ProjectFilters.jsx
import React from 'react';
import { Search, Filter, Tag, Grid, List, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../../../components/common/CustomSelect'; // Import CustomSelect
import '../../../styles/AdminCommon.css';

const ProjectFilters = ({
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
  onSearch
}) => {
  const { t } = useTranslation();

  const projectCategories = [
    { id: "all", label: t("common.all") },
    { id: "web-development", label: t("projects.categories.web-development") },
    { id: "mobile-app", label: t("projects.categories.mobile-app") },
    { id: "design", label: t("projects.categories.design") },
    { id: "e-commerce", label: t("projects.categories.e-commerce") },
    { id: "api", label: t("projects.categories.api") },
    { id: "full-stack", label: t("projects.categories.full-stack") },
    { id: "open-source", label: t("projects.categories.open-source") },
    { id: "other", label: t("projects.categories.other") }
  ];

  const statusOptions = [
    { id: "all", label: t("projects.all-statuses") },
    { id: "completed", label: t("projects.completed") },
    { id: "in-progress", label: t("projects.in-progress") },
    { id: "planned", label: t("projects.planned") },
    { id: "archived", label: t("projects.archived") }
  ];

  const publishedOptions = [
    { id: "all", label: t("projects.visibility") },
    { id: "published", label: t("projects.published") },
    { id: "draft", label: t("projects.draft") }
  ];

  const languageOptions = [
    { id: "all", label: t("common.all-languages") || "All Languages" },
    { id: "en", label: t("common.languages.english") },
    { id: "ne", label: t("common.languages.nepali") }
  ];

  return (
    <div className="admin-filter-bar">
      <form onSubmit={onSearch} className="admin-search-wrapper">
        <Search className="admin-search-icon" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('projects.search')}
          className="admin-search-input"
        />
      </form>

      <div className="admin-filter-group">
        <CustomSelect
          value={languageFilter}
          onChange={setLanguageFilter}
          icon={Globe}
          options={languageOptions.map(option => ({ value: option.id, label: option.label }))}
        />
      </div>

      <div className="admin-filter-group">
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          icon={Filter}
          options={statusOptions.map(option => ({ value: option.id, label: option.label }))}
        />
      </div>

      <div className="admin-filter-group">
        <CustomSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          icon={Tag}
          options={projectCategories.map(cat => ({ value: cat.id, label: cat.label }))}
        />
      </div>

      <div className="admin-filter-group">
        <CustomSelect
          value={publishedFilter}
          onChange={setPublishedFilter}
          icon={Filter}
          options={publishedOptions.map(option => ({ value: option.id, label: option.label }))}
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

export default ProjectFilters;