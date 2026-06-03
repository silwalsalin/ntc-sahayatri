// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [stats, setStats] = useState({
    totalComplaints: 1247,
    pendingComplaints: 342,
    inProgressComplaints: 156,
    resolvedComplaints: 749,
    totalUsers: 8956,
    newUsersToday: 23,
    activeUsers: 1234,
    satisfactionRate: 78.5
  });

  const [recentComplaints, setRecentComplaints] = useState([
    { id: 1, ticketId: 'NTC-2024-001', name: 'रमेश केसी', enName: 'Ramesh KC', category: 'इन्टरनेट', enCategory: 'Internet', status: 'pending', date: '२०८०-०१-१५', enDate: '2024-01-15', priority: 'high' },
    { id: 2, ticketId: 'NTC-2024-002', name: 'सीता शर्मा', enName: 'Sita Sharma', category: 'रिचार्ज', enCategory: 'Recharge', status: 'in-progress', date: '२०८०-०१-१४', enDate: '2024-01-14', priority: 'medium' },
    { id: 3, ticketId: 'NTC-2024-003', name: 'हरि प्रसाद', enName: 'Hari Prasad', category: 'सक्रियता', enCategory: 'Activation', status: 'resolved', date: '२०८०-०१-१३', enDate: '2024-01-13', priority: 'low' },
    { id: 4, ticketId: 'NTC-2024-004', name: 'गीता अधिकारी', enName: 'Gita Adhikari', category: 'बिलिङ', enCategory: 'Billing', status: 'pending', date: '२०८०-०१-१२', enDate: '2024-01-12', priority: 'high' },
    { id: 5, ticketId: 'NTC-2024-005', name: 'विकास न्यौपाने', enName: 'Bikas Neupane', category: 'सिग्नल', enCategory: 'Signal', status: 'in-progress', date: '२०८०-०१-११', enDate: '2024-01-11', priority: 'medium' }
  ]);

  const [chartData] = useState({
    labels: { 
      np: ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'], 
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] 
    },
    datasets: [65, 78, 82, 74, 88, 92, 95, 89, 91, 87, 93, 98]
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    
    if (!token || !isLoggedIn || userRole !== 'admin') {
      window.location.href = '/login';
    } else {
      try {
        const userData = user ? JSON.parse(user) : {};
        setAdminName(userData.fullName || userData.name || 'Admin');
      } catch (e) {
        setAdminName('Admin');
      }
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  const content = {
    np: {
      welcomeBack: 'स्वागत छ',
      dashboard: 'प्रशासक ड्यासबोर्ड',
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
      viewDetails: 'विवरण हेर्नुहोस्',
      quickActions: 'द्रुत कार्यहरू',
      addComplaint: 'नयाँ गुनासो थप्नुहोस्',
      manageUsers: 'प्रयोगकर्ता व्यवस्थापन',
      generateReport: 'रिपोर्ट बनाउनुहोस्',
      viewAnalytics: 'विश्लेषण हेर्नुहोस्',
      monthlyTrend: 'मासिक गुनासो प्रवृत्ति',
      loading: 'लोड हुँदैछ...',
      fromLastMonth: 'अघिल्लो महिना भन्दा',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान'
    },
    en: {
      welcomeBack: 'Welcome Back',
      dashboard: 'Admin Dashboard',
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
      viewDetails: 'View Details',
      quickActions: 'Quick Actions',
      addComplaint: 'Add New Complaint',
      manageUsers: 'Manage Users',
      generateReport: 'Generate Report',
      viewAnalytics: 'View Analytics',
      monthlyTrend: 'Monthly Complaint Trend',
      loading: 'Loading...',
      fromLastMonth: 'from last month',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved'
    }
  };

  const t = content[language];
  
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

  const getCategoryText = (category, enCategory) => language === 'np' ? category : enCategory;
  
  const getDate = (npDate, enDate) => language === 'np' ? npDate : enDate;
  
  const getChartLabels = () => {
    return chartData.labels[language].slice(0, 6);
  };
  
  const getChartData = () => {
    return chartData.datasets.slice(0, 6);
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
    <div className="admin-dashboard">
      <Header language={language} setLanguage={setLanguage} adminName={adminName} userRole="admin" />
      
      <div className="dashboard-container">
        <div className="sidebar-container">
          <Sidebar language={language} userRole="admin" />
        </div>
        
        <div className="main-container">
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1>{t.welcomeBack}, <span className="admin-name">{adminName}</span></h1>
              <p>{t.dashboard}</p>
            </div>
            <div className="date-display">
              📅 {new Date().toLocaleDateString(language === 'np' ? 'ne-NP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Stats Cards - Removed trend lines */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalComplaints.toLocaleString()}</div>
                <div className="stat-label">{t.totalComplaints}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <div className="stat-value">{stats.pendingComplaints.toLocaleString()}</div>
                <div className="stat-label">{t.pendingComplaints}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <div className="stat-value">{stats.inProgressComplaints.toLocaleString()}</div>
                <div className="stat-label">{t.inProgressComplaints}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-value">{stats.resolvedComplaints.toLocaleString()}</div>
                <div className="stat-label">{t.resolvedComplaints}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                <div className="stat-label">{t.totalUsers}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✨</div>
              <div className="stat-info">
                <div className="stat-value">+{stats.newUsersToday}</div>
                <div className="stat-label">{t.newUsersToday}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🟢</div>
              <div className="stat-info">
                <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
                <div className="stat-label">{t.activeUsers}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">{stats.satisfactionRate}%</div>
                <div className="stat-label">{t.satisfactionRate}</div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="chart-card">
            <div className="card-title">
              <h3>{t.monthlyTrend}</h3>
            </div>
            <div className="chart-wrapper">
              {getChartData().map((value, idx) => {
                const maxValue = Math.max(...getChartData(), 1);
                return (
                  <div key={idx} className="chart-item">
                    <div className="chart-label">{getChartLabels()[idx]}</div>
                    <div className="chart-track">
                      <div 
                        className="chart-bar" 
                        style={{ 
                          height: `${(value / maxValue) * 100}%`,
                          backgroundColor: `hsl(${210 + idx * 25}, 65%, 55%)`
                        }}
                      >
                        <span className="chart-value">{value}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="table-card">
            <div className="card-title">
              <h3>{t.recentComplaints}</h3>
              <button className="view-all-btn" onClick={() => navigate('/admin-complaints')}>
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
                  {recentComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td className="ticket-id">{complaint.ticketId}</td>
                      <td>{language === 'np' ? complaint.name : complaint.enName}</td>
                      <td>{getCategoryText(complaint.category, complaint.enCategory)}</td>
                      <td><span className={`status-badge ${getStatusClass(complaint.status)}`}>{getStatusText(complaint.status)}</span></td>
                      <td>{getDate(complaint.date, complaint.enDate)}</td>
                      <td><span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>{getPriorityText(complaint.priority)}</span></td>
                      <td>
                        <button 
                          className="view-details-btn" 
                          onClick={() => navigate(`/admin-complaints/${complaint.id}`)}
                        >
                          👁️ {t.viewDetails}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-card">
            <div className="card-title">
              <h3>{t.quickActions}</h3>
            </div>
            <div className="actions-grid">
              <button className="action-button" onClick={() => navigate('/admin-complaints/add')}>
                <span>➕</span> {t.addComplaint}
              </button>
              <button className="action-button" onClick={() => navigate('/admin-users')}>
                <span>👥</span> {t.manageUsers}
              </button>
              <button className="action-button" onClick={() => navigate('/admin-reports/complaints')}>
                <span>📊</span> {t.generateReport}
              </button>
              <button className="action-button" onClick={() => navigate('/admin-analytics')}>
                <span>📈</span> {t.viewAnalytics}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-dashboard {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
        }

        /* Loading State */
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

        /* Dashboard Container */
        .dashboard-container {
          display: flex;
          margin-top: 160px;
          min-height: calc(100vh - 160px);
        }

        /* Sidebar Container */
        .sidebar-container {
          position: fixed;
          top: 160px;
          left: 0;
          width: 260px;
          height: calc(100vh - 160px);
          background: white;
          border-right: 1px solid #e2e8f0;
          z-index: 40;
          overflow-y: auto;
        }

        /* Main Container */
        .main-container {
          flex: 1;
          padding: 24px 32px;
          margin-left: 260px;
        }

        /* Dashboard Header */
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }

        .welcome-section h1 {
          font-size: 1.6rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .admin-name {
          color: #3b82f6;
        }

        .welcome-section p {
          color: #64748b;
          font-size: 0.85rem;
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 0.85rem;
          color: #475569;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
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
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
        }

        /* Chart Card */
        .chart-card, .table-card, .actions-card {
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
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .view-all-btn {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.8rem;
          transition: color 0.2s;
        }

        .view-all-btn:hover {
          color: #2563eb;
        }

        /* Chart Area */
        .chart-wrapper {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 240px;
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
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 500;
        }

        .chart-track {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .chart-bar {
          width: 45px;
          border-radius: 8px 8px 0 0;
          position: relative;
          min-height: 30px;
          transition: height 0.3s;
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

        /* Table */
        .table-responsive {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
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
          background: #f8fafc;
        }

        .data-table td {
          color: #334155;
          font-size: 0.8rem;
        }

        .data-table tr:hover {
          background: #fafcff;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #3b82f6;
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

        .view-details-btn {
          background: #f1f5f9;
          border: none;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
          transition: all 0.2s;
        }

        .view-details-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        /* Actions Grid */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .action-button {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: #334155;
          transition: all 0.2s;
        }

        .action-button:hover {
          background: #f1f5f9;
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-2px);
        }

        .action-button span {
          font-size: 1.1rem;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            margin-top: 200px;
          }
          .sidebar-container {
            top: 200px;
            height: calc(100vh - 200px);
          }
          .main-container {
            padding: 16px;
            margin-left: 0;
          }
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .stat-card {
            padding: 16px;
          }
          .stat-value {
            font-size: 1.3rem;
          }
          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .chart-wrapper {
            height: 180px;
          }
          .chart-bar {
            width: 30px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .actions-grid {
            grid-template-columns: 1fr;
          }
          .data-table th, 
          .data-table td {
            padding: 8px 4px;
            font-size: 0.7rem;
          }
          .chart-wrapper {
            flex-direction: column;
            height: auto;
          }
          .chart-item {
            flex-direction: row;
            width: 100%;
            justify-content: space-between;
          }
          .chart-track {
            width: 60%;
          }
          .chart-bar {
            width: 100%;
            height: 30px !important;
            border-radius: 8px;
          }
          .chart-value {
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;