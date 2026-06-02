// src/pages/AdminComplaintsResolved.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminComplaintsResolved = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for complaints from backend
  const [complaints, setComplaints] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Helper function to safely format dates
  const formatDate = (date, formatType = 'english') => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      if (formatType === 'nepali') {
        const year = d.getFullYear() - 57;
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return d.toISOString().split('T')[0];
    } catch (error) {
      return '-';
    }
  };

  // Calculate resolution days
  const calculateResolutionDays = (submittedDate, resolvedDate) => {
    if (!submittedDate || !resolvedDate) return 1;
    try {
      const submitted = new Date(submittedDate);
      const resolved = new Date(resolvedDate);
      if (isNaN(submitted.getTime()) || isNaN(resolved.getTime())) return 1;
      const diffTime = Math.abs(resolved - submitted);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch (error) {
      return 1;
    }
  };

  // Map priority from backend to component priority
  const mapPriority = (priority) => {
    if (!priority) return 'medium';
    const priorityMap = {
      'High': 'high',
      'high': 'high',
      'Medium': 'medium',
      'medium': 'medium',
      'Low': 'low',
      'low': 'low',
      'Urgent': 'high',
      'urgent': 'high',
      'उच्च': 'high',
      'मध्यम': 'medium',
      'न्यून': 'low'
    };
    return priorityMap[priority] || 'medium';
  };

  // Get sample resolved complaints as fallback (using the helper functions)
  const getSampleResolvedComplaints = () => {
    const sampleSubmittedDate = '2024-01-20';
    const sampleResolvedDate = '2024-01-22';
    const sampleDays = calculateResolutionDays(sampleSubmittedDate, sampleResolvedDate);
    
    return [
      { 
        id: 1, 
        ticketId: 'NTC-2024-002', 
        name: 'सीता शर्मा', 
        enName: 'Sita Sharma',
        email: 'sita@example.com',
        phone: '9812345678',
        category: 'recharge',
        category_np: 'रिचार्ज',
        category_en: 'Recharge',
        description: 'रु. ५०० रिचार्ज गरे पनि ब्यालेन्स अपडेट भएन',
        enDescription: 'Recharged Rs. 500 but balance not updated',
        status: 'resolved',
        submittedDate: sampleSubmittedDate,
        resolvedDate: sampleResolvedDate,
        channel: 'व्हाट्सएप',
        enChannel: 'WhatsApp',
        priority: 'medium',
        assignedTo: 'बिलिङ टोली',
        enAssignedTo: 'Billing Team',
        resolutionDays: sampleDays,
        satisfactionRating: 5,
        feedback: 'धेरै राम्रो सेवा, छिटो समाधान',
        enFeedback: 'Very good service, quick resolution'
      },
      { 
        id: 2, 
        ticketId: 'NTC-2024-005', 
        name: 'मिना काफ्ले', 
        enName: 'Mina Kafle',
        email: 'mina@example.com',
        phone: '9841234567',
        category: 'billing',
        category_np: 'बिलिङ',
        category_en: 'Billing',
        description: 'गत महिनाको बिलमा गलत चार्ज',
        enDescription: 'Wrong charge in last month bill',
        status: 'resolved',
        submittedDate: '2024-01-10',
        resolvedDate: '2024-01-15',
        channel: 'इमेल',
        enChannel: 'Email',
        priority: 'medium',
        assignedTo: 'बिलिङ टोली',
        enAssignedTo: 'Billing Team',
        resolutionDays: calculateResolutionDays('2024-01-10', '2024-01-15'),
        satisfactionRating: 4,
        feedback: 'बिल समस्या समाधान भयो',
        enFeedback: 'Billing issue resolved'
      },
      {
        id: 3,
        ticketId: 'NTC-2024-008',
        name: 'राम प्रसाद',
        enName: 'Ram Prasad',
        email: 'ram@example.com',
        phone: '9800000000',
        category: 'network',
        category_np: 'नेटवर्क',
        category_en: 'Network',
        description: 'घरमा नेटवर्क छैन',
        enDescription: 'No network at home',
        status: 'resolved',
        submittedDate: '2024-01-05',
        resolvedDate: '2024-01-08',
        channel: 'फोन',
        enChannel: 'Phone',
        priority: 'high',
        assignedTo: 'नेटवर्क टोली',
        enAssignedTo: 'Network Team',
        resolutionDays: calculateResolutionDays('2024-01-05', '2024-01-08'),
        satisfactionRating: 3,
        feedback: 'समस्या समाधान भयो तर ढिलो भयो',
        enFeedback: 'Issue resolved but was delayed'
      }
    ];
  };

  // Fetch resolved complaints from backend
  const fetchResolvedComplaints = async () => {
    try {
      console.log('Fetching complaints from backend...');
      const response = await axios.get('http://localhost:5000/api/complaints');
      console.log('API Response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        // Filter only resolved complaints
        const resolvedComplaints = response.data.data
          .filter(complaint => {
            const status = complaint.status || complaint.statusNp;
            const isResolved = status === 'Resolved' || status === 'समाधान भयो' || status === 'resolved';
            if (isResolved) {
              console.log('Found resolved complaint:', complaint.complaintNumber);
            }
            return isResolved;
          })
          .map(complaint => {
            const submittedDate = complaint.submittedDate || complaint.createdAt || new Date().toISOString();
            const resolvedDateVal = complaint.resolvedDate || complaint.updatedAt || submittedDate;
            const resolutionDays = calculateResolutionDays(submittedDate, resolvedDateVal);
            
            return {
              id: complaint.id,
              ticketId: complaint.complaintNumber || `NTC-${complaint.id}`,
              name: complaint.name || 'N/A',
              enName: complaint.nameEn || complaint.name || 'N/A',
              email: complaint.email || 'N/A',
              phone: complaint.phone || 'N/A',
              category: complaint.category || complaint.natureOfComplaint || 'general',
              category_np: complaint.categoryNp || complaint.natureOfComplaint || 'सामान्य',
              category_en: complaint.category || complaint.natureOfComplaint || 'General',
              description: complaint.complaint || complaint.description || 'N/A',
              enDescription: complaint.complaintEn || complaint.complaint || complaint.description || 'N/A',
              status: 'resolved',
              submittedDate: submittedDate,
              resolvedDate: resolvedDateVal,
              channel: complaint.channel || 'वेबसाइट पोर्टल',
              enChannel: complaint.enChannel || 'Website Portal',
              priority: mapPriority(complaint.priority),
              assignedTo: complaint.assignedTo || (language === 'np' ? 'प्रशासक' : 'Administrator'),
              enAssignedTo: complaint.enAssignedTo || 'Administrator',
              resolutionDays: resolutionDays,
              satisfactionRating: complaint.satisfactionRating || 4,
              feedback: complaint.feedback || (language === 'np' ? 'समस्या समाधान भयो। धन्यवाद।' : 'Issue resolved. Thank you.'),
              enFeedback: complaint.enFeedback || 'Issue resolved. Thank you.',
              referenceNumber: complaint.referenceNumber,
              landmark: complaint.landmark,
              address: complaint.address,
              preferredContact: complaint.preferredContact
            };
          });
        
        console.log(`Found ${resolvedComplaints.length} resolved complaints`);
        setComplaints(resolvedComplaints);
        setBackendStatus('connected');
      } else {
        console.warn('Invalid response format:', response.data);
        setComplaints(getSampleResolvedComplaints());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints(getSampleResolvedComplaints());
      setBackendStatus('disconnected');
    } finally {
      setTimeout(() => setLoading(false), 500);
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

  // Time range options
  const timeRanges = {
    np: {
      all: 'सबै',
      lastWeek: 'पछिल्लो ७ दिन',
      lastMonth: 'पछिल्लो ३० दिन',
      lastQuarter: 'पछिल्लो ९० दिन'
    },
    en: {
      all: 'All',
      lastWeek: 'Last 7 Days',
      lastMonth: 'Last 30 Days',
      lastQuarter: 'Last 90 Days'
    }
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      fetchResolvedComplaints();
    }
  }, [navigate]);

  const content = {
    np: {
      resolvedComplaints: 'समाधान भएका गुनासोहरू',
      manageResolved: 'समाधान गुनासो व्यवस्थापन',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByCategory: 'प्रकार अनुसार फिल्टर',
      filterByTimeRange: 'समय अवधि अनुसार फिल्टर',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      date: 'दर्ता मिति',
      resolvedDate: 'समाधान मिति',
      resolutionTime: 'समाधान समय',
      priority: 'प्राथमिकता',
      satisfaction: 'सन्तुष्टि',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      generateReport: 'रिपोर्ट बनाउनुहोस्',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      channel: 'च्यानल',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      assignedTo: 'तोकिएको टोली',
      feedback: 'प्रतिक्रिया',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noComplaintsFound: 'कुनै समाधान गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalResolved: 'जम्मा समाधान',
      avgResolutionTime: 'औसत समाधान समय',
      avgSatisfaction: 'औसत सन्तुष्टि',
      satisfactionRating: 'सन्तुष्टि मूल्यांकन',
      outOf: 'मध्ये',
      excellent: 'उत्कृष्ट',
      good: 'राम्रो',
      average: 'सामान्य',
      poor: 'कमजोर',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस'
    },
    en: {
      resolvedComplaints: 'Resolved Complaints',
      manageResolved: 'Manage Resolved Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByPriority: 'Filter by Priority',
      filterByCategory: 'Filter by Category',
      filterByTimeRange: 'Filter by Time Range',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      date: 'Registered Date',
      resolvedDate: 'Resolved Date',
      resolutionTime: 'Resolution Time',
      priority: 'Priority',
      satisfaction: 'Satisfaction',
      actions: 'Actions',
      viewDetails: 'View Details',
      generateReport: 'Generate Report',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      channel: 'Channel',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      assignedTo: 'Assigned To',
      feedback: 'Feedback',
      close: 'Close',
      all: 'All',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noComplaintsFound: 'No resolved complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalResolved: 'Total Resolved',
      avgResolutionTime: 'Avg Resolution Time',
      avgSatisfaction: 'Avg Satisfaction',
      satisfactionRating: 'Satisfaction Rating',
      outOf: 'out of',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      poor: 'Poor',
      loading: 'Loading...',
      refresh: 'Refresh'
    }
  };

  const t = content[language];
  const categoriesObj = categories[language];
  const timeRangesObj = timeRanges[language];

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

  const getCategoryText = (category) => {
    return categoriesObj[category] || category;
  };

  // Fixed: Get formatted date using the helper function
  const getDate = (complaint) => {
    const dateToFormat = complaint.submittedDate || complaint.dateNp || complaint.dateEn;
    return language === 'np' ? formatDate(dateToFormat, 'nepali') : formatDate(dateToFormat, 'english');
  };

  // Fixed: Get formatted resolved date
  const getResolvedDate = (complaint) => {
    const dateToFormat = complaint.resolvedDate || complaint.resolvedDateEn || complaint.resolvedDateNp;
    return language === 'np' ? formatDate(dateToFormat, 'nepali') : formatDate(dateToFormat, 'english');
  };

  const getResolutionTime = (complaint) => {
    const days = complaint.resolutionDays || 1;
    return language === 'np' ? `${days} दिन` : `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getChannel = (complaint) => {
    return language === 'np' ? (complaint.channel || 'वेबसाइट') : (complaint.enChannel || 'Website');
  };

  const getAssignedTo = (complaint) => {
    return language === 'np' ? (complaint.assignedTo || 'प्रशासक') : (complaint.enAssignedTo || 'Administrator');
  };

  const getFeedback = (complaint) => {
    return language === 'np' ? (complaint.feedback || 'कुनै प्रतिक्रिया छैन') : (complaint.enFeedback || 'No feedback provided');
  };

  const getSatisfactionClass = (rating) => {
    if (rating >= 4.5) return 'satisfaction-excellent';
    if (rating >= 3.5) return 'satisfaction-good';
    if (rating >= 2.5) return 'satisfaction-average';
    return 'satisfaction-poor';
  };

  const getSatisfactionText = (rating) => {
    if (rating >= 4.5) return t.excellent;
    if (rating >= 3.5) return t.good;
    if (rating >= 2.5) return t.average;
    return t.poor;
  };

  // Filter complaints based on time range
  const getFilteredByTimeRange = (complaintsList) => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch(timeRangeFilter) {
      case 'lastWeek':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'lastMonth':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'lastQuarter':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        return complaintsList;
    }
    
    return complaintsList.filter(complaint => {
      const resolvedDateStr = complaint.resolvedDate || complaint.resolvedDateEn;
      if (!resolvedDateStr) return true;
      const resolvedDate = new Date(resolvedDateStr);
      return resolvedDate >= cutoffDate;
    });
  };

  // Apply all filters
  const filteredBySearchAndPriority = complaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      (complaint.name && complaint.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (complaint.enName && complaint.enName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (complaint.ticketId && complaint.ticketId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (complaint.phone && complaint.phone.includes(searchTerm));
    
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const categoryMatch = categoryFilter === 'all' || complaint.category === categoryFilter;
    
    return searchMatch && priorityMatch && categoryMatch;
  });

  const filteredComplaints = getFilteredByTimeRange(filteredBySearchAndPriority);

  // Calculate statistics
  const totalResolved = filteredComplaints.length;
  const avgResolutionDays = totalResolved > 0 
    ? Math.round(filteredComplaints.reduce((sum, c) => sum + (c.resolutionDays || 0), 0) / totalResolved)
    : 0;
  const avgSatisfaction = totalResolved > 0 
    ? (filteredComplaints.reduce((sum, c) => sum + (c.satisfactionRating || 0), 0) / totalResolved).toFixed(1)
    : 0;

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
    fetchResolvedComplaints();
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'star-filled' : 'star-empty'}`}>
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
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
    <div className="admin-resolved-complaints">
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      {backendStatus === 'disconnected' && (
        <div className="backend-warning">
          ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।' : 'Backend server not connected. Showing sample data.'}
        </div>
      )}
      
      <div className="complaints-container">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="page-header">
            <div>
              <h1>{t.resolvedComplaints}</h1>
              <p>{t.manageResolved}</p>
            </div>
            <div className="header-buttons">
              <button className="refresh-btn" onClick={refreshData}>
                🔄 {t.refresh}
              </button>
              <button className="report-btn" onClick={() => alert(t.generateReport)}>
                📊 {t.generateReport}
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div className="stat-info">
                <div className="stat-value">{totalResolved}</div>
                <div className="stat-label">{t.totalResolved}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">⏱️</div>
              <div className="stat-info">
                <div className="stat-value">{avgResolutionDays} {language === 'np' ? 'दिन' : 'days'}</div>
                <div className="stat-label">{t.avgResolutionTime}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">⭐</div>
              <div className="stat-info">
                <div className="stat-value">{avgSatisfaction}/5</div>
                <div className="stat-label">{t.avgSatisfaction}</div>
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
            </div>
            <div className="filter-group">
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
              <select
                value={timeRangeFilter}
                onChange={(e) => setTimeRangeFilter(e.target.value)}
                className="filter-select"
              >
                {Object.entries(timeRangesObj).map(([key, value]) => (
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
                  <th>{t.date}</th>
                  <th>{t.resolvedDate}</th>
                  <th>{t.resolutionTime}</th>
                  <th>{t.priority}</th>
                  <th>{t.satisfaction}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComplaints.length > 0 ? (
                  paginatedComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td className="ticket-id">{complaint.ticketId}</td>
                      <td>{language === 'np' ? complaint.name : complaint.enName}</td>
                      <td>{getCategoryText(complaint.category)}</td>
                      <td>{getDate(complaint)}</td>
                      <td>{getResolvedDate(complaint)}</td>
                      <td>{getResolutionTime(complaint)}</td>
                      <td>
                        <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                          {getPriorityText(complaint.priority)}
                        </span>
                      </td>
                      <td>
                        <div className="satisfaction-container">
                          <div className="stars">{renderStars(complaint.satisfactionRating)}</div>
                          <span className={`satisfaction-text ${getSatisfactionClass(complaint.satisfactionRating)}`}>
                            {getSatisfactionText(complaint.satisfactionRating)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button className="view-btn" onClick={() => openModal(complaint)}>
                          👁️ {t.viewDetails}
                        </button>
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

      {/* Complaint Details Modal */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {t.complaintDetails}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>{t.ticketId}:</label>
                <span>{selectedComplaint.ticketId}</span>
              </div>
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
              <div className="detail-row">
                <label>{t.category}:</label>
                <span>{getCategoryText(selectedComplaint.category)}</span>
              </div>
              <div className="detail-row">
                <label>{t.priority}:</label>
                <span className={`priority-badge ${getPriorityClass(selectedComplaint.priority)}`}>
                  {getPriorityText(selectedComplaint.priority)}
                </span>
              </div>
              <div className="detail-row">
                <label>{t.registeredDate}:</label>
                <span>{getDate(selectedComplaint)}</span>
              </div>
              <div className="detail-row">
                <label>{t.resolvedDate}:</label>
                <span>{getResolvedDate(selectedComplaint)}</span>
              </div>
              <div className="detail-row">
                <label>{t.resolutionTime}:</label>
                <span>{getResolutionTime(selectedComplaint)}</span>
              </div>
              <div className="detail-row">
                <label>{t.channel}:</label>
                <span>{getChannel(selectedComplaint)}</span>
              </div>
              <div className="detail-row">
                <label>{t.assignedTo}:</label>
                <span>{getAssignedTo(selectedComplaint)}</span>
              </div>
              <div className="detail-row">
                <label>{t.satisfactionRating}:</label>
                <div className="satisfaction-display">
                  <div className="stars-large">{renderStars(selectedComplaint.satisfactionRating)}</div>
                  <span className={`satisfaction-text ${getSatisfactionClass(selectedComplaint.satisfactionRating)}`}>
                    {getSatisfactionText(selectedComplaint.satisfactionRating)}
                  </span>
                </div>
              </div>
              <div className="detail-row full-width">
                <label>{t.feedback}:</label>
                <p className="feedback-text">"{getFeedback(selectedComplaint)}"</p>
              </div>
              <div className="detail-row full-width">
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
        /* Your existing styles remain exactly the same */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .admin-resolved-complaints {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
        }
        .backend-warning {
          position: fixed;
          top: 195px;
          left: 0;
          right: 0;
          background: #ff9800;
          color: white;
          padding: 8px;
          text-align: center;
          z-index: 100;
          font-size: 0.8rem;
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .complaints-container {
          display: flex;
          margin-top: 195px;
          min-height: calc(100vh - 195px);
        }
        .sidebar-container {
          position: fixed;
          top: 195px;
          left: 0;
          width: 260px;
          height: calc(100vh - 195px);
          background: white;
          border-right: 1px solid #e2e8f0;
          z-index: 40;
        }
        .main-container {
          flex: 1;
          padding: 24px 32px;
          margin-left: 260px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }
        .page-header h1 {
          font-size: 1.6rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .page-header p { color: #64748b; font-size: 0.85rem; }
        .header-buttons { display: flex; gap: 12px; }
        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          color: #475569;
        }
        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .report-btn {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }
        .report-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139,92,246,0.3);
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }
        .stat-icon.green { background: #d1fae5; color: #059669; }
        .stat-icon.blue { background: #dbeafe; color: #2563eb; }
        .stat-icon.orange { background: #fed7aa; color: #ea580c; }
        .stat-info { flex: 1; }
        .stat-value { font-size: 1.6rem; font-weight: 700; color: #0f172a; }
        .stat-label { font-size: 0.75rem; color: #64748b; margin-top: 4px; }
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
        }
        .search-box { flex: 1; position: relative; }
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
        .filter-group { display: flex; gap: 12px; }
        .filter-select {
          padding: 10px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }
        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        .complaints-table { width: 100%; border-collapse: collapse; }
        .complaints-table th, .complaints-table td {
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
        .complaints-table td { color: #334155; font-size: 0.85rem; }
        .complaints-table tr:hover { background: #fafcff; }
        .ticket-id { font-family: monospace; font-weight: 600; color: #3b82f6; }
        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }
        .satisfaction-container { display: flex; flex-direction: column; gap: 4px; }
        .stars { display: flex; gap: 2px; }
        .star { font-size: 0.8rem; }
        .star-filled { color: #f59e0b; }
        .star-empty { color: #d1d5db; }
        .satisfaction-text { font-size: 0.65rem; font-weight: 500; }
        .satisfaction-excellent { color: #059669; }
        .satisfaction-good { color: #3b82f6; }
        .satisfaction-average { color: #f59e0b; }
        .satisfaction-poor { color: #ef4444; }
        .view-btn {
          background: #f1f5f9;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.7rem;
        }
        .view-btn:hover { background: #e2e8f0; }
        .no-data { text-align: center; padding: 40px !important; }
        .no-data-content { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .no-data-icon { font-size: 3rem; }
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
        .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pagination-info { color: #64748b; font-size: 0.85rem; }
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
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
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
        .modal-header h2 { font-size: 1.2rem; color: #0f172a; }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #94a3b8;
        }
        .modal-close:hover { color: #475569; }
        .modal-body { padding: 24px; }
        .detail-row {
          display: flex;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .detail-row label {
          width: 130px;
          font-weight: 600;
          color: #0f172a;
          flex-shrink: 0;
        }
        .detail-row span, .detail-row p { flex: 1; color: #334155; }
        .detail-row.full-width { flex-direction: column; }
        .detail-row.full-width label { width: 100%; margin-bottom: 8px; }
        .satisfaction-display { display: flex; flex-direction: column; gap: 8px; }
        .stars-large { display: flex; gap: 4px; }
        .stars-large .star { font-size: 1.2rem; }
        .feedback-text {
          font-style: italic;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          margin-top: 4px;
        }
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          text-align: right;
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
        .btn-close:hover { background: #e2e8f0; }
        @media (max-width: 1200px) { .stats-row { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) {
          .complaints-container { margin-top: 280px; }
          .sidebar-container { top: 280px; height: calc(100vh - 280px); }
          .main-container { padding: 16px; margin-left: 0; }
          .filters-bar { flex-direction: column; }
          .filter-group { width: 100%; flex-direction: column; }
          .filter-select { width: 100%; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .stats-row { grid-template-columns: 1fr; }
          .header-buttons { width: 100%; flex-direction: column; }
        }
        @media (max-width: 480px) {
          .complaints-table th, .complaints-table td { padding: 8px; font-size: 0.7rem; }
          .detail-row { flex-direction: column; }
          .detail-row label { width: 100%; margin-bottom: 4px; }
        }
      `}</style>
    </div>
  );
};

export default AdminComplaintsResolved;