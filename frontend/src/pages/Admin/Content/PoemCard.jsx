import React from 'react';
import { 
  Eye, EyeOff, Edit, Trash2, Star, StarOff, User, BookOpen, Clock, Image as ImageIcon
} from 'lucide-react';
import { getFullImageUrl } from '../../../utils/imageUtils';

const PoemCard = ({ 
  poem, 
  t, 
  navigate, 
  handleEditClick, 
  onDelete, 
  togglePublish, 
  toggleFeatured,
  isSelected,
  onSelect,
  formatDate
}) => {
  const primaryImage = (poem.images && poem.images.length > 0) 
    ? (poem.images.find(img => img && img.isPrimary) || poem.images[0])
    : poem.featuredImage;

  return (
    <div 
      className={`admin-poem-card-proper ${isSelected ? 'selected' : ''}`}
    >
      {/* Top indicator bar */}
      <div className="poem-card-accent-bar" />
      
      <div className="poem-card-image-wrapper">
        {primaryImage ? (
          <img 
            src={getFullImageUrl(primaryImage.url)} 
            alt={poem.title} 
            className="poem-card-image" 
            loading="lazy"
          />
        ) : (
          <div className="poem-card-no-image">
            <ImageIcon size={32} />
            <span>{t('poems.noImage')}</span>
          </div>
        )}
        
        <div className="poem-card-selection-overlay">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onSelect(poem._id)}
            className="poem-card-checkbox"
          />
        </div>

        <div className="poem-card-actions-overlay">
          <button
            className={`poem-card-icon-btn ${poem.isPublished ? 'published' : 'draft'}`}
            onClick={(e) => {
              e.stopPropagation();
              togglePublish(poem._id, poem.isPublished);
            }}
            title={poem.isPublished ? t('common.unpublish') : t('common.publish')}
          >
            {poem.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button
            className={`poem-card-icon-btn ${poem.isFeatured ? 'featured' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFeatured(poem._id, poem.isFeatured);
            }}
            title={poem.isFeatured ? t('common.unfeature') : t('common.feature')}
          >
            {poem.isFeatured ? <Star size={18} fill="currentColor" /> : <Star size={18} />}
          </button>
        </div>
      </div>

      <div className="poem-card-content">
        <div className="poem-card-title-wrapper">
          <h3 className="poem-card-title" title={poem.title}>{poem.title}</h3>
        </div>

        <p className="poem-card-excerpt">
          {poem.excerpt?.substring(0, 80)}
          {poem.excerpt && poem.excerpt.length > 80 ? '...' : ''}
        </p>

        <div className="poem-card-meta">
          <div className="poem-card-meta-item">
            <User size={14} />
            <span>{poem.author}</span>
          </div>
          <div className="poem-card-meta-item">
            <BookOpen size={14} />
            <span>{t(`poems.categories.${poem.category}`)}</span>
          </div>
        </div>
      </div>

      <div className="poem-card-actions-bottom">
        <button 
          className="poem-card-action-btn edit"
          onClick={() => handleEditClick(poem)}
          title={t('common.edit')}
        >
          <Edit size={16} />
          <span>{t('common.edit')}</span>
        </button>
        <button 
          className="poem-card-action-btn delete"
          onClick={() => onDelete(poem._id)}
          title={t('common.delete')}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default PoemCard;
