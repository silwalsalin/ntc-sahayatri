// src/pages/StaffComplaintsInprogress.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffComplaintsInprogress = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
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
  const [allStaffMembers, setAllStaffMembers] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    assignedToMe: 0
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

  // Fetch in-progress complaints
  const fetchInprogressComplaints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/complaints/in-progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch staff members for filter
      const staffResponse = await axios.get('http://localhost:5000/api/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (staffResponse.data.success && Array.isArray(staffResponse.data.data)) {
        setAllStaffMembers(staffResponse.data.data);
      }
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const transformedComplaints = response.data.data.map(complaint => transformComplaintData(complaint));
        setComplaints(transformedComplaints);
        calculateStats(transformedComplaints);
        setBackendStatus('connected');
      } else {
        setComplaints(getSampleInprogressComplaints());
        setAllStaffMembers(getSampleStaffMembers());
        calculateStats(getSampleInprogressComplaints());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching in-progress complaints:', error);
      setComplaints(getSampleInprogressComplaints());
      setAllStaffMembers(getSampleStaffMembers());
      calculateStats(getSampleInprogressComplaints());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Get sample staff members
  const getSampleStaffMembers = () => {
    return [
      { id: 1, name: 'राम बहादुर', enName: 'Ram Bahadur', role: 'Technical Support', staffId: 'STF001' },
      { id: 2, name: 'श्याम कुमार', enName: 'Shyam Kumar', role: 'Billing Specialist', staffId: 'STF002' },
      { id: 3, name: 'सीता देवी', enName: 'Sita Devi', role: 'Customer Service', staffId: 'STF003' },
      { id: 4, name: 'हरि प्रसाद', enName: 'Hari Prasad', role: 'Network Engineer', staffId: 'STF004' },
      { id: 5, name: 'गीता अधिकारी', enName: 'Gita Adhikari', role: 'Supervisor', staffId: 'STF005' }
    ];
  };

  // Calculate statistics
  const calculateStats = (complaintsData) => {
    const currentStaffName = staffData.name;
    const newStats = {
      total: complaintsData.length,
      high: complaintsData.filter(c => c.priority === 'high' || c.priority === 'urgent').length,
      medium: complaintsData.filter(c => c.priority === 'medium').length,
      low: complaintsData.filter(c => c.priority === 'low').length,
      assignedToMe: complaintsData.filter(c => 
        c.assignedTo === currentStaffName || 
        c.assignedToName === currentStaffName ||
        c.assignedTo === 'Ram Bahadur'
      ).length
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
    assignedToId: complaint.assignedToId || null,
    assignedToName: complaint.assignedToName || complaint.assignedTo || 'Not Assigned',
    enAssignedTo: complaint.enAssignedTo || 'Not Assigned',
    resolvedDate: complaint.resolvedDate ? formatNepaliDate(complaint.resolvedDate) : null,
    enResolvedDate: complaint.resolvedDate ? formatEnglishDate(complaint.resolvedDate) : null,
    submittedDate: complaint.submittedDate,
    referenceNumber: complaint.referenceNumber,
    landmark: complaint.landmark,
    address: complaint.address,
    preferredContact: complaint.preferredContact,
    assignedBy: complaint.assignedBy || 'System',
    assignedByName: complaint.assignedByName || 'System',
    lastUpdated: complaint.updatedAt ? formatNepaliDate(complaint.updatedAt) : getDate(complaint),
    progress: complaint.progress || Math.floor(Math.random() * 40) + 30,
    staffName: complaint.staffName || complaint.assignedTo || 'Unassigned',
    staffRole: complaint.staffRole || 'Staff'
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
    if (!status) return 'in-progress';
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
    return statusMap[status] || 'in-progress';
  };

  const mapPriority = (priority) => {
    if (!priority) return 'medium';
    const priorityMap = {
      'High': 'high',
      'high': 'high',
      'Urgent': 'urgent',
      'urgent': 'urgent',
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

  // Get sample in-progress complaints with multiple staff
  const getSampleInprogressComplaints = () => {
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
        description: 'फाइबर जडान २ दिनदेखि बन्द छ। इन्टरनेट सेवा नभएकोले धेरै समस्या भएको छ। प्राविधिक टोलीले काम गरिरहेको छ।',
        enDescription: 'Fiber connection has been down for 2 days. Technical team is working on it.',
        status: 'in-progress',
        date: '२०८०-०१-१५',
        enDate: '2024-01-15',
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'high',
        assignedTo: 'राम बहादुर',
        assignedToId: 1,
        assignedToName: 'Ram Bahadur',
        enAssignedTo: 'Ram Bahadur',
        submittedDate: '2024-01-15',
        updatedAt: '2024-01-18',
        address: 'Kapan, Kathmandu',
        landmark: 'Near Ganesh Temple',
        progress: 65,
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        staffName: 'राम बहादुर',
        staffRole: 'Technical Support'
      },
      { 
        id: 2, 
        ticketId: 'NTC-2024-005', 
        name: 'प्रकाश अधिकारी', 
        enName: 'Prakash Adhikari',
        email: 'prakash@example.com',
        phone: '9812345690',
        category: 'billing',
        category_np: 'बिलिङ',
        category_en: 'Billing',
        subCategory: 'wrong-charge',
        description: 'गत महिनाको बिलमा रु. ५०० गलत चार्ज देखाइएको छ। बिलिङ टोलीले जाँच गरिरहेको छ।',
        enDescription: 'Wrong charge of Rs. 500 shown in last month\'s bill. Billing team is investigating.',
        status: 'in-progress',
        date: '२०८०-०२-१०',
        enDate: '2024-02-10',
        channel: 'इमेल',
        enChannel: 'Email',
        priority: 'medium',
        assignedTo: 'श्याम कुमार',
        assignedToId: 2,
        assignedToName: 'Shyam Kumar',
        enAssignedTo: 'Shyam Kumar',
        submittedDate: '2024-02-10',
        updatedAt: '2024-02-14',
        address: 'Baneshwor, Kathmandu',
        progress: 45,
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        staffName: 'श्याम कुमार',
        staffRole: 'Billing Specialist'
      },
      { 
        id: 3, 
        ticketId: 'NTC-2024-008', 
        name: 'सरिता न्यौपाने', 
        enName: 'Sarita Neupane',
        email: 'sarita@example.com',
        phone: '9841234590',
        category: 'activation',
        category_np: 'सक्रियता',
        category_en: 'Activation',
        subCategory: 'sim-activation',
        description: 'नयाँ सिम खरिद गरेको २४ घण्टा भयो तर सक्रिय भएको छैन। ग्राहक सेवा टोलीले समाधान गर्दैछ।',
        enDescription: 'Purchased new SIM 24 hours ago but not activated yet. Customer service team is resolving.',
        status: 'in-progress',
        date: '२०८०-०२-१५',
        enDate: '2024-02-15',
        channel: 'फोन',
        enChannel: 'Phone',
        priority: 'urgent',
        assignedTo: 'सीता देवी',
        assignedToId: 3,
        assignedToName: 'Sita Devi',
        enAssignedTo: 'Sita Devi',
        submittedDate: '2024-02-15',
        updatedAt: '2024-02-17',
        address: 'Lalitpur',
        progress: 80,
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        staffName: 'सीता देवी',
        staffRole: 'Customer Service'
      },
      { 
        id: 4, 
        ticketId: 'NTC-2024-010', 
        name: 'विनोद न्यौपाने', 
        enName: 'Binod Neupane',
        email: 'binod@example.com',
        phone: '9841234592',
        category: 'internet',
        category_np: 'इन्टरनेट',
        category_en: 'Internet',
        subCategory: 'slow-speed',
        description: 'इन्टरनेट गति धेरै ढिलो छ। प्राविधिक टोलीले गति परीक्षण गरिरहेको छ।',
        enDescription: 'Internet speed is very slow. Technical team is testing the speed.',
        status: 'in-progress',
        date: '२०८०-०२-२०',
        enDate: '2024-02-20',
        channel: 'वेबसाइट पोर्टल',
        enChannel: 'Website Portal',
        priority: 'medium',
        assignedTo: 'हरि प्रसाद',
        assignedToId: 4,
        assignedToName: 'Hari Prasad',
        enAssignedTo: 'Hari Prasad',
        submittedDate: '2024-02-20',
        updatedAt: '2024-02-22',
        address: 'Koteshwor, Kathmandu',
        progress: 35,
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        staffName: 'हरि प्रसाद',
        staffRole: 'Network Engineer'
      },
      { 
        id: 5, 
        ticketId: 'NTC-2024-012', 
        name: 'माया थापा', 
        enName: 'Maya Thapa',
        email: 'maya@example.com',
        phone: '9841234595',
        category: 'network',
        category_np: 'नेटवर्क',
        category_en: 'Network',
        subCategory: 'no-signal',
        description: 'घरमा पूरै सिग्नल छैन। नेटवर्क टोलीले जाँच गरिरहेको छ।',
        enDescription: 'No signal at home. Network team is investigating.',
        status: 'in-progress',
        date: '२०८०-०२-२५',
        enDate: '2024-02-25',
        channel: 'फोन',
        enChannel: 'Phone',
        priority: 'high',
        assignedTo: 'गीता अधिकारी',
        assignedToId: 5,
        assignedToName: 'Gita Adhikari',
        enAssignedTo: 'Gita Adhikari',
        submittedDate: '2024-02-25',
        updatedAt: '2024-02-27',
        address: 'Bhaktapur',
        landmark: 'Suryabinayak',
        progress: 50,
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        staffName: 'गीता अधिकारी',
        staffRole: 'Supervisor'
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
      fetchInprogressComplaints();
    }
  }, [navigate]);

  const content = {
    np: {
      pageTitle: 'प्रगतिमा गुनासोहरू',
      inprogressComplaints: 'प्रगतिमा गुनासोहरू',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByStaff: 'स्टाफ सदस्य अनुसार फिल्टर',
      staffMember: 'स्टाफ सदस्य',
      allStaff: 'सबै स्टाफ',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      assignedStaff: 'तोकिएको स्टाफ',
      category: 'प्रकार',
      submittedDate: 'दर्ता मिति',
      lastUpdated: 'अन्तिम अपडेट',
      priority: 'प्राथमिकता',
      progress: 'प्रगति',
      assignedTo: 'तोकिएको व्यक्ति',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      channel: 'च्यानल',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      resolvedDate: 'समाधान मिति',
      assignedBy: 'तोक्ने व्यक्ति',
      address: 'ठेगाना',
      landmark: 'सन्दर्भ स्थल',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      urgent: 'अत्यावश्यक',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noComplaintsFound: 'कुनै प्रगतिमा गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalInprogress: 'कुल प्रगतिमा',
      highPriority: 'उच्च प्राथमिकता',
      mediumPriority: 'मध्यम प्राथमिकता',
      lowPriority: 'न्यून प्राथमिकता',
      assignedToMe: 'मलाई तोकिएको',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड'
    },
    en: {
      pageTitle: 'In Progress Complaints',
      inprogressComplaints: 'In Progress Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByPriority: 'Filter by Priority',
      filterByStaff: 'Filter by Staff Member',
      staffMember: 'Staff Member',
      allStaff: 'All Staff',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      assignedStaff: 'Assigned Staff',
      category: 'Category',
      submittedDate: 'Submitted Date',
      lastUpdated: 'Last Updated',
      priority: 'Priority',
      progress: 'Progress',
      assignedTo: 'Assigned To',
      actions: 'Actions',
      viewDetails: 'View Details',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      channel: 'Channel',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      resolvedDate: 'Resolved Date',
      assignedBy: 'Assigned By',
      address: 'Address',
      landmark: 'Landmark',
      close: 'Close',
      all: 'All',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      urgent: 'Urgent',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noComplaintsFound: 'No in-progress complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalInprogress: 'Total In Progress',
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      assignedToMe: 'Assigned to Me',
      loading: 'Loading...',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard'
    }
  };

  const t = content[language];

  const getPriorityClass = (priority) => {
    const classes = { 
      high: 'priority-high', 
      medium: 'priority-medium', 
      low: 'priority-low',
      urgent: 'priority-urgent'
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

  const getLastUpdated = (complaint) => {
    return language === 'np' ? complaint.lastUpdated : complaint.enDate;
  };

  const getChannel = (complaint) => {
    return language === 'np' ? complaint.channel : complaint.enChannel;
  };

  const getAssignedTo = (complaint) => {
    if (language === 'np') {
      return complaint.assignedTo;
    }
    return complaint.assignedToName || complaint.assignedTo;
  };

  const getStaffName = (complaint) => {
    if (language === 'np') {
      return complaint.staffName;
    }
    return complaint.assignedToName || complaint.assignedTo;
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.phone.includes(searchTerm);
    
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    
    const staffMatch = staffFilter === 'all' || 
      complaint.assignedToId === parseInt(staffFilter) ||
      complaint.assignedTo === allStaffMembers.find(s => s.id === parseInt(staffFilter))?.name ||
      complaint.assignedToName === allStaffMembers.find(s => s.id === parseInt(staffFilter))?.enName;
    
    return searchMatch && priorityMatch && staffMatch;
  });

  // Sort by priority (urgent/high first, then medium, then low)
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const aPriority = a.priority === 'urgent' ? 'urgent' : a.priority;
    const bPriority = b.priority === 'urgent' ? 'urgent' : b.priority;
    
    if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedComplaints.length / itemsPerPage);
  const paginatedComplaints = sortedComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    document.body.style.overflow = 'unset';
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
    <div className="staff-complaints-inprogress">
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
                <h1 className="welcome-title">{t.inprogressComplaints}</h1>
                <p className="welcome-subtitle">{t.pageTitle}</p>
              </div>
              <button className="refresh-btn" onClick={fetchInprogressComplaints}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-box-icon blue">🔄</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.total}</div>
                  <div className="stat-box-label">{t.totalInprogress}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon red">🔴</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.high}</div>
                  <div className="stat-box-label">{t.highPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon yellow">🟡</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.medium}</div>
                  <div className="stat-box-label">{t.mediumPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon green">🟢</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.low}</div>
                  <div className="stat-box-label">{t.lowPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon purple">👤</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.assignedToMe}</div>
                  <div className="stat-box-label">{t.assignedToMe}</div>
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
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="urgent">{t.urgent}</option>
                  <option value="high">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="low">{t.low}</option>
                </select>
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.allStaff}</option>
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
                    <th>{t.complainant}</th>
                    <th>{t.assignedStaff}</th>
                    <th>{t.category}</th>
                    <th>{t.submittedDate}</th>
                    <th>{t.lastUpdated}</th>
                    <th>{t.priority}</th>
                    <th>{t.progress}</th>
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
                        <td className="staff-cell">
                          <div className="staff-name">{getStaffName(complaint)}</div>
                          <div className="staff-role">{complaint.staffRole}</div>
                        </td>
                        <td>{getCategoryText(complaint)}</td>
                        <td>{getDate(complaint)}</td>
                        <td>{getLastUpdated(complaint)}</td>
                        <td>
                          <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                            {getPriorityText(complaint.priority)}
                          </span>
                        </td>
                        <td>
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${complaint.progress}%` }}>
                              <span className="progress-text">{complaint.progress}%</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button className="view-btn" onClick={() => openModal(complaint)}>
                            👁️ {t.viewDetails}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-data-row">
                      <td colSpan="9" className="no-data">
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
                  <label>{t.priority}:</label>
                  <span className={`priority-badge ${getPriorityClass(selectedComplaint.priority)}`}>
                    {getPriorityText(selectedComplaint.priority)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.registeredDate}:</label>
                  <span>{getDate(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.lastUpdated}:</label>
                  <span>{getLastUpdated(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.progress}:</label>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${selectedComplaint.progress}%` }}>
                      <span className="progress-text">{selectedComplaint.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="detail-row">
                  <label>{t.channel}:</label>
                  <span>{getChannel(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.assignedTo}:</label>
                  <span>
                    {getAssignedTo(selectedComplaint)}
                    <span className="staff-role-badge">({selectedComplaint.staffRole})</span>
                  </span>
                </div>
                {selectedComplaint.assignedByName && (
                  <div className="detail-row">
                    <label>{t.assignedBy}:</label>
                    <span>{selectedComplaint.assignedByName}</span>
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

        .staff-complaints-inprogress {
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
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
        .stat-box-icon.red { background: #fee2e2; color: #dc2626; }
        .stat-box-icon.yellow { background: #fef3c7; color: #d97706; }
        .stat-box-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-box-icon.purple { background: #f3e5f5; color: #7b1fa2; }

        .stat-box-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-box-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 2px;
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
          min-width: 250px;
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
          transition: border-color 0.2s;
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
          transition: border-color 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #0288d1;
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
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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

        .complainant-cell, .staff-cell {
          display: flex;
          flex-direction: column;
        }

        .complainant-name, .staff-name {
          font-weight: 500;
          color: #1e293b;
        }

        .complainant-contact, .staff-role {
          font-size: 0.65rem;
          color: #64748b;
        }

        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-urgent { background: #fecaca; color: #b91c1c; font-weight: 700; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .progress-bar-container {
          width: 100px;
          background: #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
        }

        .progress-bar {
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
          text-align: center;
          border-radius: 20px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.65rem;
          padding: 2px 4px;
          display: block;
        }

        .view-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .no-data-row {
          text-align: center;
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
          max-width: 650px;
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

        .staff-role-badge {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 8px;
          background: #e2e8f0;
          border-radius: 12px;
          font-size: 0.65rem;
          color: #475569;
        }

        .complaint-description {
          line-height: 1.6;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          margin-top: 4px;
          white-space: pre-wrap;
          word-wrap: break-word;
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
          transition: all 0.2s;
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
        }

        @media (max-width: 768px) {
          .dashboard-layout {
            flex-direction: column;
          }
          
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
          
          .modal-content {
            width: 95%;
            margin: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffComplaintsInprogress;