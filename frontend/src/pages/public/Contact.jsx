import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mail, Phone, MapPin,
  Send, Loader2, CheckCircle,
  AlertCircle, Facebook, Twitter,
  Linkedin, Instagram, Github,
  MessageSquare, User, Clock,
  ExternalLink, Youtube,
  MessageCircle, Sparkles,
  Info, Globe, Heart
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import api from '../../services/api';

// Styles
import "../../styles/Pages.css";

// Common Components
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

const Contact = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    email: 'mohanshahi.official16@gmail.com',
    phone: '+977-9865365409',
    address: 'Kathmandu, Nepal',
    workingHours: '',
    faq: [],
    availability: {
      availableForProjects: true,
      responseRate: 'under24Hours',
      responseTime: 'Usually replies within a day'
    },
    socialLinks: {
      facebook: 'https://www.facebook.com/mohan.shahi.983517/',
      twitter: 'https://x.com/mohanshahi2061?s=20',
      linkedin: '',
      instagram: 'https://www.instagram.com/mohanshahi60',
      github: 'https://github.com/mohanshahip'
    },
    profileImage: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await api.get('/contact/info');
      if (response.data.success) {
        setContactInfo(prev => ({
          ...prev,
          ...response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (status) setStatus(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('contact.form.name-required');
    if (!formData.email.trim()) newErrors.email = t('contact.form.email-required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('contact.form.email-invalid');
    if (!formData.message.trim()) newErrors.message = t('contact.form.message-required');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/contact/messages', formData);
      addToast(t('contact.success'), 'success');
      setStatus({ type: 'success', message: t('contact.success') });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      const errMsg = error.response?.data?.error || t('contact.error');
      addToast(errMsg, 'error');
      setStatus({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    { 
      icon: Mail, 
      title: t('contact.email-address'), 
      value: contactInfo.email, 
      link: `mailto:${contactInfo.email}`, 
      color: 'var(--primary-color)', 
      response: t('contact.form.email-response') 
    },
    { 
      icon: MessageCircle, 
      title: t('contact.phone-number'), 
      value: contactInfo.phone, 
      link: `tel:${contactInfo.phone}`, 
      color: '#10b981', 
      response: t('contact.form.call-response') 
    },
    { 
      icon: MapPin, 
      title: t('hero.location-label'), 
      value: contactInfo.address, 
      link: `https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`, 
      color: '#ef4444', 
      response: t('contact.form.based-in') 
    }
  ].filter(m => m.value);

  return (
    <main className="section-container contact-page">
      <PageHeader 
        title={t('contact.title')} 
        align="center"
      />

      <div className="contact-main-grid mb-16">
        {/* Contact Form Section */}
        <section className="contact-form-section">
          <div className="contact-card-pro">
            <div className="card-header-pro">
              <div className="icon-box-pro">
                <Send size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">{t('contact.form.send-message')}</h2>
                <p className="text-secondary text-sm">{t('contact.form.form-description')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form-pro">
              <div className="form-row-pro">
                <div className="form-group-pro">
                  <label>{t('contact.form.name')}</label>
                  <div className="input-wrapper-pro">
                    <User size={18} className="input-icon-pro" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('contact.form.name')}
                      className={errors.name ? 'error' : ''}
                    />
                  </div>
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group-pro">
                  <label>{t('contact.form.email')}</label>
                  <div className="input-wrapper-pro">
                    <Mail size={18} className="input-icon-pro" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('contact.email-placeholder')}
                      className={errors.email ? 'error' : ''}
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group-pro">
                <label>{t('contact.form.subject')}</label>
                <div className="input-wrapper-pro">
                  <Info size={18} className="input-icon-pro" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={t('contact.form.subject-placeholder')}
                  />
                </div>
              </div>

              <div className="form-group-pro">
                <label>{t('contact.message')}</label>
                <div className="input-wrapper-pro">
                  <MessageSquare size={18} className="input-icon-pro textarea-icon" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.form.message-placeholder')}
                    className={errors.message ? 'error' : ''}
                  />
                </div>
                {errors.message && <span className="error-text">{errors.message}</span>}
              </div>

              {status && (
                <div className={`form-status-pro ${status.type}`}>
                  {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <span>{status.message}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    {t('contact.form.sending')}
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {t('contact.form.send')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          {contactInfo.faq && contactInfo.faq.length > 0 && (
            <div className="faq-section-pro mt-12">
              <h3 className="faq-title-pro">{t('contact.faq.title')}</h3>
              <div className="faq-grid-pro">
                {contactInfo.faq.map((item, i) => (
                  <div key={i} className="faq-item-pro">
                    <div className="faq-question-pro">
                      <div className="faq-q-badge">?</div>
                      <h4>{item.question}</h4>
                    </div>
                    <p className="faq-answer-pro">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Contact Info & Social Section */}
        <aside className="contact-info-aside">
          <div className="contact-card-pro h-full flex flex-col">
            {contactInfo.profileImage && (
              <div className="profile-image-section-pro mb-10">
                <div className="profile-image-wrapper-pro">
                  <img 
                    src={getFullImageUrl(contactInfo.profileImage)} 
                    alt={t('hero.full-name')} 
                    className="profile-image-pro"
                  />
                  <div className="availability-badge-pro">
                    <span className={`pulse-dot ${contactInfo.availability?.availableForProjects ? 'available' : 'busy'}`}></span>
                    {contactInfo.availability?.availableForProjects ? t('contact.form.available-for-projects') : t('contact.form.currently-busy')}
                  </div>
                </div>
              </div>
            )}

            <div className="card-header-pro">
              <div className="icon-box-pro accent">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">{t('contact.form.connect-with-me')}</h2>
                <p className="text-secondary text-sm">{t('contact.form.description')}</p>
              </div>
            </div>

            <div className="contact-methods-list mb-10">
              {contactMethods.map((method, idx) => (
                <a 
                  key={idx} 
                  href={method.link} 
                  target={method.link ? "_blank" : undefined} 
                  rel="noopener noreferrer"
                  className="method-item-pro"
                >
                  <div 
                    className="method-icon-pro" 
                    style={{ '--method-color': method.color }}
                  >
                    <method.icon size={20} />
                  </div>
                  <div className="method-content-pro">
                    <span className="method-label-pro">{method.title}</span>
                    <span className="method-value-pro">{method.value}</span>
                    <span className="method-response-pro">{method.response}</span>
                  </div>
                  {method.link && <ExternalLink size={14} className="method-arrow-pro" />}
                </a>
              ))}
            </div>

            <div className="social-connect-pro mt-auto pt-8 border-t border-light/50">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted mb-6">
                {t('contact.form.connect-socially')}
              </h4>
              <div className="social-links-pro">
                {Object.entries(contactInfo.socialLinks || {}).map(([platform, url]) => {
                  if (!url) return null;
                  const icons = {
                    facebook: Facebook,
                    twitter: Twitter,
                    linkedin: Linkedin,
                    instagram: Instagram,
                    github: Github,
                    youtube: Youtube
                  };
                  const Icon = icons[platform] || ExternalLink;
                  
                  return (
                    <a 
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn-pro"
                      title={t(`contact.${platform}`)}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="stats-grid stats-container-pro">
        <StatCard 
          icon={Heart}
          label={t('contact.form.response-rate')}
          value={contactInfo.availability?.responseRate === 'under24Hours' ? t('contact.form.under24-hours') : t('contact.form.response-rate')}
          color="#ec4899"
        />
        <StatCard 
          icon={Clock}
          label={t('contact.availability.response-time')}
          value={contactInfo.availability?.responseTime || t('contact.form.under24-hours')}
          color="#10b981"
        />
        <StatCard 
          icon={Globe}
          label={t('hero.reach')}
          value={t('hero.global-reach')}
          color="#8b5cf6"
        />
      </div>
    </main>
  );
};

export default Contact;