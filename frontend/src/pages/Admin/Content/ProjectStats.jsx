// components/admin/ProjectStats.jsx
import { FolderOpen, Eye, Star, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatCard from "../../../components/common/StatCard";

const ProjectStats = ({ stats }) => {
  const { t } = useTranslation();

  if (!stats) return null;

  const statItems = [
    {
      label: t('projects.total-projects'),
      value: stats.totalProjects || 0,
      icon: FolderOpen,
      color: "#6366f1"
    },
    {
      label: t('projects.published'),
      value: stats.published || 0,
      icon: Eye,
      color: "#10b981"
    },
    {
      label: t('projects.featured'),
      value: stats.featured || 0,
      icon: Star,
      color: "#f59e0b"
    },
    {
      label: t('projects.in-progress'),
      value: stats.inProgress || 0,
      icon: TrendingUp,
      color: "#3b82f6"
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

export default ProjectStats;