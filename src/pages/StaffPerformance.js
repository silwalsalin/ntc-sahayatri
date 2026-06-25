// src/pages/StaffPerformance.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffPerformance = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [performanceData, setPerformanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    joinDate: '',
    employeeId: ''
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Format number with Nepali digits
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '०';
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return num.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    }
    return num.toString();
  };

  // Format decimal with Nepali digits (preserves decimal point)
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
          department: user.department || 'Customer Support',
          joinDate: user.joinDate || user.join_date || '2023-01-15',
          employeeId: user.employeeId || user.employee_id || `EMP-${String(user.id || '001').padStart(3, '0')}`
        });
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
  }, []);

  // Get sample performance data based on staff
  const getSamplePerformanceData = () => {
    const isNepali = language === 'np';
    const staffId = staffData.id || 1;
    const staffName = staffData.name || 'Staff Member';
    
    // Generate staff-specific performance data
    const baseResolved = 100 + (staffId * 10);
    const baseTasks = 80 + (staffId * 8);
    const baseSatisfaction = 4.2 + (staffId * 0.05);
    
    return {
      staffInfo: {
        name: staffName,
        role: staffData.role || 'Staff',
        department: staffData.department || 'Customer Support',
        joinDate: staffData.joinDate || '2023-01-15',
        employeeId: staffData.employeeId || `EMP-${String(staffId).padStart(3, '0')}`
      },
      summary: {
        totalComplaintsResolved: baseResolved,
        avgResolutionTime: parseFloat((2.0 + (staffId * 0.1)).toFixed(1)),
        customerSatisfaction: parseFloat(baseSatisfaction.toFixed(1)),
        tasksCompleted: baseTasks,
        attendance: parseFloat((95 + (staffId * 0.3)).toFixed(1)),
        punctuality: parseFloat((92 + (staffId * 0.4)).toFixed(1)),
        overallScore: parseFloat((4.0 + (staffId * 0.08)).toFixed(1))
      },
      monthlyBreakdown: [
        { month: 'Jan', resolved: Math.floor(baseResolved * 0.18), satisfaction: parseFloat((baseSatisfaction - 0.1).toFixed(1)), tasks: Math.floor(baseTasks * 0.18), score: parseFloat((4.0 + (staffId * 0.06)).toFixed(1)) },
        { month: 'Feb', resolved: Math.floor(baseResolved * 0.20), satisfaction: parseFloat((baseSatisfaction + 0.05).toFixed(1)), tasks: Math.floor(baseTasks * 0.20), score: parseFloat((4.1 + (staffId * 0.06)).toFixed(1)) },
        { month: 'Mar', resolved: Math.floor(baseResolved * 0.22), satisfaction: parseFloat((baseSatisfaction + 0.1).toFixed(1)), tasks: Math.floor(baseTasks * 0.22), score: parseFloat((4.2 + (staffId * 0.06)).toFixed(1)) },
        { month: 'Apr', resolved: Math.floor(baseResolved * 0.19), satisfaction: parseFloat((baseSatisfaction + 0.05).toFixed(1)), tasks: Math.floor(baseTasks * 0.19), score: parseFloat((4.1 + (staffId * 0.06)).toFixed(1)) },
        { month: 'May', resolved: Math.floor(baseResolved * 0.21), satisfaction: parseFloat((baseSatisfaction + 0.08).toFixed(1)), tasks: Math.floor(baseTasks * 0.21), score: parseFloat((4.15 + (staffId * 0.06)).toFixed(1)) }
      ],
      weeklyBreakdown: [
        { week: 'Week 1', resolved: Math.floor(baseResolved * 0.12), satisfaction: parseFloat((baseSatisfaction - 0.05).toFixed(1)), tasks: Math.floor(baseTasks * 0.12), score: parseFloat((4.0 + (staffId * 0.06)).toFixed(1)) },
        { week: 'Week 2', resolved: Math.floor(baseResolved * 0.14), satisfaction: parseFloat((baseSatisfaction + 0.02).toFixed(1)), tasks: Math.floor(baseTasks * 0.14), score: parseFloat((4.1 + (staffId * 0.06)).toFixed(1)) },
        { week: 'Week 3', resolved: Math.floor(baseResolved * 0.13), satisfaction: parseFloat((baseSatisfaction + 0.05).toFixed(1)), tasks: Math.floor(baseTasks * 0.13), score: parseFloat((4.05 + (staffId * 0.06)).toFixed(1)) },
        { week: 'Week 4', resolved: Math.floor(baseResolved * 0.16), satisfaction: parseFloat((baseSatisfaction + 0.08).toFixed(1)), tasks: Math.floor(baseTasks * 0.16), score: parseFloat((4.2 + (staffId * 0.06)).toFixed(1)) }
      ],
      categoryPerformance: {
        internet: { resolved: Math.floor(baseResolved * 0.25), satisfaction: parseFloat((baseSatisfaction + 0.1).toFixed(1)), avgTime: parseFloat((2.0 + (staffId * 0.05)).toFixed(1)) },
        recharge: { resolved: Math.floor(baseResolved * 0.18), satisfaction: parseFloat((baseSatisfaction + 0.2).toFixed(1)), avgTime: parseFloat((1.5 + (staffId * 0.03)).toFixed(1)) },
        activation: { resolved: Math.floor(baseResolved * 0.20), satisfaction: parseFloat((baseSatisfaction + 0.15).toFixed(1)), avgTime: parseFloat((2.2 + (staffId * 0.05)).toFixed(1)) },
        billing: { resolved: Math.floor(baseResolved * 0.22), satisfaction: parseFloat((baseSatisfaction - 0.05).toFixed(1)), avgTime: parseFloat((3.0 + (staffId * 0.05)).toFixed(1)) },
        network: { resolved: Math.floor(baseResolved * 0.15), satisfaction: parseFloat((baseSatisfaction - 0.1).toFixed(1)), avgTime: parseFloat((2.5 + (staffId * 0.05)).toFixed(1)) },
        general: { resolved: Math.floor(baseResolved * 0.10), satisfaction: parseFloat((baseSatisfaction + 0.25).toFixed(1)), avgTime: parseFloat((1.2 + (staffId * 0.03)).toFixed(1)) }
      },
      achievements: [
        { title: isNepali ? '🏆 महिनाको उत्कृष्ट कर्मचारी' : '🏆 Best Performer of the Month', date: 'March 2024', icon: '🏆' },
        { title: isNepali ? `🎯 ${formatNumber(baseResolved)} गुनासो समाधान` : `🎯 ${formatNumber(baseResolved)} Complaints Resolved`, date: 'February 2024', icon: '🎯' },
        { title: isNepali ? '⭐ ग्राहक सन्तुष्टि पुरस्कार' : '⭐ Customer Satisfaction Award', date: 'January 2024', icon: '⭐' },
        { title: isNepali ? '📅 पूर्ण उपस्थिति' : '📅 Perfect Attendance', date: 'December 2023', icon: '📅' }
      ],
      feedback: [
        { from: 'Admin', message: isNepali ? 'यो महिना उत्कृष्ट प्रदर्शन! यसरी नै जारी राख्नुहोस्।' : 'Excellent performance this month! Keep it up.', rating: 5, date: '2024-03-30' },
        { from: 'Supervisor', message: isNepali ? 'जटिल गुनासोहरू समाधान गर्ने उत्कृष्ट कार्य।' : 'Great work on resolving complex complaints.', rating: 4.5, date: '2024-03-25' },
        { from: 'Customer', message: isNepali ? 'धेरै सहयोगी र व्यावसायिक सेवा।' : 'Very helpful and professional service.', rating: 5, date: '2024-03-20' }
      ],
      strengths: isNepali 
        ? ['द्रुत समाधान', 'उच्च ग्राहक सन्तुष्टि', 'प्राविधिक विशेषज्ञता', 'टोली खेलाडी']
        : ['Quick Resolution', 'High Customer Satisfaction', 'Technical Expertise', 'Team Player'],
      improvements: isNepali
        ? ['कागजातीकरण', 'पालना संचार', 'समय व्यवस्थापन']
        : ['Documentation', 'Follow-up Communication', 'Time Management']
    };
  };

  // Load performance data on mount
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      setPerformanceData(getSamplePerformanceData());
      setIsLoading(false);
    }
  }, [navigate, staffData.id]);

  // Refresh when period changes
  useEffect(() => {
    if (performanceData) {
      // Update period-specific data
      setPerformanceData(getSamplePerformanceData());
    }
  }, [selectedPeriod]);

  // Refresh when language changes
  useEffect(() => {
    if (performanceData) {
      setPerformanceData(getSamplePerformanceData());
    }
  }, [language]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleExportReport = () => {
    if (!performanceData) {
      showToast(
        language === 'np' ? 'कुनै डाटा उपलब्ध छैन' : 'No data available',
        'warning'
      );
      return;
    }

    try {
      const dataStr = JSON.stringify(performanceData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `performance_report_${selectedPeriod}.json`);
      linkElement.click();
      showToast(
        language === 'np' ? 'रिपोर्ट डाउनलोड भयो' : 'Report downloaded',
        'success'
      );
    } catch (error) {
      console.error('Error exporting report:', error);
      showToast(
        language === 'np' ? 'रिपोर्ट निर्यात गर्न असफल' : 'Failed to export report',
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

  const getMonthTranslation = (month) => {
    const months = {
      Jan: { np: 'जनवरी', en: 'Jan' },
      Feb: { np: 'फेब्रुअरी', en: 'Feb' },
      Mar: { np: 'मार्च', en: 'Mar' },
      Apr: { np: 'अप्रिल', en: 'Apr' },
      May: { np: 'मे', en: 'May' },
      Jun: { np: 'जुन', en: 'Jun' },
      Jul: { np: 'जुलाई', en: 'Jul' },
      Aug: { np: 'अगस्ट', en: 'Aug' },
      Sep: { np: 'सेप्टेम्बर', en: 'Sep' },
      Oct: { np: 'अक्टोबर', en: 'Oct' },
      Nov: { np: 'नोभेम्बर', en: 'Nov' },
      Dec: { np: 'डिसेम्बर', en: 'Dec' }
    };
    return months[month]?.[language] || month;
  };

  const content = {
    np: {
      pageTitle: 'मेरो प्रदर्शन',
      performance: 'प्रदर्शन मूल्यांकन',
      selectPeriod: 'अवधि चयन गर्नुहोस्',
      weekly: 'साप्ताहिक',
      monthly: 'मासिक',
      yearly: 'वार्षिक',
      staffInfo: 'कर्मचारी जानकारी',
      name: 'नाम',
      role: 'भूमिका',
      department: 'विभाग',
      joinDate: 'सामेल मिति',
      employeeId: 'कर्मचारी आईडी',
      performanceSummary: 'प्रदर्शन सारांश',
      totalResolved: 'कुल समाधान गरिएको',
      avgResolutionTime: 'औसत समाधान समय',
      customerSatisfaction: 'ग्राहक सन्तुष्टि',
      tasksCompleted: 'पूरा भएको कार्य',
      attendance: 'उपस्थिति',
      punctuality: 'समयपालनता',
      overallScore: 'समग्र स्कोर',
      monthlyBreakdown: 'मासिक विवरण',
      weeklyBreakdown: 'साप्ताहिक विवरण',
      month: 'महिना',
      week: 'हप्ता',
      resolved: 'समाधान',
      satisfaction: 'सन्तुष्टि',
      tasks: 'कार्य',
      score: 'स्कोर',
      categoryPerformance: 'प्रकार अनुसार प्रदर्शन',
      category: 'प्रकार',
      avgTime: 'औसत समय',
      achievements: 'उपलब्धिहरू',
      feedback: 'प्रतिक्रियाहरू',
      from: 'बाट',
      message: 'सन्देश',
      rating: 'रेटिङ',
      date: 'मिति',
      strengths: 'शक्तिहरू',
      improvements: 'सुधारका क्षेत्रहरू',
      days: 'दिन',
      hours: 'घण्टा',
      export: 'रिपोर्ट निर्यात गर्नुहोस्',
      print: 'प्रिन्ट गर्नुहोस्',
      back: 'पछाडि फर्कनुहोस्',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      internet: 'इन्टरनेट',
      recharge: 'रिचार्ज',
      activation: 'सक्रियता',
      billing: 'बिलिङ',
      network: 'नेटवर्क',
      general: 'सामान्य',
      loading: 'लोड हुँदै...'
    },
    en: {
      pageTitle: 'My Performance',
      performance: 'Performance Review',
      selectPeriod: 'Select Period',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      staffInfo: 'Staff Information',
      name: 'Name',
      role: 'Role',
      department: 'Department',
      joinDate: 'Join Date',
      employeeId: 'Employee ID',
      performanceSummary: 'Performance Summary',
      totalResolved: 'Total Resolved',
      avgResolutionTime: 'Avg Resolution Time',
      customerSatisfaction: 'Customer Satisfaction',
      tasksCompleted: 'Tasks Completed',
      attendance: 'Attendance',
      punctuality: 'Punctuality',
      overallScore: 'Overall Score',
      monthlyBreakdown: 'Monthly Breakdown',
      weeklyBreakdown: 'Weekly Breakdown',
      month: 'Month',
      week: 'Week',
      resolved: 'Resolved',
      satisfaction: 'Satisfaction',
      tasks: 'Tasks',
      score: 'Score',
      categoryPerformance: 'Category Performance',
      category: 'Category',
      avgTime: 'Avg Time',
      achievements: 'Achievements',
      feedback: 'Feedback',
      from: 'From',
      message: 'Message',
      rating: 'Rating',
      date: 'Date',
      strengths: 'Strengths',
      improvements: 'Areas for Improvement',
      days: 'days',
      hours: 'hours',
      export: 'Export Report',
      print: 'Print',
      back: 'Back',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      internet: 'Internet',
      recharge: 'Recharge',
      activation: 'Activation',
      billing: 'Billing',
      network: 'Network',
      general: 'General',
      loading: 'Loading...'
    }
  };

  const t = content[language];

  // Get current data based on selected period
  const getCurrentData = () => {
    if (selectedPeriod === 'weekly') {
      return performanceData?.weeklyBreakdown || [];
    } else if (selectedPeriod === 'monthly') {
      return performanceData?.monthlyBreakdown || [];
    } else {
      return performanceData?.monthlyBreakdown || [];
    }
  };

  const currentData = getCurrentData();
  const maxResolved = Math.max(...(currentData?.map(item => item.resolved) || [0]), 1);

  // Loading state
  if (isLoading && !performanceData) {
    return (
      <div className="staff-performance">
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
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t.loading}</p>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; gap: 20px; }
          .loading-spinner { width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top: 4px solid #0288d1; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // If no data
  if (!performanceData) {
    return (
      <div className="staff-performance">
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
              <div className="empty-container">
                <p>{language === 'np' ? 'कुनै प्रदर्शन डाटा उपलब्ध छैन' : 'No performance data available'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-performance">
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
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">{t.performance}</h1>
              <div className="header-actions">
                <button className="action-btn export-btn" onClick={handleExportReport}>
                  📥 {t.export}
                </button>
                <button className="action-btn print-btn" onClick={handlePrintReport}>
                  🖨️ {t.print}
                </button>
              </div>
            </div>

            {/* Period Selector */}
            <div className="period-selector">
              <button 
                className={`period-btn ${selectedPeriod === 'weekly' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('weekly')}
              >
                📅 {t.weekly}
              </button>
              <button 
                className={`period-btn ${selectedPeriod === 'monthly' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('monthly')}
              >
                📆 {t.monthly}
              </button>
              <button 
                className={`period-btn ${selectedPeriod === 'yearly' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('yearly')}
              >
                📊 {t.yearly}
              </button>
            </div>

            {/* Performance Content */}
            <div className="performance-container" id="performance-content">
              {/* Staff Info Card */}
              <div className="staff-info-card">
                <div className="staff-avatar">
                  <span className="avatar-icon">👨‍💻</span>
                </div>
                <div className="staff-details">
                  <h2>{performanceData?.staffInfo?.name || staffData.name}</h2>
                  <p>{performanceData?.staffInfo?.role || staffData.role} | {performanceData?.staffInfo?.department || staffData.department}</p>
                  <div className="staff-meta">
                    <span>🆔 {performanceData?.staffInfo?.employeeId || staffData.employeeId}</span>
                    <span>📅 {t.joinDate}: {performanceData?.staffInfo?.joinDate || staffData.joinDate}</span>
                  </div>
                </div>
                <div className="overall-score">
                  <div className="score-circle">
                    <span className="score-value">{formatDecimal(performanceData?.summary?.overallScore || 0)}</span>
                    <span className="score-label">/5</span>
                  </div>
                  <p>{t.overallScore}</p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-icon green">✅</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatNumber(performanceData?.summary?.totalComplaintsResolved || 0)}</div>
                    <div className="summary-label">{t.totalResolved}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon blue">⏱️</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatDecimal(performanceData?.summary?.avgResolutionTime || 0)} {t.days}</div>
                    <div className="summary-label">{t.avgResolutionTime}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon yellow">⭐</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatDecimal(performanceData?.summary?.customerSatisfaction || 0)}/5</div>
                    <div className="summary-label">{t.customerSatisfaction}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon purple">📋</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatNumber(performanceData?.summary?.tasksCompleted || 0)}</div>
                    <div className="summary-label">{t.tasksCompleted}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon orange">📅</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatDecimal(performanceData?.summary?.attendance || 0)}%</div>
                    <div className="summary-label">{t.attendance}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon teal">⏰</div>
                  <div className="summary-info">
                    <div className="summary-value">{formatDecimal(performanceData?.summary?.punctuality || 0)}%</div>
                    <div className="summary-label">{t.punctuality}</div>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="report-section">
                <h3>{selectedPeriod === 'weekly' ? t.weeklyBreakdown : t.monthlyBreakdown}</h3>
                <div className="performance-chart">
                  <div className="bar-chart">
                    {currentData?.map((item, index) => (
                      <div key={index} className="bar-item">
                        <div className="bar-label">
                          {selectedPeriod === 'weekly' 
                            ? `${t.week} ${formatNumber(item.week ? item.week.split(' ')[1] : index + 1)}` 
                            : getMonthTranslation(item.month)}
                        </div>
                        <div className="bars-container">
                          <div 
                            className="bar resolved-bar" 
                            style={{ height: `${Math.max((item.resolved / maxResolved) * 120, 10)}px` }}
                            title={`${t.resolved}: ${item.resolved}`}
                          >
                            <span className="bar-value">{formatNumber(item.resolved)}</span>
                          </div>
                          <div 
                            className="bar tasks-bar" 
                            style={{ height: `${Math.max((item.tasks / maxResolved) * 120, 10)}px` }}
                            title={`${t.tasks}: ${item.tasks}`}
                          >
                            <span className="bar-value">{formatNumber(item.tasks)}</span>
                          </div>
                        </div>
                        <div className="score-rating">⭐ {formatDecimal(item.score)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <span className="legend-item"><span className="legend-color resolved-color"></span> {t.resolved}</span>
                    <span className="legend-item"><span className="legend-color tasks-color"></span> {t.tasks}</span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="two-columns">
                {/* Category Performance */}
                <div className="report-section">
                  <h3>{t.categoryPerformance}</h3>
                  <div className="category-table-wrapper">
                    <table className="category-table">
                      <thead>
                        <tr>
                          <th>{t.category}</th>
                          <th>{t.resolved}</th>
                          <th>{t.satisfaction}</th>
                          <th>{t.avgTime}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(performanceData?.categoryPerformance || {}).map(([category, data]) => (
                          <tr key={category}>
                            <td className="category-name">{t[category] || category}</td>
                            <td className="category-resolved">{formatNumber(data.resolved)}</td>
                            <td>
                              <div className="satisfaction-container">
                                <div className="satisfaction-bar">
                                  <div className="satisfaction-fill" style={{ width: `${Math.min((data.satisfaction / 5) * 100, 100)}%` }}></div>
                                </div>
                                <span className="satisfaction-value">{formatDecimal(data.satisfaction)}/5</span>
                              </div>
                            </td>
                            <td className="category-time">{formatDecimal(data.avgTime)} {t.days}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="report-section">
                  <div className="strengths-box">
                    <h3>💪 {t.strengths}</h3>
                    <ul className="strengths-list">
                      {performanceData?.strengths?.map((strength, index) => (
                        <li key={index}>
                          <span className="strength-icon">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="improvements-box">
                    <h3>📈 {t.improvements}</h3>
                    <ul className="improvements-list">
                      {performanceData?.improvements?.map((improvement, index) => (
                        <li key={index}>
                          <span className="improvement-icon">→</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="report-section">
                <h3>🏆 {t.achievements}</h3>
                <div className="achievements-grid">
                  {performanceData?.achievements?.map((achievement, index) => (
                    <div key={index} className="achievement-card">
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-info">
                        <h4>{achievement.title}</h4>
                        <p>{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="report-section">
                <h3>💬 {t.feedback}</h3>
                <div className="feedback-list">
                  {performanceData?.feedback?.map((item, index) => (
                    <div key={index} className="feedback-card">
                      <div className="feedback-header">
                        <strong>{item.from}</strong>
                        <div className="feedback-rating">
                          {'⭐'.repeat(Math.floor(item.rating))}
                          <span>({formatDecimal(item.rating)}/5)</span>
                        </div>
                      </div>
                      <p className="feedback-message">"{item.message}"</p>
                      <span className="feedback-date">{item.date}</span>
                    </div>
                  ))}
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

        .staff-performance {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          height: 100vh;
          width: 100%;
          overflow: hidden;
          position: relative;
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

        .action-btn {
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .export-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .print-btn {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
        }

        .period-selector {
          background: white;
          padding: 12px 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .period-btn {
          padding: 8px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
        }

        .period-btn.active {
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
          border-color: #0288d1;
        }

        .performance-container {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .staff-info-card {
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .staff-avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-icon {
          font-size: 2.5rem;
        }

        .staff-details {
          flex: 1;
        }

        .staff-details h2 {
          font-size: 1.3rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .staff-details p {
          color: #64748b;
          margin-bottom: 8px;
        }

        .staff-meta {
          display: flex;
          gap: 20px;
          font-size: 0.8rem;
          color: #64748b;
          flex-wrap: wrap;
        }

        .overall-score {
          text-align: center;
        }

        .score-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .score-value {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 0.8rem;
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
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .summary-icon.green { background: #e8f5e9; color: #2e7d32; }
        .summary-icon.blue { background: #e3f2fd; color: #1565c0; }
        .summary-icon.yellow { background: #fff8e1; color: #f9a825; }
        .summary-icon.purple { background: #f3e5f5; color: #7b1fa2; }
        .summary-icon.orange { background: #fff3e0; color: #f57c00; }
        .summary-icon.teal { background: #e0f2f1; color: #00695c; }

        .summary-info {
          flex: 1;
        }

        .summary-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .summary-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 2px;
        }

        .report-section {
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .report-section:last-child {
          border-bottom: none;
        }

        .report-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-left: 12px;
          border-left: 3px solid #0288d1;
        }

        .performance-chart {
          min-height: 280px;
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
          height: 150px;
        }

        .bar {
          width: 40px;
          border-radius: 8px 8px 0 0;
          transition: height 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          min-height: 10px;
        }

        .resolved-bar { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .tasks-bar { background: linear-gradient(135deg, #f59e0b, #d97706); }

        .bar-value {
          font-size: 0.65rem;
          color: white;
          margin-bottom: 4px;
        }

        .score-rating {
          margin-top: 8px;
          font-size: 0.75rem;
          color: #f59e0b;
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

        .resolved-color { background: #3b82f6; }
        .tasks-color { background: #f59e0b; }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .category-table-wrapper {
          overflow-x: auto;
        }

        .category-table {
          width: 100%;
          border-collapse: collapse;
        }

        .category-table th,
        .category-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .category-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .category-table td {
          color: #334155;
          font-size: 0.85rem;
        }

        .category-table tr:hover {
          background: #fafcff;
        }

        .category-name {
          font-weight: 500;
          color: #0f172a;
        }

        .category-resolved {
          font-weight: 600;
          color: #0288d1;
        }

        .category-time {
          color: #64748b;
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

        .strengths-box, .improvements-box {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          transition: transform 0.2s;
        }

        .strengths-box:hover, .improvements-box:hover {
          transform: translateY(-2px);
        }

        .strengths-box h3, .improvements-box h3 {
          margin-bottom: 12px;
          border-left: none;
          padding-left: 0;
        }

        .strengths-list, .improvements-list {
          list-style: none;
        }

        .strengths-list li, .improvements-list li {
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .strength-icon {
          color: #10b981;
          font-weight: bold;
        }

        .improvement-icon {
          color: #f59e0b;
          font-weight: bold;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .achievement-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.2s;
        }

        .achievement-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .achievement-icon {
          font-size: 2rem;
        }

        .achievement-info h4 {
          font-size: 0.9rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .achievement-info p {
          font-size: 0.7rem;
          color: #64748b;
        }

        .feedback-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feedback-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          transition: transform 0.2s;
        }

        .feedback-card:hover {
          transform: translateX(4px);
        }

        .feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .feedback-header strong {
          color: #0f172a;
        }

        .feedback-rating {
          color: #f59e0b;
          font-size: 0.8rem;
        }

        .feedback-rating span {
          color: #64748b;
          margin-left: 4px;
        }

        .feedback-message {
          color: #334155;
          font-style: italic;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .feedback-date {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        @media print {
          .staff-performance {
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
          
          .staff-header, .staff-sidebar, .action-btn, .period-selector, .toast-notification {
            display: none;
          }
          
          .performance-container {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
        }

        @media (max-width: 1400px) {
          .summary-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .two-columns {
            grid-template-columns: 1fr;
          }
          
          .achievements-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 992px) {
          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .staff-performance {
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
          
          .staff-info-card {
            flex-direction: column;
            text-align: center;
          }
          
          .staff-meta {
            flex-direction: column;
            align-items: center;
          }
          
          .bar-chart {
            flex-direction: column;
            align-items: stretch;
          }
          
          .bars-container {
            height: 100px;
          }
          
          .bar {
            width: 100%;
          }
          
          .feedback-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .achievements-grid {
            grid-template-columns: 1fr;
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
          
          .staff-avatar {
            width: 60px;
            height: 60px;
          }
          
          .avatar-icon {
            font-size: 1.8rem;
          }
          
          .score-circle {
            width: 60px;
            height: 60px;
          }
          
          .score-value {
            font-size: 1.3rem;
          }
          
          .period-selector {
            flex-direction: column;
          }
          
          .period-btn {
            width: 100%;
            text-align: center;
          }
          
          .header-actions {
            width: 100%;
          }
          
          .action-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffPerformance;