// src/pages/StaffTasks.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffTasks = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
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
    pending: 0,
    inProgress: 0,
    completed: 0,
    high: 0,
    medium: 0,
    low: 0
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

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/staff/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const transformedTasks = response.data.data.map(task => transformTaskData(task));
        setTasks(transformedTasks);
        calculateStats(transformedTasks);
        setBackendStatus('connected');
      } else {
        setTasks(getSampleTasks());
        calculateStats(getSampleTasks());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks(getSampleTasks());
      calculateStats(getSampleTasks());
      setBackendStatus('disconnected');
    }
  };

  // Calculate statistics
  const calculateStats = (tasksData) => {
    const newStats = {
      total: tasksData.length,
      pending: tasksData.filter(t => t.status === 'pending').length,
      inProgress: tasksData.filter(t => t.status === 'in-progress').length,
      completed: tasksData.filter(t => t.status === 'completed').length,
      high: tasksData.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
      medium: tasksData.filter(t => t.priority === 'medium').length,
      low: tasksData.filter(t => t.priority === 'low').length
    };
    setStats(newStats);
  };

  // Transform task data
  const transformTaskData = (task) => ({
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
    dueDate: task.dueDate ? formatNepaliDate(task.dueDate) : null,
    enDueDate: task.dueDate ? formatEnglishDate(task.dueDate) : null,
    completedDate: task.completedDate ? formatNepaliDate(task.completedDate) : null,
    enCompletedDate: task.completedDate ? formatEnglishDate(task.completedDate) : null,
    relatedComplaintId: task.relatedComplaintId || null,
    relatedTicketId: task.relatedTicketId || null,
    relatedTicketNo: task.relatedTicketNo || task.relatedTicketId || null,
    notes: task.notes || null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  });

  const mapStatus = (status) => {
    if (!status) return 'pending';
    const statusMap = {
      'Pending': 'pending',
      'pending': 'pending',
      'In Progress': 'in-progress',
      'in-progress': 'in-progress',
      'Completed': 'completed',
      'completed': 'completed'
    };
    return statusMap[status] || 'pending';
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

  // Update task status
  const updateTaskStatus = async (taskId, newStatusValue) => {
    try {
      const token = localStorage.getItem('staffToken');
      const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed'
      };
      
      const response = await axios.put(
        `http://localhost:5000/api/staff/tasks/${taskId}/status`,
        { status: statusMap[newStatusValue] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId
              ? { ...task, status: newStatusValue }
              : task
          )
        );
        calculateStats(
          tasks.map(task =>
            task.id === taskId
              ? { ...task, status: newStatusValue }
              : task
          )
        );
        showNotification(
          language === 'np' ? 'कार्य स्थिति सफलतापूर्वक अपडेट गरियो' : 'Task status updated successfully',
          'success'
        );
        setShowStatusModal(false);
        setSelectedTask(null);
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      showNotification(
        language === 'np' 
          ? 'स्थिति अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
          : 'Failed to update status. Please try again.',
        'error'
      );
    }
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    alert(message);
  };

  // Get sample tasks for multiple staff
  const getSampleTasks = () => {
    return [
      { 
        id: 1, 
        title: 'समीक्षा गर्न बाँकी गुनासोहरू', 
        enTitle: 'Review pending complaints',
        description: 'सबै विचाराधीन गुनासोहरूको समीक्षा गरी उचित वर्गीकरण गर्नुहोस्।',
        enDescription: 'Review all pending complaints and classify them appropriately.',
        status: 'pending',
        priority: 'high',
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        assignedDate: '2024-02-20',
        dueDate: '2024-02-25',
        relatedTicketId: 'NTC-2024-001',
        relatedTicketNo: 'NTC-2024-001'
      },
      { 
        id: 2, 
        title: 'साप्ताहिक रिपोर्ट तयार गर्नुहोस्', 
        enTitle: 'Prepare weekly report',
        description: 'यो हप्ताको गुनासो समाधानको विवरण सहितको रिपोर्ट तयार गर्नुहोस्।',
        enDescription: 'Prepare a report with details of complaint resolutions for this week.',
        status: 'in-progress',
        priority: 'medium',
        assignedBy: 'Supervisor',
        assignedByName: 'Supervisor',
        assignedDate: '2024-02-21',
        dueDate: '2024-02-24'
      },
      { 
        id: 3, 
        title: 'ग्राहक पालना गर्नुहोस्', 
        enTitle: 'Customer follow-up',
        description: 'समाधान गरिएका गुनासोहरूको ग्राहक पालना गरी सन्तुष्टि सुनिश्चित गर्नुहोस्।',
        enDescription: 'Follow up with customers whose complaints have been resolved to ensure satisfaction.',
        status: 'pending',
        priority: 'urgent',
        assignedBy: 'Team Lead',
        assignedByName: 'Team Lead',
        assignedDate: '2024-02-22',
        dueDate: '2024-02-26',
        relatedTicketId: 'NTC-2024-015',
        relatedTicketNo: 'NTC-2024-015'
      },
      { 
        id: 4, 
        title: 'ज्ञानकोष अपडेट गर्नुहोस्', 
        enTitle: 'Update knowledge base',
        description: 'नयाँ समाधानहरूको आधारमा ज्ञानकोष अपडेट गर्नुहोस्।',
        enDescription: 'Update the knowledge base with new solutions.',
        status: 'completed',
        priority: 'low',
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        assignedDate: '2024-02-18',
        dueDate: '2024-02-22',
        completedDate: '2024-02-21'
      },
      { 
        id: 5, 
        title: 'प्राविधिक समस्या समाधान', 
        enTitle: 'Technical issue resolution',
        description: 'ग्राहकको इन्टरनेट जडान समस्या समाधान गर्नुहोस्।',
        enDescription: 'Resolve customer internet connection issue.',
        status: 'in-progress',
        priority: 'high',
        assignedBy: 'Network Manager',
        assignedByName: 'Network Manager',
        assignedDate: '2024-02-23',
        dueDate: '2024-02-27',
        relatedTicketId: 'NTC-2024-018',
        relatedTicketNo: 'NTC-2024-018'
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
      fetchTasks();
    }
  }, [navigate]);

  const content = {
    np: {
      pageTitle: 'मेरो कार्यहरू',
      myTasks: 'मेरो कार्यहरू',
      searchPlaceholder: 'कार्य शीर्षक वा विवरणले खोज्नुहोस्...',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      taskTitle: 'कार्य शीर्षक',
      description: 'विवरण',
      assignedBy: 'तोक्ने व्यक्ति',
      assignedDate: 'तोकिएको मिति',
      dueDate: 'अन्तिम मिति',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      updateStatus: 'स्थिति अपडेट गर्नुहोस्',
      taskDetails: 'कार्यको विवरण',
      relatedComplaint: 'सम्बन्धित गुनासो',
      completedDate: 'पूरा भएको मिति',
      notes: 'नोटहरू',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      completed: 'पूरा भएको',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      urgent: 'अत्यावश्यक',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noTasksFound: 'कुनै कार्य फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalTasks: 'कुल कार्य',
      pendingTasks: 'विचाराधीन',
      inProgressTasks: 'प्रगतिमा',
      completedTasks: 'पूरा भएको',
      highPriority: 'उच्च प्राथमिकता',
      mediumPriority: 'मध्यम प्राथमिकता',
      lowPriority: 'न्यून प्राथमिकता',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      updateStatusTitle: 'कार्य स्थिति अपडेट गर्नुहोस्',
      selectNewStatus: 'नयाँ स्थिति चयन गर्नुहोस्',
      cancel: 'रद्द गर्नुहोस्',
      update: 'अपडेट गर्नुहोस्'
    },
    en: {
      pageTitle: 'My Tasks',
      myTasks: 'My Tasks',
      searchPlaceholder: 'Search by task title or description...',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      taskTitle: 'Task Title',
      description: 'Description',
      assignedBy: 'Assigned By',
      assignedDate: 'Assigned Date',
      dueDate: 'Due Date',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
      updateStatus: 'Update Status',
      taskDetails: 'Task Details',
      relatedComplaint: 'Related Complaint',
      completedDate: 'Completed Date',
      notes: 'Notes',
      close: 'Close',
      all: 'All',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      urgent: 'Urgent',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noTasksFound: 'No tasks found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalTasks: 'Total Tasks',
      pendingTasks: 'Pending',
      inProgressTasks: 'In Progress',
      completedTasks: 'Completed',
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      updateStatusTitle: 'Update Task Status',
      selectNewStatus: 'Select New Status',
      cancel: 'Cancel',
      update: 'Update'
    }
  };

  const t = content[language];

  const getStatusClass = (status) => {
    const classes = { 
      pending: 'status-pending', 
      'in-progress': 'status-progress', 
      completed: 'status-completed'
    };
    return classes[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    if (language === 'np') {
      const statusTexts = {
        pending: 'विचाराधीन',
        'in-progress': 'प्रगतिमा',
        completed: 'पूरा भएको'
      };
      return statusTexts[status] || status;
    } else {
      const statusTexts = {
        pending: 'Pending',
        'in-progress': 'In Progress',
        completed: 'Completed'
      };
      return statusTexts[status] || status;
    }
  };

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

  const getDueDate = (task) => {
    return language === 'np' ? task.dueDate : task.enDueDate;
  };

  const getCompletedDate = (task) => {
    return language === 'np' ? task.completedDate : task.enCompletedDate;
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const searchMatch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.enTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.enDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return searchMatch && statusMatch && priorityMatch;
  });

  // Sort tasks: urgent first, then by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const aPriority = a.priority === 'urgent' ? 'urgent' : a.priority;
    const bPriority = b.priority === 'urgent' ? 'urgent' : b.priority;
    
    if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    }
    
    // If same priority, sort by due date (earlier first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
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

  const openStatusModal = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setShowStatusModal(true);
    setShowModal(false);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedTask(null);
    setNewStatus('');
    document.body.style.overflow = 'unset';
  };

  const handleStatusUpdate = () => {
    if (selectedTask && newStatus !== selectedTask.status) {
      updateTaskStatus(selectedTask.id, newStatus);
    } else {
      closeStatusModal();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  return (
    <div className="staff-tasks">
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
                <h1 className="welcome-title">{t.myTasks}</h1>
                <p className="welcome-subtitle">{t.pageTitle}</p>
              </div>
              <button className="refresh-btn" onClick={fetchTasks}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-box-icon blue">📋</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.total}</div>
                  <div className="stat-box-label">{t.totalTasks}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon orange">⏳</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.pending}</div>
                  <div className="stat-box-label">{t.pendingTasks}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon yellow">🔄</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.inProgress}</div>
                  <div className="stat-box-label">{t.inProgressTasks}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon green">✅</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.completed}</div>
                  <div className="stat-box-label">{t.completedTasks}</div>
                </div>
              </div>
            </div>

            {/* Priority Statistics */}
            <div className="priority-stats">
              <div className="priority-stat high">
                <span className="priority-dot"></span>
                <span className="priority-label">{t.highPriority}</span>
                <span className="priority-count">{stats.high}</span>
              </div>
              <div className="priority-stat medium">
                <span className="priority-dot"></span>
                <span className="priority-label">{t.mediumPriority}</span>
                <span className="priority-count">{stats.medium}</span>
              </div>
              <div className="priority-stat low">
                <span className="priority-dot"></span>
                <span className="priority-label">{t.lowPriority}</span>
                <span className="priority-count">{stats.low}</span>
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="in-progress">{t.inProgress}</option>
                  <option value="completed">{t.completed}</option>
                </select>
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
                    <th>{t.dueDate}</th>
                    <th>{t.status}</th>
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
                          {task.relatedTicketNo && (
                            <div className="task-ticket-ref">
                              #{task.relatedTicketNo}
                            </div>
                          )}
                        </td>
                        <td>{task.assignedByName || task.assignedBy}</td>
                        <td>{getAssignedDate(task)}</td>
                        <td className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'overdue' : ''}>
                          {getDueDate(task) || '-'}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="view-btn" onClick={() => openModal(task)}>
                              👁️ {t.viewDetails}
                            </button>
                            {task.status !== 'completed' && (
                              <button className="update-status-btn" onClick={() => openStatusModal(task)}>
                                🔄 {t.updateStatus}
                              </button>
                            )}
                          </div>
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
                  <label>{t.dueDate}:</label>
                  <span className={selectedTask.dueDate && new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== 'completed' ? 'overdue-text' : ''}>
                    {getDueDate(selectedTask) || '-'}
                  </span>
                </div>
                {selectedTask.completedDate && (
                  <div className="detail-row">
                    <label>{t.completedDate}:</label>
                    <span>{getCompletedDate(selectedTask)}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>{t.status}:</label>
                  <span className={`status-badge ${getStatusClass(selectedTask.status)}`}>
                    {getStatusText(selectedTask.status)}
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
                {selectedTask.notes && (
                  <div className="detail-row full-width">
                    <label>{t.notes}:</label>
                    <p className="notes-text">{selectedTask.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedTask.status !== 'completed' && (
                <button className="btn-update-status" onClick={() => openStatusModal(selectedTask)}>
                  🔄 {t.updateStatus}
                </button>
              )}
              <button className="btn-close" onClick={closeModal}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedTask && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔄 {t.updateStatusTitle}</h2>
              <button className="modal-close" onClick={closeStatusModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>{t.taskTitle}:</label>
                <span>{language === 'np' ? selectedTask.title : selectedTask.enTitle}</span>
              </div>
              <div className="detail-row">
                <label>{t.selectNewStatus}:</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="pending">{t.pending}</option>
                  <option value="in-progress">{t.inProgress}</option>
                  <option value="completed">{t.completed}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeStatusModal}>
                {t.cancel}
              </button>
              <button 
                className="btn-update" 
                onClick={handleStatusUpdate}
                disabled={newStatus === selectedTask.status}
              >
                {t.update}
              </button>
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

        .staff-tasks {
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
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-box {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-box-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-box-icon.blue { background: #e3f2fd; color: #1565c0; }
        .stat-box-icon.orange { background: #fff3e0; color: #f57c00; }
        .stat-box-icon.yellow { background: #fff8e1; color: #f9a825; }
        .stat-box-icon.green { background: #e8f5e9; color: #2e7d32; }

        .stat-box-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-box-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
        }

        .priority-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .priority-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 30px;
          background: #f8fafc;
        }

        .priority-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .priority-stat.high .priority-dot { background: #dc2626; }
        .priority-stat.medium .priority-dot { background: #f59e0b; }
        .priority-stat.low .priority-dot { background: #10b981; }

        .priority-label {
          font-size: 0.8rem;
          color: #475569;
        }

        .priority-count {
          font-weight: 700;
          color: #0f172a;
          margin-left: auto;
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
          flex-wrap: wrap;
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

        .task-ticket-ref {
          font-size: 0.65rem;
          color: #0288d1;
          margin-top: 4px;
          font-family: monospace;
        }

        .overdue {
          color: #dc2626;
          font-weight: 600;
        }

        .overdue-text {
          color: #dc2626;
          font-weight: 600;
        }

        .status-badge, .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-completed { background: #d1fae5; color: #059669; }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-urgent { background: #fecaca; color: #b91c1c; font-weight: 700; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .view-btn, .update-status-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .view-btn {
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .update-status-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .view-btn:hover, .update-status-btn:hover {
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

        .status-modal {
          max-width: 500px;
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

        .status-select {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
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

        .btn-close, .btn-update-status, .btn-cancel, .btn-update {
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
        }

        .btn-close {
          background: #e2e8f0;
          color: #475569;
        }

        .btn-close:hover {
          background: #cbd5e1;
        }

        .btn-update-status {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .btn-update-status:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .btn-cancel {
          background: #e2e8f0;
          color: #475569;
        }

        .btn-cancel:hover {
          background: #cbd5e1;
        }

        .btn-update {
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .btn-update:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .btn-update:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 1200px) {
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
          
          .priority-stats {
            flex-direction: column;
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
          
          .action-buttons {
            flex-direction: column;
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
        }
      `}</style>
    </div>
  );
};

export default StaffTasks;