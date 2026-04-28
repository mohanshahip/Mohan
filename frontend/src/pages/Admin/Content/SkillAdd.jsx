import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { 
  Award, ArrowLeft, Save, Loader2, AlertCircle, Check, 
  Code, Cpu, Database, Cloud, Smartphone, Palette, TestTube, Wrench, Users,
  Globe, Terminal, Layout, Layers, Server, Shield, Settings
} from 'lucide-react';
import api from '../../../services/api';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import { useToast } from '../../../context/ToastContext';

const IconPreview = ({ iconName, color }) => {
  const Icon = LucideIcons[iconName] || LucideIcons.Award;
  return (
    <div 
      className="u-flex u-items-center u-justify-center u-rounded-md u-mb-sm"
      style={{ 
        width: '48px', 
        height: '48px', 
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color: color,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`
      }}
    >
      <Icon size={24} />
    </div>
  );
};

const SkillAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'frontend',
    proficiency: 80,
    yearsOfExperience: 1,
    icon: 'Code',
    color: '#3b82f6',
    description: '',
    isFeatured: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'frontend', label: t('skills.frontend'), icon: <Code size={16} /> },
    { value: 'backend', label: t('skills.backend'), icon: <Cpu size={16} /> },
    { value: 'database', label: t('skills.database'), icon: <Database size={16} /> },
    { value: 'devops', label: t('skills.devops'), icon: <Cloud size={16} /> },
    { value: 'mobile', label: t('skills.mobile'), icon: <Smartphone size={16} /> },
    { value: 'design', label: t('skills.design'), icon: <Palette size={16} /> },
    { value: 'testing', label: t('skills.testing'), icon: <TestTube size={16} /> },
    { value: 'tools', label: t('skills.tools'), icon: <Wrench size={16} /> },
    { value: 'soft-skills', label: t('skills.soft-skills'), icon: <Users size={16} /> }
  ];

  const icons = ['Code', 'Cpu', 'Database', 'Cloud', 'Smartphone', 'Palette', 'TestTube', 'Wrench', 'Users', 'Globe', 'Terminal', 'Layout', 'Layers', 'Server', 'Shield', 'Settings'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('validation.required');
    if (!formData.description.trim()) newErrors.description = t('validation.required');
    if (formData.proficiency < 0 || formData.proficiency > 100) newErrors.proficiency = t('validation.invalidRange');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post('/skills', formData);
      if (response.data?.success) {
        addToast(t('skills.addSuccess'), 'success');
        navigate('/admin/skills');
      }
    } catch (error) {
      addToast(error.response?.data?.error || t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageLayout
      icon={<Award size={24} />}
      title={t('skills.add-new-skill')}
      subtitle={t('skills.addSubtitle')}
      actions={
        <button 
          className="btn-admin btn-admin--secondary" 
          onClick={() => navigate('/admin/skills')}
        >
          <ArrowLeft size={18} />
          {t('common.back')}
        </button>
      }
    >
      <div className="admin-form-container">
        <form onSubmit={handleSubmit} className="admin-form-pro">
          <div className="admin-form-section">
            <h3 className="admin-form-section-title">
              <Award size={20} />
              {t('skills.basicInfo')}
            </h3>

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">{t('common.name')} *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="admin-form-control"
                  placeholder={t('skills.name-placeholder')}
                  required
                />
                {errors.name && <span className="admin-form-error"><AlertCircle size={14} /> {errors.name}</span>}
              </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.description')} *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`admin-form-control ${errors.description ? 'admin-form-control--error' : ''}`}
                    rows="4"
                    placeholder={t('skills.descriptionPlaceholder')}
                    required
                  />
                  {errors.description && <span className="admin-form-error"><AlertCircle size={14} /> {errors.description}</span>}
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('skills.proficiency')} (%)</label>
                    <input
                      type="number"
                      name="proficiency"
                      value={formData.proficiency}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="admin-form-control"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('skills.experience')} ({t('skills.years')})</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      min="0"
                      className="admin-form-control"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-form-column">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <Palette size={20} />
                  {t('skills.styling')}
                </h3>

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
                  <label className="admin-form-label">{t('skills.icon')}</label>
                  <div className="u-flex u-gap-md u-items-start">
                    <IconPreview iconName={formData.icon} color={formData.color} />
                    <select
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                      className="admin-form-control"
                      style={{ flex: 1 }}
                    >
                      {icons.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('skills.color')}</label>
                  <div className="u-flex u-gap-sm">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="admin-form-control"
                      style={{ width: '60px', padding: '4px', height: '48px' }}
                    />
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="admin-form-control"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-toggle">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="admin-form-toggle-input"
                    />
                    <div className="admin-form-toggle-slider"></div>
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>
                      {t('common.featured')}
                    </span>
                  </label>
                </div>
              </div>

              <div className="admin-form-actions" style={{ border: 'none', marginTop: 0, paddingTop: 0 }}>
                <button
                  type="submit"
                  className="btn-admin btn-admin--primary u-w-full"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
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

export default SkillAdd;
