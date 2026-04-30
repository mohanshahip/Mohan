import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  Code, Cpu, Database, Cloud, Smartphone, Palette, TestTube,
  Wrench, Users, Star, Calendar, Award, BookOpen, Target,
  Loader2, AlertCircle, BarChart3, Grid, List, Zap, Clock, Info,
  Search
} from 'lucide-react';

// Common Components
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import SearchAndFilter from '../../components/common/SearchAndFilter';

// Specialized Components
import SkillCard from '../../components/skills/SkillCard';
import SkillDetail from '../../components/skills/SkillDetail';

// Styles
import '../../styles/Skills.css';

const Skills = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: 'proficiency'
  });

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categoryIcons = {
    'frontend': <Code size={20} />,
    'backend': <Cpu size={20} />,
    'database': <Database size={20} />,
    'devops': <Cloud size={20} />,
    'mobile': <Smartphone size={20} />,
    'design': <Palette size={20} />,
    'testing': <TestTube size={20} />,
    'tools': <Wrench size={20} />,
    'soft-skills': <Users size={20} />,
    'other': <Code size={20} />
  };

  const categoryColors = {
    'frontend': '#6366f1',
    'backend': '#ec4899',
    'database': '#8b5cf6',
    'devops': '#06b6d4',
    'mobile': '#eab308',
    'design': '#f43f5e',
    'testing': '#3b82f6',
    'tools': '#64748b',
    'soft-skills': '#10b981',
    'other': '#94a3b8'
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        lang: i18n.language,
        sort: filters.sort,
        ...(filters.category && { category: filters.category })
      };

      // Fetch skills (always)
      const skillsPromise = api.get('/skills', { params });
      
      // Fetch categories only if not already loaded
      const catsPromise = categories.length === 0 
        ? api.get('/skills/categories', { params: { lang: i18n.language } })
        : Promise.resolve(null);
        
      // Fetch stats only if not already loaded
      const statsPromise = !stats
        ? api.get('/skills/stats', { params: { lang: i18n.language } })
        : Promise.resolve(null);

      const [skillsRes, catsRes, statsRes] = await Promise.all([
        skillsPromise,
        catsPromise,
        statsPromise
      ]);

      if (skillsRes.data?.success) {
        const skillsData = Array.isArray(skillsRes.data.data) ? skillsRes.data.data : [];
        setSkills(skillsData);
        setFilteredSkills(skillsData);
      }

      if (catsRes && catsRes.data?.success) {
        setCategories(Array.isArray(catsRes.data.data) ? catsRes.data.data : []);
      }

      if (statsRes && statsRes.data?.success) {
        setStats(statsRes.data.data || null);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || t('common.error-loading'));
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.sort, i18n.language, categories.length, stats, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let result = [...skills];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(s =>
        s.name?.toLowerCase().includes(searchLower) ||
        s.description?.toLowerCase().includes(searchLower) ||
        s.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    setFilteredSkills(result);
  }, [filters.search, skills]);

  const getProficiencyLabel = (p) => {
    if (p >= 90) return t('skills.expert');
    if (p >= 70) return t('skills.advanced');
    if (p >= 50) return t('skills.intermediate');
    return t('skills.beginner');
  };

  const getCategoryLabel = (cat) => {
    const map = {
      'frontend': t('skills.frontend'), 'backend': t('skills.backend'), 'database': t('skills.database'),
      'devops': t('skills.devops'), 'mobile': t('skills.mobile'), 'design': t('skills.design'),
      'testing': t('skills.testing'), 'tools': t('skills.tools'), 'soft-skills': t('skills.soft-skills'),
      'other': t('skills.other')
    };
    return map[cat] || cat;
  };

  const sortOptions = [
    { value: 'proficiency', label: t('skills.sort-by-proficiency') },
    { value: 'experience', label: t('skills.sort-by-experience') },
    { value: 'name', label: t('skills.sort-by-name') },
    { value: 'displayOrder', label: t('skills.sort-by-custom') }
  ];

  if (loading && skills.length === 0) {
    return (
      <div className="flex-center-col min-h-60vh">
        <Loader2 size={48} className="spinner" />
        <p className="text-secondary">{t('common.loading')}</p>
      </div>
    );
  }

  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    if (!skill.category) return acc;
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <main className="section-container skills-page">
      <PageHeader 
        title={t('skills.title')} 
        align="center"
      />

      <SearchAndFilter
        search={filters.search}
        onSearchChange={(value) => setFilters(p => ({ ...p, search: value }))}
        sortValue={filters.sort}
        onSortChange={(value) => setFilters(p => ({ ...p, sort: value }))}
        sortOptions={sortOptions}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      >
        <div className="filters-grid">
          <div className="filter-group">
            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-3 block">{t('common.category')}</label>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`btn btn-sm ${filters.category === '' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilters(p => ({ ...p, category: '' }))}
              >
                {t('common.all')}
              </button>
              {Array.isArray(categories) && categories.map(cat => (
                <button 
                  key={cat._id}
                  className={`btn btn-sm ${filters.category === cat._id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilters(p => ({ ...p, category: cat._id }))}
                >
                  {getCategoryLabel(cat._id)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SearchAndFilter>

      {Object.keys(skillsByCategory).length === 0 ? (
        <div className="flex-center-col py-20 bg-background-alt rounded-3xl border border-dashed border-light mb-16">
          <div className="p-6 bg-surface rounded-full shadow-sm">
            <Search size={48} className="text-muted opacity-20" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">{t('skills.empty')}</h3>
            <p className="text-secondary max-w-md mx-auto">{t('skills.empty-text')}</p>
          </div>
          <button 
            className="btn btn-primary px-8"
            onClick={() => setFilters({ category: '', search: '', sort: 'proficiency' })}
          >
            {t('skills.clear-filters')}
          </button>
        </div>
      ) : (
        <div className="skills-sections mb-16 flex flex-col gap-24">
          {Object.entries(skillsByCategory).map(([catId, catSkills]) => (
            <section key={catId} className="skill-category-group" id={`cat-${catId}`}>
              <div className={`category-header-styled category-${catId}`}>
                <div className="p-2 bg-surface rounded-lg shadow-sm">
                  {categoryIcons[catId] || <Code size={24} />}
                </div>
                <h3>{getCategoryLabel(catId)}</h3>
                <span className="count-badge ml-auto">{catSkills.length} {t('skills.total-other')}</span>
              </div>
              
              <div className="gallery-grid mt-8">
                {catSkills.map(skill => (
                  <SkillCard 
                    key={skill._id}
                    skill={skill}
                    onClick={() => setSelectedSkill(skill)}
                    t={t}
                    getProficiencyLabel={getProficiencyLabel}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
        title={selectedSkill?.name}
        subtitle={selectedSkill && (
          <div className="flex gap-3">
            <span className={`tag tag-category category-${selectedSkill.category}`}>
              {getCategoryLabel(selectedSkill.category)}
            </span>
            <span className="flex items-center gap-1 text-xs"><Calendar size={14}/> {selectedSkill.yearsOfExperience} {t('skills.years-experience')}</span>
          </div>
        )}
      >
        <SkillDetail
          selectedSkill={selectedSkill}
          t={t}
          getProficiencyLabel={getProficiencyLabel}
        />
      </Modal>
    </main>
  );
};

export default Skills;
