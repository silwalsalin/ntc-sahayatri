// src/pages/StaffNotifications.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffNotifications = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [unreadCount, setUnreadCount] = useState(0);

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Format number with Nepali digits
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '०';
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return num.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    }
    return num.toString();
  };

  // Load staff data from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('staffUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setStaffData({
          id: user.id,
          name: user.name || 'Staff Member',
          role: user.role || 'Staff',
          email: user.email || '',
          phone: user.phone || '',
          department: user.department || 'Customer Support'
        });
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
  }, []);

  const formatNepaliDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      const year = d.getFullYear() - 57;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      const yearNp = year.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      const monthNp = month.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      const dayNp = day.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      return `${yearNp}-${monthNp}-${dayNp}`;
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

  // Generate dummy notifications based on staff login
  const getDummyNotifications = () => {
    const now = new Date();
    const staffId = staffData.id || 1;
    const staffName = staffData.name || 'Staff Member';
    
    // Staff-specific complaint numbers
    const complaintPrefix = `NTC-${String(staffId).padStart(4, '0')}`;
    
    return [
      { 
        id: 1, 
        title: 'नयाँ गुनासो तोकियो', 
        enTitle: 'New Complaint Assigned',
        message: `तपाईंलाई एउटा नयाँ गुनासो #${complaintPrefix}-001 तोकिएको छ। कृपया यसको समीक्षा गर्नुहोस्।`,
        enMessage: `A new complaint #${complaintPrefix}-001 has been assigned to you. Please review it.`,
        type: 'assignment',
        read: false,
        date: formatNepaliDate(now),
        enDate: formatEnglishDate(now),
        createdAt: now.toISOString(),
        priority: 'high',
        actionUrl: '/staff/complaints/assigned',
        actionLabel: 'गुनासो हेर्नुहोस्',
        sender: 'Admin',
        complaintNumber: `${complaintPrefix}-001`,
        complaintId: staffId * 100 + 1,
        icon: '📋'
      },
      { 
        id: 2, 
        title: 'गुनासो समाधान भयो', 
        enTitle: 'Complaint Resolved',
        message: `तपाईंले समाधान गर्नुभएको गुनासो #${complaintPrefix}-002 लाई ग्राहकले पुष्टि गरेको छ।`,
        enMessage: `The complaint #${complaintPrefix}-002 you resolved has been confirmed by the customer.`,
        type: 'resolution',
        read: false,
        date: formatNepaliDate(new Date(now - 86400000)),
        enDate: formatEnglishDate(new Date(now - 86400000)),
        createdAt: new Date(now - 86400000).toISOString(),
        priority: 'medium',
        actionUrl: '/staff/complaints/resolved',
        actionLabel: 'विवरण हेर्नुहोस्',
        sender: 'System',
        complaintNumber: `${complaintPrefix}-002`,
        complaintId: staffId * 100 + 2,
        icon: '✅'
      },
      { 
        id: 3, 
        title: 'बैठकको सूचना', 
        enTitle: 'Meeting Reminder',
        message: `आज दिउँसो ३:०० बजे टोली बैठक छ। कृपया समयमै उपस्थित हुनुहोस्।`,
        enMessage: 'Team meeting today at 3:00 PM. Please be present on time.',
        type: 'reminder',
        read: true,
        date: formatNepaliDate(new Date(now - 172800000)),
        enDate: formatEnglishDate(new Date(now - 172800000)),
        createdAt: new Date(now - 172800000).toISOString(),
        priority: 'high',
        actionUrl: null,
        actionLabel: null,
        sender: 'Supervisor',
        icon: '⏰'
      },
      { 
        id: 4, 
        title: 'प्रशिक्षण कार्यक्रम', 
        enTitle: 'Training Program',
        message: 'आगामी सोमबार प्राविधिक प्रशिक्षण कार्यक्रम आयोजना हुँदैछ। सहभागिताको लागि दर्ता गर्नुहोस्।',
        enMessage: 'Technical training program is being organized next Monday. Register to participate.',
        type: 'training',
        read: false,
        date: formatNepaliDate(new Date(now - 259200000)),
        enDate: formatEnglishDate(new Date(now - 259200000)),
        createdAt: new Date(now - 259200000).toISOString(),
        priority: 'medium',
        actionUrl: '/staff/training',
        actionLabel: 'दर्ता गर्नुहोस्',
        sender: 'HR Department',
        icon: '📚'
      },
      { 
        id: 5, 
        title: 'प्रदर्शन समीक्षा', 
        enTitle: 'Performance Review',
        message: `तपाईंको मासिक प्रदर्शन समीक्षाको लागि कृपया आफ्नो रिपोर्ट पेश गर्नुहोस्।`,
        enMessage: 'Please submit your report for the monthly performance review.',
        type: 'review',
        read: true,
        date: formatNepaliDate(new Date(now - 345600000)),
        enDate: formatEnglishDate(new Date(now - 345600000)),
        createdAt: new Date(now - 345600000).toISOString(),
        priority: 'low',
        actionUrl: '/staff/performance',
        actionLabel: 'रिपोर्ट पेश गर्नुहोस्',
        sender: 'Manager',
        icon: '📊'
      },
      { 
        id: 6, 
        title: 'नयाँ कार्य तोकियो', 
        enTitle: 'New Task Assigned',
        message: `तपाईंलाई एउटा नयाँ कार्य "${staffName} को साप्ताहिक रिपोर्ट" तोकिएको छ।`,
        enMessage: `A new task "${staffName}'s Weekly Report" has been assigned to you.`,
        type: 'task',
        read: false,
        date: formatNepaliDate(new Date(now - 432000000)),
        enDate: formatEnglishDate(new Date(now - 432000000)),
        createdAt: new Date(now - 432000000).toISOString(),
        priority: 'medium',
        actionUrl: '/staff/tasks',
        actionLabel: 'कार्य हेर्नुहोस्',
        sender: 'Supervisor',
        icon: '✔️'
      },
      { 
        id: 7, 
        title: 'प्रणाली मर्मत', 
        enTitle: 'System Maintenance',
        message: 'यो शनिबार राति १० बजेदेखि प्रणाली मर्मत गरिनेछ। कृपया आफ्नो कार्य समयमै समाप्त गर्नुहोस्।',
        enMessage: 'System maintenance will be performed this Saturday at 10 PM. Please complete your work on time.',
        type: 'maintenance',
        read: false,
        date: formatNepaliDate(new Date(now - 518400000)),
        enDate: formatEnglishDate(new Date(now - 518400000)),
        createdAt: new Date(now - 518400000).toISOString(),
        priority: 'high',
        actionUrl: null,
        actionLabel: null,
        sender: 'IT Department',
        icon: '🔧'
      }
    ];
  };

  // Load notifications on mount
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      const dummyNotifications = getDummyNotifications();
      setNotifications(dummyNotifications);
      const unread = dummyNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      setIsLoading(false);
    }
  }, [navigate, staffData.id]);

  // Refresh when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Handle language change - refresh notifications display
  useEffect(() => {
    if (notifications.length > 0) {
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          date: notification.createdAt ? formatNepaliDate(notification.createdAt) : '-',
          enDate: notification.createdAt ? formatEnglishDate(notification.createdAt) : '-'
        }))
      );
    }
  }, [language]);

  const handleActionClick = (actionUrl) => {
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const openModal = (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      // Mark as read locally
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notification.id
            ? { ...n, read: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
    document.body.style.overflow = 'unset';
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
    showToast(
      language === 'np' ? 'सबै सूचनाहरू पढेको चिन्ह लगाइयो' : 'All notifications marked as read',
      'success'
    );
  };

  const deleteNotification = (notificationId) => {
    const deleted = notifications.find(n => n.id === notificationId);
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
    if (deleted && !deleted.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setShowModal(false);
    setSelectedNotification(null);
    showToast(
      language === 'np' ? 'सूचना मेटियो' : 'Notification deleted',
      'success'
    );
  };

  const deleteAllNotifications = () => {
    const confirmMessage = language === 'np' 
      ? 'के तपाईं पक्कै सबै सूचनाहरू मेटाउन चाहनुहुन्छ?' 
      : 'Are you sure you want to delete all notifications?';
    
    if (window.confirm(confirmMessage)) {
      setNotifications([]);
      setUnreadCount(0);
      showToast(
        language === 'np' ? 'सबै सूचनाहरू मेटियो' : 'All notifications deleted',
        'success'
      );
    }
  };

  const getUnreadCount = () => {
    return unreadCount;
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
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
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
      low: 'न्यून',
      loading: 'लोड हुँदै...'
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
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
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
      low: 'Low',
      loading: 'Loading...'
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

  const getPriorityText = (priority) => {
    if (priority === 'high') return t.high;
    if (priority === 'medium') return t.medium;
    return t.low;
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

  return (
    <div className="staff-notifications">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>✕</button>
        </div>
      )}

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
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">🔔 {t.notifications}</h1>
                <p className="page-subtitle">
                  {formatNumber(getUnreadCount())} {language === 'np' ? 'नपढेका सूचनाहरू' : 'unread notifications'}
                </p>
              </div>
              <div className="header-actions">
                <button 
                  className="action-btn mark-read-btn" 
                  onClick={markAllAsRead} 
                  disabled={getUnreadCount() === 0}
                >
                  📖 {t.markAllRead}
                </button>
                <button 
                  className="action-btn delete-all-btn" 
                  onClick={deleteAllNotifications} 
                  disabled={notifications.length === 0}
                >
                  🗑️ {t.deleteAll}
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                📬 {t.filterAll} ({formatNumber(notifications.length)})
              </button>
              <button 
                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                🔵 {t.filterUnread} ({formatNumber(getUnreadCount())})
              </button>
              <button 
                className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
              >
                ✅ {t.filterRead} ({formatNumber(notifications.length - getUnreadCount())})
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
                      <span className="type-icon">{notification.icon || getTypeIcon(notification.type)}</span>
                      {!notification.read && <span className="unread-dot"></span>}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h3 className="notification-title">
                          {language === 'np' ? notification.title : notification.enTitle}
                        </h3>
                        <span className={`priority-badge ${getPriorityClass(notification.priority)}`}>
                          {getPriorityText(notification.priority)}
                        </span>
                      </div>
                      <p className="notification-message">
                        {language === 'np' ? notification.message : notification.enMessage}
                      </p>
                      {notification.type === 'assignment' && notification.complaintNumber && (
                        <div className="notification-complaint-badge">
                          <span className="badge">#{notification.complaintNumber}</span>
                        </div>
                      )}
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
                  {t.page} {formatNumber(currentPage)} {t.of} {formatNumber(totalPages)}
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
                  {selectedNotification.icon || getTypeIcon(selectedNotification.type)} {getTypeText(selectedNotification.type)}
                </span>
              </div>
              <div className="detail-row">
                <label>{t.priority}:</label>
                <span className={`priority-badge ${getPriorityClass(selectedNotification.priority)}`}>
                  {getPriorityText(selectedNotification.priority)}
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
              {selectedNotification.complaintNumber && (
                <div className="detail-row">
                  <label>{language === 'np' ? 'गुनासो नम्बर' : 'Complaint Number'}:</label>
                  <span className="complaint-number-badge">#{selectedNotification.complaintNumber}</span>
                </div>
              )}
              <div className="detail-row full-width">
                <label>{t.message}:</label>
                <p className="notification-message-full">{language === 'np' ? selectedNotification.message : selectedNotification.enMessage}</p>
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

      <style>{`
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

        /* Toast Notification */
        .toast-notification {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 3000;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: slideInRight 0.3s ease;
          max-width: 400px;
          min-width: 280px;
        }
        
        .toast-notification.success { border-left: 4px solid #10b981; background: #ecfdf5; }
        .toast-notification.error { border-left: 4px solid #ef4444; background: #fef2f2; }
        .toast-notification.warning { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .toast-notification.info { border-left: 4px solid #3b82f6; background: #eff6ff; }
        
        .toast-icon { font-size: 1.2rem; flex-shrink: 0; }
        .toast-message { font-size: 0.85rem; color: #1f2937; flex: 1; }
        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 1rem;
          padding: 0 4px;
        }
        .toast-close:hover { color: #666; }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .mark-read-btn {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .delete-all-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .action-btn:hover {
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
          flex-wrap: wrap;
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
          border-left: 4px solid #0288d1;
        }

        .notification-card.type-assignment {
          border-left: 4px solid #8b5cf6;
        }

        .notification-card.type-resolution {
          border-left: 4px solid #10b981;
        }

        .notification-icon {
          position: relative;
          flex-shrink: 0;
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
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notification-message-full {
          color: #334155;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .notification-complaint-badge {
          margin-bottom: 8px;
        }

        .badge {
          display: inline-block;
          background: #ede9fe;
          color: #7c3aed;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .complaint-number-badge {
          display: inline-block;
          background: #ede9fe;
          color: #7c3aed;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .notification-footer {
          display: flex;
          gap: 16px;
          font-size: 0.7rem;
          color: #94a3b8;
          flex-wrap: wrap;
        }

        .notification-type {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

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
          transition: all 0.2s;
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

        .pagination-info {
          color: #64748b;
          font-size: 0.85rem;
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
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 550px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
          border-radius: 20px 20px 0 0;
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
          color: #ef4444;
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
          width: 120px;
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
          border-radius: 0 0 20px 20px;
          flex-wrap: wrap;
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

        .btn-close:hover {
          background: #cbd5e1;
        }

        .btn-action {
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .btn-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .btn-delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .btn-delete:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        @media print {
          .staff-notifications {
            height: auto;
            overflow: visible;
          }
          
          .dashboard-layout {
            margin-top: 0;
            height: auto;
          }
          
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          
          .staff-header, .staff-sidebar, .action-btn, .filter-tabs {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .staff-notifications {
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
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
            flex-direction: column;
          }
          
          .action-btn {
            width: 100%;
            text-align: center;
          }
          
          .filter-tabs {
            flex-direction: column;
          }
          
          .filter-tab {
            text-align: center;
          }
          
          .notification-card {
            flex-direction: column;
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