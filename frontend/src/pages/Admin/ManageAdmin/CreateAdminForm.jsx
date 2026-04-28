import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, Lock, Eye, EyeOff, Save, X, AlertCircle, Check, Loader2 } from 'lucide-react';

const CreateAdminForm = ({ onSubmit, onCancel, isLoading, apiError, initialData = null }) => {
  const { t } = useTranslation();
  const isEditing = !!initialData;
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    confirmPassword: '',
    role: initialData?.role || 'admin',
    firstName: initialData?.profile?.firstName || '',
    lastName: initialData?.profile?.lastName || ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'none'
  });

  const validatePassword = (pass) => {
    if (!pass) {
      setPasswordStrength({ score: 0, label: 'none' });
      return;
    }
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    
    let label = 'weak';
    if (score >= 4) label = 'strong';
    else if (score >= 3) label = 'good';
    else if (score >= 2) label = 'fair';
    
    setPasswordStrength({ score, label });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      validatePassword(value);
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = t('admin.validation.username-required');
    if (!formData.email.trim()) errors.email = t('admin.validation.email-required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t('admin.validation.email-invalid');
    
    // Only validate password if it's a new admin or if the field is not empty during editing
    if (!isEditing || formData.password) {
      if (!formData.password) errors.password = t('admin.validation.password-required');
      else if (formData.password.length < 8) errors.password = t('admin.validation.password-min-length');
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = t('admin.validation.password-complexity');
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t('admin.validation.passwords-do-not-match');
      }
    }

    if (!formData.firstName.trim()) errors.firstName = t('admin.validation.first-name-required');
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="create-admin-form-overlay" style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="admin-form-section" style={{ 
        maxWidth: '700px', 
        width: '100%', 
        maxHeight: '90vh', 
        overflowY: 'auto',
        padding: 0 
      }}>
        <div className="admin-form-section__title" style={{ 
          padding: '20px 24px', 
          margin: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="u-flex u-items-center u-gap-md">
            <Shield className="text-primary" size={24} />
            <h3 style={{ margin: 0 }}>{isEditing ? t('admin.edit-admin') : t('admin.create-new-admin')}</h3>
          </div>
          <button 
            className="admin-table-icon-btn" 
            onClick={onCancel} 
            disabled={isLoading}
            style={{ border: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {apiError && (
            <div className="admin-badge admin-badge--danger u-w-full u-mb-lg" style={{ padding: '12px', justifyContent: 'flex-start' }}>
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}
          
          <div className="u-flex u-flex-direction-column u-gap-lg">
            {/* Personal Information */}
            <div>
              <h4 className="admin-form-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {t('admin.personal-information')}
              </h4>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="firstName">{t('admin.first-name')} *</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`admin-form-control ${formErrors.firstName ? 'admin-form-control--error' : ''}`}
                    placeholder={t('admin.enter-first-name')}
                    required
                  />
                  {formErrors.firstName && (
                    <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.firstName}</span>
                  )}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="lastName">{t('admin.last-name')}</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="admin-form-control"
                    placeholder={t('admin.enter-last-name')}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="role">{t('admin.role')}</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="admin-form-control"
                >
                  <option value="admin">{t('admin.admin')}</option>
                  <option value="moderator">{t('admin.moderator')}</option>
                  <option value="superadmin">{t('admin.super-admin')}</option>
                </select>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />

            {/* Account Information */}
            <div>
              <h4 className="admin-form-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {t('admin.account-information')}
              </h4>
              
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="username">{t('admin.username')} *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`admin-form-control ${formErrors.username ? 'admin-form-control--error' : ''}`}
                      placeholder={t('admin.choose-username')}
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                  {formErrors.username && (
                    <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.username}</span>
                  )}
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="email">{t('admin.email')} *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`admin-form-control ${formErrors.email ? 'admin-form-control--error' : ''}`}
                      placeholder={t('admin.enter-email')}
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                  {formErrors.email && (
                    <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.email}</span>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="password">
                  {isEditing ? t('admin.newPasswordOptional') : t('admin.new-password')} {!isEditing && '*'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`admin-form-control ${formErrors.password ? 'admin-form-control--error' : ''}`}
                    placeholder={t('admin.create-password')}
                    style={{ paddingLeft: '36px', paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.password}</span>
                )}
                
                <div className="u-mt-sm">
                  <div className={`strength-bar strength-bar--${passwordStrength.label}`}>
                    <div className="strength-bar-fill"></div>
                  </div>
                  <div className="u-flex u-justify-between u-items-center">
                    <span className="u-text-xs u-text-muted">
                      {t('auth.passwordStrength')}: <span style={{ fontWeight: 700, color: `var(--${passwordStrength.label === 'strong' ? 'success' : passwordStrength.label === 'good' ? 'info' : passwordStrength.label === 'fair' ? 'warning' : 'error'})` }}>
                        {t(`auth.${passwordStrength.label}`)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="confirmPassword">{t('admin.confirm-new-password')} *</label>
                <div style={{ position: 'relative' }}>
                  <Check size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`admin-form-control ${formErrors.confirmPassword ? 'admin-form-control--error' : ''}`}
                    placeholder={t('admin.confirm-your-password')}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="btn-admin btn-admin--secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn-admin btn-admin--primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{isEditing ? t('common.updating') : t('common.creating')}</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{isEditing ? t('common.save') : t('admin.create-admin')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default CreateAdminForm;
