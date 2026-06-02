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
  const [allComplaints, setAllComplaints] = useState([]);
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

  // Fetch complaints from backend to extract unique complainants
  const fetchComplaints = async () => {
    try {
      console.log('Fetching complaints from backend...');
      const response = await axios.get('http://localhost:5000/api/complaints');
      console.log('Complaints API Response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setAllComplaints(response.data.data);
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return [];
    }
  };

  // Extract unique users from complaints and fetch existing users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from backend...');
      const token = localStorage.getItem('adminToken');
      
      // First fetch complaints to get complainant data
      const complaints = await fetchComplaints();
      
      // Create a map of unique complainants from complaints
      const complainantMap = new Map();
      
      complaints.forEach(complaint => {
        const email = complaint.email;
        if (email && !complainantMap.has(email)) {
          complainantMap.set(email, {
            name: complaint.name || complaint.complainantName || 'N/A',
            enName: complaint.nameEn || complaint.complainantNameEn || complaint.name || 'N/A',
            email: complaint.email,
            phone: complaint.phone || complaint.mobile || 'N/A',
            complaints: [],
            role: 'user',
            status: 'active'
          });
        }
        
        // Add complaint to user's complaint list
        if (email && complainantMap.has(email)) {
          const user = complainantMap.get(email);
          user.complaints.push(complaint);
          complainantMap.set(email, user);
        }
      });
      
      // Try to fetch existing users from users API (if available)
      let existingUsers = [];
      try {
        const usersResponse = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (usersResponse.data.success && Array.isArray(usersResponse.data.data)) {
          existingUsers = usersResponse.data.data;
        }
      } catch (usersError) {
        console.log('Users API not available, using complainant data only');
      }
      
      // Merge existing users with complainant data
      const mergedUsers = [];
      const processedEmails = new Set();
      
      // Add existing users first
      existingUsers.forEach(user => {
        processedEmails.add(user.email);
        
        // Find complaints for this user
        const userComplaints = complaints.filter(c => c.email === user.email);
        const totalComplaints = userComplaints.length;
        const resolvedComplaints = userComplaints.filter(c => 
          c.status === 'Resolved' || c.status === 'समाधान भयो'
        ).length;
        
        mergedUsers.push({
          id: user.id,
          name: user.name || user.fullName || 'N/A',
          enName: user.nameEn || user.fullNameEn || user.name || 'N/A',
          email: user.email,
          phone: user.phone || 'N/A',
          role: user.role || 'user',
          role_np: user.role === 'user' ? 'प्रयोगकर्ता' : user.role === 'staff' ? 'कर्मचारी' : user.role === 'admin' ? 'प्रशासक' : 'प्रयोगकर्ता',
          role_en: user.role === 'user' ? 'User' : user.role === 'staff' ? 'Staff' : user.role === 'admin' ? 'Admin' : 'User',
          status: user.status || 'active',
          status_np: user.status === 'active' ? 'सक्रिय' : user.status === 'inactive' ? 'निष्क्रिय' : user.status === 'suspended' ? 'निलम्बित' : 'सक्रिय',
          status_en: user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : user.status === 'suspended' ? 'Suspended' : 'Active',
          registeredDate: formatNepaliDate(user.createdAt || user.registeredDate || new Date()),
          enRegisteredDate: formatEnglishDate(user.createdAt || user.registeredDate || new Date()),
          lastLogin: user.lastLogin ? formatNepaliDate(user.lastLogin) : '-',
          enLastLogin: user.lastLogin ? formatEnglishDate(user.lastLogin) : '-',
          complaintsCount: totalComplaints,
          resolvedCount: resolvedComplaints,
          complaints: userComplaints
        });
      });
      
      // Add complainants that are not in existing users
      complainantMap.forEach((complainant, email) => {
        if (!processedEmails.has(email)) {
          const totalComplaints = complainant.complaints.length;
          const resolvedComplaints = complainant.complaints.filter(c => 
            c.status === 'Resolved' || c.status === 'समाधान भयो'
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
            complaints: complainant.complaints
          });
        }
      });
      
      console.log(`Found ${mergedUsers.length} users (${mergedUsers.filter(u => u.complaintsCount > 0).length} with complaints)`);
      setUsers(mergedUsers);
      setBackendStatus('connected');
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers(getSampleUsersWithComplaints());
      setBackendStatus('disconnected');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Get sample users with complaint data
  const getSampleUsersWithComplaints = () => {
    return [
      {
        id: 1,
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
          { id: 101, complaintNumber: 'NTC-2024-001', status: 'Resolved', category: 'Internet', submittedDate: '2024-01-10' },
          { id: 102, complaintNumber: 'NTC-2024-015', status: 'Resolved', category: 'Billing', submittedDate: '2024-01-20' },
          { id: 103, complaintNumber: 'NTC-2024-028', status: 'Pending', category: 'Network', submittedDate: '2024-02-01' }
        ]
      },
      {
        id: 2,
        name: 'सीता शर्मा',
        enName: 'Sita Sharma',
        email: 'sita@example.com',
        phone: '9812345678',
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
          { id: 104, complaintNumber: 'NTC-2024-002', status: 'Resolved', category: 'Recharge', submittedDate: '2024-01-12' },
          { id: 105, complaintNumber: 'NTC-2024-008', status: 'Resolved', category: 'Internet', submittedDate: '2024-01-18' },
          { id: 106, complaintNumber: 'NTC-2024-012', status: 'Resolved', category: 'Billing', submittedDate: '2024-01-22' },
          { id: 107, complaintNumber: 'NTC-2024-018', status: 'Resolved', category: 'Network', submittedDate: '2024-01-28' },
          { id: 108, complaintNumber: 'NTC-2024-025', status: 'Pending', category: 'Technical', submittedDate: '2024-02-05' }
        ]
      },
      {
        id: 3,
        name: 'हरि प्रसाद',
        enName: 'Hari Prasad',
        email: 'hari@example.com',
        phone: '9823456789',
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
          { id: 109, complaintNumber: 'NTC-2024-003', status: 'Resolved', category: 'Activation', submittedDate: '2024-01-15' }
        ]
      },
      {
        id: 4,
        name: 'गीता अधिकारी',
        enName: 'Gita Adhikari',
        email: 'gita@example.com',
        phone: '9841567890',
        role: 'user',
        role_np: 'प्रयोगकर्ता',
        role_en: 'User',
        status: 'active',
        status_np: 'सक्रिय',
        status_en: 'Active',
        registeredDate: '२०८०-०१-२२',
        enRegisteredDate: '2024-01-22',
        lastLogin: '२०८०-०२-२१',
        enLastLogin: '2024-02-21',
        complaintsCount: 2,
        resolvedCount: 2,
        complaints: [
          { id: 110, complaintNumber: 'NTC-2024-005', status: 'Resolved', category: 'Signal', submittedDate: '2024-01-16' },
          { id: 111, complaintNumber: 'NTC-2024-014', status: 'Resolved', category: 'Internet', submittedDate: '2024-01-24' }
        ]
      },
      {
        id: 5,
        name: 'विकास न्यौपाने',
        enName: 'Bikas Neupane',
        email: 'bikas@example.com',
        phone: '9847890123',
        role: 'staff',
        role_np: 'कर्मचारी',
        role_en: 'Staff',
        status: 'active',
        status_np: 'सक्रिय',
        status_en: 'Active',
        registeredDate: '२०८०-०१-२५',
        enRegisteredDate: '2024-01-25',
        lastLogin: '२०८०-०२-२३',
        enLastLogin: '2024-02-23',
        complaintsCount: 0,
        resolvedCount: 0,
        complaints: []
      },
      {
        id: 6,
        name: 'मिना काफ्ले',
        enName: 'Mina Kafle',
        email: 'mina@example.com',
        phone: '9841234567',
        role: 'user',
        role_np: 'प्रयोगकर्ता',
        role_en: 'User',
        status: 'active',
        status_np: 'सक्रिय',
        status_en: 'Active',
        registeredDate: '२०८०-०१-१०',
        enRegisteredDate: '2024-01-10',
        lastLogin: '२०८०-०२-१९',
        enLastLogin: '2024-02-19',
        complaintsCount: 4,
        resolvedCount: 3,
        complaints: [
          { id: 112, complaintNumber: 'NTC-2024-004', status: 'Resolved', category: 'Recharge', submittedDate: '2024-01-14' },
          { id: 113, complaintNumber: 'NTC-2024-009', status: 'Resolved', category: 'Billing', submittedDate: '2024-01-20' },
          { id: 114, complaintNumber: 'NTC-2024-016', status: 'Resolved', category: 'Internet', submittedDate: '2024-01-26' },
          { id: 115, complaintNumber: 'NTC-2024-022', status: 'Pending', category: 'Network', submittedDate: '2024-02-02' }
        ]
      }
    ];
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
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
      viewUserComplaints: 'गुनासोहरू हेर्नुहोस्'
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
      viewUserComplaints: 'View Complaints'
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

  const getDate = (user, field) => {
    if (field === 'registeredDate') {
      return language === 'np' ? user.registeredDate : user.enRegisteredDate;
    } else if (field === 'lastLogin') {
      return language === 'np' ? user.lastLogin : user.enLastLogin;
    }
    return '-';
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
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('http://localhost:5000/api/users', {
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
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`http://localhost:5000/api/users/${editUser.id}`, {
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
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(`http://localhost:5000/api/users/${id}/status`, {
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
        const token = localStorage.getItem('adminToken');
        const response = await axios.delete(`http://localhost:5000/api/users/${id}`, {
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
      
      <div className="users-container">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
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
                      <td className="user-name">{language === 'np' ? user.name : user.enName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{getRoleText(user.role)}</td>
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

      {/* User Details Modal with Complaints List */}
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
                <span>{getRoleText(selectedUser.role)}</span>
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
              
              {/* User's Complaints List */}
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
                            {complaint.complaintNumber || `Complaint #${index + 1}`}
                          </span>
                          <span className={`complaint-status status-${complaint.status === 'Resolved' || complaint.status === 'समाधान भयो' ? 'resolved' : 'pending'}`}>
                            {complaint.status === 'Resolved' || complaint.status === 'समाधान भयो' 
                              ? (language === 'np' ? 'समाधान भयो' : 'Resolved')
                              : (language === 'np' ? 'विचाराधीन' : 'Pending')}
                          </span>
                        </div>
                        <div className="complaint-details">
                          <p><strong>{language === 'np' ? 'प्रकार' : 'Category'}:</strong> {complaint.category || complaint.natureOfComplaint || 'N/A'}</p>
                          <p><strong>{language === 'np' ? 'मिति' : 'Date'}:</strong> {formatNepaliDate(complaint.submittedDate || complaint.createdAt)}</p>
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
          min-height: 100vh;
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

        .users-container {
          display: flex;
          margin-top: 195px;
          min-height: calc(100vh - 195px);
        }

        .sidebar-container {
          position: fixed;
          top: 195px;
          left: 0;
          width: 260px;
          height: calc(100vh - 195px);
          background: white;
          border-right: 1px solid #e2e8f0;
          z-index: 40;
        }

        .main-container {
          flex: 1;
          padding: 24px 32px;
          margin-left: 260px;
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

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
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
          max-width: 550px;
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
        }

        .complaint-id {
          font-weight: 600;
          color: #3b82f6;
          font-family: monospace;
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
        }

        @media (max-width: 768px) {
          .users-container {
            margin-top: 280px;
          }
          .sidebar-container {
            top: 280px;
            height: calc(100vh - 280px);
          }
          .main-container {
            padding: 16px;
            margin-left: 0;
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
          .action-buttons {
            flex-direction: column;
          }
          .header-buttons {
            width: 100%;
            flex-direction: column;
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