// src/components/Header.js
import React, { useState } from 'react';
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

const Header = ({ language, setLanguage, adminName = "Admin" }) => {
  const navigate = useNavigate();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  const content = {
    np: {
      weAreHere: 'हामी तपाईंको लागि यहाँ छौं',
      contactNumber: 'सम्पर्क नम्बर: ०१-४९६०००८',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'नेपाल दूरसञ्चार प्राधिकरण',
      departmentAddress: 'भद्रकाली प्लाजा, काठमाडौं',
      logout: 'लगआउट',
      profile: 'प्रोफाइल',
      settings: 'सेटिङ्स',
      adminPanel: 'प्रशासक प्यानल',
      admin: 'प्रशासक'
    },
    en: {
      weAreHere: 'We are here for you',
      contactNumber: 'Contact: 01-4960008',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'Nepal Telecommunications Authority',
      departmentAddress: 'Bhadrakali Plaza, Kathmandu',
      logout: 'Logout',
      profile: 'Profile',
      settings: 'Settings',
      adminPanel: 'Admin Panel',
      admin: 'Admin'
    }
  };

  const t = content[language];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
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

      {/* HEADER 3 - Navigation Bar - Only Admin Dropdown */}
      <div className="header-3">
        <div className="container-3">
          <div className="admin-dropdown">
            <button 
              className="admin-btn"
              onClick={() => setShowAdminDropdown(!showAdminDropdown)}
            >
              <span className="admin-icon">👨‍💼</span>
              <span className="admin-name">{}</span>
              <span className="admin-badge">{t.admin}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {showAdminDropdown && (
              <div className="admin-dropdown-menu">
                <button className="dropdown-item" onClick={() => navigate('/admin-dashboard')}>
                  <span className="dropdown-icon">📊</span>
                  <span className="dropdown-text">{t.adminPanel}</span>
                </button>
                <button className="dropdown-item" onClick={() => navigate('/admin-profile')}>
                  <span className="dropdown-icon">👤</span>
                  <span className="dropdown-text">{t.profile}</span>
                </button>
                <button className="dropdown-item" onClick={() => navigate('/admin-settings')}>
                  <span className="dropdown-icon">⚙️</span>
                  <span className="dropdown-text">{t.settings}</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span className="dropdown-icon">🚪</span>
                  <span className="dropdown-text">{t.logout}</span>
                </button>
              </div>
            )}
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
        }

        .contact-info-item:hover {
          background: rgba(255,255,255,0.25);
        }

        .contact-icon {
          font-size: 0.85rem;
        }

        .contact-text {
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Language Dropdown */
        .language-dropdown { 
          position: relative; 
        }
        
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
        }
        
        .language-selector:hover { 
          background: rgba(255,255,255,0.25); 
        }
        
        .lang-icon { 
          font-size: 0.85rem; 
        }
        
        .dropdown-arrow { 
          font-size: 0.6rem; 
          margin-left: 5px; 
        }
        
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
          font-size: 1rem; 
        }

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
          height: 50px; 
          width: auto; 
          object-fit: contain; 
        }
        
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
        
        .dept-text-center { 
          flex: 2; 
          text-align: center; 
        }
        
        .dept-name { 
          font-size: 1rem; 
          font-weight: 700; 
          color: #0d47a1; 
          letter-spacing: 1px; 
        }
        
        .dept-address { 
          font-size: 0.75rem; 
          opacity: 0.7; 
          color: #555; 
          margin-top: 3px; 
        }

        /* HEADER 3 - Navigation Bar (Admin Dropdown) */
        .header-3 {
          position: fixed;
          top: 119px;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
          color: white;
          padding: 12px 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1020;
        }

        .container-3 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        /* Admin Dropdown */
        .admin-dropdown {
          position: relative;
        }

        .admin-btn {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 24px;
          border-radius: 40px;
          cursor: pointer;
          color: black;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .admin-btn:hover {
          background: rgba(255,255,255,0.25);
        }

        .admin-icon {
          font-size: 1rem;
        }

        .admin-name {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .admin-badge {
          font-size: 0.75rem;
          opacity: 0.8;
          font-weight: normal;
          background: white;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .admin-dropdown-menu {
          position: absolute;
          top: 48px;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 1050;
          min-width: 200px;
        }

        .admin-dropdown-menu .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 20px;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
          text-align: left;
          color: #333;
        }

        .admin-dropdown-menu .dropdown-item:hover {
          background: #f0f2f5;
        }

        .admin-dropdown-menu .dropdown-item.logout {
          color: #dc3545;
        }

        .admin-dropdown-menu .dropdown-item.logout:hover {
          background: #fee;
        }

        .dropdown-icon {
          font-size: 1rem;
          width: 24px;
        }

        .dropdown-text {
          flex: 1;
        }

        .dropdown-divider {
          margin: 5px 0;
          border: none;
          border-top: 1px solid #e0e0e0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .container-1, .container-2, .container-3 {
            flex-direction: column;
            text-align: center;
            padding: 0 20px;
          }
          
          .container-3 {
            align-items: center;
            justify-content: center;
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
          
          .admin-btn {
            padding: 6px 16px;
          }
          
          .admin-name {
            font-size: 0.85rem;
          }
          
          .admin-badge {
            font-size: 0.65rem;
            padding: 2px 6px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;