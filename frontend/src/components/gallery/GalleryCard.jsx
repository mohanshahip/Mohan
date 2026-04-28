import React, { memo } from 'react';
import { Image, Layers, Maximize2, Star, ChevronRight } from 'lucide-react';

/**
 * Specialized Gallery Card Component
 * Provides a high-end portfolio look with a stacked photo effect.
 */
const GalleryCard = memo(({ gallery, onClick, t, formatDate }) => {
  const primaryImage = gallery.images?.find(img => img.isPrimary)?.url || gallery.images?.[0]?.url;
  const photoCount = gallery.images?.length || 0;

  return (
    <div
      className={`gallery-portfolio-card ${photoCount > 1 ? 'has-stack' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={gallery.title}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
    >
      <div className="gallery-card-visual">
        {photoCount > 1 && (
          <>
            <div className="gallery-stack-layer layer-1"></div>
            <div className="gallery-stack-layer layer-2"></div>
          </>
        )}
        
        <div className="gallery-image-container">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={gallery.title}
              className="gallery-main-img"
              loading="lazy"
              decoding="async"
              width={1200}
              height={800}
            />
          ) : (
            <div className="gallery-placeholder">
              <Image size={48} strokeWidth={1} />
            </div>
          )}
          
          <div className="gallery-card-badge">
            <span className="badge-category">{t(`gallery.categories.${gallery.category}`) || gallery.category}</span>
          </div>

          {photoCount > 1 && (
            <div className="gallery-count-badge">
              <Layers size={14} />
              <span>{photoCount}</span>
            </div>
          )}

          <div className="gallery-hover-overlay">
            <div className="hover-action">
              <Maximize2 size={24} />
              <span>{t('gallery.view-collection')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="gallery-card-info">
        <div className="info-header">
          <span className="info-date">{formatDate(gallery.date || gallery.createdAt)}</span>
          {gallery.isFeatured && (
            <div className="featured-badge-mini" title={t('common.featured')}>
              <Star size={12} fill="currentColor" />
            </div>
          )}
        </div>
        <h3 className="gallery-card-title">{gallery.title}</h3>
        <p className="gallery-card-excerpt">{gallery.description}</p>
        
        <div className="gallery-card-footer">
          <button className="gallery-explore-btn">
            {t('gallery.explore')} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default GalleryCard;
