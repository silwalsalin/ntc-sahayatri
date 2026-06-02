// src/pages/StaffComplaints.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const StaffComplaints = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  
  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Complaints data
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const user = localStorage.getItem('user');
    
    if (!token || userRole !== 'staff') {
      navigate('/login');
    } else {
      try {
        const userData = user ? JSON.parse(user) : {};
        setStaffName(userData.fullName || userData.name || 'Staff Member');
        setStaffEmail(userData.email || '');
        setStaffId(userData.id || '');
      } catch (e) {
        console.error('Error parsing user data:', e);
        setStaffName('Staff Member');
      }
      fetchComplaints();
    }
  }, [navigate]);

  // Fetch complaints assigned to staff
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let complaintsData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        complaintsData = response.data.data;
      } else {
        complaintsData = getSampleComplaints();
      }
      
      // Filter complaints assigned to this staff
      const assignedComplaints = complaintsData.filter(c => 
        c.assignedTo === staffEmail || c.assignedTo === staffId || c.assignedTo === 'staff'
      );
      
      // Process complaints
      const processedComplaints = assignedComplaints.map(c => ({
        id: c.id,
        ticketId: c.complaintNumber || `TCK-${c.id}`,
        name: c.name || 'N/A',
        nameEn: c.nameEn || c.name || 'N/A',
        email: c.email || 'N/A',
        phone: c.phone || 'N/A',
        category: c.category || 'General',
        categoryEn: c.categoryEn || c.category || 'General',
        subject: c.subject || c.natureOfComplaint || 'Complaint',
        description: c.description || c.complaint || '',
        status: (c.status || 'pending').toLowerCase(),
        priority: mapPriority(c.priority),
        submittedDate: c.submittedDate || c.createdAt,
        resolvedDate: c.resolvedDate || c.updatedAt,
        feedback: c.feedback || '',
        satisfactionRating: c.satisfactionRating || 0,
        resolution: c.resolution || '',
        assignedTo: c.assignedTo || ''
      }));
      
      setComplaints(processedComplaints);
      
      // Calculate stats
      const total = processedComplaints.length;
      const pending = processedComplaints.filter(c => c.status === 'pending').length;
      const inProgress = processedComplaints.filter(c => c.status === 'in-progress').length;
      const resolved = processedComplaints.filter(c => c.status === 'resolved').length;
      
      setStats({ total, pending, inProgress, resolved });
      setFilteredComplaints(processedComplaints);
      
    } catch (error) {
      console.error('Error fetching complaints:', error);
      const sampleData = getSampleComplaints();
      const processedSample = sampleData.map(c => ({
        id: c.id,
        ticketId: c.complaintNumber || `TCK-${c.id}`,
        name: c.name || 'N/A',
        nameEn: c.nameEn || c.name || 'N/A',
        email: c.email || 'N/A',
        phone: c.phone || 'N/A',
        category: c.category || 'General',
        categoryEn: c.categoryEn || c.category || 'General',
        subject: c.subject || c.natureOfComplaint || 'Complaint',
        description: c.description || c.complaint || '',
        status: (c.status || 'pending').toLowerCase(),
        priority: mapPriority(c.priority),
        submittedDate: c.submittedDate || c.createdAt,
        resolvedDate: c.resolvedDate || c.updatedAt,
        feedback: c.feedback || '',
        satisfactionRating: c.satisfactionRating || 0,
        resolution: c.resolution || '',
        assignedTo: c.assignedTo || ''
      }));
      setComplaints(processedSample);
      setStats({ 
        total: processedSample.length, 
        pending: processedSample.filter(c => c.status === 'pending').length, 
        inProgress: processedSample.filter(c => c.status === 'in-progress').length, 
        resolved: processedSample.filter(c => c.status === 'resolved').length 
      });
      setFilteredComplaints(processedSample);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...complaints];
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.ticketId.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.nameEn.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.subject.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => 
        c.category.toLowerCase() === categoryFilter.toLowerCase() ||
        c.categoryEn.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    setFilteredComplaints(filtered);
    setCurrentPage(1);
  };

  // Apply filters when dependencies change
  useEffect(() => {
    if (complaints.length > 0) {
      applyFilters();
    }
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, complaints]);

  // Helper functions
  const mapPriority = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high' || p === 'urgent') return 'high';
    if (p === 'medium') return 'medium';
    if (p === 'low') return 'low';
    return 'medium';
  };

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'status-pending';
    if (s === 'in-progress') return 'status-progress';
    if (s === 'resolved') return 'status-resolved';
    return 'status-pending';
  };

  const getStatusText = (status) => {
    const s = (status || '').toLowerCase();
    if (language === 'np') {
      if (s === 'pending') return 'विचाराधीन';
      if (s === 'in-progress') return 'प्रगतिमा';
      if (s === 'resolved') return 'समाधान';
    } else {
      if (s === 'pending') return 'Pending';
      if (s === 'in-progress') return 'In Progress';
      if (s === 'resolved') return 'Resolved';
    }
    return status || 'Pending';
  };

  const getPriorityClass = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return 'priority-high';
    if (p === 'medium') return 'priority-medium';
    if (p === 'low') return 'priority-low';
    return 'priority-medium';
  };

  const getPriorityText = (priority) => {
    const p = (priority || '').toLowerCase();
    if (language === 'np') {
      if (p === 'high') return 'उच्च';
      if (p === 'medium') return 'मध्यम';
      if (p === 'low') return 'न्यून';
    } else {
      if (p === 'high') return 'High';
      if (p === 'medium') return 'Medium';
      if (p === 'low') return 'Low';
    }
    return priority || 'Medium';
  };

  const getCategoryText = (category, categoryEn) => {
    return language === 'np' ? category : categoryEn;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      if (language === 'np') {
        const year = d.getFullYear() - 57;
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '-';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= numRating ? 'star-filled' : 'star-empty'}`}>
          {i <= numRating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  // Navigation handlers
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  };

  const handleWorkOnTask = (complaintId) => {
    navigate(`/staff-complaints/${complaintId}/work`);
  };

  // Get unique categories for filter
  const getUniqueCategories = () => {
    const categories = new Set();
    complaints.forEach(c => {
      if (c.category) categories.add(c.category);
      if (c.categoryEn) categories.add(c.categoryEn);
    });
    return Array.from(categories);
  };

  // Get sample complaints for fallback
  const getSampleComplaints = () => {
    return [
      { 
        id: 1, 
        complaintNumber: 'TCK-001', 
        name: 'राम बहादुर', 
        nameEn: 'Ram Bahadur', 
        email: 'ram@example.com', 
        phone: '9841000001', 
        category: 'Technical', 
        categoryEn: 'Technical', 
        subject: 'Internet Connection Issue', 
        complaint: 'Customer is facing slow internet speed and frequent disconnections.',
        status: 'pending', 
        priority: 'high', 
        submittedDate: new Date().toISOString(),
        assignedTo: 'staff'
      },
      { 
        id: 2, 
        complaintNumber: 'TCK-002', 
        name: 'सीता शर्मा', 
        nameEn: 'Sita Sharma', 
        email: 'sita@example.com', 
        phone: '9812345678', 
        category: 'Billing', 
        categoryEn: 'Billing', 
        subject: 'Recharge Not Updated', 
        complaint: 'Customer recharged Rs. 500 but balance not updated.',
        status: 'in-progress', 
        priority: 'medium', 
        submittedDate: new Date().toISOString(),
        assignedTo: 'staff'
      },
      { 
        id: 3, 
        complaintNumber: 'TCK-003', 
        name: 'हरि प्रसाद', 
        nameEn: 'Hari Prasad', 
        email: 'hari@example.com', 
        phone: '9823456789', 
        category: 'Activation', 
        categoryEn: 'Activation', 
        subject: 'SIM Activation Issue', 
        complaint: 'New SIM card not activating after 24 hours.',
        status: 'pending', 
        priority: 'high', 
        submittedDate: new Date().toISOString(),
        assignedTo: 'staff'
      }
    ];
  };

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Translations
  const translations = {
    np: {
      myAssignedComplaints: 'मेरा तोकिएका गुनासोहरू',
      manageComplaints: 'गुनासोहरू व्यवस्थापन गर्नुहोस्',
      searchPlaceholder: 'टिकेट नम्बर, नाम, इमेल वा विषयले खोज्नुहोस्...',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByCategory: 'प्रकार अनुसार फिल्टर',
      all: 'सबै',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      totalComplaints: 'जम्मा गुनासो',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      subject: 'विषय',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      date: 'मिति',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      workOnTask: 'कार्य गर्नुहोस्',
      complaintDetails: 'गुनासो विवरण',
      description: 'विवरण',
      email: 'इमेल',
      phone: 'फोन',
      submittedDate: 'पेश मिति',
      resolvedDate: 'समाधान मिति',
      feedback: 'प्रतिक्रिया',
      satisfactionRating: 'सन्तुष्टि मूल्यांकन',
      resolution: 'समाधान',
      close: 'बन्द गर्नुहोस्',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noData: 'कुनै गुनासो फेला परेन'
    },
    en: {
      myAssignedComplaints: 'My Assigned Complaints',
      manageComplaints: 'Manage Complaints',
      searchPlaceholder: 'Search by ticket number, name, email or subject...',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      filterByCategory: 'Filter by Category',
      all: 'All',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      totalComplaints: 'Total Complaints',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      subject: 'Subject',
      status: 'Status',
      priority: 'Priority',
      date: 'Date',
      actions: 'Actions',
      viewDetails: 'View Details',
      workOnTask: 'Work on Task',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      email: 'Email',
      phone: 'Phone',
      submittedDate: 'Submitted Date',
      resolvedDate: 'Resolved Date',
      feedback: 'Feedback',
      satisfactionRating: 'Satisfaction Rating',
      resolution: 'Resolution',
      close: 'Close',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noData: 'No complaints found'
    }
  };

  const t = translations[language];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="staff-complaints">
      <Header language={language} setLanguage={setLanguage} adminName={staffName} userRole="staff" />
      
      <div className="complaints-container">
        <div className="sidebar-container">
          <Sidebar language={language} userRole="staff" />
        </div>
        
        <div className="main-container">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>📋 {t.myAssignedComplaints}</h1>
              <p>{t.manageComplaints}</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">📋</div>
              <div className="stat-info">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">{t.totalComplaints}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">⏳</div>
              <div className="stat-info">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">{t.pending}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">🔄</div>
              <div className="stat-info">
                <div className="stat-value">{stats.inProgress}</div>
                <div className="stat-label">{t.inProgress}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div className="stat-info">
                <div className="stat-value">{stats.resolved}</div>
                <div className="stat-label">{t.resolved}</div>
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">{t.all} {t.status}</option>
                <option value="pending">{t.pending}</option>
                <option value="in-progress">{t.inProgress}</option>
                <option value="resolved">{t.resolved}</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">{t.all} {t.priority}</option>
                <option value="high">{t.high}</option>
                <option value="medium">{t.medium}</option>
                <option value="low">{t.low}</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">{t.all} {t.category}</option>
                {getUniqueCategories().map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="table-card">
            <div className="table-responsive">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>{t.ticketId}</th>
                    <th>{t.complainant}</th>
                    <th>{t.category}</th>
                    <th>{t.subject}</th>
                    <th>{t.status}</th>
                    <th>{t.priority}</th>
                    <th>{t.date}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.length > 0 ? (
                    paginatedComplaints.map(complaint => (
                      <tr key={complaint.id}>
                        <td className="ticket-id">{complaint.ticketId}</td>
                        <td className="complainant-cell">
                          <div className="complainant-info">
                            <span className="complainant-name">
                              {language === 'np' ? complaint.name : complaint.nameEn}
                            </span>
                            <span className="complainant-email">{complaint.email}</span>
                          </div>
                        </td>
                        <td>{getCategoryText(complaint.category, complaint.categoryEn)}</td>
                        <td className="subject-cell" title={complaint.subject}>
                          {complaint.subject.length > 40 ? complaint.subject.substring(0, 40) + '...' : complaint.subject}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                            {getStatusText(complaint.status)}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                            {getPriorityText(complaint.priority)}
                          </span>
                        </td>
                        <td>{formatDate(complaint.submittedDate)}</td>
                        <td className="actions-cell">
                          <button 
                            className="btn-view" 
                            onClick={() => handleViewDetails(complaint)}
                            title={t.viewDetails}
                          >
                            👁️
                          </button>
                          {complaint.status !== 'resolved' && (
                            <button 
                              className="btn-work" 
                              onClick={() => handleWorkOnTask(complaint.id)}
                              title={t.workOnTask}
                            >
                              🔧
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-data-row">
                      <td colSpan="8">
                        <div className="no-data-content">
                          <span className="no-data-icon">📭</span>
                          <p>{t.noData}</p>
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
      {showDetailsModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {t.complaintDetails}</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>{t.ticketId}:</label>
                <span className="ticket-id">{selectedComplaint.ticketId}</span>
              </div>
              <div className="detail-row">
                <label>{t.complainant}:</label>
                <span>{language === 'np' ? selectedComplaint.name : selectedComplaint.nameEn}</span>
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
                <span>{getCategoryText(selectedComplaint.category, selectedComplaint.categoryEn)}</span>
              </div>
              <div className="detail-row">
                <label>{t.subject}:</label>
                <span>{selectedComplaint.subject}</span>
              </div>
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
                <label>{t.submittedDate}:</label>
                <span>{formatDate(selectedComplaint.submittedDate)}</span>
              </div>
              {selectedComplaint.resolvedDate && selectedComplaint.resolvedDate !== selectedComplaint.submittedDate && (
                <div className="detail-row">
                  <label>{t.resolvedDate}:</label>
                  <span>{formatDate(selectedComplaint.resolvedDate)}</span>
                </div>
              )}
              <div className="detail-row full-width">
                <label>{t.description}:</label>
                <p className="description-text">{selectedComplaint.description || 'No description provided'}</p>
              </div>
              {selectedComplaint.feedback && (
                <div className="detail-row full-width">
                  <label>{t.feedback}:</label>
                  <p className="feedback-text">"{selectedComplaint.feedback}"</p>
                </div>
              )}
              {selectedComplaint.satisfactionRating > 0 && (
                <div className="detail-row">
                  <label>{t.satisfactionRating}:</label>
                  <div className="stars">{renderStars(selectedComplaint.satisfactionRating)}</div>
                </div>
              )}
              {selectedComplaint.resolution && (
                <div className="detail-row full-width">
                  <label>{t.resolution}:</label>
                  <p className="resolution-text">{selectedComplaint.resolution}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowDetailsModal(false)}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .staff-complaints {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
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
          border-top-color: #10b981;
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
        
        .page-header p {
          color: #64748b;
          font-size: 0.85rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .stat-icon.blue { background: #dbeafe; color: #2563eb; }
        .stat-icon.orange { background: #fed7aa; color: #ea580c; }
        .stat-icon.purple { background: #f3e8ff; color: #9333ea; }
        .stat-icon.green { background: #d1fae5; color: #059669; }
        
        .stat-info { flex: 1; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
        .stat-label { font-size: 0.7rem; color: #64748b; margin-top: 4px; }
        
        .filters-bar {
          background: white;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .search-box {
          flex: 1;
          position: relative;
          min-width: 200px;
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
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
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
        
        .table-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }
        
        .table-responsive {
          overflow-x: auto;
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
          color: #64748b;
          font-weight: 500;
          font-size: 0.75rem;
          background: #f8fafc;
        }
        
        .complaints-table td {
          color: #334155;
          font-size: 0.8rem;
        }
        
        .complaints-table tr:hover {
          background: #fafcff;
        }
        
        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #10b981;
        }
        
        .complainant-cell {
          max-width: 200px;
        }
        
        .complainant-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .complainant-name {
          font-weight: 500;
          color: #0f172a;
        }
        
        .complainant-email {
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .subject-cell {
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .status-badge, .priority-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.65rem;
          font-weight: 500;
        }
        
        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }
        
        .actions-cell {
          display: flex;
          gap: 8px;
        }
        
        .btn-view, .btn-work {
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          border: none;
          transition: all 0.2s;
        }
        
        .btn-view {
          background: #dbeafe;
          color: #2563eb;
        }
        
        .btn-view:hover {
          background: #bfdbfe;
        }
        
        .btn-work {
          background: #d1fae5;
          color: #059669;
        }
        
        .btn-work:hover {
          background: #a7f3d0;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
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
          border-color: #10b981;
          color: #10b981;
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-info {
          color: #64748b;
          font-size: 0.85rem;
        }
        
        .no-data-row {
          text-align: center;
        }
        
        .no-data-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 60px;
        }
        
        .no-data-icon {
          font-size: 3rem;
        }
        
        /* Modal Styles */
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
        
        .detail-row {
          display: flex;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
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
        }
        
        .detail-row.full-width {
          flex-direction: column;
        }
        
        .detail-row.full-width label {
          width: 100%;
          margin-bottom: 8px;
        }
        
        .description-text, .feedback-text, .resolution-text {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          line-height: 1.5;
          margin-top: 4px;
        }
        
        .feedback-text {
          font-style: italic;
        }
        
        .stars {
          display: flex;
          gap: 4px;
        }
        
        .star {
          font-size: 1rem;
        }
        
        .star-filled { color: #f59e0b; }
        .star-empty { color: #d1d5db; }
        
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          text-align: right;
          position: sticky;
          bottom: 0;
          background: white;
        }
        
        .btn-close {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .btn-close:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }
        
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (max-width: 768px) {
          .complaints-container { margin-top: 280px; }
          .sidebar-container { top: 280px; height: calc(100vh - 280px); }
          .main-container { padding: 16px; margin-left: 0; }
          .filters-bar { flex-direction: column; }
          .filter-group { width: 100%; flex-direction: column; }
          .filter-select { width: 100%; }
          .stats-grid { grid-template-columns: 1fr; }
          .actions-cell { flex-direction: column; }
          .detail-row { flex-direction: column; }
          .detail-row label { width: 100%; margin-bottom: 4px; }
        }
        
        @media (max-width: 480px) {
          .complaints-table th, .complaints-table td { padding: 8px 4px; font-size: 0.7rem; }
          .no-data-content { padding: 30px; }
        }
      `}</style>
    </div>
  );
};

export default StaffComplaints;