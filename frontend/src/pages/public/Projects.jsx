import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getFullImageUrl } from '../../utils/imageUtils';
import {
  ExternalLink, Github, Calendar, Tag,
  Code, Eye, Heart, Star, Filter, Search,
  Loader2, AlertCircle, Info, CheckCircle, Target, ArrowLeft
} from 'lucide-react';

// Common Components
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import ContentCard from '../../components/common/ContentCard';
import Modal from '../../components/common/Modal';
import SearchAndFilter from '../../components/common/SearchAndFilter';

// Specialized Components
import ProjectCard from '../../components/projects/ProjectCard';
import ProjectDetail from '../../components/projects/ProjectDetail';

// Styles
import "../../styles/Pages.css";
import "../../styles/Projects.css";

const Projects = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    sort: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({ lang: i18n.language });
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);

      const url = `${API_BASE_URL}/projects?${queryParams.toString()}`;
      const projectsRes = await fetch(url);
      if (!projectsRes.ok) throw new Error(t('projects.error-loading'));

      const projectsData = await projectsRes.json();
      const projectsList = projectsData.success ? projectsData.data : (Array.isArray(projectsData) ? projectsData : []);

      const projectsWithFullUrls = projectsList.map(project => ({
        ...project,
        images: (project.images || []).map(image => ({
          ...image,
          url: getFullImageUrl(image.url)
        }))
      }));

      setProjects(projectsWithFullUrls);

      // Fetch categories & stats
      const [categoriesRes, statsRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/projects/categories`),
        fetch(`${API_BASE_URL}/projects/stats`)
      ]);

      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
        const catData = await categoriesRes.value.json();
        if (catData.success) setCategories(catData.data);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const statsData = await statsRes.value.json();
        if (statsData.success) setStats(statsData.data);
      }

      setFilteredProjects(sortProjects(projectsWithFullUrls, filters.sort));
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.status, i18n.language, t, API_BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle single project ID from URL
  useEffect(() => {
    if (id && projects.length > 0) {
      const project = projects.find(p => p._id === id);
      if (project) setSelectedProject(project);
    }
  }, [id, projects]);

  // Search and Sort
  useEffect(() => {
    let result = [...projects];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower) ||
        p.techStack?.some(tech => tech.toLowerCase().includes(searchLower))
      );
    }
    setFilteredProjects(sortProjects(result, filters.sort));
  }, [filters.search, filters.sort, projects]);

  const sortProjects = (items, sortBy) => {
    const sorted = [...items];
    const sortMap = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      views: (a, b) => (b.views || 0) - (a.views || 0),
      likes: (a, b) => (b.likes || 0) - (a.likes || 0),
      'a-z': (a, b) => a.title.localeCompare(b.title),
      'z-a': (a, b) => b.title.localeCompare(a.title)
    };
    return sorted.sort(sortMap[sortBy] || sortMap.newest);
  };

  const handleLike = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/like`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProjects(prev => prev.map(p => p._id === projectId ? { ...p, likes: data.data.likes } : p));
        }
      }
    } catch (error) {
      console.error('Failed to like project:', error);
    }
  };

  const getCategoryLabel = (category) => {
    return t(`projects.categories.${category.toLowerCase()}`, category);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(i18n.language === 'np' ? 'ne-NP' : 'en-US', {
        year: 'numeric', month: 'short'
      });
    } catch (e) {
      return dateString;
    }
  };

  const sortOptions = [
    { value: 'newest', label: t('gallery.newest-first') },
    { value: 'oldest', label: t('gallery.oldest-first') },
    { value: 'views', label: t('projects.most-viewed') },
    { value: 'likes', label: t('projects.most-liked') },
    { value: 'a-z', label: t('projects.a-to-z') },
    { value: 'z-a', label: t('projects.z-to-a') }
  ];

  if (loading && projects.length === 0 && !id) {
    return (
      <div className="project-loading-container">
        <Loader2 size={48} className="spinner" />
        <p className="project-loading-text">{t('common.loading')}</p>
      </div>
    );
  }

  // Dedicated detail page when /projects/:id
  if (id) {
    const projectFromList = projects.find(p => p._id === id);
    const project = projectFromList || selectedProject;

    // Fallback: fetch single project if not found in list
    if (!project && !loading) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/projects/${id}?lang=${i18n.language}`);
          const data = await res.json();
          if (data?.success) {
            const p = {
              ...data.data,
              images: (data.data.images || []).map(image => ({
                ...image,
                url: image.url && !image.url.startsWith('http')
                  ? `${BACKEND_URL}${image.url}`
                  : image.url
              }))
            };
            setSelectedProject(p);
          }
        } catch (e) {
          console.error('Failed to load project', e);
        }
      })();
    }

    return (
      <main className="section-container detail-container">
        <div className="detail-header">
          <Link to="/projects" className="back-link group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t('projects.back-to-projects')}</span>
          </Link>
          <h1 className="detail-title">{project?.title || t('projects.title')}</h1>
        </div>

        {!project ? (
          <div className="flex-center-col min-h-40vh">
            <Loader2 size={32} className="spinner" />
            <p className="text-secondary">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="project-detail-page">
            <ProjectDetail
              selectedProject={project}
              activeImageIndex={activeImageIndex}
              setActiveImageIndex={setActiveImageIndex}
              t={t}
              getCategoryLabel={getCategoryLabel}
              formatDate={formatDate}
            />
          </div>
        )}
      </main>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="section-container flex-center-col min-h-60vh">
        <AlertCircle size={64} color="var(--error)" />
        <h2 className="mt-4">{t('gallery.error')}</h2>
        <p className="text-secondary">{error}</p>
        <button className="btn btn-primary mt-6" onClick={fetchData}>{t('common.retry')}</button>
      </div>
    );
  }

  return (
    <main className="section-container">
      <PageHeader 
        title={t('projects.title')} 
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
              {categories.map(cat => (
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

          <div className="filter-group">
            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-3 block">{t('projects.status')}</label>
            <div className="flex flex-wrap gap-2">
              {['', 'completed', 'in-progress', 'planned'].map(status => (
                <button 
                  key={status}
                  className={`btn btn-sm ${filters.status === status ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilters(p => ({ ...p, status }))}
                >
                  {status === '' ? t('common.all') : t(`projects.statuses.${status}`, status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SearchAndFilter>

      <div className="gallery-grid">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project._id}
            project={project}
            onClick={() => navigate(`/projects/${project._id}`)}
            onAction={() => navigate(`/projects/${project._id}`)}
            t={t}
            getCategoryLabel={getCategoryLabel}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-projects-state">
          <Info size={48} className="empty-projects-icon" />
          <p className="empty-state-text">{t('projects.empty')}</p>
        </div>
      )}

      {/* Details open in dedicated route /projects/:id */}
    </main>
  );
};

export default Projects;
