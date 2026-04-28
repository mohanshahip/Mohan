import React from 'react';
import { Search, Filter, X, ChevronDown, ListOrdered } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect from './CustomSelect'; // Import CustomSelect

const SearchAndFilter = ({
  search,
  onSearchChange,
  onToggleFilters,
  showFilters,
  sortValue,
  onSortChange,
  sortOptions = [],
  children // For additional filters
}) => {
  const { t } = useTranslation();

  return (
    <div className="controls-bar-wrapper">
      <div className="controls-bar">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filters-controls">
          {onToggleFilters && (
            <button
              className={`btn btn-outline filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={onToggleFilters}
            >
              <Filter size={18} />
              <span>{t('common.filters')}</span>
              <ChevronDown size={16} className={`chevron ${showFilters ? 'rotate' : ''}`} />
            </button>
          )}

          {sortOptions.length > 0 && (
            <div className="sort-container">
              <CustomSelect
                value={sortValue}
                onChange={onSortChange}
                options={sortOptions}
                icon={ListOrdered}
                align="right"
              />
            </div>
          )}
        </div>
      </div>

      {showFilters && children && (
        <div className="filters-panel">
          <div className="filters-grid">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
