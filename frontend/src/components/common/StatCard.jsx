import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import '../../styles/StatCard.css';

const StatCard = ({ title, label, value, icon: Icon, trend, description, color, small }) => {
  const { i18n } = useTranslation();
  
  // Handle label/title compatibility
  const displayTitle = title || label;
  
  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    if (!num && num !== 0) return '0';
    
    const locale = i18n.language === 'np' ? 'ne-NP' : 'en-US';
    
    if (num >= 1000000) {
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(num / 1000000) + 'M';
    }
    if (num >= 1000) {
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(num / 1000) + 'K';
    }
    return new Intl.NumberFormat(locale).format(num);
  };

  return (
    <div 
      className={`admin-card admin-card--interactive stat-card-new ${small ? 'small' : ''}`} 
      style={{ '--stat-color': color }}
      role="region"
      aria-label={`${displayTitle} statistics`}
    >
      <div className="stat-card-inner">
        <div className="stat-card-header">
          <div className="admin-card__icon" aria-hidden="true">
            <Icon size={small ? 20 : 24} strokeWidth={2} />
          </div>
          {trend && (
            <div 
              className={`stat-trend ${trend.up ? 'up' : 'down'}`}
              title={trend.up ? 'Increasing' : 'Decreasing'}
            >
              {trend.up ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        
        <div className="stat-card-body">
          <span className="stat-card-title">{displayTitle}</span>
          <h3 className="stat-card-value">
            {typeof value === 'number' ? formatNumber(value) : value}
          </h3>
          {description && <p className="stat-card-desc">{description}</p>}
        </div>
      </div>
      <div className="stat-card-glow" aria-hidden="true"></div>
    </div>
  );
};

export default StatCard;
