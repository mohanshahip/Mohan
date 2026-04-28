import React from 'react';
import { Star, Tag } from 'lucide-react';
import ContentCard from '../common/ContentCard';

/**
 * ProjectCard Component
 * Extends ContentCard for project-specific logic.
 */
const ProjectCard = ({ project, onClick, onAction, getCategoryLabel }) => {
  return (
    <ContentCard
      key={project._id}
      image={project.images?.[0]?.url}
      title={project.title}
      description={project.description}
      category={getCategoryLabel(project.category)}
      stats={{ views: project.views, likes: project.likes }}
      tags={project.techStack}
      onAction={onAction}
      onClick={onClick}
      badgeIcon={project.isFeatured ? Star : Tag}
    />
  );
};

export default ProjectCard;
