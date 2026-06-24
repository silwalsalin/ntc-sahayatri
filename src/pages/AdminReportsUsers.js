// src/pages/AdminReportsUsers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminReportsUsers = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isExporting, setIsExporting] = useState(false);

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

  const [reportData, setReportData] = useState({
    summary: {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      suspendedUsers: 0,
      newUsersThisMonth: 0,
      newUsersLastMonth: 0,
      growth: 0,
      totalComplaints: 0,
      avgComplaintsPerUser: 0,
      satisfactionRate: 0
    },
    roleBreakdown: [],
    statusBreakdown: [],
    monthlyTrend: [],
    activityBreakdown: [],
    topUsers: [],
    registrationMethod: []
  });

  const [backendStatus, setBackendStatus] = useState('checking');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  // Fetch users and complaints from database
  const fetchData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setBackendStatus('disconnected');
        setReportData(getSampleReportData());
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all users
      const usersResponse = await axios.get(`${API_URL}/admin/users`, {
        headers,
        params: {
          page: 1,
          limit: 1000,
          role: selectedRole !== 'all' ? selectedRole : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined
        }
      });

      // Fetch all complaints
      const complaintsResponse = await axios.get(`${API_URL}/admin/complaints`, { headers });

      if (usersResponse.data.success && Array.isArray(usersResponse.data.data)) {
        const usersData = usersResponse.data.data;
        const complaintsData = complaintsResponse.data.data || [];
        
        const summary = calculateSummaryStats(usersData, complaintsData);
        const roleBreakdown = calculateRoleBreakdown(usersData);
        const statusBreakdown = calculateStatusBreakdown(usersData);
        const monthlyTrend = calculateMonthlyTrend(usersData);
        const activityBreakdown = calculateActivityBreakdown(usersData, complaintsData);
        const topUsers = getTopUsers(usersData, complaintsData);
        const registrationMethod = calculateRegistrationMethod(usersData);
        
        setReportData({
          summary,
          roleBreakdown,
          statusBreakdown,
          monthlyTrend,
          activityBreakdown,
          topUsers,
          registrationMethod
        });
        setBackendStatus('connected');
        showToast(t.reportGenerated, 'success');
      } else {
        setReportData(getSampleReportData());
        setBackendStatus('disconnected');
        showToast(t.backendNotConnected, 'warning');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setReportData(getSampleReportData());
      setBackendStatus('disconnected');
      showToast(t.backendNotConnected, 'warning');
    }
  };

  // Calculate summary statistics
  const calculateSummaryStats = (usersData, complaintsData) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const activeUsers = usersData.filter(u => u.status === 'active').length;
    const inactiveUsers = usersData.filter(u => u.status === 'inactive').length;
    const suspendedUsers = usersData.filter(u => u.status === 'suspended').length;
    const totalUsers = usersData.length;
    
    const newUsersThisMonth = usersData.filter(u => {
      const createdDate = new Date(u.createdAt || u.created_at);
      return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
    }).length;
    
    const newUsersLastMonth = usersData.filter(u => {
      const createdDate = new Date(u.createdAt || u.created_at);
      return createdDate.getMonth() === lastMonth && createdDate.getFullYear() === lastMonthYear;
    }).length;
    
    const growth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : 0;
    
    const totalComplaints = complaintsData.length;
    const avgComplaintsPerUser = totalUsers > 0 ? (totalComplaints / totalUsers) : 0;
    
    const resolvedComplaints = complaintsData.filter(c => 
      c.status === 'resolved' || c.status === 'Resolved'
    ).length;
    const satisfactionRate = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100) : 0;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      growth: parseFloat(growth.toFixed(1)),
      totalComplaints,
      avgComplaintsPerUser: parseFloat(avgComplaintsPerUser.toFixed(2)),
      satisfactionRate: parseFloat(satisfactionRate.toFixed(1))
    };
  };

  // Calculate role breakdown
  const calculateRoleBreakdown = (usersData) => {
    const roles = {
      user: { count: 0, name: 'प्रयोगकर्ता', enName: 'User' },
      staff: { count: 0, name: 'कर्मचारी', enName: 'Staff' },
      admin: { count: 0, name: 'प्रशासक', enName: 'Admin' }
    };
    
    usersData.forEach(user => {
      const role = user.role || 'user';
      if (roles[role]) {
        roles[role].count++;
      } else {
        roles.user.count++;
      }
    });
    
    const total = usersData.length;
    return Object.values(roles).map(role => ({
      name: role.name,
      enName: role.enName,
      count: role.count,
      percentage: total > 0 ? parseFloat(((role.count / total) * 100).toFixed(1)) : 0
    }));
  };

  // Calculate status breakdown
  const calculateStatusBreakdown = (usersData) => {
    const statuses = {
      active: { count: 0, name: 'सक्रिय', enName: 'Active' },
      inactive: { count: 0, name: 'निष्क्रिय', enName: 'Inactive' },
      suspended: { count: 0, name: 'निलम्बित', enName: 'Suspended' }
    };
    
    usersData.forEach(user => {
      const status = user.status || 'inactive';
      if (statuses[status]) {
        statuses[status].count++;
      } else {
        statuses.inactive.count++;
      }
    });
    
    const total = usersData.length;
    return Object.values(statuses).map(status => ({
      name: status.name,
      enName: status.enName,
      count: status.count,
      percentage: total > 0 ? parseFloat(((status.count / total) * 100).toFixed(1)) : 0
    }));
  };

  // Calculate monthly trend
  const calculateMonthlyTrend = (usersData) => {
    const months = [];
    const monthNames = {
      np: ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const monthCount = usersData.filter(user => {
        const createdDate = new Date(user.createdAt || user.created_at);
        return createdDate.getMonth() === i && createdDate.getFullYear() === currentYear;
      }).length;
      
      months.push({
        month: monthNames.np[i],
        enMonth: monthNames.en[i],
        count: monthCount
      });
    }
    
    return months;
  };

  // Calculate activity breakdown based on complaints
  const calculateActivityBreakdown = (usersData, complaintsData) => {
    const complaintsPerUser = {};
    complaintsData.forEach(complaint => {
      const userId = complaint.userId || complaint.user_id;
      if (userId) {
        complaintsPerUser[userId] = (complaintsPerUser[userId] || 0) + 1;
      }
    });
    
    let highlyActive = 0;
    let moderatelyActive = 0;
    let lowActivity = 0;
    
    usersData.forEach(user => {
      const userComplaints = complaintsPerUser[user.id] || 0;
      if (userComplaints > 10) {
        highlyActive++;
      } else if (userComplaints > 3) {
        moderatelyActive++;
      } else {
        lowActivity++;
      }
    });
    
    const total = usersData.length;
    return [
      { name: 'उच्च सक्रिय', enName: 'Highly Active', count: highlyActive, percentage: total > 0 ? parseFloat(((highlyActive / total) * 100).toFixed(1)) : 0 },
      { name: 'मध्यम सक्रिय', enName: 'Moderately Active', count: moderatelyActive, percentage: total > 0 ? parseFloat(((moderatelyActive / total) * 100).toFixed(1)) : 0 },
      { name: 'कम सक्रिय', enName: 'Low Activity', count: lowActivity, percentage: total > 0 ? parseFloat(((lowActivity / total) * 100).toFixed(1)) : 0 }
    ];
  };

  // Get top users by complaints
  const getTopUsers = (usersData, complaintsData) => {
    const complaintsByUser = {};
    
    complaintsData.forEach(complaint => {
      const userId = complaint.userId || complaint.user_id;
      if (!userId) return;
      
      if (!complaintsByUser[userId]) {
        complaintsByUser[userId] = {
          total: 0,
          resolved: 0,
          pending: 0,
          inProgress: 0
        };
      }
      complaintsByUser[userId].total++;
      
      if (complaint.status === 'resolved' || complaint.status === 'Resolved') {
        complaintsByUser[userId].resolved++;
      } else if (complaint.status === 'pending' || complaint.status === 'Pending') {
        complaintsByUser[userId].pending++;
      } else if (complaint.status === 'in-progress' || complaint.status === 'In Progress') {
        complaintsByUser[userId].inProgress++;
      }
    });
    
    const userStats = usersData.map(user => {
      const userComplaints = complaintsByUser[user.id] || { total: 0, resolved: 0, pending: 0, inProgress: 0 };
      const satisfaction = userComplaints.total > 0 
        ? (userComplaints.resolved / userComplaints.total) * 5 
        : 0;
      
      return {
        id: user.id,
        name: user.name || user.fullName || user.full_name || 'N/A',
        enName: user.name_en || user.nameEn || user.name || 'N/A',
        email: user.email,
        phone: user.phone || user.mobile || 'N/A',
        complaints: userComplaints.total,
        resolved: userComplaints.resolved,
        pending: userComplaints.pending,
        inProgress: userComplaints.inProgress,
        satisfaction: parseFloat(satisfaction.toFixed(1)),
        status: user.status || 'inactive',
        role: user.role || 'user',
        registeredAt: user.createdAt || user.created_at,
        department: user.department || 'N/A'
      };
    });
    
    let filtered = userStats;
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    return filtered.sort((a, b) => b.complaints - a.complaints).slice(0, 10);
  };

  // Calculate registration method
  const calculateRegistrationMethod = (usersData) => {
    const methods = {
      website: { count: 0, name: 'वेबसाइट', enName: 'Website' },
      mobile: { count: 0, name: 'मोबाइल एप', enName: 'Mobile App' },
      staff: { count: 0, name: 'कर्मचारी', enName: 'Staff' }
    };
    
    usersData.forEach(user => {
      const method = user.registrationMethod || user.registration_method || 'website';
      if (methods[method]) {
        methods[method].count++;
      } else {
        methods.website.count++;
      }
    });
    
    const total = usersData.length;
    return Object.values(methods).map(method => ({
      name: method.name,
      enName: method.enName,
      count: method.count,
      percentage: total > 0 ? parseFloat(((method.count / total) * 100).toFixed(1)) : 0
    }));
  };

  // Get sample report data (fallback)
  const getSampleReportData = () => {
    return {
      summary: {
        totalUsers: 1250,
        activeUsers: 980,
        inactiveUsers: 200,
        suspendedUsers: 70,
        newUsersThisMonth: 45,
        newUsersLastMonth: 52,
        growth: -13.5,
        totalComplaints: 342,
        avgComplaintsPerUser: 0.27,
        satisfactionRate: 72.5
      },
      roleBreakdown: [
        { name: 'प्रयोगकर्ता', enName: 'Users', count: 1150, percentage: 92.0 },
        { name: 'कर्मचारी', enName: 'Staff', count: 85, percentage: 6.8 },
        { name: 'प्रशासक', enName: 'Admin', count: 15, percentage: 1.2 }
      ],
      statusBreakdown: [
        { name: 'सक्रिय', enName: 'Active', count: 980, percentage: 78.4 },
        { name: 'निष्क्रिय', enName: 'Inactive', count: 200, percentage: 16.0 },
        { name: 'निलम्बित', enName: 'Suspended', count: 70, percentage: 5.6 }
      ],
      monthlyTrend: [
        { month: 'जनवरी', enMonth: 'Jan', count: 85 },
        { month: 'फेब्रुअरी', enMonth: 'Feb', count: 92 },
        { month: 'मार्च', enMonth: 'Mar', count: 78 },
        { month: 'अप्रिल', enMonth: 'Apr', count: 95 },
        { month: 'मे', enMonth: 'May', count: 88 },
        { month: 'जुन', enMonth: 'Jun', count: 102 },
        { month: 'जुलाई', enMonth: 'Jul', count: 110 },
        { month: 'अगस्ट', enMonth: 'Aug', count: 95 },
        { month: 'सेप्टेम्बर', enMonth: 'Sep', count: 88 },
        { month: 'अक्टोबर', enMonth: 'Oct', count: 92 },
        { month: 'नोभेम्बर', enMonth: 'Nov', count: 78 },
        { month: 'डिसेम्बर', enMonth: 'Dec', count: 45 }
      ],
      activityBreakdown: [
        { name: 'उच्च सक्रिय', enName: 'Highly Active', count: 45, percentage: 3.6 },
        { name: 'मध्यम सक्रिय', enName: 'Moderately Active', count: 234, percentage: 18.7 },
        { name: 'कम सक्रिय', enName: 'Low Activity', count: 971, percentage: 77.7 }
      ],
      topUsers: [
        { id: 1, name: 'राम बहादुर', enName: 'Ram Bahadur', email: 'ram@example.com', phone: '9841234567', complaints: 12, resolved: 8, pending: 2, inProgress: 2, satisfaction: 3.3, status: 'active', role: 'user', department: 'Customer Support' },
        { id: 2, name: 'सीता शर्मा', enName: 'Sita Sharma', email: 'sita@example.com', phone: '9812345678', complaints: 9, resolved: 7, pending: 1, inProgress: 1, satisfaction: 3.9, status: 'active', role: 'user', department: 'Customer Support' },
        { id: 3, name: 'कृष्ण प्रसाद', enName: 'Krishna Prasad', email: 'krishna@example.com', phone: '9801234567', complaints: 8, resolved: 6, pending: 1, inProgress: 1, satisfaction: 3.8, status: 'active', role: 'staff', department: 'Technical Support' }
      ],
      registrationMethod: [
        { name: 'वेबसाइट', enName: 'Website', count: 680, percentage: 54.4 },
        { name: 'मोबाइल एप', enName: 'Mobile App', count: 520, percentage: 41.6 },
        { name: 'कर्मचारी', enName: 'Staff', count: 50, percentage: 4.0 }
      ]
    };
  };

  // Check authentication and load data
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      fetchData();
    }
  }, [navigate, selectedStatus, selectedRole]);

  // ===== EXPORT FUNCTIONS =====

  // Generate Excel export data
  const generateExcelData = () => {
    const isNepali = language === 'np';
    const data = [];
    
    // Summary section
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'प्रयोगकर्ता रिपोर्ट' : 'Users Report',
      [isNepali ? 'मान' : 'Value']: ''
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'कुल प्रयोगकर्ता' : 'Total Users',
      [isNepali ? 'मान' : 'Value']: reportData.summary.totalUsers
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'सक्रिय प्रयोगकर्ता' : 'Active Users',
      [isNepali ? 'मान' : 'Value']: reportData.summary.activeUsers
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'निष्क्रिय प्रयोगकर्ता' : 'Inactive Users',
      [isNepali ? 'मान' : 'Value']: reportData.summary.inactiveUsers
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'निलम्बित प्रयोगकर्ता' : 'Suspended Users',
      [isNepali ? 'मान' : 'Value']: reportData.summary.suspendedUsers
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'यो महिना नयाँ' : 'New This Month',
      [isNepali ? 'मान' : 'Value']: reportData.summary.newUsersThisMonth
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'गत महिना नयाँ' : 'New Last Month',
      [isNepali ? 'मान' : 'Value']: reportData.summary.newUsersLastMonth
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'वृद्धि' : 'Growth',
      [isNepali ? 'मान' : 'Value']: `${reportData.summary.growth}%`
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'कुल गुनासो' : 'Total Complaints',
      [isNepali ? 'मान' : 'Value']: reportData.summary.totalComplaints
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'प्रति प्रयोगकर्ता औसत गुनासो' : 'Avg Complaints/User',
      [isNepali ? 'मान' : 'Value']: reportData.summary.avgComplaintsPerUser
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'सन्तुष्टि दर' : 'Satisfaction Rate',
      [isNepali ? 'मान' : 'Value']: `${reportData.summary.satisfactionRate}%`
    });
    
    return data;
  };

  // Generate top users data for export
  const generateTopUsersData = () => {
    const isNepali = language === 'np';
    const headers = {
      name: isNepali ? 'नाम' : 'Name',
      email: isNepali ? 'इमेल' : 'Email',
      phone: isNepali ? 'फोन' : 'Phone',
      role: isNepali ? 'भूमिका' : 'Role',
      department: isNepali ? 'विभाग' : 'Department',
      complaints: isNepali ? 'गुनासो' : 'Complaints',
      resolved: isNepali ? 'समाधान' : 'Resolved',
      satisfaction: isNepali ? 'सन्तुष्टि' : 'Satisfaction',
      status: isNepali ? 'स्थिति' : 'Status'
    };
    
    return [
      headers,
      ...reportData.topUsers.map(user => ({
        [headers.name]: isNepali ? user.name : user.enName,
        [headers.email]: user.email,
        [headers.phone]: user.phone,
        [headers.role]: getRoleText(user.role),
        [headers.department]: user.department,
        [headers.complaints]: user.complaints,
        [headers.resolved]: user.resolved,
        [headers.satisfaction]: user.satisfaction,
        [headers.status]: getStatusText(user.status)
      }))
    ];
  };

  // Export to Excel
  const handleExportExcel = () => {
    setIsExporting(true);
    showToast(t.excelExport, 'info');
    
    setTimeout(() => {
      try {
        const wb = XLSX.utils.book_new();
        const isNepali = language === 'np';
        
        // Sheet 1: Summary
        const summaryData = generateExcelData();
        const ws1 = XLSX.utils.json_to_sheet(summaryData);
        const colWidths = Object.keys(summaryData[0] || {}).map(key => ({
          wch: Math.max(key.length, 30)
        }));
        ws1['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws1, isNepali ? 'सारांश' : 'Summary');
        
        // Sheet 2: Top Users
        const topUsersData = generateTopUsersData();
        const ws2 = XLSX.utils.json_to_sheet(topUsersData);
        const colWidths2 = Object.keys(topUsersData[0] || {}).map(key => ({
          wch: Math.max(key.length, 20)
        }));
        ws2['!cols'] = colWidths2;
        XLSX.utils.book_append_sheet(wb, ws2, isNepali ? 'शीर्ष प्रयोगकर्ता' : 'Top Users');
        
        // Create filename
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const filename = `users_report_${dateStr}.xlsx`;
        
        // Save file
        XLSX.writeFile(wb, filename);
        
        setTimeout(() => {
          showToast(language === 'np' ? '✅ एक्सेल फाइल सफलतापूर्वक डाउनलोड भयो' : '✅ Excel file downloaded successfully', 'success');
          setIsExporting(false);
        }, 1000);
        
      } catch (error) {
        console.error('Excel export error:', error);
        showToast(language === 'np' ? '❌ एक्सेल निर्यात गर्न असफल' : '❌ Failed to export Excel', 'error');
        setIsExporting(false);
      }
    }, 500);
  };

  // ===== PDF EXPORT - SAME STYLE AS AdminReportsComplaints =====
  const handleExportPDF = () => {
    if (isExporting) return;
    
    setIsExporting(true);
    showToast(t.pdfExport, 'info');
    
    try {
      const now = new Date();
      
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
      
      // Title - Use English for clean PDF
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Users Report', pageWidth / 2, 18, { align: 'center' });
      
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
        { label: 'Total Users', value: reportData.summary.totalUsers },
        { label: 'Active', value: reportData.summary.activeUsers },
        { label: 'Inactive', value: reportData.summary.inactiveUsers },
        { label: 'Suspended', value: reportData.summary.suspendedUsers },
        { label: 'New This Month', value: reportData.summary.newUsersThisMonth },
        { label: 'Satisfaction Rate', value: `${reportData.summary.satisfactionRate}%` }
      ];
      
      const cardWidth = (pageWidth - 40) / 3;
      const cardHeight = 22;
      
      summaryData.forEach((item, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 14 + col * (cardWidth + 5);
        const y = yPosition + row * (cardHeight + 5);
        
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');
        
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(String(item.value), x + 8, y + 12);
        
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
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      
      const filters = [
        `Date Range: ${dateRange === 'month' ? 'This Month' : dateRange}`,
        `Report Type: ${reportType === 'summary' ? 'Summary' : reportType}`,
        `Role: ${selectedRole === 'all' ? 'All' : getRoleText(selectedRole)}`,
        `Status: ${selectedStatus === 'all' ? 'All' : getStatusText(selectedStatus)}`
      ];
      
      const filterText = filters.join('  |  ');
      doc.text(filterText, 14, yPosition + 4);
      yPosition += 14;
      
      // ===== ROLE BREAKDOWN =====
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Role Breakdown', 14, yPosition);
      yPosition += 6;
      
      const roleHeaders = ['Role', 'Count', 'Percentage'];
      const roleRows = reportData.roleBreakdown.map(item => [
        item.enName,
        String(item.count),
        `${item.percentage}%`
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [roleHeaders],
        body: roleRows,
        theme: 'striped',
        styles: { 
          fontSize: 9,
          cellPadding: 4,
          font: 'helvetica'
        },
        headStyles: { 
          fillColor: [13, 71, 161], 
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          2: { halign: 'right' }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
      
      // ===== STATUS BREAKDOWN =====
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Status Breakdown', 14, yPosition);
      yPosition += 6;
      
      const statusHeaders = ['Status', 'Count', 'Percentage'];
      const statusRows = reportData.statusBreakdown.map(item => [
        item.enName,
        String(item.count),
        `${item.percentage}%`
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [statusHeaders],
        body: statusRows,
        theme: 'striped',
        styles: { 
          fontSize: 9,
          cellPadding: 4,
          font: 'helvetica'
        },
        headStyles: { 
          fillColor: [13, 71, 161], 
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          2: { halign: 'right' }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
      
      // ===== ACTIVITY BREAKDOWN =====
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Activity Breakdown', 14, yPosition);
      yPosition += 6;
      
      const activityHeaders = ['Activity', 'Count', 'Percentage'];
      const activityRows = reportData.activityBreakdown.map(item => [
        item.enName,
        String(item.count),
        `${item.percentage}%`
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [activityHeaders],
        body: activityRows,
        theme: 'striped',
        styles: { 
          fontSize: 9,
          cellPadding: 4,
          font: 'helvetica'
        },
        headStyles: { 
          fillColor: [13, 71, 161], 
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          2: { halign: 'right' }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
      
      // ===== REGISTRATION METHOD =====
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Registration Method', 14, yPosition);
      yPosition += 6;
      
      const regHeaders = ['Method', 'Count', 'Percentage'];
      const regRows = reportData.registrationMethod.map(item => [
        item.enName,
        String(item.count),
        `${item.percentage}%`
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [regHeaders],
        body: regRows,
        theme: 'striped',
        styles: { 
          fontSize: 9,
          cellPadding: 4,
          font: 'helvetica'
        },
        headStyles: { 
          fillColor: [13, 71, 161], 
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          2: { halign: 'right' }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
      
      // ===== MONTHLY TREND =====
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Trend', 14, yPosition);
      yPosition += 6;
      
      const trendHeaders = ['Month', 'Count'];
      const trendRows = reportData.monthlyTrend.map(item => [
        item.enMonth,
        String(item.count)
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [trendHeaders],
        body: trendRows,
        theme: 'striped',
        styles: { 
          fontSize: 8,
          cellPadding: 3,
          font: 'helvetica'
        },
        headStyles: { 
          fillColor: [13, 71, 161], 
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          1: { halign: 'right' }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
      
      // ===== TOP USERS =====
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Users', 14, yPosition);
      yPosition += 6;
      
      const topHeaders = ['Name', 'Email', 'Phone', 'Role', 'Department', 'Complaints', 'Resolved', 'Satisfaction', 'Status'];
      
      const topRows = reportData.topUsers.map(user => [
        user.enName,
        user.email,
        user.phone,
        getRoleText(user.role),
        user.department,
        String(user.complaints),
        String(user.resolved),
        String(user.satisfaction),
        getStatusText(user.status)
      ]);
      
      if (topRows.length > 0) {
        doc.autoTable({
          startY: yPosition,
          head: [topHeaders],
          body: topRows,
          theme: 'striped',
          styles: { 
            fontSize: 7,
            cellPadding: 2.5,
            font: 'helvetica'
          },
          headStyles: { 
            fillColor: [13, 71, 161], 
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold'
          },
          alternateRowStyles: { fillColor: [248, 250, 255] },
          margin: { left: 10, right: 10 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 35 },
            2: { cellWidth: 25 },
            3: { cellWidth: 22 },
            4: { cellWidth: 28 },
            5: { cellWidth: 18, halign: 'center' },
            6: { cellWidth: 18, halign: 'center' },
            7: { cellWidth: 18, halign: 'center' },
            8: { cellWidth: 22 }
          }
        });
      } else {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No users found', pageWidth / 2, yPosition + 20, { align: 'center' });
      }
      
      // ===== ADD FOOTER =====
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
        
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        const footerText = `NTC Complaint Tracking System  |  ${now.toISOString().split('T')[0]}  |  Page ${i} of ${totalPages}`;
        doc.text(footerText, pageWidth / 2, pageHeight - 6, { align: 'center' });
      }
      
      // Save PDF
      const filename = `users_report_${now.toISOString().split('T')[0]}.pdf`;
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
        doc.text('Users Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Date: ${now.toLocaleDateString()}`, 14, 30);
        
        let y = 45;
        doc.setFontSize(12);
        doc.text('Summary', 14, y);
        y += 8;
        doc.setFontSize(10);
        
        const summaryData = [
          ['Total Users', reportData.summary.totalUsers],
          ['Active', reportData.summary.activeUsers],
          ['Inactive', reportData.summary.inactiveUsers],
          ['Suspended', reportData.summary.suspendedUsers]
        ];
        
        summaryData.forEach(([label, value]) => {
          doc.text(`${label}: ${value}`, 14, y);
          y += 7;
        });
        
        const filename = `users_report_${now.toISOString().split('T')[0]}.pdf`;
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
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const content = {
    np: {
      usersReports: 'प्रयोगकर्ता रिपोर्टहरू',
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
      filterByRole: 'भूमिका अनुसार फिल्टर',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      generateReport: 'रिपोर्ट उत्पन्न गर्नुहोस्',
      exportPDF: 'पीडीएफ निर्यात गर्नुहोस्',
      exportExcel: 'एक्सेल निर्यात गर्नुहोस्',
      print: 'प्रिन्ट गर्नुहोस्',
      totalUsers: 'कुल प्रयोगकर्ता',
      activeUsers: 'सक्रिय प्रयोगकर्ता',
      inactiveUsers: 'निष्क्रिय प्रयोगकर्ता',
      suspendedUsers: 'निलम्बित प्रयोगकर्ता',
      newUsersThisMonth: 'यो महिना नयाँ',
      newUsersLastMonth: 'गत महिना नयाँ',
      growth: 'वृद्धि',
      totalComplaints: 'कुल गुनासो',
      avgComplaintsPerUser: 'प्रति प्रयोगकर्ता औसत गुनासो',
      satisfactionRate: 'सन्तुष्टि दर',
      roleBreakdown: 'भूमिका अनुसार विभाजन',
      statusBreakdown: 'स्थिति अनुसार विभाजन',
      monthlyTrend: 'मासिक प्रवृत्ति',
      activityBreakdown: 'गतिविधि अनुसार विभाजन',
      topUsers: 'शीर्ष प्रयोगकर्ताहरू',
      registrationMethod: 'दर्ता विधि',
      reportGenerated: 'रिपोर्ट उत्पन्न गरियो',
      noDataFound: 'कुनै डाटा फेला परेन',
      all: 'सबै',
      users: 'प्रयोगकर्ता',
      staff: 'कर्मचारी',
      admin: 'प्रशासक',
      active: 'सक्रिय',
      inactive: 'निष्क्रिय',
      suspended: 'निलम्बित',
      count: 'संख्या',
      percentage: 'प्रतिशत',
      role: 'भूमिका',
      status: 'स्थिति',
      name: 'नाम',
      email: 'इमेल',
      phone: 'फोन',
      complaints: 'गुनासो',
      resolved: 'समाधान',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      satisfaction: 'सन्तुष्टि',
      highlyActive: 'उच्च सक्रिय',
      moderatelyActive: 'मध्यम सक्रिय',
      lowActivity: 'कम सक्रिय',
      website: 'वेबसाइट',
      mobileApp: 'मोबाइल एप',
      backendNotConnected: 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।',
      department: 'विभाग',
      exportStarted: 'निर्यात सुरु भयो...',
      pdfExport: 'पीडीएफ निर्यात भइरहेको छ...',
      excelExport: 'एक्सेल निर्यात भइरहेको छ...',
      exporting: 'निर्यात हुँदै...',
      days: 'दिन'
    },
    en: {
      usersReports: 'Users Reports',
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
      filterByRole: 'Filter by Role',
      filterByStatus: 'Filter by Status',
      generateReport: 'Generate Report',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      print: 'Print',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      inactiveUsers: 'Inactive Users',
      suspendedUsers: 'Suspended Users',
      newUsersThisMonth: 'New This Month',
      newUsersLastMonth: 'New Last Month',
      growth: 'Growth',
      totalComplaints: 'Total Complaints',
      avgComplaintsPerUser: 'Avg Complaints/User',
      satisfactionRate: 'Satisfaction Rate',
      roleBreakdown: 'Role Breakdown',
      statusBreakdown: 'Status Breakdown',
      monthlyTrend: 'Monthly Trend',
      activityBreakdown: 'Activity Breakdown',
      topUsers: 'Top Users',
      registrationMethod: 'Registration Method',
      reportGenerated: 'Report Generated',
      noDataFound: 'No data found',
      all: 'All',
      users: 'Users',
      staff: 'Staff',
      admin: 'Admin',
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      count: 'Count',
      percentage: 'Percentage',
      role: 'Role',
      status: 'Status',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      complaints: 'Complaints',
      resolved: 'Resolved',
      pending: 'Pending',
      inProgress: 'In Progress',
      satisfaction: 'Satisfaction',
      highlyActive: 'Highly Active',
      moderatelyActive: 'Moderately Active',
      lowActivity: 'Low Activity',
      website: 'Website',
      mobileApp: 'Mobile App',
      backendNotConnected: 'Backend server not connected. Showing sample data.',
      department: 'Department',
      exportStarted: 'Export started...',
      pdfExport: 'Exporting PDF...',
      excelExport: 'Exporting Excel...',
      exporting: 'Exporting...',
      days: 'days'
    }
  };

  const t = content[language];
  const currentData = reportData;
  const maxTrendCount = Math.max(...currentData.monthlyTrend.map(m => m.count), 1);

  const getStatusText = (status) => {
    const statuses = {
      np: { active: 'सक्रिय', inactive: 'निष्क्रिय', suspended: 'निलम्बित' },
      en: { active: 'Active', inactive: 'Inactive', suspended: 'Suspended' }
    };
    return statuses[language][status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      active: 'status-active',
      inactive: 'status-inactive',
      suspended: 'status-suspended'
    };
    return classes[status] || 'status-inactive';
  };

  const getMonthText = (month) => {
    if (language === 'np') {
      const monthMap = {
        'Jan': 'जनवरी', 'Feb': 'फेब्रुअरी', 'Mar': 'मार्च',
        'Apr': 'अप्रिल', 'May': 'मे', 'Jun': 'जुन',
        'Jul': 'जुलाई', 'Aug': 'अगस्ट', 'Sep': 'सेप्टेम्बर',
        'Oct': 'अक्टोबर', 'Nov': 'नोभेम्बर', 'Dec': 'डिसेम्बर'
      };
      return monthMap[month] || month;
    }
    return month;
  };

  const getRoleText = (role) => {
    const roles = {
      np: { user: 'प्रयोगकर्ता', staff: 'कर्मचारी', admin: 'प्रशासक' },
      en: { user: 'User', staff: 'Staff', admin: 'Admin' }
    };
    return roles[language][role] || role;
  };

  const handleGenerateReport = async () => {
    await fetchData();
  };

  return (
    <div className="admin-reports-users">
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
            {/* Backend Status Banner */}
            {backendStatus === 'disconnected' && (
              <div className="backend-warning">
                ⚠️ {t.backendNotConnected}
              </div>
            )}

            <div className="page-header">
              <div>
                <h1>👥 {t.usersReports}</h1>
                <p>{t.generateReports}</p>
              </div>
              <div className="action-buttons-header">
                <button 
                  className="export-btn pdf" 
                  onClick={handleExportPDF} 
                  disabled={isExporting}
                >
                  📄 {isExporting ? t.exporting : t.exportPDF}
                </button>
                <button 
                  className="export-btn excel" 
                  onClick={handleExportExcel} 
                  disabled={isExporting}
                >
                  📊 {isExporting ? t.exporting : t.exportExcel}
                </button>
                <button className="export-btn print" onClick={handlePrint}>
                  🖨️ {t.print}
                </button>
              </div>
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
                  />
                  <span>—</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="date-input"
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
                <label>{t.filterByRole}</label>
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="user">{t.users}</option>
                  <option value="staff">{t.staff}</option>
                  <option value="admin">{t.admin}</option>
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
                  <option value="active">{t.active}</option>
                  <option value="inactive">{t.inactive}</option>
                  <option value="suspended">{t.suspended}</option>
                </select>
              </div>

              <button className="generate-btn" onClick={handleGenerateReport}>
                🔄 {t.generateReport}
              </button>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon purple">👥</div>
                <div className="card-info">
                  <div className="card-value">{formatNumber(currentData.summary.totalUsers)}</div>
                  <div className="card-label">{t.totalUsers}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon green">🟢</div>
                <div className="card-info">
                  <div className="card-value">{formatNumber(currentData.summary.activeUsers)}</div>
                  <div className="card-label">{t.activeUsers}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon orange">⭕</div>
                <div className="card-info">
                  <div className="card-value">{formatNumber(currentData.summary.inactiveUsers)}</div>
                  <div className="card-label">{t.inactiveUsers}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon red">🔴</div>
                <div className="card-info">
                  <div className="card-value">{formatNumber(currentData.summary.suspendedUsers)}</div>
                  <div className="card-label">{t.suspendedUsers}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon blue">✨</div>
                <div className="card-info">
                  <div className="card-value">{formatNumber(currentData.summary.newUsersThisMonth)}</div>
                  <div className="card-label">{t.newUsersThisMonth}</div>
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
                <span className="growth-label">{t.newUsersThisMonth}:</span>
                <span className="growth-value">{formatNumber(currentData.summary.newUsersThisMonth)}</span>
              </div>
              <div className="growth-info">
                <span className="growth-label">{t.newUsersLastMonth}:</span>
                <span className="growth-value">{formatNumber(currentData.summary.newUsersLastMonth)}</span>
              </div>
              <div className="growth-info">
                <span className="growth-label">{t.growth}:</span>
                <span className={`growth-value ${currentData.summary.growth >= 0 ? 'positive' : 'negative'}`}>
                  {currentData.summary.growth >= 0 ? '+' : ''}{formatNumber(currentData.summary.growth)}%
                </span>
              </div>
              <div className="growth-info">
                <span className="growth-label">{t.totalComplaints}:</span>
                <span className="growth-value">{formatNumber(currentData.summary.totalComplaints)}</span>
              </div>
              <div className="growth-info">
                <span className="growth-label">{t.avgComplaintsPerUser}:</span>
                <span className="growth-value">{formatNumber(currentData.summary.avgComplaintsPerUser)}</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Role Breakdown */}
              <div className="chart-card">
                <h3>{t.roleBreakdown}</h3>
                <div className="chart-content">
                  {currentData.roleBreakdown.map((item, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <div className="chart-label">
                        <span>{language === 'np' ? item.name : item.enName}</span>
                        <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                      </div>
                      <div className="chart-bar-bg">
                        <div 
                          className="chart-bar-fill" 
                          style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${200 + idx * 120}, 70%, 55%)` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="chart-card">
                <h3>{t.statusBreakdown}</h3>
                <div className="chart-content">
                  {currentData.statusBreakdown.map((item, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <div className="chart-label">
                        <span>{language === 'np' ? item.name : item.enName}</span>
                        <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                      </div>
                      <div className="chart-bar-bg">
                        <div 
                          className="chart-bar-fill" 
                          style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${120 + idx * 90}, 70%, 55%)` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Breakdown */}
              <div className="chart-card">
                <h3>{t.activityBreakdown}</h3>
                <div className="chart-content">
                  {currentData.activityBreakdown.map((item, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <div className="chart-label">
                        <span>{language === 'np' ? item.name : item.enName}</span>
                        <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                      </div>
                      <div className="chart-bar-bg">
                        <div 
                          className="chart-bar-fill" 
                          style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${280 + idx * 30}, 70%, 55%)` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration Method */}
              <div className="chart-card">
                <h3>{t.registrationMethod}</h3>
                <div className="chart-content">
                  {currentData.registrationMethod.map((item, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <div className="chart-label">
                        <span>{language === 'np' ? item.name : item.enName}</span>
                        <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                      </div>
                      <div className="chart-bar-bg">
                        <div 
                          className="chart-bar-fill" 
                          style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${160 + idx * 60}, 70%, 55%)` }}
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
                    <div className="trend-label">{getMonthText(item.enMonth)}</div>
                    <div className="trend-bar-bg">
                      <div 
                        className="trend-bar-fill" 
                        style={{ 
                          height: `${(item.count / maxTrendCount) * 100}%`,
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

            {/* Top Users Table */}
            <div className="table-card">
              <h3>{t.topUsers}</h3>
              <div className="table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>{t.name}</th>
                      <th>{t.email}</th>
                      <th>{t.phone}</th>
                      <th>{t.role}</th>
                      <th>{t.department}</th>
                      <th>{t.complaints}</th>
                      <th>{t.resolved}</th>
                      <th>{t.satisfaction}</th>
                      <th>{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.topUsers.length > 0 ? (
                      currentData.topUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="user-name">{language === 'np' ? user.name : user.enName}</td>
                          <td className="user-email">{user.email}</td>
                          <td>{user.phone}</td>
                          <td>{getRoleText(user.role)}</td>
                          <td>{user.department}</td>
                          <td className="complaint-count">{formatNumber(user.complaints)}</td>
                          <td className="resolved-count">{formatNumber(user.resolved)}</td>
                          <td>
                            <div className="satisfaction-star">
                              <span>⭐</span> {formatNumber(user.satisfaction)}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusClass(user.status)}`}>
                              {getStatusText(user.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-data">
                          <div className="no-data-content">
                            <span className="no-data-icon">📭</span>
                            <p>{t.noDataFound}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* All CSS styles remain the same as before */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-reports-users {
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

        .backend-warning {
          background: #ff9800;
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          margin-bottom: 24px;
          text-align: center;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(255,152,0,0.3);
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
          font-size: 1.8rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .page-header p {
          color: #64748b;
          font-size: 0.9rem;
        }

        .action-buttons-header {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .export-btn {
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          border: none;
          transition: all 0.2s;
          font-size: 0.85rem;
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .export-btn.pdf { background: #fee2e2; color: #dc2626; }
        .export-btn.pdf:hover:not(:disabled) { background: #fecaca; transform: translateY(-1px); }
        .export-btn.excel { background: #d1fae5; color: #059669; }
        .export-btn.excel:hover:not(:disabled) { background: #a7f3d0; transform: translateY(-1px); }
        .export-btn.print { background: #dbeafe; color: #2563eb; }
        .export-btn.print:hover { background: #bfdbfe; transform: translateY(-1px); }

        .filters-section {
          background: white;
          border-radius: 16px;
          padding: 24px 28px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: flex-end;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 150px;
        }

        .filter-group label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-select, .date-input {
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-select:focus, .date-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .date-range {
          flex-direction: row;
          align-items: center;
          gap: 10px;
        }

        .date-range span {
          color: #64748b;
          font-weight: 500;
        }

        .generate-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 28px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          height: 42px;
          transition: all 0.2s;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .generate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59,130,246,0.35);
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
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .summary-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }

        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          flex-shrink: 0;
        }

        .card-icon.purple { background: #f3e8ff; color: #9333ea; }
        .card-icon.green { background: #d1fae5; color: #059669; }
        .card-icon.orange { background: #fed7aa; color: #ea580c; }
        .card-icon.red { background: #fee2e2; color: #dc2626; }
        .card-icon.blue { background: #dbeafe; color: #2563eb; }
        .card-icon.pink { background: #fce7f3; color: #db2777; }

        .card-info { flex: 1; min-width: 0; }
        .card-value { font-size: 1.4rem; font-weight: 700; color: #0f172a; }
        .card-label { font-size: 0.7rem; color: #64748b; margin-top: 2px; }

        .growth-card {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 16px;
          padding: 18px 24px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-around;
          border: 1px solid #bae6fd;
          flex-wrap: wrap;
          gap: 16px;
        }

        .growth-info { 
          text-align: center; 
          flex: 1;
          min-width: 80px;
        }
        .growth-label { 
          font-size: 0.75rem; 
          color: #0369a1; 
          display: block; 
          margin-bottom: 4px; 
          font-weight: 500;
        }
        .growth-value { 
          font-size: 1.2rem; 
          font-weight: 700; 
          color: #0c4a6e; 
        }
        .growth-value.positive { color: #059669; }
        .growth-value.negative { color: #dc2626; }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
        .chart-bar-item { 
          width: 100%; 
        }
        .chart-label { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 6px; 
          font-size: 0.8rem; 
          color: #475569; 
          font-weight: 500;
        }
        .chart-bar-bg { 
          background: #f1f5f9; 
          border-radius: 8px; 
          overflow: hidden; 
          height: 10px; 
        }
        .chart-bar-fill { 
          height: 100%; 
          border-radius: 8px; 
          transition: width 0.6s ease; 
        }

        .trend-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
          height: 280px;
          gap: 8px;
          padding-top: 20px;
        }

        .trend-bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .trend-label { 
          font-size: 0.7rem; 
          color: #64748b; 
          font-weight: 500;
        }
        .trend-bar-bg { 
          flex: 1; 
          width: 100%; 
          display: flex; 
          align-items: flex-end; 
          justify-content: center; 
          min-height: 30px;
        }
        .trend-bar-fill { 
          width: 80%; 
          max-width: 50px; 
          border-radius: 8px 8px 0 0; 
          position: relative; 
          transition: height 0.6s ease; 
          min-height: 30px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .trend-value { 
          position: absolute; 
          top: -22px; 
          left: 50%; 
          transform: translateX(-50%); 
          font-size: 0.7rem; 
          font-weight: 700; 
          color: #475569; 
          white-space: nowrap; 
        }

        .table-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .table-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .table-wrapper { 
          overflow-x: auto; 
          margin: 0 -4px;
        }
        .reports-table { 
          width: 100%; 
          border-collapse: collapse; 
          min-width: 800px; 
        }
        .reports-table th, .reports-table td { 
          padding: 12px 14px; 
          text-align: left; 
          border-bottom: 1px solid #f1f5f9; 
        }
        .reports-table th { 
          color: #64748b; 
          font-weight: 600; 
          font-size: 0.7rem; 
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .reports-table td { 
          color: #334155; 
          font-size: 0.8rem; 
        }

        .user-name { 
          font-weight: 600; 
          color: #0f172a; 
        }
        .user-email { 
          color: #64748b; 
        }
        .complaint-count { 
          font-weight: 700; 
          color: #dc2626; 
        }
        .resolved-count { 
          font-weight: 700; 
          color: #059669; 
        }

        .status-badge { 
          display: inline-block; 
          padding: 4px 14px; 
          border-radius: 20px; 
          font-size: 0.7rem; 
          font-weight: 600; 
        }
        .status-active { background: #d1fae5; color: #059669; }
        .status-inactive { background: #fef3c7; color: #d97706; }
        .status-suspended { background: #fee2e2; color: #dc2626; }

        .satisfaction-star { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-weight: 600;
        }

        .no-data { 
          text-align: center; 
          padding: 50px !important; 
        }
        .no-data-content { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 10px; 
        }
        .no-data-icon { 
          font-size: 2.5rem; 
        }

        @media (max-width: 1200px) {
          .summary-cards { grid-template-columns: repeat(3, 1fr); }
          .charts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .admin-reports-users {
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
          
          .content-wrapper { 
            padding: 16px; 
          }
          .page-header { 
            flex-direction: column; 
            align-items: flex-start; 
          }
          .filters-section { 
            flex-direction: column; 
            padding: 20px;
          }
          .filter-group { 
            width: 100%; 
          }
          .date-range { 
            flex-direction: row; 
          }
          .summary-cards { 
            grid-template-columns: repeat(2, 1fr); 
          }
          .trend-chart { 
            height: auto; 
            flex-direction: column; 
            gap: 12px;
          }
          .trend-bar-item { 
            flex-direction: row; 
            width: 100%; 
            justify-content: space-between; 
            height: auto;
          }
          .trend-bar-bg { 
            width: 60%; 
            min-height: 30px;
          }
          .trend-bar-fill { 
            height: 30px !important; 
            border-radius: 8px; 
            max-width: 100%;
            min-height: 30px;
          }
          .trend-value { 
            top: 50%; 
            left: 12px; 
            transform: translateY(-50%); 
          }
          .action-buttons-header { 
            width: 100%; 
          }
          .growth-card { 
            flex-direction: row; 
            flex-wrap: wrap;
          }
          .reports-table { 
            min-width: 600px; 
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
          .summary-cards { 
            grid-template-columns: 1fr; 
          }
          .reports-table th, .reports-table td { 
            padding: 8px 10px; 
            font-size: 0.7rem; 
          }
          .export-btn {
            padding: 8px 14px;
            font-size: 0.75rem;
          }
          .page-header h1 {
            font-size: 1.3rem;
          }
          .filters-section {
            padding: 16px;
          }
        }

        @media print {
          .sidebar-container, .action-buttons-header, .generate-btn, .export-btn, .toast-notification {
            display: none !important;
          }
          .main-container {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .summary-card, .chart-card, .trend-card, .table-card {
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReportsUsers;