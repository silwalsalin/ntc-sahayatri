// src/pages/AdminComplaints.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminComplaints = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaintForAssign, setSelectedComplaintForAssign] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State for complaints from backend
  const [regularComplaints, setRegularComplaints] = useState([]);
  const [regardingComplaints, setRegardingComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }, []);

  // Fetch staff list from backend
  const fetchStaffList = async () => {
    setLoadingStaff(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast('Authentication token not found', 'error');
        return;
      }
      
      const response = await axios.get(`${API_URL}/staff/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setStaffList(response.data.data);
        
        if (response.data.data.length === 0) {
          showToast(language === 'np' ? 'कुनै स्टाफ प्रयोगकर्ता फेला परेन। कृपया पहिले स्टाफ प्रयोगकर्ता थप्नुहोस्।' : 'No staff users found. Please add staff users first.', 'info');
        }
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error('Error fetching staff list:', error);
      if (error.response?.status === 401) {
        showToast('Authentication failed. Please login again.', 'error');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setTimeout(() => navigate('/admin-login'), 1500);
      } else {
        showToast(language === 'np' ? 'स्टाफ सूची लोड गर्न असफल' : 'Failed to load staff list', 'error');
      }
      setStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  // Assign complaint to staff
  const assignToStaff = async (complaintId, staffId, staffEmail, staffName, complaintType) => {
    if (!complaintId || !staffId || !staffEmail) {
      showToast(language === 'np' ? 'अमान्य गुनासो वा स्टाफ डाटा' : 'Invalid complaint or staff data', 'error');
      return;
    }
    
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast('Authentication token not found', 'error');
        navigate('/admin-login');
        return;
      }
      
      let endpoint;
      if (complaintType === 'regular') {
        endpoint = `${API_URL}/admin/complaints/${complaintId}/assign`;
      } else {
        endpoint = `${API_URL}/admin/complaint-regarding/${complaintId}/assign`;
      }
      
      const response = await axios.patch(
        endpoint,
        { assignedTo: staffEmail, assignedToName: staffName, assignedById: staffId },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        showToast(
          language === 'np' 
            ? `गुनासो सफलतापूर्वक ${staffName} मा तोकियो` 
            : `Complaint assigned to ${staffName} successfully`, 
          'success'
        );
        await fetchAllComplaints();
        setShowAssignModal(false);
        setSelectedComplaintForAssign(null);
        setSelectedStaff('');
      } else {
        throw new Error(response.data.message || 'Failed to assign complaint');
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
      let errorMessage = language === 'np' ? 'गुनासो तोक्न असफल' : 'Failed to assign complaint';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = language === 'np' 
            ? 'प्रमाणीकरण असफल। कृपया पुन: लगइन गर्नुहोस्।' 
            : 'Authentication failed. Please login again.';
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setTimeout(() => navigate('/admin-login'), 1500);
        } else if (error.response.status === 403) {
          errorMessage = language === 'np'
            ? 'तपाईंलाई यो कार्य गर्न अनुमति छैन।'
            : 'You do not have permission to perform this action.';
        } else if (error.response.status === 404) {
          errorMessage = language === 'np'
            ? 'गुनासो वा स्टाफ फेला परेन।'
            : 'Complaint or staff not found.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = language === 'np'
          ? 'सर्भरमा जडान हुन सकेन। कृपया नेटवर्क जाँच गर्नुहोस्।'
          : 'Cannot connect to server. Please check your network.';
      }
      showToast(errorMessage, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Fetch all complaints from both endpoints
  const fetchAllComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let regularData = [];
      let regardingData = [];
      
      try {
        const regularResponse = await axios.get(`${API_URL}/complaints`, { headers });
        if (regularResponse.data.success && Array.isArray(regularResponse.data.data)) {
          regularData = regularResponse.data.data.map(complaint => transformRegularComplaint(complaint));
        }
      } catch (error) {
        console.error('Error fetching regular complaints:', error);
        if (error.code === 'ERR_NETWORK') {
          showToast('Cannot connect to backend server. Please make sure the server is running.', 'error');
          setBackendStatus('disconnected');
        }
      }
      
      try {
        const regardingResponse = await axios.get(`${API_URL}/complaint-regarding`, { headers });
        if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
          regardingData = regardingResponse.data.data.map(complaint => transformRegardingComplaint(complaint));
        }
      } catch (error) {
        console.error('Error fetching regarding complaints:', error);
      }
      
      setRegularComplaints(regularData);
      setRegardingComplaints(regardingData);
      
      const combined = [...regularData, ...regardingData];
      combined.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
      setAllComplaints(combined);
      
      setBackendStatus('connected');
      
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setBackendStatus('disconnected');
      setAllComplaints([]);
      setRegularComplaints([]);
      setRegardingComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, showToast]);

  // Transform regular complaint data
  const transformRegularComplaint = (complaint) => ({
    id: complaint.id,
    complaintId: complaint.id,
    ticketId: complaint.complaint_number || `NTC-${complaint.id}`,
    name: complaint.name || 'N/A',
    enName: complaint.name || 'N/A',
    email: complaint.email || 'N/A',
    phone: complaint.phone || 'N/A',
    category: complaint.nature_of_complaint || 'general',
    category_np: getCategoryNepali(complaint.nature_of_complaint),
    category_en: complaint.nature_of_complaint || 'General',
    subject: null,
    description: complaint.description || 'N/A',
    enDescription: complaint.description || 'N/A',
    status: mapStatus(complaint.status),
    rawStatus: complaint.status,
    date: formatNepaliDate(complaint.created_at),
    enDate: formatEnglishDate(complaint.created_at),
    channel: 'वेबसाइट पोर्टल',
    enChannel: 'Website Portal',
    priority: mapPriority(complaint.priority),
    assignedTo: complaint.assigned_to || 'Not Assigned',
    assignedToName: complaint.assigned_to_name || complaint.assigned_to || 'Not Assigned',
    enAssignedTo: complaint.assigned_to || 'Not Assigned',
    assignedBy: complaint.assigned_by || null,
    assignedByName: complaint.assigned_by_name || 'System',
    resolvedDate: complaint.resolved_at ? formatNepaliDate(complaint.resolved_at) : null,
    enResolvedDate: complaint.resolved_at ? formatEnglishDate(complaint.resolved_at) : null,
    submittedDate: complaint.created_at,
    referenceNumber: null,
    landmark: null,
    address: null,
    preferredContact: null,
    type: 'regular',
    complaintType: 'regular'
  });

  // Transform complaint regarding data
  const transformRegardingComplaint = (complaint) => ({
    id: complaint.id,
    complaintId: complaint.id,
    ticketId: complaint.complaint_number || `CR-${complaint.id}`,
    name: complaint.name || 'N/A',
    enName: complaint.name || 'N/A',
    email: complaint.email || 'N/A',
    phone: complaint.phone || 'N/A',
    category: complaint.complaint_type || 'general',
    category_np: getCategoryNepali(complaint.complaint_type),
    category_en: complaint.complaint_type || 'General',
    subject: complaint.subject || null,
    description: complaint.description || 'N/A',
    enDescription: complaint.description || 'N/A',
    status: mapStatus(complaint.status),
    rawStatus: complaint.status,
    date: formatNepaliDate(complaint.created_at),
    enDate: formatEnglishDate(complaint.created_at),
    channel: complaint.preferred_contact === 'phone' ? 'फोन' : complaint.preferred_contact === 'email' ? 'इमेल' : 'एसएमएस',
    enChannel: complaint.preferred_contact === 'phone' ? 'Phone' : complaint.preferred_contact === 'email' ? 'Email' : 'SMS',
    priority: mapPriority(complaint.priority),
    assignedTo: complaint.assigned_to || 'Not Assigned',
    assignedToName: complaint.assigned_to_name || complaint.assigned_to || 'Not Assigned',
    enAssignedTo: complaint.assigned_to || 'Not Assigned',
    assignedBy: complaint.assigned_by || null,
    assignedByName: complaint.assigned_by_name || 'System',
    resolvedDate: complaint.resolved_at ? formatNepaliDate(complaint.resolved_at) : null,
    enResolvedDate: complaint.resolved_at ? formatEnglishDate(complaint.resolved_at) : null,
    submittedDate: complaint.created_at,
    referenceNumber: complaint.reference_number || null,
    landmark: complaint.landmark || null,
    address: complaint.address || null,
    preferredContact: complaint.preferred_contact || null,
    type: 'regarding',
    complaintType: 'regarding'
  });

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

  // Map status from backend to component status
  const mapStatus = (status) => {
    if (!status) return 'pending';
    const statusMap = {
      'pending': 'pending',
      'Pending': 'pending',
      'in-progress': 'in-progress',
      'in progress': 'in-progress',
      'In Progress': 'in-progress',
      'inprogress': 'in-progress',
      'resolved': 'resolved',
      'Resolved': 'resolved',
      'Closed': 'resolved',
      'closed': 'resolved',
      'review': 'review',
      'Under Review': 'review',
      'under review': 'review',
      'Rejected': 'rejected',
      'rejected': 'rejected'
    };
    return statusMap[status] || 'pending';
  };

  // Map priority from backend to component priority
  const mapPriority = (priority) => {
    if (!priority) return 'medium';
    const priorityMap = {
      'high': 'high',
      'High': 'high',
      'Urgent': 'high',
      'urgent': 'high',
      'medium': 'medium',
      'Medium': 'medium',
      'low': 'low',
      'Low': 'low'
    };
    return priorityMap[priority] || 'medium';
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

  // Update complaint status
  const updateComplaintStatus = async (complaintId, newStatusValue, complaintType) => {
    if (!complaintId || !newStatusValue) {
      showToast('Invalid complaint ID or status', 'error');
      return;
    }
    
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast('Authentication token not found', 'error');
        return;
      }
      
      let backendStatus;
      switch (newStatusValue) {
        case 'pending':
          backendStatus = 'pending';
          break;
        case 'in-progress':
          backendStatus = 'in-progress';
          break;
        case 'review':
          backendStatus = 'review';
          break;
        case 'resolved':
          backendStatus = 'resolved';
          break;
        case 'rejected':
          backendStatus = 'rejected';
          break;
        default:
          backendStatus = 'pending';
      }
      
      let endpoint;
      if (complaintType === 'regular') {
        endpoint = `${API_URL}/admin/complaints/${complaintId}/status`;
      } else {
        endpoint = `${API_URL}/admin/complaint-regarding/${complaintId}/status`;
      }
      
      const response = await axios.patch(
        endpoint,
        { status: backendStatus },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        const updateComplaint = (complaint) => {
          const complaintIdToCheck = complaint.id || complaint.complaintId;
          if (complaintIdToCheck === complaintId) {
            return { 
              ...complaint, 
              status: newStatusValue, 
              rawStatus: backendStatus 
            };
          }
          return complaint;
        };
        
        setRegularComplaints(prev => prev.map(updateComplaint));
        setRegardingComplaints(prev => prev.map(updateComplaint));
        setAllComplaints(prev => prev.map(updateComplaint));
        
        showToast(language === 'np' ? 'स्थिति सफलतापूर्वक अपडेट गरियो' : 'Status updated successfully', 'success');
        setShowStatusModal(false);
        setSelectedComplaint(null);
        setNewStatus('');
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      let errorMessage = language === 'np' 
        ? 'स्थिति अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Failed to update status. Please try again.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = language === 'np' 
            ? 'प्रमाणीकरण असफल। कृपया पुन: लगइन गर्नुहोस्।' 
            : 'Authentication failed. Please login again.';
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setTimeout(() => navigate('/admin-login'), 1500);
        } else if (error.response.status === 403) {
          errorMessage = language === 'np'
            ? 'तपाईंलाई यो कार्य गर्न अनुमति छैन।'
            : 'You do not have permission to perform this action.';
        } else if (error.response.status === 404) {
          errorMessage = language === 'np'
            ? 'गुनासो फेला परेन।'
            : 'Complaint not found.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Open assign modal
  const openAssignModal = (complaint) => {
    setSelectedComplaintForAssign(complaint);
    setSelectedStaff('');
    setShowAssignModal(true);
    fetchStaffList();
  };

  // Check authentication and fetch data
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      fetchAllComplaints();
    }
  }, [navigate, fetchAllComplaints]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, typeFilter]);

  const content = {
    np: {
      complaintsManagement: 'गुनासो व्यवस्थापन',
      allComplaints: 'सबै गुनासोहरू',
      searchPlaceholder: 'टिकेट नम्बर, नाम वा फोन नम्बरले खोज्नुहोस्...',
      filterByStatus: 'स्थिति अनुसार फिल्टर',
      filterByPriority: 'प्राथमिकता अनुसार फिल्टर',
      filterByType: 'प्रकार अनुसार फिल्टर',
      allTypes: 'सबै प्रकार',
      regularComplaints: 'साधारण गुनासो',
      regardingComplaints: 'गुनासो सम्बन्धी',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      category: 'प्रकार',
      subject: 'विषय',
      date: 'मिति',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      updateStatus: 'स्थिति अपडेट गर्नुहोस्',
      assignToStaff: 'स्टाफ तोक्नुहोस्',
      complaintDetails: 'गुनासोको विवरण',
      description: 'विवरण',
      channel: 'च्यानल',
      email: 'इमेल',
      phone: 'फोन',
      registeredDate: 'दर्ता मिति',
      resolvedDate: 'समाधान मिति',
      assignedTo: 'तोकिएको टोली',
      close: 'बन्द गर्नुहोस्',
      all: 'सबै',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      underReview: 'समीक्षामा',
      rejected: 'अस्वीकृत',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      noComplaintsFound: 'कुनै गुनासो फेला परेन',
      tryAdjustingFilters: 'कृपया फिल्टर समायोजन गर्नुहोस्',
      totalComplaints: 'कुल गुनासो',
      pendingCount: 'विचाराधीन',
      inProgressCount: 'प्रगतिमा',
      resolvedCount: 'समाधान',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      updateStatusTitle: 'स्थिति अपडेट गर्नुहोस्',
      selectNewStatus: 'नयाँ स्थिति चयन गर्नुहोस्',
      cancel: 'रद्द गर्नुहोस्',
      update: 'अपडेट गर्नुहोस्',
      updating: 'अपडेट हुँदै...',
      referenceNo: 'सन्दर्भ नम्बर',
      landmark: 'नजिकैको चिन्ह',
      address: 'ठेगाना',
      preferredContact: 'सम्पर्कको माध्यम',
      complaintType: 'गुनासो प्रकार',
      regular: 'साधारण',
      regarding: 'सम्बन्धी',
      complaintInfo: 'गुनासो जानकारी',
      complainantInfo: 'उजुरीकर्ताको जानकारी',
      statusInfo: 'स्थिति जानकारी',
      updateSuccess: 'स्थिति सफलतापूर्वक अपडेट गरियो',
      updateError: 'स्थिति अपडेट गर्न असफल',
      selectStaff: 'स्टाफ चयन गर्नुहोस्',
      assign: 'तोक्नुहोस्',
      assigning: 'तोक्दै...',
      staffName: 'स्टाफको नाम',
      staffEmail: 'स्टाफको इमेल',
      staffRole: 'भूमिका'
    },
    en: {
      complaintsManagement: 'Complaints Management',
      allComplaints: 'All Complaints',
      searchPlaceholder: 'Search by ticket number, name or phone...',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      filterByType: 'Filter by Type',
      allTypes: 'All Types',
      regularComplaints: 'Regular Complaints',
      regardingComplaints: 'Complaint Regarding',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      category: 'Category',
      subject: 'Subject',
      date: 'Date',
      status: 'Status',
      priority: 'Priority',
      actions: 'Actions',
      viewDetails: 'View Details',
      updateStatus: 'Update Status',
      assignToStaff: 'Assign to Staff',
      complaintDetails: 'Complaint Details',
      description: 'Description',
      channel: 'Channel',
      email: 'Email',
      phone: 'Phone',
      registeredDate: 'Registered Date',
      resolvedDate: 'Resolved Date',
      assignedTo: 'Assigned To',
      close: 'Close',
      all: 'All',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      underReview: 'Under Review',
      rejected: 'Rejected',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      noComplaintsFound: 'No complaints found',
      tryAdjustingFilters: 'Please try adjusting your filters',
      totalComplaints: 'Total Complaints',
      pendingCount: 'Pending',
      inProgressCount: 'In Progress',
      resolvedCount: 'Resolved',
      loading: 'Loading...',
      refresh: 'Refresh',
      updateStatusTitle: 'Update Status',
      selectNewStatus: 'Select New Status',
      cancel: 'Cancel',
      update: 'Update',
      updating: 'Updating...',
      referenceNo: 'Reference Number',
      landmark: 'Landmark',
      address: 'Address',
      preferredContact: 'Preferred Contact',
      complaintType: 'Complaint Type',
      regular: 'Regular',
      regarding: 'Regarding',
      complaintInfo: 'Complaint Information',
      complainantInfo: 'Complainant Information',
      statusInfo: 'Status Information',
      updateSuccess: 'Status updated successfully',
      updateError: 'Failed to update status',
      selectStaff: 'Select Staff',
      assign: 'Assign',
      assigning: 'Assigning...',
      staffName: 'Staff Name',
      staffEmail: 'Staff Email',
      staffRole: 'Role'
    }
  };

  const t = content[language];

  const getStatusClass = (status) => {
    const classes = { 
      pending: 'status-pending', 
      'in-progress': 'status-progress', 
      resolved: 'status-resolved',
      review: 'status-review',
      rejected: 'status-rejected'
    };
    return classes[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    if (language === 'np') {
      const statusTexts = {
        pending: 'विचाराधीन',
        'in-progress': 'प्रगतिमा',
        resolved: 'समाधान',
        review: 'समीक्षामा',
        rejected: 'अस्वीकृत'
      };
      return statusTexts[status] || status;
    } else {
      const statusTexts = {
        pending: 'Pending',
        'in-progress': 'In Progress',
        resolved: 'Resolved',
        review: 'Under Review',
        rejected: 'Rejected'
      };
      return statusTexts[status] || status;
    }
  };

  const getPriorityClass = (priority) => {
    const classes = { 
      high: 'priority-high', 
      medium: 'priority-medium', 
      low: 'priority-low' 
    };
    return classes[priority] || 'priority-medium';
  };

  const getPriorityText = (priority) => {
    if (language === 'np') {
      const priorityTexts = {
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'न्यून'
      };
      return priorityTexts[priority] || priority;
    } else {
      const priorityTexts = {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
      };
      return priorityTexts[priority] || priority;
    }
  };

  const getCategoryText = (complaint) => {
    return language === 'np' ? complaint.category_np : complaint.category_en;
  };

  const getDate = (complaint) => {
    return language === 'np' ? complaint.date : complaint.enDate;
  };

  const getChannel = (complaint) => {
    return language === 'np' ? complaint.channel : complaint.enChannel;
  };

  const getAssignedTo = (complaint) => {
    if (language === 'np') {
      return complaint.assignedToName !== 'Not Assigned' ? complaint.assignedToName : complaint.assignedTo;
    }
    return complaint.assignedToName !== 'Not Assigned' ? complaint.assignedToName : complaint.assignedTo;
  };

  const getComplaintTypeText = (complaint) => {
    if (language === 'np') {
      return complaint.type === 'regular' ? 'साधारण' : 'सम्बन्धी';
    }
    return complaint.type === 'regular' ? 'Regular' : 'Regarding';
  };

  const getComplaintTypeClass = (complaint) => {
    return complaint.type === 'regular' ? 'type-regular' : 'type-regarding';
  };

  // Filter complaints
  const filteredComplaints = allComplaints.filter(complaint => {
    const searchMatch = searchTerm === '' || 
      complaint.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.enName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.phone?.includes(searchTerm);
    
    const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const typeMatch = typeFilter === 'all' || complaint.type === typeFilter;
    
    return searchMatch && statusMatch && priorityMatch && typeMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    document.body.style.overflow = 'unset';
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setShowStatusModal(true);
    setShowModal(false);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedComplaint(null);
    setNewStatus('');
    document.body.style.overflow = 'unset';
  };

  const handleStatusUpdate = () => {
    if (selectedComplaint && newStatus && newStatus !== selectedComplaint.status) {
      const complaintId = selectedComplaint.id || selectedComplaint.complaintId;
      if (!complaintId) {
        showToast('Invalid complaint ID', 'error');
        return;
      }
      updateComplaintStatus(complaintId, newStatus, selectedComplaint.type);
      closeStatusModal();
    } else if (newStatus === selectedComplaint?.status) {
      closeStatusModal();
    }
  };

  // Refresh data
  const refreshData = () => {
    setLoading(true);
    setCurrentPage(1);
    fetchAllComplaints();
    showToast(language === 'np' ? 'डाटा रिफ्रेस गरियो' : 'Data refreshed', 'info');
  };

  // Get statistics
  const stats = {
    total: allComplaints.length,
    pending: allComplaints.filter(c => c.status === 'pending').length,
    inProgress: allComplaints.filter(c => c.status === 'in-progress').length,
    resolved: allComplaints.filter(c => c.status === 'resolved').length
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
    <div className="admin-complaints">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>✕</button>
        </div>
      )}

      <Header language={language} setLanguage={setLanguage} adminName="Admin" userRole="admin" />
      
      {backendStatus === 'disconnected' && (
        <div className="backend-warning">
          ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। कृपया सर्भर सुरु गर्नुहोस्।' : 'Backend server not connected. Please start the server.'}
        </div>
      )}
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} userRole="admin" />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>{t.complaintsManagement}</h1>
                <p>{t.allComplaints}</p>
              </div>
              <button className="refresh-btn" onClick={refreshData}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-box-icon blue">📋</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.total}</div>
                  <div className="stat-box-label">{t.totalComplaints}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon orange">⏳</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.pending}</div>
                  <div className="stat-box-label">{t.pendingCount}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon yellow">🔄</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.inProgress}</div>
                  <div className="stat-box-label">{t.inProgressCount}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-icon green">✅</div>
                <div className="stat-box-info">
                  <div className="stat-box-value">{stats.resolved}</div>
                  <div className="stat-box-label">{t.resolvedCount}</div>
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
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                )}
              </div>
              <div className="filter-group">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.allTypes}</option>
                  <option value="regular">{t.regularComplaints}</option>
                  <option value="regarding">{t.regardingComplaints}</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="in-progress">{t.inProgress}</option>
                  <option value="review">{t.underReview}</option>
                  <option value="rejected">{t.rejected}</option>
                  <option value="resolved">{t.resolved}</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="high">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="low">{t.low}</option>
                </select>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="table-wrapper">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>{t.ticketId}</th>
                    <th>{t.complainant}</th>
                    <th>{t.category}</th>
                    <th>{t.subject}</th>
                    <th>{t.date}</th>
                    <th>{t.status}</th>
                    <th>{t.priority}</th>
                    <th>{t.complaintType}</th>
                    <th>{t.assignedTo}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.length > 0 ? (
                    paginatedComplaints.map((complaint, idx) => (
                      <tr key={`${complaint.type}-${complaint.id}-${idx}`}>
                        <td className="ticket-id">{complaint.ticketId}</td>
                        <td>
                          <div className="complainant-info">
                            <strong>{language === 'np' ? complaint.name : complaint.enName}</strong>
                            <small>{complaint.phone}</small>
                          </div>
                        </td>
                        <td>{getCategoryText(complaint)}</td>
                        <td>{complaint.subject || '-'}</td>
                        <td>{getDate(complaint)}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                            {getStatusText(complaint.status)}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                            {getPriorityText(complaint.priority)}
                          </span>
                        </td>
                        <td>
                          <span className={`type-badge ${getComplaintTypeClass(complaint)}`}>
                            {getComplaintTypeText(complaint)}
                          </span>
                        </td>
                        <td>{getAssignedTo(complaint)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-view" 
                              onClick={() => openModal(complaint)}
                              title={t.viewDetails}
                            >
                              👁️ {t.viewDetails}
                            </button>
                            <button 
                              className="btn-update-status" 
                              onClick={() => openStatusModal(complaint)}
                              title={t.updateStatus}
                            >
                              🔄 {t.updateStatus}
                            </button>
                            <button 
                              className="btn-assign" 
                              onClick={() => openAssignModal(complaint)}
                              title={t.assignToStaff}
                            >
                              👥 {t.assignToStaff}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-data">
                      <td colSpan="10">
                        <div className="no-data-content">
                          <span className="no-data-icon">📭</span>
                          <p>{t.noComplaintsFound}</p>
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

      {/* Complaint Details Modal */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {t.complaintDetails}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>📌 {t.complaintInfo}</h4>
                <div className="detail-row">
                  <label>{t.ticketId}:</label>
                  <span>{selectedComplaint.ticketId}</span>
                </div>
                <div className="detail-row">
                  <label>{t.complaintType}:</label>
                  <span className={`type-badge ${getComplaintTypeClass(selectedComplaint)}`}>
                    {getComplaintTypeText(selectedComplaint)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.category}:</label>
                  <span>{getCategoryText(selectedComplaint)}</span>
                </div>
                {selectedComplaint.subject && (
                  <div className="detail-row">
                    <label>{t.subject}:</label>
                    <span>{selectedComplaint.subject}</span>
                  </div>
                )}
                {selectedComplaint.referenceNumber && (
                  <div className="detail-row">
                    <label>{t.referenceNo}:</label>
                    <span>{selectedComplaint.referenceNumber}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>👤 {t.complainantInfo}</h4>
                <div className="detail-row">
                  <label>{t.complainant}:</label>
                  <span>{language === 'np' ? selectedComplaint.name : selectedComplaint.enName}</span>
                </div>
                <div className="detail-row">
                  <label>{t.email}:</label>
                  <span>{selectedComplaint.email}</span>
                </div>
                <div className="detail-row">
                  <label>{t.phone}:</label>
                  <span>{selectedComplaint.phone}</span>
                </div>
                {selectedComplaint.address && (
                  <div className="detail-row">
                    <label>{t.address}:</label>
                    <span>{selectedComplaint.address}</span>
                  </div>
                )}
                {selectedComplaint.landmark && (
                  <div className="detail-row">
                    <label>{t.landmark}:</label>
                    <span>{selectedComplaint.landmark}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>📝 {t.description}</h4>
                <div className="detail-row full-width">
                  <p className="description-text">{language === 'np' ? selectedComplaint.description : selectedComplaint.enDescription}</p>
                </div>
              </div>

              <div className="detail-section">
                <h4>📊 {t.statusInfo}</h4>
                <div className="detail-row">
                  <label>{t.status}:</label>
                  <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>
                    {getStatusText(selectedComplaint.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.priority}:</label>
                  <span className={`priority-badge ${getPriorityClass(selectedComplaint.priority)}`}>
                    {getPriorityText(selectedComplaint.priority)}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t.registeredDate}:</label>
                  <span>{getDate(selectedComplaint)}</span>
                </div>
                {selectedComplaint.resolvedDate && (
                  <div className="detail-row">
                    <label>{t.resolvedDate}:</label>
                    <span>{language === 'np' ? selectedComplaint.resolvedDate : selectedComplaint.enResolvedDate}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>{t.channel}:</label>
                  <span>{getChannel(selectedComplaint)}</span>
                </div>
                <div className="detail-row">
                  <label>{t.assignedTo}:</label>
                  <span>{getAssignedTo(selectedComplaint)}</span>
                </div>
                {selectedComplaint.preferredContact && (
                  <div className="detail-row">
                    <label>{t.preferredContact}:</label>
                    <span>{selectedComplaint.preferredContact}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-update-status-modal" onClick={() => openStatusModal(selectedComplaint)}>
                🔄 {t.updateStatus}
              </button>
              <button className="btn-assign-modal" onClick={() => openAssignModal(selectedComplaint)}>
                👥 {t.assignToStaff}
              </button>
              <button className="btn-close" onClick={closeModal}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔄 {t.updateStatusTitle}</h2>
              <button className="modal-close" onClick={closeStatusModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>{t.ticketId}:</label>
                <span>{selectedComplaint.ticketId}</span>
              </div>
              <div className="detail-row">
                <label>{t.complainant}:</label>
                <span>{language === 'np' ? selectedComplaint.name : selectedComplaint.enName}</span>
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
                  <option value="review">{t.underReview}</option>
                  <option value="resolved">{t.resolved}</option>
                  <option value="rejected">{t.rejected}</option>
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
                disabled={updatingStatus || newStatus === selectedComplaint.status}
              >
                {updatingStatus ? t.updating : t.update}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign to Staff Modal */}
      {showAssignModal && selectedComplaintForAssign && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👥 {t.assignToStaff}</h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>{t.ticketId}:</label>
                <span>{selectedComplaintForAssign.ticketId}</span>
              </div>
              <div className="detail-row">
                <label>{t.complainant}:</label>
                <span>{selectedComplaintForAssign.name}</span>
              </div>
              <div className="form-group">
                <label>{t.selectStaff} <span className="required">*</span></label>
                {loadingStaff ? (
                  <div className="loading-staff">
                    <div className="spinner-small"></div>
                    <span>{language === 'np' ? 'स्टाफ लोड हुँदै...' : 'Loading staff...'}</span>
                  </div>
                ) : (
                  <select 
                    value={selectedStaff} 
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="staff-select"
                  >
                    <option value="">{language === 'np' ? '-- स्टाफ चयन गर्नुहोस् --' : '-- Select Staff --'}</option>
                    {staffList.length > 0 ? (
                      staffList.map(staff => (
                        <option 
                          key={staff.id} 
                          value={staff.id}
                        >
                          {language === 'np' ? staff.name : staff.name_en || staff.name} - {staff.email} ({staff.department || 'Staff'})
                        </option>
                      ))
                    ) : (
                      <option disabled value="">
                        {language === 'np' ? 'कुनै स्टाफ उपलब्ध छैन' : 'No staff available'}
                      </option>
                    )}
                  </select>
                )}
                {staffList.length === 0 && !loadingStaff && (
                  <div className="no-staff-warning">
                    <span className="warning-icon">⚠️</span>
                    <span className="warning-text">
                      {language === 'np' 
                        ? 'कुनै स्टाफ प्रयोगकर्ता फेला परेन। कृपया पहिले प्रयोगकर्ता व्यवस्थापनबाट स्टाफ थप्नुहोस्।' 
                        : 'No staff users found. Please add staff users from user management first.'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAssignModal(false)}>
                {t.cancel}
              </button>
              <button 
                className="btn-assign" 
                onClick={() => {
                  if (selectedStaff) {
                    const selectedStaffData = staffList.find(s => s.id === parseInt(selectedStaff));
                    if (!selectedStaffData || !selectedStaffData.id || !selectedStaffData.email) {
                      showToast(language === 'np' ? 'अमान्य स्टाफ डाटा' : 'Invalid staff data', 'error');
                      return;
                    }
                    assignToStaff(
                      selectedComplaintForAssign.id, 
                      selectedStaffData.id, 
                      selectedStaffData.email, 
                      language === 'np' ? selectedStaffData.name : selectedStaffData.name_en || selectedStaffData.name,
                      selectedComplaintForAssign.type
                    );
                  } else {
                    showToast(language === 'np' ? 'कृपया स्टाफ चयन गर्नुहोस्' : 'Please select a staff member', 'warning');
                  }
                }}
                disabled={!selectedStaff || updatingStatus || loadingStaff || staffList.length === 0}
              >
                {updatingStatus ? t.assigning : t.assign}
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

        .admin-complaints {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Toast Notification */
        .toast-notification {
          position: fixed;
          top: 200px;
          right: 20px;
          z-index: 3000;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: slideInRight 0.3s ease;
          max-width: 350px;
        }
        
        .toast-notification.success { border-left: 4px solid #10b981; background: #ecfdf5; }
        .toast-notification.error { border-left: 4px solid #ef4444; background: #fef2f2; }
        .toast-notification.info { border-left: 4px solid #3b82f6; background: #eff6ff; }
        
        .toast-icon { font-size: 1.2rem; }
        .toast-message { font-size: 0.85rem; color: #1f2937; flex: 1; }
        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 1rem;
          padding: 0 4px;
        }
        .toast-close:hover { color: #666; }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .backend-warning {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: #f59e0b;
          color: white;
          padding: 10px;
          text-align: center;
          z-index: 100;
          font-size: 0.85rem;
          font-weight: 500;
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
          min-height: calc(100vh - 70px);
          margin-top: 70px;
          position: relative;
        }

        .sidebar-container {
          position: fixed;
          top: 70px;
          left: 0;
          width: 260px;
          height: calc(100vh - 70px);
          background: white;
          border-right: 1px solid #e2e8f0;
          z-index: 100;
          overflow-y: auto;
        }

        .main-container {
          flex: 1;
          margin-left: 260px;
          width: calc(100% - 260px);
          min-height: calc(100vh - 70px);
          overflow-x: auto;
        }

        .main-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
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
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-box {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .stat-box-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }

        .stat-box-icon.blue { background: #e3f2fd; color: #1565c0; }
        .stat-box-icon.orange { background: #fff3e0; color: #f57c00; }
        .stat-box-icon.yellow { background: #fff8e1; color: #f9a825; }
        .stat-box-icon.green { background: #e8f5e9; color: #2e7d32; }

        .stat-box-info { flex: 1; }
        .stat-box-value { font-size: 1.6rem; font-weight: 700; color: #0f172a; }
        .stat-box-label { font-size: 0.75rem; color: #64748b; margin-top: 4px; }

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
          position: relative;
          min-width: 250px;
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

        .clear-search {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: #9ca3af;
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
        }

        .table-wrapper {
          overflow-x: auto;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .complaints-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .complaints-table th,
        .complaints-table td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .complaints-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .complaints-table td {
          color: #334155;
          font-size: 0.85rem;
        }

        .complaints-table tr:hover {
          background: #fafcff;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #3b82f6;
        }

        .complainant-info strong { display: block; }
        .complainant-info small { font-size: 0.7rem; color: #64748b; }

        .status-badge, .priority-badge, .type-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .status-review { background: #e0e7ff; color: #4f46e5; }
        .status-rejected { background: #fee2e2; color: #dc2626; }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .type-regular { background: #dbeafe; color: #1e40af; }
        .type-regarding { background: #fef3c7; color: #92400e; }

        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .btn-view, .btn-update-status, .btn-assign {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          font-weight: 500;
          white-space: nowrap;
        }

        .btn-view { 
          background: linear-gradient(135deg, #3b82f6, #2563eb); 
          color: white; 
        }
        .btn-update-status { 
          background: linear-gradient(135deg, #10b981, #059669); 
          color: white; 
        }
        .btn-assign { 
          background: linear-gradient(135deg, #8b5cf6, #7c3aed); 
          color: white; 
        }

        .btn-view:hover, .btn-update-status:hover, .btn-assign:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .btn-view:active, .btn-update-status:active, .btn-assign:active {
          transform: translateY(0);
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

        .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pagination-info { color: #64748b; font-size: 0.85rem; }

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
          max-width: 650px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
        }

        .status-modal, .assign-modal {
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
          z-index: 10;
        }

        .modal-header h2 { font-size: 1.2rem; color: #0f172a; }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #94a3b8;
        }
        .modal-close:hover { color: #475569; }

        .modal-body { padding: 24px; }
        
        .detail-section { margin-bottom: 24px; }
        .detail-section h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 12px;
          flex-wrap: wrap;
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
        
        .detail-row.full-width { flex-direction: column; }
        .detail-row.full-width label { width: 100%; margin-bottom: 8px; }
        .description-text { line-height: 1.6; white-space: pre-wrap; }

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

        .staff-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
          margin-top: 8px;
        }

        .loading-staff {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          color: #1565c0;
          margin-top: 8px;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #e2e8f0;
          border-top-color: #1565c0;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .no-staff-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 10px;
          background: #fef3c7;
          border-radius: 8px;
          border-left: 3px solid #f59e0b;
        }

        .warning-icon {
          font-size: 1rem;
        }

        .warning-text {
          font-size: 0.75rem;
          color: #92400e;
          flex: 1;
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
          flex-wrap: wrap;
        }

        .btn-close, .btn-update-status-modal, .btn-assign-modal, .btn-cancel, .btn-update, .btn-assign {
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
        }
        
        .btn-close { background: #e2e8f0; color: #475569; }
        .btn-cancel { background: #e2e8f0; color: #475569; }
        .btn-update { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
        .btn-update-status-modal { background: linear-gradient(135deg, #10b981, #059669); color: white; }
        .btn-assign-modal { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
        
        .btn-update:disabled, .btn-assign:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 1200px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .action-buttons { flex-direction: column; }
          .btn-view, .btn-update-status, .btn-assign { width: 100%; justify-content: center; }
        }

        @media (max-width: 768px) {
          .sidebar-container { display: none; }
          .main-container { margin-left: 0; width: 100%; }
          .content-wrapper { padding: 16px; }
          .filters-bar { flex-direction: column; }
          .filter-group { width: 100%; flex-direction: column; }
          .filter-select { width: 100%; }
          .stats-row { grid-template-columns: 1fr; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .action-buttons { flex-direction: column; width: 100%; }
          .btn-view, .btn-update-status, .btn-assign { 
            width: 100%; 
            justify-content: center;
            padding: 10px 16px;
          }
          .detail-row { flex-direction: column; }
          .detail-row label { width: 100%; margin-bottom: 4px; }
          .modal-footer { flex-direction: column; }
          .modal-footer button { width: 100%; }
        }

        @media (max-width: 480px) {
          .complaints-table th, .complaints-table td { padding: 8px; font-size: 0.7rem; }
          .btn-view, .btn-update-status, .btn-assign { 
            padding: 8px 12px; 
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminComplaints;