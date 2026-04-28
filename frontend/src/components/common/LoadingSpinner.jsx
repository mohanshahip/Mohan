import React from 'react';
import '../../styles/AdminCommon.css';

const LoadingSpinner = ({ 
  text = 'Loading...', 
  fullPage = false,
  className = ''
}) => {
  const spinner = (
    <div className={`admin-loading-content ${className}`}>
      <div className="admin-spinner">
        <div className="admin-spinner__ring"></div>
        <div className="admin-spinner__inner"></div>
      </div>
      {text && <div className="admin-loading-text">{text}</div>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="admin-loading-overlay">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
