// pages/Admin/Content/ProjectAdd.jsx
import React, { useState, useRef } from 'react';
import {
  Upload, X, Star, Plus, Loader2, ChevronLeft, Trash2, Briefcase, Info, Layers, Image as ImageIcon, Link as LinkIcon, Calendar, Check, AlertCircle, Globe, User, Save
} from 'lucide-react'; 
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import { useLoading } from '../../../context/UIContext';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import { useNavigate } from 'react-router-dom';

const ProjectsAdmin = () => {
  const { t, i18n } = useTranslation();
  const { withLoading, isLoading } = useLoading();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    techStack: [],
    images: [],
    category: 'web-development',
    status: 'completed',
    liveUrl: '',
    githubUrl: '',
    demoUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    features: [''],
    client: '',
    role: '',
    language: i18n.language === 'np' ? 'ne' : 'en',
    isPublished: true,
    isFeatured: false
  });

  const [newTech, setNewTech] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'web-development', label: t('projects.categories.web-development') },
    { value: 'mobile-app', label: t('projects.categories.mobile-app') },
    { value: 'design', label: t('projects.categories.design') },
    { value: 'e-commerce', label: t('projects.categories.e-commerce') },
    { value: 'api', label: t('projects.categories.api') },
    { value: 'full-stack', label: t('projects.categories.full-stack') },
    { value: 'open-source', label: t('projects.categories.open-source') },
    { value: 'other', label: t('projects.categories.other') }
  ];

  const statuses = [
    { value: 'completed', label: t('projects.statuses.completed') },
    { value: 'in-progress', label: t('projects.statuses.in-progress') },
    { value: 'planned', label: t('projects.statuses.planned') },
    { value: 'archived', label: t('projects.statuses.archived') }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddTech = () => {
    if (newTech.trim()) {
      if (!formData.techStack.includes(newTech.trim())) {
        setFormData(prev => ({
          ...prev,
          techStack: [...prev.techStack, newTech.trim()]
        }));
      }
      setNewTech('');
    }
  };

  const handleRemoveTech = (index) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index)
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach(file => {
        uploadFormData.append('images', file);
      });

      const uploadRes = await api.post('/projects/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadData = uploadRes.data;

      if (uploadData.success) {
        const newImages = uploadData.data.map(img => ({
          url: img.url,
          alt: img.name || 'Project image',
          caption: '',
          isPrimary: formData.images.length === 0
        }));

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));

        showNotification(t('projects.form.images-uploaded-success'));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showNotification(t('projects.form.image-upload-error'), 'error');
    }
  };

  const handleSetPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        features: formData.features.filter(f => f.trim())
      };

      const res = await withLoading(() => api.post('/projects', payload), t('common.saving'));

      if (res.data?.success) {
        showNotification(t('projects.published-success'));
        setTimeout(() => {
          navigate('/admin/projects');
        }, 1500);
      }
    } catch (error) {
      showNotification(error.response?.data?.error || error.message, 'error');
    }
  };

  return (
    <AdminPageLayout
      icon={<Briefcase size={24} />}
      title={t('projects.add-new')}
      subtitle={t('projects.form.create-new-project-subtitle')}
      actions={
        <button
          className="btn-admin btn-admin--secondary"
          onClick={() => navigate('/admin/projects')}
        >
          <ChevronLeft size={18} />
          {t('projects.view-all-projects')}
        </button>
      }
    >
      <div className="admin-form-container">
        {notification && (
          <div className={`admin-badge admin-badge--${notification.type === 'error' ? 'danger' : 'success'} u-w-full u-mb-lg`} style={{ padding: '12px', justifyContent: 'flex-start' }}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            {/* Main Content Column */}
            <div className="admin-form-column">
              {/* Basic Information */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <Info size={20} />
                  {t('projects.form.basic-information')}
                </h3>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.title')} *</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder={t('projects.form.enterProjectTitle')}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.description')} *</label>
                  <textarea
                    className="admin-form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="3"
                    placeholder={t('projects.form.enterShortDescription')}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('projects.form.detailed-description')}</label>
                  <textarea
                    className="admin-form-control"
                    value={formData.detailedDescription}
                    onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                    rows="8"
                    placeholder={t('projects.form.enterDetailedDescription')}
                    style={{ minHeight: '250px', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Technical Details */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <Layers size={20} />
                  {t('projects.form.technicalDetails')}
                </h3>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('projects.form.tech-stack')}</label>
                  <div className="admin-form-tags-container">
                    {formData.techStack.map((tech, index) => (
                      <span key={index} className="admin-form-tag">
                        {tech}
                        <button type="button" onClick={() => handleRemoveTech(index)} className="admin-form-tag-remove">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="admin-form-tag-input"
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                      placeholder={t('projects.form.addTech')}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('projects.form.key-features')}</label>
                  <div className="u-flex u-flex-direction-column u-gap-sm">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="u-flex u-gap-sm">
                        <input
                          type="text"
                          className="admin-form-control"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[index] = e.target.value;
                            setFormData({ ...formData, features: newFeatures });
                          }}
                          placeholder={t('projects.form.enterFeature')}
                        />
                        <button
                          type="button"
                          className="btn-admin btn-admin--danger btn-admin--icon"
                          onClick={() => handleRemoveFeature(index)}
                          disabled={formData.features.length <= 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-admin btn-admin--secondary btn-admin--sm u-mt-sm"
                      onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
                      style={{ alignSelf: 'flex-start' }}
                    >
                      <Plus size={16} />
                      {t('projects.form.addFeature')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Links & Dates */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <LinkIcon size={20} />
                  {t('projects.form.linksAndDates')}
                </h3>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('projects.form.liveUrl')}</label>
                    <input
                      type="url"
                      className="admin-form-control"
                      value={formData.liveUrl}
                      onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                      placeholder={t('hero.image-url-placeholder')}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('projects.form.githubUrl')}</label>
                    <input
                      type="url"
                      className="admin-form-control"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder={t('contact.social-placeholder', { platform: 'github' })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('projects.form.start-date')}</label>
                    <input
                      type="date"
                      className="admin-form-control"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('projects.form.end-date')}</label>
                    <input
                      type="date"
                      className="admin-form-control"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="admin-form-column">
              {/* Project Settings */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <Globe size={20} />
                  {t('common.settings')}
                </h3>

                <div className="admin-form-group">
                  <label className="admin-form-toggle">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="admin-form-toggle-input"
                    />
                    <div className="admin-form-toggle-slider"></div>
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>
                      {formData.isPublished ? t('common.published') : t('common.draft')}
                    </span>
                  </label>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-toggle">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="admin-form-toggle-input"
                    />
                    <div className="admin-form-toggle-slider"></div>
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>
                      {t('common.featured')}
                    </span>
                  </label>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.category')}</label>
                  <select
                    className="admin-form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.status')}</label>
                  <select
                    className="admin-form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.language')}</label>
                  <select
                    className="admin-form-control"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="en">{t('common.languages.english')}</option>
                    <option value="ne">{t('common.languages.nepali')}</option>
                  </select>
                </div>
              </div>

              {/* Project Images */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <ImageIcon size={20} />
                  {t('projects.form.project-images')}
                </h3>

                <div className="admin-form-group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="u-hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <div
                    className="admin-form-upload-area"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Upload className="admin-form-upload-icon" />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('common.uploadImages')}</span>
                    <span style={{ fontSize: '12px' }}>{t('projects.form.image-upload-help')}</span>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="u-flex u-flex-direction-column u-gap-md u-mt-md">
                    {formData.images.map((img, index) => (
                      <div key={index} className="admin-form-image-preview" style={{ height: 'auto' }}>
                        <img src={img.url} alt={img.alt} />
                        <div className="u-flex u-justify-between u-items-center u-mt-xs" style={{ padding: '8px' }}>
                          <button
                            type="button"
                            className={`admin-badge ${img.isPrimary ? 'admin-badge--success' : 'admin-badge--secondary'}`}
                            onClick={() => handleSetPrimaryImage(index)}
                            style={{ cursor: 'pointer', fontSize: '10px' }}
                          >
                            {img.isPrimary ? t('common.primary') : t('common.setPrimary')}
                          </button>
                          <button
                            type="button"
                            className="admin-form-image-remove"
                            onClick={() => handleRemoveImage(index)}
                            style={{ position: 'static', width: '28px', height: '28px' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roles & Clients */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <User size={20} />
                  {t('projects.form.rolesAndClients')}
                </h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('projects.form.client')}</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder={t('projects.form.enterClientName')}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('projects.form.your-role')}</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder={t('projects.form.enterYourRole')}
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="admin-form-actions" style={{ border: 'none', marginTop: 0, paddingTop: 0 }}>
                <button
                  type="submit"
                  className="btn-admin btn-admin--primary u-w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminPageLayout>
  );
};

export default ProjectsAdmin;