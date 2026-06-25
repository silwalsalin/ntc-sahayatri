// src/components/StaffHeader.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

const StaffHeader = ({ language, setLanguage, staffName = "Staff User", staffRole = "Support Staff" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Handle scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const content = {
    np: {
      weAreHere: 'हामी तपाईंको लागि यहाँ छौं',
      contactNumber: 'सम्पर्क नम्बर: ०१-४९६०००८',
      emailAddress: 'support@ntc.gov.np',
      departmentName: 'नेपाल दूरसञ्चार प्राधिकरण',
      departmentAddress: 'भद्रकाली प्लाजा, काठमाडौं',
      logout: 'लगआउट',
      profile: 'प्रोफाइल',
      settings: 'सेटिङ्स',
      staffPanel: 'स्टाफ प्यानल',
      welcome: 'स्वागत छ',
      role: 'भूमिका'
    },
    en: {
      weAreHere: 'We are here for you',
      contactNumber: 'Contact: 01-4960008',
      emailAddress: 'support@ntc.gov.np',
      departmentName: 'Nepal Telecommunications Authority',
      departmentAddress: 'Bhadrakali Plaza, Kathmandu',
      logout: 'Logout',
      profile: 'Profile',
      settings: 'Settings',
      staffPanel: 'Staff Panel',
      welcome: 'Welcome',
      role: 'Role'
    }
  };

  const t = content[language];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    navigate('/');
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
    <>
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

      {/* HEADER 3 - Staff Controls Only (No Notifications) */}
      <div className={`header-3 ${scrollY > 50 ? 'header-scrolled' : ''}`}>
        <div className="container-3">
          <div className="staff-controls">
            {/* Staff Dropdown - Minimized */}
            <div className="staff-dropdown">
              <button 
                className="staff-btn"
                onClick={() => setShowStaffDropdown(!showStaffDropdown)}
              >
                <span className="staff-avatar-mini">{staffName.charAt(0).toUpperCase()}</span>
                <span className="staff-name-mini">{staffName}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {showStaffDropdown && (
                <div className="staff-dropdown-menu">
                  <div className="staff-welcome">
                    <span className="welcome-icon">👋</span>
                    <div>
                      <div className="welcome-text">{t.welcome}</div>
                      <div className="staff-fullname">{staffName}</div>
                      <div className="staff-role-text">{staffRole}</div>
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => navigate('/staff/profile')}>
                    <span>👤</span>
                    <span>{t.profile}</span>
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/staff/account-settings')}>
                    <span>⚙️</span>
                    <span>{t.settings}</span>
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <span>🚪</span>
                    <span>{t.logout}</span>
                  </button>
                </div>
              )}
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

        /* HEADER 1 - Top Bar */
        .header-1 {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
          color: white;
          padding: 8px 0;
          z-index: 1040;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .header-1.header-scrolled {
          padding: 5px 0;
        }

        .container-1 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .we-are-here {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.12);
          padding: 4px 16px;
          border-radius: 30px;
          font-weight: 500;
        }

        .quote-text {
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .contact-info-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .contact-info-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.7rem;
          background: rgba(255,255,255,0.1);
          padding: 4px 10px;
          border-radius: 25px;
          transition: all 0.3s ease;
        }

        .contact-info-item:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }

        .contact-icon {
          font-size: 0.8rem;
        }

        .contact-text {
          font-size: 0.7rem;
          font-weight: 500;
        }

        /* Language Dropdown */
        .language-dropdown { 
          position: relative; 
        }
        
        .language-selector {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          padding: 4px 10px;
          border-radius: 25px;
          cursor: pointer;
          color: white;
          font-size: 0.7rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .language-selector:hover { 
          background: rgba(255,255,255,0.2); 
        }
        
        .lang-icon { 
          font-size: 0.8rem; 
        }
        
        .dropdown-arrow { 
          font-size: 0.55rem; 
          margin-left: 4px; 
        }
        
        .dropdown-menu {
          position: absolute;
          top: 32px;
          right: 0;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 1050;
          min-width: 110px;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 6px 12px;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .dropdown-item:hover { 
          background: #f0f2f5; 
        }
        
        .dropdown-item.active { 
          background: #1565c0; 
          color: white; 
        }
        
        .lang-flag { 
          font-size: 0.9rem; 
        }

        /* HEADER 2 - Department Level */
        .header-2 {
          position: fixed;
          top: 48px;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #e8f0fe 0%, #ffffff 100%);
          color: #1a2c3e;
          padding: 8px 0;
          z-index: 1030;
          box-shadow: 0 1px 5px rgba(0,0,0,0.05);
          border-bottom: 1px solid rgba(21, 101, 192, 0.1);
          transition: all 0.3s ease;
        }

        .header-2.header-scrolled {
          padding: 6px 0;
          top: 40px;
        }

        .container-2 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .logo-left { 
          flex: 1; 
          display: flex; 
          justify-content: flex-start; 
        }
        
        .logo-right { 
          flex: 1; 
          display: flex; 
          justify-content: flex-end; 
        }
        
        .ntc-logo, .gov-logo { 
          height: 40px; 
          width: auto; 
          object-fit: contain; 
        }
        
        .logo-fallback {
          font-size: 1.6rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1565c0, #42a5f5);
          border-radius: 50%;
          color: white;
        }
        
        .dept-text-center { 
          flex: 2; 
          text-align: center; 
        }
        
        .dept-name { 
          font-size: 0.9rem; 
          font-weight: 700; 
          color: #0d47a1; 
          letter-spacing: 0.5px; 
        }
        
        .dept-address { 
          font-size: 0.65rem; 
          opacity: 0.6; 
          color: #555; 
          margin-top: 2px; 
        }

        /* HEADER 3 - Staff Controls Only (No Notifications) */
        .header-3 {
          position: fixed;
          top: 96px;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #0288d1 0%, #0277bd 100%);
          color: white;
          padding: 6px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 1020;
          transition: all 0.3s ease;
        }

        .header-3.header-scrolled {
          top: 84px;
          padding: 4px 0;
        }

        .container-3 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        /* Staff Controls */
        .staff-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Staff Dropdown - Clean Design */
        .staff-dropdown {
          position: relative;
        }

        .staff-btn {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 16px;
          border-radius: 30px;
          cursor: pointer;
          color: white;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .staff-btn:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }

        .staff-avatar-mini {
          width: 28px;
          height: 28px;
          background: rgba(255,255,255,0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .staff-name-mini {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .dropdown-arrow {
          font-size: 0.55rem;
        }

        .staff-dropdown-menu {
          position: absolute;
          top: 42px;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 1050;
          min-width: 220px;
        }

        .staff-welcome {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #e3f2fd, #bbdef5);
        }

        .welcome-icon {
          font-size: 2rem;
        }

        .welcome-text {
          font-size: 0.7rem;
          color: #666;
        }

        .staff-fullname {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0d47a1;
        }

        .staff-role-text {
          font-size: 0.7rem;
          color: #666;
        }

        .dropdown-divider {
          margin: 5px 0;
          border: none;
          border-top: 1px solid #e0e0e0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          text-align: left;
          color: #333;
        }

        .dropdown-item:hover {
          background: #f0f2f5;
        }

        .dropdown-item.logout {
          color: #dc3545;
        }

        .dropdown-item.logout:hover {
          background: #fee;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .container-1, .container-2, .container-3 {
            flex-direction: column;
            text-align: center;
            padding: 0 16px;
          }
          
          .header-left, .header-right, .logo-left, .logo-right {
            justify-content: center;
          }
          
          .contact-info-group {
            flex-direction: column;
          }
          
          .logo-left, .logo-right {
            display: none;
          }
          
          .dept-text-center {
            flex: 1;
          }
          
          .container-3 {
            justify-content: center;
          }
          
          .staff-name-mini {
            display: none;
          }
          
          .staff-btn {
            padding: 6px 12px;
          }
        }

        @media (max-width: 480px) {
          .staff-controls {
            width: 100%;
            justify-content: center;
          }
          
          .staff-btn {
            padding: 4px 10px;
          }
          
          .staff-avatar-mini {
            width: 24px;
            height: 24px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </>
  );
};

export default StaffHeader;