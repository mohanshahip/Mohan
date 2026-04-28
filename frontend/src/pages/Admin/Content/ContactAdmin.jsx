import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save, Loader2, CheckCircle,
  AlertCircle, Mail, Phone,
  MapPin, Clock, Facebook,
  Twitter, Linkedin, Instagram,
  Github, Plus, Trash2,
  Eye, Edit2, ExternalLink,
  ChevronDown, ChevronUp, Copy,
  Settings, MessageSquare, Image as ImageIcon,
  Upload, X, Star, Filter,
  Search, Download, RefreshCw,
  User, Globe, Calendar,
  Hash, Shield
} from 'lucide-react';
import api from '../../../services/api';
import { useLoading, useConfirm } from '../../../context/UIContext';
import { useToast } from '../../../context/ToastContext';
import '../../../styles/ContactAdmin.css';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../../../components/common/CustomSelect';
import DataTable from '../../../components/common/DataTable';
import '../../../styles/AdminCommon.css';

const ContactAdmin = () => {
  const { t } = useTranslation();
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    workingHours: '',
    profileImage: null,
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      github: ''
    },
    faq: [],
    availability: {
      availableForProjects: true,
      responseRate: 'under24Hours',
      responseTime: 'Usually replies within a day'
    }
  });

  const [messages, setMessages] = useState([]);
  const { withLoading, isLoading } = useLoading();
  const confirm = useConfirm();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('info');
  const [expandedSections, setExpandedSections] = useState(new Set(['contact', 'social']));
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    read: '',
    replied: ''
  });
  const [messageDetails, setMessageDetails] = useState(null);

  const columns = [
    {
      key: 'status',
      label: t('common.status'),
      render: (_, message) => (
        <div className="status-indicators">
          {!message.read && <div className="unread-dot" />}
          {message.replied && <CheckCircle size={12} className="replied-icon" />}
        </div>
      )
    },
    {
      key: 'contact',
      label: t('contact.contact'),
      render: (_, message) => (
        <div className="contact-info">
          <strong>{message.name}</strong>
          <small>{message.email}</small>
        </div>
      )
    },
    {
      key: 'message',
      label: t('contact.message'),
      render: (_, message) => (
        <div className="message-preview">
          <strong>{message.subject || t('contact.no-subject')}</strong>
          <p>{message.message.substring(0, 60)}...</p>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: t('common.date'),
      render: (date) => (
        <div className="date-cell">
          {new Date(date).toLocaleDateString()}
        </div>
      )
    }
  ];

  const [formData, setFormData] = useState({ ...contactInfo });
  const [newSocial, setNewSocial] = useState({
    platform: '',
    url: '',
    icon: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const fetchContactInfo = useCallback(async () => {
    try {
      const response = await withLoading(() => api.get('/contact/info'), t('common.loading'));
      const data = response.data.data;

      // Ensure defaults
      const normalizedData = {
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        workingHours: data.workingHours || '',
        profileImage: data.profileImage || null,
        socialLinks: {
          facebook: data.socialLinks?.facebook || '',
          twitter: data.socialLinks?.twitter || '',
          linkedin: data.socialLinks?.linkedin || '',
          instagram: data.socialLinks?.instagram || '',
          github: data.socialLinks?.github || ''
        },
        faq: data.faq || [],
        availability: {
          availableForProjects: data.availability?.availableForProjects ?? true,
          responseRate: data.availability?.responseRate || 'under24Hours',
          responseTime: data.availability?.responseTime || 'Usually replies within a day'
        }
      };

      setContactInfo(normalizedData);
      setFormData(normalizedData);

      if (normalizedData.profileImage) {
        setImagePreview(normalizedData.profileImage);
      }
    } catch (_error) {
      addToast(t('contact.load-failed'), 'error');
    }
  }, [withLoading, t, addToast]);

  const fetchMessages = useCallback(async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await withLoading(() => api.get(`/contact/messages?${queryParams}`), t('common.loading'));
      setMessages(response.data.data);
    } catch (_error) {
      addToast(t('contact.messages-load-failed'), 'error');
    }
  }, [withLoading, t, addToast]);

  // Fetch contact info and messages
  useEffect(() => {
    fetchContactInfo();
    fetchMessages();
  }, [fetchContactInfo, fetchMessages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast(t('contact.image-size-error'), 'error');
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        addToast(t('contact.image-type-error'), 'error');
        return;
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = async () => {
    const ok = await confirm({
      title: t('contact.remove-image-title'),
      message: t('contact.remove-image-confirm'),
      type: 'warning',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      await withLoading(() => api.delete('/contact/info/image'), t('common.deleting'));
      setImagePreview(null);
      setImageFile(null);
      setFormData(prev => ({ ...prev, profileImage: null }));
      addToast(t('contact.image-removed'), 'success');
    } catch (error) {
      addToast(t('contact.image-remove-error'), 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      addToast(t('contact.invalid-email'), 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('workingHours', formData.workingHours.trim());
      formDataToSend.append('socialLinks', JSON.stringify(formData.socialLinks));
      formDataToSend.append('faq', JSON.stringify(formData.faq));
      formDataToSend.append('availability', JSON.stringify(formData.availability));
      
      if (imageFile) {
        formDataToSend.append('profileImage', imageFile);
      }
      
      const response = await withLoading(() => api.put('/contact/info', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }), t('common.saving'));
      
      const updatedData = response.data.data;
      setContactInfo(updatedData);
      setFormData(updatedData);
      setImageFile(null);
      addToast(t('contact.update-success'), 'success');
    } catch (error) {
      const errorMsg = error.response?.data?.error || t('contact.update-failed');
      addToast(errorMsg, 'error');
    }
  };

  const handleAddSocial = () => {
    if (!newSocial.platform || !newSocial.url) {
      addToast(t('contact.platform-url-required'), 'error');
      return;
    }

    if (!newSocial.url.startsWith('http')) {
      addToast(t('contact.invalid-url'), 'error');
      return;
    }

    const platformKey = newSocial.platform.toLowerCase();
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platformKey]: newSocial.url
      }
    }));
    setNewSocial({ platform: '', url: '', icon: '' });
    addToast(t('contact.social-link-added'), 'success');
  };

  const handleRemoveSocial = (platform) => {
    const updated = { ...formData.socialLinks };
    delete updated[platform];
    setFormData(prev => ({
      ...prev,
      socialLinks: updated
    }));
    addToast(t('contact.social-link-removed'), 'success');
  };

  const handleMessageAction = async (action, messageId, _data = {}) => {
    try {
      switch (action) {
        case 'mark-read':
          await withLoading(() => api.put(`/contact/messages/${messageId}`, { read: true }), t('common.updating'));
          break;
        case 'mark-replied':
          await withLoading(() => api.put(`/contact/messages/${messageId}`, { replied: true }), t('common.updating'));
          break;
        case 'delete':
          {
            const ok = await confirm({
              title: t('contact.delete-message-title'),
              message: t('contact.delete-message-confirm'),
              type: 'danger',
              confirmText: t('common.delete'),
              cancelText: t('common.cancel')
            });
            if (!ok) return;
            await withLoading(() => api.delete(`/contact/messages/${messageId}`), t('common.deleting'));
          }
          break;
        case 'view':
          {
            const response = await withLoading(() => api.get(`/contact/messages/${messageId}`), t('common.loading'));
            setMessageDetails(response.data.data);
          }
          break;
      }
      
      if (action !== 'view') {
        fetchMessages();
        addToast(t('contact.message-updated'), 'success');
      }
    } catch (_error) {
      addToast(t('contact.update-failed'), 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedMessages.size === 0) {
      addToast(t('contact.select-messages'), 'warning');
      return;
    }

    if (action === 'delete') {
      const ok = await confirm({
        title: t('contact.delete-messages-title'),
        message: t('contact.delete-messages-confirm', { count: selectedMessages.size }),
        type: 'danger',
        confirmText: t('common.delete'),
        cancelText: t('common.cancel')
      });
      if (!ok) return;
    }

    try {
      const ids = Array.from(selectedMessages);
      
      switch (action) {
        case 'mark-read':
          await withLoading(() => api.put('/contact/messages/bulk', { ids, read: true }), t('common.updating'));
          break;
        case 'mark-replied':
          await withLoading(() => api.put('/contact/messages/bulk', { ids, replied: true }), t('common.updating'));
          break;
        case 'delete':
          await withLoading(() => api.delete('/contact/messages/bulk', { data: { ids } }), t('common.deleting'));
          break;
      }
      
      setSelectedMessages(new Set());
      fetchMessages();
      addToast(t('contact.bulk-action-success', { count: ids.length }), 'success');
    } catch (error) {
      addToast(t('contact.bulk-action-failed'), 'error');
    }
  };

  const toggleMessageSelection = (messageId) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleSearch = () => {
    fetchMessages({ search: searchTerm, ...filters });
  };

  const exportMessages = async () => {
    try {
      const response = await withLoading(() => api.get('/contact/messages/export', { responseType: 'blob' }), t('common.exporting'));
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `messages_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      addToast(t('contact.export-success'), 'success');
    } catch (error) {
      addToast(t('contact.export-failed'), 'error');
    }
  };

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const socialPlatforms = [
    { key: 'facebook', label: t('contact.facebook'), icon: <Facebook size={16} />, color: '#1877F2' },
    { key: 'twitter', label: t('contact.twitter'), icon: <Twitter size={16} />, color: '#1DA1F2' },
    { key: 'linkedin', label: t('contact.linkedin'), icon: <Linkedin size={16} />, color: '#0A66C2' },
    { key: 'instagram', label: t('contact.instagram'), icon: <Instagram size={16} />, color: '#E4405F' },
    { key: 'github', label: t('contact.github'), icon: <Github size={16} />, color: '#181717' }
  ];

  // Close modal with escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMessageDetails(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <AdminPageLayout
      icon={<MessageSquare size={24} />}
      title={t('contact.adminTitle')}
      subtitle={t('contact.adminSubtitle')}
      actions={
        <div className="u-flex u-gap-sm">
          <button
            className="btn-admin btn-admin--secondary"
            onClick={() => {
              fetchContactInfo();
              fetchMessages();
            }}
            type="button"
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            <span>{t('common.refresh')}</span>
          </button>
          <button
            className="btn-admin btn-admin--primary"
            onClick={handleSave}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{t('common.save')}</span>
          </button>
        </div>
      }
    >

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
          disabled={isLoading}
        >
          <Settings size={18} />
          {t('contact.information')}
        </button>
        <button
          className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
          disabled={isLoading}
        >
          <MessageSquare size={18} />
          {t('contact.messages')}
          <span className="admin-tab-badge">{messages.length}</span>
        </button>
      </div>

      {/* Contact Information Tab */}
      {activeTab === 'info' && (
        <div className="admin-form-container">
          {/* Profile Image */}
          <div className="admin-form-section">
            <h3 className="admin-form-section__title">
              <User size={20} />
              {t('contact.profile-image')}
            </h3>
            <div className="u-flex u-gap-xl u-items-start u-flex-wrap">
              <div className="admin-form-image-preview" style={{ maxWidth: '240px' }}>
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      alt={t('contact.profile')}
                    />
                    <button 
                      className="admin-form-image-remove"
                      onClick={removeImage}
                      aria-label={t('contact.remove-image')}
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <div className="u-flex u-flex-direction-column u-items-center u-justify-center u-h-full u-text-muted">
                    <User size={48} />
                    <p className="u-mt-sm">{t('contact.noImage')}</p>
                  </div>
                )}
              </div>
              
              <div className="u-flex u-flex-direction-column u-gap-md">
                <p className="u-text-sm u-text-muted">{t('contact.square-image-max')}</p>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="u-hidden"
                />
                <label htmlFor="profileImage" className="btn-admin btn-admin--secondary">
                  <Upload size={16} />
                  {imagePreview ? t('contact.change-image') : t('contact.choose-file')}
                </label>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="admin-form-section">
            <h3 className="admin-form-section__title">
              <Mail size={20} />
              {t('contact.contact-details')}
            </h3>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  <Mail size={16} className="u-mr-xs" />
                  {t('contact.email-address')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="admin-form-control"
                  placeholder={t('contact.email-placeholder')}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  <Phone size={16} className="u-mr-xs" />
                  {t('contact.phone-number')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="admin-form-control"
                  placeholder={t('contact.phone-placeholder')}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  <MapPin size={16} className="u-mr-xs" />
                  {t('contact.address')}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="admin-form-control"
                  placeholder={t('contact.address-placeholder')}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  <Clock size={16} className="u-mr-xs" />
                  {t('contact.working-hours')}
                </label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  className="admin-form-control"
                  placeholder={t('contact.working-hours-placeholder')}
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="admin-form-section">
            <h3 className="admin-form-section__title">
              <Globe size={20} />
              {t('contact.social-media')}
            </h3>
            <div className="u-flex u-flex-direction-column u-gap-lg">
              {socialPlatforms.map(platform => (
                <div key={platform.key} className="u-flex u-items-center u-gap-md">
                  <div 
                    className="u-flex u-items-center u-justify-center u-w-10 u-h-10 u-rounded-lg"
                    style={{ background: `${platform.color}15`, color: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <div className="u-flex-1">
                    <input
                      type="url"
                      value={formData.socialLinks[platform.key] || ''}
                      onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                      className="admin-form-control"
                      placeholder={t('contact.social-placeholder', { platform: platform.label })}
                    />
                  </div>
                  <div className="u-flex u-gap-xs">
                    {formData.socialLinks[platform.key] && (
                      <>
                        <a
                          href={formData.socialLinks[platform.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-admin btn-admin--icon"
                          title={t('common.visit')}
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          className="btn-admin btn-admin--danger btn-admin--icon"
                          onClick={() => handleRemoveSocial(platform.key)}
                          title={t('common.remove')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="admin-form-section">
            <h3 className="admin-form-section__title">
              <MessageSquare size={20} />
              {t('contact.faq.title')}
            </h3>
            <div className="u-flex u-flex-direction-column u-gap-lg">
              {formData.faq.map((item, index) => (
                <div key={index} className="admin-form-section u-p-lg u-border-light u-relative">
                  <button 
                    type="button" 
                    className="btn-admin btn-admin--danger btn-admin--icon u-absolute u-top-4 u-right-4" 
                    onClick={() => {
                      const newFaq = [...formData.faq];
                      newFaq.splice(index, 1);
                      setFormData(prev => ({ ...prev, faq: newFaq }));
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="u-flex u-flex-direction-column u-gap-md">
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('contact.faq.question')}</label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => {
                          const newFaq = [...formData.faq];
                          newFaq[index].question = e.target.value;
                          setFormData(prev => ({ ...prev, faq: newFaq }));
                        }}
                        className="admin-form-control"
                        placeholder={t('contact.faq.question')}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">{t('contact.faq.answer')}</label>
                      <textarea
                        value={item.answer}
                        onChange={(e) => {
                          const newFaq = [...formData.faq];
                          newFaq[index].answer = e.target.value;
                          setFormData(prev => ({ ...prev, faq: newFaq }));
                        }}
                        className="admin-form-control"
                        placeholder={t('contact.faq.answer')}
                        rows="2"
                        style={{ minHeight: '80px', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                className="btn-admin btn-admin--secondary u-w-max" 
                onClick={() => {
                  setFormData(prev => ({ ...prev, faq: [...prev.faq, { question: '', answer: '' }] }));
                }}
              >
                <Plus size={16} />
                {t('contact.faq.add')}
              </button>
            </div>
          </div>

          {/* Availability Section */}
          <div className="admin-form-section">
            <h3 className="admin-form-section__title">
              <Clock size={20} />
              {t('contact.availability.title')}
            </h3>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-toggle">
                  <input
                    type="checkbox"
                    checked={formData.availability.availableForProjects}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      availability: { ...prev.availability, availableForProjects: e.target.checked }
                    }))}
                    className="admin-form-toggle-input"
                  />
                  <div className="admin-form-toggle-slider"></div>
                  <span className="admin-form-label u-mb-0">{t('contact.availability.open-for-projects')}</span>
                </label>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">{t('contact.availability.response-rate')}</label>
                <input
                  type="text"
                  value={formData.availability.responseRate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, responseRate: e.target.value }
                  }))}
                  className="admin-form-control"
                  placeholder={t('contact.availability.response-rate-placeholder')}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">{t('contact.availability.response-time')}</label>
                <input
                  type="text"
                  value={formData.availability.responseTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, responseTime: e.target.value }
                  }))}
                  className="admin-form-control"
                  placeholder={t('contact.availability.response-time-placeholder')}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="admin-form-container">
          {/* Stats & Filters */}
          <div className="admin-stats-grid u-mb-xl">
            <div className="admin-stat-card">
              <div className="admin-stat-icon u-bg-primary-light u-text-primary">
                <MessageSquare size={24} />
              </div>
              <div className="admin-stat-info">
                <h4 className="admin-stat-label">{t('common.total')}</h4>
                <p className="admin-stat-value">{messages.length}</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon u-bg-warning-light u-text-warning">
                <Eye size={24} />
              </div>
              <div className="admin-stat-info">
                <h4 className="admin-stat-label">{t('common.unread')}</h4>
                <p className="admin-stat-value">{messages.filter(m => !m.read).length}</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon u-bg-success-light u-text-success">
                <CheckCircle size={24} />
              </div>
              <div className="admin-stat-info">
                <h4 className="admin-stat-label">{t('common.replied')}</h4>
                <p className="admin-stat-value">{messages.filter(m => m.replied).length}</p>
              </div>
            </div>
          </div>

          <div className="u-flex u-justify-between u-items-center u-mb-lg u-flex-wrap u-gap-md">
            <div className="u-flex u-gap-sm u-items-center">
              <form className="admin-search-wrapper" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <Search size={18} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder={t('contact.search-messages')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
              <button 
                className="btn-admin btn-admin--secondary"
                onClick={exportMessages}
                disabled={messages.length === 0}
              >
                <Download size={16} />
                {t('common.export')}
              </button>
            </div>

            {selectedMessages.size > 0 && (
              <div className="u-flex u-items-center u-gap-md u-bg-surface u-p-sm u-rounded-lg u-border-light">
                <span className="u-text-sm u-font-semibold">{t('contact.selected', { count: selectedMessages.size })}</span>
                <div className="u-flex u-gap-xs">
                  <button
                    className="btn-admin btn-admin--secondary btn-admin--sm"
                    onClick={() => handleBulkAction('mark-read')}
                  >
                    {t('contact.mark-read')}
                  </button>
                  <button
                    className="btn-admin btn-admin--secondary btn-admin--sm"
                    onClick={() => handleBulkAction('mark-replied')}
                  >
                    {t('contact.mark-replied')}
                  </button>
                  <button
                    className="btn-admin btn-admin--danger btn-admin--sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages Table */}
          <div className="admin-card">
            <DataTable
              columns={columns}
              data={messages}
              loading={isLoading}
              emptyMessage={t('contact.no-messages')}
              selectable={true}
              selectedRows={Array.from(selectedMessages)}
              onSelectRow={(id) => {
                const newSelected = new Set(selectedMessages);
                if (newSelected.has(id)) {
                  newSelected.delete(id);
                } else {
                  newSelected.add(id);
                }
                setSelectedMessages(newSelected);
              }}
              onSelectAll={() => {
                if (selectedMessages.size === messages.length) {
                  setSelectedMessages(new Set());
                } else {
                  setSelectedMessages(new Set(messages.map(m => m._id)));
                }
              }}
              actions={(message) => (
                <div className="admin-table-actions">
                  <button
                    className="admin-table-icon-btn"
                    onClick={() => handleMessageAction('view', message._id)}
                    title={t('common.view')}
                  >
                    <Eye size={16} />
                  </button>
                  <a
                    href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                    className="admin-table-icon-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t('common.reply')}
                  > 
                    <Mail size={16} />
                  </a>
                  <button
                    className="admin-table-icon-btn admin-table-icon-btn--danger"
                    onClick={() => handleMessageAction('delete', message._id)}
                    title={t('common.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Message Details Modal */}
      {messageDetails && (
        <div className="admin-modal-overlay" onClick={() => setMessageDetails(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <MessageSquare size={20} className="u-mr-xs" />
                {t('contact.message-details')}
              </h3>
              <button className="admin-modal-close" onClick={() => setMessageDetails(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="u-flex u-flex-direction-column u-gap-lg">
                <div className="u-flex u-justify-between u-items-start u-flex-wrap u-gap-md">
                  <div className="u-flex u-gap-md u-items-center">
                    <div className="u-w-12 u-h-12 u-bg-background-alt u-rounded-full u-flex u-items-center u-justify-center u-text-primary u-font-bold u-text-xl">
                      {messageDetails.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="u-font-bold u-text-lg">{messageDetails.name}</h4>
                      <p className="u-text-sm u-text-muted">{messageDetails.email}</p>
                    </div>
                  </div>
                  <div className="u-text-right">
                    <p className="u-text-sm u-font-semibold">{new Date(messageDetails.createdAt).toLocaleString()}</p>
                    <div className="u-flex u-gap-xs u-mt-xs u-justify-end">
                      {messageDetails.read ? 
                        <span className="admin-badge admin-badge--success">{t('common.read')}</span> :
                        <span className="admin-badge admin-badge--warning">{t('common.unread')}</span>
                      }
                      {messageDetails.replied && 
                        <span className="admin-badge admin-badge--info">{t('common.replied')}</span>
                      }
                    </div>
                  </div>
                </div>

                <div className="admin-form-section u-p-lg">
                  <h5 className="u-font-bold u-mb-sm">{messageDetails.subject || t('contact.no-subject')}</h5>
                  <div className="u-text-primary u-whitespace-pre-wrap u-line-height-relaxed">
                    {messageDetails.message}
                  </div>
                </div>

                <div className="u-flex u-gap-md u-justify-end">
                  {!messageDetails.read && (
                    <button 
                      className="btn-admin btn-admin--secondary"
                      onClick={() => handleMessageAction('mark-read', messageDetails._id)}
                    >
                      {t('contact.mark-read')}
                    </button>
                  )}
                  {!messageDetails.replied && (
                    <button 
                      className="btn-admin btn-admin--secondary"
                      onClick={() => handleMessageAction('mark-replied', messageDetails._id)}
                    >
                      {t('contact.mark-replied')}
                    </button>
                  )}
                  <a
                    href={`mailto:${messageDetails.email}?subject=Re: ${encodeURIComponent(messageDetails.subject)}`}
                    className="btn-admin btn-admin--primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Mail size={18} />
                    {t('common.reply')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </AdminPageLayout>
  );
};

export default ContactAdmin;
