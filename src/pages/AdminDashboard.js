// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
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
    { id: 1, ticketId: 'NTC-2024-001', name: 'रमेश केसी', enName: 'Ramesh KC', category: 'इन्टरनेट', enCategory: 'Internet', status: 'pending', date: '2024-01-15', priority: 'high' },
    { id: 2, ticketId: 'NTC-2024-002', name: 'सीता शर्मा', enName: 'Sita Sharma', category: 'रिचार्ज', enCategory: 'Recharge', status: 'in-progress', date: '2024-01-14', priority: 'medium' },
    { id: 3, ticketId: 'NTC-2024-003', name: 'हरि प्रसाद', enName: 'Hari Prasad', category: 'सक्रियता', enCategory: 'Activation', status: 'resolved', date: '2024-01-13', priority: 'low' },
    { id: 4, ticketId: 'NTC-2024-004', name: 'गीता अधिकारी', enName: 'Gita Adhikari', category: 'बिलिङ', enCategory: 'Billing', status: 'pending', date: '2024-01-12', priority: 'high' },
    { id: 5, ticketId: 'NTC-2024-005', name: 'विकास न्यौपाने', enName: 'Bikas Neupane', category: 'सिग्नल', enCategory: 'Signal', status: 'in-progress', date: '2024-01-11', priority: 'medium' }
  ]);

  const [chartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [65, 78, 82, 74, 88, 92]
  });

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
      quickActions: 'द्रुत कार्यहरू',
      addComplaint: 'नयाँ गुनासो',
      manageUsers: 'प्रयोगकर्ता',
      generateReport: 'रिपोर्ट',
      viewAnalytics: 'विश्लेषण',
      monthlyTrend: 'मासिक प्रवृत्ति',
      loading: 'लोड हुँदैछ...'
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
      quickActions: 'Quick Actions',
      addComplaint: 'Add Complaint',
      manageUsers: 'Users',
      generateReport: 'Report',
      viewAnalytics: 'Analytics',
      monthlyTrend: 'Monthly Trend',
      loading: 'Loading...'
    }
  };

  const t = content[language];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const getStatusClass = (status) => {
    const classes = { pending: 'status-pending', 'in-progress': 'status-progress', resolved: 'status-resolved' };
    return classes[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    const texts = {
      np: { pending: 'विचाराधीन', 'in-progress': 'प्रगतिमा', resolved: 'समाधान' },
      en: { pending: 'Pending', 'in-progress': 'In Progress', resolved: 'Resolved' }
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

  const getCategoryText = (category, enCategory) => language === 'np' ? category : enCategory;

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
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="dashboard-layout">
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar language={language} />
        </div>
        
        <div className={`main-wrapper ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-icon">👋</div>
              <div className="welcome-text">
                <h1>{t.welcomeBack}, <span className="admin-name">Admin</span></h1>
                <p>{t.dashboard}</p>
              </div>
            </div>
            <div className="date-display">
              <span className="date-icon">📅</span>
              <span className="date">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          {/* Stats Cards - Minimalist */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">📊</span>
                <span className="stat-title">{t.totalComplaints}</span>
              </div>
              <div className="stat-value">{stats.totalComplaints.toLocaleString()}</div>
              <div className="stat-change positive">+12% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">⏳</span>
                <span className="stat-title">{t.pendingComplaints}</span>
              </div>
              <div className="stat-value">{stats.pendingComplaints.toLocaleString()}</div>
              <div className="stat-change negative">+5% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">🔄</span>
                <span className="stat-title">{t.inProgressComplaints}</span>
              </div>
              <div className="stat-value">{stats.inProgressComplaints.toLocaleString()}</div>
              <div className="stat-change positive">-3% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">✅</span>
                <span className="stat-title">{t.resolvedComplaints}</span>
              </div>
              <div className="stat-value">{stats.resolvedComplaints.toLocaleString()}</div>
              <div className="stat-change positive">+8% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">👥</span>
                <span className="stat-title">{t.totalUsers}</span>
              </div>
              <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
              <div className="stat-change positive">+15% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">✨</span>
                <span className="stat-title">{t.newUsersToday}</span>
              </div>
              <div className="stat-value">+{stats.newUsersToday}</div>
              <div className="stat-change positive">+2 from yesterday</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">🟢</span>
                <span className="stat-title">{t.activeUsers}</span>
              </div>
              <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
              <div className="stat-change positive">+7% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">⭐</span>
                <span className="stat-title">{t.satisfactionRate}</span>
              </div>
              <div className="stat-value">{stats.satisfactionRate}%</div>
              <div className="stat-change positive">+4% from last month</div>
            </div>
          </div>

          {/* Chart Section - Clean */}
          <div className="chart-card">
            <div className="card-title">
              <h3>{t.monthlyTrend}</h3>
              <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
                {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
              </button>
            </div>
            <div className="chart-container">
              {chartData.datasets.map((value, idx) => (
                <div key={idx} className="chart-item">
                  <div className="chart-label">{chartData.labels[idx]}</div>
                  <div className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        height: `${(value / Math.max(...chartData.datasets)) * 100}%`,
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td className="ticket-id">{complaint.ticketId}</td>
                      <td>{language === 'np' ? complaint.name : complaint.enName}</td>
                      <td>{getCategoryText(complaint.category, complaint.enCategory)}</td>
                      <td><span className={`badge ${getStatusClass(complaint.status)}`}>{getStatusText(complaint.status)}</span></td>
                      <td>{complaint.date}</td>
                      <td><span className={`badge-priority ${getPriorityClass(complaint.priority)}`}>{getPriorityText(complaint.priority)}</span></td>
                      <td><button className="view-btn" onClick={() => navigate(`/admin-complaints/${complaint.id}`)}>View</button></td>
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
            <div className="actions-container">
              <button className="action-btn-minimal" onClick={() => navigate('/admin-complaints/add')}>
                <span>➕</span> {t.addComplaint}
              </button>
              <button className="action-btn-minimal" onClick={() => navigate('/admin-users')}>
                <span>👥</span> {t.manageUsers}
              </button>
              <button className="action-btn-minimal" onClick={() => navigate('/admin-reports/complaints')}>
                <span>📊</span> {t.generateReport}
              </button>
              <button className="action-btn-minimal" onClick={() => navigate('/admin-analytics')}>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* Loading */
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

        /* Layout */
        .dashboard-layout {
          display: flex;
          min-height: calc(100vh - 195px);
          margin-top: 195px;
        }

        .sidebar-wrapper {
          position: fixed;
          top: 195px;
          left: 0;
          width: 260px;
          height: calc(100vh - 195px);
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 40;
          background: white;
          border-right: 1px solid #e2e8f0;
        }

        .sidebar-wrapper.closed {
          left: -260px;
        }

        .main-wrapper {
          flex: 1;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 32px 40px;
          margin-left: 260px;
          max-width: calc(100% - 260px);
        }

        .main-wrapper.full-width {
          margin-left: 0;
          max-width: 100%;
        }

        /* Welcome Section */
        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }

        .welcome-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .welcome-icon {
          font-size: 2.5rem;
        }

        .welcome-text h1 {
          font-size: 1.8rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .admin-name {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-text p {
          color: #64748b;
          font-size: 0.9rem;
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

        .date-icon {
          font-size: 1rem;
        }

        /* Stats Container */
        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
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
        }

        .stat-change.positive {
          color: #10b981;
        }

        .stat-change.negative {
          color: #ef4444;
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
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .toggle-sidebar-btn, .view-link {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .toggle-sidebar-btn:hover, .view-link:hover {
          color: #2563eb;
        }

        /* Chart */
        .chart-container {
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
          font-size: 0.8rem;
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

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

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
        }

        .view-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        /* Actions */
        .actions-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .action-btn-minimal {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
          font-weight: 500;
          color: #334155;
        }

        .action-btn-minimal:hover {
          background: #f1f5f9;
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-1px);
        }

        .action-btn-minimal span {
          font-size: 1.1rem;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
          .actions-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-layout { 
            margin-top: 280px; 
          }
          .sidebar-wrapper { 
            top: 280px; 
            height: calc(100vh - 280px); 
          }
          .main-wrapper { 
            padding: 20px; 
            margin-left: 0;
            max-width: 100%;
          }
          .welcome-section { 
            flex-direction: column; 
            align-items: flex-start;
            gap: 16px;
          }
          .stats-container { 
            grid-template-columns: 1fr;
          }
          .actions-container { 
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
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;