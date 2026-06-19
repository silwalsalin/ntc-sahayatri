// src/pages/StaffProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffProfile = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [backendStatus, setBackendStatus] = useState('checking');

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    joinDate: '',
    employeeId: '',
    address: '',
    dateOfBirth: '',
    gender: 'Male',
    emergencyContact: '',
    emergencyContactName: '',
    bloodGroup: 'O+',
    qualification: '',
    experience: '',
    languages: '',
    about: ''
  });

  const [formData, setFormData] = useState({ ...staffData });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    taskAssignments: true,
    complaintUpdates: true,
    reports: true,
    reminders: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load staff data from localStorage (this is the logged-in staff)
  useEffect(() => {
    const userStr = localStorage.getItem('staffUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setStaffData(prev => ({
          ...prev,
          id: user.id,
          name: user.name || 'Staff Member',
          role: user.role || 'Staff',
          email: user.email || '',
          phone: user.phone || '',
          department: user.department || 'Customer Support',
          employeeId: user.employeeId || `EMP-${user.id || '001'}`
        }));
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
  }, []);

  // Fetch staff profile - this fetches the profile of the logged-in staff only
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/staff/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const profileData = response.data.data;
        setStaffData(profileData);
        setFormData(profileData);
        
        // Update localStorage with latest profile data for this staff
        const userStr = localStorage.getItem('staffUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          const updatedUser = { ...user, ...profileData };
          localStorage.setItem('staffUser', JSON.stringify(updatedUser));
        }
        
        setBackendStatus('connected');
      } else {
        setStaffData(getSampleProfile());
        setFormData(getSampleProfile());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setStaffData(getSampleProfile());
      setFormData(getSampleProfile());
      setBackendStatus('disconnected');
    }
  };

  // Get sample profile based on current staff data (for demo/offline mode)
  const getSampleProfile = () => {
    return {
      id: staffData.id || 1,
      name: staffData.name || 'Staff Member',
      role: staffData.role || 'Staff',
      email: staffData.email || 'staff@ntc.gov.np',
      phone: staffData.phone || '9841XXXXXX',
      department: staffData.department || 'Customer Support',
      joinDate: '2023-01-15',
      employeeId: staffData.employeeId || 'NTC-EMP-001',
      address: 'Kathmandu, Nepal',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      emergencyContact: '98XXXXXXXX',
      emergencyContactName: 'Emergency Contact',
      bloodGroup: 'O+',
      qualification: 'Bachelor Degree',
      experience: '5 years',
      languages: 'Nepali, English',
      about: 'Staff member at NTC Complaint Management System.'
    };
  };

  // Update profile for the logged-in staff
  const updateProfile = async () => {
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.put(
        'http://localhost:5000/api/staff/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setStaffData(formData);
        
        // Update localStorage with updated profile data for this staff
        const userStr = localStorage.getItem('staffUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          const updatedUser = { ...user, ...formData };
          localStorage.setItem('staffUser', JSON.stringify(updatedUser));
        }
        
        setSuccess(language === 'np' ? 'प्रोफाइल सफलतापूर्वक अपडेट गरियो' : 'Profile updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(language === 'np' 
        ? 'प्रोफाइल अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Failed to update profile. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  // Change password for the logged-in staff
  const changePassword = async () => {
    if (!passwordData.currentPassword) {
      setError(language === 'np' ? 'कृपया हालको पासवर्ड प्रविष्ट गर्नुहोस्' : 'Please enter current password');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(language === 'np' ? 'नयाँ पासवर्ड मिल्दैन' : 'New passwords do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError(language === 'np' ? 'पासवर्ड कम्तीमा ६ क्यारेक्टरको हुनुपर्छ' : 'Password must be at least 6 characters');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.put(
        'http://localhost:5000/api/staff/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(language === 'np' ? 'पासवर्ड सफलतापूर्वक परिवर्तन गरियो' : 'Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError(language === 'np' 
        ? 'पासवर्ड परिवर्तन गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Failed to change password. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  // Update notification settings for the logged-in staff
  const updateNotificationSettings = async () => {
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.put(
        'http://localhost:5000/api/staff/notification-settings',
        notificationSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(language === 'np' ? 'सूचना सेटिङ्स अपडेट गरियो' : 'Notification settings updated');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError(language === 'np' 
        ? 'सेटिङ्स अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Failed to update settings. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  // Check authentication - this ensures only logged-in staff can access
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchProfile();
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  const content = {
    np: {
      pageTitle: 'मेरो प्रोफाइल',
      profile: 'प्रोफाइल',
      settings: 'सेटिङ्स',
      security: 'सुरक्षा',
      profileInfo: 'प्रोफाइल जानकारी',
      personalInfo: 'व्यक्तिगत जानकारी',
      changePassword: 'पासवर्ड परिवर्तन गर्नुहोस्',
      notificationSettings: 'सूचना सेटिङ्स',
      name: 'पुरा नाम',
      role: 'भूमिका',
      email: 'इमेल ठेगाना',
      phone: 'फोन नम्बर',
      department: 'विभाग',
      joinDate: 'सामेल मिति',
      employeeId: 'कर्मचारी आईडी',
      address: 'ठेगाना',
      dateOfBirth: 'जन्म मिति',
      gender: 'लिङ्ग',
      emergencyContact: 'आपत्कालीन सम्पर्क',
      emergencyContactName: 'आपत्कालीन सम्पर्क व्यक्ति',
      bloodGroup: 'रगत समूह',
      qualification: 'शैक्षिक योग्यता',
      experience: 'अनुभव',
      languages: 'भाषाहरू',
      about: 'बारेमा',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
      currentPassword: 'हालको पासवर्ड',
      newPassword: 'नयाँ पासवर्ड',
      confirmPassword: 'पासवर्ड पुष्टि गर्नुहोस्',
      emailNotifications: 'इमेल सूचनाहरू',
      smsNotifications: 'एसएमएस सूचनाहरू',
      taskAssignments: 'कार्य तोकिएको सूचना',
      complaintUpdates: 'गुनासो अपडेट सूचना',
      reports: 'रिपोर्ट सूचनाहरू',
      reminders: 'सम्झना सूचनाहरू',
      updateProfile: 'प्रोफाइल अपडेट गर्नुहोस्',
      updatePassword: 'पासवर्ड अपडेट गर्नुहोस्',
      updateSettings: 'सेटिङ्स अपडेट गर्नुहोस्',
      cancel: 'रद्द गर्नुहोस्',
      save: 'सुरक्षित गर्नुहोस्',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      editProfile: 'प्रोफाइल सम्पादन गर्नुहोस्',
      viewProfile: 'प्रोफाइल हेर्नुहोस्'
    },
    en: {
      pageTitle: 'My Profile',
      profile: 'Profile',
      settings: 'Settings',
      security: 'Security',
      profileInfo: 'Profile Information',
      personalInfo: 'Personal Information',
      changePassword: 'Change Password',
      notificationSettings: 'Notification Settings',
      name: 'Full Name',
      role: 'Role',
      email: 'Email Address',
      phone: 'Phone Number',
      department: 'Department',
      joinDate: 'Join Date',
      employeeId: 'Employee ID',
      address: 'Address',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      emergencyContact: 'Emergency Contact',
      emergencyContactName: 'Emergency Contact Person',
      bloodGroup: 'Blood Group',
      qualification: 'Qualification',
      experience: 'Experience',
      languages: 'Languages',
      about: 'About',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      taskAssignments: 'Task Assignment Notifications',
      complaintUpdates: 'Complaint Update Notifications',
      reports: 'Report Notifications',
      reminders: 'Reminder Notifications',
      updateProfile: 'Update Profile',
      updatePassword: 'Update Password',
      updateSettings: 'Update Settings',
      cancel: 'Cancel',
      save: 'Save',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      editProfile: 'Edit Profile',
      viewProfile: 'View Profile'
    }
  };

  const t = content[language];

  return (
    <div className="staff-profile">
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
            {/* Backend Status Banner */}
            {backendStatus === 'disconnected' && (
              <div className="backend-warning">
                ⚠️ {language === 'np' ? 'ब्याकेन्ड सर्भर जडान भएन। नमूना डाटा देखाउँदै।' : 'Backend server not connected. Showing sample data.'}
              </div>
            )}

            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">{t.pageTitle}</h1>
              <button className="refresh-btn" onClick={fetchProfile}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 {t.profile}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ {t.settings}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                🔒 {t.security}
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

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                  <div className="profile-avatar">
                    <span className="avatar-icon">👨‍💻</span>
                  </div>
                  <div className="profile-header-info">
                    <h2>{staffData.name}</h2>
                    <p>{staffData.role} | {staffData.department}</p>
                    <p className="employee-id">🆔 {staffData.employeeId}</p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="profile-form">
                  <div className="form-section">
                    <h3>{t.profileInfo}</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>{t.name}</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.role}</label>
                        <input
                          type="text"
                          name="role"
                          value={formData.role || ''}
                          disabled
                          className="disabled-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.email}</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.phone}</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.department}</label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department || ''}
                          disabled
                          className="disabled-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.joinDate}</label>
                        <input
                          type="text"
                          name="joinDate"
                          value={formData.joinDate || ''}
                          disabled
                          className="disabled-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>{t.personalInfo}</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>{t.address}</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.dateOfBirth}</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.gender}</label>
                        <select
                          name="gender"
                          value={formData.gender || 'Male'}
                          onChange={handleInputChange}
                          disabled={updating}
                        >
                          <option value="Male">{t.male}</option>
                          <option value="Female">{t.female}</option>
                          <option value="Other">{t.other}</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>{t.emergencyContact}</label>
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.emergencyContactName}</label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.bloodGroup}</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup || 'O+'}
                          onChange={handleInputChange}
                          disabled={updating}
                        >
                          <option>A+</option>
                          <option>A-</option>
                          <option>B+</option>
                          <option>B-</option>
                          <option>O+</option>
                          <option>O-</option>
                          <option>AB+</option>
                          <option>AB-</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>{t.qualification}</label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.experience}</label>
                        <input
                          type="text"
                          name="experience"
                          value={formData.experience || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t.languages}</label>
                        <input
                          type="text"
                          name="languages"
                          value={formData.languages || ''}
                          onChange={handleInputChange}
                          disabled={updating}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>{t.about}</label>
                        <textarea
                          name="about"
                          value={formData.about || ''}
                          onChange={handleInputChange}
                          rows="4"
                          disabled={updating}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      className="btn-save" 
                      onClick={updateProfile}
                      disabled={updating}
                    >
                      {updating ? 'Saving...' : t.updateProfile}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="settings-container">
                <div className="settings-card">
                  <h3>{t.notificationSettings}</h3>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <span className="setting-icon">📧</span>
                        <span className="setting-label">{t.emailNotifications}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          disabled={updating}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <span className="setting-icon">📱</span>
                        <span className="setting-label">{t.smsNotifications}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="smsNotifications"
                          checked={notificationSettings.smsNotifications}
                          onChange={handleNotificationChange}
                          disabled={updating}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <span className="setting-icon">📋</span>
                        <span className="setting-label">{t.taskAssignments}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="taskAssignments"
                          checked={notificationSettings.taskAssignments}
                          onChange={handleNotificationChange}
                          disabled={updating}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <span className="setting-icon">💬</span>
                        <span className="setting-label">{t.complaintUpdates}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="complaintUpdates"
                          checked={notificationSettings.complaintUpdates}
                          onChange={handleNotificationChange}
                          disabled={updating}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <span className="setting-icon">📊</span>
                        <span className="setting-label">{t.reports}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="reports"
                          checked={notificationSettings.reports}
                          onChange={handleNotificationChange}
                          disabled={updating}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <span className="setting-icon">⏰</span>
                        <span className="setting-label">{t.reminders}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="reminders"
                          checked={notificationSettings.reminders}
                          onChange={handleNotificationChange}
                          disabled={updating}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn-save" 
                      onClick={updateNotificationSettings}
                      disabled={updating}
                    >
                      {updating ? 'Saving...' : t.updateSettings}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="security-container">
                <div className="security-card">
                  <h3>{t.changePassword}</h3>
                  <div className="form-group">
                    <label>{t.currentPassword}</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder={t.currentPassword}
                      disabled={updating}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.newPassword}</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder={t.newPassword}
                      disabled={updating}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.confirmPassword}</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder={t.confirmPassword}
                      disabled={updating}
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn-save" 
                      onClick={changePassword}
                      disabled={updating}
                    >
                      {updating ? 'Saving...' : t.updatePassword}
                    </button>
                  </div>
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

        .staff-profile {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          height: 100vh;
          width: 100%;
          overflow: hidden;
          position: relative;
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
          flex-wrap: wrap;
          gap: 16px;
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

        .error-icon, .success-icon {
          font-size: 1.1rem;
        }

        .profile-header {
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-icon {
          font-size: 3rem;
        }

        .profile-header-info h2 {
          font-size: 1.3rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .profile-header-info p {
          color: #64748b;
          margin-bottom: 4px;
        }

        .employee-id {
          font-size: 0.85rem;
          color: #0288d1;
        }

        .profile-form, .settings-card, .security-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .form-section {
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-left: 12px;
          border-left: 3px solid #0288d1;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
          font-size: 0.85rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0288d1;
        }

        .form-group input:disabled,
        .form-group select:disabled,
        .form-group textarea:disabled {
          background: #f8fafc;
          cursor: not-allowed;
        }

        .disabled-input {
          background: #f8fafc;
        }

        .full-width {
          grid-column: span 2;
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

        .settings-card {
          padding: 24px;
        }

        .settings-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-left: 12px;
          border-left: 3px solid #0288d1;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          transition: transform 0.2s;
        }

        .setting-item:hover {
          transform: translateX(4px);
        }

        .setting-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .setting-icon {
          font-size: 1.2rem;
        }

        .setting-label {
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

        .security-card {
          padding: 24px;
        }

        .security-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-left: 12px;
          border-left: 3px solid #0288d1;
        }

        .security-card .form-group {
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .staff-profile {
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
          
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .full-width {
            grid-column: span 1;
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
          
          .setting-item {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          
          .form-actions {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
            padding: 12px;
          }
          
          .profile-avatar {
            width: 80px;
            height: 80px;
          }
          
          .avatar-icon {
            font-size: 2.2rem;
          }
          
          .profile-header {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffProfile;