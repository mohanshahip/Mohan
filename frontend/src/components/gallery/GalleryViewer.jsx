import React from 'react';
import { 
  Calendar, Info, Tag, Download, Share2, Layers, 
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

/**
 * Immersive Gallery Viewer Component
 * Designed to be used inside a Modal for full-screen photo experiences.
 */
const GalleryViewer = ({ 
  selectedGallery, 
  activeImageIndex, 
  setActiveImageIndex, 
  handleDownload, 
  onClose,
  formatDate, 
  t 
}) => {
  const { addToast } = useToast();
  const [imageLoading, setImageLoading] = React.useState(true);

  React.useEffect(() => {
    setImageLoading(true);
  }, [activeImageIndex]);

  // Keyboard navigation for images
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedGallery || !selectedGallery.images || selectedGallery.images.length <= 1) return;
      
      if (e.key === 'ArrowRight') {
        e.stopPropagation();
        setActiveImageIndex(prev => (prev + 1) % selectedGallery.images.length);
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        setActiveImageIndex(prev => (prev - 1 + selectedGallery.images.length) % selectedGallery.images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGallery, setActiveImageIndex]);

  if (!selectedGallery) return null;

  return (
    <div className="immersive-gallery-viewer">
      {/* Main Stage */}
      <div className="viewer-stage">
        <div className="main-image-viewport">
          <img 
            src={selectedGallery.images?.[activeImageIndex]?.url} 
            alt={selectedGallery.title} 
            className={`stage-img ${imageLoading ? 'loading' : ''}`}
            onLoad={() => setImageLoading(false)}
          />
          
          {/* Stage Controls */}
          <div className="stage-controls">
            <div className="stage-top-bar">
              <div className="stage-title-info">
                <span className="stage-category">{t(`gallery.categories.${selectedGallery.category}`) || selectedGallery.category}</span>
                <h2 className="stage-title">{selectedGallery.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  className="stage-download-btn"
                  onClick={() => handleDownload(selectedGallery.images[activeImageIndex].url, `${selectedGallery.title}.jpg`)}
                  title={t('gallery.download-this-photo')}
                >
                  <Download size={20} />
                </button>
                {onClose && (
                  <button 
                    className="stage-download-btn close-btn"
                    onClick={onClose}
                    title={t('common.close')}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            {selectedGallery.images?.length > 1 && (
              <div className="stage-nav">
                <button 
                  className="nav-arrow left"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev - 1 + selectedGallery.images.length) % selectedGallery.images.length);
                  }}
                  title={t('common.previous')}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className="nav-arrow right"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev + 1) % selectedGallery.images.length);
                  }}
                  title={t('common.next')}
                >
                  <ChevronRight size={32} />
                </button>
              </div>
            )}

            <div className="stage-bottom-bar">
              <div className="image-counter">
                {t('gallery.image-counter', { current: activeImageIndex + 1, total: selectedGallery.images?.length })}
              </div>
              <div className="image-meta">
                <Calendar size={14} /> {formatDate(selectedGallery.date || selectedGallery.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="viewer-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3 className="section-label"><Info size={16} /> {t('gallery.about-collection')}</h3>
            <p className="sidebar-description">{selectedGallery.description || t('common.no-data')}</p>
          </div>

          {selectedGallery.images?.length > 1 && (
            <div className="sidebar-section">
              <h3 className="section-label"><Layers size={16} /> {t('gallery.all-photos')}</h3>
              <div className="thumbnail-grid">
                {selectedGallery.images.map((img, i) => (
                  <div 
                    key={i} 
                    className={`thumbnail-box ${activeImageIndex === i ? 'is-active' : ''}`}
                    onClick={() => setActiveImageIndex(i)}
                    title={`${t('common.view')} ${i + 1}`}
                  >
                    <img src={img.url} alt={`Thumbnail ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedGallery.tags?.length > 0 && (
            <div className="sidebar-section">
              <h3 className="section-label"><Tag size={16} /> {t('common.tags')}</h3>
              <div className="tag-cloud">
                {selectedGallery.tags.map(tag => (
                  <span key={tag} className="cloud-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-actions">
            <button className="sidebar-btn-primary" onClick={() => handleDownload(selectedGallery.images[activeImageIndex].url, `${selectedGallery.title}.jpg`)}>
              <Download size={18} /> {t('gallery.download-this-photo')}
            </button>
            <button className="sidebar-btn-secondary" onClick={() => {
              navigator.clipboard.writeText(window.location.origin + '/gallery/' + selectedGallery._id);
              addToast(t('common.link-copied'), 'success');
            }}>
              <Share2 size={18} /> {t('gallery.share-collection')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryViewer;
