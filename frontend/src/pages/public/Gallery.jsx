import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Image,
  Loader2, Download, Star, Info, Tag,
  Maximize2, Share2, Layers, ChevronRight, ChevronLeft,
  Clock, Heart
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getFullImageUrl } from '../../utils/imageUtils';

// Common Components
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import SearchAndFilter from "../../components/common/SearchAndFilter";
import Modal from "../../components/common/Modal";

// Specialized Components
import GalleryCard from "../../components/gallery/GalleryCard";
import GalleryViewer from "../../components/gallery/GalleryViewer";

// Styles
import "../../styles/Pages.css";

const Gallery = ({ isSection = false }) => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [galleries, setGalleries] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5012/api';

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gallery/categories?lang=${i18n.language}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // categories is an array of objects like { _id: 'cat', count: 1 }
          setCategories(data.data.map(c => c._id).filter(Boolean));
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [i18n.language, API_BASE_URL]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch galleries data
  const fetchGalleries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ lang: i18n.language });
      if (filters.category) params.append('category', filters.category);

      const response = await fetch(`${API_BASE_URL}/gallery?${params.toString()}`);
      if (!response.ok) throw new Error(t('gallery.error-loading'));

      const data = await response.json();
      if (data.success) {
        const processed = data.data.map(gallery => ({
          ...gallery,
          images: (gallery.images || []).map(image => ({
            ...image,
            url: getFullImageUrl(image.url)
          }))
        }));
        setGalleries(processed);
      }
    } catch (err) {
      setError(err.message || t('gallery.error'));
    } finally {
      setLoading(false);
    }
  }, [filters.category, i18n.language, t, API_BASE_URL]);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  // Handle single gallery from URL
  useEffect(() => {
    if (id && galleries.length > 0) {
      const gallery = galleries.find(g => g._id === id);
      if (gallery) {
        setSelectedGallery(gallery);
        setActiveImageIndex(0);
      }
    }
  }, [id, galleries]);

  // Apply search and sort
  useEffect(() => {
    let result = [...galleries];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(g => 
        g.title.toLowerCase().includes(searchLower) || 
        (g.description && g.description.toLowerCase().includes(searchLower))
      );
    }

    const sortMap = {
      newest: (a, b) => {
        const dateDiff = new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
        if (dateDiff !== 0) return dateDiff;
        // If dates are the same, use createdAt as secondary sort
        return new Date(b.createdAt) - new Date(a.createdAt);
      },
      oldest: (a, b) => {
        const dateDiff = new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
        if (dateDiff !== 0) return dateDiff;
        // If dates are the same, use createdAt as secondary sort
        return new Date(a.createdAt) - new Date(b.createdAt);
      },
      'a-z': (a, b) => a.title.localeCompare(b.title),
      'z-a': (a, b) => b.title.localeCompare(a.title)
    };
    
    result.sort(sortMap[filters.sort] || sortMap.newest);
    setFilteredGalleries(result);
  }, [filters.search, filters.sort, galleries]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(i18n.language === 'np' ? 'ne-NP' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleDownload = async (imageUrl, imageName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(imageUrl, '_blank');
    }
  };

  const sortOptions = [
    { value: 'newest', label: t('gallery.newest-first') },
    { value: 'oldest', label: t('gallery.oldest-first') },
    { value: 'a-z', label: t('projects.a-to-z') },
    { value: 'z-a', label: t('projects.z-to-a') }
  ];

  if (loading && galleries.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="section-container">
      {!isSection && (
        <PageHeader 
          title={t('gallery.title')} 
          align="center"
        />
      )}

      <SearchAndFilter
        search={filters.search}
        onSearchChange={(val) => setFilters(p => ({ ...p, search: val }))}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
        sortValue={filters.sort}
        onSortChange={(val) => setFilters(p => ({ ...p, sort: val }))}
        sortOptions={sortOptions}
      >
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-muted mb-2">{t('gallery.filter-by-category')}</h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilters(p => ({ ...p, category: '' }))}
              className={`category-nav-btn ${filters.category === '' ? 'active' : ''}`}
            >
              {t('gallery.all-collections')}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilters(p => ({ ...p, category: cat }))}
                className={`category-nav-btn ${filters.category === cat ? 'active' : ''}`}
              >
                {t(`gallery.categories.${cat}`) || cat}
              </button>
            ))}
          </div>
        </div>
      </SearchAndFilter>

      {/* Optimized Gallery Grid */}
      <div className="gallery-grid mb-16">
        {(isSection ? filteredGalleries.slice(0, 3) : filteredGalleries).map((gallery) => (
          <GalleryCard
            key={gallery._id}
            gallery={gallery}
            onClick={() => {
              setSelectedGallery(gallery);
              setActiveImageIndex(0);
            }}
            t={t}
            formatDate={formatDate}
          />
        ))}
      </div>

      {isSection && (
        <div className="flex justify-center mt-12">
          <button 
            onClick={() => navigate('/gallery')}
            className="btn btn-primary btn-lg group"
          >
            {t('gallery.view-all')}
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      <Modal
        isOpen={!!selectedGallery}
        onClose={() => {
          setSelectedGallery(null);
          setActiveImageIndex(0);
          if (id) navigate('/gallery');
        }}
        maxWidth="100%"
        hideHeader={true}
        padding="0"
        hideFooter={true}
      >
        <GalleryViewer
          selectedGallery={selectedGallery}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
          handleDownload={handleDownload}
          onClose={() => {
            setSelectedGallery(null);
            setActiveImageIndex(0);
            if (id) navigate('/gallery');
          }}
          formatDate={formatDate}
          t={t}
        />
      </Modal>
    </main>
  );
};

export default Gallery;
