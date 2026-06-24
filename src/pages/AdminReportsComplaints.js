// src/pages/AdminReportsComplaints.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    summary: {
      totalComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0,
      avgResolutionDays: 0,
      satisfactionRate: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    categoryBreakdown: [],
    statusBreakdown: [],
    priorityBreakdown: [],
    monthlyTrend: [],
    allComplaints: [],
    channelBreakdown: []
  });

  // API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Content translations
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
      day: 'दिन',
      exporting: 'निर्यात हुँदै...',
      loading: 'लोड हुँदै...',
      error: 'त्रुटि',
      retry: 'पुन: प्रयास गर्नुहोस्',
      noComplaints: 'कुनै गुनासो फेला परेन'
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
      day: 'day',
      exporting: 'Exporting...',
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      noComplaints: 'No complaints found'
    }
  };

  const t = content[language];

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  // Format number with Nepali digits
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '०';
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return num.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    }
    return num.toString();
  };

  // Show toast notification
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), duration);
  };

  // Check authentication
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Get category text
  const getCategoryText = useCallback((category) => {
    const categories = {
      np: {
        internet: 'इन्टरनेट',
        billing: 'बिलिङ',
        network: 'नेटवर्क',
        recharge: 'रिचार्ज',
        technical: 'प्राविधिक',
        activation: 'सक्रियता',
        signal: 'सिग्नल',
        general: 'सामान्य',
        other: 'अन्य'
      },
      en: {
        internet: 'Internet',
        billing: 'Billing',
        network: 'Network',
        recharge: 'Recharge',
        technical: 'Technical',
        activation: 'Activation',
        signal: 'Signal',
        general: 'General',
        other: 'Other'
      }
    };
    return categories[language][category] || category;
  }, [language]);

  // Get status text
  const getStatusText = useCallback((status) => {
    const statuses = {
      np: { 
        pending: 'विचाराधीन', 
        'in-progress': 'प्रगतिमा', 
        resolved: 'समाधान',
        review: 'समीक्षामा',
        rejected: 'अस्वीकृत',
        closed: 'बन्द'
      },
      en: { 
        pending: 'Pending', 
        'in-progress': 'In Progress', 
        resolved: 'Resolved',
        review: 'Under Review',
        rejected: 'Rejected',
        closed: 'Closed'
      }
    };
    return statuses[language][status] || status;
  }, [language]);

  // Get priority text
  const getPriorityText = useCallback((priority) => {
    const priorities = {
      np: { high: 'उच्च', medium: 'मध्यम', low: 'न्यून', urgent: 'अत्यावश्यक' },
      en: { high: 'High', medium: 'Medium', low: 'Low', urgent: 'Urgent' }
    };
    return priorities[language][priority] || priority;
  }, [language]);

  // Fetch complaints from backend
  const fetchComplaintsData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedPriority !== 'all') params.append('priority', selectedPriority);
      
      // Date range handling
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.append('startDate', customStartDate);
        params.append('endDate', customEndDate);
      } else if (dateRange !== 'custom') {
        params.append('period', dateRange);
      }
      
      params.append('reportType', reportType);
      params.append('limit', '100');

      const url = `${API_URL}/admin/reports/complaints?${params.toString()}`;
      console.log('Fetching reports from:', url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (response.data && response.data.success) {
        const data = response.data.data;
        
        // Transform data to match component structure
        setReportData({
          summary: {
            totalComplaints: data.summary?.totalComplaints || 0,
            pendingComplaints: data.summary?.pendingComplaints || 0,
            inProgressComplaints: data.summary?.inProgressComplaints || 0,
            resolvedComplaints: data.summary?.resolvedComplaints || 0,
            avgResolutionDays: data.summary?.avgResolutionDays || 0,
            satisfactionRate: data.summary?.satisfactionRate || 0,
            thisMonth: data.summary?.thisMonth || 0,
            lastMonth: data.summary?.lastMonth || 0,
            growth: data.summary?.growth || 0
          },
          categoryBreakdown: data.categoryBreakdown || [],
          statusBreakdown: data.statusBreakdown || [],
          priorityBreakdown: data.priorityBreakdown || [],
          monthlyTrend: data.monthlyTrend || [],
          allComplaints: data.allComplaints || [],
          channelBreakdown: data.channelBreakdown || []
        });
      } else {
        // If no data from API, try to fetch from complaints endpoint
        await fetchComplaintsFromList();
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      
      // Fallback: Try to get complaints from list endpoint
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        await fetchComplaintsFromList();
      } else {
        showToast(
          language === 'np' ? 'डाटा लोड गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' : 'Failed to load data. Please try again.',
          'error'
        );
        // Use sample data as fallback
        generateSampleData();
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL, language, selectedCategory, selectedStatus, selectedPriority, dateRange, customStartDate, customEndDate, reportType]);

  // Fallback: Fetch complaints from list endpoint
  const fetchComplaintsFromList = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/complaints`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.data) {
        const complaints = response.data.data;
        const transformedData = transformComplaintsData(complaints);
        setReportData(transformedData);
        showToast(
          language === 'np' ? 'डाटा सफलतापूर्वक लोड भयो' : 'Data loaded successfully',
          'success'
        );
      } else {
        generateSampleData();
      }
    } catch (error) {
      console.error('Error fetching complaints list:', error);
      generateSampleData();
    }
  }, [API_URL, language]);

  // Transform complaints data for reports
  const transformComplaintsData = useCallback((complaints) => {
    if (!complaints || complaints.length === 0) {
      return getEmptyReportData();
    }

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending' || c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress' || c.status === 'inprogress' || c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
    const rejected = complaints.filter(c => c.status === 'rejected' || c.status === 'Rejected').length;
    const review = complaints.filter(c => c.status === 'review' || c.status === 'Under Review' || c.status === 'review').length;

    // Category breakdown
    const categoryMap = {};
    complaints.forEach(c => {
      const cat = c.nature_of_complaint || c.category || 'general';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.keys(categoryMap).map(key => ({
      name: getCategoryText(key),
      count: categoryMap[key],
      percentage: ((categoryMap[key] / total) * 100)
    })).sort((a, b) => b.count - a.count);

    // Status breakdown
    const statusMap = {
      pending: pending,
      'in-progress': inProgress,
      resolved: resolved,
      review: review,
      rejected: rejected
    };
    const statusBreakdown = Object.keys(statusMap).filter(key => statusMap[key] > 0).map(key => ({
      name: getStatusText(key),
      count: statusMap[key],
      percentage: ((statusMap[key] / total) * 100)
    }));

    // Priority breakdown
    const priorityMap = {};
    complaints.forEach(c => {
      const pri = c.priority || 'medium';
      priorityMap[pri] = (priorityMap[pri] || 0) + 1;
    });
    const priorityBreakdown = Object.keys(priorityMap).map(key => ({
      name: getPriorityText(key),
      count: priorityMap[key],
      percentage: ((priorityMap[key] / total) * 100)
    })).sort((a, b) => b.count - a.count);

    // Monthly trend
    const monthMap = {};
    complaints.forEach(c => {
      const date = new Date(c.created_at || c.submittedDate || Date.now());
      const monthKey = date.toLocaleString('en-US', { month: 'short' });
      monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
    });
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = monthOrder.filter(m => monthMap[m]).map(m => ({
      month: m,
      count: monthMap[m] || 0
    }));

    // Channel breakdown
    const channelMap = {};
    complaints.forEach(c => {
      const ch = c.channel || c.source || 'website';
      channelMap[ch] = (channelMap[ch] || 0) + 1;
    });
    const channelBreakdown = Object.keys(channelMap).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: channelMap[key],
      percentage: ((channelMap[key] / total) * 100)
    })).sort((a, b) => b.count - a.count);

    // Prepare all complaints list
    const allComplaints = complaints.slice(0, 100).map(c => ({
      id: c.id || c._id,
      ticketId: c.complaint_number || c.ticketId || `NTC-${c.id || c._id}`,
      name: c.name || c.complainantName || 'N/A',
      phone: c.phone || c.phoneNumber || 'N/A',
      email: c.email || c.complainantEmail || 'N/A',
      location: c.location || c.district || c.state || c.address || 'N/A',
      category: c.nature_of_complaint || c.category || 'general',
      date: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '-',
      status: c.status || 'pending',
      priority: c.priority || 'medium',
      description: c.description || c.complaint || 'No description',
      assignedTo: c.assigned_to || c.assignedTo || 'Unassigned',
      channel: c.channel || c.source || 'website'
    }));

    return {
      summary: {
        totalComplaints: total,
        pendingComplaints: pending,
        inProgressComplaints: inProgress,
        resolvedComplaints: resolved,
        avgResolutionDays: 0,
        satisfactionRate: 0,
        thisMonth: complaints.filter(c => {
          const date = new Date(c.created_at || c.submittedDate);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
        lastMonth: complaints.filter(c => {
          const date = new Date(c.created_at || c.submittedDate);
          const now = new Date();
          const lastMonth = now.getMonth() - 1;
          return date.getMonth() === lastMonth && date.getFullYear() === now.getFullYear();
        }).length,
        growth: 0
      },
      categoryBreakdown,
      statusBreakdown,
      priorityBreakdown,
      monthlyTrend,
      allComplaints,
      channelBreakdown
    };
  }, [getCategoryText, getStatusText, getPriorityText]);

  // Get empty report data
  const getEmptyReportData = () => ({
    summary: {
      totalComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0,
      avgResolutionDays: 0,
      satisfactionRate: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    categoryBreakdown: [],
    statusBreakdown: [],
    priorityBreakdown: [],
    monthlyTrend: [],
    allComplaints: [],
    channelBreakdown: []
  });

  // Generate sample data for demo
  const generateSampleData = useCallback(() => {
    const sampleComplaints = [
      { id: 1, ticketId: 'NTC-2024-001', name: 'Ramesh KC', phone: '9841234567', email: 'ramesh.kc@example.com', location: 'Kathmandu', category: 'internet', date: '2024-01-15', status: 'in-progress', priority: 'high', description: 'Internet connection issue', assignedTo: 'Technical Team', channel: 'website' },
      { id: 2, ticketId: 'NTC-2024-002', name: 'Sita Sharma', phone: '9842345678', email: 'sita.sharma@example.com', location: 'Lalitpur', category: 'recharge', date: '2024-01-18', status: 'resolved', priority: 'medium', description: 'Recharge not credited', assignedTo: 'Customer Support', channel: 'phone' },
      { id: 3, ticketId: 'NTC-2024-003', name: 'Hari Prasad', phone: '9843456789', email: 'hari.prasad@example.com', location: 'Bhaktapur', category: 'activation', date: '2024-01-20', status: 'pending', priority: 'low', description: 'SIM activation failed', assignedTo: 'Administration', channel: 'whatsapp' },
      { id: 4, ticketId: 'NTC-2024-004', name: 'Gita Adhikari', phone: '9844567890', email: 'gita.adhikari@example.com', location: 'Pokhara', category: 'billing', date: '2024-01-22', status: 'pending', priority: 'high', description: 'Billing error', assignedTo: 'Billing Department', channel: 'email' },
      { id: 5, ticketId: 'NTC-2024-005', name: 'Bikas Neupane', phone: '9845678901', email: 'bikas.neupane@example.com', location: 'Butwal', category: 'network', date: '2024-01-25', status: 'in-progress', priority: 'medium', description: 'No network coverage', assignedTo: 'Network Team', channel: 'facebook' },
      { id: 6, ticketId: 'NTC-2024-006', name: 'Mina Basnet', phone: '9846789012', email: 'mina.basnet@example.com', location: 'Dharan', category: 'technical', date: '2024-01-28', status: 'resolved', priority: 'high', description: 'Technical assistance needed', assignedTo: 'Tech Support', channel: 'website' },
      { id: 7, ticketId: 'NTC-2024-007', name: 'Suraj Thapa', phone: '9847890123', email: 'suraj.thapa@example.com', location: 'Hetauda', category: 'internet', date: '2024-01-30', status: 'pending', priority: 'medium', description: 'Slow internet speed', assignedTo: 'IP Core Team', channel: 'phone' },
      { id: 8, ticketId: 'NTC-2024-008', name: 'Anjana Karki', phone: '9848901234', email: 'anjana.karki@example.com', location: 'Biratnagar', category: 'billing', date: '2024-02-02', status: 'in-progress', priority: 'high', description: 'Double billing deduction', assignedTo: 'Finance Department', channel: 'whatsapp' },
      { id: 9, ticketId: 'NTC-2024-009', name: 'Rajan Paudel', phone: '9849012345', email: 'rajan.paudel@example.com', location: 'Nepalgunj', category: 'network', date: '2024-02-05', status: 'resolved', priority: 'low', description: 'Network dropping issue', assignedTo: 'Network Team', channel: 'email' },
      { id: 10, ticketId: 'NTC-2024-010', name: 'Samjhana Lamichhane', phone: '9850123456', email: 'samjhana.l@example.com', location: 'Chitwan', category: 'technical', date: '2024-02-08', status: 'in-progress', priority: 'high', description: 'No voice on phone', assignedTo: 'Tech Support', channel: 'facebook' }
    ];

    const transformed = transformComplaintsData(sampleComplaints);
    setReportData(transformed);
    
    showToast(
      language === 'np' ? 'नमूना डाटा लोड भयो (ब्याकेन्ड उपलब्ध छैन)' : 'Sample data loaded (Backend not available)',
      'info',
      3000
    );
  }, [language, transformComplaintsData]);

  // Initial data load
  useEffect(() => {
    fetchComplaintsData();
  }, [fetchComplaintsData]);

  // Get filtered complaints
  const getFilteredComplaints = useCallback(() => {
    let filtered = [...reportData.allComplaints];
    
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
  }, [reportData.allComplaints, selectedCategory, selectedStatus, selectedPriority]);

  const filteredComplaints = getFilteredComplaints();

  // ===== EXPORT FUNCTIONS =====

  // Generate CSV/Excel data
  const generateExportData = useCallback(() => {
    const complaints = filteredComplaints;
    const isNepali = language === 'np';
    
    if (complaints.length === 0) {
      showToast(
        isNepali ? 'निर्यात गर्न कुनै डाटा छैन' : 'No data to export',
        'warning'
      );
      return [];
    }
    
    return complaints.map(c => ({
      [isNepali ? 'टिकट नं.' : 'Ticket ID']: c.ticketId,
      [isNepali ? 'उजुरीकर्ता' : 'Complainant']: c.name,
      [isNepali ? 'फोन नं.' : 'Phone']: c.phone,
      [isNepali ? 'इमेल' : 'Email']: c.email,
      [isNepali ? 'स्थान' : 'Location']: c.location,
      [isNepali ? 'प्रकार' : 'Category']: getCategoryText(c.category),
      [isNepali ? 'मिति' : 'Date']: c.date,
      [isNepali ? 'स्थिति' : 'Status']: getStatusText(c.status),
      [isNepali ? 'प्राथमिकता' : 'Priority']: getPriorityText(c.priority),
      [isNepali ? 'विवरण' : 'Description']: c.description,
      [isNepali ? 'जिम्मेवार' : 'Assigned To']: c.assignedTo,
      [isNepali ? 'च्यानल' : 'Channel']: c.channel
    }));
  }, [filteredComplaints, language, getCategoryText, getStatusText, getPriorityText, showToast]);

  // Generate summary data for export
  const generateSummaryData = useCallback(() => {
    const isNepali = language === 'np';
    const data = [];
    
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'सारांश रिपोर्ट' : 'Summary Report',
      [isNepali ? 'मान' : 'Value']: ''
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'कुल गुनासो' : 'Total Complaints',
      [isNepali ? 'मान' : 'Value']: reportData.summary.totalComplaints
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'विचाराधीन' : 'Pending',
      [isNepali ? 'मान' : 'Value']: reportData.summary.pendingComplaints
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'प्रगतिमा' : 'In Progress',
      [isNepali ? 'मान' : 'Value']: reportData.summary.inProgressComplaints
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'समाधान' : 'Resolved',
      [isNepali ? 'मान' : 'Value']: reportData.summary.resolvedComplaints
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'औसत समाधान दिन' : 'Avg Resolution Days',
      [isNepali ? 'मान' : 'Value']: reportData.summary.avgResolutionDays
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'सन्तुष्टि दर' : 'Satisfaction Rate',
      [isNepali ? 'मान' : 'Value']: `${reportData.summary.satisfactionRate}%`
    });
    
    // Add category breakdown
    data.push({ [isNepali ? 'विवरण' : 'Description']: '', [isNepali ? 'मान' : 'Value']: '' });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'प्रकार अनुसार विभाजन' : 'Category Breakdown',
      [isNepali ? 'मान' : 'Value']: ''
    });
    reportData.categoryBreakdown.forEach(item => {
      data.push({ 
        [isNepali ? 'विवरण' : 'Description']: item.name,
        [isNepali ? 'मान' : 'Value']: `${item.count} (${item.percentage.toFixed(1)}%)`
      });
    });
    
    return data;
  }, [language, reportData]);

  // Export to Excel
  const handleExportExcel = useCallback(() => {
    setIsExporting(true);
    showToast(t.excelExport, 'info');
    
    setTimeout(() => {
      try {
        let exportData;
        let sheetName;
        
        if (activeTab === 'overview') {
          exportData = generateSummaryData();
          sheetName = language === 'np' ? 'सारांश' : 'Summary';
        } else {
          exportData = generateExportData();
          if (exportData.length === 0) {
            setIsExporting(false);
            return;
          }
          sheetName = language === 'np' ? 'गुनासोहरू' : 'Complaints';
        }
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const filename = `complaints_report_${dateStr}.xlsx`;
        
        XLSX.writeFile(wb, filename);
        
        showToast(language === 'np' ? '✅ एक्सेल फाइल सफलतापूर्वक डाउनलोड भयो' : '✅ Excel file downloaded successfully', 'success');
        setIsExporting(false);
      } catch (error) {
        console.error('Excel export error:', error);
        showToast(language === 'np' ? '❌ एक्सेल निर्यात गर्न असफल' : '❌ Failed to export Excel', 'error');
        setIsExporting(false);
      }
    }, 500);
  }, [activeTab, generateExportData, generateSummaryData, language, showToast, t.excelExport]);

  // Export to PDF
  const handleExportPDF = useCallback(() => {
    if (isExporting) return;
    
    setIsExporting(true);
    showToast(t.pdfExport, 'info');
    
    try {
      const now = new Date();
      const complaints = filteredComplaints;
      
      // Create PDF with proper settings
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // ===== HEADER =====
      doc.setFillColor(13, 71, 161);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Complaints Report', pageWidth / 2, 18, { align: 'center' });
      
      // Date
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const dateStr = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Date: ${dateStr}`, pageWidth - 14, 24, { align: 'right' });
      
      let yPosition = 38;
      
      // ===== SUMMARY CARDS =====
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Overview', 14, yPosition);
      yPosition += 8;
      
      // Summary cards in 3x2 grid
      const summaryData = [
        { label: 'Total Complaints', value: reportData.summary.totalComplaints },
        { label: 'Pending', value: reportData.summary.pendingComplaints },
        { label: 'In Progress', value: reportData.summary.inProgressComplaints },
        { label: 'Resolved', value: reportData.summary.resolvedComplaints },
        { label: 'Avg Resolution Days', value: `${reportData.summary.avgResolutionDays} days` },
        { label: 'Satisfaction Rate', value: `${reportData.summary.satisfactionRate}%` }
      ];
      
      const cardWidth = (pageWidth - 40) / 3;
      const cardHeight = 22;
      
      // Draw summary cards
      summaryData.forEach((item, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 14 + col * (cardWidth + 5);
        const y = yPosition + row * (cardHeight + 5);
        
        // Card background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');
        
        // Card value
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(String(item.value), x + 8, y + 12);
        
        // Card label
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(item.label, x + 8, y + 19);
      });
      
      yPosition += (2 * (cardHeight + 5)) + 10;
      
      // ===== FILTERS SECTION =====
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Filters', 14, yPosition);
      yPosition += 7;
      
      // Filter values
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      
      const filters = [
        `Date Range: ${dateRange === 'month' ? 'This Month' : dateRange}`,
        `Report Type: ${reportType === 'summary' ? 'Summary' : reportType}`,
        `Category: ${selectedCategory === 'all' ? 'All' : getCategoryText(selectedCategory)}`,
        `Status: ${selectedStatus === 'all' ? 'All' : getStatusText(selectedStatus)}`,
        `Priority: ${selectedPriority === 'all' ? 'All' : getPriorityText(selectedPriority)}`
      ];
      
      const filterText = filters.join('  |  ');
      doc.text(filterText, 14, yPosition + 4);
      yPosition += 14;
      
      // ===== COMPLAINTS TABLE =====
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('All Complaints', 14, yPosition);
      yPosition += 6;
      
      // Show count
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total: ${complaints.length} complaints`, 14, yPosition);
      yPosition += 5;
      
      // Table headers
      const tableHeaders = [
        'Ticket',
        'Complainant',
        'Phone',
        'Category',
        'Date',
        'Status',
        'Priority',
        'Assigned'
      ];
      
      // Prepare table rows (limit to first 10 for PDF)
      const tableRows = complaints.slice(0, 10).map(c => [
        c.ticketId,
        c.name,
        c.phone,
        getCategoryText(c.category),
        c.date,
        getStatusText(c.status),
        getPriorityText(c.priority),
        c.assignedTo
      ]);
      
      if (tableRows.length > 0) {
        doc.autoTable({
          startY: yPosition,
          head: [tableHeaders],
          body: tableRows,
          theme: 'striped',
          styles: { 
            fontSize: 7,
            cellPadding: 2.5,
            overflow: 'linebreak',
            font: 'helvetica'
          },
          headStyles: { 
            fillColor: [13, 71, 161], 
            textColor: [255, 255, 255],
            fontSize: 7.5,
            fontStyle: 'bold'
          },
          alternateRowStyles: { fillColor: [248, 250, 255] },
          margin: { left: 14, right: 14 },
          pageBreak: 'auto',
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 28 },
            2: { cellWidth: 22 },
            3: { cellWidth: 22 },
            4: { cellWidth: 20 },
            5: { cellWidth: 22 },
            6: { cellWidth: 20 },
            7: { cellWidth: 28 }
          }
        });
        
        yPosition = doc.lastAutoTable.finalY + 8;
        
        // Show if more records exist
        if (complaints.length > 10) {
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.text(`... and ${complaints.length - 10} more complaints`, 14, yPosition);
        }
      } else {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.text('No complaints found', pageWidth / 2, yPosition + 20, { align: 'center' });
      }
      
      // ===== ADD FOOTER TO ALL PAGES =====
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
        
        // Footer text
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        const footerText = `NTC Complaint Tracking System  |  ${now.toISOString().split('T')[0]}  |  Page ${i} of ${totalPages}`;
        doc.text(footerText, pageWidth / 2, pageHeight - 6, { align: 'center' });
      }
      
      // Save PDF
      const filename = `complaints_report_${now.toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      showToast(language === 'np' ? '✅ पीडीएफ फाइल सफलतापूर्वक डाउनलोड भयो' : '✅ PDF file downloaded successfully', 'success');
      setIsExporting(false);
      
    } catch (error) {
      console.error('PDF export error:', error);
      
      // Simple fallback PDF
      try {
        const now = new Date();
        const doc = new jsPDF('landscape', 'mm', 'a4');
        
        doc.setFontSize(16);
        doc.text('Complaints Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Date: ${now.toLocaleDateString()}`, 14, 30);
        
        let y = 45;
        doc.setFontSize(12);
        doc.text('Summary', 14, y);
        y += 8;
        doc.setFontSize(10);
        
        const summaryData = [
          ['Total', reportData.summary.totalComplaints],
          ['Pending', reportData.summary.pendingComplaints],
          ['In Progress', reportData.summary.inProgressComplaints],
          ['Resolved', reportData.summary.resolvedComplaints]
        ];
        
        summaryData.forEach(([label, value]) => {
          doc.text(`${label}: ${value}`, 14, y);
          y += 7;
        });
        
        const filename = `complaints_report_${now.toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        showToast(language === 'np' ? '✅ पीडीएफ फाइल सफलतापूर्वक डाउनलोड भयो' : '✅ PDF file downloaded successfully', 'success');
      } catch (fallbackError) {
        console.error('Fallback PDF export error:', fallbackError);
        showToast(
          language === 'np' 
            ? '❌ पीडीएफ निर्यात गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
            : '❌ Failed to export PDF. Please try again.',
          'error'
        );
      }
      
      setIsExporting(false);
    }
  }, [filteredComplaints, reportData, dateRange, reportType, selectedCategory, selectedStatus, selectedPriority, getCategoryText, getStatusText, getPriorityText, isExporting, language, showToast, t.pdfExport]);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Handle generate report
  const handleGenerateReport = () => {
    fetchComplaintsData();
    showToast(t.reportGenerated, 'success');
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setDateRange('month');
    setReportType('summary');
    setCustomStartDate('');
    setCustomEndDate('');
    showToast(t.resetFilters, 'info');
    // Refresh data with reset filters
    setTimeout(fetchComplaintsData, 300);
  };

  // Handle view details
  const handleViewDetails = (complaint) => {
    const details = language === 'np' 
      ? `टिकट: ${complaint.ticketId}\nनाम: ${complaint.name}\nफोन: ${complaint.phone}\nइमेल: ${complaint.email}\nस्थान: ${complaint.location}\nप्रकार: ${getCategoryText(complaint.category)}\nविवरण: ${complaint.description}\nजिम्मेवार: ${complaint.assignedTo}`
      : `Ticket: ${complaint.ticketId}\nName: ${complaint.name}\nPhone: ${complaint.phone}\nEmail: ${complaint.email}\nLocation: ${complaint.location}\nCategory: ${getCategoryText(complaint.category)}\nDescription: ${complaint.description}\nAssigned To: ${complaint.assignedTo}`;
    showToast(details, 'info', 5000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-reports">
        <Header language={language} setLanguage={setLanguage} adminName="Admin" />
        <div className="dashboard-layout">
          <div className="sidebar-container">
            <Sidebar language={language} />
          </div>
          <div className="main-container">
            <div className="content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
                <p style={{ color: '#64748b' }}>{t.loading}</p>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Main render
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
                <button 
                  className="export-btn pdf" 
                  onClick={handleExportPDF} 
                  disabled={isExporting || filteredComplaints.length === 0}
                >
                  📄 {isExporting ? t.exporting : t.exportPDF}
                </button>
                <button 
                  className="export-btn excel" 
                  onClick={handleExportExcel} 
                  disabled={isExporting || filteredComplaints.length === 0}
                >
                  📊 {isExporting ? t.exporting : t.exportExcel}
                </button>
                <button className="export-btn print" onClick={handlePrint}>
                  🖨️ {t.print}
                </button>
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
                      <div className="card-value">{formatNumber(reportData.summary.totalComplaints)}</div>
                      <div className="card-label">{t.totalComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon orange">⏳</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(reportData.summary.pendingComplaints)}</div>
                      <div className="card-label">{t.pendingComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon yellow">🔄</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(reportData.summary.inProgressComplaints)}</div>
                      <div className="card-label">{t.inProgressComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon green">✅</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(reportData.summary.resolvedComplaints)}</div>
                      <div className="card-label">{t.resolvedComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon purple">⏱️</div>
                    <div className="card-info">
                      <div className="card-value">
                        {language === 'np' 
                          ? `${formatNumber(reportData.summary.avgResolutionDays)} ${t.days}`
                          : `${reportData.summary.avgResolutionDays} ${t.days}`}
                      </div>
                      <div className="card-label">{t.avgResolutionDays}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon pink">⭐</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(reportData.summary.satisfactionRate)}%</div>
                      <div className="card-label">{t.satisfactionRate}</div>
                    </div>
                  </div>
                </div>

                {/* Growth Indicator */}
                <div className="growth-card">
                  <div className="growth-info">
                    <span className="growth-label">{t.thisMonth}:</span>
                    <span className="growth-value">{formatNumber(reportData.summary.thisMonth)}</span>
                  </div>
                  <div className="growth-info">
                    <span className="growth-label">{t.lastMonth}:</span>
                    <span className="growth-value">{formatNumber(reportData.summary.lastMonth)}</span>
                  </div>
                  <div className="growth-info">
                    <span className="growth-label">{t.growth}:</span>
                    <span className="growth-value positive">+{formatNumber(reportData.summary.growth)}%</span>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>{t.categoryBreakdown}</h3>
                    <div className="chart-content">
                      {reportData.categoryBreakdown.length > 0 ? (
                        reportData.categoryBreakdown.map((item, idx) => (
                          <div key={idx} className="chart-bar-item">
                            <div className="chart-label">
                              <span>{item.name}</span>
                              <span>{formatNumber(item.count)} ({formatNumber(item.percentage.toFixed(1))}%)</span>
                            </div>
                            <div className="chart-bar-bg">
                              <div 
                                className="chart-bar-fill" 
                                style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: `hsl(${200 + idx * 30}, 70%, 55%)` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-data">{t.noDataFound}</div>
                      )}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>{t.statusBreakdown}</h3>
                    <div className="pie-chart-container">
                      {reportData.statusBreakdown.length > 0 ? (
                        reportData.statusBreakdown.map((item, idx) => (
                          <div key={idx} className="pie-segment-info">
                            <div className="pie-color" style={{ backgroundColor: `hsl(${120 + idx * 90}, 70%, 55%)` }} />
                            <div className="pie-label">
                              <span>{item.name}</span>
                              <span>{formatNumber(item.count)} ({formatNumber(item.percentage.toFixed(1))}%)</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-data">{t.noDataFound}</div>
                      )}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>{t.priorityBreakdown}</h3>
                    <div className="pie-chart-container">
                      {reportData.priorityBreakdown.length > 0 ? (
                        reportData.priorityBreakdown.map((item, idx) => (
                          <div key={idx} className="pie-segment-info">
                            <div className="pie-color" style={{ backgroundColor: `hsl(${0 + idx * 45}, 70%, 55%)` }} />
                            <div className="pie-label">
                              <span>{item.name}</span>
                              <span>{formatNumber(item.count)} ({formatNumber(item.percentage.toFixed(1))}%)</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-data">{t.noDataFound}</div>
                      )}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>{t.channelBreakdown}</h3>
                    <div className="chart-content">
                      {reportData.channelBreakdown.length > 0 ? (
                        reportData.channelBreakdown.map((item, idx) => (
                          <div key={idx} className="chart-bar-item">
                            <div className="chart-label">
                              <span>{item.name}</span>
                              <span>{formatNumber(item.count)} ({formatNumber(item.percentage.toFixed(1))}%)</span>
                            </div>
                            <div className="chart-bar-bg">
                              <div 
                                className="chart-bar-fill" 
                                style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: `hsl(${280 + idx * 20}, 70%, 55%)` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-data">{t.noDataFound}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="trend-card">
                  <h3>{t.monthlyTrend}</h3>
                  <div className="trend-chart">
                    {reportData.monthlyTrend.length > 0 ? (
                      reportData.monthlyTrend.map((item, idx) => {
                        const maxCount = Math.max(...reportData.monthlyTrend.map(m => m.count), 1);
                        const heightPercent = (item.count / maxCount) * 100;
                        return (
                          <div key={idx} className="trend-bar-item">
                            <div className="trend-label">{item.month}</div>
                            <div className="trend-bar-bg">
                              <div 
                                className="trend-bar-fill" 
                                style={{ 
                                  height: `${Math.max(heightPercent, 10)}%`,
                                  backgroundColor: `hsl(${210 + idx * 5}, 70%, 55%)`
                                }}
                              >
                                <span className="trend-value">{formatNumber(item.count)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-data" style={{ padding: '40px 0' }}>{t.noDataFound}</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Complaints Details Tab */}
            {activeTab === 'complaints' && (
              <div className="table-card">
                <div className="table-header">
                  <h3>👥 {t.userComplaintsDetails}</h3>
                  <div className="table-stats">
                    {t.showing} {formatNumber(filteredComplaints.length)} {t.of} {formatNumber(reportData.allComplaints.length)} {t.entries}
                  </div>
                </div>
                <div className="table-wrapper">
                  {filteredComplaints.length > 0 ? (
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
                        {filteredComplaints.map((complaint) => (
                          <tr key={complaint.id}>
                            <td className="ticket-id">{complaint.ticketId}</td>
                            <td>
                              <div className="user-name">{complaint.name}</div>
                            </td>
                            <td className="phone-number">{complaint.phone}</td>
                            <td className="email-address">{complaint.email}</td>
                            <td>{complaint.location}</td>
                            <td>{getCategoryText(complaint.category)}</td>
                            <td>{complaint.date}</td>
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
                              <div className="description-text" title={complaint.description}>
                                {complaint.description}
                              </div>
                            </td>
                            <td>{complaint.assignedTo}</td>
                            <td>
                              <button 
                                className="view-details-btn"
                                onClick={() => handleViewDetails(complaint)}
                              >
                                👁️ {t.viewDetails}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-data" style={{ padding: '40px', textAlign: 'center' }}>
                      <p style={{ fontSize: '1.1rem', color: '#64748b' }}>{t.noComplaints}</p>
                      <button 
                        className="generate-btn" 
                        onClick={fetchComplaintsData}
                        style={{ marginTop: '16px', padding: '8px 24px' }}
                      >
                        🔄 {t.retry}
                      </button>
                    </div>
                  )}
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
          font-size: 0.85rem;
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .export-btn.pdf { background: #fee2e2; color: #dc2626; }
        .export-btn.pdf:hover:not(:disabled) { background: #fecaca; transform: translateY(-2px); }
        .export-btn.excel { background: #d1fae5; color: #059669; }
        .export-btn.excel:hover:not(:disabled) { background: #a7f3d0; transform: translateY(-2px); }
        .export-btn.print { background: #dbeafe; color: #2563eb; }
        .export-btn.print:hover { background: #bfdbfe; transform: translateY(-2px); }

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
        .status-review { background: #e0e7ff; color: #4f46e5; }
        .status-rejected { background: #fee2e2; color: #dc2626; }
        .status-closed { background: #d1d5db; color: #4b5563; }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }
        .priority-urgent { background: #fecaca; color: #dc2626; }

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