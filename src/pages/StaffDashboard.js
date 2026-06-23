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
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Format number with Nepali digits
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
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
          id: user.id || user._id || null,
          name: user.name || user.nameEn || 'Staff User',
          nameEn: user.nameEn || user.name || 'Staff User',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'staff',
          department: user.department || 'Customer Support',
          joinDate: user.createdAt || user.created_at || new Date().toISOString().split('T')[0]
        };
      } catch (e) {
        return {
          id: null,
          name: 'Staff User',
          nameEn: 'Staff User',
          email: '',
          phone: '',
          role: 'staff',
          department: 'Customer Support',
          joinDate: new Date().toISOString().split('T')[0]
        };
      }
    }
    return {
      id: null,
      name: 'Staff User',
      nameEn: 'Staff User',
      email: '',
      phone: '',
      role: 'staff',
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

  // Open complaint details modal
  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Close complaint details modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    document.body.style.overflow = 'unset';
  };

  // Fetch staff dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        setError('Authentication token not found. Please login again.');
        navigate('/login');
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const staffEmail = staffData.email;
      const staffId = staffData.id;
      
      if (!staffEmail && !staffId) {
        console.error('No staff email or ID found');
        setError('Staff information not found. Please login again.');
        navigate('/login');
        return;
      }
      
      console.log('Fetching complaints for staff:', { staffEmail, staffId });
      
      // ============================================
      // FETCH COMPLAINTS FROM BOTH ENDPOINTS
      // ============================================
      
      let allAssignedComplaints = [];
      
      // 1. Fetch from /complaints (regular complaints)
      try {
        const regularResponse = await axios.get(`${API_URL}/complaints`, { headers });
        if (regularResponse.data.success && Array.isArray(regularResponse.data.data)) {
          // Filter complaints assigned to this staff member by email
          const filteredRegular = regularResponse.data.data.filter(complaint => {
            const assignedTo = complaint.assignedTo || complaint.assigned_to || '';
            const assignedToEmail = complaint.assignedToEmail || complaint.assigned_to_email || '';
            const assignedToName = complaint.assignedToName || complaint.assigned_to_name || '';
            
            // Check if assigned to this staff by email or name match
            const isAssigned = 
              assignedTo === staffEmail || 
              assignedToEmail === staffEmail ||
              assignedToName === staffData.name ||
              assignedToName === staffData.nameEn;
            
            if (isAssigned) {
              console.log('Found assigned regular complaint:', complaint.id);
            }
            return isAssigned;
          });
          
          // Transform regular complaints
          const transformedRegular = filteredRegular.map(complaint => ({
            id: complaint.id || complaint._id,
            ticketId: complaint.complaint_number || `NTC-${complaint.id || complaint._id}`,
            name: complaint.name || complaint.fullName || complaint.full_name || 'N/A',
            enName: complaint.nameEn || complaint.fullName || complaint.full_name || complaint.name || 'N/A',
            email: complaint.email || 'N/A',
            phone: complaint.phone || complaint.mobile || 'N/A',
            status: complaint.status || 'pending',
            priority: complaint.priority || 'medium',
            date: formatDate(complaint.created_at || complaint.createdAt),
            enDate: formatDateEnglish(complaint.created_at || complaint.createdAt),
            fullDate: formatFullDateTime(complaint.created_at || complaint.createdAt, 'np'),
            enFullDate: formatFullDateTime(complaint.created_at || complaint.createdAt, 'en'),
            description: complaint.description || complaint.message || '',
            enDescription: complaint.descriptionEn || complaint.description || complaint.message || '',
            assignedBy: complaint.assignedBy || complaint.assigned_by || complaint.assignedByName || 'Admin',
            assignedByName: complaint.assignedByName || complaint.assigned_by_name || 'Admin',
            assignedTo: complaint.assignedTo || complaint.assigned_to || staffEmail,
            type: 'regular',
            channel: complaint.channel || 'Website',
            enChannel: complaint.channel || 'Website',
            category: complaint.nature_of_complaint || complaint.category || 'General',
            category_np: getCategoryNepali(complaint.nature_of_complaint || complaint.category),
            category_en: complaint.nature_of_complaint || complaint.category || 'General',
            subject: complaint.subject || null,
            resolvedDate: complaint.resolved_at || complaint.resolvedAt || null,
            enResolvedDate: complaint.resolved_at || complaint.resolvedAt || null,
            address: complaint.address || complaint.street_address || null,
            landmark: complaint.landmark || null,
            referenceNumber: complaint.reference_number || null
          }));
          
          allAssignedComplaints = [...allAssignedComplaints, ...transformedRegular];
        }
      } catch (regularError) {
        console.error('Error fetching regular complaints:', regularError);
      }
      
      // 2. Fetch from /complaint-regarding (regarding complaints)
      try {
        const regardingResponse = await axios.get(`${API_URL}/complaint-regarding`, { headers });
        if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
          // Filter regarding complaints assigned to this staff member by email
          const filteredRegarding = regardingResponse.data.data.filter(complaint => {
            const assignedTo = complaint.assignedTo || complaint.assigned_to || '';
            const assignedToEmail = complaint.assignedToEmail || complaint.assigned_to_email || '';
            const assignedToName = complaint.assignedToName || complaint.assigned_to_name || '';
            
            const isAssigned = 
              assignedTo === staffEmail || 
              assignedToEmail === staffEmail ||
              assignedToName === staffData.name ||
              assignedToName === staffData.nameEn;
            
            if (isAssigned) {
              console.log('Found assigned regarding complaint:', complaint.id);
            }
            return isAssigned;
          });
          
          // Transform regarding complaints
          const transformedRegarding = filteredRegarding.map(complaint => ({
            id: complaint.id || complaint._id,
            ticketId: complaint.complaint_number || `CR-${complaint.id || complaint._id}`,
            name: complaint.name || complaint.fullName || complaint.full_name || 'N/A',
            enName: complaint.nameEn || complaint.fullName || complaint.full_name || complaint.name || 'N/A',
            email: complaint.email || 'N/A',
            phone: complaint.phone || complaint.mobile || 'N/A',
            status: complaint.status || 'pending',
            priority: complaint.priority || 'medium',
            date: formatDate(complaint.created_at || complaint.createdAt),
            enDate: formatDateEnglish(complaint.created_at || complaint.createdAt),
            fullDate: formatFullDateTime(complaint.created_at || complaint.createdAt, 'np'),
            enFullDate: formatFullDateTime(complaint.created_at || complaint.createdAt, 'en'),
            description: complaint.description || complaint.message || '',
            enDescription: complaint.descriptionEn || complaint.description || complaint.message || '',
            assignedBy: complaint.assignedBy || complaint.assigned_by || complaint.assignedByName || 'Admin',
            assignedByName: complaint.assignedByName || complaint.assigned_by_name || 'Admin',
            assignedTo: complaint.assignedTo || complaint.assigned_to || staffEmail,
            type: 'regarding',
            channel: complaint.channel || complaint.preferred_contact === 'phone' ? 'Phone' : 'Website',
            enChannel: complaint.channel || complaint.preferred_contact === 'phone' ? 'Phone' : 'Website',
            category: complaint.complaint_type || complaint.category || 'General',
            category_np: getCategoryNepali(complaint.complaint_type || complaint.category),
            category_en: complaint.complaint_type || complaint.category || 'General',
            subject: complaint.subject || null,
            resolvedDate: complaint.resolved_at || complaint.resolvedAt || null,
            enResolvedDate: complaint.resolved_at || complaint.resolvedAt || null,
            address: complaint.address || null,
            landmark: complaint.landmark || null,
            referenceNumber: complaint.reference_number || null
          }));
          
          allAssignedComplaints = [...allAssignedComplaints, ...transformedRegarding];
        }
      } catch (regardingError) {
        console.error('Error fetching regarding complaints:', regardingError);
      }
      
      console.log(`Total assigned complaints found: ${allAssignedComplaints.length}`);
      
      // Sort by date (newest first)
      allAssignedComplaints.sort((a, b) => {
        const dateA = new Date(a.date || a.enDate);
        const dateB = new Date(b.date || b.enDate);
        return dateB - dateA;
      });
      
      setRecentComplaints(allAssignedComplaints);
      
      // Calculate statistics from assigned complaints
      const updatedStats = {
        totalAssigned: allAssignedComplaints.length,
        pending: allAssignedComplaints.filter(c => c.status === 'pending' || c.status === 'PENDING').length,
        inProgress: allAssignedComplaints.filter(c => c.status === 'in-progress' || c.status === 'IN_PROGRESS' || c.status === 'inprogress').length,
        resolved: allAssignedComplaints.filter(c => c.status === 'resolved' || c.status === 'RESOLVED' || c.status === 'completed').length,
        review: allAssignedComplaints.filter(c => c.status === 'review' || c.status === 'REVIEW' || c.status === 'under_review').length,
        highPriority: allAssignedComplaints.filter(c => c.priority === 'high' || c.priority === 'HIGH').length,
        mediumPriority: allAssignedComplaints.filter(c => c.priority === 'medium' || c.priority === 'MEDIUM').length,
        lowPriority: allAssignedComplaints.filter(c => c.priority === 'low' || c.priority === 'LOW').length
      };
      setStats(updatedStats);
      
      // Create activities from complaints
      const activities = allAssignedComplaints.slice(0, 5).map(complaint => ({
        id: complaint.id,
        action: language === 'np' 
          ? `गुनासो #${complaint.ticketId} ${getStatusText(complaint.status)} मा छ`
          : `Complaint #${complaint.ticketId} is ${getStatusText(complaint.status)}`,
        time: formatRelativeTime(complaint.date),
        status: complaint.status
      }));
      setRecentActivities(activities);
      
      // Fetch notifications
      try {
        const notificationsResponse = await axios.get(`${API_URL}/notifications`, { 
          headers,
          params: { 
            staffId: staffId || staffEmail,
            limit: 5 
          }
        });
        
        if (notificationsResponse.data.success && Array.isArray(notificationsResponse.data.data)) {
          const transformedNotifications = notificationsResponse.data.data.map(n => ({
            id: n.id || n._id,
            message: language === 'np' ? n.messageNp || n.message : n.messageEn || n.message,
            time: formatRelativeTime(n.createdAt || n.created_at),
            read: n.read || false
          }));
          setNotifications(transformedNotifications);
        } else {
          // Set welcome notification
          setNotifications([
            { 
              id: 1, 
              message: language === 'np' ? 'तपाईंको ड्यासबोर्डमा स्वागत छ' : 'Welcome to your dashboard', 
              time: language === 'np' ? 'अहिले' : 'Just now', 
              read: false 
            }
          ]);
        }
      } catch (notifError) {
        console.warn('Error fetching notifications:', notifError);
        setNotifications([
          { 
            id: 1, 
            message: language === 'np' ? 'तपाईंको ड्यासबोर्डमा स्वागत छ' : 'Welcome to your dashboard', 
            time: language === 'np' ? 'अहिले' : 'Just now', 
            read: false 
          }
        ]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Format full date and time
  const formatFullDateTime = (date, lang) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      
      if (lang === 'np') {
        const year = d.getFullYear() - 57;
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        const yearNp = year.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        const monthNp = month.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        const dayNp = day.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        const hoursNp = hours.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        const minutesNp = minutes.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        return `${yearNp}-${monthNp}-${dayNp} ${hoursNp}:${minutesNp}`;
      } else {
        return d.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (error) {
      return '-';
    }
  };

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
      'other': 'अन्य',
      'complaint': 'गुनासो',
      'suggestion': 'सुझाव',
      'feedback': 'प्रतिक्रिया'
    };
    return categories[category] || 'सामान्य';
  };

  const setSampleData = () => {
    // Sample complaints for demonstration
    const sampleComplaints = [
      { 
        id: 1, 
        ticketId: 'NTC-2024-001', 
        name: 'राम बहादुर', 
        enName: 'Ram Bahadur',
        email: 'ram@example.com',
        phone: '9841234567',
        status: 'in-progress', 
        priority: 'high', 
        date: formatDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
        enDate: formatDateEnglish(new Date(Date.now() - 2 * 60 * 60 * 1000)),
        fullDate: formatFullDateTime(new Date(Date.now() - 2 * 60 * 60 * 1000), 'np'),
        enFullDate: formatFullDateTime(new Date(Date.now() - 2 * 60 * 60 * 1000), 'en'),
        description: 'इन्टरनेट जडान समस्या। घरमा इन्टरनेट चलिरहेको छैन। कृपया जाँच गरिदिनुहोस्।', 
        enDescription: 'Internet connection issue. Internet is not working at home. Please check.',
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        type: 'regular',
        channel: 'Website',
        enChannel: 'Website',
        category: 'internet',
        category_np: 'इन्टरनेट सेवा',
        category_en: 'Internet',
        subject: 'इन्टरनेट जडान समस्या',
        address: 'काठमाडौं-१०, बानेश्वर',
        landmark: 'बानेश्वर चोक नजिक',
        referenceNumber: 'REF-2024-001'
      },
      { 
        id: 2, 
        ticketId: 'NTC-2024-002', 
        name: 'सीता शर्मा', 
        enName: 'Sita Sharma',
        email: 'sita@example.com',
        phone: '9847654321',
        status: 'pending', 
        priority: 'medium', 
        date: formatDate(new Date(Date.now() - 5 * 60 * 60 * 1000)),
        enDate: formatDateEnglish(new Date(Date.now() - 5 * 60 * 60 * 1000)),
        fullDate: formatFullDateTime(new Date(Date.now() - 5 * 60 * 60 * 1000), 'np'),
        enFullDate: formatFullDateTime(new Date(Date.now() - 5 * 60 * 60 * 1000), 'en'),
        description: 'मेरो एनटिसी नम्बरमा बिलिङ समस्या छ। गलत रकम काटिएको छ।', 
        enDescription: 'There is a billing issue on my NTC number. Wrong amount has been deducted.',
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        type: 'regular',
        channel: 'Phone',
        enChannel: 'Phone',
        category: 'billing',
        category_np: 'बिलिङ समस्या',
        category_en: 'Billing',
        subject: 'बिलिङ समस्या',
        address: 'ललितपुर-१५, जावलाखेल',
        landmark: 'जावलाखेल बसपार्क नजिक',
        referenceNumber: 'REF-2024-002'
      }
    ];
    
    setStats({
      totalAssigned: sampleComplaints.length,
      pending: sampleComplaints.filter(c => c.status === 'pending').length,
      inProgress: sampleComplaints.filter(c => c.status === 'in-progress').length,
      resolved: sampleComplaints.filter(c => c.status === 'resolved').length,
      review: sampleComplaints.filter(c => c.status === 'review').length,
      highPriority: sampleComplaints.filter(c => c.priority === 'high').length,
      mediumPriority: sampleComplaints.filter(c => c.priority === 'medium').length,
      lowPriority: sampleComplaints.filter(c => c.priority === 'low').length
    });
    
    setRecentComplaints(sampleComplaints);
    
    setRecentActivities([
      { 
        id: 1, 
        action: language === 'np' ? 'गुनासो #NTC-2024-001 तपाईंलाई तोकियो' : 'Complaint #NTC-2024-001 assigned to you', 
        time: formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)), 
        status: 'pending' 
      },
      { 
        id: 2, 
        action: language === 'np' ? 'गुनासो #NTC-2024-002 तपाईंलाई तोकियो' : 'Complaint #NTC-2024-002 assigned to you', 
        time: formatRelativeTime(new Date(Date.now() - 5 * 60 * 60 * 1000)), 
        status: 'pending' 
      }
    ]);
    
    setNotifications([
      { 
        id: 1, 
        message: language === 'np' ? 'तपाईंलाई नयाँ गुनासो तोकियो' : 'New complaint assigned to you', 
        time: formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000)), 
        read: false 
      }
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
          id: userData.id || userData._id || prev.id,
          name: userData.name || userData.nameEn || prev.name,
          nameEn: userData.nameEn || userData.name || prev.nameEn,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
          role: userData.role || prev.role
        }));
      } catch (e) {
        console.error('Error parsing staff user data:', e);
      }
      
      // Fetch dashboard data after staff data is updated
      setTimeout(() => {
        fetchDashboardData();
      }, 200);
    }
  }, [navigate]);

  // Update activities when language changes
  useEffect(() => {
    if (recentComplaints.length > 0) {
      const activities = recentComplaints.slice(0, 5).map(complaint => ({
        id: complaint.id,
        action: language === 'np' 
          ? `गुनासो #${complaint.ticketId} ${getStatusText(complaint.status)} मा छ`
          : `Complaint #${complaint.ticketId} is ${getStatusText(complaint.status)}`,
        time: formatRelativeTime(complaint.date),
        status: complaint.status
      }));
      setRecentActivities(activities);
    }
  }, [language]);

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
      justNow: 'अहिले',
      loading: 'लोड हुँदै...',
      error: 'त्रुटि',
      tryAgain: 'पुन: प्रयास गर्नुहोस्',
      category: 'प्रकार',
      channel: 'च्यानल',
      complaintDetails: 'गुनासोको विवरण',
      complaintInfo: 'गुनासो जानकारी',
      complainantInfo: 'उजुरीकर्ताको जानकारी',
      description: 'विवरण',
      statusInfo: 'स्थिति जानकारी',
      close: 'बन्द गर्नुहोस्',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      resolvedDate: 'समाधान मिति',
      address: 'ठेगाना',
      landmark: 'नजिकैको चिन्ह',
      referenceNo: 'सन्दर्भ नम्बर',
      subject: 'विषय',
      complaintType: 'गुनासो प्रकार',
      regular: 'साधारण',
      regarding: 'सम्बन्धी'
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
      justNow: 'Just now',
      loading: 'Loading...',
      error: 'Error',
      tryAgain: 'Try Again',
      category: 'Category',
      channel: 'Channel',
      complaintDetails: 'Complaint Details',
      complaintInfo: 'Complaint Information',
      complainantInfo: 'Complainant Information',
      description: 'Description',
      statusInfo: 'Status Information',
      close: 'Close',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      resolvedDate: 'Resolved Date',
      address: 'Address',
      landmark: 'Landmark',
      referenceNo: 'Reference Number',
      subject: 'Subject',
      complaintType: 'Complaint Type',
      regular: 'Regular',
      regarding: 'Regarding'
    }
  };

  const t = content[language];

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      'in-progress': 'status-progress',
      in_progress: 'status-progress',
      resolved: 'status-resolved',
      review: 'status-review',
      under_review: 'status-review'
    };
    return classes[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    if (language === 'np') {
      const texts = {
        pending: 'विचाराधीन',
        'in-progress': 'प्रगतिमा',
        in_progress: 'प्रगतिमा',
        resolved: 'समाधान',
        review: 'समीक्षामा',
        under_review: 'समीक्षामा'
      };
      return texts[status] || status;
    }
    const texts = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      review: 'Under Review',
      under_review: 'Under Review'
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

  const getFullDescription = (complaint) => {
    return language === 'np' ? complaint.description : complaint.enDescription;
  };

  const getComplaintDate = (complaint) => {
    return language === 'np' ? complaint.date : complaint.enDate;
  };

  const getFullDateTime = (complaint) => {
    return language === 'np' ? complaint.fullDate : complaint.enFullDate;
  };

  const getCategoryText = (complaint) => {
    return language === 'np' ? complaint.category_np : complaint.category_en;
  };

  const getChannel = (complaint) => {
    return language === 'np' ? complaint.channel : complaint.enChannel;
  };

  const getComplaintTypeText = (complaint) => {
    if (language === 'np') {
      return complaint.type === 'regular' ? 'साधारण' : 'सम्बन्धी';
    }
    return complaint.type === 'regular' ? 'Regular' : 'Regarding';
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = getAuthToken();
      const staffId = staffData.id || staffData.email;
      await axios.patch(`${API_URL}/notifications/${notificationId}/read`, 
        { staffId: staffId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Render loading state
  if (loading) {
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
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t.loading}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
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
              <div className="error-container">
                <span className="error-icon">⚠️</span>
                <h3>{t.error}</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchDashboardData}>
                  {t.tryAgain}
                </button>
              </div>
            </div>
          </div>
        </div>
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
                {staffData.department && (
                  <p className="welcome-department">
                    📍 {language === 'np' ? 'विभाग' : 'Department'}: {staffData.department}
                  </p>
                )}
                {staffData.email && (
                  <p className="welcome-email">
                    ✉️ {staffData.email}
                  </p>
                )}
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
                          <span className="type-badge-small">
                            {complaint.type === 'regular' ? '📋' : '📌'}
                          </span>
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
                            <span className="complaint-category">
                              📂 {getCategoryText(complaint)}
                            </span>
                            <span className="complaint-channel">
                              📱 {getChannel(complaint)}
                            </span>
                            <span className="complaint-date">📅 {getComplaintDate(complaint)}</span>
                            <button 
                              className="view-btn"
                              onClick={() => openModal(complaint)}
                            >
                              👁️ {t.viewDetails}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">📭</span>
                      <p>{t.noComplaints}</p>
                      <span className="empty-subtext">
                        {language === 'np' ? 'तपाईंलाई अहिले कुनै गुनासो तोकिएको छैन' : 'No complaints assigned to you yet'}
                      </span>
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

      {/* ============================================ */}
      {/* COMPLAINT DETAILS MODAL / POPUP */}
      {/* ============================================ */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {t.complaintDetails}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* Complaint Information */}
              <div className="detail-section">
                <h4>📌 {t.complaintInfo}</h4>
                <div className="detail-row">
                  <label>{t.complaintId}:</label>
                  <span className="detail-value ticket-id">{selectedComplaint.ticketId}</span>
                </div>
                <div className="detail-row">
                  <label>{t.complaintType}:</label>
                  <span className="type-badge">
                    {getComplaintTypeText(selectedComplaint)}
                  </span>
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
                {selectedComplaint.referenceNumber && (
                  <div className="detail-row">
                    <label>{t.referenceNo}:</label>
                    <span>{selectedComplaint.referenceNumber}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>{t.channel}:</label>
                  <span>{getChannel(selectedComplaint)}</span>
                </div>
              </div>

              {/* Complainant Information */}
              <div className="detail-section">
                <h4>👤 {t.complainantInfo}</h4>
                <div className="detail-row">
                  <label>{t.complainant}:</label>
                  <span className="detail-value">{getComplaintName(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.email}:</label>
                  <span>{selectedComplaint.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>{t.phone}:</label>
                  <span>{selectedComplaint.phone || 'N/A'}</span>
                </div>
                {selectedComplaint.address && (
                  <div className="detail-row">
                    <label>{t.address}:</label>
                    <span>{selectedComplaint.address}</span>
                  </div>
                )}
                {selectedComplaint.landmark && (
                  <div className="detail-row">
                    <label>{t.landmark}:</label>
                    <span>{selectedComplaint.landmark}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="detail-section">
                <h4>📝 {t.description}</h4>
                <div className="detail-row full-width">
                  <p className="description-text">{getFullDescription(selectedComplaint) || 'N/A'}</p>
                </div>
              </div>

              {/* Status Information */}
              <div className="detail-section">
                <h4>📊 {t.statusInfo}</h4>
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
                  <span>{getFullDateTime(selectedComplaint)}</span>
                </div>
                {selectedComplaint.resolvedDate && (
                  <div className="detail-row">
                    <label>{t.resolvedDate}:</label>
                    <span>{language === 'np' ? selectedComplaint.resolvedDate : selectedComplaint.enResolvedDate}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>{t.assignedBy}:</label>
                  <span>{selectedComplaint.assignedByName || selectedComplaint.assignedBy || 'Admin'}</span>
                </div>
                <div className="detail-row">
                  <label>{t.assigned}:</label>
                  <span>{selectedComplaint.assignedTo || staffData.email}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeModal}>
                ✕ {t.close}
              </button>
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

        .welcome-department {
          color: #64748b;
          font-size: 0.85rem;
          margin-top: 4px;
        }

        .welcome-email {
          color: #64748b;
          font-size: 0.8rem;
          margin-top: 2px;
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
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .complaint-id {
          font-family: monospace;
          font-weight: 600;
          color: #0288d1;
          font-size: 0.85rem;
        }

        .type-badge-small {
          font-size: 0.8rem;
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
          gap: 10px;
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

        .complaint-category {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .complaint-channel {
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
          display: inline-flex;
          align-items: center;
          gap: 4px;
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

        .empty-subtext {
          font-size: 0.8rem;
          color: #cbd5e1;
          display: block;
          margin-top: 4px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0288d1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .error-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

        .error-container h3 {
          color: #dc2626;
          margin-bottom: 8px;
        }

        .error-container p {
          color: #64748b;
          margin-bottom: 20px;
        }

        .retry-btn {
          background: #0288d1;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .retry-btn:hover {
          background: #0277bd;
          transform: translateY(-2px);
        }

        /* ============================================ */
        /* MODAL / POPUP STYLES */
        /* ============================================ */
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
          z-index: 2000;
          backdrop-filter: blur(4px);
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal-content::-webkit-scrollbar {
          width: 6px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #0288d1;
          border-radius: 10px;
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
          border-radius: 20px 20px 0 0;
        }

        .modal-header h2 {
          font-size: 1.3rem;
          color: #0f172a;
          font-weight: 600;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          color: #475569;
          background: #f1f5f9;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          margin-bottom: 10px;
          padding: 4px 0;
          flex-wrap: wrap;
          gap: 4px;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-row label {
          width: 140px;
          font-weight: 600;
          color: #0f172a;
          flex-shrink: 0;
          font-size: 0.85rem;
        }

        .detail-row .detail-value {
          flex: 1;
          color: #334155;
          min-width: 0;
          word-break: break-word;
        }

        .detail-row .detail-value.ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #0288d1;
        }

        .detail-row span {
          flex: 1;
          color: #334155;
          min-width: 0;
          word-break: break-word;
          font-size: 0.85rem;
        }

        .detail-row.full-width {
          flex-direction: column;
        }

        .detail-row.full-width label {
          width: 100%;
          margin-bottom: 8px;
        }

        .description-text {
          line-height: 1.8;
          white-space: pre-wrap;
          color: #334155;
          font-size: 0.9rem;
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .type-badge {
          display: inline-block;
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .type-badge.regular { background: #dbeafe; color: #1e40af; }
        .type-badge.regarding { background: #fef3c7; color: #92400e; }

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
        }

        .btn-close {
          background: #e2e8f0;
          color: #475569;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #cbd5e1;
        }

        /* ============================================ */
        /* RESPONSIVE */
        /* ============================================ */
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

          .modal-content {
            max-width: 95%;
            margin: 10px;
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

          .modal-footer button {
            width: 100%;
            justify-content: center;
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

          .modal-header h2 {
            font-size: 1.1rem;
          }

          .modal-body {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;