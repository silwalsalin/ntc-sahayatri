// src/pages/Complaints.js
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

const Complaints = () => {
  const navigate = useNavigate();
  
  // Language state
  const [language, setLanguage] = useState('np');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Content object - MOVED BEFORE it's used
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
      allComplaints: 'सबै गुनासोहरू',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByCategory: 'प्रकार अनुसार फिल्टर',
      ticketId: 'टिकेट नम्बर',
      complainantName: 'उजुरीकर्ता',
      category: 'प्रकार',
      date: 'मिति',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      noComplaintsFound: 'कुनै गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      channel: 'च्यानल',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      resolvedDate: 'समाधान मिति',
      close: 'बन्द गर्नुहोस्',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।'
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
      complaints: 'Complaints',
      allComplaints: 'All Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByStatus: 'Filter by Status',
      filterByCategory: 'Filter by Category',
      ticketId: 'Ticket ID',
      complainantName: 'Complainant',
      category: 'Category',
      date: 'Date',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
      noComplaintsFound: 'No complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      channel: 'Channel',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      resolvedDate: 'Resolved Date',
      close: 'Close',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.'
    }
  };

  // Sample complaints data
  const [complaints] = useState([
    {
      id: 1,
      ticketId: 'NTC-२०८०-००१',
      enTicketId: 'NTC-2080-001',
      name: 'रमेश केसी',
      enName: 'Ramesh KC',
      email: 'ramesh@example.com',
      phone: '9841000001',
      category: 'internet',
      subCategory: 'connection',
      description: 'फाइबर जडान २ दिनदेखि बन्द छ',
      enDescription: 'Fiber connection down since 2 days',
      status: 'in-progress',
      statusText: 'प्रगतिमा',
      enStatusText: 'In Progress',
      date: '२०८०-०१-१५',
      enDate: '2024-01-15',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal',
      priority: 'high',
      resolvedDate: null
    },
    {
      id: 2,
      ticketId: 'NTC-२०८०-००२',
      enTicketId: 'NTC-2080-002',
      name: 'सीता शर्मा',
      enName: 'Sita Sharma',
      email: 'sita@example.com',
      phone: '9812345678',
      category: 'recharge',
      subCategory: 'not-credited',
      description: 'रु. ५०० रिचार्ज गरे पनि ब्यालेन्स अपडेट भएन',
      enDescription: 'Recharged Rs. 500 but balance not updated',
      status: 'resolved',
      statusText: 'समाधान भयो',
      enStatusText: 'Resolved',
      date: '२०८०-०१-२०',
      enDate: '2024-01-20',
      channel: 'व्हाट्सएप',
      enChannel: 'WhatsApp',
      priority: 'medium',
      resolvedDate: '२०८०-०१-२२'
    },
    {
      id: 3,
      ticketId: 'NTC-२०८०-००३',
      enTicketId: 'NTC-2080-003',
      name: 'हरि प्रसाद',
      enName: 'Hari Prasad',
      email: 'hari@example.com',
      phone: '9823456789',
      category: 'activation',
      subCategory: 'sim-deactivation',
      description: 'सिम डिएक्टिभेसन अनुरोध प्रक्रिया भएन',
      enDescription: 'SIM deactivation request not processed',
      status: 'pending',
      statusText: 'विचाराधीन',
      enStatusText: 'Pending',
      date: '२०८०-०१-२५',
      enDate: '2024-01-25',
      channel: 'कल सेन्टर',
      enChannel: 'Call Center',
      priority: 'low',
      resolvedDate: null
    },
    {
      id: 4,
      ticketId: 'NTC-२०८०-००४',
      enTicketId: 'NTC-2080-004',
      name: 'विकास न्यौपाने',
      enName: 'Bikas NyauPane',
      email: 'bikas@example.com',
      phone: '9841567890',
      category: 'signal',
      subCategory: 'weak-signal',
      description: 'नेटवर्क सिग्नल समस्या - कल ड्रप भइरहेको छ',
      enDescription: 'Network signal issue - call drops frequently',
      status: 'review',
      statusText: 'समीक्षामा',
      enStatusText: 'Under Review',
      date: '२०८०-०१-२८',
      enDate: '2024-01-28',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal',
      priority: 'high',
      resolvedDate: null
    },
    {
      id: 5,
      ticketId: 'NTC-२०८०-००५',
      enTicketId: 'NTC-2080-005',
      name: 'मिना काफ्ले',
      enName: 'Mina Kafle',
      email: 'mina@example.com',
      phone: '9841234567',
      category: 'billing',
      subCategory: 'wrong-charge',
      description: 'गत महिनाको बिलमा गलत चार्ज',
      enDescription: 'Wrong charge in last month bill',
      status: 'resolved',
      statusText: 'समाधान भयो',
      enStatusText: 'Resolved',
      date: '२०८०-०१-१०',
      enDate: '2024-01-10',
      channel: 'इमेल',
      enChannel: 'Email',
      priority: 'medium',
      resolvedDate: '२०८०-०१-१५'
    },
    {
      id: 6,
      ticketId: 'NTC-२०८०-००६',
      enTicketId: 'NTC-2080-006',
      name: 'विवेक श्रेष्ठ',
      enName: 'Bivek Shrestha',
      email: 'bivek@example.com',
      phone: '9812345670',
      category: 'technical',
      subCategory: 'app-issue',
      description: 'एनटीसी एप काम गर्दैन',
      enDescription: 'NTC App is not working',
      status: 'in-progress',
      statusText: 'प्रगतिमा',
      enStatusText: 'In Progress',
      date: '२०८०-०२-०१',
      enDate: '2024-02-01',
      channel: 'फेसबुक',
      enChannel: 'Facebook',
      priority: 'medium',
      resolvedDate: null
    },
    {
      id: 7,
      ticketId: 'NTC-२०८०-००७',
      enTicketId: 'NTC-2080-007',
      name: 'सरिता गिरी',
      enName: 'Sarita Giri',
      email: 'sarita@example.com',
      phone: '9845678901',
      category: 'network',
      subCategory: 'no-coverage',
      description: 'घरमा नेटवर्क नै छैन',
      enDescription: 'No network coverage at home',
      status: 'pending',
      statusText: 'विचाराधीन',
      enStatusText: 'Pending',
      date: '२०८०-०२-०५',
      enDate: '2024-02-05',
      channel: 'फोन',
      enChannel: 'Phone',
      priority: 'high',
      resolvedDate: null
    },
    {
      id: 8,
      ticketId: 'NTC-२०८०-००८',
      enTicketId: 'NTC-2080-008',
      name: 'राजन पौडेल',
      enName: 'Rajan Poudel',
      email: 'rajan@example.com',
      phone: '9847890123',
      category: 'internet',
      subCategory: 'slow-speed',
      description: 'इन्टरनेट स्पीड धेरै सुस्त छ',
      enDescription: 'Internet speed is very slow',
      status: 'review',
      statusText: 'समीक्षामा',
      enStatusText: 'Under Review',
      date: '२०८०-०२-०८',
      enDate: '2024-02-08',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal',
      priority: 'low',
      resolvedDate: null
    }
  ]);

  // Category options for filter
  const categories = {
    np: {
      all: 'सबै प्रकार',
      internet: 'इन्टरनेट सेवा',
      recharge: 'रिचार्ज र ब्यालेन्स',
      activation: 'सेवा सक्रियता/निष्क्रियता',
      billing: 'बिलिङ समस्या',
      signal: 'सिग्नल समस्या',
      network: 'नेटवर्क कभरेज',
      technical: 'प्राविधिक समस्या'
    },
    en: {
      all: 'All Categories',
      internet: 'Internet Service',
      recharge: 'Recharge & Balance',
      activation: 'Activation/Deactivation',
      billing: 'Billing Issues',
      signal: 'Signal Issue',
      network: 'Network Coverage',
      technical: 'Technical Issue'
    }
  };

  // Status options for filter
  const statuses = {
    np: {
      all: 'सबै स्थिति',
      pending: 'विचाराधीन',
      'in-progress': 'प्रगतिमा',
      review: 'समीक्षामा',
      resolved: 'समाधान भयो'
    },
    en: {
      all: 'All Status',
      pending: 'Pending',
      'in-progress': 'In Progress',
      review: 'Under Review',
      resolved: 'Resolved'
    }
  };

  const t = content[language];
  const categoriesObj = categories[language];
  const statusesObj = statuses[language];

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    // Search filter
    const searchMatch = searchTerm === '' || 
      complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketId.includes(searchTerm) ||
      complaint.enTicketId.includes(searchTerm) ||
      complaint.phone.includes(searchTerm);
    
    // Status filter
    const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
    
    // Category filter
    const categoryMatch = categoryFilter === 'all' || complaint.category === categoryFilter;
    
    return searchMatch && statusMatch && categoryMatch;
  });

  const getStatusClass = (status) => {
    switch(status) {
      case 'in-progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      case 'pending': return 'status-pending';
      case 'review': return 'status-review';
      default: return 'status-pending';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getPriorityText = (priority) => {
    if (language === 'np') {
      switch(priority) {
        case 'high': return 'उच्च';
        case 'medium': return 'मध्यम';
        case 'low': return 'न्यून';
        default: return 'मध्यम';
      }
    } else {
      switch(priority) {
        case 'high': return 'High';
        case 'medium': return 'Medium';
        case 'low': return 'Low';
        default: return 'Medium';
      }
    }
  };

  const getCategoryText = (category) => {
    return categoriesObj[category] || category;
  };

  const getStatusText = (complaint) => {
    return language === 'np' ? complaint.statusText : complaint.enStatusText;
  };

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
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
    <div className="complaints-page">
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
        <div className="complaints-container">
          <div className="complaints-header">
            <h1>📋 {t.complaints}</h1>
            <p>{t.allComplaints}</p>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                {Object.entries(statusesObj).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                {Object.entries(categoriesObj).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>{t.ticketId}</th>
                  <th>{t.complainantName}</th>
                  <th>{t.category}</th>
                  <th>{t.date}</th>
                  <th>{t.status}</th>
                  <th>{t.priority}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td className="ticket-id">{language === 'np' ? complaint.ticketId : complaint.enTicketId}</td>
                      <td>{language === 'np' ? complaint.name : complaint.enName}</td>
                      <td>{getCategoryText(complaint.category)}</td>
                      <td>{language === 'np' ? complaint.date : complaint.enDate}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                          {getStatusText(complaint)}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                          {getPriorityText(complaint.priority)}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="view-btn"
                          onClick={() => openModal(complaint)}
                        >
                          👁️ {t.viewDetails}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      <div className="no-data-content">
                        <span className="no-data-icon">📭</span>
                        <p>{t.noComplaintsFound}</p>
                        <small>{t.tryAdjustingFilters}</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Statistics */}
          <div className="statistics-bar">
            <div className="stat-item">
              <span className="stat-label">{t.complaints}:</span>
              <span className="stat-value">{filteredComplaints.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{statusesObj.pending}:</span>
              <span className="stat-value">
                {complaints.filter(c => c.status === 'pending').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{statusesObj['in-progress']}:</span>
              <span className="stat-value">
                {complaints.filter(c => c.status === 'in-progress').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{statusesObj.resolved}:</span>
              <span className="stat-value">
                {complaints.filter(c => c.status === 'resolved').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Complaint Details */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {t.complaintDetails}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>{t.ticketId}:</label>
                <span>{language === 'np' ? selectedComplaint.ticketId : selectedComplaint.enTicketId}</span>
              </div>
              <div className="detail-group">
                <label>{t.complainantName}:</label>
                <span>{language === 'np' ? selectedComplaint.name : selectedComplaint.enName}</span>
              </div>
              <div className="detail-group">
                <label>{t.email}:</label>
                <span>{selectedComplaint.email}</span>
              </div>
              <div className="detail-group">
                <label>{t.phone}:</label>
                <span>{selectedComplaint.phone}</span>
              </div>
              <div className="detail-group">
                <label>{t.category}:</label>
                <span>{getCategoryText(selectedComplaint.category)}</span>
              </div>
              <div className="detail-group">
                <label>{t.status}:</label>
                <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>
                  {getStatusText(selectedComplaint)}
                </span>
              </div>
              <div className="detail-group">
                <label>{t.priority}:</label>
                <span className={`priority-badge ${getPriorityClass(selectedComplaint.priority)}`}>
                  {getPriorityText(selectedComplaint.priority)}
                </span>
              </div>
              <div className="detail-group">
                <label>{t.registeredDate}:</label>
                <span>{language === 'np' ? selectedComplaint.date : selectedComplaint.enDate}</span>
              </div>
              {selectedComplaint.resolvedDate && (
                <div className="detail-group">
                  <label>{t.resolvedDate}:</label>
                  <span>{language === 'np' ? selectedComplaint.resolvedDate : selectedComplaint.resolvedDate}</span>
                </div>
              )}
              <div className="detail-group">
                <label>{t.channel}:</label>
                <span>{language === 'np' ? selectedComplaint.channel : selectedComplaint.enChannel}</span>
              </div>
              <div className="detail-group full-width">
                <label>{t.description}:</label>
                <p>{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeModal}>{t.close}</button>
            </div>
          </div>
        </div>
      )}


      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .complaints-page {
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

        .complaints-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .complaints-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .complaints-header h1 {
          font-size: 2rem;
          color: #0d47a1;
          margin-bottom: 8px;
        }

        .complaints-header p {
          color: #6c8196;
        }

        /* Filters Section */
        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 32px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .search-box {
          flex: 1;
          position: relative;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
          color: #999;
        }

        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 1.5px solid #e0e0e0;
          border-radius: 40px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #1565c0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 10px 16px;
          border: 1.5px solid #e0e0e0;
          border-radius: 40px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #1565c0;
        }

        /* Table */
        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .complaints-table {
          width: 100%;
          border-collapse: collapse;
        }

        .complaints-table th,
        .complaints-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        .complaints-table th {
          background: #f5f7fa;
          font-weight: 600;
          color: #0d47a1;
        }

        .complaints-table tr:hover {
          background: #f8fafc;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #1565c0;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-progress { background: #fff3cd; color: #856404; }
        .status-resolved { background: #d4edda; color: #155724; }
        .status-pending { background: #f8d7da; color: #721c24; }
        .status-review { background: #cce5ff; color: #004085; }

        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .priority-high { background: #ffebee; color: #c62828; }
        .priority-medium { background: #fff8e1; color: #f57c00; }
        .priority-low { background: #e8f5e9; color: #2e7d32; }

        .view-btn {
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .no-data {
          text-align: center;
          padding: 60px !important;
        }

        .no-data-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .no-data-icon {
          font-size: 3rem;
        }

        .no-data p {
          font-size: 1rem;
          color: #666;
        }

        .no-data small {
          color: #999;
        }

        /* Statistics Bar */
        .statistics-bar {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 32px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 4px;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0d47a1;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          font-size: 1.3rem;
          color: #0d47a1;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #999;
          transition: color 0.3s;
        }

        .modal-close:hover {
          color: #333;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-group {
          display: flex;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-group label {
          width: 130px;
          font-weight: 600;
          color: #0d47a1;
          flex-shrink: 0;
        }

        .detail-group span,
        .detail-group p {
          flex: 1;
          color: #333;
        }

        .detail-group.full-width {
          flex-direction: column;
        }

        .detail-group.full-width label {
          width: 100%;
          margin-bottom: 8px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e0e0e0;
          text-align: right;
        }

        .btn-close {
          background: #1565c0;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-close:hover {
          background: #0d47a1;
        }

      

        /* Responsive */
        @media (max-width: 768px) {
          .main-content { padding-top: 330px; }
          .filters-section { flex-direction: column; }
          .filter-group { width: 100%; flex-direction: column; }
          .filter-select { width: 100%; }
          .complaints-table th,
          .complaints-table td { padding: 10px; font-size: 0.8rem; }
          .detail-group { flex-direction: column; }
          .detail-group label { width: 100%; margin-bottom: 4px; }
          .container-1, .container-2, .container-3 { flex-direction: column; text-align: center; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .contact-info-group { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default Complaints;