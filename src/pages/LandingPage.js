// src/pages/LandingPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Try to import local images with fallback
let ntcLogo, govLogo, heroImage, phoneIcon, smsIcon, whatsappIcon, viberIcon, emailIcon;
try {
  ntcLogo = require('../img/ntc-logo.png');
} catch (e) {
  ntcLogo = null;
}
try {
  govLogo = require('../img/logo.png');
} catch (e) {
  govLogo = null;
}
try {
  heroImage = require('../img/image.png');
} catch (e) {
  heroImage = null;
}
try {
  phoneIcon = require('../img/phone.png');
} catch (e) {
  phoneIcon = null;
}
try {
  smsIcon = require('../img/sms.png');
} catch (e) {
  smsIcon = null;
}
try {
  whatsappIcon = require('../img/whatsapp.png');
} catch (e) {
  whatsappIcon = null;
}
try {
  viberIcon = require('../img/viber.png');
} catch (e) {
  viberIcon = null;
}
try {
  emailIcon = require('../img/email.png');
} catch (e) {
  emailIcon = null;
}

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Language state with persistence
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Image states for fallback
  const [heroImageError, setHeroImageError] = useState(false);
  
  // State for dynamic public complaints from backend
  const [regularComplaints, setRegularComplaints] = useState([]);
  const [regardingComplaints, setRegardingComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Function to convert numbers to Nepali digits
  const toNepaliNumber = useCallback((num) => {
    if (num === undefined || num === null || num === '') return '';
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const str = String(num);
    return str.replace(/\d/g, (digit) => nepaliDigits[parseInt(digit)]);
  }, []);

  // Function to format numbers based on language
  const formatNumber = useCallback((num) => {
    if (num === undefined || num === null || num === '') return '';
    if (language === 'np') {
      return toNepaliNumber(num);
    }
    return String(num);
  }, [language, toNepaliNumber]);

  // Function to format percentage with proper number formatting
  const formatPercentage = useCallback((num) => {
    if (num === undefined || num === null) return '';
    const formatted = num.toFixed(3);
    if (language === 'np') {
      return toNepaliNumber(formatted) + '%';
    }
    return formatted + '%';
  }, [language, toNepaliNumber]);

  // Function to format count with proper number formatting
  const formatCount = useCallback((num) => {
    if (num === undefined || num === null) return '0';
    if (language === 'np') {
      return toNepaliNumber(num);
    }
    return String(num);
  }, [language, toNepaliNumber]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Show toast notification
  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, duration);
  }, []);

  // Helper function to format date from backend
  const formatDateFromBackend = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '-';
    }
  };

  // Helper function to convert status to Nepali
  const getStatusInNepali = (status) => {
    const statusMap = {
      'pending': 'विचाराधीन',
      'in-progress': 'प्रगतिमा',
      'inprogress': 'प्रगतिमा',
      'review': 'समीक्षामा',
      'resolved': 'समाधान भयो',
      'closed': 'बन्द',
      'rejected': 'अस्वीकृत'
    };
    return statusMap[status?.toLowerCase()] || status || 'विचाराधीन';
  };

  // Helper function to get status in English
  const getStatusInEnglish = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'inprogress': 'In Progress',
      'review': 'Under Review',
      'resolved': 'Resolved',
      'closed': 'Closed',
      'rejected': 'Rejected'
    };
    return statusMap[status?.toLowerCase()] || status || 'Pending';
  };

  // Fetch all complaints from both tables
  const fetchAllComplaints = useCallback(async () => {
    try {
      setLoadingComplaints(true);
      
      // Fetch regular complaints from public endpoint
      const regularResponse = await axios.get(`${API_URL}/complaints/public`);
      
      // Fetch complaint regarding from public endpoint
      const regardingResponse = await axios.get(`${API_URL}/complaints/regarding/public`);
      
      let regularData = [];
      let regardingData = [];
      
      // Process regular complaints
      if (regularResponse.data.success && Array.isArray(regularResponse.data.data)) {
        regularData = regularResponse.data.data.map(complaint => ({
          id: complaint.id,
          name: complaint.name || 'N/A',
          nameEn: complaint.name || 'N/A',
          complaint: complaint.description || 'No description',
          complaintEn: complaint.description || 'No description',
          date: formatDateFromBackend(complaint.created_at),
          dateEn: formatDateFromBackend(complaint.created_at),
          status: getStatusInNepali(complaint.status),
          statusEn: getStatusInEnglish(complaint.status),
          phone: complaint.phone || 'N/A',
          email: complaint.email || 'N/A',
          category: complaint.nature_of_complaint || 'general',
          categoryEn: complaint.nature_of_complaint || 'General',
          priority: complaint.priority || 'medium',
          complaintNumber: complaint.complaint_number || `NTC-${complaint.id}`,
          submittedDate: complaint.created_at,
          address: complaint.street_address || null,
          landmark: complaint.landmark || null,
          assignedTo: complaint.assigned_to || null,
          resolution: complaint.resolution || null,
          type: 'regular'
        }));
      }
      
      // Process complaint regarding
      if (regardingResponse.data.success && Array.isArray(regardingResponse.data.data)) {
        regardingData = regardingResponse.data.data.map(complaint => ({
          id: complaint.id,
          name: complaint.name || 'N/A',
          nameEn: complaint.name || 'N/A',
          complaint: complaint.description || 'No description',
          complaintEn: complaint.description || 'No description',
          date: formatDateFromBackend(complaint.created_at),
          dateEn: formatDateFromBackend(complaint.created_at),
          status: getStatusInNepali(complaint.status),
          statusEn: getStatusInEnglish(complaint.status),
          phone: complaint.phone || 'N/A',
          email: complaint.email || 'N/A',
          category: complaint.complaint_type || 'general',
          categoryEn: complaint.complaint_type || 'General',
          priority: complaint.priority || 'medium',
          complaintNumber: complaint.complaint_number || `CR-${complaint.id}`,
          submittedDate: complaint.created_at,
          subject: complaint.subject || null,
          address: complaint.address || null,
          landmark: complaint.landmark || null,
          preferredContact: complaint.preferred_contact || null,
          referenceNumber: complaint.reference_number || null,
          assignedTo: complaint.assigned_to || null,
          resolution: complaint.resolution || null,
          type: 'regarding'
        }));
      }
      
      setRegularComplaints(regularData);
      setRegardingComplaints(regardingData);
      
      // Combine all complaints and sort by date (newest first)
      const combined = [...regularData, ...regardingData];
      combined.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
      setAllComplaints(combined);
      
    } catch (error) {
      console.error('Error fetching complaints:', error);
      showToast(language === 'np' ? 'गुनासोहरू लोड गर्न असफल। कृपया पछि पुन: प्रयास गर्नुहोस्।' : 'Failed to load complaints. Please try again later.', 'error');
      setAllComplaints([]);
      setRegularComplaints([]);
      setRegardingComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  }, [API_URL, showToast, language]);

  // Get complaints to display based on active tab
  const getComplaintsToDisplay = () => {
    if (activeTab === 'all') return allComplaints;
    if (activeTab === 'regular') return regularComplaints;
    if (activeTab === 'regarding') return regardingComplaints;
    return allComplaints;
  };

  useEffect(() => {
    fetchAllComplaints();
    const interval = setInterval(fetchAllComplaints, 30000);
    return () => clearInterval(interval);
  }, [fetchAllComplaints]);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showDetailsModal) {
        setShowDetailsModal(false);
        document.body.style.overflow = 'unset';
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showDetailsModal]);

  // Format date for display
  const formatDate = useCallback((date) => {
    if (!date) return '-';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '-';
      if (language === 'np') {
        return dateObj.toLocaleDateString('ne-NP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return date;
    }
  }, [language]);

  // Format date for table display
  const formatTableDate = useCallback((date) => {
    if (!date) return '-';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '-';
      if (language === 'np') {
        return dateObj.toLocaleDateString('ne-NP', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } else {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return date;
    }
  }, [language]);

  // Function to view complaint details
  const viewComplaintDetails = useCallback((complaint) => {
    const enhancedComplaint = {
      ...complaint,
      formattedSubmittedDate: complaint.submittedDate ? formatDate(complaint.submittedDate) : '-',
      formattedUpdatedDate: complaint.updated_at ? formatDate(complaint.updated_at) : '-'
    };
    setSelectedComplaint(enhancedComplaint);
    setShowDetailsModal(true);
    document.body.style.overflow = 'hidden';
  }, [formatDate]);

  const closeModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedComplaint(null);
    document.body.style.overflow = 'unset';
  }, []);

  const complaintChannels = [
    { 
      id: 'website', 
      name: 'वेबसाइट पोर्टल', 
      enName: 'Website Portal', 
      icon: '🌐', 
      isImage: false, 
      color: '#1565c0', 
      bgColor: '#e3f2fd', 
      action: () => navigate('/submit-complaint') 
    },
    { 
      id: 'phone', 
      name: 'फोन', 
      enName: 'Phone', 
      icon: phoneIcon, 
      isImage: true, 
      fallback: '📞', 
      color: '#42a5f5', 
      bgColor: '#e3f2fd', 
      contact: '198' 
    },
    { 
      id: 'sms', 
      name: 'एसएमएस', 
      enName: 'SMS', 
      icon: smsIcon, 
      isImage: true, 
      fallback: '💬', 
      color: '#4caf50', 
      bgColor: '#e8f5e9', 
      contact: '988' 
    },
    { 
      id: 'whatsapp', 
      name: 'व्हाट्सएप', 
      enName: 'WhatsApp', 
      icon: whatsappIcon, 
      isImage: true, 
      fallback: '💬', 
      color: '#25D366', 
      bgColor: '#d4edda', 
      contact: '9851234567' 
    },
    { 
      id: 'viber', 
      name: 'भाइबर', 
      enName: 'Viber', 
      icon: viberIcon, 
      isImage: true, 
      fallback: '📱', 
      color: '#7360f2', 
      bgColor: '#e8e0f5' 
    },
    { 
      id: 'email', 
      name: 'इमेल', 
      enName: 'Email', 
      icon: emailIcon, 
      isImage: true, 
      fallback: '✉️', 
      color: '#ea4335', 
      bgColor: '#fce4ec', 
      action: () => window.location.href = 'mailto:coo@ntc.net.np' 
    },
  ];

  // Update status counts based on actual data with proper number formatting
  const getUpdatedStatusCounts = () => {
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status === 'विचाराधीन' || c.status === 'Pending').length;
    const resolved = allComplaints.filter(c => c.status === 'समाधान भयो' || c.status === 'Resolved').length;
    
    const counts = [...statusCounts[language]];
    counts[0].count = formatCount(total);
    counts[1].count = formatCount(pending);
    counts[2].count = formatCount(resolved);
    
    return counts;
  };

  const statusCounts = {
    np: [
      { title: 'हालसम्म दर्ता भएका कुल गुनासोहरू', count: '0', range: '(पछिल्लो २४ घण्टामा: ०)' },
      { title: 'समीक्षा भई कारबाहीको पर्खाइमा रहेका गुनासोहरू', count: '0', range: '(पछिल्लो २४ घण्टामा: ०)' },
      { title: 'सहायता टोलीद्वारा हालसम्म समाधान भएका गुनासोहरू', count: '0', range: '(पछिल्लो २४ घण्टामा: ०)' },
    ],
    en: [
      { title: 'Total complaints registered to date', count: '0', range: '(Last 24h: 0)' },
      { title: 'Complaints reviewed but awaiting action', count: '0', range: '(Last 24h: 0)' },
      { title: 'Complaints resolved by support team', count: '0', range: '(Last 24h: 0)' },
    ],
  };

  const latestComplaints = [
    { category: 'सिम कार्ड गुनासो', enCategory: 'SIM Card Complaints', date: '२०८०-०१-१२', enDate: '2024-01-12', count: '१२५' },
    { category: 'इन्टरनेट सेवा गुनासो', enCategory: 'Internet Service Complaints', date: '२०८०-०१-१२', enDate: '2024-01-12', count: '२३४' },
    { category: 'रिचार्ज र ब्यालेन्स समस्या', enCategory: 'Recharge & Balance Issues', date: '२०८०-०१-१२', enDate: '2024-01-12', count: '३४५' },
    { category: 'सेवा सक्रियता/निष्क्रियता', enCategory: 'Service Activation/Deactivation', date: '२०८०-०२-३०', enDate: '2024-02-28', count: '८९' },
  ];

  const channelStats = [
    { name: 'वेबसाइट पोर्टल', enName: 'Website Portal', percentage: 45.788, color: '#1565c0', change: '+5.2%' },
    { name: 'कल सेन्टर', enName: 'Call Center', percentage: 32.099, color: '#42a5f5', change: '+2.1%' },
    { name: 'व्हाट्सएप सपोर्ट', enName: 'WhatsApp Support', percentage: 12.581, color: '#25D366', change: '+8.3%' },
    { name: 'इमेल सपोर्ट', enName: 'Email Support', percentage: 5.697, color: '#ea4335', change: '-1.2%' },
    { name: 'भाइबर', enName: 'Viber', percentage: 2.588, color: '#7360f2', change: '+0.8%' },
    { name: 'निवेदन पत्र', enName: 'Application Letter', percentage: 1.312, color: '#e67e22', change: '-0.5%' },
  ];

  const content = {
    np: {
      weAreHere: 'हामी तपाईंको लागि यहाँ छौं',
      contactNumber: 'सम्पर्क नम्बर: ०१-४९६०००८',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'नेपाल दूरसञ्चार प्राधिकरण',
      departmentAddress: 'भद्रकाली प्लाजा, काठमाडौं',
      serviceName: 'एनटीसी सहयात्री',
      serviceSub: 'गुनासो ट्र्याकिङ प्रणाली',
      home: 'गृह पृष्ठ',
      faqs: 'बारम्बार सोधिने प्रश्नहरू',
      login: 'लगइन',
      heroTitle: 'के तपाईंलाई नेपाल दूरसञ्चार सेवा, बिलिङ, इन्टरनेट जडान, वा ग्राहक सहायतासम्बन्धी समस्या छ?',
      heroText: 'कृपया एनटीसी ग्रिव्यान्स पोर्टलमार्फत आफ्नो उजुरी दिनुहोस्। हाम्रो टोली तपाईंलाई सहयोग गर्न तयार छ।',
      heroQuote: 'हामीलाई जानकारी दिनुहोस् - हामी यसलाई समाधान गर्न यहाँ छौं!',
      submitComplaint: 'उजुरी दिनुहोस्',
      trackComplaint: 'उजुरी ट्र्याक गर्नुहोस्',
      complaintRegarding: 'गुनासो सम्बन्धी',
      channelsTitle: 'गुनासोको लागि उपलब्ध च्यानलहरू:',
      publicComplaintsTitle: 'सार्वजनिक रूपमा दर्ता गरिएका गुनासोहरू',
      allComplaints: 'सबै गुनासोहरू',
      regularComplaints: 'साधारण गुनासोहरू',
      regardingComplaints: 'गुनासो सम्बन्धी',
      latestStatusTitle: 'गुनासो ट्र्याकिङ प्रणालीबाट प्राप्त नवीनतम स्थिति',
      complaintId: 'क्र.स.',
      complainantName: 'उजुरीकर्ताको नाम',
      complaintDetails: 'उजुरीको विवरण',
      complaintDate: 'मिति',
      complaintStatus: 'स्थिति',
      viewDetails: 'विवरण हेर्नुहोस्',
      statsTitle: 'गुनासो प्राप्तिका मुख्य माध्यमहरू',
      links: 'लिङ्कहरू:',
      complaints: 'गुनासोहरू',
      policy: 'नीति',
      contactInfo: 'सम्पर्क जानकारी',
      helpline: 'हेल्पलाइन',
      tollFree: 'टोल फ्री',
      email: 'इमेल',
      address: 'ठेगाना',
      phone: 'फोन',
      netcomSignalComplaints: 'नेटवर्क र सिग्नल गुनासोहरू',
      netcomSignalText: 'नेटवर्क र सिग्नल सम्बन्धी गुनासोहरूको तथ्याङ्क',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      loading: 'लोड हुँदै...',
      complaintNumber: 'गुनासो नम्बर',
      category: 'श्रेणी',
      priority: 'प्राथमिकता',
      phoneNumber: 'फोन नम्बर',
      emailAddress: 'इमेल ठेगाना',
      description: 'विवरण',
      submittedDate: 'पेश मिति',
      lastUpdated: 'अन्तिम अपडेट',
      close: 'बन्द गर्नुहोस्',
      resolution: 'समाधान विवरण',
      landmark: 'नजिकैको चिन्ह',
      assignedTo: 'जिम्मेवार व्यक्ति',
      complainantInfo: 'उजुरीकर्ताको जानकारी',
      complaintInfo: 'गुनासो जानकारी',
      addressInfo: 'ठेगाना जानकारी',
      dateInfo: 'मिति जानकारी',
      subject: 'विषय',
      noComplaints: 'हाल कुनै गुनासोहरू छैनन्',
      refreshData: 'ताजा डाटा',
      contactNow: 'सम्पर्क गर्नुहोस्',
      referenceNo: 'सन्दर्भ नम्बर',
      preferredContact: 'प्राथमिकता सम्पर्क',
      complaintType: 'गुनासो प्रकार',
      complaintRegardingTitle: 'गुनासो सम्बन्धी',
      regular: 'साधारण',
      regarding: 'सम्बन्धी',
      status: 'स्थिति',
      actions: 'कार्यहरू',
      totalComplaints: 'कुल गुनासोहरू',
      pendingComplaints: 'विचाराधीन गुनासोहरू',
      resolvedComplaints: 'समाधान भएका गुनासोहरू',
      networkSignal: 'नेटवर्क र सिग्नल',
      billingIssues: 'बिलिङ समस्याहरू',
      serviceActivation: 'सेवा सक्रियता',
      internetIssues: 'इन्टरनेट समस्याहरू',
      support: 'सहायता',
      availableChannels: 'उपलब्ध च्यानलहरू',
      quickLinks: 'द्रुत लिङ्कहरू'
    },
    en: {
      weAreHere: 'We are here for you',
      contactNumber: 'Contact: 01-4960008',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'Nepal Telecommunications Authority',
      departmentAddress: 'Bhadrakali Plaza, Kathmandu',
      serviceName: 'NTC Sahayatri',
      serviceSub: 'Complaint Tracking System',
      home: 'Home',
      faqs: 'FAQs',
      login: 'Admin Login',
      heroTitle: 'Do you have concerns regarding Nepal Telecom services, billing, internet connectivity, or customer support?',
      heroText: 'Please submit your complaint through the NTC Grievance Portal. Our team is ready to help you.',
      heroQuote: "Let us know — we're here to help resolve it!",
      submitComplaint: 'Submit Complaint',
      trackComplaint: 'Track Complaint',
      complaintRegarding: 'Complaint Regarding',
      channelsTitle: 'Channels available for complaint:',
      publicComplaintsTitle: 'Publicly Registered Complaints',
      allComplaints: 'All Complaints',
      regularComplaints: 'Regular Complaints',
      regardingComplaints: 'Complaint Regarding',
      latestStatusTitle: 'Latest Status from Complaint Tracking System',
      complaintId: 'S.No.',
      complainantName: 'Complainant Name',
      complaintDetails: 'Complaint Details',
      complaintDate: 'Date',
      complaintStatus: 'Status',
      viewDetails: 'View Details',
      statsTitle: 'Main Complaint Channels',
      links: 'LINKS:',
      complaints: 'Complaints',
      policy: 'Policy',
      contactInfo: 'Contact Information',
      helpline: 'Helpline',
      tollFree: 'Toll Free',
      email: 'Email',
      address: 'Address',
      phone: 'Phone',
      netcomSignalComplaints: 'Network & Signal Complaints',
      netcomSignalText: 'Statistics of network and signal related complaints',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      loading: 'Loading...',
      complaintNumber: 'Complaint Number',
      category: 'Category',
      priority: 'Priority',
      phoneNumber: 'Phone Number',
      emailAddress: 'Email Address',
      description: 'Description',
      submittedDate: 'Submitted Date',
      lastUpdated: 'Last Updated',
      close: 'Close',
      resolution: 'Resolution',
      landmark: 'Landmark',
      assignedTo: 'Assigned To',
      complainantInfo: 'Complainant Information',
      complaintInfo: 'Complaint Information',
      addressInfo: 'Address Information',
      dateInfo: 'Date Information',
      subject: 'Subject',
      noComplaints: 'No complaints found',
      refreshData: 'Refresh Data',
      contactNow: 'Contact Now',
      referenceNo: 'Reference Number',
      preferredContact: 'Preferred Contact',
      complaintType: 'Complaint Type',
      complaintRegardingTitle: 'Complaint Regarding',
      regular: 'Regular',
      regarding: 'Regarding',
      status: 'Status',
      actions: 'Actions',
      totalComplaints: 'Total Complaints',
      pendingComplaints: 'Pending Complaints',
      resolvedComplaints: 'Resolved Complaints',
      networkSignal: 'Network & Signal',
      billingIssues: 'Billing Issues',
      serviceActivation: 'Service Activation',
      internetIssues: 'Internet Issues',
      support: 'Support',
      availableChannels: 'Available Channels',
      quickLinks: 'Quick Links'
    },
  };

  const t = content[language];
  const currentStatusCounts = getUpdatedStatusCounts();
  const complaintsToShow = getComplaintsToDisplay();

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
    // Refresh complaints with new language
    fetchAllComplaints();
  }, [fetchAllComplaints]);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 195;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  const getStatusClass = useCallback((status) => {
    const statusMap = {
      'प्रगतिमा': 'status-progress',
      'In Progress': 'status-progress',
      'समाधान भयो': 'status-resolved',
      'Resolved': 'status-resolved',
      'विचाराधीन': 'status-pending',
      'Pending': 'status-pending',
      'समीक्षामा': 'status-review',
      'Under Review': 'status-review',
      'बन्द': 'status-closed',
      'Closed': 'status-closed',
      'अस्वीकृत': 'status-rejected',
      'Rejected': 'status-rejected'
    };
    return statusMap[status] || 'status-pending';
  }, []);

  const getStatusText = useCallback((status, statusEn) => {
    if (language === 'np') {
      return status;
    }
    return statusEn || status;
  }, [language]);

  const manualRefresh = useCallback(async () => {
    setLoadingComplaints(true);
    await fetchAllComplaints();
    showToast(language === 'np' ? 'डाटा ताजा गरियो' : 'Data refreshed', 'success', 2000);
  }, [fetchAllComplaints, showToast, language]);

  // Function to display complaints with view details button
  const displayComplaints = () => {
    if (loadingComplaints) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            {t.loading}
          </td>
        </tr>
      );
    }
    
    if (complaintsToShow.length === 0) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
            {t.noComplaints}
          </td>
        </tr>
      );
    }
    
    return complaintsToShow.slice(0, 10).map((complaint, index) => {
      const displayDate = complaint.submittedDate ? formatTableDate(complaint.submittedDate) : '-';
      const displayIndex = formatCount(index + 1);
      
      return (
        <tr key={`${complaint.type}-${complaint.id}`} className="complaint-row">
          <td data-label={t.complaintId}>{displayIndex}</td>
          <td data-label={t.complainantName}>
            <div className="complainant-info">
              <span className="complainant-name">{language === 'np' ? complaint.name : complaint.nameEn}</span>
              {complaint.phone && complaint.phone !== 'N/A' && <span className="complainant-phone">📞 {complaint.phone}</span>}
            </div>
          </td>
          <td data-label={t.complaintDetails}>
            <div className="complaint-preview">
              {language === 'np' 
                ? (complaint.complaint || 'No description').substring(0, 60)
                : (complaint.complaintEn || complaint.complaint || 'No description').substring(0, 60)}
              {((language === 'np' ? complaint.complaint : complaint.complaintEn)?.length > 60 ? '...' : '')}
            </div>
            {complaint.subject && (
              <div className="complaint-subject">
                📌 {language === 'np' ? 'विषय:' : 'Subject:'} {complaint.subject}
              </div>
            )}
          </td>
          <td data-label={t.complaintDate}>{displayDate}</td>
          <td data-label={t.complaintStatus}>
            <span className={`status-badge ${getStatusClass(complaint.status)}`}>
              {getStatusText(complaint.status, complaint.statusEn)}
            </span>
          </td>
          <td data-label={t.category}>
            <span className="category-badge">
              {language === 'np' ? complaint.category : complaint.categoryEn}
            </span>
          </td>
          <td data-label={t.viewDetails}>
            <button 
              className="view-details-btn"
              onClick={() => viewComplaintDetails(complaint)}
            >
              🔍 {t.viewDetails}
            </button>
          </td>
        </tr>
      );
    });
  };

  const LogoImage = ({ src, alt, fallback, className }) => {
    const [imgError, setImgError] = useState(false);
    if (imgError || !src) {
      return <div className={`logo-fallback ${className}`}>{fallback}</div>;
    }
    return <img src={src} alt={alt} className={className} onError={() => setImgError(true)} />;
  };

  const ChannelIcon = ({ channel }) => {
    const [imgError, setImgError] = useState(false);
    if (channel.isImage && !imgError && channel.icon) {
      return (
        <img
          src={channel.icon}
          alt={channel.enName}
          className="channel-icon-image"
          onError={() => setImgError(true)}
        />
      );
    }
    return <span className="channel-emoji" style={{ color: channel.color }}>{channel.fallback || channel.icon}</span>;
  };

  const EmailIconComponent = ({ className }) => {
    const [error, setError] = useState(false);
    if (error || !emailIcon) {
      return <span className={className || "contact-icon"}>✉️</span>;
    }
    return (
      <img
        src={emailIcon}
        alt="Email"
        className={className || "contact-icon-image"}
        onError={() => setError(true)}
      />
    );
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  return (
    <div className="landing-page">
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

      {/* HEADER 1 - Top Bar */}
      <div className="header-1">
        <div className="container-1">
          <div className="header-left">
            <div className="we-are-here">
              <span className="quote-text">{t.weAreHere}</span>
            </div>
          </div>
          <div className="header-right">
            <div className="contact-info-group">
              <div className="contact-info-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">{t.contactNumber}</span>
              </div>
              <div className="contact-info-item">
                <EmailIconComponent className="contact-icon-image" />
                <span className="contact-text">{t.emailAddress}</span>
              </div>
            </div>
            <div className="language-dropdown">
              <button
                className="language-selector"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <span className="lang-icon">🌐</span>
                <span className="lang-text">{language === 'np' ? 'नेपाली' : 'English'}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {showLanguageDropdown && (
                <div className="dropdown-menu">
                  <button
                    className={`dropdown-item ${language === 'np' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('np')}
                  >
                    <span className="lang-flag">🇳🇵</span>
                    <span>नेपाली</span>
                  </button>
                  <button
                    className={`dropdown-item ${language === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    <span className="lang-flag">🇬🇧</span>
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HEADER 2 - Department Level with Logos */}
      <div className="header-2">
        <div className="container-2">
          <div className="logo-left">
            <LogoImage src={ntcLogo} alt="NTC Logo" fallback="📡" className="ntc-logo" />
          </div>
          <div className="dept-text-center">
            <div className="dept-name">{t.departmentName}</div>
            <div className="dept-address">{t.departmentAddress}</div>
          </div>
          <div className="logo-right">
            <LogoImage src={govLogo} alt="Government Logo" fallback="🇳🇵" className="gov-logo" />
          </div>
        </div>
      </div>

      {/* HEADER 3 - Navigation Bar */}
      <div className="header-3">
        <div className="container-3">
          <div className="nav-menu-left">
            <button onClick={() => scrollToSection('home')} className="nav-btn">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">{t.home}</span>
            </button>
            <button onClick={() => navigate('/faqs')} className="nav-btn">
              <span className="nav-icon">❓</span>
              <span className="nav-text">{t.faqs}</span>
            </button>
            <button onClick={manualRefresh} className="nav-btn">
              <span className="nav-icon">🔄</span>
              <span className="nav-text">{t.refreshData}</span>
            </button>
          </div>
          <div className="login-btn-right">
            <button className="login-btn" onClick={() => navigate('/login')}>
              <span className="login-icon">🔐</span>
              <span className="login-text">{t.login}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-container">
            <div className="hero-left">
              <div className="hero-icon">📢</div>
              <h2>{t.heroTitle}</h2>
              <p>{t.heroText}</p>
              <div className="hero-quote">✨ {t.heroQuote} ✨</div>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => navigate('/submit-complaint')}>
                  <span>📝</span> {t.submitComplaint}
                </button>
                <button className="btn-secondary" onClick={() => navigate('/track-complaint')}>
                  <span>🔍</span> {t.trackComplaint}
                </button>
              </div>
              <div className="complaint-regarding-container">
                <button className="btn-complaint-regarding" onClick={() => navigate('/complaint-regarding')}>
                  <span>📋</span> {t.complaintRegarding}
                </button>
              </div>
            </div>
            <div className="hero-right">
              {!heroImageError && heroImage ? (
                <div className="hero-image-wrapper">
                  <img src={heroImage} alt="NTC Customer Support" className="hero-illustration" onError={() => setHeroImageError(true)} />
                </div>
              ) : (
                <div className="hero-illustration-fallback">
                  <div className="fallback-icon">📱</div>
                  <div className="fallback-text">NTC Customer Support</div>
                  <div className="fallback-subtext">24/7 Available</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Complaint Channels Section */}
        <section className="channels-section">
          <div className="channels-container">
            <h3 className="channels-title">{t.channelsTitle}</h3>
            <div className="channels-list">
              {complaintChannels.map((channel, index) => (
                <div 
                  key={index} 
                  className="channel-item"
                  onClick={channel.action}
                  style={{ cursor: channel.action ? 'pointer' : 'default' }}
                >
                  <div className="channel-icon-wrapper" style={{ backgroundColor: channel.bgColor }}>
                    <ChannelIcon channel={channel} />
                  </div>
                  <span className="channel-name">{language === 'np' ? channel.name : channel.enName}</span>
                  {channel.contact && <span className="channel-contact">{channel.contact}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Public Complaints Table and Latest Status Side by Side */}
        <div className="stats-public-container">
          <div className="public-complaints-card">
            <div className="card-header">
              <h3>📋 {t.publicComplaintsTitle}</h3>
              <div className="tab-buttons">
                <button 
                  className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  {t.allComplaints}
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'regular' ? 'active' : ''}`}
                  onClick={() => setActiveTab('regular')}
                >
                  {t.regularComplaints}
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'regarding' ? 'active' : ''}`}
                  onClick={() => setActiveTab('regarding')}
                >
                  {t.regardingComplaints}
                </button>
              </div>
              <button onClick={manualRefresh} className="refresh-btn" title={t.refreshData}>
                🔄 {t.refreshData}
              </button>
            </div>
            <div className="table-wrapper">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>{t.complaintId}</th>
                    <th>{t.complainantName}</th>
                    <th>{t.complaintDetails}</th>
                    <th>{t.complaintDate}</th>
                    <th>{t.complaintStatus}</th>
                    <th>{t.category}</th>
                    <th>{t.viewDetails}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayComplaints()}
                </tbody>
              </table>
            </div>
          </div>

          <div className="latest-status-card">
            <h3>📊 {t.latestStatusTitle}</h3>
            {currentStatusCounts.map((item, idx) => (
              <div key={idx} className="status-item">
                <div className="status-title">{item.title}</div>
                <div className="status-number">{item.count}</div>
                <div className="status-range">{item.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Section */}
        <section className="statistics">
          <div className="container">
            <h3>{t.statsTitle}</h3>
            <div className="stats-grid">
              {channelStats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-info">
                    <span className="stat-name">{language === 'np' ? stat.name : stat.enName}</span>
                    <div className="stat-right">
                      <span className="stat-percentage">{formatPercentage(stat.percentage)}</span>
                      <span className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="stat-bar-wrapper">
                    <div className="stat-bar" style={{ width: `${Math.min(stat.percentage * 2, 100)}%`, backgroundColor: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="quick-links">
              <span>{t.links}</span>
              <button onClick={() => navigate('/complaints')}>{t.complaints}</button>
              <button onClick={() => navigate('/faqs')}>{t.faqs}</button>
              <button onClick={() => navigate('/policy')}>{t.policy}</button>
            </div>
          </div>
        </section>

        {/* Network & Signal Complaints Section */}
        <div className="signal-section">
          <div className="signal-container">
            <div className="signal-card">
              <h3>📶 {t.netcomSignalComplaints}</h3>
              <p>{t.netcomSignalText}</p>
              <div className="complaint-list">
                {latestComplaints.map((complaint, idx) => {
                  const displayCount = language === 'np' ? complaint.count : complaint.count.replace(/[०-९]/g, (d) => {
                    const map = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
                    return map[d] || d;
                  });
                  return (
                    <div key={idx} className="complaint-item">
                      <span className="complaint-category">
                        {getTrendIcon('up')} {language === 'np' ? complaint.category : complaint.enCategory}
                      </span>
                      <div className="complaint-meta">
                        <span className="complaint-count">📊 {displayCount}</span>
                        <span className="complaint-date">📅 {language === 'np' ? complaint.date : complaint.enDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="contact-card">
              <h3>📞 {t.contactInfo}</h3>
              <div className="contact-details">
                <p><strong>📱 {t.helpline}:</strong> 198 ({t.tollFree})</p>
                <p><strong><EmailIconComponent className="contact-card-email-icon" /> {t.email}:</strong> {t.emailAddress}</p>
                <p><strong>📍 {t.address}:</strong> {t.departmentAddress}</p>
                <p><strong>📞 {t.phone}:</strong> {t.contactNumber}</p>
              </div>
              <div className="support-hours">
                <span>🕐 {language === 'np' ? 'सेवा समय: २४/७' : 'Support Hours: 24/7'}</span>
              </div>
              <button className="contact-now-btn" onClick={() => window.location.href = 'tel:198'}>
                📞 {t.contactNow}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-copyright">
              <p>{t.footerTagline}</p>
              <p className="copyright-text">{t.copyright}</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Complaint Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 {language === 'np' ? 'गुनासोको विस्तृत विवरण' : 'Complaint Details'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* Complaint Information Section */}
              <div className="detail-section">
                <h4 className="section-subtitle">📌 {t.complaintInfo}</h4>
                <div className="detail-row">
                  <span className="detail-label">{t.complaintNumber}:</span>
                  <span className="detail-value">{selectedComplaint.complaintNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.category}:</span>
                  <span className="detail-value">{language === 'np' ? selectedComplaint.category : selectedComplaint.categoryEn}</span>
                </div>
                {selectedComplaint.subject && (
                  <div className="detail-row">
                    <span className="detail-label">{t.subject}:</span>
                    <span className="detail-value">{selectedComplaint.subject}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">{t.priority}:</span>
                  <span className={`detail-value ${selectedComplaint.priority === 'उच्च' || selectedComplaint.priority === 'High' ? 'priority-high' : selectedComplaint.priority === 'मध्यम' || selectedComplaint.priority === 'Medium' ? 'priority-medium' : 'priority-low'}`}>
                    {selectedComplaint.priority || (language === 'np' ? 'मध्यम' : 'Medium')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.complaintStatus}:</span>
                  <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>
                    {getStatusText(selectedComplaint.status, selectedComplaint.statusEn)}
                  </span>
                </div>
              </div>

              {/* Complainant Information Section */}
              <div className="detail-section">
                <h4 className="section-subtitle">👤 {t.complainantInfo}</h4>
                <div className="detail-row">
                  <span className="detail-label">{t.complainantName}:</span>
                  <span className="detail-value">{language === 'np' ? selectedComplaint.name : selectedComplaint.nameEn}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.phoneNumber}:</span>
                  <span className="detail-value">{selectedComplaint.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.emailAddress}:</span>
                  <span className="detail-value">{selectedComplaint.email || 'N/A'}</span>
                </div>
              </div>

              {/* Address Information Section */}
              {(selectedComplaint.address || selectedComplaint.landmark) && (
                <div className="detail-section">
                  <h4 className="section-subtitle">📍 {t.addressInfo}</h4>
                  {selectedComplaint.address && (
                    <div className="detail-row">
                      <span className="detail-label">{t.address}:</span>
                      <span className="detail-value">{selectedComplaint.address}</span>
                    </div>
                  )}
                  {selectedComplaint.landmark && (
                    <div className="detail-row">
                      <span className="detail-label">{t.landmark}:</span>
                      <span className="detail-value">{selectedComplaint.landmark}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Complaint Description Section */}
              <div className="detail-section">
                <h4 className="section-subtitle">📝 {t.description}</h4>
                <div className="detail-row full-width">
                  <span className="detail-value complaint-text">
                    {language === 'np' ? selectedComplaint.complaint : selectedComplaint.complaintEn}
                  </span>
                </div>
              </div>

              {/* Date Information Section */}
              <div className="detail-section">
                <h4 className="section-subtitle">📅 {t.dateInfo}</h4>
                <div className="detail-row">
                  <span className="detail-label">{t.submittedDate}:</span>
                  <span className="detail-value">{selectedComplaint.formattedSubmittedDate}</span>
                </div>
                {selectedComplaint.formattedUpdatedDate && selectedComplaint.formattedUpdatedDate !== '-' && (
                  <div className="detail-row">
                    <span className="detail-label">{t.lastUpdated}:</span>
                    <span className="detail-value">{selectedComplaint.formattedUpdatedDate}</span>
                  </div>
                )}
              </div>

              {/* Resolution Section */}
              {selectedComplaint.resolution && (
                <div className="detail-section">
                  <h4 className="section-subtitle">✅ {t.resolution}</h4>
                  <div className="detail-row full-width">
                    <span className="detail-value complaint-text">{selectedComplaint.resolution}</span>
                  </div>
                </div>
              )}

              {/* Assigned To Section */}
              {selectedComplaint.assignedTo && (
                <div className="detail-section">
                  <h4 className="section-subtitle">👨‍💼 {t.assignedTo}</h4>
                  <div className="detail-row">
                    <span className="detail-label">{t.assignedTo}:</span>
                    <span className="detail-value">{selectedComplaint.assignedTo}</span>
                  </div>
                </div>
              )}

              {/* Reference Number for Complaint Regarding */}
              {selectedComplaint.referenceNumber && (
                <div className="detail-section">
                  <h4 className="section-subtitle">📌 {t.referenceNo}</h4>
                  <div className="detail-row">
                    <span className="detail-label">{t.referenceNo}:</span>
                    <span className="detail-value">{selectedComplaint.referenceNumber}</span>
                  </div>
                </div>
              )}

              {/* Preferred Contact for Complaint Regarding */}
              {selectedComplaint.preferredContact && (
                <div className="detail-section">
                  <h4 className="section-subtitle">📞 {t.preferredContact}</h4>
                  <div className="detail-row">
                    <span className="detail-label">{t.preferredContact}:</span>
                    <span className="detail-value">{selectedComplaint.preferredContact}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn-close" onClick={closeModal}>
                {t.close}
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

        .landing-page {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          color: #1a2c3e;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* HEADER FIX - Proper positioning to prevent overlap */
        .header-1, .header-2, .header-3 {
          position: fixed;
          left: 0;
          width: 100%;
          z-index: 1000;
        }
        
        .header-1 {
          top: 0;
          z-index: 1003;
          height: 55px;
          min-height: 55px;
        }
        
        .header-2 {
          top: 55px;
          z-index: 1002;
          height: 64px;
          min-height: 64px;
        }
        
        .header-3 {
          top: 119px;
          z-index: 1001;
          height: 58px;
          min-height: 58px;
        }

        /* Main Content Padding - Fixed to accommodate fixed headers */
        .main-content {
          flex: 1;
          padding-top: 195px; /* header-1 (55px) + header-2 (64px) + header-3 (58px) + extra breathing room */
          min-height: calc(100vh - 195px);
        }

        /* HEADER 1 - Top Bar */
        .header-1 {
          background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
          color: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .container-1 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          width: 100%;
        }

        .header-left { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .we-are-here {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          padding: 4px 16px;
          border-radius: 40px;
          font-weight: 500;
        }
        .quote-text { font-size: 0.8rem; letter-spacing: 0.5px; font-weight: 600; white-space: nowrap; }

        .header-right { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; flex-shrink: 0; }
        .contact-info-group { display: flex; align-items: center; gap: 10px; }
        .contact-info-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.7rem;
          background: rgba(255,255,255,0.1);
          padding: 3px 10px;
          border-radius: 30px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .contact-info-item:hover { background: rgba(255,255,255,0.25); }
        .contact-icon { font-size: 0.75rem; }
        .contact-text { font-size: 0.7rem; font-weight: 500; }
        .contact-icon-image { width: 14px; height: 14px; object-fit: contain; filter: brightness(0) invert(1); }

        /* Language Dropdown */
        .language-dropdown { position: relative; flex-shrink: 0; }
        .language-selector {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 4px 10px;
          border-radius: 30px;
          cursor: pointer;
          color: white;
          font-size: 0.7rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .language-selector:hover { background: rgba(255,255,255,0.25); }
        .lang-icon { font-size: 0.75rem; }
        .lang-text { font-size: 0.7rem; }
        .dropdown-arrow { font-size: 0.5rem; margin-left: 3px; }
        .dropdown-menu {
          position: absolute;
          top: 32px;
          right: 0;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 1050;
          min-width: 110px;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 6px 12px;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s ease;
          text-align: left;
        }
        .dropdown-item:hover { background: #f0f2f5; }
        .dropdown-item.active { background: #1565c0; color: white; }
        .lang-flag { font-size: 0.9rem; }

        /* HEADER 2 - Department Level */
        .header-2 {
          background: linear-gradient(135deg, #e8f0fe 0%, #ffffff 100%);
          color: #1a2c3e;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-bottom: 1px solid rgba(21, 101, 192, 0.15);
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .container-2 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          width: 100%;
        }
        .logo-left { flex: 1; display: flex; justify-content: flex-start; align-items: center; }
        .logo-right { flex: 1; display: flex; justify-content: flex-end; align-items: center; }
        .ntc-logo, .gov-logo { height: 42px; width: auto; object-fit: contain; }
        .logo-fallback {
          font-size: 1.6rem;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1565c0, #42a5f5);
          border-radius: 50%;
          color: white;
        }
        .dept-text-center { flex: 2; text-align: center; }
        .dept-name { font-size: 0.9rem; font-weight: 700; color: #0d47a1; letter-spacing: 0.5px; }
        .dept-address { font-size: 0.7rem; opacity: 0.7; color: #555; margin-top: 2px; }

        /* HEADER 3 - Navigation Bar */
        .header-3 {
          background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .container-3 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          width: 100%;
        }
        .nav-menu-left { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .nav-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 16px;
          border-radius: 40px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.15); }
        .nav-icon { font-size: 0.95rem; }
        .nav-text { font-size: 0.85rem; white-space: nowrap; }
        .login-btn-right { display: flex; align-items: center; flex-shrink: 0; }
        .login-btn {
          background: transparent;
          border: 2px solid white;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 24px;
          border-radius: 40px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .login-btn:hover { background: white; color: #1565c0; }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
          padding: 40px 20px;
          border-bottom: 4px solid #1565c0;
        }

        .hero-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          flex-wrap: wrap;
        }

        .hero-left { flex: 1; min-width: 280px; }
        .hero-icon { font-size: 2.5rem; margin-bottom: 15px; }
        .hero-left h2 { font-size: 1.5rem; color: #0d47a1; margin-bottom: 15px; line-height: 1.4; }
        .hero-left p { font-size: 1rem; color: #2c4e6e; margin-bottom: 15px; line-height: 1.6; }
        .hero-quote { font-size: 1rem; font-weight: 600; color: #1565c0; margin-bottom: 20px; font-style: italic; }

        .hero-buttons { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px; }
        .btn-primary, .btn-secondary {
          padding: 12px 28px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary { background: #1565c0; color: white; }
        .btn-primary:hover { background: #0d47a1; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.15); }
        .btn-secondary { background: white; color: #1565c0; border: 2px solid #1565c0; }
        .btn-secondary:hover { background: #1565c0; color: white; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.15); }

        .complaint-regarding-container { margin-top: 10px; text-align: left; }
        .btn-complaint-regarding {
          padding: 14px 32px;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid #1565c0;
          font-size: 1rem;
          background: white;
          color: #1565c0;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .btn-complaint-regarding:hover { background: #1565c0; color: white; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.15); }

        .hero-right { flex: 1; display: flex; justify-content: flex-end; align-items: center; min-width: 250px; }
        .hero-image-wrapper { width: 100%; max-width: 550px; display: flex; justify-content: center; align-items: center; }
        .hero-illustration { width: 100%; max-width: 500px; height: auto; border-radius: 20px; object-fit: contain; display: block; }
        .hero-illustration-fallback {
          width: 100%;
          max-width: 400px;
          background: linear-gradient(135deg, #1565c0, #42a5f5);
          border-radius: 20px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }
        .fallback-icon { font-size: 3rem; margin-bottom: 15px; }
        .fallback-text { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
        .fallback-subtext { font-size: 0.85rem; opacity: 0.9; }

        /* Complaint Channels Section */
        .channels-section {
          background: white;
          padding: 30px 20px;
          border-bottom: 1px solid #e2e9f0;
        }
        .channels-container { max-width: 1200px; margin: 0 auto; }
        .channels-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a2c3e;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #1565c0;
          display: inline-block;
        }
        .channels-list {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 15px;
          justify-content: center;
        }
        .channel-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          cursor: default;
          min-width: 90px;
        }
        .channel-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          border-color: #1565c0;
          background: linear-gradient(135deg, #ffffff, #e3f2fd);
        }
        .channel-icon-wrapper { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
        .channel-icon-image { width: 28px; height: 28px; object-fit: contain; }
        .channel-emoji { font-size: 1.6rem; }
        .channel-name { font-size: 0.75rem; font-weight: 600; color: #1a2c3e; text-align: center; }
        .channel-contact { font-size: 0.6rem; color: #1565c0; font-weight: 500; margin-top: 3px; }

        /* Public Complaints and Latest Status Container */
        .stats-public-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .public-complaints-card, .latest-status-card {
          background: white;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          border: 1px solid #e8e8e8;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tab-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 5px 14px;
          border-radius: 20px;
          border: 1px solid #e0e0e0;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.7rem;
        }

        .tab-btn.active {
          background: #1565c0;
          color: white;
          border-color: #1565c0;
        }

        .public-complaints-card h3, .latest-status-card h3 {
          font-size: 1.1rem;
          color: #0d47a1;
          margin: 0;
          border-left: 4px solid #1565c0;
          padding-left: 14px;
        }

        .refresh-btn {
          background: #1565c0;
          color: white;
          border: none;
          padding: 5px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.7rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .refresh-btn:hover { background: #0d47a1; }

        .table-wrapper { overflow-x: auto; }
        .complaints-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .complaints-table th, .complaints-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        .complaints-table th { background: #f5f7fa; font-weight: 600; color: #0d47a1; font-size: 0.75rem; }
        .complaint-row:hover { background: #f8fafc; }

        .complainant-info { display: flex; flex-direction: column; gap: 3px; }
        .complainant-name { font-weight: 500; font-size: 0.85rem; }
        .complainant-phone { font-size: 0.65rem; color: #6c8196; }

        .complaint-preview { font-size: 0.8rem; color: #333; line-height: 1.4; }
        .complaint-subject { font-size: 0.65rem; color: #1565c0; margin-top: 3px; }

        .category-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.65rem;
          background: #e3f2fd;
          color: #1565c0;
        }

        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 600; }
        .status-progress { background: #fff3cd; color: #856404; }
        .status-resolved { background: #d4edda; color: #155724; }
        .status-pending { background: #f8d7da; color: #721c24; }
        .status-review { background: #fff3cd; color: #856404; }
        .status-closed { background: #e0e0e0; color: #555; }
        .status-rejected { background: #f8d7da; color: #c62828; }

        .status-item {
          background: #f5f7fa;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 14px;
          transition: all 0.3s ease;
        }
        .status-item:hover { transform: translateX(4px); background: #e8edf5; }
        .status-title { font-weight: 500; font-size: 0.8rem; color: #1a2c3e; margin-bottom: 6px; }
        .status-number { font-size: 1.3rem; font-weight: 700; color: #1565c0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .status-range { font-size: 0.65rem; font-weight: normal; color: #6c8196; margin-top: 3px; }

        .view-details-btn {
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.65rem;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .view-details-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(21,101,192,0.3); }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #e0e0e0;
          border-top-color: #1565c0;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
          margin-right: 6px;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Statistics */
        .statistics {
          background: white;
          padding: 40px 20px;
        }
        .container { max-width: 1000px; margin: 0 auto; }
        .statistics h3 { text-align: center; margin-bottom: 28px; color: #0d47a1; font-size: 1.2rem; }
        .stats-grid { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
        .stat-card { background: #f5f7fa; border-radius: 10px; overflow: hidden; }
        .stat-bar-wrapper { height: 6px; background: #e0e0e0; }
        .stat-bar { height: 6px; transition: width 0.5s ease; }
        .stat-info {
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 500;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 0.8rem;
        }
        .stat-right { display: flex; align-items: center; gap: 10px; }
        .stat-percentage { font-weight: 700; color: #0d47a1; }
        .stat-change { font-size: 0.65rem; font-weight: 500; }
        .stat-change.positive { color: #10b981; }
        .stat-change.negative { color: #ef4444; }
        .quick-links { text-align: center; padding-top: 18px; border-top: 1px solid #e0e0e0; }
        .quick-links span { font-weight: 600; margin-right: 12px; color: #1565c0; }
        .quick-links button {
          background: none;
          border: none;
          color: #1565c0;
          margin: 0 6px;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.3s;
          font-size: 0.8rem;
        }
        .quick-links button:hover { color: #0d47a1; text-decoration: underline; }

        /* Signal Section */
        .signal-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }
        .signal-container { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .signal-card, .contact-card {
          background: white;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          border: 1px solid #e8e8e8;
          transition: all 0.3s ease;
        }
        .signal-card:hover, .contact-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .signal-card h3, .contact-card h3 {
          font-size: 1.1rem;
          color: #0d47a1;
          margin-bottom: 16px;
          border-left: 4px solid #1565c0;
          padding-left: 14px;
        }
        .signal-card p { font-size: 0.85rem; color: #6c8196; }
        .complaint-list { margin-top: 16px; }
        .complaint-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
          flex-wrap: wrap;
          gap: 6px;
        }
        .complaint-item:last-child { border-bottom: none; }
        .complaint-category { font-weight: 500; font-size: 0.85rem; color: #1a2c3e; }
        .complaint-meta { display: flex; gap: 12px; align-items: center; }
        .complaint-count { font-size: 0.7rem; color: #1565c0; font-weight: 500; }
        .complaint-date { color: #6c8196; font-size: 0.7rem; }

        .contact-details { line-height: 1.8; }
        .contact-details p { margin: 10px 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 0.85rem; }
        .contact-card-email-icon { width: 14px; height: 14px; object-fit: contain; }

        .support-hours {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 500;
          color: #1565c0;
        }

        .contact-now-btn {
          width: 100%;
          margin-top: 14px;
          padding: 10px;
          background: #1565c0;
          color: white;
          border: none;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.9rem;
        }
        .contact-now-btn:hover { background: #0d47a1; transform: translateY(-2px); }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e0e0e0;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          color: white;
          border-radius: 20px 20px 0 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .modal-header h3 { margin: 0; font-size: 1.1rem; }
        .modal-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .modal-close:hover { background: rgba(255,255,255,0.2); }

        .modal-body { padding: 20px; }
        .detail-section { margin-bottom: 20px; }
        .detail-section:last-child { margin-bottom: 0; }
        .section-subtitle {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0d47a1;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e0e0e0;
        }

        .detail-row { display: flex; margin-bottom: 6px; flex-wrap: wrap; }
        .detail-label { width: 35%; font-weight: 600; color: #0d47a1; font-size: 0.8rem; }
        .detail-value { width: 65%; color: #333; word-break: break-word; font-size: 0.85rem; }
        .detail-row.full-width .detail-value { width: 100%; }
        .complaint-text { line-height: 1.5; white-space: pre-wrap; background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 0.85rem; }

        .modal-footer {
          padding: 14px 20px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
          background: white;
          border-radius: 0 0 20px 20px;
        }
        .modal-btn-close {
          background: #f0f0f0;
          color: #666;
          border: none;
          padding: 8px 20px;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
        }
        .modal-btn-close:hover { background: #e0e0e0; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        /* Footer */
        .footer {
          background: #0d2b5e;
          color: white;
          padding: 16px 20px;
          margin-top: 30px;
          text-align: center;
        }
        .footer-content { max-width: 1200px; margin: 0 auto; }
        .footer-copyright { text-align: center; font-size: 0.65rem; opacity: 0.7; }
        .copyright-text { margin-top: 4px; font-size: 0.6rem; }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-public-container { grid-template-columns: 1fr; gap: 20px; }
          .signal-container { grid-template-columns: 1fr; gap: 20px; }
          .hero-container { flex-direction: column; text-align: center; }
          .hero-left { text-align: center; }
          .hero-buttons { justify-content: center; }
          .complaint-regarding-container { text-align: center; }
          .hero-right { justify-content: center; margin-top: 20px; }
          .channels-list { gap: 14px; }
        }

        @media (max-width: 768px) {
          .header-1 { height: auto; min-height: 45px; padding: 6px 0; }
          .header-2 { height: auto; min-height: 50px; padding: 6px 0; }
          .header-3 { height: auto; min-height: 48px; padding: 6px 0; }
          .main-content { padding-top: 165px; }
          
          .container-1, .container-2, .container-3 { flex-direction: column; text-align: center; padding: 0 12px; gap: 6px; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .contact-info-group { flex-direction: column; gap: 4px; }
          .logo-left, .logo-right { display: none; }
          .dept-text-center { flex: 1; }
          .channel-item { min-width: 70px; padding: 12px; }
          .channel-icon-wrapper { width: 40px; height: 40px; }
          .channel-icon-image { width: 22px; height: 22px; }
          .channel-emoji { font-size: 1.3rem; }
          .channel-name { font-size: 0.65rem; }
          .stats-public-container, .signal-section { padding: 24px 12px; }
          .public-complaints-card, .latest-status-card, .signal-card, .contact-card { padding: 16px; }
          
          .hero { padding: 30px 12px; }
          .hero-left h2 { font-size: 1.2rem; }
          .hero-left p { font-size: 0.85rem; }
          .hero-quote { font-size: 0.9rem; }
          .btn-primary, .btn-secondary { padding: 10px 20px; font-size: 0.8rem; }
          .btn-complaint-regarding { padding: 12px 24px; font-size: 0.85rem; }
          
          .detail-row { flex-direction: column; }
          .detail-label { width: 100%; margin-bottom: 4px; }
          .detail-value { width: 100%; }
          .complaint-item { flex-direction: column; align-items: flex-start; }
          .complaint-meta { width: 100%; justify-content: space-between; }
          .modal-content { max-width: 95%; margin: 10px; }
          .toast-notification { top: auto; bottom: 20px; right: 20px; left: 20px; max-width: calc(100% - 40px); }
          .tab-buttons { width: 100%; justify-content: center; }
          .card-header { flex-direction: column; align-items: flex-start; }
          
          .complaints-table { min-width: 500px; }
          .complaints-table th, .complaints-table td { padding: 6px 8px; font-size: 0.65rem; }
          .view-details-btn { font-size: 0.55rem; padding: 3px 8px; }
          .status-number { font-size: 1.1rem; }
        }

        @media (max-width: 480px) {
          .header-1 { min-height: 40px; }
          .header-2 { min-height: 44px; }
          .header-3 { min-height: 42px; }
          .main-content { padding-top: 150px; }
          
          .hero-buttons { flex-direction: column; align-items: center; width: 100%; }
          .btn-primary, .btn-secondary, .btn-complaint-regarding { width: 100%; justify-content: center; }
          .channels-list { gap: 10px; }
          .channel-item { min-width: 60px; padding: 8px; }
          .complaints-table { min-width: 400px; }
          .complaints-table th, .complaints-table td { padding: 4px 6px; font-size: 0.6rem; }
          .view-details-btn { font-size: 0.5rem; padding: 2px 6px; }
          .status-number { font-size: 1rem; }
          .contact-info-item { font-size: 0.55rem; padding: 2px 6px; }
          .contact-text { font-size: 0.55rem; }
          .language-selector { font-size: 0.6rem; padding: 3px 8px; }
          .lang-text { font-size: 0.6rem; }
          .nav-btn { font-size: 0.7rem; padding: 4px 10px; }
          .nav-text { font-size: 0.7rem; }
          .login-btn { font-size: 0.7rem; padding: 4px 14px; }
          .we-are-here .quote-text { font-size: 0.65rem; }
          .dept-name { font-size: 0.75rem; }
          .dept-address { font-size: 0.6rem; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;