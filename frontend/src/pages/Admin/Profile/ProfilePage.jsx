import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, Save, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import logo from '../../../assets/images/mohan-logo.png';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateProfile, updatePassword, initialized, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const initialFormData = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.profileImage || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }), [user]);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (initialized && user) {
      setFormData(initialFormData);
    }
  }, [initialized, user, initialFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      addToast(t('profile.password-mismatch') || 'New passwords do not match', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Update Profile Info
      const profileUpdate = {};
      if (formData.name !== user?.name) profileUpdate.name = formData.name;
      if (formData.avatar !== user?.profileImage) profileUpdate.avatar = formData.avatar;

      if (Object.keys(profileUpdate).length > 0) {
        await updateProfile(profileUpdate);
      }

      // Update Password if provided
      if (formData.currentPassword && formData.newPassword) {
        await updatePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
      }

      addToast(t('profile.update-success') || 'Profile updated successfully', 'success');
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      addToast(error.message || t('profile.update-error') || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !initialized) {
    return (
      <div className="admin-loading-overlay">
        <div className="loading-content-pro">
          <Loader2 size={48} className="spinner-pro" />
          <h3 className="loading-title">{t('common.loading') || 'Loading Profile...'}</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AdminPageLayout
        icon={<User size={24} />}
        title={t('admin.my-profile') || 'My Profile'}
        subtitle={t('profile.subtitle') || 'Manage your personal information and security'}
      >
        <div className="admin-page__content-container u-flex u-flex-direction-column u-items-center u-justify-center u-p-24" style={{ minHeight: '60vh' }}>
          <AlertCircle size={64} className="u-text-muted u-mb-lg" />
          <h2 className="u-mb-sm">{t('common.notLoggedIn') || 'Not Logged In'}</h2>
          <p className="u-text-secondary">{t('common.pleaseLogin') || 'Please log in to view your profile.'}</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      icon={<User size={24} />}
      title={t('admin.my-profile') || 'My Profile'}
      subtitle={t('profile.subtitle') || 'Manage your personal information and security'}
    >
      <div className="admin-page__content-container">
        <form onSubmit={handleSave}>
          <div className="admin-form-grid">
            {/* Left Column - Main Form */}
            <div className="admin-form-column">
              {/* Personal Information */}
              <div className="admin-section">
                <header className="admin-section__header">
                  <h3 className="admin-section__title">
                    <User size={20} />
                    {t('profile.personal-info') || 'Personal Information'}
                  </h3>
                </header>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('profile.full-name') || 'Full Name'}</label>
                  <div className="admin-input-icon-wrapper">
                    <User size={16} className="admin-input-icon" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="admin-form-control admin-input--with-icon"
                      required
                    />
                  </div>
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('profile.email') || 'Email Address'}</label>
                  <div className="admin-input-icon-wrapper">
                    <Mail size={16} className="admin-input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="admin-form-control admin-input--with-icon"
                      required
                      disabled
                    />
                  </div>
                  <div className="admin-form-info-text">
                    {t('profile.email-hint') || 'Contact super admin to change email address.'}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">{t('profile.avatar-url') || 'Avatar URL'}</label>
                  <div className="admin-input-icon-wrapper">
                    <Camera size={16} className="admin-input-icon" />
                    <input
                      type="text"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      className="admin-form-control admin-input--with-icon"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="admin-section">
                <header className="admin-section__header">
                  <h3 className="admin-section__title">
                    <Shield size={20} />
                    {t('profile.security') || 'Security'}
                  </h3>
                </header>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('profile.current-password') || 'Current Password'}</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="admin-form-control"
                    placeholder="••••••••"
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('profile.new-password') || 'New Password'}</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="admin-form-control"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('profile.confirm-password') || 'Confirm New Password'}</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="admin-form-control"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Actions */}
            <div className="admin-form-column">
              <div className="admin-section u-text-center">
                <header className="admin-section__header">
                  <h3 className="admin-section__title">
                    <Camera size={20} />
                    {t('profile.avatar') || 'Avatar'}
                  </h3>
                </header>
                <div className="admin-profile-avatar-wrapper">
                  <img 
                    src={formData.avatar || user?.profileImage || logo} 
                    alt={user?.name || 'Admin'} 
                    className="admin-profile-avatar-img"
                    onError={(e) => { e.target.src = logo; }}
                  />
                  <div className="admin-profile-avatar-badge">
                    <Camera size={14} />
                  </div>
                </div>
                <h3 className="admin-profile-name">{user?.name || 'Admin User'}</h3>
                <div className="admin-badge admin-badge--primary u-mb-lg">
                  {user?.role || 'Administrator'}
                </div>
              </div>

              <div className="admin-section">
                <header className="admin-section__header">
                  <h3 className="admin-section__title">
                    <Shield size={20} />
                    {t('common.actions') || 'Actions'}
                  </h3>
                </header>
                <div className="admin-form-actions--sidebar">
                  <button 
                    type="submit" 
                    className="btn-admin btn-admin--primary u-w-full"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 size={18} className="spinning" /> : <Save size={18} />}
                    <span>{t('common.save') || 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminPageLayout>
  );
};

export default ProfilePage;
