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
  const [isLoading, setIsLoading] = useState(false);

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
      satisfactionRate: 0,
      adminCount: 0,
      staffCount: 0,
      userCount: 0
    },
    roleBreakdown: [],
    statusBreakdown: [],
    monthlyTrend: [],
    activityBreakdown: [],
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

  // Helper function to get date range parameters
  const getDateRangeParams = () => {
    const params = {};
    const now = new Date();
    
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      params.startDate = new Date(customStartDate).toISOString();
      params.endDate = new Date(customEndDate).toISOString();
    } else if (dateRange !== 'custom') {
      let startDate = new Date();
      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (dateRange === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (dateRange === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      params.startDate = startDate.toISOString();
      params.endDate = now.toISOString();
    }
    
    return params;
  };

  // Helper function to get date range display text
  const getDateRangeDisplay = () => {
    const now = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    
    if (dateRange === 'custom') {
      if (customStartDate && customEndDate) {
        return `${new Date(customStartDate).toLocaleDateString('en-US', options)} — ${new Date(customEndDate).toLocaleDateString('en-US', options)}`;
      }
      return 'Select dates';
    }
    
    if (dateRange === 'today') {
      return now.toLocaleDateString('en-US', options);
    }
    
    if (dateRange === 'week') {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      return `${startDate.toLocaleDateString('en-US', options)} — ${now.toLocaleDateString('en-US', options)}`;
    }
    
    if (dateRange === 'month') {
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      return `${startDate.toLocaleDateString('en-US', options)} — ${now.toLocaleDateString('en-US', options)}`;
    }
    
    if (dateRange === 'quarter') {
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      return `${startDate.toLocaleDateString('en-US', options)} — ${now.toLocaleDateString('en-US', options)}`;
    }
    
    if (dateRange === 'year') {
      const startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      return `${startDate.toLocaleDateString('en-US', options)} — ${now.toLocaleDateString('en-US', options)}`;
    }
    
    return 'All time';
  };

  // Filter users by date range
  const filterUsersByDateRange = (users, dateParams) => {
    if (!dateParams.startDate && !dateParams.endDate) return users;
    
    return users.filter(user => {
      const createdAt = new Date(user.createdAt || user.created_at || user.createdAt);
      if (isNaN(createdAt.getTime())) return true;
      
      if (dateParams.startDate) {
        const startDate = new Date(dateParams.startDate);
        if (createdAt < startDate) return false;
      }
      if (dateParams.endDate) {
        const endDate = new Date(dateParams.endDate);
        if (createdAt > endDate) return false;
      }
      return true;
    });
  };

  // Filter complaints by date range
  const filterComplaintsByDateRange = (complaints, dateParams) => {
    if (!dateParams.startDate && !dateParams.endDate) return complaints;
    
    return complaints.filter(complaint => {
      const createdAt = new Date(complaint.createdAt || complaint.created_at || complaint.createdAt);
      if (isNaN(createdAt.getTime())) return true;
      
      if (dateParams.startDate) {
        const startDate = new Date(dateParams.startDate);
        if (createdAt < startDate) return false;
      }
      if (dateParams.endDate) {
        const endDate = new Date(dateParams.endDate);
        if (createdAt > endDate) return false;
      }
      return true;
    });
  };

  // Fetch all users from database (fallback method if reports endpoint not available)
  const fetchAllUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.get(`${API_URL}/admin/users`, { headers });
      if (response.data.success) {
        return response.data.data || [];
      }
      return null;
    } catch (error) {
      console.error('Error fetching users:', error);
      return null;
    }
  };

  // Fetch all complaints from database (fallback method)
  const fetchAllComplaints = async () => {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.get(`${API_URL}/admin/complaints`, { 
        headers,
        params: { limit: 10000 }
      });
      
      if (response.data.success) {
        return response.data.data || [];
      }
      return null;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return null;
    }
  };

  // Get role text based on language
  const getRoleText = (role) => {
    const roleMap = {
      np: { user: 'प्रयोगकर्ता', staff: 'कर्मचारी', admin: 'प्रशासक' },
      en: { user: 'User', staff: 'Staff', admin: 'Admin' }
    };
    return roleMap[language][role] || role || 'N/A';
  };

  // Get status text based on language
  const getStatusText = (status) => {
    const statusMap = {
      np: { active: 'सक्रिय', inactive: 'निष्क्रिय', suspended: 'निलम्बित' },
      en: { active: 'Active', inactive: 'Inactive', suspended: 'Suspended' }
    };
    return statusMap[language][status] || status || 'N/A';
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    const classes = {
      active: 'status-active',
      inactive: 'status-inactive',
      suspended: 'status-suspended'
    };
    return classes[status] || 'status-inactive';
  };

  // Get role class for styling
  const getRoleClass = (role) => {
    const classes = {
      admin: 'role-admin',
      staff: 'role-staff',
      user: 'role-user'
    };
    return classes[role] || 'role-user';
  };

  // Calculate role breakdown
  const calculateRoleBreakdown = (users) => {
    const roles = {};
    users.forEach(user => {
      const role = user.role || 'user';
      roles[role] = (roles[role] || 0) + 1;
    });
    const total = users.length || 1;
    return Object.entries(roles).map(([role, count]) => ({
      role,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1))
    }));
  };

  // Calculate status breakdown
  const calculateStatusBreakdown = (users) => {
    const statuses = {};
    users.forEach(user => {
      const status = user.status || 'inactive';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    const total = users.length || 1;
    return Object.entries(statuses).map(([status, count]) => ({
      status,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1))
    }));
  };

  // Calculate activity breakdown based on complaints
  const calculateActivityBreakdown = (usersData, complaintsData) => {
    const complaintCounts = {};
    
    complaintsData.forEach(complaint => {
      let userId = complaint.userId || complaint.user_id || complaint.user;
      
      if (userId && typeof userId === 'object') {
        userId = userId._id || userId.id || String(userId);
      }
      
      if (!userId || typeof userId === 'object') {
        if (complaint.user && typeof complaint.user === 'object') {
          userId = complaint.user._id || complaint.user.id || complaint.user.userId;
        }
        if (!userId && complaint.userId && typeof complaint.userId === 'object') {
          userId = complaint.userId._id || complaint.userId.id;
        }
      }
      
      if (userId) {
        const userIdStr = String(userId);
        complaintCounts[userIdStr] = (complaintCounts[userIdStr] || 0) + 1;
      }
    });

    let highlyActive = 0;
    let moderatelyActive = 0;
    let lowActivity = 0;
    let usersWithoutComplaints = 0;
    
    usersData.forEach(user => {
      const userId = user.id || user._id || String(user._id);
      const userIdStr = String(userId);
      const userComplaints = complaintCounts[userIdStr] || 0;
      
      if (userComplaints > 0) {
        if (userComplaints > 10) {
          highlyActive++;
        } else if (userComplaints > 3) {
          moderatelyActive++;
        } else {
          lowActivity++;
        }
      } else {
        usersWithoutComplaints++;
      }
    });
    
    const total = usersData.length || 1;
    
    return [
      { 
        name: 'उच्च सक्रिय', 
        enName: 'Highly Active', 
        count: highlyActive, 
        percentage: parseFloat(((highlyActive / total) * 100).toFixed(1)),
        description: '10+ complaints'
      },
      { 
        name: 'मध्यम सक्रिय', 
        enName: 'Moderately Active', 
        count: moderatelyActive, 
        percentage: parseFloat(((moderatelyActive / total) * 100).toFixed(1)),
        description: '4-9 complaints'
      },
      { 
        name: 'कम सक्रिय', 
        enName: 'Low Activity', 
        count: lowActivity, 
        percentage: parseFloat(((lowActivity / total) * 100).toFixed(1)),
        description: '1-3 complaints'
      },
      { 
        name: 'गुनासो नगरेका', 
        enName: 'No Complaints', 
        count: usersWithoutComplaints, 
        percentage: parseFloat(((usersWithoutComplaints / total) * 100).toFixed(1)),
        description: '0 complaints'
      }
    ];
  };

  // Calculate monthly trend based on date range
  const calculateMonthlyTrend = (usersData) => {
    const months = [];
    const monthNames = {
      np: ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    
    const dateParams = getDateRangeParams();
    let startDate = null;
    let endDate = null;
    
    if (dateParams.startDate) {
      startDate = new Date(dateParams.startDate);
    }
    if (dateParams.endDate) {
      endDate = new Date(dateParams.endDate);
    }
    
    let startYear = new Date().getFullYear();
    let endYear = new Date().getFullYear();
    let startMonth = 0;
    let endMonth = 11;
    
    if (startDate) {
      startYear = startDate.getFullYear();
      startMonth = startDate.getMonth();
    }
    if (endDate) {
      endYear = endDate.getFullYear();
      endMonth = endDate.getMonth();
    }
    
    if (startYear === endYear) {
      for (let month = startMonth; month <= endMonth; month++) {
        const monthCount = usersData.filter(user => {
          const createdDate = new Date(user.createdAt || user.created_at || user.createdAt);
          return createdDate.getMonth() === month && createdDate.getFullYear() === startYear;
        }).length;
        
        months.push({
          month: monthNames.np[month],
          enMonth: monthNames.en[month],
          count: monthCount
        });
      }
    } else {
      for (let year = startYear; year <= endYear; year++) {
        const monthStart = (year === startYear) ? startMonth : 0;
        const monthEnd = (year === endYear) ? endMonth : 11;
        
        for (let month = monthStart; month <= monthEnd; month++) {
          const monthCount = usersData.filter(user => {
            const createdDate = new Date(user.createdAt || user.created_at || user.createdAt);
            return createdDate.getMonth() === month && createdDate.getFullYear() === year;
          }).length;
          
          months.push({
            month: monthNames.np[month],
            enMonth: monthNames.en[month],
            count: monthCount
          });
        }
      }
    }
    
    if (months.length === 0) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 6; i++) {
        const month = (currentMonth - i + 12) % 12;
        const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
        const monthCount = usersData.filter(user => {
          const createdDate = new Date(user.createdAt || user.created_at || user.createdAt);
          return createdDate.getMonth() === month && createdDate.getFullYear() === year;
        }).length;
        
        months.unshift({
          month: monthNames.np[month],
          enMonth: monthNames.en[month],
          count: monthCount
        });
      }
    }
    
    return months;
  };

  // Calculate registration method
  const calculateRegistrationMethod = (usersData) => {
    const methods = {
      website: { count: 0, name: 'वेबसाइट', enName: 'Website' },
      mobile: { count: 0, name: 'मोबाइल एप', enName: 'Mobile App' },
      staff: { count: 0, name: 'कर्मचारी', enName: 'Staff' },
      google: { count: 0, name: 'गुगल', enName: 'Google' }
    };
    
    usersData.forEach(user => {
      const method = user.registrationMethod || user.registration_method || user.registrationSource || 'website';
      if (methods[method]) {
        methods[method].count++;
      } else {
        methods.website.count++;
      }
    });
    
    const total = usersData.length || 1;
    return Object.values(methods).map(method => ({
      name: method.name,
      enName: method.enName,
      count: method.count,
      percentage: parseFloat(((method.count / total) * 100).toFixed(1))
    })).filter(m => m.count > 0);
  };

  // Process report data
  const processReportData = (usersData, complaintsData) => {
    const users = usersData.users || usersData || [];
    const summary = usersData.summary || {};
    const roleBreakdown = usersData.roleBreakdown || [];
    const statusBreakdown = usersData.statusBreakdown || [];
    const complaints = complaintsData.complaints || complaintsData || [];
    const complaintSummary = complaintsData.summary || {};

    // Apply date range filter
    const dateParams = getDateRangeParams();
    const filteredUsers = filterUsersByDateRange(users, dateParams);
    const filteredComplaints = filterComplaintsByDateRange(complaints, dateParams);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Calculate new users based on filtered users
    const newUsersThisMonth = filteredUsers.filter(user => {
      const createdAt = new Date(user.createdAt || user.created_at || user.createdAt);
      return createdAt >= thisMonthStart && createdAt <= now;
    }).length;

    const newUsersLastMonth = filteredUsers.filter(user => {
      const createdAt = new Date(user.createdAt || user.created_at || user.createdAt);
      return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
    }).length;

    const growth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : newUsersThisMonth > 0 ? 100 : 0;

    const activityBreakdown = calculateActivityBreakdown(filteredUsers, filteredComplaints);
    const monthlyTrend = calculateMonthlyTrend(filteredUsers);
    const registrationMethod = calculateRegistrationMethod(filteredUsers);
    const allRoleBreakdown = calculateRoleBreakdown(filteredUsers);
    const allStatusBreakdown = calculateStatusBreakdown(filteredUsers);

    // Calculate role counts for stats
    const adminCount = filteredUsers.filter(u => u.role === 'admin').length;
    const staffCount = filteredUsers.filter(u => u.role === 'staff').length;
    const userCount = filteredUsers.filter(u => u.role === 'user').length;

    return {
      summary: {
        totalUsers: filteredUsers.length || 0,
        activeUsers: filteredUsers.filter(u => u.status === 'active').length || 0,
        inactiveUsers: filteredUsers.filter(u => u.status === 'inactive').length || 0,
        suspendedUsers: filteredUsers.filter(u => u.status === 'suspended').length || 0,
        newUsersThisMonth: newUsersThisMonth,
        newUsersLastMonth: newUsersLastMonth,
        growth: parseFloat(growth.toFixed(1)),
        totalComplaints: filteredComplaints.length || 0,
        avgComplaintsPerUser: filteredUsers.length > 0 ? (filteredComplaints.length || 0) / filteredUsers.length : 0,
        satisfactionRate: filteredComplaints.length > 0 
          ? parseFloat(((filteredComplaints.filter(c => c.status === 'resolved' || c.status === 'Resolved' || c.status === 'completed' || c.status === 'Completed').length / filteredComplaints.length) * 100).toFixed(1))
          : 0,
        adminCount: adminCount,
        staffCount: staffCount,
        userCount: userCount
      },
      roleBreakdown: roleBreakdown.length > 0 ? roleBreakdown : allRoleBreakdown,
      statusBreakdown: statusBreakdown.length > 0 ? statusBreakdown : allStatusBreakdown,
      monthlyTrend,
      activityBreakdown,
      registrationMethod
    };
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
        satisfactionRate: 72.5,
        adminCount: 15,
        staffCount: 85,
        userCount: 1150
      },
      roleBreakdown: [
        { role: 'user', count: 1150, percentage: 92.0 },
        { role: 'staff', count: 85, percentage: 6.8 },
        { role: 'admin', count: 15, percentage: 1.2 }
      ],
      statusBreakdown: [
        { status: 'active', count: 980, percentage: 78.4 },
        { status: 'inactive', count: 200, percentage: 16.0 },
        { status: 'suspended', count: 70, percentage: 5.6 }
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
        { name: 'उच्च सक्रिय', enName: 'Highly Active', count: 45, percentage: 3.6, description: '10+ complaints' },
        { name: 'मध्यम सक्रिय', enName: 'Moderately Active', count: 234, percentage: 18.7, description: '4-9 complaints' },
        { name: 'कम सक्रिय', enName: 'Low Activity', count: 200, percentage: 16.0, description: '1-3 complaints' },
        { name: 'गुनासो नगरेका', enName: 'No Complaints', count: 771, percentage: 61.7, description: '0 complaints' }
      ],
      registrationMethod: [
        { name: 'वेबसाइट', enName: 'Website', count: 680, percentage: 54.4 },
        { name: 'मोबाइल एप', enName: 'Mobile App', count: 520, percentage: 41.6 },
        { name: 'कर्मचारी', enName: 'Staff', count: 50, percentage: 4.0 }
      ]
    };
  };

  // Fetch users and complaints from database
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setBackendStatus('disconnected');
        setReportData(getSampleReportData());
        setIsLoading(false);
        showToast(
          language === 'np' ? 'कृपया लगइन गर्नुहोस्' : 'Please login',
          'warning'
        );
        return;
      }

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const params = new URLSearchParams();
      
      if (selectedRole !== 'all') {
        params.append('role', selectedRole);
      }
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      const dateParams = getDateRangeParams();
      if (dateParams.startDate) {
        params.append('startDate', dateParams.startDate);
      }
      if (dateParams.endDate) {
        params.append('endDate', dateParams.endDate);
      }

      let allUsers = [];
      let allComplaints = [];

      // Try to fetch from reports endpoints first
      try {
        const usersResponse = await axios.get(`${API_URL}/admin/reports/users`, {
          headers,
          params: Object.fromEntries(params)
        });
        if (usersResponse.data && usersResponse.data.success) {
          const usersData = usersResponse.data.data;
          allUsers = usersData.users || usersData || [];
        }
      } catch (error) {
        console.log('Users reports endpoint not found, trying fallback...');
      }

      try {
        const complaintsParams = new URLSearchParams();
        if (selectedStatus !== 'all') {
          complaintsParams.append('status', selectedStatus);
        }
        if (dateParams.startDate) {
          complaintsParams.append('startDate', dateParams.startDate);
        }
        if (dateParams.endDate) {
          complaintsParams.append('endDate', dateParams.endDate);
        }
        complaintsParams.append('limit', '10000');

        const complaintsResponse = await axios.get(`${API_URL}/admin/reports/complaints`, {
          headers,
          params: Object.fromEntries(complaintsParams)
        });
        if (complaintsResponse.data && complaintsResponse.data.success) {
          const complaintsData = complaintsResponse.data.data;
          allComplaints = complaintsData.complaints || complaintsData || [];
        }
      } catch (error) {
        console.log('Complaints reports endpoint not found, trying fallback...');
      }

      // If reports endpoints didn't work, try fallback
      if (allUsers.length === 0) {
        const usersResponse = await fetchAllUsers();
        if (usersResponse) {
          allUsers = usersResponse;
          
          if (selectedRole !== 'all') {
            allUsers = allUsers.filter(user => user.role === selectedRole);
          }
          if (selectedStatus !== 'all') {
            allUsers = allUsers.filter(user => user.status === selectedStatus);
          }
        }
      }

      if (allComplaints.length === 0) {
        const complaintsResponse = await fetchAllComplaints();
        if (complaintsResponse) {
          allComplaints = complaintsResponse;
        }
      }

      console.log('Users fetched:', allUsers.length);
      console.log('Complaints fetched:', allComplaints.length);

      if (allUsers.length > 0 || allComplaints.length > 0) {
        const processedData = processReportData(
          { users: allUsers }, 
          { complaints: allComplaints }
        );
        setReportData(processedData);
        setBackendStatus('connected');
        showToast(
          language === 'np' 
            ? `रिपोर्ट सफलतापूर्वक उत्पन्न गरियो (${processedData.summary.totalUsers} प्रयोगकर्ता, ${processedData.summary.totalComplaints} गुनासो)` 
            : `Report generated successfully (${processedData.summary.totalUsers} users, ${processedData.summary.totalComplaints} complaints)`,
          'success'
        );
      } else {
        setReportData(getSampleReportData());
        setBackendStatus('disconnected');
        showToast(
          language === 'np' ? 'डाटा ल्याउन असफल। नमूना डाटा देखाउँदै।' : 'Failed to fetch data. Showing sample data.',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('token');
          localStorage.removeItem('adminUser');
          navigate('/admin-login');
          showToast(
            language === 'np' ? 'सत्र समाप्त भयो। कृपया पुन: लगइन गर्नुहोस्।' : 'Session expired. Please login again.',
            'error'
          );
        } else {
          showToast(
            language === 'np' ? `सर्भर त्रुटि: ${error.response.status}` : `Server error: ${error.response.status}`,
            'error'
          );
          setReportData(getSampleReportData());
          setBackendStatus('disconnected');
        }
      } else {
        setReportData(getSampleReportData());
        setBackendStatus('disconnected');
        showToast(
          language === 'np' ? 'ब्याकेन्ड सर्भरमा जडान गर्न सकिएन। नमूना डाटा देखाउँदै।' : 'Cannot connect to backend server. Showing sample data.',
          'warning'
        );
      }
    } finally {
      setIsLoading(false);
    }
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
  }, []);

  // Re-fetch when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const token = getAuthToken();
      if (token) {
        fetchData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedStatus, selectedRole, dateRange, customStartDate, customEndDate]);

  // ===== EXPORT FUNCTIONS =====

  // Generate Excel export data
  const generateExcelData = () => {
    const isNepali = language === 'np';
    const data = [];
    
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
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'सन्तुष्टि दर' : 'Satisfaction Rate',
      [isNepali ? 'मान' : 'Value']: `${reportData.summary.satisfactionRate}%`
    });
    
    return data;
  };

  // Export to Excel
  const handleExportExcel = () => {
    setIsExporting(true);
    showToast(
      language === 'np' ? 'एक्सेल निर्यात भइरहेको छ...' : 'Exporting Excel...',
      'info'
    );
    
    setTimeout(() => {
      try {
        const wb = XLSX.utils.book_new();
        const isNepali = language === 'np';
        
        const summaryData = generateExcelData();
        const ws1 = XLSX.utils.json_to_sheet(summaryData);
        const colWidths = Object.keys(summaryData[0] || {}).map(key => ({
          wch: Math.max(key.length, 30)
        }));
        ws1['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws1, isNepali ? 'सारांश' : 'Summary');
        
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const filename = `users_report_${dateStr}.xlsx`;
        
        XLSX.writeFile(wb, filename);
        
        setTimeout(() => {
          showToast(
            language === 'np' ? '✅ एक्सेल फाइल सफलतापूर्वक डाउनलोड भयो' : '✅ Excel file downloaded successfully',
            'success'
          );
          setIsExporting(false);
        }, 1000);
        
      } catch (error) {
        console.error('Excel export error:', error);
        showToast(
          language === 'np' ? '❌ एक्सेल निर्यात गर्न असफल' : '❌ Failed to export Excel',
          'error'
        );
        setIsExporting(false);
      }
    }, 500);
  };

  // ===== PDF EXPORT =====
  const handleExportPDF = () => {
    if (isExporting) return;
    
    setIsExporting(true);
    showToast(
      language === 'np' ? 'पीडीएफ निर्यात भइरहेको छ...' : 'Exporting PDF...',
      'info'
    );
    
    try {
      const now = new Date();
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setFillColor(13, 71, 161);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Users Report', pageWidth / 2, 18, { align: 'center' });
      
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
      
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Overview', 14, yPosition);
      yPosition += 8;
      
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
      
      // Role Breakdown
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Role Breakdown', 14, yPosition);
      yPosition += 6;
      
      const roleHeaders = ['Role', 'Count', 'Percentage'];
      const roleRows = reportData.roleBreakdown.map(item => [
        getRoleText(item.role),
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
      
      // Status Breakdown
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Status Breakdown', 14, yPosition);
      yPosition += 6;
      
      const statusHeaders = ['Status', 'Count', 'Percentage'];
      const statusRows = reportData.statusBreakdown.map(item => [
        getStatusText(item.status),
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
      
      // Activity Breakdown
      doc.setTextColor(13, 71, 161);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Activity Breakdown', 14, yPosition);
      yPosition += 6;
      
      const activityHeaders = ['Activity', 'Count', 'Percentage', 'Description'];
      const activityRows = reportData.activityBreakdown.map(item => [
        item.enName,
        String(item.count),
        `${item.percentage}%`,
        item.description || ''
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
      
      // Registration Method
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
      
      // Monthly Trend
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
      
      // FOOTER
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
      
      const filename = `users_report_${now.toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      showToast(
        language === 'np' ? '✅ पीडीएफ फाइल सफलतापूर्वक डाउनलोड भयो' : '✅ PDF file downloaded successfully',
        'success'
      );
      setIsExporting(false);
      
    } catch (error) {
      console.error('PDF export error:', error);
      
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
        
        showToast(
          language === 'np' ? '✅ पीडीएफ फाइल सफलतापूर्वक डाउनलोड भयो' : '✅ PDF file downloaded successfully',
          'success'
        );
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
      noComplaints: 'गुनासो नगरेका',
      website: 'वेबसाइट',
      mobileApp: 'मोबाइल एप',
      backendNotConnected: 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।',
      department: 'विभाग',
      exportStarted: 'निर्यात सुरु भयो...',
      pdfExport: 'पीडीएफ निर्यात भइरहेको छ...',
      excelExport: 'एक्सेल निर्यात भइरहेको छ...',
      exporting: 'निर्यात हुँदै...',
      days: 'दिन',
      generating: 'रिपोर्ट उत्पन्न हुँदै...',
      dateRangeDisplay: 'मिति दायरा:',
      usersCount: 'प्रयोगकर्ताहरू',
      registeredDate: 'दर्ता मिति'
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
      noComplaints: 'No Complaints',
      website: 'Website',
      mobileApp: 'Mobile App',
      backendNotConnected: 'Backend server not connected. Showing sample data.',
      department: 'Department',
      exportStarted: 'Export started...',
      pdfExport: 'Exporting PDF...',
      excelExport: 'Exporting Excel...',
      exporting: 'Exporting...',
      days: 'days',
      generating: 'Generating report...',
      dateRangeDisplay: 'Date Range:',
      usersCount: 'users',
      registeredDate: 'Registered Date'
    }
  };

  const t = content[language];
  const currentData = reportData;
  const maxTrendCount = Math.max(...currentData.monthlyTrend.map(m => m.count), 1);

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
                  disabled={isExporting || isLoading}
                >
                  📄 {isExporting ? t.exporting : t.exportPDF}
                </button>
                <button 
                  className="export-btn excel" 
                  onClick={handleExportExcel} 
                  disabled={isExporting || isLoading}
                >
                  📊 {isExporting ? t.exporting : t.exportExcel}
                </button>
                <button className="export-btn print" onClick={handlePrint}>
                  🖨️ {t.print}
                </button>
              </div>
            </div>

            {/* Date Range Display */}
            <div className="date-range-display">
              <span className="range-label">📅 {t.dateRangeDisplay}</span>
              <span className="range-value">{getDateRangeDisplay()}</span>
              <span className="user-count">
                👥 {formatNumber(reportData.summary.totalUsers)} {t.usersCount}
              </span>
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

              <button className="generate-btn" onClick={handleGenerateReport} disabled={isLoading}>
                {isLoading ? '⏳ ' + t.generating : '🔄 ' + t.generateReport}
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

            {/* Role Distribution Cards - Similar to AdminUsers.js */}
            <div className="stats-row-small">
              <div className="stat-card-small">
                <span className="stat-icon-small">👑</span>
                <div className="stat-info-small">
                  <div className="stat-value-small">{formatNumber(currentData.summary.adminCount || 0)}</div>
                  <div className="stat-label-small">{getRoleText('admin')}</div>
                </div>
              </div>
              <div className="stat-card-small">
                <span className="stat-icon-small">👔</span>
                <div className="stat-info-small">
                  <div className="stat-value-small">{formatNumber(currentData.summary.staffCount || 0)}</div>
                  <div className="stat-label-small">{getRoleText('staff')}</div>
                </div>
              </div>
           
             
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Role Breakdown */}
              <div className="chart-card">
                <h3>{t.roleBreakdown}</h3>
                <div className="chart-content">
                  {currentData.roleBreakdown.length > 0 ? (
                    currentData.roleBreakdown.map((item, idx) => (
                      <div key={idx} className="chart-bar-item">
                        <div className="chart-label">
                          <span>{getRoleText(item.role)}</span>
                          <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                        </div>
                        <div className="chart-bar-bg">
                          <div 
                            className="chart-bar-fill" 
                            style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${200 + idx * 120}, 70%, 55%)` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-content">
                      <span className="no-data-icon">📭</span>
                      <p>{t.noDataFound}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="chart-card">
                <h3>{t.statusBreakdown}</h3>
                <div className="chart-content">
                  {currentData.statusBreakdown.length > 0 ? (
                    currentData.statusBreakdown.map((item, idx) => (
                      <div key={idx} className="chart-bar-item">
                        <div className="chart-label">
                          <span>{getStatusText(item.status)}</span>
                          <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                        </div>
                        <div className="chart-bar-bg">
                          <div 
                            className="chart-bar-fill" 
                            style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${120 + idx * 90}, 70%, 55%)` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-content">
                      <span className="no-data-icon">📭</span>
                      <p>{t.noDataFound}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Breakdown */}
              <div className="chart-card">
                <h3>{t.activityBreakdown}</h3>
                <div className="chart-content">
                  {currentData.activityBreakdown.map((item, idx) => {
                    const colors = [
                      { bg: 'hsl(280, 70%, 55%)' },
                      { bg: 'hsl(210, 70%, 55%)' },
                      { bg: 'hsl(150, 70%, 55%)' },
                      { bg: 'hsl(30, 70%, 55%)' }
                    ];
                    return (
                      <div key={idx} className="chart-bar-item">
                        <div className="chart-label">
                          <span>
                            {language === 'np' ? item.name : item.enName}
                            {item.description && (
                              <span className="chart-desc"> ({item.description})</span>
                            )}
                          </span>
                          <span>{formatNumber(item.count)} ({formatNumber(item.percentage)}%)</span>
                        </div>
                        <div className="chart-bar-bg">
                          <div 
                            className="chart-bar-fill" 
                            style={{ 
                              width: `${item.percentage}%`, 
                              backgroundColor: colors[idx % colors.length].bg 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
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
          </div>
        </div>
      </div>

      <style>{`
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
          margin-bottom: 16px;
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

        .date-range-display {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 20px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          border: 1px solid #e2e8f0;
        }

        .date-range-display .range-label {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.85rem;
        }

        .date-range-display .range-value {
          color: #3b82f6;
          font-weight: 500;
          font-size: 0.85rem;
        }

        .date-range-display .user-count {
          margin-left: auto;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 500;
        }

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

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59,130,246,0.35);
        }

        .generate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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

        .stats-row-small {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-card-small {
          background: white;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
        }

        .stat-icon-small {
          font-size: 1.5rem;
        }

        .stat-info-small {
          flex: 1;
        }

        .stat-value-small {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-label-small {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 2px;
        }

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
        .chart-desc {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 400;
          margin-left: 4px;
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

        @media (max-width: 1200px) {
          .summary-cards { grid-template-columns: repeat(3, 1fr); }
          .charts-grid { grid-template-columns: 1fr; }
          .stats-row-small { grid-template-columns: repeat(3, 1fr); }
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
          .stats-row-small { 
            grid-template-columns: 1fr; 
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
          .toast-notification {
            top: auto;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
            min-width: auto;
          }
          .date-range-display {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .date-range-display .user-count {
            margin-left: 0;
          }
        }

        @media (max-width: 480px) {
          .summary-cards { 
            grid-template-columns: 1fr; 
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
          .summary-card, .chart-card, .trend-card {
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