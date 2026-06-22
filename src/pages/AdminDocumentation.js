// src/pages/AdminDocumentation.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminDocumentation = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Format number with Nepali digits
  const formatNumber = (num) => {
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return num.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    }
    return num.toString();
  };

  // Format date with language support
  const formatDate = (date) => {
    if (!date) return language === 'np' ? 'कहिल्यै' : 'Never';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return language === 'np' ? 'कहिल्यै' : 'Never';
      if (language === 'np') {
        const year = d.getFullYear() - 57;
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        const yearNp = year.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        const monthNp = month.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        const dayNp = day.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
        return `${yearNp}-${monthNp}-${dayNp}`;
      }
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return language === 'np' ? 'कहिल्यै' : 'Never';
    }
  };

  const content = {
    np: {
      documentation: 'कागजात',
      adminDocumentation: 'प्रशासक कागजात',
      searchDocs: 'कागजातहरू खोज्नुहोस्...',
      gettingStarted: 'सुरु गर्दै',
      dashboard: 'ड्यासबोर्ड',
      complaints: 'गुनासोहरू',
      users: 'प्रयोगकर्ताहरू',
      reports: 'रिपोर्टहरू',
      analytics: 'विश्लेषण',
      settings: 'सेटिङ्स',
      faq: 'बारम्बार सोधिने प्रश्नहरू',
      apiReference: 'एपीआई सन्दर्भ',
      support: 'सहयोग',
      overview: 'अवलोकन',
      introduction: 'परिचय',
      features: 'विशेषताहरू',
      requirements: 'आवश्यकताहरू',
      installation: 'स्थापना',
      configuration: 'कन्फिगरेसन',
      troubleshooting: 'समस्या समाधान',
      printDoc: 'कागजात प्रिन्ट गर्नुहोस्',
      downloadPDF: 'पीडीएफ डाउनलोड गर्नुहोस्',
      helpCenter: 'सहायता केन्द्र',
      contactSupport: 'सहायताको लागि सम्पर्क गर्नुहोस्',
      emailSupport: 'इमेल सहायता',
      phoneSupport: 'फोन सहायता',
      liveChat: 'लाइभ च्याट',
      documentationVersion: 'कागजात संस्करण',
      lastUpdated: 'अन्तिम अपडेट',
      tableOfContents: 'सामग्री तालिका',
      relatedTopics: 'सम्बन्धित विषयहरू',
      wasThisHelpful: 'के यो सहायक थियो?',
      yes: 'हो',
      no: 'होइन',
      feedback: 'प्रतिक्रिया',
      downloadStarted: 'पीडीएफ डाउनलोड सुरु भयो...',
      emailSupportMessage: 'इमेल सहायता: support@ntc.gov.np',
      phoneSupportMessage: 'फोन सहायता: 01-4960008',
      thankYouFeedback: 'धन्यवाद! तपाईंको प्रतिक्रिया दर्ता भयो।',
      version: 'संस्करण'
    },
    en: {
      documentation: 'Documentation',
      adminDocumentation: 'Admin Documentation',
      searchDocs: 'Search documentation...',
      gettingStarted: 'Getting Started',
      dashboard: 'Dashboard',
      complaints: 'Complaints',
      users: 'Users',
      reports: 'Reports',
      analytics: 'Analytics',
      settings: 'Settings',
      faq: 'FAQ',
      apiReference: 'API Reference',
      support: 'Support',
      overview: 'Overview',
      introduction: 'Introduction',
      features: 'Features',
      requirements: 'Requirements',
      installation: 'Installation',
      configuration: 'Configuration',
      troubleshooting: 'Troubleshooting',
      printDoc: 'Print Documentation',
      downloadPDF: 'Download PDF',
      helpCenter: 'Help Center',
      contactSupport: 'Contact Support',
      emailSupport: 'Email Support',
      phoneSupport: 'Phone Support',
      liveChat: 'Live Chat',
      documentationVersion: 'Documentation Version',
      lastUpdated: 'Last Updated',
      tableOfContents: 'Table of Contents',
      relatedTopics: 'Related Topics',
      wasThisHelpful: 'Was this helpful?',
      yes: 'Yes',
      no: 'No',
      feedback: 'Feedback',
      downloadStarted: 'PDF download started...',
      emailSupportMessage: 'Email Support: support@ntc.gov.np',
      phoneSupportMessage: 'Phone Support: 01-4960008',
      thankYouFeedback: 'Thank you! Your feedback has been recorded.',
      version: 'Version'
    }
  };

  const t = content[language];

  const sections = [
    { id: 'getting-started', label: t.gettingStarted, icon: '🚀' },
    { id: 'dashboard', label: t.dashboard, icon: '📊' },
    { id: 'complaints', label: t.complaints, icon: '📋' },
    { id: 'users', label: t.users, icon: '👥' },
    { id: 'reports', label: t.reports, icon: '📈' },
    { id: 'analytics', label: t.analytics, icon: '📉' },
    { id: 'settings', label: t.settings, icon: '⚙️' },
    { id: 'faq', label: t.faq, icon: '❓' },
    { id: 'api', label: t.apiReference, icon: '🔌' },
    { id: 'support', label: t.support, icon: '💬' }
  ];

  const documentationData = {
    'getting-started': {
      title: { np: 'सुरु गर्दै', en: 'Getting Started' },
      content: {
        np: `
          <h2>प्रशासक प्यानलमा स्वागत छ</h2>
          <p>यो कागजातले तपाईंलाई NTC सहयात्री प्रशासक प्यानल प्रयोग गर्न मद्दत गर्नेछ।</p>
          
          <h3>परिचय</h3>
          <p>NTC सहयात्री गुनासो ट्र्याकिङ प्रणाली एक व्यापक समाधान हो जसले नेपाल दूरसञ्चार प्राधिकरणको गुनासोहरू व्यवस्थापन गर्न मद्दत गर्दछ।</p>
          
          <h3>मुख्य विशेषताहरू</h3>
          <ul>
            <li>गुनासो व्यवस्थापन</li>
            <li>प्रयोगकर्ता व्यवस्थापन</li>
            <li>रिपोर्टिङ र एनालिटिक्स</li>
            <li>सूचना प्रणाली</li>
            <li>बहु-भाषा समर्थन</li>
          </ul>
          
          <h3>प्रणाली आवश्यकताहरू</h3>
          <ul>
            <li>आधुनिक वेब ब्राउजर (Chrome, Firefox, Safari, Edge)</li>
            <li>इन्टरनेट जडान</li>
            <li>स्क्रिन रिजोल्युसन: 1024x768 वा माथि</li>
          </ul>
        `,
        en: `
          <h2>Welcome to Admin Panel</h2>
          <p>This documentation will help you use the NTC Sahayatri Admin Panel.</p>
          
          <h3>Introduction</h3>
          <p>NTC Sahayatri Complaint Tracking System is a comprehensive solution that helps manage complaints for Nepal Telecommunications Authority.</p>
          
          <h3>Key Features</h3>
          <ul>
            <li>Complaint Management</li>
            <li>User Management</li>
            <li>Reporting & Analytics</li>
            <li>Notification System</li>
            <li>Multi-language Support</li>
          </ul>
          
          <h3>System Requirements</h3>
          <ul>
            <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
            <li>Internet connection</li>
            <li>Screen resolution: 1024x768 or higher</li>
          </ul>
        `
      }
    },
    'dashboard': {
      title: { np: 'ड्यासबोर्ड', en: 'Dashboard' },
      content: {
        np: `
          <h2>प्रशासक ड्यासबोर्ड</h2>
          <p>ड्यासबोर्ड प्रशासक प्यानलको मुख्य पृष्ठ हो जहाँ तपाईंले सबै महत्त्वपूर्ण जानकारी हेर्न सक्नुहुन्छ।</p>
          
          <h3>ड्यासबोर्ड कम्पोनेन्टहरू</h3>
          <ul>
            <li><strong>तथ्याङ्क कार्डहरू</strong> - कुल गुनासो, विचाराधीन, प्रगतिमा, समाधान</li>
            <li><strong>चार्ट</strong> - मासिक गुनासो प्रवृत्ति</li>
            <li><strong>हालैका गुनासोहरू</strong> - पछिल्ला गुनासोहरूको सूची</li>
            <li><strong>द्रुत कार्यहरू</strong> - सामान्य कार्यहरूको छिटो पहुँच</li>
          </ul>
          
          <h3>ड्यासबोर्ड प्रयोग गर्दै</h3>
          <p>ड्यासबोर्डमा तपाईंले:</p>
          <ul>
            <li>प्रणालीको समग्र अवस्था हेर्न सक्नुहुन्छ</li>
            <li>गुनासोको तथ्याङ्क विश्लेषण गर्न सक्नुहुन्छ</li>
            <li>हालैका गुनासोहरू हेर्न सक्नुहुन्छ</li>
            <li>द्रुत कार्यहरूमा क्लिक गरेर सिधै पृष्ठहरूमा जान सक्नुहुन्छ</li>
          </ul>
        `,
        en: `
          <h2>Admin Dashboard</h2>
          <p>The dashboard is the main page of the admin panel where you can view all important information.</p>
          
          <h3>Dashboard Components</h3>
          <ul>
            <li><strong>Statistics Cards</strong> - Total complaints, pending, in-progress, resolved</li>
            <li><strong>Chart</strong> - Monthly complaint trends</li>
            <li><strong>Recent Complaints</strong> - List of latest complaints</li>
            <li><strong>Quick Actions</strong> - Quick access to common tasks</li>
          </ul>
          
          <h3>Using the Dashboard</h3>
          <p>On the dashboard you can:</p>
          <ul>
            <li>View overall system status</li>
            <li>Analyze complaint statistics</li>
            <li>View recent complaints</li>
            <li>Navigate directly to pages by clicking quick actions</li>
          </ul>
        `
      }
    },
    'complaints': {
      title: { np: 'गुनासोहरू', en: 'Complaints' },
      content: {
        np: `
          <h2>गुनासो व्यवस्थापन</h2>
          <p>गुनासो व्यवस्थापन पृष्ठले तपाईंलाई सबै गुनासोहरू हेर्न, फिल्टर गर्न र व्यवस्थापन गर्न अनुमति दिन्छ।</p>
          
          <h3>गुनासो पृष्ठहरू</h3>
          <ul>
            <li><strong>सबै गुनासो</strong> - सबै गुनासोहरूको सूची</li>
            <li><strong>विचाराधीन गुनासो</strong> - समाधान हुन बाँकी गुनासोहरू</li>
            <li><strong>प्रगतिमा गुनासो</strong> - कार्य प्रगतिमा रहेका गुनासोहरू</li>
            <li><strong>समाधान गुनासो</strong> - समाधान भएका गुनासोहरू</li>
          </ul>
          
          <h3>गुनासो व्यवस्थापन सुविधाहरू</h3>
          <ul>
            <li>खोजी गर्नुहोस् - टिकेट नम्बर, नाम वा फोनले खोज्नुहोस्</li>
            <li>फिल्टर - स्थिति र प्राथमिकता अनुसार फिल्टर गर्नुहोस्</li>
            <li>विवरण हेर्नुहोस् - पूरा गुनासो जानकारी हेर्नुहोस्</li>
            <li>स्थिति अपडेट - गुनासोको स्थिति परिवर्तन गर्नुहोस्</li>
            <li>प्रगति ट्र्याक - कार्यको प्रगति ट्र्याक गर्नुहोस्</li>
          </ul>
        `,
        en: `
          <h2>Complaint Management</h2>
          <p>The complaint management page allows you to view, filter, and manage all complaints.</p>
          
          <h3>Complaint Pages</h3>
          <ul>
            <li><strong>All Complaints</strong> - List of all complaints</li>
            <li><strong>Pending Complaints</strong> - Complaints awaiting resolution</li>
            <li><strong>In Progress Complaints</strong> - Complaints being worked on</li>
            <li><strong>Resolved Complaints</strong> - Completed complaints</li>
          </ul>
          
          <h3>Complaint Management Features</h3>
          <ul>
            <li>Search - Search by ticket number, name or phone</li>
            <li>Filter - Filter by status and priority</li>
            <li>View Details - View complete complaint information</li>
            <li>Update Status - Change complaint status</li>
            <li>Track Progress - Track work progress</li>
          </ul>
        `
      }
    },
    'users': {
      title: { np: 'प्रयोगकर्ताहरू', en: 'Users' },
      content: {
        np: `
          <h2>प्रयोगकर्ता व्यवस्थापन</h2>
          <p>प्रयोगकर्ता व्यवस्थापन पृष्ठले तपाईंलाई प्रणालीका सबै प्रयोगकर्ताहरू व्यवस्थापन गर्न अनुमति दिन्छ।</p>
          
          <h3>प्रयोगकर्ता कार्यहरू</h3>
          <ul>
            <li><strong>नयाँ प्रयोगकर्ता थप्नुहोस्</strong> - नयाँ प्रयोगकर्ता खाता सिर्जना गर्नुहोस्</li>
            <li><strong>प्रयोगकर्ता सम्पादन गर्नुहोस्</strong> - प्रयोगकर्ता जानकारी अपडेट गर्नुहोस्</li>
            <li><strong>स्थिति परिवर्तन गर्नुहोस्</strong> - सक्रिय/निष्क्रिय/निलम्बित</li>
            <li><strong>प्रयोगकर्ता हटाउनुहोस्</strong> - प्रयोगकर्ता खाता मेटाउनुहोस्</li>
            <li><strong>विवरण हेर्नुहोस्</strong> - पूरा प्रयोगकर्ता जानकारी हेर्नुहोस्</li>
          </ul>
          
          <h3>प्रयोगकर्ता भूमिकाहरू</h3>
          <ul>
            <li><strong>प्रशासक</strong> - पूर्ण प्रणाली पहुँच</li>
            <li><strong>कर्मचारी</strong> - सीमित प्रशासनिक पहुँच</li>
            <li><strong>प्रयोगकर्ता</strong> - साधारण प्रयोगकर्ता पहुँच</li>
          </ul>
        `,
        en: `
          <h2>User Management</h2>
          <p>The user management page allows you to manage all users in the system.</p>
          
          <h3>User Actions</h3>
          <ul>
            <li><strong>Add New User</strong> - Create a new user account</li>
            <li><strong>Edit User</strong> - Update user information</li>
            <li><strong>Change Status</strong> - Active/Inactive/Suspended</li>
            <li><strong>Delete User</strong> - Remove user account</li>
            <li><strong>View Details</strong> - View complete user information</li>
          </ul>
          
          <h3>User Roles</h3>
          <ul>
            <li><strong>Admin</strong> - Full system access</li>
            <li><strong>Staff</strong> - Limited administrative access</li>
            <li><strong>User</strong> - Regular user access</li>
          </ul>
        `
      }
    },
    'reports': {
      title: { np: 'रिपोर्टहरू', en: 'Reports' },
      content: {
        np: `
          <h2>रिपोर्टिङ प्रणाली</h2>
          <p>रिपोर्टिङ पृष्ठले तपाईंलाई गुनासो र प्रयोगकर्ता रिपोर्टहरू उत्पन्न गर्न र डाउनलोड गर्न अनुमति दिन्छ।</p>
          
          <h3>रिपोर्ट प्रकारहरू</h3>
          <ul>
            <li><strong>गुनासो रिपोर्ट</strong> - गुनासो तथ्याङ्क र प्रवृत्तिहरू</li>
            <li><strong>प्रयोगकर्ता रिपोर्ट</strong> - प्रयोगकर्ता गतिविधि र तथ्याङ्क</li>
            <li><strong>प्रदर्शन रिपोर्ट</strong> - टोली प्रदर्शन मेट्रिक्स</li>
          </ul>
          
          <h3>रिपोर्ट सुविधाहरू</h3>
          <ul>
            <li>मिति दायरा फिल्टर</li>
            <li>प्रकार अनुसार फिल्टर</li>
            <li>पीडीएफ/एक्सेल निर्यात</li>
            <li>प्रिन्ट गर्नुहोस्</li>
            <li>चार्ट र ग्राफहरू</li>
          </ul>
        `,
        en: `
          <h2>Reporting System</h2>
          <p>The reporting page allows you to generate and download complaint and user reports.</p>
          
          <h3>Report Types</h3>
          <ul>
            <li><strong>Complaint Reports</strong> - Complaint statistics and trends</li>
            <li><strong>User Reports</strong> - User activity and statistics</li>
            <li><strong>Performance Reports</strong> - Team performance metrics</li>
          </ul>
          
          <h3>Report Features</h3>
          <ul>
            <li>Date range filtering</li>
            <li>Filter by type</li>
            <li>Export to PDF/Excel</li>
            <li>Print functionality</li>
            <li>Charts and graphs</li>
          </ul>
        `
      }
    },
    'faq': {
      title: { np: 'बारम्बार सोधिने प्रश्नहरू', en: 'Frequently Asked Questions' },
      content: {
        np: `
          <h2>बारम्बार सोधिने प्रश्नहरू</h2>
          
          <div class="faq-item">
            <h3>प्रश्न: म कसरी नयाँ गुनासो थप्न सक्छु?</h3>
            <p>उत्तर: ड्यासबोर्डको "द्रुत कार्यहरू" खण्डमा "नयाँ गुनासो थप्नुहोस्" बटनमा क्लिक गर्नुहोस् वा साइडबारको "गुनासोहरू" मेनुबाट जानुहोस्।</p>
          </div>
          
          <div class="faq-item">
            <h3>प्रश्न: म कसरी गुनासोको स्थिति अपडेट गर्न सक्छु?</h3>
            <p>उत्तर: गुनासोको विवरण पृष्ठमा जानुहोस् र "स्थिति अपडेट गर्नुहोस्" बटन प्रयोग गर्नुहोस्।</p>
          </div>
          
          <div class="faq-item">
            <h3>प्रश्न: रिपोर्ट कसरी डाउनलोड गर्ने?</h3>
            <p>उत्तर: रिपोर्ट पृष्ठमा जानुहोस्, आफ्नो फिल्टरहरू चयन गर्नुहोस्, र "एक्सेल निर्यात" वा "पीडीएफ निर्यात" बटनमा क्लिक गर्नुहोस्।</p>
          </div>
          
          <div class="faq-item">
            <h3>प्रश्न: भाषा कसरी परिवर्तन गर्ने?</h3>
            <p>उत्तर: हेडरको शीर्ष दायाँ कुनामा रहेको भाषा ड्रपडाउनबाट नेपाली वा अंग्रेजी चयन गर्नुहोस्।</p>
          </div>
          
          <div class="faq-item">
            <h3>प्रश्न: म कसरी समर्थनमा सम्पर्क गर्न सक्छु?</h3>
            <p>उत्तर: हेडरको सम्पर्क जानकारी प्रयोग गर्नुहोस् वा साइडबारको "सहयोग" मेनुबाट "सहायता सम्पर्क" चयन गर्नुहोस्।</p>
          </div>
        `,
        en: `
          <h2>Frequently Asked Questions</h2>
          
          <div class="faq-item">
            <h3>Q: How do I add a new complaint?</h3>
            <p>A: Click the "Add New Complaint" button in the "Quick Actions" section on the dashboard or navigate through the "Complaints" menu in the sidebar.</p>
          </div>
          
          <div class="faq-item">
            <h3>Q: How do I update complaint status?</h3>
            <p>A: Go to the complaint details page and use the "Update Status" button.</p>
          </div>
          
          <div class="faq-item">
            <h3>Q: How do I download reports?</h3>
            <p>A: Go to the reports page, select your filters, and click "Export Excel" or "Export PDF".</p>
          </div>
          
          <div class="faq-item">
            <h3>Q: How do I change the language?</h3>
            <p>A: Select Nepali or English from the language dropdown at the top right corner of the header.</p>
          </div>
          
          <div class="faq-item">
            <h3>Q: How can I contact support?</h3>
            <p>A: Use the contact information in the header or select "Contact Support" from the "Support" menu in the sidebar.</p>
          </div>
        `
      }
    }
  };

  const filteredSections = sections.filter(section => 
    section.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentDoc = documentationData[activeSection] || documentationData['getting-started'];
  const currentTitle = currentDoc.title[language];
  const currentContent = currentDoc.content[language];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    showToast(t.downloadStarted, 'success');
  };

  const handleFeedback = (helpful) => {
    showToast(t.thankYouFeedback, 'success');
  };

  const handleEmailSupport = () => {
    showToast(t.emailSupportMessage, 'info');
  };

  const handlePhoneSupport = () => {
    showToast(t.phoneSupportMessage, 'info');
  };

  return (
    <div className="admin-documentation">
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

      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>📚 {t.documentation}</h1>
                <p>{t.adminDocumentation}</p>
              </div>
              <div className="header-actions">
                <button className="print-btn" onClick={handlePrint}>
                  🖨️ {t.printDoc}
                </button>
                <button className="pdf-btn" onClick={handleDownloadPDF}>
                  📄 {t.downloadPDF}
                </button>
              </div>
            </div>

            <div className="doc-layout">
              {/* Sidebar Navigation */}
              <div className="doc-sidebar">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder={t.searchDocs}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="doc-nav">
                  <h4>{t.tableOfContents}</h4>
                  <ul>
                    {filteredSections.map(section => (
                      <li key={section.id}>
                        <button
                          className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
                          onClick={() => setActiveSection(section.id)}
                        >
                          <span className="nav-icon">{section.icon}</span>
                          <span className="nav-label">{section.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="doc-footer-nav">
                  <h4>{t.helpCenter}</h4>
                  <div className="contact-options">
                    <button className="contact-option" onClick={() => navigate('/admin-contact')}>
                      <span>💬</span> {t.liveChat}
                    </button>
                    <button className="contact-option" onClick={handleEmailSupport}>
                      <span>✉️</span> {t.emailSupport}
                    </button>
                    <button className="contact-option" onClick={handlePhoneSupport}>
                      <span>📞</span> {t.phoneSupport}
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="doc-content">
                <div className="doc-header">
                  <h1>{currentTitle}</h1>
                  <div className="doc-meta">
                    <span>📅 {t.lastUpdated}: {formatDate(new Date().toISOString())}</span>
                    <span>📌 {t.documentationVersion}: 2.0.0</span>
                  </div>
                </div>
                
                <div 
                  className="doc-body"
                  dangerouslySetInnerHTML={{ __html: currentContent }}
                />
                
                <div className="doc-feedback">
                  <p>{t.wasThisHelpful}</p>
                  <div className="feedback-buttons">
                    <button className="feedback-yes" onClick={() => handleFeedback(true)}>
                      👍 {t.yes}
                    </button>
                    <button className="feedback-no" onClick={() => handleFeedback(false)}>
                      👎 {t.no}
                    </button>
                  </div>
                </div>
                
                <div className="doc-related">
                  <h4>{t.relatedTopics}</h4>
                  <div className="related-links">
                    {sections.filter(s => s.id !== activeSection).slice(0, 4).map(section => (
                      <button key={section.id} onClick={() => setActiveSection(section.id)}>
                        {section.icon} {section.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-documentation {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          height: 100vh;
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        /* Toast Notification */
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

        /* Dashboard Layout */
        .dashboard-layout {
          display: flex;
          height: calc(100vh - 195px);
          margin-top: 195px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        /* Sidebar Container - Fixed */
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

        /* Main Container - Scrollable */
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

        .main-container::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
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

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .print-btn, .pdf-btn {
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
        }

        .print-btn {
          background: #f1f5f9;
          color: #475569;
        }

        .print-btn:hover {
          background: #e2e8f0;
        }

        .pdf-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .pdf-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }

        /* Documentation Layout */
        .doc-layout {
          display: flex;
          gap: 32px;
        }

        .doc-sidebar {
          width: 280px;
          flex-shrink: 0;
        }

        .search-box {
          position: relative;
          margin-bottom: 24px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9rem;
          color: #9ca3af;
        }

        .search-box input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .doc-nav {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .doc-nav h4 {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .doc-nav ul {
          list-style: none;
        }

        .doc-nav li {
          margin-bottom: 4px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          color: #475569;
          transition: all 0.2s;
          text-align: left;
        }

        .nav-link:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .nav-link.active {
          background: #eff6ff;
          color: #3b82f6;
        }

        .nav-icon {
          font-size: 1rem;
        }

        .doc-footer-nav {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .doc-footer-nav h4 {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .contact-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .contact-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
          color: #475569;
          transition: all 0.2s;
        }

        .contact-option:hover {
          background: #f1f5f9;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        /* Main Content */
        .doc-content {
          flex: 1;
          background: white;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid #e2e8f0;
        }

        .doc-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }

        .doc-header h1 {
          font-size: 1.8rem;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .doc-meta {
          display: flex;
          gap: 20px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .doc-body {
          line-height: 1.6;
          color: #334155;
        }

        .doc-body h2 {
          font-size: 1.3rem;
          color: #0f172a;
          margin: 24px 0 12px;
        }

        .doc-body h3 {
          font-size: 1.1rem;
          color: #1e293b;
          margin: 20px 0 10px;
        }

        .doc-body p {
          margin-bottom: 16px;
        }

        .doc-body ul {
          margin: 12px 0 20px;
          padding-left: 24px;
        }

        .doc-body li {
          margin-bottom: 8px;
        }

        .doc-body strong {
          color: #0f172a;
        }

        .faq-item {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .faq-item h3 {
          margin-bottom: 8px;
          color: #3b82f6;
        }

        /* Feedback Section */
        .doc-feedback {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .doc-feedback p {
          margin-bottom: 12px;
          color: #64748b;
        }

        .feedback-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .feedback-yes, .feedback-no {
          padding: 6px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.8rem;
          border: 1px solid #e2e8f0;
          background: white;
          transition: all 0.2s;
        }

        .feedback-yes:hover {
          background: #d1fae5;
          border-color: #10b981;
          color: #059669;
        }

        .feedback-no:hover {
          background: #fee2e2;
          border-color: #ef4444;
          color: #dc2626;
        }

        /* Related Topics */
        .doc-related {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .doc-related h4 {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .related-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .related-links button {
          padding: 6px 14px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.75rem;
          color: #475569;
          transition: all 0.2s;
        }

        .related-links button:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .doc-layout {
            flex-direction: column;
          }
          .doc-sidebar {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .admin-documentation {
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
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
          }
          
          .print-btn, .pdf-btn {
            flex: 1;
            text-align: center;
          }
          
          .doc-content {
            padding: 20px;
          }
          
          .doc-header h1 {
            font-size: 1.4rem;
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
          .doc-meta {
            flex-direction: column;
            gap: 4px;
          }
          
          .related-links {
            flex-direction: column;
          }
          
          .related-links button {
            width: 100%;
          }
        }

        /* Print Styles */
        @media print {
          .admin-documentation {
            height: auto;
            overflow: visible;
          }
          
          .dashboard-layout {
            margin-top: 0;
            height: auto;
          }
          
          .main-container {
            margin-left: 0;
            width: 100%;
          }
          
          .header-1, .header-2, .header-3, .sidebar-container, .doc-sidebar, .page-header .header-actions, .doc-feedback, .doc-related {
            display: none;
          }
          
          .doc-content {
            box-shadow: none;
            border: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDocumentation;