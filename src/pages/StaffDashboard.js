// src/pages/StaffDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  
  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Format number with Nepali digits
  const formatNumber = (num) => {
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return num.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    }
    return num.toString();
  };

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

  // Format relative time with language support
  const formatRelativeTime = (date) => {
    if (!date) return language === 'np' ? 'अहिले' : 'Just now';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return language === 'np' ? 'अहिले' : 'Just now';
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return language === 'np' ? 'अहिले' : 'Just now';
      if (diffMins < 60) {
        return language === 'np' 
          ? `${formatNumber(diffMins)} मिनेट अघि`
          : `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      }
      if (diffHours < 24) {
        return language === 'np'
          ? `${formatNumber(diffHours)} घण्टा अघि`
          : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      }
      return language === 'np'
        ? `${formatNumber(diffDays)} दिन अघि`
        : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch (error) {
      return language === 'np' ? 'अहिले' : 'Just now';
    }
  };

  // Fetch staff dashboard data from backend
  const fetchDashboardData = async () => {
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
          enName: complaint.name || 'N/A',
          status: complaint.status || 'pending',
          priority: complaint.priority || 'medium',
          date: formatDate(complaint.created_at),
          enDate: formatDateEnglish(complaint.created_at),
          description: complaint.description || '',
          enDescription: complaint.description || ''
        }));
        setRecentComplaints(transformedComplaints);
        
        // Create activities from complaints
        const activities = transformedComplaints.slice(0, 5).map(complaint => ({
          id: complaint.id,
          action: language === 'np' 
            ? `गुनासो #${complaint.ticketId} ${getStatusText(complaint.status)} मा छ`
            : `Complaint #${complaint.ticketId} is ${complaint.status}`,
          time: formatRelativeTime(complaint.date),
          status: complaint.status
        }));
        setRecentActivities(activities);
      }
      
      // Fetch notifications
      const notificationsResponse = await axios.get(`${API_URL}/notifications?limit=5`, { headers });
      
      if (notificationsResponse.data.success && Array.isArray(notificationsResponse.data.data)) {
        const transformedNotifications = notificationsResponse.data.data.map(n => ({
          id: n.id,
          message: language === 'np' ? n.message_np || n.message : n.message_en || n.message,
          time: formatRelativeTime(n.created_at || n.createdAt),
          read: n.read || false
        }));
        setNotifications(transformedNotifications);
      } else {
        // Sample notifications
        setNotifications([
          { id: 1, message: language === 'np' ? 'तपाईंको ड्यासबोर्डमा स्वागत छ' : 'Welcome to your dashboard', time: language === 'np' ? 'अहिले' : 'Just now', read: false },
          { id: 2, message: language === 'np' ? 'तपाईंलाई तोकिएका गुनासोहरू जाँच गर्नुहोस्' : 'Check your assigned complaints', time: language === 'np' ? '१ घण्टा अघि' : '1 hour ago', read: false }
        ]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set sample data if backend not available
      setSampleData();
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
      { id: 1, ticketId: 'NTC-2024-001', name: 'राम बहादुर', enName: 'Ram Bahadur', status: 'in-progress', priority: 'high', date: '२०८०-११-०७', enDate: '2024-02-20', description: 'इन्टरनेट जडान समस्या', enDescription: 'Internet connection issue' },
      { id: 2, ticketId: 'NTC-2024-002', name: 'सीता शर्मा', enName: 'Sita Sharma', status: 'pending', priority: 'medium', date: '२०८०-११-०६', enDate: '2024-02-19', description: 'बिलिङ समस्या', enDescription: 'Billing problem' },
      { id: 3, ticketId: 'NTC-2024-003', name: 'हरि प्रसाद', enName: 'Hari Prasad', status: 'resolved', priority: 'low', date: '२०८०-११-०५', enDate: '2024-02-18', description: 'रिचार्ज समस्या', enDescription: 'Recharge issue' }
    ]);
    
    setRecentActivities([
      { id: 1, action: language === 'np' ? 'गुनासो #NTC-2024-001 तपाईंलाई तोकियो' : 'Complaint #NTC-2024-001 assigned to you', time: language === 'np' ? '२ घण्टा अघि' : '2 hours ago', status: 'pending' },
      { id: 2, action: language === 'np' ? 'गुनासो #NTC-2024-002 को स्थिति अपडेट गरियो' : 'Updated complaint #NTC-2024-002 status', time: language === 'np' ? '५ घण्टा अघि' : '5 hours ago', status: 'completed' },
      { id: 3, action: language === 'np' ? 'गुनासो #NTC-2024-003 समाधान गरियो' : 'Resolved complaint #NTC-2024-003', time: language === 'np' ? '१ दिन अघि' : '1 day ago', status: 'completed' }
    ]);
    
    setNotifications([
      { id: 1, message: language === 'np' ? 'तपाईंलाई नयाँ गुनासो तोकियो' : 'New complaint assigned to you', time: language === 'np' ? '५ मिनेट अघि' : '5 min ago', read: false },
      { id: 2, message: language === 'np' ? 'तपाईंको कार्यसम्पादन समीक्षा बाँकी छ' : 'Your performance review is pending', time: language === 'np' ? '२ घण्टा अघि' : '2 hours ago', read: true }
    ]);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      if (language === 'np') {
        const year = d.getFullYear() - 57;
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        const yearNp = year.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        const monthNp = month.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        const dayNp = day.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        return `${yearNp}-${monthNp}-${dayNp}`;
      }
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  // Format date in English
  const formatDateEnglish = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '-';
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
      refresh: 'रिफ्रेस गर्नुहोस्',
      complaintId: 'गुनासो नम्बर',
      complainant: 'उजुरीकर्ता',
      status: 'स्थिति',
      date: 'मिति',
      viewDetails: 'विवरण हेर्नुहोस्',
      assigned: 'तोकिएको',
      justNow: 'अहिले'
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
      refresh: 'Refresh',
      complaintId: 'Complaint ID',
      complainant: 'Complainant',
      status: 'Status',
      date: 'Date',
      viewDetails: 'View Details',
      assigned: 'Assigned',
      justNow: 'Just now'
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

  const getComplaintName = (complaint) => {
    return language === 'np' ? complaint.name : complaint.enName;
  };

  const getComplaintDescription = (complaint) => {
    const desc = language === 'np' ? complaint.description : complaint.enDescription;
    return desc ? desc.substring(0, 60) + '...' : '';
  };

  const getComplaintDate = (complaint) => {
    return language === 'np' ? complaint.date : complaint.enDate;
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

            {/* Statistics Cards - Updated with formatNumber */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">📋</div>
                <div className="stat-details">
                  <h3>{formatNumber(stats.totalAssigned)}</h3>
                  <p>{t.totalAssigned}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon orange">⏳</div>
                <div className="stat-details">
                  <h3>{formatNumber(stats.pending)}</h3>
                  <p>{t.pending}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon yellow">🔄</div>
                <div className="stat-details">
                  <h3>{formatNumber(stats.inProgress)}</h3>
                  <p>{t.inProgress}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon green">✅</div>
                <div className="stat-details">
                  <h3>{formatNumber(stats.resolved)}</h3>
                  <p>{t.resolved}</p>
                </div>
              </div>
            </div>

            {/* Priority Statistics - Updated with formatNumber */}
            <div className="priority-stats">
              <div className="priority-stat priority-high-bg">
                <span className="priority-label">🔴 {t.highPriority}</span>
                <span className="priority-count">{formatNumber(stats.highPriority || 0)}</span>
              </div>
              <div className="priority-stat priority-medium-bg">
                <span className="priority-label">🟡 {t.mediumPriority}</span>
                <span className="priority-count">{formatNumber(stats.mediumPriority || 0)}</span>
              </div>
              <div className="priority-stat priority-low-bg">
                <span className="priority-label">🟢 {t.lowPriority}</span>
                <span className="priority-count">{formatNumber(stats.lowPriority || 0)}</span>
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
                          <p className="complaint-name">{getComplaintName(complaint)}</p>
                          <p className="complaint-desc">{getComplaintDescription(complaint)}</p>
                          <div className="complaint-footer">
                            <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                              {getPriorityText(complaint.priority)}
                            </span>
                            <span className="complaint-date">📅 {getComplaintDate(complaint)}</span>
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

      <style>{`
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