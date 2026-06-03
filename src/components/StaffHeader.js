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
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New complaint assigned to you', time: '5 min ago', read: false },
    { id: 2, message: 'Meeting at 3:00 PM', time: '1 hour ago', read: false },
    { id: 3, message: 'Your report is ready', time: '2 hours ago', read: true }
  ]);

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
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'नेपाल दूरसञ्चार प्राधिकरण',
      departmentAddress: 'भद्रकाली प्लाजा, काठमाडौं',
      logout: 'लगआउट',
      profile: 'प्रोफाइल',
      settings: 'सेटिङ्स',
      staffPanel: 'स्टाफ प्यानल',
      notifications: 'सूचनाहरू',
      markAllRead: 'सबै पढेको चिन्ह लगाउनुहोस्',
      noNotifications: 'कुनै सूचना छैन',
      welcome: 'स्वागत छ',
      role: 'भूमिका'
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
      staffPanel: 'Staff Panel',
      notifications: 'Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No notifications',
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

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
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

      {/* HEADER 3 - Staff Controls Only (No Navigation Links) */}
      <div className={`header-3 ${scrollY > 50 ? 'header-scrolled' : ''}`}>
        <div className="container-3">
          <div className="staff-controls">
            {/* Notifications Dropdown */}
            <div className="notifications-dropdown">
              <button 
                className="notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="notif-icon">🔔</span>
                {getUnreadCount() > 0 && (
                  <span className="notif-badge">{getUnreadCount()}</span>
                )}
              </button>
              {showNotifications && (
                <div className="notifications-menu">
                  <div className="notifications-header">
                    <span>{t.notifications}</span>
                    {getUnreadCount() > 0 && (
                      <button className="mark-all-read" onClick={handleMarkAllRead}>
                        {t.markAllRead}
                      </button>
                    )}
                  </div>
                  <div className="notifications-list">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                          <div className="notification-message">{notif.message}</div>
                          <div className="notification-time">{notif.time}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">{t.noNotifications}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Staff Dropdown */}
            <div className="staff-dropdown">
              <button 
                className="staff-btn"
                onClick={() => setShowStaffDropdown(!showStaffDropdown)}
              >
                <span className="staff-icon">👨‍💻</span>
                <div className="staff-info">
                  <span className="staff-name">{staffName}</span>
                  <span className="staff-role">{staffRole}</span>
                </div>
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
                  <button className="dropdown-item" onClick={() => navigate('/staff-profile')}>
                    <span>👤</span>
                    <span>{t.profile}</span>
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/staff-settings')}>
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
          transition: all 0.3s ease;
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

        /* HEADER 3 - Staff Controls Only */
        .header-3 {
          position: fixed;
          top: 119px;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #0288d1 0%, #0277bd 100%);
          color: white;
          padding: 12px 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1020;
          transition: all 0.3s ease;
        }

        .header-3.header-scrolled {
          top: 101px;
          padding: 8px 0;
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
          gap: 15px;
        }

        /* Notifications Dropdown */
        .notifications-dropdown {
          position: relative;
        }

        .notifications-btn {
          position: relative;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 12px;
          border-radius: 40px;
          cursor: pointer;
          color: white;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .notifications-btn:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }

        .notif-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          font-size: 0.65rem;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 20px;
          min-width: 18px;
        }

        .notifications-menu {
          position: absolute;
          top: 45px;
          right: 0;
          width: 320px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 1050;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
          font-weight: 600;
          color: #333;
        }

        .mark-all-read {
          background: none;
          border: none;
          color: #1565c0;
          font-size: 0.7rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .mark-all-read:hover {
          background: #e3f2fd;
        }

        .notifications-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .notification-item.unread {
          background: #e3f2fd;
        }

        .notification-message {
          font-size: 0.85rem;
          color: #333;
          margin-bottom: 4px;
        }

        .notification-time {
          font-size: 0.7rem;
          color: #999;
        }

        .no-notifications {
          padding: 40px;
          text-align: center;
          color: #999;
        }

        /* Staff Dropdown */
        .staff-dropdown {
          position: relative;
        }

        .staff-btn {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 16px;
          border-radius: 40px;
          cursor: pointer;
          color: white;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .staff-btn:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }

        .staff-icon {
          font-size: 1rem;
        }

        .staff-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .staff-name {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .staff-role {
          font-size: 0.65rem;
          opacity: 0.8;
        }

        .staff-dropdown-menu {
          position: absolute;
          top: 45px;
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
          padding: 16px;
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
            padding: 0 20px;
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
          
          .staff-info {
            display: none;
          }
          
          .notifications-menu {
            width: calc(100vw - 40px);
            right: -80px;
          }
        }

        @media (max-width: 480px) {
          .staff-controls {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default StaffHeader;