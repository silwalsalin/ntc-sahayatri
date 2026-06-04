// src/pages/StaffComplaintsResolved.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffComplaintsResolved = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [staffData, setStaffData] = useState({
    name: 'Ram Bahadur',
    role: 'Technical Support',
    email: 'ram@ntc.gov.np',
    phone: '9841234567',
    department: 'Customer Support'
  });

  const [complaints, setComplaints] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolvedThisMonth: 0,
    avgResolutionTime: 0
  });

  // Fetch resolved complaints
  const fetchResolvedComplaints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/complaints/resolved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const transformedComplaints = response.data.data.map(complaint => transformComplaintData(complaint));
        setComplaints(transformedComplaints);
        calculateStats(transformedComplaints);
        setBackendStatus('connected');
      } else {
        setComplaints(getSampleResolvedComplaints());
        calculateStats(getSampleResolvedComplaints());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching resolved complaints:', error);
      setComplaints(getSampleResolvedComplaints());
      calculateStats(getSampleResolvedComplaints());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (complaintsData) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const stats = {
      total: complaintsData.length,
      high: complaintsData.filter(c => c.priority === 'high').length,
      medium: complaintsData.filter(c => c.priority === 'medium').length,
      low: complaintsData.filter(c => c.priority === 'low').length,
      resolvedThisMonth: complaintsData.filter(c => {
        if (!c.resolvedDateObj) return false;
        return c.resolvedDateObj.getMonth() === currentMonth && 
               c.resolvedDateObj.getFullYear() === currentYear;
      }).length,
      avgResolutionTime: complaintsData.length > 0 
        ? Math.round(complaintsData.reduce((acc, c) => acc + c.resolutionTime, 0) / complaintsData.length) 
        : 0
    };
    setStats(stats);
  };

  // Transform complaint data
  const transformComplaintData = (complaint) => {
    const submittedDate = complaint.submittedDate ? new Date(complaint.submittedDate) : null;
    const resolvedDate = complaint.resolvedDate ? new Date(complaint.resolvedDate) : null;
    const resolutionTime = submittedDate && resolvedDate 
      ? Math.ceil((resolvedDate - submittedDate) / (1000 * 60 * 60 * 24))
      : complaint.resolutionTime || Math.floor(Math.random() * 15) + 1;
    
    return {
      id: complaint.id,
      ticketId: complaint.complaintNumber || `NTC-${complaint.id}`,
      name: complaint.name || 'N/A',
      enName: complaint.nameEn || complaint.name || 'N/A',
      email: complaint.email || 'N/A',
      phone: complaint.phone || 'N/A',
      category: complaint.category || 'general',
      category_np: complaint.categoryNp || getCategoryNepali(complaint.category),
      category_en: complaint.category || 'General',
      subCategory: complaint.subject || 'general',
      description: complaint.complaint || complaint.description || 'N/A',
      enDescription: complaint.complaintEn || complaint.complaint || complaint.description || 'N/A',
      status: mapStatus(complaint.status),
      date: complaint.date || formatNepaliDate(complaint.submittedDate),
      enDate: complaint.enDate || formatEnglishDate(complaint.submittedDate),
      resolvedDate: complaint.resolvedDate ? formatNepaliDate(complaint.resolvedDate) : formatNepaliDate(new Date()),
      enResolvedDate: complaint.resolvedDate ? formatEnglishDate(complaint.resolvedDate) : formatEnglishDate(new Date()),
      channel: complaint.channel || 'वेबसाइट पोर्टल',
      enChannel: complaint.enChannel || 'Website Portal',
      priority: mapPriority(complaint.priority),
      assignedTo: complaint.assignedTo || 'Not Assigned',
      enAssignedTo: complaint.enAssignedTo || 'Not Assigned',
      assignedBy: complaint.assignedBy || 'System',
      resolution: complaint.resolution || 'गुनासो समाधान गरियो।',
      enResolution: complaint.enResolution || 'Complaint has been resolved.',
      actionTaken: complaint.actionTaken || 'आवश्यक कार्य गरियो।',
      enActionTaken: complaint.enActionTaken || 'Required action was taken.',
      submittedDate: complaint.submittedDate,
      resolvedDateObj: resolvedDate,
      resolutionTime: resolutionTime,
      satisfaction: complaint.satisfaction || null,
      feedback: complaint.feedback || null
    };
  };

  const getCategoryNepali = (category) => {
    const categories = {
      'internet': 'इन्टरनेट',
      'recharge': 'रिचार्ज',
      'activation': 'सक्रियता',
      'billing': 'बिलिङ',
      'general': 'सामान्य'
    };
    return categories[category] || 'सामान्य';
  };

  const mapStatus = (status) => {
    if (!status) return 'resolved';
    const statusMap = {
      'Resolved': 'resolved',
      'resolved': 'resolved',
      'Closed': 'resolved',
      'closed': 'resolved'
    };
    return statusMap[status] || 'resolved';
  };

  const mapPriority = (priority) => {
    if (!priority) return 'medium';
    const priorityMap = {
      'High': 'high',
      'high': 'high',
      'Urgent': 'high',
      'Medium': 'medium',
      'medium': 'medium',
      'Low': 'low',
      'low': 'low'
    };
    return priorityMap[priority] || 'medium';
  };

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

  // Get sample resolved complaints
  const getSampleResolvedComplaints = () => {
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
        subCategory: 'not-credited',
        description: 'रु. ५०० रिचार्ज गरे पनि ब्यालेन्स अपडेट भएन।',
        enDescription: 'Recharged Rs. 500 but balance not updated.',
        status: 'resolved',
        date: '२०८०-०१-२०',
        enDate: '2024-01-20',
        resolvedDate: '२०८०-०१-२२',
        enResolvedDate: '2024-01-22',
        channel: 'व्हाट्सएप',
        enChannel: 'WhatsApp',
        priority: 'medium',
        assignedTo: 'Billing Team',
        enAssignedTo: 'Billing Team',
        assignedBy: 'Admin',
        resolution: 'रिचार्ज सफलतापूर्वक क्रेडिट गरियो। ग्राहकको ब्यालेन्स अपडेट गरियो।',
        enResolution: 'Recharge successfully credited. Customer balance updated.',
        actionTaken: 'रिचार्ज जाँच गरी ब्यालेन्स समायोजन गरियो।',
        submittedDate: '2024-01-20',
        resolvedDateObj: new Date('2024-01-22'),
        resolutionTime: 2
      },
      { 
        id: 2, 
        ticketId: 'NTC-2024-004', 
        name: 'विनोद न्यौपाने', 
        enName: 'Binod Neupane',
        email: 'binod@example.com',
        phone: '9812345680',
        category: 'billing',
        category_np: 'बिलिङ',
        category_en: 'Billing',
        subCategory: 'wrong-charge',
        description: 'गत महिनाको बिलमा गलत चार्ज देखाइएको छ।',
        enDescription: 'Wrong charge shown in last month\'s bill.',
        status: 'resolved',
        date: '२०८०-०२-१०',
        enDate: '2024-02-10',
        resolvedDate: '२०८०-०२-१५',
        enResolvedDate: '2024-02-15',
        channel: 'इमेल',
        enChannel: 'Email',
        priority: 'medium',
        assignedTo: 'Billing Team',
        enAssignedTo: 'Billing Team',
        assignedBy: 'Admin',
        resolution: 'बिल जाँच गरी गलत चार्ज हटाइयो। सही बिल जारी गरियो।',
        enResolution: 'Bill reviewed and wrong charge removed. Correct bill issued.',
        actionTaken: 'बिल समायोजन गरियो र ग्राहकलाई सूचित गरियो।',
        submittedDate: '2024-02-10',
        resolvedDateObj: new Date('2024-02-15'),
        resolutionTime: 5
      },
      { 
        id: 3, 
        ticketId: 'NTC-2024-006', 
        name: 'मनिषा पोखरेल', 
        enName: 'Manisha Pokhrel',
        email: 'manisha@example.com',
        phone: '9812345692',
        category: 'internet',
        category_np: 'इन्टरनेट',
        category_en: 'Internet',
        subCategory: 'connection',
        description: 'इन्टरनेट जडान १ दिनदेखि बन्द छ।',
        enDescription: 'Internet connection down for 1 day.',
        status: 'resolved',
        date: '२०८०-०२-२५',
        enDate: '2024-02-25',
        resolvedDate: '२०८०-०२-२६',
        enResolvedDate: '2024-02-26',
        channel: 'फोन',
        enChannel: 'Phone',
        priority: 'high',
        assignedTo: 'Technical Team',
        enAssignedTo: 'Technical Team',
        assignedBy: 'Admin',
        resolution: 'लाइन जाँच गरी फाइबर केबल मर्मत गरियो। इन्टरनेट सेवा पुनर्स्थापित गरियो।',
        enResolution: 'Line checked and fiber cable repaired. Internet service restored.',
        actionTaken: 'प्राविधिक टोलीले केबल मर्मत गर्यो।',
        submittedDate: '2024-02-25',
        resolvedDateObj: new Date('2024-02-26'),
        resolutionTime: 1
      },
      { 
        id: 4, 
        ticketId: 'NTC-2024-009', 
        name: 'कृष्णा श्रेष्ठ', 
        enName: 'Krishna Shrestha',
        email: 'krishna@example.com',
        phone: '9841234595',
        category: 'activation',
        category_np: 'सक्रियता',
        category_en: 'Activation',
        subCategory: 'sim-activation',
        description: 'नयाँ सिम सक्रिय नभएको।',
        enDescription: 'New SIM not activated.',
        status: 'resolved',
        date: '२०८०-०३-०१',
        enDate: '2024-03-01',
        resolvedDate: '२०८०-०३-०२',
        enResolvedDate: '2024-03-02',
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'high',
        assignedTo: 'Ram Bahadur',
        enAssignedTo: 'Technical Support',
        assignedBy: 'Admin',
        resolution: 'सिम कार्यान्वयन गरियो र सफलतापूर्वक सक्रिय गरियो।',
        enResolution: 'SIM processed and activated successfully.',
        actionTaken: 'सिम सक्रियता प्रक्रिया पूरा गरियो।',
        submittedDate: '2024-03-01',
        resolvedDateObj: new Date('2024-03-02'),
        resolutionTime: 1
      }
    ];
  };

  // Filter complaints based on date
  const filterByDate = (complaint, filter) => {
    if (filter === 'all') return true;
    if (!complaint.resolvedDateObj) return false;
    
    const now = new Date();
    const resolved = complaint.resolvedDateObj;
    
    switch(filter) {
      case 'today':
        return resolved.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return resolved >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return resolved >= monthAgo;
      case 'year':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        return resolved >= yearAgo;
      default:
        return true;
    }
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchResolvedComplaints();
    }
  }, [navigate]);

  const content = {
    np: {
      pageTitle: 'समाधान गरिएका गुनासोहरू',
      resolvedComplaints: 'समाधान गरिएका गुनासोहरू',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByDate: 'मिति अनुसार फिल्टर',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      resolvedDate: 'समाधान मिति',
      resolutionTime: 'समाधान समय',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      resolution: 'समाधान विवरण',
      actionTaken: 'गरिएको कार्य',
      channel: 'च्यानल',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      assignedTo: 'तोकिएको व्यक्ति',
      assignedBy: 'तोक्ने व्यक्ति',
      address: 'ठेगाना',
      landmark: 'सन्दर्भ स्थल',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      today: 'आज',
      week: 'यो हप्ता',
      month: 'यो महिना',
      year: 'यो वर्ष',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noComplaintsFound: 'कुनै समाधान गरिएका गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalResolved: 'कुल समाधान',
      highPriority: 'उच्च प्राथमिकता',
      mediumPriority: 'मध्यम प्राथमिकता',
      lowPriority: 'न्यून प्राथमिकता',
      resolvedThisMonth: 'यो महिना समाधान',
      avgResolutionTime: 'औसत समाधान समय',
      days: 'दिन',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड'
    },
    en: {
      pageTitle: 'Resolved Complaints',
      resolvedComplaints: 'Resolved Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByPriority: 'Filter by Priority',
      filterByDate: 'Filter by Date',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      resolvedDate: 'Resolved Date',
      resolutionTime: 'Resolution Time',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      resolution: 'Resolution Details',
      actionTaken: 'Action Taken',
      channel: 'Channel',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      assignedTo: 'Assigned To',
      assignedBy: 'Assigned By',
      address: 'Address',
      landmark: 'Landmark',
      close: 'Close',
      all: 'All',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noComplaintsFound: 'No resolved complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalResolved: 'Total Resolved',
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      resolvedThisMonth: 'Resolved This Month',
      avgResolutionTime: 'Avg Resolution Time',
      days: 'days',
      loading: 'Loading...',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard'
    }
  };

  const t = content[language];

  const getPriorityClass = (priority) => {
    const classes = { 
      high: 'priority-high', 
      medium: 'priority-medium', 
      low: 'priority-low' 
    };
    return classes[priority] || 'priority-medium';
  };

  const getPriorityText = (priority) => {
    if (language === 'np') {
      const priorityTexts = {
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'न्यून'
      };
      return priorityTexts[priority] || priority;
    } else {
      const priorityTexts = {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
      };
      return priorityTexts[priority] || priority;
    }
  };

  const getCategoryText = (complaint) => {
    return language === 'np' ? complaint.category_np : complaint.category_en;
  };

  const getResolvedDate = (complaint) => {
    return language === 'np' ? complaint.resolvedDate : complaint.enResolvedDate;
  };

  const getChannel = (complaint) => {
    return language === 'np' ? complaint.channel : complaint.enChannel;
  };

  const getAssignedTo = (complaint) => {
    return language === 'np' ? complaint.assignedTo : complaint.enAssignedTo;
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.phone.includes(searchTerm);
    
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const dateMatch = filterByDate(complaint, dateFilter);
    
    return searchMatch && priorityMatch && dateMatch;
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

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
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
    <div className="staff-complaints-resolved">
      <StaffHeader 
        language={language}
        setLanguage={setLanguage}
        staffName={staffData.name}
        staffRole={staffData.role}
        onLogout={handleLogout}
      />
      
      <div className="dashboard-layout">
        <StaffSidebar 
          language={language}
          staffName={staffData.name}
          staffRole={staffData.role}
          onLogout={handleLogout}
        />
        
        <div className="main-content">
          <div className="content-wrapper">
            {/* Backend Status Banner */}
            {backendStatus === 'disconnected' && (
              <div className="backend-warning">
                ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।' : 'Backend server not connected. Showing sample data.'}
              </div>
            )}

            {/* Welcome Section */}
            <div className="welcome-section">
              <div>
                <h1 className="welcome-title">{t.resolvedComplaints}</h1>
                <p className="welcome-subtitle">{t.pageTitle}</p>
              </div>
              <button className="refresh-btn" onClick={fetchResolvedComplaints}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-box-icon green">✅</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.total}</div>
                  <div className="stat-box-label">{t.totalResolved}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon red">🔴</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.high}</div>
                  <div className="stat-box-label">{t.highPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon yellow">🟡</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.medium}</div>
                  <div className="stat-box-label">{t.mediumPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon green-light">🟢</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.low}</div>
                  <div className="stat-box-label">{t.lowPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon blue">📅</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.resolvedThisMonth}</div>
                  <div className="stat-box-label">{t.resolvedThisMonth}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon purple">⏱️</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.avgResolutionTime} {t.days}</div>
                  <div className="stat-box-label">{t.avgResolutionTime}</div>
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
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="today">{t.today}</option>
                  <option value="week">{t.week}</option>
                  <option value="month">{t.month}</option>
                  <option value="year">{t.year}</option>
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
                    <th>{t.resolvedDate}</th>
                    <th>{t.resolutionTime}</th>
                    <th>{t.priority}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.length > 0 ? (
                    paginatedComplaints.map((complaint) => (
                      <tr key={complaint.id}>
                        <td className="ticket-id">{complaint.ticketId}</td>
                        <td>{language === 'np' ? complaint.name : complaint.enName}</td>
                        <td>{getCategoryText(complaint)}</td>
                        <td>{getResolvedDate(complaint)}</td>
                        <td>
                          <span className="resolution-time-badge">
                            {complaint.resolutionTime} {t.days}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                            {getPriorityText(complaint.priority)}
                          </span>
                        </td>
                        <td>
                          <button className="view-btn" onClick={() => openModal(complaint)}>
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
                <span>{getCategoryText(selectedComplaint)}</span>
              </div>
              <div className="detail-row">
                <label>{t.priority}:</label>
                <span className={`priority-badge ${getPriorityClass(selectedComplaint.priority)}`}>
                  {getPriorityText(selectedComplaint.priority)}
                </span>
              </div>
              <div className="detail-row">
                <label>{t.registeredDate}:</label>
                <span>{language === 'np' ? selectedComplaint.date : selectedComplaint.enDate}</span>
              </div>
              <div className="detail-row">
                <label>{t.resolvedDate}:</label>
                <span>{getResolvedDate(selectedComplaint)}</span>
              </div>
              <div className="detail-row">
                <label>{t.resolutionTime}:</label>
                <span className="resolution-time-badge">{selectedComplaint.resolutionTime} {t.days}</span>
              </div>
              <div className="detail-row">
                <label>{t.channel}:</label>
                <span>{getChannel(selectedComplaint)}</span>
              </div>
              <div className="detail-row">
                <label>{t.assignedTo}:</label>
                <span>{getAssignedTo(selectedComplaint)}</span>
              </div>
              {selectedComplaint.assignedBy && (
                <div className="detail-row">
                  <label>{t.assignedBy}:</label>
                  <span>{selectedComplaint.assignedBy}</span>
                </div>
              )}
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
              <div className="detail-row full-width">
                <label>{t.description}:</label>
                <p>{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
              </div>
              <div className="detail-row full-width">
                <label>{t.resolution}:</label>
                <p className="resolution-text">{language === 'np' ? selectedComplaint.resolution : selectedComplaint.enResolution}</p>
              </div>
              <div className="detail-row full-width">
                <label>{t.actionTaken}:</label>
                <p className="action-text">{language === 'np' ? selectedComplaint.actionTaken : selectedComplaint.enActionTaken}</p>
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

        .staff-complaints-resolved {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          height: 100vh;
          width: 100%;
          overflow: hidden;
          position: relative;
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
          border-top-color: #0288d1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dashboard-layout {
          display: flex;
          height: calc(100vh - 195px);
          margin-top: 195px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
       
          width: calc(100% - 260px);
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        .main-content::-webkit-scrollbar {
          width: 8px;
        }

        .main-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .main-content::-webkit-scrollbar-thumb {
          background: #0288d1;
          border-radius: 10px;
        }

        .main-content::-webkit-scrollbar-thumb:hover {
          background: #0277bd;
        }

        .content-wrapper {
          padding: 24px 32px;
          min-height: 100%;
        }

        .backend-warning {
          background: #ff9800;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }

        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .welcome-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .welcome-subtitle {
          color: #64748b;
          font-size: 0.85rem;
        }

        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #0288d1;
          color: #0288d1;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
        }

        .stat-box-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
        }

        .stat-box-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-box-icon.green-light { background: #e8f5e9; color: #4caf50; }
        .stat-box-icon.red { background: #fee2e2; color: #dc2626; }
        .stat-box-icon.yellow { background: #fef3c7; color: #d97706; }
        .stat-box-icon.blue { background: #e3f2fd; color: #1565c0; }
        .stat-box-icon.purple { background: #f3e5f5; color: #7b1fa2; }

        .stat-box-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-box-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 2px;
        }

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

        .search-box {
          flex: 1;
          position: relative;
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
          border-color: #0288d1;
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

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

        .complaints-table {
          width: 100%;
          border-collapse: collapse;
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
          color: #0288d1;
        }

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

        .resolution-time-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #e3f2fd;
          color: #1565c0;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .view-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
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
          border-color: #0288d1;
          color: #0288d1;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

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

        .modal-body {
          padding: 24px;
        }

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
        }

        .detail-row span, .detail-row p {
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

        .resolution-text, .action-text {
          line-height: 1.6;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
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
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          background: #e2e8f0;
          color: #475569;
        }

        @media (max-width: 1400px) {
          .stats-row {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 992px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .main-content {
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
          
          .detail-row {
            flex-direction: column;
          }
          
          .detail-row label {
            width: 100%;
            margin-bottom: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffComplaintsResolved;