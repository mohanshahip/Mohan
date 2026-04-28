// pages/Auth/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, Shield, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import '../../styles/ResetPassword.css';

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setError(t('auth.invalid-token'));
    }
  }, [token, t]);

  const validateForm = () => {
    const errors = {};
    
    if (!password) {
      errors.password = t('admin.validation.password-required');
    } else if (password.length < 8) {
      errors.password = t('admin.validation.password-min-length');
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = t('auth.password-lowercase');
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = t('auth.password-uppercase');
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = t('auth.password-number');
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = t('admin.validation.confirm-password-required');
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t('admin.validation.passwords-do-not-match');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await api.put(`/auth/reset-password/${token}`, { 
        password: password
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: { message: t('auth.password-changed-success') }
        });
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || t('auth.failed-to-reset'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <div className="icon-wrapper">
            <Shield size={32} />
          </div>
          <h2 className="reset-password-title">{t('auth.reset-password')}</h2>
          <p className="reset-password-subtitle">
            {t('auth.enter-new-password')}
          </p>
        </div>
        
        {success ? (
          <div className="reset-password-success" role="alert">
            <div className="success-icon-wrapper">
              <CheckCircle2 size={48} />
            </div>
            <h3>{t('auth.password-reset-success')}</h3>
            <p>{t('auth.password-changed-success')}</p>
            <p className="redirect-text">{t('auth.redirecting')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reset-password-form">
            {error && (
              <div className="reset-password-error" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={16} />
                {t('auth.new-password')}
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={validationErrors.password ? 'input-error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && <p className="error-text">{validationErrors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={16} />
                {t('auth.confirm-new-password')}
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={validationErrors.confirmPassword ? 'input-error' : ''}
                disabled={loading}
              />
              {validationErrors.confirmPassword && <p className="error-text">{validationErrors.confirmPassword}</p>}
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  {t('auth.resetting')}
                </>
              ) : (
                <>
                  {t('auth.reset-password')}
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="reset-password-footer">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} />
            {t('auth.back-to-login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;