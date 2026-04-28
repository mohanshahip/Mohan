// components/ErrorBoundary.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function ErrorBoundaryWrapper({ children }) {
  const { t } = useTranslation();
  return <ErrorBoundary t={t}>{children}</ErrorBoundary>;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>{t('common.error')}</h2>
          <p>{t('messages.load-failed')}</p>
          <button onClick={() => window.location.reload()}>
            {t('common.refresh')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;