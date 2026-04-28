import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer,
  onNext,
  onPrev,
  maxWidth = '1000px',
  hideHeader = false,
  padding,
  hideFooter = false
}) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [titleId] = useState(() => `modal-title-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight' && onNext) onNext();
        if (e.key === 'ArrowLeft' && onPrev) onPrev();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, onNext, onPrev]);

  useEffect(() => {
    if (!isOpen) return;
    const node = modalRef.current;
    if (!node) return;
    const focusable = node.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleTrap = (e) => {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    node.addEventListener('keydown', handleTrap);
    setTimeout(() => {
      (first || node).focus();
    }, 0);
    return () => node.removeEventListener('keydown', handleTrap);
  }, [isOpen]);

  if (!isOpen) return null;

  const getModalSizeClass = () => {
    if (maxWidth === '400px') return 'modal--sm';
    if (maxWidth === '600px') return 'modal--md';
    if (maxWidth === '800px') return 'modal--lg';
    if (maxWidth === '1000px') return 'modal--xl';
    if (maxWidth === '95vw') return 'modal--full';
    return '';
  };

  return (
    <div
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className={`modal-container ${getModalSizeClass()} ${hideHeader ? 'no-header' : ''}`}
        style={!getModalSizeClass() ? { '--modal-max-width': maxWidth } : {}}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {!hideHeader && (
          <header className="modal-header">
            <div className="modal-header-content">
              <h2 id={titleId} className="modal-title">{title}</h2>
              {subtitle && <div className="modal-subtitle">{subtitle}</div>}
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label={t('common.close')}>
              <X size={24} />
            </button>
          </header>
        )}

        <div className="modal-body" style={padding !== undefined ? { padding } : {}}>
          {children}
        </div>

        {!hideFooter && (footer || (onNext && onPrev)) && (
          <footer className="modal-footer">
            <div className="modal-footer-content">
              {footer}
            </div>
            {(onNext && onPrev) && (
              <div className="modal-navigation">
                <button className="btn-admin btn-admin--secondary btn-admin--icon" onClick={onPrev} aria-label={t('common.previous')}>
                  <ChevronLeft size={20} />
                </button>
                <button className="btn-admin btn-admin--secondary btn-admin--icon" onClick={onNext} aria-label={t('common.next')}>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
