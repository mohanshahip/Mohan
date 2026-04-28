// src/layouts/AdminLayout.jsx
// ✅ FINAL VERSION - WITH PROPER MOBILE SUPPORT

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import Topbar from "../components/common/Topbar";
import Sidebar from "../components/common/Sidebar";

import "../styles/AdminLayout.css";
import "../styles/AdminCommon.css";

/* ================================
   FORCE ADMIN LAYOUT ALWAYS LTR
================================ */
const enforceLTRLayout = () => {
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
};

/* ================================
   LANGUAGE MAP HELPERS
================================ */
const mapAdminLangToI18n = (adminLang) => {
  return adminLang === "ne" ? "np" : "en";
};

/**
 * Component to handle page transitions with nodeRef to avoid findDOMNode
 */
const PageTransition = ({ children, ...props }) => {
  const nodeRef = useRef(null);
  return (
    <CSSTransition {...props} nodeRef={nodeRef}>
      <div ref={nodeRef} className="page-transition-wrapper">
        {children}
      </div>
    </CSSTransition>
  );
};

function AdminLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const layoutRef = useRef(null);

  // State declarations
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    // Default to collapsed on screens < 1100px for better usability
    if (saved === null && window.innerWidth >= 768 && window.innerWidth < 1100) {
      return true;
    }
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLanguageSwitching, setIsLanguageSwitching] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("admin-language") || "en";
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return savedTheme ? savedTheme === "dark" : prefersDark;
  });
  const [deviceClass, setDeviceClass] = useState(() => {
    const width = window.innerWidth;
    if (width <= 576) return "smartphone";
    if (width <= 992) return "tablet";
    if (width <= 1200) return "laptop";
    return "desktop";
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992); // Sidebar behaves as mobile for tablet and smartphone

  // Effect hooks
  // Force LTR + body class
  useEffect(() => {
    document.body.classList.add("admin-layout-body");
    enforceLTRLayout();

    return () => {
      document.body.classList.remove("admin-layout-body");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Language Initialization Effect
  useEffect(() => {
    const i18nLang = mapAdminLangToI18n(currentLanguage);
    if (i18n.language !== i18nLang) {
      i18n.changeLanguage(i18nLang);
    }
    enforceLTRLayout();
  }, [currentLanguage, i18n]);

  // Theme effect
  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.body.classList.add("dark");
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.remove("dark");
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  // Save sidebar state
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem(
        "admin-sidebar-collapsed",
        JSON.stringify(isSidebarCollapsed)
      );
    }
  }, [isSidebarCollapsed, isMobile]);

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newDeviceClass = "desktop";
      if (width <= 576) newDeviceClass = "smartphone";
      else if (width <= 992) newDeviceClass = "tablet";
      else if (width <= 1200) newDeviceClass = "laptop";
      
      setDeviceClass(newDeviceClass);
      
      const mobile = width <= 992;
      setIsMobile(mobile);
      if (!mobile) setIsMobileSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mobile scroll lock
  useEffect(() => {
    if (isMobile && isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [isMobile, isMobileSidebarOpen]);

  // Toggle Sidebar
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  // Close mobile drawer
  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Toggle Theme
  const toggleTheme = useCallback(() => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.body.classList.add("dark");
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.remove("dark");
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  // Language Switch
  const handleLanguageSwitch = useCallback(() => {
    if (isLanguageSwitching) return;

    const newAdminLang = currentLanguage === "en" ? "ne" : "en";
    const newI18nLang = mapAdminLangToI18n(newAdminLang);

    setIsLanguageSwitching(true);

    localStorage.setItem("admin-language", newAdminLang);
    localStorage.setItem("preferred-language", newI18nLang);

    i18n.changeLanguage(newI18nLang).then(() => {
      setCurrentLanguage(newAdminLang);
      setIsLanguageSwitching(false);
      enforceLTRLayout();
    });
  }, [currentLanguage, isLanguageSwitching, i18n]);

  return (
    <div
      ref={layoutRef}
      className={`admin-layout 
        ${isMobile ? "mobile-view" : "desktop-view"}
        ${!isMobile && isSidebarCollapsed ? "sidebar-collapsed" : ""}
        ${isDarkMode ? "dark-theme" : ""}
        device-${deviceClass}
      `}
      dir="ltr"
      data-theme={isDarkMode ? "dark" : "light"}
    >
        {isLanguageSwitching && (
          <div className="admin-language-overlay visible">
            <div className="language-switch-loader">
              <div className="loader-spinner" />
              <span className="loader-text">{t('common.loading')}</span>
            </div>
          </div>
        )}

        <Sidebar
          collapsed={!isMobile && isSidebarCollapsed}
          toggleCollapse={toggleSidebar}
          isMobile={isMobile}
          isOpen={isMobileSidebarOpen}
          toggleSidebar={toggleSidebar}
          language={currentLanguage}
          languageLoading={isLanguageSwitching}
          darkMode={isDarkMode}
        />

        {isMobile && isMobileSidebarOpen && (
          <div
            className="sidebar-overlay visible"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />
        )}

        <div className="admin-content-layout">
          <Topbar
            isSidebarCollapsed={!isMobile && isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            language={currentLanguage}
            onLanguageSwitch={handleLanguageSwitch}
            isLanguageSwitching={isLanguageSwitching}
            darkMode={isDarkMode}
            toggleTheme={toggleTheme}
            isMobile={isMobile}
          />
          <div className="admin-content">
            <main className="main-content">
              <TransitionGroup component={null}>
                <PageTransition
                  key={location.pathname}
                  classNames="page-fade"
                  timeout={300}
                  unmountOnExit
                >
                  <Outlet />
                </PageTransition>
              </TransitionGroup>
            </main>
          </div>
        </div>
      </div>
  );
}

export default AdminLayout;
