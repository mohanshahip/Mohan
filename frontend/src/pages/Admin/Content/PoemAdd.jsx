// components/admin/PoemAdd.jsx
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Loader, Upload, X, AlertCircle, Check, Image as ImageIcon, Globe, BookOpen, Tag, Clock, User, Eye, EyeOff, Star } from "lucide-react";
import api from "../../../services/api";
import AdminPageLayout from "../../../components/common/AdminPageLayout";

const PoemAdd = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: t('hero.full-name'),
    language: i18n.language === 'np' ? 'ne' : 'en',
    category: "other",
    tags: [],
    images: [], // Changed from featuredImage to images array
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

  // Auto-fill excerpt from content if empty
  useEffect(() => {
    if (formData.content && !formData.excerpt) {
      const excerpt = formData.content.substring(0, 200) + (formData.content.length > 200 ? '...' : '');
      setFormData(prev => ({ ...prev, excerpt }));
    }
  }, [formData.content, formData.excerpt]);

  // Calculate reading time when content changes
  useEffect(() => {
    if (formData.content) {
      const words = formData.content.trim().split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(words / 200));
      setFormData(prev => ({ ...prev, readingTime }));
    }
  }, [formData.content]);

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
    } else if (formData.title.length < 3) {
      errors.title = t('validation.title-too-short');
    }
    if (!formData.content.trim()) {
      errors.content = t('validation.content-required');
    } else if (formData.content.length < 10) {
      errors.content = t('validation.content-too-short');
    }
    if (!formData.excerpt.trim()) {
      errors.excerpt = t('validation.excerpt-required');
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
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(t('validation.invalid-image-type'));
        return null;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(t('validation.image-too-large'));
        return null;
      }
      return {
        id: Date.now() + Math.random(), // Unique ID for keying
        file: file,
        url: URL.createObjectURL(file),
        alt: file.name.replace(/\.[^/.]+$/, "") || t('poems.imageAlt'),
        isPrimary: false // Will be set later if it's the first image
      };
    }).filter(Boolean); // Remove nulls from invalid files

    if (newImages.length === 0) return;

    setFormData(prev => {
      const updatedImages = [...prev.images, ...newImages];
      // If no primary image exists, set the first new image as primary
      if (!updatedImages.some(img => img.isPrimary) && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }
      return { ...prev, images: updatedImages };
    });
    setError("");
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
      // If the removed image was primary, set the first remaining image as primary
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

      if (newTag.length > 20) {
        setError(t('validation.tag-too-long'));
        return;
      }
      if (!/^[a-zA-Z0-9\s]+$/.test(newTag)) {
        setError(t('validation.tag-invalid-chars'));
        return;
      }
      if (!formData.tags.includes(newTag) && formData.tags.length < 10) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
        setTagInput("");
        setError("");
      } else if (formData.tags.length >= 10) {
        setError(t('validation.max-tags'));
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
        uploadFormData.append('image', file); // field name must match multer
      });

      const response = await api.post('/poems/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data;
      if (data.success) {
        return data.data; // returns array of { url, alt }
      } else {
        throw new Error(data.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
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
        if (!uploadedImages) return; // upload failed
        
        // Map uploaded URLs back to their original image objects, preserving isPrimary
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

      // Ensure one image is primary if any exist
      if (finalImages.length > 0 && !finalImages.some(img => img.isPrimary)) {
        finalImages[0].isPrimary = true;
      }

      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        author: formData.author.trim(),
        language: formData.language,
        category: formData.category,
        tags: formData.tags,
        images: finalImages, // Use the new images array
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        readingTime: formData.readingTime
      };

      const response = await api.post('/poems', submitData);

      const data = response.data;
      if (data.success) {
        setSuccessMessage(t('poems.created-success'));

        setTimeout(() => {
          setFormData({
            title: "",
            content: "",
            excerpt: "",
            author: t('hero.full-name'),
            language: i18n.language === 'np' ? 'ne' : 'en',
            category: "other",
            tags: [],
            images: [], // Reset images
            readingTime: 2,
            isPublished: true,
            isFeatured: false
          });
          setTagInput("");
          setFormErrors({});
          // Revoke object URLs for previews
          formData.images.forEach(img => {
            if (img.url.startsWith('blob:')) {
              URL.revokeObjectURL(img.url);
            }
          });
        }, 1000);

        setTimeout(() => navigate("/admin/poems"), 2000);
      } else {
        throw new Error(data.error || t('common.error'));
      }
    } catch (error) {
      console.error("Error adding poem:", error);
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
      title={t('poems.add-new')}
      subtitle={t('poems.addSubtitle')}
      showBack={true}
      onBack={() => navigate("/admin/poems")}
      actions={
        <button 
          type="submit" 
          form="poem-add-form"
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
        {successMessage && (
          <div className="admin-badge admin-badge--success u-w-full u-mb-lg" style={{ padding: '12px', justifyContent: 'flex-start' }}>
            <Check size={18} />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="admin-badge admin-badge--danger u-w-full u-mb-lg" style={{ padding: '12px', justifyContent: 'flex-start' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Form */}
        <form id="poem-add-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            {/* Left Column - Main Content */}
            <div className="admin-form-column">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <BookOpen size={20} />
                  {t('poems.admin')}
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
                    className={`admin-form-control ${formErrors.title ? 'admin-form-control--error' : ''}`}
                    placeholder={t('poems.enter-title')}
                    disabled={loading}
                    maxLength={200}
                  />
                  {formErrors.title && <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.title}</span>}
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
                    className={`admin-form-control ${formErrors.excerpt ? 'admin-form-control--error' : ''}`}
                    rows="3"
                    placeholder={t('poems.enter-excerpt')}
                    disabled={loading}
                    maxLength={500}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  />
                  {formErrors.excerpt && <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.excerpt}</span>}
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
                    className={`admin-form-control ${formErrors.content ? 'admin-form-control--error' : ''}`}
                    rows="15"
                    placeholder={t('poems.enter-content')}
                    disabled={loading}
                    maxLength={5000}
                    style={{ minHeight: '400px', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  {formErrors.content && <span className="admin-form-error"><AlertCircle size={14} /> {formErrors.content}</span>}
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
                <h3 className="admin-form-section-title">
                  <Globe size={20} />
                  {t('common.settings')}
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

              {/* Image Upload */}
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
                      <div key={img.id} className="admin-form-image-preview">
                        <img src={img.url} alt={img.alt} />
                        <div className="admin-image-preview-actions">
                          <button
                            type="button"
                            className={`admin-badge ${img.isPrimary ? 'admin-badge--success' : 'admin-badge--secondary'}`}
                            onClick={() => setPrimaryImage(img.id)}
                            style={{ cursor: 'pointer', fontSize: '10px' }}
                          >
                            {img.isPrimary ? t('common.primary') : t('common.setPrimary')}
                          </button>
                          <button
                            type="button"
                            className="admin-form-image-remove"
                            onClick={() => removeImage(img.id)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="admin-form-section">
                <h3 className="admin-form-section__title">
                  <Tag size={20} />
                  {t('common.metadata', 'Metadata')}
                </h3>

                {/* Author */}
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    {t('common.author')}
                  </label>
                  <div className="admin-form-input-group">
                    <User size={18} className="admin-form-input-icon" />
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="admin-form-control"
                      placeholder={t('common.author')}
                      disabled={loading}
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="admin-form-group">
                  <label className="admin-form-label">{t('common.tags')}</label>
                  <div className="admin-form-input-group">
                    <Tag size={18} className="admin-form-input-icon" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInput}
                      className="admin-form-control"
                      placeholder={t('common.addTags')}
                      disabled={loading}
                    />
                  </div>
                  <div className="admin-form-tags-container">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="admin-form-tag">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminPageLayout>
  );
};

export default PoemAdd;
