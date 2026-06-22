// src/pages/FAQS.js
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

const FAQS = () => {
  const navigate = useNavigate();
  
  // Language state with persistence
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // FAQ accordion state
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
      complaints: 'गुनासोहरू',
      frequentlyAskedQuestions: 'बारम्बार सोधिने प्रश्नहरू',
      findAnswers: 'आफ्नो प्रश्नको जवाफ यहाँ खोज्नुहोस्',
      searchPlaceholder: 'प्रश्न खोज्नुहोस्...',
      categories: {
        general: 'साधारण',
        complaint: 'उजुरी सम्बन्धी',
        tracking: 'ट्र्याकिङ',
        technical: 'प्राविधिक',
        account: 'खाता',
        payment: 'भुक्तानी'
      },
      faqs: [
        {
          question: 'एनटीसी गुनासो पोर्टल के हो?',
          answer: 'एनटीसी गुनासो पोर्टल एक अनलाइन प्रणाली हो जहाँ ग्राहकहरूले नेपाल टेलिकमको सेवाहरूसँग सम्बन्धित आफ्ना गुनासोहरू दर्ता, ट्र्याक र व्यवस्थापन गर्न सक्छन्। यो पोर्टलले गुनासो समाधान प्रक्रियालाई सहज र पारदर्शी बनाउँछ।'
        },
        {
          question: 'म कसरी गुनासो दर्ता गर्न सक्छु?',
          answer: 'गुनासो दर्ता गर्न, कृपया गृह पृष्ठमा "उजुरी दिनुहोस्" बटनमा क्लिक गर्नुहोस्। त्यसपछि आवश्यक विवरणहरू (नाम, सम्पर्क, उजुरीको प्रकार, विवरण) भर्नुहोस् र पेश गर्नुहोस्। तपाईंले सफल दर्ता पछि टिकेट नम्बर र पासवर्ड प्राप्त गर्नुहुनेछ।'
        },
        {
          question: 'म कसरी मेरो गुनासो ट्र्याक गर्न सक्छु?',
          answer: 'आफ्नो गुनासो ट्र्याक गर्न, गृह पृष्ठमा "उजुरी ट्र्याक गर्नुहोस्" बटनमा क्लिक गर्नुहोस् र आफ्नो टिकेट नम्बर र पासवर्ड प्रविष्ट गर्नुहोस्। तपाईंले आफ्नो गुनासोको वर्तमान स्थिति देख्न सक्नुहुनेछ।'
        },
        {
          question: 'मैले टिकेट नम्बर र पासवर्ड हराएको छु, के गर्नु?',
          answer: 'यदि तपाईंले आफ्नो टिकेट नम्बर वा पासवर्ड हराउनुभएको छ भने, कृपया हाम्रो ग्राहक सहायता केन्द्र 198 (टोल फ्री) मा सम्पर्क गर्नुहोस् वा coo@ntc.net.np मा इमेल पठाउनुहोस्। तपाईंको पहिचान प्रमाणित गरेपछि हामी तपाईंलाई विवरण पुन: प्राप्त गर्न मद्दत गर्नेछौं।'
        },
        {
          question: 'मेरो गुनासो समाधान हुन कति समय लाग्छ?',
          answer: 'गुनासोको प्रकृति र जटिलतामा निर्भर गर्दै, साधारण गुनासोहरू ३-५ कार्य दिनभित्र समाधान गरिन्छन्। जटिल गुनासोहरूको लागि यसले ७-१४ कार्य दिन लाग्न सक्छ। हाम्रो टोली तपाईंको गुनासो छिटो समाधान गर्न प्रतिबद्ध छ।'
        },
        {
          question: 'के म धेरै गुनासो एकैपटक दर्ता गर्न सक्छु?',
          answer: 'हो, तपाईंले धेरै गुनासो एकैपटक दर्ता गर्न सक्नुहुन्छ। प्रत्येक गुनासोको लागि छुट्टै टिकेट नम्बर उत्पन्न हुनेछ। तपाईंले प्रत्येक टिकेटलाई अलग-अलग ट्र्याक गर्न सक्नुहुन्छ।'
        },
        {
          question: 'मैले कस्ता प्रकारका गुनासोहरू दर्ता गर्न सक्छु?',
          answer: 'तपाईंले निम्न प्रकारका गुनासोहरू दर्ता गर्न सक्नुहुन्छ: इन्टरनेट सेवा समस्या, रिचार्ज र ब्यालेन्स समस्या, सेवा सक्रियता/निष्क्रियता, बिलिङ समस्या, नेटवर्क कभरेज, सिग्नल समस्या, र अन्य।'
        },
        {
          question: 'के मेरो व्यक्तिगत जानकारी सुरक्षित छ?',
          answer: 'हो, हामी तपाईंको व्यक्तिगत जानकारीलाई अत्यन्त गम्भीरताका साथ लिन्छौं। हाम्रो गोपनीयता नीति अनुसार, हामी तपाईंको डाटालाई सुरक्षित र गोप्य राख्छौं र यसलाई अनधिकृत पहुँचबाट जोगाउँछौं।'
        },
        {
          question: 'के म फोन वा इमेल मार्फत गुनासो दर्ता गर्न सक्छु?',
          answer: 'हो, तपाईंले हाम्रो हटलाइन 198 (टोल फ्री) मा फोन गरेर वा coo@ntc.net.np मा इमेल पठाएर पनि गुनासो दर्ता गर्न सक्नुहुन्छ। हाम्रो ग्राहक सहायता टोली तपाईंलाई सहयोग गर्न तयार छ।'
        },
        {
          question: 'म कसरी आफ्नो गुनासोको स्थिति अपडेट प्राप्त गर्न सक्छु?',
          answer: 'तपाईंले आफ्नो इमेलमा स्वचालित सूचनाहरू प्राप्त गर्न सक्नुहुन्छ। साथै, तपाईंले हाम्रो पोर्टलमा लगइन गरेर आफ्नो गुनासोको स्थिति कुनै पनि समय जाँच गर्न सक्नुहुन्छ।'
        }
      ],
      stillHaveQuestions: 'अझै प्रश्नहरू छन्?',
      contactSupport: 'हामीलाई सम्पर्क गर्नुहोस्',
      supportText: 'यदि तपाईंले आफ्नो प्रश्नको जवाफ पाउनुभएन भने, कृपया हाम्रो ग्राहक सहायता टोलीलाई सम्पर्क गर्नुहोस्।',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      showMore: 'थप हेर्नुहोस्',
      showLess: 'कम हेर्नुहोस्',
      copyPhone: 'फोन नम्बर प्रतिलिपि गर्नुहोस्',
      copyEmail: 'इमेल प्रतिलिपि गर्नुहोस्',
      copied: 'प्रतिलिपि गरियो!',
      questionsFound: 'प्रश्नहरू फेला पर्यो'
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
      login: 'Login',
      complaints: 'Complaints',
      frequentlyAskedQuestions: 'Frequently Asked Questions',
      findAnswers: 'Find answers to your questions here',
      searchPlaceholder: 'Search questions...',
      categories: {
        general: 'General',
        complaint: 'Complaint',
        tracking: 'Tracking',
        technical: 'Technical',
        account: 'Account',
        payment: 'Payment'
      },
      faqs: [
        {
          question: 'What is the NTC Complaint Portal?',
          answer: 'The NTC Complaint Portal is an online system where customers can register, track, and manage their complaints related to Nepal Telecom services. This portal makes the complaint resolution process easier and more transparent.'
        },
        {
          question: 'How can I register a complaint?',
          answer: 'To register a complaint, please click on the "Submit Complaint" button on the home page. Then fill in the required details (name, contact, complaint type, description) and submit. You will receive a ticket number and password after successful registration.'
        },
        {
          question: 'How can I track my complaint?',
          answer: 'To track your complaint, click on the "Track Complaint" button on the home page and enter your ticket number and password. You will be able to see the current status of your complaint.'
        },
        {
          question: 'I lost my ticket number and password. What should I do?',
          answer: 'If you have lost your ticket number or password, please contact our customer support center at 198 (Toll Free) or email us at coo@ntc.net.np. After verifying your identity, we will help you recover your details.'
        },
        {
          question: 'How long does it take to resolve my complaint?',
          answer: 'Depending on the nature and complexity of the complaint, simple complaints are resolved within 3-5 business days. For complex complaints, it may take 7-14 business days. Our team is committed to resolving your complaint quickly.'
        },
        {
          question: 'Can I register multiple complaints at once?',
          answer: 'Yes, you can register multiple complaints at once. A separate ticket number will be generated for each complaint. You can track each ticket separately.'
        },
        {
          question: 'What types of complaints can I register?',
          answer: 'You can register the following types of complaints: Internet Service Issues, Recharge & Balance Issues, Service Activation/Deactivation, Billing Issues, Network Coverage, Signal Issues, and others.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we take your personal information very seriously. According to our privacy policy, we keep your data secure and confidential and protect it from unauthorized access.'
        },
        {
          question: 'Can I register a complaint via phone or email?',
          answer: 'Yes, you can also register a complaint by calling our hotline 198 (Toll Free) or by emailing us at coo@ntc.net.np. Our customer support team is ready to assist you.'
        },
        {
          question: 'How can I receive updates on my complaint status?',
          answer: 'You can receive automatic notifications via email. Additionally, you can check your complaint status at any time by logging into our portal.'
        }
      ],
      stillHaveQuestions: 'Still have questions?',
      contactSupport: 'Contact Support',
      supportText: 'If you couldn\'t find the answer to your question, please contact our customer support team.',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      backToHome: 'Back to Home',
      showMore: 'Show More',
      showLess: 'Show Less',
      copyPhone: 'Copy phone number',
      copyEmail: 'Copy email address',
      copied: 'Copied!',
      questionsFound: 'questions found'
    }
  };

  const t = content[language];

  // Filter FAQs based on search term
  const filteredFaqs = t.faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedFaqs = filteredFaqs.slice(0, visibleCount);
  const hasMore = filteredFaqs.length > visibleCount;

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
    setOpenIndex(null);
    setVisibleCount(5);
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
    <div className="faqs-page">
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
            <button onClick={() => navigate('/complaints')} className="nav-btn">
              <span className="nav-icon">📋</span>
              <span className="nav-text">{t.complaints}</span>
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
        <div className="faqs-container">
          <div className="faqs-card">
            <div className="faqs-header">
              <div className="faqs-icon">❓</div>
              <h1>{t.frequentlyAskedQuestions}</h1>
              <p>{t.findAnswers}</p>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  ✕
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="results-count">
              {filteredFaqs.length} {t.questionsFound}
            </div>

            {/* FAQ Accordion */}
            <div className="faqs-list">
              {displayedFaqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <button
                    className={`faq-question ${openIndex === index ? 'active' : ''}`}
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
                    <span className="faq-question-text">{faq.question}</span>
                  </button>
                  <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More / Show Less Button */}
            {filteredFaqs.length > 5 && (
              <div className="show-more-container">
                <button
                  className="show-more-btn"
                  onClick={() => setVisibleCount(hasMore ? visibleCount + 5 : 5)}
                >
                  {hasMore ? t.showMore : t.showLess}
                </button>
              </div>
            )}

            {/* Still Have Questions Section */}
            <div className="support-section">
              <div className="support-icon">💬</div>
              <h3>{t.stillHaveQuestions}</h3>
              <p>{t.supportText}</p>
              <div className="support-buttons">
                <button 
                  className="support-btn phone"
                  onClick={() => window.location.href = 'tel:198'}
                >
                  📞 {t.contactNumber}
                </button>
                <button 
                  className="support-btn email"
                  onClick={() => window.location.href = 'mailto:coo@ntc.net.np'}
                >
                  ✉️ {t.emailAddress}
                </button>
              </div>
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

        .faqs-page {
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
          padding: 0;
          z-index: 1040;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          height: 55px;
          display: flex;
          align-items: center;
        }

        .container-1 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          width: 100%;
        }

        .header-left { display: flex; align-items: center; gap: 16px; }
        .we-are-here {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          padding: 4px 16px;
          border-radius: 40px;
          font-weight: 500;
        }
        .quote-text { font-size: 0.85rem; letter-spacing: 0.5px; font-weight: 600; }

        .header-right { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
        .contact-info-group { display: flex; align-items: center; gap: 10px; }
        .contact-info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          background: rgba(255,255,255,0.1);
          padding: 4px 10px;
          border-radius: 30px;
          transition: all 0.3s ease;
        }
        .contact-info-item:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
        .contact-icon { font-size: 0.75rem; }
        .contact-text { font-size: 0.7rem; font-weight: 500; }

        .copy-btn-mini {
          background: rgba(255,255,255,0.2);
          border: none;
          cursor: pointer;
          font-size: 0.6rem;
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
          padding: 4px 12px;
          border-radius: 30px;
          cursor: pointer;
          color: white;
          font-size: 0.7rem;
          font-weight: 500;
          transition: all 0.3s ease;
          height: 32px;
        }
        .language-selector:hover { background: rgba(255,255,255,0.25); }
        .lang-icon { font-size: 0.75rem; }
        .dropdown-arrow { font-size: 0.5rem; margin-left: 5px; }
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
          padding: 0;
          z-index: 1030;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-bottom: 1px solid rgba(21, 101, 192, 0.15);
          height: 64px;
          display: flex;
          align-items: center;
        }

        .container-2 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          width: 100%;
        }
        .logo-left { flex: 1; display: flex; justify-content: flex-start; }
        .logo-right { flex: 1; display: flex; justify-content: flex-end; }
        .ntc-logo, .gov-logo { height: 45px; width: auto; object-fit: contain; }
        .logo-fallback {
          font-size: 1.8rem;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1565c0, #42a5f5);
          border-radius: 50%;
          color: white;
        }
        .dept-text-center { flex: 2; text-align: center; }
        .dept-name { font-size: 0.95rem; font-weight: 700; color: #0d47a1; letter-spacing: 1px; }
        .dept-address { font-size: 0.7rem; opacity: 0.7; color: #555; margin-top: 2px; }

        /* HEADER 3 - Navigation Bar */
        .header-3 {
          position: fixed;
          top: 119px;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
          color: white;
          padding: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1020;
          height: 56px;
          display: flex;
          align-items: center;
        }

        .container-3 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          width: 100%;
        }

        .nav-menu-left { display: flex; gap: 10px; align-items: center; }
        .nav-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 16px;
          border-radius: 40px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px); }
        .nav-icon { font-size: 1rem; }
        .nav-text { font-size: 0.85rem; }

        .login-btn-right { display: flex; align-items: center; }
        .login-btn {
          background: transparent;
          border: 2px solid white;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 24px;
          border-radius: 40px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .login-btn:hover { background: white; color: #1565c0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

        /* Main Content */
        .main-content {
          flex: 1;
          padding-top: 195px;
          padding-bottom: 40px;
        }

        .faqs-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .faqs-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .faqs-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .faqs-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .faqs-header h1 {
          font-size: 2rem;
          color: #0d47a1;
          margin-bottom: 8px;
        }

        .faqs-header p {
          color: #6c8196;
        }

        /* Search Bar */
        .search-bar {
          position: relative;
          margin-bottom: 16px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.1rem;
          color: #999;
        }

        .search-bar input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e0e0e0;
          border-radius: 50px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #1565c0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          color: #999;
          transition: color 0.3s;
        }

        .clear-search:hover {
          color: #333;
        }

        .results-count {
          text-align: right;
          font-size: 0.8rem;
          color: #888;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e0e0e0;
        }

        /* FAQ Accordion */
        .faqs-list {
          margin-bottom: 32px;
        }

        .faq-item {
          margin-bottom: 16px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          border-color: #1565c0;
        }

        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          background: white;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .faq-question:hover {
          background: #f5f7fa;
        }

        .faq-question.active {
          background: linear-gradient(135deg, #e3f2fd, #ffffff);
        }

        .faq-icon {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1565c0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e3f2fd;
          flex-shrink: 0;
        }

        .faq-question-text {
          flex: 1;
          font-size: 1rem;
          font-weight: 600;
          color: #1a2c3e;
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
          background: #f8fafc;
        }

        .faq-answer.open {
          max-height: 500px;
        }

        .faq-answer p {
          padding: 20px;
          color: #2c4e6e;
          line-height: 1.6;
          margin: 0;
        }

        /* Show More Button */
        .show-more-container {
          text-align: center;
          margin: 24px 0;
        }

        .show-more-btn {
          background: transparent;
          border: 2px solid #1565c0;
          color: #1565c0;
          padding: 10px 32px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .show-more-btn:hover {
          background: #1565c0;
          color: white;
          transform: translateY(-2px);
        }

        /* Support Section */
        .support-section {
          background: linear-gradient(135deg, #e3f2fd, #e8eaf6);
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          margin: 32px 0;
        }

        .support-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .support-section h3 {
          font-size: 1.3rem;
          color: #0d47a1;
          margin-bottom: 8px;
        }

        .support-section p {
          color: #2c4e6e;
          margin-bottom: 20px;
        }

        .support-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .support-btn {
          padding: 10px 24px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .support-btn.phone {
          background: #1565c0;
          color: white;
        }

        .support-btn.phone:hover {
          background: #0d47a1;
          transform: translateY(-2px);
        }

        .support-btn.email {
          background: transparent;
          border: 2px solid #1565c0;
          color: #1565c0;
        }

        .support-btn.email:hover {
          background: #1565c0;
          color: white;
          transform: translateY(-2px);
        }

        /* Back Button */
        .back-to-home {
          margin-top: 20px;
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
        @media (max-width: 1024px) {
          .container-1, .container-2, .container-3 {
            padding: 0 20px;
          }
          .faqs-container { padding: 40px 20px; }
        }

        @media (max-width: 768px) {
          .main-content { 
            padding-top: 290px; 
          }
          
          .header-1 { 
            height: auto; 
            min-height: 55px; 
            padding: 8px 0;
          }
          .header-2 { 
            height: auto; 
            min-height: 60px; 
            padding: 8px 0;
          }
          .header-3 { 
            height: auto; 
            min-height: 52px; 
            padding: 8px 0;
          }
          
          .container-1, .container-2, .container-3 { 
            flex-direction: column; 
            text-align: center; 
            padding: 0 16px;
            gap: 8px;
          }
          
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { 
            justify-content: center; 
            width: 100%;
          }
          
          .contact-info-group { 
            flex-direction: column; 
            gap: 6px; 
            width: 100%;
            align-items: center;
          }
          
          .logo-left, .logo-right { display: none; }
          .dept-text-center { flex: 1; }
          
          .faqs-card { padding: 28px 20px; }
          .faqs-header h1 { font-size: 1.5rem; }
          .faq-question { padding: 14px 16px; }
          .faq-question-text { font-size: 0.9rem; }
          .support-buttons { flex-direction: column; }
          .support-btn { width: 100%; }
        }

        @media (max-width: 480px) {
          .main-content { 
            padding-top: 310px; 
          }
          .faqs-card { padding: 20px 16px; }
          .faq-icon { width: 20px; height: 20px; font-size: 1rem; }
          .faq-question-text { font-size: 0.85rem; }
          .faq-answer p { font-size: 0.85rem; padding: 16px; }
          .show-more-btn { padding: 8px 24px; font-size: 0.85rem; }
          .support-section { padding: 24px 16px; }
          .support-section h3 { font-size: 1.1rem; }
          .support-section p { font-size: 0.85rem; }
          .btn-back { padding: 10px 24px; font-size: 0.85rem; }
          .faqs-header h1 { font-size: 1.3rem; }
          .faqs-icon { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
};

export default FAQS;