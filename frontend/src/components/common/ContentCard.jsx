import React from 'react';
import { ExternalLink, Eye, Heart, Calendar, Tag, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ContentCard = ({
  image,
  title,
  description,
  category,
  date,
  tags = [],
  stats = {},
  onClick,
  onAction,
  actionIcon: ActionIcon = ExternalLink,
  badgeIcon: BadgeIcon = Tag,
  footerExtra,
}) => {
  const { t } = useTranslation();

  return (
    <article
      className={`content-card-pro ${stats.photos > 1 ? 'is-stack' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
    >
      <div className="card-image-wrapper">
        {stats.photos > 1 && (
          <div className="stack-layers">
            <div className="stack-layer stack-layer-1"></div>
            <div className="stack-layer stack-layer-2"></div>
          </div>
        )}
        
        <div className="card-image-container">
          {image ? (
            <img
              src={image}
              alt={title}
              className="card-image"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="card-image-placeholder">
              <BadgeIcon size={40} strokeWidth={1.5} />
            </div>
          )}
          
          <div className="card-badges-top">
            {category && (
              <div className="card-badge category">
                <BadgeIcon size={12} />
                <span>{category}</span>
              </div>
            )}
            {stats.photos > 1 && (
              <div className="card-badge photos">
                <Image size={12} />
                <span>{stats.photos}</span>
              </div>
            )}
          </div>

          <div className="card-overlay">
            <button
              className="card-action-btn"
              onClick={(e) => { e.stopPropagation(); onAction && onAction(); }}
              aria-label={t('projects.details')}
            >
              <ActionIcon size={18} />
              <span>{t('projects.details')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="card-meta">
          {date && (
            <div className="meta-item">
              <Calendar size={12} />
              <span>{date}</span>
            </div>
          )}
          <div className="meta-stats">
            {stats.views !== undefined && (
              <div className="meta-item" title={t('dashboard.views')}>
                <Eye size={12} />
                <span>{stats.views}</span>
              </div>
            )}
            {stats.likes !== undefined && (
              <div className="meta-item" title={t('dashboard.likes')}>
                <Heart size={12} />
                <span>{stats.likes}</span>
              </div>
            )}
          </div>
        </div>

        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>

        {tags.length > 0 && (
          <div className="card-tags">
            {tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
            {tags.length > 2 && <span className="tag-more">+{tags.length - 2}</span>}
          </div>
        )}
      </div>

      <div className="card-footer-pro">
        {footerExtra ? footerExtra : (
          onAction ? (
            <button
              className="card-explore-link"
              onClick={(e) => { e.stopPropagation(); onAction && onAction(); }}
            >
              {t('projects.explore')}
              <ExternalLink size={14} />
            </button>
          ) : null
        )}
      </div>
    </article>
  );
};

export default ContentCard;
