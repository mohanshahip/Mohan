import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Image as ImageIcon, Trash2,
  Save, X, Check,
  Calendar, MapPin, Loader,
  Eye, EyeOff, Star, Info, Globe, AlertCircle, Loader2, Plus, ArrowLeft
} from 'lucide-react';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';
import { useToast } from '../../../context/ToastContext';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import { useTranslation } from 'react-i18next';

const GalleryAdd = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { withLoading, isLoading } = useLoading();
  const confirm = useConfirm();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  
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

  const validateForm = () => {
    if (!formData.title.trim()) {
      addToast(t('gallery.admin.validation.title-required'), 'error');
      return false;
    }
    if (formData.images.length === 0) {
      addToast(t('gallery.admin.validation.image-required'), 'error');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    formData.images.forEach(image => {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    });
    setFormData({
      title: '',
      description: '',
      images: [],
      category: 'other',
      location: '',
      date: new Date().toISOString().split('T')[0],
      language: 'ne',
      isPublished: true
    });
  };

  const setPrimaryImage = (id) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isPrimary: img.id === id
      }))
    }));
  };

  const removeImage = (id) => {
    setFormData(prev => {
      const imageToRemove = prev.images.find(img => img.id === id);
      if (imageToRemove && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      const newImages = prev.images.filter(img => img.id !== id);
      if (imageToRemove?.isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return { ...prev, images: newImages };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const fileArray = Array.from(files);
    const newImages = fileArray.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
      file: file,
      isPrimary: formData.images.length === 0 && fileArray[0] === file
    }));
    setFormData(prev => ({
      ...prev,
      images: [...newImages, ...prev.images]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      let uploadedImages = [];
      const newFiles = formData.images.filter(img => img.file);
      if (newFiles.length > 0) {
        const uploadFormData = new FormData();
        newFiles.forEach(img => {
          uploadFormData.append('image', img.file);
        });
        const uploadRes = await withLoading(() =>
          api.post('/gallery/upload', uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }), t('common.uploading')
        );
        if (!uploadRes.data?.success) throw new Error(uploadRes.data?.error || t('gallery.imageUploadFailed'));
        uploadedImages = uploadRes.data.data || [];
      }

      let uploadIndex = 0;
      const imagesPayload = formData.images.map(img => {
        if (img.file) {
          const uploaded = uploadedImages[uploadIndex++];
          return {
            url: uploaded.url,
            alt: uploaded.name || formData.title,
            isPrimary: img.isPrimary
          };
        }
        return {
          url: img.url,
          alt: img.name || formData.title,
          isPrimary: img.isPrimary
        };
      });

      const res = await withLoading(() => api.post('/gallery', {
        ...formData,
        images: imagesPayload
      }), t('common.saving'));

      if (res.data?.success) {
        addToast(t('gallery.admin.created-success'), 'success');
        resetForm();
        navigate('/admin/gallery');
      } else {
        throw new Error(res.data?.error || t('common.error'));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <AdminPageLayout
      icon={<ImageIcon size={24} />}
      title={t('gallery.admin.addNew')}
      subtitle={t('gallery.admin.subtitle')}
      actions={
        <button className="btn-admin btn-admin--secondary" onClick={() => navigate('/admin/gallery')}>
          <ArrowLeft size={18} />
          {t('common.back')}
        </button>
      }
    >
      <div className="admin-form-container">
        <form onSubmit={handleSubmit} className="admin-form-section">
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
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="admin-form-control"
                      placeholder={t('gallery.admin.enterLocation')}
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.date')}</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="admin-form-control"
                      style={{ paddingLeft: '36px' }}
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
                  <span className="admin-form-label" style={{ marginBottom: 0 }}>
                    {formData.isPublished ? t('common.published') : t('common.draft')}
                  </span>
                </label>
              </div>

              <div className="admin-form-actions" style={{ border: 'none', marginTop: 0, paddingTop: 0 }}>
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
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('gallery.admin.clickToUpload')}</p>
              <p style={{ fontSize: '12px' }}>{t('gallery.admin.uploadHint')}</p>
            </div>

            {formData.images.length > 0 && (
              <div className="u-flex u-flex-wrap u-gap-md u-mt-lg">
                {formData.images.map((img) => (
                  <div key={img.id} className="admin-form-image-preview" style={{ width: '180px', height: '120px' }}>
                    <img src={img.url} alt={img.name} />
                    <div className="u-flex u-justify-between u-items-center u-mt-xs" style={{ padding: '4px' }}>
                      <button
                        type="button"
                        className={`admin-badge ${img.isPrimary ? 'admin-badge--success' : 'admin-badge--secondary'}`}
                        onClick={() => setPrimaryImage(img.id)}
                        style={{ cursor: 'pointer', fontSize: '10px' }}
                      >
                        {img.isPrimary ? t('common.primary') : t('common.setPrimary')}
                      </button>
                      <button
                        type="button"
                        className="admin-form-image-remove"
                        onClick={() => removeImage(img.id)}
                        style={{ position: 'static', width: '24px', height: '24px' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </AdminPageLayout>
  );
};

export default GalleryAdd;
