// src/pages/Policy.js
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

const Policy = () => {
  const navigate = useNavigate();
  
  // Language state with persistence
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

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
      privacyPolicy: 'गोपनीयता नीति',
      lastUpdated: 'अन्तिम अपडेट:',
      introduction: 'परिचय',
      introductionText: 'नेपाल दूरसञ्चार प्राधिकरण (NTC) तपाईंको गोपनीयताको संरक्षण गर्न प्रतिबद्ध छ। यो गोपनीयता नीतिले हामी कसरी तपाईंको व्यक्तिगत जानकारी सङ्कलन, प्रयोग, र सुरक्षा गर्छौं भन्ने व्याख्या गर्दछ।',
      informationWeCollect: 'हामीले सङ्कलन गर्ने जानकारी',
      personalInfo: 'व्यक्तिगत जानकारी',
      personalInfoText: 'तपाईंले हाम्रो पोर्टलमा उजुरी दर्ता गर्दा, हामी निम्न जानकारी सङ्कलन गर्छौं: पूरा नाम, इमेल ठेगाना, मोबाइल नम्बर, ठेगाना, र उजुरीको विवरण।',
      usageData: 'प्रयोग डाटा',
      usageDataText: 'हामी तपाईंले हाम्रो वेबसाइट कसरी प्रयोग गर्नुहुन्छ भन्ने बारे जानकारी स्वचालित रूपमा सङ्कलन गर्छौं, जसमा IP ठेगाना, ब्राउजर प्रकार, पृष्ठ भ्रमण, समय र मिति समावेश छ।',
      howWeUseInfo: 'हामी जानकारी कसरी प्रयोग गर्छौं',
      useTitle1: 'उजुरी प्रशोधन',
      useDesc1: 'तपाईंको उजुरीको समाधानको लागि प्रशोधन र ट्र्याक गर्न।',
      useTitle2: 'सञ्चार',
      useDesc2: 'तपाईंको उजुरीको स्थिति र अद्यावधिकहरूको बारेमा तपाईंलाई सूचित गर्न।',
      useTitle3: 'सेवा सुधार',
      useDesc3: 'हाम्रो सेवाहरूको गुणस्तर सुधार गर्न विश्लेषण र अनुसन्धानको लागि।',
      useTitle4: 'कानूनी अनुपालन',
      useDesc4: 'लागू कानून र नियमहरूको पालना गर्न।',
      informationSharing: 'जानकारी साझेदारी',
      sharingText1: 'हामी तपाईंको व्यक्तिगत जानकारी तेस्रो पक्षसँग बेच्दैनौं, भाडामा दिँदैनौं, वा व्यापार गर्दैनौं।',
      sharingText2: 'हामी निम्न अवस्थामा मात्र जानकारी साझा गर्न सक्छौं:',
      sharingItem1: 'तपाईंको सहमति संग',
      sharingItem2: 'कानूनी आवश्यकता अनुसार',
      sharingItem3: 'हाम्रो सेवा प्रदायकहरू (उदा. होस्टिङ, विश्लेषण) जो गोपनीयता कायम राख्न बाध्य छन्',
      dataSecurity: 'डाटा सुरक्षा',
      securityText: 'हामी तपाईंको व्यक्तिगत जानकारीलाई अनधिकृत पहुँच, परिवर्तन, प्रकटीकरण, वा विनाशबाट जोगाउन उचित प्राविधिक र सांगठनिक उपायहरू अपनाउँछौं।',
      yourRights: 'तपाईंको अधिकारहरू',
      right1: 'आफ्नो व्यक्तिगत जानकारी पहुँच गर्ने',
      right2: 'गलत जानकारी सच्याउन',
      right3: 'आफ्नो जानकारी मेटाउन अनुरोध गर्न',
      right4: 'डाटा प्रशोधनमा प्रतिबन्ध लगाउन',
      right5: 'आफ्नो डाटा अन्यत्र सार्न',
      cookies: 'कुकीज',
      cookiesText: 'हामी तपाईंको अनुभव सुधार गर्न कुकीज प्रयोग गर्छौं। तपाईं आफ्नो ब्राउजर सेटिङहरू मार्फत कुकीज अस्वीकार गर्न सक्नुहुन्छ।',
      changesToPolicy: 'नीतिमा परिवर्तन',
      changesText: 'हामी यो गोपनीयता नीति समय-समयमा अद्यावधिक गर्न सक्छौं। कुनै पनि परिवर्तन यो पृष्ठमा पोस्ट गरिनेछ।',
      contactUs: 'हामीलाई सम्पर्क गर्नुहोस्',
      contactText: 'यस गोपनीयता नीतिको बारेमा कुनै प्रश्नको लागि, कृपया हामीलाई सम्पर्क गर्नुहोस्:',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      copyPhone: 'फोन नम्बर प्रतिलिपि गर्नुहोस्',
      copyEmail: 'इमेल प्रतिलिपि गर्नुहोस्',
      copied: 'प्रतिलिपि गरियो!',
      copySuccess: 'प्रतिलिपि सफल!'
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
      privacyPolicy: 'Privacy Policy',
      lastUpdated: 'Last Updated:',
      introduction: 'Introduction',
      introductionText: 'Nepal Telecommunications Authority (NTC) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.',
      informationWeCollect: 'Information We Collect',
      personalInfo: 'Personal Information',
      personalInfoText: 'When you register a complaint on our portal, we collect the following information: Full Name, Email Address, Mobile Number, Address, and Complaint Details.',
      usageData: 'Usage Data',
      usageDataText: 'We automatically collect information about how you use our website, including IP address, browser type, pages visited, time and date.',
      howWeUseInfo: 'How We Use Your Information',
      useTitle1: 'Complaint Processing',
      useDesc1: 'To process and track your complaints for resolution.',
      useTitle2: 'Communication',
      useDesc2: 'To notify you about your complaint status and updates.',
      useTitle3: 'Service Improvement',
      useDesc3: 'To analyze and research for improving our services.',
      useTitle4: 'Legal Compliance',
      useDesc4: 'To comply with applicable laws and regulations.',
      informationSharing: 'Information Sharing',
      sharingText1: 'We do not sell, rent, or trade your personal information with third parties.',
      sharingText2: 'We may share information only in the following circumstances:',
      sharingItem1: 'With your consent',
      sharingItem2: 'As required by law',
      sharingItem3: 'With our service providers who are bound to maintain confidentiality',
      dataSecurity: 'Data Security',
      securityText: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      yourRights: 'Your Rights',
      right1: 'Access your personal information',
      right2: 'Correct inaccurate information',
      right3: 'Request deletion of your information',
      right4: 'Restrict data processing',
      right5: 'Data portability',
      cookies: 'Cookies',
      cookiesText: 'We use cookies to improve your experience. You can refuse cookies through your browser settings.',
      changesToPolicy: 'Changes to This Policy',
      changesText: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page.',
      contactUs: 'Contact Us',
      contactText: 'If you have any questions about this Privacy Policy, please contact us at:',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      backToHome: 'Back to Home',
      copyPhone: 'Copy phone number',
      copyEmail: 'Copy email address',
      copied: 'Copied!',
      copySuccess: 'Copy successful!'
    }
  };

  const t = content[language];
  const currentDate = new Date().toLocaleDateString(language === 'np' ? 'ne-NP' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`${type} ${t.copied}`);
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
    <div className="policy-page">
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
                <button 
                  className="copy-btn-mini"
                  onClick={() => copyToClipboard('01-4960008', t.copyPhone)}
                  title={t.copyPhone}
                >
                  📋
                </button>
              </div>
              <div className="contact-info-item">
                <span className="contact-icon">✉️</span>
                <span className="contact-text">{t.emailAddress}</span>
                <button 
                  className="copy-btn-mini"
                  onClick={() => copyToClipboard('coo@ntc.net.np', t.copyEmail)}
                  title={t.copyEmail}
                >
                  📋
                </button>
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
          <div className="login-btn-right">
            <button className="login-btn" onClick={() => navigate('/login')}>
              <span className="login-icon">🔐</span>
              <span className="login-text">{t.login}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="policy-container">
          <div className="policy-card">
            <div className="policy-header">
              <div className="policy-icon">🔒</div>
              <h1>{t.privacyPolicy}</h1>
              <p className="last-updated">{t.lastUpdated} {currentDate}</p>
            </div>

            <div className="policy-content">
              {/* Introduction */}
              <section className="policy-section">
                <h2>{t.introduction}</h2>
                <p>{t.introductionText}</p>
              </section>

              {/* Information We Collect */}
              <section className="policy-section">
                <h2>{t.informationWeCollect}</h2>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-icon">👤</div>
                    <h3>{t.personalInfo}</h3>
                    <p>{t.personalInfoText}</p>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">📊</div>
                    <h3>{t.usageData}</h3>
                    <p>{t.usageDataText}</p>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section className="policy-section">
                <h2>{t.howWeUseInfo}</h2>
                <div className="uses-grid">
                  <div className="use-item">
                    <div className="use-icon">📝</div>
                    <h3>{t.useTitle1}</h3>
                    <p>{t.useDesc1}</p>
                  </div>
                  <div className="use-item">
                    <div className="use-icon">📧</div>
                    <h3>{t.useTitle2}</h3>
                    <p>{t.useDesc2}</p>
                  </div>
                  <div className="use-item">
                    <div className="use-icon">📈</div>
                    <h3>{t.useTitle3}</h3>
                    <p>{t.useDesc3}</p>
                  </div>
                  <div className="use-item">
                    <div className="use-icon">⚖️</div>
                    <h3>{t.useTitle4}</h3>
                    <p>{t.useDesc4}</p>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section className="policy-section">
                <h2>{t.informationSharing}</h2>
                <p>{t.sharingText1}</p>
                <p>{t.sharingText2}</p>
                <ul className="sharing-list">
                  <li>✓ {t.sharingItem1}</li>
                  <li>✓ {t.sharingItem2}</li>
                  <li>✓ {t.sharingItem3}</li>
                </ul>
              </section>

              {/* Data Security */}
              <section className="policy-section">
                <h2>{t.dataSecurity}</h2>
                <div className="security-box">
                  <span className="security-icon">🛡️</span>
                  <p>{t.securityText}</p>
                </div>
              </section>

              {/* Your Rights */}
              <section className="policy-section">
                <h2>{t.yourRights}</h2>
                <div className="rights-grid">
                  <div className="right-item">✓ {t.right1}</div>
                  <div className="right-item">✓ {t.right2}</div>
                  <div className="right-item">✓ {t.right3}</div>
                  <div className="right-item">✓ {t.right4}</div>
                  <div className="right-item">✓ {t.right5}</div>
                </div>
              </section>

              {/* Cookies */}
              <section className="policy-section">
                <h2>{t.cookies}</h2>
                <div className="cookie-box">
                  <span className="cookie-icon">🍪</span>
                  <p>{t.cookiesText}</p>
                </div>
              </section>

              {/* Changes to Policy */}
              <section className="policy-section">
                <h2>{t.changesToPolicy}</h2>
                <div className="changes-box">
                  <span className="changes-icon">📌</span>
                  <p>{t.changesText}</p>
                </div>
              </section>

              {/* Contact Us */}
              <section className="policy-section contact-section">
                <h2>{t.contactUs}</h2>
                <div className="contact-box">
                  <div className="contact-info-policy">
                    <p>📞 {t.contactNumber}</p>
                    <p>✉️ {t.emailAddress}</p>
                    <p>📍 {t.departmentAddress}</p>
                  </div>
                  <p className="contact-note">{t.contactText}</p>
                </div>
              </section>
            </div>

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

        .policy-page {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          color: #1a2c3e;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
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

        .copy-btn-mini {
          background: rgba(255,255,255,0.2);
          border: none;
          cursor: pointer;
          font-size: 0.7rem;
          padding: 2px 5px;
          border-radius: 20px;
          transition: all 0.3s ease;
          color: white;
        }
        .copy-btn-mini:hover { background: rgba(255,255,255,0.4); transform: scale(1.05); }

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
          flex: 1;
          padding-top: 195px;
          padding-bottom: 40px;
        }

        .policy-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .policy-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .policy-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .policy-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .policy-header h1 {
          font-size: 2rem;
          color: #0d47a1;
          margin-bottom: 8px;
        }

        .last-updated {
          color: #6c8196;
          font-size: 0.85rem;
        }

        .policy-content {
          text-align: left;
        }

        .policy-section {
          margin-bottom: 40px;
        }

        .policy-section h2 {
          font-size: 1.4rem;
          color: #0d47a1;
          margin-bottom: 20px;
          padding-left: 16px;
          border-left: 4px solid #1565c0;
        }

        .policy-section p {
          line-height: 1.6;
          color: #2c4e6e;
          margin-bottom: 16px;
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 20px;
        }

        .info-card {
          background: #f5f7fa;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .info-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .info-card h3 {
          font-size: 1.1rem;
          color: #0d47a1;
          margin-bottom: 12px;
        }

        .info-card p {
          font-size: 0.9rem;
          margin: 0;
        }

        /* Uses Grid */
        .uses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .use-item {
          background: linear-gradient(135deg, #e3f2fd, #ffffff);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .use-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .use-icon {
          font-size: 2rem;
          margin-bottom: 12px;
        }

        .use-item h3 {
          font-size: 1rem;
          color: #0d47a1;
          margin-bottom: 8px;
        }

        .use-item p {
          font-size: 0.85rem;
          margin: 0;
        }

        /* Sharing List */
        .sharing-list {
          list-style: none;
          padding: 0;
          margin-top: 16px;
        }

        .sharing-list li {
          padding: 8px 0;
          color: #2c4e6e;
        }

        /* Security Box */
        .security-box, .cookie-box, .changes-box {
          background: #e8f5e9;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .security-icon, .cookie-icon, .changes-icon {
          font-size: 2rem;
        }

        .security-box p, .cookie-box p, .changes-box p {
          margin: 0;
          flex: 1;
        }

        /* Rights Grid */
        .rights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }

        .right-item {
          background: #e3f2fd;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          color: #0d47a1;
        }

        /* Contact Section */
        .contact-section {
          background: #f0f7ff;
          border-radius: 20px;
          padding: 24px;
          margin-top: 20px;
        }

        .contact-section h2 {
          margin-top: 0;
        }

        .contact-box {
          margin-top: 16px;
        }

        .contact-info-policy {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 16px;
        }

        .contact-info-policy p {
          margin: 0;
          font-weight: 500;
        }

        .contact-note {
          font-size: 0.85rem;
          color: #6c8196;
        }

        /* Back Button */
        .back-to-home {
          margin-top: 32px;
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

     

        .copyright-text {
          margin-top: 5px;
          font-size: 0.65rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .policy-container { padding: 40px 20px; }
        }

        @media (max-width: 768px) {
          .main-content { padding-top: 280px; }
          .policy-card { padding: 28px 20px; }
          .policy-header h1 { font-size: 1.5rem; }
          .policy-section h2 { font-size: 1.2rem; }
          .info-grid, .uses-grid { grid-template-columns: 1fr; }
          .security-box, .cookie-box, .changes-box { flex-direction: column; text-align: center; }
          .contact-info-policy { flex-direction: column; gap: 8px; }
          .container-1, .container-2, .container-3 { flex-direction: column; text-align: center; padding: 0 20px; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .contact-info-group { flex-direction: column; gap: 8px; }
          .logo-left, .logo-right { display: none; }
          .dept-text-center { flex: 1; }
        }

        @media (max-width: 480px) {
          .main-content { padding-top: 320px; }
          .policy-card { padding: 20px 16px; }
          .rights-grid { grid-template-columns: 1fr; }
          .security-box, .cookie-box, .changes-box { padding: 16px; }
          .security-icon, .cookie-icon, .changes-icon { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Policy;