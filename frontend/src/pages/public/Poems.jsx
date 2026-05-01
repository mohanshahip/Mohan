import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { getFullImageUrl } from '../../utils/imageUtils';
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Search, BookOpen, Clock, Heart, Eye,
  Calendar, Tag, User, ArrowLeft, Loader2,
  Filter, Leaf, Sparkles, MessageSquare, History,
  Sunrise, Users, Smile
} from "lucide-react";

// Common Components
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import ContentCard from "../../components/common/ContentCard";
import Modal from "../../components/common/Modal";
import SearchAndFilter from "../../components/common/SearchAndFilter";

// Specialized Components
import PoemCard from "../../components/poems/PoemCard";
import PoemDetail from "../../components/poems/PoemDetail";

// Styles
import "../../styles/Pages.css";
import "../../styles/Poems.css";

const Poems = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const shareMenuRef = useRef(null);
  
  const [poems, setPoems] = useState([]);
  const [currentPoem, setCurrentPoem] = useState(null);
  const [featuredPoems, setFeaturedPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [likedPoems, setLikedPoems] = useState(new Set());
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  
  const language = i18n.language || "en";
  const isSinglePoem = !!id;

  // Categories for filtering
  const poemCategories = [
    { id: "love", label: t("poems.categories.love"), icon: Heart },
    { id: "nature", label: t("poems.categories.nature"), icon: Leaf },
    { id: "inspirational", label: t("poems.categories.inspirational"), icon: Sparkles },
    { id: "philosophical", label: t("poems.categories.philosophical"), icon: MessageSquare },
    { id: "nostalgic", label: t("poems.categories.nostalgic"), icon: History },
    { id: "spiritual", label: t("poems.categories.spiritual"), icon: Sunrise },
    { id: "social", label: t("poems.categories.social"), icon: Users },
    { id: "humorous", label: t("poems.categories.humorous"), icon: Smile },
    { id: "other", label: t("poems.categories.other"), icon: Tag }
  ];

  // Fetch poems
  const fetchPoems = useCallback(async (pageNum = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);
      
      const params = {
        lang: language,
        page: pageNum,
        limit: 12,
        sort: sortBy
      };
      
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      
      const endpoint = searchQuery ? '/poems/search' : '/poems';
      const response = await api.get(endpoint, { params });

      if (response.data && response.data.success) {
        const data = response.data;
        const processedPoems = (data.data || []).map(poem => {
          let imageUrl = null;
          if (poem.images && poem.images.length > 0) {
            const primaryImage = poem.images.find(img => img.isPrimary) || poem.images[0];
            imageUrl = getFullImageUrl(primaryImage.url);
          } else if (poem.featuredImage) {
            imageUrl = getFullImageUrl(poem.featuredImage.url || poem.featuredImage);
          }
          
          return {
            ...poem,
            imageUrl
          };
        });
        
        if (pageNum === 1) setPoems(processedPoems);
        else setPoems(prev => [...prev, ...processedPoems]);
        
        setHasMore(pageNum < (data.totalPages || 1));
      }
    } catch (error) {
      console.error("Error fetching poems:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [language, sortBy, searchQuery, selectedCategory]);

  // Fetch single poem
  const fetchSinglePoem = useCallback(async (poemId) => {
    try {
      const response = await api.get(`/poems/${poemId}`, {
        params: { lang: language, incrementViews: true }
      });
      if (response.data?.success) {
        const data = response.data.data;
        let imageUrl = null;
        if (data.images && data.images.length > 0) {
          const primaryImage = data.images.find(img => img.isPrimary) || data.images[0];
          imageUrl = getFullImageUrl(primaryImage.url);
        } else if (data.featuredImage) {
          imageUrl = getFullImageUrl(data.featuredImage.url || data.featuredImage);
        }
        
        setCurrentPoem({
          ...data,
          imageUrl
        });
      }
    } catch (error) {
      console.error("Error fetching poem:", error);
    }
  }, [language]);

  // Fetch featured & stats
  const fetchMetadata = useCallback(async () => {
    try {
      const [featRes] = await Promise.all([
        api.get('/poems/featured', { params: { lang: language, limit: 4 } })
      ]);
      
      const featData = featRes.data;
      
      if (featData?.success) {
        setFeaturedPoems(featData.data.map(p => {
          let imageUrl = null;
          if (p.images && p.images.length > 0) {
            const primaryImage = p.images.find(img => img.isPrimary) || p.images[0];
            imageUrl = getFullImageUrl(primaryImage.url);
          } else if (p.featuredImage) {
            imageUrl = getFullImageUrl(p.featuredImage.url || p.featuredImage);
          }
          return {
            ...p,
            imageUrl
          };
        }));
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  }, [language]);

  useEffect(() => {
    if (id) fetchSinglePoem(id);
    else {
      fetchPoems(1, false);
      fetchMetadata();
    }
  }, [id, fetchPoems, fetchMetadata, fetchSinglePoem]);

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPoems(nextPage, true);
  };

  // Handle like
  const handleLike = async (poemId) => {
    try {
      const response = await api.patch(`/poems/${poemId}/like`, {
        action: likedPoems.has(poemId) ? 'unlike' : 'like'
      });
      if (response.data?.success) {
        const data = response.data;
        setPoems(prev => prev.map(p => p._id === poemId ? { ...p, likes: data.data.likes } : p));
        setLikedPoems(prev => {
          const next = new Set(prev);
          if (next.has(poemId)) next.delete(poemId);
          else next.add(poemId);
          return next;
        });
      }
    } catch (error) {
      console.error("Error liking poem:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(language, { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  const sortOptions = [
    { value: 'newest', label: t('poems.sort-newest'), icon: Clock },
    { value: 'popular', label: t('poems.sort-popular'), icon: Sparkles },
    { value: 'likes', label: t('poems.sort-likes'), icon: Heart },
    { value: 'views', label: t('poems.sort-views'), icon: Eye },
    { value: 'title', label: t('poems.sort-title'), icon: Tag }
  ];

  if (loading && poems.length === 0 && !id) {
    return (
      <div className="poem-loading-container">
        <Loader2 size={48} className="animate-spin text-primary" />
        <span className="poem-loading-text">{t('common.loading')}</span>
      </div>
    );
  }

  // Dedicated detail page similar to Projects
  if (id) {
    return (
      <main className="section-container detail-container">
        <div className="detail-header">
          <Link to="/poems" className="back-link group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t('poems.back-to-poems')}</span>
          </Link>
          <h1 className="detail-title">{currentPoem?.title || t('poems.title')}</h1>
        </div>

        {!currentPoem ? (
          <div className="loading-state"><Loader2 size={48} className="spinner" /><p className="loading-state-text">{t('common.loading')}</p></div>
        ) : (
          <div className="poem-detail-page">
            <PoemDetail key={currentPoem._id} currentPoem={currentPoem} t={t} />
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="section-container">
      <PageHeader 
        title={t('poems.title')} 
        align="center"
      />

      <SearchAndFilter
        search={searchQuery}
        onSearchChange={(val) => setSearchQuery(val)}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
        sortValue={sortBy}
        onSortChange={(val) => setSortBy(val)}
        sortOptions={sortOptions}
      >
        <div className="filter-group">
          <label className="text-xs font-bold uppercase tracking-wider text-muted mb-3 block">{t('common.category')}</label>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`btn btn-sm ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory('')}
            >
              {t('common.all')}
            </button>
            {poemCategories.map(cat => (
              <button 
                key={cat.id}
                className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {t(`poems.categories.${cat.id.toLowerCase()}`) || cat.label}
              </button>
            ))}
          </div>
        </div>
      </SearchAndFilter>

      <div className="gallery-grid mb-16">
        {poems.length > 0 ? (
          poems.map(poem => (
            <PoemCard
              key={poem._id}
              poem={poem}
              onAction={() => navigate(`/poems/${poem._id}`)}
              onClick={() => navigate(`/poems/${poem._id}`)}
              t={t}
            />
          ))
        ) : (
          <div className="empty-poems-state">
            <BookOpen size={64} className="empty-poems-icon" />
            <h3 className="text-xl font-bold mb-2">{t('poems.empty')}</h3>
            <p className="text-secondary">{t('poems.empty-text')}</p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12 mb-16">
          <button 
            className="btn btn-primary px-10"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? <Loader2 size={18} className="spinner" /> : null}
            {t('common.load-more')}
          </button>
        </div>
      )}

      {/* Details open in dedicated route /poems/:id */}
    </main>
  );
};

export default Poems;
