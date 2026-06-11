// src/pages/StaffReportsMonthly.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffReportsMonthly = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [reportData, setReportData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [chartView, setChartView] = useState('bar');

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

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
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
  }, []);

  // Get current month string
  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Get month name
  function getMonthName(year, month) {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString(language === 'np' ? 'ne-NP' : 'en-US', { month: 'long' });
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

  // Fetch monthly report
  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get(`http://localhost:5000/api/staff/reports/monthly?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
        setBackendStatus('connected');
      } else {
        setReportData(getSampleMonthlyReport());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      setReportData(getSampleMonthlyReport());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Get sample monthly report with multi-language support
  const getSampleMonthlyReport = () => {
    const monthRange = getMonthRange(selectedMonth);
    const [year, month] = selectedMonth.split('-');
    const monthName = getMonthName(parseInt(year), parseInt(month));
    
    return {
      month: selectedMonth,
      monthName: monthName,
      monthRange: {
        start: language === 'np' ? formatNepaliDate(monthRange.startDate) : formatEnglishDate(monthRange.startDate),
        end: language === 'np' ? formatNepaliDate(monthRange.endDate) : formatEnglishDate(monthRange.endDate)
      },
      weeklyBreakdown: [
        { week: 1, complaints: 45, resolved: 32, tasks: 28, satisfaction: 4.5 },
        { week: 2, complaints: 52, resolved: 38, tasks: 32, satisfaction: 4.6 },
        { week: 3, complaints: 48, resolved: 35, tasks: 30, satisfaction: 4.4 },
        { week: 4, complaints: 55, resolved: 42, tasks: 35, satisfaction: 4.7 }
      ],
      summary: {
        totalComplaints: 200,
        resolvedComplaints: 147,
        pendingComplaints: 32,
        inProgressComplaints: 15,
        underReviewComplaints: 6,
        avgResponseTime: 2.5,
        customerSatisfaction: 4.55,
        resolutionRate: 73.5
      },
      complaintsByPriority: {
        urgent: 15,
        high: 65,
        medium: 85,
        low: 50
      },
      complaintsByCategory: {
        internet: 58,
        recharge: 32,
        activation: 45,
        billing: 38,
        network: 25,
        general: 27
      },
      tasksSummary: {
        completed: 125,
        pending: 45,
        inProgress: 30,
        completionRate: 71.4
      },
      performanceMetrics: {
        avgResolutionTime: 3.5,
        avgResponseTime: 2.5,
        customerSatisfaction: 4.55,
        teamProductivity: 82,
        slaViolations: 8,
        slaCompliance: 92
      },
      topPerformingStaff: [
        { id: 1, name: 'राम बहादुर', enName: 'Ram Bahadur', resolved: 42, satisfaction: 4.8, avgTime: 2.8, role: 'प्राविधिक सहायता', enRole: 'Technical Support' },
        { id: 2, name: 'सीता शर्मा', enName: 'Sita Sharma', resolved: 38, satisfaction: 4.6, avgTime: 3.1, role: 'ग्राहक सेवा', enRole: 'Customer Service' },
        { id: 3, name: 'हरि प्रसाद', enName: 'Hari Prasad', resolved: 35, satisfaction: 4.5, avgTime: 3.2, role: 'नेटवर्क इन्जिनियर', enRole: 'Network Engineer' },
        { id: 4, name: 'गीता कार्की', enName: 'Gita Karki', resolved: 32, satisfaction: 4.4, avgTime: 3.4, role: 'बिलिङ विशेषज्ञ', enRole: 'Billing Specialist' }
      ],
      monthOverMonthGrowth: {
        complaints: -5.2,
        resolution: 8.3,
        satisfaction: 2.1,
        productivity: 5.5
      },
      peakHourAnalysis: {
        '9-10': 15,
        '10-11': 28,
        '11-12': 32,
        '12-13': 25,
        '13-14': 20,
        '14-15': 30,
        '15-16': 35,
        '16-17': 22,
        '17-18': 18
      }
    };
  };

  // Generate month options (last 12 months)
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -11; i <= 0; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleString(language === 'np' ? 'ne-NP' : 'en-US', { month: 'long' });
      options.push({
        value: `${year}-${month}`,
        label: `${monthName} ${year}`
      });
    }
    return options;
  };

  // Helper function to get staff display name
  const getStaffDisplayName = (staff) => {
    return language === 'np' ? staff.name : staff.enName;
  };

  // Helper function to get role display
  const getRoleDisplay = (staff) => {
    return language === 'np' ? staff.role : staff.enRole;
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchMonthlyReport();
    }
  }, [navigate]);

  // Refresh when month changes or language changes
  useEffect(() => {
    if (selectedMonth) {
      fetchMonthlyReport();
    }
  }, [selectedMonth, language]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleExportReport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `monthly_report_${selectedMonth}.json`;
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
      satisfaction: 'सन्तुष्टि',
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
      loading: 'लोड हुँदै...',
      hours: 'घण्टा',
      days: 'दिन',
      barChart: 'बार चार्ट',
      lineChart: 'लाइन चार्ट'
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
      satisfaction: 'Satisfaction',
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

  const monthOptions = getMonthOptions();
  const maxWeeklyValue = Math.max(...(reportData?.weeklyBreakdown?.map(w => w.complaints) || [0]));
  const maxHourlyValue = Math.max(...Object.values(reportData?.peakHourAnalysis || {}));

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
          <div className="content-wrapper">
            {/* Backend Status Banner */}
            {backendStatus === 'disconnected' && (
              <div className="backend-warning">
                ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।' : 'Backend server not connected. Showing sample data.'}
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
                <button className="refresh-btn" onClick={fetchMonthlyReport}>
                  🔄 {t.refresh}
                </button>
              </div>
            </div>

            {/* Month Selector */}
            <div className="month-selector">
              <label>{t.selectMonth}:</label>
              <select value={selectedMonth} onChange={handleMonthChange} className="month-select">
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Report Content */}
            <div className="report-container" id="report-content">
              {/* Report Header */}
              <div className="report-header">
                <h2>{t.monthlyReport}</h2>
                <p>{t.reportFor}: {reportData?.monthName} {selectedMonth.split('-')[0]}</p>
                <p className="month-range">{t.monthRange}: {reportData?.monthRange.start} - {reportData?.monthRange.end}</p>
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
                <div className="summary-card">
                  <div className="summary-icon">📈</div>
                  <div className="summary-info">
                    <div className="summary-value">{reportData?.summary.resolutionRate || 0}%</div>
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
                          <div className="bar-label">{t.week} {week.week}</div>
                          <div className="bars-container">
                            <div 
                              className="bar complaints-bar" 
                              style={{ height: `${(week.complaints / maxWeeklyValue) * 150}px` }}
                              title={`Complaints: ${week.complaints}`}
                            >
                              <span className="bar-value">{week.complaints}</span>
                            </div>
                            <div 
                              className="bar resolved-bar" 
                              style={{ height: `${(week.resolved / maxWeeklyValue) * 150}px` }}
                              title={`Resolved: ${week.resolved}`}
                            >
                              <span className="bar-value">{week.resolved}</span>
                            </div>
                            <div 
                              className="bar tasks-bar" 
                              style={{ height: `${(week.tasks / maxWeeklyValue) * 150}px` }}
                              title={`Tasks: ${week.tasks}`}
                            >
                              <span className="bar-value">{week.tasks}</span>
                            </div>
                          </div>
                          <div className="satisfaction-rating">⭐ {week.satisfaction}</div>
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
                        {[0, 15, 30, 45, 60, 75].map((val, i) => (
                          <text key={i} x="35" y={260 - (val / 75) * 240} textAnchor="end" fontSize="10" fill="#64748b">
                            {val}
                          </text>
                        ))}
                        {/* X-axis labels */}
                        {reportData?.weeklyBreakdown?.map((week, i) => (
                          <text key={i} x={120 + i * 160} y="275" textAnchor="middle" fontSize="10" fill="#64748b">
                            {t.week} {week.week}
                          </text>
                        ))}
                        {/* Complaints Line */}
                        <polyline
                          points={reportData?.weeklyBreakdown?.map((week, i) => `${120 + i * 160},${260 - (week.complaints / 75) * 240}`).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                        />
                        {/* Resolved Line */}
                        <polyline
                          points={reportData?.weeklyBreakdown?.map((week, i) => `${120 + i * 160},${260 - (week.resolved / 75) * 240}`).join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                        {/* Data points */}
                        {reportData?.weeklyBreakdown?.map((week, i) => (
                          <circle key={`complaint-${i}`} cx={120 + i * 160} cy={260 - (week.complaints / 75) * 240} r="4" fill="#3b82f6" />
                        ))}
                        {reportData?.weeklyBreakdown?.map((week, i) => (
                          <circle key={`resolved-${i}`} cx={120 + i * 160} cy={260 - (week.resolved / 75) * 240} r="4" fill="#10b981" />
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
                    {(reportData?.complaintsByPriority.urgent > 0) && (
                      <div className="priority-item urgent">
                        <span className="priority-label">{t.urgent}</span>
                        <div className="priority-bar">
                          <div className="priority-fill urgent-fill" style={{ width: `${((reportData?.complaintsByPriority.urgent || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                        </div>
                        <span className="priority-count">{reportData?.complaintsByPriority.urgent || 0}</span>
                      </div>
                    )}
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
                      <span className="category-label">{t.network}</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{ width: `${((reportData?.complaintsByCategory.network || 0) / (reportData?.summary.totalComplaints || 1)) * 100}%` }}></div>
                      </div>
                      <span className="category-count">{reportData?.complaintsByCategory.network || 0}</span>
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
                  <div className="metric-card">
                    <div className="metric-value">{reportData?.performanceMetrics.slaViolations || 0}</div>
                    <div className="metric-label">{t.slaViolations}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{reportData?.performanceMetrics.slaCompliance || 0}%</div>
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
                          <td className="staff-resolved">{staff.resolved}</td>
                          <td>
                            <div className="satisfaction-container">
                              <div className="satisfaction-bar">
                                <div className="satisfaction-fill" style={{ width: `${(staff.satisfaction / 5) * 100}%` }}></div>
                              </div>
                              <span className="satisfaction-value">{staff.satisfaction}/5</span>
                            </div>
                          </td>
                          <td>{staff.avgTime} {t.days}</td>
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
                          style={{ width: `${(count / maxHourlyValue) * 100}%` }}
                        >
                          <span className="hour-value">{count}</span>
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
                  <div className={`growth-card ${reportData?.monthOverMonthGrowth.complaints >= 0 ? 'negative' : 'positive'}`}>
                    <div className="growth-icon">{reportData?.monthOverMonthGrowth.complaints >= 0 ? '📉' : '📈'}</div>
                    <div className="growth-info">
                      <div className="growth-value">{reportData?.monthOverMonthGrowth.complaints >= 0 ? '+' : ''}{reportData?.monthOverMonthGrowth.complaints || 0}%</div>
                      <div className="growth-label">{t.complaints}</div>
                    </div>
                  </div>
                  <div className="growth-card positive">
                    <div className="growth-icon">🎯</div>
                    <div className="growth-info">
                      <div className="growth-value">+{reportData?.monthOverMonthGrowth.resolution || 0}%</div>
                      <div className="growth-label">{t.resolution}</div>
                    </div>
                  </div>
                  <div className="growth-card positive">
                    <div className="growth-icon">⭐</div>
                    <div className="growth-info">
                      <div className="growth-value">+{reportData?.monthOverMonthGrowth.satisfaction || 0}%</div>
                      <div className="growth-label">{t.satisfaction}</div>
                    </div>
                  </div>
                  <div className="growth-card positive">
                    <div className="growth-icon">⚡</div>
                    <div className="growth-info">
                      <div className="growth-value">+{reportData?.monthOverMonthGrowth.productivity || 0}%</div>
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
          width: 60px;
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

        .growth-card.positive .growth-value {
          color: #10b981;
        }

        .growth-card.negative .growth-value {
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
          
          .staff-header, .staff-sidebar, .refresh-btn, .action-btn, .month-selector, .backend-warning, .chart-toggle {
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
          .dashboard-layout {
            flex-direction: column;
          }
          
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
        }
      `}</style>
    </div>
  );
};

export default StaffReportsMonthly;