import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Heart, ExternalLink, Mail, Phone, MapPin,
  Linkedin, Twitter, Instagram, Github,
  ArrowUp, Copyright, Globe, Shield
} from 'lucide-react';
import logo from '../../assets/images/mohan-logo.png';
import '../../styles/Footer.css';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const year = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isNepali = i18n.language === 'np';

  // Show scroll to top button when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Footer links organized by category
  const footerLinks = {
    navigation: [
      { path: '/', label: t('navigation.home') },
      { path: '/projects', label: t('navigation.projects') },
      { path: '/skills', label: t('navigation.skills') },
      { path: '/contact', label: t('navigation.contact') }
    ],
    resources: [
      { path: '/blog', label: t('footer.blog') },
      { path: '/docs', label: t('skills.documentation') },
      { path: '/tutorials', label: t('skills.tutorials') },
      { path: '/faq', label: t('footer.faq') }
    ],
    legal: [
      { path: '/privacy', label: t('footer.privacy-policy') },
      { path: '/terms', label: t('footer.terms-of-service') },
      { path: '/cookies', label: t('footer.cookies') },
      { path: '/disclaimer', label: t('footer.disclaimer') }
    ]
  };

  const contactInfo = {
    email: 'hello@example.com',
    phone: t('footer.phone'),
    location: t('hero.location')
  };

  const socialLinks = {
    linkedin: 'https://linkedin.com/in/example',
    twitter: 'https://twitter.com/example',
    instagram: 'https://instagram.com/example',
    github: 'https://github.com/example'
  };

  return (
    <footer className="footer" role="contentinfo" aria-label={t('navigation.main-navigation')}>
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Brand & Description */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logo} alt={t('navigation.logo')} className="footer-logo-img" />
              <span className="logo-text-hidden">{t('navigation.logo')}</span>
            </Link>
            <p className="footer-description">
              {t('footer.description')}
            </p>
            <div className="footer-social">
              <a 
                href={socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link linkedin"
                aria-label={t('contact.linkedin')}
              >
                <Linkedin size={20} />
              </a>
              <a 
                href={socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link twitter"
                aria-label={t('contact.twitter')}
              >
                <Twitter size={20} />
              </a>
              <a 
                href={socialLinks.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link github"
                aria-label={t('contact.github')}
              >
                <Github size={20} />
              </a>
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link instagram"
                aria-label={t('contact.instagram')}
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-group">
            <h3 className="links-heading">
              <span className="heading-gradient">{t('navigation.main-navigation')}</span>
            </h3>
            <ul className="footer-links">
              {footerLinks.navigation.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-links-group">
            <h3 className="links-heading">
              <span className="heading-gradient">{t('skills.resources')}</span>
            </h3>
            <ul className="footer-links">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h3 className="links-heading">
              <span className="heading-gradient">{t('navigation.contact')}</span>
            </h3>
            <ul className="contact-info">
              <li className="contact-item">
                <Mail size={16} className="contact-icon" />
                <a href={`mailto:${contactInfo.email}`} className="contact-link">
                  {contactInfo.email}
                </a>
              </li>
              <li className="contact-item">
                <Phone size={16} className="contact-icon" />
                <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`} className="contact-link">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="contact-item">
                <MapPin size={16} className="contact-icon" />
                <span className="contact-text">{contactInfo.location}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <div className="copyright">
              <Copyright size={14} />
              <span>
                {year} {t('hero.full-name')}. {t('footer.all-rights-reserved')}
              </span>
            </div>

            <div className="footer-legal">
              <ul className="legal-links">
                {footerLinks.legal.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="legal-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-meta">
              <span className="meta-item">
                <Globe size={14} />
                <span className="meta-text">
                  {i18n.language === 'np' ? t('common.languages.nepali') : t('common.languages.english')} • {t('footer.version')}
                </span>
              </span>
              <span className="meta-item">
                <Shield size={14} />
                <span className="meta-text">
                  {t('footer.ssl-secured')}
                </span>
              </span>
            </div>
          </div>

          <div className="footer-attribution">
            <p>
              {t('footer.made-with')}
              <Heart size={14} className="heart-icon" />
              {t('footer.in-nepal')}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          className="scroll-top-btn"
          onClick={scrollToTop}
          aria-label={t('footer.scroll-to-top')}
        >
          <ArrowUp size={20} />
        </button>
      )}
    </footer>
  );
};

export default Footer;