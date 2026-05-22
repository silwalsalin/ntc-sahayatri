// src/pages/AdminComplaintsPending.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminComplaintsPending = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample pending complaints data
  const [complaints, setComplaints] = useState([
    { 
      id: 1, 
      ticketId: 'NTC-2024-003', 
      name: 'हरि प्रसाद', 
      enName: 'Hari Prasad',
      email: 'hari@example.com',
      phone: '9823456789',
      category: 'activation',
      category_np: 'सक्रियता',
      category_en: 'Activation',
      subCategory: 'sim-deactivation',
      description: 'सिम डिएक्टिभेसन अनुरोध प्रक्रिया भएन',
      enDescription: 'SIM deactivation request not processed',
      status: 'pending',
      date: '२०८०-०१-२५',
      enDate: '2024-01-25',
      channel: 'कल सेन्टर',
      enChannel: 'Call Center',
      priority: 'low',
      assignedTo: 'ग्राहक सेवा',
      enAssignedTo: 'Customer Service',
      daysPending: 15,
      resolvedDate: null
    },
    { 
      id: 2, 
      ticketId: 'NTC-2024-007', 
      name: 'सरिता गिरी', 
      enName: 'Sarita Giri',
      email: 'sarita@example.com',
      phone: '9845678901',
      category: 'network',
      category_np: 'नेटवर्क',
      category_en: 'Network',
      subCategory: 'no-coverage',
      description: 'घरमा नेटवर्क नै छैन',
      enDescription: 'No network coverage at home',
      status: 'pending',
      date: '२०८०-०२-०५',
      enDate: '2024-02-05',
      channel: 'फोन',
      enChannel: 'Phone',
      priority: 'high',
      assignedTo: 'नेटवर्क टोली',
      enAssignedTo: 'Network Team',
      daysPending: 8,
      resolvedDate: null
    },
    { 
      id: 3, 
      ticketId: 'NTC-2024-011', 
      name: 'विनोद कुमार', 
      enName: 'Binod Kumar',
      email: 'binod@example.com',
      phone: '9812345987',
      category: 'billing',
      category_np: 'बिलिङ',
      category_en: 'Billing',
      subCategory: 'wrong-charge',
      description: 'बिलमा गलत शुल्क लागेको',
      enDescription: 'Wrong charges applied in bill',
      status: 'pending',
      date: '२०८०-०२-१५',
      enDate: '2024-02-15',
      channel: 'इमेल',
      enChannel: 'Email',
      priority: 'medium',
      assignedTo: 'बिलिङ टोली',
      enAssignedTo: 'Billing Team',
      daysPending: 5,
      resolvedDate: null
    },
    { 
      id: 4, 
      ticketId: 'NTC-2024-012', 
      name: 'सुनिता खतिवडा', 
      enName: 'Sunita Khatiwada',
      email: 'sunita@example.com',
      phone: '9841234987',
      category: 'internet',
      category_np: 'इन्टरनेट',
      category_en: 'Internet',
      subCategory: 'connection',
      description: 'नयाँ जडानको लागि अनुरोध गरेको ७ दिन भयो जडान भएको छैन',
      enDescription: 'Requested new connection 7 days ago, not installed yet',
      status: 'pending',
      date: '२०८०-०२-१८',
      enDate: '2024-02-18',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal',
      priority: 'high',
      assignedTo: 'प्राविधिक टोली',
      enAssignedTo: 'Technical Team',
      daysPending: 4,
      resolvedDate: null
    },
    { 
      id: 5, 
      ticketId: 'NTC-2024-013', 
      name: 'राम प्रसाद', 
      enName: 'Ram Prasad',
      email: 'ram@example.com',
      phone: '9812345900',
      category: 'recharge',
      category_np: 'रिचार्ज',
      category_en: 'Recharge',
      subCategory: 'not-credited',
      description: 'रु २०० रिचार्ज गरेको तर ब्यालेन्स नआएको',
      enDescription: 'Recharged Rs 200 but balance not credited',
      status: 'pending',
      date: '२०८०-०२-२०',
      enDate: '2024-02-20',
      channel: 'व्हाट्सएप',
      enChannel: 'WhatsApp',
      priority: 'high',
      assignedTo: 'बिलिङ टोली',
      enAssignedTo: 'Billing Team',
      daysPending: 2,
      resolvedDate: null
    },
    { 
      id: 6, 
      ticketId: 'NTC-2024-014', 
      name: 'मनिषा पोखरेल', 
      enName: 'Manisha Pokharel',
      email: 'manisha@example.com',
      phone: '9845678123',
      category: 'technical',
      category_np: 'प्राविधिक',
      category_en: 'Technical',
      subCategory: 'app-issue',
      description: 'एनटीसी एप लगइन हुँदैन',
      enDescription: 'Unable to login to NTC App',
      status: 'pending',
      date: '२०८०-०२-२२',
      enDate: '2024-02-22',
      channel: 'फेसबुक',
      enChannel: 'Facebook',
      priority: 'medium',
      assignedTo: 'प्राविधिक टोली',
      enAssignedTo: 'Technical Team',
      daysPending: 1,
      resolvedDate: null
    }
  ]);

  // Categories for filter
  const categories = {
    np: {
      all: 'सबै प्रकार',
      internet: 'इन्टरनेट',
      recharge: 'रिचार्ज',
      activation: 'सक्रियता',
      billing: 'बिलिङ',
      network: 'नेटवर्क',
      technical: 'प्राविधिक'
    },
    en: {
      all: 'All Categories',
      internet: 'Internet',
      recharge: 'Recharge',
      activation: 'Activation',
      billing: 'Billing',
      network: 'Network',
      technical: 'Technical'
    }
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [navigate]);

  const content = {
    np: {
      pendingComplaints: 'विचाराधीन गुनासोहरू',
      managePending: 'विचाराधीन गुनासो व्यवस्थापन',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByCategory: 'प्रकार अनुसार फिल्टर',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      date: 'मिति',
      daysPending: 'दिन बाँकी',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      processNow: 'अहिले प्रक्रिया गर्नुहोस्',
      assignTeam: 'टोली तोक्नुहोस्',
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
      urgentAttention: 'तत्काल ध्यान दिनुहोस्'
    },
    en: {
      pendingComplaints: 'Pending Complaints',
      managePending: 'Manage Pending Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByPriority: 'Filter by Priority',
      filterByCategory: 'Filter by Category',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      date: 'Date',
      daysPending: 'Days Pending',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
      processNow: 'Process Now',
      assignTeam: 'Assign Team',
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
      urgentAttention: 'Requires Urgent Attention'
    }
  };

  const t = content[language];
  const categoriesObj = categories[language];

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

  const getDate = (complaint) => {
    return language === 'np' ? complaint.date : complaint.enDate;
  };

  const getChannel = (complaint) => {
    return language === 'np' ? complaint.channel : complaint.enChannel;
  };

  const getAssignedTo = (complaint) => {
    return language === 'np' ? complaint.assignedTo : complaint.enAssignedTo;
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

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.phone.includes(searchTerm);
    
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const categoryMatch = categoryFilter === 'all' || complaint.category === categoryFilter;
    
    return searchMatch && priorityMatch && categoryMatch;
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

  const processComplaint = (id) => {
    // Update status to in-progress
    setComplaints(prev => prev.map(complaint => 
      complaint.id === id ? { ...complaint, status: 'in-progress' } : complaint
    ));
    alert(language === 'np' ? 'गुनासो प्रक्रियामा लगियो' : 'Complaint moved to in-progress');
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
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="complaints-container">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="page-header">
            <div>
              <h1>{t.pendingComplaints}</h1>
              <p>{t.managePending}</p>
            </div>
            <div className="pending-stats">
              <span className="pending-count">{complaints.length}</span>
              <span className="pending-label">{t.totalPending}</span>
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
                  <th>{t.daysPending}</th>
                  <th>{t.priority}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComplaints.length > 0 ? (
                  paginatedComplaints.map((complaint) => (
                    <tr key={complaint.id} className={complaint.priority === 'high' ? 'high-priority-row' : ''}>
                      <td className="ticket-id">{complaint.ticketId}</td>
                      <td>{language === 'np' ? complaint.name : complaint.enName}</td>
                      <td>{getCategoryText(complaint.category)}</td>
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
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => openModal(complaint)}>
                            👁️
                          </button>
                          <button className="process-btn" onClick={() => processComplaint(complaint.id)}>
                            ⚡ {t.processNow}
                          </button>
                        </div>
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
                <label>{t.daysPending}:</label>
                <span className={`urgency-badge ${getUrgencyClass(selectedComplaint.daysPending)}`}>
                  {selectedComplaint.daysPending} {language === 'np' ? 'दिन' : 'days'}
                </span>
              </div>
              <div className="detail-row">
                <label>{t.channel}:</label>
                <span>{getChannel(selectedComplaint)}</span>
              </div>
              <div className="detail-row">
                <label>{t.assignedTo}:</label>
                <span>{getAssignedTo(selectedComplaint)}</span>
              </div>
              <div className="detail-row full-width">
                <label>{t.description}:</label>
                <p>{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-process" onClick={() => {
                processComplaint(selectedComplaint.id);
                closeModal();
              }}>
                ⚡ {t.processNow}
              </button>
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

        .page-header p {
          color: #64748b;
          font-size: 0.85rem;
        }

        .pending-stats {
          text-align: center;
          padding: 8px 20px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 12px;
        }

        .pending-count {
          font-size: 1.8rem;
          font-weight: 700;
          color: #d97706;
          display: block;
        }

        .pending-label {
          font-size: 0.7rem;
          color: #b45309;
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
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
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

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
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
          border-left: 3px solid #ef4444;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #3b82f6;
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

        .view-btn {
          background: #f1f5f9;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: #e2e8f0;
        }

        .process-btn {
          background: linear-gradient(135deg, #10b981, #059669);
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

        .process-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(16,185,129,0.3);
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
          width: 130px;
          font-weight: 600;
          color: #0f172a;
          flex-shrink: 0;
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

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          text-align: right;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
          background: white;
        }

        .btn-process {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-process:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
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
          .complaints-container {
            margin-top: 280px;
          }
          .sidebar-container {
            top: 280px;
            height: calc(100vh - 280px);
          }
          .main-container {
            padding: 16px;
            margin-left: 0;
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
          .action-buttons {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .complaints-table th,
          .complaints-table td {
            padding: 8px;
            font-size: 0.7rem;
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
        }
      `}</style>
    </div>
  );
};

export default AdminComplaintsPending;