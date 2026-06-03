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
  const [staffData, setStaffData] = useState({
    name: 'Ram Bahadur',
    role: 'Technical Support',
    email: 'ram@ntc.gov.np',
    phone: '9841234567',
    department: 'Customer Support',
    joinDate: '2023-01-15'
  });
  
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    resolvedComplaints: 0,
    averageResponseTime: 0,
    customerSatisfaction: 0,
    totalHoursWorked: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch staff dashboard data
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/staff-login');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      
      const statsResponse = await axios.get('http://localhost:5000/api/staff/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      const activitiesResponse = await axios.get('http://localhost:5000/api/staff/recent-activities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (activitiesResponse.data.success) {
        setRecentActivities(activitiesResponse.data.data);
      }
      
      const tasksResponse = await axios.get('http://localhost:5000/api/staff/upcoming-tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (tasksResponse.data.success) {
        setUpcomingTasks(tasksResponse.data.data);
      }
      
      const notifResponse = await axios.get('http://localhost:5000/api/staff/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (notifResponse.data.success) {
        setNotifications(notifResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    setStats({
      totalAssigned: 24,
      pendingTasks: 8,
      inProgressTasks: 12,
      completedTasks: 4,
      resolvedComplaints: 156,
      averageResponseTime: 2.5,
      customerSatisfaction: 4.6,
      totalHoursWorked: 168
    });
    
    setRecentActivities([
      { id: 1, action: 'Complaint #NTC-2024-001 resolved', time: '2 hours ago', status: 'completed' },
      { id: 2, action: 'New complaint assigned to you', time: '3 hours ago', status: 'pending' },
      { id: 3, action: 'Meeting with team lead', time: '5 hours ago', status: 'completed' },
      { id: 4, action: 'Updated complaint status', time: '1 day ago', status: 'completed' },
      { id: 5, action: 'Responded to customer query', time: '2 days ago', status: 'completed' }
    ]);
    
    setUpcomingTasks([
      { id: 1, title: 'Review pending complaints', priority: 'high', dueDate: '2024-02-20', assignedBy: 'Admin' },
      { id: 2, title: 'Submit weekly report', priority: 'medium', dueDate: '2024-02-21', assignedBy: 'Supervisor' },
      { id: 3, title: 'Customer follow-up calls', priority: 'high', dueDate: '2024-02-19', assignedBy: 'Team Lead' },
      { id: 4, title: 'Update knowledge base', priority: 'low', dueDate: '2024-02-22', assignedBy: 'Admin' }
    ]);
    
    setNotifications([
      { id: 1, message: 'New complaint #NTC-2024-015 assigned to you', time: '5 min ago', read: false },
      { id: 2, message: 'Meeting scheduled at 3:00 PM', time: '1 hour ago', read: false },
      { id: 3, message: 'Your performance review is pending', time: '2 hours ago', read: true },
      { id: 4, message: 'System maintenance tonight at 10 PM', time: '3 hours ago', read: false },
      { id: 5, message: 'Monthly report submitted successfully', time: '5 hours ago', read: true }
    ]);
  };

  const content = {
    np: {
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      overview: 'समग्र दृश्य',
      statistics: 'तथ्यांक',
      recentActivities: 'हालैका गतिविधिहरू',
      upcomingTasks: 'आउँदा कार्यहरू',
      notifications: 'सूचनाहरू',
      totalAssigned: 'कुल तोकिएको',
      pendingTasks: 'विचाराधीन कार्य',
      inProgress: 'प्रगतिमा',
      completed: 'पूरा भएको',
      resolvedComplaints: 'समाधान गरिएका गुनासो',
      avgResponseTime: 'औसत प्रतिक्रिया समय',
      customerSatisfaction: 'ग्राहक सन्तुष्टि',
      hoursWorked: 'काम गरेको समय',
      viewAll: 'सबै हेर्नुहोस्',
      noActivities: 'कुनै गतिविधि छैन',
      noTasks: 'कुनै कार्य छैन',
      priority: 'प्राथमिकता',
      dueDate: 'अन्तिम मिति',
      assignedBy: 'तोक्ने व्यक्ति',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      markAsRead: 'पढेको चिन्ह लगाउनुहोस्',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस गर्नुहोस्'
    },
    en: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      overview: 'Overview',
      statistics: 'Statistics',
      recentActivities: 'Recent Activities',
      upcomingTasks: 'Upcoming Tasks',
      notifications: 'Notifications',
      totalAssigned: 'Total Assigned',
      pendingTasks: 'Pending Tasks',
      inProgress: 'In Progress',
      completed: 'Completed',
      resolvedComplaints: 'Resolved Complaints',
      avgResponseTime: 'Avg Response Time',
      customerSatisfaction: 'Customer Satisfaction',
      hoursWorked: 'Hours Worked',
      viewAll: 'View All',
      noActivities: 'No activities found',
      noTasks: 'No tasks found',
      priority: 'Priority',
      dueDate: 'Due Date',
      assignedBy: 'Assigned By',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      markAsRead: 'Mark as read',
      loading: 'Loading...',
      refresh: 'Refresh'
    }
  };

  const t = content[language];

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

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(language === 'np' ? 'ne-NP' : 'en-US');
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
      />
      
      <div className="dashboard-layout">
        <StaffSidebar 
          language={language}
          staffName={staffData.name}
          staffRole={staffData.role}
        />
        
        <div className="main-content">
          <div className="content-wrapper">
            {/* Welcome Section */}
            <div className="welcome-section">
              <div>
                <h1 className="welcome-title">
                  {t.welcome}, {staffData.name}!
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
                  <h3>{stats.pendingTasks}</h3>
                  <p>{t.pendingTasks}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon yellow">🔄</div>
                <div className="stat-details">
                  <h3>{stats.inProgressTasks}</h3>
                  <p>{t.inProgress}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon green">✅</div>
                <div className="stat-details">
                  <h3>{stats.completedTasks}</h3>
                  <p>{t.completed}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon purple">📊</div>
                <div className="stat-details">
                  <h3>{stats.resolvedComplaints}</h3>
                  <p>{t.resolvedComplaints}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon teal">⏱️</div>
                <div className="stat-details">
                  <h3>{stats.averageResponseTime}h</h3>
                  <p>{t.avgResponseTime}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon pink">⭐</div>
                <div className="stat-details">
                  <h3>{stats.customerSatisfaction}/5</h3>
                  <p>{t.customerSatisfaction}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon indigo">💼</div>
                <div className="stat-details">
                  <h3>{stats.totalHoursWorked}h</h3>
                  <p>{t.hoursWorked}</p>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="two-columns">
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
                    recentActivities.slice(0, 5).map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className={`activity-dot ${activity.status}`}></div>
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

              {/* Upcoming Tasks */}
              <div className="tasks-section">
                <div className="section-header">
                  <h2>✅ {t.upcomingTasks}</h2>
                  <button className="view-all-btn" onClick={() => navigate('/staff/tasks')}>
                    {t.viewAll} →
                  </button>
                </div>
                <div className="tasks-list">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map(task => (
                      <div key={task.id} className="task-item">
                        <div className="task-header">
                          <h4>{task.title}</h4>
                          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </div>
                        <div className="task-details">
                          <span>📅 {t.dueDate}: {formatDate(task.dueDate)}</span>
                          <span>👤 {t.assignedBy}: {task.assignedBy}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">✅</span>
                      <p>{t.noTasks}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="notifications-section">
              <div className="section-header">
                <h2>🔔 {t.notifications}</h2>
                <button className="mark-read-btn" onClick={() => {
                  setNotifications(notifications.map(n => ({ ...n, read: true })));
                }}>
                  {t.markAsRead} →
                </button>
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
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
                    <p>No notifications</p>
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

        /* Dashboard Layout - Fixed positioning for sidebar */
        .dashboard-layout {
          display: flex;
          height: calc(100vh - 195px);
          margin-top: 195px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        /* Main Content - Scrollable area */
        .main-content {
          flex: 1;
          width: calc(100% - 260px);
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        /* Custom scrollbar for main content */
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

        .main-content::-webkit-scrollbar-thumb:hover {
          background: #0277bd;
        }

        /* Content Wrapper */
        .content-wrapper {
          padding: 24px 32px;
          min-height: 100%;
        }

        /* Welcome Section */
        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          padding: 24px 28px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
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

        /* Statistics Grid */
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
          gap: 14px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          cursor: pointer;
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
          flex-shrink: 0;
        }

        .stat-icon.blue { background: #e3f2fd; color: #1565c0; }
        .stat-icon.orange { background: #fff3e0; color: #f57c00; }
        .stat-icon.yellow { background: #fff8e1; color: #f9a825; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.purple { background: #f3e5f5; color: #7b1fa2; }
        .stat-icon.teal { background: #e0f2f1; color: #00695c; }
        .stat-icon.pink { background: #fce4ec; color: #c2185b; }
        .stat-icon.indigo { background: #e8eaf6; color: #283593; }

        .stat-details {
          flex: 1;
          min-width: 0;
        }

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

        /* Two Columns Layout */
        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        /* Section Common Styles */
        .activity-section, .tasks-section, .notifications-section {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s ease;
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

        .view-all-btn, .mark-read-btn {
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

        .view-all-btn:hover, .mark-read-btn:hover {
          background: #e0f2fe;
        }

        /* Activity List */
        .activity-list, .tasks-list, .notifications-list {
          padding: 0;
          max-height: 350px;
          overflow-y: auto;
        }

        /* Custom scrollbar for lists */
        .activity-list::-webkit-scrollbar,
        .tasks-list::-webkit-scrollbar,
        .notifications-list::-webkit-scrollbar {
          width: 4px;
        }

        .activity-list::-webkit-scrollbar-track,
        .tasks-list::-webkit-scrollbar-track,
        .notifications-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .activity-list::-webkit-scrollbar-thumb,
        .tasks-list::-webkit-scrollbar-thumb,
        .notifications-list::-webkit-scrollbar-thumb {
          background: #0288d1;
          border-radius: 4px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .activity-item:hover {
          background: #f8fafc;
        }

        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
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
          font-weight: 500;
        }

        .activity-time {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        /* Task Items */
        .task-item {
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .task-item:hover {
          background: #f8fafc;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .task-header h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
        }

        .priority-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .task-details {
          display: flex;
          gap: 16px;
          font-size: 0.7rem;
          color: #64748b;
          flex-wrap: wrap;
        }

        /* Notifications */
        .notifications-section {
          margin-bottom: 0;
        }

        .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
          cursor: pointer;
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
          font-weight: 500;
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
          flex-shrink: 0;
        }

        /* Empty State */
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

        .empty-state p {
          font-size: 0.85rem;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          
          .stat-details h3 {
            font-size: 1.4rem;
          }
        }

        @media (max-width: 992px) {
          .two-columns {
            grid-template-columns: 1fr;
            gap: 20px;
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
            gap: 12px;
          }

          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 20px;
          }
          
          .welcome-title {
            font-size: 1.4rem;
          }

          .task-details {
            flex-direction: column;
            gap: 4px;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
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
          
          .activity-item, .task-item, .notification-item {
            padding: 12px 16px;
          }
          
          .activity-action, .notification-content p {
            font-size: 0.8rem;
          }
          
          .task-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;