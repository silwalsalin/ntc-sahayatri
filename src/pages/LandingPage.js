// src/pages/LandingPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Try to import local images with fallback
let ntcLogo, govLogo, heroImage, phoneIcon, smsIcon, whatsappIcon, viberIcon, emailIcon;
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
try {
  phoneIcon = require('../img/phone.png');
} catch (e) {
  phoneIcon = null;
}
try {
  smsIcon = require('../img/sms.png');
} catch (e) {
  smsIcon = null;
}
try {
  whatsappIcon = require('../img/whatsapp.png');
} catch (e) {
  whatsappIcon = null;
}
try {
  viberIcon = require('../img/viber.png');
} catch (e) {
  viberIcon = null;
}
try {
  emailIcon = require('../img/email.png');
} catch (e) {
  emailIcon = null;
}

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Language state
  const [language, setLanguage] = useState('np');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Image states for fallback
  const [heroImageError, setHeroImageError] = useState(false);
  const [emailIconError, setEmailIconError] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Handle scroll for header effects - but no minimization
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const complaintChannels = [
    { id: 'website', name: 'वेबसाइट पोर्टल', enName: 'Website Portal', icon: '🌐', isImage: false, color: '#1565c0', bgColor: '#e3f2fd' },
    { id: 'phone', name: 'फोन', enName: 'Phone', icon: phoneIcon, isImage: true, fallback: '📞', color: '#42a5f5', bgColor: '#e3f2fd' },
    { id: 'sms', name: 'एसएमएस', enName: 'SMS', icon: smsIcon, isImage: true, fallback: '💬', color: '#4caf50', bgColor: '#e8f5e9' },
    { id: 'whatsapp', name: 'व्हाट्सएप', enName: 'WhatsApp', icon: whatsappIcon, isImage: true, fallback: '💬', color: '#25D366', bgColor: '#d4edda' },
    { id: 'viber', name: 'भाइबर', enName: 'Viber', icon: viberIcon, isImage: true, fallback: '📱', color: '#7360f2', bgColor: '#e8e0f5' },
    { id: 'email', name: 'इमेल', enName: 'Email', icon: emailIcon, isImage: true, fallback: '✉️', color: '#ea4335', bgColor: '#fce4ec' },
  ];

  const publicComplaints = [
    { id: 1, name: 'राम बहादुर', enName: 'Ram Bahadur', complaint: 'इन्टरनेट जडान समस्या', enComplaint: 'Internet connection issue', date: '२०८०-०१-१५', enDate: '2024-01-15', status: 'प्रगतिमा', enStatus: 'In Progress' },
    { id: 2, name: 'सीता शर्मा', enName: 'Sita Sharma', complaint: 'रिचार्ज नभएको', enComplaint: 'Recharge not credited', date: '२०८०-०१-१८', enDate: '2024-01-18', status: 'समाधान भयो', enStatus: 'Resolved' },
    { id: 3, name: 'हरि प्रसाद', enName: 'Hari Prasad', complaint: 'सिम क्रियाशील नभएको', enComplaint: 'SIM not activated', date: '२०८०-०१-२०', enDate: '2024-01-20', status: 'विचाराधीन', enStatus: 'Pending' },
    { id: 4, name: 'गीता अधिकारी', enName: 'Gita Adhikari', complaint: 'बिलिङ त्रुटि', enComplaint: 'Billing error', date: '२०८०-०१-२२', enDate: '2024-01-22', status: 'प्रगतिमा', enStatus: 'In Progress' },
    { id: 5, name: 'विकास न्यौपाने', enName: 'Bikash Neupane', complaint: 'सिग्नल समस्या', enComplaint: 'Signal issue', date: '२०८०-०१-२५', enDate: '2024-01-25', status: 'समीक्षामा', enStatus: 'Under Review' },
  ];

  const statusCounts = {
    np: [
      { title: 'हालसम्म दर्ता भएका कुल गुनासोहरू', count: '1,00,387', range: '(पछिल्लो २४ घण्टामा: +१२५)' },
      { title: 'समीक्षा भई कारबाहीको पर्खाइमा रहेका गुनासोहरू', count: '15,154', range: '(पछिल्लो २४ घण्टामा: +४२)' },
      { title: 'सहायता टोलीद्वारा हालसम्म समाधान नभएका गुनासोहरू', count: '75,306', range: '(पछिल्लो २४ घण्टामा: -१८)' },
    ],
    en: [
      { title: 'Total complaints registered to date', count: '100,387', range: '(Last 24h: +125)' },
      { title: 'Complaints reviewed but awaiting action', count: '15,154', range: '(Last 24h: +42)' },
      { title: 'Complaints not yet resolved by support team', count: '75,306', range: '(Last 24h: -18)' },
    ],
  };

  const latestComplaints = [
    { category: 'सिम कार्ड गुनासो', enCategory: 'SIM Card Complaints', date: '२०८०-०१-१२', enDate: '2024-01-12' },
    { category: 'इन्टरनेट सेवा गुनासो', enCategory: 'Internet Service Complaints', date: '२०८०-०१-१२', enDate: '2024-01-12' },
    { category: 'रिचार्ज र ब्यालेन्स समस्या', enCategory: 'Recharge & Balance Issues', date: '२०८०-०१-१२', enDate: '2024-01-12' },
    { category: 'सेवा सक्रियता/निष्क्रियता', enCategory: 'Service Activation/Deactivation', date: '२०८०-०२-३०', enDate: '2024-02-28' },
  ];

  const channelStats = [
    { name: 'वेबसाइट पोर्टल', enName: 'Website Portal', percentage: 45.788, color: '#1565c0' },
    { name: 'कल सेन्टर', enName: 'Call Center', percentage: 3.099, color: '#42a5f5' },
    { name: 'व्हाट्सएप सपोर्ट', enName: 'WhatsApp Support', percentage: 2.581, color: '#25D366' },
    { name: 'इमेल सपोर्ट', enName: 'Email Support', percentage: 1.697, color: '#ea4335' },
    { name: 'भाइबर', enName: 'Viber', percentage: 0.588, color: '#7360f2' },
    { name: 'निवेदन पत्र', enName: 'Application Letter', percentage: 0.312, color: '#e67e22' },
  ];

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
      heroTitle: 'के तपाईंलाई नेपाल दूरसञ्चार सेवा, बिलिङ, इन्टरनेट जडान, वा ग्राहक सहायतासम्बन्धी समस्या छ?',
      heroText: 'कृपया एनटीसी ग्रिव्यान्स पोर्टलमार्फत आफ्नो उजुरी दिनुहोस्। हाम्रो टोली तपाईंलाई सहयोग गर्न तयार छ।',
      heroQuote: 'हामीलाई जानकारी दिनुहोस् - हामी यसलाई समाधान गर्न यहाँ छौं!',
      submitComplaint: 'उजुरी दिनुहोस्',
      trackComplaint: 'उजुरी ट्र्याक गर्नुहोस्',
      complaintRegarding: 'गुनासो सम्बन्धी',
      channelsTitle: 'गुनासोको लागि उपलब्ध च्यानलहरू:',
      publicComplaintsTitle: 'सार्वजनिक रूपमा दर्ता गरिएका गुनासोहरू',
      latestStatusTitle: 'गुनासो ट्र्याकिङ प्रणालीबाट प्राप्त नवीनतम स्थिति',
      complaintId: 'क्र.स.',
      complainantName: 'उजुरीकर्ताको नाम',
      complaintDetails: 'उजुरीको विवरण',
      complaintDate: 'मिति',
      complaintStatus: 'स्थिति',
      statsTitle: 'गुनासो ट्र्याकिङ प्रणालीद्वारा प्राप्त गुनासोहरूको नवीनतम स्थिति',
      links: 'लिङ्कहरू:',
      complaints: 'गुनासोहरू',
      policy: 'नीति',
      contactInfo: 'सम्पर्क जानकारी',
      helpline: 'हेल्पलाइन',
      tollFree: 'टोल फ्री',
      email: 'इमेल',
      address: 'ठेगाना',
      phone: 'फोन',
      netcomSignalComplaints: 'नेटकम र सिग्नल गुनासोहरू',
      netcomSignalText: 'नेटकम र सिग्नल गुनासोहरू एनटीसी गुनासो पोर्टलमा दर्ता गरिएका छन्।',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
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
      heroTitle: 'Do you have concerns regarding Nepal Telecom services, billing, internet connectivity, or customer support?',
      heroText: 'Please submit your complaint through the NTC Grievance Portal. Our team is ready to help you.',
      heroQuote: "Let us know — we're here to help resolve it!",
      submitComplaint: 'Submit Complaint',
      trackComplaint: 'Track Complaint',
      complaintRegarding: 'Complaint Regarding',
      channelsTitle: 'Channels available for complaint:',
      publicComplaintsTitle: 'Publicly Registered Complaints',
      latestStatusTitle: 'Latest Status from Complaint Tracking System',
      complaintId: 'S.No.',
      complainantName: 'Complainant Name',
      complaintDetails: 'Complaint Details',
      complaintDate: 'Date',
      complaintStatus: 'Status',
      statsTitle: 'Latest status of complaints received',
      links: 'LINKS:',
      complaints: 'Complaints',
      policy: 'Policy',
      contactInfo: 'Contact Information',
      helpline: 'Helpline',
      tollFree: 'Toll Free',
      email: 'Email',
      address: 'Address',
      phone: 'Phone',
      netcomSignalComplaints: 'Netcom & Signal Complaints',
      netcomSignalText: 'Netcom & Signal Complaints registered on NTC portal.',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
    },
  };

  const t = content[language];
  const currentStatusCounts = statusCounts[language];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 195;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const getStatusClass = (status) => {
    if (status === 'प्रगतिमा' || status === 'In Progress') return 'status-progress';
    if (status === 'समाधान भयो' || status === 'Resolved') return 'status-resolved';
    if (status === 'समीक्षामा' || status === 'Under Review') return 'status-review';
    return 'status-pending';
  };

  const getStatusText = (npStatus, enStatus) => {
    return language === 'np' ? npStatus : enStatus;
  };

  const LogoImage = ({ src, alt, fallback, className }) => {
    const [imgError, setImgError] = useState(false);
    if (imgError || !src) {
      return <div className={`logo-fallback ${className}`}>{fallback}</div>;
    }
    return <img src={src} alt={alt} className={className} onError={() => setImgError(true)} />;
  };

  const ChannelIcon = ({ channel }) => {
    const [imgError, setImgError] = useState(false);
    if (channel.isImage && !imgError && channel.icon) {
      return (
        <img
          src={channel.icon}
          alt={channel.enName}
          className="channel-icon-image"
          onError={() => setImgError(true)}
        />
      );
    }
    return <span className="channel-emoji" style={{ color: channel.color }}>{channel.fallback || channel.icon}</span>;
  };

  const EmailIconComponent = ({ className }) => {
    const [error, setError] = useState(false);
    if (error || !emailIcon) {
      return <span className={className || "contact-icon"}>✉️</span>;
    }
    return (
      <img
        src={emailIcon}
        alt="Email"
        className={className || "contact-icon-image"}
        onError={() => setError(true)}
      />
    );
  };

  return (
    <div className="landing-page">
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
                <EmailIconComponent className="contact-icon-image" />
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
            <LogoImage src={ntcLogo} alt="NTC Logo" fallback="📡" className="ntc-logo" />
          </div>
          <div className="dept-text-center">
            <div className="dept-name">{t.departmentName}</div>
            <div className="dept-address">{t.departmentAddress}</div>
          </div>
          <div className="logo-right">
            <LogoImage src={govLogo} alt="Government Logo" fallback="🇳🇵" className="gov-logo" />
          </div>
        </div>
      </div>

      {/* HEADER 3 - Navigation Bar */}
      <div className="header-3">
        <div className="container-3">
          <div className="nav-menu-left">
            <button onClick={() => scrollToSection('home')} className="nav-btn">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">{t.home}</span>
            </button>
            <button onClick={() => navigate('/faqs')} className="nav-btn">
              <span className="nav-icon">❓</span>
              <span className="nav-text">{t.faqs}</span>
            </button>
          </div>
          <div className="login-btn-right">
            <button className="login-btn" onClick={() => navigate('/admin-login')}>
              <span className="login-icon">🔐</span>
              <span className="login-text">{t.login}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-container">
            <div className="hero-left">
              <div className="hero-icon">📢</div>
              <h2>{t.heroTitle}</h2>
              <p>{t.heroText}</p>
              <div className="hero-quote">✨ {t.heroQuote} ✨</div>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => navigate('/submit-complaint')}>📝 {t.submitComplaint}</button>
                <button className="btn-secondary" onClick={() => navigate('/track-complaint')}>🔍 {t.trackComplaint}</button>
              </div>
           
            </div>
            <div className="hero-right">
              {!heroImageError && heroImage ? (
                <div className="hero-image-wrapper">
                  <img src={heroImage} alt="NTC Customer Support" className="hero-illustration" onError={() => setHeroImageError(true)} />
                </div>
              ) : (
                <div className="hero-illustration-fallback">
                  <div className="fallback-icon">📱</div>
                  <div className="fallback-text">NTC Customer Support</div>
                  <div className="fallback-subtext">24/7 Available</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Complaint Channels Section */}
        <section className="channels-section">
          <div className="channels-container">
            <h3 className="channels-title">{t.channelsTitle}</h3>
            <div className="channels-list">
              {complaintChannels.map((channel, index) => (
                <div key={index} className="channel-item">
                  <div className="channel-icon-wrapper" style={{ backgroundColor: channel.bgColor }}>
                    <ChannelIcon channel={channel} />
                  </div>
                  <span className="channel-name">{language === 'np' ? channel.name : channel.enName}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Public Complaints Table and Latest Status Side by Side */}
        <div className="stats-public-container">
          <div className="public-complaints-card">
            <h3>📋 {t.publicComplaintsTitle}</h3>
            <div className="table-wrapper">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>{t.complaintId}</th>
                    <th>{t.complainantName}</th>
                    <th>{t.complaintDetails}</th>
                    <th>{t.complaintDate}</th>
                    <th>{t.complaintStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {publicComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>{complaint.id}</td>
                      <td>{language === 'np' ? complaint.name : complaint.enName}</td>
                      <td>{language === 'np' ? complaint.complaint : complaint.enComplaint}</td>
                      <td>{language === 'np' ? complaint.date : complaint.enDate}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                          {getStatusText(complaint.status, complaint.enStatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="latest-status-card">
            <h3>📊 {t.latestStatusTitle}</h3>
            {currentStatusCounts.map((item, idx) => (
              <div key={idx} className="status-item">
                <div className="status-title">{item.title}</div>
                <div className="status-number">{item.count} <span className="status-range">{item.range}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Section */}
        <section className="statistics">
          <div className="container">
            <h3>{t.statsTitle}</h3>
            <div className="stats-grid">
              {channelStats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-info">
                    <span className="stat-name">{language === 'np' ? stat.name : stat.enName}</span>
                    <span className="stat-percentage">{stat.percentage}%</span>
                  </div>
                  <div className="stat-bar" style={{ width: `${Math.min(stat.percentage * 2.2, 100)}%`, backgroundColor: stat.color }} />
                </div>
              ))}
            </div>
            <div className="quick-links">
              <span>{t.links}</span>
              <button onClick={() => navigate('/complaints')}>{t.complaints}</button>
              <button onClick={() => navigate('/faqs')}>{t.faqs}</button>
              <button onClick={() => navigate('/policy')}>{t.policy}</button>
            </div>
          </div>
        </section>

        {/* Netcom & Signal Complaints Section */}
        <div className="signal-section">
          <div className="signal-container">
            <div className="signal-card">
              <h3>📶 {t.netcomSignalComplaints}</h3>
              <p>{t.netcomSignalText}</p>
              <div className="complaint-list">
                {latestComplaints.map((complaint, idx) => (
                  <div key={idx} className="complaint-item">
                    <span className="complaint-category">{language === 'np' ? complaint.category : complaint.enCategory}</span>
                    <span className="complaint-date">{language === 'np' ? complaint.date : complaint.enDate}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="contact-card">
              <h3>📞 {t.contactInfo}</h3>
              <div className="contact-details">
                <p><strong>📱 {t.helpline}:</strong> 198 ({t.tollFree})</p>
                <p><strong><EmailIconComponent className="contact-card-email-icon" /> {t.email}:</strong> {t.emailAddress}</p>
                <p><strong>📍 {t.address}:</strong> {t.departmentAddress}</p>
                <p><strong>📞 {t.phone}:</strong> {t.contactNumber}</p>
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
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .landing-page {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: #f5f7fa;
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
        .contact-icon-image { width: 14px; height: 14px; object-fit: contain; }

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
        .nav-menu-left { display: flex; gap: 20px; align-items: center; }
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
        .nav-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px); }
        .nav-icon { font-size: 1.1rem; }
        .nav-text { font-size: 0.95rem; }
        .login-btn-right { display: flex; align-items: center; }
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
        .login-btn:hover { background: white; color: #1565c0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

        /* Main Content */
        .main-content {
          padding-top: 195px;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
          padding: 60px 40px;
          border-bottom: 4px solid #1565c0;
        }

        .hero-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 50px;
          flex-wrap: wrap;
        }

        .hero-left {
          flex: 1;
          min-width: 320px;
        }

        .hero-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .hero-left h2 {
          font-size: 1.8rem;
          color: #0d47a1;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .hero-left p {
          font-size: 1.1rem;
          color: #2c4e6e;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .hero-quote {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1565c0;
          margin-bottom: 30px;
          font-style: italic;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .btn-primary, .btn-secondary {
          padding: 14px 32px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
          border: none;
          font-size: 1rem;
        }

        .btn-primary {
          background: #1565c0;
          color: white;
        }
        .btn-primary:hover { background: #0d47a1; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.15); }

        .btn-secondary {
          background: white;
          color: #1565c0;
          border: 2px solid #1565c0;
        }
        .btn-secondary:hover { background: #1565c0; color: white; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.15); }

        .complaint-regarding-container { margin-top: 15px; text-align: left; }
        .btn-complaint-regarding {
          padding: 16px 36px;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
          border: 2px solid #1565c0;
          font-size: 1.1rem;
          background: white;
          color: #1565c0;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .btn-complaint-regarding:hover { background: #1565c0; color: white; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.15); }

        .hero-right { flex: 1; display: flex; justify-content: flex-end; align-items: center; min-width: 300px; }
        .hero-image-wrapper { width: 100%; max-width: 650px; background: transparent; border-radius: 20px; display: flex; justify-content: center; align-items: center; }
        .hero-illustration { width: 100%; max-width: 600px; height: auto; border-radius: 20px; object-fit: contain; display: block; }
        .hero-illustration-fallback {
          width: 100%;
          max-width: 450px;
          background: linear-gradient(135deg, #1565c0, #42a5f5);
          border-radius: 20px;
          padding: 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }
        .fallback-icon { font-size: 4rem; margin-bottom: 20px; }
        .fallback-text { font-size: 1.3rem; font-weight: 600; margin-bottom: 10px; }
        .fallback-subtext { font-size: 0.9rem; opacity: 0.9; }

        /* Complaint Channels Section */
        .channels-section {
          background: white;
          padding: 40px 24px;
          border-bottom: 1px solid #e2e9f0;
        }
        .channels-container { max-width: 1200px; margin: 0 auto; }
        .channels-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1a2c3e;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #1565c0;
          display: inline-block;
        }
        .channels-list {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          margin-top: 20px;
          justify-content: center;
        }
        .channel-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          cursor: default;
          min-width: 100px;
        }
        .channel-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          border-color: #1565c0;
          background: linear-gradient(135deg, #ffffff, #e3f2fd);
        }
        .channel-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .channel-icon-image { width: 35px; height: 35px; object-fit: contain; }
        .channel-emoji { font-size: 2rem; }
        .channel-name { font-size: 0.85rem; font-weight: 600; color: #1a2c3e; text-align: center; }

        /* Public Complaints and Latest Status Container */
        .stats-public-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .public-complaints-card, .latest-status-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          border: 1px solid #e8e8e8;
        }
        .public-complaints-card h3, .latest-status-card h3 {
          font-size: 1.3rem;
          color: #0d47a1;
          margin-bottom: 20px;
          border-left: 4px solid #1565c0;
          padding-left: 16px;
        }
        .table-wrapper { overflow-x: auto; }
        .complaints-table { width: 100%; border-collapse: collapse; }
        .complaints-table th, .complaints-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        .complaints-table th { background: #f5f7fa; font-weight: 600; color: #0d47a1; }
        .complaints-table tr:hover { background: #f8fafc; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .status-progress { background: #fff3cd; color: #856404; }
        .status-resolved { background: #d4edda; color: #155724; }
        .status-pending { background: #f8d7da; color: #721c24; }
        .status-review { background: #fff3cd; color: #856404; }
        .status-item { background: #f5f7fa; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
        .status-title { font-weight: 500; margin-bottom: 8px; color: #1a2c3e; }
        .status-number { font-size: 1.3rem; font-weight: 700; color: #1565c0; }
        .status-range { font-size: 0.75rem; font-weight: normal; color: #6c8196; }

        /* Statistics */
        .statistics {
          background: white;
          padding: 48px 24px;
        }
        .container { max-width: 1000px; margin: 0 auto; }
        .statistics h3 { text-align: center; margin-bottom: 32px; color: #0d47a1; font-size: 1.3rem; }
        .stats-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .stat-card { background: #f5f7fa; border-radius: 12px; overflow: hidden; }
        .stat-bar { height: 8px; transition: width 0.5s; }
        .stat-info { padding: 12px 16px; display: flex; justify-content: space-between; font-weight: 500; }
        .quick-links { text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        .quick-links span { font-weight: 600; margin-right: 16px; color: #1565c0; }
        .quick-links button { background: none; border: none; color: #1565c0; margin: 0 8px; cursor: pointer; font-weight: 500; }
        .quick-links button:hover { text-decoration: underline; }

        /* Signal Section */
        .signal-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 48px;
        }
        .signal-container { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .signal-card, .contact-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          border: 1px solid #e8e8e8;
        }
        .signal-card h3, .contact-card h3 {
          font-size: 1.3rem;
          color: #0d47a1;
          margin-bottom: 20px;
          border-left: 4px solid #1565c0;
          padding-left: 16px;
        }
        .complaint-list { margin-top: 20px; }
        .complaint-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .complaint-item:last-child { border-bottom: none; }
        .complaint-category { font-weight: 500; color: #1a2c3e; }
        .complaint-date { color: #6c8196; font-size: 0.85rem; }
        .contact-details { line-height: 2; }
        .contact-details p { margin: 10px 0; }
        .contact-card-email-icon { width: 14px; height: 14px; object-fit: contain; vertical-align: middle; margin-right: 2px; }

        /* Footer */
        .footer {
          background: #0d2b5e;
          color: white;
          padding: 20px 24px;
          margin-top: 0;
          text-align: center;
        }
        .footer-content { max-width: 1200px; margin: 0 auto; }
        .footer-copyright { text-align: center; font-size: 0.7rem; opacity: 0.7; }
        .copyright-text { margin-top: 5px; font-size: 0.65rem; }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-public-container { grid-template-columns: 1fr; gap: 24px; }
          .signal-container { grid-template-columns: 1fr; gap: 24px; }
          .hero-container { flex-direction: column; text-align: center; }
          .hero-left { text-align: center; }
          .hero-buttons { justify-content: center; }
          .complaint-regarding-container { text-align: center; }
          .hero-right { justify-content: center; margin-top: 30px; }
        }

        @media (max-width: 768px) {
          .main-content { padding-top: 280px; }
          .hero { padding: 40px 20px; }
          .hero-left h2 { fontSize: 1.3rem; }
          .hero-left p { fontSize: 0.95rem; }
          .container-1, .container-2, .container-3 { flex-direction: column; text-align: center; padding: 0 20px; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .contact-info-group { flex-direction: column; }
          .logo-left, .logo-right { display: none; }
          .dept-text-center { flex: 1; }
          .channel-item { min-width: 80px; padding: 15px; }
          .channel-icon-wrapper { width: 50px; height: 50px; }
          .channel-icon-image { width: 28px; height: 28px; }
          .channel-emoji { font-size: 1.6rem; }
          .channel-name { font-size: 0.7rem; }
          .stats-public-container, .signal-section { padding: 32px 20px; }
          .public-complaints-card, .latest-status-card, .signal-card, .contact-card { padding: 20px; }
        }

        @media (max-width: 480px) {
          .main-content { padding-top: 320px; }
          .hero-buttons { flex-direction: column; align-items: center; }
          .btn-primary, .btn-secondary, .btn-complaint-regarding { width: 100%; justify-content: center; }
          .complaints-table th, .complaints-table td { padding: 8px; font-size: 0.75rem; }
          .channels-list { gap: 12px; }
          .channel-item { min-width: 70px; padding: 10px; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;