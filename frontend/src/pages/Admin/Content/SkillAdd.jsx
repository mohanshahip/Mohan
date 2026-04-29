import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import {
  Award, ArrowLeft, Save, Loader2, AlertCircle,
  Code, Cpu, Database, Cloud, Smartphone, Palette, TestTube, Wrench, Users
} from 'lucide-react';

import api from '../../../services/api';
import AdminPageLayout from '../../../components/common/AdminPageLayout';
import { useToast } from '../../../context/ToastContext';

const IconPreview = ({ iconName, color }) => {
  const Icon = LucideIcons[iconName] || LucideIcons.Award;
  return (
    <div
      style={{
        width: '48px',
        height: '48px',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px'
      }}
    >
      <Icon size={20} />
    </div>
  );
};

const SkillAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'frontend',
    proficiency: 80,
    yearsOfExperience: 1,
    icon: 'Code',
    color: '#3b82f6',
    description: '',
    isFeatured: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'database', label: 'Database' },
    { value: 'devops', label: 'DevOps' }
  ];

  const icons = ['Code', 'Cpu', 'Database', 'Cloud'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/skills', formData);
      addToast('Skill added', 'success');
      navigate('/admin/skills');
    } catch (err) {
      addToast('Error adding skill', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageLayout
      icon={<Award size={24} />}
      title="Add Skill"
      actions={
        <button onClick={() => navigate('/admin/skills')}>
          <ArrowLeft size={16} /> Back
        </button>
      }
    >
      <div className="admin-form-container">

        <form onSubmit={handleSubmit}>

          {/* LEFT SIDE */}
          <div>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Skill Name"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
            />

            <input
              type="number"
              name="proficiency"
              value={formData.proficiency}
              onChange={handleChange}
            />

          </div>

          {/* RIGHT SIDE */}
          <div>

            <select name="category" value={formData.category} onChange={handleChange}>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <select name="icon" value={formData.icon} onChange={handleChange}>
              {icons.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>

            <IconPreview iconName={formData.icon} color={formData.color} />

            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />

            <label>
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              Featured
            </label>

          </div>

          {/* BUTTON */}
          <button type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} /> : <Save size={16} />}
            Save
          </button>

        </form>

      </div>
    </AdminPageLayout>
  );
};

export default SkillAdd;