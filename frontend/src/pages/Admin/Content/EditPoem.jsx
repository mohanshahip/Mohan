// components/admin/EditPoem.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import AdminPageLayout from "../../../components/common/AdminPageLayout";
import {
  Save,
  X,
  Loader,
  AlertCircle,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  BookOpen,
  Tag,
  Globe,
  Clock,
  User,
  Eye,
  EyeOff,
  Star,
  Check
} from "lucide-react";

const EditPoem = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const language = i18n.language || "en";
  const fileInputRef = useRef(null);

  // Default form state
  const defaultFormData = useMemo(() => ({
    title: "",
    content: "",
    excerpt: "",
    author: t('hero.full-name'),
    language: language === 'np' ? 'ne' : 'en',
    category: "other",
    tags: [],
    featuredImage: { url: "", alt: "" },
    readingTime: 2,
    isPublished: true,
    isFeatured: false
  }), [language]);

  const [formData, setFormData] = useState(defaultFormData);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch poem data when component mounts
  useEffect(() => {
    const fetchPoem = async () => {
      if (!id) return;
      
      try {
        setFetching(true);
        const response = await api.get(`/poems/${id}?admin=true`);
        const data = response.data;
        
        if (data.success) {
          setFormData(data.data);
          if (data.data.featuredImage?.url) {
            setImagePreview(data.data.featuredImage.url);
          }
        } else {
          setErrors({ fetch: data.error || t('poems.empty') });
        }
      } catch (error) {
        console.error("Error fetching poem:", error);
        setErrors({ fetch: t('common.error') });
      } finally {
        setFetching(false);
      }
    };

    fetchPoem();
  }, [id, t]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t('validation.title-required');
    }
    
    if (!formData.content.trim()) {
      newErrors.content = t('validation.content-required');
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = t('validation.excerpt-required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle tags
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle image file selection
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        featuredImage: t('validation.invalid-image-type') 
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        featuredImage: t('validation.image-too-large') 
      }));
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          ...prev.featuredImage,
          url: reader.result,
          alt: prev.featuredImage.alt || file.name || t('poems.featured-image')
        }
      }));
    };
    reader.readAsDataURL(file);
    
    // Clear error if exists
    if (errors.featuredImage) {
      setErrors(prev => ({ ...prev, featuredImage: null }));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      featuredImage: { url: "", alt: "" }
    }));
  };

  const uploadImageToServer = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/poems/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = response.data;
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({ 
        ...prev, 
        featuredImage: t('validation.image-upload-failed') 
      }));
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      let finalFormData = { ...formData };
      
      // Upload image if a new file was selected
      if (imageFile) {
        const imageUrl = await uploadImageToServer(imageFile);
        if (imageUrl) {
          finalFormData = {
            ...finalFormData,
            featuredImage: {
              ...finalFormData.featuredImage,
              url: imageUrl
            }
          };
        } else {
          // If image upload failed, don't proceed with form submission
          return;
        }
      }
      
      const response = await api.put(`/poems/${id}`, finalFormData);
      
      const data = response.data;
      
      if (data.success) {
        setSuccessMessage(t('messages.update-success'));
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/admin/poems");
        }, 2000);
      } else {
        setErrors({ submit: data.error || t('common.error') });
      }
    } catch (error) {
      console.error("Error updating poem:", error);
      setErrors({ submit: t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const poemCategories = [
    { id: "love", label: t('poems.categories.love') },
    { id: "nature", label: t('poems.categories.nature') },
    { id: "inspirational", label: t('poems.categories.inspirational') },
    { id: "philosophical", label: t('poems.categories.philosophical') },
    { id: "nostalgic", label: t('poems.categories.nostalgic') },
    { id: "spiritual", label: t('poems.categories.spiritual') },
    { id: "social", label: t('poems.categories.social') },
    { id: "humorous", label: t('poems.categories.humorous') },
    { id: "other", label: t('poems.categories.other') }
  ];

  if (fetching) {
    return (
      <AdminPageLayout title={t('poems.edit')} icon={<BookOpen size={24} />}>
        <div className="u-flex u-items-center u-justify-center" style={{ minHeight: '400px' }}>
          <Loader className="animate-spin" size={40} color="var(--primary-600)" />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      icon={<BookOpen size={24} />}
      title={t('poems.edit')}
      subtitle={t('poems.editSubtitle', 'Modify the details of your poem')}
      actions={
        <button 
          onClick={() => navigate("/admin/poems")} 
          className="btn-admin btn-admin--secondary" 
          disabled={loading}
        >
          <ArrowLeft size={18} />
          {t('poems.back-to-poems')}
        </button>
      }
    >
      <div className="admin-form-container">
        {/* Messages */}
        {successMessage && (
          <div className="admin-badge admin-badge--success u-w-full u-mb-lg" style={{ padding: '12px', justifyContent: 'flex-start' }}>
            <Check size={18} />
            {successMessage}
          </div>
        )}
        {(errors.fetch || errors.submit) && (
          <div className="admin-badge admin-badge--danger u-w-full u-mb-lg" style={{ padding: '12px', justifyContent: 'flex-start' }}>
            <AlertCircle size={18} />
            {errors.fetch || errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            {/* Left Column - Main Content */}
            <div className="admin-form-column">
              <div className="admin-form-section">
                <h3 className="admin-form-section__title">
                  <BookOpen size={20} />
                  {t('projects.form.basic-information')}
                </h3>

                {/* Title */}
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    {t('common.title')} *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`admin-form-control ${errors.title ? 'admin-form-control--error' : ''}`}
                    placeholder={t('poems.enter-title')}
                    disabled={loading}
                    maxLength={200}
                  />
                  {errors.title && <span className="admin-form-error"><AlertCircle size={14} /> {errors.title}</span>}
                  <div className="admin-form-char-count">{formData.title.length}/200</div>
                </div>

                {/* Excerpt */}
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    {t('common.description')} *
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className={`admin-form-control ${errors.excerpt ? 'admin-form-control--error' : ''}`}
                    rows="3"
                    placeholder={t('poems.enter-excerpt')}
                    disabled={loading}
                    maxLength={500}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  />
                  {errors.excerpt && <span className="admin-form-error"><AlertCircle size={14} /> {errors.excerpt}</span>}
                  <div className="admin-form-char-count">{formData.excerpt.length}/500</div>
                </div>

                {/* Content */}
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    {t('poems.enter-content')} *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className={`admin-form-control ${errors.content ? 'admin-form-control--error' : ''}`}
                    rows="15"
                    placeholder={t('poems.enter-content')}
                    disabled={loading}
                    maxLength={5000}
                    style={{ minHeight: '400px', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  {errors.content && <span className="admin-form-error"><AlertCircle size={14} /> {errors.content}</span>}
                  <div className="admin-form-char-count">
                    {formData.content.length}/5000 • {t('poems.reading-time')}: {formData.readingTime} {t('common.minutes')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="admin-form-column">
              {/* Publishing Options */}
              <div className="admin-form-section">
                <h3 className="admin-form-section__title">
                  <Globe size={20} />
                  {t('common.settings', 'Settings')}
                </h3>

                {/* Status Toggle */}
                <div className="admin-form-group">
                  <label className="admin-form-toggle">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="admin-form-toggle-input"
                      disabled={loading}
                    />
                    <div className="admin-form-toggle-slider"></div>
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>
                      {formData.isPublished ? t('common.published') : t('common.draft')}
                    </span>
                  </label>
                </div>

                {/* Featured Toggle */}
                <div className="admin-form-group">
                  <label className="admin-form-toggle">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="admin-form-toggle-input"
                      disabled={loading}
                    />
                    <div className="admin-form-toggle-slider"></div>
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>
                      {t('common.featured')}
                    </span>
                  </label>
                </div>

                {/* Language */}
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.language')}</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="admin-form-control"
                    disabled={loading}
                  >
                    <option value="en">{t('common.languages.english')}</option>
                    <option value="ne">{t('common.languages.nepali')}</option>
                  </select>
                </div>

                {/* Category */}
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.category')}</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="admin-form-control"
                    disabled={loading}
                  >
                    {poemCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Metadata */}
              <div className="admin-form-section">
                <h3 className="admin-form-section__title">
                  <Tag size={20} />
                  {t('common.metadata', 'Metadata')}
                </h3>

                {/* Author */}
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('hero.full-name')}</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="admin-form-control"
                      placeholder={t('hero.name-placeholder')}
                      disabled={loading}
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.tags')} ({formData.tags.length}/10)</label>
                  <div className="admin-form-tags-container">
                    {formData.tags.map(tag => (
                      <span key={tag} className="admin-form-tag">
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} disabled={loading} className="admin-form-tag-remove">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => { setTagInput(e.target.value); setErrors(prev => ({ ...prev, tags: "" })); }}
                      onKeyDown={handleAddTag}
                      className="admin-form-tag-input"
                      placeholder={t('poems.add-tag')}
                      disabled={loading || formData.tags.length >= 10}
                    />
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="admin-form-section">
                <h3 className="admin-form-section__title">
                  <ImageIcon size={20} />
                  {t('poems.featured-image')}
                </h3>
                
                <div className="admin-form-group">
                  <input
                    type="file"
                    id="featured-image-upload"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingImage || loading}
                  />

                  {!imagePreview ? (
                    <div
                      className={`admin-form-upload-area ${errors.featuredImage ? 'admin-form-upload-area--error' : ''}`}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Upload className="admin-form-upload-icon" />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('common.upload')}</span>
                      <span style={{ fontSize: '12px' }}>{t('projects.form.image-upload-help')}</span>
                    </div>
                  ) : (
                    <div className="admin-form-image-preview">
                      <img
                        src={imagePreview}
                        alt={formData.featuredImage.alt || t('poems.featured-image')}
                      />
                      <button 
                        type="button" 
                        className="admin-form-image-remove" 
                        onClick={removeImage}
                        disabled={loading}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  {errors.featuredImage && <span className="admin-form-error"><AlertCircle size={14} /> {errors.featuredImage}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-form-actions" style={{ border: 'none', marginTop: 0, paddingTop: 0 }}>
                <button
                  type="submit"
                  className="btn-admin btn-admin--primary u-w-full"
                  disabled={loading || uploadingImage}
                >
                  {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminPageLayout>
  );
};

export default EditPoem;
