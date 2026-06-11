// src/pages/StaffTasksCompleted.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffTasksCompleted = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

  const [tasks, setTasks] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    urgent: 0,
    completedThisMonth: 0,
    avgCompletionTime: 0
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

  // Fetch completed tasks
  const fetchCompletedTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/staff/tasks/completed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const transformedTasks = response.data.data.map(task => transformTaskData(task));
        setTasks(transformedTasks);
        calculateStats(transformedTasks);
        setBackendStatus('connected');
      } else {
        setTasks(getSampleCompletedTasks());
        calculateStats(getSampleCompletedTasks());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      setTasks(getSampleCompletedTasks());
      calculateStats(getSampleCompletedTasks());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (tasksData) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const newStats = {
      total: tasksData.length,
      high: tasksData.filter(t => t.priority === 'high').length,
      medium: tasksData.filter(t => t.priority === 'medium').length,
      low: tasksData.filter(t => t.priority === 'low').length,
      urgent: tasksData.filter(t => t.priority === 'urgent').length,
      completedThisMonth: tasksData.filter(t => {
        if (!t.completedDateObj) return false;
        return t.completedDateObj.getMonth() === currentMonth && 
               t.completedDateObj.getFullYear() === currentYear;
      }).length,
      avgCompletionTime: tasksData.length > 0 
        ? Math.round(tasksData.reduce((acc, t) => acc + t.completionTime, 0) / tasksData.length) 
        : 0
    };
    setStats(newStats);
  };

  // Transform task data
  const transformTaskData = (task) => {
    const assignedDate = task.assignedDate ? new Date(task.assignedDate) : null;
    const completedDate = task.completedDate ? new Date(task.completedDate) : null;
    const completionTime = assignedDate && completedDate 
      ? Math.ceil((completedDate - assignedDate) / (1000 * 60 * 60 * 24))
      : task.completionTime || Math.floor(Math.random() * 5) + 1;
    
    const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
    let completedOnTime = true;
    if (dueDateObj && completedDate) {
      completedOnTime = completedDate <= dueDateObj;
    }
    
    return {
      id: task.id,
      title: task.title || 'N/A',
      enTitle: task.enTitle || task.title || 'N/A',
      description: task.description || 'N/A',
      enDescription: task.enDescription || task.description || 'N/A',
      status: mapStatus(task.status),
      priority: mapPriority(task.priority),
      assignedBy: task.assignedBy || 'Admin',
      assignedById: task.assignedById || null,
      assignedByName: task.assignedByName || 'Admin',
      assignedDate: task.assignedDate ? formatNepaliDate(task.assignedDate) : formatNepaliDate(new Date()),
      enAssignedDate: task.assignedDate ? formatEnglishDate(task.assignedDate) : formatEnglishDate(new Date()),
      completedDate: task.completedDate ? formatNepaliDate(task.completedDate) : formatNepaliDate(new Date()),
      enCompletedDate: task.completedDate ? formatEnglishDate(task.completedDate) : formatEnglishDate(new Date()),
      completedDateObj: completedDate,
      completionTime: completionTime,
      dueDate: task.dueDate ? formatNepaliDate(task.dueDate) : null,
      enDueDate: task.dueDate ? formatEnglishDate(task.dueDate) : null,
      dueDateObj: dueDateObj,
      completedOnTime: completedOnTime,
      relatedComplaintId: task.relatedComplaintId || null,
      relatedTicketId: task.relatedTicketId || null,
      relatedTicketNo: task.relatedTicketNo || task.relatedTicketId || null,
      notes: task.notes || null,
      feedback: task.feedback || null,
      staffName: task.staffName || task.assignedTo || 'Unassigned',
      staffRole: task.staffRole || 'Staff'
    };
  };

  const mapStatus = (status) => {
    if (!status) return 'completed';
    const statusMap = {
      'Completed': 'completed',
      'completed': 'completed',
      'Resolved': 'completed',
      'resolved': 'completed'
    };
    return statusMap[status] || 'completed';
  };

  const mapPriority = (priority) => {
    if (!priority) return 'medium';
    const priorityMap = {
      'High': 'high',
      'high': 'high',
      'Urgent': 'urgent',
      'urgent': 'urgent',
      'Medium': 'medium',
      'medium': 'medium',
      'Low': 'low',
      'low': 'low'
    };
    return priorityMap[priority] || 'medium';
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

  // Get sample completed tasks with multiple staff
  const getSampleCompletedTasks = () => {
    return [
      { 
        id: 1, 
        title: 'ज्ञानकोष अपडेट गर्नुहोस्', 
        enTitle: 'Update knowledge base',
        description: 'नयाँ समाधानहरूको आधारमा ज्ञानकोष अपडेट गर्नुहोस्। यसमा ५ वटा नयाँ समाधानहरू थप्नुपर्नेछ।',
        enDescription: 'Update the knowledge base with new solutions. Need to add 5 new solutions.',
        status: 'completed',
        priority: 'medium',
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        assignedDate: '2024-02-18',
        completedDate: '2024-02-21',
        dueDate: '2024-02-22',
        completionTime: 3,
        completedOnTime: true,
        relatedTicketNo: 'NTC-2024-010'
      },
      { 
        id: 2, 
        title: 'साप्ताहिक रिपोर्ट पेश गर्नुहोस्', 
        enTitle: 'Submit weekly report',
        description: 'यो हप्ताको गुनासो समाधानको विवरण सहितको रिपोर्ट पेश गर्नुहोस्।',
        enDescription: 'Submit report with details of complaint resolutions for this week.',
        status: 'completed',
        priority: 'high',
        assignedBy: 'Supervisor',
        assignedByName: 'Supervisor',
        assignedDate: '2024-02-19',
        completedDate: '2024-02-23',
        dueDate: '2024-02-23',
        completionTime: 4,
        completedOnTime: true
      },
      { 
        id: 3, 
        title: 'ग्राहक प्रतिक्रिया सङ्कलन गर्नुहोस्', 
        enTitle: 'Collect customer feedback',
        description: 'समाधान गरिएका गुनासोहरूको ग्राहक प्रतिक्रिया सङ्कलन गर्नुहोस्।',
        enDescription: 'Collect customer feedback on resolved complaints.',
        status: 'completed',
        priority: 'low',
        assignedBy: 'Team Lead',
        assignedByName: 'Team Lead',
        assignedDate: '2024-02-20',
        completedDate: '2024-02-24',
        dueDate: '2024-02-25',
        completionTime: 4,
        completedOnTime: true
      },
      { 
        id: 4, 
        title: 'प्रणाली परीक्षण गर्नुहोस्', 
        enTitle: 'Test the system',
        description: 'नयाँ प्रणाली अपडेटको परीक्षण गरी रिपोर्ट तयार गर्नुहोस्।',
        enDescription: 'Test the new system update and prepare a report.',
        status: 'completed',
        priority: 'urgent',
        assignedBy: 'IT Department',
        assignedByName: 'IT Department',
        assignedDate: '2024-02-15',
        completedDate: '2024-02-18',
        dueDate: '2024-02-20',
        completionTime: 3,
        completedOnTime: true,
        relatedTicketNo: 'NTC-2024-008'
      },
      { 
        id: 5, 
        title: 'प्राविधिक दस्तावेज तयार गर्नुहोस्', 
        enTitle: 'Prepare technical documentation',
        description: 'नयाँ प्रणालीको लागि प्राविधिक दस्तावेज तयार गर्नुहोस्।',
        enDescription: 'Prepare technical documentation for the new system.',
        status: 'completed',
        priority: 'medium',
        assignedBy: 'Technical Lead',
        assignedByName: 'Technical Lead',
        assignedDate: '2024-02-10',
        completedDate: '2024-02-19',
        dueDate: '2024-02-18',
        completionTime: 9,
        completedOnTime: false,
        feedback: 'दस्तावेज राम्रो बनेको छ तर समयमा पेश गर्न सकिएन। अर्को पटक समयमै पेश गर्नुहोस्।'
      }
    ];
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchCompletedTasks();
    }
  }, [navigate]);

  const content = {
    np: {
      pageTitle: 'पूरा भएका कार्यहरू',
      completedTasks: 'पूरा भएका कार्यहरू',
      searchPlaceholder: 'कार्य शीर्षक वा विवरणले खोज्नुहोस्...',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      taskTitle: 'कार्य शीर्षक',
      description: 'विवरण',
      assignedBy: 'तोक्ने व्यक्ति',
      assignedDate: 'तोकिएको मिति',
      completedDate: 'पूरा भएको मिति',
      completionTime: 'पूरा हुने समय',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      taskDetails: 'कार्यको विवरण',
      dueDate: 'अन्तिम मिति',
      completedOnTime: 'समयमै पूरा',
      relatedComplaint: 'सम्बन्धित गुनासो',
      notes: 'नोटहरू',
      feedback: 'प्रतिक्रिया',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      urgent: 'अत्यावश्यक',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noTasksFound: 'कुनै पूरा भएका कार्य फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalCompleted: 'कुल पूरा भएको',
      highPriority: 'उच्च प्राथमिकता',
      mediumPriority: 'मध्यम प्राथमिकता',
      lowPriority: 'न्यून प्राथमिकता',
      urgentPriority: 'अत्यावश्यक',
      completedThisMonth: 'यो महिना पूरा',
      avgCompletionTime: 'औसत पूरा हुने समय',
      days: 'दिन',
      yes: 'हो',
      no: 'होइन',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड'
    },
    en: {
      pageTitle: 'Completed Tasks',
      completedTasks: 'Completed Tasks',
      searchPlaceholder: 'Search by task title or description...',
      filterByPriority: 'Filter by Priority',
      taskTitle: 'Task Title',
      description: 'Description',
      assignedBy: 'Assigned By',
      assignedDate: 'Assigned Date',
      completedDate: 'Completed Date',
      completionTime: 'Completion Time',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
      taskDetails: 'Task Details',
      dueDate: 'Due Date',
      completedOnTime: 'Completed On Time',
      relatedComplaint: 'Related Complaint',
      notes: 'Notes',
      feedback: 'Feedback',
      close: 'Close',
      all: 'All',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      urgent: 'Urgent',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noTasksFound: 'No completed tasks found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalCompleted: 'Total Completed',
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      urgentPriority: 'Urgent',
      completedThisMonth: 'Completed This Month',
      avgCompletionTime: 'Avg Completion Time',
      days: 'days',
      yes: 'Yes',
      no: 'No',
      loading: 'Loading...',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard'
    }
  };

  const t = content[language];

  const getPriorityClass = (priority) => {
    const classes = { 
      high: 'priority-high', 
      medium: 'priority-medium', 
      low: 'priority-low',
      urgent: 'priority-urgent'
    };
    return classes[priority] || 'priority-medium';
  };

  const getPriorityText = (priority) => {
    if (language === 'np') {
      const priorityTexts = {
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'न्यून',
        urgent: 'अत्यावश्यक'
      };
      return priorityTexts[priority] || priority;
    } else {
      const priorityTexts = {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        urgent: 'Urgent'
      };
      return priorityTexts[priority] || priority;
    }
  };

  const getAssignedDate = (task) => {
    return language === 'np' ? task.assignedDate : task.enAssignedDate;
  };

  const getCompletedDate = (task) => {
    return language === 'np' ? task.completedDate : task.enCompletedDate;
  };

  const getDueDate = (task) => {
    return language === 'np' ? task.dueDate : task.enDueDate;
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const searchMatch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.enTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.enDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return searchMatch && priorityMatch;
  });

  // Sort tasks by completed date (newest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completedDateObj && b.completedDateObj) {
      return b.completedDateObj - a.completedDateObj;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (task) => {
    setSelectedTask(task);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    document.body.style.overflow = 'unset';
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
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
    <div className="staff-tasks-completed">
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

            {/* Welcome Section */}
            <div className="welcome-section">
              <div>
                <h1 className="welcome-title">{t.completedTasks}</h1>
                <p className="welcome-subtitle">{t.pageTitle}</p>
              </div>
              <button className="refresh-btn" onClick={fetchCompletedTasks}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-box-icon green">✅</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.total}</div>
                  <div className="stat-box-label">{t.totalCompleted}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon purple">🔴</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.urgent}</div>
                  <div className="stat-box-label">{t.urgentPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon red">🔴</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.high}</div>
                  <div className="stat-box-label">{t.highPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon yellow">🟡</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.medium}</div>
                  <div className="stat-box-label">{t.mediumPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon light-green">🟢</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.low}</div>
                  <div className="stat-box-label">{t.lowPriority}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon blue">📅</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.completedThisMonth}</div>
                  <div className="stat-box-label">{t.completedThisMonth}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon purple">⏱️</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.avgCompletionTime} {t.days}</div>
                  <div className="stat-box-label">{t.avgCompletionTime}</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="urgent">{t.urgent}</option>
                  <option value="high">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="low">{t.low}</option>
                </select>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="table-wrapper">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>{t.taskTitle}</th>
                    <th>{t.assignedBy}</th>
                    <th>{t.assignedDate}</th>
                    <th>{t.completedDate}</th>
                    <th>{t.completionTime}</th>
                    <th>{t.priority}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.length > 0 ? (
                    paginatedTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="task-title">
                          {language === 'np' ? task.title : task.enTitle}
                          <div className="task-badges">
                            {task.completedOnTime ? (
                              <span className="ontime-badge">✓ {t.yes}</span>
                            ) : (
                              <span className="late-badge">⚠ {t.no}</span>
                            )}
                            {task.relatedTicketNo && (
                              <span className="ticket-ref-badge">#{task.relatedTicketNo}</span>
                            )}
                          </div>
                         </td>
                        <td>{task.assignedByName || task.assignedBy}</td>
                        <td>{getAssignedDate(task)}</td>
                        <td>{getCompletedDate(task)}</td>
                        <td>
                          <span className="completion-time-badge">
                            {task.completionTime} {t.days}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </td>
                        <td>
                          <button className="view-btn" onClick={() => openModal(task)}>
                            👁️ {t.viewDetails}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-data-row">
                      <td colSpan="7" className="no-data">
                        <div className="no-data-content">
                          <span className="no-data-icon">📭</span>
                          <p>{t.noTasksFound}</p>
                          <small>{t.tryAdjustingFilters}</small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← {t.previous}
                </button>
                <span className="pagination-info">
                  {t.page} {currentPage} {t.of} {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  {t.next} →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {showModal && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {t.taskDetails}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-row">
                  <label>{t.taskTitle}:</label>
                  <span>{language === 'np' ? selectedTask.title : selectedTask.enTitle}</span>
                </div>
                <div className="detail-row">
                  <label>{t.description}:</label>
                  <span>{language === 'np' ? selectedTask.description : selectedTask.enDescription}</span>
                </div>
                <div className="detail-row">
                  <label>{t.assignedBy}:</label>
                  <span>{selectedTask.assignedByName || selectedTask.assignedBy}</span>
                </div>
                <div className="detail-row">
                  <label>{t.assignedDate}:</label>
                  <span>{getAssignedDate(selectedTask)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.completedDate}:</label>
                  <span>{getCompletedDate(selectedTask)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.completionTime}:</label>
                  <span className="completion-time-badge">{selectedTask.completionTime} {t.days}</span>
                </div>
                {selectedTask.dueDate && (
                  <div className="detail-row">
                    <label>{t.dueDate}:</label>
                    <span>{getDueDate(selectedTask)}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>{t.completedOnTime}:</label>
                  <span>
                    {selectedTask.completedOnTime ? (
                      <span className="ontime-badge-modal">✓ {t.yes}</span>
                    ) : (
                      <span className="late-badge-modal">⚠ {t.no}</span>
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.priority}:</label>
                  <span className={`priority-badge ${getPriorityClass(selectedTask.priority)}`}>
                    {getPriorityText(selectedTask.priority)}
                  </span>
                </div>
                {selectedTask.relatedTicketNo && (
                  <div className="detail-row">
                    <label>{t.relatedComplaint}:</label>
                    <span className="ticket-id">{selectedTask.relatedTicketNo}</span>
                  </div>
                )}
              </div>

              {selectedTask.notes && (
                <div className="detail-section">
                  <div className="detail-row full-width">
                    <label>{t.notes}:</label>
                    <p className="notes-text">{selectedTask.notes}</p>
                  </div>
                </div>
              )}

              {selectedTask.feedback && (
                <div className="detail-section feedback-section">
                  <div className="detail-row full-width">
                    <label>{t.feedback}:</label>
                    <p className="feedback-text">{selectedTask.feedback}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeModal}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .staff-tasks-completed {
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

        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .welcome-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .welcome-subtitle {
          color: #64748b;
          font-size: 0.85rem;
        }

        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #0288d1;
          color: #0288d1;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-box-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
        }

        .stat-box-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-box-icon.light-green { background: #e8f5e9; color: #4caf50; }
        .stat-box-icon.red { background: #fee2e2; color: #dc2626; }
        .stat-box-icon.yellow { background: #fef3c7; color: #d97706; }
        .stat-box-icon.blue { background: #e3f2fd; color: #1565c0; }
        .stat-box-icon.purple { background: #f3e5f5; color: #7b1fa2; }

        .stat-box-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-box-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 2px;
        }

        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
          color: #9ca3af;
        }

        .search-box input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          transition: border-color 0.2s;
        }

        .search-box input:focus {
          outline: none;
          border-color: #0288d1;
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #0288d1;
        }

        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .tasks-table {
          width: 100%;
          border-collapse: collapse;
        }

        .tasks-table th,
        .tasks-table td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .tasks-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tasks-table td {
          color: #334155;
          font-size: 0.85rem;
        }

        .tasks-table tr:hover {
          background: #fafcff;
        }

        .task-title {
          font-weight: 500;
          color: #0f172a;
        }

        .task-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .ontime-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #d1fae5;
          color: #059669;
          border-radius: 12px;
          font-size: 0.6rem;
          font-weight: 500;
        }

        .late-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 12px;
          font-size: 0.6rem;
          font-weight: 500;
        }

        .ticket-ref-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #e3f2fd;
          color: #1565c0;
          border-radius: 12px;
          font-size: 0.6rem;
          font-weight: 500;
          font-family: monospace;
        }

        .ontime-badge-modal {
          display: inline-block;
          padding: 4px 12px;
          background: #d1fae5;
          color: #059669;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .late-badge-modal {
          display: inline-block;
          padding: 4px 12px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .completion-time-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #e3f2fd;
          color: #1565c0;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-urgent { background: #fecaca; color: #b91c1c; font-weight: 700; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .view-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .no-data-row {
          text-align: center;
        }

        .no-data {
          text-align: center;
          padding: 60px !important;
        }

        .no-data-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .no-data-icon {
          font-size: 3rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
          padding: 16px;
        }

        .pagination-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #0288d1;
          color: #0288d1;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          color: #64748b;
          font-size: 0.85rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 650px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          background: white;
          border-radius: 20px 20px 0 0;
        }

        .modal-header h2 {
          font-size: 1.2rem;
          color: #0f172a;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #94a3b8;
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: #ef4444;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-row label {
          width: 130px;
          font-weight: 600;
          color: #0f172a;
        }

        .detail-row span, .detail-row p {
          flex: 1;
          color: #334155;
        }

        .detail-row.full-width {
          flex-direction: column;
        }

        .detail-row.full-width label {
          width: 100%;
          margin-bottom: 8px;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #0288d1;
        }

        .notes-text {
          line-height: 1.6;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          margin-top: 4px;
        }

        .feedback-text {
          line-height: 1.6;
          background: #fef3c7;
          padding: 12px;
          border-radius: 8px;
          font-style: italic;
          margin-top: 4px;
        }

        .feedback-section {
          background: #fffbeb;
          border-radius: 12px;
          padding: 12px;
          margin-top: 16px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
          background: white;
          border-radius: 0 0 20px 20px;
        }

        .btn-close {
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          background: #e2e8f0;
          color: #475569;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #cbd5e1;
        }

        @media (max-width: 1400px) {
          .stats-row {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 992px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
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
          
          .stats-row {
            grid-template-columns: 1fr;
          }
          
          .filters-bar {
            flex-direction: column;
          }
          
          .filter-group {
            width: 100%;
            flex-direction: column;
          }
          
          .filter-select {
            width: 100%;
          }
          
          .detail-row {
            flex-direction: column;
          }
          
          .detail-row label {
            width: 100%;
            margin-bottom: 4px;
          }
          
          .modal-content {
            width: 95%;
            margin: 10px;
          }
          
          .task-badges {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffTasksCompleted;