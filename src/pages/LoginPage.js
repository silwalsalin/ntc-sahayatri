// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Try to import local images with fallback
let ntcLogo, govLogo;
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

const LoginPage = () => {
  const navigate = useNavigate();
  
  // Language state
  const [language, setLanguage] = useState('np');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Login form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // Error and loading state
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Handle scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if already logged in - Clear any existing session first
  useEffect(() => {
    // Clear any existing session to ensure clean login
    // Comment this out if you want to keep the session
    // localStorage.removeItem('adminToken');
    // localStorage.removeItem('adminUser');
    // localStorage.removeItem('userRole');
    // localStorage.removeItem('userName');
    // localStorage.removeItem('isLoggedIn');
    
    setIsCheckingAuth(false);
  }, []);

  const content = {
    np: {
      weAreHere: 'हामी तपाईंको लागि यहाँ छौं',
      contactNumber: 'सम्पर्क नम्बर: ०१-४९६०००८',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'नेपाल दूरसञ्चार प्राधिकरण',
      departmentAddress: 'भद्रकाली प्लाजा, काठमाडौं',
      serviceName: 'एनटीसी सहयात्री',
      serviceSub: 'गुनासो ट्र्याकिङ प्रणाली',
      home: 'गृह पृष्ठ',
      faqs: 'बारम्बार सोधिने प्रश्नहरू',
      login: 'प्रशासक लगइन',
      welcomeBack: 'पुन: स्वागत छ',
      loginToAccount: 'प्रशासक खातामा लगइन गर्नुहोस्',
      username: 'प्रयोगकर्ता नाम / इमेल',
      enterUsername: 'आफ्नो प्रयोगकर्ता नाम वा इमेल प्रविष्ट गर्नुहोस्',
      password: 'पासवर्ड',
      enterPassword: 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्',
      rememberMe: 'मलाई सम्झनुहोस्',
      forgotPassword: 'पासवर्ड बिर्सनुभयो?',
      loginBtn: 'प्रशासक लगइन',
      loggingIn: 'लगइन हुँदैछ...',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      demoCredentials: 'डेमो प्रमाणपत्रहरू:',
      adminUser: 'प्रशासक: admin@ntc',
      adminPass: 'पासवर्ड: admin123',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      loginSuccess: '✅ लगइन सफल! प्रशासक ड्यासबोर्डमा जाँदै...',
      loginError: '❌ अमान्य प्रयोगकर्ता नाम वा पासवर्ड।',
      requiredFields: 'कृपया प्रयोगकर्ता नाम र पासवर्ड भर्नुहोस्।'
    },
    en: {
      weAreHere: 'We are here for you',
      contactNumber: 'Contact: 01-4960008',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'Nepal Telecommunications Authority',
      departmentAddress: 'Bhadrakali Plaza, Kathmandu',
      serviceName: 'NTC Sahayatri',
      serviceSub: 'Complaint Tracking System',
      home: 'Home',
      faqs: 'FAQs',
      login: 'Admin Login',
      welcomeBack: 'Welcome Back',
      loginToAccount: 'Login to Admin Account',
      username: 'Username / Email',
      enterUsername: 'Enter your username or email',
      password: 'Password',
      enterPassword: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',
      loginBtn: 'Admin Login',
      loggingIn: 'Logging in...',
      backToHome: 'Back to Home',
      demoCredentials: 'Demo Credentials:',
      adminUser: 'Admin: admin@ntc',
      adminPass: 'Password: admin123',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      loginSuccess: '✅ Login successful! Redirecting to Admin Dashboard...',
      loginError: '❌ Invalid username or password.',
      requiredFields: 'Please enter username and password.'
    }
  };

  const t = content[language];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError(t.requiredFields);
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Demo authentication - Only Admin login allowed
    const username = formData.username.toLowerCase();
    const password = formData.password;

    // Admin login credentials
    if ((username === 'admin@ntc' || username === 'admin') && password === 'admin123') {
      // Clear any existing session first
      localStorage.clear();
      
      // Store admin session
      localStorage.setItem('adminToken', 'dummy-admin-token-' + Date.now());
      localStorage.setItem('adminUser', JSON.stringify({
        id: 1,
        name: 'Admin User',
        email: 'admin@ntc.com',
        role: 'admin',
        loginTime: new Date().toISOString()
      }));
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', 'Admin User');
      localStorage.setItem('isLoggedIn', 'true');
      
      // Show success message
      alert(t.loginSuccess);
      
      // Redirect to admin dashboard
      navigate('/admin-dashboard', { replace: true });
    } 
    else {
      setError(t.loginError);
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();
    // Reset form
    setFormData({
      username: '',
      password: '',
      rememberMe: false
    });
    setError('');
    // Reload the page to reset state
    window.location.reload();
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

  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* HEADER 1 - Top Bar */}
      <div className={`header-1 ${scrollY > 50 ? 'header-scrolled' : ''}`}>
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
      <div className={`header-2 ${scrollY > 50 ? 'header-scrolled' : ''}`}>
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
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">🔐</div>
              <h2>{t.welcomeBack}</h2>
              <p>{t.loginToAccount}</p>
            </div>

            {/* Clear Session Button */}
            <div className="clear-session">
              <button type="button" className="clear-session-btn" onClick={handleLogout}>
                🗑️ {language === 'np' ? 'सेसन सफा गर्नुहोस्' : 'Clear Session'}
              </button>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>{t.username}</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder={t.enterUsername}
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t.password}</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t.enterPassword}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span>{t.rememberMe}</span>
                </label>
                <a href="/forgot-password" className="forgot-password">{t.forgotPassword}</a>
              </div>

              <button type="submit" className="btn-login" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner">⏳</span> {t.loggingIn}
                  </>
                ) : (
                  <>
                    <span>🔓</span> {t.loginBtn}
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <div className="demo-title">{t.demoCredentials}</div>
              <div className="demo-info">
                <code>{t.adminUser}</code>
                <code>{t.adminPass}</code>
              </div>
            </div>

            <div className="back-to-home">
              <button onClick={() => navigate('/')} className="btn-back" disabled={isLoading}>
                ← {t.backToHome}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-copyright">
            <p>{t.footerTagline}</p>
            <p className="copyright-text">{t.copyright}</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-page {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          color: #1a2c3e;
          min-height: 100vh;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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
          transition: all 0.3s ease;
        }

        .header-1.header-scrolled {
          padding: 6px 0;
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
          flex-wrap: wrap;
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
          transition: all 0.3s ease;
        }

        .header-2.header-scrolled {
          padding: 8px 0;
          top: 45px;
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
          padding-top: 155px;
          min-height: calc(100vh - 200px);
        }

        .login-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .login-card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .login-header h2 {
          font-size: 1.8rem;
          color: #0d47a1;
          margin-bottom: 8px;
        }

        .login-header p {
          color: #6c8196;
        }

        .clear-session {
          text-align: right;
          margin-bottom: 16px;
        }

        .clear-session-btn {
          background: #fee2e2;
          border: none;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          cursor: pointer;
          color: #dc2626;
          transition: all 0.2s;
        }

        .clear-session-btn:hover {
          background: #fecaca;
        }

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

        .error-icon { font-size: 1.1rem; }
        .error-message span:last-child { color: #c62828; font-size: 0.85rem; }

        .login-form { text-align: left; }
        .form-group { margin-bottom: 24px; }
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
          background: #f0f0f0;
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

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          color: #2c4e6e;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .forgot-password {
          font-size: 0.85rem;
          color: #1565c0;
          text-decoration: none;
        }
        .forgot-password:hover { color: #0d47a1; text-decoration: underline; }

        .btn-login {
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

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(21, 101, 192, 0.3);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .demo-credentials {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e0e0e0;
        }

        .demo-title {
          font-size: 0.8rem;
          color: #888;
          margin-bottom: 12px;
          text-align: center;
        }

        .demo-info {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .demo-info code {
          background: #f5f5f5;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          color: #1565c0;
          font-family: monospace;
        }

        .back-to-home { margin-top: 24px; text-align: center; }
        .btn-back {
          background: transparent;
          border: 2px solid #1565c0;
          color: #1565c0;
          padding: 10px 28px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }
        .btn-back:hover:not(:disabled) { background: #1565c0; color: white; transform: translateY(-2px); }
        .btn-back:disabled { opacity: 0.5; cursor: not-allowed; }

        .footer {
          background: #0d2b5e;
          color: white;
          padding: 20px 24px;
          margin-top: 40px;
          text-align: center;
        }
        .footer-content { max-width: 1200px; margin: 0 auto; }
        .footer-copyright { text-align: center; font-size: 0.7rem; opacity: 0.7; }
        .copyright-text { margin-top: 5px; font-size: 0.65rem; }

        @media (max-width: 768px) {
          .main-content { padding-top: 220px; }
          .login-card { padding: 32px 24px; }
          .login-header h2 { font-size: 1.5rem; }
          .demo-info { flex-direction: column; align-items: center; gap: 8px; }
          .container-1, .container-2 { flex-direction: column; text-align: center; padding: 0 20px; }
          .header-left, .header-right, .logo-left, .logo-right { justify-content: center; }
          .contact-info-group { flex-direction: column; }
          .logo-left, .logo-right { display: none; }
          .dept-text-center { flex: 1; }
        }

        @media (max-width: 480px) {
          .main-content { padding-top: 250px; }
          .login-card { padding: 24px 20px; }
          .form-options { flex-direction: column; gap: 12px; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;