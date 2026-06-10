// src/pages/AdminUsers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for users from backend
  const [users, setUsers] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    enName: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });

  // Edit user form state
  const [editUser, setEditUser] = useState({
    id: null,
    name: '',
    enName: '',
    email: '',
    phone: '',
    role: '',
    status: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('adminToken');
  };

  // Format date to Nepali format
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

  // Format date to English format
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

  // Fetch complaints from both endpoints
  const fetchAllComplaints = async () => {
    try {
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch regular complaints
      let regularComplaints = [];
      let regardingComplaints = [];
      
      try {
        const regularResponse = await axios.get(`${API_URL}/complaints`, { headers });
        if (regularResponse.data.success && Array.isArray(regularResponse.data.data)) {
          regularComplaints = regularResponse.data.data;
        }
      } catch (error) {
        console.error('Error fetching regular complaints:', error);
      }
      
      // Fetch complaint regarding
      try {
        const regardingResponse = await axios.get(`${API_URL}/complaint-regarding`, { headers });
        if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
          regardingComplaints = regardingResponse.data.data;
        }
      } catch (error) {
        console.error('Error fetching regarding complaints:', error);
      }
      
      return { regularComplaints, regardingComplaints };
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return { regularComplaints: [], regardingComplaints: [] };
    }
  };

  // Extract unique users from complaints and fetch existing users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch all complaints
      const { regularComplaints, regardingComplaints } = await fetchAllComplaints();
      const allComplaints = [...regularComplaints, ...regardingComplaints];
      
      // Create a map of users from complaints
      const complainantMap = new Map();
      
      allComplaints.forEach(complaint => {
        const email = complaint.email;
        if (email && !complainantMap.has(email)) {
          complainantMap.set(email, {
            name: complaint.name || 'N/A',
            enName: complaint.name || 'N/A',
            email: complaint.email,
            phone: complaint.phone || 'N/A',
            complaints: [],
            role: 'user',
            status: 'active',
            complaintTypes: new Set()
          });
        }
        
        if (email && complainantMap.has(email)) {
          const user = complainantMap.get(email);
          user.complaints.push(complaint);
          
          // Track complaint types
          if (complaint.nature_of_complaint) {
            user.complaintTypes.add(complaint.nature_of_complaint);
          }
          if (complaint.complaint_type) {
            user.complaintTypes.add(complaint.complaint_type);
          }
          
          complainantMap.set(email, user);
        }
      });
      
      // Fetch existing users from database
      let existingUsers = [];
      try {
        const usersResponse = await axios.get(`${API_URL}/users`, { headers });
        if (usersResponse.data.success && Array.isArray(usersResponse.data.data)) {
          existingUsers = usersResponse.data.data;
        }
      } catch (usersError) {
        console.log('Users API error:', usersError);
      }
      
      // Merge users from database with complainants
      const mergedUsers = [];
      const processedEmails = new Set();
      
      // First, add existing database users (including staff and admins)
      existingUsers.forEach(user => {
        processedEmails.add(user.email);
        
        // Find complaints for this user
        const userComplaints = allComplaints.filter(c => c.email === user.email);
        const totalComplaints = userComplaints.length;
        const resolvedComplaints = userComplaints.filter(c => 
          c.status === 'resolved' || c.status === 'Resolved' || c.status === 'closed' || c.status === 'Closed'
        ).length;
        
        mergedUsers.push({
          id: user.id,
          name: user.name || 'N/A',
          enName: user.name_en || user.name || 'N/A',
          email: user.email,
          phone: user.phone || 'N/A',
          role: user.role || 'user',
          role_np: user.role === 'user' ? 'प्रयोगकर्ता' : user.role === 'staff' ? 'कर्मचारी' : user.role === 'admin' ? 'प्रशासक' : 'प्रयोगकर्ता',
          role_en: user.role === 'user' ? 'User' : user.role === 'staff' ? 'Staff' : user.role === 'admin' ? 'Admin' : 'User',
          status: user.status || 'active',
          status_np: user.status === 'active' ? 'सक्रिय' : user.status === 'inactive' ? 'निष्क्रिय' : user.status === 'suspended' ? 'निलम्बित' : 'सक्रिय',
          status_en: user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : user.status === 'suspended' ? 'Suspended' : 'Active',
          registeredDate: formatNepaliDate(user.created_at || user.createdAt || new Date()),
          enRegisteredDate: formatEnglishDate(user.created_at || user.createdAt || new Date()),
          lastLogin: user.last_login ? formatNepaliDate(user.last_login) : '-',
          enLastLogin: user.last_login ? formatEnglishDate(user.last_login) : '-',
          complaintsCount: totalComplaints,
          resolvedCount: resolvedComplaints,
          complaints: userComplaints,
          isSystemUser: true
        });
      });
      
      // Then, add complainants that aren't in the database (regular users only)
      complainantMap.forEach((complainant, email) => {
        if (!processedEmails.has(email)) {
          const totalComplaints = complainant.complaints.length;
          const resolvedComplaints = complainant.complaints.filter(c => 
            c.status === 'resolved' || c.status === 'Resolved' || c.status === 'closed' || c.status === 'Closed'
          ).length;
          
          mergedUsers.push({
            id: `comp_${Date.now()}_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
            name: complainant.name,
            enName: complainant.enName,
            email: complainant.email,
            phone: complainant.phone,
            role: 'user',
            role_np: 'प्रयोगकर्ता',
            role_en: 'User',
            status: 'active',
            status_np: 'सक्रिय',
            status_en: 'Active',
            registeredDate: formatNepaliDate(new Date()),
            enRegisteredDate: formatEnglishDate(new Date()),
            lastLogin: '-',
            enLastLogin: '-',
            complaintsCount: totalComplaints,
            resolvedCount: resolvedComplaints,
            complaints: complainant.complaints,
            isSystemUser: false
          });
        }
      });
      
      // Sort users: Staff and Admins first, then by complaints count
      mergedUsers.sort((a, b) => {
        // Prioritize staff and admin
        const rolePriority = (role) => {
          if (role === 'admin') return 1;
          if (role === 'staff') return 2;
          return 3;
        };
        
        const priorityA = rolePriority(a.role);
        const priorityB = rolePriority(b.role);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // If same role, sort by complaints count (descending)
        return b.complaintsCount - a.complaintsCount;
      });
      
      setUsers(mergedUsers);
      setBackendStatus('connected');
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setBackendStatus('disconnected');
      // Show sample data if backend is not available
      setUsers(getSampleUsersWithComplaints());
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Get sample users with complaint data for demonstration
  const getSampleUsersWithComplaints = () => {
    return [
      {
        id: 1,
        name: 'प्रशासक',
        enName: 'Admin User',
        email: 'admin@example.com',
        phone: '9800000000',
        role: 'admin',
        role_np: 'प्रशासक',
        role_en: 'Admin',
        status: 'active',
        status_np: 'सक्रिय',
        status_en: 'Active',
        registeredDate: '२०८०-०१-०१',
        enRegisteredDate: '2024-01-01',
        lastLogin: '२०८०-०२-२५',
        enLastLogin: '2024-02-25',
        complaintsCount: 0,
        resolvedCount: 0,
        complaints: [],
        isSystemUser: true
      },
      {
        id: 2,
        name: 'कर्मचारी',
        enName: 'Staff Member',
        email: 'staff@example.com',
        phone: '9812345678',
        role: 'staff',
        role_np: 'कर्मचारी',
        role_en: 'Staff',
        status: 'active',
        status_np: 'सक्रिय',
        status_en: 'Active',
        registeredDate: '२०८०-०१-०५',
        enRegisteredDate: '2024-01-05',
        lastLogin: '२०८०-०२-२४',
        enLastLogin: '2024-02-24',
        complaintsCount: 0,
        resolvedCount: 0,
        complaints: [],
        isSystemUser: true
      },
      {
        id: 3,
        name: 'राम बहादुर',
        enName: 'Ram Bahadur',
        email: 'ram@example.com',
        phone: '9841000001',
        role: 'user',
        role_np: 'प्रयोगकर्ता',
        role_en: 'User',
        status: 'active',
        status_np: 'सक्रिय',
        status_en: 'Active',
        registeredDate: '२०८०-०१-१५',
        enRegisteredDate: '2024-01-15',
        lastLogin: '२०८०-०२-२०',
        enLastLogin: '2024-02-20',
        complaintsCount: 3,
        resolvedCount: 2,
        complaints: [
          { id: 101, complaint_number: 'NTC-2024-001', status: 'Resolved', nature_of_complaint: 'Internet', created_at: '2024-01-10' },
          { id: 102, complaint_number: 'NTC-2024-015', status: 'Resolved', nature_of_complaint: 'Billing', created_at: '2024-01-20' },
          { id: 103, complaint_number: 'NTC-2024-028', status: 'Pending', nature_of_complaint: 'Network', created_at: '2024-02-01' }
        ],
        isSystemUser: true
      },
      {
        id: 4,
        name: 'सीता शर्मा',
        enName: 'Sita Sharma',
        email: 'sita@example.com',
        phone: '9823456789',
        role: 'user',
        role_np: 'प्रयोगकर्ता',
        role_en: 'User',
        status: 'active',
        status_np: 'सक्रिय',
        status_en: 'Active',
        registeredDate: '२०८०-०१-१८',
        enRegisteredDate: '2024-01-18',
        lastLogin: '२०८०-०२-२२',
        enLastLogin: '2024-02-22',
        complaintsCount: 5,
        resolvedCount: 4,
        complaints: [
          { id: 104, complaint_number: 'NTC-2024-002', status: 'Resolved', nature_of_complaint: 'Recharge', created_at: '2024-01-12' },
          { id: 105, complaint_number: 'NTC-2024-008', status: 'Resolved', nature_of_complaint: 'Internet', created_at: '2024-01-18' },
          { id: 106, complaint_number: 'NTC-2024-012', status: 'Resolved', nature_of_complaint: 'Billing', created_at: '2024-01-22' },
          { id: 107, complaint_number: 'NTC-2024-018', status: 'Resolved', complaint_type: 'Network', created_at: '2024-01-28' },
          { id: 108, complaint_number: 'NTC-2024-025', status: 'Pending', complaint_type: 'Technical', created_at: '2024-02-05' }
        ],
        isSystemUser: true
      },
      {
        id: 5,
        name: 'हरि प्रसाद',
        enName: 'Hari Prasad',
        email: 'hari@example.com',
        phone: '9845678901',
        role: 'user',
        role_np: 'प्रयोगकर्ता',
        role_en: 'User',
        status: 'inactive',
        status_np: 'निष्क्रिय',
        status_en: 'Inactive',
        registeredDate: '२०८०-०१-२०',
        enRegisteredDate: '2024-01-20',
        lastLogin: '२०८०-०१-२५',
        enLastLogin: '2024-01-25',
        complaintsCount: 1,
        resolvedCount: 1,
        complaints: [
          { id: 109, complaint_number: 'CR-2024-003', status: 'Resolved', complaint_type: 'Activation', created_at: '2024-01-15' }
        ],
        isSystemUser: true
      }
    ];
  };

  // Role options
  const roles = {
    np: {
      all: 'सबै भूमिका',
      user: 'प्रयोगकर्ता',
      staff: 'कर्मचारी',
      admin: 'प्रशासक'
    },
    en: {
      all: 'All Roles',
      user: 'User',
      staff: 'Staff',
      admin: 'Admin'
    }
  };

  // Status options
  const statuses = {
    np: {
      all: 'सबै स्थिति',
      active: 'सक्रिय',
      inactive: 'निष्क्रिय',
      suspended: 'निलम्बित'
    },
    en: {
      all: 'All Status',
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended'
    }
  };

  // Check authentication
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('adminUser') || localStorage.getItem('user');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const content = {
    np: {
      userManagement: 'प्रयोगकर्ता व्यवस्थापन',
      manageUsers: 'प्रयोगकर्ताहरू व्यवस्थापन गर्नुहोस्',
      searchPlaceholder: 'नाम, इमेल वा फोन नम्बरले खोज्नुहोस्...',
      filterByRole: 'भूमिका अनुसार फिल्टर',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      addNewUser: 'नयाँ प्रयोगकर्ता',
      editUser: 'प्रयोगकर्ता सम्पादन',
      name: 'नाम',
      email: 'इमेल',
      phone: 'फोन',
      role: 'भूमिका',
      status: 'स्थिति',
      registeredDate: 'दर्ता मिति',
      lastLogin: 'अन्तिम लगइन',
      complaints: 'गुनासोहरू',
      resolved: 'समाधान',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      editUserBtn: 'सम्पादन गर्नुहोस्',
      suspendUser: 'निलम्बन गर्नुहोस्',
      activateUser: 'सक्रिय गर्नुहोस्',
      deleteUser: 'हटाउनुहोस्',
      userDetails: 'प्रयोगकर्ता विवरण',
      fullName: 'पुरा नाम',
      userRole: 'प्रयोगकर्ता भूमिका',
      accountStatus: 'खाता स्थिति',
      totalComplaints: 'जम्मा गुनासो',
      resolvedComplaints: 'समाधान गुनासो',
      resolutionRate: 'समाधान दर',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noUsersFound: 'कुनै प्रयोगकर्ता फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalUsers: 'जम्मा प्रयोगकर्ता',
      activeUsers: 'सक्रिय प्रयोगकर्ता',
      totalComplaintsLabel: 'जम्मा गुनासो',
      addUser: 'प्रयोगकर्ता थप्नुहोस्',
      updateUser: 'प्रयोगकर्ता अपडेट गर्नुहोस्',
      userAdded: 'प्रयोगकर्ता सफलतापूर्वक थपियो',
      userUpdated: 'प्रयोगकर्ता सफलतापूर्वक अपडेट गरियो',
      fillAllFields: 'कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्',
      passwordMismatch: 'पासवर्ड मिलेन',
      invalidEmail: 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्',
      invalidPhone: 'कृपया मान्य फोन नम्बर प्रविष्ट गर्नुहोस्',
      confirmDelete: 'के तपाईं यो प्रयोगकर्ता हटाउन निश्चित हुनुहुन्छ?',
      userDeleted: 'प्रयोगकर्ता सफलतापूर्वक हटाइयो',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      backendNotConnected: 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।',
      viewUserComplaints: 'गुनासोहरू हेर्नुहोस्',
      complaintType: 'गुनासो प्रकार',
      ticketId: 'टिकेट नम्बर',
      regular: 'साधारण',
      regarding: 'सम्बन्धी',
      subject: 'विषय',
      date: 'मिति'
    },
    en: {
      userManagement: 'User Management',
      manageUsers: 'Manage Users',
      searchPlaceholder: 'Search by name, email or phone...',
      filterByRole: 'Filter by Role',
      filterByStatus: 'Filter by Status',
      addNewUser: 'Add New User',
      editUser: 'Edit User',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      status: 'Status',
      registeredDate: 'Registered Date',
      lastLogin: 'Last Login',
      complaints: 'Complaints',
      resolved: 'Resolved',
      actions: 'Actions',
      viewDetails: 'View Details',
      editUserBtn: 'Edit User',
      suspendUser: 'Suspend User',
      activateUser: 'Activate User',
      deleteUser: 'Delete User',
      userDetails: 'User Details',
      fullName: 'Full Name',
      userRole: 'User Role',
      accountStatus: 'Account Status',
      totalComplaints: 'Total Complaints',
      resolvedComplaints: 'Resolved Complaints',
      resolutionRate: 'Resolution Rate',
      close: 'Close',
      all: 'All',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noUsersFound: 'No users found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      totalComplaintsLabel: 'Total Complaints',
      addUser: 'Add User',
      updateUser: 'Update User',
      userAdded: 'User added successfully',
      userUpdated: 'User updated successfully',
      fillAllFields: 'Please fill all required fields',
      passwordMismatch: 'Passwords do not match',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      confirmDelete: 'Are you sure you want to delete this user?',
      userDeleted: 'User deleted successfully',
      loading: 'Loading...',
      refresh: 'Refresh',
      backendNotConnected: 'Backend server not connected. Showing sample data.',
      viewUserComplaints: 'View Complaints',
      complaintType: 'Complaint Type',
      ticketId: 'Ticket ID',
      regular: 'Regular',
      regarding: 'Regarding',
      subject: 'Subject',
      date: 'Date'
    }
  };

  const t = content[language];
  const rolesObj = roles[language];
  const statusesObj = statuses[language];

  const getRoleText = (role) => {
    return rolesObj[role] || role;
  };

  const getStatusText = (status) => {
    return statusesObj[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      active: 'status-active',
      inactive: 'status-inactive',
      suspended: 'status-suspended'
    };
    return classes[status] || 'status-inactive';
  };

  const getRoleClass = (role) => {
    const classes = {
      admin: 'role-admin',
      staff: 'role-staff',
      user: 'role-user'
    };
    return classes[role] || 'role-user';
  };

  const getDate = (user, field) => {
    if (field === 'registeredDate') {
      return language === 'np' ? user.registeredDate : user.enRegisteredDate;
    } else if (field === 'lastLogin') {
      return language === 'np' ? user.lastLogin : user.enLastLogin;
    }
    return '-';
  };

  // Get complaint type label
  const getComplaintType = (complaint) => {
    if (complaint.nature_of_complaint) {
      return language === 'np' ? getCategoryNepali(complaint.nature_of_complaint) : complaint.nature_of_complaint;
    }
    if (complaint.complaint_type) {
      return language === 'np' ? getCategoryNepali(complaint.complaint_type) : complaint.complaint_type;
    }
    return language === 'np' ? 'सामान्य' : 'General';
  };

  // Get category Nepali translation
  const getCategoryNepali = (category) => {
    const categories = {
      'service': 'सेवा समस्या',
      'billing': 'बिलिङ समस्या',
      'technical': 'प्राविधिक समस्या',
      'network': 'नेटवर्क समस्या',
      'signal': 'सिग्नल समस्या',
      'recharge': 'रिचार्ज समस्या',
      'activation': 'सक्रियता समस्या',
      'internet': 'इन्टरनेट सेवा',
      'general': 'सामान्य',
      'other': 'अन्य'
    };
    return categories[category] || 'सामान्य';
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const searchMatch = searchTerm === '' || 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.enName && user.enName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    const statusMatch = statusFilter === 'all' || user.status === statusFilter;
    
    return searchMatch && roleMatch && statusMatch;
  });

  // Calculate statistics
  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(u => u.status === 'active').length;
  const totalComplaintsCount = filteredUsers.reduce((sum, u) => sum + (u.complaintsCount || 0), 0);
  const staffCount = filteredUsers.filter(u => u.role === 'staff').length;
  const adminCount = filteredUsers.filter(u => u.role === 'admin').length;
  const regularUsersCount = filteredUsers.filter(u => u.role === 'user').length;

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const openAddModal = () => {
    setNewUser({
      name: '',
      enName: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewUser({
      name: '',
      enName: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
  };

  const openEditModal = (user) => {
    setEditUser({
      id: user.id,
      name: user.name,
      enName: user.enName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUser({
      id: null,
      name: '',
      enName: '',
      email: '',
      phone: '',
      role: '',
      status: ''
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[9][8-9][0-9]{8}$/;
    return re.test(phone);
  };

  const handleAddUser = async () => {
    const errors = {};
    
    if (!newUser.name) errors.name = t.fillAllFields;
    if (!newUser.enName) errors.enName = t.fillAllFields;
    if (!newUser.email) errors.email = t.fillAllFields;
    else if (!validateEmail(newUser.email)) errors.email = t.invalidEmail;
    if (!newUser.phone) errors.phone = t.fillAllFields;
    else if (!validatePhone(newUser.phone)) errors.phone = t.invalidPhone;
    if (!newUser.password) errors.password = t.fillAllFields;
    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = t.passwordMismatch;
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_URL}/users`, {
        name: newUser.name,
        nameEn: newUser.enName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        password: newUser.password
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        alert(t.userAdded);
        closeAddModal();
        fetchUsers();
      } else {
        alert(response.data.message || 'Error adding user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert(error.response?.data?.message || 'Error adding user');
    }
  };

  const handleEditUser = async () => {
    const errors = {};
    
    if (!editUser.name) errors.name = t.fillAllFields;
    if (!editUser.enName) errors.enName = t.fillAllFields;
    if (!editUser.email) errors.email = t.fillAllFields;
    else if (!validateEmail(editUser.email)) errors.email = t.invalidEmail;
    if (!editUser.phone) errors.phone = t.fillAllFields;
    else if (!validatePhone(editUser.phone)) errors.phone = t.invalidPhone;
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const token = getAuthToken();
      const response = await axios.put(`${API_URL}/users/${editUser.id}`, {
        name: editUser.name,
        nameEn: editUser.enName,
        email: editUser.email,
        phone: editUser.phone,
        role: editUser.role,
        status: editUser.status
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        alert(t.userUpdated);
        closeEditModal();
        fetchUsers();
      } else {
        alert(response.data.message || 'Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Error updating user');
    }
  };

  const updateUserStatus = async (id, newStatus) => {
    try {
      const token = getAuthToken();
      const response = await axios.patch(`${API_URL}/users/${id}/status`, {
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        alert(language === 'np' ? 'प्रयोगकर्ता स्थिति अपडेट गरियो' : 'User status updated');
        fetchUsers();
      } else {
        alert(response.data.message || 'Error updating status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const deleteUser = async (id, name) => {
    if (window.confirm(`${t.confirmDelete} ${language === 'np' ? name : users.find(u => u.id === id)?.enName}?`)) {
      try {
        const token = getAuthToken();
        const response = await axios.delete(`${API_URL}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          alert(t.userDeleted);
          fetchUsers();
        } else {
          alert(response.data.message || 'Error deleting user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const refreshData = () => {
    setLoading(true);
    setCurrentPage(1);
    fetchUsers();
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
    <div className="admin-users">
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      {backendStatus === 'disconnected' && (
        <div className="backend-warning">
          ⚠️ {t.backendNotConnected}
        </div>
      )}
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>{t.userManagement}</h1>
                <p>{t.manageUsers}</p>
              </div>
              <div className="header-buttons">
                <button className="refresh-btn" onClick={refreshData}>
                  🔄 {t.refresh}
                </button>
                <button className="add-user-btn" onClick={openAddModal}>
                  ➕ {t.addNewUser}
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon purple">👥</div>
                <div className="stat-info">
                  <div className="stat-value">{totalUsers}</div>
                  <div className="stat-label">{t.totalUsers}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">🟢</div>
                <div className="stat-info">
                  <div className="stat-value">{activeUsers}</div>
                  <div className="stat-label">{t.activeUsers}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">📋</div>
                <div className="stat-info">
                  <div className="stat-value">{totalComplaintsCount}</div>
                  <div className="stat-label">{t.totalComplaintsLabel}</div>
                </div>
              </div>
            </div>

            {/* Role Distribution Cards */}
            <div className="stats-row-small">
              <div className="stat-card-small">
                <span className="stat-icon-small">👑</span>
                <div className="stat-info-small">
                  <div className="stat-value-small">{adminCount}</div>
                  <div className="stat-label-small">{rolesObj.admin}</div>
                </div>
              </div>
              <div className="stat-card-small">
                <span className="stat-icon-small">👔</span>
                <div className="stat-info-small">
                  <div className="stat-value-small">{staffCount}</div>
                  <div className="stat-label-small">{rolesObj.staff}</div>
                </div>
              </div>
              <div className="stat-card-small">
                <span className="stat-icon-small">👤</span>
                <div className="stat-info-small">
                  <div className="stat-value-small">{regularUsersCount}</div>
                  <div className="stat-label-small">{rolesObj.user}</div>
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
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  {Object.entries(rolesObj).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  {Object.entries(statusesObj).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>{t.name}</th>
                    <th>{t.email}</th>
                    <th>{t.phone}</th>
                    <th>{t.role}</th>
                    <th>{t.status}</th>
                    <th>{t.registeredDate}</th>
                    <th>{t.complaints}</th>
                    <th>{t.actions}</th>
                </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="user-name">
                          {language === 'np' ? user.name : user.enName}
                          {user.role === 'admin' && <span className="admin-badge">Admin</span>}
                          {user.role === 'staff' && <span className="staff-badge">Staff</span>}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <span className={`role-badge ${getRoleClass(user.role)}`}>
                            {getRoleText(user.role)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(user.status)}`}>
                            {getStatusText(user.status)}
                          </span>
                        </td>
                        <td>{getDate(user, 'registeredDate')}</td>
                        <td>
                          <span className="complaint-count-badge">
                            {user.complaintsCount}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="view-btn" onClick={() => openModal(user)} title={t.viewDetails}>
                              👁️
                            </button>
                            <button className="edit-btn" onClick={() => openEditModal(user)} title={t.editUserBtn}>
                              ✏️
                            </button>
                            {user.status === 'active' ? (
                              <button className="suspend-btn" onClick={() => updateUserStatus(user.id, 'suspended')} title={t.suspendUser}>
                                🔒
                              </button>
                            ) : user.status === 'suspended' ? (
                              <button className="activate-btn" onClick={() => updateUserStatus(user.id, 'active')} title={t.activateUser}>
                                🔓
                              </button>
                            ) : null}
                            <button className="delete-btn" onClick={() => deleteUser(user.id, user.name)} title={t.deleteUser}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-data">
                      <td colSpan="8">
                        <div className="no-data-content">
                          <span className="no-data-icon">📭</span>
                          <p>{t.noUsersFound}</p>
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

      {/* User Details Modal with Complaints List from Both Endpoints */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 {t.userDetails}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>{t.fullName}:</label>
                <span>{language === 'np' ? selectedUser.name : selectedUser.enName}</span>
              </div>
              <div className="detail-row">
                <label>{t.email}:</label>
                <span>{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <label>{t.phone}:</label>
                <span>{selectedUser.phone}</span>
              </div>
              <div className="detail-row">
                <label>{t.userRole}:</label>
                <span className={`role-badge ${getRoleClass(selectedUser.role)}`}>
                  {getRoleText(selectedUser.role)}
                </span>
              </div>
              <div className="detail-row">
                <label>{t.accountStatus}:</label>
                <span className={`status-badge ${getStatusClass(selectedUser.status)}`}>
                  {getStatusText(selectedUser.status)}
                </span>
              </div>
              <div className="detail-row">
                <label>{t.registeredDate}:</label>
                <span>{getDate(selectedUser, 'registeredDate')}</span>
              </div>
              <div className="detail-row">
                <label>{t.lastLogin}:</label>
                <span>{getDate(selectedUser, 'lastLogin')}</span>
              </div>
              <div className="detail-row">
                <label>{t.totalComplaints}:</label>
                <span>{selectedUser.complaintsCount}</span>
              </div>
              <div className="detail-row">
                <label>{t.resolvedComplaints}:</label>
                <span>{selectedUser.resolvedCount}</span>
              </div>
              <div className="detail-row">
                <label>{t.resolutionRate}:</label>
                <span>
                  {selectedUser.complaintsCount > 0 
                    ? `${Math.round((selectedUser.resolvedCount / selectedUser.complaintsCount) * 100)}%`
                    : 'N/A'}
                </span>
              </div>
              
              {selectedUser.complaints && selectedUser.complaints.length > 0 && (
                <div className="user-complaints-section">
                  <div className="section-title">
                    <h3>📋 {t.viewUserComplaints}</h3>
                  </div>
                  <div className="complaints-list">
                    {selectedUser.complaints.map((complaint, index) => (
                      <div key={complaint.id || index} className="complaint-item">
                        <div className="complaint-header">
                          <span className="complaint-id">
                            {complaint.complaint_number || complaint.complaintNumber || `${t.ticketId} #${index + 1}`}
                          </span>
                          <span className="complaint-type-badge">
                            {complaint.nature_of_complaint ? (language === 'np' ? 'साधारण' : 'Regular') : (language === 'np' ? 'सम्बन्धी' : 'Regarding')}
                          </span>
                          <span className={`complaint-status ${complaint.status === 'resolved' || complaint.status === 'Resolved' ? 'status-resolved' : 'status-pending'}`}>
                            {complaint.status === 'resolved' || complaint.status === 'Resolved' 
                              ? (language === 'np' ? 'समाधान भयो' : 'Resolved')
                              : (language === 'np' ? 'विचाराधीन' : 'Pending')}
                          </span>
                        </div>
                        <div className="complaint-details">
                          <p>
                            <strong>{t.complaintType}:</strong> {getComplaintType(complaint)}
                          </p>
                          {complaint.subject && (
                            <p><strong>{t.subject}:</strong> {complaint.subject}</p>
                          )}
                          <p>
                            <strong>{t.date}:</strong> {formatNepaliDate(complaint.created_at || complaint.createdAt || complaint.submittedDate)}
                          </p>
                        </div>
                      </div>
                    ))}
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ {t.addNewUser}</h2>
              <button className="modal-close" onClick={closeAddModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t.name} ({language === 'np' ? 'नेपाली' : 'Nepali'}) <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  placeholder={language === 'np' ? 'पुरा नाम' : 'Full Name'}
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>{t.name} (English) <span className="required">*</span></label>
                <input
                  type="text"
                  name="enName"
                  value={newUser.enName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className={formErrors.enName ? 'error' : ''}
                />
                {formErrors.enName && <span className="error-text">{formErrors.enName}</span>}
              </div>
              <div className="form-group">
                <label>{t.email} <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label>{t.phone} <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleInputChange}
                  placeholder="98XXXXXXXX"
                  className={formErrors.phone ? 'error' : ''}
                />
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label>{t.role} <span className="required">*</span></label>
                <select name="role" value={newUser.role} onChange={handleInputChange}>
                  <option value="user">{rolesObj.user}</option>
                  <option value="staff">{rolesObj.staff}</option>
                  <option value="admin">{rolesObj.admin}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t.password} <span className="required">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  placeholder="********"
                  className={formErrors.password ? 'error' : ''}
                />
                {formErrors.password && <span className="error-text">{formErrors.password}</span>}
              </div>
              <div className="form-group">
                <label>Confirm Password <span className="required">*</span></label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={newUser.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="********"
                  className={formErrors.confirmPassword ? 'error' : ''}
                />
                {formErrors.confirmPassword && <span className="error-text">{formErrors.confirmPassword}</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeAddModal}>{t.close}</button>
              <button className="btn-submit" onClick={handleAddUser}>{t.addUser}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ {t.editUser}</h2>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t.name} ({language === 'np' ? 'नेपाली' : 'Nepali'}) <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={editUser.name}
                  onChange={handleEditInputChange}
                  placeholder={language === 'np' ? 'पुरा नाम' : 'Full Name'}
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>{t.name} (English) <span className="required">*</span></label>
                <input
                  type="text"
                  name="enName"
                  value={editUser.enName}
                  onChange={handleEditInputChange}
                  placeholder="Full Name"
                  className={formErrors.enName ? 'error' : ''}
                />
                {formErrors.enName && <span className="error-text">{formErrors.enName}</span>}
              </div>
              <div className="form-group">
                <label>{t.email} <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={editUser.email}
                  onChange={handleEditInputChange}
                  placeholder="example@email.com"
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label>{t.phone} <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={editUser.phone}
                  onChange={handleEditInputChange}
                  placeholder="98XXXXXXXX"
                  className={formErrors.phone ? 'error' : ''}
                />
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label>{t.role} <span className="required">*</span></label>
                <select name="role" value={editUser.role} onChange={handleEditInputChange}>
                  <option value="user">{rolesObj.user}</option>
                  <option value="staff">{rolesObj.staff}</option>
                  <option value="admin">{rolesObj.admin}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t.status} <span className="required">*</span></label>
                <select name="status" value={editUser.status} onChange={handleEditInputChange}>
                  <option value="active">{statusesObj.active}</option>
                  <option value="inactive">{statusesObj.inactive}</option>
                  <option value="suspended">{statusesObj.suspended}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeEditModal}>{t.close}</button>
              <button className="btn-submit" onClick={handleEditUser}>{t.updateUser}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-users {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          height: 100vh;
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .backend-warning {
          position: fixed;
          top: 195px;
          left: 0;
          right: 0;
          background: #ff9800;
          color: white;
          padding: 8px;
          text-align: center;
          z-index: 100;
          font-size: 0.8rem;
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

        .dashboard-layout {
          display: flex;
          height: calc(100vh - 195px);
          margin-top: 195px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

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

        .header-buttons {
          display: flex;
          gap: 12px;
        }

        .refresh-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          color: #475569;
        }

        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .add-user-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .add-user-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .stats-row-small {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .stat-card-small {
          background: white;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }

        .stat-icon.purple { background: #f3e8ff; color: #9333ea; }
        .stat-icon.green { background: #d1fae5; color: #059669; }
        .stat-icon.blue { background: #dbeafe; color: #2563eb; }

        .stat-icon-small {
          font-size: 1.5rem;
        }

        .stat-info {
          flex: 1;
        }

        .stat-info-small {
          flex: 1;
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .stat-value-small {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
        }

        .stat-label-small {
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
        }

        .search-box {
          flex: 1;
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
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
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
        }

        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .users-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .users-table td {
          color: #334155;
          font-size: 0.85rem;
        }

        .users-table tr:hover {
          background: #fafcff;
        }

        .user-name {
          font-weight: 600;
          color: #0f172a;
          position: relative;
        }

        .admin-badge, .staff-badge {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.6rem;
          font-weight: 500;
        }

        .admin-badge {
          background: #f3e8ff;
          color: #9333ea;
        }

        .staff-badge {
          background: #dbeafe;
          color: #2563eb;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .role-admin {
          background: #f3e8ff;
          color: #9333ea;
        }

        .role-staff {
          background: #dbeafe;
          color: #2563eb;
        }

        .role-user {
          background: #d1fae5;
          color: #059669;
        }

        .complaint-count-badge {
          display: inline-block;
          background: #dbeafe;
          color: #2563eb;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-active { background: #d1fae5; color: #059669; }
        .status-inactive { background: #fef3c7; color: #d97706; }
        .status-suspended { background: #fee2e2; color: #dc2626; }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .view-btn, .edit-btn, .suspend-btn, .activate-btn, .delete-btn {
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
          border: none;
        }

        .view-btn {
          background: #f1f5f9;
        }

        .view-btn:hover {
          background: #e2e8f0;
        }

        .edit-btn {
          background: #dbeafe;
          color: #2563eb;
        }

        .edit-btn:hover {
          background: #bfdbfe;
        }

        .suspend-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .suspend-btn:hover {
          background: #fecaca;
        }

        .activate-btn {
          background: #d1fae5;
          color: #059669;
        }

        .activate-btn:hover {
          background: #a7f3d0;
        }

        .delete-btn {
          background: #fef3c7;
          color: #d97706;
        }

        .delete-btn:hover {
          background: #fde68a;
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
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #3b82f6;
          color: #3b82f6;
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
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 700px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .user-details-modal {
          max-width: 700px;
        }

        .add-modal, .edit-modal {
          max-width: 600px;
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
          z-index: 10;
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
        }

        .modal-close:hover {
          color: #475569;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-row {
          display: flex;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-row label {
          width: 130px;
          font-weight: 600;
          color: #0f172a;
          flex-shrink: 0;
        }

        .detail-row span {
          flex: 1;
          color: #334155;
        }

        .user-complaints-section {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 2px solid #e2e8f0;
        }

        .section-title h3 {
          font-size: 1rem;
          color: #0f172a;
          margin-bottom: 16px;
        }

        .complaints-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
        }

        .complaint-item {
          background: #f8fafc;
          border-radius: 12px;
          padding: 12px;
          border: 1px solid #e2e8f0;
        }

        .complaint-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 8px;
        }

        .complaint-id {
          font-weight: 600;
          color: #3b82f6;
          font-family: monospace;
          font-size: 0.8rem;
        }

        .complaint-type-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 500;
          background: #e0e7ff;
          color: #4f46e5;
        }

        .complaint-status {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-resolved {
          background: #d1fae5;
          color: #059669;
        }

        .status-pending {
          background: #fef3c7;
          color: #d97706;
        }

        .complaint-details {
          font-size: 0.8rem;
          color: #475569;
        }

        .complaint-details p {
          margin: 4px 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #0f172a;
          font-size: 0.85rem;
        }

        .required {
          color: #ef4444;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .form-group input.error {
          border-color: #ef4444;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.7rem;
          margin-top: 4px;
          display: block;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          text-align: right;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
          background: white;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-submit, .btn-close {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-submit:hover, .btn-close:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        @media (max-width: 1200px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .stats-row-small {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .admin-users {
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
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .stats-row {
            grid-template-columns: 1fr;
          }
          
          .stats-row-small {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .header-buttons {
            width: 100%;
            flex-direction: column;
          }
          
          .complaint-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .users-table th,
          .users-table td {
            padding: 8px;
            font-size: 0.7rem;
          }
          
          .detail-row {
            flex-direction: column;
          }
          
          .detail-row label {
            width: 100%;
            margin-bottom: 4px;
          }
          
          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;