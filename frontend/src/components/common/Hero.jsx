import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Trophy, MapPin, Briefcase, Building, Calendar,
  Image as ImageIcon, Globe, Users,
  Linkedin, Twitter, Instagram, Mail, Github,
  ChevronDown, ChevronUp, CheckCircle,
  Loader2, AlertCircle, Zap, Building2, ArrowRight, User, Award,
  Facebook
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../../utils/imageUtils';
import '../../styles/Hero.css';

const Hero = () => {
  const { t, i18n } = useTranslation();
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const getBackendLang = useCallback(() => {
    const langMap = { 'np': 'ne', 'ne': 'ne', 'en': 'en' };
    return langMap[i18n.language] || 'en';
  }, [i18n.language]);

  const getDefaultHeroData = useCallback(() => {
    const backendLang = getBackendLang();

    return {
      name: t("hero.full-name"),
      title: t("hero.professional-title"),
      description: t("hero.bio"),
      location: t("hero.location-label"),
      organization: t("hero.organization-label"),
      yearsActive: t("hero.years-active"),
      expertise: [],
      achievements: [],
      metrics: {
        projectsCompleted: 0,
        yearsExperience: 0,
        clientSatisfaction: 0,
        globalReach: t("hero.global-reach")
      },
      isActive: true,
      language: backendLang,
      socialLinks: {
        facebook: "https://www.facebook.com/mohan.shahi.983517/",
        twitter: "https://x.com/mohanshahi2061?s=20",
        instagram: "https://www.instagram.com/mohanshahi60",
        github: "https://github.com/mohanshahip",
        contact: "/contact"
      },
      heroImage: {
        url: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        alt: t("hero.professional-portrait")
      }
    };
  }, [t, getBackendLang]);

  const fetchHeroData = useCallback(async () => {
    try {
      setLoading(true);
      setImageError(false);
      const backendLang = getBackendLang();
      
      const response = await fetch(`${API_BASE_URL}/hero?lang=${backendLang}`, {
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        if (response.status === 404) {
          setHeroData(getDefaultHeroData());
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Only use the fetched hero image if it has a valid URL
        const backendHeroImage = result.data.heroImage?.url 
          ? result.data.heroImage 
          : getDefaultHeroData().heroImage;

        setHeroData({
          ...getDefaultHeroData(),
          ...result.data,
          socialLinks: { ...getDefaultHeroData().socialLinks, ...(result.data.socialLinks || {}) },
          heroImage: backendHeroImage
        });
      } else {
        setHeroData(getDefaultHeroData());
      }
    } catch (err) {
      setHeroData(getDefaultHeroData());
    } finally {
      setLoading(false);
    }
  }, [getBackendLang, getDefaultHeroData, API_BASE_URL]);

  useEffect(() => {
    fetchHeroData();
  }, [i18n.language, fetchHeroData]);

  if (loading) {
    return (
      <div className="hero-loading">
        <Loader2 size={48} className="hero-spinner" />
      </div>
    );
  }

  const data = heroData || getDefaultHeroData();

  return (
    <section className="hero-section" id="hero">
      <div className="hero-container">
        {/* Visual Column - Now on Left */}
        <div className="hero-visual">
          <div className="hero-visual-container">
            {data.heroImage?.url && !imageError ? (
              <div className="hero-image-wrapper">
                <img
                  src={getFullImageUrl(data.heroImage.url)}
                  alt={data.heroImage.alt || data.name}
                  className="hero-image"
                  onError={() => setImageError(true)}
                  loading="eager"
                />
              </div>
            ) : (
              <div className="hero-image-wrapper">
                <div className="hero-image-fallback">
                  <ImageIcon size={64} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Column - Now on Right */}
        <div className="hero-content">
          <div className="hero-title-section">
            <h1 className="hero-title">
              {data.name}
            </h1>
            <h2 className="hero-subtitle">
              {data.title}
            </h2>
          </div>

          <p className="hero-description">
            {data.description}
          </p>

          <div className="hero-actions">
            <div className="social-buttons">
              {data.socialLinks?.facebook && (
                <a href={data.socialLinks.facebook} target="_blank" rel="noopener" className="social-btn" title={t('contact.facebook')}>
                  <Facebook size={20} />
                </a>
              )}
              {data.socialLinks?.linkedin && (
                <a href={data.socialLinks.linkedin} target="_blank" rel="noopener" className="social-btn" title={t('contact.linkedin')}>
                  <Linkedin size={20} />
                </a>
              )}
              {data.socialLinks?.github && (
                <a href={data.socialLinks.github} target="_blank" rel="noopener" className="social-btn" title={t('contact.github')}>
                  <Github size={20} />
                </a>
              )}
              {data.socialLinks?.twitter && (
                <a href={data.socialLinks.twitter} target="_blank" rel="noopener" className="social-btn" title={t('contact.twitter')}>
                  <Twitter size={20} />
                </a>
              )}
              {data.socialLinks?.instagram && (
                <a href={data.socialLinks.instagram} target="_blank" rel="noopener" className="social-btn" title={t('contact.instagram')}>
                  <Instagram size={20} />
                </a>
              )}
              <a href={data.socialLinks?.contact || "/contact"} className="social-btn" title={t('navigation.contact')}>
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div className="hero-btns">
            <Link to="/projects" className="btn btn-primary hero-btn">
              <ArrowRight size={20} />
              {t('hero.view-work')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
