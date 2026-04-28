// pages/Admin/SkillsAdmin/SkillsAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Plus, Edit2, Trash2, Award, Search, Filter,
  Star, StarOff, Eye, Calendar, Code, Cpu, Database, Cloud, Smartphone,
  Palette, TestTube, Wrench, Users, Loader2, Check, LayoutGrid, List
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import DataTable from '../../../components/common/DataTable';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import { useLoading, useConfirm } from '../../../context/UIContext';
import { useToast } from '../../../context/ToastContext';
import CustomSelect from '../../../components/common/CustomSelect'; // Import CustomSelect
import SkillCard from './SkillCard';

// Import Unified Admin styles
import '../../../styles/AdminCommon.css';
import '../../../styles/SkillsAdmin.css';

import useAdminData from '../../../hooks/useAdminData';
import StatCard from '../../../components/common/StatCard';

const SkillIcon = ({ iconName, size = 20, ...props }) => {
  const Icon = LucideIcons[iconName] || LucideIcons.Award;
  return <Icon size={size} {...props} />;
};

const SkillsAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { withLoading } = useLoading();
  const confirm = useConfirm();

  const {
    data: skills,
    loading,
    page,
    setPage,
    totalPages,
    total: totalSkills,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    stats,
    setStats,
    refresh: fetchSkills
  } = useAdminData('/skills/admin/all', {
    category: '',
    featured: ''
  }, 'skills', ['new_activity']);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const categories = [
    { value: 'frontend', label: t('skills.frontend'), icon: <Code size={16} /> },
    { value: 'backend', label: t('skills.backend'), icon: <Cpu size={16} /> },
    { value: 'database', label: t('skills.database'), icon: <Database size={16} /> },
    { value: 'devops', label: t('skills.devops'), icon: <Cloud size={16} /> },
    { value: 'mobile', label: t('skills.mobile'), icon: <Smartphone size={16} /> },
    { value: 'design', label: t('skills.design'), icon: <Palette size={16} /> },
    { value: 'testing', label: t('skills.testing'), icon: <TestTube size={16} /> },
    { value: 'tools', label: t('skills.tools'), icon: <Wrench size={16} /> },
    { value: 'soft-skills', label: t('skills.soft-skills'), icon: <Users size={16} /> }
  ];

  // Fetch stats from backend
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/skills/stats');
      if (response.data.success && response.data.data) {
        const s = response.data.data;
        setStats({
          total: s.totalSkills || 0,
          avgProficiency: Math.round(s.avgProficiency || 0),
          totalExp: s.totalExperience || 0,
          featured: s.featuredCount || 0
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to local calculation if backend fails
      const statsData = {
        total: totalSkills,
        avgProficiency: skills.length ? Math.round(skills.reduce((s, sk) => s + sk.proficiency, 0) / skills.length) : 0,
        totalExp: skills.reduce((s, sk) => s + (sk.yearsOfExperience || 0), 0),
        featured: skills.filter(s => s.isFeatured).length
      };
      setStats(statsData);
    }
  }, [skills.length, totalSkills, setStats]);

  useEffect(() => {
    fetchStats();
  }, [skills, fetchStats]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSkills();
  };

  const handleToggleFeatured = async (skillId) => {
    try {
      await withLoading(
        () => api.patch(`/skills/${skillId}/toggle-featured`),
        t('common.updating')
      );
      addToast(t('common.update-success'), 'success');
      fetchSkills();
    } catch {
      addToast(t('common.error'), 'error');
    }
  };

  const handleDelete = async (skillId) => {
    const ok = await confirm({
      title: t('common.delete'),
      message: t('skills.confirm-delete'),
      type: 'danger',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      await withLoading(() => api.delete(`/skills/${skillId}`), t('common.deleting'));
      addToast(t('skills.delete-success'), 'success');
      fetchSkills();
      setSelectedSkills(prev => prev.filter(id => id !== skillId));
    } catch {
      addToast(t('common.error'), 'error');
    }
  };

  const applyBulkAction = async () => {
    if (!bulkAction || selectedSkills.length === 0) return;
    const ok = await confirm({
      title: bulkAction === 'delete' ? t('common.delete-selected') : t('common.apply'),
      message: t('projects.bulk-action-confirm', { count: selectedSkills.length, action: bulkAction }),
      type: bulkAction === 'delete' ? 'danger' : 'warning',
      confirmText: t('common.apply'),
      cancelText: t('common.cancel')
    });
    if (!ok) return;
    try {
      if (bulkAction === 'delete') {
        await withLoading(
          () => Promise.all(selectedSkills.map(id => api.delete(`/skills/${id}`))),
          t('common.deleting')
        );
        addToast(t('common.bulk-delete-success'), 'success');
      }
      fetchSkills();
      setSelectedSkills([]);
      setBulkAction('');
    } catch {
      addToast(t('common.error'), 'error');
    }
  };

  const handleSelectSkill = (skillId) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId) 
        : [...prev, skillId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSkills.length === skills.length) {
      setSelectedSkills([]);
    } else {
      setSelectedSkills(skills.map(s => s._id));
    }
  };

  const columns = [
    {
      key: 'name',
      label: t('common.skill') || t('skills.title'),
      render: (name, skill) => (
        <div className="admin-user-info">
          <div 
            className="admin-user-avatar skill-icon-dynamic" 
            style={{
              '--skill-color': skill.color,
              background: `color-mix(in srgb, ${skill.color} 15%, transparent)`,
              color: skill.color
            }}
          >
            <SkillIcon iconName={skill.icon} />
          </div>
          <div className="admin-user-details">
            <div className="admin-user-name">{name}</div>
            <div className="admin-user-email">{skill.description?.substring(0, 40)}...</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: t('common.category'),
      render: (category) => {
        const cat = categories.find(c => c.value === category);
        return (
          <span className="admin-badge admin-badge--info">
            {cat?.icon}
            <span className="u-ml-xs">{cat?.label}</span>
          </span>
        );
      }
    },
    {
      key: 'proficiency',
      label: t('skills.proficiency'),
      render: (proficiency, skill) => (
        <div className="u-w-full u-min-w-10">
          <div className="u-flex u-items-center u-justify-between u-mb-xs">
            <span className="u-text-xs u-font-bold">{proficiency}%</span>
          </div>
          <div className="strength-bar">
            <div 
              className="strength-bar-fill proficiency-bar-fill-dynamic" 
              style={{ 
                width: `${proficiency}%`,
                '--skill-color': skill.color,
                backgroundColor: skill.color
              }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'experience',
      label: t('skills.experience'),
      render: (_, skill) => (
        <span className="admin-badge admin-badge--neutral">
          <Calendar size={12} className="u-mr-xs" />
          {skill.yearsOfExperience} {t('skills.years')}
        </span>
      )
    },
    {
      key: 'isFeatured',
      label: t('projects.featured'),
      render: (isFeatured, skill) => (
        <button
          className={`admin-table-icon-btn ${isFeatured ? 'u-text-warning' : ''}`}
          onClick={() => handleToggleFeatured(skill._id)}
          title={isFeatured ? t('common.unfeature') : t('common.feature')}
        >
          {isFeatured ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
        </button>
      )
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_, skill) => (
        <div className="u-flex u-gap-xs">
          <button className="admin-table-icon-btn" onClick={() => navigate(`/admin/skills/edit/${skill._id}`)} title={t('common.edit')}>
            <Edit2 size={16} />
          </button>
          <button className="admin-table-icon-btn u-text-danger" onClick={() => handleDelete(skill._id)} title={t('common.delete')}>
            <Trash2 size={16} />
          </button>
          <button className="admin-table-icon-btn" onClick={() => window.open(`/skills/${skill.slug}`, '_blank')} title={t('common.view')}>
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminPageLayout
      icon={<Award size={24} />}
      title={t('admin.skill-admin')}
      subtitle={t('skills.manage')}
      actions={
        <button className="btn-admin btn-admin--primary" onClick={() => navigate('/admin/skills/add')}>
          <Plus size={18} /> {t('skills.add-new-skill')}
        </button>
      }
    >
      {/* Stats */}
      {stats && (
        <div className="admin-stats-grid u-mb-xl">
          <StatCard
            label={t('common.total')}
            value={stats.total}
            icon={Award}
            color="#6366f1"
          />
          <StatCard
            label={t('projects.featured')}
            value={stats.featured}
            icon={Star}
            color="#f59e0b"
          />
          <StatCard
            label={t('skills.avg-proficiency')}
            value={`${stats.avgProficiency}%`}
            icon={Check}
            color="#10b981"
          />
          <StatCard
            label={t('skills.total-exp')}
            value={stats.totalExp}
            icon={Calendar}
            color="#3b82f6"
          />
        </div>
      )}

      {/* Filters */}
      <div className="admin-filter-bar">
        <div className="u-flex u-items-center u-gap-md u-flex-1">
          <form className="admin-search-wrapper" onSubmit={handleSearch}>
            <Search size={18} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('skills.search')}
            />
          </form>

          <div className="admin-view-toggle u-flex u-gap-xs">
            <button 
              className={`admin-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title={t('common.tableView')}
            >
              <List size={18} />
            </button>
            <button 
              className={`admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={t('common.gridView')}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        <div className="u-flex u-gap-md u-items-center">
          <div className="admin-filter-group">
            <CustomSelect
              value={filters.category}
              onChange={(value) => setFilters({ category: value })}
              icon={Filter}
              options={[
                { value: '', label: t('skills.all-categories') },
                ...categories.map(cat => ({ value: cat.value, label: cat.label }))
              ]}
            />
          </div>

          <div className="admin-filter-group">
            <CustomSelect
              value={filters.featured}
              onChange={(value) => setFilters({ featured: value })}
              icon={Star}
              options={[
                { value: '', label: t('common.all') },
                { value: 'true', label: t('projects.featured') },
                { value: 'false', label: t('skills.skills-not-featured') }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions (optional) */}
      {selectedSkills.length > 0 && (
        <div className="admin-bulk-actions-bar admin-card u-mb-lg u-flex u-items-center u-justify-between">
          <span className="selected-count">
            {t('selectedCount', { count: selectedSkills.length })}
          </span>
          <div className="u-flex u-gap-md u-items-center">
            <CustomSelect
              value={bulkAction}
              onChange={setBulkAction}
              options={[
                { value: '', label: t('common.choose-action') },
                { value: 'delete', label: t('common.delete-selected') }
              ]}
            />
            <button className="btn-admin btn-admin--primary" onClick={applyBulkAction} disabled={!bulkAction}>
              {t('common.apply')}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'table' ? (
        <div className="admin-card u-p-0">
          <DataTable
            columns={columns}
            data={skills}
            pagination={{
              currentPage: page,
              pageSize: 10,
              total: totalSkills,
              totalPages: totalPages
            }}
            onPageChange={setPage}
            onSearch={setSearchQuery}
            searchValue={searchQuery}
            selectable={true}
            selectedRows={selectedSkills}
            onSelectRow={handleSelectSkill}
            onSelectAll={handleSelectAll}
            emptyMessage={t('skills.noSkillsFound')}
            tableActions={
              <div className="u-flex u-gap-sm">
                <CustomSelect
                  options={categories}
                  value={filters.category}
                  onChange={(val) => setFilters({ category: val })}
                  placeholder={t('common.category')}
                />
              </div>
            }
          />
        </div>
      ) : (
         <div className="admin-skills-grid-container">
          {loading ? (
            <div className="grid-loading-wrapper">
              <Loader2 className="animate-spin u-text-primary" size={48} />
              <p>{t('common.loading')}</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="grid-empty-wrapper">
              <Award size={64} className="grid-empty-icon" />
              <h3 className="grid-empty-title">{t('skills.noSkillsFound')}</h3>
              <p className="grid-empty-desc">
                {searchQuery ? t('common.tryDifferentSearch') : t('skills.addFirst')}
              </p>
            </div>
          ) : (
            <>
              <div className="admin-cards-grid">
                {skills.map(skill => (
                  <SkillCard
                    key={skill._id}
                    skill={skill}
                    categories={categories}
                    t={t}
                    navigate={navigate}
                    handleToggleFeatured={handleToggleFeatured}
                    handleDelete={handleDelete}
                    isSelected={selectedSkills.includes(skill._id)}
                    onSelect={handleSelectSkill}
                    SkillIcon={SkillIcon}
                  />
                ))}
              </div>

              {/* Grid Pagination */}
              {totalPages > 1 && (
                <div className="u-mt-xl u-flex u-justify-center">
                  <div className="admin-pagination">
                    <button 
                      className="admin-pagination-btn" 
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      {t('common.prev')}
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button 
                        key={p}
                        className={`admin-pagination-btn ${p === page ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button 
                      className="admin-pagination-btn" 
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      {t('common.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </AdminPageLayout>
  );
};

export default SkillsAdmin;
