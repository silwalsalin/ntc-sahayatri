// src/pages/SubmitComplaint.js
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

const SubmitComplaint = () => {
  const navigate = useNavigate();
  
  // Language state
  const [language, setLanguage] = useState('np');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // State for complaint form
  const [formData, setFormData] = useState({
    natureOfComplaint: '',
    name: '',
    state: '',
    district: '',
    municipality: '',
    wardNo: '',
    streetAddress: '',
    email: '',
    phone: '',
    description: ''
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // In-memory complaints store
  const [complaintsStore, setComplaintsStore] = useState([]);

  // Complete Nepal Location Data (simplified for brevity - same as original)
  const locationData = {
    province1: { np: 'प्रदेश नं. १', en: 'Province No. 1', districts: {} },
    province2: { np: 'मधेश प्रदेश', en: 'Madhesh Province', districts: {} },
    province3: { np: 'बागमती प्रदेश', en: 'Bagmati Province', districts: {} },
    province4: { np: 'गण्डकी प्रदेश', en: 'Gandaki Province', districts: {} },
    province5: { np: 'लुम्बिनी प्रदेश', en: 'Lumbini Province', districts: {} },
    province6: { np: 'कर्णाली प्रदेश', en: 'Karnali Province', districts: {} },
    province7: { np: 'सुदूरपश्चिम प्रदेश', en: 'Sudurpashchim Province', districts: {} }
  };

  const getDistricts = () => {
    if (!formData.state || !locationData[formData.state]) return [];
    return [];
  };

  const getMunicipalities = () => {
    if (!formData.state || !formData.district || !locationData[formData.state]) return [];
    return [];
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
      complaintDetails: 'उजुरीको विवरण',
      note: 'नोट: कृपया सही र विस्तृत जानकारी प्रदान गर्नुहोस् ताकि हामी तपाईंको समस्या छिटो समाधान गर्न सकौं।',
      natureOfComplaints: 'उजुरीको प्रकृति',
      selectNature: 'उजुरीको प्रकृति चयन गर्नुहोस्',
      serviceIssue: 'सेवा समस्या',
      billingIssue: 'बिलिङ समस्या',
      technicalIssue: 'प्राविधिक समस्या',
      networkCoverage: 'नेटवर्क कभरेज',
      signalIssue: 'सिग्नल समस्या',
      rechargeIssue: 'रिचार्ज समस्या',
      activationIssue: 'सक्रियता समस्या',
      otherComplaint: 'अन्य',
      problemCreatorName: 'उजुरीकर्ताको नाम',
      problemCreatorAddress: 'उजुरीकर्ताको ठेगाना',
      state: 'प्रदेश',
      district: 'जिल्ला',
      municipality: 'नगरपालिका/गाउँपालिका',
      wardNo: 'वडा नं.',
      streetAddress: 'सडक ठेगाना',
      emailAddress: 'इमेल ठेगाना',
      mobileNumber: 'मोबाइल नम्बर',
      relatedDocuments: 'सम्बन्धित कागजातहरू (यदि भएमा)',
      requiredField: 'आवश्यक फिल्ड',
      dropFile: 'आफ्नो फाइल यहाँ छोड्नुहोस् वा क्लिक गरेर अपलोड गर्नुहोस्',
      clickToUpload: 'अपलोड गर्न क्लिक गर्नुहोस्',
      complaintsBriefDescription: 'उजुरीको संक्षिप्त विवरण',
      enterComplaint: 'आफ्नो उजुरी प्रविष्ट गर्नुहोस्',
      registerComplaint: 'उजुरी दर्ता गर्नुहोस्',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      selectState: 'प्रदेश चयन गर्नुहोस्',
      selectDistrict: 'जिल्ला चयन गर्नुहोस्',
      selectMunicipality: 'नगरपालिका/गाउँपालिका चयन गर्नुहोस्'
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
      complaintDetails: 'Complaint Details',
      note: 'Note: Kindly provide accurate and detailed information to help us resolve your issue quickly',
      natureOfComplaints: 'Nature of Complaints',
      selectNature: 'Select nature of complaint',
      serviceIssue: 'Service Issue',
      billingIssue: 'Billing Issue',
      technicalIssue: 'Technical Issue',
      networkCoverage: 'Network Coverage',
      signalIssue: 'Signal Issue',
      rechargeIssue: 'Recharge Issue',
      activationIssue: 'Activation Issue',
      otherComplaint: 'Other',
      problemCreatorName: "Problem Creator's Name",
      problemCreatorAddress: "Problem Creator's Address",
      state: 'State/Province',
      district: 'District',
      municipality: 'Municipality/VDC',
      wardNo: 'Ward No.',
      streetAddress: 'Street Address',
      emailAddress: 'Email Address',
      mobileNumber: 'Mobile Number',
      relatedDocuments: 'Related Documents (If any)',
      requiredField: 'Required field',
      dropFile: 'Drop your file here or click to upload from your computer',
      clickToUpload: 'Click to upload',
      complaintsBriefDescription: "Complaint's Brief Description",
      enterComplaint: 'Enter your complaint in detail',
      registerComplaint: 'Register Complaint',
      backToHome: 'Back to Home',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      selectState: 'Select Province',
      selectDistrict: 'Select District',
      selectMunicipality: 'Select Municipality/VDC'
    }
  };

  const t = content[language];

  const provinces = [
    { value: 'province1', np: 'प्रदेश नं. १', en: 'Province No. 1' },
    { value: 'province2', np: 'मधेश प्रदेश', en: 'Madhesh Province' },
    { value: 'province3', np: 'बागमती प्रदेश', en: 'Bagmati Province' },
    { value: 'province4', np: 'गण्डकी प्रदेश', en: 'Gandaki Province' },
    { value: 'province5', np: 'लुम्बिनी प्रदेश', en: 'Lumbini Province' },
    { value: 'province6', np: 'कर्णाली प्रदेश', en: 'Karnali Province' },
    { value: 'province7', np: 'सुदूरपश्चिम प्रदेश', en: 'Sudurpashchim Province' }
  ];

  const generateTicketId = () => {
    const num = Math.floor(Math.random() * 900 + 100);
    return `NTC-२०८०-${num}`;
  };

  const generateEnTicketId = () => {
    const num = Math.floor(Math.random() * 900 + 100);
    return `NTC-2080-${num}`;
  };

  const generatePassword = () => {
    return 'pass' + Math.floor(Math.random() * 900 + 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '', municipality: '' }));
    } else if (name === 'district') {
      setFormData(prev => ({ ...prev, district: value, municipality: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    
    if (!formData.natureOfComplaint) {
      alert(language === 'np' ? '❌ कृपया उजुरीको प्रकृति चयन गर्नुहोस्।' : '❌ Please select nature of complaint.');
      return;
    }
    
    if (!formData.name) {
      alert(language === 'np' ? '❌ कृपया पुरा नाम भर्नुहोस्।' : '❌ Please enter your name.');
      return;
    }
    
    if (!formData.email || !formData.phone) {
      alert(language === 'np' ? '❌ कृपया इमेल र मोबाइल नम्बर भर्नुहोस्।' : '❌ Please enter email and mobile number.');
      return;
    }
    
    if (!formData.description) {
      alert(language === 'np' ? '📝 कृपया उजुरीको विवरण भर्नुहोस्।' : '📝 Please describe your complaint.');
      return;
    }

    const ticketId = generateTicketId();
    const enTicketId = generateEnTicketId();
    const password = generatePassword();
    const today = new Date();
    const npDate = `${today.getFullYear() - 57}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const newComplaint = {
      ticketId: ticketId,
      enTicketId: enTicketId,
      password: password,
      name: formData.name,
      enName: formData.name,
      email: formData.email,
      phone: formData.phone,
      category: formData.natureOfComplaint,
      description: formData.description,
      enDescription: formData.description,
      status: language === 'np' ? 'विचाराधीन' : 'Pending',
      enStatus: 'Pending',
      date: npDate,
      enDate: today.toISOString().split('T')[0],
      channel: language === 'np' ? 'वेबसाइट पोर्टल' : 'Website Portal',
      enChannel: 'Website Portal',
      address: {
        state: formData.state,
        district: formData.district,
        municipality: formData.municipality,
        wardNo: formData.wardNo,
        streetAddress: formData.streetAddress
      }
    };

    setComplaintsStore(prev => [...prev, newComplaint]);

    alert(language === 'np' 
      ? `✅ उजुरी सफलतापूर्वक दर्ता भयो!\n\n📋 टिकेट नम्बर: ${ticketId}\n🔑 पासवर्ड: ${password}\n\n💡 कृपया यो विवरण सुरक्षित राख्नुहोस्।`
      : `✅ Complaint registered successfully!\n\n📋 Ticket ID: ${enTicketId}\n🔑 Password: ${password}\n\n💡 Please save these details to track your complaint.`);

    setFormData({
      natureOfComplaint: '',
      name: '',
      state: '',
      district: '',
      municipality: '',
      wardNo: '',
      streetAddress: '',
      email: '',
      phone: '',
      description: ''
    });
    setSelectedFile(null);

    if (window.confirm(language === 'np' ? 'के तपाईं आफ्नो उजुरी ट्र्याक गर्न चाहनुहुन्छ?' : 'Do you want to track your complaint?')) {
      navigate('/track-complaint');
    }
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
    <div className="submit-complaint-page">
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
            <button className="login-btn" onClick={() => navigate('/admin-login')}>
              <span className="login-icon">🔐</span>
              <span className="login-text">{t.login}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="submit-container">
          <div className="submit-card">
            <div className="submit-header">
              <h2>📋 {t.complaintDetails}</h2>
              <div className="note-box">
                <span className="note-icon">📌</span>
                <p>{t.note}</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmitComplaint} className="submit-form">
              {/* Nature of Complaints */}
              <div className="form-section">
                <h3 className="section-title">{t.natureOfComplaints} <span className="required-star">*</span></h3>
                <div className="form-group">
                  <select 
                    name="natureOfComplaint" 
                    value={formData.natureOfComplaint} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="">{t.selectNature}</option>
                    <option value="service">{t.serviceIssue}</option>
                    <option value="billing">{t.billingIssue}</option>
                    <option value="technical">{t.technicalIssue}</option>
                    <option value="network">{t.networkCoverage}</option>
                    <option value="signal">{t.signalIssue}</option>
                    <option value="recharge">{t.rechargeIssue}</option>
                    <option value="activation">{t.activationIssue}</option>
                    <option value="other">{t.otherComplaint}</option>
                  </select>
                </div>
              </div>

              {/* Problem Creator's Name */}
              <div className="form-section">
                <h3 className="section-title">{t.problemCreatorName} <span className="required-star">*</span></h3>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder={t.problemCreatorName}
                    required 
                  />
                </div>
              </div>

              {/* Problem Creator's Address */}
              <div className="form-section">
                <h3 className="section-title">{t.problemCreatorAddress}</h3>
                <div className="address-grid">
                  <div className="form-group">
                    <select 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange}
                    >
                      <option value="">{t.selectState}</option>
                      {provinces.map(province => (
                        <option key={province.value} value={province.value}>
                          {language === 'np' ? province.np : province.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <select 
                      name="district" 
                      value={formData.district} 
                      onChange={handleInputChange}
                      disabled={!formData.state}
                    >
                      <option value="">{t.selectDistrict}</option>
                      {getDistricts().map(district => (
                        <option key={district.value} value={district.value}>
                          {district.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <select 
                      name="municipality" 
                      value={formData.municipality} 
                      onChange={handleInputChange}
                      disabled={!formData.district}
                    >
                      <option value="">{t.selectMunicipality}</option>
                      {getMunicipalities().map(mun => (
                        <option key={mun.value} value={mun.value}>
                          {mun.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="wardNo" 
                      value={formData.wardNo} 
                      onChange={handleInputChange} 
                      placeholder={t.wardNo}
                    />
                  </div>
                  <div className="form-group full-width">
                    <input 
                      type="text" 
                      name="streetAddress" 
                      value={formData.streetAddress} 
                      onChange={handleInputChange} 
                      placeholder={t.streetAddress}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Row */}
              <div className="form-row">
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder={t.emailAddress}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder={t.mobileNumber}
                    required 
                  />
                </div>
              </div>

              {/* Related Documents */}
              <div className="form-section">
                <h3 className="section-title">{t.relatedDocuments}</h3>
                <div className="document-upload">
                  <div className="required-fields">
                    <span className="required-badge">{t.requiredField}</span>
                    <span className="required-badge">{t.requiredField}</span>
                  </div>
                  <div 
                    className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <div className="drop-zone-content">
                      <span className="upload-icon">📁</span>
                      <p>{t.dropFile}</p>
                      <button type="button" className="upload-btn">{t.clickToUpload}</button>
                    </div>
                    <input 
                      type="file" 
                      id="fileInput" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }} 
                    />
                  </div>
                  {selectedFile && (
                    <div className="selected-file">
                      <span>📄 {selectedFile.name}</span>
                      <button type="button" onClick={() => setSelectedFile(null)}>✕</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Complaint Description */}
              <div className="form-section">
                <h3 className="section-title">{t.complaintsBriefDescription} <span className="required-star">*</span></h3>
                <div className="form-group">
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows="6" 
                    placeholder={t.enterComplaint}
                    required
                  ></textarea>
                </div>
              </div>
              
              <button type="submit" className="btn-submit">
                📌 {t.registerComplaint}
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

        .submit-complaint-page {
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
          min-height: calc(100vh - 255px);
        }

        .submit-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .submit-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .submit-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .submit-header h2 {
          font-size: 1.8rem;
          color: #0d47a1;
          margin-bottom: 20px;
        }

        .note-box {
          background: #f0f7ff;
          border-left: 4px solid #1565c0;
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .note-icon { font-size: 1.2rem; }
        .note-box p { color: #2c4e6e; font-size: 0.9rem; margin: 0; }

        .submit-form { text-align: left; }
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
        .required-star { color: #dc3545; font-size: 1rem; }
        .form-group { margin-bottom: 16px; }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: white;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1565c0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
        }
        select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .full-width { grid-column: 1 / -1; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }

        /* Document Upload */
        .document-upload { margin-top: 8px; }
        .required-fields { display: flex; gap: 12px; margin-bottom: 16px; }
        .required-badge {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          color: #666;
        }
        .drop-zone {
          border: 2px dashed #ccc;
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }
        .drop-zone.drag-active { border-color: #1565c0; background: #e3f2fd; }
        .drop-zone-content { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .upload-icon { font-size: 3rem; }
        .drop-zone p { color: #888; font-size: 0.85rem; margin: 0; }
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
        .selected-file {
          margin-top: 16px;
          padding: 12px 16px;
          background: #e8f0fe;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .selected-file button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #dc3545; }

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
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(21, 101, 192, 0.3); }
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
          .submit-card { padding: 28px 20px; }
          .submit-header h2 { font-size: 1.4rem; }
          .address-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; gap: 16px; }
          .container-1, .container-2, .container-3 { flex-direction: column; text-align: center; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .contact-info-group { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default SubmitComplaint;