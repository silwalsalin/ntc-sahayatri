// src/pages/ComplaintRegarding.js
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

const ComplaintRegarding = () => {
  const navigate = useNavigate();
  
  // Language state
  const [language, setLanguage] = useState('np');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // State for complaint form
  const [formData, setFormData] = useState({
    complaintType: '',
    subject: '',
    description: '',
    priority: 'medium',
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Subject options based on complaint type
  const getSubjectOptions = () => {
    const commonSubjects = {
      np: {
        service: ['इन्टरनेट जडान समस्या', 'फोन कल ड्रप हुने', 'ढिलो इन्टरनेट स्पीड', 'सेवा नभएको', 'सेवा विच्छेद'],
        billing: ['बढी बिल आएको', 'बिल नआएको', 'रिचार्ज नभएको', 'पैसा कट्टी भएको', 'डबल चार्ज'],
        technical: ['वेबसाइट काम नगर्ने', 'एप क्र्याश हुने', 'लगइन समस्या', 'डाटा ढिलो', 'सफ्टवेयर त्रुटि'],
        network: ['नेटवर्क नभएको', 'सिग्नल कमजोर', 'कभरेज समस्या', 'रोमिङ समस्या', '४जी/५जी समस्या'],
        other: ['अन्य समस्या', 'सुझाव', 'गुनासो', 'प्रश्न', 'जानकारी']
      },
      en: {
        service: ['Internet Connection Issue', 'Call Drop Problem', 'Slow Internet Speed', 'Service Not Working', 'Service Disruption'],
        billing: ['Excessive Billing', 'Bill Not Received', 'Recharge Not Credited', 'Wrong Deduction', 'Double Charge'],
        technical: ['Website Not Working', 'App Crashes', 'Login Issue', 'Data Delay', 'Software Bug'],
        network: ['No Network', 'Weak Signal', 'Coverage Issue', 'Roaming Problem', '4G/5G Issue'],
        other: ['Other Issue', 'Suggestion', 'Complaint', 'Inquiry', 'Information']
      }
    };
    
    const type = formData.complaintType || 'other';
    const lang = language === 'np' ? 'np' : 'en';
    const options = commonSubjects[lang][type] || commonSubjects[lang].other;
    return options;
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
      complaintRegarding: 'गुनासो सम्बन्धी',
      complaintInfo: 'गुनासो जानकारी',
      selectComplaintType: 'गुनासोको प्रकार चयन गर्नुहोस्',
      serviceRelated: 'सेवा सम्बन्धी',
      billingRelated: 'बिलिङ सम्बन्धी',
      technicalRelated: 'प्राविधिक सम्बन्धी',
      networkRelated: 'नेटवर्क सम्बन्धी',
      other: 'अन्य',
      subject: 'विषय',
      selectSubject: 'विषय चयन गर्नुहोस्',
      description: 'विवरण',
      enterDescription: 'गुनासोको विस्तृत विवरण लेख्नुहोस्',
      priority: 'प्राथमिकता',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      personalInfo: 'व्यक्तिगत जानकारी',
      fullName: 'पुरा नाम',
      enterFullName: 'आफ्नो पुरा नाम प्रविष्ट गर्नुहोस्',
      emailAddress: 'इमेल ठेगाना',
      enterEmail: 'example@email.com',
      mobileNumber: 'मोबाइल नम्बर',
      enterMobile: '९८XXXXXXXX',
      address: 'ठेगाना',
      enterAddress: 'आफ्नो ठेगाना प्रविष्ट गर्नुहोस्',
      attachments: 'संलग्नकहरू',
      dragDrop: 'फाइलहरू यहाँ तान्नुहोस् वा क्लिक गरेर अपलोड गर्नुहोस्',
      supportedFiles: 'समर्थित फाइलहरू: PDF, JPG, PNG, DOC (max 5MB)',
      submitComplaint: 'गुनासो पेश गर्नुहोस्',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      required: 'आवश्यक',
      optional: 'वैकल्पिक'
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
      complaintRegarding: 'Complaint Regarding',
      complaintInfo: 'Complaint Information',
      selectComplaintType: 'Select complaint type',
      serviceRelated: 'Service Related',
      billingRelated: 'Billing Related',
      technicalRelated: 'Technical Related',
      networkRelated: 'Network Related',
      other: 'Other',
      subject: 'Subject',
      selectSubject: 'Select a subject',
      description: 'Description',
      enterDescription: 'Write detailed description of your complaint',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      personalInfo: 'Personal Information',
      fullName: 'Full Name',
      enterFullName: 'Enter your full name',
      emailAddress: 'Email Address',
      enterEmail: 'example@email.com',
      mobileNumber: 'Mobile Number',
      enterMobile: '98XXXXXXXX',
      address: 'Address',
      enterAddress: 'Enter your address',
      attachments: 'Attachments',
      dragDrop: 'Drag & drop files here or click to upload',
      supportedFiles: 'Supported files: PDF, JPG, PNG, DOC (max 5MB)',
      submitComplaint: 'Submit Complaint',
      backToHome: 'Back to Home',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      required: 'Required',
      optional: 'Optional'
    }
  };

  const t = content[language];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.complaintType) {
      alert(language === 'np' ? '❌ कृपया गुनासोको प्रकार चयन गर्नुहोस्।' : '❌ Please select complaint type.');
      return;
    }
    
    if (!formData.subject) {
      alert(language === 'np' ? '❌ कृपया विषय चयन गर्नुहोस्।' : '❌ Please select subject.');
      return;
    }
    
    if (!formData.description) {
      alert(language === 'np' ? '❌ कृपया विवरण भर्नुहोस्।' : '❌ Please enter description.');
      return;
    }
    
    if (!formData.name) {
      alert(language === 'np' ? '❌ कृपया पुरा नाम भर्नुहोस्।' : '❌ Please enter your name.');
      return;
    }

    alert(language === 'np' 
      ? '✅ तपाईंको गुनासो सफलतापूर्वक पेश भयो। हाम्रो टोली चाँडै सम्पर्क गर्नेछ।'
      : '✅ Your complaint has been submitted successfully. Our team will contact you soon.');

    setFormData({
      complaintType: '',
      subject: '',
      description: '',
      priority: 'medium',
      name: '',
      email: '',
      phone: '',
      address: ''
    });
    setSelectedFiles([]);
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
    <div className="complaint-regarding-page">
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
        <div className="complaint-container">
          <div className="complaint-card">
            <div className="complaint-header">
              <div className="header-icon">📋</div>
              <h2>{t.complaintRegarding}</h2>
              <p>{t.complaintInfo}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="complaint-form">
              {/* Complaint Type */}
              <div className="form-section">
                <h3 className="section-title">{t.selectComplaintType} <span className="required">*</span></h3>
                <div className="complaint-types">
                  <label className={`type-option ${formData.complaintType === 'service' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="complaintType"
                      value="service"
                      onChange={handleInputChange}
                    />
                    <span className="type-icon">🔧</span>
                    <span className="type-name">{t.serviceRelated}</span>
                  </label>
                  <label className={`type-option ${formData.complaintType === 'billing' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="complaintType"
                      value="billing"
                      onChange={handleInputChange}
                    />
                    <span className="type-icon">💰</span>
                    <span className="type-name">{t.billingRelated}</span>
                  </label>
                  <label className={`type-option ${formData.complaintType === 'technical' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="complaintType"
                      value="technical"
                      onChange={handleInputChange}
                    />
                    <span className="type-icon">💻</span>
                    <span className="type-name">{t.technicalRelated}</span>
                  </label>
                  <label className={`type-option ${formData.complaintType === 'network' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="complaintType"
                      value="network"
                      onChange={handleInputChange}
                    />
                    <span className="type-icon">📡</span>
                    <span className="type-name">{t.networkRelated}</span>
                  </label>
                  <label className={`type-option ${formData.complaintType === 'other' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="complaintType"
                      value="other"
                      onChange={handleInputChange}
                    />
                    <span className="type-icon">📝</span>
                    <span className="type-name">{t.other}</span>
                  </label>
                </div>
              </div>

              {/* Subject - Dropdown */}
              <div className="form-section">
                <h3 className="section-title">{t.subject} <span className="required">*</span></h3>
                <div className="form-group">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.complaintType}
                  >
                    <option value="">{t.selectSubject}</option>
                    {getSubjectOptions().map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {!formData.complaintType && (
                    <p className="helper-text">
                      {language === 'np' ? 'कृपया पहिले गुनासोको प्रकार चयन गर्नुहोस्' : 'Please select complaint type first'}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-section">
                <h3 className="section-title">{t.description} <span className="required">*</span></h3>
                <div className="form-group">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder={t.enterDescription}
                    required
                  ></textarea>
                </div>
              </div>

              {/* Priority */}
              <div className="form-section">
                <h3 className="section-title">{t.priority}</h3>
                <div className="priority-options">
                  <label className={`priority-option ${formData.priority === 'high' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="priority"
                      value="high"
                      onChange={handleInputChange}
                    />
                    <span className="priority-badge high">🔴 {t.high}</span>
                  </label>
                  <label className={`priority-option ${formData.priority === 'medium' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="priority"
                      value="medium"
                      onChange={handleInputChange}
                    />
                    <span className="priority-badge medium">🟡 {t.medium}</span>
                  </label>
                  <label className={`priority-option ${formData.priority === 'low' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="priority"
                      value="low"
                      onChange={handleInputChange}
                    />
                    <span className="priority-badge low">🟢 {t.low}</span>
                  </label>
                </div>
              </div>

              {/* Personal Information */}
              <div className="form-section">
                <h3 className="section-title">{t.personalInfo}</h3>
                <div className="personal-info-grid">
                  <div className="form-group">
                    <label>{t.fullName} <span className="required">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t.enterFullName}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.emailAddress} <span className="optional">({t.optional})</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t.enterEmail}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.mobileNumber} <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t.enterMobile}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.address} <span className="optional">({t.optional})</span></label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={t.enterAddress}
                    />
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="form-section">
                <h3 className="section-title">{t.attachments} <span className="optional">({t.optional})</span></h3>
                <div 
                  className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <div className="drop-zone-content">
                    <span className="upload-icon">📎</span>
                    <p>{t.dragDrop}</p>
                    <button type="button" className="upload-btn">📁 {t.attachments}</button>
                  </div>
                  <input 
                    type="file" 
                    id="fileInput" 
                    multiple
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                  />
                </div>
                <p className="supported-files">{t.supportedFiles}</p>
                
                {selectedFiles.length > 0 && (
                  <div className="file-list">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                        <button type="button" onClick={() => removeFile(index)} className="remove-file">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button type="submit" className="btn-submit">
                📌 {t.submitComplaint}
              </button>
            </form>
            
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

        .complaint-regarding-page {
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
          min-height: calc(100vh - 195px);
        }
        .complaint-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        .complaint-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .complaint-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        .complaint-header h2 {
          font-size: 1.8rem;
          color: #0d47a1;
          margin-bottom: 8px;
        }
        .complaint-header p {
          color: #6c8196;
        }

        .complaint-form { text-align: left; }
        .form-section {
          margin-bottom: 32px;
          border-bottom: 1px solid #e8e8e8;
          padding-bottom: 24px;
        }
        .form-section:last-of-type { border-bottom: none; }
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0d47a1;
          margin-bottom: 16px;
        }
        .required {
          color: #dc3545;
          font-size: 0.8rem;
        }
        .optional {
          color: #888;
          font-size: 0.75rem;
          font-weight: normal;
        }
        .helper-text {
          font-size: 0.75rem;
          color: #f57c00;
          margin-top: 6px;
        }

        /* Complaint Types */
        .complaint-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }
        .type-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .type-option.active {
          border-color: #1565c0;
          background: #e3f2fd;
        }
        .type-option input {
          display: none;
        }
        .type-icon {
          font-size: 1.2rem;
        }
        .type-name {
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Priority Options */
        .priority-options {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .priority-option {
          cursor: pointer;
        }
        .priority-option input {
          display: none;
        }
        .priority-badge {
          display: inline-block;
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .priority-badge.high {
          background: #ffebee;
          color: #c62828;
        }
        .priority-badge.medium {
          background: #fff8e1;
          color: #f57c00;
        }
        .priority-badge.low {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .priority-option.active .priority-badge {
          border-color: #1565c0;
          transform: scale(1.05);
        }

        /* Personal Info Grid */
        .personal-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 8px;
          color: #2c4e6e;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: white;
        }
        .form-group select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1565c0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
        }

        /* Drop Zone */
        .drop-zone {
          border: 2px dashed #ccc;
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }
        .drop-zone.drag-active {
          border-color: #1565c0;
          background: #e3f2fd;
        }
        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .upload-icon { font-size: 2.5rem; }
        .upload-btn {
          background: #1565c0;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        .upload-btn:hover { background: #0d47a1; }
        .supported-files {
          font-size: 0.7rem;
          color: #888;
          margin-top: 8px;
        }

        /* File List */
        .file-list {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .file-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .file-icon { font-size: 1rem; }
        .file-name { flex: 1; font-size: 0.85rem; }
        .file-size { font-size: 0.7rem; color: #888; }
        .remove-file {
          background: none;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          color: #dc3545;
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
          margin-top: 20px;
        }
        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(21, 101, 192, 0.3);
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
        .btn-back:hover { background: #1565c0; color: white; }

      

        /* Responsive */
        @media (max-width: 768px) {
          .main-content { padding-top: 330px; }
          .complaint-card { padding: 28px 20px; }
          .complaint-header h2 { font-size: 1.4rem; }
          .personal-info-grid { grid-template-columns: 1fr; }
          .complaint-types { grid-template-columns: repeat(2, 1fr); }
          .container-1, .container-2, .container-3 { flex-direction: column; text-align: center; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .contact-info-group { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default ComplaintRegarding;