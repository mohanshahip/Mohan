import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Save, Trash2, Eye, Edit, Plus,
  Trophy, Globe, CheckCircle, XCircle, MapPin,
  Building, X, Loader2, User, Briefcase, Info, Link as LinkIcon, Star, Check, AlertCircle, EyeOff, Camera, Smartphone, Monitor, Zap,
  Linkedin, Twitter
} from 'lucide-react';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';
import { useToast } from '../../../context/ToastContext';
import AdminPageLayout from '../../../components/common/AdminPageLayout';

const HeroAdmin = () => {
  const { t } = useTranslation();
  const [heroes, setHeroes] = useState([]);
  const [editingHero, setEditingHero] = useState(null);
  const [preview, setPreview] = useState(false);
  const { addToast } = useToast();
  const { withLoading, isLoading } = useLoading();
  const confirm = useConfirm();

  // Form structure
  const defaultFormData = useMemo(() => ({
    name: '',
    title: '',
    description: '',
    location: '',
    organization: '',
    yearsActive: '',
    expertise: [],
    achievements: [],
    metrics: {
      projectsCompleted: 0,
      yearsExperience: 0,
      clientSatisfaction: 0,
      globalReach: ''
    },
    heroImage: {
      url: '',
      alt: t('hero.portrait-alt')
    },
    socialLinks: {
      linkedin: '',
      twitter: '',
      instagram: '',
      contact: '/contact'
    },
    isActive: true,
    language: 'en'
  }), [t]);

  const [formData, setFormData] = useState(defaultFormData);

  // Fetch heroes
  const fetchHeroes = useCallback(async () => {
    try {
      const response = await withLoading(() => api.get('/hero/admin'), t('common.loading'));
      setHeroes(response.data?.success ? response.data.data : []);
    } catch (_error) {
      addToast(t('hero.load-failed'), 'error');
      setHeroes([]);
    }
  }, [withLoading, t, addToast]);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingHero(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingHero) {
        response = await withLoading(() => api.put(`/hero/${editingHero._id}`, formData), t('common.saving'));
      } else {
        response = await withLoading(() => api.post('/hero', formData), t('common.saving'));
      }
      if (response.data?.success) {
        addToast(editingHero ? t('hero.update-success') : t('hero.create-success'), 'success');
        fetchHeroes();
        resetForm();
      }
    } catch (_error) {
      addToast(t('hero.save-failed'), 'error');
    }
  };

  const handleEdit = (hero) => {
    setEditingHero(hero);
    setFormData({
      ...defaultFormData,
      ...hero,
      socialLinks: { ...defaultFormData.socialLinks, ...hero.socialLinks }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: t('hero.delete-title'),
      message: t('hero.delete-confirm'),
      type: 'danger',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;

    try {
      await withLoading(() => api.delete(`/hero/${id}`), t('common.deleting'));
      addToast(t('hero.delete-success'), 'success');
      fetchHeroes();
    } catch (_error) {
      addToast(t('hero.delete-failed'), 'error');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const ok = await confirm({
      title: currentStatus ? t('hero.deactivate-title') : t('hero.activate-title'),
      message: currentStatus ? t('hero.deactivate-confirm') : t('hero.activate-confirm'),
      type: 'warning',
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;

    try {
      await withLoading(() => api.patch(`/hero/${id}/status`, { isActive: !currentStatus }), t('common.updating'));
      addToast(t('hero.status-update-success'), 'success');
      fetchHeroes();
    } catch (_error) {
      addToast(t('hero.status-update-failed'), 'error');
    }
  };

  const filteredHeroes = useMemo(() => {
    return heroes.filter(hero => hero.language === formData.language);
  }, [heroes, formData.language]);

  return (
    <AdminPageLayout
      icon={<Globe size={24} />}
      title={t('hero.title')}
      subtitle={editingHero ? t('hero.edit') : t('hero.create')}
      actions={
        <div className="u-flex u-gap-sm">
          <button
            className="btn-admin btn-admin--secondary"
            onClick={() => setPreview(!preview)}
            type="button"
          >
            {preview ? <EyeOff size={18} /> : <Eye size={18} />}
            <span>{preview ? t('hero.hide-preview') : t('hero.preview')}</span>
          </button>
          <button
            className="btn-admin btn-admin--primary"
            onClick={resetForm}
            type="button"
          >
            <Plus size={18} />
            <span>{t('common.new')}</span>
          </button>
          <button
            className="btn-admin btn-admin--primary"
            onClick={handleSubmit}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{t('common.save')}</span>
          </button>
        </div>
      }
    >
      <div className="admin-form-container">
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            {/* Main Content Column */}
            <div className="admin-form-column">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <User size={20} />
                  {t('hero.basic-information')}
                </h3>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('common.language')} *</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="admin-form-control"
                      required
                    >
                      <option value="en">{t('common.languages.english')}</option>
                      <option value="ne">{t('common.languages.nepali')}</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('hero.full-name')} *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="admin-form-control"
                      placeholder={t('hero.name-placeholder')}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('hero.professional-title')} *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="admin-form-control"
                      placeholder={t('hero.title-placeholder')}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('hero.location')} *</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="admin-form-control"
                        placeholder={t('hero.location-placeholder')}
                        required
                        style={{ paddingLeft: '36px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('hero.description')} *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="admin-form-control"
                    placeholder={t('hero.description-placeholder')}
                    required
                    rows="4"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <LinkIcon size={20} />
                  {t('contact.connect-socially')}
                </h3>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label"><Linkedin size={14} /> {t('contact.linkedin')}</label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.socialLinks?.linkedin || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                      }))}
                      className="admin-form-control"
                      placeholder={t('contact.social-placeholder', { platform: 'linkedin' })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label"><Twitter size={14} /> {t('contact.twitter')}</label>
                    <input
                      type="url"
                      name="twitter"
                      value={formData.socialLinks?.twitter || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                      }))}
                      className="admin-form-control"
                      placeholder={t('contact.social-placeholder', { platform: 'twitter' })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="admin-form-column">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <Info size={20} />
                  {t('common.status')}
                </h3>
                <div className="admin-form-group">
                  <label className="admin-form-toggle">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="admin-form-toggle-input"
                    />
                    <div className="admin-form-toggle-slider"></div>
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>
                      {formData.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </label>
                </div>
              </div>

              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <Camera size={20} />
                  {t('hero.image')}
                </h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('hero.image-url')}</label>
                  <input
                    type="text"
                    name="url"
                    value={formData.heroImage?.url || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      heroImage: { ...prev.heroImage, url: e.target.value }
                    }))}
                    className="admin-form-control u-mb-md"
                    placeholder={t('hero.image-url-placeholder')}
                  />
                  {formData.heroImage?.url && (
                    <div className="admin-form-image-preview">
                      <img src={formData.heroImage.url} alt={t('hero.image-preview')} />
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-actions" style={{ border: 'none', marginTop: 0, paddingTop: 0 }}>
                <button
                  type="submit"
                  className="btn-admin btn-admin--primary u-w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {editingHero ? t('common.update') : t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Heroes Table / List */}
        <div className="admin-form-section u-mt-xl">
          <h3 className="admin-form-section-title">
            <Globe size={20} />
            {t('hero.existingCount', { count: filteredHeroes.length })}
          </h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('hero.full-name')}</th>
                  <th>{t('hero.professional-title')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeroes.map((hero) => (
                  <tr key={hero._id}>
                    <td>
                      <div className="u-flex u-items-center u-gap-md">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'var(--background-alt)' }}>
                          <img src={hero.heroImage?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{hero.name}</span>
                      </div>
                    </td>
                    <td>{hero.title}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${hero.isActive ? 'success' : 'secondary'}`}>
                        {hero.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-table-icon-btn admin-table-icon-btn--primary" onClick={() => handleEdit(hero)}>
                          <Edit size={16} />
                        </button>
                        <button className={`admin-table-icon-btn admin-table-icon-btn--${hero.isActive ? 'warning' : 'success'}`} onClick={() => handleToggleActive(hero._id, hero.isActive)}>
                          {hero.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button className="admin-table-icon-btn admin-table-icon-btn--danger" onClick={() => handleDelete(hero._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default HeroAdmin;
