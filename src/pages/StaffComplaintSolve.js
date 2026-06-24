// src/pages/StaffComplaintSolve.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffComplaintSolve = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { complaint: initialComplaint } = location.state || {};
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditMode, setIsEditMode] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

  const [complaint, setComplaint] = useState(null);
  const [resolution, setResolution] = useState('');
  const [status, setStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updateHistory, setUpdateHistory] = useState([]);
  const [editFields, setEditFields] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    landmark: '',
    description: ''
  });

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

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

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('staffToken') || localStorage.getItem('token');
  };

  // Get API URL with fallback
  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Transform complaint data to consistent format
  const transformComplaintData = (complaint) => {
    if (!complaint) return null;
    
    try {
      const id = complaint.id || complaint._id;
      if (!id) return null;
      
      return {
        id: id,
        _id: complaint._id || id,
        ticketId: complaint.complaint_number || complaint.complaintNumber || complaint.ticketId || `NTC-${id}`,
        name: complaint.name || complaint.complainantName || 'N/A',
        enName: complaint.name_en || complaint.nameEn || complaint.name || 'N/A',
        email: complaint.email || 'N/A',
        phone: complaint.phone || 'N/A',
        category: complaint.nature_of_complaint || complaint.category || 'general',
        category_np: complaint.categoryNp || getCategoryNepali(complaint.nature_of_complaint || complaint.category),
        category_en: complaint.nature_of_complaint || complaint.category || 'General',
        description: complaint.description || complaint.complaint || 'N/A',
        enDescription: complaint.description_en || complaint.complaintEn || complaint.description || complaint.complaint || 'N/A',
        status: mapStatus(complaint.status),
        date: complaint.date || formatDate(complaint.created_at || complaint.createdAt || complaint.submittedDate),
        enDate: complaint.enDate || formatEnglishDate(complaint.created_at || complaint.createdAt || complaint.submittedDate),
        channel: complaint.channel || 'वेबसाइट पोर्टल',
        enChannel: complaint.enChannel || 'Website Portal',
        priority: mapPriority(complaint.priority),
        address: complaint.address || '',
        landmark: complaint.landmark || '',
        resolution: complaint.resolution || '',
        actionTaken: complaint.action_taken || complaint.actionTaken || '',
        updateHistory: complaint.updateHistory || [],
        assignedTo: complaint.assigned_to || complaint.assignedTo || '',
        assignedBy: complaint.assigned_by || complaint.assignedBy || '',
        assignedAt: complaint.assigned_at || complaint.assignedAt || ''
      };
    } catch (error) {
      console.error('Error transforming complaint data:', error);
      return null;
    }
  };

  const getCategoryNepali = (category) => {
    const categories = {
      'internet': 'इन्टरनेट',
      'recharge': 'रिचार्ज',
      'activation': 'सक्रियता',
      'billing': 'बिलिङ',
      'network': 'नेटवर्क',
      'technical': 'प्राविधिक',
      'general': 'सामान्य'
    };
    return categories[category] || 'सामान्य';
  };

  const mapStatus = (status) => {
    if (!status) return 'pending';
    const statusMap = {
      'Pending': 'pending',
      'pending': 'pending',
      'In Progress': 'in-progress',
      'in-progress': 'in-progress',
      'Resolved': 'resolved',
      'resolved': 'resolved',
      'Closed': 'resolved',
      'closed': 'resolved',
      'Under Review': 'review',
      'review': 'review',
      'rejected': 'rejected'
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

  const formatDate = (date) => {
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

  // Fetch complaint details from API
  const fetchComplaintDetails = async (complaintId) => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const API_URL = getApiUrl();
      
      if (!complaintId) {
        throw new Error('No complaint ID provided');
      }
      
      console.log('Fetching complaint with ID:', complaintId);
      console.log('API URL:', `${API_URL}/complaints/${complaintId}`);
      
      const response = await axios.get(`${API_URL}/complaints/${complaintId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetch response:', response.data);
      
      // Extract complaint data from various response formats
      let complaintData = null;
      if (response.data) {
        if (response.data.success && response.data.data) {
          complaintData = response.data.data;
        } else if (response.data.success && response.data.complaint) {
          complaintData = response.data.complaint;
        } else if (response.data.data) {
          complaintData = response.data.data;
        } else if (response.data.id || response.data._id) {
          complaintData = response.data;
        }
      }
      
      if (complaintData && (complaintData.id || complaintData._id)) {
        const transformed = transformComplaintData(complaintData);
        if (transformed) {
          setComplaint(transformed);
          setStatus(transformed.status);
          if (transformed.resolution) setResolution(transformed.resolution);
          if (transformed.actionTaken) setActionTaken(transformed.actionTaken);
          if (transformed.updateHistory) setUpdateHistory(transformed.updateHistory);
          setEditFields({
            name: transformed.name || '',
            email: transformed.email || '',
            phone: transformed.phone || '',
            address: transformed.address || '',
            landmark: transformed.landmark || '',
            description: transformed.description || ''
          });
          
          localStorage.setItem('currentComplaint', JSON.stringify(transformed));
          setLoading(false);
          return;
        }
      }
      
      throw new Error('Complaint data not found in response');
      
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMsg = language === 'np' 
        ? '❌ गुनासो फेला परेन। कृपया पुन: प्रयास गर्नुहोस्।' 
        : '❌ Complaint not found. Please try again.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = language === 'np' 
            ? '❌ सत्र समाप्त भयो। कृपया पुन: लगइन गर्नुहोस्।' 
            : '❌ Session expired. Please login again.';
          setTimeout(() => navigate('/'), 2000);
        } else if (error.response.status === 404) {
          errorMsg = language === 'np' 
            ? '❌ गुनासो फेला परेन। कृपया सही टिकेट आईडी प्रयोग गर्नुहोस्।' 
            : '❌ Complaint not found. Please use a valid ticket ID.';
        } else if (error.response.status === 500) {
          errorMsg = language === 'np' 
            ? '❌ सर्भर त्रुटि। कृपया पछि प्रयास गर्नुहोस्।' 
            : '❌ Server error. Please try later.';
        }
      } else if (error.request) {
        errorMsg = language === 'np' 
          ? '❌ सर्भरमा जडान गर्न असफल। कृपया आफ्नो इन्टरनेट जाँच गर्नुहोस्।' 
          : '❌ Failed to connect to server. Please check your internet.';
      }
      
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setLoading(false);
    }
  };

  // Load complaint data
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
      return;
    }
    
    const loadComplaint = async () => {
      // Case 1: From location state
      if (initialComplaint && initialComplaint.id) {
        console.log('Using complaint from location state:', initialComplaint);
        const transformed = transformComplaintData(initialComplaint);
        if (transformed) {
          setComplaint(transformed);
          setStatus(transformed.status);
          if (transformed.resolution) setResolution(transformed.resolution);
          if (transformed.actionTaken) setActionTaken(transformed.actionTaken);
          if (transformed.updateHistory) setUpdateHistory(transformed.updateHistory);
          setEditFields({
            name: transformed.name || '',
            email: transformed.email || '',
            phone: transformed.phone || '',
            address: transformed.address || '',
            landmark: transformed.landmark || '',
            description: transformed.description || ''
          });
          setLoading(false);
          return;
        }
      }
      
      // Case 2: From URL params
      if (id) {
        console.log('Fetching complaint with ID from params:', id);
        await fetchComplaintDetails(id);
        return;
      }
      
      // Case 3: From localStorage
      const savedComplaint = localStorage.getItem('currentComplaint');
      if (savedComplaint) {
        try {
          const parsed = JSON.parse(savedComplaint);
          if (parsed && parsed.id) {
            console.log('Using complaint from localStorage:', parsed);
            const transformed = transformComplaintData(parsed);
            if (transformed) {
              setComplaint(transformed);
              setStatus(transformed.status);
              if (transformed.resolution) setResolution(transformed.resolution);
              if (transformed.actionTaken) setActionTaken(transformed.actionTaken);
              if (transformed.updateHistory) setUpdateHistory(transformed.updateHistory);
              setEditFields({
                name: transformed.name || '',
                email: transformed.email || '',
                phone: transformed.phone || '',
                address: transformed.address || '',
                landmark: transformed.landmark || '',
                description: transformed.description || ''
              });
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing saved complaint:', e);
        }
      }
      
      // No complaint found
      console.error('No complaint found. State:', { initialComplaint, id });
      setError(language === 'np' ? '❌ गुनासो फेला परेन' : '❌ Complaint not found');
      showToast(
        language === 'np' ? '❌ गुनासो फेला परेन' : '❌ Complaint not found',
        'error'
      );
      setLoading(false);
      setTimeout(() => navigate('/staff/complaints/assigned'), 3000);
    };
    
    loadComplaint();
  }, [navigate, initialComplaint, id]);

  // Handle complaint data update (edit complaint details)
  const handleUpdateComplaintData = async () => {
    if (!editFields.name.trim()) {
      const errorMsg = language === 'np' 
        ? 'कृपया उजुरीकर्ताको नाम प्रविष्ट गर्नुहोस्' 
        : 'Please enter complainant name';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }
    
    if (!editFields.email.trim()) {
      const errorMsg = language === 'np' 
        ? 'कृपया इमेल प्रविष्ट गर्नुहोस्' 
        : 'Please enter email';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }
    
    if (!editFields.phone.trim()) {
      const errorMsg = language === 'np' 
        ? 'कृपया फोन नम्बर प्रविष्ट गर्नुहोस्' 
        : 'Please enter phone number';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    if (!editFields.description.trim()) {
      const errorMsg = language === 'np' 
        ? 'कृपया गुनासो विवरण प्रविष्ट गर्नुहोस्' 
        : 'Please enter complaint description';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = getAuthToken();
      const API_URL = getApiUrl();
      const complaintId = complaint.id || complaint._id;
      
      const updateData = {
        name: editFields.name.trim(),
        email: editFields.email.trim(),
        phone: editFields.phone.trim(),
        address: editFields.address.trim(),
        landmark: editFields.landmark.trim(),
        description: editFields.description.trim()
      };

      console.log('Updating complaint with data:', updateData);
      console.log('Complaint ID:', complaintId);
      console.log('API URL:', `${API_URL}/complaints/${complaintId}`);

      const response = await axios.put(
        `${API_URL}/complaints/${complaintId}`,
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Update response:', response.data);
      
      // Extract updated data
      let updatedComplaint = null;
      if (response.data) {
        if (response.data.success && response.data.data) {
          updatedComplaint = response.data.data;
        } else if (response.data.success && response.data.complaint) {
          updatedComplaint = response.data.complaint;
        } else if (response.data.data) {
          updatedComplaint = response.data.data;
        } else if (response.data.id || response.data._id) {
          updatedComplaint = response.data;
        }
      }
      
      if (updatedComplaint) {
        const transformed = transformComplaintData(updatedComplaint);
        
        if (transformed) {
          setComplaint(prev => ({
            ...prev,
            ...transformed,
            name: editFields.name.trim(),
            email: editFields.email.trim(),
            phone: editFields.phone.trim(),
            address: editFields.address.trim(),
            landmark: editFields.landmark.trim(),
            description: editFields.description.trim()
          }));

          setEditFields({
            name: editFields.name.trim(),
            email: editFields.email.trim(),
            phone: editFields.phone.trim(),
            address: editFields.address.trim(),
            landmark: editFields.landmark.trim(),
            description: editFields.description.trim()
          });

          // Update localStorage
          const updatedComplaintData = {
            ...complaint,
            ...transformed,
            name: editFields.name.trim(),
            email: editFields.email.trim(),
            phone: editFields.phone.trim(),
            address: editFields.address.trim(),
            landmark: editFields.landmark.trim(),
            description: editFields.description.trim()
          };
          localStorage.setItem('currentComplaint', JSON.stringify(updatedComplaintData));

          const successMsg = language === 'np' 
            ? '✅ गुनासो विवरण सफलतापूर्वक अपडेट गरियो' 
            : '✅ Complaint details updated successfully';
          setSuccess(successMsg);
          showToast(successMsg, 'success');

          setIsEditMode(false);

          setTimeout(() => {
            navigate('/staff/complaints/assigned', { 
              state: { 
                updated: true, 
                complaintId: complaintId,
                message: successMsg
              }
            });
          }, 2000);
        } else {
          throw new Error('Failed to transform complaint data');
        }
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating complaint data:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMsg = language === 'np' 
        ? '❌ अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : '❌ Update failed. Please try again.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = language === 'np' 
            ? '❌ सत्र समाप्त भयो। कृपया पुन: लगइन गर्नुहोस्।' 
            : '❌ Session expired. Please login again.';
          setTimeout(() => navigate('/'), 2000);
        } else if (error.response.status === 404) {
          errorMsg = language === 'np' 
            ? '❌ गुनासो फेला परेन।' 
            : '❌ Complaint not found.';
        } else if (error.response.status === 400) {
          errorMsg = error.response.data?.message || (language === 'np' 
            ? '❌ अमान्य डाटा। कृपया जाँच गर्नुहोस्।' 
            : '❌ Invalid data. Please check.');
        } else if (error.response.status === 500) {
          errorMsg = language === 'np' 
            ? '❌ सर्भर त्रुटि। कृपया पछि प्रयास गर्नुहोस्।' 
            : '❌ Server error. Please try later.';
        }
      } else if (error.request) {
        errorMsg = language === 'np' 
          ? '❌ सर्भरमा जडान गर्न असफल। कृपया आफ्नो इन्टरनेट जाँच गर्नुहोस्।' 
          : '❌ Failed to connect to server. Please check your internet.';
      }
      
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Handle status and resolution update - FIXED for backend compatibility
  const handleUpdateStatus = async () => {
    if (!status) {
      const errorMsg = language === 'np' 
        ? 'कृपया स्थिति चयन गर्नुहोस्' 
        : 'Please select a status';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }
    
    if (status === 'resolved' && !resolution.trim()) {
      const errorMsg = language === 'np' 
        ? 'कृपया समाधान विवरण प्रदान गर्नुहोस्' 
        : 'Please provide resolution details';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }
    
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = getAuthToken();
      const API_URL = getApiUrl();
      const complaintId = complaint.id || complaint._id;
      
      // Backend expects status in specific format for PATCH /api/admin/complaints/:id/status
      const updateData = {
        status: status, // Backend expects: pending, in-progress, resolved, rejected, closed, review
        resolution: resolution.trim()
      };

      console.log('Updating status with data:', updateData);
      console.log('API URL:', `${API_URL}/admin/complaints/${complaintId}/status`);

      // Use PATCH method as defined in backend
      const response = await axios.patch(
        `${API_URL}/admin/complaints/${complaintId}/status`,
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Status update response:', response.data);
      
      if (response.data && response.data.success) {
        // Create history entry
        const historyEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          status: status,
          statusDisplay: status.charAt(0).toUpperCase() + status.slice(1),
          resolution: resolution.trim(),
          actionTaken: actionTaken.trim(),
          notes: updateNotes.trim(),
          updatedBy: staffData.name,
          timestamp: new Date().toLocaleString()
        };
        
        // Update complaint state
        setComplaint(prev => ({
          ...prev,
          status: status,
          resolution: resolution.trim(),
          actionTaken: actionTaken.trim(),
          updateHistory: [...(prev?.updateHistory || []), historyEntry]
        }));

        setUpdateHistory(prev => [...prev, historyEntry]);
        
        // Update localStorage
        const currentComplaint = JSON.parse(localStorage.getItem('currentComplaint') || '{}');
        localStorage.setItem('currentComplaint', JSON.stringify({
          ...currentComplaint,
          status: status,
          resolution: resolution.trim(),
          actionTaken: actionTaken.trim(),
          updateHistory: [...(currentComplaint?.updateHistory || []), historyEntry]
        }));
        
        const successMsg = language === 'np' 
          ? '✅ गुनासो सफलतापूर्वक अपडेट गरियो' 
          : '✅ Complaint updated successfully';
        setSuccess(successMsg);
        showToast(successMsg, 'success');

        setUpdateNotes('');
        setFollowUpNeeded(false);
        setFollowUpDate('');

        if (status === 'resolved') {
          setTimeout(() => {
            setActiveTab('resolution');
          }, 500);
        }

        setTimeout(() => {
          navigate('/staff/complaints/assigned', { 
            state: { 
              updated: true, 
              complaintId: complaintId,
              message: successMsg,
              status: status
            }
          });
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMsg = language === 'np' 
        ? '❌ अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : '❌ Update failed. Please try again.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = language === 'np' 
            ? '❌ सत्र समाप्त भयो। कृपया पुन: लगइन गर्नुहोस्।' 
            : '❌ Session expired. Please login again.';
          setTimeout(() => navigate('/'), 2000);
        } else if (error.response.status === 403) {
          errorMsg = language === 'np' 
            ? '❌ तपाईंलाई यो गुनासो अपडेट गर्न अनुमति छैन।' 
            : '❌ You are not authorized to update this complaint.';
        } else if (error.response.status === 404) {
          errorMsg = language === 'np' 
            ? '❌ गुनासो फेला परेन।' 
            : '❌ Complaint not found.';
        } else if (error.response.status === 400) {
          errorMsg = error.response.data?.message || (language === 'np' 
            ? '❌ अमान्य डाटा। कृपया जाँच गर्नुहोस्।' 
            : '❌ Invalid data. Please check.');
        } else if (error.response.status === 500) {
          errorMsg = language === 'np' 
            ? '❌ सर्भर त्रुटि। कृपया पछि प्रयास गर्नुहोस्।' 
            : '❌ Server error. Please try later.';
        }
      } else if (error.request) {
        errorMsg = language === 'np' 
          ? '❌ सर्भरमा जडान गर्न असफल। कृपया आफ्नो इन्टरनेट जाँच गर्नुहोस्।' 
          : '❌ Failed to connect to server. Please check your internet.';
      }
      
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    localStorage.removeItem('currentComplaint');
    navigate('/');
  };

  // Content translations
  const content = {
    np: {
      pageTitle: 'गुनासो समाधान',
      complaintDetails: 'गुनासोको विवरण',
      updateSection: 'गुनासो अपडेट गर्नुहोस्',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      email: 'इमेल',
      phone: 'फोन',
      category: 'प्रकार',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      registeredDate: 'दर्ता मिति',
      description: 'गुनासो विवरण',
      channel: 'च्यानल',
      address: 'ठेगाना',
      landmark: 'सन्दर्भ स्थल',
      selectStatus: 'नयाँ स्थिति चयन गर्नुहोस्',
      resolution: 'समाधान विवरण',
      enterResolution: 'यो गुनासो कसरी समाधान गरियो?',
      actionTaken: 'गरिएको कार्य',
      enterAction: 'यो गुनासो समाधान गर्न के कार्य गरियो?',
      updateNotes: 'अपडेट नोटहरू',
      enterNotes: 'कुनै अतिरिक्त नोटहरू...',
      followUpNeeded: 'पुन: अनुगमन आवश्यक छ',
      followUpDate: 'पुन: अनुगमन मिति',
      selectDate: 'मिति चयन गर्नुहोस्',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      underReview: 'समीक्षामा',
      rejected: 'अस्वीकृत',
      update: 'अपडेट गर्नुहोस्',
      updating: 'अपडेट हुँदै...',
      back: 'पछाडि फर्कनुहोस्',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      urgent: 'अत्यावश्यक',
      error: 'त्रुटि',
      loading: 'लोड हुँदै...',
      success: 'सफल',
      details: 'विवरण',
      updateInfo: 'अपडेट जानकारी',
      preview: 'पूर्वावलोकन',
      resolutionInfo: 'समाधान जानकारी',
      updateHistory: 'अपडेट इतिहास',
      noUpdates: 'कुनै अपडेट छैन',
      by: 'द्वारा',
      on: 'मिति',
      resolutionRequired: 'समाधान विवरण आवश्यक छ',
      actionRequired: 'कार्य विवरण आवश्यक छ',
      editDetails: 'विवरण सम्पादन गर्नुहोस्',
      saveChanges: 'परिवर्तन सुरक्षित गर्नुहोस्',
      cancel: 'रद्द गर्नुहोस्',
      editMode: 'सम्पादन मोड',
      assignedTo: 'तोकिएको',
      assignedBy: 'तोक्ने',
      assignedAt: 'तोकिएको मिति'
    },
    en: {
      pageTitle: 'Solve Complaint',
      complaintDetails: 'Complaint Details',
      updateSection: 'Update Complaint',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      email: 'Email',
      phone: 'Phone',
      category: 'Category',
      status: 'Status',
      priority: 'Priority',
      registeredDate: 'Registered Date',
      description: 'Complaint Description',
      channel: 'Channel',
      address: 'Address',
      landmark: 'Landmark',
      selectStatus: 'Select New Status',
      resolution: 'Resolution Details',
      enterResolution: 'How was this complaint resolved?',
      actionTaken: 'Action Taken',
      enterAction: 'What action was taken to resolve this complaint?',
      updateNotes: 'Update Notes',
      enterNotes: 'Any additional notes...',
      followUpNeeded: 'Follow Up Needed',
      followUpDate: 'Follow Up Date',
      selectDate: 'Select date',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      underReview: 'Under Review',
      rejected: 'Rejected',
      update: 'Update',
      updating: 'Updating...',
      back: 'Back',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      urgent: 'Urgent',
      error: 'Error',
      loading: 'Loading...',
      success: 'Success',
      details: 'Details',
      updateInfo: 'Update Info',
      preview: 'Preview',
      resolutionInfo: 'Resolution Information',
      updateHistory: 'Update History',
      noUpdates: 'No updates yet',
      by: 'by',
      on: 'on',
      resolutionRequired: 'Resolution details are required',
      actionRequired: 'Action details are required',
      editDetails: 'Edit Details',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      editMode: 'Edit Mode',
      assignedTo: 'Assigned To',
      assignedBy: 'Assigned By',
      assignedAt: 'Assigned At'
    }
  };

  const t = content[language];

  const getPriorityClass = (priority) => {
    const classes = { 
      urgent: 'priority-urgent',
      high: 'priority-high', 
      medium: 'priority-medium', 
      low: 'priority-low' 
    };
    return classes[priority] || 'priority-medium';
  };

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

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString(language === 'np' ? 'ne-NP' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusDisplayName = (statusValue) => {
    const statusMap = {
      'pending': t.pending,
      'in-progress': t.inProgress,
      'resolved': t.resolved,
      'review': t.underReview,
      'rejected': t.rejected
    };
    return statusMap[statusValue] || statusValue;
  };

  if (loading) {
    return (
      <div className="staff-complaint-solve">
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
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{t.loading}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="staff-complaint-solve">
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
            <div className="loading-container">
              <p style={{ color: '#ef4444', fontSize: '1.2rem' }}>
                {error || (language === 'np' ? '❌ गुनासो फेला परेन' : '❌ Complaint not found')}
              </p>
              <button 
                className="back-btn" 
                onClick={() => navigate('/staff/complaints/assigned')}
                style={{ marginTop: '16px' }}
              >
                ← {t.back}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-complaint-solve">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>✕</button>
        </div>
      )}

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
            <div className="page-header">
              <button className="back-btn" onClick={() => navigate('/staff/complaints/assigned')}>
                ← {t.back}
              </button>
              <h1>{t.pageTitle}</h1>
              <span className={`status-badge-header ${getStatusClass(complaint.status)}`}>
                {getStatusDisplayName(complaint.status)}
              </span>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                <span>{success}</span>
              </div>
            )}

            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                📋 {t.details}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'update' ? 'active' : ''}`}
                onClick={() => setActiveTab('update')}
              >
                ✏️ {t.updateInfo}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                👁️ {t.preview}
              </button>
              {(complaint.resolution || updateHistory.length > 0) && (
                <button 
                  className={`tab-btn ${activeTab === 'resolution' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resolution')}
                >
                  ✅ {t.resolutionInfo}
                  {updateHistory.length > 0 && (
                    <span className="tab-badge">{updateHistory.length}</span>
                  )}
                </button>
              )}
            </div>

            {activeTab === 'details' && (
              <div className="complaint-card">
                <div className="card-header">
                  <h2>{t.complaintDetails}</h2>
                  <div className="card-actions">
                    {!isEditMode ? (
                      <button 
                        className="btn-edit-mode" 
                        onClick={() => setIsEditMode(true)}
                      >
                        ✏️ {t.editDetails}
                      </button>
                    ) : (
                      <span className="edit-mode-badge">{t.editMode}</span>
                    )}
                  </div>
                </div>

                <div className="complaint-info">
                  {!isEditMode ? (
                    <div className="info-grid">
                      <div className="info-row">
                        <label>{t.ticketId}:</label>
                        <span className="ticket-id">{complaint.ticketId}</span>
                      </div>
                      <div className="info-row">
                        <label>{t.complainant}:</label>
                        <span>{language === 'np' ? complaint.name : complaint.enName}</span>
                      </div>
                      <div className="info-row">
                        <label>{t.email}:</label>
                        <span>{complaint.email}</span>
                      </div>
                      <div className="info-row">
                        <label>{t.phone}:</label>
                        <span>{complaint.phone}</span>
                      </div>
                      <div className="info-row">
                        <label>{t.category}:</label>
                        <span className="category-badge">
                          {language === 'np' ? complaint.category_np : complaint.category_en}
                        </span>
                      </div>
                      <div className="info-row">
                        <label>{t.priority}:</label>
                        <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                          {complaint.priority === 'urgent' ? t.urgent :
                           complaint.priority === 'high' ? t.high :
                           complaint.priority === 'medium' ? t.medium : t.low}
                        </span>
                      </div>
                      <div className="info-row">
                        <label>{t.registeredDate}:</label>
                        <span>{language === 'np' ? complaint.date : complaint.enDate}</span>
                      </div>
                      <div className="info-row">
                        <label>{t.channel}:</label>
                        <span>{language === 'np' ? complaint.channel : complaint.enChannel}</span>
                      </div>
                      {complaint.address && (
                        <div className="info-row">
                          <label>{t.address}:</label>
                          <span>{complaint.address}</span>
                        </div>
                      )}
                      {complaint.landmark && (
                        <div className="info-row">
                          <label>{t.landmark}:</label>
                          <span>{complaint.landmark}</span>
                        </div>
                      )}
                      {complaint.assignedTo && (
                        <div className="info-row">
                          <label>{t.assignedTo}:</label>
                          <span>{complaint.assignedTo}</span>
                        </div>
                      )}
                      {complaint.assignedAt && (
                        <div className="info-row">
                          <label>{t.assignedAt}:</label>
                          <span>{formatDisplayDate(complaint.assignedAt)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="edit-form">
                      <div className="edit-grid">
                        <div className="form-group">
                          <label>{t.complainant} <span className="required">*</span></label>
                          <input
                            type="text"
                            value={editFields.name}
                            onChange={(e) => handleEditFieldChange('name', e.target.value)}
                            className="edit-input"
                            disabled={updating}
                            placeholder={language === 'np' ? 'उजुरीकर्ताको नाम' : 'Complainant name'}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t.email} <span className="required">*</span></label>
                          <input
                            type="email"
                            value={editFields.email}
                            onChange={(e) => handleEditFieldChange('email', e.target.value)}
                            className="edit-input"
                            disabled={updating}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="form-group">
                          <label>{t.phone} <span className="required">*</span></label>
                          <input
                            type="tel"
                            value={editFields.phone}
                            onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                            className="edit-input"
                            disabled={updating}
                            placeholder={language === 'np' ? 'फोन नम्बर' : 'Phone number'}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t.address}</label>
                          <input
                            type="text"
                            value={editFields.address}
                            onChange={(e) => handleEditFieldChange('address', e.target.value)}
                            className="edit-input"
                            disabled={updating}
                            placeholder={language === 'np' ? 'ठेगाना' : 'Address'}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t.landmark}</label>
                          <input
                            type="text"
                            value={editFields.landmark}
                            onChange={(e) => handleEditFieldChange('landmark', e.target.value)}
                            className="edit-input"
                            disabled={updating}
                            placeholder={language === 'np' ? 'सन्दर्भ स्थल' : 'Landmark'}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{t.description} <span className="required">*</span></label>
                        <textarea
                          value={editFields.description}
                          onChange={(e) => handleEditFieldChange('description', e.target.value)}
                          className="edit-textarea"
                          rows="4"
                          disabled={updating}
                          placeholder={language === 'np' ? 'गुनासो विवरण लेख्नुहोस्' : 'Write complaint description'}
                        />
                      </div>
                      <div className="edit-actions">
                        <button 
                          className="btn-cancel" 
                          onClick={() => {
                            setIsEditMode(false);
                            setEditFields({
                              name: complaint.name || '',
                              email: complaint.email || '',
                              phone: complaint.phone || '',
                              address: complaint.address || '',
                              landmark: complaint.landmark || '',
                              description: complaint.description || ''
                            });
                          }}
                          disabled={updating}
                        >
                          {t.cancel}
                        </button>
                        <button 
                          className="btn-save" 
                          onClick={handleUpdateComplaintData}
                          disabled={updating || !editFields.name.trim() || !editFields.email.trim() || !editFields.phone.trim()}
                        >
                          {updating ? t.updating : t.saveChanges}
                        </button>
                      </div>
                    </div>
                  )}

                  {!isEditMode && (
                    <div className="description-section">
                      <label>{t.description}:</label>
                      <p className="description">{language === 'np' ? complaint.description : complaint.enDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'update' && (
              <div className="update-card">
                <div className="card-header">
                  <h2>{t.updateSection}</h2>
                </div>

                <div className="update-form">
                  <div className="form-group">
                    <label>{t.selectStatus} <span className="required">*</span></label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="status-select"
                      disabled={updating}
                    >
                      <option value="">{t.selectStatus}</option>
                      <option value="pending">{t.pending}</option>
                      <option value="in-progress">{t.inProgress}</option>
                      <option value="review">{t.underReview}</option>
                      <option value="resolved">{t.resolved}</option>
                      <option value="rejected">{t.rejected}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t.resolution} <span className="required">*</span></label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder={t.enterResolution}
                      rows="4"
                      disabled={updating}
                      className={status === 'resolved' && !resolution.trim() ? 'field-error' : ''}
                    />
                    {status === 'resolved' && !resolution.trim() && (
                      <span className="field-hint">{t.resolutionRequired}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>{t.actionTaken}</label>
                    <textarea
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      placeholder={t.enterAction}
                      rows="3"
                      disabled={updating}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t.updateNotes}</label>
                    <textarea
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                      placeholder={t.enterNotes}
                      rows="3"
                      disabled={updating}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={followUpNeeded}
                          onChange={(e) => setFollowUpNeeded(e.target.checked)}
                          disabled={updating}
                        />
                        {t.followUpNeeded}
                      </label>
                    </div>

                    {followUpNeeded && (
                      <div className="form-group">
                        <label>{t.followUpDate}</label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="date-input"
                          disabled={updating}
                        />
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="btn-update" 
                      onClick={handleUpdateStatus}
                      disabled={updating || !status}
                    >
                      {updating ? t.updating : t.update}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="preview-card">
                <div className="card-header">
                  <h2>{t.preview}</h2>
                </div>

                <div className="preview-content">
                  <div className="preview-section">
                    <h3>Complaint Summary</h3>
                    <div className="preview-item">
                      <strong>Ticket ID:</strong> {complaint.ticketId}
                    </div>
                    <div className="preview-item">
                      <strong>Complainant:</strong> {language === 'np' ? complaint.name : complaint.enName}
                    </div>
                    <div className="preview-item">
                      <strong>Category:</strong> {language === 'np' ? complaint.category_np : complaint.category_en}
                    </div>
                    <div className="preview-item">
                      <strong>Current Status:</strong>
                      <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                        {getStatusDisplayName(complaint.status)}
                      </span>
                    </div>
                  </div>

                  <div className="preview-section">
                    <h3>Update Information</h3>
                    <div className="preview-item">
                      <strong>New Status:</strong> 
                      <span className={`status-badge ${getStatusClass(status)}`}>
                        {status ? getStatusDisplayName(status) : 'Not selected'}
                      </span>
                    </div>
                    {resolution && (
                      <div className="preview-item">
                        <strong>Resolution:</strong> {resolution}
                      </div>
                    )}
                    {actionTaken && (
                      <div className="preview-item">
                        <strong>Action Taken:</strong> {actionTaken}
                      </div>
                    )}
                    {updateNotes && (
                      <div className="preview-item">
                        <strong>Notes:</strong> {updateNotes}
                      </div>
                    )}
                    {followUpNeeded && (
                      <div className="preview-item">
                        <strong>Follow Up:</strong> Yes {followUpDate && `on ${followUpDate}`}
                      </div>
                    )}
                  </div>

                  <div className="preview-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => setActiveTab('update')}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-submit" 
                      onClick={handleUpdateStatus}
                      disabled={updating || !status}
                    >
                      {updating ? t.updating : t.update}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resolution' && (
              <div className="resolution-card">
                <div className="card-header">
                  <h2>✅ {t.resolutionInfo}</h2>
                  {updateHistory.length > 0 && (
                    <span className="update-count">{updateHistory.length} updates</span>
                  )}
                </div>

                <div className="resolution-content">
                  {complaint.resolution && (
                    <div className="current-resolution">
                      <h3>Current Resolution</h3>
                      <div className="resolution-details">
                        <div className="resolution-item">
                          <label>Status:</label>
                          <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                            {getStatusDisplayName(complaint.status)}
                          </span>
                        </div>

                        {complaint.resolution && (
                          <div className="resolution-item">
                            <label>{t.resolution}:</label>
                            <div className="resolution-text">{complaint.resolution}</div>
                          </div>
                        )}

                        {complaint.actionTaken && (
                          <div className="resolution-item">
                            <label>{t.actionTaken}:</label>
                            <div className="resolution-text">{complaint.actionTaken}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {updateHistory && updateHistory.length > 0 && (
                    <div className="update-history">
                      <h3>{t.updateHistory}</h3>
                      {updateHistory.map((update, index) => (
                        <div key={update.id || index} className="history-item">
                          <div className="history-header">
                            <span className="history-status">
                              {update.statusDisplay || getStatusDisplayName(update.status)}
                            </span>
                            <span className="history-meta">
                              {t.by} {update.updatedBy || 'Staff'} {t.on} {formatDisplayDate(update.date || update.timestamp)}
                            </span>
                          </div>
                          {update.resolution && (
                            <div className="history-resolution">
                              <strong>Resolution:</strong> {update.resolution}
                            </div>
                          )}
                          {update.actionTaken && (
                            <div className="history-action">
                              <strong>Action:</strong> {update.actionTaken}
                            </div>
                          )}
                          {update.notes && (
                            <div className="history-notes">📝 {update.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!complaint.resolution && updateHistory.length === 0 && (
                    <div className="no-resolution">
                      <p>No resolution has been provided yet.</p>
                      <button 
                        className="btn-go-update"
                        onClick={() => setActiveTab('update')}
                      >
                        ✏️ Add Resolution
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* All your existing styles remain the same */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .staff-complaint-solve {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          position: relative;
        }

        .toast-notification {
          position: fixed;
          top: 80px;
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
          max-width: 400px;
          min-width: 280px;
        }
        
        .toast-notification.success { border-left: 4px solid #10b981; background: #ecfdf5; }
        .toast-notification.error { border-left: 4px solid #ef4444; background: #fef2f2; }
        .toast-notification.warning { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .toast-notification.info { border-left: 4px solid #3b82f6; background: #eff6ff; }
        
        .toast-icon { font-size: 1.2rem; flex-shrink: 0; }
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

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          padding: 40px;
          width: 100%;
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

        .page-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .back-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #f8fafc;
          border-color: #0288d1;
          color: #0288d1;
        }

        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          flex: 1;
        }

        .status-badge-header {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .status-review { background: #e0e7ff; color: #4f46e5; }
        .status-rejected { background: #fee2e2; color: #dc2626; }

        .error-message {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #dc2626;
        }

        .success-message {
          background: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #059669;
        }

        .tab-navigation {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 12px 24px;
          background: transparent;
          border: none;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
          border-radius: 8px 8px 0 0;
          position: relative;
        }

        .tab-btn:hover {
          color: #0288d1;
          background: #f0f9ff;
        }

        .tab-btn.active {
          color: #0288d1;
          border-bottom: 2px solid #0288d1;
          margin-bottom: -2px;
        }

        .tab-badge {
          background: #0288d1;
          color: white;
          border-radius: 50%;
          padding: 1px 6px;
          font-size: 0.7rem;
          margin-left: 6px;
        }

        .complaint-card, .update-card, .preview-card, .resolution-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .card-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .card-header h2 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-edit-mode {
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #0288d1;
          background: white;
          color: #0288d1;
          transition: all 0.2s;
        }

        .btn-edit-mode:hover {
          background: #0288d1;
          color: white;
        }

        .edit-mode-badge {
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          background: #fef3c7;
          color: #d97706;
        }

        .update-count {
          font-size: 0.8rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 4px 12px;
          border-radius: 12px;
        }

        .complaint-info {
          padding: 24px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .info-row label {
          width: 120px;
          font-weight: 600;
          color: #0f172a;
          flex-shrink: 0;
        }

        .info-row span {
          flex: 1;
          color: #334155;
          word-break: break-word;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #0288d1;
        }

        .category-badge {
          display: inline-block;
          padding: 2px 10px;
          background: #e0f2fe;
          border-radius: 20px;
          font-size: 0.75rem;
        }

        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .priority-urgent { background: #fee2e2; color: #dc2626; }
        .priority-high { background: #fef3c7; color: #d97706; }
        .priority-medium { background: #dbeafe; color: #2563eb; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .status-badge {
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

        .description-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .description-section label {
          font-weight: 600;
          color: #0f172a;
          display: block;
          margin-bottom: 8px;
        }

        .description {
          line-height: 1.6;
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          color: #334155;
        }

        .edit-form {
          padding: 0;
        }

        .edit-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .edit-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        .edit-input:focus {
          outline: none;
          border-color: #0288d1;
          box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.1);
        }

        .edit-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .edit-textarea:focus {
          outline: none;
          border-color: #0288d1;
          box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.1);
        }

        .edit-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .btn-cancel {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #f8fafc;
          border-color: #dc2626;
          color: #dc2626;
        }

        .btn-save {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
          transition: all 0.2s;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(2, 136, 209, 0.3);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .update-form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .required {
          color: #ef4444;
        }

        .status-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          background: white;
          transition: border-color 0.2s;
        }

        .status-select:focus {
          outline: none;
          border-color: #0288d1;
          box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.1);
        }

        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #0288d1;
          box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.1);
        }

        .field-error {
          border-color: #ef4444 !important;
        }

        .field-hint {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 4px;
          display: block;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-bottom: 0;
        }

        .checkbox-group input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .date-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        .date-input:focus {
          outline: none;
          border-color: #0288d1;
          box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.1);
        }

        .action-buttons {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }

        .btn-update {
          padding: 12px 32px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .btn-update:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(2, 136, 209, 0.3);
        }

        .btn-update:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .preview-content, .resolution-content {
          padding: 24px;
        }

        .preview-section {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .preview-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .preview-item {
          padding: 8px 0;
          display: flex;
          gap: 12px;
        }

        .preview-item strong {
          min-width: 120px;
          color: #64748b;
        }

        .preview-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .btn-edit {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
          transition: all 0.2s;
        }

        .btn-edit:hover {
          background: #f8fafc;
          border-color: #0288d1;
          color: #0288d1;
        }

        .btn-submit {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
          transition: all 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(2, 136, 209, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .current-resolution {
          margin-bottom: 24px;
        }

        .current-resolution h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .resolution-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .resolution-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .resolution-item label {
          font-weight: 600;
          color: #0f172a;
        }

        .resolution-text {
          color: #334155;
          line-height: 1.6;
          background: white;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .update-history {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 2px solid #e2e8f0;
        }

        .update-history h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
        }

        .history-item {
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 12px;
          border-left: 4px solid #0288d1;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }

        .history-status {
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 12px;
          background: #e0f2fe;
          color: #0288d1;
        }

        .history-meta {
          font-size: 0.85rem;
          color: #64748b;
        }

        .history-resolution {
          color: #334155;
          padding: 4px 0;
          line-height: 1.5;
        }

        .history-action {
          color: #334155;
          padding: 4px 0;
          line-height: 1.5;
        }

        .history-notes {
          color: #64748b;
          font-style: italic;
          padding-top: 4px;
        }

        .no-resolution {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .no-resolution p {
          margin-bottom: 16px;
        }

        .btn-go-update {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
          transition: all 0.2s;
        }

        .btn-go-update:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(2, 136, 209, 0.3);
        }

        @media (max-width: 768px) {
          .staff-complaint-solve {
            height: auto;
            overflow: auto;
          }
          
          .dashboard-layout {
            flex-direction: column;
            height: auto;
            margin-top: 150px;
            overflow: visible;
          }
          
          .main-content {
            margin-left: 0;
            width: 100%;
            overflow-y: visible;
          }
          
          .content-wrapper {
            padding: 16px;
          }
          
          .info-grid, .edit-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .info-row {
            flex-direction: column;
          }
          
          .info-row label {
            width: 100%;
            margin-bottom: 4px;
          }
          
          .action-buttons, .edit-actions {
            flex-direction: column;
          }
          
          .btn-update, .btn-save, .btn-cancel {
            width: 100%;
          }
          
          .preview-item {
            flex-direction: column;
          }
          
          .preview-item strong {
            min-width: auto;
          }

          .history-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .toast-notification {
            top: auto;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
            padding: 12px;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .tab-navigation {
            flex-direction: column;
          }
          
          .tab-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffComplaintSolve;