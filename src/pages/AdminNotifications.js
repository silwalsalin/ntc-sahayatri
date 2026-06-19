// src/pages/AdminNotifications.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [backendStatus, setBackendStatus] = useState('checking');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(new Set());

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

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('adminToken');
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Format date to Nepali format
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

  // Format date to English format
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

  // Format time
  const formatTime = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '-';
    }
  };

  // Fetch complaints and create notifications
  const fetchComplaintsAndCreateNotifications = async () => {
    try {
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch regular complaints
      let regularComplaints = [];
      let regardingComplaints = [];
      
      try {
        const regularResponse = await axios.get(`${API_URL}/complaints`, { headers });
        if (regularResponse.data.success && Array.isArray(regularResponse.data.data)) {
          regularComplaints = regularResponse.data.data;
        }
      } catch (error) {
        console.error('Error fetching regular complaints:', error);
      }
      
      // Fetch complaint regarding
      try {
        const regardingResponse = await axios.get(`${API_URL}/complaint-regarding`, { headers });
        if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
          regardingComplaints = regardingResponse.data.data;
        }
      } catch (error) {
        console.error('Error fetching regarding complaints:', error);
      }
      
      const allComplaints = [...regularComplaints, ...regardingComplaints];
      
      // Create notifications from complaints
      const complaintNotifications = allComplaints.map(complaint => {
        const isRegular = complaint.nature_of_complaint !== undefined;
        const complaintType = isRegular ? 'complaint' : 'complaint-regarding';
        const complaintTypeLabel = isRegular ? 
          (language === 'np' ? 'साधारण गुनासो' : 'Regular Complaint') : 
          (language === 'np' ? 'गुनासो सम्बन्धी' : 'Complaint Regarding');
        
        let status = 'unread';
        let priority = 'medium';
        
        // Set priority based on complaint priority
        if (complaint.priority === 'high' || complaint.priority === 'urgent') {
          priority = 'high';
        } else if (complaint.priority === 'low') {
          priority = 'low';
        }
        
        // Generate notification title and message
        let title = '';
        let enTitle = '';
        let message = '';
        let enMessage = '';
        let icon = '📋';
        
        if (complaint.status === 'pending' || complaint.status === 'Pending') {
          title = `नयाँ गुनासो: ${complaint.complaint_number || `#${complaint.id}`}`;
          enTitle = `New Complaint: ${complaint.complaint_number || `#${complaint.id}`}`;
          message = `${complaint.name || 'प्रयोगकर्ता'} बाट नयाँ गुनासो प्राप्त भएको छ। कृपया समीक्षा गर्नुहोस्।`;
          enMessage = `New complaint received from ${complaint.name || 'user'}. Please review.`;
          icon = '🆕';
          status = 'unread';
        } else if (complaint.status === 'resolved' || complaint.status === 'Resolved') {
          title = `गुनासो समाधान: ${complaint.complaint_number || `#${complaint.id}`}`;
          enTitle = `Complaint Resolved: ${complaint.complaint_number || `#${complaint.id}`}`;
          message = `टिकेट नम्बर ${complaint.complaint_number} को गुनासो सफलतापूर्वक समाधान भएको छ।`;
          enMessage = `Complaint with ticket number ${complaint.complaint_number} has been successfully resolved.`;
          icon = '✅';
        } else if (complaint.status === 'in-progress' || complaint.status === 'In Progress') {
          title = `गुनासो प्रगतिमा: ${complaint.complaint_number || `#${complaint.id}`}`;
          enTitle = `Complaint In Progress: ${complaint.complaint_number || `#${complaint.id}`}`;
          message = `टिकेट नम्बर ${complaint.complaint_number} को गुनासो प्रगतिमा छ।`;
          enMessage = `Complaint with ticket number ${complaint.complaint_number} is in progress.`;
          icon = '🔄';
        } else {
          title = `गुनासो अपडेट: ${complaint.complaint_number || `#${complaint.id}`}`;
          enTitle = `Complaint Update: ${complaint.complaint_number || `#${complaint.id}`}`;
          message = `टिकेट नम्बर ${complaint.complaint_number} को गुनासोमा अपडेट भएको छ। वर्तमान स्थिति: ${complaint.status}`;
          enMessage = `Complaint with ticket number ${complaint.complaint_number} has been updated. Current status: ${complaint.status}`;
          icon = '📝';
        }
        
        return {
          id: `comp_${complaint.id}_${complaintType}`,
          originalId: complaint.id,
          title: title,
          enTitle: enTitle,
          message: message,
          enMessage: enMessage,
          type: complaintType,
          type_np: complaintTypeLabel,
          type_en: complaintTypeLabel,
          status: status,
          status_np: status === 'unread' ? 'नपढिएको' : 'पढिएको',
          status_en: status === 'unread' ? 'Unread' : 'Read',
          date: formatNepaliDate(complaint.created_at),
          enDate: formatEnglishDate(complaint.created_at),
          time: formatTime(complaint.created_at),
          enTime: formatTime(complaint.created_at),
          sender: complaint.name || 'प्रयोगकर्ता',
          enSender: complaint.name || 'User',
          priority: priority,
          icon: icon,
          link: `/admin-complaints/${complaint.id}`,
          complaintData: complaint,
          createdAt: complaint.created_at
        };
      });
      
      // Sort by date (newest first)
      complaintNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Load read status from localStorage
      const savedReadNotifications = localStorage.getItem('readNotifications');
      if (savedReadNotifications) {
        setReadNotifications(new Set(JSON.parse(savedReadNotifications)));
      }
      
      setNotifications(complaintNotifications);
      setBackendStatus('connected');
      
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setBackendStatus('disconnected');
      // Load sample notifications if backend is not available
      loadSampleNotifications();
    }
  };

  // Load sample notifications for demonstration
  const loadSampleNotifications = () => {
    const sampleNotifications = [
      {
        id: 1,
        originalId: 101,
        title: 'नयाँ गुनासो: NTC-2024-001',
        enTitle: 'New Complaint: NTC-2024-001',
        message: 'राम बहादुर बाट नयाँ गुनासो प्राप्त भएको छ। कृपया समीक्षा गर्नुहोस्।',
        enMessage: 'New complaint received from Ram Bahadur. Please review.',
        type: 'complaint',
        type_np: 'साधारण गुनासो',
        type_en: 'Regular Complaint',
        status: 'unread',
        status_np: 'नपढिएको',
        status_en: 'Unread',
        date: formatNepaliDate(new Date()),
        enDate: formatEnglishDate(new Date()),
        time: formatTime(new Date()),
        enTime: formatTime(new Date()),
        sender: 'राम बहादुर',
        enSender: 'Ram Bahadur',
        priority: 'high',
        icon: '🆕',
        link: '/admin-complaints/101',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        originalId: 102,
        title: 'गुनासो समाधान: NTC-2024-002',
        enTitle: 'Complaint Resolved: NTC-2024-002',
        message: 'टिकेट नम्बर NTC-2024-002 को गुनासो सफलतापूर्वक समाधान भएको छ।',
        enMessage: 'Complaint with ticket number NTC-2024-002 has been successfully resolved.',
        type: 'complaint',
        type_np: 'साधारण गुनासो',
        type_en: 'Regular Complaint',
        status: 'read',
        status_np: 'पढिएको',
        status_en: 'Read',
        date: formatNepaliDate(new Date(Date.now() - 86400000)),
        enDate: formatEnglishDate(new Date(Date.now() - 86400000)),
        time: formatTime(new Date(Date.now() - 86400000)),
        enTime: formatTime(new Date(Date.now() - 86400000)),
        sender: 'प्रणाली',
        enSender: 'System',
        priority: 'medium',
        icon: '✅',
        link: '/admin-complaints/102',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        originalId: 201,
        title: 'नयाँ गुनासो: CR-2024-001',
        enTitle: 'New Complaint: CR-2024-001',
        message: 'सीता शर्मा बाट नयाँ गुनासो (सम्बन्धी) प्राप्त भएको छ।',
        enMessage: 'New regarding complaint received from Sita Sharma.',
        type: 'complaint-regarding',
        type_np: 'गुनासो सम्बन्धी',
        type_en: 'Complaint Regarding',
        status: 'unread',
        status_np: 'नपढिएको',
        status_en: 'Unread',
        date: formatNepaliDate(new Date(Date.now() - 172800000)),
        enDate: formatEnglishDate(new Date(Date.now() - 172800000)),
        time: formatTime(new Date(Date.now() - 172800000)),
        enTime: formatTime(new Date(Date.now() - 172800000)),
        sender: 'सीता शर्मा',
        enSender: 'Sita Sharma',
        priority: 'high',
        icon: '🆕',
        link: '/admin-complaints/201',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    setNotifications(sampleNotifications);
    setBackendStatus('disconnected');
  };

  // Check authentication and fetch data
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('adminUser') || localStorage.getItem('user');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      fetchComplaintsAndCreateNotifications();
    }
  }, [navigate]);

  // Save read status to localStorage
  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify([...readNotifications]));
  }, [readNotifications]);

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
      complaintDetails: 'गुनासो विवरण',
      ticketNumber: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      viewComplaint: 'गुनासो हेर्नुहोस्'
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
      complaintDetails: 'Complaint Details',
      ticketNumber: 'Ticket Number',
      complainant: 'Complainant',
      viewComplaint: 'View Complaint'
    }
  };

  const t = content[language];
  const typesObj = {
    np: {
      all: 'सबै प्रकार',
      complaint: 'साधारण गुनासो',
      'complaint-regarding': 'गुनासो सम्बन्धी',
      general: 'साधारण'
    },
    en: {
      all: 'All Types',
      complaint: 'Regular Complaint',
      'complaint-regarding': 'Complaint Regarding',
      general: 'General'
    }
  }[language];

  const statusesObj = {
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
  }[language];

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
    if (type === 'complaint') return typesObj.complaint;
    if (type === 'complaint-regarding') return typesObj['complaint-regarding'];
    return typesObj.general || type;
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

  // Check if notification is read
  const isRead = (notificationId) => {
    return readNotifications.has(notificationId);
  };

  // Get notification status with local read tracking
  const getNotificationStatus = (notification) => {
    if (isRead(notification.id)) return 'read';
    return notification.status;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const notificationStatus = getNotificationStatus(notification);
    const typeMatch = filterType === 'all' || notification.type === filterType;
    const statusMatch = filterStatus === 'all' || notificationStatus === filterStatus;
    return typeMatch && statusMatch;
  });

  // Statistics
  const totalNotifications = filteredNotifications.length;
  const unreadCount = filteredNotifications.filter(n => getNotificationStatus(n) === 'unread').length;

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
    if (!isRead(notification.id)) {
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
    setReadNotifications(prev => new Set([...prev, id]));
    showToast(t.markReadSuccess, 'success');
  };

  const markAllAsRead = () => {
    const allUnreadIds = notifications
      .filter(n => !isRead(n.id))
      .map(n => n.id);
    setReadNotifications(prev => new Set([...prev, ...allUnreadIds]));
    showToast(t.markReadSuccess, 'success');
  };

  const deleteNotification = (id) => {
    if (window.confirm(language === 'np' ? 'के तपाईं यो सूचना हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this notification?')) {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      showToast(t.deleteSuccess, 'success');
    }
  };

  const deleteAll = () => {
    if (window.confirm(language === 'np' ? 'के तपाईं सबै सूचनाहरू हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete all notifications?')) {
      setNotifications([]);
      showToast(t.deleteSuccess, 'success');
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
    
    const newId = Date.now();
    const now = new Date();
    const newNotification = {
      id: newId,
      title: sendNotification.title,
      enTitle: sendNotification.enTitle,
      message: sendNotification.message,
      enMessage: sendNotification.enMessage,
      type: sendNotification.type,
      type_np: sendNotification.type === 'general' ? 'साधारण' : sendNotification.type,
      type_en: sendNotification.type === 'general' ? 'General' : sendNotification.type,
      status: 'unread',
      status_np: 'नपढिएको',
      status_en: 'Unread',
      date: formatNepaliDate(now),
      enDate: formatEnglishDate(now),
      time: formatTime(now),
      enTime: formatTime(now),
      sender: 'Admin',
      enSender: 'Admin',
      priority: sendNotification.priority,
      icon: sendNotification.type === 'general' ? '📢' : '📋',
      link: '/admin-dashboard',
      createdAt: now.toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    showToast(t.notificationSent, 'success');
    closeSendModal();
  };

  const refreshData = () => {
    setCurrentPage(1);
    fetchComplaintsAndCreateNotifications();
  };

  return (
    <div className="admin-notifications">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>✕</button>
        </div>
      )}

      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      {backendStatus === 'disconnected' && (
        <div className="backend-warning">
          ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।' : 'Backend server not connected. Showing sample data.'}
        </div>
      )}
      
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
                <button className="refresh-btn" onClick={refreshData}>
                  🔄 {language === 'np' ? 'रिफ्रेस' : 'Refresh'}
                </button>
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
                  <option value="all">{typesObj.all}</option>
                  <option value="complaint">{typesObj.complaint}</option>
                  <option value="complaint-regarding">{typesObj['complaint-regarding']}</option>
                  <option value="general">{typesObj.general}</option>
                </select>
              </div>
              <div className="filter-group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{statusesObj.all}</option>
                  <option value="unread">{statusesObj.unread}</option>
                  <option value="read">{statusesObj.read}</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
              {paginatedNotifications.length > 0 ? (
                paginatedNotifications.map((notification) => {
                  const isNotificationRead = isRead(notification.id);
                  const notificationStatus = isNotificationRead ? 'read' : notification.status;
                  
                  return (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notificationStatus === 'unread' ? 'unread' : ''}`}
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
                        {notificationStatus === 'unread' && (
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
                  );
                })
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
                <span className={`status-badge ${getStatusClass(getNotificationStatus(selectedNotification))}`}>
                  {getStatusText(getNotificationStatus(selectedNotification))}
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
              
              {/* Complaint Details Section */}
              {selectedNotification.complaintData && (
                <div className="complaint-details-section">
                  <div className="section-title">
                    <h3>📋 {t.complaintDetails}</h3>
                  </div>
                  <div className="detail-row">
                    <label>{t.ticketNumber}:</label>
                    <span>{selectedNotification.complaintData.complaint_number || `#${selectedNotification.complaintData.id}`}</span>
                  </div>
                  <div className="detail-row">
                    <label>{t.complainant}:</label>
                    <span>{selectedNotification.complaintData.name}</span>
                  </div>
                  <div className="detail-row">
                    <label>{t.email}:</label>
                    <span>{selectedNotification.complaintData.email}</span>
                  </div>
                  <div className="detail-row">
                    <label>{t.phone}:</label>
                    <span>{selectedNotification.complaintData.phone}</span>
                  </div>
                  <div className="detail-row full-width">
                    <label>{t.description}:</label>
                    <p>{selectedNotification.complaintData.description}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedNotification.link && (
                <button 
                  className="btn-view"
                  onClick={() => {
                    navigate(selectedNotification.link);
                    closeModal();
                  }}
                >
                  👁️ {t.viewComplaint}
                </button>
              )}
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

        .toast-notification {
          position: fixed;
          top: 200px;
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
          max-width: 350px;
        }
        
        .toast-notification.success { border-left: 4px solid #10b981; background: #ecfdf5; }
        .toast-notification.error { border-left: 4px solid #ef4444; background: #fef2f2; }
        .toast-notification.info { border-left: 4px solid #3b82f6; background: #eff6ff; }
        
        .toast-icon { font-size: 1.2rem; }
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

        .backend-warning {
          position: fixed;
          top: 195px;
          left: 0;
          right: 0;
          background: #f59e0b;
          color: white;
          padding: 8px;
          text-align: center;
          z-index: 100;
          font-size: 0.8rem;
        }

        .dashboard-layout {
          display: flex;
          height: calc(100vh - 195px);
          margin-top: 195px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

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

        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #475569;
        }

        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #3b82f6;
          color: #3b82f6;
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
          max-width: 600px;
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

        .complaint-details-section {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 2px solid #e2e8f0;
        }

        .section-title h3 {
          font-size: 1rem;
          color: #0f172a;
          margin-bottom: 16px;
        }

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

        .btn-send, .btn-close, .btn-view {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-view {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .btn-send:hover, .btn-close:hover, .btn-view:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

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
          
          .refresh-btn, .send-btn, .mark-all-btn, .delete-all-btn {
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
          
          .btn-cancel, .btn-send, .btn-close, .btn-view {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminNotifications;