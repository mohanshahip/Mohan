import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import { useTranslation } from 'react-i18next';

const PageHeader = ({ title, subtitle, showBreadcrumbs = false, align = 'center', kicker, actions }) => {
  return (
    <header className={`page-header page-header-pro ${align === 'left' ? 'page-header-left' : 'page-header-center'}`}>
      {showBreadcrumbs && <Breadcrumbs />}
      {kicker && <div className="page-kicker">{kicker}</div>}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
};

export default PageHeader;
