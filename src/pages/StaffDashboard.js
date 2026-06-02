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

  // Staff Statistics
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    totalResolved: 0,
    thisMonthResolved: 0,
    avgResolutionDays: 0,
    avgSatisfaction: 0,
    completionRate: 0
  });

  // Data States
  const [myAssignedComplaints, setMyAssignedComplaints] = useState([]);
  const [recentlyResolved, setRecentlyResolved] = useState([]);
  const [urgentPending, setUrgentPending] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, target: 5 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState({ labels: [], assigned: [], resolved: [] });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      try {
        const userData = JSON.parse(user);
        setStaffName(userData.name || userData.fullName || 'Staff Member');
        setStaffEmail(userData.email || '');
      } catch (e) {
        setStaffName('Staff Member');
      }
      fetchDashboardData();
    }
  }, [navigate]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Fetch complaints
      const response = await axios.get('http://localhost:5000/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let complaints = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        complaints = response.data.data;
      } else {
        complaints = getSampleComplaints();
      }
      
      // Filter complaints assigned to this staff
      const myComplaints = complaints.filter(c => 
        c.assignedTo === staffEmail || c.assignedTo === 'staff'
      );
      
      // Process data
      processStaffData(myComplaints, complaints);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      processSampleData();
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Process staff data
  const processStaffData = (myComplaints, allComplaints) => {
    // Statistics
    const totalAssigned = myComplaints.length;
    const pending = myComplaints.filter(c => 
      ['pending', 'Pending', 'विचाराधीन'].includes(c.status)
    ).length;
    const inProgress = myComplaints.filter(c => 
      ['in-progress', 'In Progress', 'प्रगतिमा'].includes(c.status)
    ).length;
    const resolved = myComplaints.filter(c => 
      ['resolved', 'Resolved', 'समाधान भयो'].includes(c.status)
    ).length;
    
    const resolvedComplaints = myComplaints.filter(c => 
      ['resolved', 'Resolved', 'समाधान भयो'].includes(c.status)
    );
    const totalResolved = resolvedComplaints.length;
    
    // This month resolved
    const now = new Date();
    const thisMonthResolved = resolvedComplaints.filter(c => {
      const date = new Date(c.resolvedDate || c.updatedAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    
    // Average resolution days
    let avgResolutionDays = 0;
    if (resolvedComplaints.length > 0) {
      const totalDays = resolvedComplaints.reduce((sum, c) => {
        const submitted = new Date(c.submittedDate || c.createdAt);
        const resolved = new Date(c.resolvedDate || c.updatedAt);
        const days = Math.ceil((resolved - submitted) / (1000 * 60 * 60 * 24));
        return sum + (days > 0 ? days : 1);
      }, 0);
      avgResolutionDays = Math.round(totalDays / resolvedComplaints.length);
    }
    
    // Average satisfaction
    let avgSatisfaction = 0;
    const ratings = resolvedComplaints.filter(c => c.satisfactionRating > 0);
    if (ratings.length > 0) {
      const total = ratings.reduce((sum, c) => sum + c.satisfactionRating, 0);
      avgSatisfaction = parseFloat((total / ratings.length).toFixed(1));
    }
    
    // Completion rate
    const completionRate = totalAssigned > 0 ? (resolved / totalAssigned) * 100 : 0;
    
    setStats({
      totalAssigned,
      pending,
      inProgress,
      resolved,
      totalResolved,
      thisMonthResolved,
      avgResolutionDays,
      avgSatisfaction,
      completionRate
    });
    
    // My assigned complaints (last 5)
    setMyAssignedComplaints(myComplaints.slice(0, 5).map(c => ({
      id: c.id,
      ticketId: c.complaintNumber || `TCK-${c.id}`,
      name: c.name || 'N/A',
      nameEn: c.nameEn || c.name || 'N/A',
      category: c.category || 'General',
      categoryEn: c.categoryEn || c.category || 'General',
      status: (c.status || 'pending').toLowerCase(),
      priority: mapPriority(c.priority),
      date: c.submittedDate || c.createdAt
    })));
    
    // Recently resolved (last 5)
    setRecentlyResolved(resolvedComplaints.slice(0, 5).map(c => ({
      id: c.id,
      ticketId: c.complaintNumber || `TCK-${c.id}`,
      name: c.name || 'N/A',
      nameEn: c.nameEn || c.name || 'N/A',
      rating: c.satisfactionRating || 0
    })));
    
    // Urgent pending complaints
    setUrgentPending(myComplaints.filter(c => {
      const status = (c.status || '').toLowerCase();
      const priority = (c.priority || '').toLowerCase();
      return (status === 'pending' || status === 'विचाराधीन') && 
             (priority === 'high' || priority === 'urgent');
    }).slice(0, 5).map(c => ({
      id: c.id,
      ticketId: c.complaintNumber || `TCK-${c.id}`,
      name: c.name || 'N/A',
      nameEn: c.nameEn || c.name || 'N/A',
      category: c.category || 'General',
      categoryEn: c.categoryEn || c.category || 'General'
    })));
    
    // Daily progress
    const today = new Date();
    const todayCompleted = resolvedComplaints.filter(c => {
      const date = new Date(c.resolvedDate || c.updatedAt);
      return date.toDateString() === today.toDateString();
    }).length;
    setDailyProgress({ completed: todayCompleted, target: 5 });
    
    // Weekly performance
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const count = resolvedComplaints.filter(c => {
        const date = new Date(c.resolvedDate || c.updatedAt);
        return date.toDateString() === day.toDateString();
      }).length;
      weekly.push({
        day: getDayName(day, language),
        count
      });
    }
    setWeeklyData(weekly);
    
    // Monthly trend (last 6 months)
    const months = getLast6Months(language);
    const assignedData = [0, 0, 0, 0, 0, 0];
    const resolvedData = [0, 0, 0, 0, 0, 0];
    
    myComplaints.forEach(c => {
      const date = new Date(c.submittedDate || c.createdAt);
      const monthDiff = getMonthDifference(date);
      if (monthDiff >= 0 && monthDiff < 6) {
        assignedData[5 - monthDiff]++;
      }
      
      if (['resolved', 'Resolved', 'समाधान भयो'].includes(c.status)) {
        const resolvedDate = new Date(c.resolvedDate || c.updatedAt);
        const resolvedDiff = getMonthDifference(resolvedDate);
        if (resolvedDiff >= 0 && resolvedDiff < 6) {
          resolvedData[5 - resolvedDiff]++;
        }
      }
    });
    
    setMonthlyTrend({
      labels: months,
      assigned: assignedData,
      resolved: resolvedData
    });
  };

  // Process sample data for fallback
  const processSampleData = () => {
    setStats({
      totalAssigned: 12,
      pending: 5,
      inProgress: 3,
      resolved: 4,
      totalResolved: 4,
      thisMonthResolved: 2,
      avgResolutionDays: 3,
      avgSatisfaction: 4.5,
      completionRate: 33.3
    });
    
    setMyAssignedComplaints([
      { id: 1, ticketId: 'TCK-001', name: 'राम बहादुर', nameEn: 'Ram Bahadur', category: 'Internet', categoryEn: 'Internet', status: 'pending', priority: 'high', date: '2024-01-15' },
      { id: 2, ticketId: 'TCK-002', name: 'सीता शर्मा', nameEn: 'Sita Sharma', category: 'Recharge', categoryEn: 'Recharge', status: 'in-progress', priority: 'medium', date: '2024-01-14' },
      { id: 3, ticketId: 'TCK-003', name: 'हरि प्रसाद', nameEn: 'Hari Prasad', category: 'Activation', categoryEn: 'Activation', status: 'pending', priority: 'high', date: '2024-01-13' }
    ]);
    
    setRecentlyResolved([
      { id: 4, ticketId: 'TCK-004', name: 'गीता अधिकारी', nameEn: 'Gita Adhikari', rating: 5 },
      { id: 5, ticketId: 'TCK-005', name: 'विकास न्यौपाने', nameEn: 'Bikas Neupane', rating: 4 }
    ]);
    
    setUrgentPending([
      { id: 1, ticketId: 'TCK-001', name: 'राम बहादुर', nameEn: 'Ram Bahadur', category: 'Internet', categoryEn: 'Internet' },
      { id: 3, ticketId: 'TCK-003', name: 'हरि प्रसाद', nameEn: 'Hari Prasad', category: 'Activation', categoryEn: 'Activation' }
    ]);
    
    setDailyProgress({ completed: 2, target: 5 });
    
    const dayNames = language === 'np' 
      ? ['सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि', 'आइत']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    setWeeklyData([
      { day: dayNames[0], count: 2 },
      { day: dayNames[1], count: 1 },
      { day: dayNames[2], count: 3 },
      { day: dayNames[3], count: 2 },
      { day: dayNames[4], count: 1 },
      { day: dayNames[5], count: 0 },
      { day: dayNames[6], count: 0 }
    ]);
    
    const months = language === 'np' 
      ? ['पुस', 'माघ', 'फागुन', 'चैत', 'बैशाख', 'जेठ']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    setMonthlyTrend({
      labels: months,
      assigned: [8, 6, 7, 5, 4, 3],
      resolved: [6, 5, 4, 3, 2, 2]
    });
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
      np: ['पुस', 'माघ', 'फागुन', 'चैत', 'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (now.getMonth() - i + 12) % 12;
      result.push(months[lang][idx]);
    }
    return result;
  };

  const formatDate = (date, lang) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      if (lang === 'np') {
        const year = d.getFullYear() - 57;
        return `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      return d.toISOString().split('T')[0];
    } catch {
      return '-';
    }
  };

  const getSampleComplaints = () => {
    return [
      { id: 1, complaintNumber: 'TCK-001', name: 'राम बहादुर', nameEn: 'Ram Bahadur', category: 'Internet', enCategory: 'Internet', status: 'pending', submittedDate: '2024-01-15', priority: 'high', assignedTo: 'staff' },
      { id: 2, complaintNumber: 'TCK-002', name: 'सीता शर्मा', nameEn: 'Sita Sharma', category: 'Recharge', enCategory: 'Recharge', status: 'in-progress', submittedDate: '2024-01-14', priority: 'medium', assignedTo: 'staff' },
      { id: 3, complaintNumber: 'TCK-003', name: 'हरि प्रसाद', nameEn: 'Hari Prasad', category: 'Activation', enCategory: 'Activation', status: 'pending', submittedDate: '2024-01-13', priority: 'high', assignedTo: 'staff' },
      { id: 4, complaintNumber: 'TCK-004', name: 'गीता अधिकारी', nameEn: 'Gita Adhikari', category: 'Billing', enCategory: 'Billing', status: 'resolved', submittedDate: '2024-01-12', priority: 'medium', assignedTo: 'staff', satisfactionRating: 5, resolvedDate: '2024-01-15' }
    ];
  };

  // Translations
  const t = {
    np: {
      welcome: 'स्वागत छ',
      dashboard: 'कर्मचारी ड्यासबोर्ड',
      stats: 'तथ्यांक',
      totalAssigned: 'जम्मा तोकिएको',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      totalResolved: 'जम्मा समाधान',
      thisMonth: 'यो महिना',
      avgResolution: 'औसत समाधान समय',
      avgSatisfaction: 'औसत सन्तुष्टि',
      completionRate: 'पूरा भएको प्रतिशत',
      days: 'दिन',
      myAssigned: 'मलाई तोकिएका गुनासोहरू',
      recentlyResolved: 'हालै समाधान गरेका',
      urgentPending: 'अत्यावश्यक गुनासोहरू',
      dailyTarget: 'दैनिक लक्ष्य',
      todayProgress: 'आजको प्रगति',
      completed: 'पूरा भयो',
      remaining: 'बाँकी',
      of: 'को',
      weeklyPerformance: 'साप्ताहिक प्रदर्शन',
      monthlyTrend: 'मासिक प्रवृत्ति',
      assigned: 'तोकिएको',
      resolvedLabel: 'समाधान',
      quickActions: 'द्रुत कार्यहरू',
      viewComplaints: 'गुनासोहरू हेर्नुहोस्',
      viewReports: 'रिपोर्ट हेर्नुहोस्',
      updateProfile: 'प्रोफाइल अपडेट गर्नुहोस्',
      viewAll: 'सबै हेर्नुहोस्',
      startWorking: 'काम सुरु गर्नुहोस्',
      markResolved: 'समाधान गर्नुहोस्',
      viewDetails: 'विवरण हेर्नुहोस्',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      date: 'मिति',
      actions: 'कार्यहरू',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      loading: 'लोड हुँदैछ...',
      noData: 'कुनै डाटा छैन'
    },
    en: {
      welcome: 'Welcome',
      dashboard: 'Staff Dashboard',
      stats: 'Statistics',
      totalAssigned: 'Total Assigned',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      totalResolved: 'Total Resolved',
      thisMonth: 'This Month',
      avgResolution: 'Avg Resolution Time',
      avgSatisfaction: 'Avg Satisfaction',
      completionRate: 'Completion Rate',
      days: 'days',
      myAssigned: 'My Assigned Complaints',
      recentlyResolved: 'Recently Resolved',
      urgentPending: 'Urgent Pending',
      dailyTarget: 'Daily Target',
      todayProgress: "Today's Progress",
      completed: 'Completed',
      remaining: 'Remaining',
      of: 'of',
      weeklyPerformance: 'Weekly Performance',
      monthlyTrend: 'Monthly Trend',
      assigned: 'Assigned',
      resolvedLabel: 'Resolved',
      quickActions: 'Quick Actions',
      viewComplaints: 'View Complaints',
      viewReports: 'View Reports',
      updateProfile: 'Update Profile',
      viewAll: 'View All',
      startWorking: 'Start Working',
      markResolved: 'Mark Resolved',
      viewDetails: 'View Details',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      status: 'Status',
      priority: 'Priority',
      date: 'Date',
      actions: 'Actions',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      loading: 'Loading...',
      noData: 'No data available'
    }
  };

  const text = t[language];

  // Status and priority helpers
  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'status-pending';
    if (s === 'in-progress') return 'status-progress';
    if (s === 'resolved') return 'status-resolved';
    return 'status-pending';
  };

  const getStatusText = (status) => {
    const s = (status || '').toLowerCase();
    if (language === 'np') {
      if (s === 'pending') return 'विचाराधीन';
      if (s === 'in-progress') return 'प्रगतिमा';
      if (s === 'resolved') return 'समाधान';
    } else {
      if (s === 'pending') return 'Pending';
      if (s === 'in-progress') return 'In Progress';
      if (s === 'resolved') return 'Resolved';
    }
    return status;
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
    return priority;
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{text.loading}</p>
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
              <h1>{text.welcome}, <span className="staff-name">{staffName}</span></h1>
              <p>{text.dashboard}</p>
            </div>
            <div className="date-badge">
              📅 {new Date().toLocaleDateString(language === 'np' ? 'ne-NP' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalAssigned}</div>
                <div className="stat-label">{text.totalAssigned}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">{text.pending}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <div className="stat-value">{stats.inProgress}</div>
                <div className="stat-label">{text.inProgress}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-value">{stats.resolved}</div>
                <div className="stat-label">{text.resolved}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalResolved}</div>
                <div className="stat-label">{text.totalResolved}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <div className="stat-value">{stats.thisMonthResolved}</div>
                <div className="stat-label">{text.thisMonth}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-value">{stats.avgResolutionDays} {text.days}</div>
                <div className="stat-label">{text.avgResolution}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">{stats.avgSatisfaction}/5</div>
                <div className="stat-label">{text.avgSatisfaction}</div>
              </div>
            </div>
          </div>

          {/* Completion Rate Bar */}
          <div className="completion-card">
            <div className="completion-header">
              <span>{text.completionRate}</span>
              <span className="completion-percent">{stats.completionRate.toFixed(1)}%</span>
            </div>
            <div className="completion-bar-bg">
              <div className="completion-bar-fill" style={{ width: `${Math.min(stats.completionRate, 100)}%` }}></div>
            </div>
          </div>

          {/* Daily Target */}
          <div className="target-card">
            <div className="card-header">
              <h3>🎯 {text.dailyTarget}</h3>
              <span className="subtitle">{text.todayProgress}</span>
            </div>
            <div className="target-progress">
              <div className="target-numbers">
                <span className="completed">✓ {dailyProgress.completed} {text.completed}</span>
                <span className="remaining">{dailyProgress.target - dailyProgress.completed} {text.remaining}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(dailyProgress.completed / dailyProgress.target) * 100}%` }}></div>
              </div>
              <div className="target-text">{dailyProgress.completed} {text.of} {dailyProgress.target} {text.completed}</div>
            </div>
          </div>

          {/* My Assigned Complaints */}
          <div className="table-card">
            <div className="card-header">
              <h3>📋 {text.myAssigned}</h3>
              <button className="view-all" onClick={() => navigate('/staff-complaints')}>{text.viewAll} →</button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr><th>{text.ticketId}</th><th>{text.complainant}</th><th>{text.category}</th><th>{text.status}</th><th>{text.priority}</th><th>{text.date}</th><th>{text.actions}</th></tr>
                </thead>
                <tbody>
                  {myAssignedComplaints.map(c => (
                    <tr key={c.id}>
                      <td className="ticket-id">{c.ticketId}</td>
                      <td>{language === 'np' ? c.name : c.nameEn}</td>
                      <td>{language === 'np' ? c.category : c.categoryEn}</td>
                      <td><span className={`status-badge ${getStatusClass(c.status)}`}>{getStatusText(c.status)}</span></td>
                      <td><span className={`priority-badge ${getPriorityClass(c.priority)}`}>{getPriorityText(c.priority)}</span></td>
                      <td>{formatDate(c.date, language)}</td>
                      <td>
                        <button className="action-btn" onClick={() => navigate(`/staff-complaints/${c.id}`)}>
                          {c.status === 'pending' ? text.startWorking : c.status === 'in-progress' ? text.markResolved : text.viewDetails}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {myAssignedComplaints.length === 0 && <tr><td colSpan="7" className="no-data">{text.noData}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Two Column Section */}
          <div className="two-column">
            {/* Recently Resolved */}
            <div className="info-card">
              <div className="card-header"><h3>✅ {text.recentlyResolved}</h3></div>
              <div className="recent-list">
                {recentlyResolved.map(c => (
                  <div key={c.id} className="recent-item">
                    <div><div className="recent-ticket">{c.ticketId}</div><div className="recent-name">{language === 'np' ? c.name : c.nameEn}</div></div>
                    <div className="stars">{renderStars(c.rating)}</div>
                  </div>
                ))}
                {recentlyResolved.length === 0 && <div className="no-data">{text.noData}</div>}
              </div>
            </div>

            {/* Urgent Pending */}
            <div className="info-card">
              <div className="card-header"><h3>⚠️ {text.urgentPending}</h3></div>
              <div className="urgent-list">
                {urgentPending.map(c => (
                  <div key={c.id} className="urgent-item">
                    <div><div className="urgent-ticket">{c.ticketId}</div><div className="urgent-name">{language === 'np' ? c.name : c.nameEn}</div><div className="urgent-category">{language === 'np' ? c.category : c.categoryEn}</div></div>
                    <button className="urgent-btn" onClick={() => navigate(`/staff-complaints/${c.id}`)}>{text.startWorking}</button>
                  </div>
                ))}
                {urgentPending.length === 0 && <div className="no-data">{text.noData}</div>}
              </div>
            </div>
          </div>

          {/* Weekly Performance Chart */}
          <div className="chart-card">
            <div className="card-header"><h3>📊 {text.weeklyPerformance}</h3></div>
            <div className="weekly-chart">
              {weeklyData.map((day, i) => {
                const maxCount = Math.max(...weeklyData.map(d => d.count), 1);
                return (
                  <div key={i} className="weekly-bar">
                    <div className="weekly-label">{day.day}</div>
                    <div className="bar-container">
                      <div className="bar" style={{ height: `${(day.count / maxCount) * 100}%`, backgroundColor: '#10b981' }}>
                        <span className="bar-value">{day.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="chart-card">
            <div className="card-header"><h3>📈 {text.monthlyTrend}</h3></div>
            <div className="legend"><span className="legend-assigned">● {text.assigned}</span><span className="legend-resolved">● {text.resolvedLabel}</span></div>
            <div className="monthly-chart">
              {monthlyTrend.labels.map((label, i) => {
                const maxVal = Math.max(...monthlyTrend.assigned, ...monthlyTrend.resolved, 1);
                return (
                  <div key={i} className="monthly-bar-group">
                    <div className="monthly-label">{label}</div>
                    <div className="bars">
                      <div className="bar-assigned" style={{ height: `${(monthlyTrend.assigned[i] / maxVal) * 100}%`, backgroundColor: '#3b82f6' }}>
                        <span className="bar-value">{monthlyTrend.assigned[i]}</span>
                      </div>
                      <div className="bar-resolved" style={{ height: `${(monthlyTrend.resolved[i] / maxVal) * 100}%`, backgroundColor: '#10b981' }}>
                        <span className="bar-value">{monthlyTrend.resolved[i]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-card">
            <div className="card-header"><h3>⚡ {text.quickActions}</h3></div>
            <div className="actions-grid">
              <button className="action-btn-large" onClick={() => navigate('/staff-complaints')}>📋 {text.viewComplaints}</button>
              <button className="action-btn-large" onClick={() => navigate('/staff-reports')}>📊 {text.viewReports}</button>
              <button className="action-btn-large" onClick={() => navigate('/staff-profile')}>👤 {text.updateProfile}</button>
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
          display: flex; margin-top: 195px; min-height: calc(100vh - 195px);
        }
        
        .sidebar-container {
          position: fixed; top: 195px; left: 0; width: 260px;
          height: calc(100vh - 195px); background: white;
          border-right: 1px solid #e2e8f0; z-index: 40;
        }
        
        .main-container {
          flex: 1; padding: 24px 32px; margin-left: 260px;
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
        
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;
        }
        
        .stat-card {
          background: white; border-radius: 16px; padding: 16px;
          display: flex; align-items: center; gap: 12px;
          border: 1px solid #e2e8f0; transition: all 0.2s;
        }
        
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .stat-icon { font-size: 2rem; }
        .stat-info { flex: 1; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
        .stat-label { font-size: 0.7rem; color: #64748b; margin-top: 4px; }
        
        .completion-card {
          background: white; border-radius: 16px; padding: 16px 20px;
          margin-bottom: 20px; border: 1px solid #e2e8f0;
        }
        
        .completion-header {
          display: flex; justify-content: space-between; margin-bottom: 8px;
          font-size: 0.8rem; color: #475569;
        }
        
        .completion-percent { font-weight: 700; color: #10b981; }
        .completion-bar-bg { background: #e2e8f0; border-radius: 10px; height: 8px; overflow: hidden; }
        .completion-bar-fill { background: linear-gradient(90deg, #10b981, #34d399); height: 100%; border-radius: 10px; transition: width 0.3s; }
        
        .target-card, .table-card, .chart-card, .actions-card, .info-card {
          background: white; border-radius: 16px; padding: 20px;
          margin-bottom: 20px; border: 1px solid #e2e8f0;
        }
        
        .card-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        }
        
        .card-header h3 { font-size: 1rem; font-weight: 600; color: #0f172a; }
        .subtitle { font-size: 0.75rem; color: #64748b; }
        .view-all { background: none; border: none; color: #10b981; cursor: pointer; font-size: 0.8rem; }
        
        .target-progress { margin-top: 8px; }
        .target-numbers { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .completed { color: #10b981; font-size: 0.85rem; font-weight: 500; }
        .remaining { color: #ef4444; font-size: 0.85rem; font-weight: 500; }
        .progress-bar { background: #e2e8f0; border-radius: 10px; height: 8px; margin-bottom: 8px; }
        .progress-fill { background: linear-gradient(90deg, #10b981, #34d399); height: 100%; border-radius: 10px; transition: width 0.3s; }
        .target-text { font-size: 0.7rem; color: #64748b; text-align: center; }
        
        .table-responsive { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 12px 8px; text-align: left; border-bottom: 1px solid #f1f5f9; }
        .data-table th { color: #64748b; font-weight: 500; font-size: 0.75rem; background: #f8fafc; }
        .data-table td { color: #334155; font-size: 0.8rem; }
        .ticket-id { font-family: monospace; font-weight: 600; color: #10b981; }
        
        .status-badge, .priority-badge {
          display: inline-block; padding: 4px 10px; border-radius: 20px;
          font-size: 0.65rem; font-weight: 500;
        }
        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }
        
        .action-btn {
          background: #f1f5f9; border: none; padding: 6px 12px; border-radius: 8px;
          font-size: 0.7rem; cursor: pointer; color: #475569; transition: all 0.2s;
        }
        .action-btn:hover { background: #10b981; color: white; }
        
        .two-column { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
        
        .recent-list, .urgent-list { display: flex; flex-direction: column; gap: 10px; }
        .recent-item, .urgent-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px; background: #f8fafc; border-radius: 12px;
        }
        .recent-ticket, .urgent-ticket { font-family: monospace; font-weight: 600; color: #10b981; font-size: 0.75rem; }
        .recent-name, .urgent-name { font-size: 0.8rem; color: #0f172a; }
        .urgent-category { font-size: 0.7rem; color: #64748b; }
        .stars { display: flex; gap: 2px; }
        .star { font-size: 0.8rem; }
        .star-filled { color: #f59e0b; }
        .star-empty { color: #d1d5db; }
        .urgent-btn {
          background: #fee2e2; border: none; padding: 6px 12px; border-radius: 8px;
          font-size: 0.7rem; cursor: pointer; color: #dc2626; transition: all 0.2s;
        }
        .urgent-btn:hover { background: #dc2626; color: white; }
        
        .weekly-chart {
          display: flex; align-items: flex-end; justify-content: space-around;
          height: 180px; gap: 12px;
        }
        .weekly-bar { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; }
        .weekly-label { font-size: 0.7rem; color: #64748b; }
        .bar-container { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
        .bar {
          width: 35px; border-radius: 8px 8px 0 0; position: relative;
          transition: height 0.3s; min-height: 30px;
        }
        .bar-value {
          position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
          font-size: 0.7rem; font-weight: 600; color: #475569;
        }
        
        .legend { display: flex; justify-content: flex-end; gap: 16px; margin-bottom: 16px; }
        .legend-assigned { color: #3b82f6; font-size: 0.75rem; }
        .legend-resolved { color: #10b981; font-size: 0.75rem; }
        
        .monthly-chart {
          display: flex; align-items: flex-end; justify-content: space-around;
          height: 200px; gap: 12px;
        }
        .monthly-bar-group {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%;
        }
        .monthly-label { font-size: 0.7rem; color: #64748b; }
        .bars { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; }
        .bar-assigned, .bar-resolved {
          width: 18px; border-radius: 6px 6px 0 0; position: relative;
          transition: height 0.3s; min-height: 20px;
        }
        .bar-value {
          position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
          font-size: 0.6rem; font-weight: 600; color: #475569;
        }
        
        .actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .action-btn-large {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 14px; cursor: pointer; font-size: 0.85rem; font-weight: 500;
          color: #334155; transition: all 0.2s;
        }
        .action-btn-large:hover {
          background: #f1f5f9; border-color: #10b981; color: #10b981; transform: translateY(-2px);
        }
        
        .no-data { text-align: center; padding: 20px; color: #94a3b8; }
        
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .two-column { grid-template-columns: 1fr; }
          .actions-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (max-width: 768px) {
          .dashboard-container { margin-top: 280px; }
          .sidebar-container { top: 280px; height: calc(100vh - 280px); }
          .main-container { padding: 16px; margin-left: 0; }
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .actions-grid { grid-template-columns: 1fr; }
          .weekly-chart, .monthly-chart { height: 140px; }
          .bar { width: 25px; }
          .bar-assigned, .bar-resolved { width: 12px; }
        }
        
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .data-table th, .data-table td { padding: 8px 4px; font-size: 0.65rem; }
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;