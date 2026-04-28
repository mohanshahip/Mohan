// components/admin/PoemStats.jsx
import { BookOpen, Eye, Star, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatCard from "../../../components/common/StatCard";

const PoemStats = ({ stats }) => {
  const { t } = useTranslation();

  if (!stats) return null;

  const statItems = [
    {
      label: t('poems.total-other'),
      value: stats.totalPoems || 0,
      icon: BookOpen,
      color: "#6366f1"
    },
    {
      label: t('dashboard.total-views'),
      value: stats.totalViews || 0,
      icon: Eye,
      color: "#3b82f6"
    },
    {
      label: t('common.feature'),
      value: stats.featured || 0,
      icon: Star,
      color: "#f59e0b"
    },
    {
      label: t('poems.avg-reading-time'),
      value: `${Math.round(stats.avgReadingTime || 0)}m`,
      icon: Clock,
      color: "#10b981"
    }
  ];

  return (
    <div className="admin-stats-grid u-mb-xl">
      {statItems.map((item, index) => (
        <StatCard
          key={index}
          label={item.label}
          value={item.value}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default PoemStats;