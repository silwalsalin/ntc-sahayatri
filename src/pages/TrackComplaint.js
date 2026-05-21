// src/pages/TrackComplaint.js
import React, { useState } from 'react';
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

const TrackComplaint = () => {
  const navigate = useNavigate();
  
  // Language state
  const [language, setLanguage] = useState('np');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // State for tracking
  const [trackTicket, setTrackTicket] = useState('');
  const [trackPassword, setTrackPassword] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  // In-memory complaints store (same as LandingPage for demo)
  const [complaintsStore] = useState([
    {
      ticketId: 'NTC-२०८०-००१',
      enTicketId: 'NTC-2080-001',
      password: 'pass123',
      name: 'रमेश केसी',
      enName: 'Ramesh KC',
      email: 'ramesh@example.com',
      phone: '9841000001',
      category: 'internet',
      description: 'फाइबर जडान २ दिनदेखि बन्द छ',
      enDescription: 'Fiber connection down since 2 days',
      status: 'प्रगतिमा',
      enStatus: 'In Progress',
      date: '२०८०-०१-१५',
      enDate: '2024-01-15',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal'
    },
    {
      ticketId: 'NTC-२०८०-००२',
      enTicketId: 'NTC-2080-002',
      password: 'pass456',
      name: 'सीता शर्मा',
      enName: 'Sita Sharma',
      email: 'sita@example.com',
      phone: '9812345678',
      category: 'recharge',
      description: 'रु. ५०० रिचार्ज गरे पनि ब्यालेन्स अपडेट भएन',
      enDescription: 'Recharged Rs. 500 but balance not updated',
      status: 'समाधान भयो',
      enStatus: 'Resolved',
      date: '२०८०-०१-२०',
      enDate: '2024-01-20',
      channel: 'व्हाट्सएप',
      enChannel: 'WhatsApp'
    },
    {
      ticketId: 'NTC-२०८०-००३',
      enTicketId: 'NTC-2080-003',
      password: 'pass789',
      name: 'हरि प्रसाद',
      enName: 'Hari Prasad',
      email: 'hari@example.com',
      phone: '9823456789',
      category: 'activation',
      description: 'सिम डिएक्टिभेसन अनुरोध प्रक्रिया भएन',
      enDescription: 'SIM deactivation request not processed',
      status: 'विचाराधीन',
      enStatus: 'Pending',
      date: '२०८०-०१-२५',
      enDate: '2024-01-25',
      channel: 'कल सेन्टर',
      enChannel: 'Call Center'
    },
    {
      ticketId: 'NTC-२०८०-००४',
      enTicketId: 'NTC-2080-004',
      password: 'pass101',
      name: 'विकास न्यौपाने',
      enName: 'Bikas NyauPane',
      email: 'bikas@example.com',
      phone: '9841567890',
      category: 'signal',
      description: 'नेटवर्क सिग्नल समस्या - कल ड्रप भइरहेको छ',
      enDescription: 'Network signal issue - call drops frequently',
      status: 'समीक्षामा',
      enStatus: 'Under Review',
      date: '२०८०-०१-२८',
      enDate: '2024-01-28',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal'
    }
  ]);

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
      login: 'लगइन',
      trackYourComplaint: 'तपाईंको उजुरी ट्र्याक गर्नुहोस्',
      fillDetails: 'स्थिति जाँच गर्न तलको विवरण भर्नुहोस्',
      ticketNumber: 'टिकेट नम्बर',
      enterTicket: 'आफ्नो टिकेट नम्बर प्रविष्ट गर्नुहोस्',
      password: 'पासवर्ड',
      enterPassword: 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्',
      proceed: 'उजुरी खोज्नुहोस्',
      complaintStatusLabel: 'उजुरीको स्थिति',
      ticketId: 'टिकेट आईडी',
      name: 'नाम',
      email: 'इमेल',
      phone: 'फोन',
      category: 'प्रकार',
      status: 'स्थिति',
      registeredDate: 'दर्ता मिति',
      channel: 'च्यानल',
      description: 'विवरण',
      demoNote: 'डेमोको लागि टिकेट: NTC-२०८०-००१, पासवर्ड: pass123',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्'
    },
    en: {
      weAreHere: 'We are here for you',
      contactNumber: '01-4960008',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'Nepal Telecommunications Authority',
      departmentAddress: 'Bhadrakali Plaza, Kathmandu',
      serviceName: 'NTC Sahayatri',
      serviceSub: 'Complaint Tracking System',
      home: 'Home',
      faqs: 'FAQs',
      login: 'Login',
      trackYourComplaint: 'Track Your Complaint',
      fillDetails: 'Fill out the details below to check the status',
      ticketNumber: 'Ticket Number',
      enterTicket: 'Enter your ticket number',
      password: 'Password',
      enterPassword: 'Enter your password',
      proceed: 'Search Complaint',
      complaintStatusLabel: 'Complaint Status',
      ticketId: 'Ticket ID',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      category: 'Category',
      status: 'Status',
      registeredDate: 'Registered Date',
      channel: 'Channel',
      description: 'Description',
      demoNote: 'Demo: Ticket: NTC-2080-001, Password: pass123',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      backToHome: 'Back to Home'
    }
  };

  const t = content[language];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const handleTrackComplaint = (e) => {
    e.preventDefault();
    
    if (!trackTicket || !trackPassword) {
      alert(language === 'np' ? 'कृपया टिकेट नम्बर र पासवर्ड दुवै भर्नुहोस्।' : 'Please enter both Ticket Number and Password.');
      return;
    }

    const found = complaintsStore.find(c => 
      (c.ticketId === trackTicket || c.enTicketId === trackTicket) && c.password === trackPassword
    );
    
    if (found) {
      setTrackResult(found);
    } else {
      setTrackResult(null);
      alert(language === 'np' ? '❌ उल्लेखित विवरणसँग मेल खाने कुनै उजुरी फेला परेन।' : '❌ No complaint found with the provided credentials.');
    }
  };

  const getStatusClass = (status) => {
    if (status === 'प्रगतिमा' || status === 'In Progress') return 'status-progress';
    if (status === 'समाधान भयो' || status === 'Resolved') return 'status-resolved';
    if (status === 'समीक्षामा' || status === 'Under Review') return 'status-review';
    return 'status-pending';
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
    <div className="track-complaint-page">
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
          </div>
          <div className="login-btn-right">
            <button className="login-btn" onClick={() => navigate('/admin')}>
              <span className="login-icon">🔐</span>
              <span className="login-text">{t.login}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="track-container">
          <div className="track-card">
            <div className="track-header">
              <div className="track-icon">🔍</div>
              <h2>{t.trackYourComplaint}</h2>
              <p className="sub-text">{t.fillDetails}</p>
            </div>
            
            <form onSubmit={handleTrackComplaint} className="track-form">
              <div className="form-group">
                <label>{t.ticketNumber}</label>
                <div className="input-wrapper">
                  <span className="input-icon">🎫</span>
                  <input 
                    type="text" 
                    value={trackTicket} 
                    onChange={(e) => setTrackTicket(e.target.value)} 
                    placeholder={t.enterTicket} 
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>{t.password}</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input 
                    type="password" 
                    value={trackPassword} 
                    onChange={(e) => setTrackPassword(e.target.value)} 
                    placeholder={t.enterPassword} 
                    required 
                  />
                </div>
              </div>
              
              <button type="submit" className="btn-track">
                <span>🔍</span> {t.proceed}
              </button>
            </form>

            {trackResult && (
              <div className="track-result">
                <div className="result-header">
                  <span className="result-icon">✅</span>
                  <h3>{t.complaintStatusLabel}</h3>
                </div>
                <div className="result-details">
                  <div className="detail-row">
                    <div className="detail-label">{t.ticketId}:</div>
                    <div className="detail-value">{language === 'np' ? trackResult.ticketId : trackResult.enTicketId}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.name}:</div>
                    <div className="detail-value">{trackResult.name}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.email}:</div>
                    <div className="detail-value">{trackResult.email}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.phone}:</div>
                    <div className="detail-value">{trackResult.phone}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.category}:</div>
                    <div className="detail-value">
                      {language === 'np' ? 
                        (trackResult.category === 'internet' ? 'इन्टरनेट सेवा' :
                         trackResult.category === 'recharge' ? 'रिचार्ज र ब्यालेन्स' :
                         trackResult.category === 'activation' ? 'सेवा सक्रियता' :
                         trackResult.category === 'billing' ? 'बिलिङ' :
                         trackResult.category === 'signal' ? 'सिग्नल' : 'अन्य') :
                        (trackResult.category === 'internet' ? 'Internet Service' :
                         trackResult.category === 'recharge' ? 'Recharge & Balance' :
                         trackResult.category === 'activation' ? 'Activation' :
                         trackResult.category === 'billing' ? 'Billing' :
                         trackResult.category === 'signal' ? 'Signal' : 'Other')
                      }
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.status}:</div>
                    <div className="detail-value">
                      <span className={`status-badge ${getStatusClass(trackResult.status)}`}>
                        {language === 'np' ? trackResult.status : trackResult.enStatus}
                      </span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.registeredDate}:</div>
                    <div className="detail-value">{language === 'np' ? trackResult.date : trackResult.enDate}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.channel}:</div>
                    <div className="detail-value">{language === 'np' ? trackResult.channel : trackResult.enChannel}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.description}:</div>
                    <div className="detail-value">{language === 'np' ? trackResult.description : trackResult.enDescription}</div>
                  </div>
                </div>
              </div>
            )}

          
            
            <div className="back-to-home">
              <button onClick={() => navigate('/')} className="btn-back">
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

        .track-complaint-page {
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

        .ntc-logo,
        .gov-logo {
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
          z-index: 1020;
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

        .nav-icon {
          font-size: 1.1rem;
        }

        .nav-text {
          font-size: 0.95rem;
        }

        .login-btn-right {
          display: flex;
          align-items: center;
        }

        .login-btn {
          background: transparent;
          border: 2px solid white;
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 28px;
          border-radius: 40px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .login-btn:hover {
          background: white;
          color: #1565c0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Main Content */
        .main-content {
          padding-top: 195px;
          min-height: calc(100vh - 195px);
        }

        .track-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .track-card {
          background: white;
          border-radius: 32px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(21, 101, 192, 0.1);
        }

        .track-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .track-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .track-card h2 {
          font-size: 2rem;
          color: #0d47a1;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .sub-text {
          text-align: center;
          color: #6c8196;
          font-size: 1rem;
        }

        .track-form {
          max-width: 500px;
          margin: 0 auto;
          text-align: left;
        }

        .form-group {
          margin-bottom: 28px;
          text-align: left;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 10px;
          color: #2c4e6e;
          font-size: 0.95rem;
          text-align: left;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          font-size: 1.1rem;
          color: #1565c0;
          z-index: 1;
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
          text-align: left;
        }

        .form-group input:focus {
          outline: none;
          border-color: #1565c0;
          background: white;
          box-shadow: 0 0 0 4px rgba(21, 101, 192, 0.1);
        }

        .form-group input::placeholder {
          color: #aaa;
          font-size: 0.9rem;
          text-align: left;
        }

        .btn-track {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .btn-track:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(21, 101, 192, 0.3);
          background: linear-gradient(135deg, #0d47a1, #083a7a);
        }

        .track-result {
          margin-top: 40px;
          padding: 28px;
          background: linear-gradient(135deg, #e3f2fd, #e8eaf6);
          border-radius: 24px;
          border-left: 4px solid #1565c0;
          text-align: left;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid rgba(21, 101, 192, 0.2);
        }

        .result-icon {
          font-size: 1.8rem;
        }

        .result-header h3 {
          color: #0d47a1;
          font-size: 1.4rem;
          margin: 0;
        }

        .result-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-row {
          display: flex;
          flex-wrap: wrap;
          padding: 10px 0;
          border-bottom: 1px solid rgba(21, 101, 192, 0.1);
          text-align: left;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 700;
          width: 140px;
          color: #0d47a1;
          font-size: 0.9rem;
          text-align: left;
        }

        .detail-value {
          flex: 1;
          color: #1a2c3e;
          font-size: 0.9rem;
          word-break: break-word;
          text-align: left;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-progress {
          background: #fff3cd;
          color: #856404;
        }

        .status-resolved {
          background: #d4edda;
          color: #155724;
        }

        .status-pending {
          background: #f8d7da;
          color: #721c24;
        }

        .status-review {
          background: #fff3cd;
          color: #856404;
        }



        .back-to-home {
          margin-top: 28px;
          text-align: center;
        }

        .btn-back {
          background: transparent;
          border: 2px solid #1565c0;
          color: #1565c0;
          padding: 12px 32px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .btn-back:hover {
          background: #1565c0;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(21, 101, 192, 0.2);
        }
        /* Responsive */
        @media (max-width: 768px) {
          .main-content {
            padding-top: 330px;
          }
          
          .track-card {
            padding: 28px 20px;
          }
          
          .track-card h2 {
            font-size: 1.5rem;
          }
          
          .track-header .track-icon {
            font-size: 3rem;
          }
          
          .detail-row {
            flex-direction: column;
            gap: 6px;
          }
          
          .detail-label {
            width: 100%;
          }
          
          .container-1,
          .container-2,
          .container-3 {
            flex-direction: column;
            text-align: center;
          }
          
          .header-left,
          .header-right,
          .logo-left,
          .logo-right,
          .nav-menu-left {
            justify-content: center;
          }
          
          .contact-info-group {
            flex-direction: column;
          }
          
          .track-form {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .track-card {
            padding: 20px 16px;
          }
          
          .track-card h2 {
            font-size: 1.3rem;
          }
          
          .btn-track {
            padding: 14px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TrackComplaint;