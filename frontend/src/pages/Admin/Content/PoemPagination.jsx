import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import '../../../styles/AdminCommon.css';

const PoemPagination = ({ page, totalPages, totalItems, limit, onPageChange }) => {
  const { t } = useTranslation();

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalItems);

  return (
    <div className="admin-pagination">
      <div className="pagination-info">
        {t('common.showing')} <span>{start}</span> {t('common.of')} <span>{end}</span> {t('common.of')} <span>{totalItems}</span>
      </div>

      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          title={t('common.first-page')}
        >
          <ChevronsLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          title={t('common.previous')}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="pagination-pages">
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
                className={page === pageNum ? "active" : ""}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          title={t('common.next')}
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          title={t('common.last-page')}
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PoemPagination;