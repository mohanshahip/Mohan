import React from 'react';
import { 
  Info, CheckCircle, Target, Code, ExternalLink, Github 
} from 'lucide-react';

/**
 * Project Detail View Component
 * Designed to be used inside a Modal for detailed project information.
 */
const ProjectDetail = ({ 
  selectedProject, 
  activeImageIndex, 
  setActiveImageIndex, 
  t, 
  getCategoryLabel, 
  formatDate 
}) => {
  if (!selectedProject) return null;

  return (
    <div className="project-detail-layout">
      <div className="project-visuals">
        <div className="main-image-box">
          <img 
            src={selectedProject.images?.[activeImageIndex]?.url || selectedProject.images?.[0]?.url} 
            alt={selectedProject.title}
            width={1200}
            height={800}
            loading="eager"
            decoding="async"
          />
        </div>
        {selectedProject.images?.length > 1 && (
          <div className="thumbnail-strip">
            {selectedProject.images.map((img, i) => (
              <img 
                key={i} 
                src={img.url}
                alt={`${selectedProject.title} ${i+1}`}
                width={200}
                height={200}
                className={activeImageIndex === i ? 'active' : ''} 
                onClick={() => setActiveImageIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="project-info">
        <section className="detail-section">
          <h3><Info size={18} /> {t('projects.overview')}</h3>
          <div className="project-meta-grid">
            {selectedProject.client && (
              <div className="meta-item">
                <span className="meta-label">{t('projects.client')}:</span>
                <span className="meta-value">{selectedProject.client}</span>
              </div>
            )}
            {selectedProject.role && (
              <div className="meta-item">
                <span className="meta-label">{t('projects.role')}:</span>
                <span className="meta-value">{selectedProject.role}</span>
              </div>
            )}
            {(selectedProject.startDate || selectedProject.endDate) && (
              <div className="meta-item">
                <span className="meta-label">{t('projects.duration')}:</span>
                <span className="meta-value">
                  {formatDate(selectedProject.startDate)} 
                  {selectedProject.endDate ? ` - ${formatDate(selectedProject.endDate)}` : ` - ${t('projects.statuses.in-progress')}`}
                </span>
              </div>
            )}
          </div>
          <p className="mt-4">{selectedProject.detailedDescription || selectedProject.description}</p>
        </section>

        {selectedProject.features?.length > 0 && (
          <section className="detail-section">
            <h3><CheckCircle size={18} /> {t('projects.key-features')}</h3>
            <ul className="features-list">
              {selectedProject.features.map((f, i) => (
                <li key={i}><Target size={14} /> {f}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="detail-section">
          <h3><Code size={18} /> {t('projects.tech-stack')}</h3>
          <div className="flex flex-wrap gap-2">
            {selectedProject.techStack?.map((tech, i) => (
              <span key={i} className="tag">{tech}</span>
            ))}
          </div>
        </section>

        <div className="flex gap-4 mt-8">
          {selectedProject.liveUrl && (
            <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              <ExternalLink size={18} /> {t('projects.live-demo')}
            </a>
          )}
          {selectedProject.githubUrl && (
            <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <Github size={18} /> {t('projects.github')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
