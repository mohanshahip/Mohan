import React from 'react';
import { Star } from 'lucide-react';
import ContentCard from '../common/ContentCard';

/**
 * PoemCard Component
 * Extends ContentCard for poem-specific logic.
 */
const PoemCard = ({ poem, onClick, onAction, t }) => {
  return (
    <ContentCard
      key={poem._id}
      image={poem.imageUrl}
      title={poem.title}
      description={poem.excerpt}
      category={t(`poems.categories.${poem.category}`)}
      stats={{ views: poem.views, likes: poem.likes }}
      tags={poem.tags}
      onAction={onAction}
      onClick={onClick}
      badgeIcon={Star}
      actionLabel={t('poems.readMore')}
    />
  );
};

export default PoemCard;
