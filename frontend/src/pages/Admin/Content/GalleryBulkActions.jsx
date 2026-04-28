import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Eye, EyeOff, CheckSquare, Zap } from 'lucide-react';

const GalleryBulkActions = ({
  selectedCount,
  bulkAction,
  setBulkAction,
  onApply
}) => {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  const actions = [
    { value: 'publish', label: t('common.publish'), icon: <Eye size={16} /> },
    { value: 'unpublish', label: t('common.unpublish'), icon: <EyeOff size={16} /> },
    { value: 'delete', label: t('common.delete'), icon: <Trash2 size={16} /> }
  ];

  return (
    <div className="admin-bulk-actions u-mb-md">
      <div className="admin-bulk-info">
        <CheckSquare size={18} className="u-text-primary" />
        <span>{t('common.selectedItems', { count: selectedCount })}</span>
      </div>
      
      <div className="admin-bulk-controls">
        <select
          className="admin-bulk-select"
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
        >
          <option value="">{t('common.chooseBulkAction')}</option>
          {actions.map(action => (
            <option key={action.value} value={action.value}>{action.label}</option>
          ))}
        </select>
        
        <button
          className="btn btn-primary btn-sm"
          onClick={onApply}
          disabled={!bulkAction}
        >
          <Zap size={16} />
          {t('common.apply')}
        </button>
      </div>
    </div>
  );
};

export default GalleryBulkActions;
