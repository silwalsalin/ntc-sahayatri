// src/pages/StaffComplaintsMy.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffComplaintsMy = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [staffMemberFilter, setStaffMemberFilter] = useState('all');
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
    department: '',
    staffId: ''
  });

  const [complaints, setComplaints] = useState([]);
  const [allStaffMembers, setAllStaffMembers] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Fetch current staff data
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
          department: user.department || 'Customer Support',
          staffId: user.staffId || user.id
        });
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
  }, []);

  // Fetch my complaints (complaints assigned to this staff OR submitted by their department)
  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
      
      // Fetch complaints assigned to this staff member
      const assignedResponse = await axios.get('http://localhost:5000/api/complaints/assigned-to-me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch complaints submitted by staff members (for admin/supervisor view)
      let staffComplaintsResponse = { data: { data: [] } };
      if (staffUser.role === 'admin' || staffUser.role === 'supervisor') {
        staffComplaintsResponse = await axios.get('http://localhost:5000/api/complaints/staff-complaints', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Fetch all staff members for filter
      const staffResponse = await axios.get('http://localhost:5000/api/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (staffResponse.data.success && Array.isArray(staffResponse.data.data)) {
        setAllStaffMembers(staffResponse.data.data);
      }
      
      let allComplaintsData = [];
      
      // Add assigned complaints
      if (assignedResponse.data.success && Array.isArray(assignedResponse.data.data)) {
        const assignedComplaints = assignedResponse.data.data.map(complaint => 
          transformComplaintData(complaint, 'assigned')
        );
        allComplaintsData = [...allComplaintsData, ...assignedComplaints];
      }
      
      // Add staff complaints (if admin/supervisor)
      if (staffComplaintsResponse.data.success && Array.isArray(staffComplaintsResponse.data.data)) {
        const staffComplaints = staffComplaintsResponse.data.data.map(complaint => 
          transformComplaintData(complaint, 'submitted')
        );
        allComplaintsData = [...allComplaintsData, ...staffComplaints];
      }
      
      // If no data from backend, use sample data with multiple staff
      if (allComplaintsData.length === 0) {
        setBackendStatus('disconnected');
        setComplaints(getSampleMultiStaffComplaints());
        setAllStaffMembers(getSampleStaffMembers());
      } else {
        setComplaints(allComplaintsData);
        setBackendStatus('connected');
      }
      
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setBackendStatus('disconnected');
      setComplaints(getSampleMultiStaffComplaints());
      setAllStaffMembers(getSampleStaffMembers());
    } finally {
      setLoading(false);
    }
  };

  // Transform complaint data
  const transformComplaintData = (complaint, type = 'assigned') => ({
    id: complaint.id,
    ticketId: complaint.complaintNumber || `NTC-${complaint.id}`,
    name: complaint.name || 'N/A',
    enName: complaint.nameEn || complaint.name || 'N/A',
    email: complaint.email || 'N/A',
    phone: complaint.phone || 'N/A',
    category: complaint.category || 'general',
    category_np: getCategoryNepali(complaint.category),
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
    assignedToName: complaint.assignedToName || complaint.assignedTo || 'Not Assigned',
    assignedById: complaint.assignedById,
    assignedByName: complaint.assignedByName || 'System',
    submittedBy: complaint.submittedBy || complaint.name || 'N/A',
    submittedById: complaint.submittedById,
    submittedByRole: complaint.submittedByRole || 'customer',
    resolvedDate: complaint.resolvedDate ? formatNepaliDate(complaint.resolvedDate) : null,
    enResolvedDate: complaint.resolvedDate ? formatEnglishDate(complaint.resolvedDate) : null,
    submittedDate: complaint.submittedDate,
    referenceNumber: complaint.referenceNumber,
    landmark: complaint.landmark,
    address: complaint.address,
    preferredContact: complaint.preferredContact,
    resolution: complaint.resolution || null,
    actionTaken: complaint.actionTaken || null,
    type: type,
    staffName: complaint.staffName || complaint.assignedTo || 'System',
    staffRole: complaint.staffRole || 'Staff'
  });

  const getCategoryNepali = (category) => {
    const categories = {
      'internet': 'इन्टरनेट',
      'recharge': 'रिचार्ज',
      'activation': 'सक्रियता',
      'billing': 'बिलिङ',
      'general': 'सामान्य',
      'network': 'नेटवर्क',
      'signal': 'सिग्नल'
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

  // Get sample staff members
  const getSampleStaffMembers = () => {
    return [
      { id: 1, name: 'राम बहादुर', enName: 'Ram Bahadur', role: 'Technical Support', department: 'Technical', staffId: 'STF001' },
      { id: 2, name: 'श्याम कुमार', enName: 'Shyam Kumar', role: 'Billing Specialist', department: 'Billing', staffId: 'STF002' },
      { id: 3, name: 'सीता देवी', enName: 'Sita Devi', role: 'Customer Service', department: 'Customer Support', staffId: 'STF003' },
      { id: 4, name: 'हरि प्रसाद', enName: 'Hari Prasad', role: 'Network Engineer', department: 'Network', staffId: 'STF004' },
      { id: 5, name: 'गीता अधिकारी', enName: 'Gita Adhikari', role: 'Supervisor', department: 'Customer Support', staffId: 'STF005' }
    ];
  };

  // Get sample complaints from multiple staff
  const getSampleMultiStaffComplaints = () => {
    return [
      { 
        id: 1, 
        ticketId: 'NTC-2024-010', 
        name: 'राम बहादुर', 
        enName: 'Ram Bahadur',
        email: 'ram@ntc.gov.np',
        phone: '9841234567',
        category: 'internet',
        category_np: 'इन्टरनेट',
        category_en: 'Internet',
        subCategory: 'slow-speed',
        description: 'मेरो इन्टरनेट गति धेरै ढिलो छ। मैले 100 Mbps को प्याकेज लिएको छु तर 10-15 Mbps मात्र आइरहेको छ। कृपया समस्या समाधान गरिदिनुहोस्।',
        enDescription: 'My internet speed is very slow. I have taken 100 Mbps package but getting only 10-15 Mbps. Please resolve the issue.',
        status: 'in-progress',
        date: '२०८०-०२-२०',
        enDate: '2024-02-20',
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'high',
        assignedTo: 'राम बहादुर',
        assignedToName: 'Ram Bahadur',
        assignedByName: 'Admin',
        submittedBy: 'राम बहादुर',
        submittedById: 1,
        submittedByRole: 'staff',
        resolvedDate: null,
        staffName: 'राम बहादुर',
        staffRole: 'Technical Support',
        type: 'assigned'
      },
      { 
        id: 2, 
        ticketId: 'NTC-2024-015', 
        name: 'श्याम कुमार', 
        enName: 'Shyam Kumar',
        email: 'shyam@ntc.gov.np',
        phone: '9841234568',
        category: 'billing',
        category_np: 'बिलिङ',
        category_en: 'Billing',
        subCategory: 'wrong-charge',
        description: 'यो महिनाको बिलमा अतिरिक्त रु. १००० चार्ज देखाइएको छ। कृपया जाँच गरी सच्याइदिनुहोस्।',
        enDescription: 'Extra Rs. 1000 charged in this month\'s bill. Please check and correct.',
        status: 'resolved',
        date: '२०८०-०२-२५',
        enDate: '2024-02-25',
        channel: 'इमेल',
        enChannel: 'Email',
        priority: 'medium',
        assignedTo: 'श्याम कुमार',
        assignedToName: 'Shyam Kumar',
        assignedByName: 'Admin',
        submittedBy: 'श्याम कुमार',
        submittedById: 2,
        submittedByRole: 'staff',
        resolvedDate: '२०८०-०२-२८',
        enResolvedDate: '2024-02-28',
        staffName: 'श्याम कुमार',
        staffRole: 'Billing Specialist',
        resolution: 'बिल सच्याइएको छ। अतिरिक्त चार्ज हटाइएको छ।',
        type: 'submitted'
      },
      { 
        id: 3, 
        ticketId: 'NTC-2024-020', 
        name: 'सीता देवी', 
        enName: 'Sita Devi',
        email: 'sita@ntc.gov.np',
        phone: '9841234569',
        category: 'activation',
        category_np: 'सक्रियता',
        category_en: 'Activation',
        subCategory: 'sim-activation',
        description: 'नयाँ सिम किनेको २ दिन भयो तर अझै सक्रिय भएको छैन।',
        enDescription: 'Purchased new SIM 2 days ago but still not activated.',
        status: 'pending',
        date: '२०८०-०३-०५',
        enDate: '2024-03-05',
        channel: 'फोन',
        enChannel: 'Phone',
        priority: 'high',
        assignedTo: 'सीता देवी',
        assignedToName: 'Sita Devi',
        assignedByName: 'Supervisor',
        submittedBy: 'सीता देवी',
        submittedById: 3,
        submittedByRole: 'staff',
        resolvedDate: null,
        staffName: 'सीता देवी',
        staffRole: 'Customer Service',
        type: 'assigned'
      },
      { 
        id: 4, 
        ticketId: 'NTC-2024-025', 
        name: 'हरि प्रसाद', 
        enName: 'Hari Prasad',
        email: 'hari@ntc.gov.np',
        phone: '9841234570',
        category: 'network',
        category_np: 'नेटवर्क',
        category_en: 'Network',
        subCategory: 'no-signal',
        description: 'घरमा पूरै सिग्नल छैन। पछिल्लो ३ दिन देखि समस्या छ।',
        enDescription: 'No signal at home. Problem for last 3 days.',
        status: 'in-progress',
        date: '२०८०-०३-१०',
        enDate: '2024-03-10',
        channel: 'व्हाट्सएप',
        enChannel: 'WhatsApp',
        priority: 'high',
        assignedTo: 'हरि प्रसाद',
        assignedToName: 'Hari Prasad',
        assignedByName: 'Admin',
        submittedBy: 'हरि प्रसाद',
        submittedById: 4,
        submittedByRole: 'staff',
        resolvedDate: null,
        staffName: 'हरि प्रसाद',
        staffRole: 'Network Engineer',
        type: 'assigned'
      },
      { 
        id: 5, 
        ticketId: 'NTC-2024-030', 
        name: 'गीता अधिकारी', 
        enName: 'Gita Adhikari',
        email: 'gita@ntc.gov.np',
        phone: '9841234571',
        category: 'general',
        category_np: 'सामान्य',
        category_en: 'General',
        subCategory: 'feedback',
        description: 'ग्राहक सेवामा सुधारको लागि सुझाव। फोनमा धेरै बेर पर्खनु पर्ने समस्या छ।',
        enDescription: 'Suggestion for customer service improvement. Long waiting time on phone.',
        status: 'review',
        date: '२०८०-०३-१५',
        enDate: '2024-03-15',
        channel: 'इमेल',
        enChannel: 'Email',
        priority: 'low',
        assignedTo: 'गीता अधिकारी',
        assignedToName: 'Gita Adhikari',
        assignedByName: 'Admin',
        submittedBy: 'गीता अधिकारी',
        submittedById: 5,
        submittedByRole: 'staff',
        resolvedDate: null,
        staffName: 'गीता अधिकारी',
        staffRole: 'Supervisor',
        type: 'submitted'
      },
      { 
        id: 6, 
        ticketId: 'NTC-2024-035', 
        name: 'राम बहादुर', 
        enName: 'Ram Bahadur',
        email: 'ram@ntc.gov.np',
        phone: '9841234567',
        category: 'internet',
        category_np: 'इन्टरनेट',
        category_en: 'Internet',
        subCategory: 'connection-drop',
        description: 'इन्टरनेट जडान बारम्बार ड्रप हुन्छ। दिनमा १०-१५ पटक जडान जान्छ।',
        enDescription: 'Internet connection drops frequently. 10-15 times per day.',
        status: 'resolved',
        date: '२०८०-०३-१८',
        enDate: '2024-03-18',
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'high',
        assignedTo: 'हरि प्रसाद',
        assignedToName: 'Hari Prasad',
        assignedByName: 'Supervisor',
        submittedBy: 'राम बहादुर',
        submittedById: 1,
        submittedByRole: 'staff',
        resolvedDate: '२०८०-०३-२०',
        enResolvedDate: '2024-03-20',
        staffName: 'हरि प्रसाद',
        staffRole: 'Network Engineer',
        resolution: 'राउटर सेटिङ मिलाइयो',
        type: 'submitted'
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
      fetchMyComplaints();
    }
  }, [navigate]);

  const content = {
    np: {
      pageTitle: 'स्टाफ गुनासोहरू',
      myComplaints: 'सबै स्टाफका गुनासोहरू',
      searchPlaceholder: 'टिकेट नम्बर, विवरण वा प्रकारले खोज्नुहोस्...',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByStaff: 'स्टाफ सदस्य अनुसार फिल्टर',
      staffMember: 'स्टाफ सदस्य',
      ticketId: 'टिकेट नम्बर',
      category: 'प्रकार',
      staffName: 'स्टाफको नाम',
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
      submittedBy: 'पेश गर्ने व्यक्ति',
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
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      myComplaintsTitle: 'स्टाफ गुनासोहरू'
    },
    en: {
      pageTitle: 'Staff Complaints',
      myComplaints: 'All Staff Complaints',
      searchPlaceholder: 'Search by ticket number, description or category...',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      filterByStaff: 'Filter by Staff Member',
      staffMember: 'Staff Member',
      ticketId: 'Ticket ID',
      category: 'Category',
      staffName: 'Staff Name',
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
      submittedBy: 'Submitted By',
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
      loading: 'Loading...',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      myComplaintsTitle: 'Staff Complaints'
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
    return language === 'np' ? complaint.assignedTo : complaint.assignedToName;
  };

  const getStaffName = (complaint) => {
    return language === 'np' ? complaint.staffName : complaint.staffName;
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      complaint.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.staffName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    
    let staffMatch = true;
    if (staffMemberFilter !== 'all') {
      const staffId = parseInt(staffMemberFilter);
      staffMatch = complaint.submittedById === staffId || 
                   (complaint.assignedToName && complaint.assignedToName.toLowerCase().includes(
                     allStaffMembers.find(s => s.id === staffId)?.name?.toLowerCase() || ''
                   ));
    }
    
    return searchMatch && statusMatch && priorityMatch && staffMatch;
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
    <div className="staff-complaints-my">
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
                <h1 className="welcome-title">{t.myComplaintsTitle}</h1>
                <p className="welcome-subtitle">{t.myComplaints}</p>
              </div>
              <button className="refresh-btn" onClick={fetchMyComplaints}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-box-icon blue">📋</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{complaints.length}</div>
                  <div className="stat-box-label">{t.totalComplaints}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon orange">⏳</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{complaints.filter(c => c.status === 'pending').length}</div>
                  <div className="stat-box-label">{t.pendingCount}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon yellow">🔄</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{complaints.filter(c => c.status === 'in-progress').length}</div>
                  <div className="stat-box-label">{t.inProgressCount}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon green">✅</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{complaints.filter(c => c.status === 'resolved').length}</div>
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
                <select
                  value={staffMemberFilter}
                  onChange={(e) => setStaffMemberFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all} {t.staffMember}</option>
                  {allStaffMembers.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {language === 'np' ? staff.name : staff.enName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="table-wrapper">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>{t.ticketId}</th>
                    <th>{t.staffName}</th>
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
                        <td>
                          <div className="staff-info">
                            <span className="staff-name">{getStaffName(complaint)}</span>
                            <span className="staff-role">{complaint.staffRole}</span>
                          </div>
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
              <div className="detail-row">
                <label>{t.ticketId}:</label>
                <span>{selectedComplaint.ticketId}</span>
              </div>
              <div className="detail-row">
                <label>{t.staffName}:</label>
                <span>
                  {getStaffName(selectedComplaint)}
                  <small style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>
                    {selectedComplaint.staffRole}
                  </small>
                </span>
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
              {selectedComplaint.assignedByName && (
                <div className="detail-row">
                  <label>{t.assignedBy}:</label>
                  <span>{selectedComplaint.assignedByName}</span>
                </div>
              )}
              {selectedComplaint.submittedBy && (
                <div className="detail-row">
                  <label>{t.submittedBy}:</label>
                  <span>{selectedComplaint.submittedBy}</span>
                </div>
              )}
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
              <div className="detail-row full-width">
                <label>{t.description}:</label>
                <p>{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
              </div>
              {selectedComplaint.resolution && (
                <div className="detail-row full-width">
                  <label>{t.resolution}:</label>
                  <p>{selectedComplaint.resolution}</p>
                </div>
              )}
              {selectedComplaint.actionTaken && (
                <div className="detail-row full-width">
                  <label>{t.actionTaken}:</label>
                  <p>{selectedComplaint.actionTaken}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
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

        .staff-complaints-my {
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
          min-width: 200px;
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

        .staff-info {
          display: flex;
          flex-direction: column;
        }

        .staff-name {
          font-weight: 500;
          color: #1e293b;
        }

        .staff-role {
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

        .btn-close {
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          background: #e2e8f0;
          color: #475569;
        }

        @media (max-width: 1200px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
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

export default StaffComplaintsMy;