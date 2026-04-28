import React from 'react';
import { Info, CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';
import '../../styles/AdminCommon.css';

const AdminAlert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'warning': return <AlertCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      case 'info':
      default: return <Info size={20} />;
    }
  };

  return (
    <div className={`admin-alert admin-alert--${type} ${className}`} role="alert">
      <div className="admin-alert__icon">
        {getIcon()}
      </div>
      <div className="admin-alert__content">
        {title && <h4 className="admin-alert__title">{title}</h4>}
        <p className="admin-alert__message">{message}</p>
      </div>
      {onClose && (
        <button 
          className="admin-alert__close" 
          onClick={onClose}
          aria-label="Close alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default AdminAlert;
