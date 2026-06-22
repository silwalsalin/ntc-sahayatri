// src/pages/StaffPerformance.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffPerformance = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [performanceData, setPerformanceData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

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
          department: user.department || 'Customer Support',
          joinDate: user.joinDate || '2023-01-15',
          employeeId: user.employeeId || `EMP-${user.id || '001'}`
        });
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
  }, []);

  // Fetch performance data
  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      if (!token) {
        navigate('/');
        return;
      }
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/staff/performance?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPerformanceData(response.data.data);
        setBackendStatus('connected');
      } else {
        setPerformanceData(getSamplePerformanceData());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setPerformanceData(getSamplePerformanceData());
      setBackendStatus('disconnected');
    }
  };

  // Get sample performance data
  const getSamplePerformanceData = () => {
    return {
      staffInfo: {
        name: staffData.name,
        role: staffData.role,
        department: staffData.department,
        joinDate: staffData.joinDate,
        employeeId: staffData.employeeId
      },
      summary: {
        totalComplaintsResolved: 156,
        avgResolutionTime: 2.5,
        customerSatisfaction: 4.6,
        tasksCompleted: 125,
        attendance: 98.5,
        punctuality: 96,
        overallScore: 4.4
      },
      monthlyBreakdown: [
        { month: 'Jan', resolved: 28, satisfaction: 4.5, tasks: 22, score: 4.3 },
        { month: 'Feb', resolved: 32, satisfaction: 4.6, tasks: 26, score: 4.5 },
        { month: 'Mar', resolved: 35, satisfaction: 4.7, tasks: 28, score: 4.6 },
        { month: 'Apr', resolved: 30, satisfaction: 4.5, tasks: 24, score: 4.4 },
        { month: 'May', resolved: 31, satisfaction: 4.6, tasks: 25, score: 4.5 }
      ],
      weeklyBreakdown: [
        { week: 'Week 1', resolved: 18, satisfaction: 4.5, tasks: 15, score: 4.4 },
        { week: 'Week 2', resolved: 22, satisfaction: 4.7, tasks: 18, score: 4.6 },
        { week: 'Week 3', resolved: 20, satisfaction: 4.6, tasks: 16, score: 4.5 },
        { week: 'Week 4', resolved: 25, satisfaction: 4.8, tasks: 20, score: 4.7 }
      ],
      categoryPerformance: {
        internet: { resolved: 45, satisfaction: 4.5, avgTime: 2.3 },
        recharge: { resolved: 28, satisfaction: 4.7, avgTime: 1.8 },
        activation: { resolved: 32, satisfaction: 4.6, avgTime: 2.5 },
        billing: { resolved: 35, satisfaction: 4.4, avgTime: 3.2 },
        network: { resolved: 20, satisfaction: 4.3, avgTime: 2.8 },
        general: { resolved: 16, satisfaction: 4.8, avgTime: 1.5 }
      },
      achievements: [
        { title: language === 'np' ? 'महिनाको उत्कृष्ट कर्मचारी' : 'Best Performer of the Month', date: 'March 2024', icon: '🏆' },
        { title: language === 'np' ? '१०० गुनासो समाधान' : '100 Complaints Resolved', date: 'February 2024', icon: '🎯' },
        { title: language === 'np' ? 'ग्राहक सन्तुष्टि पुरस्कार' : 'Customer Satisfaction Award', date: 'January 2024', icon: '⭐' },
        { title: language === 'np' ? 'पूर्ण उपस्थिति' : 'Perfect Attendance', date: 'December 2023', icon: '📅' }
      ],
      feedback: [
        { from: 'Admin', message: language === 'np' ? 'यो महिना उत्कृष्ट प्रदर्शन! यसरी नै जारी राख्नुहोस्।' : 'Excellent performance this month! Keep it up.', rating: 5, date: '2024-03-30' },
        { from: 'Supervisor', message: language === 'np' ? 'जटिल गुनासोहरू समाधान गर्ने उत्कृष्ट कार्य।' : 'Great work on resolving complex complaints.', rating: 4.5, date: '2024-03-25' },
        { from: 'Customer', message: language === 'np' ? 'धेरै सहयोगी र व्यावसायिक सेवा।' : 'Very helpful and professional service.', rating: 5, date: '2024-03-20' }
      ],
      strengths: language === 'np' 
        ? ['द्रुत समाधान', 'उच्च ग्राहक सन्तुष्टि', 'प्राविधिक विशेषज्ञता', 'टोली खेलाडी']
        : ['Quick Resolution', 'High Customer Satisfaction', 'Technical Expertise', 'Team Player'],
      improvements: language === 'np'
        ? ['कागजातीकरण', 'पालना संचार', 'समय व्यवस्थापन']
        : ['Documentation', 'Follow-up Communication', 'Time Management']
    };
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchPerformanceData();
    }
  }, [navigate]);

  // Refresh when period changes
  useEffect(() => {
    if (selectedPeriod) {
      fetchPerformanceData();
    }
  }, [selectedPeriod]);

  // Refresh when language changes
  useEffect(() => {
    if (performanceData) {
      fetchPerformanceData();
    }
  }, [language]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleExportReport = () => {
    if (!performanceData) return;
    const dataStr = JSON.stringify(performanceData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `performance_report_${selectedPeriod}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
      refresh: 'रिफ्रेस',
      back: 'पछाडि फर्कनुहोस्',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      internet: 'इन्टरनेट',
      recharge: 'रिचार्ज',
      activation: 'सक्रियता',
      billing: 'बिलिङ',
      network: 'नेटवर्क',
      general: 'सामान्य'
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
      refresh: 'Refresh',
      back: 'Back',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      internet: 'Internet',
      recharge: 'Recharge',
      activation: 'Activation',
      billing: 'Billing',
      network: 'Network',
      general: 'General'
    }
  };

  const t = content[language];

  const currentData = selectedPeriod === 'weekly' ? performanceData?.weeklyBreakdown : performanceData?.monthlyBreakdown;
  const maxResolved = Math.max(...(currentData?.map(item => item.resolved) || [0]));

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
            {/* Backend Status Banner */}
            {backendStatus === 'disconnected' && (
              <div className="backend-warning">
                ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।' : 'Backend server not connected. Showing sample data.'}
              </div>
            )}

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
                <button className="refresh-btn" onClick={fetchPerformanceData}>
                  🔄 {t.refresh}
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
                  <h2>{performanceData?.staffInfo?.name}</h2>
                  <p>{performanceData?.staffInfo?.role} | {performanceData?.staffInfo?.department}</p>
                  <div className="staff-meta">
                    <span>🆔 {performanceData?.staffInfo?.employeeId}</span>
                    <span>📅 {t.joinDate}: {performanceData?.staffInfo?.joinDate}</span>
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
                            ? `${t.week} ${formatNumber(item.week.split(' ')[1])}` 
                            : getMonthTranslation(item.month)}
                        </div>
                        <div className="bars-container">
                          <div 
                            className="bar resolved-bar" 
                            style={{ height: `${(item.resolved / maxResolved) * 120}px` }}
                            title={`${t.resolved}: ${item.resolved}`}
                          >
                            <span className="bar-value">{formatNumber(item.resolved)}</span>
                          </div>
                          <div 
                            className="bar tasks-bar" 
                            style={{ height: `${(item.tasks / maxResolved) * 120}px` }}
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
                                  <div className="satisfaction-fill" style={{ width: `${(data.satisfaction / 5) * 100}%` }}></div>
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

        .action-btn:hover, .refresh-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
          min-width: 100px;
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
          width: 50px;
          border-radius: 8px 8px 0 0;
          transition: height 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
        }

        .resolved-bar { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .tasks-bar { background: linear-gradient(135deg, #f59e0b, #d97706); }

        .bar-value {
          font-size: 0.7rem;
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
          
          .staff-header, .staff-sidebar, .refresh-btn, .action-btn, .period-selector, .backend-warning {
            display: none;
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
            grid-template-columns: 1fr;
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
        }
      `}</style>
    </div>
  );
};

export default StaffPerformance;