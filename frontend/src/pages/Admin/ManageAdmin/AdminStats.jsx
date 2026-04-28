// pages/Admin/ManageAdmins/components/AdminStats.jsx
import { Users, CheckCircle, PauseCircle, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatCard from '../../../components/common/StatCard';

const AdminStats = ({ stats }) => {
  const { t } = useTranslation();

  const statCards = [
    {
      title: t('admin.total-admins'),
      value: stats.total,
      icon: Users,
      color: '#3b82f6'
    },
    {
      title: t('common.active'),
      value: stats.active,
      icon: CheckCircle,
      color: '#10b981'
    },
    {
      title: t('common.inactive'),
      value: stats.inactive,
      icon: PauseCircle,
      color: '#64748b'
    },
    {
      title: t('admin.new-this-month'),
      value: stats.newThisMonth,
      icon: UserPlus,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="admin-stats-grid u-mb-xl">
      {statCards.map((stat, index) => (
        <StatCard 
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default AdminStats;
