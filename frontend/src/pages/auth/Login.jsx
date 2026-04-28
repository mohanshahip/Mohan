// pages/Auth/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Login.css';

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      if (user.role === 'superadmin') {
        navigate('/admin/manage-admins', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('admin.validation.email-required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('admin.validation.email-invalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('admin.validation.password-required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      await login(formData);
    } catch (error) {
      console.error('Login error:', error);
      
      const responseError = error.response?.data?.error;
      
      if (error.response?.status === 403) {
        setErrors({ general: t('auth.account-deactivated') });
      } else if (error.response?.status === 429) {
        setErrors({ general: responseError || t('auth.too-many-attempts') });
      } else if (responseError) {
        // Map backend errors to translation keys if they look like keys, 
        // otherwise display the backend message directly
        setErrors({ general: t(`auth.errors.${responseError}`, responseError) });
      } else if (error.request) {
        setErrors({ general: t('auth.connection-error') });
      } else {
        setErrors({ general: t('auth.login-failed') });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <User size={32} className="login-user-icon" />
          </div>
          <h2 className="login-title">{t('auth.login')}</h2>
          <p className="login-subtitle">
            {t('auth.secure-access')}
          </p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="login-error-general" role="alert">
              <span className="error-icon">!</span>
              {errors.general}
            </div>
          )}
          
          <div className="login-fields">
            <div className="login-field">
              <label htmlFor="email" className="login-input-label">
                <Mail size={16} />
                {t('contact.email-address')}
              </label>
              <div className="login-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`login-input ${errors.email ? 'login-input-error' : ''}`}
                  placeholder="admin@example.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="login-error-text" role="alert">{errors.email}</p>
              )}
            </div>
            
            <div className="login-field">
              <label htmlFor="password" className="login-input-label">
                <Lock size={16} />
                {t('admin.password')}
              </label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`login-input ${errors.password ? 'login-input-error' : ''}`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="login-error-text" role="alert">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="login-forgot-password">
            <Link to="/forgot-password" title={t('auth.forgot-password')} className="login-forgot-link">
              {t('auth.forgot-password')}
            </Link>
          </div>

          <div className="login-button-group">
            <button type="submit" disabled={loading} className="login-button">
              {loading ? (
                <>
                  <div className="loader-spinner"></div>
                  {t('auth.signing-in')}
                </>
              ) : (
                <>
                  <span>{t('auth.sign-in')}</span>
                  <LogIn size={18} className="btn-login-icon" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            {t('auth.restricted-area')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;