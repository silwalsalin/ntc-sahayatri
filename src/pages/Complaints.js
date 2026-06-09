// src/pages/Complaints.js
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const Complaints = () => {
  const navigate = useNavigate();
  
  // Language state with persistence
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State for complaints from backend
  const [complaintsData, setComplaintsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Show toast notification
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, duration);
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback((text, successMessage) => {
    navigator.clipboard.writeText(text);
    showToast(successMessage, 'success', 2000);
  }, [showToast]);

  // Format date to Nepali format
  const formatNepaliDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      const year = d.getFullYear() - 57;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '-';
    }
  };

  // Format date to English format
  const formatEnglishDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toISOString().split('T')[0];
    } catch (error) {
      return '-';
    }
  };

  // Map status from backend to component status
  const mapStatus = (status) => {
    if (!status) return 'pending';
    const statusMap = {
      'pending': 'pending',
      'Pending': 'pending',
      'in-progress': 'in-progress',
      'in progress': 'in-progress',
      'In Progress': 'in-progress',
      'inprogress': 'in-progress',
      'resolved': 'resolved',
      'Resolved': 'resolved',
      'Closed': 'resolved',
      'closed': 'resolved',
      'review': 'review',
      'Under Review': 'review',
      'under review': 'review',
      'Rejected': 'review',
      'rejected': 'review'
    };
    return statusMap[status] || 'pending';
  };

  // Map priority from backend to component priority
  const mapPriority = (priority) => {
    if (!priority) return 'medium';
    const priorityMap = {
      'high': 'high',
      'High': 'high',
      'Urgent': 'high',
      'urgent': 'high',
      'medium': 'medium',
      'Medium': 'medium',
      'low': 'low',
      'Low': 'low'
    };
    return priorityMap[priority] || 'medium';
  };

  // Get status text in Nepali
  const getStatusTextNp = (status) => {
    const statusMap = {
      'pending': 'विचाराधीन',
      'in-progress': 'प्रगतिमा',
      'resolved': 'समाधान भयो',
      'review': 'समीक्षामा'
    };
    return statusMap[status] || 'विचाराधीन';
  };

  // Get status text in English
  const getStatusTextEn = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'resolved': 'Resolved',
      'review': 'Under Review'
    };
    return statusMap[status] || 'Pending';
  };

  // Get priority text in Nepali
  const getPriorityTextNp = (priority) => {
    const priorityMap = {
      'high': 'उच्च',
      'medium': 'मध्यम',
      'low': 'न्यून'
    };
    return priorityMap[priority] || 'मध्यम';
  };

  // Get priority text in English
  const getPriorityTextEn = (priority) => {
    const priorityMap = {
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return priorityMap[priority] || 'Medium';
  };

  // Get category text in Nepali
  const getCategoryTextNp = (category) => {
    const categoryMap = {
      'service': 'सेवा समस्या',
      'billing': 'बिलिङ समस्या',
      'technical': 'प्राविधिक समस्या',
      'network': 'नेटवर्क समस्या',
      'signal': 'सिग्नल समस्या',
      'recharge': 'रिचार्ज समस्या',
      'activation': 'सक्रियता समस्या',
      'internet': 'इन्टरनेट सेवा',
      'general': 'सामान्य',
      'other': 'अन्य'
    };
    return categoryMap[category] || 'सामान्य';
  };

  // Get category text in English
  const getCategoryTextEn = (category) => {
    const categoryMap = {
      'service': 'Service Issue',
      'billing': 'Billing Issue',
      'technical': 'Technical Issue',
      'network': 'Network Issue',
      'signal': 'Signal Issue',
      'recharge': 'Recharge Issue',
      'activation': 'Activation Issue',
      'internet': 'Internet Service',
      'general': 'General',
      'other': 'Other'
    };
    return categoryMap[category] || 'General';
  };

  // Fetch complaints from backend
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch regular complaints from public endpoint
      const response = await axios.get(`${API_URL}/complaints/public`, {
        timeout: 10000
      });
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const transformedComplaints = response.data.data.map(complaint => ({
          id: complaint.id,
          ticketId: complaint.complaint_number || `NTC-${complaint.id}`,
          enTicketId: complaint.complaint_number || `NTC-${complaint.id}`,
          name: complaint.name || 'N/A',
          enName: complaint.name || 'N/A',
          email: complaint.email || 'N/A',
          phone: complaint.phone || 'N/A',
          category: complaint.nature_of_complaint || 'general',
          subCategory: null,
          description: complaint.description || 'No description',
          enDescription: complaint.description || 'No description',
          status: mapStatus(complaint.status),
          statusText: getStatusTextNp(mapStatus(complaint.status)),
          enStatusText: getStatusTextEn(mapStatus(complaint.status)),
          date: formatNepaliDate(complaint.created_at),
          enDate: formatEnglishDate(complaint.created_at),
          channel: 'वेबसाइट पोर्टल',
          enChannel: 'Website Portal',
          priority: mapPriority(complaint.priority),
          priorityText: getPriorityTextNp(mapPriority(complaint.priority)),
          enPriorityText: getPriorityTextEn(mapPriority(complaint.priority)),
          resolvedDate: complaint.resolved_at ? formatNepaliDate(complaint.resolved_at) : null,
          enResolvedDate: complaint.resolved_at ? formatEnglishDate(complaint.resolved_at) : null,
          resolution: complaint.resolution || null,
          enResolution: complaint.resolution || null,
          assignedTo: complaint.assigned_to || null,
          enAssignedTo: complaint.assigned_to || null,
          location: complaint.state || complaint.district || 'N/A',
          enLocation: complaint.state || complaint.district || 'N/A',
          rawStatus: complaint.status,
          rawPriority: complaint.priority,
          submittedDate: complaint.created_at
        }));
        
        setComplaintsData(transformedComplaints);
        setBackendStatus('connected');
        
        if (transformedComplaints.length === 0) {
          showToast('No complaints found', 'info', 2000);
        }
      } else {
        setComplaintsData([]);
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setBackendStatus('disconnected');
      setComplaintsData([]);
      
      if (error.code === 'ERR_NETWORK') {
        showToast('Cannot connect to backend server. Please make sure the server is running.', 'error', 5000);
      } else {
        showToast('Failed to load complaints. Please try again later.', 'error', 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL, showToast]);

  // Initial fetch
  useEffect(() => {
    fetchComplaints();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchComplaints, 30000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

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
      technical: 'प्राविधिक समस्या',
      service: 'सेवा समस्या',
      general: 'सामान्य',
      other: 'अन्य'
    },
    en: {
      all: 'All Categories',
      internet: 'Internet Service',
      recharge: 'Recharge & Balance',
      activation: 'Activation/Deactivation',
      billing: 'Billing Issues',
      signal: 'Signal Issue',
      network: 'Network Coverage',
      technical: 'Technical Issue',
      service: 'Service Issue',
      general: 'General',
      other: 'Other'
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

  // Priority options for filter
  const priorities = {
    np: {
      all: 'सबै प्राथमिकता',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून'
    },
    en: {
      all: 'All Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
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
      allComplaints: 'सबै गुनासोहरू',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByCategory: 'प्रकार अनुसार फिल्टर',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
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
      resolution: 'समाधान विवरण',
      assignedTo: 'जिम्मेवार व्यक्ति',
      location: 'स्थान',
      close: 'बन्द गर्नुहोस्',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      clearFilters: 'फिल्टर सफा गर्नुहोस्',
      totalComplaints: 'कुल गुनासो',
      showing: 'देखाउँदै',
      of: 'को',
      copyTicketId: 'टिकेट नम्बर प्रतिलिपि गर्नुहोस्',
      copied: 'प्रतिलिपि गरियो!',
      previous: 'अघिल्लो',
      next: 'अर्को',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस गर्नुहोस्'
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
      filterByPriority: 'Filter by Priority',
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
      resolution: 'Resolution',
      assignedTo: 'Assigned To',
      location: 'Location',
      close: 'Close',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      clearFilters: 'Clear Filters',
      totalComplaints: 'Total Complaints',
      showing: 'Showing',
      of: 'of',
      copyTicketId: 'Copy Ticket ID',
      copied: 'Copied!',
      previous: 'Previous',
      next: 'Next',
      loading: 'Loading...',
      refresh: 'Refresh'
    }
  };

  const t = content[language];
  const categoriesObj = categories[language];
  const statusesObj = statuses[language];
  const prioritiesObj = priorities[language];

  // Filter complaints with all filters
  const filteredComplaints = useMemo(() => {
    return complaintsData.filter(complaint => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.enTicketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.phone.includes(searchTerm);
      
      // Status filter
      const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
      
      // Category filter
      const categoryMatch = categoryFilter === 'all' || complaint.category === categoryFilter;
      
      // Priority filter
      const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
      
      return searchMatch && statusMatch && categoryMatch && priorityMatch;
    });
  }, [complaintsData, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const getStatusClass = (status) => {
    const classes = {
      'in-progress': 'status-progress',
      'resolved': 'status-resolved',
      'pending': 'status-pending',
      'review': 'status-review'
    };
    return classes[status] || 'status-pending';
  };

  const getPriorityClass = (priority) => {
    const classes = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return classes[priority] || 'priority-medium';
  };

  const getCategoryText = (category) => {
    if (language === 'np') {
      return getCategoryTextNp(category);
    }
    return getCategoryTextEn(category);
  };

  const getStatusText = (complaint) => {
    return language === 'np' ? complaint.statusText : complaint.enStatusText;
  };

  const getPriorityText = (complaint) => {
    return language === 'np' ? complaint.priorityText : complaint.enPriorityText;
  };

  const getDate = (complaint, type = 'date') => {
    if (type === 'date') {
      return language === 'np' ? complaint.date : complaint.enDate;
    } else if (type === 'resolved' && complaint.resolvedDate) {
      return language === 'np' ? complaint.resolvedDate : (complaint.enResolvedDate || complaint.resolvedDate);
    }
    return '-';
  };

  const getLocation = (complaint) => {
    return language === 'np' ? complaint.location : (complaint.enLocation || complaint.location);
  };

  const getAssignedTo = (complaint) => {
    return language === 'np' ? complaint.assignedTo : (complaint.enAssignedTo || complaint.assignedTo);
  };

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    document.body.style.overflow = 'unset';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    showToast(t.clearFilters, 'info', 2000);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
    showToast(lang === 'np' ? 'भाषा नेपालीमा परिवर्तन गरियो' : 'Language changed to English', 'info', 2000);
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

  // Statistics calculations
  const statistics = {
    total: complaintsData.length,
    pending: complaintsData.filter(c => c.status === 'pending').length,
    inProgress: complaintsData.filter(c => c.status === 'in-progress').length,
    review: complaintsData.filter(c => c.status === 'review').length,
    resolved: complaintsData.filter(c => c.status === 'resolved').length
  };

  // Helper function to add data-label attributes for mobile
  const getTableDataProps = (label) => {
    return { 'data-label': label };
  };

  if (loading && complaintsData.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="complaints-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>✕</button>
        </div>
      )}

      {/* Backend Status Banner */}
      {backendStatus === 'disconnected' && (
        <div className="backend-warning">
          ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। कृपया सर्भर सुरु गर्नुहोस्।' : 'Backend server not connected. Please start the server.'}
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
                <button 
                  className="copy-btn-mini"
                  onClick={() => copyToClipboard('01-4960008', t.copied)}
                  title="Copy Phone"
                >
                  📋
                </button>
              </div>
              <div className="contact-info-item">
                <span className="contact-icon">✉️</span>
                <span className="contact-text">{t.emailAddress}</span>
                <button 
                  className="copy-btn-mini"
                  onClick={() => copyToClipboard('coo@ntc.net.np', t.copied)}
                  title="Copy Email"
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
            <button onClick={fetchComplaints} className="nav-btn">
              <span className="nav-icon">🔄</span>
              <span className="nav-text">{t.refresh}</span>
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
        <div className="complaints-container">
          <div className="complaints-header">
            <h1>📋 {t.complaints}</h1>
            <p>{t.allComplaints}</p>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="search-box">
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

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="filter-select"
              >
                {Object.entries(prioritiesObj).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>

              {(statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  🧹 {t.clearFilters}
                </button>
              )}
            </div>
          </div>

          {/* Results Info */}
          <div className="results-info">
            <span>{t.showing} {paginatedComplaints.length} {t.of} {filteredComplaints.length} {t.complaints}</span>
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
                {paginatedComplaints.length > 0 ? (
                  paginatedComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td className="ticket-id" {...getTableDataProps(t.ticketId)}>
                        {language === 'np' ? complaint.ticketId : complaint.enTicketId}
                        <button 
                          className="copy-ticket-btn"
                          onClick={() => copyToClipboard(language === 'np' ? complaint.ticketId : complaint.enTicketId, t.copied)}
                          title={t.copyTicketId}
                        >
                          📋
                        </button>
                      </td>
                      <td {...getTableDataProps(t.complainantName)}>
                        <div className="complainant-info">
                          <span className="complainant-name">{language === 'np' ? complaint.name : complaint.enName}</span>
                          <span className="complainant-phone">📞 {complaint.phone}</span>
                        </div>
                      </td>
                      <td {...getTableDataProps(t.category)}>{getCategoryText(complaint.category)}</td>
                      <td {...getTableDataProps(t.date)}>{getDate(complaint, 'date')}</td>
                      <td {...getTableDataProps(t.status)}>
                        <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                          {getStatusText(complaint)}
                        </span>
                      </td>
                      <td {...getTableDataProps(t.priority)}>
                        <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                          {getPriorityText(complaint)}
                        </span>
                       </td>
                      <td {...getTableDataProps(t.actions)}>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← {t.previous}
              </button>
              <span className="page-info">
                {t.showing} {currentPage} {t.of} {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                {t.next} →
              </button>
            </div>
          )}

          {/* Statistics Bar */}
          <div className="statistics-bar">
            <div className="stat-item">
              <span className="stat-label">{t.totalComplaints}</span>
              <span className="stat-value">{statistics.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{statusesObj.pending}</span>
              <span className="stat-value pending">{statistics.pending}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{statusesObj['in-progress']}</span>
              <span className="stat-value progress">{statistics.inProgress}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{statusesObj.review}</span>
              <span className="stat-value review">{statistics.review}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{statusesObj.resolved}</span>
              <span className="stat-value resolved">{statistics.resolved}</span>
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
                <span>
                  {language === 'np' ? selectedComplaint.ticketId : selectedComplaint.enTicketId}
                  <button 
                    className="copy-detail-btn"
                    onClick={() => copyToClipboard(language === 'np' ? selectedComplaint.ticketId : selectedComplaint.enTicketId, t.copied)}
                  >
                    📋
                  </button>
                </span>
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
                <label>{t.location}:</label>
                <span>{getLocation(selectedComplaint)}</span>
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
                  {getPriorityText(selectedComplaint)}
                </span>
              </div>
              <div className="detail-group">
                <label>{t.registeredDate}:</label>
                <span>{getDate(selectedComplaint, 'date')}</span>
              </div>
              {selectedComplaint.resolvedDate && (
                <div className="detail-group">
                  <label>{t.resolvedDate}:</label>
                  <span>{getDate(selectedComplaint, 'resolved')}</span>
                </div>
              )}
              <div className="detail-group">
                <label>{t.channel}:</label>
                <span>{language === 'np' ? selectedComplaint.channel : selectedComplaint.enChannel}</span>
              </div>
              {selectedComplaint.assignedTo && (
                <div className="detail-group">
                  <label>{t.assignedTo}:</label>
                  <span>{getAssignedTo(selectedComplaint)}</span>
                </div>
              )}
              <div className="detail-group full-width">
                <label>{t.description}:</label>
                <p className="description-text">{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
              </div>
              {selectedComplaint.resolution && (
                <div className="detail-group full-width">
                  <label>{t.resolution}:</label>
                  <p className="resolution-text">{language === 'np' ? selectedComplaint.resolution : selectedComplaint.enResolution}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeModal}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-copyright">
            <p>{t.footerTagline}</p>
            <p className="copyright-text">{t.copyright}</p>
          </div>
        </div>
      </footer>

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
          display: flex;
          flex-direction: column;
        }

        .backend-warning {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: #f59e0b;
          color: white;
          padding: 10px;
          text-align: center;
          z-index: 100;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Toast Notification */
        .toast-notification {
          position: fixed;
          top: 200px;
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
          transition: color 0.2s;
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
          flex: 1;
          padding-top: 195px;
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
          margin-bottom: 20px;
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
          padding: 12px 40px 12px 40px;
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

        .clear-search {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: #999;
          transition: color 0.2s;
        }
        .clear-search:hover { color: #333; }

        .filter-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
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

        .clear-filters-btn {
          padding: 10px 16px;
          border-radius: 40px;
          border: 1.5px solid #ef4444;
          background: white;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .clear-filters-btn:hover {
          background: #ef4444;
          color: white;
        }

        .results-info {
          text-align: right;
          font-size: 0.8rem;
          color: #888;
          margin-bottom: 16px;
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
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .copy-ticket-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.8rem;
          opacity: 0.6;
          transition: opacity 0.3s;
        }
        .copy-ticket-btn:hover { opacity: 1; }

        .complainant-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .complainant-name { font-weight: 500; }
        .complainant-phone { font-size: 0.7rem; color: #6c8196; }

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

        .no-data-icon { font-size: 3rem; }
        .no-data p { font-size: 1rem; color: #666; }
        .no-data small { color: #999; }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }

        .pagination-btn {
          padding: 8px 20px;
          border-radius: 40px;
          border: 1.5px solid #1565c0;
          background: white;
          color: #1565c0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #1565c0;
          color: white;
          transform: translateY(-1px);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 0.85rem;
          color: #666;
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

        .stat-value.pending { color: #c62828; }
        .stat-value.progress { color: #f57c00; }
        .stat-value.review { color: #004085; }
        .stat-value.resolved { color: #2e7d32; }

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
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e0e0e0;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          color: white;
          border-radius: 24px 24px 0 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .modal-header h2 {
          font-size: 1.3rem;
          color: white;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: white;
          transition: color 0.3s;
        }
        .modal-close:hover { color: #ddd; }

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

        .description-text, .resolution-text {
          line-height: 1.6;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
        }

        .copy-detail-btn {
          background: none;
          border: none;
          cursor: pointer;
          margin-left: 8px;
          font-size: 0.8rem;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .copy-detail-btn:hover { opacity: 1; }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e0e0e0;
          text-align: right;
          position: sticky;
          bottom: 0;
          background: white;
          border-radius: 0 0 24px 24px;
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
          transform: translateY(-1px);
        }

        /* Footer */
        .footer {
          background: #0d2b5e;
          color: white;
          padding: 20px 24px;
          margin-top: 40px;
          text-align: center;
        }
        .footer-content { max-width: 1200px; margin: 0 auto; }
        .footer-copyright { text-align: center; }
        .footer-copyright p { font-size: 0.75rem; opacity: 0.8; margin: 3px 0; }
        .copyright-text { font-size: 0.65rem; opacity: 0.6; }

        /* Responsive */
        @media (max-width: 768px) {
          .main-content { padding-top: 330px; }
          .filters-section { flex-direction: column; }
          .filter-group { width: 100%; flex-direction: column; }
          .filter-select { width: 100%; }
          .complaints-table th { display: none; }
          .complaints-table tr { display: block; margin-bottom: 16px; border: 1px solid #e0e0e0; border-radius: 12px; }
          .complaints-table td { display: block; text-align: right; position: relative; padding: 10px 12px; border-bottom: 1px solid #eee; }
          .complaints-table td:last-child { border-bottom: none; }
          .complaints-table td::before { content: attr(data-label); font-weight: 600; position: absolute; left: 12px; top: 10px; color: #0d47a1; }
          .ticket-id { justify-content: flex-end; }
          .complainant-info { align-items: flex-end; }
          .statistics-bar { flex-wrap: wrap; }
          .container-1, .container-2, .container-3 { flex-direction: column; text-align: center; padding: 0 20px; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .contact-info-group { flex-direction: column; gap: 8px; }
          .logo-left, .logo-right { display: none; }
          .dept-text-center { flex: 1; }
          .detail-group { flex-direction: column; }
          .detail-group label { width: 100%; margin-bottom: 6px; }
          .toast-notification { top: auto; bottom: 20px; right: 20px; left: 20px; max-width: calc(100% - 40px); }
        }

        @media (max-width: 480px) {
          .main-content { padding-top: 350px; }
          .complaints-header h1 { font-size: 1.5rem; }
          .pagination { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
};

export default Complaints;