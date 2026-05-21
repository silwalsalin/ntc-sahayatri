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
          <div className="top-bar">
            <button className="toggle-btn" onClick={toggleSidebar}>
              {sidebarOpen ? '←' : '→'}
            </button>
            <div className="greeting">
              <h1>{t.welcomeBack}, Admin</h1>
              <p>{t.dashboard}</p>
            </div>
            <div className="date-badge">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Stats Cards */}
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
            <div className="card-header">
              <h3>{t.monthlyTrend}</h3>
            </div>
            <div className="chart-container">
              {chartData.datasets.map((value, idx) => (
                <div key={idx} className="chart-bar">
                  <div className="bar-label">{chartData.labels[idx]}</div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        height: `${(value / Math.max(...chartData.datasets)) * 100}%`,
                        backgroundColor: `hsl(${210 + idx * 25}, 65%, 55%)`
                      }}
                    >
                      <span className="bar-value">{value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="table-card">
            <div className="card-header">
              <h3>{t.recentComplaints}</h3>
              <button className="link-btn" onClick={() => navigate('/admin-complaints')}>
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
                      <td>{complaint.date}</td>
                      <td><span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>{getPriorityText(complaint.priority)}</span></td>
                      <td><button className="action-btn" onClick={() => navigate(`/admin-complaints/${complaint.id}`)}>👁️ {t.viewDetails}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-card">
            <div className="card-header">
              <h3>{t.quickActions}</h3>
            </div>
            <div className="actions-grid">
              <button className="action-item" onClick={() => navigate('/admin-complaints/add')}>
                <span className="action-emoji">➕</span>
                <span>{t.addComplaint}</span>
              </button>
              <button className="action-item" onClick={() => navigate('/admin-users')}>
                <span className="action-emoji">👥</span>
                <span>{t.manageUsers}</span>
              </button>
              <button className="action-item" onClick={() => navigate('/admin-reports/complaints')}>
                <span className="action-emoji">📊</span>
                <span>{t.generateReport}</span>
              </button>
              <button className="action-item" onClick={() => navigate('/admin-analytics')}>
                <span className="action-emoji">📈</span>
                <span>{t.viewAnalytics}</span>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Poppins', 'Mangal', sans-serif;
          background: #f3f4f6;
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
          border: 3px solid #e5e7eb;
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
          transition: left 0.25s ease;
          z-index: 50;
          background: white;
          border-right: 1px solid #e5e7eb;
        }

        .sidebar-wrapper.closed {
          left: -260px;
        }

        .main-wrapper {
          flex: 1;
          transition: margin-left 0.25s ease;
          padding: 24px 32px;
          margin-left: 260px;
          max-width: calc(100% - 260px);
        }

        .main-wrapper.full-width {
          margin-left: 0;
          max-width: 100%;
        }

        /* Top Bar */
        .top-bar {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .toggle-btn {
          background: white;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-size: 1rem;
          color: #374151;
        }

        .toggle-btn:hover {
          background: #f9fafb;
          border-color: #3b82f6;
        }

        .greeting h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }

        .greeting p {
          color: #6b7280;
          font-size: 0.85rem;
        }

        .date-badge {
          margin-left: auto;
          padding: 6px 14px;
          background: white;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s;
          border: 1px solid #e5e7eb;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #d1d5db;
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
          color: #111827;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 4px;
        }

        /* Chart Card */
        .chart-card, .table-card, .actions-card {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .link-btn {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.8rem;
          transition: color 0.2s;
        }

        .link-btn:hover {
          color: #2563eb;
        }

        /* Chart */
        .chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 220px;
          gap: 12px;
        }

        .chart-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .bar-label {
          font-size: 0.7rem;
          color: #6b7280;
        }

        .bar-track {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .bar-fill {
          width: 45px;
          border-radius: 6px 6px 0 0;
          position: relative;
          transition: height 0.3s;
          min-height: 24px;
        }

        .bar-value {
          position: absolute;
          top: -22px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
        }

        /* Table */
        .table-responsive {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .data-table th,
        .data-table td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }

        .data-table th {
          color: #6b7280;
          font-weight: 500;
        }

        .data-table tr:hover {
          background: #f9fafb;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 500;
          color: #3b82f6;
        }

        .status-badge, .priority-badge {
          display: inline-block;
          padding: 4px 10px;
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

        .action-btn {
          background: #f3f4f6;
          border: none;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
        }

        .action-btn:hover {
          background: #e5e7eb;
        }

        /* Actions Grid */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .action-item {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
          color: #374151;
        }

        .action-item:hover {
          background: #f3f4f6;
          border-color: #3b82f6;
          transform: translateY(-1px);
        }

        .action-emoji {
          font-size: 1.2rem;
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
          .dashboard-layout { 
            margin-top: 280px; 
          }
          .sidebar-wrapper { 
            top: 280px; 
            height: calc(100vh - 280px); 
          }
          .main-wrapper { 
            padding: 16px; 
            margin-left: 0;
            max-width: 100%;
          }
          .top-bar { 
            flex-wrap: wrap; 
          }
          .date-badge { 
            margin-left: 0; 
          }
          .stats-grid { 
            grid-template-columns: repeat(2, 1fr);
          }
          .actions-grid { 
            grid-template-columns: repeat(2, 1fr);
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
          .chart-container { 
            flex-direction: column; 
            height: auto; 
          }
          .chart-bar { 
            flex-direction: row; 
            width: 100%; 
            justify-content: space-between; 
          }
          .bar-track { 
            width: 60%; 
          }
          .bar-fill { 
            width: 100%; 
            height: 30px !important; 
            border-radius: 6px; 
          }
          .bar-value { 
            top: 50%; 
            left: 10px; 
            transform: translateY(-50%); 
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;