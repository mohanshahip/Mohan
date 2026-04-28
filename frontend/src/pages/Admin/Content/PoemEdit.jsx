// components/admin/PoemEdit.jsx
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Loader, Upload, X, AlertCircle, Check, Image as ImageIcon, Globe, BookOpen, Tag, Clock, User, Eye, EyeOff, Star } from "lucide-react";
import api from "../../../services/api";
import AdminPageLayout from "../../../components/common/AdminPageLayout";

const PoemEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: t('hero.full-name'),
    language: i18n.language === 'np' ? 'ne' : 'en',
    category: "other",
    tags: [],
    images: [],
    readingTime: 2,
    isPublished: true,
    isFeatured: false
  });
  
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchPoem = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/poems/${id}`);
        if (response.data.success) {
          const poem = response.data.data;
          
          // Handle migration from featuredImage to images
          const initialImages = (poem.images && poem.images.length > 0) 
            ? poem.images.map(img => ({ ...img, id: img.id || img._id }))
            : (poem.featuredImage ? [{ ...poem.featuredImage, isPrimary: true, id: 'legacy-primary' }] : []);

          setFormData({
            title: poem.title || "",
            content: poem.content || "",
            excerpt: poem.excerpt || "",
            author: poem.author || t('hero.full-name'),
            language: poem.language || (i18n.language === 'np' ? 'ne' : 'en'),
            category: poem.category || "other",
            tags: poem.tags || [],
            images: initialImages,
            readingTime: poem.readingTime || 2,
            isPublished: poem.isPublished || false,
            isFeatured: poem.isFeatured || false
          });
        } else {
          setError(t('poems.fetchError'));
        }
      } catch (err) {
        setError(t('poems.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    fetchPoem();
  }, [id, t, i18n.language]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = t('validation.title-required');
    }
    if (!formData.content.trim()) {
      errors.content = t('validation.content-required');
    }
    if (formData.images.length === 0) {
      errors.images = t('validation.image-required');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = files.map(file => {
      return {
        id: Date.now() + Math.random(),
        file: file,
        url: URL.createObjectURL(file),
        alt: file.name.replace(/\.[^/.]+$/, "") || t('poems.imageAlt'),
        isPrimary: false
      };
    });

    setFormData(prev => {
      const updatedImages = [...prev.images, ...newImages];
      if (!updatedImages.some(img => img.isPrimary) && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }
      return { ...prev, images: updatedImages };
    });
    setFormErrors(prev => ({ ...prev, images: "" }));
  };

  const setPrimaryImage = (id) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isPrimary: img.id === id
      }))
    }));
  };

  const removeImage = (id) => {
    setFormData(prev => {
      const imageToRemove = prev.images.find(img => img.id === id);
      if (imageToRemove && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      const newImages = prev.images.filter(img => img.id !== id);
      if (imageToRemove?.isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      if (newImages.length === 0) {
        setFormErrors(prev => ({ ...prev, images: t('validation.image-required') }));
      }
      return { ...prev, images: newImages };
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag) && formData.tags.length < 10) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
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

  const uploadImagesToServer = async (files) => {
    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      files.forEach(file => {
        uploadFormData.append('image', file);
      });
      const response = await api.post('/poems/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to upload images');
      }
    } catch (error) {
      setError(error.message || t('validation.image-upload-failed'));
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      let finalImages = [];
      const newFilesToUpload = formData.images.filter(img => img.file);
      const existingImages = formData.images.filter(img => !img.file);

      if (newFilesToUpload.length > 0) {
        const uploadedImages = await uploadImagesToServer(newFilesToUpload.map(img => img.file));
        if (!uploadedImages) return;
        
        let uploadedImagesWithProps = uploadedImages.map(uploadedImg => {
          const originalImage = newFilesToUpload.find(img => img.file.name === uploadedImg.originalName);
          return {
            url: uploadedImg.url,
            alt: originalImage?.alt || uploadedImg.originalName,
            isPrimary: originalImage?.isPrimary || false
          };
        });
        finalImages = [...existingImages, ...uploadedImagesWithProps];
      } else {
        finalImages = existingImages;
      }

      if (finalImages.length > 0 && !finalImages.some(img => img.isPrimary)) {
        finalImages[0].isPrimary = true;
      }

      const submitData = { ...formData, images: finalImages };
      const response = await api.put(`/poems/${id}`, submitData);

      if (response.data.success) {
        setSuccessMessage(t('poems.updatedSuccess'));
        setTimeout(() => navigate("/admin/poems"), 2000);
      } else {
        throw new Error(response.data.error || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
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

  return (
    <AdminPageLayout
      icon={<BookOpen size={24} />}
      title={t('poems.editTitle')}
      subtitle={t('poems.editSubtitle')}
      showBack={true}
      onBack={() => navigate("/admin/poems")}
      actions={
        <button 
          type="submit" 
          form="poem-edit-form"
          className="btn-admin btn-admin--primary"
          disabled={loading}
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{t('common.save')}</span>
        </button>
      }
    >
      <div className="admin-form-container">
        {/* Messages */}
        {error && (
          <div className="admin-form-alert admin-form-alert--error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="admin-form-alert admin-form-alert--success">
            <Check size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form id="poem-edit-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-form-column">
              <div className="admin-form-section">
                <h3 className="admin-form-section__title">
                  <BookOpen size={20} />
                  {t('projects.form.basic-information')}
                </h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.title')} *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`admin-form-control ${formErrors.title ? 'admin-form-control--error' : ''}`}
                    disabled={loading}
                  />
                  {formErrors.title && <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.title}</span>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.description')} *</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className={`admin-form-control ${formErrors.excerpt ? 'admin-form-control--error' : ''}`}
                    rows="3"
                    disabled={loading}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('poems.enter-content')} *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className={`admin-form-control ${formErrors.content ? 'admin-form-control--error' : ''}`}
                    rows="15"
                    disabled={loading}
                  />
                  {formErrors.content && <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.content}</span>}
                </div>
              </div>
            </div>
            <div className="admin-form-column">
              <div className="admin-form-section">
                <h3 className="admin-form-section__title">
                  <Globe size={20} />
                  {t('common.settings', 'Settings')}
                </h3>
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
              <div className="admin-form-section">
                <h3 className="admin-form-section__title">
                  <ImageIcon size={20} />
                  {t('common.images')} *
                </h3>
                <div className="admin-form-group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="u-hidden"
                    disabled={loading}
                  />
                  <div className="admin-form-upload-area" onClick={triggerFileInput}>
                    <Upload className="admin-form-upload-icon" />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('gallery.admin.clickToUpload')}</p>
                    <p style={{ fontSize: '12px' }}>{t('gallery.admin.uploadHint')}</p>
                  </div>
                  {formErrors.images && <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.images}</span>}
                </div>
                {formData.images.length > 0 && (
                  <div className="admin-image-preview-grid">
                    {formData.images.map((img) => (
                      <div key={img.id || img._id} className="admin-form-image-preview">
                        <img src={(img.url.startsWith('blob:') || img.url.startsWith('http')) ? img.url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${img.url}`} alt={img.alt} />
                        <div className="admin-image-preview-actions">
                          <button
                            type="button"
                            className={`admin-badge ${img.isPrimary ? 'admin-badge--success' : 'admin-badge--secondary'}`}
                            onClick={() => setPrimaryImage(img.id || img._id)}
                            style={{ cursor: 'pointer', fontSize: '10px' }}
                          >
                            {img.isPrimary ? t('common.primary') : t('common.setPrimary')}
                          </button>
                          <button
                            type="button"
                            className="admin-form-image-remove"
                            onClick={() => removeImage(img.id || img._id)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="admin-form-section">
                <h3 className="admin-form-section__title">
                  <Tag size={20} />
                  {t('common.metadata', 'Metadata')}
                </h3>
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
                      disabled={loading}
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>
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
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInput}
                      className="admin-form-tag-input"
                      placeholder={t('poems.add-tag')}
                      disabled={loading || formData.tags.length >= 10}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-form-actions">
                <button
                  type="submit"
                  className="btn-admin btn-admin--primary u-w-full"
                  disabled={loading || uploadingImage}
                >
                  {loading || uploadingImage ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                  {t('poems.updatePoem')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminPageLayout>
  );
};

export default PoemEdit;
