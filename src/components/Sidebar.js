// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ language, isOpen = true, onClose }) => {
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
        { id: 'all-users', icon: '👤', label: t.allUsers, path: '/admin-users' }
        // Add User option removed from here
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
      
      ]
    }
  ];

  // Filter menu items based on search
  const filterMenuItems = (items, term) => {
    if (!term) return items;
    return items.reduce((acc, item) => {
      const matchLabel = item.label.toLowerCase().includes(term.toLowerCase());
      if (item.children) {
        const matchChildren = item.children.filter(child => 
          child.label.toLowerCase().includes(term.toLowerCase())
        );
        if (matchChildren.length > 0) {
          acc.push({
            ...item,
            children: matchChildren
          });
        } else if (matchLabel) {
          acc.push(item);
        }
      } else if (matchLabel) {
        acc.push(item);
      }
      return acc;
    }, []);
  };

  const filteredMenuItems = filterMenuItems(menuItems, searchTerm);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const isActivePath = (path, exact = false) => {
    if (!path) return false;
    if (exact) {
      return activePath === path;
    }
    if (path === '/admin-dashboard') {
      return activePath === path;
    }
    return activePath === path || activePath.startsWith(path + '/');
  };

  const isChildActive = (children) => {
    if (!children) return false;
    return children.some(child => 
      activePath === child.path || activePath.startsWith(child.path + '/')
    );
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
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
    <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
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
        {searchTerm && (
          <button className="search-clear" onClick={() => setSearchTerm('')}>
            ✕
          </button>
        )}
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
                className={`menu-item ${isActivePath(item.path, item.exact) ? 'active' : ''}`}
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
          width: 280px;
          height: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Header */
        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: white;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 1.8rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .logo-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .logo-subtitle {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Search */
        .sidebar-search {
          padding: 16px 20px;
          position: relative;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: white;
        }

        .search-icon {
          position: absolute;
          left: 32px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9rem;
          color: #94a3b8;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 10px 32px 10px 36px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          color: #0f172a;
          font-family: inherit;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-input::placeholder {
          color: #94a3b8;
        }

        .search-clear {
          position: absolute;
          right: 32px;
          top: 50%;
          transform: translateY(-50%);
          background: #e2e8f0;
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 11px;
          color: #64748b;
          transition: all 0.2s;
        }

        .search-clear:hover {
          background: #cbd5e1;
          color: #0f172a;
        }

        /* Menu */
        .sidebar-menu {
          flex: 1;
          overflow-y: auto;
          padding: 12px 12px;
          background: white;
        }

        .sidebar-menu::-webkit-scrollbar {
          width: 5px;
        }

        .sidebar-menu::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .sidebar-menu::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .menu-item-wrapper {
          margin-bottom: 4px;
        }

        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: 12px;
          position: relative;
        }

        .menu-item:hover {
          background: #f1f5f9;
          color: #0f172a;
          transform: translateX(2px);
        }

        .menu-item.active {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #2563eb;
          font-weight: 600;
        }

        .menu-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: #3b82f6;
          border-radius: 0 3px 3px 0;
        }

        .menu-item.has-active-child {
          background: #f8fafc;
          color: #1e293b;
        }

        .menu-icon {
          font-size: 1.2rem;
          min-width: 28px;
          filter: drop-shadow(0 1px 1px rgba(0,0,0,0.05));
        }

        .menu-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .menu-arrow {
          font-size: 0.7rem;
          color: #94a3b8;
          transition: transform 0.25s ease;
          margin-left: auto;
        }

        .menu-item.expanded .menu-arrow {
          transform: rotate(180deg);
        }

        /* Submenu */
        .submenu {
          margin-left: 40px;
          padding-left: 12px;
          border-left: 2px solid #e2e8f0;
          margin-top: 4px;
          margin-bottom: 4px;
          animation: slideDown 0.25s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .submenu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-size: 0.85rem;
          border-radius: 10px;
          position: relative;
        }

        .submenu-item:hover {
          background: #f1f5f9;
          color: #0f172a;
          transform: translateX(4px);
        }

        .submenu-item.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 500;
        }

        .submenu-item.active::before {
          content: '';
          position: absolute;
          left: -14px;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 16px;
          background: #3b82f6;
          border-radius: 2px;
        }

        .submenu-icon {
          font-size: 1rem;
          min-width: 24px;
          opacity: 0.8;
        }

        .submenu-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* No results */
        .no-results {
          text-align: center;
          padding: 48px 20px;
          color: #94a3b8;
        }

        .no-results span {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .no-results p {
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* Footer */
        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          background: white;
          margin-top: auto;
        }

        .admin-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 12px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .admin-info:hover {
          background: #f8fafc;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .admin-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .admin-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }

        .admin-role {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          }
          
          .sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;