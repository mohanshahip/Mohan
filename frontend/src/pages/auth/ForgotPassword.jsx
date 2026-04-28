// pages/Auth/ForgotPassword.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, Shield, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forgotPassword, verifyOTP, resendOTP } = useAuth();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setValidationError(t('auth.valid-email-required'));
      return;
    }
    
    setLoading(true);
    setError('');
    setValidationError('');
    
    try {
      await forgotPassword(email);
      setStep(2);
      setTimer(60); // 60 seconds cooldown for resend
    } catch (err) {
      setError(err.response?.data?.error || t('auth.failed-to-send-reset-email'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
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

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length !== 6) {
      setError(t('auth.pleaseEnterCompleteCode'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyOTP(email, code);
      if (res.success && res.resetToken) {
        navigate(`/reset-password/${res.resetToken}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || t('auth.invalidOTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      await resendOTP(email);
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || t('auth.failed-to-send-reset-email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <div className="icon-wrapper">
            <Shield size={32} />
          </div>
          <h2 className="forgot-password-title">{t('auth.forgot-password')}</h2>
          <p className="forgot-password-subtitle">
            {step === 1 ? t('auth.enterEmailToReset') : t('auth.enterOtpSent')}
          </p>
        </div>

        {error && (
          <div className="forgot-password-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="forgot-password-form" onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} />
                {t('admin.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('admin.enter-email')}
                className={validationError ? 'input-error' : ''}
                disabled={loading}
              />
              {validationError && <p className="error-text">{validationError}</p>}
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  {t('auth.sending')}
                </>
              ) : (
                <>
                  {t('auth.send-reset-link')}
                  <ArrowLeft size={18} className="rotate-180" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="forgot-password-form" onSubmit={handleOtpSubmit}>
            <div className="otp-container">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  disabled={loading}
                />
              ))}
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  {t('auth.verifying')}
                </>
              ) : (
                <>
                  {t('auth.verifyOTP')}
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>

            <div className="resend-container">
              {timer > 0 ? (
                <p className="timer-text">
                  <Clock size={14} />
                  {t('auth.resendIn', { seconds: timer })}
                </p>
              ) : (
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  {t('auth.resendOTP')}
                </button>
              )}
            </div>
          </form>
        )}

        <div className="forgot-password-footer">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} />
            {t('auth.back-to-login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;