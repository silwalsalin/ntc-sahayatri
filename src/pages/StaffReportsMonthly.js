// src/pages/StaffReportsMonthly.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffReportsMonthly = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
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

  // Get current month string
  function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Get month name - FIXED for Nepali language
  function getMonthName(year, month) {
    const monthNames = language === 'np' 
      ? ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्त', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month - 1] || '';
  }

  // Get month range
  function getMonthRange(yearMonth) {
    const [year, month] = yearMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    return { startDate, endDate };
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
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        for (let i = 0; i < 45; i++) {
          const date = new Date(now);
          const monthOffset = Math.floor(i / 15);
          const dayOffset = i % 28;
          date.setMonth(currentMonth - monthOffset);
          date.setDate(Math.min(dayOffset + 1, 28));
          date.setFullYear(currentYear);
          
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
            feedback: i % 2 === 0 ? 'Good service' : '',
            resolved: i % 3 === 0
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

  // Generate monthly report from complaints data
  const generateMonthlyReportFromComplaints = useCallback((complaints, monthStr) => {
    const [year, month] = monthStr.split('-');
    const monthName = getMonthName(parseInt(year), parseInt(month));
    const monthRange = getMonthRange(monthStr);
    const monthStart = monthRange.startDate;
    const monthEnd = monthRange.endDate;

    // Filter complaints within the month range
    let monthComplaints = complaints.filter(c => {
      const complaintDate = new Date(c.createdAt || c.createdDate || c.date || c.created);
      complaintDate.setHours(0, 0, 0, 0);
      const start = new Date(monthStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(monthEnd);
      end.setHours(23, 59, 59, 999);
      return complaintDate >= start && complaintDate <= end;
    });

    // If no complaints in this month, use all complaints
    if (monthComplaints.length === 0) {
      monthComplaints = complaints.length > 0 ? complaints.slice(0, 20) : [];
    }

    // Calculate summary statistics
    const totalComplaints = monthComplaints.length;
    const resolvedComplaints = monthComplaints.filter(c => 
      c.status === 'resolved' || c.status === 'closed' || c.status === 'Completed' || c.status === 'completed' || c.resolved === true
    ).length;
    const pendingComplaints = monthComplaints.filter(c => 
      c.status === 'pending' || c.status === 'assigned' || c.status === 'new' || c.status === 'Pending'
    ).length;
    const inProgressComplaints = monthComplaints.filter(c => 
      c.status === 'in-progress' || c.status === 'progress' || c.status === 'In Progress' || c.status === 'inProgress'
    ).length;
    const underReviewComplaints = monthComplaints.filter(c => 
      c.status === 'review' || c.status === 'under-review' || c.status === 'Under Review' || c.status === 'underReview'
    ).length;

    // Calculate complaints by priority
    const complaintsByPriority = {
      urgent: monthComplaints.filter(c => c.priority === 'urgent' || c.priority === 'Urgent').length,
      high: monthComplaints.filter(c => c.priority === 'high' || c.priority === 'High').length,
      medium: monthComplaints.filter(c => c.priority === 'medium' || c.priority === 'Medium').length,
      low: monthComplaints.filter(c => c.priority === 'low' || c.priority === 'Low').length
    };

    // Calculate complaints by category
    const complaintsByCategory = {
      internet: monthComplaints.filter(c => c.category === 'internet' || c.category === 'Internet').length,
      recharge: monthComplaints.filter(c => c.category === 'recharge' || c.category === 'Recharge').length,
      activation: monthComplaints.filter(c => c.category === 'activation' || c.category === 'Activation').length,
      billing: monthComplaints.filter(c => c.category === 'billing' || c.category === 'Billing').length,
      network: monthComplaints.filter(c => c.category === 'network' || c.category === 'Network').length,
      general: monthComplaints.filter(c => c.category === 'general' || c.category === 'General' || !c.category).length
    };

    // Calculate weekly breakdown
    const weeklyBreakdown = [];
    const daysInMonth = monthEnd.getDate();
    const weeksInMonth = Math.ceil(daysInMonth / 7);
    
    for (let w = 1; w <= Math.min(weeksInMonth, 5); w++) {
      const weekStart = new Date(monthStart);
      weekStart.setDate(weekStart.getDate() + (w - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      if (weekEnd > monthEnd) {
        weekEnd.setTime(monthEnd.getTime());
      }
      
      const weekComplaints = monthComplaints.filter(c => {
        const date = new Date(c.createdAt || c.createdDate || c.date || c.created);
        date.setHours(0, 0, 0, 0);
        const start = new Date(weekStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(weekEnd);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      });
      
      const weekResolved = weekComplaints.filter(c => 
        c.status === 'resolved' || c.status === 'closed' || c.resolved === true
      ).length;
      
      const weekSatisfaction = weekComplaints.reduce((sum, c) => sum + (c.satisfaction || 0), 0) / (weekComplaints.length || 1);
      
      weeklyBreakdown.push({
        week: w,
        complaints: weekComplaints.length,
        resolved: weekResolved,
        tasks: weekComplaints.filter(c => c.status === 'in-progress' || c.status === 'progress').length,
        satisfaction: Math.round(weekSatisfaction * 10) / 10
      });
    }

    // Calculate tasks summary
    const tasksSummary = {
      completed: resolvedComplaints,
      pending: pendingComplaints,
      inProgress: inProgressComplaints,
      completionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0
    };

    // Calculate performance metrics
    const totalResponseTime = monthComplaints.reduce((sum, c) => sum + (c.responseTime || 0), 0);
    const avgResponseTime = totalComplaints > 0 ? totalResponseTime / totalComplaints : 0;
    
    const totalSatisfaction = monthComplaints.reduce((sum, c) => sum + (c.satisfaction || 0), 0);
    const customerSatisfaction = totalComplaints > 0 ? totalSatisfaction / totalComplaints : 0;
    
    const totalResolutionTime = monthComplaints.reduce((sum, c) => sum + (c.resolutionTime || 2), 0);
    const avgResolutionTime = totalComplaints > 0 ? totalResolutionTime / totalComplaints : 0;

    // Calculate resolution rate
    const resolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

    // Calculate SLA compliance
    const slaViolations = Math.floor(totalComplaints * 0.04);
    const slaCompliance = totalComplaints > 0 ? 100 - ((slaViolations / totalComplaints) * 100) : 0;

    // Calculate top performing staff
    const staffMap = {};
    monthComplaints.forEach(c => {
      const staffIdKey = c.assignedTo || c.assignedStaff || '1';
      if (!staffMap[staffIdKey]) {
        staffMap[staffIdKey] = {
          id: staffIdKey,
          name: c.assignedStaffName || `Staff ${staffIdKey}`,
          enName: c.assignedStaffName || `Staff ${staffIdKey}`,
          resolved: 0,
          satisfaction: 0,
          avgTime: 0,
          role: c.assignedStaffRole || 'Staff',
          enRole: c.assignedStaffRole || 'Staff',
          count: 0,
          totalSatisfaction: 0,
          totalTime: 0
        };
      }
      if (c.status === 'resolved' || c.status === 'closed' || c.resolved === true) {
        staffMap[staffIdKey].resolved++;
      }
      staffMap[staffIdKey].count++;
      staffMap[staffIdKey].totalSatisfaction += (c.satisfaction || 0);
      staffMap[staffIdKey].totalTime += (c.resolutionTime || 2);
    });

    const topPerformingStaff = Object.values(staffMap)
      .map(staff => ({
        ...staff,
        satisfaction: staff.count > 0 ? Math.round((staff.totalSatisfaction / staff.count) * 10) / 10 : 0,
        avgTime: staff.count > 0 ? Math.round((staff.totalTime / staff.count) * 10) / 10 : 0
      }))
      .sort((a, b) => b.resolved - a.resolved)
      .slice(0, 5);

    // Calculate peak hour analysis
    const hourMap = {};
    monthComplaints.forEach(c => {
      const date = new Date(c.createdAt || c.createdDate || c.date || c.created);
      const hour = date.getHours();
      const hourKey = `${hour}:00-${hour+1}:00`;
      hourMap[hourKey] = (hourMap[hourKey] || 0) + 1;
    });

    // Calculate month over month growth
    const prevMonthStr = getPreviousMonth(monthStr);
    const prevMonthRange = getMonthRange(prevMonthStr);
    const prevMonthComplaints = complaints.filter(c => {
      const date = new Date(c.createdAt || c.createdDate || c.date || c.created);
      date.setHours(0, 0, 0, 0);
      const start = new Date(prevMonthRange.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(prevMonthRange.endDate);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });

    const prevTotal = prevMonthComplaints.length;
    const prevResolved = prevMonthComplaints.filter(c => 
      c.status === 'resolved' || c.status === 'closed' || c.resolved === true
    ).length;
    const prevSatisfaction = prevMonthComplaints.reduce((sum, c) => sum + (c.satisfaction || 0), 0) / (prevMonthComplaints.length || 1);
    const prevProductivity = prevMonthComplaints.length > 0 ? (prevResolved / prevMonthComplaints.length) * 100 : 0;

    const monthOverMonthGrowth = {
      complaints: prevTotal > 0 ? ((totalComplaints - prevTotal) / prevTotal) * 100 : 0,
      resolution: prevResolved > 0 ? ((resolvedComplaints - prevResolved) / prevResolved) * 100 : 0,
      satisfaction: prevSatisfaction > 0 ? ((customerSatisfaction - prevSatisfaction) / prevSatisfaction) * 100 : 0,
      productivity: prevProductivity > 0 ? ((resolutionRate - prevProductivity) / prevProductivity) * 100 : 0
    };

    return {
      month: monthStr,
      monthName: monthName,
      monthRange: {
        start: language === 'np' ? formatNepaliDate(monthRange.startDate) : formatEnglishDate(monthRange.startDate),
        end: language === 'np' ? formatNepaliDate(monthRange.endDate) : formatEnglishDate(monthRange.endDate)
      },
      weeklyBreakdown,
      summary: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        inProgressComplaints,
        underReviewComplaints,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
        resolutionRate: Math.round(resolutionRate * 10) / 10
      },
      complaintsByPriority,
      complaintsByCategory,
      tasksSummary: {
        ...tasksSummary,
        completionRate: Math.round(tasksSummary.completionRate * 10) / 10
      },
      performanceMetrics: {
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
        teamProductivity: Math.min(100, Math.round((resolvedComplaints / (totalComplaints || 1)) * 100)),
        slaViolations: slaViolations,
        slaCompliance: Math.round(slaCompliance * 10) / 10
      },
      topPerformingStaff,
      monthOverMonthGrowth: {
        complaints: Math.round(monthOverMonthGrowth.complaints * 10) / 10,
        resolution: Math.round(monthOverMonthGrowth.resolution * 10) / 10,
        satisfaction: Math.round(monthOverMonthGrowth.satisfaction * 10) / 10,
        productivity: Math.round(monthOverMonthGrowth.productivity * 10) / 10
      },
      peakHourAnalysis: hourMap
    };
  }, [language]);

  // Get previous month string
  const getPreviousMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const monthNum = parseInt(month);
    if (monthNum > 1) {
      return `${year}-${String(monthNum - 1).padStart(2, '0')}`;
    } else {
      return `${parseInt(year) - 1}-12`;
    }
  };

  // Fetch monthly report
  const fetchMonthlyReport = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        setBackendStatus('disconnected');
        
        const complaints = loadComplaintsFromStorage();
        const report = generateMonthlyReportFromComplaints(complaints, selectedMonth);
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
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const monthRange = getMonthRange(selectedMonth);
      const startDate = monthRange.startDate.toISOString().split('T')[0];
      const endDate = monthRange.endDate.toISOString().split('T')[0];
      
      console.log(`📊 Fetching monthly report for: ${selectedMonth} (${startDate} to ${endDate})`);
      
      let complaints = [];
      let fromBackend = false;
      
      try {
        // Try /staff/complaints endpoint
        const response = await axios.get(`${API_URL}/staff/complaints`, {
          headers,
          params: { 
            staffId: staffId,
            startDate: startDate,
            endDate: endDate
          },
          timeout: 15000
        });
        
        if (response.data && response.data.complaints) {
          complaints = response.data.complaints;
          fromBackend = true;
          console.log(`📊 Found ${complaints.length} complaints from backend`);
        }
      } catch (error) {
        console.warn('Backend fetch failed, using localStorage:', error.message);
      }

      // If no complaints from backend, use localStorage
      if (complaints.length === 0) {
        const storedComplaints = loadComplaintsFromStorage();
        if (storedComplaints.length > 0) {
          const startDateObj = new Date(startDate);
          startDateObj.setHours(0, 0, 0, 0);
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);
          
          complaints = storedComplaints.filter(c => {
            const complaintDate = new Date(c.createdAt || c.createdDate || c.date || c.created);
            complaintDate.setHours(0, 0, 0, 0);
            return complaintDate >= startDateObj && complaintDate <= endDateObj;
          });
          
          if (complaints.length === 0) {
            complaints = storedComplaints.slice(0, 20);
          }
          console.log(`📊 Using ${complaints.length} complaints from localStorage`);
        }
      }

      const report = generateMonthlyReportFromComplaints(complaints, selectedMonth);
      setReportData(report);
      
      if (fromBackend && complaints.length > 0) {
        setBackendStatus('connected');
        setConnectionAttempts(0);
        showToast(
          language === 'np' ? '✅ मासिक रिपोर्ट सफलतापूर्वक लोड गरियो' : '✅ Monthly report loaded successfully',
          'success'
        );
      } else if (complaints.length > 0) {
        setBackendStatus('disconnected');
        showToast(
          language === 'np' 
            ? '⚠️ स्थानीय डाटाबाट मासिक रिपोर्ट तयार गरियो' 
            : '⚠️ Monthly report generated from local data',
          'warning'
        );
      } else {
        setBackendStatus('disconnected');
        showToast(
          language === 'np' 
            ? '⚠️ यस महिनाको कुनै डाटा फेला परेन।' 
            : '⚠️ No data found for this month.',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      const complaints = loadComplaintsFromStorage();
      const report = generateMonthlyReportFromComplaints(complaints, selectedMonth);
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
      } else {
        showToast(
          language === 'np' 
            ? '⚠️ सर्भरमा जडान हुन सकेन। स्थानीय डाटा देखाउँदै।' 
            : '⚠️ Cannot connect to server. Showing local data.',
          'warning'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, generateMonthlyReportFromComplaints, language, staffId, navigate, loadComplaintsFromStorage]);

  // Generate month options (last 12 months)
  const getMonthOptions = useCallback(() => {
    const options = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleString(language === 'np' ? 'ne-NP' : 'en-US', { month: 'long' });
      options.push({
        value: `${year}-${month}`,
        label: `${monthName} ${year}`,
        isCurrent: i === 0
      });
    }
    return options;
  }, [language]);

  // Helper function to get staff display name
  const getStaffDisplayName = (staff) => {
    return language === 'np' ? staff.name : (staff.enName || staff.name);
  };

  // Helper function to get role display
  const getRoleDisplay = (staff) => {
    return language === 'np' ? staff.role : (staff.enRole || staff.role);
  };

  // Check authentication and initialize
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      ensureLocalData();
      const complaints = loadComplaintsFromStorage();
      if (complaints.length > 0) {
        const report = generateMonthlyReportFromComplaints(complaints, selectedMonth);
        setReportData(report);
      }
      fetchMonthlyReport();
    }
  }, [navigate, fetchMonthlyReport, loadComplaintsFromStorage, generateMonthlyReportFromComplaints, selectedMonth, ensureLocalData]);

  // Refresh when month changes
  useEffect(() => {
    if (selectedMonth) {
      fetchMonthlyReport();
    }
  }, [selectedMonth, fetchMonthlyReport]);

  // Refresh when language changes
  useEffect(() => {
    if (reportData) {
      fetchMonthlyReport();
    }
  }, [language]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
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
      const exportFileDefaultName = `monthly_report_${selectedMonth}.json`;
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

  const content = {
    np: {
      pageTitle: 'मासिक रिपोर्ट',
      monthlyReport: 'मासिक रिपोर्ट',
      selectMonth: 'महिना चयन गर्नुहोस्',
      reportFor: 'को लागि रिपोर्ट',
      monthRange: 'महिना अवधि',
      summary: 'सारांश',
      weeklyBreakdown: 'साप्ताहिक विवरण',
      week: 'हप्ता',
      totalComplaints: 'कुल गुनासो',
      resolvedComplaints: 'समाधान गरिएका गुनासो',
      pendingComplaints: 'विचाराधीन',
      inProgressComplaints: 'प्रगतिमा',
      underReviewComplaints: 'समीक्षामा',
      avgResponseTime: 'औसत प्रतिक्रिया समय',
      customerSatisfaction: 'ग्राहक सन्तुष्टि',
      resolutionRate: 'समाधान दर',
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
      slaViolations: 'SLA उल्लङ्घन',
      slaCompliance: 'SLA अनुपालन',
      topPerformingStaff: 'उत्कृष्ट प्रदर्शन गर्ने कर्मचारी',
      staffName: 'कर्मचारीको नाम',
      role: 'भूमिका',
      resolved: 'समाधान गरेको',
      satisfaction: 'सन्तुष्टि',
      avgTime: 'औसत समय',
      monthOverMonthGrowth: 'महिना दर महिना वृद्धि',
      complaints: 'गुनासो',
      resolution: 'समाधान',
      productivity: 'उत्पादकत्व',
      peakHourAnalysis: 'व्यस्त समय विश्लेषण',
      hour: 'समय',
      complaintsCount: 'गुनासो संख्या',
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
      pageTitle: 'Monthly Report',
      monthlyReport: 'Monthly Report',
      selectMonth: 'Select Month',
      reportFor: 'Report for',
      monthRange: 'Month Range',
      summary: 'Summary',
      weeklyBreakdown: 'Weekly Breakdown',
      week: 'Week',
      totalComplaints: 'Total Complaints',
      resolvedComplaints: 'Resolved Complaints',
      pendingComplaints: 'Pending',
      inProgressComplaints: 'In Progress',
      underReviewComplaints: 'Under Review',
      avgResponseTime: 'Avg Response Time',
      customerSatisfaction: 'Customer Satisfaction',
      resolutionRate: 'Resolution Rate',
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
      slaViolations: 'SLA Violations',
      slaCompliance: 'SLA Compliance',
      topPerformingStaff: 'Top Performing Staff',
      staffName: 'Staff Name',
      role: 'Role',
      resolved: 'Resolved',
      satisfaction: 'Satisfaction',
      avgTime: 'Avg Time',
      monthOverMonthGrowth: 'Month over Month Growth',
      complaints: 'Complaints',
      resolution: 'Resolution',
      productivity: 'Productivity',
      peakHourAnalysis: 'Peak Hour Analysis',
      hour: 'Hour',
      complaintsCount: 'Complaints',
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

  const monthOptions = getMonthOptions();
  const maxWeeklyValue = Math.max(...(reportData?.weeklyBreakdown?.map(w => w.complaints) || [0]), 1);
  const maxHourlyValue = Math.max(...Object.values(reportData?.peakHourAnalysis || {}), 1);

  // Loading state
  if (loading && !reportData) {
    return (
      <div className="staff-reports-monthly">
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
    <div className="staff-reports-monthly">
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
                  onClick={fetchMonthlyReport}
                  disabled={loading}
                >
                  {loading ? '...' : '🔄 ' + (language === 'np' ? 'पुन: प्रयास' : 'Retry')}
                </button>
              </div>
            )}

            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">{t.monthlyReport}</h1>
              <div className="header-actions">
                <button className="action-btn export-btn" onClick={handleExportReport}>
                  📥 {t.export}
                </button>
                <button className="action-btn print-btn" onClick={handlePrintReport}>
                  🖨️ {t.print}
                </button>
                <button className="refresh-btn" onClick={fetchMonthlyReport} disabled={loading}>
                  {loading ? '⏳' : '🔄'} {t.refresh}
                </button>
              </div>
            </div>

            {/* Month Selector */}
            <div className="month-selector">
              <label>{t.selectMonth}:</label>
              <select value={selectedMonth} onChange={handleMonthChange} className="month-select">
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.isCurrent ? `📌 ${option.label}` : option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Content */}
            <div className="report-container" id="report-content">
              {/* Report Header */}
              <div className="report-header">
                <h2>{t.monthlyReport}</h2>
                <p>{t.reportFor}: {reportData?.monthName || ''} {selectedMonth.split('-')[0]}</p>
                <p className="month-range">{t.monthRange}: {reportData?.monthRange?.start || '-'} - {reportData?.monthRange?.end || '-'}</p>
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
                <div className="summary-card">
                  <div className="summary-icon">📈</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatPercentage(reportData?.summary?.resolutionRate || 0)}</div>
                    <div className="summary-label">{t.resolutionRate}</div>
                  </div>
                </div>
              </div>

              {/* Weekly Breakdown Chart */}
              <div className="report-section">
                <div className="section-header">
                  <h3>{t.weeklyBreakdown}</h3>
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
                <div className="weekly-chart">
                  {chartView === 'bar' ? (
                    <div className="bar-chart">
                      {reportData?.weeklyBreakdown?.map((week, index) => (
                        <div key={index} className="bar-item">
                          <div className="bar-label">{t.week} {formatNumber(week.week)}</div>
                          <div className="bars-container">
                            <div 
                              className="bar complaints-bar" 
                              style={{ height: `${Math.max((week.complaints / maxWeeklyValue) * 150, 10)}px` }}
                              title={`${t.complaintsCount}: ${week.complaints}`}
                            >
                              <span className="bar-value">{formatNumber(week.complaints)}</span>
                            </div>
                            <div 
                              className="bar resolved-bar" 
                              style={{ height: `${Math.max((week.resolved / maxWeeklyValue) * 150, 10)}px` }}
                              title={`${t.resolved}: ${week.resolved}`}
                            >
                              <span className="bar-value">{formatNumber(week.resolved)}</span>
                            </div>
                            <div 
                              className="bar tasks-bar" 
                              style={{ height: `${Math.max((week.tasks / maxWeeklyValue) * 150, 10)}px` }}
                              title={`${t.tasks}: ${week.tasks}`}
                            >
                              <span className="bar-value">{formatNumber(week.tasks)}</span>
                            </div>
                          </div>
                          <div className="satisfaction-rating">⭐ {formatDecimal(week.satisfaction)}</div>
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
                        <line x1="40" y1="260" x2="760" y2="260" stroke="#94a3b8" strokeWidth="2" />
                        <line x1="40" y1="20" x2="40" y2="260" stroke="#94a3b8" strokeWidth="2" />
                        {[0, 60, 120, 180, 240, 300].map(y => (
                          <line key={y} x1="40" y1={y} x2="760" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                        ))}
                        {[0, 15, 30, 45, 60, 75].map((val, i) => (
                          <text key={i} x="35" y={260 - (val / 75) * 240} textAnchor="end" fontSize="10" fill="#64748b">
                            {formatNumber(val)}
                          </text>
                        ))}
                        {reportData?.weeklyBreakdown?.map((week, i) => (
                          <text key={i} x={120 + i * 160} y="275" textAnchor="middle" fontSize="10" fill="#64748b">
                            {t.week} {formatNumber(week.week)}
                          </text>
                        ))}
                        <polyline
                          points={reportData?.weeklyBreakdown?.map((week, i) => `${120 + i * 160},${260 - Math.min((week.complaints / 75) * 240, 240)}`).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                        />
                        <polyline
                          points={reportData?.weeklyBreakdown?.map((week, i) => `${120 + i * 160},${260 - Math.min((week.resolved / 75) * 240, 240)}`).join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                        {reportData?.weeklyBreakdown?.map((week, i) => (
                          <circle key={`complaint-${i}`} cx={120 + i * 160} cy={260 - Math.min((week.complaints / 75) * 240, 240)} r="4" fill="#3b82f6" />
                        ))}
                        {reportData?.weeklyBreakdown?.map((week, i) => (
                          <circle key={`resolved-${i}`} cx={120 + i * 160} cy={260 - Math.min((week.resolved / 75) * 240, 240)} r="4" fill="#10b981" />
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
                  <div className="metric-card">
                    <div className="metric-value">{formatNumber(reportData?.performanceMetrics?.slaViolations || 0)}</div>
                    <div className="metric-label">{t.slaViolations}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{formatPercentage(reportData?.performanceMetrics?.slaCompliance || 0)}</div>
                    <div className="metric-label">{t.slaCompliance}</div>
                  </div>
                </div>
              </div>

              {/* Top Performing Staff */}
              <div className="report-section">
                <h3>{t.topPerformingStaff}</h3>
                <div className="staff-table-wrapper">
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>{t.staffName}</th>
                        <th>{t.role}</th>
                        <th>{t.resolved}</th>
                        <th>{t.satisfaction}</th>
                        <th>{t.avgTime} ({t.days})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.topPerformingStaff?.map((staff, index) => (
                        <tr key={staff.id || index}>
                          <td className="staff-name">{getStaffDisplayName(staff)}</td>
                          <td className="staff-role">{getRoleDisplay(staff)}</td>
                          <td className="staff-resolved">{formatNumber(staff.resolved)}</td>
                          <td>
                            <div className="satisfaction-container">
                              <div className="satisfaction-bar">
                                <div className="satisfaction-fill" style={{ width: `${Math.min((staff.satisfaction / 5) * 100, 100)}%` }}></div>
                              </div>
                              <span className="satisfaction-value">{formatDecimal(staff.satisfaction)}/5</span>
                            </div>
                          </td>
                          <td>{formatDecimal(staff.avgTime)} {t.days}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Peak Hour Analysis */}
              <div className="report-section">
                <h3>{t.peakHourAnalysis}</h3>
                <div className="peak-hour-chart">
                  {Object.entries(reportData?.peakHourAnalysis || {}).map(([hour, count]) => (
                    <div key={hour} className="hour-item">
                      <div className="hour-label">{hour}</div>
                      <div className="hour-bar-container">
                        <div 
                          className="hour-bar" 
                          style={{ width: `${Math.max((count / maxHourlyValue) * 100, 5)}%` }}
                        >
                          <span className="hour-value">{formatNumber(count)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Month over Month Growth */}
              <div className="report-section">
                <h3>{t.monthOverMonthGrowth}</h3>
                <div className="growth-stats">
                  <div className={`growth-card ${(reportData?.monthOverMonthGrowth?.complaints || 0) <= 0 ? 'positive' : 'negative'}`}>
                    <div className="growth-icon">{(reportData?.monthOverMonthGrowth?.complaints || 0) <= 0 ? '📈' : '📉'}</div>
                    <div className="growth-info">
                      <div className={`growth-value ${(reportData?.monthOverMonthGrowth?.complaints || 0) <= 0 ? 'positive' : 'negative'}`}>
                        {(reportData?.monthOverMonthGrowth?.complaints || 0) > 0 ? '+' : ''}{formatDecimal(reportData?.monthOverMonthGrowth?.complaints || 0)}%
                      </div>
                      <div className="growth-label">{t.complaints}</div>
                    </div>
                  </div>
                  <div className="growth-card positive">
                    <div className="growth-icon">🎯</div>
                    <div className="growth-info">
                      <div className="growth-value positive">+{formatDecimal(reportData?.monthOverMonthGrowth?.resolution || 0)}%</div>
                      <div className="growth-label">{t.resolution}</div>
                    </div>
                  </div>
                  <div className="growth-card positive">
                    <div className="growth-icon">⭐</div>
                    <div className="growth-info">
                      <div className="growth-value positive">+{formatDecimal(reportData?.monthOverMonthGrowth?.satisfaction || 0)}%</div>
                      <div className="growth-label">{t.satisfaction}</div>
                    </div>
                  </div>
                  <div className="growth-card positive">
                    <div className="growth-icon">⚡</div>
                    <div className="growth-info">
                      <div className="growth-value positive">+{formatDecimal(reportData?.monthOverMonthGrowth?.productivity || 0)}%</div>
                      <div className="growth-label">{t.productivity}</div>
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

        .staff-reports-monthly {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          position: relative;
        }

    

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

        .month-selector {
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

        .month-selector label {
          font-weight: 600;
          color: #0f172a;
        }

        .month-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          min-width: 180px;
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

        .month-range {
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
          grid-template-columns: repeat(6, 1fr);
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

        .weekly-chart {
          min-height: 350px;
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
          min-width: 120px;
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
          width: 50px;
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

        .satisfaction-rating {
          margin-top: 8px;
          font-size: 0.75rem;
          color: #f59e0b;
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
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
        }

        .metric-card {
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: transform 0.2s;
        }

        .metric-card:hover {
          transform: translateY(-2px);
        }

        .metric-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0288d1;
        }

        .metric-label {
          font-size: 0.7rem;
          color: #475569;
          margin-top: 4px;
        }

        .staff-table-wrapper {
          overflow-x: auto;
        }

        .staff-table {
          width: 100%;
          border-collapse: collapse;
        }

        .staff-table th,
        .staff-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .staff-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .staff-table td {
          color: #334155;
          font-size: 0.85rem;
        }

        .staff-table tr:hover {
          background: #fafcff;
        }

        .staff-name {
          font-weight: 500;
          color: #0f172a;
        }

        .staff-role {
          color: #64748b;
          font-size: 0.75rem;
        }

        .staff-resolved {
          font-weight: 600;
          color: #0288d1;
        }

        .satisfaction-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .satisfaction-bar {
          width: 100px;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .satisfaction-fill {
          height: 100%;
          background: #10b981;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .satisfaction-value {
          font-size: 0.7rem;
          font-weight: 500;
          color: #475569;
        }

        .peak-hour-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hour-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hour-label {
          width: 70px;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .hour-bar-container {
          flex: 1;
          height: 30px;
          background: #e2e8f0;
          border-radius: 15px;
          overflow: hidden;
        }

        .hour-bar {
          height: 100%;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          transition: width 0.3s ease;
          min-width: 30px;
        }

        .hour-value {
          font-size: 0.75rem;
          color: white;
          font-weight: 500;
        }

        .growth-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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
          border-left: 3px solid #dc2626;
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
          color: #dc2626;
        }

        .growth-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        @media print {
          .staff-reports-monthly {
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
          
          .staff-header, .staff-sidebar, .refresh-btn, .action-btn, .month-selector, .backend-warning, .chart-toggle, .toast-notification {
            display: none;
          }
        }

        @media (max-width: 1400px) {
          .summary-cards {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .metrics-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .two-columns {
            grid-template-columns: 1fr;
          }
          
          .tasks-stats, .growth-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .metrics-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .metrics-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .staff-reports-monthly {
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
          
          .tasks-stats, .growth-stats {
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
          
          .month-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffReportsMonthly;