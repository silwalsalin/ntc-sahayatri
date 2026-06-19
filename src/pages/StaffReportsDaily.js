// src/pages/StaffReportsDaily.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffReportsDaily = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Get sample daily report with multi-language staff names
  const getSampleDailyReport = useCallback(() => {
    return {
      date: selectedDate,
      formattedDate: language === 'np' ? formatNepaliDate(selectedDate) : formatEnglishDate(selectedDate),
      summary: {
        totalComplaints: 12,
        newComplaints: 5,
        resolvedComplaints: 3,
        pendingComplaints: 4,
        inProgressComplaints: 3,
        underReviewComplaints: 2
      },
      complaintsByPriority: {
        urgent: 2,
        high: 4,
        medium: 5,
        low: 3
      },
      complaintsByCategory: {
        internet: 4,
        recharge: 2,
        activation: 3,
        billing: 2,
        network: 2,
        general: 1
      },
      tasksOverview: {
        completed: 6,
        pending: 4,
        inProgress: 3
      },
      performanceMetrics: {
        averageResponseTime: 2.5,
        customerSatisfaction: 4.6,
        resolutionRate: 75
      },
      topPerformingStaff: [
        { id: 1, name: 'राम बहादुर', enName: 'Ram Bahadur', resolved: 8, satisfaction: 4.8, role: 'प्राविधिक सहायता', enRole: 'Technical Support' },
        { id: 2, name: 'सीता शर्मा', enName: 'Sita Sharma', resolved: 6, satisfaction: 4.5, role: 'ग्राहक सेवा', enRole: 'Customer Service' },
        { id: 3, name: 'हरि प्रसाद', enName: 'Hari Prasad', resolved: 5, satisfaction: 4.3, role: 'नेटवर्क इन्जिनियर', enRole: 'Network Engineer' }
      ],
      recentActivities: [
        { time: '09:30 AM', action: language === 'np' ? 'गुनासो #NTC-2024-001 समाधान गरियो' : 'Complaint #NTC-2024-001 resolved', type: 'resolution' },
        { time: '10:15 AM', action: language === 'np' ? 'नयाँ गुनासो तोकियो - #NTC-2024-015' : 'New complaint assigned - #NTC-2024-015', type: 'assignment' },
        { time: '11:45 AM', action: language === 'np' ? 'ग्राहकसँग पालना कल' : 'Follow-up call with customer', type: 'followup' },
        { time: '02:00 PM', action: language === 'np' ? 'गुनासो स्थिति अपडेट गरियो' : 'Updated complaint status', type: 'update' },
        { time: '03:30 PM', action: language === 'np' ? 'दैनिक रिपोर्ट पेश गरियो' : 'Submitted daily report', type: 'report' }
      ]
    };
  }, [selectedDate, language]);

  // Fetch daily report
  const fetchDailyReport = useCallback(async () => {
    try {
      const token = localStorage.getItem('staffToken');
      if (!token) {
        navigate('/');
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/staff/reports/daily?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
        setBackendStatus('connected');
      } else {
        setReportData(getSampleDailyReport());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching daily report:', error);
      setReportData(getSampleDailyReport());
      setBackendStatus('disconnected');
    } finally {
      setIsInitialized(true);
    }
  }, [selectedDate, getSampleDailyReport, navigate]);

  // Check authentication and initial load
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchDailyReport();
    }
  }, [navigate, fetchDailyReport]);

  // Refresh when date changes (only after initialization)
  useEffect(() => {
    if (isInitialized && selectedDate) {
      fetchDailyReport();
    }
  }, [selectedDate, isInitialized, fetchDailyReport]);

  // Refresh when language changes (only after initialization)
  useEffect(() => {
    if (isInitialized && reportData) {
      // Just update the sample data language without full reload
      const updatedReport = getSampleDailyReport();
      setReportData(updatedReport);
    }
  }, [language, isInitialized, reportData, getSampleDailyReport]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleExportReport = () => {
    if (!reportData) return;
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `daily_report_${selectedDate}.json`;
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
      pageTitle: 'दैनिक रिपोर्ट',
      dailyReport: 'दैनिक रिपोर्ट',
      selectDate: 'मिति चयन गर्नुहोस्',
      reportFor: 'को लागि रिपोर्ट',
      summary: 'सारांश',
      totalComplaints: 'कुल गुनासो',
      newComplaints: 'नयाँ गुनासो',
      resolvedComplaints: 'समाधान गरिएका गुनासो',
      pendingComplaints: 'विचाराधीन गुनासो',
      inProgressComplaints: 'प्रगतिमा गुनासो',
      underReviewComplaints: 'समीक्षामा गुनासो',
      complaintsByPriority: 'प्राथमिकता अनुसार गुनासो',
      complaintsByCategory: 'प्रकार अनुसार गुनासो',
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
      tasksOverview: 'कार्य सारांश',
      tasksCompleted: 'पूरा भएका कार्य',
      tasksPending: 'विचाराधीन कार्य',
      tasksInProgress: 'प्रगतिमा कार्य',
      performanceMetrics: 'प्रदर्शन मेट्रिक्स',
      averageResponseTime: 'औसत प्रतिक्रिया समय',
      customerSatisfaction: 'ग्राहक सन्तुष्टि',
      resolutionRate: 'समाधान दर',
      hours: 'घण्टा',
      outOf: 'मध्ये',
      topPerformingStaff: 'उत्कृष्ट प्रदर्शन गर्ने कर्मचारी',
      staffName: 'कर्मचारीको नाम',
      role: 'भूमिका',
      resolved: 'समाधान गरेको',
      satisfaction: 'सन्तुष्टि',
      recentActivities: 'हालैका गतिविधिहरू',
      time: 'समय',
      action: 'कार्य',
      type: 'प्रकार',
      resolution: 'समाधान',
      assignment: 'तोकिएको',
      followup: 'पालना',
      update: 'अपडेट',
      report: 'रिपोर्ट',
      export: 'रिपोर्ट निर्यात गर्नुहोस्',
      print: 'प्रिन्ट गर्नुहोस्',
      refresh: 'रिफ्रेस',
      back: 'पछाडि फर्कनुहोस्',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      percent: '%'
    },
    en: {
      pageTitle: 'Daily Report',
      dailyReport: 'Daily Report',
      selectDate: 'Select Date',
      reportFor: 'Report for',
      summary: 'Summary',
      totalComplaints: 'Total Complaints',
      newComplaints: 'New Complaints',
      resolvedComplaints: 'Resolved Complaints',
      pendingComplaints: 'Pending Complaints',
      inProgressComplaints: 'In Progress Complaints',
      underReviewComplaints: 'Under Review Complaints',
      complaintsByPriority: 'Complaints by Priority',
      complaintsByCategory: 'Complaints by Category',
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
      tasksOverview: 'Tasks Overview',
      tasksCompleted: 'Tasks Completed',
      tasksPending: 'Tasks Pending',
      tasksInProgress: 'Tasks In Progress',
      performanceMetrics: 'Performance Metrics',
      averageResponseTime: 'Avg Response Time',
      customerSatisfaction: 'Customer Satisfaction',
      resolutionRate: 'Resolution Rate',
      hours: 'hours',
      outOf: 'out of',
      topPerformingStaff: 'Top Performing Staff',
      staffName: 'Staff Name',
      role: 'Role',
      resolved: 'Resolved',
      satisfaction: 'Satisfaction',
      recentActivities: 'Recent Activities',
      time: 'Time',
      action: 'Action',
      type: 'Type',
      resolution: 'Resolution',
      assignment: 'Assignment',
      followup: 'Follow-up',
      update: 'Update',
      report: 'Report',
      export: 'Export Report',
      print: 'Print',
      refresh: 'Refresh',
      back: 'Back',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      percent: '%'
    }
  };

  const t = content[language];

  // Helper function to get display name
  const getStaffDisplayName = (staff) => {
    return language === 'np' ? staff.name : staff.enName;
  };

  // Helper function to get role display
  const getRoleDisplay = (staff) => {
    return language === 'np' ? staff.role : staff.enRole;
  };

  return (
    <div className="staff-reports-daily">
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
              <h1 className="page-title">{t.dailyReport}</h1>
              <div className="header-actions">
                <button className="action-btn export-btn" onClick={handleExportReport}>
                  📥 {t.export}
                </button>
                <button className="action-btn print-btn" onClick={handlePrintReport}>
                  🖨️ {t.print}
                </button>
                <button className="refresh-btn" onClick={fetchDailyReport}>
                  🔄 {t.refresh}
                </button>
              </div>
            </div>

            {/* Date Selector */}
            <div className="date-selector">
              <label>{t.selectDate}:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="date-input"
              />
            </div>

            {/* Report Content */}
            <div className="report-container" id="report-content">
              {/* Report Header */}
              <div className="report-header">
                <h2>{t.dailyReport}</h2>
                <p>{t.reportFor}: {reportData?.formattedDate || selectedDate}</p>
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
                  <div className="summary-icon">🆕</div>
                  <div className="summary-info">
                    <div className="summary-value">{reportData?.summary.newComplaints || 0}</div>
                    <div className="summary-label">{t.newComplaints}</div>
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

              {/* Two Column Layout */}
              <div className="two-columns">
                {/* Complaints by Priority */}
                <div className="report-section">
                  <h3>{t.complaintsByPriority}</h3>
                  <div className="priority-stats">
                    {(reportData?.complaintsByPriority?.urgent > 0) && (
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

              {/* Tasks Overview */}
              <div className="report-section">
                <h3>{t.tasksOverview}</h3>
                <div className="tasks-stats">
                  <div className="task-stat">
                    <div className="task-icon">✅</div>
                    <div className="task-info">
                      <div className="task-value">{reportData?.tasksOverview?.completed || reportData?.tasksCompleted || 0}</div>
                      <div className="task-label">{t.tasksCompleted}</div>
                    </div>
                  </div>
                  <div className="task-stat">
                    <div className="task-icon">⏳</div>
                    <div className="task-info">
                      <div className="task-value">{reportData?.tasksOverview?.pending || reportData?.tasksPending || 0}</div>
                      <div className="task-label">{t.tasksPending}</div>
                    </div>
                  </div>
                  <div className="task-stat">
                    <div className="task-icon">🔄</div>
                    <div className="task-info">
                      <div className="task-value">{reportData?.tasksOverview?.inProgress || reportData?.tasksInProgress || 0}</div>
                      <div className="task-label">{t.tasksInProgress}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="report-section">
                <h3>{t.performanceMetrics}</h3>
                <div className="metrics-cards">
                  <div className="metric-card">
                    <div className="metric-value">{reportData?.performanceMetrics?.averageResponseTime || reportData?.averageResponseTime || 0} {t.hours}</div>
                    <div className="metric-label">{t.averageResponseTime}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{reportData?.performanceMetrics?.customerSatisfaction || reportData?.customerSatisfaction || 0}/5</div>
                    <div className="metric-label">{t.customerSatisfaction}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{reportData?.performanceMetrics?.resolutionRate || 0}{t.percent}</div>
                    <div className="metric-label">{t.resolutionRate}</div>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="report-section">
                <h3>{t.recentActivities}</h3>
                <div className="activities-list">
                  {reportData?.recentActivities?.map((activity, index) => (
                    <div key={index} className={`activity-item ${activity.type}`}>
                      <div className="activity-time">{activity.time}</div>
                      <div className="activity-action">{activity.action}</div>
                      <div className="activity-type-badge">{t[activity.type] || activity.type}</div>
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

        .staff-reports-daily {
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

        .date-selector {
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

        .date-selector label {
          font-weight: 600;
          color: #0f172a;
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
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

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
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
          margin-bottom: 16px;
          padding-left: 12px;
          border-left: 3px solid #0288d1;
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
          grid-template-columns: repeat(3, 1fr);
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
          grid-template-columns: repeat(3, 1fr);
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
          font-size: 0.8rem;
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

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          transition: transform 0.2s;
        }

        .activity-item:hover {
          transform: translateX(4px);
        }

        .activity-time {
          width: 80px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
        }

        .activity-action {
          flex: 1;
          font-size: 0.85rem;
          color: #334155;
        }

        .activity-type-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .activity-item.resolution .activity-type-badge { background: #d1fae5; color: #059669; }
        .activity-item.assignment .activity-type-badge { background: #dbeafe; color: #2563eb; }
        .activity-item.followup .activity-type-badge { background: #fef3c7; color: #d97706; }
        .activity-item.update .activity-type-badge { background: #e0e7ff; color: #4f46e5; }
        .activity-item.report .activity-type-badge { background: #f3e5f5; color: #7b1fa2; }

        @media print {
          .staff-reports-daily {
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
          
          .staff-header, .staff-sidebar, .refresh-btn, .action-btn, .date-selector, .backend-warning {
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
          
          .tasks-stats {
            grid-template-columns: 1fr;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .date-selector {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .activity-item {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .activity-time {
            width: 100%;
          }
          
          .satisfaction-container {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .satisfaction-bar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffReportsDaily;