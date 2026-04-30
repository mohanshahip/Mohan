import React from 'react';
import { 
  Eye, EyeOff, Edit, Trash2, Star, StarOff, ExternalLink, FolderOpen
} from 'lucide-react';
import { getFullImageUrl } from '../../../utils/imageUtils';

const ProjectCard = ({ 
  project, 
  t, 
  navigate, 
  handleEditClick, 
  onDelete, 
  toggleFeatured,
  isSelected,
  onSelect,
  formatDate,
  getStatusName,
  getCategoryName
}) => {
  const primaryImage = project.images?.find(img => img && img.isPrimary) || project.images?.[0];
  
  return (
    <div 
      className={`admin-project-card-proper ${isSelected ? 'selected' : ''}`}
    >
      {/* Top indicator bar */}
      <div className="project-card-accent-bar" />
      
      <div className="project-card-header-proper">
        <div className="project-card-selection">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onSelect(project._id)}
            className="project-card-checkbox"
          />
        </div>
        
        <div className="project-card-image-wrapper">
          {primaryImage ? (
            <img 
              src={getFullImageUrl(primaryImage.url)} 
              alt={project.title} 
              className="project-card-image" 
              loading="lazy"
            />
          ) : (
            <div className="project-card-no-image">
              <FolderOpen size={32} />
            </div>
          )}
          <div className="project-card-badges-overlay">
            <span className={`admin-badge ${project.status === 'completed' ? 'admin-badge--success' : project.status === 'in-progress' ? 'admin-badge--info' : 'admin-badge--warning'}`}>
              {getStatusName(project.status)}
            </span>
            <span className={`admin-badge ${project.isPublished ? 'admin-badge--success' : 'admin-badge--warning'}`}>
              {project.isPublished ? t('projects.published') : t('projects.draft')}
            </span>
          </div>
        </div>
      </div>

      <div className="project-card-content">
        <div className="u-flex u-items-center u-justify-between u-mb-sm">
          <h3 className="project-card-title">{project.title}</h3>
          {project.isFeatured && (
            <Star size={18} className="project-card-featured-icon" fill="currentColor" />
          )}
        </div>

        <div className="project-card-category-badge">
          <span>{getCategoryName(project.category)}</span>
        </div>

        <p className="project-card-description">
          {project.description?.substring(0, 90)}
          {project.description && project.description.length > 90 ? '...' : ''}
        </p>

        <div className="project-card-tech-stack">
          {project.techStack?.slice(0, 3).map((tech, i) => (
            <span key={i} className="admin-badge admin-badge--secondary u-text-xs">{tech}</span>
          ))}
          {project.techStack?.length > 3 && <span className="u-text-xs u-text-muted">+{project.techStack.length - 3}</span>}
        </div>

        <div className="project-card-meta">
          <div className="project-card-meta-item">
            <span className="u-text-xs u-text-muted">ID: {project._id.substring(0, 8)}...</span>
          </div>
          <div className="project-card-meta-item">
            <span className="u-text-xs u-text-muted">{formatDate(project.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="project-card-actions-bottom">
        <button 
          className="project-card-action-btn view"
          onClick={() => window.open(`/projects/${project._id}`, '_blank')}
          title={t('common.view')}
        >
          <ExternalLink size={16} />
          <span>{t('common.view')}</span>
        </button>
        
        <div className="project-card-actions-group">
          <button 
            className="project-card-action-btn edit"
            onClick={() => handleEditClick(project)}
            title={t('common.edit')}
          >
            <Edit size={16} />
          </button>
          <button 
            className={`project-card-action-btn feature ${project.isFeatured ? 'active' : ''}`}
            onClick={() => toggleFeatured(project._id, project.isFeatured)}
            title={project.isFeatured ? t('common.unfeature') : t('common.feature')}
          >
            {project.isFeatured ? <StarOff size={16} /> : <Star size={16} />}
          </button>
          <button 
            className="project-card-action-btn delete"
            onClick={() => onDelete(project._id)}
            title={t('common.delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
