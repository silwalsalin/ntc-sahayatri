// src/pages/AdminAnalytics.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('month');

  // Analytics data
  const [analyticsData] = useState({
    overview: {
      totalComplaints: 1247,
      resolvedComplaints: 749,
      pendingComplaints: 342,
      inProgressComplaints: 156,
      satisfactionRate: 78.5,
      avgResponseTime: '2.5',
      enAvgResponseTime: '2.5',
      avgResolutionTime: '4.2',
      enAvgResolutionTime: '4.2',
      peakHour: '१०:०० - १२:००',
      enPeakHour: '10:00 - 12:00',
      busiestDay: 'सोमबार',
      enBusiestDay: 'Monday'
    },
    trends: {
      complaints: [65, 78, 82, 74, 88, 92, 95, 89, 91, 87, 93, 98],
      resolved: [45, 52, 58, 56, 62, 68, 72, 70, 73, 71, 76, 80],
      months: ['जन', 'फेब', 'मार्च', 'अप्रि', 'मे', 'जुन', 'जुला', 'अग', 'सेप', 'अक्टो', 'नोभे', 'डिसे'],
      enMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    categories: {
      labels: ['इन्टरनेट', 'बिलिङ', 'नेटवर्क', 'रिचार्ज', 'प्राविधिक', 'सक्रियता'],
      enLabels: ['Internet', 'Billing', 'Network', 'Recharge', 'Technical', 'Activation'],
      data: [425, 312, 198, 156, 98, 58],
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    },
    performance: {
      responseTime: [2.1, 2.3, 2.4, 2.5, 2.4, 2.6],
      resolutionTime: [4.5, 4.3, 4.2, 4.1, 4.0, 3.9],
      labels: ['जन', 'फेब', 'मार्च', 'अप्रि', 'मे', 'जुन'],
      enLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    topPerformers: [
      { id: 1, name: 'प्राविधिक टोली', enName: 'Technical Team', resolved: 345, avgTime: '1.8', satisfaction: 4.8 },
      { id: 2, name: 'बिलिङ टोली', enName: 'Billing Team', resolved: 298, avgTime: '2.1', satisfaction: 4.5 },
      { id: 3, name: 'नेटवर्क टोली', enName: 'Network Team', resolved: 267, avgTime: '2.3', satisfaction: 4.3 },
      { id: 4, name: 'ग्राहक सेवा', enName: 'Customer Service', resolved: 234, avgTime: '1.5', satisfaction: 4.9 },
      { id: 5, name: 'प्रशासन', enName: 'Administration', resolved: 189, avgTime: '2.0', satisfaction: 4.6 }
    ],
    hourlyDistribution: [
      { hour: '०६-०८', enHour: '06-08', count: 45 },
      { hour: '०८-१०', enHour: '08-10', count: 89 },
      { hour: '१०-१२', enHour: '10-12', count: 234 },
      { hour: '१२-१४', enHour: '12-14', count: 198 },
      { hour: '१४-१६', enHour: '14-16', count: 167 },
      { hour: '१६-१८', enHour: '16-18', count: 123 },
      { hour: '१८-२०', enHour: '18-20', count: 78 },
      { hour: '२०-२२', enHour: '20-22', count: 45 }
    ],
    dayWiseDistribution: [
      { day: 'सोमबार', enDay: 'Monday', count: 234 },
      { day: 'मंगलबार', enDay: 'Tuesday', count: 198 },
      { day: 'बुधबार', enDay: 'Wednesday', count: 187 },
      { day: 'बिहीबार', enDay: 'Thursday', count: 203 },
      { day: 'शुक्रबार', enDay: 'Friday', count: 178 },
      { day: 'शनिबार', enDay: 'Saturday', count: 98 },
      { day: 'आइतबार', enDay: 'Sunday', count: 67 }
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
      analytics: 'विश्लेषण',
      dashboard: 'एनालिटिक्स ड्यासबोर्ड',
      complaints: 'गुनासो',
      resolved: 'समाधान',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      satisfactionRate: 'सन्तुष्टि दर',
      avgResponseTime: 'औसत प्रतिक्रिया समय',
      avgResolutionTime: 'औसत समाधान समय',
      peakHour: 'व्यस्त समय',
      busiestDay: 'व्यस्त दिन',
      categoryDistribution: 'प्रकार अनुसार वितरण',
      monthlyTrend: 'मासिक प्रवृत्ति',
      responseVsResolution: 'प्रतिक्रिया बनाम समाधान',
      topPerformers: 'शीर्ष प्रदर्शनकर्ताहरू',
      team: 'टोली',
      resolvedCount: 'समाधान संख्या',
      avgTime: 'औसत समय',
      satisfaction: 'सन्तुष्टि',
      hourlyDistribution: 'घण्टागत वितरण',
      dayWiseDistribution: 'दिनगत वितरण',
      exportReport: 'रिपोर्ट निर्यात',
      refresh: 'रिफ्रेस',
      vsLastMonth: 'गत महिना भन्दा',
      hours: 'घण्टा',
      days: 'दिन',
      loading: 'लोड हुँदैछ...'
    },
    en: {
      analytics: 'Analytics',
      dashboard: 'Analytics Dashboard',
      complaints: 'Complaints',
      resolved: 'Resolved',
      pending: 'Pending',
      inProgress: 'In Progress',
      satisfactionRate: 'Satisfaction Rate',
      avgResponseTime: 'Avg Response Time',
      avgResolutionTime: 'Avg Resolution Time',
      peakHour: 'Peak Hour',
      busiestDay: 'Busiest Day',
      categoryDistribution: 'Category Distribution',
      monthlyTrend: 'Monthly Trend',
      responseVsResolution: 'Response vs Resolution',
      topPerformers: 'Top Performers',
      team: 'Team',
      resolvedCount: 'Resolved',
      avgTime: 'Avg Time',
      satisfaction: 'Satisfaction',
      hourlyDistribution: 'Hourly Distribution',
      dayWiseDistribution: 'Day-wise Distribution',
      exportReport: 'Export Report',
      refresh: 'Refresh',
      vsLastMonth: 'vs last month',
      hours: 'hours',
      days: 'days',
      loading: 'Loading...'
    }
  };

  const t = content[language];

  // Helper functions
  const getCategoryLabels = () => {
    return language === 'np' ? analyticsData.categories.labels : analyticsData.categories.enLabels;
  };

  const getDayText = (item) => {
    return language === 'np' ? item.day : item.enDay;
  };

  const getHourText = (item) => {
    return language === 'np' ? item.hour : item.enHour;
  };

  const getMonthLabels = () => {
    return language === 'np' ? analyticsData.trends.months : analyticsData.trends.enMonths;
  };

  const getPerfLabels = () => {
    return language === 'np' ? analyticsData.performance.labels : analyticsData.performance.enLabels;
  };

  const handleExportReport = () => {
    alert(language === 'np' ? 'रिपोर्ट निर्यात भइरहेको छ...' : 'Exporting report...');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  // Calculate max values for charts
  const maxCount = Math.max(...analyticsData.hourlyDistribution.map(h => h.count));
  const maxDayCount = Math.max(...analyticsData.dayWiseDistribution.map(d => d.count));
  const maxTrendValue = Math.max(...analyticsData.trends.complaints);
  const totalCategories = analyticsData.categories.data.reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>📊 {t.analytics}</h1>
                <p>{t.dashboard}</p>
              </div>
              <div className="header-actions">
                <select 
                  value={timePeriod} 
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="period-select"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <button className="export-btn" onClick={handleExportReport}>📥 {t.exportReport}</button>
                <button className="refresh-btn" onClick={handleRefresh}>🔄 {t.refresh}</button>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="overview-cards">
              <div className="overview-card">
                <div className="card-icon blue">📋</div>
                <div className="card-info">
                  <div className="card-value">{analyticsData.overview.totalComplaints}</div>
                  <div className="card-label">{t.complaints}</div>
                  <div className="card-trend positive">↑ 12% {t.vsLastMonth}</div>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon green">✅</div>
                <div className="card-info">
                  <div className="card-value">{analyticsData.overview.resolvedComplaints}</div>
                  <div className="card-label">{t.resolved}</div>
                  <div className="card-trend positive">↑ 8% {t.vsLastMonth}</div>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon orange">⏳</div>
                <div className="card-info">
                  <div className="card-value">{analyticsData.overview.pendingComplaints}</div>
                  <div className="card-label">{t.pending}</div>
                  <div className="card-trend negative">↑ 5% {t.vsLastMonth}</div>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon yellow">🔄</div>
                <div className="card-info">
                  <div className="card-value">{analyticsData.overview.inProgressComplaints}</div>
                  <div className="card-label">{t.inProgress}</div>
                  <div className="card-trend positive">↓ 3% {t.vsLastMonth}</div>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon pink">⭐</div>
                <div className="card-info">
                  <div className="card-value">{analyticsData.overview.satisfactionRate}%</div>
                  <div className="card-label">{t.satisfactionRate}</div>
                  <div className="card-trend positive">↑ 4% {t.vsLastMonth}</div>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon purple">⏱️</div>
                <div className="card-info">
                  <div className="card-value">{language === 'np' ? analyticsData.overview.avgResponseTime : analyticsData.overview.enAvgResponseTime} {t.hours}</div>
                  <div className="card-label">{t.avgResponseTime}</div>
                  <div className="card-trend positive">↓ 0.5% {t.vsLastMonth}</div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
              <div className="stat-box">
                <span className="stat-box-icon">⏰</span>
                <div className="stat-box-info">
                  <div className="stat-box-value">{language === 'np' ? analyticsData.overview.peakHour : analyticsData.overview.enPeakHour}</div>
                  <div className="stat-box-label">{t.peakHour}</div>
                </div>
              </div>
              <div className="stat-box">
                <span className="stat-box-icon">📅</span>
                <div className="stat-box-info">
                  <div className="stat-box-value">{language === 'np' ? analyticsData.overview.busiestDay : analyticsData.overview.enBusiestDay}</div>
                  <div className="stat-box-label">{t.busiestDay}</div>
                </div>
              </div>
              <div className="stat-box">
                <span className="stat-box-icon">⚡</span>
                <div className="stat-box-info">
                  <div className="stat-box-value">{language === 'np' ? analyticsData.overview.avgResolutionTime : analyticsData.overview.enAvgResolutionTime} {t.days}</div>
                  <div className="stat-box-label">{t.avgResolutionTime}</div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="chart-card">
              <h3>{t.categoryDistribution}</h3>
              <div className="category-grid">
                {analyticsData.categories.data.map((value, idx) => {
                  const percentage = ((value / totalCategories) * 100).toFixed(1);
                  return (
                    <div key={idx} className="category-item">
                      <div className="category-header">
                        <span className="category-dot" style={{ backgroundColor: analyticsData.categories.colors[idx] }}></span>
                        <span className="category-name">{getCategoryLabels()[idx]}</span>
                        <span className="category-value">{value}</span>
                      </div>
                      <div className="category-bar">
                        <div className="category-bar-fill" style={{ width: `${percentage}%`, backgroundColor: analyticsData.categories.colors[idx] }}></div>
                      </div>
                      <div className="category-percentage">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="chart-card">
              <h3>{t.monthlyTrend}</h3>
              <div className="trend-container">
                <div className="trend-legend">
                  <span className="legend-dot complaints"></span>
                  <span>{t.complaints}</span>
                  <span className="legend-dot resolved"></span>
                  <span>{t.resolved}</span>
                </div>
                <div className="trend-chart">
                  {analyticsData.trends.complaints.map((value, idx) => (
                    <div key={idx} className="trend-column">
                      <div className="trend-bars">
                        <div 
                          className="trend-bar complaints-bar" 
                          style={{ height: `${(value / maxTrendValue) * 100}%` }}
                        >
                          <span className="trend-value">{value}</span>
                        </div>
                        <div 
                          className="trend-bar resolved-bar" 
                          style={{ height: `${(analyticsData.trends.resolved[idx] / maxTrendValue) * 100}%` }}
                        >
                          <span className="trend-value">{analyticsData.trends.resolved[idx]}</span>
                        </div>
                      </div>
                      <div className="trend-label">{getMonthLabels()[idx]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Response vs Resolution */}
            <div className="chart-card">
              <h3>{t.responseVsResolution}</h3>
              <div className="dual-legend">
                <span className="legend-dot response"></span>
                <span>{t.avgResponseTime} ({t.hours})</span>
                <span className="legend-dot resolution"></span>
                <span>{t.avgResolutionTime} ({t.days})</span>
              </div>
              <div className="dual-chart">
                {analyticsData.performance.responseTime.map((value, idx) => (
                  <div key={idx} className="dual-column">
                    <div className="dual-bars">
                      <div className="dual-bar response-bar" style={{ height: `${(value / 5) * 100}%` }}>
                        <span className="dual-value">{value}</span>
                      </div>
                      <div className="dual-bar resolution-bar" style={{ height: `${(analyticsData.performance.resolutionTime[idx] / 5) * 100}%` }}>
                        <span className="dual-value">{analyticsData.performance.resolutionTime[idx]}</span>
                      </div>
                    </div>
                    <div className="dual-label">{getPerfLabels()[idx]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="chart-card">
              <h3>{t.topPerformers}</h3>
              <div className="table-wrapper">
                <table className="performers-table">
                  <thead>
                    <tr>
                      <th>{t.team}</th>
                      <th>{t.resolvedCount}</th>
                      <th>{t.avgTime} ({t.days})</th>
                      <th>{t.satisfaction}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topPerformers.map((performer) => (
                      <tr key={performer.id}>
                        <td className="performer-name">{language === 'np' ? performer.name : performer.enName}</td>
                        <td>{performer.resolved}</td>
                        <td>{performer.avgTime} {t.days}</td>
                        <td>
                          <div className="star-rating">
                            {'★'.repeat(Math.floor(performer.satisfaction))}
                            {'☆'.repeat(5 - Math.floor(performer.satisfaction))}
                            <span className="rating-value">({performer.satisfaction})</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hourly Distribution */}
            <div className="chart-card">
              <h3>{t.hourlyDistribution}</h3>
              <div className="hourly-container">
                {analyticsData.hourlyDistribution.map((item, idx) => (
                  <div key={idx} className="hourly-item">
                    <div className="hourly-label">{getHourText(item)}</div>
                    <div className="hourly-bar-wrapper">
                      <div 
                        className="hourly-bar" 
                        style={{ height: `${(item.count / maxCount) * 100}%` }}
                      >
                        <span className="hourly-count">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day-wise Distribution */}
            <div className="chart-card">
              <h3>{t.dayWiseDistribution}</h3>
              <div className="daywise-container">
                {analyticsData.dayWiseDistribution.map((item, idx) => (
                  <div key={idx} className="daywise-item">
                    <div className="daywise-label">{getDayText(item)}</div>
                    <div className="daywise-bar-wrapper">
                      <div 
                        className="daywise-bar" 
                        style={{ height: `${(item.count / maxDayCount) * 100}%` }}
                      >
                        <span className="daywise-count">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
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

        .admin-analytics {
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
          flex-wrap: wrap;
          gap: 16px;
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

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .period-select {
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .export-btn, .refresh-btn {
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
          font-size: 0.85rem;
        }

        .export-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .export-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }

        .refresh-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .refresh-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        /* Overview Cards */
        .overview-cards {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .overview-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .overview-card:hover {
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

        .card-icon.blue { background: #dbeafe; color: #2563eb; }
        .card-icon.green { background: #d1fae5; color: #059669; }
        .card-icon.orange { background: #fed7aa; color: #ea580c; }
        .card-icon.yellow { background: #fef3c7; color: #d97706; }
        .card-icon.pink { background: #fce7f3; color: #db2777; }
        .card-icon.purple { background: #f3e8ff; color: #9333ea; }

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
          margin-top: 4px;
        }

        .card-trend {
          font-size: 0.65rem;
          margin-top: 6px;
        }

        .card-trend.positive {
          color: #059669;
        }

        .card-trend.negative {
          color: #dc2626;
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
        }

        .stat-box-icon {
          font-size: 2rem;
        }

        .stat-box-info {
          flex: 1;
        }

        .stat-box-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-box-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 4px;
        }

        /* Chart Cards */
        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
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

        /* Category Distribution */
        .category-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .category-item {
          width: 100%;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .category-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .category-name {
          flex: 1;
          font-size: 0.85rem;
          font-weight: 500;
          color: #334155;
        }

        .category-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
        }

        .category-bar {
          background: #f1f5f9;
          border-radius: 8px;
          overflow: hidden;
          height: 8px;
          margin-bottom: 6px;
        }

        .category-bar-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.5s;
        }

        .category-percentage {
          font-size: 0.7rem;
          color: #64748b;
          text-align: right;
        }

        /* Trend Chart */
        .trend-container {
          margin-top: 16px;
        }

        .trend-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .legend-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 6px;
        }

        .legend-dot.complaints { background: #3b82f6; }
        .legend-dot.resolved { background: #10b981; }
        .legend-dot.response { background: #8b5cf6; }
        .legend-dot.resolution { background: #ec4899; }

        .trend-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 250px;
          gap: 8px;
        }

        .trend-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .trend-bars {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
        }

        .trend-bar {
          width: 30px;
          border-radius: 6px 6px 0 0;
          position: relative;
          transition: height 0.5s;
          cursor: pointer;
        }

        .trend-bar:hover {
          opacity: 0.8;
        }

        .complaints-bar {
          background: #3b82f6;
        }

        .resolved-bar {
          background: #10b981;
        }

        .trend-value {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.6rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .trend-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Dual Chart */
        .dual-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .dual-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 250px;
          gap: 16px;
        }

        .dual-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .dual-bars {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 6px;
        }

        .dual-bar {
          width: 35px;
          border-radius: 6px 6px 0 0;
          position: relative;
          transition: height 0.5s;
          cursor: pointer;
        }

        .dual-bar:hover {
          opacity: 0.8;
        }

        .response-bar {
          background: #8b5cf6;
        }

        .resolution-bar {
          background: #ec4899;
        }

        .dual-value {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.6rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .dual-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Table */
        .table-wrapper {
          overflow-x: auto;
        }

        .performers-table {
          width: 100%;
          border-collapse: collapse;
        }

        .performers-table th,
        .performers-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .performers-table th {
          color: #64748b;
          font-weight: 500;
          font-size: 0.75rem;
        }

        .performers-table td {
          font-size: 0.85rem;
          color: #334155;
        }

        .performers-table tr:hover {
          background: #f8fafc;
        }

        .performer-name {
          font-weight: 600;
          color: #0f172a;
        }

        .star-rating {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-wrap: wrap;
        }

        .star-rating span:not(.rating-value) {
          font-size: 0.85rem;
        }

        .rating-value {
          margin-left: 6px;
          font-weight: 500;
          color: #64748b;
          font-size: 0.7rem;
        }

        /* Hourly Distribution */
        .hourly-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 220px;
          gap: 8px;
        }

        .hourly-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .hourly-label {
          font-size: 0.65rem;
          color: #64748b;
        }

        .hourly-bar-wrapper {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .hourly-bar {
          width: 35px;
          border-radius: 6px 6px 0 0;
          position: relative;
          transition: height 0.5s;
          background: linear-gradient(180deg, #3b82f6, #60a5fa);
          cursor: pointer;
        }

        .hourly-bar:hover {
          opacity: 0.8;
        }

        .hourly-count {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.6rem;
          font-weight: 600;
          white-space: nowrap;
        }

        /* Day-wise Distribution */
        .daywise-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 220px;
          gap: 12px;
        }

        .daywise-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .daywise-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        .daywise-bar-wrapper {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .daywise-bar {
          width: 40px;
          border-radius: 6px 6px 0 0;
          position: relative;
          transition: height 0.5s;
          background: linear-gradient(180deg, #10b981, #34d399);
          cursor: pointer;
        }

        .daywise-bar:hover {
          opacity: 0.8;
        }

        .daywise-count {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.6rem;
          font-weight: 600;
          white-space: nowrap;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .overview-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .admin-analytics {
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
          }
          
          .overview-cards {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stats-row {
            grid-template-columns: 1fr;
          }
          
          .trend-chart, .dual-chart, .hourly-container, .daywise-container {
            height: auto;
            flex-direction: column;
          }
          
          .trend-column, .dual-column, .hourly-item, .daywise-item {
            flex-direction: row;
            width: 100%;
            justify-content: space-between;
          }
          
          .trend-bars, .dual-bars, .hourly-bar-wrapper, .daywise-bar-wrapper {
            width: 60%;
          }
          
          .trend-bar, .dual-bar, .hourly-bar, .daywise-bar {
            width: 100%;
            height: 30px !important;
            border-radius: 6px;
          }
          
          .trend-value, .dual-value, .hourly-count, .daywise-count {
            top: 50%;
            left: 10px;
            transform: translateY(-50%);
          }
        }

        @media (max-width: 480px) {
          .overview-cards {
            grid-template-columns: 1fr;
          }
          
          .performers-table th,
          .performers-table td {
            padding: 8px;
            font-size: 0.7rem;
          }
          
          .category-header {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAnalytics;