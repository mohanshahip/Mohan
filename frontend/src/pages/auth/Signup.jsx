// pages/Auth/Signup.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Signup.css';

const Signup = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1: Signup, 2: Verification
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const { register, verifyEmail, resendOTP, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    let strength = 0;
    const { password } = formData;
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setTermsAccepted(checked);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    if (name === 'password' || name === 'confirmPassword') {
      if (errors.confirmPassword && formData.password === formData.confirmPassword) {
        setErrors({
          ...errors,
          confirmPassword: ''
        });
      }
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (index === idx ? element.value : d))]);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    try {
      await verifyEmail(formData.email, code);
      navigate('/admin/dashboard');
    } catch (error) {
      setErrors({ otp: error.response?.data?.error || t('auth.signup.invalid-code') });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await resendOTP(formData.email, 'verification');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      setErrors({ otp: t('auth.signup.failed-to-resend') });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = t('auth.signup.username-required');
    } else if (formData.username.length < 3) {
      newErrors.username = t('auth.signup.username-too-short');
    } else if (formData.username.length > 30) {
      newErrors.username = t('auth.signup.username-too-long');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = t('auth.signup.username-invalid');
    }
    
    if (!formData.email) {
      newErrors.email = t('auth.signup.email-required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.signup.email-invalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.signup.password-required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.signup.password-too-short');
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = t('auth.signup.password-lowercase');
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = t('auth.signup.password-uppercase');
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('auth.signup.password-number');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.signup.confirm-password-required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.signup.passwords-do-not-match');
    }

    if (!termsAccepted) {
      newErrors.terms = t('auth.signup.terms-required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await register(formData);
      setStep(2);
      setTimer(60);
    } catch (error) {
      const responseError = error.response?.data?.error;
      if (responseError) {
        setErrors({ general: t(`auth.errors.${responseError}`, responseError) });
      } else {
        setErrors({ general: t('auth.signup.registration-failed') });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'strength-weak';
    if (passwordStrength <= 3) return 'strength-fair';
    if (passwordStrength <= 4) return 'strength-good';
    return 'strength-strong';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return t('auth.signup.strength.weak');
    if (passwordStrength <= 3) return t('auth.signup.strength.fair');
    if (passwordStrength <= 4) return t('auth.signup.strength.good');
    return t('auth.signup.strength.strong');
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2 className="signup-title">{step === 1 ? t('auth.signup.title') : t('auth.signup.verify-title')}</h2>
          <p className="signup-subtitle">
            {step === 1 ? (
              <>
                {t('auth.signup.already-have-account')}{' '}
                <Link to="/login" className="signup-link">{t('admin.signIn')}</Link>
              </>
            ) : (
              t('auth.signup.verification-sent', { email: formData.email })
            )}
          </p>
        </div>
        
        {step === 1 ? (
          <form className="signup-form" onSubmit={handleSubmit}>
            {errors.general && <div className="signup-error-general">{errors.general}</div>}
            
            <div className="signup-input-group">
              <div className="signup-row">
                <div className="signup-field">
                  <label htmlFor="firstName" className="signup-label">{t('admin.first-name')}</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="signup-input"
                    placeholder={t('auth.signup.first-name-placeholder')}
                  />
                </div>
                
                <div className="signup-field">
                  <label htmlFor="lastName" className="signup-label">{t('admin.last-name')}</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="signup-input"
                    placeholder={t('auth.signup.last-name-placeholder')}
                  />
                </div>
              </div>
              
              <div className="signup-field">
                <label htmlFor="username" className="signup-label">{t('admin.username')}</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`signup-input ${errors.username ? 'signup-input-error' : ''}`}
                  placeholder={t('auth.signup.username-placeholder')}
                />
                {errors.username && <p className="signup-error-text">{errors.username}</p>}
              </div>
              
              <div className="signup-field">
                <label htmlFor="email" className="signup-label">{t('contact.email-address')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`signup-input ${errors.email ? 'signup-input-error' : ''}`}
                  placeholder={t('auth.signup.email-placeholder')}
                />
                {errors.email && <p className="signup-error-text">{errors.email}</p>}
              </div>
              
              <div className="signup-field">
                <label htmlFor="password" className="signup-label">{t('admin.new-password')}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`signup-input ${errors.password ? 'signup-input-error' : ''}`}
                  placeholder={t('auth.signup.password-placeholder')}
                />
                {formData.password && (
                  <div className="signup-strength">
                    <div className="signup-strength-bar">
                      <div 
                        className={`signup-strength-fill ${getPasswordStrengthColor()}`} 
                        style={{ '--strength-width': `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="signup-strength-text">{t('auth.signup.password-strength')}: {getPasswordStrengthText()}</span>
                  </div>
                )}
                {errors.password && <p className="signup-error-text">{errors.password}</p>}
              </div>

              <div className="signup-field">
                <label htmlFor="confirmPassword" className="signup-label">{t('admin.confirm-new-password')}</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`signup-input ${errors.confirmPassword ? 'signup-input-error' : ''}`}
                  placeholder={t('auth.signup.confirm-password-placeholder')}
                />
                {errors.confirmPassword && <p className="signup-error-text">{errors.confirmPassword}</p>}
              </div>

              <div className="signup-terms">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={handleChange}
                  className="signup-checkbox"
                />
                <label htmlFor="terms" className="signup-checkbox-label">
                  {t('admin.agreeTo')} <a href="#" className="signup-terms-link">{t('footer.terms-of-service')}</a> {t('admin.and')} <a href="#" className="signup-terms-link">{t('footer.privacy-policy')}</a>
                </label>
              </div>
              {errors.terms && <p className="signup-error-text">{errors.terms}</p>}
            </div>

            <div className="signup-button-group">
              <button type="submit" disabled={loading || passwordStrength < 3 || !termsAccepted} className="signup-button">
                {loading ? t('auth.signup.creating-account') : t('auth.signup.create-account')}
              </button>
            </div>
          </form>
        ) : (
          <form className="signup-form" onSubmit={handleVerifyOtp}>
            {errors.otp && <div className="signup-error-general">{errors.otp}</div>}
            
            <div className="signup-otp-container">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="signup-otp-input"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  disabled={loading}
                />
              ))}
            </div>

            <div className="signup-button-group">
              <button type="submit" disabled={loading || otp.join('').length !== 6} className="signup-button">
                {loading ? t('auth.signup.verifying') : t('auth.signup.verify-and-sign-in')}
              </button>
            </div>

            <div className="signup-resend">
              <p>
                {t('auth.signup.did-not-receive-code')}{' '}
                <button type="button" onClick={handleResendOtp} disabled={loading || timer > 0} className="signup-resend-button">
                  {timer > 0 ? t('auth.signup.resend-in', { timer }) : t('auth.signup.resend-now')}
                </button>
              </p>
              <button type="button" onClick={() => setStep(1)} className="signup-back-button">{t('common.back')}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;