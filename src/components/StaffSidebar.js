// src/components/StaffSidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const StaffSidebar = ({ language, staffName = "Staff User", staffRole = "Support Staff" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activePath, setActivePath] = useState(location.pathname);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setActivePath(location.pathname);
    // Close mobile sidebar on route change
    setMobileOpen(false);
  }, [location.pathname]);

  const content = {
    np: {
      dashboard: 'ड्यासबोर्ड',
      complaints: 'गुनासोहरू',
    assignedToMe: 'मलाई तोकिएको',
      pendingComplaints: 'विचाराधीन',
      inProgressComplaints: 'प्रगतिमा',
      resolvedComplaints: 'समाधान',
      tasks: 'कार्यहरू',
      myTasks: 'मेरो कार्य',
      pendingTasks: 'विचाराधीन कार्य',
      completedTasks: 'पूरा भएको कार्य',
      reports: 'रिपोर्टहरू',
      dailyReport: 'दैनिक रिपोर्ट',
      weeklyReport: 'साप्ताहिक रिपोर्ट',
      monthlyReport: 'मासिक रिपोर्ट',
      performance: 'प्रदर्शन',
      myPerformance: 'मेरो प्रदर्शन',
      settings: 'सेटिङ्स',
      profile: 'प्रोफाइल',
      accountSettings: 'खाता सेटिङ्स',
      notifications: 'सूचनाहरू',
      help: 'सहयोग',
      documentation: 'कागजात',
      contactSupport: 'सहयोग सम्पर्क',
      search: 'खोज्नुहोस्...'
    },
    en: {
      dashboard: 'Dashboard',
      complaints: 'Complaints',
     
      assignedToMe: 'Assigned to Me',
     
      pendingComplaints: 'Pending',
      inProgressComplaints: 'In Progress',
      resolvedComplaints: 'Resolved',
      tasks: 'Tasks',
      myTasks: 'My Tasks',
      pendingTasks: 'Pending Tasks',
      completedTasks: 'Completed Tasks',
      reports: 'Reports',
      dailyReport: 'Daily Report',
      weeklyReport: 'Weekly Report',
      monthlyReport: 'Monthly Report',
      performance: 'Performance',
      myPerformance: 'My Performance',
      settings: 'Settings',
      profile: 'Profile',
      accountSettings: 'Account Settings',
      notifications: 'Notifications',
      help: 'Help',
      documentation: 'Documentation',
      contactSupport: 'Contact Support',
      search: 'Search...'
    }
  };

  const t = content[language];

  const menuItems = [
    {
      id: 'dashboard',
      icon: '📊',
      label: t.dashboard,
      path: '/staff-dashboard',
      exact: true
    },
    {
      id: 'complaints',
      icon: '📋',
      label: t.complaints,
      children: [
        { id: 'assigned-to-me', icon: '👤', label: t.assignedToMe, path: '/staff/complaints/assigned' },
      ]
    },

    {
      id: 'reports',
      icon: '📈',
      label: t.reports,
      children: [
        { id: 'weekly-report', icon: '📆', label: t.weeklyReport, path: '/staff/reports/weekly' },
        { id: 'monthly-report', icon: '📊', label: t.monthlyReport, path: '/staff/reports/monthly' }
      ]
    },
    {
      id: 'performance',
      icon: '⭐',
      label: t.performance,
      path: '/staff/performance'
    },
    {
      id: 'notifications',
      icon: '🔔',
      label: t.notifications,
      path: '/staff/notifications'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: t.settings,
      children: [
        { id: 'profile', icon: '👤', label: t.profile, path: '/staff/profile' },
        { id: 'account-settings', icon: '🔐', label: t.accountSettings, path: '/staff/account-settings' }
      ]
    },
    {
      id: 'help',
      icon: '💬',
      label: t.help,
      children: [
        { id: 'documentation', icon: '📚', label: t.documentation, path: '/staff/documentation' },
      ]
    }
  ];

  // Filter menu items based on search
  const filterMenuItems = (items, term) => {
    if (!term) return items;
    return items.filter(item => {
      const matchLabel = item.label.toLowerCase().includes(term.toLowerCase());
      if (item.children) {
        const matchChildren = item.children.some(child => 
          child.label.toLowerCase().includes(term.toLowerCase())
        );
        if (matchChildren) return true;
      }
      return matchLabel;
    });
  };

  const filteredMenuItems = filterMenuItems(menuItems, searchTerm);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const isActivePath = (path) => {
    if (!path) return false;
    if (path === '/staff-dashboard') {
      return activePath === path;
    }
    return activePath.startsWith(path);
  };

  const isChildActive = (children) => {
    if (!children) return false;
    return children.some(child => activePath.startsWith(child.path));
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/staff-login');
  };

  // Auto-expand menus that have active children
  useEffect(() => {
    const newExpanded = { ...expandedMenus };
    menuItems.forEach(item => {
      if (item.children && isChildActive(item.children) && !newExpanded[item.id]) {
        newExpanded[item.id] = true;
      }
    });
    setExpandedMenus(newExpanded);
  }, [activePath]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-toggle" 
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle Sidebar"
      >
        <span className="toggle-icon">☰</span>
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`staff-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">👨‍💻</span>
            <div className="logo-text">
              <span className="logo-title">NTC Sahayatri</span>
              <span className="logo-subtitle">Staff Panel</span>
            </div>
          </div>
        </div>

        <div className="sidebar-search">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder={t.search}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sidebar-menu">
          {filteredMenuItems.map((item) => (
            <div key={item.id} className="menu-item-wrapper">
              {item.children ? (
                <>
                  <button
                    className={`menu-item ${expandedMenus[item.id] ? 'expanded' : ''} ${isChildActive(item.children) ? 'has-active-child' : ''}`}
                    onClick={() => toggleMenu(item.id)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                    <span className="menu-arrow">{expandedMenus[item.id] ? '▼' : '▶'}</span>
                  </button>
                  {expandedMenus[item.id] && (
                    <div className="submenu">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          className={`submenu-item ${isActivePath(child.path) ? 'active' : ''}`}
                          onClick={() => handleNavigation(child.path)}
                        >
                          <span className="submenu-icon">{child.icon}</span>
                          <span className="submenu-label">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className={`menu-item ${isActivePath(item.path) ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              )}
            </div>
          ))}
          
          {filteredMenuItems.length === 0 && (
            <div className="no-results">
              <span>🔍</span>
              <p>{language === 'np' ? 'कुनै मेनु फेला परेन' : 'No menu found'}</p>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="staff-info">
            <div className="staff-avatar">{staffName.charAt(0).toUpperCase()}</div>
            <div className="staff-details">
              <span className="staff-name">{staffName}</span>
              <span className="staff-role">{staffRole}</span>
            </div>
          </div>
         
        </div>
      </div>

      <style jsx>{`
        .staff-sidebar {
          width: 260px;
          height: 100%;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Mobile Toggle Button */
        .mobile-toggle {
          position: fixed;
          top: 135px;
          left: 16px;
          z-index: 1001;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          border: none;
          color: white;
          width: 45px;
          height: 45px;
          border-radius: 12px;
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }

        .mobile-toggle:hover {
          transform: scale(1.05);
        }

        .toggle-icon {
          font-size: 1.2rem;
        }

        /* Overlay */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          display: none;
        }

        /* Header */
        .sidebar-header {
          border-bottom: 1px solid #f0f0f0;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          font-size: 1.6rem;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #111827;
        }

        .logo-subtitle {
          font-size: 0.65rem;
          color: #0288d1;
          font-weight: 600;
        }

        /* Search */
        .sidebar-search {
          padding: 12px 16px;
          position: relative;
          border-bottom: 1px solid #f0f0f0;
        }

        .search-icon {
          position: absolute;
          left: 28px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 32px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.8rem;
          transition: all 0.2s;
          color: #374151;
        }

        .search-input:focus {
          outline: none;
          border-color: #0288d1;
          background: #ffffff;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        /* Menu */
        .sidebar-menu {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .sidebar-menu::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-menu::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .menu-item-wrapper {
          margin: 2px 8px;
        }

        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: transparent;
          border: none;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-size: 0.85rem;
          border-radius: 8px;
        }

        .menu-item:hover {
          background: #f3f4f6;
        }

        .menu-item.active {
          background: #e0f2fe;
          color: #0288d1;
        }

        .menu-item.has-active-child {
          background: #f9fafb;
          color: #0288d1;
        }

        .menu-icon {
          font-size: 1.1rem;
          min-width: 24px;
        }

        .menu-label {
          flex: 1;
          font-weight: 500;
        }

        .menu-arrow {
          font-size: 0.6rem;
          color: #9ca3af;
          transition: transform 0.2s;
        }

        .menu-item.expanded .menu-arrow {
          transform: rotate(180deg);
        }

        /* Submenu */
        .submenu {
          margin-left: 32px;
          padding-left: 8px;
          border-left: 1px solid #e5e7eb;
        }

        .submenu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-size: 0.8rem;
          border-radius: 6px;
        }

        .submenu-item:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .submenu-item.active {
          background: #e0f2fe;
          color: #0288d1;
          font-weight: 500;
        }

        .submenu-icon {
          font-size: 0.9rem;
          min-width: 20px;
        }

        .submenu-label {
          flex: 1;
        }

        /* No results */
        .no-results {
          text-align: center;
          padding: 40px 16px;
          color: #9ca3af;
        }

        .no-results span {
          font-size: 2rem;
          display: block;
          margin-bottom: 8px;
        }

        .no-results p {
          font-size: 0.8rem;
        }

        /* Footer */
        .sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid #f0f0f0;
        }

        .staff-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          padding: 8px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .staff-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
        }

        .staff-details {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .staff-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #111827;
        }

        .staff-role {
          font-size: 0.65rem;
          color: #0288d1;
        }

        .logout-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: #fee;
          border: 1px solid #fecaca;
          border-radius: 10px;
          cursor: pointer;
          color: #dc2626;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .logout-button:hover {
          background: #fecaca;
          transform: translateY(-1px);
        }

        .logout-icon {
          font-size: 1rem;
        }

        .logout-text {
          font-size: 0.8rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .mobile-toggle {
            display: flex;
          }

          .sidebar-overlay {
            display: block;
          }

          .staff-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 260px;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          }
          
          .staff-sidebar.mobile-open {
            transform: translateX(0);
          }
        }

        @media (max-width: 480px) {
          .staff-sidebar {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </>
  );
};

export default StaffSidebar;