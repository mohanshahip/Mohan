// pages/Admin/ManageAdmins/components/AdminFilters.jsx
import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronUp, Undo2, Filter, Shield, Calendar, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../../../components/common/CustomSelect';
import '../../../styles/AdminCommon.css';

const AdminFilters = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'all', label: t('admin.all-status') },
    { value: 'active', label: t('common.active') },
    { value: 'inactive', label: t('common.inactive') }
  ];

  const roleOptions = [
    { value: 'all', label: t('admin.all-roles') },
    { value: 'admin', label: t('admin.admin') },
    { value: 'superadmin', label: t('admin.super-admin') },
    { value: 'moderator', label: t('admin.moderator') }
  ];

  const dateRangeOptions = [
    { value: 'all', label: t('admin.all-time') },
    { value: 'today', label: t('admin.today') },
    { value: 'week', label: t('admin.last7-days') },
    { value: 'month', label: t('admin.last30-days') },
    { value: 'quarter', label: t('admin.last90-days') }
  ];

  const sortOptions = [
    { value: 'newest', label: t('admin.newest-first') },
    { value: 'oldest', label: t('admin.oldest-first') },
    { value: 'name', label: t('admin.by-name') },
    { value: 'email', label: t('admin.by-email') }
  ];

  return (
    <div className="admin-filter-bar-container">
      <div className="admin-filter-bar">
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" size={18} />
          <input
            type="text"
            className="admin-search-input"
            placeholder={t('admin.search-by-username-email-name')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <CustomSelect
            value={filters.status}
            onChange={(val) => onFilterChange({ ...filters, status: val })}
            icon={Filter}
            options={statusOptions}
          />
        </div>

        <button
          className={`btn-admin btn-admin--secondary btn-admin--icon ${showAdvanced ? 'u-text-primary' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
          type="button"
          title={t('admin.advanced-filters')}
        >
          {showAdvanced ? <ChevronUp size={20} /> : <SlidersHorizontal size={20} />}
        </button>

        {showAdvanced && (
          <button
            type="button"
            className="btn-admin btn-admin--secondary"
            onClick={() => onFilterChange({ status: 'all', role: 'all', dateRange: 'all', sortBy: 'newest' })}
            title={t('common.reset-filters')}
          >
            <Undo2 size={16} />
            <span>{t('common.reset')}</span>
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="admin-filter-bar u-mt-md" style={{ borderStyle: 'dashed' }}>
          <div className="admin-filter-group">
            <span className="admin-filter-label">{t('admin.role')}</span>
            <CustomSelect
              value={filters.role}
              onChange={(val) => onFilterChange({ ...filters, role: val })}
              icon={Shield}
              options={roleOptions}
            />
          </div>

          <div className="admin-filter-group">
            <span className="admin-filter-label">{t('admin.date-range')}</span>
            <CustomSelect
              value={filters.dateRange}
              onChange={(val) => onFilterChange({ ...filters, dateRange: val })}
              icon={Calendar}
              options={dateRangeOptions}
            />
          </div>

          <div className="admin-filter-group">
            <span className="admin-filter-label">{t('common.sort-by')}</span>
            <CustomSelect
              value={filters.sortBy}
              onChange={(val) => onFilterChange({ ...filters, sortBy: val })}
              icon={List}
              options={sortOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFilters;
