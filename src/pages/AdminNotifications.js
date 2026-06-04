// src/pages/AdminNotifications.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Send notification form state
  const [sendNotification, setSendNotification] = useState({
    title: '',
    enTitle: '',
    message: '',
    enMessage: '',
    type: 'general',
    priority: 'medium',
    recipientType: 'all',
    recipients: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'नयाँ गुनासो दर्ता',
      enTitle: 'New Complaint Registered',
      message: 'रमेश केसीबाट नयाँ गुनासो प्राप्त भएको छ। कृपया समीक्षा गर्नुहोस्।',
      enMessage: 'New complaint received from Ramesh KC. Please review.',
      type: 'complaint',
      type_np: 'गुनासो',
      type_en: 'Complaint',
      status: 'unread',
      status_np: 'नपढिएको',
      status_en: 'Unread',
      date: '२०८०-०२-२५',
      enDate: '2024-02-25',
      time: '१०:३०',
      enTime: '10:30',
      sender: 'प्रणाली',
      enSender: 'System',
      priority: 'high',
      icon: '📋',
      link: '/admin-complaints/1'
    },
    {
      id: 2,
      title: 'गुनासो समाधान',
      enTitle: 'Complaint Resolved',
      message: 'NTC-2024-002 टिकेट नम्बरको गुनासो सफलतापूर्वक समाधान भएको छ।',
      enMessage: 'Complaint with ticket number NTC-2024-002 has been successfully resolved.',
      type: 'update',
      type_np: 'अपडेट',
      type_en: 'Update',
      status: 'read',
      status_np: 'पढिएको',
      status_en: 'Read',
      date: '२०८०-०२-२४',
      enDate: '2024-02-24',
      time: '१४:१५',
      enTime: '14:15',
      sender: 'प्रशासक',
      enSender: 'Admin',
      priority: 'medium',
      icon: '✅',
      link: '/admin-complaints/resolved'
    },
    {
      id: 3,
      title: 'नयाँ प्रयोगकर्ता दर्ता',
      enTitle: 'New User Registered',
      message: 'सीता शर्मा नामक नयाँ प्रयोगकर्ता प्रणालीमा दर्ता भएको छ।',
      enMessage: 'New user Sita Sharma has registered on the system.',
      type: 'user',
      type_np: 'प्रयोगकर्ता',
      type_en: 'User',
      status: 'unread',
      status_np: 'नपढिएको',
      status_en: 'Unread',
      date: '२०८०-०२-२३',
      enDate: '2024-02-23',
      time: '०९:४५',
      enTime: '09:45',
      sender: 'प्रणाली',
      enSender: 'System',
      priority: 'low',
      icon: '👤',
      link: '/admin-users'
    },
    {
      id: 4,
      title: 'रिपोर्ट तयार',
      enTitle: 'Report Ready',
      message: 'मासिक गुनासो रिपोर्ट तयार भएको छ। डाउनलोड गर्नुहोस्।',
      enMessage: 'Monthly complaint report is ready. Please download.',
      type: 'report',
      type_np: 'रिपोर्ट',
      type_en: 'Report',
      status: 'read',
      status_np: 'पढिएको',
      status_en: 'Read',
      date: '२०८०-०२-२२',
      enDate: '2024-02-22',
      time: '१६:२०',
      enTime: '16:20',
      sender: 'प्रणाली',
      enSender: 'System',
      priority: 'medium',
      icon: '📊',
      link: '/admin-reports/complaints'
    },
    {
      id: 5,
      title: 'उच्च प्राथमिकता गुनासो',
      enTitle: 'High Priority Complaint',
      message: 'NTC-2024-005 टिकेट नम्बरको गुनासोलाई उच्च प्राथमिकता दिइएको छ।',
      enMessage: 'Complaint with ticket number NTC-2024-005 has been marked as high priority.',
      type: 'complaint',
      type_np: 'गुनासो',
      type_en: 'Complaint',
      status: 'unread',
      status_np: 'नपढिएको',
      status_en: 'Unread',
      date: '२०८०-०२-२१',
      enDate: '2024-02-21',
      time: '११:००',
      enTime: '11:00',
      sender: 'प्रणाली',
      enSender: 'System',
      priority: 'high',
      icon: '🔴',
      link: '/admin-complaints/pending'
    },
    {
      id: 6,
      title: 'प्रणाली अपडेट',
      enTitle: 'System Update',
      message: 'प्रणालीमा नयाँ सुविधाहरू थपिएका छन्। विवरणको लागि कृपया हेर्नुहोस्।',
      enMessage: 'New features have been added to the system. Please check for details.',
      type: 'system',
      type_np: 'प्रणाली',
      type_en: 'System',
      status: 'read',
      status_np: 'पढिएको',
      status_en: 'Read',
      date: '२०८०-०२-२०',
      enDate: '2024-02-20',
      time: '०८:००',
      enTime: '08:00',
      sender: 'प्रशासक',
      enSender: 'Admin',
      priority: 'low',
      icon: '🔄',
      link: '/admin-dashboard'
    },
    {
      id: 7,
      title: 'समय सीमा नजिकियो',
      enTitle: 'Deadline Approaching',
      message: 'NTC-2024-003 टिकेट नम्बरको गुनासोको समय सीमा नजिकिएको छ।',
      enMessage: 'Deadline for complaint ticket NTC-2024-003 is approaching.',
      type: 'reminder',
      type_np: 'सम्झना',
      type_en: 'Reminder',
      status: 'unread',
      status_np: 'नपढिएको',
      status_en: 'Unread',
      date: '२०८०-०२-१९',
      enDate: '2024-02-19',
      time: '१५:३०',
      enTime: '15:30',
      sender: 'प्रणाली',
      enSender: 'System',
      priority: 'high',
      icon: '⏰',
      link: '/admin-complaints/in-progress'
    },
    {
      id: 8,
      title: 'प्रतिक्रिया प्राप्त',
      enTitle: 'Feedback Received',
      message: 'NTC-2024-002 टिकेट नम्बरको गुनासोमा प्रयोगकर्ताबाट प्रतिक्रिया प्राप्त भएको छ।',
      enMessage: 'Feedback received from user for complaint ticket NTC-2024-002.',
      type: 'feedback',
      type_np: 'प्रतिक्रिया',
      type_en: 'Feedback',
      status: 'read',
      status_np: 'पढिएको',
      status_en: 'Read',
      date: '२०८०-०२-१८',
      enDate: '2024-02-18',
      time: '१३:१०',
      enTime: '13:10',
      sender: 'प्रणाली',
      enSender: 'System',
      priority: 'medium',
      icon: '💬',
      link: '/admin-complaints/resolved'
    }
  ]);

  // Notification types for filter
  const notificationTypes = {
    np: {
      all: 'सबै प्रकार',
      complaint: 'गुनासो',
      update: 'अपडेट',
      user: 'प्रयोगकर्ता',
      report: 'रिपोर्ट',
      system: 'प्रणाली',
      reminder: 'सम्झना',
      feedback: 'प्रतिक्रिया',
      general: 'साधारण'
    },
    en: {
      all: 'All Types',
      complaint: 'Complaint',
      update: 'Update',
      user: 'User',
      report: 'Report',
      system: 'System',
      reminder: 'Reminder',
      feedback: 'Feedback',
      general: 'General'
    }
  };

  // Status options for filter
  const statusOptions = {
    np: {
      all: 'सबै स्थिति',
      read: 'पढिएको',
      unread: 'नपढिएको'
    },
    en: {
      all: 'All Status',
      read: 'Read',
      unread: 'Unread'
    }
  };

  // Recipient options
  const recipientOptions = {
    np: {
      all: 'सबै प्रयोगकर्ता',
      admin: 'प्रशासक',
      staff: 'कर्मचारी',
      specific: 'विशेष प्रयोगकर्ता'
    },
    en: {
      all: 'All Users',
      admin: 'Admins',
      staff: 'Staff',
      specific: 'Specific Users'
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
      notifications: 'सूचनाहरू',
      manageNotifications: 'सूचना व्यवस्थापन',
      sendNotification: 'सूचना पठाउनुहोस्',
      filterByType: 'प्रकार अनुसार फिल्टर',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      markAsRead: 'पढिएको चिन्ह लगाउनुहोस्',
      markAllAsRead: 'सबै पढिएको चिन्ह लगाउनुहोस्',
      deleteNotification: 'सूचना हटाउनुहोस्',
      deleteAll: 'सबै हटाउनुहोस्',
      title: 'शीर्षक',
      message: 'सन्देश',
      type: 'प्रकार',
      date: 'मिति',
      time: 'समय',
      sender: 'पठाउने',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      viewDetails: 'विवरण हेर्नुहोस्',
      notificationDetails: 'सूचना विवरण',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noNotificationsFound: 'कुनै सूचना फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalNotifications: 'जम्मा सूचना',
      unreadCount: 'नपढिएको',
      recipientType: 'प्राप्तकर्ता प्रकार',
      recipients: 'प्राप्तकर्ताहरू',
      send: 'पठाउनुहोस्',
      notificationSent: 'सूचना सफलतापूर्वक पठाइयो',
      fillRequiredFields: 'कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्',
      markReadSuccess: 'सूचना पढिएको रूपमा चिन्ह लगाइयो',
      deleteSuccess: 'सूचना सफलतापूर्वक हटाइयो',
      loading: 'लोड हुँदैछ...'
    },
    en: {
      notifications: 'Notifications',
      manageNotifications: 'Manage Notifications',
      sendNotification: 'Send Notification',
      filterByType: 'Filter by Type',
      filterByStatus: 'Filter by Status',
      markAsRead: 'Mark as Read',
      markAllAsRead: 'Mark All as Read',
      deleteNotification: 'Delete Notification',
      deleteAll: 'Delete All',
      title: 'Title',
      message: 'Message',
      type: 'Type',
      date: 'Date',
      time: 'Time',
      sender: 'Sender',
      status: 'Status',
      priority: 'Priority',
      viewDetails: 'View Details',
      notificationDetails: 'Notification Details',
      close: 'Close',
      all: 'All',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noNotificationsFound: 'No notifications found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalNotifications: 'Total Notifications',
      unreadCount: 'Unread',
      recipientType: 'Recipient Type',
      recipients: 'Recipients',
      send: 'Send',
      notificationSent: 'Notification sent successfully',
      fillRequiredFields: 'Please fill all required fields',
      markReadSuccess: 'Notification marked as read',
      deleteSuccess: 'Notification deleted successfully',
      loading: 'Loading...'
    }
  };

  const t = content[language];
  const typesObj = notificationTypes[language];
  const statusesObj = statusOptions[language];
  const recipientsObj = recipientOptions[language];

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

  const getTypeText = (type) => {
    return typesObj[type] || type;
  };

  const getStatusText = (status) => {
    return statusesObj[status] || status;
  };

  const getStatusClass = (status) => {
    return status === 'unread' ? 'status-unread' : 'status-read';
  };

  const getDate = (notification) => {
    return language === 'np' ? notification.date : notification.enDate;
  };

  const getTime = (notification) => {
    return language === 'np' ? notification.time : notification.enTime;
  };

  const getSender = (notification) => {
    return language === 'np' ? notification.sender : notification.enSender;
  };

  const getTitle = (notification) => {
    return language === 'np' ? notification.title : notification.enTitle;
  };

  const getMessage = (notification) => {
    return language === 'np' ? notification.message : notification.enMessage;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = filterType === 'all' || notification.type === filterType;
    const statusMatch = filterStatus === 'all' || notification.status === filterStatus;
    return typeMatch && statusMatch;
  });

  // Statistics
  const totalNotifications = filteredNotifications.length;
  const unreadCount = filteredNotifications.filter(n => n.status === 'unread').length;

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    // Mark as read when opened
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  const openSendModal = () => {
    setSendNotification({
      title: '',
      enTitle: '',
      message: '',
      enMessage: '',
      type: 'general',
      priority: 'medium',
      recipientType: 'all',
      recipients: ''
    });
    setFormErrors({});
    setShowSendModal(true);
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    setSendNotification({
      title: '',
      enTitle: '',
      message: '',
      enMessage: '',
      type: 'general',
      priority: 'medium',
      recipientType: 'all',
      recipients: ''
    });
    setFormErrors({});
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id 
        ? { ...notification, status: 'read', status_np: 'पढिएको', status_en: 'Read' }
        : notification
    ));
    alert(t.markReadSuccess);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification, 
      status: 'read', 
      status_np: 'पढिएको', 
      status_en: 'Read'
    })));
    alert(t.markReadSuccess);
  };

  const deleteNotification = (id) => {
    if (window.confirm(language === 'np' ? 'के तपाईं यो सूचना हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this notification?')) {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      alert(t.deleteSuccess);
    }
  };

  const deleteAll = () => {
    if (window.confirm(language === 'np' ? 'के तपाईं सबै सूचनाहरू हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete all notifications?')) {
      setNotifications([]);
      alert(t.deleteSuccess);
    }
  };

  const handleSendInputChange = (e) => {
    const { name, value } = e.target;
    setSendNotification(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendNotification = () => {
    const errors = {};
    if (!sendNotification.title) errors.title = t.fillRequiredFields;
    if (!sendNotification.enTitle) errors.enTitle = t.fillRequiredFields;
    if (!sendNotification.message) errors.message = t.fillRequiredFields;
    if (!sendNotification.enMessage) errors.enMessage = t.fillRequiredFields;
    
    if (sendNotification.recipientType === 'specific' && !sendNotification.recipients) {
      errors.recipients = t.fillRequiredFields;
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const newId = notifications.length + 1;
    const now = new Date();
    const newNotification = {
      id: newId,
      title: sendNotification.title,
      enTitle: sendNotification.enTitle,
      message: sendNotification.message,
      enMessage: sendNotification.enMessage,
      type: sendNotification.type,
      type_np: typesObj[sendNotification.type] || sendNotification.type,
      type_en: typesObj[sendNotification.type] || sendNotification.type,
      status: 'unread',
      status_np: 'नपढिएको',
      status_en: 'Unread',
      date: language === 'np' ? now.toLocaleDateString('ne-NP') : now.toLocaleDateString('en-US'),
      enDate: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      enTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'Admin',
      enSender: 'Admin',
      priority: sendNotification.priority,
      icon: sendNotification.type === 'general' ? '📢' : '📋',
      link: '/admin-dashboard'
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    alert(t.notificationSent);
    closeSendModal();
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
    <div className="admin-notifications">
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>🔔 {t.notifications}</h1>
                <p>{t.manageNotifications}</p>
              </div>
              <div className="header-actions">
                <button className="send-btn" onClick={openSendModal}>
                  ✉️ {t.sendNotification}
                </button>
                <button className="mark-all-btn" onClick={markAllAsRead}>
                  ✓ {t.markAllAsRead}
                </button>
                <button className="delete-all-btn" onClick={deleteAll}>
                  🗑️ {t.deleteAll}
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon blue">🔔</div>
                <div className="stat-info">
                  <div className="stat-value">{totalNotifications}</div>
                  <div className="stat-label">{t.totalNotifications}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">📭</div>
                <div className="stat-info">
                  <div className="stat-value">{unreadCount}</div>
                  <div className="stat-label">{t.unreadCount}</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
              <div className="filter-group">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  {Object.entries(typesObj).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  {Object.entries(statusesObj).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
              {paginatedNotifications.length > 0 ? (
                paginatedNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`}
                    onClick={() => openModal(notification)}
                  >
                    <div className="notification-icon">{notification.icon}</div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4 className="notification-title">{getTitle(notification)}</h4>
                        <span className={`priority-badge ${getPriorityClass(notification.priority)}`}>
                          {getPriorityText(notification.priority)}
                        </span>
                      </div>
                      <p className="notification-message">{getMessage(notification)}</p>
                      <div className="notification-footer">
                        <span className="notification-type">{getTypeText(notification.type)}</span>
                        <span className="notification-sender">{getSender(notification)}</span>
                        <span className="notification-time">{getDate(notification)} • {getTime(notification)}</span>
                      </div>
                    </div>
                    <div className="notification-actions">
                      {notification.status === 'unread' && (
                        <button 
                          className="mark-read-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          title={t.markAsRead}
                        >
                          ✓
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        title={t.deleteNotification}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">🔔</span>
                    <p>{t.noNotificationsFound}</p>
                    <small>{t.tryAdjustingFilters}</small>
                  </div>
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
                <span>{getTitle(selectedNotification)}</span>
              </div>
              <div className="detail-row">
                <label>{t.type}:</label>
                <span>{getTypeText(selectedNotification.type)}</span>
              </div>
              <div className="detail-row">
                <label>{t.status}:</label>
                <span className={`status-badge ${getStatusClass(selectedNotification.status)}`}>
                  {getStatusText(selectedNotification.status)}
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
                <span>{getSender(selectedNotification)}</span>
              </div>
              <div className="detail-row">
                <label>{t.date}:</label>
                <span>{getDate(selectedNotification)}</span>
              </div>
              <div className="detail-row">
                <label>{t.time}:</label>
                <span>{getTime(selectedNotification)}</span>
              </div>
              <div className="detail-row full-width">
                <label>{t.message}:</label>
                <p className="message-text">{getMessage(selectedNotification)}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeModal}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="modal-overlay" onClick={closeSendModal}>
          <div className="modal-content send-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✉️ {t.sendNotification}</h2>
              <button className="modal-close" onClick={closeSendModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t.title} (Nepali) <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={sendNotification.title}
                  onChange={handleSendInputChange}
                  placeholder="शीर्षक (नेपाली)"
                  className={formErrors.title ? 'error' : ''}
                />
                {formErrors.title && <span className="error-text">{formErrors.title}</span>}
              </div>
              <div className="form-group">
                <label>{t.title} (English) <span className="required">*</span></label>
                <input
                  type="text"
                  name="enTitle"
                  value={sendNotification.enTitle}
                  onChange={handleSendInputChange}
                  placeholder="Title (English)"
                  className={formErrors.enTitle ? 'error' : ''}
                />
                {formErrors.enTitle && <span className="error-text">{formErrors.enTitle}</span>}
              </div>
              <div className="form-group">
                <label>{t.message} (Nepali) <span className="required">*</span></label>
                <textarea
                  name="message"
                  value={sendNotification.message}
                  onChange={handleSendInputChange}
                  rows="3"
                  placeholder="सन्देश (नेपाली)"
                  className={formErrors.message ? 'error' : ''}
                />
                {formErrors.message && <span className="error-text">{formErrors.message}</span>}
              </div>
              <div className="form-group">
                <label>{t.message} (English) <span className="required">*</span></label>
                <textarea
                  name="enMessage"
                  value={sendNotification.enMessage}
                  onChange={handleSendInputChange}
                  rows="3"
                  placeholder="Message (English)"
                  className={formErrors.enMessage ? 'error' : ''}
                />
                {formErrors.enMessage && <span className="error-text">{formErrors.enMessage}</span>}
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>{t.type}</label>
                  <select name="type" value={sendNotification.type} onChange={handleSendInputChange}>
                    <option value="general">{typesObj.general}</option>
                    <option value="complaint">{typesObj.complaint}</option>
                    <option value="update">{typesObj.update}</option>
                    <option value="reminder">{typesObj.reminder}</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>{t.priority}</label>
                  <select name="priority" value={sendNotification.priority} onChange={handleSendInputChange}>
                    <option value="high">{t.high}</option>
                    <option value="medium">{t.medium}</option>
                    <option value="low">{t.low}</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>{t.recipientType}</label>
                  <select name="recipientType" value={sendNotification.recipientType} onChange={handleSendInputChange}>
                    <option value="all">{recipientsObj.all}</option>
                    <option value="admin">{recipientsObj.admin}</option>
                    <option value="staff">{recipientsObj.staff}</option>
                    <option value="specific">{recipientsObj.specific}</option>
                  </select>
                </div>
                {sendNotification.recipientType === 'specific' && (
                  <div className="form-group half">
                    <label>{t.recipients}</label>
                    <input
                      type="text"
                      name="recipients"
                      value={sendNotification.recipients}
                      onChange={handleSendInputChange}
                      placeholder="email1@example.com, email2@example.com"
                      className={formErrors.recipients ? 'error' : ''}
                    />
                    {formErrors.recipients && <span className="error-text">{formErrors.recipients}</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeSendModal}>{t.close}</button>
              <button className="btn-send" onClick={handleSendNotification}>✉️ {t.send}</button>
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

        .admin-notifications {
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
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Dashboard Layout */
        .dashboard-layout {
          display: flex;
          height: calc(100vh - 195px);
          margin-top: 195px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        /* Sidebar Container - Fixed */
        .sidebar-container {
          position: fixed;
          top: 195px;
          left: 0;
          width: 260px;
          height: calc(100vh - 195px);
          background: white;
          border-right: 1px solid #e2e8f0;
          z-index: 100;
          overflow-y: auto;
        }

        /* Main Container - Scrollable */
        .main-container {
          flex: 1;
          margin-left: 260px;
          width: calc(100% - 260px);
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        .main-container::-webkit-scrollbar {
          width: 8px;
        }

        .main-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .main-container::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }

        .main-container::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
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
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 16px;
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

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .send-btn, .mark-all-btn, .delete-all-btn {
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
          font-size: 0.85rem;
        }

        .send-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .send-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .mark-all-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .mark-all-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }

        .delete-all-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .delete-all-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }

        /* Stats Cards */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-icon.blue { background: #dbeafe; color: #2563eb; }
        .stat-icon.orange { background: #fed7aa; color: #ea580c; }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }

        /* Notifications List */
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .notification-item {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
        }

        .notification-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #cbd5e1;
        }

        .notification-item.unread {
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
        }

        .notification-icon {
          font-size: 2rem;
        }

        .notification-content {
          flex: 1;
        }

        .notification-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .notification-title {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .notification-message {
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 10px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notification-footer {
          display: flex;
          gap: 16px;
          font-size: 0.7rem;
          color: #64748b;
          flex-wrap: wrap;
        }

        .notification-type {
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .priority-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 500;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .notification-actions {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .mark-read-btn, .delete-btn {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .mark-read-btn:hover {
          background: #d1fae5;
          color: #059669;
        }

        .delete-btn:hover {
          background: #fee2e2;
          color: #dc2626;
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

        .no-data {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
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
          max-width: 550px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .send-modal {
          max-width: 650px;
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
          width: 120px;
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

        .message-text {
          line-height: 1.5;
        }

        .status-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-unread { background: #dbeafe; color: #2563eb; }
        .status-read { background: #e2e8f0; color: #475569; }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #0f172a;
          font-size: 0.85rem;
        }

        .required {
          color: #ef4444;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #ef4444;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.7rem;
          margin-top: 4px;
          display: block;
        }

        .form-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .form-group.half {
          flex: 1;
          min-width: 200px;
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

        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-send, .btn-close {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-send:hover, .btn-close:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-notifications {
            height: auto;
            overflow: auto;
          }
          
          .dashboard-layout {
            flex-direction: column;
            height: auto;
            margin-top: 150px;
            overflow: visible;
          }
          
          .sidebar-container {
            position: relative;
            top: 0;
            width: 100%;
            height: auto;
            margin-bottom: 20px;
          }
          
          .main-container {
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
          }
          
          .send-btn, .mark-all-btn, .delete-all-btn {
            flex: 1;
            text-align: center;
          }
          
          .stats-cards {
            grid-template-columns: 1fr;
          }
          
          .notification-item {
            flex-direction: column;
          }
          
          .notification-actions {
            position: absolute;
            top: 16px;
            right: 16px;
          }
          
          .form-row {
            flex-direction: column;
          }
          
          .form-group.half {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .notification-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .notification-footer {
            flex-direction: column;
            gap: 8px;
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
          
          .btn-cancel, .btn-send, .btn-close {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminNotifications;