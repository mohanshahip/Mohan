// context/ToastContext.jsx - FIXED VERSION
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';
import '../styles/Toast.css'; 

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    addToast, // Keep original for destructuring
    removeToast, // Keep original for destructuring
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    showToast: (msg, type, dur) => addToast(msg, type, dur) // For backward compatibility
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    const size = 20;
    switch (type) {
      case 'success':
        return <CheckCircle size={size} className="toast-icon" />;
      case 'error':
        return <AlertTriangle size={size} className="toast-icon" />;
      case 'warning':
        return <AlertCircle size={size} className="toast-icon" />;
      case 'info':
      default:
        return <Info size={size} className="toast-icon" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          <div className="toast-content">
            {getIcon(toast.type)}
            <span className="toast-message">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="toast-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};