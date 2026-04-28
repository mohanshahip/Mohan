// useLanguage.js
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [isLanguageSwitching, setIsLanguageSwitching] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  const toggleLanguage = useCallback(async () => {
    if (isLanguageSwitching) return;
    
    setIsLanguageSwitching(true);
    
    // Prevent layout shifts
    document.body.classList.add('language-switching-active');
    
    // Store current dimensions
    const topbar = document.querySelector('.topbar');
    const navbar = document.querySelector('.navbar');
    if (topbar) topbar.style.minHeight = `${topbar.offsetHeight}px`;
    if (navbar) navbar.style.minHeight = `${navbar.offsetHeight}px`;
    
    // Switch language
    const newLang = currentLang === 'en' ? 'np' : 'en'; // store i18n code directly
    const i18nLang = newLang;
    
    await i18n.changeLanguage(i18nLang);
    
    // Update DOM
    const htmlLang = newLang === 'np' ? 'ne' : newLang;
    document.documentElement.setAttribute('lang', htmlLang);
    document.documentElement.setAttribute('dir', 'ltr'); // Force LTR for all languages as Nepali is LTR
    
    // Store preference
    localStorage.setItem('preferred-language', newLang);
    localStorage.setItem('backend-language', htmlLang);
    
    // Cleanup
    setTimeout(() => {
      if (topbar) topbar.style.minHeight = '';
      if (navbar) navbar.style.minHeight = '';
      document.body.classList.remove('language-switching-active');
      setIsLanguageSwitching(false);
      setCurrentLang(newLang);
    }, 100);
    
  }, [isLanguageSwitching, currentLang, i18n]);

  return {
    currentLang,
    isLanguageSwitching,
    toggleLanguage
  };
};
