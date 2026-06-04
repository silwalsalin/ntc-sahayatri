// src/pages/AdminReportsUsers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminReportsUsers = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample report data
  const [reportData, setReportData] = useState({
    summary: {
      totalUsers: 8956,
      activeUsers: 7234,
      inactiveUsers: 1200,
      suspendedUsers: 522,
      newUsersThisMonth: 234,
      newUsersLastMonth: 198,
      growth: 18.2,
      totalComplaints: 1247,
      avgComplaintsPerUser: 0.14,
      satisfactionRate: 78.5
    },
    roleBreakdown: [
      { name: 'प्रयोगकर्ता', enName: 'Users', count: 8456, percentage: 94.4 },
      { name: 'कर्मचारी', enName: 'Staff', count: 412, percentage: 4.6 },
      { name: 'प्रशासक', enName: 'Admin', count: 88, percentage: 1.0 }
    ],
    statusBreakdown: [
      { name: 'सक्रिय', enName: 'Active', count: 7234, percentage: 80.8 },
      { name: 'निष्क्रिय', enName: 'Inactive', count: 1200, percentage: 13.4 },
      { name: 'निलम्बित', enName: 'Suspended', count: 522, percentage: 5.8 }
    ],
    monthlyTrend: [
      { month: 'जनवरी', enMonth: 'January', count: 745 },
      { month: 'फेब्रुअरी', enMonth: 'February', count: 782 },
      { month: 'मार्च', enMonth: 'March', count: 810 },
      { month: 'अप्रिल', enMonth: 'April', count: 845 },
      { month: 'मे', enMonth: 'May', count: 878 },
      { month: 'जुन', enMonth: 'June', count: 912 },
      { month: 'जुलाई', enMonth: 'July', count: 945 },
      { month: 'अगस्ट', enMonth: 'August', count: 978 },
      { month: 'सेप्टेम्बर', enMonth: 'September', count: 1012 },
      { month: 'अक्टोबर', enMonth: 'October', count: 1045 },
      { month: 'नोभेम्बर', enMonth: 'November', count: 1089 },
      { month: 'डिसेम्बर', enMonth: 'December', count: 1123 }
    ],
    activityBreakdown: [
      { name: 'उच्च सक्रिय', enName: 'Highly Active', count: 2345, percentage: 26.2 },
      { name: 'मध्यम सक्रिय', enName: 'Moderately Active', count: 4567, percentage: 51.0 },
      { name: 'कम सक्रिय', enName: 'Low Activity', count: 2044, percentage: 22.8 }
    ],
    topUsers: [
      { id: 1, name: 'रमेश केसी', enName: 'Ramesh KC', email: 'ramesh@example.com', complaints: 12, resolved: 10, satisfaction: 4.8, status: 'active' },
      { id: 2, name: 'सीता शर्मा', enName: 'Sita Sharma', email: 'sita@example.com', complaints: 9, resolved: 8, satisfaction: 4.5, status: 'active' },
      { id: 3, name: 'विकास न्यौपाने', enName: 'Bikas Neupane', email: 'bikas@example.com', complaints: 8, resolved: 6, satisfaction: 4.2, status: 'active' },
      { id: 4, name: 'गीता अधिकारी', enName: 'Gita Adhikari', email: 'gita@example.com', complaints: 7, resolved: 7, satisfaction: 5.0, status: 'active' },
      { id: 5, name: 'हरि प्रसाद', enName: 'Hari Prasad', email: 'hari@example.com', complaints: 6, resolved: 5, satisfaction: 4.0, status: 'inactive' }
    ],
    registrationMethod: [
      { name: 'वेबसाइट', enName: 'Website', count: 4567, percentage: 51.0 },
      { name: 'मोबाइल एप', enName: 'Mobile App', count: 3890, percentage: 43.4 },
      { name: 'कर्मचारी', enName: 'Staff', count: 499, percentage: 5.6 }
    ]
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [navigate]);

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
      topUsers: 'शीर्ष प्रयोगकर्ताहरू',
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
      complaints: 'गुनासो',
      resolved: 'समाधान',
      satisfaction: 'सन्तुष्टि',
      highlyActive: 'उच्च सक्रिय',
      moderatelyActive: 'मध्यम सक्रिय',
      lowActivity: 'कम सक्रिय',
      website: 'वेबसाइट',
      mobileApp: 'मोबाइल एप',
      loading: 'लोड हुँदै...'
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
      topUsers: 'Top Users',
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
      complaints: 'Complaints',
      resolved: 'Resolved',
      satisfaction: 'Satisfaction',
      highlyActive: 'Highly Active',
      moderatelyActive: 'Moderately Active',
      lowActivity: 'Low Activity',
      website: 'Website',
      mobileApp: 'Mobile App',
      loading: 'Loading...'
    }
  };

  const t = content[language];
  const currentData = reportData;

  const getRoleText = (role) => {
    const roles = {
      np: { user: 'प्रयोगकर्ता', staff: 'कर्मचारी', admin: 'प्रशासक' },
      en: { user: 'User', staff: 'Staff', admin: 'Admin' }
    };
    return roles[language][role] || role;
  };

  const getStatusText = (status) => {
    const statuses = {
      np: { active: 'सक्रिय', inactive: 'निष्क्रिय', suspended: 'निलम्बित' },
      en: { active: 'Active', inactive: 'Inactive', suspended: 'Suspended' }
    };
    return statuses[language][status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      active: 'status-active',
      inactive: 'status-inactive',
      suspended: 'status-suspended'
    };
    return classes[status] || 'status-inactive';
  };

  const getMonthText = (month) => {
    const months = {
      np: {
        'January': 'जनवरी', 'February': 'फेब्रुअरी', 'March': 'मार्च',
        'April': 'अप्रिल', 'May': 'मे', 'June': 'जुन',
        'July': 'जुलाई', 'August': 'अगस्ट', 'September': 'सेप्टेम्बर',
        'October': 'अक्टोबर', 'November': 'नोभेम्बर', 'December': 'डिसेम्बर'
      },
      en: {
        'जनवरी': 'January', 'फेब्रुअरी': 'February', 'मार्च': 'March',
        'अप्रिल': 'April', 'मे': 'May', 'जुन': 'June',
        'जुलाई': 'July', 'अगस्ट': 'August', 'सेप्टेम्बर': 'September',
        'अक्टोबर': 'October', 'नोभेम्बर': 'November', 'डिसेम्बर': 'December'
      }
    };
    return months[language][month] || month;
  };

  const handleGenerateReport = () => {
    alert(t.reportGenerated);
  };

  const handleExportPDF = () => {
    alert(language === 'np' ? 'पीडीएफ निर्यात भइरहेको छ...' : 'Exporting PDF...');
  };

  const handleExportExcel = () => {
    alert(language === 'np' ? 'एक्सेल निर्यात भइरहेको छ...' : 'Exporting Excel...');
  };

  const handlePrint = () => {
    window.print();
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
    <div className="admin-reports-users">
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>👥 {t.usersReports}</h1>
                <p>{t.generateReports}</p>
              </div>
              <div className="action-buttons-header">
                <button className="export-btn pdf" onClick={handleExportPDF}>📄 {t.exportPDF}</button>
                <button className="export-btn excel" onClick={handleExportExcel}>📊 {t.exportExcel}</button>
                <button className="export-btn print" onClick={handlePrint}>🖨️ {t.print}</button>
              </div>
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
                    placeholder={t.startDate}
                  />
                  <span>—</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="date-input"
                    placeholder={t.endDate}
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

              <button className="generate-btn" onClick={handleGenerateReport}>
                🔄 {t.generateReport}
              </button>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon purple">👥</div>
                <div className="card-info">
                  <div className="card-value">{currentData.summary.totalUsers.toLocaleString()}</div>
                  <div className="card-label">{t.totalUsers}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon green">🟢</div>
                <div className="card-info">
                  <div className="card-value">{currentData.summary.activeUsers.toLocaleString()}</div>
                  <div className="card-label">{t.activeUsers}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon orange">⭕</div>
                <div className="card-info">
                  <div className="card-value">{currentData.summary.inactiveUsers.toLocaleString()}</div>
                  <div className="card-label">{t.inactiveUsers}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon red">🔴</div>
                <div className="card-info">
                  <div className="card-value">{currentData.summary.suspendedUsers.toLocaleString()}</div>
                  <div className="card-label">{t.suspendedUsers}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon blue">✨</div>
                <div className="card-info">
                  <div className="card-value">{currentData.summary.newUsersThisMonth}</div>
                  <div className="card-label">{t.newUsersThisMonth}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon pink">⭐</div>
                <div className="card-info">
                  <div className="card-value">{currentData.summary.satisfactionRate}%</div>
                  <div className="card-label">{t.satisfactionRate}</div>
                </div>
              </div>
            </div>

            {/* Growth Indicator */}
            <div className="growth-card">
              <div className="growth-info">
                <span className="growth-label">{t.newUsersThisMonth}:</span>
                <span className="growth-value">{currentData.summary.newUsersThisMonth}</span>
              </div>
              <div className="growth-info">
                <span className="growth-label">{t.newUsersLastMonth}:</span>
                <span className="growth-value">{currentData.summary.newUsersLastMonth}</span>
              </div>
              <div className="growth-info">
                <span className="growth-label">{t.growth}:</span>
                <span className="growth-value positive">+{currentData.summary.growth}%</span>
              </div>
              <div className="growth-info">
                <span className="growth-label">{t.totalComplaints}:</span>
                <span className="growth-value">{currentData.summary.totalComplaints}</span>
              </div>
              <div className="growth-info">
                <span className="growth-label">{t.avgComplaintsPerUser}:</span>
                <span className="growth-value">{currentData.summary.avgComplaintsPerUser}</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Role Breakdown */}
              <div className="chart-card">
                <h3>{t.roleBreakdown}</h3>
                <div className="chart-content">
                  {currentData.roleBreakdown.map((item, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <div className="chart-label">
                        <span>{language === 'np' ? item.name : item.enName}</span>
                        <span>{item.count.toLocaleString()} ({item.percentage}%)</span>
                      </div>
                      <div className="chart-bar-bg">
                        <div 
                          className="chart-bar-fill" 
                          style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${200 + idx * 120}, 70%, 55%)` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="chart-card">
                <h3>{t.statusBreakdown}</h3>
                <div className="chart-content">
                  {currentData.statusBreakdown.map((item, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <div className="chart-label">
                        <span>{language === 'np' ? item.name : item.enName}</span>
                        <span>{item.count.toLocaleString()} ({item.percentage}%)</span>
                      </div>
                      <div className="chart-bar-bg">
                        <div 
                          className="chart-bar-fill" 
                          style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${120 + idx * 90}, 70%, 55%)` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Breakdown */}
              <div className="chart-card">
                <h3>{t.activityBreakdown}</h3>
                <div className="chart-content">
                  {currentData.activityBreakdown.map((item, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <div className="chart-label">
                        <span>{language === 'np' ? item.name : item.enName}</span>
                        <span>{item.count.toLocaleString()} ({item.percentage}%)</span>
                      </div>
                      <div className="chart-bar-bg">
                        <div 
                          className="chart-bar-fill" 
                          style={{ width: `${item.percentage}%`, backgroundColor: `hsl(${280 + idx * 30}, 70%, 55%)` }}
                        />
                      </div>
                    </div>
                  ))}
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
                        <span>{item.count.toLocaleString()} ({item.percentage}%)</span>
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
                    <div className="trend-label">{getMonthText(item.month)}</div>
                    <div className="trend-bar-bg">
                      <div 
                        className="trend-bar-fill" 
                        style={{ 
                          height: `${(item.count / Math.max(...currentData.monthlyTrend.map(m => m.count))) * 100}%`,
                          backgroundColor: `hsl(${210 + idx * 5}, 70%, 55%)`
                        }}
                      >
                        <span className="trend-value">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Users Table */}
            <div className="table-card">
              <h3>{t.topUsers}</h3>
              <div className="table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>{t.name}</th>
                      <th>{t.email}</th>
                      <th>{t.complaints}</th>
                      <th>{t.resolved}</th>
                      <th>{t.satisfaction}</th>
                      <th>{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.topUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="user-name">{language === 'np' ? user.name : user.enName}</td>
                        <td>{user.email}</td>
                        <td>{user.complaints}</td>
                        <td>{user.resolved}</td>
                        <td>
                          <div className="satisfaction-star">
                            <span>⭐</span> {user.satisfaction}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(user.status)}`}>
                            {getStatusText(user.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

        .admin-reports-users {
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
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Dashboard Layout */
        .dashboard-layout {
          display: flex;
          height: calc(100vh - 195px);
          margin-top: 195px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        /* Sidebar Container - Fixed */
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

        /* Main Container - Scrollable */
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

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }

        .page-header h1 {
          font-size: 1.6rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .page-header p {
          color: #64748b;
          font-size: 0.85rem;
        }

        .action-buttons-header {
          display: flex;
          gap: 12px;
        }

        .export-btn {
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
        }

        .export-btn.pdf {
          background: #fee2e2;
          color: #dc2626;
        }

        .export-btn.pdf:hover {
          background: #fecaca;
        }

        .export-btn.excel {
          background: #d1fae5;
          color: #059669;
        }

        .export-btn.excel:hover {
          background: #a7f3d0;
        }

        .export-btn.print {
          background: #dbeafe;
          color: #2563eb;
        }

        .export-btn.print:hover {
          background: #bfdbfe;
        }

        /* Filters */
        .filters-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: flex-end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 150px;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .filter-select, .date-input {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus, .date-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .date-range {
          flex-direction: row;
          align-items: center;
        }

        .date-range span {
          color: #64748b;
        }

        .generate-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          height: 42px;
        }

        .generate-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        /* Summary Cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .card-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .card-icon.purple { background: #f3e8ff; color: #9333ea; }
        .card-icon.green { background: #d1fae5; color: #059669; }
        .card-icon.orange { background: #fed7aa; color: #ea580c; }
        .card-icon.red { background: #fee2e2; color: #dc2626; }
        .card-icon.blue { background: #dbeafe; color: #2563eb; }
        .card-icon.pink { background: #fce7f3; color: #db2777; }

        .card-info {
          flex: 1;
        }

        .card-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .card-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Growth Card */
        .growth-card {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 16px;
          padding: 16px 24px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-around;
          border: 1px solid #bae6fd;
          flex-wrap: wrap;
          gap: 16px;
        }

        .growth-info {
          text-align: center;
        }

        .growth-label {
          font-size: 0.75rem;
          color: #0369a1;
          display: block;
          margin-bottom: 4px;
        }

        .growth-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0c4a6e;
        }

        .growth-value.positive {
          color: #059669;
        }

        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
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
        }

        .chart-bar-bg {
          background: #f1f5f9;
          border-radius: 8px;
          overflow: hidden;
          height: 8px;
        }

        .chart-bar-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.5s;
        }

        /* Trend Chart */
        .trend-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
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
          height: 250px;
          gap: 12px;
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
        }

        .trend-bar-bg {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .trend-bar-fill {
          width: 40px;
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: height 0.5s;
          min-height: 30px;
        }

        .trend-value {
          position: absolute;
          top: -22px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }

        /* Table Card */
        .table-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .table-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
        }

        .reports-table th,
        .reports-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .reports-table th {
          color: #64748b;
          font-weight: 500;
          font-size: 0.75rem;
        }

        .reports-table td {
          color: #334155;
          font-size: 0.8rem;
        }

        .user-name {
          font-weight: 600;
          color: #0f172a;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-active { background: #d1fae5; color: #059669; }
        .status-inactive { background: #fef3c7; color: #d97706; }
        .status-suspended { background: #fee2e2; color: #dc2626; }

        .satisfaction-star {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .summary-cards {
            grid-template-columns: repeat(3, 1fr);
          }
          .charts-grid {
            grid-template-columns: 1fr;
          }
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
            gap: 12px;
          }
          
          .filters-section {
            flex-direction: column;
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
          
          .trend-chart {
            height: auto;
            flex-direction: column;
          }
          
          .trend-bar-item {
            flex-direction: row;
            width: 100%;
            justify-content: space-between;
          }
          
          .trend-bar-bg {
            width: 60%;
          }
          
          .trend-bar-fill {
            width: 100%;
            height: 30px !important;
            border-radius: 8px;
          }
          
          .trend-value {
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
          }
          
          .action-buttons-header {
            flex-wrap: wrap;
          }
          
          .growth-card {
            flex-direction: column;
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .summary-cards {
            grid-template-columns: 1fr;
          }
          
          .reports-table th,
          .reports-table td {
            padding: 8px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReportsUsers;