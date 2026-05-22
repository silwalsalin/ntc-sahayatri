// src/pages/AdminComplaintsInProgress.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminComplaintsInProgress = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusUpdate, setStatusUpdate] = useState('');
  const itemsPerPage = 10;

  // Sample in-progress complaints data
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
      progressPercent: 75,
      lastUpdate: '२०८०-०१-२०',
      enLastUpdate: '2024-01-20',
      estimatedCompletion: '२०८०-०१-२५',
      enEstimatedCompletion: '2024-01-25',
      resolvedDate: null
    },
    { 
      id: 2, 
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
      progressPercent: 40,
      lastUpdate: '२०८०-०२-०५',
      enLastUpdate: '2024-02-05',
      estimatedCompletion: '२०८०-०२-१०',
      enEstimatedCompletion: '2024-02-10',
      resolvedDate: null
    },
    { 
      id: 3, 
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
      progressPercent: 60,
      lastUpdate: '२०८०-०२-१२',
      enLastUpdate: '2024-02-12',
      estimatedCompletion: '२०८०-०२-१८',
      enEstimatedCompletion: '2024-02-18',
      resolvedDate: null
    },
    { 
      id: 4, 
      ticketId: 'NTC-2024-015', 
      name: 'राजन श्रेष्ठ', 
      enName: 'Rajan Shrestha',
      email: 'rajan@example.com',
      phone: '9845678234',
      category: 'network',
      category_np: 'नेटवर्क',
      category_en: 'Network',
      subCategory: 'weak-signal',
      description: 'घरमा नेटवर्क सिग्नल कमजोर',
      enDescription: 'Weak network signal at home',
      status: 'in-progress',
      date: '२०८०-०२-१५',
      enDate: '2024-02-15',
      channel: 'फोन',
      enChannel: 'Phone',
      priority: 'high',
      assignedTo: 'नेटवर्क टोली',
      enAssignedTo: 'Network Team',
      progressPercent: 30,
      lastUpdate: '२०८०-०२-१६',
      enLastUpdate: '2024-02-16',
      estimatedCompletion: '२०८०-०२-२५',
      enEstimatedCompletion: '2024-02-25',
      resolvedDate: null
    },
    { 
      id: 5, 
      ticketId: 'NTC-2024-016', 
      name: 'सुजाता अधिकारी', 
      enName: 'Sujata Adhikari',
      email: 'sujata@example.com',
      phone: '9812345876',
      category: 'billing',
      category_np: 'बिलिङ',
      category_en: 'Billing',
      subCategory: 'excessive-bill',
      description: 'बिल धेरै आएको छ, समीक्षा गरिदिनुहोस्',
      enDescription: 'Bill is too high, please review',
      status: 'in-progress',
      date: '२०८०-०२-१८',
      enDate: '2024-02-18',
      channel: 'इमेल',
      enChannel: 'Email',
      priority: 'medium',
      assignedTo: 'बिलिङ टोली',
      enAssignedTo: 'Billing Team',
      progressPercent: 50,
      lastUpdate: '२०८०-०२-२०',
      enLastUpdate: '2024-02-20',
      estimatedCompletion: '२०८०-०२-२८',
      enEstimatedCompletion: '2024-02-28',
      resolvedDate: null
    },
    { 
      id: 6, 
      ticketId: 'NTC-2024-017', 
      name: 'विनोद खनाल', 
      enName: 'Binod Khanal',
      email: 'binod@example.com',
      phone: '9845123789',
      category: 'activation',
      category_np: 'सक्रियता',
      category_en: 'Activation',
      subCategory: 'sim-activation',
      description: 'नयाँ सिम कार्ड सक्रिय गरिदिनुहोस्',
      enDescription: 'Please activate new SIM card',
      status: 'in-progress',
      date: '२०८०-०२-२०',
      enDate: '2024-02-20',
      channel: 'कल सेन्टर',
      enChannel: 'Call Center',
      priority: 'low',
      assignedTo: 'ग्राहक सेवा',
      enAssignedTo: 'Customer Service',
      progressPercent: 85,
      lastUpdate: '२०८०-०२-२२',
      enLastUpdate: '2024-02-22',
      estimatedCompletion: '२०८०-०२-२३',
      enEstimatedCompletion: '2024-02-23',
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
      inProgressComplaints: 'प्रगतिमा रहेका गुनासोहरू',
      manageInProgress: 'प्रगतिमा गुनासो व्यवस्थापन',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByCategory: 'प्रकार अनुसार फिल्टर',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      date: 'मिति',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      progress: 'प्रगति',
      lastUpdate: 'अन्तिम अपडेट',
      estimatedCompletion: 'अनुमानित पूरा मिति',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      updateProgress: 'प्रगति अपडेट गर्नुहोस्',
      markResolved: 'समाधान चिन्ह लगाउनुहोस्',
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
      noComplaintsFound: 'कुनै प्रगतिमा गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalInProgress: 'जम्मा प्रगतिमा',
      averageProgress: 'औसत प्रगति',
      updateStatus: 'स्थिति अपडेट गर्नुहोस्',
      updateSuccess: 'प्रगति सफलतापूर्वक अपडेट गरियो',
      resolveSuccess: 'गुनासो समाधान भएको रूपमा चिन्ह लगाइयो'
    },
    en: {
      inProgressComplaints: 'In Progress Complaints',
      manageInProgress: 'Manage In Progress Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByPriority: 'Filter by Priority',
      filterByCategory: 'Filter by Category',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      date: 'Date',
      status: 'Status',
      priority: 'Priority',
      progress: 'Progress',
      lastUpdate: 'Last Update',
      estimatedCompletion: 'Est. Completion',
      actions: 'Actions',
      viewDetails: 'View Details',
      updateProgress: 'Update Progress',
      markResolved: 'Mark Resolved',
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
      noComplaintsFound: 'No in-progress complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalInProgress: 'Total In Progress',
      averageProgress: 'Average Progress',
      updateStatus: 'Update Status',
      updateSuccess: 'Progress updated successfully',
      resolveSuccess: 'Complaint marked as resolved'
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

  const getDate = (complaint, field) => {
    return language === 'np' ? complaint[`${field}`] : complaint[`en${field.charAt(0).toUpperCase() + field.slice(1)}`];
  };

  const getChannel = (complaint) => {
    return language === 'np' ? complaint.channel : complaint.enChannel;
  };

  const getAssignedTo = (complaint) => {
    return language === 'np' ? complaint.assignedTo : complaint.enAssignedTo;
  };

  const getProgressColor = (percent) => {
    if (percent >= 75) return 'progress-high';
    if (percent >= 50) return 'progress-medium';
    if (percent >= 25) return 'progress-low';
    return 'progress-start';
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

  // Calculate average progress
  const averageProgress = complaints.length > 0 
    ? Math.round(complaints.reduce((sum, c) => sum + c.progressPercent, 0) / complaints.length)
    : 0;

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusUpdate(complaint.progressPercent.toString());
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    setStatusUpdate('');
  };

  const handleProgressUpdate = () => {
    const newProgress = parseInt(statusUpdate);
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
      alert(language === 'np' ? 'कृपया ०-१०० बीचको मान प्रविष्ट गर्नुहोस्' : 'Please enter a value between 0-100');
      return;
    }

    setComplaints(prev => prev.map(complaint => 
      complaint.id === selectedComplaint.id 
        ? { ...complaint, progressPercent: newProgress, lastUpdate: language === 'np' ? '२०८०-०२-२५' : '2024-02-25' }
        : complaint
    ));
    alert(t.updateSuccess);
    closeModal();
  };

  const markAsResolved = (id) => {
    setComplaints(prev => prev.filter(complaint => complaint.id !== id));
    alert(t.resolveSuccess);
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
    <div className="admin-inprogress-complaints">
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="complaints-container">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="page-header">
            <div>
              <h1>{t.inProgressComplaints}</h1>
              <p>{t.manageInProgress}</p>
            </div>
            <div className="stats-group">
              <div className="stat-card-small">
                <span className="stat-value">{complaints.length}</span>
                <span className="stat-label">{t.totalInProgress}</span>
              </div>
              <div className="stat-card-small">
                <span className="stat-value">{averageProgress}%</span>
                <span className="stat-label">{t.averageProgress}</span>
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
                  <th>{t.progress}</th>
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
                      <td>{getCategoryText(complaint.category)}</td>
                      <td>{getDate(complaint, 'date')}</td>
                      <td>
                        <div className="progress-container">
                          <div className="progress-bar-wrapper">
                            <div 
                              className={`progress-bar ${getProgressColor(complaint.progressPercent)}`}
                              style={{ width: `${complaint.progressPercent}%` }}
                            />
                          </div>
                          <span className="progress-text">{complaint.progressPercent}%</span>
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
                            👁️ {t.viewDetails}
                          </button>
                          <button className="resolve-btn" onClick={() => markAsResolved(complaint.id)}>
                            ✅ {t.markResolved}
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

      {/* Update Progress Modal */}
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
                <span>{getDate(selectedComplaint, 'date')}</span>
              </div>
              <div className="detail-row">
                <label>{t.lastUpdate}:</label>
                <span>{getDate(selectedComplaint, 'lastUpdate')}</span>
              </div>
              <div className="detail-row">
                <label>{t.estimatedCompletion}:</label>
                <span>{getDate(selectedComplaint, 'estimatedCompletion')}</span>
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
                <label>{t.progress}:</label>
                <div className="progress-update">
                  <input
                    type="number"
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    min="0"
                    max="100"
                    className="progress-input"
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="detail-row full-width">
                <label>{t.description}:</label>
                <p>{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-update" onClick={handleProgressUpdate}>
                📈 {t.updateProgress}
              </button>
              <button className="btn-resolve" onClick={() => {
                markAsResolved(selectedComplaint.id);
                closeModal();
              }}>
                ✅ {t.markResolved}
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

        .admin-inprogress-complaints {
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

        .stats-group {
          display: flex;
          gap: 16px;
        }

        .stat-card-small {
          text-align: center;
          padding: 8px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .stat-card-small .stat-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #3b82f6;
          display: block;
        }

        .stat-card-small .stat-label {
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

        .progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .progress-bar-wrapper {
          flex: 1;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s;
        }

        .progress-bar.progress-high { background: #10b981; }
        .progress-bar.progress-medium { background: #f59e0b; }
        .progress-bar.progress-low { background: #3b82f6; }
        .progress-bar.progress-start { background: #ef4444; }

        .progress-text {
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          min-width: 40px;
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
          font-size: 0.7rem;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: #e2e8f0;
        }

        .resolve-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .resolve-btn:hover {
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

        .progress-update {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-input {
          width: 80px;
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
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

        .btn-update {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-update:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .btn-resolve {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-resolve:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }

        .btn-close {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 10px 20px;
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
          .stats-group {
            width: 100%;
            justify-content: space-between;
          }
          .action-buttons {
            flex-direction: column;
          }
          .modal-footer {
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
          .progress-container {
            min-width: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminComplaintsInProgress;