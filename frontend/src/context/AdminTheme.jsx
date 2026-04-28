// AdminTheme.jsx - Complete theme and language management
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const AdminThemeContext = createContext();

// Custom hook for using the admin theme context
export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
};

export const AdminThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) return savedTheme === 'dark';
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { i18n, ready } = useTranslation();
  
  // Initialize theme on mount
  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Add class to body for better CSS targeting
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Helper function to update HTML attributes
  const updateHtmlAttributes = (lang) => {
    // Convert 'np' to 'ne' for consistency with AdminLayout
    const htmlLang = lang === 'np' ? 'ne' : lang;
    document.documentElement.setAttribute('lang', htmlLang);
    document.documentElement.setAttribute('dir', htmlLang === 'ne' ? 'rtl' : 'ltr');
  };

  // Initialize language when i18n is ready
  useEffect(() => {
    if (!ready) return;
    
    const savedLangRaw = localStorage.getItem('preferred-language') || 'en';
    const savedLang = savedLangRaw === 'ne' ? 'np' : savedLangRaw;
    const defaultLang = i18n.language || 'en';
    const langToUse = savedLang || defaultLang;
    
    // Ensure i18n is initialized with correct language
    if (i18n.language !== langToUse) {
      i18n.changeLanguage(langToUse);
    }
    
    // Update HTML attributes
    updateHtmlAttributes(langToUse);
  }, [ready, i18n]);

  // Helper function to handle loading state during language switch
  const handleLanguageSwitch = async (newLang) => {
    setIsLoading(true);
    document.documentElement.setAttribute('data-lang-switching', 'true');
    
    // Wait for language change and DOM update
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 100);
      });
    });
    
    // Wait a bit more for translations to load
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setIsLoading(false);
    document.documentElement.removeAttribute('data-lang-switching');
  };

  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    const theme = newDarkMode ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
    
    // Update body classes
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleLanguage = useCallback(async () => {
    if (isLoading || !ready) return;
    
    const currentLang = i18n.language || 'en';
    const newLang = currentLang === 'en' ? 'np' : 'en';
    
    // Handle loading state before changing language
    await handleLanguageSwitch(newLang);
    
    // Update i18n
    await i18n.changeLanguage(newLang);
    
    // Update localStorage
    localStorage.setItem('preferred-language', newLang);
    
    // Update HTML attributes
    updateHtmlAttributes(newLang);
  }, [isLoading, ready, i18n]);

  const changeLanguage = useCallback(async (lang) => {
    if (isLoading || !ready || !['en', 'np'].includes(lang)) return;
    
    // Handle loading state before changing language
    await handleLanguageSwitch(lang);
    
    // Update i18n
    await i18n.changeLanguage(lang);
    
    // Update localStorage
    localStorage.setItem('preferred-language', lang);
    
    // Update HTML attributes
    updateHtmlAttributes(lang);
  }, [isLoading, ready, i18n]);

  const setDarkModeWithPersist = useCallback((value) => {
    setDarkMode(value);
    const theme = value ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
    
    if (value) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Get the language in the format AdminLayout expects
  const getLayoutLanguage = useCallback(() => {
    const currentLang = i18n.language || 'en';
    return currentLang === 'np' ? 'ne' : currentLang;
  }, [i18n.language]);

  const contextValue = {
    darkMode,
    language: getLayoutLanguage(), // Return 'ne' for Nepali instead of 'np'
    isLoading,
    isLanguageSwitching: isLoading,
    i18nReady: ready,
    
    // Theme methods
    toggleDarkMode,
    setDarkMode: setDarkModeWithPersist,
    
    // Language methods
    toggleLanguage,
    changeLanguage,
    setLanguage: changeLanguage,
    
    // Convenience methods
    isDark: darkMode,
    isLight: !darkMode,
    currentLanguage: i18n.language
  };

  return (
    <AdminThemeContext.Provider value={contextValue}>
      {children}
    </AdminThemeContext.Provider>
  );
};
