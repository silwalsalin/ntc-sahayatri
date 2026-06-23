// src/pages/TrackComplaint.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

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
  const location = useLocation();
  
  // Language state
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // State for tracking
  const [trackTicket, setTrackTicket] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Check for ticket ID from URL params or session storage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ticketId = params.get('ticket');
    
    if (ticketId) {
      setTrackTicket(ticketId);
      // Auto-search if ticket ID is provided
      setTimeout(() => {
        handleTrackComplaint(new Event('submit'));
      }, 500);
    }
    
    // Check session storage for tracking ID from previous submission
    const sessionTicket = sessionStorage.getItem('trackingId');
    if (sessionTicket && !ticketId) {
      setTrackTicket(sessionTicket);
      setTimeout(() => {
        handleTrackComplaint(new Event('submit'));
      }, 500);
    }
  }, [location]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Show toast notification
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, duration);
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
      trackYourComplaint: 'तपाईंको उजुरी ट्र्याक गर्नुहोस्',
      fillDetails: 'स्थिति जाँच गर्न तलको विवरण भर्नुहोस्',
      ticketNumber: 'टिकेट नम्बर',
      enterTicket: 'आफ्नो टिकेट नम्बर प्रविष्ट गर्नुहोस्',
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
      resolution: 'समाधान',
      actionTaken: 'गरिएको कार्य',
      notFound: '❌ उल्लेखित टिकेट नम्बरसँग मेल खाने कुनै उजुरी फेला परेन।',
      loading: 'खोजी गर्दै...',
      error: 'त्रुटि भयो। कृपया पछि प्रयास गर्नुहोस्।',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      enterTicketNumber: 'कृपया टिकेट नम्बर प्रविष्ट गर्नुहोस्',
      demoNote: 'डेमो टिकेट नम्बर: NTC-2024-001 वा NTC-२०८०-००१',
      submittedDate: 'दर्ता मिति',
      submittedDateNp: 'नेपाली मिति',
      submittedDateEn: 'अंग्रेजी मिति',
      priority: 'प्राथमिकता',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      assignedTo: 'तोकिएको टोली',
      updateHistory: 'अपडेट इतिहास',
      noUpdates: 'कुनै अपडेट छैन',
      by: 'द्वारा',
      on: 'मिति',
      loadingStatus: 'लोड हुँदै...'
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
      resolution: 'Resolution',
      actionTaken: 'Action Taken',
      notFound: '❌ No complaint found with the provided ticket number.',
      loading: 'Searching...',
      error: 'An error occurred. Please try again later.',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      backToHome: 'Back to Home',
      enterTicketNumber: 'Please enter ticket number',
      demoNote: 'Demo Ticket Number: NTC-2024-001 or NTC-२०८०-००१',
      submittedDate: 'Submitted Date',
      submittedDateNp: 'Nepali Date',
      submittedDateEn: 'English Date',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      assignedTo: 'Assigned To',
      updateHistory: 'Update History',
      noUpdates: 'No updates yet',
      by: 'by',
      on: 'on',
      loadingStatus: 'Loading...'
    }
  };

  const t = content[language];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
    localStorage.setItem('preferredLanguage', lang);
  };

  const handleTrackComplaint = async (e) => {
    e.preventDefault();
    
    if (!trackTicket.trim()) {
      showToast(t.enterTicketNumber, 'warning');
      return;
    }

    setLoading(true);
    setError('');
    setTrackResult(null);

    try {
      // Search for complaint by ticket number
      const response = await axios.get(`${API_URL}/public/complaints/track`, {
        params: { ticketNumber: trackTicket.trim() }
      });

      if (response.data.success && response.data.data) {
        setTrackResult(response.data.data);
        showToast(language === 'np' ? 'उजुरी फेला पर्यो' : 'Complaint found', 'success', 2000);
      } else {
        setTrackResult(null);
        setError(t.notFound);
        showToast(t.notFound, 'error', 3000);
      }
    } catch (error) {
      console.error('Error tracking complaint:', error);
      setError(t.error);
      setTrackResult(null);
      
      // If backend is not available, use sample data for demo
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        // Try to find in local sample data
        const sampleResult = findSampleComplaint(trackTicket.trim());
        if (sampleResult) {
          setTrackResult(sampleResult);
          showToast(language === 'np' ? 'उजुरी फेला पर्यो (नमूना डाटा)' : 'Complaint found (sample data)', 'success', 2000);
        } else {
          setError(t.notFound);
          showToast(t.notFound, 'error', 3000);
        }
      } else {
        showToast(t.error, 'error', 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demo when backend is not available
  const findSampleComplaint = (ticketNumber) => {
    const sampleComplaints = [
      {
        id: 1,
        complaintNumber: 'NTC-2024-001',
        complaintNumberNp: 'NTC-२०८०-००१',
        name: 'रमेश केसी',
        nameEn: 'Ramesh KC',
        email: 'ramesh@example.com',
        phone: '9841000001',
        category: 'internet',
        category_np: 'इन्टरनेट',
        category_en: 'Internet',
        status: 'in-progress',
        status_np: 'प्रगतिमा',
        status_en: 'In Progress',
        complaint: 'फाइबर जडान २ दिनदेखि बन्द छ',
        complaintEn: 'Fiber connection down since 2 days',
        date: '२०८०-०१-१५',
        enDate: '2024-01-15',
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'high',
        resolution: 'प्राविधिक टोलीले जाँच गरिरहेको छ',
        resolutionEn: 'Technical team is investigating',
        actionTaken: 'प्राविधिक टोलीलाई जानकारी दिइयो',
        actionTakenEn: 'Technical team notified',
        assignedTo: 'प्राविधिक टोली',
        assignedToEn: 'Technical Team',
        submittedDateNp: '२०८०-०१-१५',
        submittedDateEn: '2024-01-15',
        history: [
          { status: 'pending', status_np: 'विचाराधीन', status_en: 'Pending', notes: 'गुनासो दर्ता भयो', notesEn: 'Complaint registered', updatedBy: 'System', updatedAt: '२०८०-०१-१५' },
          { status: 'in-progress', status_np: 'प्रगतिमा', status_en: 'In Progress', notes: 'प्राविधिक टोलीलाई तोकियो', notesEn: 'Assigned to technical team', updatedBy: 'Admin', updatedAt: '२०८०-०१-१६' }
        ]
      },
      {
        id: 2,
        complaintNumber: 'NTC-2024-002',
        complaintNumberNp: 'NTC-२०८०-००२',
        name: 'सीता शर्मा',
        nameEn: 'Sita Sharma',
        email: 'sita@example.com',
        phone: '9812345678',
        category: 'recharge',
        category_np: 'रिचार्ज',
        category_en: 'Recharge',
        status: 'resolved',
        status_np: 'समाधान',
        status_en: 'Resolved',
        complaint: 'रु. ५०० रिचार्ज गरे पनि ब्यालेन्स अपडेट भएन',
        complaintEn: 'Recharged Rs. 500 but balance not updated',
        date: '२०८०-०१-२०',
        enDate: '2024-01-20',
        channel: 'व्हाट्सएप',
        enChannel: 'WhatsApp',
        priority: 'medium',
        resolution: 'रिचार्ज सफल भयो र ब्यालेन्स अपडेट गरियो',
        resolutionEn: 'Recharge successful and balance updated',
        actionTaken: 'ग्राहकको खातामा रिचार्ज जम्मा गरियो',
        actionTakenEn: 'Recharge credited to customer account',
        assignedTo: 'ग्राहक सेवा',
        assignedToEn: 'Customer Service',
        submittedDateNp: '२०८०-०१-२०',
        submittedDateEn: '2024-01-20',
        history: [
          { status: 'pending', status_np: 'विचाराधीन', status_en: 'Pending', notes: 'गुनासो दर्ता भयो', notesEn: 'Complaint registered', updatedBy: 'System', updatedAt: '२०८०-०१-२०' },
          { status: 'in-progress', status_np: 'प्रगतिमा', status_en: 'In Progress', notes: 'ग्राहक सेवालाई तोकियो', notesEn: 'Assigned to customer service', updatedBy: 'Admin', updatedAt: '२०८०-०१-२१' },
          { status: 'resolved', status_np: 'समाधान', status_en: 'Resolved', notes: 'रिचार्ज सफल भयो', notesEn: 'Recharge successful', updatedBy: 'Customer Service', updatedAt: '२०८०-०१-२२' }
        ]
      },
      {
        id: 3,
        complaintNumber: 'NTC-2024-003',
        complaintNumberNp: 'NTC-२०८०-००३',
        name: 'हरि प्रसाद',
        nameEn: 'Hari Prasad',
        email: 'hari@example.com',
        phone: '9823456789',
        category: 'activation',
        category_np: 'सक्रियता',
        category_en: 'Activation',
        status: 'pending',
        status_np: 'विचाराधीन',
        status_en: 'Pending',
        complaint: 'सिम डिएक्टिभेसन अनुरोध प्रक्रिया भएन',
        complaintEn: 'SIM deactivation request not processed',
        date: '२०८०-०१-२५',
        enDate: '2024-01-25',
        channel: 'कल सेन्टर',
        enChannel: 'Call Center',
        priority: 'low',
        resolution: null,
        actionTaken: null,
        assignedTo: 'प्रशासन',
        assignedToEn: 'Administration',
        submittedDateNp: '२०८०-०१-२५',
        submittedDateEn: '2024-01-25',
        history: [
          { status: 'pending', status_np: 'विचाराधीन', status_en: 'Pending', notes: 'गुनासो दर्ता भयो', notesEn: 'Complaint registered', updatedBy: 'System', updatedAt: '२०८०-०१-२५' }
        ]
      }
    ];

    // Search by ticket number (both Nepali and English formats)
    const found = sampleComplaints.find(c => 
      c.complaintNumber === ticketNumber || 
      c.complaintNumberNp === ticketNumber
    );

    return found || null;
  };

  const getStatusClass = (status) => {
    const classes = {
      'pending': 'status-pending',
      'in-progress': 'status-progress',
      'resolved': 'status-resolved',
      'review': 'status-review',
      'rejected': 'status-rejected'
    };
    return classes[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    if (language === 'np') {
      const statusMap = {
        'pending': 'विचाराधीन',
        'in-progress': 'प्रगतिमा',
        'resolved': 'समाधान',
        'review': 'समीक्षामा',
        'rejected': 'अस्वीकृत'
      };
      return statusMap[status] || status;
    } else {
      const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'resolved': 'Resolved',
        'review': 'Under Review',
        'rejected': 'Rejected'
      };
      return statusMap[status] || status;
    }
  };

  const getPriorityText = (priority) => {
    if (language === 'np') {
      const priorityMap = {
        'high': 'उच्च',
        'medium': 'मध्यम',
        'low': 'न्यून'
      };
      return priorityMap[priority] || priority;
    } else {
      const priorityMap = {
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
      };
      return priorityMap[priority] || priority;
    }
  };

  const getPriorityClass = (priority) => {
    const classes = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return classes[priority] || 'priority-medium';
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
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>✕</button>
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
                    disabled={loading}
                  />
                </div>
                <p className="demo-note">💡 {t.demoNote}</p>
              </div>
              
              <button type="submit" className="btn-track" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    {t.loading}
                  </>
                ) : (
                  <>
                    <span>🔍</span> {t.proceed}
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                <span>{error}</span>
              </div>
            )}

            {trackResult && (
              <div className="track-result">
                <div className="result-header">
                  <span className="result-icon">✅</span>
                  <h3>{t.complaintStatusLabel}</h3>
                  <span className={`status-badge ${getStatusClass(trackResult.status)}`}>
                    {getStatusText(trackResult.status)}
                  </span>
                </div>
                <div className="result-details">
                  <div className="detail-row">
                    <div className="detail-label">{t.ticketId}:</div>
                    <div className="detail-value">
                      {language === 'np' ? trackResult.complaintNumberNp : trackResult.complaintNumber}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.name}:</div>
                    <div className="detail-value">{language === 'np' ? trackResult.name : trackResult.nameEn}</div>
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
                    <div className="detail-value">{language === 'np' ? trackResult.category_np : trackResult.category_en}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.priority}:</div>
                    <div className="detail-value">
                      <span className={`priority-badge ${getPriorityClass(trackResult.priority)}`}>
                        {getPriorityText(trackResult.priority)}
                      </span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.registeredDate}:</div>
                    <div className="detail-value">{language === 'np' ? trackResult.submittedDateNp : trackResult.submittedDateEn}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">{t.channel}:</div>
                    <div className="detail-value">{language === 'np' ? trackResult.channel : trackResult.enChannel}</div>
                  </div>
                  {trackResult.assignedTo && (
                    <div className="detail-row">
                      <div className="detail-label">{t.assignedTo}:</div>
                      <div className="detail-value">{language === 'np' ? trackResult.assignedTo : trackResult.assignedToEn}</div>
                    </div>
                  )}
                  <div className="detail-row full-width">
                    <div className="detail-label">{t.description}:</div>
                    <div className="detail-value">{language === 'np' ? trackResult.complaint : trackResult.complaintEn}</div>
                  </div>
                  {trackResult.resolution && (
                    <div className="detail-row full-width resolution">
                      <div className="detail-label">✅ {t.resolution}:</div>
                      <div className="detail-value">{language === 'np' ? trackResult.resolution : trackResult.resolutionEn}</div>
                    </div>
                  )}
                  {trackResult.actionTaken && (
                    <div className="detail-row full-width">
                      <div className="detail-label">📋 {t.actionTaken}:</div>
                      <div className="detail-value">{language === 'np' ? trackResult.actionTaken : trackResult.actionTakenEn}</div>
                    </div>
                  )}
                </div>

                {/* Update History */}
                {trackResult.history && trackResult.history.length > 0 && (
                  <div className="history-section">
                    <h4>{t.updateHistory}</h4>
                    <div className="history-timeline">
                      {trackResult.history.map((item, index) => (
                        <div key={index} className="history-item">
                          <div className="history-marker"></div>
                          <div className="history-content">
                            <div className="history-header">
                              <span className={`history-status ${getStatusClass(item.status)}`}>
                                {language === 'np' ? item.status_np : item.status_en}
                              </span>
                              <span className="history-date">
                                {t.by} {item.updatedBy} {t.on} {item.updatedAt}
                              </span>
                            </div>
                            <p className="history-notes">{language === 'np' ? item.notes : item.notesEn}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

        /* Toast Notification */
        .toast-notification {
          position: fixed;
          top: 180px;
          right: 20px;
          z-index: 3000;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: slideInRight 0.3s ease;
          max-width: 350px;
        }
        .toast-notification.success { border-left: 4px solid #10b981; background: #ecfdf5; }
        .toast-notification.error { border-left: 4px solid #ef4444; background: #fef2f2; }
        .toast-notification.warning { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .toast-notification.info { border-left: 4px solid #3b82f6; background: #eff6ff; }
        .toast-icon { font-size: 1.2rem; }
        .toast-message { font-size: 0.85rem; color: #1f2937; flex: 1; }
        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 1rem;
          padding: 0 4px;
        }
        .toast-close:hover { color: #666; }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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

        .header-left { display: flex; align-items: center; gap: 16px; }
        .we-are-here {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          padding: 6px 20px;
          border-radius: 40px;
          font-weight: 500;
        }
        .quote-text { font-size: 0.9rem; letter-spacing: 0.5px; font-weight: 600; }

        .header-right { display: flex; align-items: center; gap: 25px; flex-wrap: wrap; }
        .contact-info-group { display: flex; align-items: center; gap: 15px; }
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
        .contact-info-item:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
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
          margin-bottom: 24px;
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

        .form-group input:disabled {
          background: #f0f0f0;
          cursor: not-allowed;
        }

        .form-group input::placeholder {
          color: #aaa;
          font-size: 0.9rem;
          text-align: left;
        }

        .demo-note {
          font-size: 0.75rem;
          color: #6c8196;
          margin-top: 8px;
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
        }

        .btn-track:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(21, 101, 192, 0.3);
        }

        .btn-track:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          margin-top: 20px;
          padding: 16px 20px;
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #dc2626;
        }

        .error-icon { font-size: 1.2rem; }

        /* Track Result */
        .track-result {
          margin-top: 32px;
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
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid rgba(21, 101, 192, 0.2);
          flex-wrap: wrap;
        }

        .result-icon {
          font-size: 1.8rem;
        }

        .result-header h3 {
          color: #0d47a1;
          font-size: 1.4rem;
          margin: 0;
          flex: 1;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .status-review { background: #e0e7ff; color: #4f46e5; }
        .status-rejected { background: #fee2e2; color: #dc2626; }

        .priority-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #d1fae5; color: #059669; }

        .result-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .detail-row {
          display: flex;
          flex-wrap: wrap;
          padding: 8px 0;
          border-bottom: 1px solid rgba(21, 101, 192, 0.1);
          text-align: left;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row.full-width {
          flex-direction: column;
          gap: 4px;
        }

        .detail-row.resolution {
          background: #e8f5e9;
          border-radius: 8px;
          padding: 12px 16px;
          border-left: 3px solid #4caf50;
        }

        .detail-label {
          font-weight: 700;
          width: 140px;
          color: #0d47a1;
          font-size: 0.85rem;
          text-align: left;
          flex-shrink: 0;
        }

        .detail-value {
          flex: 1;
          color: #1a2c3e;
          font-size: 0.85rem;
          word-break: break-word;
          text-align: left;
        }

        /* History Section */
        .history-section {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 2px solid rgba(21, 101, 192, 0.15);
        }

        .history-section h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #0d47a1;
          margin-bottom: 16px;
        }

        .history-timeline {
          position: relative;
          padding-left: 20px;
        }

        .history-timeline::before {
          content: '';
          position: absolute;
          left: 4px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #d1d5db;
        }

        .history-item {
          position: relative;
          margin-bottom: 16px;
          padding-left: 16px;
        }

        .history-item:last-child {
          margin-bottom: 0;
        }

        .history-marker {
          position: absolute;
          left: -4px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #1565c0;
          border: 2px solid white;
          box-shadow: 0 0 0 2px #1565c0;
        }

        .history-content {
          background: white;
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 6px;
        }

        .history-status {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .history-status.status-pending { background: #fef3c7; color: #d97706; }
        .history-status.status-progress { background: #dbeafe; color: #2563eb; }
        .history-status.status-resolved { background: #d1fae5; color: #059669; }
        .history-status.status-review { background: #e0e7ff; color: #4f46e5; }
        .history-status.status-rejected { background: #fee2e2; color: #dc2626; }

        .history-date {
          font-size: 0.7rem;
          color: #6b7280;
        }

        .history-notes {
          font-size: 0.85rem;
          color: #374151;
          margin: 0;
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
            gap: 4px;
          }
          
          .detail-label {
            width: 100%;
          }

          .result-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .history-header {
            flex-direction: column;
            align-items: flex-start;
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

          .toast-notification {
            top: auto;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
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