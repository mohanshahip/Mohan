// components/admin/PoemBulkActions.jsx
import { useTranslation } from "react-i18next";
import CustomSelect from '../../../components/common/CustomSelect'; // Import CustomSelect
import '../../../styles/PoemBulkActions.css';

const PoemBulkActions = ({
  selectedCount,
  bulkAction,
  setBulkAction,
  onApply,
  onClear
}) => {
  const { t } = useTranslation();

  return (
    <div className="poem-bulk-actions">
      <div className="poem-bulk-selection">
        {t('poems.selectedCount', { count: selectedCount })}
      </div>
      
      <div className="poem-bulk-select-wrapper">
        <CustomSelect
          value={bulkAction}
          onChange={setBulkAction}
          options={[
            { value: '', label: t('poems.choose-action') },
            { value: 'publish', label: t('common.publish') },
            { value: 'unpublish', label: t('common.unpublish') },
            { value: 'feature', label: t('common.feature') },
            { value: 'unfeature', label: t('common.unfeature') },
            { value: 'delete', label: t('common.delete') }
          ]}
        />
      </div>
      
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
        {t('poems.clear-selection')}
      </button>
    </div>
  );
};

export default PoemBulkActions;