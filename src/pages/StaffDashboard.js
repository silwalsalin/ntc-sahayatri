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
    if (num === undefined || num === null) return '०';
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
    rejected: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  });
  
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('staffToken') || localStorage.getItem('token');
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
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

  // Format date to Nepali format
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

  // Map status from backend to frontend
  const mapStatus = (status) => {
    if (!status) return 'pending';
    const statusMap = {
      'pending': 'pending',
      'Pending': 'pending',
      'in-progress': 'in-progress',
      'in progress': 'in-progress',
      'In Progress': 'in-progress',
      'inprogress': 'in-progress',
      'resolved': 'resolved',
      'Resolved': 'resolved',
      'Closed': 'resolved',
      'closed': 'resolved',
      'review': 'review',
      'Under Review': 'review',
      'under review': 'review',
      'Rejected': 'rejected',
      'rejected': 'rejected'
    };
    return statusMap[status] || 'pending';
  };

  // Map priority from backend to frontend
  const mapPriority = (priority) => {
    if (!priority) return 'medium';
    const priorityMap = {
      'high': 'high',
      'High': 'high',
      'Urgent': 'high',
      'urgent': 'high',
      'medium': 'medium',
      'Medium': 'medium',
      'low': 'low',
      'Low': 'low'
    };
    return priorityMap[priority] || 'medium';
  };

  // Get category in Nepali
  const getCategoryNepali = (category) => {
    const categories = {
      'service': 'सेवा समस्या',
      'billing': 'बिलिङ समस्या',
      'technical': 'प्राविधिक समस्या',
      'network': 'नेटवर्क समस्या',
      'signal': 'सिग्नल समस्या',
      'recharge': 'रिचार्ज समस्या',
      'activation': 'सक्रियता समस्या',
      'internet': 'इन्टरनेट सेवा',
      'general': 'सामान्य',
      'other': 'अन्य'
    };
    return categories[category] || 'सामान्य';
  };

  // Transform complaint data
  const transformComplaintData = (complaint) => ({
    id: complaint.id,
    ticketId: complaint.complaint_number || complaint.complaintNumber || complaint.ticketId || `NTC-${complaint.id}`,
    name: complaint.name || complaint.fullName || complaint.complainant || 'N/A',
    enName: complaint.nameEn || complaint.name || complaint.fullName || 'N/A',
    email: complaint.email || 'N/A',
    phone: complaint.phone || complaint.mobile || 'N/A',
    category: complaint.nature_of_complaint || complaint.category || complaint.complaint_type || 'general',
    category_np: getCategoryNepali(complaint.nature_of_complaint || complaint.category || complaint.complaint_type),
    category_en: complaint.nature_of_complaint || complaint.category || complaint.complaint_type || 'General',
    subject: complaint.subject || null,
    description: complaint.complaint || complaint.description || complaint.message || 'N/A',
    enDescription: complaint.complaintEn || complaint.complaint || complaint.description || complaint.message || 'N/A',
    status: mapStatus(complaint.status),
    rawStatus: complaint.status,
    date: formatNepaliDate(complaint.created_at || complaint.submittedDate || complaint.createdAt),
    enDate: formatEnglishDate(complaint.created_at || complaint.submittedDate || complaint.createdAt),
    priority: mapPriority(complaint.priority),
    assignedTo: complaint.assigned_to || complaint.assignedTo || complaint.assignedToName || staffData.name,
    assignedByName: complaint.assigned_by_name || complaint.assignedByName || 'Admin',
    submittedDate: complaint.created_at || complaint.submittedDate || complaint.createdAt || new Date().toISOString(),
    resolution: complaint.resolution || null,
    actionTaken: complaint.action_taken || complaint.actionTaken || null
  });

  // Set sample data
  const setSampleData = () => {
    const sampleComplaints = [
      { 
        id: 1, 
        ticketId: 'NTC-2024-001', 
        name: 'रमेश केसी', 
        enName: 'Ramesh KC',
        email: 'ramesh@example.com',
        phone: '9841000001',
        category: 'internet',
        category_np: 'इन्टरनेट',
        category_en: 'Internet',
        subject: 'इन्टरनेट जडान समस्या',
        description: 'फाइबर जडान २ दिनदेखि बन्द छ।',
        enDescription: 'Fiber connection has been down for 2 days.',
        status: 'in-progress',
        date: formatNepaliDate(new Date(Date.now() - 5 * 86400000)),
        enDate: formatEnglishDate(new Date(Date.now() - 5 * 86400000)),
        priority: 'high',
        assignedTo: staffData.name,
        assignedByName: 'Admin',
        submittedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        resolution: null,
        actionTaken: null,
        type: 'regular'
      },
      { 
        id: 2, 
        ticketId: 'NTC-2024-002', 
        name: 'सीता शर्मा', 
        enName: 'Sita Sharma',
        email: 'sita@example.com',
        phone: '9812345678',
        category: 'billing',
        category_np: 'बिलिङ',
        category_en: 'Billing',
        subject: 'बिलिङ समस्या',
        description: 'गत महिनाको बिलमा रु. ५०० गलत चार्ज देखाइएको छ।',
        enDescription: 'Wrong charge of Rs. 500 shown in last month\'s bill.',
        status: 'pending',
        date: formatNepaliDate(new Date(Date.now() - 3 * 86400000)),
        enDate: formatEnglishDate(new Date(Date.now() - 3 * 86400000)),
        priority: 'medium',
        assignedTo: staffData.name,
        assignedByName: 'Admin',
        submittedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
        resolution: null,
        actionTaken: null,
        type: 'regarding'
      },
      { 
        id: 3, 
        ticketId: 'NTC-2024-003', 
        name: 'हरि प्रसाद', 
        enName: 'Hari Prasad',
        email: 'hari@example.com',
        phone: '9812345690',
        category: 'activation',
        category_np: 'सक्रियता',
        category_en: 'Activation',
        subject: 'सिम सक्रियता समस्या',
        description: 'नयाँ सिम खरिद गरेको २४ घण्टा भयो तर सक्रिय भएको छैन।',
        enDescription: 'Purchased new SIM 24 hours ago but not activated yet.',
        status: 'review',
        date: formatNepaliDate(new Date(Date.now() - 1 * 86400000)),
        enDate: formatEnglishDate(new Date(Date.now() - 1 * 86400000)),
        priority: 'high',
        assignedTo: staffData.name,
        assignedByName: 'Admin',
        submittedDate: new Date(Date.now() - 1 * 86400000).toISOString(),
        resolution: null,
        actionTaken: null,
        type: 'regular'
      }
    ];

    setRecentComplaints(sampleComplaints);
    
    // Calculate stats from sample data
    const total = sampleComplaints.length;
    const pending = sampleComplaints.filter(c => c.status === 'pending').length;
    const inProgress = sampleComplaints.filter(c => c.status === 'in-progress').length;
    const resolved = 0;
    const review = sampleComplaints.filter(c => c.status === 'review').length;
    const rejected = 0;
    const highPriority = sampleComplaints.filter(c => c.priority === 'high').length;
    const mediumPriority = sampleComplaints.filter(c => c.priority === 'medium').length;
    const lowPriority = 0;
    
    setStats({
      totalAssigned: total,
      pending,
      inProgress,
      resolved,
      review,
      rejected,
      highPriority,
      mediumPriority,
      lowPriority
    });
    
    // Activities
    const activities = sampleComplaints.map(complaint => ({
      id: complaint.id,
      action: language === 'np' 
        ? `गुनासो #${complaint.ticketId} ${getStatusText(complaint.status)} मा छ`
        : `Complaint #${complaint.ticketId} is ${complaint.status}`,
      time: formatRelativeTime(complaint.submittedDate),
      status: complaint.status
    }));
    setRecentActivities(activities);
    
    // Notifications
    const notifs = [
      {
        id: 'notif-1',
        message: language === 'np' 
          ? '📌 एडमिनले तपाईंलाई नयाँ गुनासो #NTC-2024-001 तोकेका छन्' 
          : '📌 Admin has assigned new complaint #NTC-2024-001 to you',
        time: formatRelativeTime(new Date(Date.now() - 1000 * 60 * 5)),
        read: false,
        type: 'assignment',
        complaintId: 1
      },
      {
        id: 'notif-2',
        message: language === 'np' 
          ? '🔄 एडमिनले गुनासो #NTC-2024-002 को स्थिति "प्रगतिमा" मा अपडेट गरे' 
          : '🔄 Admin updated complaint #NTC-2024-002 status to "In Progress"',
        time: formatRelativeTime(new Date(Date.now() - 1000 * 60 * 30)),
        read: false,
        type: 'status_update',
        complaintId: 2
      },
      {
        id: 'notif-3',
        message: language === 'np' 
          ? '✅ एडमिनले गुनासो #NTC-2024-003 "समाधान" भएको पुष्टि गरे' 
          : '✅ Admin confirmed complaint #NTC-2024-003 as "Resolved"',
        time: formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 2)),
        read: true,
        type: 'resolution',
        complaintId: 3
      }
    ];
    setNotifications(notifs);
    setBackendStatus('disconnected');
  };

  // Fetch staff dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        navigate('/login');
        setLoading(false);
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      let regularComplaints = [];
      let regardingComplaints = [];
      let notificationsData = [];
      
      // Fetch regular complaints assigned to this staff
      try {
        const regularResponse = await axios.get(`${API_URL}/complaints/assigned-to-me`, { headers });
        if (regularResponse.data.success && Array.isArray(regularResponse.data.data)) {
          regularComplaints = regularResponse.data.data.map(complaint => ({
            ...transformComplaintData(complaint),
            type: 'regular'
          }));
          console.log(`✅ Loaded ${regularComplaints.length} regular complaints`);
        }
      } catch (err) {
        console.log('Error fetching regular complaints:', err.message);
        // Try alternative: fetch all complaints and filter
        try {
          const allComplaintsResponse = await axios.get(`${API_URL}/complaints`, { headers });
          if (allComplaintsResponse.data.success && Array.isArray(allComplaintsResponse.data.data)) {
            const filtered = allComplaintsResponse.data.data.filter(c => 
              c.assigned_to === staffData.email || 
              c.assigned_to === staffData.name || 
              c.assigned_to === String(staffData.id) ||
              c.assigned_to === staffData.id
            );
            regularComplaints = filtered.map(complaint => ({
              ...transformComplaintData(complaint),
              type: 'regular'
            }));
            console.log(`✅ Loaded ${regularComplaints.length} regular complaints (filtered)`);
          }
        } catch (err2) {
          console.log('Error fetching from /complaints:', err2.message);
        }
      }
      
      // Fetch regarding complaints assigned to this staff
      try {
        const regardingResponse = await axios.get(`${API_URL}/complaint-regarding/assigned-to-me`, { headers });
        if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
          regardingComplaints = regardingResponse.data.data.map(complaint => ({
            ...transformComplaintData(complaint),
            type: 'regarding'
          }));
          console.log(`✅ Loaded ${regardingComplaints.length} regarding complaints`);
        }
      } catch (err) {
        console.log('Error fetching regarding complaints:', err.message);
        // Try alternative: fetch all regarding complaints and filter
        try {
          const allRegardingResponse = await axios.get(`${API_URL}/complaint-regarding`, { headers });
          if (allRegardingResponse.data.success && Array.isArray(allRegardingResponse.data.data)) {
            const filtered = allRegardingResponse.data.data.filter(c => 
              c.assigned_to === staffData.email || 
              c.assigned_to === staffData.name || 
              c.assigned_to === String(staffData.id) ||
              c.assigned_to === staffData.id
            );
            regardingComplaints = filtered.map(complaint => ({
              ...transformComplaintData(complaint),
              type: 'regarding'
            }));
            console.log(`✅ Loaded ${regardingComplaints.length} regarding complaints (filtered)`);
          }
        } catch (err2) {
          console.log('Error fetching from /complaint-regarding:', err2.message);
        }
      }
      
      // Fetch notifications from backend - Updated to get from admin notifications
      try {
        const notificationsResponse = await axios.get(`${API_URL}/notifications/staff`, { headers });
        if (notificationsResponse.data.success && Array.isArray(notificationsResponse.data.data)) {
          notificationsData = notificationsResponse.data.data.map(n => {
            // Determine notification type based on action
            let type = 'general';
            if (n.action === 'assigned') type = 'assignment';
            else if (n.action === 'status_updated') type = 'status_update';
            else if (n.action === 'resolved') type = 'resolution';
            else if (n.action === 'rejected') type = 'rejected';
            
            return {
              id: n.id || `notif-${Date.now()}-${Math.random()}`,
              message: language === 'np' ? n.message_np || n.message : n.message_en || n.message,
              time: formatRelativeTime(n.created_at || n.createdAt || n.timestamp),
              read: n.read || false,
              type: type,
              complaintId: n.complaint_id || n.complaintId,
              action: n.action,
              data: n.data || {}
            };
          });
          console.log(`✅ Loaded ${notificationsData.length} notifications`);
        }
      } catch (err) {
        console.log('Error fetching notifications:', err.message);
      }
      
      // Combine all complaints
      const allComplaints = [...regularComplaints, ...regardingComplaints];
      
      if (allComplaints.length > 0) {
        allComplaints.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
        setRecentComplaints(allComplaints.slice(0, 5));
        
        // Calculate statistics
        const total = allComplaints.length;
        const pending = allComplaints.filter(c => c.status === 'pending').length;
        const inProgress = allComplaints.filter(c => c.status === 'in-progress').length;
        const resolved = allComplaints.filter(c => c.status === 'resolved').length;
        const review = allComplaints.filter(c => c.status === 'review').length;
        const rejected = allComplaints.filter(c => c.status === 'rejected').length;
        const highPriority = allComplaints.filter(c => c.priority === 'high').length;
        const mediumPriority = allComplaints.filter(c => c.priority === 'medium').length;
        const lowPriority = allComplaints.filter(c => c.priority === 'low').length;
        
        setStats({
          totalAssigned: total,
          pending,
          inProgress,
          resolved,
          review,
          rejected,
          highPriority,
          mediumPriority,
          lowPriority
        });
        
        // Create activities from complaints
        const activities = allComplaints.slice(0, 5).map(complaint => {
          return {
            id: complaint.id,
            action: language === 'np' 
              ? `गुनासो #${complaint.ticketId} ${getStatusText(complaint.status)} मा छ`
              : `Complaint #${complaint.ticketId} is ${getStatusText(complaint.status)}`,
            time: formatRelativeTime(complaint.submittedDate),
            status: complaint.status
          };
        });
        setRecentActivities(activities);
        setBackendStatus('connected');
        
        // If no notifications from backend, create from complaints
        if (notificationsData.length === 0) {
          const unreadNotifications = allComplaints
            .filter(c => c.status === 'pending' || c.status === 'in-progress')
            .slice(0, 3)
            .map(c => ({
              id: `notif-${c.id}`,
              message: language === 'np' 
                ? `📌 एडमिनले गुनासो #${c.ticketId} तपाईंलाई तोकेको छ - ${c.name}`
                : `📌 Admin assigned complaint #${c.ticketId} to you - ${c.name}`,
              time: formatRelativeTime(c.submittedDate),
              read: false,
              type: 'assignment',
              complaintId: c.id,
              action: 'assigned'
            }));
          setNotifications(unreadNotifications);
        } else {
          setNotifications(notificationsData);
        }
        
        showToast(
          language === 'np' 
            ? `${total} गुनासोहरू लोड गरियो` 
            : `${total} complaints loaded`,
          'success'
        );
      } else {
        // No complaints found, use sample data
        console.log('No complaints found, using sample data');
        setSampleData();
        setBackendStatus('disconnected');
        showToast(
          language === 'np' 
            ? 'ब्याकेन्डमा कुनै गुनासो फेला परेन। नमूना डाटा देखाउँदै।' 
            : 'No complaints found. Showing sample data.',
          'info'
        );
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSampleData();
      setBackendStatus('disconnected');
      
      if (error.response?.status === 401) {
        showToast(
          language === 'np' 
            ? 'सेसन समाप्त भयो। कृपया पुन: लगइन गर्नुहोस्।' 
            : 'Session expired. Please login again.',
          'error'
        );
        setTimeout(() => navigate('/login'), 1500);
      } else if (error.code === 'ERR_NETWORK') {
        showToast(
          language === 'np' 
            ? 'सर्भरमा जडान हुन सकेन। नमूना डाटा देखाउँदै।' 
            : 'Cannot connect to server. Showing sample data.',
          'warning'
        );
      } else {
        showToast(
          language === 'np' 
            ? 'डाटा लोड गर्न असफल। नमूना डाटा देखाउँदै।' 
            : 'Failed to load data. Showing sample data.',
          'warning'
        );
      }
    } finally {
      setLoading(false);
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

  // Handle view complaint details - Open Modal
  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    document.body.style.overflow = 'unset';
  };

  // Handle notification click - mark as read and navigate to complaint
  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        const token = getAuthToken();
        await axios.patch(`${API_URL}/notifications/${notification.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // If notification has a complaint ID, show the complaint details
    if (notification.complaintId) {
      // Find the complaint in recent complaints or fetch it
      const complaint = recentComplaints.find(c => c.id === notification.complaintId);
      if (complaint) {
        handleViewComplaint(complaint);
      } else {
        // Try to fetch the complaint from backend
        try {
          const token = getAuthToken();
          const response = await axios.get(`${API_URL}/complaints/${notification.complaintId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            const complaintData = transformComplaintData(response.data.data);
            handleViewComplaint(complaintData);
          }
        } catch (error) {
          console.error('Error fetching complaint:', error);
          showToast(
            language === 'np' ? 'गुनासो फेला परेन' : 'Complaint not found',
            'error'
          );
        }
      }
    }
  };

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
      rejected: 'अस्वीकृत',
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
      justNow: 'अहिले',
      loading: 'लोड हुँदै...',
      connectionError: 'सर्भर जडान भएन। नमूना डाटा देखाउँदै।',
      category: 'प्रकार',
      subject: 'विषय',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      assignedTo: 'तोकिएको व्यक्ति',
      resolution: 'समाधान',
      actionTaken: 'गरिएको कार्य',
      close: 'बन्द गर्नुहोस्',
      notificationAssignment: '📌 गुनासो तोकिएको',
      notificationStatusUpdate: '🔄 स्थिति अपडेट',
      notificationResolution: '✅ समाधान',
      notificationRejected: '❌ अस्वीकृत',
      notificationGeneral: 'ℹ️ सामान्य'
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
      rejected: 'Rejected',
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
      justNow: 'Just now',
      loading: 'Loading...',
      connectionError: 'Server connection failed. Showing sample data.',
      category: 'Category',
      subject: 'Subject',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      assignedTo: 'Assigned To',
      resolution: 'Resolution',
      actionTaken: 'Action Taken',
      close: 'Close',
      notificationAssignment: '📌 Complaint Assigned',
      notificationStatusUpdate: '🔄 Status Update',
      notificationResolution: '✅ Resolution',
      notificationRejected: '❌ Rejected',
      notificationGeneral: 'ℹ️ General'
    }
  };

  const t = content[language];

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      'in-progress': 'status-progress',
      resolved: 'status-resolved',
      review: 'status-review',
      rejected: 'status-rejected'
    };
    return classes[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    if (language === 'np') {
      const texts = {
        pending: 'विचाराधीन',
        'in-progress': 'प्रगतिमा',
        resolved: 'समाधान',
        review: 'समीक्षामा',
        rejected: 'अस्वीकृत'
      };
      return texts[status] || status;
    }
    const texts = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      resolved: 'Resolved',
      review: 'Under Review',
      rejected: 'Rejected'
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

  const getCategoryText = (complaint) => {
    return language === 'np' ? complaint.category_np : complaint.category_en;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'assignment': '📌',
      'status_update': '🔄',
      'resolution': '✅',
      'rejected': '❌',
      'general': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  const getNotificationTypeText = (type) => {
    if (language === 'np') {
      const types = {
        'assignment': t.notificationAssignment,
        'status_update': t.notificationStatusUpdate,
        'resolution': t.notificationResolution,
        'rejected': t.notificationRejected,
        'general': t.notificationGeneral
      };
      return types[type] || t.notificationGeneral;
    }
    const types = {
      'assignment': '📌 Complaint Assigned',
      'status_update': '🔄 Status Update',
      'resolution': '✅ Resolution',
      'rejected': '❌ Rejected',
      'general': 'ℹ️ General'
    };
    return types[type] || 'ℹ️ General';
  };

  return (
    <div className="staff-dashboard">
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
            {/* Loading State */}
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t.loading}</p>
              </div>
            ) : (
              <>
                {/* Backend Status Banner */}
                {backendStatus === 'disconnected' && (
                  <div className="backend-warning">
                    ⚠️ {t.connectionError}
                  </div>
                )}

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

                {/* Priority Statistics */}
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
                                <span className="complaint-category">{getCategoryText(complaint)}</span>
                                <span className="complaint-date">📅 {getComplaintDate(complaint)}</span>
                                <button 
                                  className="view-btn"
                                  onClick={() => handleViewComplaint(complaint)}
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
                            <div className={`activity-dot ${activity.status === 'resolved' ? 'completed' : activity.status === 'in-progress' ? 'in-progress' : 'pending'}`}></div>
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
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="notification-content">
                            <div className="notification-header">
                              <span className="notification-icon">{getNotificationIcon(notif.type)}</span>
                              <span className="notification-type">{getNotificationTypeText(notif.type)}</span>
                            </div>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {t.complaintDetails}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>📌 {t.complaintInfo || 'Complaint Information'}</h4>
                <div className="detail-row">
                  <label>{t.ticketId}:</label>
                  <span>{selectedComplaint.ticketId}</span>
                </div>
                <div className="detail-row">
                  <label>{t.category}:</label>
                  <span>{getCategoryText(selectedComplaint)}</span>
                </div>
                {selectedComplaint.subject && (
                  <div className="detail-row">
                    <label>{t.subject}:</label>
                    <span>{selectedComplaint.subject}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>👤 {t.complainant}</h4>
                <div className="detail-row">
                  <label>{t.name}:</label>
                  <span>{getComplaintName(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.email}:</label>
                  <span>{selectedComplaint.email}</span>
                </div>
                <div className="detail-row">
                  <label>{t.phone}:</label>
                  <span>{selectedComplaint.phone}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>📝 {t.description}</h4>
                <div className="detail-row full-width">
                  <p>{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
                </div>
              </div>

              <div className="detail-section">
                <h4>📊 {t.status}</h4>
                <div className="detail-row">
                  <label>{t.status}:</label>
                  <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>
                    {getStatusText(selectedComplaint.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.priority}:</label>
                  <span className={`priority-badge ${getPriorityClass(selectedComplaint.priority)}`}>
                    {getPriorityText(selectedComplaint.priority)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.registeredDate}:</label>
                  <span>{getComplaintDate(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.assignedTo}:</label>
                  <span>{selectedComplaint.assignedTo}</span>
                </div>
                {selectedComplaint.assignedByName && (
                  <div className="detail-row">
                    <label>{t.assignedBy}:</label>
                    <span>{selectedComplaint.assignedByName}</span>
                  </div>
                )}
              </div>

              {selectedComplaint.resolution && (
                <div className="detail-section">
                  <h4>✅ {t.resolution}</h4>
                  <div className="detail-row full-width">
                    <p>{selectedComplaint.resolution}</p>
                  </div>
                </div>
              )}

              {selectedComplaint.actionTaken && (
                <div className="detail-section">
                  <h4>📋 {t.actionTaken}</h4>
                  <div className="detail-row full-width">
                    <p>{selectedComplaint.actionTaken}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={closeModal}>{t.close}</button>
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

        .staff-dashboard {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          position: relative;
        }

        /* Toast Notification */
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
        .toast-notification.warning { border-left: 4px solid #f59e0b; background: #fffbeb; }
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

       
        /* Dashboard Layout */
        .dashboard-layout {
          display: flex;
          height: calc(100vh - 195px);
          margin-top: 195px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        /* Main Content */
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

        .backend-warning {
          background: #ff9800;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 500;
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
        .status-rejected { background: #fee2e2; color: #dc2626; }

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

        .complaint-category {
          font-size: 0.7rem;
          color: #475569;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 12px;
        }

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

        .notification-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .notification-icon {
          font-size: 0.9rem;
        }

        .notification-type {
          font-size: 0.7rem;
          font-weight: 600;
          color: #0288d1;
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
          flex-shrink: 0;
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

        /* Modal Styles */
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

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-section h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e2e8f0;
        }

        .detail-row {
          display: flex;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 4px;
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
          min-width: 0;
          word-break: break-word;
        }

        .detail-row.full-width {
          flex-direction: column;
        }

        .detail-row.full-width label {
          width: 100%;
          margin-bottom: 4px;
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

        .btn-close-modal {
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          background: #f1f5f9;
          color: #475569;
        }

        .btn-close-modal:hover {
          background: #e2e8f0;
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
          
          .toast-notification {
            top: auto;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
          }
          
          .loading-container {
            min-height: 200px;
          }
          
          .modal-content {
            max-width: 95%;
          }
          
          .detail-row {
            flex-direction: column;
          }
          
          .detail-row label {
            width: 100%;
            margin-bottom: 2px;
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