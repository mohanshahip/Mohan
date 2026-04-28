// components/common/Skeleton.jsx
import React from 'react';
import '../../styles/Skeleton.css';

const Skeleton = ({ width, height, borderRadius, className = '', variant = 'rect' }) => {
  return (
    <div 
      className={`skeleton-base skeleton-animate ${variant} ${className}`} 
      style={{
        '--skeleton-width': width || '100%',
        '--skeleton-height': height || '20px',
        '--skeleton-radius': borderRadius || (variant === 'circle' ? '50%' : 'var(--radius-md)')
      }}
    />
  );
};

export default Skeleton;
