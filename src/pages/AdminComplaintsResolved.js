// src/pages/AdminComplaintsResolved.js
import React, { useState, useEffect, useCallback } from 'react';
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const itemsPerPage = 10;

  // State for complaints from backend
  const [regularComplaints, setRegularComplaints] = useState([]);
  const [regardingComplaints, setRegardingComplaints] = useState([]);
  const [allResolvedComplaints, setAllResolvedComplaints] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }, []);

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

  // Helper function to convert status to Nepali
  const getStatusInNepali = (status) => {
    const statusMap = {
      'pending': 'विचाराधीन',
      'in-progress': 'प्रगतिमा',
      'inprogress': 'प्रगतिमा',
      'In Progress': 'प्रगतिमा',
      'review': 'समीक्षामा',
      'resolved': 'समाधान भयो',
      'Resolved': 'समाधान भयो',
      'closed': 'बन्द',
      'rejected': 'अस्वीकृत'
    };
    return statusMap[status] || status || 'समाधान भयो';
  };

  // Check if complaint is resolved
  const isResolved = (status) => {
    const resolvedStatuses = ['resolved', 'Resolved', 'समाधान भयो', 'closed', 'Closed'];
    return resolvedStatuses.includes(status);
  };

  // Fetch resolved complaints from both tables
  const fetchResolvedComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let regularData = [];
      let regardingData = [];
      
      // Fetch regular complaints
      try {
        const regularResponse = await axios.get(`${API_URL}/complaints/public`, { headers });
        if (regularResponse.data.success && Array.isArray(regularResponse.data.data)) {
          regularData = regularResponse.data.data
            .filter(complaint => isResolved(complaint.status))
            .map(complaint => transformRegularComplaint(complaint));
        }
      } catch (error) {
        console.error('Error fetching regular complaints:', error);
      }
      
      // Fetch complaint regarding
      try {
        const regardingResponse = await axios.get(`${API_URL}/complaints/regarding/public`, { headers });
        if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
          regardingData = regardingResponse.data.data
            .filter(complaint => isResolved(complaint.status))
            .map(complaint => transformRegardingComplaint(complaint));
        }
      } catch (error) {
        console.error('Error fetching regarding complaints:', error);
      }
      
      setRegularComplaints(regularData);
      setRegardingComplaints(regardingData);
      
      // Combine all resolved complaints
      const combined = [...regularData, ...regardingData];
      combined.sort((a, b) => new Date(b.resolvedDate) - new Date(a.resolvedDate));
      setAllResolvedComplaints(combined);
      
      if (regularData.length > 0 || regardingData.length > 0) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('connected');
      }
      
    } catch (error) {
      console.error('Error fetching resolved complaints:', error);
      setBackendStatus('disconnected');
      setAllResolvedComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Transform regular complaint data
  const transformRegularComplaint = (complaint) => {
    const submittedDate = complaint.created_at || new Date().toISOString();
    const resolvedDateVal = complaint.resolved_at || complaint.updated_at || submittedDate;
    const resolutionDays = calculateResolutionDays(submittedDate, resolvedDateVal);
    
    return {
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
      status: 'resolved',
      rawStatus: complaint.status,
      submittedDate: submittedDate,
      resolvedDate: resolvedDateVal,
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal',
      priority: mapPriority(complaint.priority),
      assignedTo: complaint.assigned_to || (language === 'np' ? 'प्रशासक' : 'Administrator'),
      enAssignedTo: complaint.assigned_to || 'Administrator',
      resolutionDays: resolutionDays,
      satisfactionRating: complaint.satisfaction_rating || 4,
      feedback: complaint.resolution || (language === 'np' ? 'समस्या समाधान भयो। धन्यवाद।' : 'Issue resolved. Thank you.'),
      enFeedback: complaint.resolution || 'Issue resolved. Thank you.',
      referenceNumber: null,
      landmark: complaint.landmark || null,
      address: complaint.street_address || null,
      preferredContact: null,
      type: 'regular'
    };
  };

  // Transform complaint regarding data
  const transformRegardingComplaint = (complaint) => {
    const submittedDate = complaint.created_at || new Date().toISOString();
    const resolvedDateVal = complaint.resolved_at || complaint.updated_at || submittedDate;
    const resolutionDays = calculateResolutionDays(submittedDate, resolvedDateVal);
    
    return {
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
      status: 'resolved',
      rawStatus: complaint.status,
      submittedDate: submittedDate,
      resolvedDate: resolvedDateVal,
      channel: complaint.preferred_contact === 'phone' ? 'फोन' : complaint.preferred_contact === 'email' ? 'इमेल' : 'एसएमएस',
      enChannel: complaint.preferred_contact === 'phone' ? 'Phone' : complaint.preferred_contact === 'email' ? 'Email' : 'SMS',
      priority: mapPriority(complaint.priority),
      assignedTo: complaint.assigned_to || (language === 'np' ? 'प्रशासक' : 'Administrator'),
      enAssignedTo: complaint.assigned_to || 'Administrator',
      resolutionDays: resolutionDays,
      satisfactionRating: complaint.satisfaction_rating || 4,
      feedback: complaint.resolution || (language === 'np' ? 'समस्या समाधान भयो। धन्यवाद।' : 'Issue resolved. Thank you.'),
      enFeedback: complaint.resolution || 'Issue resolved. Thank you.',
      referenceNumber: complaint.reference_number || null,
      landmark: complaint.landmark || null,
      address: complaint.address || null,
      preferredContact: complaint.preferred_contact || null,
      type: 'regarding'
    };
  };

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
      fetchResolvedComplaints();
    }
  }, [navigate, fetchResolvedComplaints]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priorityFilter, categoryFilter, typeFilter, timeRangeFilter]);

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
      lastQuarter: 'पछिल्लो ९० दिन',
      thisYear: 'यो वर्ष'
    },
    en: {
      all: 'All',
      lastWeek: 'Last 7 Days',
      lastMonth: 'Last 30 Days',
      lastQuarter: 'Last 90 Days',
      thisYear: 'This Year'
    }
  };

  const content = {
    np: {
      resolvedComplaints: 'समाधान भएका गुनासोहरू',
      manageResolved: 'समाधान गुनासो व्यवस्थापन',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByCategory: 'प्रकार अनुसार फिल्टर',
      filterByType: 'गुनासो प्रकार',
      filterByTimeRange: 'समय अवधि अनुसार फिल्टर',
      allTypes: 'सबै प्रकार',
      regularComplaints: 'साधारण गुनासो',
      regardingComplaints: 'गुनासो सम्बन्धी',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      subject: 'विषय',
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
      refresh: 'रिफ्रेस',
      complaintInfo: 'गुनासो जानकारी',
      complainantInfo: 'उजुरीकर्ताको जानकारी',
      addressInfo: 'ठेगाना जानकारी',
      dateInfo: 'मिति जानकारी',
      referenceNo: 'सन्दर्भ नम्बर',
      landmark: 'नजिकैको चिन्ह',
      address: 'ठेगाना',
      preferredContact: 'सम्पर्कको माध्यम',
      resolution: 'समाधान विवरण'
    },
    en: {
      resolvedComplaints: 'Resolved Complaints',
      manageResolved: 'Manage Resolved Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByPriority: 'Filter by Priority',
      filterByCategory: 'Filter by Category',
      filterByType: 'Complaint Type',
      filterByTimeRange: 'Filter by Time Range',
      allTypes: 'All Types',
      regularComplaints: 'Regular Complaints',
      regardingComplaints: 'Complaint Regarding',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      subject: 'Subject',
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
      refresh: 'Refresh',
      complaintInfo: 'Complaint Information',
      complainantInfo: 'Complainant Information',
      addressInfo: 'Address Information',
      dateInfo: 'Date Information',
      referenceNo: 'Reference Number',
      landmark: 'Landmark',
      address: 'Address',
      preferredContact: 'Preferred Contact',
      resolution: 'Resolution Details'
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

  const getCategoryText = (complaint) => {
    return language === 'np' ? complaint.category_np : complaint.category_en;
  };

  const getDate = (complaint) => {
    return language === 'np' ? formatDate(complaint.submittedDate, 'nepali') : formatDate(complaint.submittedDate, 'english');
  };

  const getResolvedDate = (complaint) => {
    return language === 'np' ? formatDate(complaint.resolvedDate, 'nepali') : formatDate(complaint.resolvedDate, 'english');
  };

  const getResolutionTime = (complaint) => {
    const days = complaint.resolutionDays || 1;
    return language === 'np' ? `${days} दिन` : `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getChannel = (complaint) => {
    return language === 'np' ? complaint.channel : complaint.enChannel;
  };

  const getAssignedTo = (complaint) => {
    return language === 'np' ? complaint.assignedTo : complaint.enAssignedTo;
  };

  const getFeedback = (complaint) => {
    return language === 'np' ? complaint.feedback : complaint.enFeedback;
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
      case 'thisYear':
        cutoffDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return complaintsList;
    }
    
    return complaintsList.filter(complaint => {
      const resolvedDate = new Date(complaint.resolvedDate);
      return resolvedDate >= cutoffDate;
    });
  };

  // Apply all filters
  const filteredBySearchAndFilters = allResolvedComplaints.filter(complaint => {
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

  const filteredComplaints = getFilteredByTimeRange(filteredBySearchAndFilters);

  // Calculate statistics
  const totalResolved = filteredComplaints.length;
  const avgResolutionDays = totalResolved > 0 
    ? Math.round(filteredComplaints.reduce((sum, c) => sum + (c.resolutionDays || 0), 0) / totalResolved)
    : 0;
  const avgSatisfaction = totalResolved > 0 
    ? (filteredComplaints.reduce((sum, c) => sum + (c.satisfactionRating || 0), 0) / totalResolved).toFixed(1)
    : 0;

  // Statistics by type
  const stats = {
    total: totalResolved,
    regular: filteredComplaints.filter(c => c.type === 'regular').length,
    regarding: filteredComplaints.filter(c => c.type === 'regarding').length,
    high: filteredComplaints.filter(c => c.priority === 'high').length,
    medium: filteredComplaints.filter(c => c.priority === 'medium').length,
    low: filteredComplaints.filter(c => c.priority === 'low').length,
    avgResolution: avgResolutionDays,
    avgSatisfaction: avgSatisfaction
  };

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
    showToast(language === 'np' ? 'डाटा रिफ्रेस गरियो' : 'Data refreshed', 'info');
  };

  const generateReport = () => {
    showToast(language === 'np' ? 'रिपोर्ट तयार भइरहेको छ...' : 'Report is being generated...', 'info');
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
                <h1>{t.resolvedComplaints}</h1>
                <p>{t.manageResolved}</p>
              </div>
              <div className="header-buttons">
                <button className="refresh-btn" onClick={refreshData}>
                  🔄 {t.refresh}
                </button>
                <button className="report-btn" onClick={generateReport}>
                  📊 {t.generateReport}
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon green">✅</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">{t.totalResolved}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">⏱️</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.avgResolution} {language === 'np' ? 'दिन' : 'days'}</div>
                  <div className="stat-label">{t.avgResolutionTime}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">⭐</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.avgSatisfaction}/5</div>
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
                    <th>{t.subject}</th>
                    <th>{t.date}</th>
                    <th>{t.resolvedDate}</th>
                    <th>{t.resolutionTime}</th>
                    <th>{t.priority}</th>
                    <th>{t.complaintType}</th>
                    <th>{t.satisfaction}</th>
                    <th>{t.actions}</th>
                </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.length > 0 ? (
                    paginatedComplaints.map((complaint, idx) => (
                      <tr key={`${complaint.type}-${complaint.id}-${idx}`}>
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
                        <td>{getResolvedDate(complaint)}</td>
                        <td>{getResolutionTime(complaint)}</td>
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
                      <td colSpan="11">
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

      {/* Complaint Details Modal */}
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
                  <p>{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
                </div>
              </div>

              <div className="detail-section">
                <h4>📊 {t.resolution}</h4>
                <div className="detail-row full-width">
                  <p className="feedback-text">"{getFeedback(selectedComplaint)}"</p>
                </div>
              </div>

              <div className="detail-section">
                <h4>📅 {t.dateInfo}</h4>
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
              </div>

              <div className="detail-section">
                <h4>⭐ {t.satisfactionRating}</h4>
                <div className="detail-row">
                  <label>{t.satisfactionRating}:</label>
                  <div className="satisfaction-display">
                    <div className="stars-large">{renderStars(selectedComplaint.satisfactionRating)}</div>
                    <span className={`satisfaction-text ${getSatisfactionClass(selectedComplaint.satisfactionRating)}`}>
                      {getSatisfactionText(selectedComplaint.satisfactionRating)} ({selectedComplaint.satisfactionRating}/5)
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>📞 {t.channel}</h4>
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

        .admin-resolved-complaints {
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
          margin-top: 200px;
          position: relative;
        }

        .sidebar-container {
          position: fixed;
        
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

        .header-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          color: #475569;
          transition: all 0.2s;
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
          transition: all 0.2s;
        }

        .report-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139,92,246,0.3);
        }

        /* Statistics Cards */
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
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

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
          min-width: 1100px;
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

        .satisfaction-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star { font-size: 0.8rem; }
        .star-filled { color: #f59e0b; }
        .star-empty { color: #d1d5db; }

        .satisfaction-text {
          font-size: 0.65rem;
          font-weight: 500;
        }

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
          transition: all 0.2s;
        }

        .view-btn:hover { background: #e2e8f0; }

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
          transition: all 0.2s;
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

        .modal-close:hover { color: #475569; }

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

        .satisfaction-display {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stars-large {
          display: flex;
          gap: 4px;
        }

        .stars-large .star {
          font-size: 1.2rem;
        }

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
          display: flex;
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
          transition: all 0.2s;
        }

        .btn-close:hover { background: #e2e8f0; }

        /* Responsive */
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
          .stats-row {
            grid-template-columns: 1fr;
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
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .header-buttons {
            width: 100%;
          }
          .detail-row {
            flex-direction: column;
          }
          .detail-row label {
            width: 100%;
            margin-bottom: 4px;
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

export default AdminComplaintsResolved;