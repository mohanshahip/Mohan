import React, { memo } from 'react';
import '../../../styles/ActivityItem.css';
import { useTranslation } from 'react-i18next';
import { Clock, User as UserIcon, ExternalLink } from 'lucide-react';

const ActivityItem = memo(({ activity }) => {
  const { t } = useTranslation();
  const Icon = activity.icon;
  
  const getActivityTypeClass = (type) => {
    switch(type) {
      case 'poem': return 'activity-item-poem';
      case 'project': return 'activity-item-project';
      case 'gallery': return 'activity-item-gallery';
      case 'skill': return 'activity-item-skill';
      case 'system': return 'activity-item-system';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'new': return 'activity-status-new';
      case 'published': return 'activity-status-updated';
      case 'deleted': return 'activity-status-deleted';
      default: return '';
    }
  };

  return (
    <div className={`activity-item-new ${getActivityTypeClass(activity.type)}`}>
      <div className="activity-item-left">
        <div className="activity-item-icon">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="activity-item-info">
          <div className="activity-item-header">
            <p className="activity-item-content">{activity.content}</p>
            {activity.status && (
              <span className={`activity-status-badge ${getStatusClass(activity.status)}`}>
                {t(`dashboard.status.${activity.status}`) || activity.status}
              </span>
            )}
          </div>
          <div className="activity-item-meta">
            <span className="activity-item-user">
              <UserIcon size={12} />
              {activity.user}
            </span>
            <span className="activity-item-time">
              <Clock size={12} />
              {activity.time}
            </span>
          </div>
        </div>
      </div>
      {activity.actionUrl && (
        <a href={activity.actionUrl} className="activity-item-link" title="View Details">
          <ExternalLink size={14} strokeWidth={2.5} />
        </a>
      )}
    </div>
  );
});

export default ActivityItem;
