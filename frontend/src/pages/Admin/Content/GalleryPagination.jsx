import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const GalleryPagination = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      pages.push(
        <button key={1} className="admin-pagination-btn" onClick={() => onPageChange(1)}>1</button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-dots" className="admin-pagination-dots"><MoreHorizontal size={14} /></span>);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`admin-pagination-btn ${currentPage === i ? 'is-active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-dots" className="admin-pagination-dots"><MoreHorizontal size={14} /></span>);
      }
      pages.push(
        <button key={totalPages} className="admin-pagination-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
      );
    }
    
    return pages;
  };

  return (
    <div className="admin-pagination-container u-mt-xl">
      <div className="admin-pagination-info u-text-muted u-text-xs">
        {t('common.paginationInfo', { current: currentPage, total: totalPages })}
      </div>
      
      <div className="admin-pagination-controls">
        <button
          className="admin-pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title={t('common.previous')}
        >
          <ChevronLeft size={18} />
        </button>
        
        {renderPageNumbers()}
        
        <button
          className="admin-pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title={t('common.next')}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default GalleryPagination;
