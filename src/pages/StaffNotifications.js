// src/pages/StaffNotifications.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffNotifications = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [backendStatus, setBackendStatus] = useState('checking');

  const [staffData, setStaffData] = useState({
    name: 'Ram Bahadur',
    role: 'Technical Support',
    email: 'ram@ntc.gov.np',
    phone: '9841234567',
    department: 'Customer Support'
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/staff/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const transformedNotifications = response.data.data.map(notification => transformNotificationData(notification));
        setNotifications(transformedNotifications);
        setBackendStatus('connected');
      } else {
        setNotifications(getSampleNotifications());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(getSampleNotifications());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Transform notification data
  const transformNotificationData = (notification) => ({
    id: notification.id,
    title: notification.title || 'N/A',
    enTitle: notification.enTitle || notification.title || 'N/A',
    message: notification.message || 'N/A',
    enMessage: notification.enMessage || notification.message || 'N/A',
    type: notification.type || 'info',
    read: notification.read || false,
    date: notification.date ? formatNepaliDate(notification.date) : formatNepaliDate(notification.createdAt),
    enDate: notification.date ? formatEnglishDate(notification.date) : formatEnglishDate(notification.createdAt),
    createdAt: notification.createdAt,
    priority: notification.priority || 'medium',
    actionUrl: notification.actionUrl || null,
    actionLabel: notification.actionLabel || null,
    sender: notification.sender || 'System'
  });

  const formatNepaliDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      const year = d.getFullYear() - 57;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '-';
    }
  };

  const formatEnglishDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toISOString().split('T')[0];
    } catch (error) {
      return '-';
    }
  };

  // Get sample notifications
  const getSampleNotifications = () => {
    return [
      { 
        id: 1, 
        title: 'नयाँ गुनासो तोकियो', 
        enTitle: 'New Complaint Assigned',
        message: 'तपाईंलाई एउटा नयाँ गुनासो #NTC-2024-001 तोकिएको छ। कृपया यसको समीक्षा गर्नुहोस्।',
        enMessage: 'A new complaint #NTC-2024-001 has been assigned to you. Please review it.',
        type: 'assignment',
        read: false,
        date: '२०८०-०१-१५',
        enDate: '2024-01-15',
        createdAt: '2024-01-15T10:30:00',
        priority: 'high',
        actionUrl: '/staff/complaints/assigned',
        actionLabel: 'गुनासो हेर्नुहोस्',
        sender: 'Admin'
      },
      { 
        id: 2, 
        title: 'गुनासो समाधान भयो', 
        enTitle: 'Complaint Resolved',
        message: 'तपाईंले समाधान गर्नुभएको गुनासो #NTC-2024-002 लाई ग्राहकले पुष्टि गरेको छ।',
        enMessage: 'The complaint #NTC-2024-002 you resolved has been confirmed by the customer.',
        type: 'resolution',
        read: false,
        date: '२०८०-०१-१८',
        enDate: '2024-01-18',
        createdAt: '2024-01-18T14:15:00',
        priority: 'medium',
        actionUrl: '/staff/complaints/resolved',
        actionLabel: 'विवरण हेर्नुहोस्',
        sender: 'System'
      },
      { 
        id: 3, 
        title: 'बैठकको सूचना', 
        enTitle: 'Meeting Reminder',
        message: 'आज दिउँसो ३:०० बजे टोली बैठक छ। कृपया समयमै उपस्थित हुनुहोस्।',
        enMessage: 'Team meeting today at 3:00 PM. Please be present on time.',
        type: 'reminder',
        read: true,
        date: '२०८०-०१-२०',
        enDate: '2024-01-20',
        createdAt: '2024-01-20T09:00:00',
        priority: 'high',
        actionUrl: null,
        actionLabel: null,
        sender: 'Supervisor'
      },
      { 
        id: 4, 
        title: 'प्रशिक्षण कार्यक्रम', 
        enTitle: 'Training Program',
        message: 'आगामी सोमबार प्राविधिक प्रशिक्षण कार्यक्रम आयोजना हुँदैछ। सहभागिताको लागि दर्ता गर्नुहोस्।',
        enMessage: 'Technical training program is being organized next Monday. Register to participate.',
        type: 'training',
        read: false,
        date: '२०८०-०१-२२',
        enDate: '2024-01-22',
        createdAt: '2024-01-22T11:00:00',
        priority: 'medium',
        actionUrl: '/staff/training',
        actionLabel: 'दर्ता गर्नुहोस्',
        sender: 'HR Department'
      },
      { 
        id: 5, 
        title: 'प्रदर्शन समीक्षा', 
        enTitle: 'Performance Review',
        message: 'तपाईंको मासिक प्रदर्शन समीक्षाको लागि कृपया आफ्नो रिपोर्ट पेश गर्नुहोस्।',
        enMessage: 'Please submit your report for the monthly performance review.',
        type: 'review',
        read: true,
        date: '२०८०-०१-२५',
        enDate: '2024-01-25',
        createdAt: '2024-01-25T16:30:00',
        priority: 'low',
        actionUrl: '/staff/performance',
        actionLabel: 'रिपोर्ट पेश गर्नुहोस्',
        sender: 'Manager'
      },
      { 
        id: 6, 
        title: 'प्रणाली मर्मत', 
        enTitle: 'System Maintenance',
        message: 'यो शनिबार राति १० बजेदेखि प्रणाली मर्मत गरिनेछ। कृपया आफ्नो कार्य समयमै समाप्त गर्नुहोस्।',
        enMessage: 'System maintenance will be performed this Saturday at 10 PM. Please complete your work on time.',
        type: 'maintenance',
        read: false,
        date: '२०८०-०१-२७',
        enDate: '2024-01-27',
        createdAt: '2024-01-27T08:00:00',
        priority: 'high',
        actionUrl: null,
        actionLabel: null,
        sender: 'IT Department'
      },
      { 
        id: 7, 
        title: 'कार्य सम्पन्न', 
        enTitle: 'Task Completed',
        message: 'तपाईंलाई तोकिएको कार्य "साप्ताहिक रिपोर्ट" सफलतापूर्वक सम्पन्न भएको छ।',
        enMessage: 'The task "Weekly Report" assigned to you has been successfully completed.',
        type: 'task',
        read: true,
        date: '२०८०-०१-२८',
        enDate: '2024-01-28',
        createdAt: '2024-01-28T17:00:00',
        priority: 'medium',
        actionUrl: '/staff/tasks',
        actionLabel: 'कार्य हेर्नुहोस्',
        sender: 'System'
      }
    ];
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.put(
        `http://localhost:5000/api/staff/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update locally even if API fails (for sample data)
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.put(
        'http://localhost:5000/api/staff/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Update locally even if API fails
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.delete(
        `http://localhost:5000/api/staff/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.filter(notification => notification.id !== notificationId)
        );
        setShowModal(false);
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Update locally even if API fails
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
      setShowModal(false);
      setSelectedNotification(null);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (window.confirm(language === 'np' ? 'सबै सूचनाहरू मेटाउनुहुन्छ?' : 'Delete all notifications?')) {
      try {
        const token = localStorage.getItem('staffToken');
        const response = await axios.delete(
          'http://localhost:5000/api/staff/notifications/delete-all',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error deleting all notifications:', error);
        setNotifications([]);
      }
    }
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchNotifications();
    }
  }, [navigate]);

  const handleActionClick = (actionUrl) => {
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const openModal = (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    if (filter === 'read') {
      return notifications.filter(n => n.read);
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const content = {
    np: {
      pageTitle: 'सूचनाहरू',
      notifications: 'सूचनाहरू',
      markAllRead: 'सबै पढेको चिन्ह लगाउनुहोस्',
      deleteAll: 'सबै मेटाउनुहोस्',
      filterAll: 'सबै',
      filterUnread: 'नपढेका',
      filterRead: 'पढेका',
      notificationDetails: 'सूचनाको विवरण',
      title: 'शीर्षक',
      message: 'सन्देश',
      type: 'प्रकार',
      date: 'मिति',
      priority: 'प्राथमिकता',
      sender: 'पठाउने व्यक्ति',
      close: 'बन्द गर्नुहोस्',
      delete: 'मेटाउनुहोस्',
      takeAction: 'कार्य गर्नुहोस्',
      noNotifications: 'कुनै सूचना छैन',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      assignment: 'तोकिएको',
      resolution: 'समाधान',
      reminder: 'सम्झना',
      training: 'प्रशिक्षण',
      review: 'समीक्षा',
      maintenance: 'मर्मत',
      task: 'कार्य',
      info: 'जानकारी',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून'
    },
    en: {
      pageTitle: 'Notifications',
      notifications: 'Notifications',
      markAllRead: 'Mark all as read',
      deleteAll: 'Delete all',
      filterAll: 'All',
      filterUnread: 'Unread',
      filterRead: 'Read',
      notificationDetails: 'Notification Details',
      title: 'Title',
      message: 'Message',
      type: 'Type',
      date: 'Date',
      priority: 'Priority',
      sender: 'Sender',
      close: 'Close',
      delete: 'Delete',
      takeAction: 'Take Action',
      noNotifications: 'No notifications',
      loading: 'Loading...',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      assignment: 'Assignment',
      resolution: 'Resolution',
      reminder: 'Reminder',
      training: 'Training',
      review: 'Review',
      maintenance: 'Maintenance',
      task: 'Task',
      info: 'Info',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
  };

  const t = content[language];

  const getTypeIcon = (type) => {
    const icons = {
      assignment: '📋',
      resolution: '✅',
      reminder: '⏰',
      training: '📚',
      review: '📊',
      maintenance: '🔧',
      task: '✔️',
      info: 'ℹ️'
    };
    return icons[type] || '🔔';
  };

  const getTypeClass = (type) => {
    const classes = {
      assignment: 'type-assignment',
      resolution: 'type-resolution',
      reminder: 'type-reminder',
      training: 'type-training',
      review: 'type-review',
      maintenance: 'type-maintenance',
      task: 'type-task',
      info: 'type-info'
    };
    return classes[type] || 'type-info';
  };

  const getPriorityClass = (priority) => {
    const classes = {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    };
    return classes[priority] || 'priority-medium';
  };

  const getTypeText = (type) => {
    const texts = {
      assignment: t.assignment,
      resolution: t.resolution,
      reminder: t.reminder,
      training: t.training,
      review: t.review,
      maintenance: t.maintenance,
      task: t.task,
      info: t.info
    };
    return texts[type] || type;
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
    <div className="staff-notifications">
      <StaffHeader 
        language={language}
        setLanguage={setLanguage}
        staffName={staffData.name}
        staffRole={staffData.role}
        onLogout={handleLogout}
      />
      
      <div className="dashboard-layout">
        <StaffSidebar 
          language={language}
          staffName={staffData.name}
          staffRole={staffData.role}
          onLogout={handleLogout}
        />
        
        <div className="main-content">
          <div className="content-wrapper">
            {/* Backend Status Banner */}
            {backendStatus === 'disconnected' && (
              <div className="backend-warning">
                ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।' : 'Backend server not connected. Showing sample data.'}
              </div>
            )}

            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">{t.notifications}</h1>
                <p className="page-subtitle">
                  {getUnreadCount()} {language === 'np' ? 'नपढेका सूचनाहरू' : 'unread notifications'}
                </p>
              </div>
              <div className="header-actions">
                <button className="action-btn mark-read-btn" onClick={markAllAsRead}>
                  📖 {t.markAllRead}
                </button>
                <button className="action-btn delete-all-btn" onClick={deleteAllNotifications}>
                  🗑️ {t.deleteAll}
                </button>
                <button className="refresh-btn" onClick={fetchNotifications}>
                  🔄 {t.refresh}
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                📬 {t.filterAll} ({notifications.length})
              </button>
              <button 
                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                🔵 {t.filterUnread} ({getUnreadCount()})
              </button>
              <button 
                className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
              >
                ✅ {t.filterRead} ({notifications.length - getUnreadCount()})
              </button>
            </div>

            {/* Notifications List */}
            <div className="notifications-container">
              {paginatedNotifications.length > 0 ? (
                paginatedNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-card ${!notification.read ? 'unread' : ''} ${getTypeClass(notification.type)}`}
                    onClick={() => openModal(notification)}
                  >
                    <div className="notification-icon">
                      <span className="type-icon">{getTypeIcon(notification.type)}</span>
                      {!notification.read && <span className="unread-dot"></span>}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h3 className="notification-title">
                          {language === 'np' ? notification.title : notification.enTitle}
                        </h3>
                        <span className={`priority-badge ${getPriorityClass(notification.priority)}`}>
                          {notification.priority === 'high' ? t.high : 
                           notification.priority === 'medium' ? t.medium : t.low}
                        </span>
                      </div>
                      <p className="notification-message">
                        {language === 'np' ? notification.message : notification.enMessage}
                      </p>
                      <div className="notification-footer">
                        <span className="notification-type">{getTypeText(notification.type)}</span>
                        <span className="notification-sender">👤 {notification.sender}</span>
                        <span className="notification-date">📅 {language === 'np' ? notification.date : notification.enDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">🔔</span>
                  <p>{t.noNotifications}</p>
                </div>
              )}
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

      {/* Notification Details Modal */}
      {showModal && selectedNotification && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔔 {t.notificationDetails}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>{t.title}:</label>
                <span>{language === 'np' ? selectedNotification.title : selectedNotification.enTitle}</span>
              </div>
              <div className="detail-row">
                <label>{t.type}:</label>
                <span className={`type-badge ${getTypeClass(selectedNotification.type)}`}>
                  {getTypeIcon(selectedNotification.type)} {getTypeText(selectedNotification.type)}
                </span>
              </div>
              <div className="detail-row">
                <label>{t.priority}:</label>
                <span className={`priority-badge ${getPriorityClass(selectedNotification.priority)}`}>
                  {selectedNotification.priority === 'high' ? t.high : 
                   selectedNotification.priority === 'medium' ? t.medium : t.low}
                </span>
              </div>
              <div className="detail-row">
                <label>{t.sender}:</label>
                <span>{selectedNotification.sender}</span>
              </div>
              <div className="detail-row">
                <label>{t.date}:</label>
                <span>{language === 'np' ? selectedNotification.date : selectedNotification.enDate}</span>
              </div>
              <div className="detail-row full-width">
                <label>{t.message}:</label>
                <p>{language === 'np' ? selectedNotification.message : selectedNotification.enMessage}</p>
              </div>
            </div>
            <div className="modal-footer">
              {selectedNotification.actionUrl && (
                <button 
                  className="btn-action" 
                  onClick={() => {
                    handleActionClick(selectedNotification.actionUrl);
                    closeModal();
                  }}
                >
                  🔗 {selectedNotification.actionLabel || t.takeAction}
                </button>
              )}
              <button 
                className="btn-delete" 
                onClick={() => deleteNotification(selectedNotification.id)}
              >
                🗑️ {t.delete}
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

        .staff-notifications {
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

        .main-content::-webkit-scrollbar-thumb:hover {
          background: #0277bd;
        }

        .content-wrapper {
          padding: 24px 32px;
          min-height: 100%;
        }

        .backend-warning {
          background: #ff9800;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.85rem;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn, .refresh-btn {
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
        }

        .mark-read-btn {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .delete-all-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          color: #475569;
        }

        .action-btn:hover, .refresh-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .filter-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          background: white;
          padding: 8px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .filter-tab {
          padding: 8px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          background: transparent;
          color: #64748b;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .notifications-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notification-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
          position: relative;
        }

        .notification-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .notification-card.unread {
          background: linear-gradient(135deg, #f0f9ff, #ffffff);
          border-left: 3px solid #0288d1;
        }

        .notification-icon {
          position: relative;
        }

        .type-icon {
          font-size: 2rem;
        }

        .unread-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .notification-content {
          flex: 1;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .notification-title {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .priority-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 500;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .notification-message {
          color: #475569;
          font-size: 0.85rem;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .notification-footer {
          display: flex;
          gap: 16px;
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .notification-type {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .type-assignment { border-left-color: #3b82f6; }
        .type-resolution { border-left-color: #10b981; }
        .type-reminder { border-left-color: #f59e0b; }
        .type-training { border-left-color: #8b5cf6; }
        .type-review { border-left-color: #ec4899; }
        .type-maintenance { border-left-color: #ef4444; }
        .type-task { border-left-color: #14b8a6; }
        .type-info { border-left-color: #64748b; }

        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .type-badge.type-assignment { background: #dbeafe; color: #2563eb; }
        .type-badge.type-resolution { background: #d1fae5; color: #059669; }
        .type-badge.type-reminder { background: #fed7aa; color: #ea580c; }
        .type-badge.type-training { background: #ede9fe; color: #7c3aed; }
        .type-badge.type-review { background: #fce7f3; color: #db2777; }
        .type-badge.type-maintenance { background: #fee2e2; color: #dc2626; }
        .type-badge.type-task { background: #ccfbf1; color: #0d9488; }
        .type-badge.type-info { background: #e2e8f0; color: #475569; }

        .empty-state {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

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
          border-color: #0288d1;
          color: #0288d1;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

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
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 550px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
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
          width: 100px;
          font-weight: 600;
          color: #0f172a;
        }

        .detail-row span, .detail-row p {
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
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
          background: white;
        }

        .btn-close, .btn-action, .btn-delete {
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
        }

        .btn-close {
          background: #e2e8f0;
          color: #475569;
        }

        .btn-action {
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .btn-delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .btn-close:hover, .btn-action:hover, .btn-delete:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          
          .content-wrapper {
            padding: 16px;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
            flex-direction: column;
          }
          
          .action-btn, .refresh-btn {
            width: 100%;
            text-align: center;
          }
          
          .filter-tabs {
            flex-direction: column;
          }
          
          .filter-tab {
            text-align: center;
          }
          
          .notification-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .notification-footer {
            flex-direction: column;
            gap: 4px;
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
          
          .btn-close, .btn-action, .btn-delete {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffNotifications;