// Topbar.jsx - Clean, Minimal, Professional
// Grid controlled - No fixed positioning

import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, LogOut, ChevronDown, Sun, Moon, Globe, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import logo from "../../assets/images/mohan-logo.png";
import "../../styles/Topbar.css";

/**
 * Theme Toggle - Clean Lucide icons
 */
const ThemeToggle = memo(({ darkMode, toggleTheme, t }) => (
  <button
    className="action-button theme-toggle"
    onClick={toggleTheme}
    aria-label={darkMode ? t("navigation.switch-to-light") : t("navigation.switch-to-dark")}
    title={darkMode ? t("navigation.switch-to-light") : t("navigation.switch-to-dark")}
  >
    {darkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
  </button>
));

/**
 * Language Toggle - Modern with icon
 */
const LanguageToggle = memo(({ language, isLanguageSwitching, onLanguageSwitch, t }) => (
  <button
    className={`action-button lang-toggle ${isLanguageSwitching ? "loading" : ""}`}
    onClick={onLanguageSwitch}
    disabled={isLanguageSwitching}
    aria-label={language === "en" ? t("navigation.switch-to-nepali") : t("navigation.switch-to-english")}
    title={language === "en" ? t("navigation.switch-to-nepali") : t("navigation.switch-to-english")}
  >
    {isLanguageSwitching ? (
      <div className="loading-spinner-small">
        <div className="spinner-small" />
      </div>
    ) : (
      <div className="lang-toggle-content">
        <Globe size={18} strokeWidth={2} className="lang-icon" />
        <span className="lang-text-fixed">
          {language === "en" ? t("navigation.english-short") : t("navigation.nepali-short")}
        </span>
      </div>
    )}
  </button>
));

// ======================================================
// MAIN TOPBAR COMPONENT
// ======================================================

const Topbar = ({
  isSidebarCollapsed,
  toggleSidebar,
  language,
  onLanguageSwitch,
  isLanguageSwitching,
  darkMode,
  toggleTheme,
  isMobile
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBrandClick = () => {
    navigate("/admin");
  };

  return (
    <header className="topbar">
      {/* Left section - Navigation toggle & Brand */}
      <div className="topbar-left">
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label={isMobile ? t("navigation.open-menu") : t("navigation.toggle-menu")}
        >
          {isMobile ? (
            <Menu size={20} strokeWidth={2} />
          ) : isSidebarCollapsed ? (
            <ChevronRight size={20} strokeWidth={2} />
          ) : (
            <ChevronLeft size={20} strokeWidth={2} />
          )}
        </button>

        {/* Brand - Visible on mobile or when sidebar is collapsed */}
        {(isMobile || isSidebarCollapsed) && (
          <div 
            className="topbar-brand" 
            onClick={handleBrandClick} 
            role="button" 
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleBrandClick()}
          >
            <div className="topbar-logo">
              <img src={logo} alt="Logo" className="topbar-logo-img" />
            </div>
            {isMobile && <span className="topbar-brand-name">{t("admin.panel")}</span>}
          </div>
        )}
      </div>

      {/* Right section - Actions */}
      <div className="topbar-right">
        <div className="action-group">
          <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} t={t} />
          <LanguageToggle
            language={language}
            isLanguageSwitching={isLanguageSwitching}
            onLanguageSwitch={onLanguageSwitch}
            t={t}
          />
        </div>

        <div className="divider-vertical" aria-hidden="true" />

        {/* User Profile - Dynamic Data */}
        <div className="user-profile-dropdown" role="button" tabIndex={0}>
          {!isMobile && (
            <div className="user-info">
              <span className="user-name">{user?.name || t('admin.administrator')}</span>
              <span className="user-role">{user?.role || t('admin.role')}</span>
            </div>
          )}
          <div className="user-avatar">
            <img 
              src={user?.profileImage || logo} 
              alt={user?.name || 'Admin'} 
              onError={(e) => { e.target.src = logo; }}
              className="user-avatar-img"
            />
          </div>
          <ChevronDown size={16} strokeWidth={2} className="dropdown-icon" />
        </div>
      </div>
    </header>
  );
};

export default memo(Topbar);
