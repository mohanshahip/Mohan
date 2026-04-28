import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import '../../styles/ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger', // 'danger', 'warning', 'info', 'success'
  isLoading = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const displayTitle = title || t('common.confirm');
  const displayMessage = message || t('messages.delete-confirm');
  const displayConfirmText = confirmText || t('common.confirm');
  const displayCancelText = cancelText || t('common.cancel');

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getIcon = () => {
    const size = 32;
    switch (type) {
      case 'danger':
        return <div className="modal-icon-wrapper danger"><AlertTriangle size={size} /></div>;
      case 'warning':
        return <div className="modal-icon-wrapper warning"><AlertCircle size={size} /></div>;
      case 'success':
        return <div className="modal-icon-wrapper success"><CheckCircle size={size} /></div>;
      case 'info':
      default:
        return <div className="modal-icon-wrapper info"><Info size={size} /></div>;
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={isLoading}>
          <X size={20} />
        </button>

        <div className="modal-body">
          {getIcon()}

          <h3 className="modal-title">{displayTitle}</h3>
          <p className="modal-message">{displayMessage}</p>
        </div>

        <div className="modal-footer">
          <button
            className="btn-admin btn-admin--secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {displayCancelText}
          </button>
          <button
            className={`btn-admin btn-admin--${type === 'danger' ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="admin-spinner admin-spinner--sm" />
            ) : (
              displayConfirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;