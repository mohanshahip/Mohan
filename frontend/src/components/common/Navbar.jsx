
// Navbar.jsx - Professional Public Navbar
import { useState, useEffect, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Sun, Moon, Home,
  Briefcase, Zap, BookOpen, Mail, Lock,
  ChevronRight, Sparkles
} from "lucide-react";
import logo from '../../assets/images/mohan-logo.png';
import '../../styles/Navbar.css';

/* Enhanced NavLink component for consistent spacing */
const NavLink = memo(({ to, translationKey, icon: Icon, onClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="nav-link-icon"><Icon size={18} /></span>
      <span className="nav-link-text">{t(translationKey)}</span>
    </Link>
  );
});

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("public-theme") || localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return savedTheme ? JSON.parse(savedTheme === "dark") : prefersDark;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem("preferred-language") || i18n.language || "en";
  });

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);





  // Public theme toggle
  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode ? "dark" : "light";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("public-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }, [isDarkMode]);

  // Language toggle
  const toggleLanguage = useCallback(() => {
    if (isLoading) return;

    const newLang = currentLang === "en" ? "np" : "en";
    setIsLoading(true);

    i18n.changeLanguage(newLang);
    localStorage.setItem("preferred-language", newLang);
    setCurrentLang(newLang);

    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, [isLoading, currentLang, i18n]);

  // Menu toggle
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  }, []);

  const navLinks = [
    { path: "/", label: "navigation.home", icon: Home },
    { path: "/poems", label: "navigation.poems", icon: BookOpen },
    { path: "/projects", label: "navigation.projects", icon: Briefcase },
    { path: "/gallery", label: "navigation.gallery", icon: Sparkles },
    { path: "/skills", label: "navigation.skills", icon: Zap },
    { path: "/contact", label: "navigation.contact", icon: Mail },
  ];

  return (
    <>
      <nav
        className={`navbar ${isScrolled ? "navbar-scrolled" : ""} ${isMenuOpen ? "mobile-menu-open" : ""}`}
        role="navigation"
        aria-label={t("navigation.main-navigation")}
      >
        <div className="navbar-container">
          {/* Logo */}
          <div className="nav-brand">
            <Link
              to="/"
              className="logo"
              onClick={closeMenu}
              aria-label={t("navigation.home")}
            >
              <img src={logo} alt={t('navigation.logo')} className="logo-img" />
              <span className="logo-text-hidden">{t('navigation.logo')}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links" role="menubar">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                translationKey={label}
                icon={Icon}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="nav-controls">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={isDarkMode ? t("navigation.switch-to-light") : t("navigation.switch-to-dark")}
              title={isDarkMode ? t("navigation.switch-to-light") : t("navigation.switch-to-dark")}
              disabled={isLoading}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              className="lang-toggle"
              onClick={toggleLanguage}
              aria-label={currentLang === "en" ? t("navigation.switch-to-nepali") : t("navigation.switch-to-english")}
              disabled={isLoading}
              title={currentLang === "en" ? t("navigation.switch-to-nepali") : t("navigation.switch-to-english")}
            >
              {isLoading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <span className="lang-text">
                  {currentLang === "en" ? t("navigation.english-short") : t("navigation.nepali-short")}
                </span>
              )}
            </button>

            <Link
              to="/login"
              className="admin-link"
              title={t("navigation.dashboard")}
              onClick={closeMenu}
            >
              <Lock size={16} />
              <span className="admin-text">{t("navigation.admin")}</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-toggle"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? t("navigation.close-menu") : t("navigation.open-menu")}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`mobile-menu ${isMenuOpen ? "open" : ""}`}
            role="dialog"
            aria-modal="true"
            inert={!isMenuOpen ? true : undefined}
          >
            <div className="mobile-menu-content">
              {navLinks.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;

                return (
                  <Link
                    key={path}
                    to={path}
                    className={`mobile-nav-link ${isActive ? "active" : ""}`}
                    onClick={closeMenu}
                    role="menuitem"
                  >
                    <Icon size={20} />
                    {t(label)}
                    {isActive && <ChevronRight size={18} className="ml-auto" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          <div
            className="mobile-overlay"
            onClick={closeMenu}
            aria-hidden="true"
          />
        </div>
      </nav>

      {isLoading && <div className="nav-loading-bar" aria-hidden="true" />}
    </>
  );
};

export default Navbar;
