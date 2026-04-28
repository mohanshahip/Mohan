import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import '../../../styles/AdminCommon.css';

const ProjectPagination = ({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="admin-pagination">
      <div className="admin-pagination-info">
        {t('common.showing')} {(page - 1) * limit + 1}-{Math.min(page * limit, totalItems)} {t('common.of')} {totalItems}
      </div>
      
      <div className="admin-pagination-controls">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="admin-pagination-btn"
          title={t('common.first-page')}
        >
          <ChevronsLeft size={16} />
        </button>
        
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="admin-pagination-btn"
        >
          <ChevronLeft size={16} />
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`admin-pagination-btn ${page === pageNum ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          );
        })}
        
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="admin-pagination-btn"
        >
          <ChevronRight size={16} />
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="admin-pagination-btn"
          title={t('common.last-page')}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProjectPagination;