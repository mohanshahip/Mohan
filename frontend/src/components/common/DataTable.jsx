import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/AdminCommon.css'; // Use unified styles

const DataTable = ({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  onSort,
  sortConfig,
  onSearch,
  searchValue,
  actions,
  selectable,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  emptyMessage,
  tableActions // Additional buttons for toolbar
}) => {
  const { t } = useTranslation();

  return (
    <div className="admin-table-wrapper">
      {/* Table Toolbar */}
      {(onSearch || tableActions) && (
        <div className="table-toolbar">
          <div className="table-toolbar__left">
            {onSearch && (
              <div className="table-search">
                <Search className="table-search-icon" size={18} />
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder={t('common.search') || 'Search...'}
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="table-toolbar__right">
            {tableActions}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {selectable && (
                <th className="col-checkbox">
                  <input
                    type="checkbox"
                    className="admin-table-checkbox"
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={onSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.sortable ? 'sortable' : ''} ${column.className || ''}`}
                  onClick={() => column.sortable && onSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="u-flex u-items-center">
                    {column.label}
                    {column.sortable && (
                      <span className="sort-indicator">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="u-text-muted" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="col-actions">{t('common.actions') || 'Actions'}</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
                  <div className="admin-table-empty">
                    <div className="loading-spinner" />
                    <p>{t('common.loading') || 'Loading data...'}</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
                  <div className="admin-table-empty">
                    <Search className="admin-table-empty-icon" />
                    <p>{emptyMessage || t('common.no-data') || 'No records found'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index} className={selectedRows.includes(row.id) ? 'selected' : ''}>
                  {selectable && (
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        className="admin-table-checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => onSelectRow(row.id)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={column.className}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="col-actions">
                      <div className="admin-table-actions">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && data.length > 0 && (
          <div className="admin-pagination">
            <div className="pagination-info">
              {t('common.showingRows', {
                start: (pagination.currentPage - 1) * pagination.pageSize + 1,
                end: Math.min(pagination.currentPage * pagination.pageSize, pagination.total),
                total: pagination.total
              }) || `Showing ${ (pagination.currentPage - 1) * pagination.pageSize + 1} to ${Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of ${pagination.total} entries`}
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn pagination-btn--prev"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft size={18} />
                <span>{t('common.previous') || 'Prev'}</span>
              </button>
              
              {/* Simple page numbers could be added here if needed */}
              
              <button
                className="pagination-btn pagination-btn--next"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <span>{t('common.next') || 'Next'}</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
