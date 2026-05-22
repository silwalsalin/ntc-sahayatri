// src/pages/AdminComplaints.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminComplaints = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample complaints data
  const [complaints, setComplaints] = useState([
    { 
      id: 1, 
      ticketId: 'NTC-2024-001', 
      name: 'रमेश केसी', 
      enName: 'Ramesh KC',
      email: 'ramesh@example.com',
      phone: '9841000001',
      category: 'internet',
      category_np: 'इन्टरनेट',
      category_en: 'Internet',
      subCategory: 'connection',
      description: 'फाइबर जडान २ दिनदेखि बन्द छ',
      enDescription: 'Fiber connection down since 2 days',
      status: 'in-progress',
      date: '२०८०-०१-१५',
      enDate: '2024-01-15',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal',
      priority: 'high',
      assignedTo: 'प्राविधिक टोली',
      enAssignedTo: 'Technical Team',
      resolvedDate: null
    },
    { 
      id: 2, 
      ticketId: 'NTC-2024-002', 
      name: 'सीता शर्मा', 
      enName: 'Sita Sharma',
      email: 'sita@example.com',
      phone: '9812345678',
      category: 'recharge',
      category_np: 'रिचार्ज',
      category_en: 'Recharge',
      subCategory: 'not-credited',
      description: 'रु. ५०० रिचार्ज गरे पनि ब्यालेन्स अपडेट भएन',
      enDescription: 'Recharged Rs. 500 but balance not updated',
      status: 'resolved',
      date: '२०८०-०१-२०',
      enDate: '2024-01-20',
      channel: 'व्हाट्सएप',
      enChannel: 'WhatsApp',
      priority: 'medium',
      assignedTo: 'बिलिङ टोली',
      enAssignedTo: 'Billing Team',
      resolvedDate: '२०८०-०१-२२'
    },
    { 
      id: 3, 
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
      resolvedDate: null
    },
    { 
      id: 4, 
      ticketId: 'NTC-2024-004', 
      name: 'विकास न्यौपाने', 
      enName: 'Bikas Neupane',
      email: 'bikas@example.com',
      phone: '9841567890',
      category: 'signal',
      category_np: 'सिग्नल',
      category_en: 'Signal',
      subCategory: 'weak-signal',
      description: 'नेटवर्क सिग्नल समस्या - कल ड्रप भइरहेको छ',
      enDescription: 'Network signal issue - call drops frequently',
      status: 'review',
      date: '२०८०-०१-२८',
      enDate: '2024-01-28',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal',
      priority: 'high',
      assignedTo: 'नेटवर्क टोली',
      enAssignedTo: 'Network Team',
      resolvedDate: null
    },
    { 
      id: 5, 
      ticketId: 'NTC-2024-005', 
      name: 'मिना काफ्ले', 
      enName: 'Mina Kafle',
      email: 'mina@example.com',
      phone: '9841234567',
      category: 'billing',
      category_np: 'बिलिङ',
      category_en: 'Billing',
      subCategory: 'wrong-charge',
      description: 'गत महिनाको बिलमा गलत चार्ज',
      enDescription: 'Wrong charge in last month bill',
      status: 'resolved',
      date: '२०८०-०१-१०',
      enDate: '2024-01-10',
      channel: 'इमेल',
      enChannel: 'Email',
      priority: 'medium',
      assignedTo: 'बिलिङ टोली',
      enAssignedTo: 'Billing Team',
      resolvedDate: '२०८०-०१-१५'
    },
    { 
      id: 6, 
      ticketId: 'NTC-2024-006', 
      name: 'विवेक श्रेष्ठ', 
      enName: 'Bivek Shrestha',
      email: 'bivek@example.com',
      phone: '9812345670',
      category: 'technical',
      category_np: 'प्राविधिक',
      category_en: 'Technical',
      subCategory: 'app-issue',
      description: 'एनटीसी एप काम गर्दैन',
      enDescription: 'NTC App is not working',
      status: 'in-progress',
      date: '२०८०-०२-०१',
      enDate: '2024-02-01',
      channel: 'फेसबुक',
      enChannel: 'Facebook',
      priority: 'medium',
      assignedTo: 'प्राविधिक टोली',
      enAssignedTo: 'Technical Team',
      resolvedDate: null
    },
    { 
      id: 7, 
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
      resolvedDate: null
    },
    { 
      id: 8, 
      ticketId: 'NTC-2024-008', 
      name: 'राजन पौडेल', 
      enName: 'Rajan Poudel',
      email: 'rajan@example.com',
      phone: '9847890123',
      category: 'internet',
      category_np: 'इन्टरनेट',
      category_en: 'Internet',
      subCategory: 'slow-speed',
      description: 'इन्टरनेट स्पीड धेरै सुस्त छ',
      enDescription: 'Internet speed is very slow',
      status: 'review',
      date: '२०८०-०२-०८',
      enDate: '2024-02-08',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal',
      priority: 'low',
      assignedTo: 'प्राविधिक टोली',
      enAssignedTo: 'Technical Team',
      resolvedDate: null
    },
    { 
      id: 9, 
      ticketId: 'NTC-2024-009', 
      name: 'कमला दाहाल', 
      enName: 'Kamala Dahal',
      email: 'kamala@example.com',
      phone: '9843456789',
      category: 'recharge',
      category_np: 'रिचार्ज',
      category_en: 'Recharge',
      subCategory: 'not-credited',
      description: 'अनलाइन रिचार्ज भएन',
      enDescription: 'Online recharge not processed',
      status: 'in-progress',
      date: '२०८०-०२-१०',
      enDate: '2024-02-10',
      channel: 'वेबसाइट पोर्टल',
      enChannel: 'Website Portal',
      priority: 'high',
      assignedTo: 'बिलिङ टोली',
      enAssignedTo: 'Billing Team',
      resolvedDate: null
    },
    { 
      id: 10, 
      ticketId: 'NTC-2024-010', 
      name: 'पुजा थापा', 
      enName: 'Puja Thapa',
      email: 'puja@example.com',
      phone: '9845678123',
      category: 'billing',
      category_np: 'बिलिङ',
      category_en: 'Billing',
      subCategory: 'excessive-bill',
      description: 'बिल धेरै आएको छ',
      enDescription: 'Bill is too high',
      status: 'resolved',
      date: '२०८०-०२-१२',
      enDate: '2024-02-12',
      channel: 'इमेल',
      enChannel: 'Email',
      priority: 'medium',
      assignedTo: 'बिलिङ टोली',
      enAssignedTo: 'Billing Team',
      resolvedDate: '२०८०-०२-१५'
    }
  ]);

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
      complaintsManagement: 'गुनासो व्यवस्थापन',
      allComplaints: 'सबै गुनासोहरू',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      date: 'मिति',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      updateStatus: 'स्थिति अपडेट गर्नुहोस्',
      assignTeam: 'टोली तोक्नुहोस्',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      channel: 'च्यानल',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      resolvedDate: 'समाधान मिति',
      assignedTo: 'तोकिएको टोली',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      underReview: 'समीक्षामा',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noComplaintsFound: 'कुनै गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalComplaints: 'कुल गुनासो',
      pendingCount: 'विचाराधीन',
      inProgressCount: 'प्रगतिमा',
      resolvedCount: 'समाधान'
    },
    en: {
      complaintsManagement: 'Complaints Management',
      allComplaints: 'All Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      date: 'Date',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
      updateStatus: 'Update Status',
      assignTeam: 'Assign Team',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      channel: 'Channel',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      resolvedDate: 'Resolved Date',
      assignedTo: 'Assigned To',
      close: 'Close',
      all: 'All',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      underReview: 'Under Review',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noComplaintsFound: 'No complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalComplaints: 'Total Complaints',
      pendingCount: 'Pending',
      inProgressCount: 'In Progress',
      resolvedCount: 'Resolved'
    }
  };

  const t = content[language];

  const getStatusClass = (status) => {
    const classes = { 
      pending: 'status-pending', 
      'in-progress': 'status-progress', 
      resolved: 'status-resolved',
      review: 'status-review'
    };
    return classes[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    const texts = {
      np: { 
        pending: 'विचाराधीन', 
        'in-progress': 'प्रगतिमा', 
        resolved: 'समाधान',
        review: 'समीक्षामा'
      },
      en: { 
        pending: 'Pending', 
        'in-progress': 'In Progress', 
        resolved: 'Resolved',
        review: 'Under Review'
      }
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

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.phone.includes(searchTerm);
    
    const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    
    return searchMatch && statusMatch && priorityMatch;
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

  const updateStatus = (id, newStatus) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === id ? { ...complaint, status: newStatus } : complaint
    ));
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
    <div className="admin-complaints">
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="complaints-container">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="page-header">
            <div>
              <h1>{t.complaintsManagement}</h1>
              <p>{t.allComplaints}</p>
            </div>
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              🔄 {language === 'np' ? 'रिफ्रेस' : 'Refresh'}
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-box-icon blue">📋</div>
              <div className="stat-box-info">
                <div className="stat-box-value">{complaints.length}</div>
                <div className="stat-box-label">{t.totalComplaints}</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-box-icon orange">⏳</div>
              <div className="stat-box-info">
                <div className="stat-box-value">{complaints.filter(c => c.status === 'pending').length}</div>
                <div className="stat-box-label">{t.pendingCount}</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-box-icon yellow">🔄</div>
              <div className="stat-box-info">
                <div className="stat-box-value">{complaints.filter(c => c.status === 'in-progress').length}</div>
                <div className="stat-box-label">{t.inProgressCount}</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-box-icon green">✅</div>
              <div className="stat-box-info">
                <div className="stat-box-value">{complaints.filter(c => c.status === 'resolved').length}</div>
                <div className="stat-box-label">{t.resolvedCount}</div>
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
                <option value="all">{t.all}</option>
                <option value="pending">{t.pending}</option>
                <option value="in-progress">{t.inProgress}</option>
                <option value="review">{t.underReview}</option>
                <option value="resolved">{t.resolved}</option>
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
                  <th>{t.status}</th>
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
                      <td>{getDate(complaint)}</td>
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
                <span>{getDate(selectedComplaint)}</span>
              </div>
              {selectedComplaint.resolvedDate && (
                <div className="detail-row">
                  <label>{t.resolvedDate}:</label>
                  <span>{language === 'np' ? selectedComplaint.resolvedDate : selectedComplaint.resolvedDate}</span>
                </div>
              )}
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

        .admin-complaints {
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
          border-color: #3b82f6;
          color: #3b82f6;
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-box {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #cbd5e1;
        }

        .stat-box-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }

        .stat-box-icon.blue { background: #e3f2fd; color: #1565c0; }
        .stat-box-icon.orange { background: #fff3e0; color: #f57c00; }
        .stat-box-icon.yellow { background: #fff8e1; color: #f9a825; }
        .stat-box-icon.green { background: #e8f5e9; color: #2e7d32; }

        .stat-box-info {
          flex: 1;
        }

        .stat-box-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .stat-box-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
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
          transition: all 0.2s;
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

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #3b82f6;
        }

        .status-badge, .priority-badge {
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

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .view-btn {
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

        .view-btn:hover {
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
          transition: color 0.2s;
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
          position: sticky;
          bottom: 0;
          background: white;
        }

        .btn-close {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-close:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
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
          .stats-row {
            grid-template-columns: 1fr;
          }
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
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
        }
      `}</style>
    </div>
  );
};

export default AdminComplaints;