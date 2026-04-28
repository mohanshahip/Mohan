import React from 'react';
import { 
  Star, Edit2, Trash2, Eye, Calendar, Award
} from 'lucide-react';

const SkillCard = ({ 
  skill, 
  categories, 
  t, 
  navigate, 
  handleToggleFeatured, 
  handleDelete, 
  isSelected, 
  onSelect,
  SkillIcon
}) => {
  const category = categories.find(c => c.value === skill.category);
  
  return (
    <div 
      className={`admin-skill-card-proper ${isSelected ? 'selected' : ''}`}
      style={{ '--skill-color': skill.color || '#6366f1' }}
    >
      {/* Top indicator bar */}
      <div className="skill-card-accent-bar" />
      
      <div className="skill-card-header-proper">
        <div className="skill-card-selection">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onSelect(skill._id)}
            className="skill-card-checkbox"
          />
        </div>
        
        <div className="skill-card-icon-wrapper" style={{ 
          background: `color-mix(in srgb, ${skill.color} 12%, transparent)`,
          color: skill.color 
        }}>
          <SkillIcon iconName={skill.icon} size={24} />
        </div>
        
        <div className="skill-card-featured-toggle">
          <button
            className={`skill-card-icon-btn ${skill.isFeatured ? 'featured' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFeatured(skill._id);
            }}
            title={skill.isFeatured ? t('common.unfeature') : t('common.feature')}
          >
            <Star size={18} fill={skill.isFeatured ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="skill-card-content">
        <div className="skill-card-info">
          <h3 className="skill-card-name">{skill.name}</h3>
          <div className="skill-card-category-badge">
            {category?.icon}
            <span>{category?.label || skill.category}</span>
          </div>
        </div>

        <div className="skill-card-metrics-proper">
          <div className="skill-card-metric-item">
            <div className="skill-card-metric-label">
              <span>{t('skills.proficiency')}</span>
              <span className="skill-card-metric-value">{skill.proficiency}%</span>
            </div>
            <div className="skill-card-progress-container">
              <div 
                className="skill-card-progress-fill" 
                style={{ 
                  width: `${skill.proficiency}%`,
                  backgroundColor: skill.color 
                }} 
              />
            </div>
          </div>
          
          <div className="skill-card-experience-badge">
            <Calendar size={14} />
            <span>{skill.yearsOfExperience} {t('skills.years')}</span>
          </div>
        </div>

        {skill.description && (
          <p className="skill-card-description-proper">
            {skill.description.substring(0, 90)}
            {skill.description.length > 90 ? '...' : ''}
          </p>
        )}
      </div>

      <div className="skill-card-actions-proper">
        <button 
          className="skill-card-action-btn view"
          onClick={() => window.open(`/skills/${skill.slug}`, '_blank')}
          title={t('common.view')}
        >
          <Eye size={16} />
          <span>{t('common.view')}</span>
        </button>
        
        <div className="skill-card-actions-group">
          <button 
            className="skill-card-action-btn edit"
            onClick={() => navigate(`/admin/skills/edit/${skill._id}`)}
            title={t('common.edit')}
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="skill-card-action-btn delete"
            onClick={() => handleDelete(skill._id)}
            title={t('common.delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
