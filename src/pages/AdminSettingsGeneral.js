// src/pages/AdminSettingsGeneral.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminSettingsGeneral = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'NTC Sahayatri',
    siteName_np: 'एनटीसी सहयात्री',
    siteDescription: 'Complaint Tracking System for Nepal Telecom',
    siteDescription_np: 'नेपाल दूरसञ्चारको लागि गुनासो ट्र्याकिङ प्रणाली',
    siteEmail: 'support@ntc.com.np',
    sitePhone: '01-4960008',
    siteAddress: 'Bhadrakali Plaza, Kathmandu',
    siteAddress_np: 'भद्रकाली प्लाजा, काठमाडौं',
    timezone: 'Asia/Kathmandu',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    defaultLanguage: 'np',
    itemsPerPage: 10,
    enableRegistration: true,
    enablePublicComplaints: true,
    maintenanceMode: false,
    updatedAt: null
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: 'notifications@ntc.com.np',
    fromName: 'NTC Sahayatri',
    fromName_np: 'एनटीसी सहयात्री',
    sendComplaintConfirmation: true,
    sendComplaintUpdate: true,
    sendComplaintResolved: true,
    sendNewsletter: false,
    updatedAt: null
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordExpiryDays: 90,
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    twoFactorAuth: false,
    ipWhitelist: '',
    updatedAt: null
  });

  // Backup Settings State
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    backupRetention: 30,
    backupLocation: './backups/',
    lastBackup: null,
    lastBackupSize: null,
    updatedAt: null
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyNewComplaint: true,
    notifyComplaintUpdate: true,
    notifyComplaintResolved: true,
    notifyNewUser: true,
    notifySystemUpdate: true,
    adminEmail: '',
    adminPhone: '',
    updatedAt: null
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch all settings from backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all settings in parallel
      const [generalRes, emailRes, securityRes, backupRes, notificationRes] = await Promise.all([
        axios.get(`${API_URL}/admin/settings/general`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_URL}/admin/settings/email`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_URL}/admin/settings/security`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_URL}/admin/settings/backup`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_URL}/admin/settings/notifications`, { headers }).catch(() => ({ data: { success: false } }))
      ]);

      if (generalRes.data.success && generalRes.data.data) {
        setGeneralSettings(prev => ({ ...prev, ...generalRes.data.data }));
        console.log('✅ General settings loaded');
      }

      if (emailRes.data.success && emailRes.data.data) {
        setEmailSettings(prev => ({ ...prev, ...emailRes.data.data }));
        console.log('✅ Email settings loaded');
      }

      if (securityRes.data.success && securityRes.data.data) {
        setSecuritySettings(prev => ({ ...prev, ...securityRes.data.data }));
        console.log('✅ Security settings loaded');
      }

      if (backupRes.data.success && backupRes.data.data) {
        setBackupSettings(prev => ({ ...prev, ...backupRes.data.data }));
        console.log('✅ Backup settings loaded');
      }

      if (notificationRes.data.success && notificationRes.data.data) {
        setNotificationSettings(prev => ({ ...prev, ...notificationRes.data.data }));
        console.log('✅ Notification settings loaded');
      }

    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast(
        language === 'np' ? 'सेटिङ्स लोड गर्न असफल। पूर्वनिर्धारित मान प्रयोग गरिँदै।' : 'Failed to load settings. Using defaults.', 
        'error'
      );
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Save general settings
  const saveGeneralSettings = async () => {
    try {
      const token = getAuthToken();
      if (!token) return false;
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const dataToSend = {
        siteName: generalSettings.siteName,
        siteName_np: generalSettings.siteName_np,
        siteDescription: generalSettings.siteDescription,
        siteDescription_np: generalSettings.siteDescription_np,
        siteEmail: generalSettings.siteEmail,
        sitePhone: generalSettings.sitePhone,
        siteAddress: generalSettings.siteAddress,
        siteAddress_np: generalSettings.siteAddress_np,
        timezone: generalSettings.timezone,
        dateFormat: generalSettings.dateFormat,
        timeFormat: generalSettings.timeFormat,
        defaultLanguage: generalSettings.defaultLanguage,
        itemsPerPage: parseInt(generalSettings.itemsPerPage),
        enableRegistration: generalSettings.enableRegistration,
        enablePublicComplaints: generalSettings.enablePublicComplaints,
        maintenanceMode: generalSettings.maintenanceMode
      };

      const response = await axios.put(`${API_URL}/admin/settings/general`, dataToSend, { headers });
      
      if (response.data.success) {
        setGeneralSettings(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving general settings:', error.response?.data || error.message);
      return false;
    }
  };

  // Save email settings
  const saveEmailSettings = async () => {
    try {
      const token = getAuthToken();
      if (!token) return false;
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const dataToSend = {
        smtpHost: emailSettings.smtpHost,
        smtpPort: parseInt(emailSettings.smtpPort),
        smtpUser: emailSettings.smtpUser,
        smtpPassword: emailSettings.smtpPassword,
        smtpEncryption: emailSettings.smtpEncryption,
        fromEmail: emailSettings.fromEmail,
        fromName: emailSettings.fromName,
        fromName_np: emailSettings.fromName_np,
        sendComplaintConfirmation: emailSettings.sendComplaintConfirmation,
        sendComplaintUpdate: emailSettings.sendComplaintUpdate,
        sendComplaintResolved: emailSettings.sendComplaintResolved,
        sendNewsletter: emailSettings.sendNewsletter
      };

      const response = await axios.put(`${API_URL}/admin/settings/email`, dataToSend, { headers });
      
      if (response.data.success) {
        setEmailSettings(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving email settings:', error.response?.data || error.message);
      return false;
    }
  };

  // Save security settings
  const saveSecuritySettings = async () => {
    try {
      const token = getAuthToken();
      if (!token) return false;
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const dataToSend = {
        sessionTimeout: parseInt(securitySettings.sessionTimeout),
        maxLoginAttempts: parseInt(securitySettings.maxLoginAttempts),
        lockoutDuration: parseInt(securitySettings.lockoutDuration),
        passwordExpiryDays: parseInt(securitySettings.passwordExpiryDays),
        minPasswordLength: parseInt(securitySettings.minPasswordLength),
        requireUppercase: securitySettings.requireUppercase,
        requireLowercase: securitySettings.requireLowercase,
        requireNumbers: securitySettings.requireNumbers,
        requireSpecialChars: securitySettings.requireSpecialChars,
        twoFactorAuth: securitySettings.twoFactorAuth,
        ipWhitelist: securitySettings.ipWhitelist || ''
      };

      const response = await axios.put(`${API_URL}/admin/settings/security`, dataToSend, { headers });
      
      if (response.data.success) {
        setSecuritySettings(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving security settings:', error.response?.data || error.message);
      return false;
    }
  };

  // Save backup settings
  const saveBackupSettings = async () => {
    try {
      const token = getAuthToken();
      if (!token) return false;
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const dataToSend = {
        autoBackup: backupSettings.autoBackup,
        backupFrequency: backupSettings.backupFrequency,
        backupTime: backupSettings.backupTime,
        backupRetention: parseInt(backupSettings.backupRetention),
        backupLocation: backupSettings.backupLocation
      };

      const response = await axios.put(`${API_URL}/admin/settings/backup`, dataToSend, { headers });
      
      if (response.data.success) {
        setBackupSettings(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving backup settings:', error.response?.data || error.message);
      return false;
    }
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    try {
      const token = getAuthToken();
      if (!token) return false;
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const dataToSend = {
        emailNotifications: notificationSettings.emailNotifications,
        smsNotifications: notificationSettings.smsNotifications,
        pushNotifications: notificationSettings.pushNotifications,
        notifyNewComplaint: notificationSettings.notifyNewComplaint,
        notifyComplaintUpdate: notificationSettings.notifyComplaintUpdate,
        notifyComplaintResolved: notificationSettings.notifyComplaintResolved,
        notifyNewUser: notificationSettings.notifyNewUser,
        notifySystemUpdate: notificationSettings.notifySystemUpdate,
        adminEmail: notificationSettings.adminEmail || '',
        adminPhone: notificationSettings.adminPhone || ''
      };

      const response = await axios.put(`${API_URL}/admin/settings/notifications`, dataToSend, { headers });
      
      if (response.data.success) {
        setNotificationSettings(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving notification settings:', error.response?.data || error.message);
      return false;
    }
  };

  // UPDATE BUTTON HANDLER - Save all settings from ALL sections
  const handleUpdateSettings = async () => {
    setUpdating(true);

    try {
      // Save ALL sections in parallel
      const results = await Promise.all([
        saveGeneralSettings(),
        saveEmailSettings(),
        saveSecuritySettings(),
        saveBackupSettings(),
        saveNotificationSettings()
      ]);

      const allSaved = results.every(result => result === true);
      
      if (allSaved) {
        showToast(
          language === 'np' ? '✅ सबै सेटिङ्स सफलतापूर्वक अपडेट गरियो' : '✅ All settings updated successfully', 
          'success'
        );
        // Refresh settings to get updated timestamps
        await fetchSettings();
      } else {
        const failedCount = results.filter(r => r === false).length;
        showToast(
          language === 'np' 
            ? `❌ ${failedCount} सेटिङ्स अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।` 
            : `❌ Failed to update ${failedCount} settings. Please try again.`, 
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast(
        language === 'np' ? '❌ सेटिङ्स अपडेट गर्न असफल' : '❌ Failed to update settings', 
        'error'
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle manual backup
  const handleManualBackup = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        showToast(
          language === 'np' ? 'प्रमाणीकरण त्रुटि। कृपया पुन: लगइन गर्नुहोस्।' : 'Authentication error. Please login again.', 
          'error'
        );
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${API_URL}/admin/settings/backup/now`, {}, { headers });
      
      if (response.data.success) {
        showToast(
          language === 'np' ? '💾 ब्याकअप सफलतापूर्वक पूरा भयो' : '💾 Backup completed successfully', 
          'success'
        );
        // Update last backup info
        if (response.data.data) {
          setBackupSettings(prev => ({
            ...prev,
            lastBackup: response.data.data.lastBackup,
            lastBackupSize: response.data.data.size
          }));
        }
        // Refresh backup settings
        await saveBackupSettings();
      } else {
        showToast(
          language === 'np' ? '❌ ब्याकअप असफल' : '❌ Backup failed', 
          'error'
        );
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      showToast(
        language === 'np' ? '❌ ब्याकअप सिर्जना गर्न असफल' : '❌ Failed to create backup', 
        'error'
      );
    }
  };

  // Handle test email
  const handleTestEmail = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        showToast(
          language === 'np' ? 'प्रमाणीकरण त्रुटि। कृपया पुन: लगइन गर्नुहोस्।' : 'Authentication error. Please login again.', 
          'error'
        );
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const testEmailTo = notificationSettings.adminEmail || emailSettings.fromEmail || 'admin@example.com';
      
      const response = await axios.post(`${API_URL}/admin/settings/email/test`, {
        to: testEmailTo,
        subject: language === 'np' ? 'एनटीसी सहयात्रीबाट परीक्षण इमेल' : 'Test Email from NTC Sahayatri',
        message: language === 'np' 
          ? 'यो एनटीसी सहयात्री प्रणालीबाट एउटा परीक्षण इमेल हो। तपाईंको इमेल सेटिङ्स सही रूपमा कन्फिगर गरिएको छ।'
          : 'This is a test email from NTC Sahayatri system. Your email settings are configured correctly.'
      }, { headers });
      
      if (response.data.success) {
        showToast(
          language === 'np' ? `✉️ परीक्षण इमेल ${testEmailTo} मा सफलतापूर्वक पठाइयो` : `✉️ Test email sent successfully to ${testEmailTo}`, 
          'success'
        );
      } else {
        showToast(
          language === 'np' ? '❌ परीक्षण इमेल पठाउन असफल' : '❌ Failed to send test email', 
          'error'
        );
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      showToast(
        language === 'np' ? '❌ परीक्षण इमेल पठाउन असफल' : '❌ Failed to send test email', 
        'error'
      );
    }
  };

  // Check authentication and fetch settings
  useEffect(() => {
    const token = getAuthToken();
    const user = localStorage.getItem('adminUser') || localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      fetchSettings();
    }
  }, [navigate]);

  // Handle general settings change
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle email settings change
  const handleEmailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle security settings change
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle backup settings change
  const handleBackupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBackupSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle notification settings change
  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return language === 'np' ? 'कहिल्यै' : 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return language === 'np' ? 'कहिल्यै' : 'Never';
      return date.toLocaleString(language === 'np' ? 'ne-NP' : 'en-US');
    } catch {
      return language === 'np' ? 'कहिल्यै' : 'Never';
    }
  };

  const content = {
    np: {
      settings: 'सेटिङ्स',
      generalSettings: 'साधारण सेटिङ्स',
      emailSettings: 'इमेल सेटिङ्स',
      securitySettings: 'सुरक्षा सेटिङ्स',
      backupSettings: 'ब्याकअप सेटिङ्स',
      notificationSettings: 'सूचना सेटिङ्स',
      saveSettings: 'सेटिङ्स सुरक्षित गर्नुहोस्',
      updating: 'सुरक्षित गर्दै...',
      siteName: 'साइटको नाम',
      siteDescription: 'साइटको विवरण',
      siteEmail: 'साइट इमेल',
      sitePhone: 'साइट फोन',
      siteAddress: 'साइट ठेगाना',
      timezone: 'समय क्षेत्र',
      dateFormat: 'मिति ढाँचा',
      timeFormat: 'समय ढाँचा',
      defaultLanguage: 'पूर्वनिर्धारित भाषा',
      itemsPerPage: 'प्रति पृष्ठ आइटमहरू',
      enableRegistration: 'दर्ता सक्षम गर्नुहोस्',
      enablePublicComplaints: 'सार्वजनिक गुनासो सक्षम गर्नुहोस्',
      maintenanceMode: 'मर्मत मोड',
      smtpHost: 'SMTP होस्ट',
      smtpPort: 'SMTP पोर्ट',
      smtpUser: 'SMTP प्रयोगकर्ता',
      smtpPassword: 'SMTP पासवर्ड',
      smtpEncryption: 'SMTP इन्क्रिप्सन',
      fromEmail: 'पठाउने इमेल',
      fromName: 'पठाउने नाम',
      sendComplaintConfirmation: 'गुनासो पुष्टि पठाउनुहोस्',
      sendComplaintUpdate: 'गुनासो अपडेट पठाउनुहोस्',
      sendComplaintResolved: 'गुनासो समाधान पठाउनुहोस्',
      sessionTimeout: 'सेसन समय समाप्ति (मिनेट)',
      maxLoginAttempts: 'अधिकतम लगइन प्रयास',
      lockoutDuration: 'लकआउट अवधि (मिनेट)',
      passwordExpiryDays: 'पासवर्ड म्याद (दिन)',
      minPasswordLength: 'न्यूनतम पासवर्ड लम्बाइ',
      requireUppercase: 'अपरकेस अक्षर आवश्यक',
      requireLowercase: 'लोअरकेस अक्षर आवश्यक',
      requireNumbers: 'नम्बरहरू आवश्यक',
      requireSpecialChars: 'विशेष क्यारेक्टर आवश्यक',
      twoFactorAuth: 'दुई-चरण प्रमाणीकरण',
      ipWhitelist: 'IP श्वेतसूची',
      autoBackup: 'स्वचालित ब्याकअप',
      backupFrequency: 'ब्याकअप आवृत्ति',
      backupTime: 'ब्याकअप समय',
      backupRetention: 'ब्याकअप अवधारण (दिन)',
      backupLocation: 'ब्याकअप स्थान',
      lastBackup: 'अन्तिम ब्याकअप',
      lastBackupSize: 'अन्तिम ब्याकअप साइज',
      emailNotifications: 'इमेल सूचनाहरू',
      smsNotifications: 'एसएमएस सूचनाहरू',
      pushNotifications: 'पुश सूचनाहरू',
      notifyNewComplaint: 'नयाँ गुनासो सूचना',
      notifyComplaintUpdate: 'गुनासो अपडेट सूचना',
      notifyComplaintResolved: 'गुनासो समाधान सूचना',
      notifyNewUser: 'नयाँ प्रयोगकर्ता सूचना',
      notifySystemUpdate: 'प्रणाली अपडेट सूचना',
      adminEmail: 'प्रशासक इमेल',
      adminPhone: 'प्रशासक फोन',
      daily: 'दैनिक',
      weekly: 'साप्ताहिक',
      monthly: 'मासिक',
      tls: 'TLS',
      ssl: 'SSL',
      none: 'कुनै पनि होइन',
      hours12: '१२ घण्टा',
      hours24: '२४ घण्टा',
      loading: 'लोड हुँदैछ...',
      testEmail: 'परीक्षण इमेल पठाउनुहोस्',
      backupNow: 'अहिले ब्याकअप गर्नुहोस्',
      english: 'अंग्रेजी',
      nepali: 'नेपाली',
      general: 'साधारण',
      email: 'इमेल',
      security: 'सुरक्षा',
      backup: 'ब्याकअप',
      notifications: 'सूचनाहरू',
      updatedAt: 'अन्तिम अपडेट'
    },
    en: {
      settings: 'Settings',
      generalSettings: 'General Settings',
      emailSettings: 'Email Settings',
      securitySettings: 'Security Settings',
      backupSettings: 'Backup Settings',
      notificationSettings: 'Notification Settings',
      saveSettings: 'Save Settings',
      updating: 'Saving...',
      siteName: 'Site Name',
      siteDescription: 'Site Description',
      siteEmail: 'Site Email',
      sitePhone: 'Site Phone',
      siteAddress: 'Site Address',
      timezone: 'Timezone',
      dateFormat: 'Date Format',
      timeFormat: 'Time Format',
      defaultLanguage: 'Default Language',
      itemsPerPage: 'Items Per Page',
      enableRegistration: 'Enable Registration',
      enablePublicComplaints: 'Enable Public Complaints',
      maintenanceMode: 'Maintenance Mode',
      smtpHost: 'SMTP Host',
      smtpPort: 'SMTP Port',
      smtpUser: 'SMTP User',
      smtpPassword: 'SMTP Password',
      smtpEncryption: 'SMTP Encryption',
      fromEmail: 'From Email',
      fromName: 'From Name',
      sendComplaintConfirmation: 'Send Complaint Confirmation',
      sendComplaintUpdate: 'Send Complaint Update',
      sendComplaintResolved: 'Send Complaint Resolved',
      sessionTimeout: 'Session Timeout (minutes)',
      maxLoginAttempts: 'Max Login Attempts',
      lockoutDuration: 'Lockout Duration (minutes)',
      passwordExpiryDays: 'Password Expiry (days)',
      minPasswordLength: 'Minimum Password Length',
      requireUppercase: 'Require Uppercase Letters',
      requireLowercase: 'Require Lowercase Letters',
      requireNumbers: 'Require Numbers',
      requireSpecialChars: 'Require Special Characters',
      twoFactorAuth: 'Two-Factor Authentication',
      ipWhitelist: 'IP Whitelist',
      autoBackup: 'Auto Backup',
      backupFrequency: 'Backup Frequency',
      backupTime: 'Backup Time',
      backupRetention: 'Backup Retention (days)',
      backupLocation: 'Backup Location',
      lastBackup: 'Last Backup',
      lastBackupSize: 'Last Backup Size',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      pushNotifications: 'Push Notifications',
      notifyNewComplaint: 'New Complaint Notification',
      notifyComplaintUpdate: 'Complaint Update Notification',
      notifyComplaintResolved: 'Complaint Resolved Notification',
      notifyNewUser: 'New User Notification',
      notifySystemUpdate: 'System Update Notification',
      adminEmail: 'Admin Email',
      adminPhone: 'Admin Phone',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      tls: 'TLS',
      ssl: 'SSL',
      none: 'None',
      hours12: '12 Hours',
      hours24: '24 Hours',
      loading: 'Loading...',
      testEmail: 'Send Test Email',
      backupNow: 'Backup Now',
      english: 'English',
      nepali: 'Nepali',
      general: 'General',
      email: 'Email',
      security: 'Security',
      backup: 'Backup',
      notifications: 'Notifications',
      updatedAt: 'Last Updated'
    }
  };

  const t = content[language];

  const tabs = [
    { id: 'general', label: t.general, icon: '⚙️' },
    { id: 'email', label: t.email, icon: '✉️' },
    { id: 'security', label: t.security, icon: '🔒' },
    { id: 'backup', label: t.backup, icon: '💾' },
    { id: 'notifications', label: t.notifications, icon: '🔔' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="admin-settings">
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
      
      <div className="dashboard-wrapper">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>⚙️ {t.settings}</h1>
                <p>{t.generalSettings}</p>
              </div>
              <button 
                className={`save-btn ${updating ? 'updating' : ''}`} 
                onClick={handleUpdateSettings}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <span className="spinner"></span> 
                    {t.updating}
                  </>
                ) : (
                  <>
                    <svg className="save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {t.saveSettings}
                  </>
                )}
              </button>
            </div>

            {/* Tabs */}
            <div className="settings-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="settings-section">
                <div className="settings-card">
                  <h3>{t.generalSettings}</h3>
                  
                  {generalSettings.updatedAt && (
                    <div className="last-updated">
                      <span className="updated-label">{t.updatedAt}:</span>
                      <span className="updated-value">{formatDate(generalSettings.updatedAt)}</span>
                    </div>
                  )}
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t.siteName} (English)</label>
                      <input
                        type="text"
                        name="siteName"
                        value={generalSettings.siteName}
                        onChange={handleGeneralChange}
                        placeholder="Enter site name in English"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.siteName} ({t.nepali})</label>
                      <input
                        type="text"
                        name="siteName_np"
                        value={generalSettings.siteName_np}
                        onChange={handleGeneralChange}
                        placeholder="साइटको नाम नेपालीमा"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>{t.siteDescription} (English)</label>
                      <textarea
                        name="siteDescription"
                        value={generalSettings.siteDescription}
                        onChange={handleGeneralChange}
                        rows="2"
                        placeholder="Enter site description in English"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>{t.siteDescription} ({t.nepali})</label>
                      <textarea
                        name="siteDescription_np"
                        value={generalSettings.siteDescription_np}
                        onChange={handleGeneralChange}
                        rows="2"
                        placeholder="साइटको विवरण नेपालीमा"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.siteEmail}</label>
                      <input
                        type="email"
                        name="siteEmail"
                        value={generalSettings.siteEmail}
                        onChange={handleGeneralChange}
                        placeholder="support@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.sitePhone}</label>
                      <input
                        type="text"
                        name="sitePhone"
                        value={generalSettings.sitePhone}
                        onChange={handleGeneralChange}
                        placeholder="01-1234567"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>{t.siteAddress} (English)</label>
                      <input
                        type="text"
                        name="siteAddress"
                        value={generalSettings.siteAddress}
                        onChange={handleGeneralChange}
                        placeholder="Enter address in English"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>{t.siteAddress} ({t.nepali})</label>
                      <input
                        type="text"
                        name="siteAddress_np"
                        value={generalSettings.siteAddress_np}
                        onChange={handleGeneralChange}
                        placeholder="ठेगाना नेपालीमा"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.timezone}</label>
                      <select name="timezone" value={generalSettings.timezone} onChange={handleGeneralChange}>
                        <option value="Asia/Kathmandu">Asia/Kathmandu (NPT)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.dateFormat}</label>
                      <select name="dateFormat" value={generalSettings.dateFormat} onChange={handleGeneralChange}>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.timeFormat}</label>
                      <select name="timeFormat" value={generalSettings.timeFormat} onChange={handleGeneralChange}>
                        <option value="24h">{t.hours24}</option>
                        <option value="12h">{t.hours12}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.defaultLanguage}</label>
                      <select name="defaultLanguage" value={generalSettings.defaultLanguage} onChange={handleGeneralChange}>
                        <option value="np">{t.nepali}</option>
                        <option value="en">{t.english}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.itemsPerPage}</label>
                      <select name="itemsPerPage" value={generalSettings.itemsPerPage} onChange={handleGeneralChange}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="enableRegistration"
                        checked={generalSettings.enableRegistration}
                        onChange={handleGeneralChange}
                      />
                      <span>{t.enableRegistration}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="enablePublicComplaints"
                        checked={generalSettings.enablePublicComplaints}
                        onChange={handleGeneralChange}
                      />
                      <span>{t.enablePublicComplaints}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="maintenanceMode"
                        checked={generalSettings.maintenanceMode}
                        onChange={handleGeneralChange}
                      />
                      <span>{t.maintenanceMode}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings Tab */}
            {activeTab === 'email' && (
              <div className="settings-section">
                <div className="settings-card">
                  <h3>{t.emailSettings}</h3>
                  
                  {emailSettings.updatedAt && (
                    <div className="last-updated">
                      <span className="updated-label">{t.updatedAt}:</span>
                      <span className="updated-value">{formatDate(emailSettings.updatedAt)}</span>
                    </div>
                  )}
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t.smtpHost}</label>
                      <input
                        type="text"
                        name="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={handleEmailChange}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.smtpPort}</label>
                      <input
                        type="number"
                        name="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={handleEmailChange}
                        placeholder="587"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.smtpUser}</label>
                      <input
                        type="text"
                        name="smtpUser"
                        value={emailSettings.smtpUser}
                        onChange={handleEmailChange}
                        placeholder="user@gmail.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.smtpPassword}</label>
                      <input
                        type="password"
                        name="smtpPassword"
                        value={emailSettings.smtpPassword}
                        onChange={handleEmailChange}
                        placeholder="Enter SMTP password"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.smtpEncryption}</label>
                      <select name="smtpEncryption" value={emailSettings.smtpEncryption} onChange={handleEmailChange}>
                        <option value="tls">{t.tls}</option>
                        <option value="ssl">{t.ssl}</option>
                        <option value="none">{t.none}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.fromEmail}</label>
                      <input
                        type="email"
                        name="fromEmail"
                        value={emailSettings.fromEmail}
                        onChange={handleEmailChange}
                        placeholder="notifications@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.fromName} (English)</label>
                      <input
                        type="text"
                        name="fromName"
                        value={emailSettings.fromName}
                        onChange={handleEmailChange}
                        placeholder="Sender Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.fromName} ({t.nepali})</label>
                      <input
                        type="text"
                        name="fromName_np"
                        value={emailSettings.fromName_np}
                        onChange={handleEmailChange}
                        placeholder="पठाउनेको नाम"
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="sendComplaintConfirmation"
                        checked={emailSettings.sendComplaintConfirmation}
                        onChange={handleEmailChange}
                      />
                      <span>{t.sendComplaintConfirmation}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="sendComplaintUpdate"
                        checked={emailSettings.sendComplaintUpdate}
                        onChange={handleEmailChange}
                      />
                      <span>{t.sendComplaintUpdate}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="sendComplaintResolved"
                        checked={emailSettings.sendComplaintResolved}
                        onChange={handleEmailChange}
                      />
                      <span>{t.sendComplaintResolved}</span>
                    </label>
                  </div>

                  <button className="test-email-btn" onClick={handleTestEmail}>
                    ✉️ {t.testEmail}
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="settings-card">
                  <h3>{t.securitySettings}</h3>
                  
                  {securitySettings.updatedAt && (
                    <div className="last-updated">
                      <span className="updated-label">{t.updatedAt}:</span>
                      <span className="updated-value">{formatDate(securitySettings.updatedAt)}</span>
                    </div>
                  )}
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t.sessionTimeout}</label>
                      <input
                        type="number"
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecurityChange}
                        min="5"
                        max="120"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.maxLoginAttempts}</label>
                      <input
                        type="number"
                        name="maxLoginAttempts"
                        value={securitySettings.maxLoginAttempts}
                        onChange={handleSecurityChange}
                        min="3"
                        max="10"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.lockoutDuration}</label>
                      <input
                        type="number"
                        name="lockoutDuration"
                        value={securitySettings.lockoutDuration}
                        onChange={handleSecurityChange}
                        min="5"
                        max="60"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.passwordExpiryDays}</label>
                      <input
                        type="number"
                        name="passwordExpiryDays"
                        value={securitySettings.passwordExpiryDays}
                        onChange={handleSecurityChange}
                        min="30"
                        max="365"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.minPasswordLength}</label>
                      <input
                        type="number"
                        name="minPasswordLength"
                        value={securitySettings.minPasswordLength}
                        onChange={handleSecurityChange}
                        min="6"
                        max="20"
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="requireUppercase"
                        checked={securitySettings.requireUppercase}
                        onChange={handleSecurityChange}
                      />
                      <span>{t.requireUppercase}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="requireLowercase"
                        checked={securitySettings.requireLowercase}
                        onChange={handleSecurityChange}
                      />
                      <span>{t.requireLowercase}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="requireNumbers"
                        checked={securitySettings.requireNumbers}
                        onChange={handleSecurityChange}
                      />
                      <span>{t.requireNumbers}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="requireSpecialChars"
                        checked={securitySettings.requireSpecialChars}
                        onChange={handleSecurityChange}
                      />
                      <span>{t.requireSpecialChars}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="twoFactorAuth"
                        checked={securitySettings.twoFactorAuth}
                        onChange={handleSecurityChange}
                      />
                      <span>{t.twoFactorAuth}</span>
                    </label>
                  </div>

                  <div className="form-group full-width">
                    <label>{t.ipWhitelist}</label>
                    <textarea
                      name="ipWhitelist"
                      value={securitySettings.ipWhitelist}
                      onChange={handleSecurityChange}
                      rows="3"
                      placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
                    />
                    <small>Enter one IP address per line</small>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings Tab */}
            {activeTab === 'backup' && (
              <div className="settings-section">
                <div className="settings-card">
                  <h3>{t.backupSettings}</h3>
                  
                  {backupSettings.updatedAt && (
                    <div className="last-updated">
                      <span className="updated-label">{t.updatedAt}:</span>
                      <span className="updated-value">{formatDate(backupSettings.updatedAt)}</span>
                    </div>
                  )}
                  
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="autoBackup"
                        checked={backupSettings.autoBackup}
                        onChange={handleBackupChange}
                      />
                      <span>{t.autoBackup}</span>
                    </label>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t.backupFrequency}</label>
                      <select name="backupFrequency" value={backupSettings.backupFrequency} onChange={handleBackupChange}>
                        <option value="daily">{t.daily}</option>
                        <option value="weekly">{t.weekly}</option>
                        <option value="monthly">{t.monthly}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.backupTime}</label>
                      <input
                        type="time"
                        name="backupTime"
                        value={backupSettings.backupTime}
                        onChange={handleBackupChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.backupRetention}</label>
                      <input
                        type="number"
                        name="backupRetention"
                        value={backupSettings.backupRetention}
                        onChange={handleBackupChange}
                        min="7"
                        max="365"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.backupLocation}</label>
                      <input
                        type="text"
                        name="backupLocation"
                        value={backupSettings.backupLocation}
                        onChange={handleBackupChange}
                      />
                    </div>
                  </div>

                  {(backupSettings.lastBackup || backupSettings.lastBackupSize) && (
                    <div className="backup-info">
                      <div className="info-row">
                        <span className="info-label">{t.lastBackup}:</span>
                        <span className="info-value">{formatDate(backupSettings.lastBackup)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">{t.lastBackupSize}:</span>
                        <span className="info-value">{backupSettings.lastBackupSize || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  <button className="manual-backup-btn" onClick={handleManualBackup}>
                    💾 {t.backupNow}
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings Tab */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="settings-card">
                  <h3>{t.notificationSettings}</h3>
                  
                  {notificationSettings.updatedAt && (
                    <div className="last-updated">
                      <span className="updated-label">{t.updatedAt}:</span>
                      <span className="updated-value">{formatDate(notificationSettings.updatedAt)}</span>
                    </div>
                  )}
                  
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                      />
                      <span>{t.emailNotifications}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="smsNotifications"
                        checked={notificationSettings.smsNotifications}
                        onChange={handleNotificationChange}
                      />
                      <span>{t.smsNotifications}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={notificationSettings.pushNotifications}
                        onChange={handleNotificationChange}
                      />
                      <span>{t.pushNotifications}</span>
                    </label>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t.adminEmail}</label>
                      <input
                        type="email"
                        name="adminEmail"
                        value={notificationSettings.adminEmail}
                        onChange={handleNotificationChange}
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.adminPhone}</label>
                      <input
                        type="text"
                        name="adminPhone"
                        value={notificationSettings.adminPhone}
                        onChange={handleNotificationChange}
                        placeholder="98xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifyNewComplaint"
                        checked={notificationSettings.notifyNewComplaint}
                        onChange={handleNotificationChange}
                      />
                      <span>{t.notifyNewComplaint}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifyComplaintUpdate"
                        checked={notificationSettings.notifyComplaintUpdate}
                        onChange={handleNotificationChange}
                      />
                      <span>{t.notifyComplaintUpdate}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifyComplaintResolved"
                        checked={notificationSettings.notifyComplaintResolved}
                        onChange={handleNotificationChange}
                      />
                      <span>{t.notifyComplaintResolved}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifyNewUser"
                        checked={notificationSettings.notifyNewUser}
                        onChange={handleNotificationChange}
                      />
                      <span>{t.notifyNewUser}</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifySystemUpdate"
                        checked={notificationSettings.notifySystemUpdate}
                        onChange={handleNotificationChange}
                      />
                      <span>{t.notifySystemUpdate}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-settings {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
          width: 100%;
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

        .dashboard-wrapper {
          display: flex;
          min-height: calc(100vh - 70px);
          margin-top: 200px;
          position: relative;
          width: 100%;
        }

        .sidebar-container {
          position: fixed;
       
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
          min-height: 100%;
          overflow-x: auto;
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

        .save-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          font-family: inherit;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        }

        .save-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .save-btn.updating {
          background: linear-gradient(135deg, #64748b, #475569);
          box-shadow: none;
        }

        .save-icon {
          width: 20px;
          height: 20px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        .settings-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          background: white;
          padding: 8px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s;
          font-family: inherit;
        }

        .tab-btn:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .tab-btn.active {
          background: #eff6ff;
          color: #3b82f6;
        }

        .tab-icon {
          font-size: 1.1rem;
        }

        .settings-section {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .settings-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          border: 1px solid #e2e8f0;
        }

        .settings-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .last-updated {
          display: flex;
          gap: 8px;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.75rem;
        }

        .updated-label {
          font-weight: 600;
          color: #475569;
        }

        .updated-value {
          color: #64748b;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 6px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
          transition: all 0.2s;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .form-group small {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 4px;
        }

        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          color: #334155;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .test-email-btn, .manual-backup-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: #475569;
          margin-top: 20px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .test-email-btn:hover, .manual-backup-btn:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .backup-info {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin: 20px 0;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 500;
          color: #475569;
        }

        .info-value {
          color: #0f172a;
        }

        @media (max-width: 768px) {
          .dashboard-wrapper {
            flex-direction: column;
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
          
          .save-btn {
            width: 100%;
            justify-content: center;
            padding: 12px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-group.full-width {
            grid-column: span 1;
          }
          
          .settings-tabs {
            overflow-x: auto;
            flex-wrap: nowrap;
          }
          
          .tab-btn {
            white-space: nowrap;
          }
          
          .checkbox-group {
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .settings-card {
            padding: 20px;
          }
          
          .info-row {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettingsGeneral;