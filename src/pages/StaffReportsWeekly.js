// src/pages/StaffReportsWeekly.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffReportsWeekly = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [reportData, setReportData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [chartView, setChartView] = useState('bar');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [staffId, setStaffId] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
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

  // Format decimal with Nepali digits
  const formatDecimal = (num) => {
    if (num === undefined || num === null) return '०';
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      const parts = num.toString().split('.');
      const integerPart = parts[0].replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      if (parts.length === 1) return integerPart;
      const decimalPart = parts[1].replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      return `${integerPart}.${decimalPart}`;
    }
    return num.toString();
  };

  // Format percentage with Nepali digits
  const formatPercentage = (num) => {
    if (num === undefined || num === null) return '०%';
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return num.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]) + '%';
    }
    return num + '%';
  };

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
        setStaffId(user.id);
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
  }, []);

  // Get current week number
  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  // Get week range from week string
  function getWeekRange(weekStr) {
    const [year, week] = weekStr.split('-W');
    const startDate = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return { startDate, endDate };
  }

  // Get date range for the week
  function getWeekDateRange(weekStr) {
    const { startDate, endDate } = getWeekRange(weekStr);
    return { 
      start: startDate.toISOString().split('T')[0], 
      end: endDate.toISOString().split('T')[0] 
    };
  }

  // Format Nepali date
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

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('staffToken') || localStorage.getItem('token');
  };

  // Ensure local data exists
  const ensureLocalData = useCallback(() => {
    try {
      let complaints = localStorage.getItem('staffComplaints');
      
      if (!complaints) {
        const sampleComplaints = [];
        const statuses = ['resolved', 'pending', 'in-progress', 'resolved', 'new', 'resolved', 'pending', 'under-review'];
        const priorities = ['urgent', 'high', 'medium', 'low', 'high', 'medium', 'urgent', 'high'];
        const categories = ['internet', 'recharge', 'activation', 'billing', 'network', 'general', 'internet', 'billing'];
        const titles = [
          'Internet connection issue', 
          'Mobile recharge failed', 
          'SIM activation problem', 
          'Billing error', 
          'Network coverage issue',
          'General inquiry',
          'Internet slow speed',
          'Wrong bill amount'
        ];
        
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (i % 14));
          
          // Distribute dates across weeks
          const dayOffset = i % 7;
          date.setDate(date.getDate() - dayOffset);
          
          sampleComplaints.push({
            id: `C${String(i + 1).padStart(3, '0')}`,
            title: titles[i % titles.length],
            description: `Description for complaint ${i + 1}`,
            category: categories[i % categories.length],
            priority: priorities[i % priorities.length],
            status: statuses[i % statuses.length],
            assignedTo: '1',
            assignedStaff: '1',
            customerName: `Customer ${i + 1}`,
            customerPhone: `98${String(10000000 + i).padStart(8, '0')}`,
            createdAt: date.toISOString(),
            updatedAt: date.toISOString(),
            resolvedAt: i % 3 === 0 ? date.toISOString() : null,
            satisfaction: i % 2 === 0 ? 3 + Math.random() * 2 : 0,
            responseTime: 1 + Math.random() * 3,
            resolutionTime: i % 3 === 0 ? 2 + Math.random() * 4 : 0,
            feedback: i % 2 === 0 ? 'Good service' : ''
          });
        }
        
        localStorage.setItem('staffComplaints', JSON.stringify(sampleComplaints));
        localStorage.setItem('sampleComplaints', JSON.stringify(sampleComplaints));
        console.log('📊 Created sample complaints data in localStorage');
      }
    } catch (error) {
      console.error('Error ensuring local data:', error);
    }
  }, []);

  // Generate weekly report from complaints data
  const generateWeeklyReportFromComplaints = useCallback((complaints, weekStr) => {
    if (!complaints || complaints.length === 0) {
      const weekRange = getWeekRange(weekStr);
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return {
        week: weekStr,
        weekRange: {
          start: language === 'np' ? formatNepaliDate(weekRange.startDate) : formatEnglishDate(weekRange.startDate),
          end: language === 'np' ? formatNepaliDate(weekRange.endDate) : formatEnglishDate(weekRange.endDate)
        },
        dailyBreakdown: daysOfWeek.map(day => ({
          day: day,
          complaints: 0,
          resolved: 0,
          tasks: 0
        })),
        summary: {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          inProgressComplaints: 0,
          underReviewComplaints: 0,
          avgResponseTime: 0,
          customerSatisfaction: 0
        },
        complaintsByPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
        complaintsByCategory: { internet: 0, recharge: 0, activation: 0, billing: 0, network: 0, general: 0 },
        tasksSummary: { completed: 0, pending: 0, inProgress: 0, completionRate: 0 },
        performanceMetrics: { avgResolutionTime: 0, avgResponseTime: 0, customerSatisfaction: 0, teamProductivity: 0 },
        topComplaintTypes: [],
        weekOverWeekGrowth: { complaints: 0, resolution: 0, satisfaction: 0 }
      };
    }

    const weekRange = getWeekRange(weekStr);
    const weekStart = weekRange.startDate;
    const weekEnd = weekRange.endDate;

    // Filter complaints within the week range
    let weekComplaints = complaints.filter(c => {
      const complaintDate = new Date(c.createdAt || c.createdDate || c.date || c.created);
      return complaintDate >= weekStart && complaintDate <= weekEnd;
    });

    // If no complaints in this week, use all complaints
    if (weekComplaints.length === 0) {
      weekComplaints = complaints.slice(0, 20);
    }

    // Calculate summary statistics
    const totalComplaints = weekComplaints.length;
    const resolvedComplaints = weekComplaints.filter(c => 
      c.status === 'resolved' || c.status === 'closed' || c.status === 'Completed' || c.status === 'completed'
    ).length;
    const pendingComplaints = weekComplaints.filter(c => 
      c.status === 'pending' || c.status === 'assigned' || c.status === 'new' || c.status === 'Pending'
    ).length;
    const inProgressComplaints = weekComplaints.filter(c => 
      c.status === 'in-progress' || c.status === 'progress' || c.status === 'In Progress' || c.status === 'inProgress'
    ).length;
    const underReviewComplaints = weekComplaints.filter(c => 
      c.status === 'review' || c.status === 'under-review' || c.status === 'Under Review' || c.status === 'underReview'
    ).length;

    // Calculate complaints by priority
    const complaintsByPriority = {
      urgent: weekComplaints.filter(c => c.priority === 'urgent' || c.priority === 'Urgent').length,
      high: weekComplaints.filter(c => c.priority === 'high' || c.priority === 'High').length,
      medium: weekComplaints.filter(c => c.priority === 'medium' || c.priority === 'Medium').length,
      low: weekComplaints.filter(c => c.priority === 'low' || c.priority === 'Low').length
    };

    // Calculate complaints by category
    const complaintsByCategory = {
      internet: weekComplaints.filter(c => c.category === 'internet' || c.category === 'Internet').length,
      recharge: weekComplaints.filter(c => c.category === 'recharge' || c.category === 'Recharge').length,
      activation: weekComplaints.filter(c => c.category === 'activation' || c.category === 'Activation').length,
      billing: weekComplaints.filter(c => c.category === 'billing' || c.category === 'Billing').length,
      network: weekComplaints.filter(c => c.category === 'network' || c.category === 'Network').length,
      general: weekComplaints.filter(c => c.category === 'general' || c.category === 'General' || !c.category).length
    };

    // Calculate daily breakdown
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyBreakdown = daysOfWeek.map(day => {
      const dayIndex = daysOfWeek.indexOf(day);
      const dayComplaints = weekComplaints.filter(c => {
        const date = new Date(c.createdAt || c.createdDate || c.date || c.created);
        return date.getDay() === (dayIndex + 1) % 7;
      });
      return {
        day: day,
        complaints: dayComplaints.length,
        resolved: dayComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
        tasks: dayComplaints.filter(c => c.status === 'in-progress' || c.status === 'progress').length
      };
    });

    // Calculate tasks summary
    const tasksSummary = {
      completed: resolvedComplaints,
      pending: pendingComplaints,
      inProgress: inProgressComplaints,
      completionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0
    };

    // Calculate performance metrics
    const totalResponseTime = weekComplaints.reduce((sum, c) => sum + (c.responseTime || 0), 0);
    const avgResponseTime = totalComplaints > 0 ? totalResponseTime / totalComplaints : 0;
    
    const totalSatisfaction = weekComplaints.reduce((sum, c) => sum + (c.satisfaction || 0), 0);
    const customerSatisfaction = totalComplaints > 0 ? totalSatisfaction / totalComplaints : 0;
    
    const totalResolutionTime = weekComplaints.reduce((sum, c) => sum + (c.resolutionTime || 2), 0);
    const avgResolutionTime = totalComplaints > 0 ? totalResolutionTime / totalComplaints : 0;

    // Calculate top complaint types
    const categoryCounts = Object.entries(complaintsByCategory)
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalComplaints > 0 ? (count / totalComplaints) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Calculate week over week growth
    const prevWeekStr = getPreviousWeek(weekStr);
    const prevWeekRange = getWeekRange(prevWeekStr);
    const prevWeekComplaints = complaints.filter(c => {
      const date = new Date(c.createdAt || c.createdDate || c.date || c.created);
      return date >= prevWeekRange.startDate && date <= prevWeekRange.endDate;
    });

    const prevTotal = prevWeekComplaints.length;
    const prevResolved = prevWeekComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
    const prevSatisfaction = prevWeekComplaints.reduce((sum, c) => sum + (c.satisfaction || 0), 0) / (prevWeekComplaints.length || 1);

    const weekOverWeekGrowth = {
      complaints: prevTotal > 0 ? ((totalComplaints - prevTotal) / prevTotal) * 100 : 0,
      resolution: prevResolved > 0 ? ((resolvedComplaints - prevResolved) / prevResolved) * 100 : 0,
      satisfaction: prevSatisfaction > 0 ? ((customerSatisfaction - prevSatisfaction) / prevSatisfaction) * 100 : 0
    };

    return {
      week: weekStr,
      weekRange: {
        start: language === 'np' ? formatNepaliDate(weekRange.startDate) : formatEnglishDate(weekRange.startDate),
        end: language === 'np' ? formatNepaliDate(weekRange.endDate) : formatEnglishDate(weekRange.endDate)
      },
      dailyBreakdown,
      summary: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        inProgressComplaints,
        underReviewComplaints,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        customerSatisfaction: Math.round(customerSatisfaction * 10) / 10
      },
      complaintsByPriority,
      complaintsByCategory,
      tasksSummary: {
        ...tasksSummary,
        completionRate: Math.round(tasksSummary.completionRate)
      },
      performanceMetrics: {
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
        teamProductivity: Math.min(100, Math.round((resolvedComplaints / (totalComplaints || 1)) * 100))
      },
      topComplaintTypes: categoryCounts,
      weekOverWeekGrowth: {
        complaints: Math.round(weekOverWeekGrowth.complaints * 10) / 10,
        resolution: Math.round(weekOverWeekGrowth.resolution * 10) / 10,
        satisfaction: Math.round(weekOverWeekGrowth.satisfaction * 10) / 10
      }
    };
  }, [language]);

  // Get previous week string
  const getPreviousWeek = (weekStr) => {
    const [year, week] = weekStr.split('-W');
    const weekNum = parseInt(week);
    if (weekNum > 1) {
      return `${year}-W${String(weekNum - 1).padStart(2, '0')}`;
    } else {
      return `${parseInt(year) - 1}-W52`;
    }
  };

  // Load complaints from storage
  const loadComplaintsFromStorage = useCallback(() => {
    try {
      const storedComplaints = localStorage.getItem('staffComplaints');
      if (storedComplaints) {
        const complaints = JSON.parse(storedComplaints);
        console.log(`📊 Loaded ${complaints.length} complaints from localStorage`);
        return complaints;
      }
      
      const sampleComplaints = localStorage.getItem('sampleComplaints');
      if (sampleComplaints) {
        const complaints = JSON.parse(sampleComplaints);
        console.log(`📊 Loaded ${complaints.length} complaints from sampleComplaints`);
        return complaints;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading complaints from storage:', error);
      return [];
    }
  }, []);

  // Fetch weekly report - CONNECTED TO SERVER
  const fetchWeeklyReport = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        setBackendStatus('disconnected');
        
        // Generate report from localStorage
        const complaints = loadComplaintsFromStorage();
        const report = generateWeeklyReportFromComplaints(complaints, selectedWeek);
        setReportData(report);
        setLoading(false);
        showToast(
          language === 'np' 
            ? '⚠️ प्रमाणीकरण टोकन फेला परेन। स्थानीय डाटा देखाउँदै।' 
            : '⚠️ Authentication token not found. Showing local data.',
          'warning'
        );
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Try multiple API endpoints
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const { start, end } = getWeekDateRange(selectedWeek);
      
      console.log(`📊 Fetching weekly report for week: ${selectedWeek} (${start} to ${end})`);
      console.log(`🔗 API URL: ${API_URL}`);
      
      let complaints = [];
      let fromBackend = false;
      let allComplaints = [];
      
      // Try to fetch complaints from server
      try {
        // Try endpoint 1: /staff/complaints
        const response = await axios.get(`${API_URL}/staff/complaints`, {
          headers,
          params: { 
            staffId: staffId,
            startDate: start,
            endDate: end
          },
          timeout: 15000
        });
        
        if (response.data && response.data.complaints) {
          complaints = response.data.complaints;
          fromBackend = true;
          console.log(`📊 Found ${complaints.length} complaints from /staff/complaints`);
        }
      } catch (error1) {
        console.warn('Endpoint /staff/complaints failed:', error1.message);
        
        try {
          // Try endpoint 2: /complaints/staff
          const response2 = await axios.get(`${API_URL}/complaints/staff`, {
            headers,
            params: { 
              staffId: staffId,
              startDate: start,
              endDate: end
            },
            timeout: 15000
          });
          
          if (response2.data && response2.data.complaints) {
            complaints = response2.data.complaints;
            fromBackend = true;
            console.log(`📊 Found ${complaints.length} complaints from /complaints/staff`);
          }
        } catch (error2) {
          console.warn('Endpoint /complaints/staff failed:', error2.message);
          
          try {
            // Try endpoint 3: /staff/assigned-complaints
            const response3 = await axios.get(`${API_URL}/staff/assigned-complaints`, {
              headers,
              params: { 
                staffId: staffId,
                startDate: start,
                endDate: end
              },
              timeout: 15000
            });
            
            if (response3.data && response3.data.complaints) {
              complaints = response3.data.complaints;
              fromBackend = true;
              console.log(`📊 Found ${complaints.length} complaints from /staff/assigned-complaints`);
            }
          } catch (error3) {
            console.warn('All server endpoints failed, using localStorage data');
          }
        }
      }

      // If no complaints from backend, use localStorage
      if (complaints.length === 0) {
        const storedComplaints = loadComplaintsFromStorage();
        if (storedComplaints.length > 0) {
          const startDate = new Date(start);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999);
          
          complaints = storedComplaints.filter(c => {
            const complaintDate = new Date(c.createdAt || c.createdDate || c.date || c.created);
            return complaintDate >= startDate && complaintDate <= endDate;
          });
          
          if (complaints.length === 0) {
            complaints = storedComplaints.slice(0, 15);
          }
          
          console.log(`📊 Using ${complaints.length} complaints from localStorage`);
        }
      }

      // Generate report from complaints
      const report = generateWeeklyReportFromComplaints(complaints, selectedWeek);
      setReportData(report);
      
      if (fromBackend && complaints.length > 0) {
        setBackendStatus('connected');
        setConnectionAttempts(0);
        showToast(
          language === 'np' ? '✅ साप्ताहिक रिपोर्ट सफलतापूर्वक लोड गरियो' : '✅ Weekly report loaded successfully',
          'success'
        );
      } else if (complaints.length > 0) {
        setBackendStatus('disconnected');
        showToast(
          language === 'np' 
            ? '⚠️ स्थानीय डाटाबाट साप्ताहिक रिपोर्ट तयार गरियो' 
            : '⚠️ Weekly report generated from local data',
          'warning'
        );
      } else {
        setBackendStatus('disconnected');
        // Ensure we have some data to show
        const fallbackComplaints = loadComplaintsFromStorage();
        if (fallbackComplaints.length > 0) {
          const fallbackReport = generateWeeklyReportFromComplaints(fallbackComplaints, selectedWeek);
          setReportData(fallbackReport);
        }
        showToast(
          language === 'np' 
            ? '⚠️ यस हप्ताको कुनै डाटा फेला परेन। खाली रिपोर्ट देखाउँदै।' 
            : '⚠️ No data found for this week. Showing empty report.',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      
      // Try to get complaints from localStorage as fallback
      const complaints = loadComplaintsFromStorage();
      const report = generateWeeklyReportFromComplaints(complaints, selectedWeek);
      setReportData(report);
      setBackendStatus('disconnected');
      setConnectionAttempts(prev => prev + 1);
      
      if (error.response?.status === 401) {
        showToast(
          language === 'np' 
            ? '❌ सेसन समाप्त भयो। कृपया पुन: लगइन गर्नुहोस्।' 
            : '❌ Session expired. Please login again.',
          'error'
        );
        setTimeout(() => navigate('/'), 1500);
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        showToast(
          language === 'np' 
            ? '⚠️ सर्भरमा जडान हुन सकेन। स्थानीय डाटा देखाउँदै।' 
            : '⚠️ Cannot connect to server. Showing local data.',
          'warning'
        );
      } else {
        showToast(
          language === 'np' 
            ? `⚠️ डाटा लोड गर्न असफल (${error.message || 'अज्ञात त्रुटि'})। स्थानीय डाटा देखाउँदै।` 
            : `⚠️ Failed to load data (${error.message || 'unknown error'}). Showing local data.`,
          'warning'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedWeek, generateWeeklyReportFromComplaints, language, staffId, navigate, loadComplaintsFromStorage]);

  // Generate week options
  const getWeekOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -12; i <= 0; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + (i * 7));
      const start = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
      const week = Math.ceil((days + start.getDay() + 1) / 7);
      const weekStr = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
      const weekRange = getWeekRange(weekStr);
      options.push({
        value: weekStr,
        label: `${weekStr} (${formatEnglishDate(weekRange.startDate)} - ${formatEnglishDate(weekRange.endDate)})`
      });
    }
    return options.reverse();
  };

  // Check authentication and initialize
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      // Ensure local data exists
      ensureLocalData();
      
      // Load complaints from storage first
      const complaints = loadComplaintsFromStorage();
      if (complaints.length > 0) {
        const report = generateWeeklyReportFromComplaints(complaints, selectedWeek);
        setReportData(report);
      }
      
      // Then try to fetch from backend
      fetchWeeklyReport();
    }
  }, [navigate, fetchWeeklyReport, loadComplaintsFromStorage, generateWeeklyReportFromComplaints, selectedWeek, ensureLocalData]);

  // Refresh when week changes
  useEffect(() => {
    if (selectedWeek) {
      fetchWeeklyReport();
    }
  }, [selectedWeek, fetchWeeklyReport]);

  // Refresh when language changes
  useEffect(() => {
    if (reportData) {
      fetchWeeklyReport();
    }
  }, [language]);

  const handleWeekChange = (e) => {
    setSelectedWeek(e.target.value);
  };

  const handleExportReport = () => {
    if (!reportData) {
      showToast(
        language === 'np' ? 'कुनै डाटा निर्यात गर्न उपलब्ध छैन' : 'No data available to export',
        'warning'
      );
      return;
    }
    
    try {
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `weekly_report_${selectedWeek}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      
      showToast(
        language === 'np' ? '✅ रिपोर्ट सफलतापूर्वक निर्यात गरियो' : '✅ Report exported successfully',
        'success'
      );
    } catch (error) {
      console.error('Export error:', error);
      showToast(
        language === 'np' ? '❌ रिपोर्ट निर्यात गर्न असफल' : '❌ Failed to export report',
        'error'
      );
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  const getDayTranslation = (day) => {
    const days = {
      monday: { np: 'सोमबार', en: 'Mon' },
      tuesday: { np: 'मंगलबार', en: 'Tue' },
      wednesday: { np: 'बुधबार', en: 'Wed' },
      thursday: { np: 'बिहीबार', en: 'Thu' },
      friday: { np: 'शुक्रबार', en: 'Fri' },
      saturday: { np: 'शनिबार', en: 'Sat' },
      sunday: { np: 'आइतबार', en: 'Sun' }
    };
    const key = day.toLowerCase();
    return days[key]?.[language] || day.substring(0, 3);
  };

  const content = {
    np: {
      pageTitle: 'साप्ताहिक रिपोर्ट',
      weeklyReport: 'साप्ताहिक रिपोर्ट',
      selectWeek: 'हप्ता चयन गर्नुहोस्',
      reportFor: 'को लागि रिपोर्ट',
      weekRange: 'हप्ता अवधि',
      summary: 'सारांश',
      dailyBreakdown: 'दैनिक विवरण',
      totalComplaints: 'कुल गुनासो',
      resolvedComplaints: 'समाधान गरिएका गुनासो',
      pendingComplaints: 'विचाराधीन',
      inProgressComplaints: 'प्रगतिमा',
      underReviewComplaints: 'समीक्षामा',
      avgResponseTime: 'औसत प्रतिक्रिया समय',
      customerSatisfaction: 'ग्राहक सन्तुष्टि',
      complaintsByPriority: 'प्राथमिकता अनुसार गुनासो',
      complaintsByCategory: 'प्रकार अनुसार गुनासो',
      tasksSummary: 'कार्य सारांश',
      completed: 'पूरा भएको',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      completionRate: 'पूरा हुने दर',
      performanceMetrics: 'प्रदर्शन मेट्रिक्स',
      avgResolutionTime: 'औसत समाधान समय',
      teamProductivity: 'टोली उत्पादकत्व',
      topComplaintTypes: 'शीर्ष गुनासो प्रकारहरू',
      weekOverWeekGrowth: 'हप्ता दर हप्ता वृद्धि',
      complaints: 'गुनासो',
      resolution: 'समाधान',
      satisfaction: 'सन्तुष्टि',
      day: 'दिन',
      complaintsCount: 'गुनासो संख्या',
      resolved: 'समाधान',
      tasks: 'कार्य',
      urgent: 'अत्यावश्यक',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      internet: 'इन्टरनेट',
      recharge: 'रिचार्ज',
      activation: 'सक्रियता',
      billing: 'बिलिङ',
      network: 'नेटवर्क',
      general: 'सामान्य',
      category: 'प्रकार',
      count: 'संख्या',
      percentage: 'प्रतिशत',
      export: 'रिपोर्ट निर्यात गर्नुहोस्',
      print: 'प्रिन्ट गर्नुहोस्',
      refresh: 'रिफ्रेस',
      hours: 'घण्टा',
      days: 'दिन',
      barChart: 'बार चार्ट',
      lineChart: 'लाइन चार्ट',
      loading: 'लोड हुँदै...',
      connectionError: '⚠️ सर्भर जडान भएन। स्थानीय डाटा देखाउँदै।'
    },
    en: {
      pageTitle: 'Weekly Report',
      weeklyReport: 'Weekly Report',
      selectWeek: 'Select Week',
      reportFor: 'Report for',
      weekRange: 'Week Range',
      summary: 'Summary',
      dailyBreakdown: 'Daily Breakdown',
      totalComplaints: 'Total Complaints',
      resolvedComplaints: 'Resolved Complaints',
      pendingComplaints: 'Pending',
      inProgressComplaints: 'In Progress',
      underReviewComplaints: 'Under Review',
      avgResponseTime: 'Avg Response Time',
      customerSatisfaction: 'Customer Satisfaction',
      complaintsByPriority: 'Complaints by Priority',
      complaintsByCategory: 'Complaints by Category',
      tasksSummary: 'Tasks Summary',
      completed: 'Completed',
      pending: 'Pending',
      inProgress: 'In Progress',
      completionRate: 'Completion Rate',
      performanceMetrics: 'Performance Metrics',
      avgResolutionTime: 'Avg Resolution Time',
      teamProductivity: 'Team Productivity',
      topComplaintTypes: 'Top Complaint Types',
      weekOverWeekGrowth: 'Week over Week Growth',
      complaints: 'Complaints',
      resolution: 'Resolution',
      satisfaction: 'Satisfaction',
      day: 'Day',
      complaintsCount: 'Complaints',
      resolved: 'Resolved',
      tasks: 'Tasks',
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      internet: 'Internet',
      recharge: 'Recharge',
      activation: 'Activation',
      billing: 'Billing',
      network: 'Network',
      general: 'General',
      category: 'Category',
      count: 'Count',
      percentage: 'Percentage',
      export: 'Export Report',
      print: 'Print',
      refresh: 'Refresh',
      hours: 'hours',
      days: 'days',
      barChart: 'Bar Chart',
      lineChart: 'Line Chart',
      loading: 'Loading...',
      connectionError: '⚠️ Server connection failed. Showing local data.'
    }
  };

  const t = content[language];

  const weekOptions = getWeekOptions();
  const maxDailyValue = Math.max(...(reportData?.dailyBreakdown?.map(d => d.complaints) || [0]), 1);

  // Loading state
  if (loading && !reportData) {
    return (
      <div className="staff-reports-weekly">
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
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{t.loading}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-reports-weekly">
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
                ⚠️ {t.connectionError}
                {connectionAttempts > 0 && (
                  <span className="connection-attempts">
                    ({language === 'np' ? 'प्रयास' : 'attempt'} {connectionAttempts})
                  </span>
                )}
                <button 
                  className="retry-btn"
                  onClick={fetchWeeklyReport}
                  disabled={loading}
                >
                  {loading ? '...' : '🔄 ' + (language === 'np' ? 'पुन: प्रयास' : 'Retry')}
                </button>
              </div>
            )}

            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">{t.weeklyReport}</h1>
              <div className="header-actions">
                <button className="action-btn export-btn" onClick={handleExportReport}>
                  📥 {t.export}
                </button>
                <button className="action-btn print-btn" onClick={handlePrintReport}>
                  🖨️ {t.print}
                </button>
                <button className="refresh-btn" onClick={fetchWeeklyReport} disabled={loading}>
                  {loading ? '⏳' : '🔄'} {t.refresh}
                </button>
              </div>
            </div>

            {/* Week Selector */}
            <div className="week-selector">
              <label>{t.selectWeek}:</label>
              <select value={selectedWeek} onChange={handleWeekChange} className="week-select">
                {weekOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Report Content */}
            <div className="report-container" id="report-content">
              {/* Report Header */}
              <div className="report-header">
                <h2>{t.weeklyReport}</h2>
                <p>{t.reportFor}: {selectedWeek}</p>
                <p className="week-range">{t.weekRange}: {reportData?.weekRange?.start || '-'} - {reportData?.weekRange?.end || '-'}</p>
                {backendStatus === 'connected' && (
                  <span className="live-indicator">🟢 Live Data</span>
                )}
                {backendStatus === 'disconnected' && (
                  <span className="sample-indicator">🟡 Local Data</span>
                )}
              </div>

              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-icon">📊</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatNumber(reportData?.summary?.totalComplaints || 0)}</div>
                    <div className="summary-label">{t.totalComplaints}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">✅</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatNumber(reportData?.summary?.resolvedComplaints || 0)}</div>
                    <div className="summary-label">{t.resolvedComplaints}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">⏳</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatNumber(reportData?.summary?.pendingComplaints || 0)}</div>
                    <div className="summary-label">{t.pendingComplaints}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">🔄</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatNumber(reportData?.summary?.inProgressComplaints || 0)}</div>
                    <div className="summary-label">{t.inProgressComplaints}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">📝</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatNumber(reportData?.summary?.underReviewComplaints || 0)}</div>
                    <div className="summary-label">{t.underReviewComplaints}</div>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown Chart */}
              <div className="report-section">
                <div className="section-header">
                  <h3>{t.dailyBreakdown}</h3>
                  <div className="chart-toggle">
                    <button 
                      className={`toggle-btn ${chartView === 'bar' ? 'active' : ''}`}
                      onClick={() => setChartView('bar')}
                    >
                      📊 {t.barChart}
                    </button>
                    <button 
                      className={`toggle-btn ${chartView === 'line' ? 'active' : ''}`}
                      onClick={() => setChartView('line')}
                    >
                      📈 {t.lineChart}
                    </button>
                  </div>
                </div>
                <div className="daily-chart">
                  {chartView === 'bar' ? (
                    <div className="bar-chart">
                      {reportData?.dailyBreakdown?.map((day, index) => (
                        <div key={index} className="bar-item">
                          <div className="bar-label">{getDayTranslation(day.day)}</div>
                          <div className="bars-container">
                            <div 
                              className="bar complaints-bar" 
                              style={{ height: `${Math.max((day.complaints / maxDailyValue) * 150, 10)}px` }}
                              title={`${t.complaintsCount}: ${day.complaints}`}
                            >
                              <span className="bar-value">{formatNumber(day.complaints)}</span>
                            </div>
                            <div 
                              className="bar resolved-bar" 
                              style={{ height: `${Math.max((day.resolved / maxDailyValue) * 150, 10)}px` }}
                              title={`${t.resolved}: ${day.resolved}`}
                            >
                              <span className="bar-value">{formatNumber(day.resolved)}</span>
                            </div>
                            <div 
                              className="bar tasks-bar" 
                              style={{ height: `${Math.max((day.tasks / maxDailyValue) * 150, 10)}px` }}
                              title={`${t.tasks}: ${day.tasks}`}
                            >
                              <span className="bar-value">{formatNumber(day.tasks)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="line-chart">
                      <svg viewBox="0 0 800 300" className="line-chart-svg">
                        <defs>
                          <linearGradient id="complaintsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
                            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.05 }} />
                          </linearGradient>
                          <linearGradient id="resolvedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.5 }} />
                            <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.05 }} />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        {[0, 60, 120, 180, 240, 300].map(y => (
                          <line key={y} x1="40" y1={y} x2="760" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                        ))}
                        {/* Axes */}
                        <line x1="40" y1="260" x2="760" y2="260" stroke="#94a3b8" strokeWidth="2" />
                        <line x1="40" y1="20" x2="40" y2="260" stroke="#94a3b8" strokeWidth="2" />
                        {/* Y-axis labels */}
                        {[0, 4, 8, 12, 16, 20].map((val, i) => (
                          <text key={i} x="35" y={260 - (val / 20) * 240} textAnchor="end" fontSize="10" fill="#64748b">
                            {formatNumber(val)}
                          </text>
                        ))}
                        {/* X-axis labels */}
                        {reportData?.dailyBreakdown?.map((day, i) => (
                          <text key={i} x={80 + i * 100} y="275" textAnchor="middle" fontSize="10" fill="#64748b">
                            {getDayTranslation(day.day).substring(0, 3)}
                          </text>
                        ))}
                        {/* Complaints Line */}
                        <polyline
                          points={reportData?.dailyBreakdown?.map((day, i) => `${80 + i * 100},${260 - Math.min((day.complaints / 20) * 240, 240)}`).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                        />
                        {/* Resolved Line */}
                        <polyline
                          points={reportData?.dailyBreakdown?.map((day, i) => `${80 + i * 100},${260 - Math.min((day.resolved / 20) * 240, 240)}`).join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                        {/* Data points */}
                        {reportData?.dailyBreakdown?.map((day, i) => (
                          <circle key={`complaint-${i}`} cx={80 + i * 100} cy={260 - Math.min((day.complaints / 20) * 240, 240)} r="4" fill="#3b82f6" />
                        ))}
                        {reportData?.dailyBreakdown?.map((day, i) => (
                          <circle key={`resolved-${i}`} cx={80 + i * 100} cy={260 - Math.min((day.resolved / 20) * 240, 240)} r="4" fill="#10b981" />
                        ))}
                      </svg>
                      <div className="chart-legend">
                        <span className="legend-item"><span className="legend-color complaints-color"></span> {t.complaintsCount}</span>
                        <span className="legend-item"><span className="legend-color resolved-color"></span> {t.resolved}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="two-columns">
                {/* Complaints by Priority */}
                <div className="report-section">
                  <h3>{t.complaintsByPriority}</h3>
                  <div className="priority-stats">
                    {reportData?.complaintsByPriority?.urgent > 0 && (
                      <div className="priority-item urgent">
                        <span className="priority-label">{t.urgent}</span>
                        <div className="priority-bar">
                          <div className="priority-fill urgent-fill" style={{ width: `${((reportData.complaintsByPriority.urgent || 0) / (reportData.summary.totalComplaints || 1)) * 100}%` }}></div>
                        </div>
                        <span className="priority-count">{formatNumber(reportData.complaintsByPriority.urgent || 0)}</span>
                      </div>
                    )}
                    <div className="priority-item high">
                      <span className="priority-label">{t.high}</span>
                      <div className="priority-bar">
                        <div className="priority-fill high-fill" style={{ width: `${((reportData?.complaintsByPriority?.high || 0) / (reportData?.summary?.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="priority-count">{formatNumber(reportData?.complaintsByPriority?.high || 0)}</span>
                    </div>
                    <div className="priority-item medium">
                      <span className="priority-label">{t.medium}</span>
                      <div className="priority-bar">
                        <div className="priority-fill medium-fill" style={{ width: `${((reportData?.complaintsByPriority?.medium || 0) / (reportData?.summary?.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="priority-count">{formatNumber(reportData?.complaintsByPriority?.medium || 0)}</span>
                    </div>
                    <div className="priority-item low">
                      <span className="priority-label">{t.low}</span>
                      <div className="priority-bar">
                        <div className="priority-fill low-fill" style={{ width: `${((reportData?.complaintsByPriority?.low || 0) / (reportData?.summary?.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="priority-count">{formatNumber(reportData?.complaintsByPriority?.low || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Complaints by Category */}
                <div className="report-section">
                  <h3>{t.complaintsByCategory}</h3>
                  <div className="category-list">
                    <div className="category-item">
                      <span className="category-label">{t.internet}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory?.internet || 0) / (reportData?.summary?.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{formatNumber(reportData?.complaintsByCategory?.internet || 0)}</span>
                    </div>
                    <div className="category-item">
                      <span className="category-label">{t.recharge}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory?.recharge || 0) / (reportData?.summary?.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{formatNumber(reportData?.complaintsByCategory?.recharge || 0)}</span>
                    </div>
                    <div className="category-item">
                      <span className="category-label">{t.activation}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory?.activation || 0) / (reportData?.summary?.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{formatNumber(reportData?.complaintsByCategory?.activation || 0)}</span>
                    </div>
                    <div className="category-item">
                      <span className="category-label">{t.billing}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory?.billing || 0) / (reportData?.summary?.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{formatNumber(reportData?.complaintsByCategory?.billing || 0)}</span>
                    </div>
                    <div className="category-item">
                      <span className="category-label">{t.network}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory?.network || 0) / (reportData?.summary?.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{formatNumber(reportData?.complaintsByCategory?.network || 0)}</span>
                    </div>
                    <div className="category-item">
                      <span className="category-label">{t.general}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory?.general || 0) / (reportData?.summary?.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{formatNumber(reportData?.complaintsByCategory?.general || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Summary */}
              <div className="report-section">
                <h3>{t.tasksSummary}</h3>
                <div className="tasks-stats">
                  <div className="task-stat">
                    <div className="task-icon">✅</div>
                    <div className="task-info">
                      <div className="task-value">{formatNumber(reportData?.tasksSummary?.completed || 0)}</div>
                      <div className="task-label">{t.completed}</div>
                    </div>
                  </div>
                  <div className="task-stat">
                    <div className="task-icon">⏳</div>
                    <div className="task-info">
                      <div className="task-value">{formatNumber(reportData?.tasksSummary?.pending || 0)}</div>
                      <div className="task-label">{t.pending}</div>
                    </div>
                  </div>
                  <div className="task-stat">
                    <div className="task-icon">🔄</div>
                    <div className="task-info">
                      <div className="task-value">{formatNumber(reportData?.tasksSummary?.inProgress || 0)}</div>
                      <div className="task-label">{t.inProgress}</div>
                    </div>
                  </div>
                  <div className="task-stat">
                    <div className="task-icon">📊</div>
                    <div className="task-info">
                      <div className="task-value">{formatPercentage(reportData?.tasksSummary?.completionRate || 0)}</div>
                      <div className="task-label">{t.completionRate}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="report-section">
                <h3>{t.performanceMetrics}</h3>
                <div className="metrics-cards">
                  <div className="metric-card">
                    <div className="metric-value">{formatDecimal(reportData?.performanceMetrics?.avgResolutionTime || 0)} {t.days}</div>
                    <div className="metric-label">{t.avgResolutionTime}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{formatDecimal(reportData?.performanceMetrics?.avgResponseTime || 0)} {t.hours}</div>
                    <div className="metric-label">{t.avgResponseTime}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{formatDecimal(reportData?.performanceMetrics?.customerSatisfaction || 0)}/5</div>
                    <div className="metric-label">{t.customerSatisfaction}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{formatPercentage(reportData?.performanceMetrics?.teamProductivity || 0)}</div>
                    <div className="metric-label">{t.teamProductivity}</div>
                  </div>
                </div>
              </div>

              {/* Top Complaint Types */}
              <div className="report-section">
                <h3>{t.topComplaintTypes}</h3>
                <div className="top-complaints">
                  {reportData?.topComplaintTypes?.map((item, index) => (
                    <div key={index} className="complaint-type-item">
                      <div className="complaint-type-info">
                        <span className="complaint-type-name">{t[item.category] || item.category}</span>
                        <span className="complaint-type-count">{formatNumber(item.count)} ({formatDecimal(item.percentage)}%)</span>
                      </div>
                      <div className="complaint-type-bar">
                        <div className="complaint-type-fill" style={{ width: `${Math.min(item.percentage, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Week over Week Growth */}
              <div className="report-section">
                <h3>{t.weekOverWeekGrowth}</h3>
                <div className="growth-stats">
                  <div className={`growth-card ${(reportData?.weekOverWeekGrowth?.complaints || 0) >= 0 ? 'positive' : 'negative'}`}>
                    <div className="growth-icon">{reportData?.weekOverWeekGrowth?.complaints >= 0 ? '📈' : '📉'}</div>
                    <div className="growth-info">
                      <div className={`growth-value ${(reportData?.weekOverWeekGrowth?.complaints || 0) >= 0 ? 'positive' : 'negative'}`}>
                        {formatDecimal(Math.abs(reportData?.weekOverWeekGrowth?.complaints || 0))}%
                        {(reportData?.weekOverWeekGrowth?.complaints || 0) >= 0 ? '↑' : '↓'}
                      </div>
                      <div className="growth-label">{t.complaints}</div>
                    </div>
                  </div>
                  <div className={`growth-card ${(reportData?.weekOverWeekGrowth?.resolution || 0) >= 0 ? 'positive' : 'negative'}`}>
                    <div className="growth-icon">{reportData?.weekOverWeekGrowth?.resolution >= 0 ? '🎯' : '📉'}</div>
                    <div className="growth-info">
                      <div className={`growth-value ${(reportData?.weekOverWeekGrowth?.resolution || 0) >= 0 ? 'positive' : 'negative'}`}>
                        {formatDecimal(Math.abs(reportData?.weekOverWeekGrowth?.resolution || 0))}%
                        {(reportData?.weekOverWeekGrowth?.resolution || 0) >= 0 ? '↑' : '↓'}
                      </div>
                      <div className="growth-label">{t.resolution}</div>
                    </div>
                  </div>
                  <div className={`growth-card ${(reportData?.weekOverWeekGrowth?.satisfaction || 0) >= 0 ? 'positive' : 'negative'}`}>
                    <div className="growth-icon">{reportData?.weekOverWeekGrowth?.satisfaction >= 0 ? '⭐' : '📉'}</div>
                    <div className="growth-info">
                      <div className={`growth-value ${(reportData?.weekOverWeekGrowth?.satisfaction || 0) >= 0 ? 'positive' : 'negative'}`}>
                        {formatDecimal(Math.abs(reportData?.weekOverWeekGrowth?.satisfaction || 0))}%
                        {(reportData?.weekOverWeekGrowth?.satisfaction || 0) >= 0 ? '↑' : '↓'}
                      </div>
                      <div className="growth-label">{t.satisfaction}</div>
                    </div>
                  </div>
                </div>
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

        .staff-reports-weekly {
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
          background: #fef3c7;
          color: #92400e;
          padding: 10px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          border: 1px solid #f59e0b;
        }

        .connection-attempts {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .retry-btn {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .retry-btn:hover {
          background: #d97706;
        }

        .retry-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action-btn, .refresh-btn {
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
        }

        .action-btn:disabled, .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .export-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .print-btn {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
        }

        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          color: #475569;
        }

        .action-btn:hover:not(:disabled), .refresh-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .week-selector {
          background: white;
          padding: 16px 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .week-selector label {
          font-weight: 600;
          color: #0f172a;
        }

        .week-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          min-width: 250px;
        }

        .report-container {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .report-header {
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          text-align: center;
          position: relative;
        }

        .report-header h2 {
          font-size: 1.3rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .report-header p {
          color: #64748b;
        }

        .week-range {
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .live-indicator {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
          background: #d1fae5;
          color: #059669;
          margin-top: 8px;
        }

        .sample-indicator {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
          background: #fef3c7;
          color: #d97706;
          margin-top: 8px;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .summary-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .summary-icon {
          font-size: 1.8rem;
        }

        .summary-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .summary-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        .report-section {
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .report-section:last-child {
          border-bottom: none;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .report-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          padding-left: 12px;
          border-left: 3px solid #0288d1;
        }

        .chart-toggle {
          display: flex;
          gap: 8px;
        }

        .toggle-btn {
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          background: #0288d1;
          color: white;
          border-color: #0288d1;
        }

        .daily-chart {
          min-height: 300px;
        }

        .bar-chart {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          gap: 20px;
          padding: 20px 0;
          flex-wrap: wrap;
        }

        .bar-item {
          flex: 1;
          text-align: center;
          min-width: 80px;
        }

        .bar-label {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 8px;
        }

        .bars-container {
          display: flex;
          justify-content: center;
          gap: 8px;
          align-items: flex-end;
          height: 200px;
        }

        .bar {
          width: 40px;
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: height 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          min-height: 10px;
        }

        .complaints-bar { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .resolved-bar { background: linear-gradient(135deg, #10b981, #059669); }
        .tasks-bar { background: linear-gradient(135deg, #f59e0b, #d97706); }

        .bar-value {
          font-size: 0.7rem;
          color: white;
          margin-bottom: 4px;
        }

        .line-chart {
          overflow-x: auto;
          padding: 20px 0;
        }

        .line-chart-svg {
          width: 100%;
          min-width: 800px;
          height: 300px;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .complaints-color { background: #3b82f6; }
        .resolved-color { background: #10b981; }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 24px;
        }

        .priority-stats, .category-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .priority-item, .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .priority-label, .category-label {
          width: 100px;
          font-weight: 500;
        }

        .priority-bar, .category-bar {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .priority-fill, .category-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .urgent-fill { background: #b91c1c; }
        .high-fill { background: #dc2626; }
        .medium-fill { background: #f59e0b; }
        .low-fill { background: #10b981; }
        .category-fill { background: #0288d1; }

        .priority-count, .category-count {
          width: 35px;
          text-align: right;
          font-weight: 500;
        }

        .tasks-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .task-stat {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.2s;
        }

        .task-stat:hover {
          transform: translateY(-2px);
        }

        .task-icon {
          font-size: 1.5rem;
        }

        .task-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .task-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        .metrics-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .metric-card {
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: transform 0.2s;
        }

        .metric-card:hover {
          transform: translateY(-2px);
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0288d1;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #475569;
          margin-top: 4px;
        }

        .top-complaints {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .complaint-type-item {
          width: 100%;
        }

        .complaint-type-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 0.8rem;
        }

        .complaint-type-name {
          font-weight: 500;
          color: #0f172a;
        }

        .complaint-type-count {
          color: #64748b;
        }

        .complaint-type-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .complaint-type-fill {
          height: 100%;
          background: linear-gradient(135deg, #0288d1, #0ea5e9);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .growth-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .growth-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.2s;
        }

        .growth-card:hover {
          transform: translateY(-2px);
        }

        .growth-card.positive {
          border-left: 3px solid #10b981;
        }

        .growth-card.negative {
          border-left: 3px solid #ef4444;
        }

        .growth-icon {
          font-size: 1.5rem;
        }

        .growth-value {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .growth-value.positive {
          color: #10b981;
        }

        .growth-value.negative {
          color: #ef4444;
        }

        .growth-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        @media print {
          .staff-reports-weekly {
            height: auto;
            overflow: visible;
          }
          
          .dashboard-layout {
            margin-top: 0;
            height: auto;
          }
          
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          
          .staff-header, .staff-sidebar, .refresh-btn, .action-btn, .week-selector, .backend-warning, .chart-toggle, .toast-notification {
            display: none;
          }
        }

        @media (max-width: 1200px) {
          .summary-cards {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .two-columns {
            grid-template-columns: 1fr;
          }
          
          .tasks-stats, .metrics-cards, .growth-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .tasks-stats, .metrics-cards, .growth-stats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .staff-reports-weekly {
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
          
          .summary-cards {
            grid-template-columns: 1fr;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .bar-chart {
            flex-direction: column;
            align-items: stretch;
          }
          
          .bars-container {
            height: 120px;
          }
          
          .bar {
            width: 100%;
          }
          
          .toast-notification {
            top: auto;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
            padding: 12px;
          }
          
          .summary-card {
            padding: 12px;
          }
          
          .summary-value {
            font-size: 1rem;
          }
          
          .week-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffReportsWeekly;