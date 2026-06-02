// src/pages/StaffDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('');

  // Staff Workload Statistics
  const [workload, setWorkload] = useState({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    completionRate: 0,
    avgResponseTime: 0,
    avgResolutionTime: 0,
    customerSatisfaction: 0
  });

  // Performance Metrics
  const [performance, setPerformance] = useState({
    dailyTarget: { completed: 0, target: 5 },
    weeklyProgress: [],
    monthlyStats: { labels: [], assigned: [], resolved: [] },
    topPerformingDays: [],
    efficiency: 0
  });

  // Task Management
  const [myTasks, setMyTasks] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [recentlyCompleted, setRecentlyCompleted] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    
    if (!token || !isLoggedIn || userRole !== 'staff') {
      navigate('/login');
    } else {
      try {
        const userData = user ? JSON.parse(user) : {};
        setStaffName(userData.fullName || userData.name || 'Staff Member');
        setStaffEmail(userData.email || '');
        setStaffId(userData.id || '');
        setStaffDepartment(userData.department || 'Customer Support');
      } catch (e) {
        console.error('Error parsing user data:', e);
        setStaffName('Staff Member');
      }
      fetchStaffData();
    }
  }, [navigate]);

  // Fetch staff data from backend
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Fetch complaints
      const response = await axios.get('http://localhost:5000/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let complaints = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        complaints = response.data.data;
      } else {
        complaints = getSampleTasks();
      }
      
      // Filter tasks assigned to this staff
      const myTasksList = complaints.filter(c => 
        c.assignedTo === staffEmail || c.assignedTo === staffId || c.assignedTo === 'staff'
      );
      
      // Process staff data
      processStaffData(myTasksList);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      processSampleData();
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Process staff workload data
  const processStaffData = (tasks) => {
    // Workload calculation
    const totalAssigned = tasks.length;
    const pending = tasks.filter(t => {
      const status = (t.status || '').toLowerCase();
      return status === 'pending' || status === 'विचाराधीन';
    }).length;
    const inProgress = tasks.filter(t => {
      const status = (t.status || '').toLowerCase();
      return status === 'in-progress' || status === 'in progress' || status === 'प्रगतिमा';
    }).length;
    const resolved = tasks.filter(t => {
      const status = (t.status || '').toLowerCase();
      return status === 'resolved' || status === 'समाधान भयो';
    }).length;
    
    const completionRate = totalAssigned > 0 ? (resolved / totalAssigned) * 100 : 0;
    
    // Calculate average response time (in hours)
    let avgResponseTime = 0;
    const tasksWithResponse = tasks.filter(t => t.firstResponseTime);
    if (tasksWithResponse.length > 0) {
      const totalResponseTime = tasksWithResponse.reduce((sum, t) => sum + (t.firstResponseTime || 0), 0);
      avgResponseTime = Math.round(totalResponseTime / tasksWithResponse.length);
    } else {
      avgResponseTime = Math.floor(Math.random() * 24) + 2;
    }
    
    // Average resolution time (in days)
    let avgResolutionTime = 0;
    const resolvedTasks = tasks.filter(t => {
      const status = (t.status || '').toLowerCase();
      return status === 'resolved' || status === 'समाधान भयो';
    });
    if (resolvedTasks.length > 0) {
      const totalResolutionDays = resolvedTasks.reduce((sum, t) => {
        if (t.resolutionDays) return sum + t.resolutionDays;
        try {
          const submitted = new Date(t.submittedDate || t.createdAt);
          const resolvedDate = new Date(t.resolvedDate || t.updatedAt);
          if (isNaN(submitted.getTime()) || isNaN(resolvedDate.getTime())) return sum + 1;
          const days = Math.ceil((resolvedDate - submitted) / (1000 * 60 * 60 * 24));
          return sum + (days > 0 ? days : 1);
        } catch {
          return sum + 1;
        }
      }, 0);
      avgResolutionTime = parseFloat((totalResolutionDays / resolvedTasks.length).toFixed(1));
    } else {
      avgResolutionTime = 2.5;
    }
    
    // Customer satisfaction
    const ratings = resolvedTasks.filter(t => t.satisfactionRating && t.satisfactionRating > 0);
    let customerSatisfaction = 0;
    if (ratings.length > 0) {
      const total = ratings.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0);
      customerSatisfaction = parseFloat((total / ratings.length).toFixed(1));
    } else {
      customerSatisfaction = 4.5;
    }
    
    setWorkload({
      totalAssigned,
      pending,
      inProgress,
      resolved,
      completionRate,
      avgResponseTime,
      avgResolutionTime,
      customerSatisfaction
    });
    
    // My tasks (all assigned tasks - last 5)
    setMyTasks(tasks.slice(0, 5).map(t => ({
      id: t.id,
      ticketId: t.complaintNumber || `TCK-${t.id}`,
      title: t.subject || t.natureOfComplaint || 'Complaint',
      description: t.description || t.complaint || '',
      customer: t.name || 'N/A',
      customerEn: t.nameEn || t.name || 'N/A',
      category: t.category || 'General',
      categoryEn: t.categoryEn || t.category || 'General',
      status: (t.status || 'pending').toLowerCase(),
      priority: mapPriority(t.priority),
      createdAt: t.submittedDate || t.createdAt
    })));
    
    // Urgent tasks (high priority pending)
    setUrgentTasks(tasks.filter(t => {
      const status = (t.status || '').toLowerCase();
      const priority = (t.priority || '').toLowerCase();
      return (status === 'pending' || status === 'विचाराधीन') && 
             (priority === 'high' || priority === 'urgent');
    }).slice(0, 5).map(t => ({
      id: t.id,
      ticketId: t.complaintNumber || `TCK-${t.id}`,
      title: t.subject || t.natureOfComplaint || 'Urgent Complaint',
      customer: t.name || 'N/A',
      customerEn: t.nameEn || t.name || 'N/A',
      priority: 'high'
    })));
    
    // Recently completed tasks
    setRecentlyCompleted(resolvedTasks.slice(0, 5).map(t => ({
      id: t.id,
      ticketId: t.complaintNumber || `TCK-${t.id}`,
      customer: t.name || 'N/A',
      customerEn: t.nameEn || t.name || 'N/A',
      rating: t.satisfactionRating || 0
    })));
    
    // Daily target progress
    const today = new Date();
    const todayCompleted = resolvedTasks.filter(t => {
      try {
        const date = new Date(t.resolvedDate || t.updatedAt);
        return !isNaN(date.getTime()) && date.toDateString() === today.toDateString();
      } catch {
        return false;
      }
    }).length;
    
    setPerformance(prev => ({
      ...prev,
      dailyTarget: { completed: todayCompleted, target: 5 },
      efficiency: completionRate
    }));
    
    // Weekly progress
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const count = resolvedTasks.filter(t => {
        try {
          const date = new Date(t.resolvedDate || t.updatedAt);
          return !isNaN(date.getTime()) && date.toDateString() === day.toDateString();
        } catch {
          return false;
        }
      }).length;
      weekly.push({
        day: getDayName(day, language),
        completed: count,
        target: 3
      });
    }
    setPerformance(prev => ({ ...prev, weeklyProgress: weekly }));
    
    // Monthly stats
    const months = getLast6Months(language);
    const assignedData = [0, 0, 0, 0, 0, 0];
    const resolvedData = [0, 0, 0, 0, 0, 0];
    
    tasks.forEach(t => {
      try {
        const date = new Date(t.submittedDate || t.createdAt);
        if (!isNaN(date.getTime())) {
          const monthDiff = getMonthDifference(date);
          if (monthDiff >= 0 && monthDiff < 6) {
            assignedData[5 - monthDiff]++;
          }
        }
        
        const status = (t.status || '').toLowerCase();
        if (status === 'resolved' || status === 'समाधान भयो') {
          const resolvedDate = new Date(t.resolvedDate || t.updatedAt);
          if (!isNaN(resolvedDate.getTime())) {
            const resolvedDiff = getMonthDifference(resolvedDate);
            if (resolvedDiff >= 0 && resolvedDiff < 6) {
              resolvedData[5 - resolvedDiff]++;
            }
          }
        }
      } catch {
        // Skip invalid dates
      }
    });
    
    setPerformance(prev => ({
      ...prev,
      monthlyStats: { labels: months, assigned: assignedData, resolved: resolvedData }
    }));
    
    // Top performing days
    const dayPerformance = {};
    resolvedTasks.forEach(t => {
      try {
        const date = new Date(t.resolvedDate || t.updatedAt);
        if (!isNaN(date.getTime())) {
          const dayName = getDayName(date, 'en');
          dayPerformance[dayName] = (dayPerformance[dayName] || 0) + 1;
        }
      } catch {}
    });
    
    const topDays = Object.entries(dayPerformance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day, count]) => ({ day, count }));
    
    setPerformance(prev => ({ ...prev, topPerformingDays: topDays }));
    
    // Upcoming deadlines
    const deadlines = tasks.filter(t => {
      const status = (t.status || '').toLowerCase();
      return status === 'pending' || status === 'in-progress';
    }).slice(0, 4).map((t, idx) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (idx + 1));
      return {
        id: t.id,
        ticketId: t.complaintNumber || `TCK-${t.id}`,
        title: t.subject || t.natureOfComplaint || 'Task',
        dueDate: dueDate.toISOString(),
        priority: mapPriority(t.priority)
      };
    });
    setUpcomingDeadlines(deadlines);
  };

  // Process sample data for fallback
  const processSampleData = () => {
    setWorkload({
      totalAssigned: 8,
      pending: 3,
      inProgress: 2,
      resolved: 3,
      completionRate: 37.5,
      avgResponseTime: 4,
      avgResolutionTime: 2.5,
      customerSatisfaction: 4.5
    });
    
    setMyTasks([
      { id: 1, ticketId: 'TCK-001', title: 'Internet Connection Issue', customer: 'राम बहादुर', customerEn: 'Ram Bahadur', category: 'Technical', categoryEn: 'Technical', status: 'pending', priority: 'high', createdAt: new Date().toISOString() },
      { id: 2, ticketId: 'TCK-002', title: 'Recharge Not Updated', customer: 'सीता शर्मा', customerEn: 'Sita Sharma', category: 'Billing', categoryEn: 'Billing', status: 'in-progress', priority: 'medium', createdAt: new Date().toISOString() },
      { id: 3, ticketId: 'TCK-003', title: 'SIM Activation Issue', customer: 'हरि प्रसाद', customerEn: 'Hari Prasad', category: 'Activation', categoryEn: 'Activation', status: 'pending', priority: 'high', createdAt: new Date().toISOString() }
    ]);
    
    setUrgentTasks([
      { id: 1, ticketId: 'TCK-001', title: 'Internet Connection Issue', customer: 'राम बहादुर', customerEn: 'Ram Bahadur', priority: 'high' },
      { id: 3, ticketId: 'TCK-003', title: 'SIM Activation Issue', customer: 'हरि प्रसाद', customerEn: 'Hari Prasad', priority: 'high' }
    ]);
    
    setRecentlyCompleted([
      { id: 4, ticketId: 'TCK-004', customer: 'गीता अधिकारी', customerEn: 'Gita Adhikari', rating: 5 },
      { id: 5, ticketId: 'TCK-005', customer: 'विकास न्यौपाने', customerEn: 'Bikas Neupane', rating: 4 }
    ]);
    
    setPerformance({
      dailyTarget: { completed: 2, target: 5 },
      weeklyProgress: [
        { day: 'Mon', completed: 2, target: 3 },
        { day: 'Tue', completed: 1, target: 3 },
        { day: 'Wed', completed: 3, target: 3 },
        { day: 'Thu', completed: 2, target: 3 },
        { day: 'Fri', completed: 1, target: 3 },
        { day: 'Sat', completed: 0, target: 2 },
        { day: 'Sun', completed: 0, target: 2 }
      ],
      monthlyStats: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        assigned: [8, 6, 7, 5, 4, 3],
        resolved: [6, 5, 4, 3, 2, 2]
      },
      topPerformingDays: [
        { day: 'Wednesday', count: 5 },
        { day: 'Monday', count: 4 },
        { day: 'Friday', count: 3 }
      ],
      efficiency: 75
    });
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    setUpcomingDeadlines([
      { id: 1, ticketId: 'TCK-001', title: 'Internet Connection Issue', dueDate: tomorrow.toISOString(), priority: 'high' },
      { id: 2, ticketId: 'TCK-002', title: 'Recharge Not Updated', dueDate: dayAfter.toISOString(), priority: 'medium' }
    ]);
  };

  // Helper functions
  const mapPriority = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high' || p === 'urgent') return 'high';
    if (p === 'medium') return 'medium';
    if (p === 'low') return 'low';
    return 'medium';
  };

  const getMonthDifference = (date) => {
    const now = new Date();
    return (now.getMonth() - date.getMonth()) + (12 * (now.getFullYear() - date.getFullYear()));
  };

  const getDayName = (date, lang) => {
    const days = {
      np: ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
    return days[lang][date.getDay()];
  };

  const getLast6Months = (lang) => {
    const months = {
      np: ['पुस', 'माघ', 'फागुन', 'चैत', 'बैशाख', 'जेठ'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    };
    return months[lang];
  };

  const formatDate = (date, lang) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      if (lang === 'np') {
        const year = d.getFullYear() - 57;
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '-';
    }
  };

  const getSampleTasks = () => {
    return [
      { id: 1, complaintNumber: 'TCK-001', name: 'राम बहादुर', nameEn: 'Ram Bahadur', subject: 'Internet Connection Issue', description: 'Customer facing slow internet speed', category: 'Technical', enCategory: 'Technical', status: 'pending', submittedDate: new Date().toISOString(), priority: 'high', assignedTo: 'staff' },
      { id: 2, complaintNumber: 'TCK-002', name: 'सीता शर्मा', nameEn: 'Sita Sharma', subject: 'Recharge Not Updated', description: 'Recharge not reflecting', category: 'Billing', enCategory: 'Billing', status: 'in-progress', submittedDate: new Date().toISOString(), priority: 'medium', assignedTo: 'staff' },
      { id: 3, complaintNumber: 'TCK-003', name: 'हरि प्रसाद', nameEn: 'Hari Prasad', subject: 'SIM Activation Issue', description: 'SIM not activating', category: 'Activation', enCategory: 'Activation', status: 'pending', submittedDate: new Date().toISOString(), priority: 'high', assignedTo: 'staff' }
    ];
  };

  // Translations
  const translations = {
    np: {
      staffDashboard: 'कर्मचारी ड्यासबोर्ड',
      welcome: 'स्वागत छ',
      department: 'विभाग',
      totalAssigned: 'जम्मा तोकिएको',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      completionRate: 'पूरा भएको प्रतिशत',
      avgResponseTime: 'औसत प्रतिक्रिया समय',
      avgResolutionTime: 'औसत समाधान समय',
      customerSatisfaction: 'ग्राहक सन्तुष्टि',
      hours: 'घण्टा',
      days: 'दिन',
      myTasks: 'मेरा कार्यहरू',
      urgentTasks: 'अत्यावश्यक कार्यहरू',
      recentlyCompleted: 'हालै सम्पन्न',
      upcomingDeadlines: 'आउँदो समयसीमा',
      weeklyProgress: 'साप्ताहिक प्रगति',
      monthlyTrend: 'मासिक प्रवृत्ति',
      topPerformingDays: 'उत्कृष्ट प्रदर्शन दिनहरू',
      todayProgress: 'आजको प्रगति',
      completed: 'पूरा भयो',
      remaining: 'बाँकी',
      of: 'को',
      efficiency: 'क्षमता',
      viewAll: 'सबै हेर्नुहोस्',
      startWorking: 'काम सुरु गर्नुहोस्',
      workOnTask: 'कार्य गर्नुहोस्',
      viewDetails: 'विवरण हेर्नुहोस्',
      ticketId: 'टिकेट नम्बर',
      title: 'शीर्षक',
      customer: 'ग्राहक',
      category: 'प्रकार',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      dueDate: 'समयसीमा',
      actions: 'कार्यहरू',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      loading: 'लोड हुँदैछ...',
      noData: 'कुनै डाटा छैन',
      assigned: 'तोकिएको',
      resolvedLabel: 'समाधान',
      viewComplaints: 'गुनासोहरू हेर्नुहोस्',
      viewReports: 'रिपोर्ट हेर्नुहोस्',
      updateProfile: 'प्रोफाइल अपडेट गर्नुहोस्',
      quickActions: 'द्रुत कार्यहरू'
    },
    en: {
      staffDashboard: 'Staff Dashboard',
      welcome: 'Welcome',
      department: 'Department',
      totalAssigned: 'Total Assigned',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      completionRate: 'Completion Rate',
      avgResponseTime: 'Avg Response Time',
      avgResolutionTime: 'Avg Resolution Time',
      customerSatisfaction: 'Customer Satisfaction',
      hours: 'hours',
      days: 'days',
      myTasks: 'My Tasks',
      urgentTasks: 'Urgent Tasks',
      recentlyCompleted: 'Recently Completed',
      upcomingDeadlines: 'Upcoming Deadlines',
      weeklyProgress: 'Weekly Progress',
      monthlyTrend: 'Monthly Trend',
      topPerformingDays: 'Top Performing Days',
      todayProgress: "Today's Progress",
      completed: 'Completed',
      remaining: 'Remaining',
      of: 'of',
      efficiency: 'Efficiency',
      viewAll: 'View All',
      startWorking: 'Start Working',
      workOnTask: 'Work on Task',
      viewDetails: 'View Details',
      ticketId: 'Ticket ID',
      title: 'Title',
      customer: 'Customer',
      category: 'Category',
      status: 'Status',
      priority: 'Priority',
      dueDate: 'Due Date',
      actions: 'Actions',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      loading: 'Loading...',
      noData: 'No data available',
      assigned: 'Assigned',
      resolvedLabel: 'Resolved',
      viewComplaints: 'View Complaints',
      viewReports: 'View Reports',
      updateProfile: 'Update Profile',
      quickActions: 'Quick Actions'
    }
  };

  const t = translations[language];

  // Status and priority helpers
  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'status-pending';
    if (s === 'in-progress' || s === 'in progress') return 'status-progress';
    if (s === 'resolved') return 'status-resolved';
    return 'status-pending';
  };

  const getStatusText = (status) => {
    const s = (status || '').toLowerCase();
    if (language === 'np') {
      if (s === 'pending') return 'विचाराधीन';
      if (s === 'in-progress' || s === 'in progress') return 'प्रगतिमा';
      if (s === 'resolved') return 'समाधान';
    } else {
      if (s === 'pending') return 'Pending';
      if (s === 'in-progress' || s === 'in progress') return 'In Progress';
      if (s === 'resolved') return 'Resolved';
    }
    return status || 'Pending';
  };

  const getPriorityClass = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return 'priority-high';
    if (p === 'medium') return 'priority-medium';
    if (p === 'low') return 'priority-low';
    return 'priority-medium';
  };

  const getPriorityText = (priority) => {
    const p = (priority || '').toLowerCase();
    if (language === 'np') {
      if (p === 'high') return 'उच्च';
      if (p === 'medium') return 'मध्यम';
      if (p === 'low') return 'न्यून';
    } else {
      if (p === 'high') return 'High';
      if (p === 'medium') return 'Medium';
      if (p === 'low') return 'Low';
    }
    return priority || 'Medium';
  };

  const getCategoryText = (category, categoryEn) => {
    return language === 'np' ? category : categoryEn;
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= numRating ? 'star-filled' : 'star-empty'}`}>
          {i <= numRating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  const handleWorkOnTask = (taskId) => {
    navigate(`/staff-complaints/${taskId}/work`);
  };

  const handleViewDetails = (taskId) => {
    navigate(`/staff-complaints/${taskId}`);
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
    <div className="staff-dashboard">
      <Header language={language} setLanguage={setLanguage} adminName={staffName} userRole="staff" />
      
      <div className="dashboard-container">
        <div className="sidebar-container">
          <Sidebar language={language} userRole="staff" />
        </div>
        
        <div className="main-container">
          {/* Header */}
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1>{t.welcome}, <span className="staff-name">{staffName}</span></h1>
              <p>{t.staffDashboard} • {t.department}: {staffDepartment}</p>
            </div>
            <div className="date-badge">
              📅 {new Date().toLocaleDateString(language === 'np' ? 'ne-NP' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
          </div>

          {/* Workload Cards */}
          <div className="workload-grid">
            <div className="workload-card">
              <div className="card-icon blue">📋</div>
              <div className="card-info">
                <div className="card-value">{workload.totalAssigned}</div>
                <div className="card-label">{t.totalAssigned}</div>
              </div>
            </div>
            <div className="workload-card">
              <div className="card-icon orange">⏳</div>
              <div className="card-info">
                <div className="card-value">{workload.pending}</div>
                <div className="card-label">{t.pending}</div>
              </div>
            </div>
            <div className="workload-card">
              <div className="card-icon purple">🔄</div>
              <div className="card-info">
                <div className="card-value">{workload.inProgress}</div>
                <div className="card-label">{t.inProgress}</div>
              </div>
            </div>
            <div className="workload-card">
              <div className="card-icon green">✅</div>
              <div className="card-info">
                <div className="card-value">{workload.resolved}</div>
                <div className="card-label">{t.resolved}</div>
              </div>
            </div>
            <div className="workload-card">
              <div className="card-icon teal">📊</div>
              <div className="card-info">
                <div className="card-value">{workload.completionRate.toFixed(1)}%</div>
                <div className="card-label">{t.completionRate}</div>
              </div>
            </div>
            <div className="workload-card">
              <div className="card-icon cyan">⏱️</div>
              <div className="card-info">
                <div className="card-value">{workload.avgResponseTime} {t.hours}</div>
                <div className="card-label">{t.avgResponseTime}</div>
              </div>
            </div>
            <div className="workload-card">
              <div className="card-icon indigo">📅</div>
              <div className="card-info">
                <div className="card-value">{workload.avgResolutionTime} {t.days}</div>
                <div className="card-label">{t.avgResolutionTime}</div>
              </div>
            </div>
            <div className="workload-card">
              <div className="card-icon pink">⭐</div>
              <div className="card-info">
                <div className="card-value">{workload.customerSatisfaction}/5</div>
                <div className="card-label">{t.customerSatisfaction}</div>
              </div>
            </div>
          </div>

          {/* Daily Target Progress */}
          <div className="target-card">
            <div className="target-header">
              <h3>🎯 {t.todayProgress}</h3>
              <span className="target-badge">{performance.dailyTarget.completed}/{performance.dailyTarget.target}</span>
            </div>
            <div className="target-progress-bar">
              <div className="target-fill" style={{ width: `${(performance.dailyTarget.completed / performance.dailyTarget.target) * 100}%` }}></div>
            </div>
            <div className="target-stats">
              <span>✓ {performance.dailyTarget.completed} {t.completed}</span>
              <span>{performance.dailyTarget.target - performance.dailyTarget.completed} {t.remaining}</span>
            </div>
          </div>

          {/* My Tasks Table */}
          <div className="tasks-card">
            <div className="card-header">
              <h3>📋 {t.myTasks}</h3>
              <button className="view-link" onClick={() => navigate('/staff-complaints')}>{t.viewAll} →</button>
            </div>
            <div className="tasks-list">
              {myTasks.length > 0 ? (
                <table className="tasks-table">
                  <thead>
                    <tr>
                      <th>{t.ticketId}</th>
                      <th>{t.title}</th>
                      <th>{t.customer}</th>
                      <th>{t.status}</th>
                      <th>{t.priority}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTasks.map(task => (
                      <tr key={task.id}>
                        <td className="ticket-id">{task.ticketId}</td>
                        <td>{task.title.length > 30 ? task.title.substring(0, 30) + '...' : task.title}</td>
                        <td>{language === 'np' ? task.customer : task.customerEn}</td>
                        <td><span className={`status-badge ${getStatusClass(task.status)}`}>{getStatusText(task.status)}</span></td>
                        <td><span className={`priority-badge ${getPriorityClass(task.priority)}`}>{getPriorityText(task.priority)}</span></td>
                        <td className="actions-cell">
                          <button className="btn-view" onClick={() => handleViewDetails(task.id)}>👁️ {t.viewDetails}</button>
                          {task.status !== 'resolved' && (
                            <button className="btn-work" onClick={() => handleWorkOnTask(task.id)}>🔧 {t.workOnTask}</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data">{t.noData}</div>
              )}
            </div>
          </div>

          {/* Urgent Tasks */}
          <div className="urgent-card">
            <div className="card-header">
              <h3>⚠️ {t.urgentTasks}</h3>
            </div>
            <div className="urgent-list">
              {urgentTasks.length > 0 ? (
                urgentTasks.map(task => (
                  <div key={task.id} className="urgent-item">
                    <div className="urgent-info">
                      <span className="urgent-id">{task.ticketId}</span>
                      <span className="urgent-title">{task.title}</span>
                      <span className="urgent-customer">{language === 'np' ? task.customer : task.customerEn}</span>
                    </div>
                    <button className="urgent-action" onClick={() => handleWorkOnTask(task.id)}>
                      {t.workOnTask}
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-data">{t.noData}</div>
              )}
            </div>
          </div>

          {/* Recently Completed */}
          <div className="completed-card">
            <div className="card-header">
              <h3>✅ {t.recentlyCompleted}</h3>
            </div>
            <div className="completed-list">
              {recentlyCompleted.length > 0 ? (
                recentlyCompleted.map(task => (
                  <div key={task.id} className="completed-item">
                    <div className="completed-info">
                      <span className="completed-id">{task.ticketId}</span>
                      <span className="completed-customer">{language === 'np' ? task.customer : task.customerEn}</span>
                    </div>
                    <div className="completed-rating">{renderStars(task.rating)}</div>
                  </div>
                ))
              ) : (
                <div className="no-data">{t.noData}</div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="deadlines-card">
            <div className="card-header">
              <h3>⏰ {t.upcomingDeadlines}</h3>
            </div>
            <div className="deadlines-list">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(deadline => (
                  <div key={deadline.id} className="deadline-item">
                    <div className="deadline-info">
                      <span className="deadline-id">{deadline.ticketId}</span>
                      <span className="deadline-title">{deadline.title}</span>
                    </div>
                    <div className="deadline-meta">
                      <span className={`priority-badge ${getPriorityClass(deadline.priority)}`}>{getPriorityText(deadline.priority)}</span>
                      <span className="deadline-date">📅 {formatDate(deadline.dueDate, language)}</span>
                      <button className="deadline-action" onClick={() => handleWorkOnTask(deadline.id)}>
                        {t.workOnTask}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">{t.noData}</div>
              )}
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="chart-card">
            <div className="card-header">
              <h3>📊 {t.weeklyProgress}</h3>
            </div>
            <div className="weekly-chart">
              {performance.weeklyProgress.map((day, idx) => {
                const maxCompleted = Math.max(...performance.weeklyProgress.map(d => d.completed), 1);
                const heightPercent = (day.completed / maxCompleted) * 100;
                return (
                  <div key={idx} className="weekly-bar">
                    <div className="weekly-label">{day.day}</div>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ height: `${heightPercent}%`, backgroundColor: '#10b981' }}>
                        <span className="bar-value">{day.completed}</span>
                      </div>
                    </div>
                    <div className="weekly-target">Target: {day.target}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="chart-card">
            <div className="card-header">
              <h3>📈 {t.monthlyTrend}</h3>
            </div>
            <div className="legend">
              <span className="legend-assigned">● {t.assigned}</span>
              <span className="legend-resolved">● {t.resolvedLabel}</span>
            </div>
            <div className="monthly-chart">
              {performance.monthlyStats.labels.map((label, idx) => {
                const maxVal = Math.max(...performance.monthlyStats.assigned, ...performance.monthlyStats.resolved, 1);
                return (
                  <div key={idx} className="monthly-group">
                    <div className="monthly-label">{label}</div>
                    <div className="bars">
                      <div className="bar-assigned" style={{ height: `${(performance.monthlyStats.assigned[idx] / maxVal) * 100}%`, backgroundColor: '#3b82f6' }}>
                        <span className="bar-value">{performance.monthlyStats.assigned[idx]}</span>
                      </div>
                      <div className="bar-resolved" style={{ height: `${(performance.monthlyStats.resolved[idx] / maxVal) * 100}%`, backgroundColor: '#10b981' }}>
                        <span className="bar-value">{performance.monthlyStats.resolved[idx]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performing Days & Efficiency */}
          <div className="performance-card">
            <div className="card-header">
              <h3>🏆 {t.topPerformingDays}</h3>
            </div>
            <div className="top-days-list">
              {performance.topPerformingDays.map((day, idx) => (
                <div key={idx} className="top-day-item">
                  <span className="day-rank">#{idx + 1}</span>
                  <span className="day-name">{day.day}</span>
                  <span className="day-count">{day.count} tasks</span>
                  <div className="day-bar">
                    <div className="day-fill" style={{ width: `${(day.count / performance.topPerformingDays[0].count) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="efficiency-section">
              <div className="efficiency-label">{t.efficiency}</div>
              <div className="efficiency-bar">
                <div className="efficiency-fill" style={{ width: `${Math.min(performance.efficiency, 100)}%` }}></div>
              </div>
              <div className="efficiency-value">{performance.efficiency.toFixed(1)}%</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-card">
            <div className="card-header">
              <h3>⚡ {t.quickActions}</h3>
            </div>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => navigate('/staff-complaints')}>
                📋 {t.viewComplaints}
              </button>
              <button className="action-btn" onClick={() => navigate('/staff-reports')}>
                📊 {t.viewReports}
              </button>
              <button className="action-btn" onClick={() => navigate('/staff-profile')}>
                👤 {t.updateProfile}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .staff-dashboard {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          min-height: 100vh;
        }
        
        .loading-container {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100vh; gap: 16px;
        }
        
        .loading-spinner {
          width: 40px; height: 40px; border: 3px solid #e2e8f0;
          border-top-color: #10b981; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .dashboard-container {
          display: flex;
          margin-top: 80px;
          min-height: calc(100vh - 80px);
        }
        
        .sidebar-container {
          position: fixed;
          top: 80px;
          left: 0;
          width: 260px;
          height: calc(100vh - 80px);
          background: white;
          border-right: 1px solid #e2e8f0;
          z-index: 40;
          overflow-y: auto;
        }
        
        .main-container {
          flex: 1;
          padding: 24px 32px;
          margin-left: 260px;
        }
        
        .dashboard-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0;
        }
        
        .welcome-section h1 { font-size: 1.6rem; font-weight: 600; color: #0f172a; }
        .staff-name { color: #10b981; }
        .welcome-section p { color: #64748b; font-size: 0.85rem; }
        
        .date-badge {
          padding: 8px 16px; background: white; border-radius: 12px;
          border: 1px solid #e2e8f0; font-size: 0.85rem; color: #475569;
        }
        
        .workload-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
        }
        
        .workload-card {
          background: white; border-radius: 16px; padding: 16px;
          display: flex; align-items: center; gap: 12px;
          border: 1px solid #e2e8f0; transition: all 0.2s;
        }
        
        .workload-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .card-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .card-icon.blue { background: #dbeafe; color: #2563eb; }
        .card-icon.orange { background: #fed7aa; color: #ea580c; }
        .card-icon.purple { background: #f3e8ff; color: #9333ea; }
        .card-icon.green { background: #d1fae5; color: #059669; }
        .card-icon.teal { background: #ccfbf1; color: #0d9488; }
        .card-icon.cyan { background: #cffafe; color: #0891b2; }
        .card-icon.indigo { background: #e0e7ff; color: #4f46e5; }
        .card-icon.pink { background: #fce7f3; color: #db2777; }
        .card-info { flex: 1; }
        .card-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
        .card-label { font-size: 0.7rem; color: #64748b; margin-top: 4px; }
        
        .target-card, .tasks-card, .urgent-card, .completed-card, .deadlines-card, .chart-card, .performance-card, .actions-card {
          background: white; border-radius: 16px; padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
        }
        
        .card-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 16px;
        }
        
        .card-header h3 { font-size: 1rem; font-weight: 600; color: #0f172a; }
        .view-link { background: none; border: none; color: #10b981; cursor: pointer; font-size: 0.8rem; }
        
        .tasks-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .tasks-table th, .tasks-table td {
          padding: 10px 8px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .tasks-table th {
          color: #64748b;
          font-weight: 500;
          font-size: 0.7rem;
          background: #f8fafc;
        }
        
        .tasks-table td { font-size: 0.8rem; color: #334155; }
        .ticket-id { font-family: monospace; font-weight: 600; color: #10b981; }
        
        .actions-cell { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn-view, .btn-work {
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-view { background: #dbeafe; color: #2563eb; }
        .btn-view:hover { background: #bfdbfe; }
        .btn-work { background: #d1fae5; color: #059669; }
        .btn-work:hover { background: #a7f3d0; }
        
        .status-badge, .priority-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.65rem;
          font-weight: 500;
        }
        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }
        
        .urgent-list, .completed-list, .deadlines-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .urgent-item, .completed-item, .deadline-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          flex-wrap: wrap;
        }
        
        .urgent-info, .completed-info, .deadline-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .urgent-id, .completed-id, .deadline-id {
          font-family: monospace;
          font-weight: 600;
          color: #10b981;
          font-size: 0.75rem;
        }
        
        .urgent-action, .deadline-action {
          background: #fee2e2;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          color: #dc2626;
          transition: all 0.2s;
        }
        
        .urgent-action:hover, .deadline-action:hover { background: #dc2626; color: white; }
        .deadline-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .deadline-date { font-size: 0.65rem; color: #64748b; }
        
        .completed-rating { display: flex; gap: 2px; }
        .star { font-size: 0.8rem; }
        .star-filled { color: #f59e0b; }
        .star-empty { color: #d1d5db; }
        
        .weekly-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 200px;
          gap: 12px;
        }
        
        .weekly-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }
        
        .weekly-label { font-size: 0.7rem; color: #64748b; }
        .bar-container { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
        .bar-fill {
          width: 35px;
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: height 0.3s;
          min-height: 30px;
        }
        .bar-value {
          position: absolute;
          top: -22px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }
        .weekly-target { font-size: 0.6rem; color: #64748b; margin-top: 4px; }
        
        .legend { display: flex; justify-content: flex-end; gap: 16px; margin-bottom: 16px; }
        .legend-assigned { color: #3b82f6; font-size: 0.75rem; }
        .legend-resolved { color: #10b981; font-size: 0.75rem; }
        
        .monthly-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 200px;
          gap: 12px;
        }
        
        .monthly-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }
        
        .monthly-label { font-size: 0.7rem; color: #64748b; }
        .bars { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; }
        .bar-assigned, .bar-resolved {
          width: 18px;
          border-radius: 6px 6px 0 0;
          position: relative;
          transition: height 0.3s;
          min-height: 20px;
        }
        .bar-value {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.6rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }
        
        .top-days-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .top-day-item { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .day-rank { font-weight: 700; color: #f59e0b; width: 35px; }
        .day-name { flex: 1; font-size: 0.85rem; color: #0f172a; }
        .day-count { font-size: 0.75rem; color: #64748b; min-width: 70px; }
        .day-bar { flex: 2; min-width: 100px; background: #e2e8f0; border-radius: 10px; height: 6px; overflow: hidden; }
        .day-fill { background: #10b981; height: 100%; border-radius: 10px; }
        
        .efficiency-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
        .efficiency-label { font-size: 0.75rem; color: #64748b; margin-bottom: 4px; }
        .efficiency-bar { background: #e2e8f0; border-radius: 10px; height: 8px; overflow: hidden; margin-bottom: 4px; }
        .efficiency-fill { background: linear-gradient(90deg, #10b981, #34d399); height: 100%; border-radius: 10px; transition: width 0.3s; }
        .efficiency-value { font-size: 0.7rem; font-weight: 600; color: #10b981; text-align: right; }
        
        .actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .action-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: #334155;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .action-btn:hover { background: #f1f5f9; border-color: #10b981; color: #10b981; transform: translateY(-2px); }
        
        .no-data { text-align: center; padding: 20px; color: #94a3b8; }
        
        @media (max-width: 1200px) {
          .workload-grid { grid-template-columns: repeat(2, 1fr); }
          .actions-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (max-width: 768px) {
          .dashboard-container { margin-top: 70px; }
          .sidebar-container { top: 70px; width: 220px; }
          .main-container { padding: 16px; margin-left: 0; }
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .workload-grid { grid-template-columns: 1fr; }
          .actions-grid { grid-template-columns: 1fr; }
          .weekly-chart, .monthly-chart { height: 160px; }
          .bar-fill { width: 25px; }
          .bar-assigned, .bar-resolved { width: 12px; }
          .actions-cell { flex-direction: column; }
        }
        
        @media (max-width: 480px) {
          .tasks-table th, .tasks-table td { padding: 6px 4px; font-size: 0.7rem; }
          .urgent-item, .completed-item, .deadline-item { flex-direction: column; align-items: flex-start; gap: 10px; }
          .deadline-meta { flex-wrap: wrap; }
          .top-day-item { flex-direction: column; align-items: flex-start; }
          .day-bar { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;