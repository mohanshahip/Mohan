import React from 'react';
import { ArrowLeft } from 'lucide-react';
import '../../styles/AdminPageLayout.css';

const AdminPageLayout = ({ icon, title, subtitle, actions, children, showBack = false, onBack, narrow = false }) => {
  return (
    <div className={`admin-page ${narrow ? 'admin-page--narrow' : ''}`}>
      <header className="admin-page__header">
        <div className="admin-page__header-container">
          <div className="admin-page__title-group">
            {showBack && (
              <button 
                className="admin-page__back-btn" 
                onClick={onBack}
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            {icon && <div className="admin-page__icon" aria-hidden="true">{icon}</div>}
            <div className="admin-page__text">
              <h1 className="admin-page__title">{title}</h1>
              {subtitle && <p className="admin-page__subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="admin-page__actions">{actions}</div>}
        </div>
      </header>
      <main className="admin-page__content">
        {children}
      </main>
    </div>
  );
};

export default AdminPageLayout;
