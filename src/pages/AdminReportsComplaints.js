// src/pages/AdminReportsComplaints.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminReportsComplaints = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Format number with Nepali digits
  const formatNumber = (num) => {
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return num.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    }
    return num.toString();
  };

  // Enhanced sample report data with more user details
  const [reportData, setReportData] = useState({
    summary: {
      totalComplaints: 1247,
      pendingComplaints: 342,
      inProgressComplaints: 156,
      resolvedComplaints: 749,
      avgResolutionDays: 5.2,
      satisfactionRate: 78.5,
      thisMonth: 145,
      lastMonth: 132,
      growth: 9.8
    },
    categoryBreakdown: [
      { name: 'इन्टरनेट', enName: 'Internet', count: 425, percentage: 34.1 },
      { name: 'बिलिङ', enName: 'Billing', count: 312, percentage: 25.0 },
      { name: 'नेटवर्क', enName: 'Network', count: 198, percentage: 15.9 },
      { name: 'रिचार्ज', enName: 'Recharge', count: 156, percentage: 12.5 },
      { name: 'प्राविधिक', enName: 'Technical', count: 98, percentage: 7.9 },
      { name: 'सक्रियता', enName: 'Activation', count: 58, percentage: 4.6 }
    ],
    statusBreakdown: [
      { name: 'समाधान', enName: 'Resolved', count: 749, percentage: 60.1 },
      { name: 'विचाराधीन', enName: 'Pending', count: 342, percentage: 27.4 },
      { name: 'प्रगतिमा', enName: 'In Progress', count: 156, percentage: 12.5 }
    ],
    priorityBreakdown: [
      { name: 'उच्च', enName: 'High', count: 423, percentage: 33.9 },
      { name: 'मध्यम', enName: 'Medium', count: 589, percentage: 47.2 },
      { name: 'न्यून', enName: 'Low', count: 235, percentage: 18.9 }
    ],
    monthlyTrend: [
      { month: 'जनवरी', enMonth: 'January', count: 95 },
      { month: 'फेब्रुअरी', enMonth: 'February', count: 102 },
      { month: 'मार्च', enMonth: 'March', count: 118 },
      { month: 'अप्रिल', enMonth: 'April', count: 125 },
      { month: 'मे', enMonth: 'May', count: 132 },
      { month: 'जुन', enMonth: 'June', count: 145 },
      { month: 'जुलाई', enMonth: 'July', count: 158 },
      { month: 'अगस्ट', enMonth: 'August', count: 167 },
      { month: 'सेप्टेम्बर', enMonth: 'September', count: 175 },
      { month: 'अक्टोबर', enMonth: 'October', count: 182 },
      { month: 'नोभेम्बर', enMonth: 'November', count: 190 },
      { month: 'डिसेम्बर', enMonth: 'December', count: 198 }
    ],
    allComplaints: [
      { 
        id: 1, 
        ticketId: 'NTC-2024-001', 
        name: 'रमेश केसी', 
        enName: 'Ramesh KC',
        phone: '9841234567',
        email: 'ramesh.kc@example.com',
        location: 'काठमाडौं',
        enLocation: 'Kathmandu',
        category: 'internet', 
        date: '२०८०-०१-१५', 
        enDate: '2024-01-15', 
        status: 'in-progress', 
        priority: 'high',
        description: 'इन्टरनेट जडानमा समस्या',
        enDescription: 'Internet connection issue',
        assignedTo: 'प्राविधिक टोली',
        enAssignedTo: 'Technical Team',
        channel: 'website'
      },
      { 
        id: 2, 
        ticketId: 'NTC-2024-002', 
        name: 'सीता शर्मा', 
        enName: 'Sita Sharma',
        phone: '9842345678',
        email: 'sita.sharma@example.com',
        location: 'ललितपुर',
        enLocation: 'Lalitpur',
        category: 'recharge', 
        date: '२०८०-०१-१८', 
        enDate: '2024-01-18', 
        status: 'resolved', 
        priority: 'medium',
        description: 'रिचार्ज नभएको',
        enDescription: 'Recharge not credited',
        assignedTo: 'ग्राहक सहायता',
        enAssignedTo: 'Customer Support',
        channel: 'phone'
      },
      { 
        id: 3, 
        ticketId: 'NTC-2024-003', 
        name: 'हरि प्रसाद', 
        enName: 'Hari Prasad',
        phone: '9843456789',
        email: 'hari.prasad@example.com',
        location: 'भक्तपुर',
        enLocation: 'Bhaktapur',
        category: 'activation', 
        date: '२०८०-०१-२०', 
        enDate: '2024-01-20', 
        status: 'pending', 
        priority: 'low',
        description: 'सिम सक्रियता हुन सकेन',
        enDescription: 'SIM activation failed',
        assignedTo: 'प्रशासन',
        enAssignedTo: 'Administration',
        channel: 'whatsapp'
      },
      { 
        id: 4, 
        ticketId: 'NTC-2024-004', 
        name: 'गीता अधिकारी', 
        enName: 'Gita Adhikari',
        phone: '9844567890',
        email: 'gita.adhikari@example.com',
        location: 'पोखरा',
        enLocation: 'Pokhara',
        category: 'billing', 
        date: '२०८०-०१-२२', 
        enDate: '2024-01-22', 
        status: 'pending', 
        priority: 'high',
        description: 'बिलमा त्रुटि भएको',
        enDescription: 'Billing error',
        assignedTo: 'बिलिङ विभाग',
        enAssignedTo: 'Billing Department',
        channel: 'email'
      },
      { 
        id: 5, 
        ticketId: 'NTC-2024-005', 
        name: 'विकास न्यौपाने', 
        enName: 'Bikas Neupane',
        phone: '9845678901',
        email: 'bikas.neupane@example.com',
        location: 'बुटवल',
        enLocation: 'Butwal',
        category: 'network', 
        date: '२०८०-०१-२५', 
        enDate: '2024-01-25', 
        status: 'in-progress', 
        priority: 'medium',
        description: 'नेटवर्क कभरेज नभएको',
        enDescription: 'No network coverage',
        assignedTo: 'नेटवर्क टोली',
        enAssignedTo: 'Network Team',
        channel: 'facebook'
      },
      { 
        id: 6, 
        ticketId: 'NTC-2024-006', 
        name: 'मिना बस्नेत', 
        enName: 'Mina Basnet',
        phone: '9846789012',
        email: 'mina.basnet@example.com',
        location: 'धरान',
        enLocation: 'Dharan',
        category: 'technical', 
        date: '२०८०-०१-२८', 
        enDate: '2024-01-28', 
        status: 'resolved', 
        priority: 'high',
        description: 'प्राविधिक सहायता आवश्यक',
        enDescription: 'Technical assistance needed',
        assignedTo: 'प्राविधिक सहायता',
        enAssignedTo: 'Tech Support',
        channel: 'website'
      },
      { 
        id: 7, 
        ticketId: 'NTC-2024-007', 
        name: 'सुरज थापा', 
        enName: 'Suraj Thapa',
        phone: '9847890123',
        email: 'suraj.thapa@example.com',
        location: 'हेटौंडा',
        enLocation: 'Hetauda',
        category: 'internet', 
        date: '२०८०-०१-३०', 
        enDate: '2024-01-30', 
        status: 'pending', 
        priority: 'medium',
        description: 'इन्टरनेट गति सुस्त',
        enDescription: 'Slow internet speed',
        assignedTo: 'आईपी कोर टोली',
        enAssignedTo: 'IP Core Team',
        channel: 'phone'
      },
      { 
        id: 8, 
        ticketId: 'NTC-2024-008', 
        name: 'अन्जना कार्की', 
        enName: 'Anjana Karki',
        phone: '9848901234',
        email: 'anjana.karki@example.com',
        location: 'विराटनगर',
        enLocation: 'Biratnagar',
        category: 'billing', 
        date: '२०८०-०२-०२', 
        enDate: '2024-02-02', 
        status: 'in-progress', 
        priority: 'high',
        description: 'दोहोरो बिल कटौती',
        enDescription: 'Double billing deduction',
        assignedTo: 'वित्त विभाग',
        enAssignedTo: 'Finance Department',
        channel: 'whatsapp'
      },
      { 
        id: 9, 
        ticketId: 'NTC-2024-009', 
        name: 'राजन पौडेल', 
        enName: 'Rajan Paudel',
        phone: '9849012345',
        email: 'rajan.paudel@example.com',
        location: 'नेपालगन्ज',
        enLocation: 'Nepalgunj',
        category: 'network', 
        date: '२०८०-०२-०५', 
        enDate: '2024-02-05', 
        status: 'resolved', 
        priority: 'low',
        description: 'नेटवर्क ड्रप हुने समस्या',
        enDescription: 'Network dropping issue',
        assignedTo: 'नेटवर्क टोली',
        enAssignedTo: 'Network Team',
        channel: 'email'
      },
      { 
        id: 10, 
        ticketId: 'NTC-2024-010', 
        name: 'सम्झना लामिछाने', 
        enName: 'Samjhana Lamichhane',
        phone: '9850123456',
        email: 'samjhana.l@example.com',
        location: 'चितवन',
        enLocation: 'Chitwan',
        category: 'technical', 
        date: '२०८०-०२-०८', 
        enDate: '2024-02-08', 
        status: 'in-progress', 
        priority: 'high',
        description: 'फोनमा आवाज नआउने',
        enDescription: 'No voice on phone',
        assignedTo: 'प्राविधिक सहायता',
        enAssignedTo: 'Tech Support',
        channel: 'facebook'
      }
    ],
    channelBreakdown: [
      { name: 'वेबसाइट पोर्टल', enName: 'Website Portal', count: 587, percentage: 47.1 },
      { name: 'फोन', enName: 'Phone', count: 234, percentage: 18.8 },
      { name: 'व्हाट्सएप', enName: 'WhatsApp', count: 189, percentage: 15.2 },
      { name: 'इमेल', enName: 'Email', count: 145, percentage: 11.6 },
      { name: 'फेसबुक', enName: 'Facebook', count: 92, percentage: 7.3 }
    ]
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const content = {
    np: {
      complaintsReports: 'गुनासो रिपोर्टहरू',
      generateReports: 'रिपोर्ट उत्पन्न गर्नुहोस्',
      dateRange: 'मिति दायरा',
      today: 'आज',
      week: 'यो हप्ता',
      month: 'यो महिना',
      quarter: 'यो त्रैमास',
      year: 'यो वर्ष',
      custom: 'अनुकूल',
      startDate: 'सुरु मिति',
      endDate: 'अन्त्य मिति',
      reportType: 'रिपोर्ट प्रकार',
      summary: 'सारांश',
      detailed: 'विस्तृत',
      comparative: 'तुलनात्मक',
      filterByCategory: 'प्रकार अनुसार फिल्टर',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      generateReport: 'रिपोर्ट उत्पन्न गर्नुहोस्',
      exportPDF: 'पीडीएफ निर्यात गर्नुहोस्',
      exportExcel: 'एक्सेल निर्यात गर्नुहोस्',
      print: 'प्रिन्ट गर्नुहोस्',
      totalComplaints: 'कुल गुनासो',
      pendingComplaints: 'विचाराधीन',
      inProgressComplaints: 'प्रगतिमा',
      resolvedComplaints: 'समाधान',
      avgResolutionDays: 'औसत समाधान दिन',
      satisfactionRate: 'सन्तुष्टि दर',
      thisMonth: 'यो महिना',
      lastMonth: 'गत महिना',
      growth: 'वृद्धि',
      categoryBreakdown: 'प्रकार अनुसार विभाजन',
      statusBreakdown: 'स्थिति अनुसार विभाजन',
      priorityBreakdown: 'प्राथमिकता अनुसार विभाजन',
      monthlyTrend: 'मासिक प्रवृत्ति',
      allComplaints: 'सबै गुनासोहरू',
      channelBreakdown: 'च्यानल अनुसार विभाजन',
      reportGenerated: 'रिपोर्ट उत्पन्न गरियो',
      noDataFound: 'कुनै डाटा फेला परेन',
      all: 'सबै',
      internet: 'इन्टरनेट',
      billing: 'बिलिङ',
      network: 'नेटवर्क',
      recharge: 'रिचार्ज',
      technical: 'प्राविधिक',
      activation: 'सक्रियता',
      signal: 'सिग्नल',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      count: 'संख्या',
      percentage: 'प्रतिशत',
      category: 'प्रकार',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      channel: 'च्यानल',
      ticketId: 'टिकट नं.',
      complainant: 'उजुरीकर्ता',
      phone: 'फोन नं.',
      email: 'इमेल',
      location: 'स्थान',
      date: 'मिति',
      description: 'विवरण',
      assignedTo: 'जिम्मेवार',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      overallOverview: 'समग्र अवलोकन',
      userComplaintsDetails: 'प्रयोगकर्ता गुनासो विवरण',
      january: 'जनवरी',
      february: 'फेब्रुअरी',
      march: 'मार्च',
      april: 'अप्रिल',
      may: 'मे',
      june: 'जुन',
      july: 'जुलाई',
      august: 'अगस्ट',
      september: 'सेप्टेम्बर',
      october: 'अक्टोबर',
      november: 'नोभेम्बर',
      december: 'डिसेम्बर',
      resetFilters: 'फिल्टर रिसेट गर्नुहोस्',
      showing: 'देखाउँदै',
      of: 'को',
      entries: 'प्रविष्टिहरू',
      exportStarted: 'निर्यात सुरु भयो...',
      pdfExport: 'पीडीएफ निर्यात भइरहेको छ...',
      excelExport: 'एक्सेल निर्यात भइरहेको छ...',
      days: 'दिन',
      day: 'दिन'
    },
    en: {
      complaintsReports: 'Complaints Reports',
      generateReports: 'Generate Reports',
      dateRange: 'Date Range',
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year',
      custom: 'Custom',
      startDate: 'Start Date',
      endDate: 'End Date',
      reportType: 'Report Type',
      summary: 'Summary',
      detailed: 'Detailed',
      comparative: 'Comparative',
      filterByCategory: 'Filter by Category',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      generateReport: 'Generate Report',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      print: 'Print',
      totalComplaints: 'Total Complaints',
      pendingComplaints: 'Pending',
      inProgressComplaints: 'In Progress',
      resolvedComplaints: 'Resolved',
      avgResolutionDays: 'Avg Resolution Days',
      satisfactionRate: 'Satisfaction Rate',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      growth: 'Growth',
      categoryBreakdown: 'Category Breakdown',
      statusBreakdown: 'Status Breakdown',
      priorityBreakdown: 'Priority Breakdown',
      monthlyTrend: 'Monthly Trend',
      allComplaints: 'All Complaints',
      channelBreakdown: 'Channel Breakdown',
      reportGenerated: 'Report Generated',
      noDataFound: 'No data found',
      all: 'All',
      internet: 'Internet',
      billing: 'Billing',
      network: 'Network',
      recharge: 'Recharge',
      technical: 'Technical',
      activation: 'Activation',
      signal: 'Signal',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      count: 'Count',
      percentage: 'Percentage',
      category: 'Category',
      status: 'Status',
      priority: 'Priority',
      channel: 'Channel',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      phone: 'Phone',
      email: 'Email',
      location: 'Location',
      date: 'Date',
      description: 'Description',
      assignedTo: 'Assigned To',
      actions: 'Actions',
      viewDetails: 'View Details',
      overallOverview: 'Overall Overview',
      userComplaintsDetails: 'User Complaints Details',
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
      resetFilters: 'Reset Filters',
      showing: 'Showing',
      of: 'of',
      entries: 'entries',
      exportStarted: 'Export started...',
      pdfExport: 'Exporting PDF...',
      excelExport: 'Exporting Excel...',
      days: 'days',
      day: 'day'
    }
  };

  const t = content[language];
  const currentData = reportData;

  // Filter complaints based on selected filters
  const getFilteredComplaints = () => {
    let filtered = [...currentData.allComplaints];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(c => c.status === selectedStatus);
    }
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(c => c.priority === selectedPriority);
    }
    
    return filtered;
  };

  const filteredComplaints = getFilteredComplaints();

  const getCategoryText = (category) => {
    const categories = {
      np: {
        internet: 'इन्टरनेट',
        billing: 'बिलिङ',
        network: 'नेटवर्क',
        recharge: 'रिचार्ज',
        technical: 'प्राविधिक',
        activation: 'सक्रियता',
        signal: 'सिग्नल'
      },
      en: {
        internet: 'Internet',
        billing: 'Billing',
        network: 'Network',
        recharge: 'Recharge',
        technical: 'Technical',
        activation: 'Activation',
        signal: 'Signal'
      }
    };
    return categories[language][category] || category;
  };

  const getStatusText = (status) => {
    const statuses = {
      np: { pending: 'विचाराधीन', 'in-progress': 'प्रगतिमा', resolved: 'समाधान' },
      en: { pending: 'Pending', 'in-progress': 'In Progress', resolved: 'Resolved' }
    };
    return statuses[language][status] || status;
  };

  const getPriorityText = (priority) => {
    const priorities = {
      np: { high: 'उच्च', medium: 'मध्यम', low: 'न्यून' },
      en: { high: 'High', medium: 'Medium', low: 'Low' }
    };
    return priorities[language][priority] || priority;
  };

  const getMonthText = (month) => {
    const months = {
      np: {
        'January': 'जनवरी', 'February': 'फेब्रुअरी', 'March': 'मार्च',
        'April': 'अप्रिल', 'May': 'मे', 'June': 'जुन',
        'July': 'जुलाई', 'August': 'अगस्ट', 'September': 'सेप्टेम्बर',
        'October': 'अक्टोबर', 'November': 'नोभेम्बर', 'December': 'डिसेम्बर'
      },
      en: {
        'जनवरी': 'January', 'फेब्रुअरी': 'February', 'मार्च': 'March',
        'अप्रिल': 'April', 'मे': 'May', 'जुन': 'June',
        'जुलाई': 'July', 'अगस्ट': 'August', 'सेप्टेम्बर': 'September',
        'अक्टोबर': 'October', 'नोभेम्बर': 'November', 'डिसेम्बर': 'December'
      }
    };
    return months[language][month] || month;
  };

  const handleGenerateReport = () => {
    showToast(t.reportGenerated, 'success');
  };

  const handleExportPDF = () => {
    showToast(t.pdfExport, 'info');
  };

  const handleExportExcel = () => {
    showToast(t.excelExport, 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setDateRange('month');
    setReportType('summary');
    showToast(t.resetFilters, 'info');
  };

  const handleViewDetails = (complaint) => {
    const details = language === 'np' 
      ? `टिकट: ${complaint.ticketId}\nनाम: ${complaint.name}\nफोन: ${complaint.phone}\nइमेल: ${complaint.email}\nस्थान: ${complaint.location}\nप्रकार: ${getCategoryText(complaint.category)}\nविवरण: ${complaint.description}\nजिम्मेवार: ${complaint.assignedTo}`
      : `Ticket: ${complaint.ticketId}\nName: ${complaint.enName}\nPhone: ${complaint.phone}\nEmail: ${complaint.email}\nLocation: ${complaint.enLocation}\nCategory: ${getCategoryText(complaint.category)}\nDescription: ${complaint.enDescription}\nAssigned To: ${complaint.enAssignedTo}`;
    showToast(details, 'info');
  };

  return (
    <div className="admin-reports">
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

      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>📊 {t.complaintsReports}</h1>
                <p>{t.generateReports}</p>
              </div>
              <div className="action-buttons-header">
                <button className="export-btn pdf" onClick={handleExportPDF}>📄 {t.exportPDF}</button>
                <button className="export-btn excel" onClick={handleExportExcel}>📊 {t.exportExcel}</button>
                <button className="export-btn print" onClick={handlePrint}>🖨️ {t.print}</button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📈 {t.overallOverview}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('complaints')}
              >
                📋 {t.allComplaints}
              </button>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
              <div className="filter-group">
                <label>{t.dateRange}</label>
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="filter-select"
                >
                  <option value="today">{t.today}</option>
                  <option value="week">{t.week}</option>
                  <option value="month">{t.month}</option>
                  <option value="quarter">{t.quarter}</option>
                  <option value="year">{t.year}</option>
                  <option value="custom">{t.custom}</option>
                </select>
              </div>

              {dateRange === 'custom' && (
                <div className="filter-group date-range">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="date-input"
                    placeholder={t.startDate}
                  />
                  <span>—</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="date-input"
                    placeholder={t.endDate}
                  />
                </div>
              )}

              <div className="filter-group">
                <label>{t.reportType}</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  className="filter-select"
                >
                  <option value="summary">{t.summary}</option>
                  <option value="detailed">{t.detailed}</option>
                  <option value="comparative">{t.comparative}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t.filterByCategory}</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="internet">{t.internet}</option>
                  <option value="billing">{t.billing}</option>
                  <option value="network">{t.network}</option>
                  <option value="recharge">{t.recharge}</option>
                  <option value="technical">{t.technical}</option>
                  <option value="activation">{t.activation}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t.filterByStatus}</label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="in-progress">{t.inProgress}</option>
                  <option value="resolved">{t.resolved}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t.filterByPriority}</label>
                <select 
                  value={selectedPriority} 
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="high">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="low">{t.low}</option>
                </select>
              </div>

              <div className="filter-actions">
                <button className="generate-btn" onClick={handleGenerateReport}>
                  🔄 {t.generateReport}
                </button>
                <button className="reset-btn" onClick={handleResetFilters}>
                  🔄 {t.resetFilters}
                </button>
              </div>
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Summary Cards */}
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="card-icon blue">📋</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(currentData.summary.totalComplaints)}</div>
                      <div className="card-label">{t.totalComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon orange">⏳</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(currentData.summary.pendingComplaints)}</div>
                      <div className="card-label">{t.pendingComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon yellow">🔄</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(currentData.summary.inProgressComplaints)}</div>
                      <div className="card-label">{t.inProgressComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon green">✅</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(currentData.summary.resolvedComplaints)}</div>
                      <div className="card-label">{t.resolvedComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon purple">⏱️</div>
                    <div className="card-info">
                      <div className="card-value">
                        {language === 'np' 
                          ? `${formatNumber(currentData.summary.avgResolutionDays)} ${t.days}`
                          : `${currentData.summary.avgResolutionDays} ${t.days}`}
                      </div>
                      <div className="card-label">{t.avgResolutionDays}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon pink">⭐</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(currentData.summary.satisfactionRate)}%</div>
                      <div className="card-label">{t.satisfactionRate}</div>
                    </div>
                  </div>
                </div>

                {/* Growth Indicator */}
                <div className="growth-card">
                  <div className="growth-info">
                    <span className="growth-label">{t.thisMonth}:</span>
                    <span className="growth-value">{formatNumber(currentData.summary.thisMonth)}</span>
                  </div>
                  <div className="growth-info">
                    <span className="growth-label">{t.lastMonth}:</span>
                    <span className="growth-value">{formatNumber(currentData.summary.lastMonth)}</span>
                  </div>
                  <div className="growth-info">
                    <span className="growth-label">{t.growth}:</span>
                    <span className="growth-value positive">+{formatNumber(currentData.summary.growth)}%</span>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="charts-grid">
                  {/* Category Breakdown */}
                  <div className="chart-card">
                    <h3>{t.categoryBreakdown}</h3>
                    <div className="chart-content">
                      {currentData.categoryBreakdown.map((item, idx) => (
                        <div key={idx} className="chart-bar-item">
                          <div className="chart-label">
                            <span>{language === 'np' ? item.name : item.enName}</span>
                            <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                          </div>
                          <div className="chart-bar-bg">
                            <div 
                              className="chart-bar-fill" 
                              style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${200 + idx * 30}, 70%, 55%)` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="chart-card">
                    <h3>{t.statusBreakdown}</h3>
                    <div className="pie-chart-container">
                      {currentData.statusBreakdown.map((item, idx) => (
                        <div key={idx} className="pie-segment-info">
                          <div className="pie-color" style={{ backgroundColor: `hsl(${120 + idx * 90}, 70%, 55%)` }} />
                          <div className="pie-label">
                            <span>{language === 'np' ? item.name : item.enName}</span>
                            <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority Breakdown */}
                  <div className="chart-card">
                    <h3>{t.priorityBreakdown}</h3>
                    <div className="pie-chart-container">
                      {currentData.priorityBreakdown.map((item, idx) => (
                        <div key={idx} className="pie-segment-info">
                          <div className="pie-color" style={{ backgroundColor: `hsl(${0 + idx * 45}, 70%, 55%)` }} />
                          <div className="pie-label">
                            <span>{language === 'np' ? item.name : item.enName}</span>
                            <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Channel Breakdown */}
                  <div className="chart-card">
                    <h3>{t.channelBreakdown}</h3>
                    <div className="chart-content">
                      {currentData.channelBreakdown.map((item, idx) => (
                        <div key={idx} className="chart-bar-item">
                          <div className="chart-label">
                            <span>{language === 'np' ? item.name : item.enName}</span>
                            <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                          </div>
                          <div className="chart-bar-bg">
                            <div 
                              className="chart-bar-fill" 
                              style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${280 + idx * 20}, 70%, 55%)` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="trend-card">
                  <h3>{t.monthlyTrend}</h3>
                  <div className="trend-chart">
                    {currentData.monthlyTrend.map((item, idx) => (
                      <div key={idx} className="trend-bar-item">
                        <div className="trend-label">{getMonthText(item.month)}</div>
                        <div className="trend-bar-bg">
                          <div 
                            className="trend-bar-fill" 
                            style={{ 
                              height: `${(item.count / Math.max(...currentData.monthlyTrend.map(m => m.count))) * 100}%`,
                              backgroundColor: `hsl(${210 + idx * 5}, 70%, 55%)`
                            }}
                          >
                            <span className="trend-value">{formatNumber(item.count)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Complaints Details Tab - Full User Details Table */}
            {activeTab === 'complaints' && (
              <div className="table-card">
                <div className="table-header">
                  <h3>👥 {t.userComplaintsDetails}</h3>
                  <div className="table-stats">
                    {t.showing} {formatNumber(filteredComplaints.length)} {t.of} {formatNumber(currentData.allComplaints.length)} {t.entries}
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>{t.ticketId}</th>
                        <th>{t.complainant}</th>
                        <th>{t.phone}</th>
                        <th>{t.email}</th>
                        <th>{t.location}</th>
                        <th>{t.category}</th>
                        <th>{t.date}</th>
                        <th>{t.status}</th>
                        <th>{t.priority}</th>
                        <th>{t.description}</th>
                        <th>{t.assignedTo}</th>
                        <th>{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.length > 0 ? (
                        filteredComplaints.map((complaint) => (
                          <tr key={complaint.id}>
                            <td className="ticket-id">{complaint.ticketId}</td>
                            <td>
                              <div className="user-name">{language === 'np' ? complaint.name : complaint.enName}</div>
                            </td>
                            <td className="phone-number">{complaint.phone}</td>
                            <td className="email-address">{complaint.email}</td>
                            <td>{language === 'np' ? complaint.location : complaint.enLocation}</td>
                            <td>{getCategoryText(complaint.category)}</td>
                            <td>{language === 'np' ? complaint.date : complaint.enDate}</td>
                            <td>
                              <span className={`status-badge status-${complaint.status}`}>
                                {getStatusText(complaint.status)}
                              </span>
                            </td>
                            <td>
                              <span className={`priority-badge priority-${complaint.priority}`}>
                                {getPriorityText(complaint.priority)}
                              </span>
                            </td>
                            <td className="description-cell">
                              <div className="description-text" title={language === 'np' ? complaint.description : complaint.enDescription}>
                                {language === 'np' ? complaint.description : complaint.enDescription}
                              </div>
                            </td>
                            <td>{language === 'np' ? complaint.assignedTo : complaint.enAssignedTo}</td>
                            <td>
                              <button 
                                className="view-details-btn"
                                onClick={() => handleViewDetails(complaint)}
                              >
                                👁️ {t.viewDetails}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="12" className="no-data">
                            {t.noDataFound}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-reports {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
          overflow-x: hidden;
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

        /* ===== LAYOUT - Same as AdminDashboard ===== */
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

        /* ===== PAGE HEADER ===== */
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

        .action-buttons-header {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .export-btn {
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
        }

        .export-btn.pdf { background: #fee2e2; color: #dc2626; }
        .export-btn.pdf:hover { background: #fecaca; }
        .export-btn.excel { background: #d1fae5; color: #059669; }
        .export-btn.excel:hover { background: #a7f3d0; }
        .export-btn.print { background: #dbeafe; color: #2563eb; }
        .export-btn.print:hover { background: #bfdbfe; }

        /* ===== TAB NAVIGATION ===== */
        .tab-navigation {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-btn {
          padding: 12px 24px;
          background: transparent;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .tab-btn:hover { color: #3b82f6; }
        .tab-btn.active { color: #3b82f6; }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #3b82f6;
        }

        /* ===== FILTERS ===== */
        .filters-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: flex-end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 150px;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .filter-select, .date-input {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus, .date-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .date-range {
          flex-direction: row;
          align-items: center;
        }

        .date-range span { color: #64748b; }

        .filter-actions {
          display: flex;
          gap: 12px;
        }

        .generate-btn, .reset-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          height: 42px;
          transition: all 0.2s;
        }

        .generate-btn:hover, .reset-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .reset-btn {
          background: linear-gradient(135deg, #64748b, #475569);
        }

        .reset-btn:hover {
          box-shadow: 0 4px 12px rgba(100,116,139,0.3);
        }

        /* ===== SUMMARY CARDS ===== */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .card-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .card-icon.blue { background: #dbeafe; color: #2563eb; }
        .card-icon.orange { background: #fed7aa; color: #ea580c; }
        .card-icon.yellow { background: #fef3c7; color: #d97706; }
        .card-icon.green { background: #d1fae5; color: #059669; }
        .card-icon.purple { background: #f3e8ff; color: #9333ea; }
        .card-icon.pink { background: #fce7f3; color: #db2777; }

        .card-info { flex: 1; }
        .card-value { font-size: 1.3rem; font-weight: 700; color: #0f172a; }
        .card-label { font-size: 0.7rem; color: #64748b; }

        /* ===== GROWTH CARD ===== */
        .growth-card {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 16px;
          padding: 16px 24px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-around;
          border: 1px solid #bae6fd;
          flex-wrap: wrap;
          gap: 16px;
        }

        .growth-info { text-align: center; }
        .growth-label { font-size: 0.75rem; color: #0369a1; display: block; margin-bottom: 4px; }
        .growth-value { font-size: 1.2rem; font-weight: 700; color: #0c4a6e; }
        .growth-value.positive { color: #059669; }

        /* ===== CHARTS GRID ===== */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .chart-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .chart-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-bar-item { width: 100%; }
        .chart-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 0.8rem;
          color: #475569;
        }
        .chart-bar-bg {
          background: #f1f5f9;
          border-radius: 8px;
          overflow: hidden;
          height: 8px;
        }
        .chart-bar-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.5s;
        }

        /* ===== PIE CHART INFO ===== */
        .pie-chart-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pie-segment-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pie-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }

        .pie-label {
          flex: 1;
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #475569;
        }

        /* ===== TREND CHART ===== */
        .trend-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .trend-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .trend-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 250px;
          gap: 12px;
        }

        .trend-bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .trend-label { font-size: 0.7rem; color: #64748b; }
        .trend-bar-bg {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .trend-bar-fill {
          width: 40px;
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: height 0.5s;
          min-height: 30px;
        }
        .trend-value {
          position: absolute;
          top: -22px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }

        /* ===== TABLE CARD ===== */
        .table-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .table-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .table-stats { font-size: 0.75rem; color: #64748b; }

        .table-wrapper { overflow-x: auto; }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .reports-table th,
        .reports-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .reports-table th {
          color: #64748b;
          font-weight: 500;
          font-size: 0.75rem;
          background: #f8fafc;
        }

        .reports-table td {
          color: #334155;
          font-size: 0.8rem;
        }

        .reports-table tr:hover { background: #f8fafc; }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #3b82f6;
        }

        .user-name { font-weight: 500; }
        .phone-number, .email-address { font-family: monospace; font-size: 0.75rem; }

        .description-cell { max-width: 200px; }
        .description-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .status-badge, .priority-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-in-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .view-details-btn {
          background: transparent;
          border: 1px solid #3b82f6;
          color: #3b82f6;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.7rem;
          transition: all 0.2s;
        }

        .view-details-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1200px) {
          .summary-cards { grid-template-columns: repeat(3, 1fr); }
          .charts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .admin-reports {
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
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .main-container {
            margin-left: 0;
            width: 100%;
            overflow-y: visible;
          }
          
          .content-wrapper { padding: 16px; }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .filters-section { flex-direction: column; }
          .filter-group { width: 100%; }
          .date-range { flex-direction: row; }
          .filter-actions { width: 100%; flex-direction: column; }
          .generate-btn, .reset-btn { width: 100%; }
          
          .summary-cards { grid-template-columns: repeat(2, 1fr); }
          
          .trend-chart {
            height: auto;
            flex-direction: column;
          }
          .trend-bar-item {
            flex-direction: row;
            width: 100%;
            justify-content: space-between;
          }
          .trend-bar-bg { width: 60%; }
          .trend-bar-fill {
            width: 100%;
            height: 30px !important;
            border-radius: 8px;
          }
          .trend-value {
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
          }
          
          .action-buttons-header { flex-wrap: wrap; }
          .table-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .toast-notification {
            top: auto;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .summary-cards { grid-template-columns: 1fr; }
          .reports-table th,
          .reports-table td {
            padding: 8px;
            font-size: 0.7rem;
          }
        }

        @media print {
          .sidebar-container,
          .action-buttons-header,
          .filter-actions,
          .tab-navigation,
          .view-details-btn,
          .toast-notification {
            display: none !important;
          }
          .main-container { margin-left: 0; }
          .summary-cards,
          .charts-grid,
          .trend-card,
          .table-card {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReportsComplaints;