import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const titleCase = (s) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const Breadcrumbs = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const parts = location.pathname.split('/').filter(Boolean);

  const isAdminPath = parts[0] === 'admin';
  const tailParts = isAdminPath ? parts.slice(1) : parts;

  const labelMap = {
    'dashboard': t('navigation.dashboard'),
    'poems': t('navigation.poems'),
    'projects': t('navigation.projects'),
    'gallery': t('navigation.gallery'),
    'skills': t('navigation.skills'),
    'hero': t('admin.hero-section'),
    'contact': t('navigation.contact'),
    'manage-admins': t('admin.manage-admins'),
    'settings': t('navigation.settings')
  };

  const idPattern = /^[a-f0-9]{24}$/i;
  const items = [];
  tailParts.forEach((part, idx) => {
    const pathBase = isAdminPath ? ['admin', ...tailParts.slice(0, idx + 1)] : tailParts.slice(0, idx + 1);
    const path = '/' + pathBase.join('/');
    let label = labelMap[part] || titleCase(part);
    // Hide raw ObjectId-looking segments; show a friendly label instead
    if (idPattern.test(part)) {
      // If previous segment is a known section (e.g., 'projects'), show "Details"
      label = t('projects.details');
    }
    items.push({ label, path, isId: idPattern.test(part) });
  });

  if (items.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label={t('navigation.main-navigation')}>
      <ol className="breadcrumbs-list">
        {isAdminPath && (
          <li>
            <Link to="/admin">{t('navigation.admin')}</Link>
          </li>
        )}
        {items.map((item, idx) => (
          <li key={item.path} className="breadcrumbs-seg">
            {idx < items.length - 1 ? (
              <Link to={item.path}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
