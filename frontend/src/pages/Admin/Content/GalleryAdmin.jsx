import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Image as ImageIcon, Trash2,
  Save, X, Check,
  Calendar, MapPin, Loader,
  Eye, EyeOff, RefreshCw, Star, Info, Globe, AlertCircle, Loader2, Plus,
  LayoutGrid, List
} from 'lucide-react';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';
import { useToast } from '../../../context/ToastContext';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import { useTranslation } from 'react-i18next';
import DataTable from '../../../components/common/DataTable';
import GalleryPagination from './GalleryPagination';
import GalleryFilters from './GalleryFilters';
import GalleryBulkActions from './GalleryBulkActions';
import GalleryCard from './GalleryCard';

const GalleryAdmin = () => {
  const { t, i18n } = useTranslation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    category: 'other',
    location: '',
    date: new Date().toISOString().split('T')[0],
    language: 'ne',
    isPublished: true
  });

  const { withLoading, isLoading } = useLoading();
  const confirm = useConfirm();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [galleries, setGalleries] = useState([]);
  const [galleriesError, setGalleriesError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGalleries, setTotalGalleries] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    language: '',
    isPublished: ''
  });
  const [selectedGalleries, setSelectedGalleries] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const categories = [
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

  const fetchGalleries = useCallback(async () => {
    setGalleriesError(null);
    try {
      const params = {
        page,
        limit: 10,
        search: searchQuery,
        ...filters
      };
      const res = await withLoading(() => api.get('/gallery/admin/all', { params }), t('common.loading'));
      if (res.data?.success) {
        setGalleries(res.data.data.galleries);
        setTotalPages(res.data.data.totalPages);
        setTotalGalleries(res.data.data.totalGalleries);
      } else {
        throw new Error(res.data?.error || t('common.error'));
      }
    } catch (err) {
      setGalleriesError(err.message);
      addToast(err.message, 'error');
    }
  }, [withLoading, t, addToast, page, searchQuery, filters]);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchGalleries();
  };

  const handleSelectGallery = (galleryId) => {
    setSelectedGalleries(prev => 
      prev.includes(galleryId) 
        ? prev.filter(id => id !== galleryId) 
        : [...prev, galleryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGalleries.length === galleries.length) {
      setSelectedGalleries([]);
    } else {
      setSelectedGalleries(galleries.map(g => g._id));
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: t('common.delete'),
      message: t('gallery.admin.confirm-delete'),
      type: 'danger',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    setActionInProgress(id);
    try {
      const res = await withLoading(() => api.delete(`/gallery/${id}`), t('gallery.admin.deleting'));
      if (res.data?.success) {
        addToast(t('gallery.admin.deleted-success'), 'success');
        fetchGalleries(); // Refresh list after deletion
      } else {
        throw new Error(res.data?.error || t('common.error'));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
    finally {
      setActionInProgress(null);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    const ok = await confirm({
      title: currentStatus ? t('gallery.admin.unpublish') : t('gallery.admin.publish'),
      message: currentStatus ? t('gallery.admin.confirm-unpublish') : t('gallery.admin.confirm-publish'),
      type: 'warning',
      confirmText: currentStatus ? t('gallery.admin.unpublish') : t('gallery.admin.publish'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    setActionInProgress(id);
    try {
      const res = await withLoading(() => api.patch(`/gallery/${id}/toggle-publish`), t('common.updating'));
      if (res.data?.success) {
        addToast(t('messages.status-update-success'), 'success');
        fetchGalleries(); // Refresh list after update
      } else {
        throw new Error(res.data?.error || t('common.error'));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
    finally {
      setActionInProgress(null);
    }
  };

  const columns = [
    {
      key: 'title',
      label: t('common.title'),
      render: (_, gallery) => (
        <div className="u-flex u-items-center u-gap-md">
          <div className="admin-table-image-container">
            <img 
              src={gallery.images?.find(img => img && img.isPrimary)?.url || gallery.images?.[0]?.url} 
              alt={gallery.title} 
              className="admin-table-image"
            />
          </div>
          <span className="admin-table-text-primary">{gallery.title}</span>
        </div>
      )
    },
    {
      key: 'category',
      label: t('common.category'),
      render: (category) => (
        <span className="admin-badge admin-badge--info">
          {t(`gallery.categories.${category}`)}
        </span>
      )
    },
    {
      key: 'images',
      label: t('common.images'),
      render: (images) => images.length
    },
    {
      key: 'isPublished',
      label: t('common.status'),
      render: (_, gallery) => (
        <button
          className={`admin-badge border-none cursor-pointer ${gallery.isPublished ? 'admin-badge--success' : 'admin-badge--warning'}`}
          onClick={() => handleTogglePublish(gallery._id, gallery.isPublished)}
          title={gallery.isPublished ? t('common.unpublish') : t('common.publish')}
        >
          {gallery.isPublished ? <Eye size={14} className="u-mr-xs" /> : <EyeOff size={14} className="u-mr-xs" />}
          {gallery.isPublished ? t('common.published') : t('common.draft')}
        </button>
      )
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_, gallery) => (
        <div className="admin-table-actions">
          <button 
            className="btn-admin btn-admin--secondary btn-admin--icon"
            onClick={() => navigate(`/admin/gallery/edit/${gallery._id}`)}
            title={t('common.edit')}
          >
            <Edit size={16} />
          </button>
          <button 
            className="btn-admin btn-admin--danger btn-admin--icon"
            onClick={() => handleDelete(gallery._id)}
            title={t('common.delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminPageLayout
      icon={<ImageIcon size={24} />}
      title={t('gallery.admin.title')}
      subtitle={t('gallery.admin.subtitle')}
      actions={
        <div className="u-flex u-gap-md u-items-center">
          <form className="admin-search-wrapper" onSubmit={handleSearch}>
            <Search size={18} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('gallery.admin.search')}
            />
          </form>

          <div className="admin-view-toggle u-flex u-gap-xs">
            <button 
              className={`admin-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title={t('common.tableView')}
            >
              <List size={18} />
            </button>
            <button 
              className={`admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={t('common.gridView')}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button className="btn-admin btn-admin--secondary" onClick={fetchGalleries} disabled={isLoading}>
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            {t('common.refresh')}
          </button>
        </div>
      }
    >
      <div className="admin-form-container">
        {/* Form Section */}
        <div className="admin-form-section u-mb-xl">
          <h3 className="admin-form-section__title">
            <Plus size={20} />
            {t('gallery.admin.addNew')}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              {/* Left Column */}
              <div className="admin-form-column">
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.title')} *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="admin-form-control"
                    placeholder={t('gallery.admin.enterTitle')}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.description')}</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="admin-form-control"
                    rows="3"
                    placeholder={t('gallery.admin.enterDescription')}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('common.location')}</label>
                    <div className="admin-input-icon-wrapper">
                      <MapPin size={16} className="admin-input-icon" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="admin-form-control admin-input--with-icon"
                        placeholder={t('gallery.admin.enterLocation')}
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('common.date')}</label>
                    <div className="admin-input-icon-wrapper">
                      <Calendar size={16} className="admin-input-icon" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="admin-form-control admin-input--with-icon"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="admin-form-column">
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.category')}</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="admin-form-control"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.language')}</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="admin-form-control"
                  >
                    <option value="ne">{t('common.languages.nepali')}</option>
                    <option value="en">{t('common.languages.english')}</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-toggle">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                      className="admin-form-toggle-input"
                    />
                    <div className="admin-form-toggle-slider"></div>
                    <span className="admin-form-label u-mb-0">
                      {formData.isPublished ? t('common.published') : t('common.draft')}
                    </span>
                  </label>
                </div>

                <div className="admin-form-actions u-border-none u-mt-0 u-pt-0">
                  <button
                    type="submit"
                    className="btn-admin btn-admin--primary u-w-full"
                    disabled={isLoading || formData.images.length === 0}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {t('gallery.admin.saveGallery')}
                  </button>
                </div>
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="admin-form-group u-mt-xl">
              <label className="admin-form-label">{t('gallery.admin.upload-images')} *</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="u-hidden"
              />
              <div className="admin-form-upload-area" onClick={triggerFileInput}>
                <Upload className="admin-form-upload-icon" />
                <p className="u-font-semibold u-text-primary">{t('gallery.admin.clickToUpload')}</p>
                <p className="u-text-xs">{t('gallery.admin.uploadHint')}</p>
              </div>

              {formData.images.length > 0 && (
                <div className="u-flex u-flex-wrap u-gap-md u-mt-lg">
                  {formData.images.map((img) => (
                    <div key={img.id} className="admin-form-image-preview" style={{ maxWidth: '240px' }}>
                      <img src={img.url} alt={img.name} />
                      <div className="u-flex u-justify-between u-items-center u-p-xs">
                        <button
                          type="button"
                          className={`admin-badge u-cursor-pointer u-text-xs ${img.isPrimary ? 'admin-badge--success' : 'admin-badge--secondary'}`}
                          onClick={() => setPrimaryImage(img.id)}
                        >
                          {img.isPrimary ? t('common.primary') : t('common.setPrimary')}
                        </button>
                        <button
                          type="button"
                          className="admin-form-image-remove u-static u-w-6 u-h-6"
                          onClick={() => removeImage(img.id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Management Section */}
        <div className="admin-form-section">
          <h3 className="admin-form-section__title">
            <ImageIcon size={20} />
            {t('gallery.admin.manage-galleries')}
          </h3>

          {galleriesError ? (
            <div className="admin-badge admin-badge--danger u-w-full" style={{ padding: '12px' }}>
              <AlertCircle size={18} />
              {galleriesError}
            </div>
          ) : viewMode === 'table' ? (
            <div className="admin-table-container">
              <DataTable
                columns={columns}
                data={galleries}
                loading={isLoading}
                pagination={{
                  currentPage: page,
                  pageSize: 10,
                  total: totalGalleries,
                  totalPages: totalPages
                }}
                onPageChange={setPage}
                selectable={true}
                selectedRows={selectedGalleries}
                onSelectRow={handleSelectGallery}
                onSelectAll={handleSelectAll}
                emptyMessage={t('gallery.admin.no-galleries')}
              />
            </div>
          ) : (
            <div className="gallery-grid-container">
              {isLoading ? (
                <div className="grid-loading-wrapper">
                  <Loader2 className="animate-spin u-text-primary" size={48} />
                  <p>{t('common.loading')}</p>
                </div>
              ) : galleries.length === 0 ? (
                <div className="grid-empty-wrapper">
                  <ImageIcon size={64} className="grid-empty-icon" />
                  <h3 className="grid-empty-title">{t('gallery.admin.no-galleries')}</h3>
                  <p className="grid-empty-desc">
                    {searchQuery ? t('common.tryDifferentSearch') : t('gallery.admin.addFirst')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="admin-cards-grid">
                    {galleries.map(gallery => (
                      <GalleryCard
                        key={gallery._id}
                        gallery={gallery}
                        t={t}
                        navigate={navigate}
                        handleDelete={handleDelete}
                        handleTogglePublish={handleTogglePublish}
                        isSelected={selectedGalleries.includes(gallery._id)}
                        onSelect={handleSelectGallery}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="u-mt-xl u-flex u-justify-center">
                      <GalleryPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default GalleryAdmin;
