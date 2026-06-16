// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [userType, setUserType] = useState('admin');

  // Login form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Error and loading state
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Auto-hide success popup after 3 seconds
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  // Check if already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    const userRole = localStorage.getItem('userRole');
    
    if (adminToken && adminUser && userRole === 'admin') {
      navigate('/admin-dashboard');
      return;
    }
    
    const staffToken = localStorage.getItem('staffToken');
    const staffUser = localStorage.getItem('staffUser');
    const staffRole = localStorage.getItem('staffRole');
    
    if (staffToken && staffUser && staffRole === 'staff') {
      navigate('/staff-dashboard');
      return;
    }
  }, [navigate]);

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
      complaints: 'गुनासोहरू',
      login: 'लगइन',
      adminLogin: 'प्रशासक लगइन',
      staffLogin: 'स्टाफ लगइन',
      welcomeBack: 'पुन: स्वागत छ',
      loginToAccount: 'आफ्नो खातामा लगइन गर्नुहोस्',
      email: 'इमेल ठेगाना',
      enterEmail: 'आफ्नो इमेल ठेगाना प्रविष्ट गर्नुहोस्',
      password: 'पासवर्ड',
      enterPassword: 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्',
      rememberMe: 'मलाई सम्झनुहोस्',
      forgotPassword: 'पासवर्ड बिर्सनुभयो?',
      loginBtn: 'लगइन गर्नुहोस्',
      loggingIn: 'लगइन हुँदैछ...',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      demoCredentials: 'डेमो प्रमाणपत्रहरू:',
      adminUser: 'प्रशासक: admin@example.com',
      adminPass: 'पासवर्ड: admin123',
      staffUsers: 'स्टाफ प्रयोगकर्ताहरू:',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      loginSuccessAdmin: '✅ लगइन सफल! प्रशासक ड्यासबोर्डमा जाँदै...',
      loginSuccessStaff: '✅ लगइन सफल! स्टाफ ड्यासबोर्डमा जाँदै...',
      loginError: '❌ अमान्य इमेल वा पासवर्ड। कृपया पुन: प्रयास गर्नुहोस्।',
      requiredFields: 'कृपया इमेल र पासवर्ड भर्नुहोस्।',
      selectUserType: 'प्रयोगकर्ता प्रकार चयन गर्नुहोस्'
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
      complaints: 'Complaints',
      login: 'Login',
      adminLogin: 'Admin Login',
      staffLogin: 'Staff Login',
      welcomeBack: 'Welcome Back',
      loginToAccount: 'Login to Your Account',
      email: 'Email Address',
      enterEmail: 'Enter your email address',
      password: 'Password',
      enterPassword: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',
      loginBtn: 'Login',
      loggingIn: 'Logging in...',
      backToHome: 'Back to Home',
      demoCredentials: 'Demo Credentials:',
      adminUser: 'Admin: admin@example.com',
      adminPass: 'Password: admin123',
      staffUsers: 'Staff Users:',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      loginSuccessAdmin: '✅ Login successful! Redirecting to Admin Dashboard...',
      loginSuccessStaff: '✅ Login successful! Redirecting to Staff Dashboard...',
      loginError: '❌ Invalid email or password. Please try again.',
      requiredFields: 'Please enter email and password.',
      selectUserType: 'Select User Type'
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

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setError('');
    setFormData({
      email: '',
      password: '',
      rememberMe: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError(t.requiredFields);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Make real API call to backend - backend handles both admin and staff
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        // Store session based on user role from backend response
        if (userData.role === 'admin') {
          // Clear any existing staff session first
          localStorage.removeItem('staffToken');
          localStorage.removeItem('staffUser');
          localStorage.removeItem('staffRole');
          
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminUser', JSON.stringify(userData));
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userName', userData.name);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('isLoggedIn', 'true');
          
          if (formData.rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          
          setSuccessMessage(t.loginSuccessAdmin);
          setShowSuccessPopup(true);
          
          setTimeout(() => {
            navigate('/admin-dashboard');
          }, 1500);
          
        } else if (userData.role === 'staff') {
          // Clear any existing admin session first
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('userRole');
          
          localStorage.setItem('staffToken', token);
          localStorage.setItem('staffUser', JSON.stringify(userData));
          localStorage.setItem('staffRole', 'staff');
          localStorage.setItem('userRole', 'staff');
          localStorage.setItem('userName', userData.name);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('isLoggedIn', 'true');
          
          if (formData.rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          
          setSuccessMessage(`${t.loginSuccessStaff} ${userData.name}`);
          setShowSuccessPopup(true);
          
          setTimeout(() => {
            navigate('/staff-dashboard');
          }, 1500);
          
        } else {
          setError(t.loginError);
          setIsLoading(false);
        }
      } else {
        setError(response.data.message || t.loginError);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        setError(error.response.data?.message || t.loginError);
      } else if (error.request) {
        setError('Cannot connect to server. Please check if backend is running on port 5000.');
      } else {
        setError(t.loginError);
      }
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

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
    <div className="login-page">
      {/* Success Popup Notification */}
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-popup-content">
            <span className="success-icon">✅</span>
            <span className="success-message">{successMessage}</span>
          </div>
        </div>
      )}

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

      {/* HEADER 3 - Navigation Bar */}
      <div className="header-3">
        <div className="container-3">
          <div className="nav-menu-left">
            <button onClick={() => navigate('/')} className="nav-btn">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">{t.home}</span>
            </button>
            <button onClick={() => navigate('/faqs')} className="nav-btn">
              <span className="nav-icon">❓</span>
              <span className="nav-text">{t.faqs}</span>
            </button>
            <button onClick={() => navigate('/complaints')} className="nav-btn">
              <span className="nav-icon">📋</span>
              <span className="nav-text">{t.complaints}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">🔐</div>
              <h2>{userType === 'admin' ? t.adminLogin : t.staffLogin}</h2>
              <p>{t.loginToAccount}</p>
            </div>

            {/* User Type Toggle */}
            <div className="user-type-toggle">
              <button
                className={`toggle-btn ${userType === 'admin' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('admin')}
              >
                <span className="toggle-icon">👨‍💼</span>
                <span>{t.adminLogin}</span>
              </button>
              <button
                className={`toggle-btn ${userType === 'staff' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('staff')}
              >
                <span className="toggle-icon">👨‍💻</span>
                <span>{t.staffLogin}</span>
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
                <label>{t.email}</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t.enterEmail}
                    autoComplete="email"
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
                    {showPassword ? "🙈" : "👁️"}
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
                
              
              </div>
              <div className="demo-note">
                <p className="demo-note-text">
                  💡 {language === 'np' 
                    ? 'टिप्पणी: प्रत्येक स्टाफ सदस्यको आफ्नै इमेल र पासवर्ड हुन्छ। कृपया आफ्नो व्यक्तिगत प्रमाणपत्रहरू प्रयोग गर्नुहोस्।' 
                    : 'Note: Each staff member has their own email and password. Please use your personal credentials.'}
                </p>
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
          display: flex;
          flex-direction: column;
        }

        /* Success Popup */
        .success-popup {
          position: fixed;
          top: 200px;
          right: 20px;
          z-index: 10000;
          animation: slideInRight 0.3s ease;
        }

        .success-popup-content {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #d1fae5;
          border-left: 4px solid #10b981;
          padding: 12px 20px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          max-width: 350px;
        }

        .success-icon {
          font-size: 1.2rem;
        }

        .success-message {
          font-size: 0.85rem;
          color: #065f46;
          flex: 1;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
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
          z-index: 1003;
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
          z-index: 1002;
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

        /* HEADER 3 - Navigation Bar */
        .header-3 {
          position: fixed;
          top: 119px;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
          color: white;
          padding: 12px 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1001;
        }

        .container-3 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .nav-menu-left {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .nav-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 20px;
          border-radius: 40px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-btn:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }

        .nav-icon { font-size: 1.1rem; }
        .nav-text { font-size: 0.95rem; }

        /* Main Content */
        .main-content {
          flex: 1;
          padding-top: 195px;
          padding-bottom: 40px;
        }

        .login-container {
          max-width: 550px;
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

        /* User Type Toggle */
        .user-type-toggle {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 60px;
        }

        .toggle-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
          color: #64748b;
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          color: white;
          box-shadow: 0 4px 12px rgba(21, 101, 192, 0.3);
        }

        .toggle-icon {
          font-size: 1.1rem;
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
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .demo-card {
          flex: 1;
          background: #f8fafc;
          padding: 12px;
          border-radius: 12px;
          text-align: center;
        }

        .demo-role {
          font-size: 0.75rem;
          font-weight: 600;
          color: #1565c0;
          margin-bottom: 8px;
        }

        .demo-card code {
          display: block;
          background: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 0.7rem;
          color: #0d47a1;
          font-family: monospace;
          margin-bottom: 4px;
        }

        .demo-note {
          text-align: center;
          margin-top: 12px;
        }

        .demo-note-text {
          font-size: 0.7rem;
          color: #6c8196;
          background: #f0f7ff;
          padding: 8px 12px;
          border-radius: 8px;
          display: inline-block;
        }

        .back-to-home {
          margin-top: 24px;
          text-align: center;
        }

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

        .btn-back:hover:not(:disabled) {
          background: #1565c0;
          color: white;
          transform: translateY(-2px);
        }

        .btn-back:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .footer {
          background: #0d2b5e;
          color: white;
          padding: 20px 24px;
          margin-top: 40px;
          text-align: center;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-copyright {
          text-align: center;
          font-size: 0.7rem;
          opacity: 0.7;
        }

        .copyright-text {
          margin-top: 5px;
          font-size: 0.65rem;
        }

        @media (max-width: 1024px) {
          .login-container { padding: 40px 20px; }
        }

        @media (max-width: 768px) {
          .main-content { padding-top: 280px; }
          .login-card { padding: 32px 24px; }
          .login-header h2 { font-size: 1.5rem; }
          .demo-info { flex-direction: column; gap: 12px; }
          .container-1, .container-2, .container-3 { flex-direction: column; text-align: center; padding: 0 20px; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .contact-info-group { flex-direction: column; gap: 8px; }
          .logo-left, .logo-right { display: none; }
          .dept-text-center { flex: 1; }
          .success-popup { top: auto; bottom: 20px; right: 20px; left: 20px; max-width: calc(100% - 40px); }
          .success-popup-content { max-width: 100%; }
          .demo-note-text { font-size: 0.65rem; }
        }

        @media (max-width: 480px) {
          .main-content { padding-top: 320px; }
          .login-card { padding: 24px 20px; }
          .form-options { flex-direction: column; gap: 12px; align-items: flex-start; }
          .user-type-toggle { flex-direction: column; border-radius: 16px; }
          .toggle-btn { border-radius: 12px; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;