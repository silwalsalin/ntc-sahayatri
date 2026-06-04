// src/pages/StaffReportsWeekly.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffReportsWeekly = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [reportData, setReportData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [chartView, setChartView] = useState('bar');

  const [staffData, setStaffData] = useState({
    name: 'Ram Bahadur',
    role: 'Technical Support',
    email: 'ram@ntc.gov.np',
    phone: '9841234567',
    department: 'Customer Support'
  });

  // Get current week number
  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week}`;
  }

  // Get week range from week string
  function getWeekRange(weekStr) {
    const [year, week] = weekStr.split('-W');
    const startDate = new Date(year, 0, 1 + (week - 1) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return { startDate, endDate };
  }

  // Fetch weekly report
  const fetchWeeklyReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get(`http://localhost:5000/api/staff/reports/weekly?week=${selectedWeek}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
        setBackendStatus('connected');
      } else {
        setReportData(getSampleWeeklyReport());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      setReportData(getSampleWeeklyReport());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Get sample weekly report
  const getSampleWeeklyReport = () => {
    const weekRange = getWeekRange(selectedWeek);
    return {
      week: selectedWeek,
      weekRange: {
        start: language === 'np' ? formatNepaliDate(weekRange.startDate) : formatEnglishDate(weekRange.startDate),
        end: language === 'np' ? formatNepaliDate(weekRange.endDate) : formatEnglishDate(weekRange.endDate)
      },
      dailyBreakdown: [
        { day: 'Monday', complaints: 8, resolved: 5, tasks: 4 },
        { day: 'Tuesday', complaints: 10, resolved: 6, tasks: 5 },
        { day: 'Wednesday', complaints: 7, resolved: 4, tasks: 3 },
        { day: 'Thursday', complaints: 12, resolved: 7, tasks: 6 },
        { day: 'Friday', complaints: 6, resolved: 5, tasks: 4 },
        { day: 'Saturday', complaints: 3, resolved: 2, tasks: 2 },
        { day: 'Sunday', complaints: 2, resolved: 1, tasks: 1 }
      ],
      summary: {
        totalComplaints: 48,
        resolvedComplaints: 30,
        pendingComplaints: 10,
        inProgressComplaints: 5,
        underReviewComplaints: 3,
        avgResponseTime: 2.8,
        customerSatisfaction: 4.5
      },
      complaintsByPriority: {
        high: 18,
        medium: 20,
        low: 10
      },
      complaintsByCategory: {
        internet: 15,
        recharge: 8,
        activation: 12,
        billing: 9,
        general: 4
      },
      tasksSummary: {
        completed: 25,
        pending: 15,
        inProgress: 8,
        completionRate: 62.5
      },
      performanceMetrics: {
        avgResolutionTime: 3.2,
        avgResponseTime: 2.8,
        customerSatisfaction: 4.5,
        teamProductivity: 78
      },
      topComplaintTypes: [
        { category: 'internet', count: 15, percentage: 31.25 },
        { category: 'activation', count: 12, percentage: 25 },
        { category: 'billing', count: 9, percentage: 18.75 },
        { category: 'recharge', count: 8, percentage: 16.67 },
        { category: 'general', count: 4, percentage: 8.33 }
      ],
      weekOverWeekGrowth: {
        complaints: 12.5,
        resolution: 8.3,
        satisfaction: 2.1
      }
    };
  };

  const formatNepaliDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      const year = d.getFullYear() - 57;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
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
      const weekStr = `${date.getFullYear()}-W${week}`;
      const weekRange = getWeekRange(weekStr);
      options.push({
        value: weekStr,
        label: `${weekStr} (${formatEnglishDate(weekRange.startDate)} - ${formatEnglishDate(weekRange.endDate)})`
      });
    }
    return options.reverse();
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchWeeklyReport();
    }
  }, [navigate]);

  // Refresh when week changes
  useEffect(() => {
    if (selectedWeek) {
      fetchWeeklyReport();
    }
  }, [selectedWeek]);

  const handleWeekChange = (e) => {
    setSelectedWeek(e.target.value);
  };

  const handleExportReport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `weekly_report_${selectedWeek}.json`;
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
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      internet: 'इन्टरनेट',
      recharge: 'रिचार्ज',
      activation: 'सक्रियता',
      billing: 'बिलिङ',
      general: 'सामान्य',
      category: 'प्रकार',
      count: 'संख्या',
      percentage: 'प्रतिशत',
      export: 'रिपोर्ट निर्यात गर्नुहोस्',
      print: 'प्रिन्ट गर्नुहोस्',
      refresh: 'रिफ्रेस',
      loading: 'लोड हुँदै...',
      hours: 'घण्टा',
      days: 'दिन',
      barChart: 'बार चार्ट',
      lineChart: 'लाइन चार्ट'
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
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      internet: 'Internet',
      recharge: 'Recharge',
      activation: 'Activation',
      billing: 'Billing',
      general: 'General',
      category: 'Category',
      count: 'Count',
      percentage: 'Percentage',
      export: 'Export Report',
      print: 'Print',
      refresh: 'Refresh',
      loading: 'Loading...',
      hours: 'hours',
      days: 'days',
      barChart: 'Bar Chart',
      lineChart: 'Line Chart'
    }
  };

  const t = content[language];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  const weekOptions = getWeekOptions();
  const maxDailyValue = Math.max(...(reportData?.dailyBreakdown?.map(d => d.complaints) || [0]));

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
          <div className="content-wrapper">
            {/* Backend Status Banner */}
            {backendStatus === 'disconnected' && (
              <div className="backend-warning">
                ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।' : 'Backend server not connected. Showing sample data.'}
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
                <button className="refresh-btn" onClick={fetchWeeklyReport}>
                  🔄 {t.refresh}
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
                <p className="week-range">{t.weekRange}: {reportData?.weekRange.start} - {reportData?.weekRange.end}</p>
              </div>

              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-icon">📊</div>
                  <div className="summary-info">
                    <div className="summary-value">{reportData?.summary.totalComplaints || 0}</div>
                    <div className="summary-label">{t.totalComplaints}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">✅</div>
                  <div className="summary-info">
                    <div className="summary-value">{reportData?.summary.resolvedComplaints || 0}</div>
                    <div className="summary-label">{t.resolvedComplaints}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">⏳</div>
                  <div className="summary-info">
                    <div className="summary-value">{reportData?.summary.pendingComplaints || 0}</div>
                    <div className="summary-label">{t.pendingComplaints}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">🔄</div>
                  <div className="summary-info">
                    <div className="summary-value">{reportData?.summary.inProgressComplaints || 0}</div>
                    <div className="summary-label">{t.inProgressComplaints}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">📝</div>
                  <div className="summary-info">
                    <div className="summary-value">{reportData?.summary.underReviewComplaints || 0}</div>
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
                          <div className="bar-label">{t[day.day.toLowerCase()] || day.day}</div>
                          <div className="bars-container">
                            <div 
                              className="bar complaints-bar" 
                              style={{ height: `${(day.complaints / maxDailyValue) * 150}px` }}
                              title={`Complaints: ${day.complaints}`}
                            >
                              <span className="bar-value">{day.complaints}</span>
                            </div>
                            <div 
                              className="bar resolved-bar" 
                              style={{ height: `${(day.resolved / maxDailyValue) * 150}px` }}
                              title={`Resolved: ${day.resolved}`}
                            >
                              <span className="bar-value">{day.resolved}</span>
                            </div>
                            <div 
                              className="bar tasks-bar" 
                              style={{ height: `${(day.tasks / maxDailyValue) * 150}px` }}
                              title={`Tasks: ${day.tasks}`}
                            >
                              <span className="bar-value">{day.tasks}</span>
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
                            {val}
                          </text>
                        ))}
                        {/* X-axis labels */}
                        {reportData?.dailyBreakdown?.map((day, i) => (
                          <text key={i} x={80 + i * 100} y="275" textAnchor="middle" fontSize="10" fill="#64748b">
                            {t[day.day.toLowerCase()]?.substring(0, 3) || day.day.substring(0, 3)}
                          </text>
                        ))}
                        {/* Complaints Line */}
                        <polyline
                          points={reportData?.dailyBreakdown?.map((day, i) => `${80 + i * 100},${260 - (day.complaints / 20) * 240}`).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                        />
                        {/* Resolved Line */}
                        <polyline
                          points={reportData?.dailyBreakdown?.map((day, i) => `${80 + i * 100},${260 - (day.resolved / 20) * 240}`).join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                        {/* Data points */}
                        {reportData?.dailyBreakdown?.map((day, i) => (
                          <circle key={i} cx={80 + i * 100} cy={260 - (day.complaints / 20) * 240} r="4" fill="#3b82f6" />
                        ))}
                        {reportData?.dailyBreakdown?.map((day, i) => (
                          <circle key={i + 100} cx={80 + i * 100} cy={260 - (day.resolved / 20) * 240} r="4" fill="#10b981" />
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
                    <div className="priority-item high">
                      <span className="priority-label">{t.high}</span>
                      <div className="priority-bar">
                        <div className="priority-fill high-fill" style={{ width: `${((reportData?.complaintsByPriority.high || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="priority-count">{reportData?.complaintsByPriority.high || 0}</span>
                    </div>
                    <div className="priority-item medium">
                      <span className="priority-label">{t.medium}</span>
                      <div className="priority-bar">
                        <div className="priority-fill medium-fill" style={{ width: `${((reportData?.complaintsByPriority.medium || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="priority-count">{reportData?.complaintsByPriority.medium || 0}</span>
                    </div>
                    <div className="priority-item low">
                      <span className="priority-label">{t.low}</span>
                      <div className="priority-bar">
                        <div className="priority-fill low-fill" style={{ width: `${((reportData?.complaintsByPriority.low || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="priority-count">{reportData?.complaintsByPriority.low || 0}</span>
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
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory.internet || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{reportData?.complaintsByCategory.internet || 0}</span>
                    </div>
                    <div className="category-item">
                      <span className="category-label">{t.recharge}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory.recharge || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{reportData?.complaintsByCategory.recharge || 0}</span>
                    </div>
                    <div className="category-item">
                      <span className="category-label">{t.activation}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory.activation || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{reportData?.complaintsByCategory.activation || 0}</span>
                    </div>
                    <div className="category-item">
                      <span className="category-label">{t.billing}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory.billing || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{reportData?.complaintsByCategory.billing || 0}</span>
                    </div>
                    <div className="category-item">
                      <span className="category-label">{t.general}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory.general || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{reportData?.complaintsByCategory.general || 0}</span>
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
                      <div className="task-value">{reportData?.tasksSummary.completed || 0}</div>
                      <div className="task-label">{t.completed}</div>
                    </div>
                  </div>
                  <div className="task-stat">
                    <div className="task-icon">⏳</div>
                    <div className="task-info">
                      <div className="task-value">{reportData?.tasksSummary.pending || 0}</div>
                      <div className="task-label">{t.pending}</div>
                    </div>
                  </div>
                  <div className="task-stat">
                    <div className="task-icon">🔄</div>
                    <div className="task-info">
                      <div className="task-value">{reportData?.tasksSummary.inProgress || 0}</div>
                      <div className="task-label">{t.inProgress}</div>
                    </div>
                  </div>
                  <div className="task-stat">
                    <div className="task-icon">📊</div>
                    <div className="task-info">
                      <div className="task-value">{reportData?.tasksSummary.completionRate || 0}%</div>
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
                    <div className="metric-value">{reportData?.performanceMetrics.avgResolutionTime || 0} {t.days}</div>
                    <div className="metric-label">{t.avgResolutionTime}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{reportData?.performanceMetrics.avgResponseTime || 0} {t.hours}</div>
                    <div className="metric-label">{t.avgResponseTime}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{reportData?.performanceMetrics.customerSatisfaction || 0}/5</div>
                    <div className="metric-label">{t.customerSatisfaction}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{reportData?.performanceMetrics.teamProductivity || 0}%</div>
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
                        <span className="complaint-type-count">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="complaint-type-bar">
                        <div className="complaint-type-fill" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Week over Week Growth */}
              <div className="report-section">
                <h3>{t.weekOverWeekGrowth}</h3>
                <div className="growth-stats">
                  <div className="growth-card positive">
                    <div className="growth-icon">📈</div>
                    <div className="growth-info">
                      <div className="growth-value">+{reportData?.weekOverWeekGrowth.complaints || 0}%</div>
                      <div className="growth-label">{t.complaints}</div>
                    </div>
                  </div>
                  <div className="growth-card positive">
                    <div className="growth-icon">🎯</div>
                    <div className="growth-info">
                      <div className="growth-value">+{reportData?.weekOverWeekGrowth.resolution || 0}%</div>
                      <div className="growth-label">{t.resolution}</div>
                    </div>
                  </div>
                  <div className="growth-card positive">
                    <div className="growth-icon">⭐</div>
                    <div className="growth-info">
                      <div className="growth-value">+{reportData?.weekOverWeekGrowth.satisfaction || 0}%</div>
                      <div className="growth-label">{t.satisfaction}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .staff-reports-weekly {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          height: 100vh;
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0288d1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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
        }

        .bar-item {
          flex: 1;
          text-align: center;
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
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: height 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
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
          width: 80px;
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

        .high-fill { background: #dc2626; }
        .medium-fill { background: #f59e0b; }
        .low-fill { background: #10b981; }
        .category-fill { background: #0288d1; }

        .priority-count, .category-count {
          width: 30px;
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
          background: #0288d1;
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
        }

        .growth-card.positive {
          border-left: 3px solid #10b981;
        }

        .growth-icon {
          font-size: 1.5rem;
        }

        .growth-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #10b981;
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
          
          .sidebar-container, .refresh-btn, .action-btn, .week-selector, .backend-warning, .chart-toggle {
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

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          
          .content-wrapper {
            padding: 16px;
          }
          
          .summary-cards {
            grid-template-columns: 1fr;
          }
          
          .tasks-stats, .metrics-cards, .growth-stats {
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
        }
      `}</style>
    </div>
  );
};

export default StaffReportsWeekly;