// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activePath, setActivePath] = useState(location.pathname);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const content = {
    np: {
      dashboard: 'ड्यासबोर्ड',
      complaints: 'गुनासोहरू',
      allComplaints: 'सबै गुनासो',
      pendingComplaints: 'विचाराधीन',
      inProgressComplaints: 'प्रगतिमा',
      resolvedComplaints: 'समाधान',
      users: 'प्रयोगकर्ताहरू',
      allUsers: 'सबै प्रयोगकर्ता',
      addUser: 'प्रयोगकर्ता थप्नुहोस्',
      reports: 'रिपोर्टहरू',
      complaintReports: 'गुनासो रिपोर्ट',
      userReports: 'प्रयोगकर्ता रिपोर्ट',
      settings: 'सेटिङ्स',
      generalSettings: 'साधारण सेटिङ्स',
      securitySettings: 'सुरक्षा सेटिङ्स',
      notifications: 'सूचनाहरू',
      support: 'सहयोग',
      documentation: 'कागजात',
      contactSupport: 'सहयोग सम्पर्क',
      analytics: 'विश्लेषण',
      search: 'खोज्नुहोस्...'
    },
    en: {
      dashboard: 'Dashboard',
      complaints: 'Complaints',
      allComplaints: 'All Complaints',
      pendingComplaints: 'Pending',
      inProgressComplaints: 'In Progress',
      resolvedComplaints: 'Resolved',
      users: 'Users',
      allUsers: 'All Users',
      addUser: 'Add User',
      reports: 'Reports',
      complaintReports: 'Complaint Reports',
      userReports: 'User Reports',
      settings: 'Settings',
      generalSettings: 'General',
      securitySettings: 'Security',
      notifications: 'Notifications',
      support: 'Support',
      documentation: 'Documentation',
      contactSupport: 'Contact',
      analytics: 'Analytics',
      search: 'Search...'
    }
  };

  const t = content[language];

  const menuItems = [
    {
      id: 'dashboard',
      icon: '📊',
      label: t.dashboard,
      path: '/admin-dashboard',
      exact: true
    },
    {
      id: 'complaints',
      icon: '📋',
      label: t.complaints,
      children: [
        { id: 'all-complaints', icon: '📝', label: t.allComplaints, path: '/admin-complaints' },
        { id: 'pending-complaints', icon: '⏳', label: t.pendingComplaints, path: '/admin-complaints/pending' },
        { id: 'in-progress-complaints', icon: '🔄', label: t.inProgressComplaints, path: '/admin-complaints/in-progress' },
        { id: 'resolved-complaints', icon: '✅', label: t.resolvedComplaints, path: '/admin-complaints/resolved' }
      ]
    },
    {
      id: 'users',
      icon: '👥',
      label: t.users,
      children: [
        { id: 'all-users', icon: '👤', label: t.allUsers, path: '/admin-users' },
        { id: 'add-user', icon: '➕', label: t.addUser, path: '/admin-users/add' }
      ]
    },
    {
      id: 'reports',
      icon: '📈',
      label: t.reports,
      children: [
        { id: 'complaint-reports', icon: '📊', label: t.complaintReports, path: '/admin-reports/complaints' },
        { id: 'user-reports', icon: '👥', label: t.userReports, path: '/admin-reports/users' }
      ]
    },
    {
      id: 'analytics',
      icon: '📉',
      label: t.analytics,
      path: '/admin-analytics'
    },
    {
      id: 'notifications',
      icon: '🔔',
      label: t.notifications,
      path: '/admin-notifications'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: t.settings,
      children: [
        { id: 'general-settings', icon: '🔧', label: t.generalSettings, path: '/admin-settings/general' },
        { id: 'security-settings', icon: '🔒', label: t.securitySettings, path: '/admin-settings/security' }
      ]
    },
    {
      id: 'support',
      icon: '💬',
      label: t.support,
      children: [
        { id: 'documentation', icon: '📚', label: t.documentation, path: '/admin-documentation' },
        { id: 'contact-support', icon: '📞', label: t.contactSupport, path: '/admin-contact' }
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
    if (path === '/admin-dashboard') {
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
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">📡</span>
          <div className="logo-text">
            <span className="logo-title">NTC Sahayatri</span>
            <span className="logo-subtitle">Admin Panel</span>
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
        <div className="admin-info">
          <div className="admin-avatar">👨‍💼</div>
          <div className="admin-details">
            <span className="admin-name">Admin User</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100%;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Header */
        .sidebar-header {
          padding: 20px 16px;
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
          color: #6b7280;
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
          border-color: #3b82f6;
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
          background: #eff6ff;
          color: #3b82f6;
        }

        .menu-item.has-active-child {
          background: #f9fafb;
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
          background: #eff6ff;
          color: #3b82f6;
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

        .admin-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-avatar {
          width: 32px;
          height: 32px;
          background: #eff6ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .admin-details {
          display: flex;
          flex-direction: column;
        }

        .admin-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #111827;
        }

        .admin-role {
          font-size: 0.65rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;