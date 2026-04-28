import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Eye, EyeOff, Trash2, Edit, 
  MoreVertical, Calendar, MapPin, 
  Image as ImageIcon, Grid, List as ListIcon,
  CheckSquare, Square
} from 'lucide-react';
import GalleryFilters from './GalleryFilters';
import GalleryPagination from './GalleryPagination';
import GalleryBulkActions from './GalleryBulkActions';
import StatCard from '../../../components/common/StatCard';
import GalleryCard from './GalleryCard';
import { useNavigate } from 'react-router-dom';

// Import styles
import '../../../styles/AdminCommon.css';
import '../../../styles/GalleryAdmin.css';
import '../../../styles/GalleryBulkActions.css';

const GalleryList = ({
  galleries,
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
  selectedGalleries,
  setSelectedGalleries,
  bulkAction,
  setBulkAction,
  page,
  totalPages,
  totalGalleries,
  onPageChange,
  onSearch,
  onBulkAction,
  onEdit,
  onDelete,
  onTogglePublish,
  stats
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSelectAll = () => {
    if (selectedGalleries.length === galleries.length) {
      setSelectedGalleries([]);
    } else {
      setSelectedGalleries(galleries.map(g => g._id));
    }
  };

  const handleSelectOne = (id) => {
    if (selectedGalleries.includes(id)) {
      setSelectedGalleries(selectedGalleries.filter(itemId => itemId !== id));
    } else {
      setSelectedGalleries([...selectedGalleries, id]);
    }
  };

  if (loading && galleries.length === 0) {
    return (
      <div className="u-flex u-justify-center u-items-center u-p-xl">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="admin-list-container">
      {/* Stats Section */}
      {stats && (
        <div className="admin-stats-grid u-mb-xl">
          <StatCard
            label={t('gallery.total')}
            value={totalGalleries}
            icon={ImageIcon}
            color="#6366f1"
          />
          <StatCard
            label={t('common.published')}
            value={galleries.filter(g => g.isPublished).length}
            icon={CheckSquare}
            color="#10b981"
          />
        </div>
      )}

      {/* Filters Section */}
      <GalleryFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        onSearch={onSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Bulk Actions */}
      <GalleryBulkActions
        selectedCount={selectedGalleries.length}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        onApply={onBulkAction}
      />

      {/* Content Section */}
      {galleries.length === 0 ? (
        <div className="admin-empty-state">
          <ImageIcon size={48} className="u-text-muted u-mb-md" />
          <h3>{t('gallery.admin.no-galleries')}</h3>
          <p>{t('common.noResults')}</p>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="u-w-10">
                      <button className="btn-icon-sm" onClick={handleSelectAll}>
                        {selectedGalleries.length === galleries.length && galleries.length > 0 
                          ? <CheckSquare size={16} className="u-text-primary" /> 
                          : <Square size={16} />
                        }
                      </button>
                    </th>
                    <th>{t('common.gallery')}</th>
                    <th>{t('common.category')}</th>
                    <th>{t('common.images')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.date')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {galleries.map(gallery => (
                    <tr key={gallery._id} className={selectedGalleries.includes(gallery._id) ? 'is-selected' : ''}>
                      <td>
                        <button className="btn-icon-sm" onClick={() => handleSelectOne(gallery._id)}>
                          {selectedGalleries.includes(gallery._id) 
                            ? <CheckSquare size={16} className="u-text-primary" /> 
                            : <Square size={16} />
                          }
                        </button>
                      </td>
                      <td>
                        <div className="u-flex u-items-center u-gap-md">
                          <div className="admin-table-thumb">
                            <img 
                              src={gallery.images?.find(img => img.isPrimary)?.url || gallery.images?.[0]?.url} 
                              alt={gallery.title} 
                              loading="lazy"
                            />
                          </div>
                          <div className="u-flex-column">
                            <span className="u-font-bold">{gallery.title}</span>
                            <span className="u-text-muted u-text-xs u-flex u-items-center u-gap-xs">
                              <MapPin size={10} /> {gallery.location || t('common.noLocation')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge--info">
                          {t(`gallery.categories.${gallery.category}`)}
                        </span>
                      </td>
                      <td>
                        <div className="u-flex u-items-center u-gap-xs">
                          <ImageIcon size={14} className="u-text-muted" />
                          {gallery.images?.length || 0}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${gallery.isPublished ? 'success' : 'secondary'}`}>
                          {gallery.isPublished ? t('common.published') : t('common.draft')}
                        </span>
                      </td>
                      <td>
                        <span className="u-text-xs u-text-muted">
                          {new Date(gallery.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button 
                            className="admin-table-icon-btn admin-table-icon-btn--primary"
                            onClick={() => onEdit(gallery)}
                            title={t('common.edit')}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className={`admin-table-icon-btn admin-table-icon-btn--${gallery.isPublished ? 'warning' : 'success'}`}
                            onClick={() => onTogglePublish(gallery._id, gallery.isPublished)}
                            title={gallery.isPublished ? t('common.unpublish') : t('common.publish')}
                          >
                            {gallery.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button 
                            className="admin-table-icon-btn admin-table-icon-btn--danger"
                            onClick={() => onDelete(gallery._id)}
                            title={t('common.delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="admin-cards-grid">
              {galleries.map(gallery => (
                <GalleryCard
                  key={gallery._id}
                  gallery={gallery}
                  navigate={navigate}
                  handleDelete={onDelete}
                  handleTogglePublish={onTogglePublish}
                  isSelected={selectedGalleries.includes(gallery._id)}
                  onSelect={handleSelectOne}
                />
              ))}
            </div>
          )}
          
          <GalleryPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default GalleryList;
