// src/pages/AdminReportsComplaints.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import * as XLSX from 'xlsx';

// Import jsPDF and its plugins properly
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminReportsComplaints = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Format number with Nepali digits
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return num.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    }
    return num.toString();
  };

  // Enhanced sample report data with more user details
  const [reportData, setReportData] = useState({
    summary: {
      totalComplaints: 1247,
      pendingComplaints: 342,
      inProgressComplaints: 156,
      resolvedComplaints: 749,
      avgResolutionDays: 5.2,
      satisfactionRate: 78.5,
      thisMonth: 145,
      lastMonth: 132,
      growth: 9.8
    },
    categoryBreakdown: [
      { name: 'इन्टरनेट', enName: 'Internet', count: 425, percentage: 34.1 },
      { name: 'बिलिङ', enName: 'Billing', count: 312, percentage: 25.0 },
      { name: 'नेटवर्क', enName: 'Network', count: 198, percentage: 15.9 },
      { name: 'रिचार्ज', enName: 'Recharge', count: 156, percentage: 12.5 },
      { name: 'प्राविधिक', enName: 'Technical', count: 98, percentage: 7.9 },
      { name: 'सक्रियता', enName: 'Activation', count: 58, percentage: 4.6 }
    ],
    statusBreakdown: [
      { name: 'समाधान', enName: 'Resolved', count: 749, percentage: 60.1 },
      { name: 'विचाराधीन', enName: 'Pending', count: 342, percentage: 27.4 },
      { name: 'प्रगतिमा', enName: 'In Progress', count: 156, percentage: 12.5 }
    ],
    priorityBreakdown: [
      { name: 'उच्च', enName: 'High', count: 423, percentage: 33.9 },
      { name: 'मध्यम', enName: 'Medium', count: 589, percentage: 47.2 },
      { name: 'न्यून', enName: 'Low', count: 235, percentage: 18.9 }
    ],
    monthlyTrend: [
      { month: 'जनवरी', enMonth: 'January', count: 95 },
      { month: 'फेब्रुअरी', enMonth: 'February', count: 102 },
      { month: 'मार्च', enMonth: 'March', count: 118 },
      { month: 'अप्रिल', enMonth: 'April', count: 125 },
      { month: 'मे', enMonth: 'May', count: 132 },
      { month: 'जुन', enMonth: 'June', count: 145 },
      { month: 'जुलाई', enMonth: 'July', count: 158 },
      { month: 'अगस्ट', enMonth: 'August', count: 167 },
      { month: 'सेप्टेम्बर', enMonth: 'September', count: 175 },
      { month: 'अक्टोबर', enMonth: 'October', count: 182 },
      { month: 'नोभेम्बर', enMonth: 'November', count: 190 },
      { month: 'डिसेम्बर', enMonth: 'December', count: 198 }
    ],
    allComplaints: [
      { 
        id: 1, 
        ticketId: 'NTC-2024-001', 
        name: 'रमेश केसी', 
        enName: 'Ramesh KC',
        phone: '9841234567',
        email: 'ramesh.kc@example.com',
        location: 'काठमाडौं',
        enLocation: 'Kathmandu',
        category: 'internet', 
        date: '२०८०-०१-१५', 
        enDate: '2024-01-15', 
        status: 'in-progress', 
        priority: 'high',
        description: 'इन्टरनेट जडानमा समस्या',
        enDescription: 'Internet connection issue',
        assignedTo: 'प्राविधिक टोली',
        enAssignedTo: 'Technical Team',
        channel: 'website'
      },
      { 
        id: 2, 
        ticketId: 'NTC-2024-002', 
        name: 'सीता अधिकारी', 
        enName: 'Sita Adhikari',
        phone: '9842345678',
        email: 'sita.adhikari@example.com',
        location: 'पोखरा',
        enLocation: 'Pokhara',
        category: 'billing', 
        date: '२०८०-०१-१६', 
        enDate: '2024-01-16', 
        status: 'pending', 
        priority: 'medium',
        description: 'बिलमा त्रुटि',
        enDescription: 'Billing error',
        assignedTo: 'बिलिङ टोली',
        enAssignedTo: 'Billing Team',
        channel: 'phone'
      },
      { 
        id: 3, 
        ticketId: 'NTC-2024-003', 
        name: 'हरि शर्मा', 
        enName: 'Hari Sharma',
        phone: '9843456789',
        email: 'hari.sharma@example.com',
        location: 'भरतपुर',
        enLocation: 'Bharatpur',
        category: 'network', 
        date: '२०८०-०१-१७', 
        enDate: '2024-01-17', 
        status: 'resolved', 
        priority: 'high',
        description: 'नेटवर्क आउटेज',
        enDescription: 'Network outage',
        assignedTo: 'नेटवर्क टोली',
        enAssignedTo: 'Network Team',
        channel: 'website'
      },
      { 
        id: 4, 
        ticketId: 'NTC-2024-004', 
        name: 'गीता गुरुङ', 
        enName: 'Gita Gurung',
        phone: '9844567890',
        email: 'gita.gurung@example.com',
        location: 'बुटवल',
        enLocation: 'Butwal',
        category: 'recharge', 
        date: '२०८०-०१-१८', 
        enDate: '2024-01-18', 
        status: 'in-progress', 
        priority: 'low',
        description: 'रिचार्ज सफल भएन',
        enDescription: 'Recharge failed',
        assignedTo: 'प्राविधिक टोली',
        enAssignedTo: 'Technical Team',
        channel: 'whatsapp'
      },
      { 
        id: 5, 
        ticketId: 'NTC-2024-005', 
        name: 'मनोज पाण्डे', 
        enName: 'Manoj Pandey',
        phone: '9845678901',
        email: 'manoj.pandey@example.com',
        location: 'नेपालगञ्ज',
        enLocation: 'Nepalgunj',
        category: 'technical', 
        date: '२०८०-०१-१९', 
        enDate: '2024-01-19', 
        status: 'pending', 
        priority: 'high',
        description: 'सिम कार्ड समस्या',
        enDescription: 'SIM card issue',
        assignedTo: 'प्राविधिक टोली',
        enAssignedTo: 'Technical Team',
        channel: 'email'
      },
      { 
        id: 6, 
        ticketId: 'NTC-2024-006', 
        name: 'अनिता राई', 
        enName: 'Anita Rai',
        phone: '9846789012',
        email: 'anita.rai@example.com',
        location: 'धरान',
        enLocation: 'Dharam',
        category: 'activation', 
        date: '२०८०-०१-२०', 
        enDate: '2024-01-20', 
        status: 'resolved', 
        priority: 'medium',
        description: 'सेवा सक्रियता ढिलाइ',
        enDescription: 'Service activation delay',
        assignedTo: 'सक्रियता टोली',
        enAssignedTo: 'Activation Team',
        channel: 'website'
      }
    ],
    channelBreakdown: [
      { name: 'वेबसाइट पोर्टल', enName: 'Website Portal', count: 587, percentage: 47.1 },
      { name: 'फोन', enName: 'Phone', count: 234, percentage: 18.8 },
      { name: 'व्हाट्सएप', enName: 'WhatsApp', count: 189, percentage: 15.2 },
      { name: 'इमेल', enName: 'Email', count: 145, percentage: 11.6 },
      { name: 'फेसबुक', enName: 'Facebook', count: 92, percentage: 7.3 }
    ]
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Get filtered complaints
  const getFilteredComplaints = () => {
    let filtered = [...reportData.allComplaints];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(c => c.status === selectedStatus);
    }
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(c => c.priority === selectedPriority);
    }
    
    return filtered;
  };

  const filteredComplaints = getFilteredComplaints();

  // Helper functions
  const getCategoryText = (category) => {
    const categories = {
      np: {
        internet: 'इन्टरनेट',
        billing: 'बिलिङ',
        network: 'नेटवर्क',
        recharge: 'रिचार्ज',
        technical: 'प्राविधिक',
        activation: 'सक्रियता',
        signal: 'सिग्नल'
      },
      en: {
        internet: 'Internet',
        billing: 'Billing',
        network: 'Network',
        recharge: 'Recharge',
        technical: 'Technical',
        activation: 'Activation',
        signal: 'Signal'
      }
    };
    return categories[language][category] || category;
  };

  const getStatusText = (status) => {
    const statuses = {
      np: { pending: 'विचाराधीन', 'in-progress': 'प्रगतिमा', resolved: 'समाधान' },
      en: { pending: 'Pending', 'in-progress': 'In Progress', resolved: 'Resolved' }
    };
    return statuses[language][status] || status;
  };

  const getPriorityText = (priority) => {
    const priorities = {
      np: { high: 'उच्च', medium: 'मध्यम', low: 'न्यून' },
      en: { high: 'High', medium: 'Medium', low: 'Low' }
    };
    return priorities[language][priority] || priority;
  };

  const getMonthText = (month) => {
    const months = {
      np: {
        'January': 'जनवरी', 'February': 'फेब्रुअरी', 'March': 'मार्च',
        'April': 'अप्रिल', 'May': 'मे', 'June': 'जुन',
        'July': 'जुलाई', 'August': 'अगस्ट', 'September': 'सेप्टेम्बर',
        'October': 'अक्टोबर', 'November': 'नोभेम्बर', 'December': 'डिसेम्बर'
      },
      en: {
        'जनवरी': 'January', 'फेब्रुअरी': 'February', 'मार्च': 'March',
        'अप्रिल': 'April', 'मे': 'May', 'जुन': 'June',
        'जुलाई': 'July', 'अगस्ट': 'August', 'सेप्टेम्बर': 'September',
        'अक्टोबर': 'October', 'नोभेम्बर': 'November', 'डिसेम्बर': 'December'
      }
    };
    return months[language][month] || month;
  };

  // ===== GENERATE REPORT FUNCTION =====
  const handleGenerateReport = () => {
    const filtered = getFilteredComplaints();
    
    // Calculate statistics based on filtered data
    const total = filtered.length;
    const pending = filtered.filter(c => c.status === 'pending').length;
    const inProgress = filtered.filter(c => c.status === 'in-progress').length;
    const resolved = filtered.filter(c => c.status === 'resolved').length;
    
    // Category breakdown for filtered data
    const categoryMap = {};
    filtered.forEach(c => {
      const cat = getCategoryText(c.category);
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
    
    // Status breakdown for filtered data
    const statusMap = {};
    filtered.forEach(c => {
      const status = getStatusText(c.status);
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusMap).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
    
    // Priority breakdown for filtered data
    const priorityMap = {};
    filtered.forEach(c => {
      const priority = getPriorityText(c.priority);
      priorityMap[priority] = (priorityMap[priority] || 0) + 1;
    });
    const priorityBreakdown = Object.entries(priorityMap).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
    
    // Channel breakdown for filtered data
    const channelMap = {};
    filtered.forEach(c => {
      const channel = c.channel;
      channelMap[channel] = (channelMap[channel] || 0) + 1;
    });
    const channelBreakdown = Object.entries(channelMap).map(([name, count]) => ({
      name: language === 'np' ? 
        { website: 'वेबसाइट', phone: 'फोन', whatsapp: 'व्हाट्सएप', email: 'इमेल', facebook: 'फेसबुक' }[name] || name :
        { website: 'Website', phone: 'Phone', whatsapp: 'WhatsApp', email: 'Email', facebook: 'Facebook' }[name] || name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
    
    // Prepare the generated report
    const report = {
      summary: {
        totalComplaints: total,
        pendingComplaints: pending,
        inProgressComplaints: inProgress,
        resolvedComplaints: resolved,
        avgResolutionDays: resolved > 0 ? 5.2 : 0, // Sample calculation
        satisfactionRate: resolved > 0 ? 78.5 : 0,
        thisMonth: total,
        lastMonth: Math.round(total * 0.9),
        growth: total > 0 ? 9.8 : 0
      },
      categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [
        { name: language === 'np' ? 'कुनै डाटा छैन' : 'No Data', count: 0, percentage: 0 }
      ],
      statusBreakdown: statusBreakdown.length > 0 ? statusBreakdown : [
        { name: language === 'np' ? 'कुनै डाटा छैन' : 'No Data', count: 0, percentage: 0 }
      ],
      priorityBreakdown: priorityBreakdown.length > 0 ? priorityBreakdown : [
        { name: language === 'np' ? 'कुनै डाटा छैन' : 'No Data', count: 0, percentage: 0 }
      ],
      channelBreakdown: channelBreakdown.length > 0 ? channelBreakdown : [
        { name: language === 'np' ? 'कुनै डाटा छैन' : 'No Data', count: 0, percentage: 0 }
      ],
      complaints: filtered,
      generatedAt: new Date().toLocaleString(language === 'np' ? 'ne-NP' : 'en-US')
    };
    
    setGeneratedReport(report);
    setIsReportGenerated(true);
    showToast(
      language === 'np' 
        ? `✅ रिपोर्ट उत्पन्न गरियो (${total} गुनासोहरू)` 
        : `✅ Report generated (${total} complaints)`,
      'success'
    );
  };

  // ===== EXPORT FUNCTIONS =====

  // Generate CSV/Excel data
  const generateExportData = () => {
    const complaints = generatedReport ? generatedReport.complaints : filteredComplaints;
    const isNepali = language === 'np';
    
    return complaints.map(c => ({
      [isNepali ? 'टिकट नं.' : 'Ticket ID']: c.ticketId,
      [isNepali ? 'उजुरीकर्ता' : 'Complainant']: isNepali ? c.name : c.enName,
      [isNepali ? 'फोन नं.' : 'Phone']: c.phone,
      [isNepali ? 'इमेल' : 'Email']: c.email,
      [isNepali ? 'स्थान' : 'Location']: isNepali ? c.location : c.enLocation,
      [isNepali ? 'प्रकार' : 'Category']: getCategoryText(c.category),
      [isNepali ? 'मिति' : 'Date']: isNepali ? c.date : c.enDate,
      [isNepali ? 'स्थिति' : 'Status']: getStatusText(c.status),
      [isNepali ? 'प्राथमिकता' : 'Priority']: getPriorityText(c.priority),
      [isNepali ? 'विवरण' : 'Description']: isNepali ? c.description : c.enDescription,
      [isNepali ? 'जिम्मेवार' : 'Assigned To']: isNepali ? c.assignedTo : c.enAssignedTo,
      [isNepali ? 'च्यानल' : 'Channel']: c.channel
    }));
  };

  // Generate summary data for export
  const generateSummaryData = () => {
    const isNepali = language === 'np';
    const data = [];
    const report = generatedReport || reportData;
    
    // Add summary stats
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'सारांश रिपोर्ट' : 'Summary Report',
      [isNepali ? 'मान' : 'Value']: ''
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'कुल गुनासो' : 'Total Complaints',
      [isNepali ? 'मान' : 'Value']: report.summary.totalComplaints
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'विचाराधीन' : 'Pending',
      [isNepali ? 'मान' : 'Value']: report.summary.pendingComplaints
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'प्रगतिमा' : 'In Progress',
      [isNepali ? 'मान' : 'Value']: report.summary.inProgressComplaints
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'समाधान' : 'Resolved',
      [isNepali ? 'मान' : 'Value']: report.summary.resolvedComplaints
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'औसत समाधान दिन' : 'Avg Resolution Days',
      [isNepali ? 'मान' : 'Value']: report.summary.avgResolutionDays
    });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'सन्तुष्टि दर' : 'Satisfaction Rate',
      [isNepali ? 'मान' : 'Value']: `${report.summary.satisfactionRate}%`
    });
    
    // Add category breakdown
    data.push({ [isNepali ? 'विवरण' : 'Description']: '', [isNepali ? 'मान' : 'Value']: '' });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'प्रकार अनुसार विभाजन' : 'Category Breakdown',
      [isNepali ? 'मान' : 'Value']: ''
    });
    report.categoryBreakdown.forEach(item => {
      data.push({ 
        [isNepali ? 'विवरण' : 'Description']: item.name,
        [isNepali ? 'मान' : 'Value']: `${item.count} (${item.percentage}%)`
      });
    });
    
    // Add status breakdown
    data.push({ [isNepali ? 'विवरण' : 'Description']: '', [isNepali ? 'मान' : 'Value']: '' });
    data.push({ 
      [isNepali ? 'विवरण' : 'Description']: isNepali ? 'स्थिति अनुसार विभाजन' : 'Status Breakdown',
      [isNepali ? 'मान' : 'Value']: ''
    });
    report.statusBreakdown.forEach(item => {
      data.push({ 
        [isNepali ? 'विवरण' : 'Description']: item.name,
        [isNepali ? 'मान' : 'Value']: `${item.count} (${item.percentage}%)`
      });
    });
    
    return data;
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!isReportGenerated) {
      showToast(language === 'np' ? '⚠️ कृपया पहिले रिपोर्ट उत्पन्न गर्नुहोस्' : '⚠️ Please generate report first', 'warning');
      return;
    }
    
    setIsExporting(true);
    showToast(language === 'np' ? '⏳ एक्सेल निर्यात भइरहेको छ...' : '⏳ Exporting Excel...', 'info');
    
    try {
      let exportData;
      let sheetName;
      
      if (activeTab === 'overview') {
        exportData = generateSummaryData();
        sheetName = language === 'np' ? 'सारांश' : 'Summary';
      } else {
        exportData = generateExportData();
        sheetName = language === 'np' ? 'गुनासोहरू' : 'Complaints';
      }
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto column widths
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 20)
      }));
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Create filename
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const filename = `complaints_report_${dateStr}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      setTimeout(() => {
        showToast(language === 'np' ? '✅ एक्सेल फाइल सफलतापूर्वक डाउनलोड भयो' : '✅ Excel file downloaded successfully', 'success');
        setIsExporting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Excel export error:', error);
      showToast(language === 'np' ? '❌ एक्सेल निर्यात गर्न असफल' : '❌ Failed to export Excel', 'error');
      setIsExporting(false);
    }
  };

  // Export to PDF - FIXED VERSION
  const handleExportPDF = () => {
    if (!isReportGenerated) {
      showToast(language === 'np' ? '⚠️ कृपया पहिले रिपोर्ट उत्पन्न गर्नुहोस्' : '⚠️ Please generate report first', 'warning');
      return;
    }
    
    setIsExporting(true);
    showToast(language === 'np' ? '⏳ पीडीएफ निर्यात भइरहेको छ...' : '⏳ Exporting PDF...', 'info');
    
    // Use setTimeout to allow UI to update before PDF generation
    setTimeout(() => {
      try {
        const isNepali = language === 'np';
        const report = generatedReport;
        
        // Create PDF with proper settings
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Add header
        doc.setFillColor(13, 71, 161);
        doc.rect(0, 0, pageWidth, 25, 'F');
        
        // Add title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const title = isNepali ? 'गुनासो रिपोर्ट' : 'Complaints Report';
        doc.text(title, pageWidth / 2, 16, { align: 'center' });
        
        // Add date
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const dateStr = new Date().toLocaleString(isNepali ? 'ne-NP' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        doc.text(`Date: ${dateStr}`, pageWidth - 14, 20, { align: 'right' });
        
        let yPosition = 32;
        
        if (activeTab === 'overview') {
          // ===== SUMMARY SECTION =====
          doc.setTextColor(13, 71, 161);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(isNepali ? 'सारांश' : 'Summary', 14, yPosition);
          yPosition += 6;
          
          // Summary data table
          const summaryData = [
            [isNepali ? 'कुल गुनासो' : 'Total Complaints', String(report.summary.totalComplaints)],
            [isNepali ? 'विचाराधीन' : 'Pending', String(report.summary.pendingComplaints)],
            [isNepali ? 'प्रगतिमा' : 'In Progress', String(report.summary.inProgressComplaints)],
            [isNepali ? 'समाधान' : 'Resolved', String(report.summary.resolvedComplaints)],
            [isNepali ? 'औसत समाधान दिन' : 'Avg Resolution Days', String(report.summary.avgResolutionDays)],
            [isNepali ? 'सन्तुष्टि दर' : 'Satisfaction Rate', `${report.summary.satisfactionRate}%`]
          ];
          
          doc.autoTable({
            startY: yPosition,
            head: [[isNepali ? 'विवरण' : 'Description', isNepali ? 'मान' : 'Value']],
            body: summaryData,
            theme: 'striped',
            styles: { 
              fontSize: 8,
              cellPadding: 3,
              overflow: 'linebreak'
            },
            headStyles: { 
              fillColor: [13, 71, 161], 
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [240, 245, 255] },
            margin: { left: 14, right: 14 }
          });
          
          yPosition = doc.lastAutoTable.finalY + 8;
          
          // ===== CATEGORY BREAKDOWN =====
          if (yPosition < pageHeight - 60 && report.categoryBreakdown.length > 0) {
            doc.setTextColor(13, 71, 161);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(isNepali ? 'प्रकार अनुसार विभाजन' : 'Category Breakdown', 14, yPosition);
            yPosition += 6;
            
            const categoryData = report.categoryBreakdown.map(item => [
              item.name,
              String(item.count),
              `${item.percentage}%`
            ]);
            
            doc.autoTable({
              startY: yPosition,
              head: [[isNepali ? 'प्रकार' : 'Category', isNepali ? 'संख्या' : 'Count', isNepali ? 'प्रतिशत' : 'Percentage']],
              body: categoryData,
              theme: 'striped',
              styles: { 
                fontSize: 8,
                cellPadding: 3
              },
              headStyles: { 
                fillColor: [13, 71, 161], 
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
              },
              alternateRowStyles: { fillColor: [240, 245, 255] },
              margin: { left: 14, right: 14 }
            });
            
            yPosition = doc.lastAutoTable.finalY + 8;
          }
          
          // ===== STATUS BREAKDOWN =====
          if (yPosition < pageHeight - 60 && report.statusBreakdown.length > 0) {
            doc.setTextColor(13, 71, 161);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(isNepali ? 'स्थिति अनुसार विभाजन' : 'Status Breakdown', 14, yPosition);
            yPosition += 6;
            
            const statusData = report.statusBreakdown.map(item => [
              item.name,
              String(item.count),
              `${item.percentage}%`
            ]);
            
            doc.autoTable({
              startY: yPosition,
              head: [[isNepali ? 'स्थिति' : 'Status', isNepali ? 'संख्या' : 'Count', isNepali ? 'प्रतिशत' : 'Percentage']],
              body: statusData,
              theme: 'striped',
              styles: { 
                fontSize: 8,
                cellPadding: 3
              },
              headStyles: { 
                fillColor: [13, 71, 161], 
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
              },
              alternateRowStyles: { fillColor: [240, 245, 255] },
              margin: { left: 14, right: 14 }
            });
            
            yPosition = doc.lastAutoTable.finalY + 8;
          }
          
          // ===== PRIORITY BREAKDOWN =====
          if (yPosition < pageHeight - 60 && report.priorityBreakdown.length > 0) {
            doc.setTextColor(13, 71, 161);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(isNepali ? 'प्राथमिकता अनुसार विभाजन' : 'Priority Breakdown', 14, yPosition);
            yPosition += 6;
            
            const priorityData = report.priorityBreakdown.map(item => [
              item.name,
              String(item.count),
              `${item.percentage}%`
            ]);
            
            doc.autoTable({
              startY: yPosition,
              head: [[isNepali ? 'प्राथमिकता' : 'Priority', isNepali ? 'संख्या' : 'Count', isNepali ? 'प्रतिशत' : 'Percentage']],
              body: priorityData,
              theme: 'striped',
              styles: { 
                fontSize: 8,
                cellPadding: 3              },
              headStyles: { 
                fillColor: [13, 71, 161], 
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
              },
              alternateRowStyles: { fillColor: [240, 245, 255] },
              margin: { left: 14, right: 14 }
            });
            
            yPosition = doc.lastAutoTable.finalY + 8;
          }
          
          // ===== CHANNEL BREAKDOWN =====
          if (yPosition < pageHeight - 60 && report.channelBreakdown.length > 0) {
            doc.setTextColor(13, 71, 161);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(isNepali ? 'च्यानल अनुसार विभाजन' : 'Channel Breakdown', 14, yPosition);
            yPosition += 6;
            
            const channelData = report.channelBreakdown.map(item => [
              item.name,
              String(item.count),
              `${item.percentage}%`
            ]);
            
            doc.autoTable({
              startY: yPosition,
              head: [[isNepali ? 'च्यानल' : 'Channel', isNepali ? 'संख्या' : 'Count', isNepali ? 'प्रतिशत' : 'Percentage']],
              body: channelData,
              theme: 'striped',
              styles: { 
                fontSize: 8,
                cellPadding: 3
              },
              headStyles: { 
                fillColor: [13, 71, 161], 
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
              },
              alternateRowStyles: { fillColor: [240, 245, 255] },
              margin: { left: 14, right: 14 }
            });
          }
          
        } else {
          // ===== COMPLAINTS DETAILS =====
          doc.setTextColor(13, 71, 161);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(isNepali ? 'गुनासो विवरण' : 'Complaint Details', 14, yPosition);
          yPosition += 6;
          
          // Show filter info
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          let filterInfo = '';
          if (selectedCategory !== 'all') filterInfo += `Category: ${getCategoryText(selectedCategory)} `;
          if (selectedStatus !== 'all') filterInfo += `Status: ${getStatusText(selectedStatus)} `;
          if (selectedPriority !== 'all') filterInfo += `Priority: ${getPriorityText(selectedPriority)} `;
          if (filterInfo) {
            doc.text(`Filter: ${filterInfo}`, 14, yPosition);
            yPosition += 5;
          }
          doc.text(`Total: ${report.complaints.length} complaints`, 14, yPosition);
          yPosition += 6;
          
          // Complaint details table
          const complaintData = report.complaints.map(c => [
            c.ticketId,
            isNepali ? c.name : c.enName,
            c.phone,
            getCategoryText(c.category),
            isNepali ? c.date : c.enDate,
            getStatusText(c.status),
            getPriorityText(c.priority),
            isNepali ? c.assignedTo : c.enAssignedTo
          ]);
          
          if (complaintData.length > 0) {
            doc.autoTable({
              startY: yPosition,
              head: [[
                isNepali ? 'टिकट नं.' : 'Ticket ID',
                isNepali ? 'उजुरीकर्ता' : 'Complainant',
                isNepali ? 'फोन' : 'Phone',
                isNepali ? 'प्रकार' : 'Category',
                isNepali ? 'मिति' : 'Date',
                isNepali ? 'स्थिति' : 'Status',
                isNepali ? 'प्राथमिकता' : 'Priority',
                isNepali ? 'जिम्मेवार' : 'Assigned To'
              ]],
              body: complaintData,
              theme: 'striped',
              styles: { 
                fontSize: 6.5,
                cellPadding: 2,
                overflow: 'linebreak'
              },
              headStyles: { 
                fillColor: [13, 71, 161], 
                textColor: [255, 255, 255],
                fontSize: 7,
                fontStyle: 'bold'
              },
              alternateRowStyles: { fillColor: [248, 250, 255] },
              margin: { left: 10, right: 10 },
              pageBreak: 'auto'
            });
          } else {
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'italic');
            doc.text(isNepali ? 'कुनै गुनासो फेला परेन' : 'No complaints found', pageWidth / 2, yPosition + 20, { align: 'center' });
          }
        }
        
        // ===== ADD FOOTER TO ALL PAGES =====
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setTextColor(180, 180, 180);
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'italic');
          const footerText = `NTC Complaint Tracking System - ${new Date().toISOString().split('T')[0]} - Page ${i} of ${totalPages}`;
          doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
          
          // Add a line separator
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
        }
        
        // Save PDF
        const filename = `complaints_report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        setTimeout(() => {
          showToast(language === 'np' ? '✅ पीडीएफ फाइल सफलतापूर्वक डाउनलोड भयो' : '✅ PDF file downloaded successfully', 'success');
          setIsExporting(false);
        }, 1000);
        
      } catch (error) {
        console.error('PDF export error:', error);
        showToast(
          language === 'np' 
            ? '❌ पीडीएफ निर्यात गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
            : '❌ Failed to export PDF. Please try again.',
          'error'
        );
        setIsExporting(false);
      }
    }, 100);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const content = {
    np: {
      complaintsReports: '📊 गुनासो रिपोर्टहरू',
      generateReports: '📋 रिपोर्ट उत्पन्न गर्नुहोस्',
      dateRange: '📅 मिति दायरा',
      today: 'आज',
      week: 'यो हप्ता',
      month: 'यो महिना',
      quarter: 'यो त्रैमास',
      year: 'यो वर्ष',
      custom: 'अनुकूल',
      startDate: 'सुरु मिति',
      endDate: 'अन्त्य मिति',
      reportType: '📄 रिपोर्ट प्रकार',
      summary: 'सारांश',
      detailed: 'विस्तृत',
      comparative: 'तुलनात्मक',
      filterByCategory: '📂 प्रकार अनुसार फिल्टर',
      filterByStatus: '📊 स्थिति अनुसार फिल्टर',
      filterByPriority: '⚡ प्राथमिकता अनुसार फिल्टर',
      generateReport: '🔄 रिपोर्ट उत्पन्न गर्नुहोस्',
      exportPDF: '📄 पीडीएफ निर्यात गर्नुहोस्',
      exportExcel: '📊 एक्सेल निर्यात गर्नुहोस्',
      print: '🖨️ प्रिन्ट गर्नुहोस्',
      totalComplaints: '📋 कुल गुनासो',
      pendingComplaints: '⏳ विचाराधीन',
      inProgressComplaints: '🔄 प्रगतिमा',
      resolvedComplaints: '✅ समाधान',
      avgResolutionDays: '⏱️ औसत समाधान दिन',
      satisfactionRate: '⭐ सन्तुष्टि दर',
      thisMonth: 'यो महिना',
      lastMonth: 'गत महिना',
      growth: '📈 वृद्धि',
      categoryBreakdown: '📂 प्रकार अनुसार विभाजन',
      statusBreakdown: '📊 स्थिति अनुसार विभाजन',
      priorityBreakdown: '⚡ प्राथमिकता अनुसार विभाजन',
      monthlyTrend: '📈 मासिक प्रवृत्ति',
      allComplaints: '📋 सबै गुनासोहरू',
      channelBreakdown: '📱 च्यानल अनुसार विभाजन',
      reportGenerated: '✅ रिपोर्ट उत्पन्न गरियो',
      noDataFound: '❌ कुनै डाटा फेला परेन',
      all: 'सबै',
      internet: 'इन्टरनेट',
      billing: 'बिलिङ',
      network: 'नेटवर्क',
      recharge: 'रिचार्ज',
      technical: 'प्राविधिक',
      activation: 'सक्रियता',
      signal: 'सिग्नल',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      count: 'संख्या',
      percentage: 'प्रतिशत',
      category: 'प्रकार',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      channel: 'च्यानल',
      ticketId: 'टिकट नं.',
      complainant: 'उजुरीकर्ता',
      phone: 'फोन नं.',
      email: 'इमेल',
      location: 'स्थान',
      date: 'मिति',
      description: 'विवरण',
      assignedTo: 'जिम्मेवार',
      actions: 'कार्यहरू',
      viewDetails: 'विवरण हेर्नुहोस्',
      overallOverview: '📈 समग्र अवलोकन',
      userComplaintsDetails: '👥 प्रयोगकर्ता गुनासो विवरण',
      resetFilters: '🔄 फिल्टर रिसेट गर्नुहोस्',
      showing: 'देखाउँदै',
      of: 'को',
      entries: 'प्रविष्टिहरू',
      days: 'दिन',
      day: 'दिन',
      exporting: '⏳ निर्यात हुँदै...',
      generatedReport: '📊 उत्पन्न गरिएको रिपोर्ट',
      filterSummary: 'फिल्टर सारांश',
      noData: 'कुनै डाटा छैन'
    },
    en: {
      complaintsReports: '📊 Complaints Reports',
      generateReports: '📋 Generate Reports',
      dateRange: '📅 Date Range',
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year',
      custom: 'Custom',
      startDate: 'Start Date',
      endDate: 'End Date',
      reportType: '📄 Report Type',
      summary: 'Summary',
      detailed: 'Detailed',
      comparative: 'Comparative',
      filterByCategory: '📂 Filter by Category',
      filterByStatus: '📊 Filter by Status',
      filterByPriority: '⚡ Filter by Priority',
      generateReport: '🔄 Generate Report',
      exportPDF: '📄 Export PDF',
      exportExcel: '📊 Export Excel',
      print: '🖨️ Print',
      totalComplaints: '📋 Total Complaints',
      pendingComplaints: '⏳ Pending',
      inProgressComplaints: '🔄 In Progress',
      resolvedComplaints: '✅ Resolved',
      avgResolutionDays: '⏱️ Avg Resolution Days',
      satisfactionRate: '⭐ Satisfaction Rate',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      growth: '📈 Growth',
      categoryBreakdown: '📂 Category Breakdown',
      statusBreakdown: '📊 Status Breakdown',
      priorityBreakdown: '⚡ Priority Breakdown',
      monthlyTrend: '📈 Monthly Trend',
      allComplaints: '📋 All Complaints',
      channelBreakdown: '📱 Channel Breakdown',
      reportGenerated: '✅ Report Generated',
      noDataFound: '❌ No data found',
      all: 'All',
      internet: 'Internet',
      billing: 'Billing',
      network: 'Network',
      recharge: 'Recharge',
      technical: 'Technical',
      activation: 'Activation',
      signal: 'Signal',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      count: 'Count',
      percentage: 'Percentage',
      category: 'Category',
      status: 'Status',
      priority: 'Priority',
      channel: 'Channel',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      phone: 'Phone',
      email: 'Email',
      location: 'Location',
      date: 'Date',
      description: 'Description',
      assignedTo: 'Assigned To',
      actions: 'Actions',
      viewDetails: 'View Details',
      overallOverview: '📈 Overall Overview',
      userComplaintsDetails: '👥 User Complaints Details',
      resetFilters: '🔄 Reset Filters',
      showing: 'Showing',
      of: 'of',
      entries: 'entries',
      days: 'days',
      day: 'day',
      exporting: '⏳ Exporting...',
      generatedReport: '📊 Generated Report',
      filterSummary: 'Filter Summary',
      noData: 'No Data'
    }
  };

  const t = content[language];

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setDateRange('month');
    setReportType('summary');
    setIsReportGenerated(false);
    setGeneratedReport(null);
    showToast(t.resetFilters, 'info');
  };

  const handleViewDetails = (complaint) => {
    const details = language === 'np' 
      ? `टिकट: ${complaint.ticketId}\nनाम: ${complaint.name}\nफोन: ${complaint.phone}\nइमेल: ${complaint.email}\nस्थान: ${complaint.location}\nप्रकार: ${getCategoryText(complaint.category)}\nविवरण: ${complaint.description}\nजिम्मेवार: ${complaint.assignedTo}`
      : `Ticket: ${complaint.ticketId}\nName: ${complaint.enName}\nPhone: ${complaint.phone}\nEmail: ${complaint.email}\nLocation: ${complaint.enLocation}\nCategory: ${getCategoryText(complaint.category)}\nDescription: ${complaint.enDescription}\nAssigned To: ${complaint.enAssignedTo}`;
    showToast(details, 'info');
  };

  // Get the report to display (generated or default)
  const displayReport = generatedReport || reportData;

  return (
    <div className="admin-reports">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
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
                <h1>{t.complaintsReports}</h1>
                <p>{t.generateReports}</p>
              </div>
              <div className="action-buttons-header">
                <button 
                  className="export-btn pdf" 
                  onClick={handleExportPDF} 
                  disabled={isExporting || !isReportGenerated}
                >
                  📄 {isExporting ? t.exporting : t.exportPDF}
                </button>
                <button 
                  className="export-btn excel" 
                  onClick={handleExportExcel} 
                  disabled={isExporting || !isReportGenerated}
                >
                  📊 {isExporting ? t.exporting : t.exportExcel}
                </button>
                <button className="export-btn print" onClick={handlePrint}>
                  🖨️ {t.print}
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📈 {t.overallOverview}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('complaints')}
              >
                📋 {t.allComplaints}
              </button>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
              <div className="filter-group">
                <label>{t.dateRange}</label>
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="filter-select"
                >
                  <option value="today">{t.today}</option>
                  <option value="week">{t.week}</option>
                  <option value="month">{t.month}</option>
                  <option value="quarter">{t.quarter}</option>
                  <option value="year">{t.year}</option>
                  <option value="custom">{t.custom}</option>
                </select>
              </div>

              {dateRange === 'custom' && (
                <div className="filter-group date-range">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="date-input"
                    placeholder={t.startDate}
                  />
                  <span>—</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="date-input"
                    placeholder={t.endDate}
                  />
                </div>
              )}

              <div className="filter-group">
                <label>{t.reportType}</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  className="filter-select"
                >
                  <option value="summary">{t.summary}</option>
                  <option value="detailed">{t.detailed}</option>
                  <option value="comparative">{t.comparative}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t.filterByCategory}</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="internet">{t.internet}</option>
                  <option value="billing">{t.billing}</option>
                  <option value="network">{t.network}</option>
                  <option value="recharge">{t.recharge}</option>
                  <option value="technical">{t.technical}</option>
                  <option value="activation">{t.activation}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t.filterByStatus}</label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="in-progress">{t.inProgress}</option>
                  <option value="resolved">{t.resolved}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t.filterByPriority}</label>
                <select 
                  value={selectedPriority} 
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">{t.all}</option>
                  <option value="high">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="low">{t.low}</option>
                </select>
              </div>

              <div className="filter-actions">
                <button className="generate-btn" onClick={handleGenerateReport}>
                  🔄 {t.generateReport}
                </button>
                <button className="reset-btn" onClick={handleResetFilters}>
                  🔄 {t.resetFilters}
                </button>
              </div>
            </div>

            {/* Report Generated Banner */}
            {isReportGenerated && generatedReport && (
              <div className="report-generated-banner">
                <div className="banner-content">
                  <span className="banner-icon">✅</span>
                  <span className="banner-text">
                    {language === 'np' 
                      ? `रिपोर्ट उत्पन्न गरियो - ${generatedReport.complaints.length} गुनासोहरू फेला पर्यो` 
                      : `Report generated - ${generatedReport.complaints.length} complaints found`}
                  </span>
                  <span className="banner-time">
                    {language === 'np' ? 'उत्पन्न मिति: ' : 'Generated at: '}
                    {generatedReport.generatedAt}
                  </span>
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Summary Cards */}
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="card-icon blue">📋</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(displayReport.summary.totalComplaints)}</div>
                      <div className="card-label">{t.totalComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon orange">⏳</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(displayReport.summary.pendingComplaints)}</div>
                      <div className="card-label">{t.pendingComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon yellow">🔄</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(displayReport.summary.inProgressComplaints)}</div>
                      <div className="card-label">{t.inProgressComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon green">✅</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(displayReport.summary.resolvedComplaints)}</div>
                      <div className="card-label">{t.resolvedComplaints}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon purple">⏱️</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(displayReport.summary.avgResolutionDays)}</div>
                      <div className="card-label">{t.avgResolutionDays}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon pink">⭐</div>
                    <div className="card-info">
                      <div className="card-value">{formatNumber(displayReport.summary.satisfactionRate)}%</div>
                      <div className="card-label">{t.satisfactionRate}</div>
                    </div>
                  </div>
                </div>

                {/* Growth Info */}
                <div className="growth-card">
                  <div className="growth-info">
                    <span className="growth-label">{t.thisMonth}</span>
                    <span className="growth-value">{formatNumber(displayReport.summary.thisMonth)}</span>
                  </div>
                  <div className="growth-info">
                    <span className="growth-label">{t.lastMonth}</span>
                    <span className="growth-value">{formatNumber(displayReport.summary.lastMonth)}</span>
                  </div>
                  <div className="growth-info">
                    <span className="growth-label">{t.growth}</span>
                    <span className="growth-value positive">+{formatNumber(displayReport.summary.growth)}%</span>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                  {/* Category Breakdown */}
                  <div className="chart-card">
                    <h3>{t.categoryBreakdown}</h3>
                    <div className="chart-content">
                      {displayReport.categoryBreakdown.map((item, index) => {
                        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
                        return (
                          <div key={index} className="chart-bar-item">
                            <div className="chart-label">
                              <span>{item.name}</span>
                              <span>{formatNumber(item.count)} ({item.percentage}%)</span>
                            </div>
                            <div className="chart-bar-bg">
                              <div 
                                className="chart-bar-fill" 
                                style={{ 
                                  width: `${item.percentage}%`,
                                  background: colors[index % colors.length]
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="chart-card">
                    <h3>{t.statusBreakdown}</h3>
                    <div className="pie-chart-container">
                      {displayReport.statusBreakdown.map((item, index) => {
                        const colors = ['#f59e0b', '#3b82f6', '#10b981'];
                        return (
                          <div key={index} className="pie-segment-info">
                            <div className="pie-color" style={{ background: colors[index % colors.length] }} />
                            <div className="pie-label">
                              <span>{item.name}</span>
                              <span>{formatNumber(item.count)} ({item.percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority Breakdown */}
                  <div className="chart-card">
                    <h3>{t.priorityBreakdown}</h3>
                    <div className="pie-chart-container">
                      {displayReport.priorityBreakdown.map((item, index) => {
                        const colors = ['#ef4444', '#f59e0b', '#3b82f6'];
                        return (
                          <div key={index} className="pie-segment-info">
                            <div className="pie-color" style={{ background: colors[index % colors.length] }} />
                            <div className="pie-label">
                              <span>{item.name}</span>
                              <span>{formatNumber(item.count)} ({item.percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Channel Breakdown */}
                  <div className="chart-card">
                    <h3>{t.channelBreakdown}</h3>
                    <div className="pie-chart-container">
                      {displayReport.channelBreakdown.map((item, index) => {
                        const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
                        return (
                          <div key={index} className="pie-segment-info">
                            <div className="pie-color" style={{ background: colors[index % colors.length] }} />
                            <div className="pie-label">
                              <span>{item.name}</span>
                              <span>{formatNumber(item.count)} ({item.percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Monthly Trend - Only show if not generated report or if generated report has monthly trend */}
                {!generatedReport && (
                  <div className="trend-card">
                    <h3>{t.monthlyTrend}</h3>
                    <div className="trend-chart">
                      {reportData.monthlyTrend.map((item, index) => {
                        const max = Math.max(...reportData.monthlyTrend.map(d => d.count));
                        const height = (item.count / max) * 180;
                        return (
                          <div key={index} className="trend-bar-item">
                            <div className="trend-label">{language === 'np' ? item.month : item.enMonth}</div>
                            <div className="trend-bar-bg" style={{ height: '200px' }}>
                              <div 
                                className="trend-bar-fill" 
                                style={{ 
                                  height: `${height}px`,
                                  background: `linear-gradient(180deg, #3b82f6, #2563eb)`
                                }}
                              >
                                <span className="trend-value">{formatNumber(item.count)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
              <div className="table-card">
                <div className="table-header">
                  <h3>{t.allComplaints}</h3>
                  <div className="table-stats">
                    {t.showing} {formatNumber(
                      generatedReport ? generatedReport.complaints.length : filteredComplaints.length
                    )} {t.of} {formatNumber(reportData.allComplaints.length)} {t.entries}
                  </div>
                </div>
                <div className="table-wrapper">
                  {(generatedReport ? generatedReport.complaints : filteredComplaints).length > 0 ? (
                    <table className="reports-table">
                      <thead>
                        <tr>
                          <th>{t.ticketId}</th>
                          <th>{t.complainant}</th>
                          <th>{t.phone}</th>
                          <th>{t.category}</th>
                          <th>{t.date}</th>
                          <th>{t.status}</th>
                          <th>{t.priority}</th>
                          <th>{t.assignedTo}</th>
                          <th>{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(generatedReport ? generatedReport.complaints : filteredComplaints).map((complaint) => (
                          <tr key={complaint.id}>
                            <td><span className="ticket-id">{complaint.ticketId}</span></td>
                            <td className="user-name">{language === 'np' ? complaint.name : complaint.enName}</td>
                            <td className="phone-number">{complaint.phone}</td>
                            <td>{getCategoryText(complaint.category)}</td>
                            <td>{language === 'np' ? complaint.date : complaint.enDate}</td>
                            <td>
                              <span className={`status-badge status-${complaint.status}`}>
                                {getStatusText(complaint.status)}
                              </span>
                            </td>
                            <td>
                              <span className={`priority-badge priority-${complaint.priority}`}>
                                {getPriorityText(complaint.priority)}
                              </span>
                            </td>
                            <td>{language === 'np' ? complaint.assignedTo : complaint.enAssignedTo}</td>
                            <td>
                              <button 
                                className="view-details-btn" 
                                onClick={() => handleViewDetails(complaint)}
                              >
                                {t.viewDetails}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-data">{t.noDataFound}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-reports {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
          overflow-x: hidden;
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

        /* ===== LAYOUT ===== */
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

        .main-container::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        .content-wrapper {
          padding: 24px 32px;
          min-height: 100%;
        }

        /* ===== PAGE HEADER ===== */
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

        .action-buttons-header {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .export-btn {
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .export-btn.pdf { background: #fee2e2; color: #dc2626; }
        .export-btn.pdf:hover:not(:disabled) { background: #fecaca; }
        .export-btn.excel { background: #d1fae5; color: #059669; }
        .export-btn.excel:hover:not(:disabled) { background: #a7f3d0; }
        .export-btn.print { background: #dbeafe; color: #2563eb; }
        .export-btn.print:hover { background: #bfdbfe; }

        /* ===== TAB NAVIGATION ===== */
        .tab-navigation {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-btn {
          padding: 12px 24px;
          background: transparent;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .tab-btn:hover { color: #3b82f6; }
        .tab-btn.active { color: #3b82f6; }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #3b82f6;
        }

        /* ===== FILTERS ===== */
        .filters-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: flex-end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 150px;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .filter-select, .date-input {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus, .date-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .date-range {
          flex-direction: row;
          align-items: center;
        }

        .date-range span { color: #64748b; }

        .filter-actions {
          display: flex;
          gap: 12px;
        }

        .generate-btn, .reset-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          height: 42px;
          transition: all 0.2s;
        }

        .generate-btn:hover, .reset-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .reset-btn {
          background: linear-gradient(135deg, #64748b, #475569);
        }

        .reset-btn:hover {
          box-shadow: 0 4px 12px rgba(100,116,139,0.3);
        }

        /* ===== REPORT GENERATED BANNER ===== */
        .report-generated-banner {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 12px;
          padding: 16px 24px;
          margin-bottom: 24px;
          color: white;
          animation: slideDown 0.5s ease;
        }

        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .banner-icon { font-size: 1.5rem; }
        .banner-text { font-size: 1rem; font-weight: 500; }
        .banner-time { 
          font-size: 0.8rem; 
          opacity: 0.9;
          margin-left: auto;
        }

        /* ===== SUMMARY CARDS ===== */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .card-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .card-icon.blue { background: #dbeafe; color: #2563eb; }
        .card-icon.orange { background: #fed7aa; color: #ea580c; }
        .card-icon.yellow { background: #fef3c7; color: #d97706; }
        .card-icon.green { background: #d1fae5; color: #059669; }
        .card-icon.purple { background: #f3e8ff; color: #9333ea; }
        .card-icon.pink { background: #fce7f3; color: #db2777; }

        .card-info { flex: 1; }
        .card-value { font-size: 1.3rem; font-weight: 700; color: #0f172a; }
        .card-label { font-size: 0.7rem; color: #64748b; }

        /* ===== GROWTH CARD ===== */
        .growth-card {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 16px;
          padding: 16px 24px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-around;
          border: 1px solid #bae6fd;
          flex-wrap: wrap;
          gap: 16px;
        }

        .growth-info { text-align: center; }
        .growth-label { font-size: 0.75rem; color: #0369a1; display: block; margin-bottom: 4px; }
        .growth-value { font-size: 1.2rem; font-weight: 700; color: #0c4a6e; }
        .growth-value.positive { color: #059669; }

        /* ===== CHARTS GRID ===== */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .chart-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .chart-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-bar-item { width: 100%; }
        .chart-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 0.8rem;
          color: #475569;
        }
        .chart-bar-bg {
          background: #f1f5f9;
          border-radius: 8px;
          overflow: hidden;
          height: 8px;
        }
        .chart-bar-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.5s;
        }

        /* ===== PIE CHART INFO ===== */
        .pie-chart-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pie-segment-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pie-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }

        .pie-label {
          flex: 1;
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #475569;
        }

        /* ===== TREND CHART ===== */
        .trend-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .trend-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .trend-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 250px;
          gap: 12px;
        }

        .trend-bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .trend-label { font-size: 0.7rem; color: #64748b; }
        .trend-bar-bg {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .trend-bar-fill {
          width: 40px;
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: height 0.5s;
          min-height: 30px;
        }
        .trend-value {
          position: absolute;
          top: -22px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }

        /* ===== TABLE CARD ===== */
        .table-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .table-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .table-stats { font-size: 0.75rem; color: #64748b; }

        .table-wrapper { overflow-x: auto; }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .reports-table th,
        .reports-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .reports-table th {
          color: #64748b;
          font-weight: 500;
          font-size: 0.75rem;
          background: #f8fafc;
        }

        .reports-table td {
          color: #334155;
          font-size: 0.8rem;
        }

        .reports-table tr:hover { background: #f8fafc; }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #3b82f6;
        }

        .user-name { font-weight: 500; }
        .phone-number, .email-address { font-family: monospace; font-size: 0.75rem; }

        .description-cell { max-width: 200px; }
        .description-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .status-badge, .priority-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-in-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .view-details-btn {
          background: transparent;
          border: 1px solid #3b82f6;
          color: #3b82f6;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.7rem;
          transition: all 0.2s;
        }

        .view-details-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1200px) {
          .summary-cards { grid-template-columns: repeat(3, 1fr); }
          .charts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .admin-reports {
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
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .main-container {
            margin-left: 0;
            width: 100%;
            overflow-y: visible;
          }
          
          .content-wrapper { padding: 16px; }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .filters-section { flex-direction: column; }
          .filter-group { width: 100%; }
          .date-range { flex-direction: row; }
          .filter-actions { width: 100%; flex-direction: column; }
          .generate-btn, .reset-btn { width: 100%; }
          
          .summary-cards { grid-template-columns: repeat(2, 1fr); }
          
          .trend-chart {
            height: auto;
            flex-direction: column;
          }
          .trend-bar-item {
            flex-direction: row;
            width: 100%;
            justify-content: space-between;
          }
          .trend-bar-bg { width: 60%; }
          .trend-bar-fill {
            width: 100%;
            height: 30px !important;
            border-radius: 8px;
          }
          .trend-value {
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
          }
          
          .action-buttons-header { flex-wrap: wrap; }
          .table-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .toast-notification {
            top: auto;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
            min-width: auto;
          }

          .banner-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .banner-time { margin-left: 0; }
        }

        @media (max-width: 480px) {
          .summary-cards { grid-template-columns: 1fr; }
          .reports-table th,
          .reports-table td {
            padding: 8px;
            font-size: 0.7rem;
          }
        }

        @media print {
          .sidebar-container,
          .action-buttons-header,
          .filter-actions,
          .tab-navigation,
          .view-details-btn,
          .toast-notification,
          .report-generated-banner {
            display: none !important;
          }
          .main-container { margin-left: 0; }
          .summary-cards,
          .charts-grid,
          .trend-card,
          .table-card {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReportsComplaints;