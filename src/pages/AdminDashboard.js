// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    satisfactionRate: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [0, 0, 0, 0, 0, 0]
  });
  const [backendStatus, setBackendStatus] = useState('checking');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch data from backend
  const fetchData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setBackendStatus('disconnected');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch complaints
      const complaintsResponse = await axios.get(`${API_URL}/complaints`, { headers });
      const regardingResponse = await axios.get(`${API_URL}/complaint-regarding`, { headers });

      // Fetch users
      const usersResponse = await axios.get(`${API_URL}/admin/users`, {
        headers,
        params: { page: 1, limit: 1000 }
      });

      let complaintsData = [];
      let regardingData = [];
      let usersData = [];

      if (complaintsResponse.data.success && Array.isArray(complaintsResponse.data.data)) {
        complaintsData = complaintsResponse.data.data;
      }

      if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
        regardingData = regardingResponse.data.data;
      }

      if (usersResponse.data.success && Array.isArray(usersResponse.data.data)) {
        usersData = usersResponse.data.data;
      }

      // Combine all complaints
      const allComplaints = [...complaintsData, ...regardingData];

      // Calculate statistics
      const calculatedStats = calculateStats(allComplaints, usersData);
      setStats(calculatedStats);

      // Get recent complaints
      const recent = getRecentComplaints(allComplaints, usersData);
      setRecentComplaints(recent);

      // Calculate monthly trend
      const trend = calculateMonthlyTrend(allComplaints);
      setChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: trend
      });

      setBackendStatus('connected');
    } catch (error) {
      console.error('Error fetching data:', error);
      setBackendStatus('disconnected');
      showToast('Failed to fetch data from server', 'error');
      // Set sample data as fallback
      setStats(getSampleStats());
      setRecentComplaints(getSampleComplaints());
      setChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [65, 78, 82, 74, 88, 92]
      });
    }
  };

  // Calculate statistics
  const calculateStats = (complaints, users) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => 
      c.status === 'pending' || c.status === 'Pending'
    ).length;
    const inProgressComplaints = complaints.filter(c => 
      c.status === 'in-progress' || c.status === 'In Progress' || c.status === 'inprogress'
    ).length;
    const resolvedComplaints = complaints.filter(c => 
      c.status === 'resolved' || c.status === 'Resolved' || c.status === 'Closed'
    ).length;

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const newUsersToday = users.filter(u => {
      const created = new Date(u.createdAt || u.created_at);
      return created >= today;
    }).length;

    const satisfactionRate = totalComplaints > 0 
      ? Math.round((resolvedComplaints / totalComplaints) * 100)
      : 0;

    return {
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      totalUsers,
      newUsersToday,
      activeUsers,
      satisfactionRate
    };
  };

  // Get recent complaints
  const getRecentComplaints = (complaints, users) => {
    const sorted = [...complaints].sort((a, b) => 
      new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
    );

    return sorted.slice(0, 5).map(complaint => {
      const user = users.find(u => u.id === (complaint.userId || complaint.user_id));
      const createdDate = new Date(complaint.created_at || complaint.createdAt);
      
      return {
        id: complaint.id,
        ticketId: complaint.complaint_number || `NTC-${complaint.id}`,
        name: complaint.name || user?.name || 'N/A',
        enName: complaint.name_en || user?.name_en || complaint.name || 'N/A',
        category: complaint.nature_of_complaint || complaint.complaint_type || 'general',
        enCategory: complaint.nature_of_complaint || complaint.complaint_type || 'General',
        status: mapStatus(complaint.status),
        date: formatDate(createdDate),
        priority: mapPriority(complaint.priority),
        phone: complaint.phone || user?.phone || 'N/A',
        email: complaint.email || user?.email || 'N/A',
        description: complaint.description || 'N/A',
        enDescription: complaint.description || 'N/A',
        channel: complaint.preferred_contact || 'Website',
        enChannel: complaint.preferred_contact || 'Website',
        assignedTo: complaint.assigned_to || 'Not Assigned',
        assignedToName: complaint.assigned_to_name || complaint.assigned_to || 'Not Assigned',
        resolvedDate: complaint.resolved_at ? formatDate(complaint.resolved_at) : null,
        enResolvedDate: complaint.resolved_at ? formatDate(complaint.resolved_at) : null,
        referenceNumber: complaint.reference_number || null,
        landmark: complaint.landmark || null,
        address: complaint.address || null,
        type: complaint.complaint_type || 'regular'
      };
    });
  };

  // Map status
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
      'Rejected': 'rejected',
      'rejected': 'rejected'
    };
    return statusMap[status] || 'pending';
  };

  // Map priority
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

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '-';
    }
  };

  // Calculate monthly trend
  const calculateMonthlyTrend = (complaints) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const months = [0, 0, 0, 0, 0, 0];
    
    for (let i = 0; i < 6; i++) {
      const month = (now.getMonth() - i + 12) % 12;
      const year = now.getMonth() - i < 0 ? currentYear - 1 : currentYear;
      
      const count = complaints.filter(c => {
        const created = new Date(c.created_at || c.createdAt);
        return created.getMonth() === month && created.getFullYear() === year;
      }).length;
      
      months[5 - i] = count;
    }
    
    return months;
  };

  // Get sample data as fallback
  const getSampleStats = () => ({
    totalComplaints: 1247,
    pendingComplaints: 342,
    inProgressComplaints: 156,
    resolvedComplaints: 749,
    totalUsers: 8956,
    newUsersToday: 23,
    activeUsers: 1234,
    satisfactionRate: 78.5
  });

  const getSampleComplaints = () => [
    { id: 1, ticketId: 'NTC-2024-001', name: 'रमेश केसी', enName: 'Ramesh KC', category: 'इन्टरनेट', enCategory: 'Internet', status: 'pending', date: '2024-01-15', priority: 'high', phone: '9841234567', email: 'ram@example.com', description: 'इन्टरनेट सेवा नचलेको समस्या', enDescription: 'Internet service not working', channel: 'Website', enChannel: 'Website', assignedTo: 'Not Assigned', assignedToName: 'Not Assigned', type: 'regular' },
    { id: 2, ticketId: 'NTC-2024-002', name: 'सीता शर्मा', enName: 'Sita Sharma', category: 'रिचार्ज', enCategory: 'Recharge', status: 'in-progress', date: '2024-01-14', priority: 'medium', phone: '9812345678', email: 'sita@example.com', description: 'रिचार्ज नभएको समस्या', enDescription: 'Recharge not completed', channel: 'Phone', enChannel: 'Phone', assignedTo: 'Staff', assignedToName: 'Staff', type: 'regarding' }
  ];

  // Open complaint details modal
  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Close complaint details modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    document.body.style.overflow = 'unset';
  };

  // Check authentication and fetch data
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [navigate]);

  const content = {
    np: {
      welcomeBack: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      totalComplaints: 'कुल गुनासो',
      pendingComplaints: 'विचाराधीन',
      inProgressComplaints: 'प्रगतिमा',
      resolvedComplaints: 'समाधान',
      totalUsers: 'कुल प्रयोगकर्ता',
      newUsersToday: 'आजका नयाँ',
      activeUsers: 'सक्रिय प्रयोगकर्ता',
      satisfactionRate: 'सन्तुष्टि दर',
      recentComplaints: 'हालैका गुनासोहरू',
      viewAll: 'सबै हेर्नुहोस्',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      status: 'स्थिति',
      date: 'मिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण',
      monthlyTrend: 'मासिक प्रवृत्ति',
      backendNotConnected: 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।',
      refresh: 'रिफ्रेस',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      resolvedDate: 'समाधान मिति',
      assignedTo: 'तोकिएको टोली',
      close: 'बन्द गर्नुहोस्',
      channel: 'च्यानल',
      complaintInfo: 'गुनासो जानकारी',
      complainantInfo: 'उजुरीकर्ताको जानकारी',
      statusInfo: 'स्थिति जानकारी',
      referenceNo: 'सन्दर्भ नम्बर',
      landmark: 'नजिकैको चिन्ह',
      address: 'ठेगाना',
      complaintType: 'गुनासो प्रकार'
    },
    en: {
      welcomeBack: 'Welcome Back',
      dashboard: 'Dashboard',
      totalComplaints: 'Total Complaints',
      pendingComplaints: 'Pending',
      inProgressComplaints: 'In Progress',
      resolvedComplaints: 'Resolved',
      totalUsers: 'Total Users',
      newUsersToday: 'New Today',
      activeUsers: 'Active Users',
      satisfactionRate: 'Satisfaction',
      recentComplaints: 'Recent Complaints',
      viewAll: 'View All',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      status: 'Status',
      date: 'Date',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View',
      monthlyTrend: 'Monthly Trend',
      backendNotConnected: 'Backend server not connected. Showing sample data.',
      refresh: 'Refresh',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      resolvedDate: 'Resolved Date',
      assignedTo: 'Assigned To',
      close: 'Close',
      channel: 'Channel',
      complaintInfo: 'Complaint Information',
      complainantInfo: 'Complainant Information',
      statusInfo: 'Status Information',
      referenceNo: 'Reference Number',
      landmark: 'Landmark',
      address: 'Address',
      complaintType: 'Complaint Type'
    }
  };

  const t = content[language];

  const getStatusClass = (status) => {
    const classes = { pending: 'status-pending', 'in-progress': 'status-progress', resolved: 'status-resolved', review: 'status-review', rejected: 'status-rejected' };
    return classes[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    const texts = {
      np: { pending: 'विचाराधीन', 'in-progress': 'प्रगतिमा', resolved: 'समाधान', review: 'समीक्षामा', rejected: 'अस्वीकृत' },
      en: { pending: 'Pending', 'in-progress': 'In Progress', resolved: 'Resolved', review: 'Under Review', rejected: 'Rejected' }
    };
    return texts[language][status] || status;
  };

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

  const getCategoryText = (category, enCategory) => {
    if (language === 'np') {
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
      return categories[category] || category || 'सामान्य';
    }
    return enCategory || category || 'General';
  };

  const getComplaintTypeText = (type) => {
    if (language === 'np') {
      return type === 'regular' ? 'साधारण' : 'सम्बन्धी';
    }
    return type === 'regular' ? 'Regular' : 'Regarding';
  };

  const handleRefresh = () => {
    fetchData();
    showToast(language === 'np' ? 'डाटा रिफ्रेस गरियो' : 'Data refreshed', 'info');
  };

  return (
    <div className="admin-dashboard">
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

      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      {backendStatus === 'disconnected' && (
        <div className="backend-warning">
          ⚠️ {t.backendNotConnected}
        </div>
      )}
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>{t.dashboard}</h1>
                <p>{t.welcomeBack}, Admin</p>
              </div>
              <div className="header-actions">
                <button className="refresh-btn" onClick={handleRefresh}>
                  🔄 {t.refresh}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-icon">📊</span>
                  <span className="stat-title">{t.totalComplaints}</span>
                </div>
                <div className="stat-value">{stats.totalComplaints.toLocaleString()}</div>
                <div className="stat-change positive">Total complaints</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-icon">⏳</span>
                  <span className="stat-title">{t.pendingComplaints}</span>
                </div>
                <div className="stat-value">{stats.pendingComplaints.toLocaleString()}</div>
                <div className="stat-change negative">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-icon">🔄</span>
                  <span className="stat-title">{t.inProgressComplaints}</span>
                </div>
                <div className="stat-value">{stats.inProgressComplaints.toLocaleString()}</div>
                <div className="stat-change positive">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-icon">✅</span>
                  <span className="stat-title">{t.resolvedComplaints}</span>
                </div>
                <div className="stat-value">{stats.resolvedComplaints.toLocaleString()}</div>
                <div className="stat-change positive">Resolved</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-icon">👥</span>
                  <span className="stat-title">{t.totalUsers}</span>
                </div>
                <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                <div className="stat-change positive">Total users</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-icon">✨</span>
                  <span className="stat-title">{t.newUsersToday}</span>
                </div>
                <div className="stat-value">+{stats.newUsersToday}</div>
                <div className="stat-change positive">New today</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-icon">🟢</span>
                  <span className="stat-title">{t.activeUsers}</span>
                </div>
                <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
                <div className="stat-change positive">Active users</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-title">{t.satisfactionRate}</span>
                </div>
                <div className="stat-value">{stats.satisfactionRate}%</div>
                <div className="stat-change positive">Satisfaction rate</div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="chart-card">
              <div className="card-title">
                <h3>{t.monthlyTrend}</h3>
              </div>
              <div className="chart-container">
                {chartData.datasets.map((value, idx) => (
                  <div key={idx} className="chart-item">
                    <div className="chart-label">{chartData.labels[idx]}</div>
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ 
                          height: `${(value / Math.max(...chartData.datasets, 1)) * 100}%`,
                          background: `linear-gradient(180deg, #3b82f6, #60a5fa)`
                        }}
                      >
                        <span className="chart-value">{value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Complaints Table */}
            <div className="table-card">
              <div className="card-title">
                <h3>{t.recentComplaints}</h3>
                <button className="view-link" onClick={() => navigate('/admin-complaints')}>
                  {t.viewAll} →
                </button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.ticketId}</th>
                      <th>{t.complainant}</th>
                      <th>{t.category}</th>
                      <th>{t.status}</th>
                      <th>{t.date}</th>
                      <th>{t.priority}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.length > 0 ? (
                      recentComplaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td className="ticket-id">{complaint.ticketId}</td>
                          <td>
                            <div>
                              <strong>{language === 'np' ? complaint.name : complaint.enName}</strong>
                              <br />
                              <small className="complaint-phone">{complaint.phone}</small>
                            </div>
                          </td>
                          <td>{getCategoryText(complaint.category, complaint.enCategory)}</td>
                          <td><span className={`badge ${getStatusClass(complaint.status)}`}>{getStatusText(complaint.status)}</span></td>
                          <td>{complaint.date}</td>
                          <td><span className={`badge-priority ${getPriorityClass(complaint.priority)}`}>{getPriorityText(complaint.priority)}</span></td>
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
                            <p>{language === 'np' ? 'कुनै गुनासो फेला परेन' : 'No complaints found'}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
                  <span className={`type-badge ${selectedComplaint.type === 'regular' ? 'type-regular' : 'type-regarding'}`}>
                    {getComplaintTypeText(selectedComplaint.type)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.category}:</label>
                  <span>{getCategoryText(selectedComplaint.category, selectedComplaint.enCategory)}</span>
                </div>
                {selectedComplaint.referenceNumber && (
                  <div className="detail-row">
                    <label>{t.referenceNo}:</label>
                    <span>{selectedComplaint.referenceNumber}</span>
                  </div>
                )}
                {selectedComplaint.landmark && (
                  <div className="detail-row">
                    <label>{t.landmark}:</label>
                    <span>{selectedComplaint.landmark}</span>
                  </div>
                )}
                {selectedComplaint.address && (
                  <div className="detail-row">
                    <label>{t.address}:</label>
                    <span>{selectedComplaint.address}</span>
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
                  <label>{t.status}:</label>
                  <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>
                    {getStatusText(selectedComplaint.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.priority}:</label>
                  <span className={`priority-badge ${getPriorityClass(selectedComplaint.priority)}`}>
                    {getPriorityText(selectedComplaint.priority)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.registeredDate}:</label>
                  <span>{selectedComplaint.date}</span>
                </div>
                {selectedComplaint.resolvedDate && (
                  <div className="detail-row">
                    <label>{t.resolvedDate}:</label>
                    <span>{selectedComplaint.resolvedDate}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>{t.channel}:</label>
                  <span>{language === 'np' ? selectedComplaint.channel : selectedComplaint.enChannel}</span>
                </div>
                <div className="detail-row">
                  <label>{t.assignedTo}:</label>
                  <span>{selectedComplaint.assignedToName}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeModal}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          background: #f8fafc;
          min-height: 100vh;
          overflow: hidden;
        }

        .toast-notification {
          position: fixed;
          top: 80px;
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
          max-width: 400px;
        }
        
        .toast-notification.success { border-left: 4px solid #10b981; background: #ecfdf5; }
        .toast-notification.error { border-left: 4px solid #ef4444; background: #fef2f2; }
        .toast-notification.info { border-left: 4px solid #3b82f6; background: #eff6ff; }
        
        .toast-icon { font-size: 1.2rem; flex-shrink: 0; }
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

        /* ===== LAYOUT - Same as AdminAnalytics ===== */
        .dashboard-layout {
          display: flex;
          height: calc(100vh - 195px);
          margin-top: 195px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        /* Sidebar Container - Fixed */
        .sidebar-container {
          position: fixed;
          top: 195px;
          left: 0;
          width: 260px;
          height: calc(100vh - 195px);
          background: white;
          border-right: 1px solid #e2e8f0;
          z-index: 100;
          overflow-y: auto;
        }

        /* Main Container - Scrollable */
        .main-container {
          flex: 1;
          margin-left: 260px;
          width: calc(100% - 260px);
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        .main-container::-webkit-scrollbar {
          width: 8px;
        }

        .main-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .main-container::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }

        .main-container::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        .content-wrapper {
          padding: 24px 32px;
          min-height: 100%;
        }

        /* ===== PAGE HEADER ===== */
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

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .refresh-btn {
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
          font-size: 0.85rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .refresh-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        /* ===== STATS CARDS ===== */
        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
          border-color: #cbd5e1;
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .stat-icon {
          font-size: 1.25rem;
        }

        .stat-title {
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .stat-change {
          font-size: 0.7rem;
          color: #64748b;
        }

        .stat-change.positive {
          color: #10b981;
        }

        .stat-change.negative {
          color: #ef4444;
        }

        /* ===== CHART CARD ===== */
        .chart-card, .table-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .card-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-title h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .view-link {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .view-link:hover {
          color: #2563eb;
        }

        /* ===== CHART ===== */
        .chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 260px;
          gap: 16px;
        }

        .chart-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .chart-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .chart-bar-container {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .chart-bar {
          width: 50px;
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: height 0.5s ease;
          cursor: pointer;
        }

        .chart-bar:hover {
          opacity: 0.8;
        }

        .chart-value {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }

        /* ===== TABLE ===== */
        .table-responsive {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }

        .data-table th,
        .data-table td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .data-table th {
          color: #64748b;
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .data-table td {
          color: #334155;
          font-size: 0.85rem;
        }

        .data-table tr:hover {
          background: #f8fafc;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #3b82f6;
        }

        .complaint-phone {
          color: #94a3b8;
        }

        .badge, .badge-priority {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .status-review { background: #e0e7ff; color: #4f46e5; }
        .status-rejected { background: #fee2e2; color: #dc2626; }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .type-regular { background: #dbeafe; color: #1e40af; }
        .type-regarding { background: #fef3c7; color: #92400e; }

        .view-btn {
          background: #f1f5f9;
          border: none;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #475569;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .view-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .no-data {
          text-align: center;
          padding: 40px !important;
        }

        .no-data-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .no-data-icon {
          font-size: 2.5rem;
        }

        /* ===== MODAL STYLES ===== */
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
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 650px;
          width: 100%;
          max-height: 90vh;
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
          gap: 4px;
        }

        .detail-row label {
          width: 140px;
          font-weight: 600;
          color: #0f172a;
          flex-shrink: 0;
        }

        .detail-row span {
          flex: 1;
          color: #334155;
          min-width: 0;
          word-break: break-word;
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
          flex-wrap: wrap;
        }

        .btn-close {
          background: #e2e8f0;
          color: #475569;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          font-size: 0.85rem;
        }

        .btn-close:hover {
          background: #cbd5e1;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1200px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            height: auto;
            overflow: auto;
          }
          
          .dashboard-layout {
            flex-direction: column;
            height: auto;
            margin-top: 150px;
            overflow: visible;
          }
          
          .sidebar-container {
            position: relative;
            top: 0;
            width: 100%;
            height: auto;
            margin-bottom: 20px;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .main-container {
            margin-left: 0;
            width: 100%;
            overflow-y: visible;
          }
          
          .content-wrapper {
            padding: 16px;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .stats-container {
            grid-template-columns: 1fr;
          }
          
          .chart-container {
            flex-direction: column;
            height: auto;
          }
          
          .chart-item {
            flex-direction: row;
            width: 100%;
            justify-content: space-between;
          }
          
          .chart-bar-container {
            width: 60%;
          }
          
          .chart-bar {
            width: 100%;
            height: 35px !important;
            border-radius: 8px;
          }
          
          .chart-value {
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
          }
          
          .data-table {
            min-width: 600px;
          }
          
          .modal-content {
            max-width: 95%;
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
          .stat-card {
            padding: 16px;
          }
          
          .stat-value {
            font-size: 1.6rem;
          }
          
          .header-actions {
            width: 100%;
          }
          
          .refresh-btn {
            flex: 1;
            justify-content: center;
          }
          
          .modal-footer {
            flex-direction: column;
          }
          
          .modal-footer button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;