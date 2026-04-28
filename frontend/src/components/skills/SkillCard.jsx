import React from 'react';
import { Code, Star, Calendar, Zap } from 'lucide-react';

/**
 * SkillCard Component
 * Displays individual skill info in grid or list view.
 */
const SkillCard = ({ skill, onClick, t, getProficiencyLabel }) => {
  const accentColor = skill.color || 'var(--primary-color)';
  
  const getTierClass = (p) => {
    if (p >= 90) return 'tier-expert';
    if (p >= 75) return 'tier-advanced';
    if (p >= 50) return 'tier-intermediate';
    return 'tier-beginner';
  };

  return (
    <div
      className="skill-item-box group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={skill.name}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
    >
      <div className="card-body p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="skill-icon-container">
            <div className="skill-icon-bg-blob" style={{ backgroundColor: accentColor }} />
            <div 
              className="skill-icon-circle" 
              style={{ 
                '--accent-color': accentColor,
                '--accent-bg': `${accentColor}12`,
                '--accent-border': `${accentColor}20`
              }}
            >
              {skill.iconType === 'emoji' ? <span>{skill.icon}</span> : <Code size={26} />}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`tier-tag ${getTierClass(skill.proficiency)}`}>
              {getProficiencyLabel(skill.proficiency)}
            </span>
            {skill.isFeatured && (
              <div className="flex items-center gap-1 text-[10px] font-black text-accent uppercase tracking-tighter">
                <Star size={10} fill="currentColor" />
                <span>{t('skills.featured')}</span>
              </div>
            )}
          </div>
        </div>

        <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{skill.name}</h4>
        <p className="text-sm text-secondary mb-8 line-clamp-2 leading-relaxed h-10">{skill.description}</p>
        
        <div className="mt-auto pt-4 border-t border-light/50">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
              {t('skills.proficiency')}
            </span>
            <span className="text-sm font-black" style={{ color: accentColor }}>
              {skill.proficiency}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-background-alt overflow-hidden border border-light/10">
            <div 
              className="h-full transition-all duration-1000 ease-out" 
              style={{ 
                width: `${skill.proficiency}%`, 
                backgroundColor: accentColor,
                '--glow-color': `${accentColor}30`
              }} 
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-background-alt/50 flex justify-between items-center mt-auto border-t border-light/30">
        <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
          <Calendar size={14} className="text-primary/60" /> 
          {skill.yearsOfExperience} {t('skills.years')}
        </span>
        <div className="flex gap-1.5">
          {skill.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded bg-surface border border-light text-[9px] font-black uppercase text-secondary">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
