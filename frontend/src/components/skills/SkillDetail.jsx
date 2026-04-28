import React from 'react';
import { 
  Info, Zap, Tag, Code, Target, Clock, BookOpen, ExternalLink 
} from 'lucide-react';

/**
 * Skill Detail View Component
 * Designed to be used inside a Modal for detailed skill insights.
 */
const SkillDetail = ({ selectedSkill, t, getProficiencyLabel }) => {
  if (!selectedSkill) return null;
  const accentColor = selectedSkill.color || 'var(--primary-color)';

  const getTierClass = (p) => {
    if (p >= 90) return 'tier-expert';
    if (p >= 75) return 'tier-advanced';
    if (p >= 50) return 'tier-intermediate';
    return 'tier-beginner';
  };

  return (
    <div className="skill-detail-modern p-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <section className="detail-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Info size={22} />
              </div>
              <h3 className="text-xl font-bold">{t('skills.about-skill')}</h3>
            </div>
            <p className="text-secondary leading-relaxed text-lg">
              {selectedSkill.description}
            </p>
          </section>

          <section className="detail-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                <Zap size={22} />
              </div>
              <h3 className="text-xl font-bold">{t('skills.proficiency-level')}</h3>
            </div>
            
            <div className="proficiency-showcase bg-background-alt p-8 rounded-3xl border border-light/50">
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col gap-1">
                  <span className={`tier-tag ${getTierClass(selectedSkill.proficiency)} w-fit`}>
                    {getProficiencyLabel(selectedSkill.proficiency)}
                  </span>
                  <span className="text-3xl font-black text-primary">
                    {selectedSkill.name}
                  </span>
                </div>
                <span className="text-4xl font-black opacity-20" style={{ color: accentColor }}>
                  {selectedSkill.proficiency}%
                </span>
              </div>
              
              <div className="h-4 bg-background rounded-full overflow-hidden border border-light/30 p-1">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ 
                    width: `${selectedSkill.proficiency}%`, 
                    backgroundColor: accentColor,
                    '--glow-color': `${accentColor}40`
                  }} 
                />
              </div>
              <p className="mt-6 text-sm text-muted font-medium italic bg-surface p-3 rounded-xl border border-light/30">
                <Target size={14} className="inline mr-2 text-primary" />
                {t('skills.proficiency-hint')}
              </p>
            </div>
          </section>

          {selectedSkill.tags?.length > 0 && (
            <section className="detail-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
                  <Tag size={22} />
                </div>
                <h3 className="text-xl font-bold">{t('skills.related-technologies')}</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedSkill.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 rounded-xl bg-background-alt border border-light text-sm font-bold text-secondary hover:border-primary hover:text-primary transition-all cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="metric-grid-modern bg-surface border border-light rounded-[2.5rem] p-8 shadow-xl">
            <h4 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-8 text-center">{t('skills.key-metrics')}</h4>
            
            <div className="space-y-5">
              <div className="metric-item-pro">
                <div className="metric-icon-box text-info">
                  <Code size={22} />
                </div>
                <div>
                  <div className="text-2xl font-black leading-none">{selectedSkill.metrics?.projectsCount || 0}</div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1.5">{t('skills.projects-completed')}</div>
                </div>
              </div>

              <div className="metric-item-pro">
                <div className="metric-icon-box text-success">
                  <Target size={22} />
                </div>
                <div>
                  <div className="text-2xl font-black leading-none">{selectedSkill.metrics?.satisfaction || 95}%</div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1.5">{t('skills.avg-satisfaction')}</div>
                </div>
              </div>

              <div className="metric-item-pro">
                <div className="metric-icon-box text-primary">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="text-2xl font-black leading-none">{t(`skills.${selectedSkill.metrics?.frequency || 'daily'}`)}</div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1.5">{t('skills.usage-frequency')}</div>
                </div>
              </div>
            </div>
          </div>

          {(selectedSkill.links?.documentation || selectedSkill.links?.officialWebsite) && (
            <div className="bg-background-alt p-8 rounded-[2.5rem] border border-light">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">{t('skills.learning-resources')}</h4>
              <div className="flex flex-col gap-3">
                {selectedSkill.links.documentation && (
                  <a href={selectedSkill.links.documentation} target="_blank" rel="noreferrer" className="resource-link-btn">
                    <BookOpen size={20} className="text-primary" /> 
                    <span>{t('skills.documentation')}</span>
                    <ExternalLink size={14} className="ml-auto opacity-30" />
                  </a>
                )}
                {selectedSkill.links.officialWebsite && (
                  <a href={selectedSkill.links.officialWebsite} target="_blank" rel="noreferrer" className="resource-link-btn">
                    <Zap size={20} className="text-secondary" /> 
                    <span>{t('skills.official-website')}</span>
                    <ExternalLink size={14} className="ml-auto opacity-30" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillDetail;
