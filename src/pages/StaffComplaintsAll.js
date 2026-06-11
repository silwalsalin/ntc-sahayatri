// src/pages/StaffComplaintsAll.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffComplaintsAll = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

  const [complaints, setComplaints] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    review: 0,
    high: 0,
    medium: 0,
    low: 0
  });

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

  // Fetch all complaints
  const fetchAllComplaints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/complaints/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const transformedComplaints = response.data.data.map(complaint => transformComplaintData(complaint));
        setComplaints(transformedComplaints);
        calculateStats(transformedComplaints);
        setBackendStatus('connected');
      } else {
        setComplaints(getSampleAllComplaints());
        calculateStats(getSampleAllComplaints());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching all complaints:', error);
      setComplaints(getSampleAllComplaints());
      calculateStats(getSampleAllComplaints());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (complaintsData) => {
    const newStats = {
      total: complaintsData.length,
      pending: complaintsData.filter(c => c.status === 'pending').length,
      inProgress: complaintsData.filter(c => c.status === 'in-progress').length,
      resolved: complaintsData.filter(c => c.status === 'resolved').length,
      review: complaintsData.filter(c => c.status === 'review').length,
      high: complaintsData.filter(c => c.priority === 'high').length,
      medium: complaintsData.filter(c => c.priority === 'medium').length,
      low: complaintsData.filter(c => c.priority === 'low').length
    };
    setStats(newStats);
  };

  // Transform complaint data
  const transformComplaintData = (complaint) => ({
    id: complaint.id,
    ticketId: complaint.complaintNumber || `NTC-${complaint.id}`,
    name: complaint.name || 'N/A',
    enName: complaint.nameEn || complaint.name || 'N/A',
    email: complaint.email || 'N/A',
    phone: complaint.phone || 'N/A',
    category: complaint.category || 'general',
    category_np: complaint.categoryNp || getCategoryNepali(complaint.category),
    category_en: complaint.category || 'General',
    subCategory: complaint.subject || 'general',
    description: complaint.complaint || complaint.description || 'N/A',
    enDescription: complaint.complaintEn || complaint.complaint || complaint.description || 'N/A',
    status: mapStatus(complaint.status),
    date: complaint.date || formatNepaliDate(complaint.submittedDate),
    enDate: complaint.enDate || formatEnglishDate(complaint.submittedDate),
    channel: complaint.channel || 'वेबसाइट पोर्टल',
    enChannel: complaint.enChannel || 'Website Portal',
    priority: mapPriority(complaint.priority),
    assignedTo: complaint.assignedTo || 'Not Assigned',
    enAssignedTo: complaint.enAssignedTo || 'Not Assigned',
    resolvedDate: complaint.resolvedDate ? formatNepaliDate(complaint.resolvedDate) : null,
    enResolvedDate: complaint.resolvedDate ? formatEnglishDate(complaint.resolvedDate) : null,
    submittedDate: complaint.submittedDate,
    referenceNumber: complaint.referenceNumber,
    landmark: complaint.landmark,
    address: complaint.address,
    preferredContact: complaint.preferredContact,
    assignedBy: complaint.assignedBy || 'System',
    resolution: complaint.resolution || null,
    actionTaken: complaint.actionTaken || null
  });

  const getCategoryNepali = (category) => {
    const categories = {
      'internet': 'इन्टरनेट',
      'recharge': 'रिचार्ज',
      'activation': 'सक्रियता',
      'billing': 'बिलिङ',
      'network': 'नेटवर्क',
      'signal': 'सिग्नल',
      'general': 'सामान्य'
    };
    return categories[category] || 'सामान्य';
  };

  const mapStatus = (status) => {
    if (!status) return 'pending';
    const statusMap = {
      'Pending': 'pending',
      'pending': 'pending',
      'In Progress': 'in-progress',
      'in-progress': 'in-progress',
      'Resolved': 'resolved',
      'resolved': 'resolved',
      'Closed': 'resolved',
      'closed': 'resolved',
      'Under Review': 'review',
      'review': 'review'
    };
    return statusMap[status] || 'pending';
  };

  const mapPriority = (priority) => {
    if (!priority) return 'medium';
    const priorityMap = {
      'High': 'high',
      'high': 'high',
      'Urgent': 'high',
      'Medium': 'medium',
      'medium': 'medium',
      'Low': 'low',
      'low': 'low'
    };
    return priorityMap[priority] || 'medium';
  };

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

  // Get sample all complaints with more variety
  const getSampleAllComplaints = () => {
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
        subCategory: 'connection',
        description: 'फाइबर जडान २ दिनदेखि बन्द छ। इन्टरनेट सेवा नभएकोले धेरै समस्या भएको छ। कृपया तुरुन्त समाधान गरिदिनुहोस्।',
        enDescription: 'Fiber connection has been down for 2 days. Please resolve urgently.',
        status: 'in-progress',
        date: '२०८०-०१-१५',
        enDate: '2024-01-15',
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'high',
        assignedTo: 'Technical Team',
        enAssignedTo: 'Technical Team',
        resolvedDate: null,
        assignedBy: 'Admin',
        address: 'बानेश्वर, काठमाडौं',
        landmark: 'बानेश्वर चोक नजिक'
      },
      { 
        id: 2, 
        ticketId: 'NTC-2024-002', 
        name: 'सीता शर्मा', 
        enName: 'Sita Sharma',
        email: 'sita@example.com',
        phone: '9812345678',
        category: 'recharge',
        category_np: 'रिचार्ज',
        category_en: 'Recharge',
        subCategory: 'not-credited',
        description: 'रु. ५०० रिचार्ज गरे पनि ब्यालेन्स अपडेट भएन। कृपया जाँच गरिदिनुहोस्।',
        enDescription: 'Recharged Rs. 500 but balance not updated. Please check.',
        status: 'resolved',
        date: '२०८०-०१-२०',
        enDate: '2024-01-20',
        channel: 'व्हाट्सएप',
        enChannel: 'WhatsApp',
        priority: 'medium',
        assignedTo: 'Billing Team',
        enAssignedTo: 'Billing Team',
        resolvedDate: '२०८०-०१-२२',
        enResolvedDate: '2024-01-22',
        assignedBy: 'Admin',
        resolution: 'ब्यालेन्स अपडेट गरियो। रु. ५०० क्रेडिट भयो।',
        actionTaken: 'रिचार्ज म्यानुअली प्रोसेस गरियो'
      },
      { 
        id: 3, 
        ticketId: 'NTC-2024-003', 
        name: 'हरि प्रसाद', 
        enName: 'Hari Prasad',
        email: 'hari@example.com',
        phone: '9812345679',
        category: 'activation',
        category_np: 'सक्रियता',
        category_en: 'Activation',
        subCategory: 'sim-activation',
        description: 'नयाँ सिम खरिद गरेको २४ घण्टा भयो तर सक्रिय भएको छैन।',
        enDescription: 'Purchased new SIM 24 hours ago but not activated yet.',
        status: 'pending',
        date: '२०८०-०२-०१',
        enDate: '2024-02-01',
        channel: 'फोन',
        enChannel: 'Phone',
        priority: 'high',
        assignedTo: 'Customer Service',
        enAssignedTo: 'Customer Service',
        resolvedDate: null,
        assignedBy: 'Admin',
        address: 'कपन, काठमाडौं'
      },
      { 
        id: 4, 
        ticketId: 'NTC-2024-004', 
        name: 'विनोद न्यौपाने', 
        enName: 'Binod Neupane',
        email: 'binod@example.com',
        phone: '9812345680',
        category: 'billing',
        category_np: 'बिलिङ',
        category_en: 'Billing',
        subCategory: 'wrong-charge',
        description: 'गत महिनाको बिलमा गलत चार्ज देखाइएको छ। रु. १५०० अतिरिक्त चार्ज भएको छ।',
        enDescription: 'Wrong charge shown in last month\'s bill. Extra Rs. 1500 charged.',
        status: 'review',
        date: '२०८०-०२-१०',
        enDate: '2024-02-10',
        channel: 'इमेल',
        enChannel: 'Email',
        priority: 'medium',
        assignedTo: 'Billing Team',
        enAssignedTo: 'Billing Team',
        resolvedDate: null,
        assignedBy: 'Admin'
      },
      { 
        id: 5, 
        ticketId: 'NTC-2024-005', 
        name: 'प्रकाश अधिकारी', 
        enName: 'Prakash Adhikari',
        email: 'prakash@example.com',
        phone: '9812345690',
        category: 'internet',
        category_np: 'इन्टरनेट',
        category_en: 'Internet',
        subCategory: 'slow-speed',
        description: 'इन्टरनेट गति धेरै ढिलो छ। 100 Mbps को प्याकेज लिएको तर 10-15 Mbps मात्र आइरहेको छ।',
        enDescription: 'Internet speed is very slow. Getting only 10-15 Mbps on 100 Mbps package.',
        status: 'in-progress',
        date: '२०८०-०२-१५',
        enDate: '2024-02-15',
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'high',
        assignedTo: 'Technical Team',
        enAssignedTo: 'Technical Team',
        resolvedDate: null,
        assignedBy: 'Admin'
      },
      { 
        id: 6, 
        ticketId: 'NTC-2024-006', 
        name: 'माया थापा', 
        enName: 'Maya Thapa',
        email: 'maya@example.com',
        phone: '9812345691',
        category: 'network',
        category_np: 'नेटवर्क',
        category_en: 'Network',
        subCategory: 'no-signal',
        description: 'घरमा पूरै सिग्नल छैन। पछिल्लो ५ दिन देखि समस्या छ।',
        enDescription: 'No signal at home. Problem for last 5 days.',
        status: 'pending',
        date: '२०८०-०२-२०',
        enDate: '2024-02-20',
        channel: 'फोन',
        enChannel: 'Phone',
        priority: 'urgent',
        assignedTo: 'Network Team',
        enAssignedTo: 'Network Team',
        resolvedDate: null,
        assignedBy: 'Admin',
        address: 'ललितपुर, खुमलटार',
        landmark: 'जावलाखेल नजिक'
      },
      { 
        id: 7, 
        ticketId: 'NTC-2024-007', 
        name: 'सुशील गिरी', 
        enName: 'Sushil Giri',
        email: 'sushil@example.com',
        phone: '9812345692',
        category: 'billing',
        category_np: 'बिलिङ',
        category_en: 'Billing',
        subCategory: 'payment-issue',
        description: 'अनलाइन भुक्तानी गरे पनि बिल स्टेटस अपडेट भएको छैन।',
        enDescription: 'Bill status not updated after online payment.',
        status: 'resolved',
        date: '२०८०-०२-२५',
        enDate: '2024-02-25',
        channel: 'इमेल',
        enChannel: 'Email',
        priority: 'medium',
        assignedTo: 'Billing Team',
        enAssignedTo: 'Billing Team',
        resolvedDate: '२०८०-०२-२७',
        enResolvedDate: '2024-02-27',
        assignedBy: 'Admin',
        resolution: 'भुक्तानी स्टेटस अपडेट गरियो',
        actionTaken: 'भुक्तानी मिलान गरियो'
      },
      { 
        id: 8, 
        ticketId: 'NTC-2024-008', 
        name: 'विद्या पाण्डे', 
        enName: 'Vidya Pandey',
        email: 'vidya@example.com',
        phone: '9812345693',
        category: 'activation',
        category_np: 'सक्रियता',
        category_en: 'Activation',
        subCategory: 'service-activation',
        description: 'नयाँ सिम किनेको तर ३ दिनसम्म पनि सक्रिय भएन।',
        enDescription: 'New SIM not activated even after 3 days.',
        status: 'in-progress',
        date: '२०८०-०३-०१',
        enDate: '2024-03-01',
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'high',
        assignedTo: 'Customer Service',
        enAssignedTo: 'Customer Service',
        resolvedDate: null,
        assignedBy: 'Admin'
      },
      { 
        id: 9, 
        ticketId: 'NTC-2024-009', 
        name: 'कृष्ण बस्नेत', 
        enName: 'Krishna Basnet',
        email: 'krishna@example.com',
        phone: '9812345694',
        category: 'internet',
        category_np: 'इन्टरनेट',
        category_en: 'Internet',
        subCategory: 'fiber-cut',
        description: 'फाइबर तार काटिएको छ। पछिल्लो हप्ता देखि इन्टरनेट छैन।',
        enDescription: 'Fiber wire cut. No internet for last week.',
        status: 'pending',
        date: '२०८०-०३-०५',
        enDate: '2024-03-05',
        channel: 'फोन',
        enChannel: 'Phone',
        priority: 'urgent',
        assignedTo: 'Technical Team',
        enAssignedTo: 'Technical Team',
        resolvedDate: null,
        assignedBy: 'Admin',
        address: 'भक्तपुर',
        landmark: 'सूर्यविनायक'
      },
      { 
        id: 10, 
        ticketId: 'NTC-2024-010', 
        name: 'अनिता श्रेष्ठ', 
        enName: 'Anita Shrestha',
        email: 'anita@example.com',
        phone: '9812345695',
        category: 'recharge',
        category_np: 'रिचार्ज',
        category_en: 'Recharge',
        subCategory: 'wrong-amount',
        description: 'रु. २०० को रिचार्ज गर्दा रु. ५०० कटौती भयो।',
        enDescription: 'Rs. 500 deducted for Rs. 200 recharge.',
        status: 'review',
        date: '२०८०-०३-०८',
        enDate: '2024-03-08',
        channel: 'व्हाट्सएप',
        enChannel: 'WhatsApp',
        priority: 'medium',
        assignedTo: 'Billing Team',
        enAssignedTo: 'Billing Team',
        resolvedDate: null,
        assignedBy: 'Admin'
      }
    ];
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchAllComplaints();
    }
  }, [navigate]);

  const content = {
    np: {
      pageTitle: 'सबै गुनासोहरू',
      allComplaints: 'सबै गुनासोहरू',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      submittedDate: 'दर्ता मिति',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
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
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      underReview: 'समीक्षामा',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noComplaintsFound: 'कुनै गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalComplaints: 'कुल गुनासो',
      pendingCount: 'विचाराधीन',
      inProgressCount: 'प्रगतिमा',
      resolvedCount: 'समाधान',
      underReviewCount: 'समीक्षामा',
      highPriority: 'उच्च प्राथमिकता',
      mediumPriority: 'मध्यम प्राथमिकता',
      lowPriority: 'न्यून प्राथमिकता',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      allComplaintsTitle: 'सबै गुनासो'
    },
    en: {
      pageTitle: 'All Complaints',
      allComplaints: 'All Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      submittedDate: 'Submitted Date',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
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
      resolution: 'Resolution Details',
      actionTaken: 'Action Taken',
      close: 'Close',
      all: 'All',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      underReview: 'Under Review',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noComplaintsFound: 'No complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalComplaints: 'Total Complaints',
      pendingCount: 'Pending',
      inProgressCount: 'In Progress',
      resolvedCount: 'Resolved',
      underReviewCount: 'Under Review',
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      loading: 'Loading...',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      allComplaintsTitle: 'All Complaints'
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
      const statusTexts = {
        pending: 'विचाराधीन',
        'in-progress': 'प्रगतिमा',
        resolved: 'समाधान',
        review: 'समीक्षामा'
      };
      return statusTexts[status] || status;
    } else {
      const statusTexts = {
        pending: 'Pending',
        'in-progress': 'In Progress',
        resolved: 'Resolved',
        review: 'Under Review'
      };
      return statusTexts[status] || status;
    }
  };

  const getPriorityClass = (priority) => {
    const classes = { 
      high: 'priority-high', 
      medium: 'priority-medium', 
      low: 'priority-low',
      urgent: 'priority-high'
    };
    return classes[priority] || 'priority-medium';
  };

  const getPriorityText = (priority) => {
    if (language === 'np') {
      const priorityTexts = {
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'न्यून',
        urgent: 'अत्यावश्यक'
      };
      return priorityTexts[priority] || priority;
    } else {
      const priorityTexts = {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        urgent: 'Urgent'
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

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.phone.includes(searchTerm);
    
    const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    
    return searchMatch && statusMatch && priorityMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
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
    <div className="staff-complaints-all">
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

            {/* Welcome Section */}
            <div className="welcome-section">
              <div>
                <h1 className="welcome-title">{t.allComplaintsTitle}</h1>
                <p className="welcome-subtitle">{t.allComplaints}</p>
              </div>
              <button className="refresh-btn" onClick={fetchAllComplaints}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Statistics Cards - Status Wise */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-box-icon blue">📋</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.total}</div>
                  <div className="stat-box-label">{t.totalComplaints}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon orange">⏳</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.pending}</div>
                  <div className="stat-box-label">{t.pendingCount}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon yellow">🔄</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.inProgress}</div>
                  <div className="stat-box-label">{t.inProgressCount}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon purple">📝</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.review}</div>
                  <div className="stat-box-label">{t.underReviewCount}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon green">✅</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.resolved}</div>
                  <div className="stat-box-label">{t.resolvedCount}</div>
                </div>
              </div>
            </div>

            {/* Statistics Cards - Priority Wise */}
            <div className="stats-row-priority">
              <div className="stat-box-small">
                <div className="stat-icon priority-high-icon">🔴</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.high}</div>
                  <div className="stat-label">{t.highPriority}</div>
                </div>
              </div>
              <div className="stat-box-small">
                <div className="stat-icon priority-medium-icon">🟡</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.medium}</div>
                  <div className="stat-label">{t.mediumPriority}</div>
                </div>
              </div>
              <div className="stat-box-small">
                <div className="stat-icon priority-low-icon">🟢</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.low}</div>
                  <div className="stat-label">{t.lowPriority}</div>
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
                    <th>{t.submittedDate}</th>
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
                        <td className="complainant-cell">
                          <div className="complainant-name">{language === 'np' ? complaint.name : complaint.enName}</div>
                          <div className="complainant-contact">{complaint.phone}</div>
                        </td>
                        <td>{getCategoryText(complaint)}</td>
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
                          <button className="view-btn" onClick={() => openModal(complaint)}>
                            👁️ {t.viewDetails}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
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
                <div className="detail-row">
                  <label>{t.ticketId}:</label>
                  <span>{selectedComplaint.ticketId}</span>
                </div>
                <div className="detail-row">
                  <label>{t.complainant}:</label>
                  <span>{language === 'np' ? selectedComplaint.name : selectedComplaint.enName}</span>
                </div>
                <div className="detail-row">
                  <label>{t.email}:</label>
                  <span>{selectedComplaint.email}</span>
                </div>
                <div className="detail-row">
                  <label>{t.phone}:</label>
                  <span>{selectedComplaint.phone}</span>
                </div>
                <div className="detail-row">
                  <label>{t.category}:</label>
                  <span>{getCategoryText(selectedComplaint)}</span>
                </div>
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
                  <span>{getDate(selectedComplaint)}</span>
                </div>
                {selectedComplaint.resolvedDate && (
                  <div className="detail-row">
                    <label>{t.resolvedDate}:</label>
                    <span>{language === 'np' ? selectedComplaint.resolvedDate : selectedComplaint.enResolvedDate}</span>
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
                {selectedComplaint.assignedBy && (
                  <div className="detail-row">
                    <label>{t.assignedBy}:</label>
                    <span>{selectedComplaint.assignedBy}</span>
                  </div>
                )}
              </div>

              {(selectedComplaint.address || selectedComplaint.landmark) && (
                <div className="detail-section">
                  <div className="detail-row">
                    <label>{t.address}:</label>
                    <span>{selectedComplaint.address || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <label>{t.landmark}:</label>
                    <span>{selectedComplaint.landmark || '-'}</span>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <div className="detail-row full-width">
                  <label>{t.description}:</label>
                  <p className="complaint-description">
                    {language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}
                  </p>
                </div>
              </div>

              {(selectedComplaint.resolution || selectedComplaint.actionTaken) && (
                <div className="detail-section resolution-section">
                  {selectedComplaint.resolution && (
                    <div className="detail-row full-width">
                      <label>{t.resolution}:</label>
                      <p className="resolution-text">{selectedComplaint.resolution}</p>
                    </div>
                  )}
                  {selectedComplaint.actionTaken && (
                    <div className="detail-row full-width">
                      <label>{t.actionTaken}:</label>
                      <p className="action-text">{selectedComplaint.actionTaken}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
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

        .staff-complaints-all {
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

        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
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
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stats-row-priority {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
        }

        .stat-box-small {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
        }

        .stat-box-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
        }

        .stat-box-icon.blue { background: #e3f2fd; color: #1565c0; }
        .stat-box-icon.orange { background: #fff3e0; color: #f57c00; }
        .stat-box-icon.yellow { background: #fff8e1; color: #f9a825; }
        .stat-box-icon.purple { background: #f3e5f5; color: #7b1fa2; }
        .stat-box-icon.green { background: #e8f5e9; color: #2e7d32; }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .priority-high-icon { background: #fee2e2; }
        .priority-medium-icon { background: #fef3c7; }
        .priority-low-icon { background: #e0e7ff; }

        .stat-box-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-box-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 2px;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
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
        }

        .search-box {
          flex: 1;
          position: relative;
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

        .filter-group {
          display: flex;
          gap: 12px;
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

        .complainant-cell {
          display: flex;
          flex-direction: column;
        }

        .complainant-name {
          font-weight: 500;
          color: #1e293b;
        }

        .complainant-contact {
          font-size: 0.65rem;
          color: #64748b;
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

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .view-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .no-data {
          text-align: center;
          padding: 60px !important;
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
        }

        .modal-body {
          padding: 24px;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-row label {
          width: 130px;
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

        .complaint-description, .resolution-text, .action-text {
          line-height: 1.6;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          margin-top: 4px;
        }

        .resolution-section {
          background: #f0fdf4;
          border-radius: 12px;
          padding: 12px;
          margin-top: 16px;
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
        }

        .btn-close {
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          background: #e2e8f0;
          color: #475569;
        }

        .btn-close:hover {
          background: #cbd5e1;
        }

        @media (max-width: 1200px) {
          .stats-row {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 992px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stats-row-priority {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
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
          
          .detail-row {
            flex-direction: column;
          }
          
          .detail-row label {
            width: 100%;
            margin-bottom: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffComplaintsAll;