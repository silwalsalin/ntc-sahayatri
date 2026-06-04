// src/pages/StaffAccountSettings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffAccountSettings = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [backendStatus, setBackendStatus] = useState('checking');

  const [staffData, setStaffData] = useState({
    name: 'Ram Bahadur',
    email: 'ram@ntc.gov.np',
    phone: '9841234567',
    profilePicture: null,
    timezone: 'Asia/Kathmandu',
    dateFormat: 'YYYY-MM-DD',
    language: 'ne'
  });

  const [generalSettings, setGeneralSettings] = useState({
    theme: 'light',
    language: 'ne',
    timezone: 'Asia/Kathmandu',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    firstDayOfWeek: 'sunday',
    itemsPerPage: 10,
    defaultDashboard: 'staff-dashboard'
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    taskReminders: true,
    complaintUpdates: true,
    reportGeneration: true,
    weeklyDigest: false,
    marketingEmails: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: false,
    showProfileInDirectory: true,
    allowMessagesFromColleagues: true,
    twoFactorAuth: false,
    loginAlerts: true,
    deviceManagement: true
  });

  const [sessionData, setSessionData] = useState({
    sessions: [
      { id: 1, device: 'Chrome on Windows', location: 'Kathmandu, Nepal', ip: '192.168.1.1', lastActive: '2024-01-15 10:30 AM', current: true },
      { id: 2, device: 'Safari on iPhone', location: 'Kathmandu, Nepal', ip: '192.168.1.2', lastActive: '2024-01-14 08:15 PM', current: false },
      { id: 3, device: 'Firefox on Mac', location: 'Pokhara, Nepal', ip: '192.168.1.3', lastActive: '2024-01-13 02:00 PM', current: false }
    ],
    activeSessions: 1
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch account settings
  const fetchAccountSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/staff/account-settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setGeneralSettings(response.data.data.general);
        setPreferences(response.data.data.preferences);
        setPrivacySettings(response.data.data.privacy);
        setSessionData(response.data.data.sessions);
        setBackendStatus('connected');
      } else {
        setGeneralSettings(getSampleGeneralSettings());
        setPreferences(getSamplePreferences());
        setPrivacySettings(getSamplePrivacySettings());
        setSessionData(getSampleSessionData());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching account settings:', error);
      setGeneralSettings(getSampleGeneralSettings());
      setPreferences(getSamplePreferences());
      setPrivacySettings(getSamplePrivacySettings());
      setSessionData(getSampleSessionData());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const getSampleGeneralSettings = () => ({
    theme: 'light',
    language: 'ne',
    timezone: 'Asia/Kathmandu',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    firstDayOfWeek: 'sunday',
    itemsPerPage: 10,
    defaultDashboard: 'staff-dashboard'
  });

  const getSamplePreferences = () => ({
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    taskReminders: true,
    complaintUpdates: true,
    reportGeneration: true,
    weeklyDigest: false,
    marketingEmails: false
  });

  const getSamplePrivacySettings = () => ({
    showEmail: true,
    showPhone: false,
    showProfileInDirectory: true,
    allowMessagesFromColleagues: true,
    twoFactorAuth: false,
    loginAlerts: true,
    deviceManagement: true
  });

  const getSampleSessionData = () => ({
    sessions: [
      { id: 1, device: 'Chrome on Windows', location: 'Kathmandu, Nepal', ip: '192.168.1.1', lastActive: '2024-01-15 10:30 AM', current: true },
      { id: 2, device: 'Safari on iPhone', location: 'Kathmandu, Nepal', ip: '192.168.1.2', lastActive: '2024-01-14 08:15 PM', current: false },
      { id: 3, device: 'Firefox on Mac', location: 'Pokhara, Nepal', ip: '192.168.1.3', lastActive: '2024-01-13 02:00 PM', current: false }
    ],
    activeSessions: 1
  });

  // Update general settings
  const updateGeneralSettings = async () => {
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.put(
        'http://localhost:5000/api/staff/account-settings/general',
        generalSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(language === 'np' ? 'सामान्य सेटिङ्स अपडेट गरियो' : 'General settings updated');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating general settings:', error);
      setError(language === 'np' 
        ? 'सेटिङ्स अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Failed to update settings. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  // Update preferences
  const updatePreferences = async () => {
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.put(
        'http://localhost:5000/api/staff/account-settings/preferences',
        preferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(language === 'np' ? 'प्राथमिकताहरू अपडेट गरियो' : 'Preferences updated');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError(language === 'np' 
        ? 'प्राथमिकता अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Failed to update preferences. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  // Update privacy settings
  const updatePrivacySettings = async () => {
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.put(
        'http://localhost:5000/api/staff/account-settings/privacy',
        privacySettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(language === 'np' ? 'गोपनीयता सेटिङ्स अपडेट गरियो' : 'Privacy settings updated');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setError(language === 'np' 
        ? 'गोपनीयता सेटिङ्स अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Failed to update privacy settings. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  // Terminate session
  const terminateSession = async (sessionId) => {
    if (window.confirm(language === 'np' ? 'यो सेसन बन्द गर्नुहुन्छ?' : 'Terminate this session?')) {
      try {
        const token = localStorage.getItem('staffToken');
        const response = await axios.delete(
          `http://localhost:5000/api/staff/sessions/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setSessionData(prev => ({
            ...prev,
            sessions: prev.sessions.filter(s => s.id !== sessionId),
            activeSessions: prev.sessions.filter(s => s.id !== sessionId && s.current).length
          }));
          setSuccess(language === 'np' ? 'सेसन बन्द गरियो' : 'Session terminated');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (error) {
        console.error('Error terminating session:', error);
        setError(language === 'np' ? 'सेसन बन्द गर्न असफल' : 'Failed to terminate session');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Terminate all other sessions
  const terminateAllOtherSessions = async () => {
    if (window.confirm(language === 'np' ? 'अरू सबै सेसनहरू बन्द गर्नुहुन्छ?' : 'Terminate all other sessions?')) {
      try {
        const token = localStorage.getItem('staffToken');
        const response = await axios.delete(
          'http://localhost:5000/api/staff/sessions/others',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setSessionData(prev => ({
            ...prev,
            sessions: prev.sessions.filter(s => s.current),
            activeSessions: 1
          }));
          setSuccess(language === 'np' ? 'अरू सबै सेसनहरू बन्द गरियो' : 'All other sessions terminated');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (error) {
        console.error('Error terminating sessions:', error);
        setError(language === 'np' ? 'सेसनहरू बन्द गर्न असफल' : 'Failed to terminate sessions');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Enable 2FA
  const enableTwoFactorAuth = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.post(
        'http://localhost:5000/api/staff/2fa/enable',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setPrivacySettings(prev => ({ ...prev, twoFactorAuth: true }));
        setSuccess(language === 'np' ? 'दुई-चरण प्रमाणीकरण सक्रिय गरियो' : 'Two-factor authentication enabled');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      setError(language === 'np' ? '२FA सक्रिय गर्न असफल' : 'Failed to enable 2FA');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchAccountSettings();
    }
  }, [navigate]);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({ ...prev, [name]: checked }));
  };

  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  const content = {
    np: {
      pageTitle: 'खाता सेटिङ्स',
      general: 'साधारण',
      preferences: 'प्राथमिकताहरू',
      privacy: 'गोपनीयता',
      sessions: 'सेसनहरू',
      generalSettings: 'साधारण सेटिङ्स',
      appearance: 'रूप',
      theme: 'थीम',
      light: 'उज्यालो',
      dark: 'अध्यारो',
      system: 'प्रणाली',
      language: 'भाषा',
      nepali: 'नेपाली',
      english: 'अंग्रेजी',
      timezone: 'समय क्षेत्र',
      dateFormat: 'मिति ढाँचा',
      timeFormat: 'समय ढाँचा',
      hour12: '१२ घण्टा',
      hour24: '२४ घण्टा',
      firstDayOfWeek: 'हप्ताको पहिलो दिन',
      sunday: 'आइतवार',
      monday: 'सोमवार',
      itemsPerPage: 'प्रति पृष्ठ वस्तुहरू',
      defaultDashboard: 'पूर्वनिर्धारित ड्यासबोर्ड',
      notificationPreferences: 'सूचना प्राथमिकताहरू',
      emailNotifications: 'इमेल सूचनाहरू',
      smsNotifications: 'एसएमएस सूचनाहरू',
      desktopNotifications: 'डेस्कटप सूचनाहरू',
      taskReminders: 'कार्य सम्झनाहरू',
      complaintUpdates: 'गुनासो अपडेटहरू',
      reportGeneration: 'रिपोर्ट उत्पादन',
      weeklyDigest: 'साप्ताहिक सारांश',
      marketingEmails: 'विपणन इमेलहरू',
      privacySettings: 'गोपनीयता सेटिङ्स',
      profileVisibility: 'प्रोफाइल दृश्यता',
      showEmail: 'इमेल देखाउनुहोस्',
      showPhone: 'फोन नम्बर देखाउनुहोस्',
      showProfileInDirectory: 'निर्देशिकामा प्रोफाइल देखाउनुहोस्',
      allowMessagesFromColleagues: 'सहकर्मीहरूबाट सन्देश अनुमति दिनुहोस्',
      security: 'सुरक्षा',
      twoFactorAuth: 'दुई-चरण प्रमाणीकरण',
      enable2FA: '२FA सक्रिय गर्नुहोस्',
      loginAlerts: 'लगइन अलर्टहरू',
      deviceManagement: 'यन्त्र व्यवस्थापन',
      activeSessions: 'सक्रिय सेसनहरू',
      currentSession: 'हालको सेसन',
      device: 'यन्त्र',
      location: 'स्थान',
      ipAddress: 'आईपी ठेगाना',
      lastActive: 'अन्तिम सक्रिय',
      actions: 'कार्यहरू',
      terminate: 'बन्द गर्नुहोस्',
      terminateAllOthers: 'अरू सबै बन्द गर्नुहोस्',
      save: 'सुरक्षित गर्नुहोस्',
      saving: 'सुरक्षित हुँदै...',
      refresh: 'रिफ्रेस',
      loading: 'लोड हुँदै...',
      back: 'पछाडि फर्कनुहोस्'
    },
    en: {
      pageTitle: 'Account Settings',
      general: 'General',
      preferences: 'Preferences',
      privacy: 'Privacy',
      sessions: 'Sessions',
      generalSettings: 'General Settings',
      appearance: 'Appearance',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      language: 'Language',
      nepali: 'Nepali',
      english: 'English',
      timezone: 'Timezone',
      dateFormat: 'Date Format',
      timeFormat: 'Time Format',
      hour12: '12 Hour',
      hour24: '24 Hour',
      firstDayOfWeek: 'First Day of Week',
      sunday: 'Sunday',
      monday: 'Monday',
      itemsPerPage: 'Items Per Page',
      defaultDashboard: 'Default Dashboard',
      notificationPreferences: 'Notification Preferences',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      desktopNotifications: 'Desktop Notifications',
      taskReminders: 'Task Reminders',
      complaintUpdates: 'Complaint Updates',
      reportGeneration: 'Report Generation',
      weeklyDigest: 'Weekly Digest',
      marketingEmails: 'Marketing Emails',
      privacySettings: 'Privacy Settings',
      profileVisibility: 'Profile Visibility',
      showEmail: 'Show Email',
      showPhone: 'Show Phone Number',
      showProfileInDirectory: 'Show Profile in Directory',
      allowMessagesFromColleagues: 'Allow Messages from Colleagues',
      security: 'Security',
      twoFactorAuth: 'Two-Factor Authentication',
      enable2FA: 'Enable 2FA',
      loginAlerts: 'Login Alerts',
      deviceManagement: 'Device Management',
      activeSessions: 'Active Sessions',
      currentSession: 'Current Session',
      device: 'Device',
      location: 'Location',
      ipAddress: 'IP Address',
      lastActive: 'Last Active',
      actions: 'Actions',
      terminate: 'Terminate',
      terminateAllOthers: 'Terminate All Others',
      save: 'Save',
      saving: 'Saving...',
      refresh: 'Refresh',
      loading: 'Loading...',
      back: 'Back'
    }
  };

  const t = content[language];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="staff-account-settings">
      <StaffHeader 
        language={language}
        setLanguage={setLanguage}
        staffName="Ram Bahadur"
        staffRole="Technical Support"
        onLogout={handleLogout}
      />
      
      <div className="dashboard-layout">
        <StaffSidebar 
          language={language}
          staffName="Ram Bahadur"
          staffRole="Technical Support"
          onLogout={handleLogout}
        />
        
        <div className="main-content">
          <div className="content-wrapper">
            {/* Backend Status Banner */}
            {backendStatus === 'disconnected' && (
              <div className="backend-warning">
                ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।' : 'Backend server not connected. Showing sample data.'}
              </div>
            )}

            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">{t.pageTitle}</h1>
              <button className="refresh-btn" onClick={fetchAccountSettings}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                ⚙️ {t.general}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                🎯 {t.preferences}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                🔒 {t.privacy}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
                onClick={() => setActiveTab('sessions')}
              >
                💻 {t.sessions}
              </button>
            </div>

            {/* Error/Success Messages */}
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

            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="settings-container">
                <div className="settings-card">
                  <h3>{t.generalSettings}</h3>
                  
                  <div className="form-section">
                    <h4>{t.appearance}</h4>
                    <div className="form-group">
                      <label>{t.theme}</label>
                      <select name="theme" value={generalSettings.theme} onChange={handleGeneralChange}>
                        <option value="light">{t.light}</option>
                        <option value="dark">{t.dark}</option>
                        <option value="system">{t.system}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>{t.language}</h4>
                    <div className="form-group">
                      <label>{t.language}</label>
                      <select name="language" value={generalSettings.language} onChange={handleGeneralChange}>
                        <option value="ne">{t.nepali}</option>
                        <option value="en">{t.english}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>{t.timezone}</h4>
                    <div className="form-group">
                      <label>{t.timezone}</label>
                      <select name="timezone" value={generalSettings.timezone} onChange={handleGeneralChange}>
                        <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-section half">
                      <h4>{t.dateFormat}</h4>
                      <div className="form-group">
                        <select name="dateFormat" value={generalSettings.dateFormat} onChange={handleGeneralChange}>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD MMM YYYY">DD MMM YYYY</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-section half">
                      <h4>{t.timeFormat}</h4>
                      <div className="form-group">
                        <select name="timeFormat" value={generalSettings.timeFormat} onChange={handleGeneralChange}>
                          <option value="12h">{t.hour12}</option>
                          <option value="24h">{t.hour24}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-section half">
                      <h4>{t.firstDayOfWeek}</h4>
                      <div className="form-group">
                        <select name="firstDayOfWeek" value={generalSettings.firstDayOfWeek} onChange={handleGeneralChange}>
                          <option value="sunday">{t.sunday}</option>
                          <option value="monday">{t.monday}</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-section half">
                      <h4>{t.itemsPerPage}</h4>
                      <div className="form-group">
                        <select name="itemsPerPage" value={generalSettings.itemsPerPage} onChange={handleGeneralChange}>
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>{t.defaultDashboard}</h4>
                    <div className="form-group">
                      <select name="defaultDashboard" value={generalSettings.defaultDashboard} onChange={handleGeneralChange}>
                        <option value="staff-dashboard">Staff Dashboard</option>
                        <option value="staff-complaints-assigned">Assigned Complaints</option>
                        <option value="staff-tasks">My Tasks</option>
                        <option value="staff-performance">Performance</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={updateGeneralSettings} disabled={updating}>
                      {updating ? t.saving : t.save}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="settings-container">
                <div className="settings-card">
                  <h3>{t.notificationPreferences}</h3>
                  
                  <div className="preferences-list">
                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">📧</span>
                        <span className="preference-label">{t.emailNotifications}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="emailNotifications" checked={preferences.emailNotifications} onChange={handlePreferenceChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">📱</span>
                        <span className="preference-label">{t.smsNotifications}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="smsNotifications" checked={preferences.smsNotifications} onChange={handlePreferenceChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">💻</span>
                        <span className="preference-label">{t.desktopNotifications}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="desktopNotifications" checked={preferences.desktopNotifications} onChange={handlePreferenceChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">✅</span>
                        <span className="preference-label">{t.taskReminders}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="taskReminders" checked={preferences.taskReminders} onChange={handlePreferenceChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">💬</span>
                        <span className="preference-label">{t.complaintUpdates}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="complaintUpdates" checked={preferences.complaintUpdates} onChange={handlePreferenceChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">📊</span>
                        <span className="preference-label">{t.reportGeneration}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="reportGeneration" checked={preferences.reportGeneration} onChange={handlePreferenceChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">📰</span>
                        <span className="preference-label">{t.weeklyDigest}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="weeklyDigest" checked={preferences.weeklyDigest} onChange={handlePreferenceChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">📢</span>
                        <span className="preference-label">{t.marketingEmails}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="marketingEmails" checked={preferences.marketingEmails} onChange={handlePreferenceChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={updatePreferences} disabled={updating}>
                      {updating ? t.saving : t.save}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="settings-container">
                <div className="settings-card">
                  <h3>{t.privacySettings}</h3>
                  
                  <div className="form-section">
                    <h4>{t.profileVisibility}</h4>
                    
                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">📧</span>
                        <span className="preference-label">{t.showEmail}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="showEmail" checked={privacySettings.showEmail} onChange={handlePrivacyChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">📞</span>
                        <span className="preference-label">{t.showPhone}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="showPhone" checked={privacySettings.showPhone} onChange={handlePrivacyChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">👥</span>
                        <span className="preference-label">{t.showProfileInDirectory}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="showProfileInDirectory" checked={privacySettings.showProfileInDirectory} onChange={handlePrivacyChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">💬</span>
                        <span className="preference-label">{t.allowMessagesFromColleagues}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="allowMessagesFromColleagues" checked={privacySettings.allowMessagesFromColleagues} onChange={handlePrivacyChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>{t.security}</h4>
                    
                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">🔐</span>
                        <span className="preference-label">{t.twoFactorAuth}</span>
                      </div>
                      <div className="preference-action">
                        {privacySettings.twoFactorAuth ? (
                          <span className="enabled-badge">✅ Enabled</span>
                        ) : (
                          <button className="btn-enable" onClick={enableTwoFactorAuth} disabled={updating}>
                            {t.enable2FA}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">🔔</span>
                        <span className="preference-label">{t.loginAlerts}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="loginAlerts" checked={privacySettings.loginAlerts} onChange={handlePrivacyChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div className="preference-info">
                        <span className="preference-icon">📱</span>
                        <span className="preference-label">{t.deviceManagement}</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" name="deviceManagement" checked={privacySettings.deviceManagement} onChange={handlePrivacyChange} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={updatePrivacySettings} disabled={updating}>
                      {updating ? t.saving : t.save}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="settings-container">
                <div className="settings-card">
                  <div className="sessions-header">
                    <h3>{t.activeSessions}</h3>
                    <button className="btn-terminate-all" onClick={terminateAllOtherSessions}>
                      {t.terminateAllOthers}
                    </button>
                  </div>
                  
                  <div className="sessions-list">
                    {sessionData.sessions.map((session) => (
                      <div key={session.id} className={`session-item ${session.current ? 'current' : ''}`}>
                        <div className="session-info">
                          <div className="session-device">
                            <span className="device-icon">💻</span>
                            <div>
                              <strong>{session.device}</strong>
                              {session.current && <span className="current-badge">{t.currentSession}</span>}
                            </div>
                          </div>
                          <div className="session-details">
                            <span>📍 {session.location}</span>
                            <span>🌐 {session.ip}</span>
                            <span>🕐 {session.lastActive}</span>
                          </div>
                        </div>
                        {!session.current && (
                          <button className="btn-terminate" onClick={() => terminateSession(session.id)}>
                            {t.terminate}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {sessionData.sessions.length === 0 && (
                    <div className="empty-state">
                      <span className="empty-icon">💻</span>
                      <p>No active sessions</p>
                    </div>
                  )}
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

        .staff-account-settings {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          height: 100vh;
          width: 100%;
          overflow: hidden;
          position: relative;
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

        .backend-warning {
          background: #ff9800;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
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
          border-color: #0288d1;
          color: #0288d1;
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

        .error-message, .success-message {
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .error-message {
          background: #ffebee;
          border-left: 4px solid #f44336;
        }

        .success-message {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
        }

        .settings-container {
          margin-bottom: 24px;
        }

        .settings-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .settings-card h3 {
          padding: 20px 24px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          margin: 0;
        }

        .form-section {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-section h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #475569;
          margin-bottom: 6px;
          font-size: 0.85rem;
        }

        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
        }

        .form-group select:focus {
          outline: none;
          border-color: #0288d1;
        }

        .form-row {
          display: flex;
          gap: 20px;
        }

        .form-section.half {
          flex: 1;
        }

        .preferences-list, .sessions-list {
          padding: 8px 0;
        }

        .preference-item, .session-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .preference-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .preference-icon {
          font-size: 1.2rem;
        }

        .preference-label {
          font-weight: 500;
          color: #0f172a;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
        }

        input:checked + .slider {
          background-color: #0288d1;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
        }

        .preference-action {
          display: flex;
          align-items: center;
        }

        .btn-enable {
          padding: 6px 16px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .enabled-badge {
          color: #10b981;
          font-weight: 500;
        }

        .sessions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .btn-terminate-all {
          padding: 6px 16px;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .session-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .session-item.current {
          background: #f0f9ff;
        }

        .session-info {
          flex: 1;
        }

        .session-device {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .device-icon {
          font-size: 1.2rem;
        }

        .current-badge {
          display: inline-block;
          margin-left: 10px;
          padding: 2px 8px;
          background: #0288d1;
          color: white;
          border-radius: 12px;
          font-size: 0.65rem;
        }

        .session-details {
          display: flex;
          gap: 20px;
          font-size: 0.75rem;
          color: #64748b;
          flex-wrap: wrap;
        }

        .btn-terminate {
          padding: 6px 16px;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .form-actions {
          padding: 20px 24px;
          display: flex;
          justify-content: flex-end;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .btn-save {
          padding: 10px 32px;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(2, 136, 209, 0.3);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 60px;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          
          .content-wrapper {
            padding: 16px;
          }
          
          .form-row {
            flex-direction: column;
          }
          
          .session-details {
            flex-direction: column;
            gap: 4px;
          }
          
          .session-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .sessions-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          
          .tab-navigation {
            flex-direction: column;
            border-bottom: none;
            gap: 8px;
          }
          
          .tab-btn {
            text-align: center;
            border-radius: 8px;
          }
          
          .tab-btn.active {
            background: #0288d1;
            color: white;
            border-bottom: none;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffAccountSettings;