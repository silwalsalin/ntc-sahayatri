// src/pages/StaffDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  
  // Get staff data from localStorage (from login)
  const [staffData, setStaffData] = useState(() => {
    const storedUser = localStorage.getItem('staffUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return {
          id: user.id || null,
          name: user.name || user.nameEn || 'Staff User',
          nameEn: user.nameEn || user.name || 'Staff User',
          role: user.role || 'staff',
          email: user.email || '',
          phone: user.phone || '',
          department: user.department || 'Customer Support',
          joinDate: user.createdAt || user.created_at || new Date().toISOString().split('T')[0]
        };
      } catch (e) {
        return {
          id: null,
          name: 'Staff User',
          nameEn: 'Staff User',
          role: 'staff',
          email: '',
          phone: '',
          department: 'Customer Support',
          joinDate: new Date().toISOString().split('T')[0]
        };
      }
    }
    return {
      id: null,
      name: 'Staff User',
      nameEn: 'Staff User',
      role: 'staff',
      email: '',
      phone: '',
      department: 'Customer Support',
      joinDate: new Date().toISOString().split('T')[0]
    };
  });
  
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    review: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  });
  
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('staffToken') || localStorage.getItem('token');
  };

  // Fetch staff dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        navigate('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch staff statistics
      const statsResponse = await axios.get(`${API_URL}/staff/dashboard`, { headers });
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      // Fetch assigned complaints
      const complaintsResponse = await axios.get(`${API_URL}/complaints/assigned-to-me?limit=10`, { headers });
      
      if (complaintsResponse.data.success && Array.isArray(complaintsResponse.data.data)) {
        const transformedComplaints = complaintsResponse.data.data.map(complaint => ({
          id: complaint.id,
          ticketId: complaint.complaint_number || `NTC-${complaint.id}`,
          name: complaint.name || 'N/A',
          status: complaint.status || 'pending',
          priority: complaint.priority || 'medium',
          date: formatDate(complaint.created_at),
          description: complaint.description || ''
        }));
        setRecentComplaints(transformedComplaints);
        
        // Create activities from complaints
        const activities = transformedComplaints.slice(0, 5).map(complaint => ({
          id: complaint.id,
          action: `Complaint #${complaint.ticketId} is ${complaint.status}`,
          time: complaint.date,
          status: complaint.status
        }));
        setRecentActivities(activities);
      }
      
      // Fetch notifications
      const notificationsResponse = await axios.get(`${API_URL}/notifications?limit=5`, { headers });
      
      if (notificationsResponse.data.success && Array.isArray(notificationsResponse.data.data)) {
        setNotifications(notificationsResponse.data.data);
      } else {
        // Sample notifications
        setNotifications([
          { id: 1, message: 'Welcome to your dashboard', time: 'Just now', read: false },
          { id: 2, message: 'Check your assigned complaints', time: '1 hour ago', read: false }
        ]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set sample data if backend not available
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    setStats({
      totalAssigned: 5,
      pending: 2,
      inProgress: 2,
      resolved: 1,
      review: 0,
      highPriority: 1,
      mediumPriority: 3,
      lowPriority: 1
    });
    
    setRecentComplaints([
      { id: 1, ticketId: 'NTC-2024-001', name: 'राम बहादुर', status: 'in-progress', priority: 'high', date: '2024-02-20', description: 'Internet connection issue' },
      { id: 2, ticketId: 'NTC-2024-002', name: 'सीता शर्मा', status: 'pending', priority: 'medium', date: '2024-02-19', description: 'Billing problem' },
      { id: 3, ticketId: 'NTC-2024-003', name: 'हरि प्रसाद', status: 'resolved', priority: 'low', date: '2024-02-18', description: 'Recharge issue' }
    ]);
    
    setRecentActivities([
      { id: 1, action: 'Complaint #NTC-2024-001 assigned to you', time: '2 hours ago', status: 'pending' },
      { id: 2, action: 'Updated complaint #NTC-2024-002 status', time: '5 hours ago', status: 'completed' },
      { id: 3, action: 'Resolved complaint #NTC-2024-003', time: '1 day ago', status: 'completed' }
    ]);
    
    setNotifications([
      { id: 1, message: 'New complaint assigned to you', time: '5 min ago', read: false },
      { id: 2, message: 'Your performance review is pending', time: '2 hours ago', read: true }
    ]);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString(language === 'np' ? 'ne-NP' : 'en-US');
    } catch (error) {
      return '-';
    }
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    if (!date) return 'Just now';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Just now';
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch (error) {
      return 'Just now';
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/login');
    } else {
      // Update staff data from localStorage
      try {
        const userData = JSON.parse(user);
        setStaffData(prev => ({
          ...prev,
          id: userData.id || prev.id,
          name: userData.name || userData.nameEn || prev.name,
          nameEn: userData.nameEn || userData.name || prev.nameEn,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
          role: userData.role || prev.role
        }));
      } catch (e) {
        console.error('Error parsing staff user data:', e);
      }
      
      fetchDashboardData();
    }
  }, [navigate]);

  const content = {
    np: {
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      overview: 'समग्र दृश्य',
      statistics: 'तथ्यांक',
      recentActivities: 'हालैका गतिविधिहरू',
      assignedComplaints: 'तोकिएका गुनासोहरू',
      notifications: 'सूचनाहरू',
      totalAssigned: 'कुल तोकिएको',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      underReview: 'समीक्षामा',
      highPriority: 'उच्च प्राथमिकता',
      mediumPriority: 'मध्यम प्राथमिकता',
      lowPriority: 'न्यून प्राथमिकता',
      viewAll: 'सबै हेर्नुहोस्',
      noActivities: 'कुनै गतिविधि छैन',
      noComplaints: 'कुनै गुनासो छैन',
      noNotifications: 'कुनै सूचना छैन',
      priority: 'प्राथमिकता',
      dueDate: 'अन्तिम मिति',
      assignedBy: 'तोक्ने व्यक्ति',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      markAsRead: 'पढेको चिन्ह लगाउनुहोस्',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस गर्नुहोस्',
      complaintId: 'गुनासो नम्बर',
      complainant: 'उजुरीकर्ता',
      status: 'स्थिति',
      date: 'मिति',
      viewDetails: 'विवरण हेर्नुहोस्'
    },
    en: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      overview: 'Overview',
      statistics: 'Statistics',
      recentActivities: 'Recent Activities',
      assignedComplaints: 'Assigned Complaints',
      notifications: 'Notifications',
      totalAssigned: 'Total Assigned',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      underReview: 'Under Review',
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      viewAll: 'View All',
      noActivities: 'No activities found',
      noComplaints: 'No complaints found',
      noNotifications: 'No notifications',
      priority: 'Priority',
      dueDate: 'Due Date',
      assignedBy: 'Assigned By',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      markAsRead: 'Mark as read',
      loading: 'Loading...',
      refresh: 'Refresh',
      complaintId: 'Complaint ID',
      complainant: 'Complainant',
      status: 'Status',
      date: 'Date',
      viewDetails: 'View Details'
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
    if (language === 'np') {
      const texts = {
        pending: 'विचाराधीन',
        'in-progress': 'प्रगतिमा',
        resolved: 'समाधान',
        review: 'समीक्षामा'
      };
      return texts[status] || status;
    }
    const texts = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      resolved: 'Resolved',
      review: 'Under Review'
    };
    return texts[status] || status;
  };

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
      const texts = {
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'न्यून'
      };
      return texts[priority] || priority;
    }
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = getAuthToken();
      await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
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
    <div className="staff-dashboard">
      <StaffHeader 
        language={language}
        setLanguage={setLanguage}
        staffName={staffData.name}
        staffRole={staffData.role}
        staffEmail={staffData.email}
      />
      
      <div className="dashboard-layout">
        <StaffSidebar 
          language={language}
          staffName={staffData.name}
          staffRole={staffData.role}
          staffEmail={staffData.email}
        />
        
        <div className="main-content">
          <div className="content-wrapper">
            {/* Welcome Section */}
            <div className="welcome-section">
              <div>
                <h1 className="welcome-title">
                  {t.welcome}, {language === 'np' ? staffData.name : staffData.nameEn}!
                </h1>
                <p className="welcome-subtitle">{t.overview} - {t.dashboard}</p>
              </div>
              <button className="refresh-btn" onClick={fetchDashboardData}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">📋</div>
                <div className="stat-details">
                  <h3>{stats.totalAssigned}</h3>
                  <p>{t.totalAssigned}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon orange">⏳</div>
                <div className="stat-details">
                  <h3>{stats.pending}</h3>
                  <p>{t.pending}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon yellow">🔄</div>
                <div className="stat-details">
                  <h3>{stats.inProgress}</h3>
                  <p>{t.inProgress}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon green">✅</div>
                <div className="stat-details">
                  <h3>{stats.resolved}</h3>
                  <p>{t.resolved}</p>
                </div>
              </div>
            </div>

            {/* Priority Statistics */}
            <div className="priority-stats">
              <div className="priority-stat priority-high-bg">
                <span className="priority-label">🔴 {t.highPriority}</span>
                <span className="priority-count">{stats.highPriority || 0}</span>
              </div>
              <div className="priority-stat priority-medium-bg">
                <span className="priority-label">🟡 {t.mediumPriority}</span>
                <span className="priority-count">{stats.mediumPriority || 0}</span>
              </div>
              <div className="priority-stat priority-low-bg">
                <span className="priority-label">🟢 {t.lowPriority}</span>
                <span className="priority-count">{stats.lowPriority || 0}</span>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="two-columns">
              {/* Assigned Complaints */}
              <div className="complaints-section">
                <div className="section-header">
                  <h2>📋 {t.assignedComplaints}</h2>
                  <button className="view-all-btn" onClick={() => navigate('/staff/complaints')}>
                    {t.viewAll} →
                  </button>
                </div>
                <div className="complaints-list">
                  {recentComplaints.length > 0 ? (
                    recentComplaints.slice(0, 5).map(complaint => (
                      <div key={complaint.id} className="complaint-item">
                        <div className="complaint-header">
                          <span className="complaint-id">{complaint.ticketId}</span>
                          <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                            {getStatusText(complaint.status)}
                          </span>
                        </div>
                        <div className="complaint-body">
                          <p className="complaint-name">{complaint.name}</p>
                          <p className="complaint-desc">{complaint.description?.substring(0, 60)}...</p>
                          <div className="complaint-footer">
                            <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                              {getPriorityText(complaint.priority)}
                            </span>
                            <span className="complaint-date">📅 {complaint.date}</span>
                            <button 
                              className="view-btn"
                              onClick={() => navigate(`/staff/complaints/${complaint.id}`)}
                            >
                              {t.viewDetails}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">📭</span>
                      <p>{t.noComplaints}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="activity-section">
                <div className="section-header">
                  <h2>📝 {t.recentActivities}</h2>
                  <button className="view-all-btn" onClick={() => navigate('/staff/activities')}>
                    {t.viewAll} →
                  </button>
                </div>
                <div className="activity-list">
                  {recentActivities.length > 0 ? (
                    recentActivities.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className={`activity-dot ${activity.status === 'resolved' ? 'completed' : 'pending'}`}></div>
                        <div className="activity-content">
                          <p className="activity-action">{activity.action}</p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">📭</span>
                      <p>{t.noActivities}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="notifications-section">
              <div className="section-header">
                <h2>🔔 {t.notifications}</h2>
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                    >
                      <div className="notification-content">
                        <p>{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                      {!notif.read && <div className="unread-dot"></div>}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">🔕</span>
                    <p>{t.noNotifications}</p>
                  </div>
                )}
              </div>
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

        .staff-dashboard {
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

        .content-wrapper {
          padding: 24px 32px;
          min-height: 100%;
        }

        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          padding: 24px 28px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 16px;
        }

        .welcome-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .welcome-subtitle {
          color: #64748b;
          font-size: 0.9rem;
        }

        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #0288d1;
          color: #0288d1;
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border-color: #0288d1;
        }

        .stat-icon {
          width: 55px;
          height: 55px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }

        .stat-icon.blue { background: #e3f2fd; color: #1565c0; }
        .stat-icon.orange { background: #fff3e0; color: #f57c00; }
        .stat-icon.yellow { background: #fff8e1; color: #f9a825; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }

        .stat-details h3 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .stat-details p {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .priority-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .priority-stat {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-radius: 12px;
          background: white;
          border: 1px solid #e2e8f0;
        }

        .priority-high-bg { border-left: 4px solid #dc2626; }
        .priority-medium-bg { border-left: 4px solid #f59e0b; }
        .priority-low-bg { border-left: 4px solid #10b981; }

        .priority-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
        }

        .priority-count {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 28px;
        }

        .complaints-section, .activity-section, .notifications-section {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .section-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .view-all-btn {
          background: none;
          border: none;
          color: #0288d1;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .view-all-btn:hover {
          background: #e0f2fe;
        }

        .complaints-list, .activity-list, .notifications-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .complaint-item {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .complaint-item:hover {
          background: #f8fafc;
        }

        .complaint-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .complaint-id {
          font-family: monospace;
          font-weight: 600;
          color: #0288d1;
          font-size: 0.85rem;
        }

        .status-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .status-review { background: #e0e7ff; color: #4f46e5; }

        .complaint-name {
          font-weight: 500;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .complaint-desc {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 10px;
        }

        .complaint-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .priority-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 600;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .complaint-date {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .view-btn {
          background: #0288d1;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: #0277bd;
          transform: translateY(-1px);
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .activity-item:hover {
          background: #f8fafc;
        }

        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
        }

        .activity-dot.completed { background: #10b981; }
        .activity-dot.pending { background: #f59e0b; }
        .activity-dot.in-progress { background: #3b82f6; }

        .activity-content {
          flex: 1;
        }

        .activity-action {
          font-size: 0.85rem;
          color: #334155;
          margin-bottom: 4px;
        }

        .activity-time {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .notifications-section {
          margin-bottom: 0;
        }

        .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: #f8fafc;
        }

        .notification-item.unread {
          background: #e0f2fe;
        }

        .notification-content {
          flex: 1;
        }

        .notification-content p {
          font-size: 0.85rem;
          color: #334155;
          margin-bottom: 4px;
        }

        .notification-time {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #0288d1;
          border-radius: 50%;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 12px;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .two-columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .staff-dashboard {
            height: auto;
            overflow: auto;
          }
          
          .dashboard-layout {
            flex-direction: column;
            height: auto;
            margin-top: 150px;
            overflow: visible;
          }
          
          .main-content {
            margin-left: 0;
            width: 100%;
            overflow-y: visible;
          }
          
          .content-wrapper {
            padding: 16px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .priority-stats {
            flex-direction: column;
          }
          
          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
          }
          
          .welcome-title {
            font-size: 1.4rem;
          }
        }

        @media (max-width: 480px) {
          .stat-card {
            padding: 16px;
          }
          
          .stat-icon {
            width: 45px;
            height: 45px;
            font-size: 1.5rem;
          }
          
          .stat-details h3 {
            font-size: 1.2rem;
          }
          
          .complaint-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;