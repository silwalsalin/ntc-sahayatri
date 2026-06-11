// src/pages/AdminComplaintsPending.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminComplaintsPending = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for complaints from backend
  const [regularComplaints, setRegularComplaints] = useState([]);
  const [regardingComplaints, setRegardingComplaints] = useState([]);
  const [allPendingComplaints, setAllPendingComplaints] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }, []);

  // Calculate days pending
  const calculateDaysPending = (submittedDate) => {
    if (!submittedDate) return 1;
    try {
      const submitted = new Date(submittedDate);
      const today = new Date();
      const diffTime = Math.abs(today - submitted);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch (error) {
      return 1;
    }
  };

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
      'Low': 'low',
      'उच्च': 'high',
      'मध्यम': 'medium',
      'न्यून': 'low'
    };
    return priorityMap[priority] || 'medium';
  };

  // Check if complaint is pending
  const isPending = (status) => {
    const pendingStatuses = ['pending', 'Pending', 'विचाराधीन', 'PENDING'];
    return pendingStatuses.includes(status);
  };

  // Fetch all pending complaints from both tables
  const fetchPendingComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let regularData = [];
      let regardingData = [];
      
      // Fetch regular complaints
      try {
        const regularResponse = await axios.get(`${API_URL}/complaints`, { headers });
        if (regularResponse.data.success && Array.isArray(regularResponse.data.data)) {
          regularData = regularResponse.data.data
            .filter(complaint => isPending(complaint.status))
            .map(complaint => transformRegularComplaint(complaint));
        }
      } catch (error) {
        console.error('Error fetching regular complaints:', error);
      }
      
      // Fetch complaint regarding
      try {
        const regardingResponse = await axios.get(`${API_URL}/complaint-regarding`, { headers });
        if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
          regardingData = regardingResponse.data.data
            .filter(complaint => isPending(complaint.status))
            .map(complaint => transformRegardingComplaint(complaint));
        }
      } catch (error) {
        console.error('Error fetching regarding complaints:', error);
      }
      
      setRegularComplaints(regularData);
      setRegardingComplaints(regardingData);
      
      // Combine all pending complaints
      const combined = [...regularData, ...regardingData];
      combined.sort((a, b) => b.daysPending - a.daysPending);
      setAllPendingComplaints(combined);
      
      if (regularData.length > 0 || regardingData.length > 0) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('connected');
        setAllPendingComplaints([]);
      }
      
    } catch (error) {
      console.error('Error fetching pending complaints:', error);
      setBackendStatus('disconnected');
      setAllPendingComplaints([]);
      setRegularComplaints([]);
      setRegardingComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Transform regular complaint data
  const transformRegularComplaint = (complaint) => ({
    id: complaint.id,
    complaintId: complaint.id,
    ticketId: complaint.complaint_number || `NTC-${complaint.id}`,
    name: complaint.name || 'N/A',
    enName: complaint.name || 'N/A',
    email: complaint.email || 'N/A',
    phone: complaint.phone || 'N/A',
    category: complaint.nature_of_complaint || 'general',
    category_np: getCategoryNepali(complaint.nature_of_complaint),
    category_en: complaint.nature_of_complaint || 'General',
    subject: null,
    description: complaint.description || 'N/A',
    enDescription: complaint.description || 'N/A',
    status: 'pending',
    rawStatus: complaint.status,
    date: formatNepaliDate(complaint.created_at),
    enDate: formatEnglishDate(complaint.created_at),
    channel: 'वेबसाइट पोर्टल',
    enChannel: 'Website Portal',
    priority: mapPriority(complaint.priority),
    assignedTo: complaint.assigned_to || (language === 'np' ? 'प्रशासक' : 'Administrator'),
    enAssignedTo: complaint.assigned_to || 'Administrator',
    daysPending: calculateDaysPending(complaint.created_at),
    submittedDate: complaint.created_at,
    referenceNumber: null,
    landmark: complaint.landmark || null,
    address: complaint.street_address || null,
    preferredContact: null,
    type: 'regular'
  });

  // Transform complaint regarding data
  const transformRegardingComplaint = (complaint) => ({
    id: complaint.id,
    complaintId: complaint.id,
    ticketId: complaint.complaint_number || `CR-${complaint.id}`,
    name: complaint.name || 'N/A',
    enName: complaint.name || 'N/A',
    email: complaint.email || 'N/A',
    phone: complaint.phone || 'N/A',
    category: complaint.complaint_type || 'general',
    category_np: getCategoryNepali(complaint.complaint_type),
    category_en: complaint.complaint_type || 'General',
    subject: complaint.subject || null,
    description: complaint.description || 'N/A',
    enDescription: complaint.description || 'N/A',
    status: 'pending',
    rawStatus: complaint.status,
    date: formatNepaliDate(complaint.created_at),
    enDate: formatEnglishDate(complaint.created_at),
    channel: complaint.preferred_contact === 'phone' ? 'फोन' : complaint.preferred_contact === 'email' ? 'इमेल' : 'एसएमएस',
    enChannel: complaint.preferred_contact === 'phone' ? 'Phone' : complaint.preferred_contact === 'email' ? 'Email' : 'SMS',
    priority: mapPriority(complaint.priority),
    assignedTo: complaint.assigned_to || (language === 'np' ? 'प्रशासक' : 'Administrator'),
    enAssignedTo: complaint.assigned_to || 'Administrator',
    daysPending: calculateDaysPending(complaint.created_at),
    submittedDate: complaint.created_at,
    referenceNumber: complaint.reference_number || null,
    landmark: complaint.landmark || null,
    address: complaint.address || null,
    preferredContact: complaint.preferred_contact || null,
    type: 'regarding'
  });

  // Get category Nepali translation
  const getCategoryNepali = (category) => {
    const categories = {
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
    return categories[category] || 'सामान्य';
  };

  // Check authentication and fetch data
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      fetchPendingComplaints();
    }
  }, [navigate, fetchPendingComplaints]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priorityFilter, categoryFilter, typeFilter]);

  const content = {
    np: {
      pendingComplaints: 'विचाराधीन गुनासोहरू',
      managePending: 'विचाराधीन गुनासो व्यवस्थापन',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByCategory: 'प्रकार अनुसार फिल्टर',
      filterByType: 'गुनासो प्रकार',
      allTypes: 'सबै प्रकार',
      regularComplaints: 'साधारण गुनासो',
      regardingComplaints: 'गुनासो सम्बन्धी',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      date: 'मिति',
      daysPending: 'दिन बाँकी',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      channel: 'च्यानल',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      assignedTo: 'तोकिएको टोली',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noComplaintsFound: 'कुनै विचाराधीन गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalPending: 'जम्मा विचाराधीन',
      urgentAttention: 'तत्काल ध्यान दिनुहोस्',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      referenceNo: 'सन्दर्भ नम्बर',
      landmark: 'नजिकैको चिन्ह',
      address: 'ठेगाना',
      preferredContact: 'सम्पर्कको माध्यम',
      subject: 'विषय',
      complaintInfo: 'गुनासो जानकारी',
      complainantInfo: 'उजुरीकर्ताको जानकारी',
      addressInfo: 'ठेगाना जानकारी',
      dateInfo: 'मिति जानकारी'
    },
    en: {
      pendingComplaints: 'Pending Complaints',
      managePending: 'Manage Pending Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByPriority: 'Filter by Priority',
      filterByCategory: 'Filter by Category',
      filterByType: 'Complaint Type',
      allTypes: 'All Types',
      regularComplaints: 'Regular Complaints',
      regardingComplaints: 'Complaint Regarding',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      date: 'Date',
      daysPending: 'Days Pending',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      channel: 'Channel',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      assignedTo: 'Assigned To',
      close: 'Close',
      all: 'All',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noComplaintsFound: 'No pending complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalPending: 'Total Pending',
      urgentAttention: 'Requires Urgent Attention',
      loading: 'Loading...',
      refresh: 'Refresh',
      referenceNo: 'Reference Number',
      landmark: 'Landmark',
      address: 'Address',
      preferredContact: 'Preferred Contact',
      subject: 'Subject',
      complaintInfo: 'Complaint Information',
      complainantInfo: 'Complainant Information',
      addressInfo: 'Address Information',
      dateInfo: 'Date Information'
    }
  };

  const t = content[language];

  const getPriorityClass = (priority) => {
    const classes = { high: 'priority-high', medium: 'priority-medium', low: 'priority-low' };
    return classes[priority] || 'priority-medium';
  };

  const getPriorityText = (priority) => {
    const texts = {
      np: { high: 'उच्च', medium: 'मध्यम', low: 'न्यून' },
      en: { high: 'High', medium: 'Medium', low: 'Low' }
    };
    return texts[language][priority] || priority;
  };

  const getCategoryText = (complaint) => {
    return language === 'np' ? complaint.category_np : complaint.category_en;
  };

  const getDate = (complaint) => {
    return language === 'np' ? complaint.date : complaint.enDate;
  };

  const getChannel = (complaint) => {
    return language === 'np' ? complaint.channel : complaint.enChannel;
  };

  const getAssignedTo = (complaint) => {
    return language === 'np' ? complaint.assignedTo : complaint.enAssignedTo;
  };

  const getComplaintTypeText = (complaint) => {
    if (language === 'np') {
      return complaint.type === 'regular' ? 'साधारण' : 'सम्बन्धी';
    }
    return complaint.type === 'regular' ? 'Regular' : 'Regarding';
  };

  const getComplaintTypeClass = (complaint) => {
    return complaint.type === 'regular' ? 'type-regular' : 'type-regarding';
  };

  const getUrgencyClass = (days) => {
    if (days >= 10) return 'urgency-critical';
    if (days >= 5) return 'urgency-high';
    if (days >= 3) return 'urgency-medium';
    return 'urgency-low';
  };

  const getUrgencyText = (days) => {
    if (language === 'np') {
      if (days >= 10) return 'गम्भीर';
      if (days >= 5) return 'अति आवश्यक';
      if (days >= 3) return 'आवश्यक';
      return 'सामान्य';
    } else {
      if (days >= 10) return 'Critical';
      if (days >= 5) return 'Urgent';
      if (days >= 3) return 'Important';
      return 'Normal';
    }
  };

  // Categories for filter
  const categories = {
    np: {
      all: 'सबै प्रकार',
      internet: 'इन्टरनेट',
      recharge: 'रिचार्ज',
      activation: 'सक्रियता',
      billing: 'बिलिङ',
      network: 'नेटवर्क',
      technical: 'प्राविधिक',
      service: 'सेवा',
      signal: 'सिग्नल',
      general: 'सामान्य'
    },
    en: {
      all: 'All Categories',
      internet: 'Internet',
      recharge: 'Recharge',
      activation: 'Activation',
      billing: 'Billing',
      network: 'Network',
      technical: 'Technical',
      service: 'Service',
      signal: 'Signal',
      general: 'General'
    }
  };

  const categoriesObj = categories[language];

  // Filter complaints
  const filteredComplaints = allPendingComplaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.phone.includes(searchTerm);
    
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const categoryMatch = categoryFilter === 'all' || complaint.category === categoryFilter;
    const typeMatch = typeFilter === 'all' || complaint.type === typeFilter;
    
    return searchMatch && priorityMatch && categoryMatch && typeMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  // Refresh data
  const refreshData = () => {
    setLoading(true);
    setCurrentPage(1);
    fetchPendingComplaints();
    showToast(language === 'np' ? 'डाटा रिफ्रेस गरियो' : 'Data refreshed', 'info');
  };

  // Statistics
  const stats = {
    total: allPendingComplaints.length,
    high: allPendingComplaints.filter(c => c.priority === 'high').length,
    medium: allPendingComplaints.filter(c => c.priority === 'medium').length,
    low: allPendingComplaints.filter(c => c.priority === 'low').length,
    critical: allPendingComplaints.filter(c => c.daysPending >= 10).length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="admin-pending-complaints">
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

      <Header language={language} setLanguage={setLanguage} adminName="Admin" userRole="admin" />
      
      {/* Backend Status Banner */}
      {backendStatus === 'disconnected' && (
        <div className="backend-warning">
          ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। कृपया सर्भर सुरु गर्नुहोस्।' : 'Backend server not connected. Please start the server.'}
        </div>
      )}
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} userRole="admin" />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>{t.pendingComplaints}</h1>
                <p>{t.managePending}</p>
              </div>
              <div className="pending-stats">
                <div>
                  <span className="pending-count">{stats.total}</span>
                  <span className="pending-label">{t.totalPending}</span>
                </div>
                {stats.critical > 0 && (
                  <div className="critical-alert">
                    <span>⚠️ {stats.critical}</span>
                    <span className="critical-label">{t.urgentAttention}</span>
                  </div>
                )}
                <button className="refresh-btn-small" onClick={refreshData} title={t.refresh}>
                  🔄
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-card-icon high">🔴</div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{stats.high}</div>
                  <div className="stat-card-label">{t.high}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon medium">🟡</div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{stats.medium}</div>
                  <div className="stat-card-label">{t.medium}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon low">🟢</div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{stats.low}</div>
                  <div className="stat-card-label">{t.low}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon critical">⚠️</div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{stats.critical}</div>
                  <div className="stat-card-label">{t.urgentAttention}</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                )}
              </div>
              <div className="filter-group">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.allTypes}</option>
                  <option value="regular">{t.regularComplaints}</option>
                  <option value="regarding">{t.regardingComplaints}</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="high">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="low">{t.low}</option>
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
                    <th>{t.complainant}</th>
                    <th>{t.category}</th>
                    <th>{t.subject}</th>
                    <th>{t.date}</th>
                    <th>{t.daysPending}</th>
                    <th>{t.priority}</th>
                    <th>{t.complaintType}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.length > 0 ? (
                    paginatedComplaints.map((complaint, idx) => (
                      <tr key={`${complaint.type}-${complaint.id}-${idx}`} className={complaint.priority === 'high' ? 'high-priority-row' : ''}>
                        <td className="ticket-id">{complaint.ticketId}</td>
                        <td>
                          <div className="complainant-info">
                            <strong>{language === 'np' ? complaint.name : complaint.enName}</strong>
                            <small>{complaint.phone}</small>
                          </div>
                        </td>
                        <td>{getCategoryText(complaint)}</td>
                        <td>{complaint.subject || '-'}</td>
                        <td>{getDate(complaint)}</td>
                        <td>
                          <div className="days-pending">
                            <span className={`urgency-badge ${getUrgencyClass(complaint.daysPending)}`}>
                              {complaint.daysPending} {language === 'np' ? 'दिन' : 'days'}
                            </span>
                            <span className="urgency-text">{getUrgencyText(complaint.daysPending)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                            {getPriorityText(complaint.priority)}
                          </span>
                        </td>
                        <td>
                          <span className={`type-badge ${getComplaintTypeClass(complaint)}`}>
                            {getComplaintTypeText(complaint)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="view-details-btn" onClick={() => openModal(complaint)}>
                              👁️ {t.viewDetails}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-data">
                      <td colSpan="9">
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
                <span className="pagination-info">
                  {t.page} {currentPage} {t.of} {totalPages}
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
          </div>
        </div>
      </div>

      {/* Complaint Details Modal - View Only */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {t.complaintDetails}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>📌 {t.complaintInfo}</h4>
                <div className="detail-row">
                  <label>{t.ticketId}:</label>
                  <span>{selectedComplaint.ticketId}</span>
                </div>
                <div className="detail-row">
                  <label>{t.complaintType}:</label>
                  <span className={`type-badge ${getComplaintTypeClass(selectedComplaint)}`}>
                    {getComplaintTypeText(selectedComplaint)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.category}:</label>
                  <span>{getCategoryText(selectedComplaint)}</span>
                </div>
                {selectedComplaint.subject && (
                  <div className="detail-row">
                    <label>{t.subject}:</label>
                    <span>{selectedComplaint.subject}</span>
                  </div>
                )}
                {selectedComplaint.referenceNumber && (
                  <div className="detail-row">
                    <label>{t.referenceNo}:</label>
                    <span>{selectedComplaint.referenceNumber}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>{t.priority}:</label>
                  <span className={`priority-badge ${getPriorityClass(selectedComplaint.priority)}`}>
                    {getPriorityText(selectedComplaint.priority)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.daysPending}:</label>
                  <span className={`urgency-badge ${getUrgencyClass(selectedComplaint.daysPending)}`}>
                    {selectedComplaint.daysPending} {language === 'np' ? 'दिन' : 'days'} - {getUrgencyText(selectedComplaint.daysPending)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>👤 {t.complainantInfo}</h4>
                <div className="detail-row">
                  <label>{t.complainant}:</label>
                  <span>{language === 'np' ? selectedComplaint.name : selectedComplaint.enName}</span>
                </div>
                <div className="detail-row">
                  <label>{t.email}:</label>
                  <span>{selectedComplaint.email}</span>
                </div>
                <div className="detail-row">
                  <label>{t.phone}:</label>
                  <span>{selectedComplaint.phone}</span>
                </div>
                {selectedComplaint.address && (
                  <div className="detail-row">
                    <label>{t.address}:</label>
                    <span>{selectedComplaint.address}</span>
                  </div>
                )}
                {selectedComplaint.landmark && (
                  <div className="detail-row">
                    <label>{t.landmark}:</label>
                    <span>{selectedComplaint.landmark}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>📝 {t.description}</h4>
                <div className="detail-row full-width">
                  <p className="description-text">{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
                </div>
              </div>

              <div className="detail-section">
                <h4>📊 {t.statusInfo}</h4>
                <div className="detail-row">
                  <label>{t.registeredDate}:</label>
                  <span>{getDate(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.channel}:</label>
                  <span>{getChannel(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.assignedTo}:</label>
                  <span>{getAssignedTo(selectedComplaint)}</span>
                </div>
                {selectedComplaint.preferredContact && (
                  <div className="detail-row">
                    <label>{t.preferredContact}:</label>
                    <span>{selectedComplaint.preferredContact}</span>
                  </div>
                )}
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

        .admin-pending-complaints {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
          overflow-x: hidden;
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
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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

        /* Dashboard Layout */
        .dashboard-layout {
          display: flex;
          min-height: calc(100vh - 70px);
          margin-top: 70px;
          position: relative;
        }

        .sidebar-container {
          position: fixed;
          top: 70px;
          left: 0;
          width: 260px;
          height: calc(100vh - 70px);
          background: white;
          border-right: 1px solid #e2e8f0;
          z-index: 100;
          overflow-y: auto;
        }

        .main-container {
          flex: 1;
          margin-left: 260px;
          width: calc(100% - 260px);
          min-height: calc(100vh - 70px);
          overflow-x: auto;
        }

        .main-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .main-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .main-container::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }

        .content-wrapper {
          padding: 24px 32px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-header h1 {
          font-size: 1.6rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .page-header p {
          color: #64748b;
          font-size: 0.85rem;
        }

        .pending-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 12px;
        }

        .pending-count {
          font-size: 1.8rem;
          font-weight: 700;
          color: #d97706;
        }

        .pending-label {
          font-size: 0.7rem;
          color: #b45309;
          display: block;
        }

        .critical-alert {
          text-align: center;
          padding: 0 10px;
          border-left: 1px solid #fcd34d;
          border-right: 1px solid #fcd34d;
        }

        .critical-alert span:first-child {
          font-size: 1.2rem;
          font-weight: 700;
          color: #dc2626;
          display: block;
        }

        .critical-label {
          font-size: 0.6rem;
          color: #b45309;
        }

        .refresh-btn-small {
          background: rgba(0,0,0,0.1);
          border: none;
          font-size: 1rem;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-btn-small:hover {
          background: rgba(0,0,0,0.2);
          transform: rotate(180deg);
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
        }

        .stat-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          background: #f8fafc;
        }

        .stat-card-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-card-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
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
          color: #9ca3af;
        }

        .search-box input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
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
          color: #9ca3af;
        }

        .filter-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }

        /* Table */
        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .complaints-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        .complaints-table th,
        .complaints-table td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .complaints-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .complaints-table td {
          color: #334155;
          font-size: 0.85rem;
        }

        .complaints-table tr:hover {
          background: #fafcff;
        }

        .high-priority-row {
          background-color: #fef2f2;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #3b82f6;
        }

        .complainant-info strong { display: block; }
        .complainant-info small { font-size: 0.7rem; color: #64748b; }

        .priority-badge, .type-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .type-regular { background: #dbeafe; color: #1e40af; }
        .type-regarding { background: #fef3c7; color: #92400e; }

        .days-pending {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .urgency-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 600;
          width: fit-content;
        }

        .urgency-critical { background: #fee2e2; color: #dc2626; }
        .urgency-high { background: #fed7aa; color: #c2410c; }
        .urgency-medium { background: #fef3c7; color: #d97706; }
        .urgency-low { background: #d1fae5; color: #059669; }

        .urgency-text {
          font-size: 0.65rem;
          color: #6b7280;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .view-details-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .view-details-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(59,130,246,0.3);
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

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
          padding: 16px;
        }

        .pagination-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          color: #64748b;
          font-size: 0.85rem;
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
          border-radius: 20px;
          max-width: 650px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .modal-header h2 {
          font-size: 1.2rem;
          color: #0f172a;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #94a3b8;
        }

        .modal-close:hover {
          color: #475569;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e2e8f0;
        }

        .detail-row {
          display: flex;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .detail-row label {
          width: 130px;
          font-weight: 600;
          color: #0f172a;
        }

        .detail-row span,
        .detail-row p {
          flex: 1;
          color: #334155;
        }

        .detail-row.full-width {
          flex-direction: column;
        }

        .detail-row.full-width label {
          width: 100%;
          margin-bottom: 8px;
        }

        .description-text {
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
          background: white;
        }

        .btn-close {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-close:hover {
          background: #e2e8f0;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .sidebar-container {
            display: none;
          }
          .main-container {
            margin-left: 0;
            width: 100%;
          }
          .content-wrapper {
            padding: 16px;
          }
          .filters-bar {
            flex-direction: column;
          }
          .filter-group {
            width: 100%;
            flex-direction: column;
          }
          .filter-select {
            width: 100%;
          }
          .stats-row {
            grid-template-columns: 1fr;
          }
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .action-buttons {
            flex-direction: column;
          }
          .pending-stats {
            flex-wrap: wrap;
          }
          .detail-row {
            flex-direction: column;
          }
          .detail-row label {
            width: 100%;
            margin-bottom: 4px;
          }
          .modal-footer {
            flex-direction: column;
          }
          .modal-footer button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .complaints-table th,
          .complaints-table td {
            padding: 8px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminComplaintsPending;