import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings, User, Shield, Bell, Palette, Globe, 
  Database, Code, Save, RefreshCw, AlertCircle,
  Github, Linkedin, Twitter, ExternalLink,
  Smartphone, Monitor, Zap, Check, Loader2, Phone, MapPin, Mail, ChevronRight,
  Clock, Lock, ShieldCheck
} from 'lucide-react';
import { useSettings } from '../../../hooks/useSetting';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import '../../../styles/Settings.css';
import '../../../styles/AdminCommon.css';

const SettingPage = () => {
  const { t } = useTranslation();
  const { settings, loading, error, saveSettings, refresh } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState(settings || {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(currentFormData => {
        if (JSON.stringify(currentFormData) !== JSON.stringify(settings)) {
          return settings;
        }
        return currentFormData;
      });
    }
  }, [settings]);

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const parts = path.split('.');
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await saveSettings(formData);
    setIsSaving(false);
  };

  if (loading) return <LoadingSpinner text={t('common.loading')} />;
  if (error) return (
    <div className="u-flex u-flex-direction-column u-items-center u-justify-center u-p-xl" style={{ minHeight: '400px', textAlign: 'center' }}>
      <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '16px' }} />
      <h3 style={{ marginBottom: '16px' }}>{error}</h3>
      <button className="btn-admin btn-admin--primary" onClick={refresh}>
        <RefreshCw size={16} /> {t('common.retry')}
      </button>
    </div>
  );
  if (!formData) return null;

  const tabs = [
    { id: 'profile', icon: <User size={18} />, label: t('settings.tabs.profile') },
    { id: 'appearance', icon: <Palette size={18} />, label: t('settings.tabs.appearance') },
    { id: 'notifications', icon: <Bell size={18} />, label: t('settings.tabs.notifications') },
    { id: 'security', icon: <Shield size={18} />, label: t('settings.tabs.security') },
    { id: 'api', icon: <Code size={18} />, label: t('settings.tabs.api') },
    { id: 'backup', icon: <Database size={18} />, label: t('settings.tabs.backup') }
  ];

  return (
    <AdminPageLayout
      icon={<Settings size={24} />}
      title={t('settings.title')}
      subtitle={t('admin.secure-access')}
    >
      <div className="admin-settings-layout">
        {/* Sidebar Tabs */}
        <aside className="admin-settings-sidebar">
          <div className="admin-settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`admin-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="admin-settings-tab-icon">{tab.icon}</span>
                <span className="admin-settings-tab-label">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={16} className="admin-settings-tab-arrow" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-settings-content">
          <form onSubmit={handleSave}>
            {activeTab === 'profile' && (
              <div className="u-flex u-flex-direction-column u-gap-lg">
                <div className="admin-section">
                  <header className="admin-section__header">
                    <h3 className="admin-section__title">
                      <User size={20} className="u-mr-xs" />
                      {t('admin.personal-information')}
                    </h3>
                  </header>
                  
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('hero.full-name')}</label>
                      <div className="admin-input-icon-wrapper">
                        <User size={16} className="admin-input-icon" />
                        <input 
                          type="text" 
                          className="admin-form-control admin-input--with-icon"
                          value={formData.profile?.name || ''} 
                          placeholder="John Doe"
                          onChange={(e) => handleInputChange('profile.name', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('contact.email')}</label>
                      <div className="admin-input-icon-wrapper">
                        <Mail size={16} className="admin-input-icon" />
                        <input 
                          type="email" 
                          className="admin-form-control admin-input--with-icon"
                          value={formData.profile?.email || ''} 
                          placeholder="john@example.com"
                          onChange={(e) => handleInputChange('profile.email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('contact.phone-number')}</label>
                      <div className="admin-input-icon-wrapper">
                        <Phone size={16} className="admin-input-icon" />
                        <input 
                          type="text" 
                          className="admin-form-control admin-input--with-icon"
                          value={formData.profile?.phone || ''} 
                          placeholder="+1 (555) 000-0000"
                          onChange={(e) => handleInputChange('profile.phone', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('hero.location')}</label>
                      <div className="admin-input-icon-wrapper">
                        <MapPin size={16} className="admin-input-icon" />
                        <input 
                          type="text" 
                          className="admin-form-control admin-input--with-icon"
                          value={formData.profile?.location || ''} 
                          placeholder="Kathmandu, Nepal"
                          onChange={(e) => handleInputChange('profile.location', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('hero.bio')}</label>
                    <textarea 
                      className="admin-form-control"
                      rows="4"
                      value={formData.profile?.bio || ''} 
                      placeholder={t('hero.bio-placeholder') || 'Write a short bio about yourself...'}
                      onChange={(e) => handleInputChange('profile.bio', e.target.value)}
                      style={{ minHeight: '120px', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className="admin-section">
                  <header className="admin-section__header">
                    <h3 className="admin-section__title">
                      <Globe size={20} className="u-mr-xs" />
                      {t('contact.connect-socially')}
                    </h3>
                  </header>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('contact.github')}</label>
                      <div className="admin-input-icon-wrapper">
                        <Github size={16} className="admin-input-icon" />
                        <input 
                          type="url" 
                          className="admin-form-control admin-input--with-icon"
                          placeholder="https://github.com/username"
                          value={formData.profile?.socialLinks?.github || ''} 
                          onChange={(e) => handleInputChange('profile.socialLinks.github', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('contact.linkedin')}</label>
                      <div className="admin-input-icon-wrapper">
                        <Linkedin size={16} className="admin-input-icon" />
                        <input 
                          type="url" 
                          className="admin-form-control admin-input--with-icon"
                          placeholder="https://linkedin.com/in/username"
                          value={formData.profile?.socialLinks?.linkedin || ''} 
                          onChange={(e) => handleInputChange('profile.socialLinks.linkedin', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('contact.twitter')}</label>
                      <div className="admin-input-icon-wrapper">
                        <Twitter size={16} className="admin-input-icon" />
                        <input 
                          type="url" 
                          className="admin-form-control admin-input--with-icon"
                          placeholder="https://twitter.com/username"
                          value={formData.profile?.socialLinks?.twitter || ''} 
                          onChange={(e) => handleInputChange('profile.socialLinks.twitter', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('hero.website')}</label>
                      <div className="admin-input-icon-wrapper">
                        <ExternalLink size={16} className="admin-input-icon" />
                        <input 
                          type="url" 
                          className="admin-form-control admin-input--with-icon"
                          placeholder="https://example.com"
                          value={formData.profile?.website || ''} 
                          onChange={(e) => handleInputChange('profile.website', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="u-flex u-flex-direction-column u-gap-lg">
                <div className="admin-section">
                  <header className="admin-section__header">
                    <h3 className="admin-section__title">
                      <Palette size={20} className="u-mr-xs" />
                      {t('appearance.theme')}
                    </h3>
                  </header>
                  <div className="admin-settings-theme-grid">
                    {['light', 'dark', 'system'].map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleInputChange('appearance.theme', mode)}
                        className={`admin-settings-theme-btn ${formData.appearance?.theme === mode ? 'active' : ''}`}
                      >
                        <div className="admin-settings-theme-icon">
                          {mode === 'light' && <Monitor size={32} />}
                          {mode === 'dark' && <Zap size={32} />}
                          {mode === 'system' && <Smartphone size={32} />}
                        </div>
                        <span className="admin-settings-theme-label">
                          {t(`appearance.${mode}`)}
                        </span>
                        {formData.appearance?.theme === mode && (
                          <div className="u-badge u-badge--primary u-absolute" style={{ top: '12px', right: '12px' }}>
                            <Check size={12} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-section">
                  <header className="admin-section__header">
                    <h3 className="admin-section__title">
                      <Globe size={20} className="u-mr-xs" />
                      {t('appearance.language')}
                    </h3>
                  </header>
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('appearance.select-language') || 'Select Interface Language'}</label>
                    <select 
                      className="admin-form-control"
                      value={formData.appearance?.language || 'en'}
                      onChange={(e) => handleInputChange('appearance.language', e.target.value)}
                    >
                      <option value="en">{t('common.languages.english')}</option>
                      <option value="ne">{t('common.languages.nepali')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="u-flex u-flex-direction-column u-gap-lg">
                <div className="admin-section">
                  <header className="admin-section__header">
                    <h3 className="admin-section__title">
                      <Bell size={20} className="u-mr-xs" />
                      {t('settings.tabs.notifications')}
                    </h3>
                  </header>
                  
                  <div className="u-flex u-flex-direction-column u-gap-lg">
                    <div className="admin-form-group">
                      <label className="admin-form-toggle">
                        <input 
                          type="checkbox" 
                          checked={formData.notifications?.email?.enabled || false}
                          onChange={(e) => handleInputChange('notifications.email.enabled', e.target.checked)}
                          className="admin-form-toggle-input"
                        />
                        <div className="admin-form-toggle-slider"></div>
                        <div className="u-flex u-flex-direction-column">
                          <span className="u-font-bold u-text-sm">{t('settings.notifications.email.title')}</span>
                          <span className="u-text-xs u-text-muted">{t('settings.notifications.email.desc')}</span>
                        </div>
                      </label>
                    </div>

                    {formData.notifications?.email?.enabled && (
                      <div className="admin-settings-nested-group">
                        <label className="admin-form-label">{t('settings.notifications.email.frequency')}</label>
                        <select 
                          className="admin-form-control"
                          value={formData.notifications?.email?.frequency || 'instant'}
                          onChange={(e) => handleInputChange('notifications.email.frequency', e.target.value)}
                        >
                          <option value="instant">{t('settings.notifications.instant')}</option>
                          <option value="hourly">{t('settings.notifications.hourly')}</option>
                          <option value="daily">{t('settings.notifications.daily')}</option>
                          <option value="weekly">{t('settings.notifications.weekly')}</option>
                        </select>
                      </div>
                    )}

                    <div className="admin-form-group">
                      <label className="admin-form-toggle">
                        <input 
                          type="checkbox" 
                          checked={formData.notifications?.push?.enabled || false}
                          onChange={(e) => handleInputChange('notifications.push.enabled', e.target.checked)}
                          className="admin-form-toggle-input"
                        />
                        <div className="admin-form-toggle-slider"></div>
                        <div className="u-flex u-flex-direction-column">
                          <span className="u-font-bold u-text-sm">{t('settings.notifications.push.title') || 'Push Notifications'}</span>
                          <span className="u-text-xs u-text-muted">{t('settings.notifications.push.desc') || 'Receive push notifications on your browser or mobile device.'}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="u-flex u-flex-direction-column u-gap-lg">
                <div className="admin-section">
                  <header className="admin-section__header">
                    <h3 className="admin-section__title">
                      <ShieldCheck size={20} className="u-mr-xs" />
                      {t('settings.security.title')}
                    </h3>
                  </header>
                  
                  <div className="admin-form-group">
                    <label className="admin-form-label">{t('settings.security.session-timeout')} ({t('common.minutes')})</label>
                    <div className="admin-input-icon-wrapper">
                      <Clock size={16} className="admin-input-icon" />
                      <input 
                        type="number" 
                        className="admin-form-control admin-input--with-icon"
                        value={formData.security?.sessionTimeout || 30}
                        onChange={(e) => handleInputChange('security.sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-toggle">
                      <input 
                        type="checkbox" 
                        checked={formData.security?.twoFactorEnabled || false}
                        onChange={(e) => handleInputChange('security.twoFactorEnabled', e.target.checked)}
                        className="admin-form-toggle-input"
                      />
                      <div className="admin-form-toggle-slider"></div>
                      <div className="u-flex u-flex-direction-column">
                        <span className="u-font-bold u-text-sm">{t('settings.security.twoFactor.title')}</span>
                        <span className="u-text-xs u-text-muted">{t('settings.security.twoFactor.desc')}</span>
                      </div>
                    </label>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-toggle">
                      <input 
                        type="checkbox" 
                        checked={formData.security?.loginNotifications || false}
                        onChange={(e) => handleInputChange('security.loginNotifications', e.target.checked)}
                        className="admin-form-toggle-input"
                      />
                      <div className="admin-form-toggle-slider"></div>
                      <div className="u-flex u-flex-direction-column">
                        <span className="u-font-bold u-text-sm">{t('settings.security.login-alerts.title') || 'Login Alerts'}</span>
                        <span className="u-text-xs u-text-muted">{t('settings.security.login-alerts.desc') || 'Get notified whenever someone logs into your account.'}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* API and Backup Tabs - Placeholder for now */}
            {(activeTab === 'api' || activeTab === 'backup') && (
              <div className="admin-settings-coming-soon">
                <div className="admin-settings-coming-soon-icon">
                  {activeTab === 'api' ? <Code size={48} /> : <Database size={48} />}
                </div>
                <h3>{t(`settings.tabs.${activeTab}`)} {t('common.comingSoon')}</h3>
                <p>{t('common.featureDevelopmentDesc') || 'This feature is currently under development and will be available in a future update.'}</p>
              </div>
            )}
            
            <div className="admin-form-actions">
              <button 
                type="button" 
                className="btn-admin btn-admin--secondary" 
                onClick={refresh}
                disabled={isSaving}
              >
                <RefreshCw size={18} />
                <span>{t('common.reset')}</span>
              </button>
              <button 
                type="submit" 
                className="btn-admin btn-admin--primary"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={18} className="spinning" /> : <Save size={18} />}
                <span>{t('common.save')}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </AdminPageLayout>
  );
};

export default SettingPage;
