// components/admin/ProjectBulkActions.jsx
import { useTranslation } from "react-i18next";
import '../../../styles/ProjectBulkActions.css';

const ProjectBulkActions = ({
  selectedCount,
  bulkAction,
  setBulkAction,
  onApply,
  onClear
}) => {
  const { t } = useTranslation();

  return (
    <div className="project-bulk-actions">
      <div className="project-bulk-selection">
        {t('admin.selectedCount', { count: selectedCount })}
      </div>
      
      <select
        value={bulkAction}
        onChange={(e) => setBulkAction(e.target.value)}
        className="project-bulk-select"
      >
        <option value="">{t('admin.choose-action')}</option>
        <option value="publish">{t('poems.publish-selected')}</option>
        <option value="unpublish">{t('poems.unpublish-selected')}</option>
        <option value="feature">{t('poems.feature-selected')}</option>
        <option value="unfeature">{t('poems.unfeature-selected')}</option>
        <option value="delete">{t('admin.delete-selected')}</option>
      </select>
      
      <button
        onClick={onApply}
        disabled={!bulkAction}
        className="btn btn-primary"
      >
        {t('common.apply')}
      </button>
      
      <button
        onClick={onClear}
        className="btn btn-secondary"
      >
        {t('common.clear-selection')}
      </button>
    </div>
  );
};

export default ProjectBulkActions;