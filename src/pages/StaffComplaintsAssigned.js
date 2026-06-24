// src/pages/StaffComplaintsAssigned.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffComplaintsAssigned = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Update current date/time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  // Get current date in Nepali format
  const getCurrentNepaliDate = () => {
    const now = new Date();
    const year = now.getFullYear() - 57;
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const yearNp = year.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    const monthNp = month.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    const dayNp = day.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    return `${yearNp}-${monthNp}-${dayNp}`;
  };

  // Get current date in English format
  const getCurrentEnglishDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Get Nepali month names
  const getNepaliMonths = () => {
    return ['बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
  };

  // Get Nepali day names
  const getNepaliDays = () => {
    return ['आइतवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'बिहिवार', 'शुक्रवार', 'शनिवार'];
  };

  // Get full current date display
  const getFullDateDisplay = () => {
    const now = new Date();
    if (language === 'np') {
      const nepaliMonths = getNepaliMonths();
      const nepaliDays = getNepaliDays();
      const year = now.getFullYear() - 57;
      const month = now.getMonth();
      const day = now.getDate();
      const dayOfWeek = now.getDay();
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      const yearNp = year.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      const dayNp = day.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      return `${nepaliDays[dayOfWeek]}, ${nepaliMonths[month]} ${dayNp}, ${yearNp}`;
    } else {
      return now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Get current time display
  const getTimeDisplay = () => {
    const now = new Date();
    if (language === 'np') {
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'बजे' : 'बजे';
      hours = hours % 12 || 12;
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      const hoursNp = hours.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      const minutesNp = minutes.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      return `${hoursNp}:${minutesNp} ${ampm}`;
    } else {
      return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

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
          department: user.department || 'Customer Support'
        };
      } catch (e) {
        return {
          id: null,
          name: 'Staff User',
          nameEn: 'Staff User',
          role: 'staff',
          email: '',
          phone: '',
          department: 'Customer Support'
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
      department: 'Customer Support'
    };
  });

  const [complaints, setComplaints] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

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

  // Format date to Nepali format with Nepali digits
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

  // Fetch assigned complaints from backend - CONNECTED PROPERLY
  const fetchAssignedComplaints = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        setBackendStatus('disconnected');
        setComplaints(getSampleAssignedComplaints());
        setLoading(false);
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      let regularData = [];
      let regardingData = [];
      
      // Fetch regular complaints assigned to this staff
      try {
        // First try the specific assigned-to-me endpoint
        const regularResponse = await axios.get(`${API_URL}/complaints/assigned-to-me`, { headers });
        if (regularResponse.data.success && Array.isArray(regularResponse.data.data)) {
          regularData = regularResponse.data.data.map(complaint => ({
            ...transformComplaintData(complaint),
            type: 'regular',
            complaintType: 'regular'
          }));
          console.log(`✅ Loaded ${regularData.length} regular complaints from /complaints/assigned-to-me`);
        }
      } catch (err) {
        console.log('Error fetching from /complaints/assigned-to-me:', err.message);
        
        // Try alternative: fetch all complaints and filter by assigned_to
        try {
          const allComplaintsResponse = await axios.get(`${API_URL}/complaints`, { headers });
          if (allComplaintsResponse.data.success && Array.isArray(allComplaintsResponse.data.data)) {
            const allComplaints = allComplaintsResponse.data.data;
            // Filter complaints assigned to this staff
            const filtered = allComplaints.filter(c => 
              c.assigned_to === staffData.email || 
              c.assigned_to === staffData.name || 
              c.assigned_to === String(staffData.id) ||
              c.assigned_to === staffData.id
            );
            regularData = filtered.map(complaint => ({
              ...transformComplaintData(complaint),
              type: 'regular',
              complaintType: 'regular'
            }));
            console.log(`✅ Loaded ${regularData.length} regular complaints from /complaints (filtered)`);
          }
        } catch (err2) {
          console.log('Error fetching from /complaints:', err2.message);
        }
      }
      
      // Fetch regarding complaints assigned to this staff
      try {
        const regardingResponse = await axios.get(`${API_URL}/complaint-regarding/assigned-to-me`, { headers });
        if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
          regardingData = regardingResponse.data.data.map(complaint => ({
            ...transformComplaintData(complaint),
            type: 'regarding',
            complaintType: 'regarding'
          }));
          console.log(`✅ Loaded ${regardingData.length} regarding complaints from /complaint-regarding/assigned-to-me`);
        }
      } catch (err) {
        console.log('Error fetching from /complaint-regarding/assigned-to-me:', err.message);
        
        // Try alternative: fetch all regarding complaints and filter by assigned_to
        try {
          const allRegardingResponse = await axios.get(`${API_URL}/complaint-regarding`, { headers });
          if (allRegardingResponse.data.success && Array.isArray(allRegardingResponse.data.data)) {
            const allRegarding = allRegardingResponse.data.data;
            const filtered = allRegarding.filter(c => 
              c.assigned_to === staffData.email || 
              c.assigned_to === staffData.name || 
              c.assigned_to === String(staffData.id) ||
              c.assigned_to === staffData.id
            );
            regardingData = filtered.map(complaint => ({
              ...transformComplaintData(complaint),
              type: 'regarding',
              complaintType: 'regarding'
            }));
            console.log(`✅ Loaded ${regardingData.length} regarding complaints from /complaint-regarding (filtered)`);
          }
        } catch (err2) {
          console.log('Error fetching from /complaint-regarding:', err2.message);
        }
      }
      
      // Combine all complaints
      const allComplaints = [...regularData, ...regardingData];
      
      if (allComplaints.length > 0) {
        allComplaints.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
        setComplaints(allComplaints);
        setBackendStatus('connected');
        console.log(`✅ Total assigned complaints: ${allComplaints.length}`);
        showToast(
          language === 'np' 
            ? `${allComplaints.length} गुनासोहरू लोड गरियो` 
            : `${allComplaints.length} complaints loaded`,
          'success'
        );
      } else {
        console.log('No complaints found in backend, using sample data');
        setComplaints(getSampleAssignedComplaints());
        setBackendStatus('disconnected');
        showToast(
          language === 'np' 
            ? 'ब्याकेन्डमा कुनै गुनासो फेला परेन। नमूना डाटा देखाउँदै।' 
            : 'No complaints found in backend. Showing sample data.',
          'info'
        );
      }
      
    } catch (error) {
      console.error('Error fetching assigned complaints:', error);
      setComplaints(getSampleAssignedComplaints());
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

  // Transform complaint data
  const transformComplaintData = (complaint) => ({
    id: complaint.id,
    complaintId: complaint.id,
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
    channel: complaint.channel || complaint.preferred_contact === 'phone' ? 'फोन' : 
             complaint.preferred_contact === 'email' ? 'इमेल' : 
             complaint.channel || 'वेबसाइट पोर्टल',
    enChannel: complaint.channel || complaint.preferred_contact === 'phone' ? 'Phone' : 
                complaint.preferred_contact === 'email' ? 'Email' : 
                complaint.channel || 'Website Portal',
    priority: mapPriority(complaint.priority),
    assignedTo: complaint.assigned_to || complaint.assignedTo || complaint.assignedToName || staffData.name,
    enAssignedTo: complaint.assigned_to || complaint.assignedTo || complaint.assignedToName || staffData.role,
    assignedBy: complaint.assigned_by || complaint.assignedBy || 'Admin',
    assignedByName: complaint.assigned_by_name || complaint.assignedByName || 'Admin',
    resolvedDate: complaint.resolved_at ? formatNepaliDate(complaint.resolved_at) : null,
    enResolvedDate: complaint.resolved_at ? formatEnglishDate(complaint.resolved_at) : null,
    submittedDate: complaint.created_at || complaint.submittedDate || complaint.createdAt || new Date().toISOString(),
    referenceNumber: complaint.reference_number || complaint.referenceNo || null,
    landmark: complaint.landmark || null,
    address: complaint.address || complaint.street_address || complaint.location || null,
    preferredContact: complaint.preferred_contact || null,
    resolution: complaint.resolution || null,
    actionTaken: complaint.action_taken || complaint.actionTaken || null
  });

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
      'rejected': 'rejected',
      'open': 'pending',
      'Open': 'pending'
    };
    return statusMap[status] || 'pending';
  };

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
      'Low': 'low',
      'critical': 'high',
      'Critical': 'high'
    };
    return priorityMap[priority] || 'medium';
  };

  // Get sample assigned complaints with Nepali dates
  const getSampleAssignedComplaints = () => {
    const now = new Date();
    const date1 = formatNepaliDate(new Date(now.getTime() - 5 * 86400000));
    const date2 = formatNepaliDate(new Date(now.getTime() - 3 * 86400000));
    const date3 = formatNepaliDate(new Date(now.getTime() - 1 * 86400000));
    const enDate1 = formatEnglishDate(new Date(now.getTime() - 5 * 86400000));
    const enDate2 = formatEnglishDate(new Date(now.getTime() - 3 * 86400000));
    const enDate3 = formatEnglishDate(new Date(now.getTime() - 1 * 86400000));

    return [
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
        description: 'फाइबर जडान २ दिनदेखि बन्द छ। इन्टरनेट सेवा नभएकोले धेरै समस्या भएको छ।',
        enDescription: 'Fiber connection has been down for 2 days.',
        status: 'in-progress',
        date: date1,
        enDate: enDate1,
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'high',
        assignedTo: staffData.name,
        enAssignedTo: staffData.role,
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        resolvedDate: null,
        submittedDate: new Date(now.getTime() - 5 * 86400000).toISOString(),
        address: 'Kapan, Kathmandu',
        landmark: 'Near Ganesh Temple',
        type: 'regular',
        resolution: null,
        actionTaken: null
      },
      { 
        id: 2, 
        ticketId: 'CR-2024-001', 
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
        date: date2,
        enDate: enDate2,
        channel: 'इमेल',
        enChannel: 'Email',
        priority: 'medium',
        assignedTo: staffData.name,
        enAssignedTo: staffData.role,
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        resolvedDate: null,
        submittedDate: new Date(now.getTime() - 3 * 86400000).toISOString(),
        address: 'Baneshwor, Kathmandu',
        referenceNumber: 'REF-20240210-001',
        type: 'regarding',
        resolution: null,
        actionTaken: null
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
        date: date3,
        enDate: enDate3,
        channel: 'फोन',
        enChannel: 'Phone',
        priority: 'high',
        assignedTo: staffData.name,
        enAssignedTo: staffData.role,
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        resolvedDate: null,
        submittedDate: new Date(now.getTime() - 1 * 86400000).toISOString(),
        type: 'regular',
        resolution: null,
        actionTaken: null
      }
    ];
  };

  // Handle view complaint details
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  // Handle solve/update complaint
  const handleSolveComplaint = (complaint) => {
    navigate(`/staff/complaints/solve/${complaint.id}`, { 
      state: { 
        complaint: complaint,
        complaintType: complaint.type || 'regular'
      } 
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  // Check authentication and fetch data
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/login');
    } else {
      fetchAssignedComplaints();
    }
  }, [navigate]);

  const content = {
    np: {
      pageTitle: 'मलाई तोकिएको गुनासोहरू',
      assignedComplaints: 'तोकिएका गुनासोहरू',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      subject: 'विषय',
      assignedDate: 'तोकिएको मिति',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      solveComplaint: 'गुनासो समाधान गर्नुहोस्',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      channel: 'च्यानल',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      resolvedDate: 'समाधान मिति',
      assignedTo: 'तोकिएको व्यक्ति',
      assignedBy: 'तोक्ने व्यक्ति',
      address: 'ठेगाना',
      landmark: 'सन्दर्भ स्थल',
      resolution: 'समाधान विवरण',
      actionTaken: 'गरिएको कार्य',
      referenceNo: 'सन्दर्भ नम्बर',
      preferredContact: 'प्राथमिकता सम्पर्क',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      underReview: 'समीक्षामा',
      rejected: 'अस्वीकृत',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noComplaintsFound: 'कुनै तोकिएको गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalAssigned: 'कुल तोकिएको',
      pendingCount: 'विचाराधीन',
      inProgressCount: 'प्रगतिमा',
      resolvedCount: 'समाधान',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      assignedToMe: 'मलाई तोकिएको',
      complaintInfo: 'गुनासो जानकारी',
      complainantInfo: 'उजुरीकर्ताको जानकारी',
      statusInfo: 'स्थिति जानकारी',
      addressInfo: 'ठेगाना जानकारी',
      dateInfo: 'मिति जानकारी',
      currentDate: 'आजको मिति',
      currentTime: 'हालको समय',
      loading: 'लोड हुँदै...',
      connectionError: 'सर्भर जडान भएन। नमूना डाटा देखाउँदै।',
      noBackendData: 'ब्याकेन्डबाट कुनै डाटा आएन। नमूना डाटा देखाउँदै।'
    },
    en: {
      pageTitle: 'Complaints Assigned to Me',
      assignedComplaints: 'Assigned Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      subject: 'Subject',
      assignedDate: 'Assigned Date',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
      solveComplaint: 'Solve Complaint',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      channel: 'Channel',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      resolvedDate: 'Resolved Date',
      assignedTo: 'Assigned To',
      assignedBy: 'Assigned By',
      address: 'Address',
      landmark: 'Landmark',
      resolution: 'Resolution',
      actionTaken: 'Action Taken',
      referenceNo: 'Reference Number',
      preferredContact: 'Preferred Contact',
      close: 'Close',
      all: 'All',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      underReview: 'Under Review',
      rejected: 'Rejected',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noComplaintsFound: 'No assigned complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalAssigned: 'Total Assigned',
      pendingCount: 'Pending',
      inProgressCount: 'In Progress',
      resolvedCount: 'Resolved',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      assignedToMe: 'Assigned to Me',
      complaintInfo: 'Complaint Information',
      complainantInfo: 'Complainant Information',
      statusInfo: 'Status Information',
      addressInfo: 'Address Information',
      dateInfo: 'Date Information',
      currentDate: 'Today\'s Date',
      currentTime: 'Current Time',
      loading: 'Loading...',
      connectionError: 'Server connection failed. Showing sample data.',
      noBackendData: 'No data from backend. Showing sample data.'
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
      const statusTexts = {
        pending: 'विचाराधीन',
        'in-progress': 'प्रगतिमा',
        resolved: 'समाधान',
        review: 'समीक्षामा',
        rejected: 'अस्वीकृत'
      };
      return statusTexts[status] || status;
    } else {
      const statusTexts = {
        pending: 'Pending',
        'in-progress': 'In Progress',
        resolved: 'Resolved',
        review: 'Under Review',
        rejected: 'Rejected'
      };
      return statusTexts[status] || status;
    }
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
      const priorityTexts = {
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'न्यून'
      };
      return priorityTexts[priority] || priority;
    } else {
      const priorityTexts = {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
      };
      return priorityTexts[priority] || priority;
    }
  };

  const getCategoryText = (complaint) => {
    return language === 'np' ? complaint.category_np : complaint.category_en;
  };

  const getDate = (complaint) => {
    return language === 'np' ? complaint.date : complaint.enDate;
  };

  const getChannel = (complaint) => {
    return language === 'np' ? complaint.channel : complaint.enChannel;
  };

  const getAssignedTo = (complaint) => {
    return language === 'np' ? complaint.assignedTo : complaint.enAssignedTo;
  };

  const getComplainantName = (complaint) => {
    return language === 'np' ? complaint.name : complaint.enName;
  };

  const getDescription = (complaint) => {
    return language === 'np' ? complaint.description : complaint.enDescription;
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      complaint.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.phone?.includes(searchTerm) ||
      complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    
    return searchMatch && statusMatch && priorityMatch;
  });

  // Calculate statistics
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    review: complaints.filter(c => c.status === 'review').length
  };

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const refreshData = () => {
    fetchAssignedComplaints();
    showToast(
      language === 'np' ? 'डाटा रिफ्रेस गरियो' : 'Data refreshed', 
      'info'
    );
  };

  return (
    <div className="staff-complaints-assigned">
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
        onLogout={handleLogout}
      />
      
      <div className="dashboard-layout">
        <StaffSidebar 
          language={language}
          staffName={staffData.name}
          staffRole={staffData.role}
          staffEmail={staffData.email}
          onLogout={handleLogout}
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
                    <h1 className="welcome-title">{t.assignedToMe}</h1>
                    <p className="welcome-subtitle">{t.assignedComplaints}</p>
                    <div className="date-time-display">
                      <span className="date-display">📅 {t.currentDate}: {getFullDateDisplay()}</span>
                      <span className="time-display">🕐 {t.currentTime}: {getTimeDisplay()}</span>
                    </div>
                  </div>
                  <button className="refresh-btn" onClick={refreshData}>
                    🔄 {t.refresh}
                  </button>
                </div>

                {/* Statistics Cards */}
                <div className="stats-row">
                  <div className="stat-box">
                    <div className="stat-box-icon blue">📋</div>
                    <div className="stat-box-info">
                      <div className="stat-box-value">{formatNumber(stats.total)}</div>
                      <div className="stat-box-label">{t.totalAssigned}</div>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-icon orange">⏳</div>
                    <div className="stat-box-info">
                      <div className="stat-box-value">{formatNumber(stats.pending)}</div>
                      <div className="stat-box-label">{t.pendingCount}</div>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-icon yellow">🔄</div>
                    <div className="stat-box-info">
                      <div className="stat-box-value">{formatNumber(stats.inProgress)}</div>
                      <div className="stat-box-label">{t.inProgressCount}</div>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-icon green">✅</div>
                    <div className="stat-box-info">
                      <div className="stat-box-value">{formatNumber(stats.resolved)}</div>
                      <div className="stat-box-label">{t.resolvedCount}</div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                    )}
                  </div>
                  <div className="filter-group">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">{t.all}</option>
                      <option value="pending">{t.pending}</option>
                      <option value="in-progress">{t.inProgress}</option>
                      <option value="review">{t.underReview}</option>
                      <option value="resolved">{t.resolved}</option>
                      <option value="rejected">{t.rejected}</option>
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">{t.all}</option>
                      <option value="high">{t.high}</option>
                      <option value="medium">{t.medium}</option>
                      <option value="low">{t.low}</option>
                    </select>
                  </div>
                </div>

                {/* Complaints Table */}
                <div className="table-wrapper">
                  <table className="complaints-table">
                    <thead>
                      <tr>
                        <th>{t.ticketId}</th>
                        <th>{t.complainant}</th>
                        <th>{t.category}</th>
                        <th>{t.subject}</th>
                        <th>{t.assignedDate}</th>
                        <th>{t.status}</th>
                        <th>{t.priority}</th>
                        <th>{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedComplaints.length > 0 ? (
                        paginatedComplaints.map((complaint) => (
                          <tr key={complaint.id}>
                            <td className="ticket-id">{complaint.ticketId}</td>
                            <td>{getComplainantName(complaint)}</td>
                            <td>{getCategoryText(complaint)}</td>
                            <td>{complaint.subject || '-'}</td>
                            <td>{getDate(complaint)}</td>
                            <td>
                              <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                                {getStatusText(complaint.status)}
                              </span>
                            </td>
                            <td>
                              <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                                {getPriorityText(complaint.priority)}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="view-btn" 
                                  onClick={() => handleViewDetails(complaint)}
                                  title={t.viewDetails}
                                >
                                  👁️ {t.viewDetails}
                                </button>
                                <button 
                                  className="solve-btn" 
                                  onClick={() => handleSolveComplaint(complaint)}
                                  title={t.solveComplaint}
                                >
                                  🔧 {t.solveComplaint}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="no-data">
                          <td colSpan="8">
                            <div className="no-data-content">
                              <span className="no-data-icon">📭</span>
                              <p>{t.noComplaintsFound}</p>
                              <small>{t.tryAdjustingFilters}</small>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                <h4>📌 {t.complaintInfo}</h4>
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
                {selectedComplaint.referenceNumber && (
                  <div className="detail-row">
                    <label>{t.referenceNo}:</label>
                    <span>{selectedComplaint.referenceNumber}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>👤 {t.complainantInfo}</h4>
                <div className="detail-row">
                  <label>{t.complainant}:</label>
                  <span>{getComplainantName(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.email}:</label>
                  <span>{selectedComplaint.email}</span>
                </div>
                <div className="detail-row">
                  <label>{t.phone}:</label>
                  <span>{selectedComplaint.phone}</span>
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

              <div className="detail-section">
                <h4>📝 {t.description}</h4>
                <div className="detail-row full-width">
                  <p>{getDescription(selectedComplaint)}</p>
                </div>
              </div>

              <div className="detail-section">
                <h4>📊 {t.statusInfo}</h4>
                <div className="detail-row">
                  <label>{t.priority}:</label>
                  <span className={`priority-badge ${getPriorityClass(selectedComplaint.priority)}`}>
                    {getPriorityText(selectedComplaint.priority)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.status}:</label>
                  <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>
                    {getStatusText(selectedComplaint.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.registeredDate}:</label>
                  <span>{getDate(selectedComplaint)}</span>
                </div>
                {selectedComplaint.resolvedDate && (
                  <div className="detail-row">
                    <label>{t.resolvedDate}:</label>
                    <span>{selectedComplaint.resolvedDate}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>{t.channel}:</label>
                  <span>{getChannel(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.assignedTo}:</label>
                  <span>{getAssignedTo(selectedComplaint)}</span>
                </div>
                {selectedComplaint.assignedByName && (
                  <div className="detail-row">
                    <label>{t.assignedBy}:</label>
                    <span>{selectedComplaint.assignedByName}</span>
                  </div>
                )}
                {selectedComplaint.preferredContact && (
                  <div className="detail-row">
                    <label>{t.preferredContact}:</label>
                    <span>{selectedComplaint.preferredContact}</span>
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
              <button className="btn-solve" onClick={() => {
                closeModal();
                handleSolveComplaint(selectedComplaint);
              }}>
                🔧 {t.solveComplaint}
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

        .staff-complaints-assigned {
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
          margin-bottom: 24px;
          padding: 20px 24px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 16px;
        }

        .welcome-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .welcome-subtitle {
          color: #64748b;
          font-size: 0.85rem;
        }

        .date-time-display {
          display: flex;
          gap: 20px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .date-display, .time-display {
          font-size: 0.8rem;
          color: #475569;
          background: #f8fafc;
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #0288d1;
          color: #0288d1;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
        }

        .stat-box-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .stat-box-icon.blue { background: #e3f2fd; color: #1565c0; }
        .stat-box-icon.orange { background: #fff3e0; color: #f57c00; }
        .stat-box-icon.yellow { background: #fff8e1; color: #f9a825; }
        .stat-box-icon.green { background: #e8f5e9; color: #2e7d32; }

        .stat-box-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-box-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
        }

        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          position: relative;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
          color: #9ca3af;
        }

        .search-box input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #0288d1;
        }

        .clear-search {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: #9ca3af;
        }

        .filter-group {
          display: flex;
          gap: 12px;
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

        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .complaints-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .complaints-table th,
        .complaints-table td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .complaints-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .complaints-table td {
          color: #334155;
          font-size: 0.85rem;
        }

        .complaints-table tr:hover {
          background: #fafcff;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #0288d1;
        }

        .status-badge, .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .status-review { background: #e0e7ff; color: #4f46e5; }
        .status-rejected { background: #fee2e2; color: #dc2626; }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .view-btn, .solve-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: none;
          font-weight: 500;
        }

        .view-btn {
          background: #f1f5f9;
          color: #475569;
        }

        .view-btn:hover {
          background: #e2e8f0;
        }

        .solve-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .solve-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .no-data {
          text-align: center;
          padding: 40px !important;
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
          max-width: 650px;
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
          margin-bottom: 24px;
        }

        .detail-section h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e2e8f0;
        }

        .detail-row {
          display: flex;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 4px;
        }

        .detail-row label {
          width: 130px;
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
          flex-wrap: wrap;
        }

        .btn-solve, .btn-close {
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
        }

        .btn-solve {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .btn-solve:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-close {
          background: #f1f5f9;
          color: #475569;
        }

        .btn-close:hover {
          background: #e2e8f0;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1200px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .staff-complaints-assigned {
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
          
          .stats-row {
            grid-template-columns: 1fr;
          }
          
          .filters-bar {
            flex-direction: column;
          }
          
          .filter-group {
            width: 100%;
            flex-direction: column;
          }
          
          .filter-select {
            width: 100%;
          }
          
          .action-buttons {
            width: 100%;
            flex-direction: column;
          }
          
          .view-btn, .solve-btn {
            width: 100%;
            justify-content: center;
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
          
          .btn-solve, .btn-close {
            width: 100%;
          }
          
          .toast-notification {
            top: auto;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
          }
          
          .date-time-display {
            flex-direction: column;
            gap: 4px;
          }
          
          .loading-container {
            min-height: 200px;
          }
        }

        @media (max-width: 480px) {
          .stat-box {
            padding: 16px;
          }
          
          .stat-box-icon {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }
          
          .stat-box-value {
            font-size: 1.2rem;
          }
          
          .complaints-table th,
          .complaints-table td {
            padding: 8px;
            font-size: 0.7rem;
          }
          
          .welcome-section {
            padding: 16px;
          }
          
          .welcome-title {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffComplaintsAssigned;