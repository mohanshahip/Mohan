/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TopLoadingBar from '../components/common/TopLoadingBar';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [isTopLoading, setIsTopLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [confirmState, setConfirmState] = useState({ open: false, options: null, resolver: null });

  const startLoading = useCallback((text, showTopBar = true) => {
    if (text) setLoadingText(text);
    if (showTopBar) setIsTopLoading(true);
    setLoadingCount((c) => c + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((c) => {
      const nextCount = c > 0 ? c - 1 : 0;
      if (nextCount === 0) setIsTopLoading(false);
      return nextCount;
    });
  }, []);

  const setTopLoading = useCallback((loading) => {
    setIsTopLoading(loading);
  }, []);

  const withLoading = useCallback(async (fn, text, showTopBar = true) => {
    startLoading(text, showTopBar);
    try {
      const res = await fn();
      return res;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({ open: true, options, resolver: resolve });
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState({ open: false, options: null, resolver: null });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolver) confirmState.resolver(true);
    closeConfirm();
  }, [confirmState, closeConfirm]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolver) confirmState.resolver(false);
    closeConfirm();
  }, [confirmState, closeConfirm]);

  const value = useMemo(() => ({
    isLoading: loadingCount > 0,
    isTopLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading,
    setTopLoading,
    confirm
  }), [loadingCount, isTopLoading, loadingText, startLoading, stopLoading, withLoading, setTopLoading, confirm]);

  return (
    <UIContext.Provider value={value}>
      <TopLoadingBar isLoading={isTopLoading || loadingCount > 0} />
      {children}
      {confirmState.open && confirmState.options && (
        <ConfirmationModal
          isOpen={confirmState.open}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          title={confirmState.options.title || 'Are you sure?'}
          message={confirmState.options.message || ''}
          confirmText={confirmState.options.confirmText || 'Confirm'}
          cancelText={confirmState.options.cancelText || 'Cancel'}
          type={confirmState.options.type || 'warning'}
        />
      )}
      {loadingCount > 0 && !confirmState.open && (
        <LoadingSpinner text={loadingText} fullPage />
      )}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};

export const useLoading = () => {
  const { isLoading, loadingText, startLoading, stopLoading, withLoading } = useUI();
  return { isLoading, loadingText, startLoading, stopLoading, withLoading };
};

export const useConfirm = () => {
  const { confirm } = useUI();
  return confirm;
};
