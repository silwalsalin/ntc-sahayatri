// src/pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Try to import local images with fallback
let ntcLogo, govLogo, heroImage;
try {
  ntcLogo = require('../img/ntc-logo.png');
} catch (e) {
  ntcLogo = null;
}
try {
  govLogo = require('../img/logo.png');
} catch (e) {
  govLogo = null;
}
try {
  heroImage = require('../img/image.png');
} catch (e) {
  heroImage = null;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  
  // Language state
  const [language, setLanguage] = useState('np');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Retrieve email from session storage
    const storedEmail = sessionStorage.getItem('resetEmail');
    
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect back to forgot password
      navigate('/forgot-password');
    }
  }, [navigate]);

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength(newPassword);
  
  const getStrengthText = () => {
    if (!newPassword) return '';
    const texts = {
      np: ['कमजोर', 'मध्यम', 'बलियो', 'धेरै बलियो'],
      en: ['Weak', 'Medium', 'Strong', 'Very Strong']
    };
    return texts[language][passwordStrength - 1] || '';
  };
  
  const getStrengthColor = () => {
    const colors = ['#ff4444', '#ffaa44', '#44ff44', '#00aa44'];
    return colors[passwordStrength - 1] || '#e0e0e0';
  };

  const content = {
    np: {
      weAreHere: 'हामी तपाईंको लागि यहाँ छौं',
      contactNumber: 'सम्पर्क नम्बर: ०१-४९६०००८',
      emailAddress: 'इमेल ठेगाना:',
      departmentName: 'नेपाल दूरसञ्चार प्राधिकरण',
      departmentAddress: 'भद्रकाली प्लाजा, काठमाडौं',
      serviceName: 'एनटीसी सहयात्री',
      serviceSub: 'गुनासो ट्र्याकिङ प्रणाली',
      home: 'गृह पृष्ठ',
      faqs: 'बारम्बार सोधिने प्रश्नहरू',
      login: 'लगइन',
      resetPassword: 'पासवर्ड रिसेट गर्नुहोस्',
      newPassword: 'नयाँ पासवर्ड',
      enterNewPassword: 'नयाँ पासवर्ड प्रविष्ट गर्नुहोस्',
      confirmPassword: 'पासवर्ड पुष्टि गर्नुहोस्',
      enterConfirmPassword: 'पासवर्ड पुन: प्रविष्ट गर्नुहोस्',
      resetBtn: 'पासवर्ड रिसेट गर्नुहोस्',
      backToLogin: 'लगइन पृष्ठमा फर्कनुहोस्',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      passwordRequired: 'कृपया नयाँ पासवर्ड प्रविष्ट गर्नुहोस्',
      passwordMismatch: 'पासवर्ड मिलेन। कृपया फेरि प्रयास गर्नुहोस्',
      passwordLength: 'पासवर्ड कम्तीमा ६ क्यारेक्टरको हुनुपर्छ',
      passwordReset: 'पासवर्ड सफलतापूर्वक रिसेट भयो! कृपया नयाँ पासवर्ड प्रयोग गरी लगइन गर्नुहोस्',
      passwordStrength: 'पासवर्ड बलियोपन:',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      redirecting: 'पुन: निर्देशित हुँदै...'
    },
    en: {
      weAreHere: 'We are here for you',
      contactNumber: '01-4960008',
      emailAddress: 'Email Address:',
      departmentName: 'Nepal Telecommunications Authority',
      departmentAddress: 'Bhadrakali Plaza, Kathmandu',
      serviceName: 'NTC Sahayatri',
      serviceSub: 'Complaint Tracking System',
      home: 'Home',
      faqs: 'FAQs',
      login: 'Login',
      resetPassword: 'Reset Password',
      newPassword: 'New Password',
      enterNewPassword: 'Enter new password',
      confirmPassword: 'Confirm Password',
      enterConfirmPassword: 'Re-enter your password',
      resetBtn: 'Reset Password',
      backToLogin: 'Back to Login',
      backToHome: 'Back to Home',
      passwordRequired: 'Please enter a new password',
      passwordMismatch: 'Passwords do not match',
      passwordLength: 'Password must be at least 6 characters',
      passwordReset: 'Password reset successfully! Please login with your new password',
      passwordStrength: 'Password Strength:',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      redirecting: 'Redirecting...'
    }
  };

  const t = content[language];

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newPassword) {
      setError(t.passwordRequired);
      return;
    }
    
    if (newPassword.length < 6) {
      setError(t.passwordLength);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    
    setLoading(true);
    
    // Simulate API call to reset password
    setTimeout(() => {
      setSuccess(t.passwordReset);
      setLoading(false);
      
      // Clear session storage
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetOtp');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/admin-login');
      }, 2000);
    }, 1500);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const LogoImage = ({ src, alt, fallback, className }) => {
    const [imgError, setImgError] = useState(false);
    
    if (imgError || !src) {
      return <div className={`logo-fallback ${className}`}>{fallback}</div>;
    }
    
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <div className="reset-password-page">
      {/* HEADER 1 - Top Bar */}
      <div className="header-1">
        <div className="container-1">
          <div className="header-left">
            <div className="we-are-here">
              <span className="quote-text">{t.weAreHere}</span>
            </div>
          </div>
          <div className="header-right">
            <div className="contact-info-group">
              <div className="contact-info-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">{t.contactNumber}</span>
              </div>
              <div className="contact-info-item">
                <span className="contact-icon">✉️</span>
                <span className="contact-text">{t.emailAddress}</span>
              </div>
            </div>
            <div className="language-dropdown">
              <button 
                className="language-selector"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <span className="lang-icon">🌐</span>
                <span className="lang-text">{language === 'np' ? 'नेपाली' : 'English'}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {showLanguageDropdown && (
                <div className="dropdown-menu">
                  <button 
                    className={`dropdown-item ${language === 'np' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('np')}
                  >
                    <span className="lang-flag">🇳🇵</span>
                    <span>नेपाली</span>
                  </button>
                  <button 
                    className={`dropdown-item ${language === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    <span className="lang-flag">🇬🇧</span>
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HEADER 2 - Department Level with Logos */}
      <div className="header-2">
        <div className="container-2">
          <div className="logo-left">
            <LogoImage 
              src={ntcLogo} 
              alt="NTC Logo" 
              fallback="📡"
              className="ntc-logo"
            />
          </div>
          <div className="dept-text-center">
            <div className="dept-name">{t.departmentName}</div>
            <div className="dept-address">{t.departmentAddress}</div>
          </div>
          <div className="logo-right">
            <LogoImage 
              src={govLogo} 
              alt="Government Logo" 
              fallback="🇳🇵"
              className="gov-logo"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="reset-container">
          <div className="reset-card">
            <div className="reset-header">
              <div className="reset-icon">🔒</div>
              <h2>{t.resetPassword}</h2>
              <p>{t.emailAddress} {email}</p>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                <span>{success}</span>
                {loading && <span className="redirect-text">{t.redirecting}</span>}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="reset-form">
              <div className="form-group">
                <label>{t.newPassword}</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.enterNewPassword}
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {newPassword && (
                  <div className="password-strength">
                    <span className="strength-label">{t.passwordStrength}</span>
                    <div className="strength-bar">
                      <div 
                        className="strength-level" 
                        style={{ 
                          width: `${(passwordStrength / 4) * 100}%`,
                          backgroundColor: getStrengthColor()
                        }}
                      ></div>
                    </div>
                    <span className="strength-text" style={{ color: getStrengthColor() }}>
                      {getStrengthText()}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{t.confirmPassword}</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.enterConfirmPassword}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <div className="password-match-error">
                    <span>⚠️</span> {t.passwordMismatch}
                  </div>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                  <div className="password-match-success">
                    <span>✅</span> पासवर्ड मिल्यो
                  </div>
                )}
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <span className="loading-spinner"></span> : null}
                {loading ? (language === 'np' ? 'रिसेट गर्दै...' : 'Resetting...') : t.resetBtn}
              </button>
            </form>

            <div className="back-links">
              <button onClick={() => navigate('/admin-login')} className="btn-back-link">
                ← {t.backToLogin}
              </button>
            
            </div>
          </div>
        </div>
      </div>

      

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .reset-password-page {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          color: #1a2c3e;
          min-height: 100vh;
        }

        /* HEADER 1 - Top Bar */
        .header-1 {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
          color: white;
          padding: 10px 0;
          z-index: 1040;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .container-1 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .we-are-here {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          padding: 6px 20px;
          border-radius: 40px;
          font-weight: 500;
        }

        .quote-text {
          font-size: 0.9rem;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 25px;
          flex-wrap: wrap;
        }

        .contact-info-group {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .contact-info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          background: rgba(255,255,255,0.1);
          padding: 5px 12px;
          border-radius: 30px;
          transition: all 0.3s ease;
        }

        .contact-info-item:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }

        .contact-icon { font-size: 0.85rem; }
        .contact-text { font-size: 0.75rem; font-weight: 500; }

        /* Language Dropdown */
        .language-dropdown { position: relative; }
        .language-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 5px 12px;
          border-radius: 30px;
          cursor: pointer;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .language-selector:hover { background: rgba(255,255,255,0.25); }
        .lang-icon { font-size: 0.85rem; }
        .dropdown-arrow { font-size: 0.6rem; margin-left: 5px; }
        .dropdown-menu {
          position: absolute;
          top: 38px;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 1050;
          min-width: 120px;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 14px;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
          text-align: left;
        }
        .dropdown-item:hover { background: #f0f2f5; }
        .dropdown-item.active { background: #1565c0; color: white; }
        .lang-flag { font-size: 1rem; }

        /* HEADER 2 - Department Level */
        .header-2 {
          position: fixed;
          top: 55px;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #e8f0fe 0%, #ffffff 100%);
          color: #1a2c3e;
          padding: 12px 0;
          z-index: 1030;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-bottom: 1px solid rgba(21, 101, 192, 0.15);
        }
        .container-2 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
        }
        .logo-left { flex: 1; display: flex; justify-content: flex-start; }
        .logo-right { flex: 1; display: flex; justify-content: flex-end; }
        .ntc-logo, .gov-logo { height: 50px; width: auto; object-fit: contain; }
        .logo-fallback {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1565c0, #42a5f5);
          border-radius: 50%;
          color: white;
        }
        .dept-text-center { flex: 2; text-align: center; }
        .dept-name { font-size: 1rem; font-weight: 700; color: #0d47a1; letter-spacing: 1px; }
        .dept-address { font-size: 0.75rem; opacity: 0.7; color: #555; margin-top: 3px; }

        /* Main Content */
        .main-content {
          padding-top: 135px;
          min-height: calc(100vh - 235px);
        }

        .reset-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .reset-card {
          background: white;
          border-radius: 32px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
        }

        .reset-header {
          margin-bottom: 32px;
        }

        .reset-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .reset-header h2 {
          font-size: 1.8rem;
          color: #0d47a1;
          margin-bottom: 8px;
        }

        .reset-header p {
          color: #6c8196;
          font-size: 0.85rem;
          word-break: break-all;
        }

        /* Error and Success Messages */
        .error-message {
          background: #ffebee;
          border-left: 4px solid #f44336;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .success-message {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .error-icon, .success-icon {
          font-size: 1.1rem;
        }

        .error-message span:last-child {
          color: #c62828;
          font-size: 0.85rem;
        }

        .success-message span:last-child {
          color: #2e7d32;
          font-size: 0.85rem;
        }

        .redirect-text {
          font-size: 0.75rem;
          color: #1565c0;
          margin-left: auto;
        }

        /* Form Styles */
        .reset-form {
          text-align: left;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c4e6e;
          font-size: 0.9rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          font-size: 1rem;
          color: #1565c0;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: #f8fafc;
        }

        .form-group input:focus {
          outline: none;
          border-color: #1565c0;
          background: white;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0;
        }

        /* Password Strength Indicator */
        .password-strength {
          margin-top: 8px;
        }

        .strength-label {
          font-size: 0.7rem;
          color: #888;
          margin-right: 8px;
        }

        .strength-bar {
          height: 4px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin: 8px 0;
        }

        .strength-level {
          height: 100%;
          transition: width 0.3s ease;
        }

        .strength-text {
          font-size: 0.7rem;
          font-weight: 500;
        }

        /* Password Match Indicators */
        .password-match-error {
          font-size: 0.7rem;
          color: #c62828;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .password-match-success {
          font-size: 0.7rem;
          color: #2e7d32;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          color: white;
          border: none;
          border-radius: 40px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(21, 101, 192, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Back Links */
        .back-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .btn-back-link {
          background: transparent;
          border: none;
          color: #1565c0;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 8px 16px;
          border-radius: 30px;
          transition: all 0.3s ease;
        }

        .btn-back-link:hover {
          background: #e3f2fd;
          text-decoration: underline;
        }

      

        /* Responsive */
        @media (max-width: 768px) {
          .main-content { padding-top: 200px; }
          .reset-card { padding: 32px 24px; }
          .reset-header h2 { font-size: 1.5rem; }
          .back-links { flex-direction: column; align-items: center; gap: 10px; }
          .container-1, .container-2 { flex-direction: column; text-align: center; }
          .header-left, .header-right, .logo-left, .logo-right { justify-content: center; }
          .contact-info-group { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;