import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Eye, EyeOff, Edit, Trash2, MapPin, Calendar, Image as ImageIcon
} from 'lucide-react';
import { getFullImageUrl } from '../../../utils/imageUtils';

const GalleryCard = ({ 
  gallery, 
  navigate, 
  handleDelete, 
  handleTogglePublish,
  isSelected,
  onSelect
}) => {
  const { t, i18n } = useTranslation();
  const primaryImage = gallery.images?.find(img => img && img.isPrimary) || gallery.images?.[0];
  const categoryLabel = t(`gallery.categories.${gallery.category}`);
  const formattedDate = new Date(gallery.date).toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      className={`admin-gallery-card-proper ${isSelected ? 'selected' : ''}`}
    >
      {/* Top indicator bar */}
      <div className="gallery-card-accent-bar" />
      
      <div className="gallery-card-image-wrapper">
        {primaryImage ? (
          <img 
            src={getFullImageUrl(primaryImage.url)} 
            alt={gallery.title} 
            className="gallery-card-image" 
            loading="lazy"
          />
        ) : (
          <div className="gallery-card-no-image">
            <ImageIcon size={32} />
            <span>{t('gallery.noImage')}</span>
          </div>
        )}
        
        <div className="gallery-card-selection-overlay">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onSelect(gallery._id)}
            className="gallery-card-checkbox"
          />
        </div>

        <div className="gallery-card-actions-overlay">
          <button
            className={`gallery-card-icon-btn ${gallery.isPublished ? 'published' : 'draft'}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePublish(gallery._id, gallery.isPublished);
            }}
            title={gallery.isPublished ? t('common.unpublish') : t('common.publish')}
          >
            {gallery.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>

      <div className="gallery-card-content">
        <h3 className="gallery-card-title" title={gallery.title}>{gallery.title}</h3>
        <div className="gallery-card-category-badge">
          <span>{categoryLabel}</span>
        </div>

        <p className="gallery-card-description">
          {gallery.description?.substring(0, 80)}
          {gallery.description && gallery.description.length > 80 ? '...' : ''}
        </p>

        <div className="gallery-card-meta">
          {gallery.location && (
            <div className="gallery-card-meta-item">
              <MapPin size={14} />
              <span>{gallery.location}</span>
            </div>
          )}
          <div className="gallery-card-meta-item">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="gallery-card-actions-bottom">
        <button 
          className="gallery-card-action-btn view"
          onClick={() => navigate(`/gallery/${gallery._id}`)}
          title={t('common.view')}
        >
          <Eye size={16} />
          <span>{t('common.view')}</span>
        </button>
        <button 
          className="gallery-card-action-btn edit"
          onClick={() => navigate(`/admin/gallery/edit/${gallery._id}`)}
          title={t('common.edit')}
        >
          <Edit size={16} />
        </button>
        <button 
          className="gallery-card-action-btn delete"
          onClick={() => handleDelete(gallery._id)}
          title={t('common.delete')}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default GalleryCard;
