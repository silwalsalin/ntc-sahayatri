// src/pages/StaffAccountSettings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffAccountSettings = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    joinDate: '',
    employeeId: ''
  });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: '',
    qualification: '',
    experience: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    language: 'np',
    theme: 'light',
    notifications: true
  });

  // Load staff data from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('staffUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setStaffData({
          id: user.id,
          name: user.name || 'Staff Member',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'Staff',
          department: user.department || 'Customer Support',
          joinDate: user.joinDate || user.join_date || '2023-01-15',
          employeeId: user.employeeId || user.employee_id || `EMP-${String(user.id || '001').padStart(3, '0')}`
        });
        setProfileData({
          name: user.name || 'Staff Member',
          email: user.email || '',
          phone: user.phone || '',
          department: user.department || 'Customer Support',
          address: user.address || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || 'male',
          bloodGroup: user.bloodGroup || '',
          qualification: user.qualification || '',
          experience: user.experience || ''
        });
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
    
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('staffPreferences');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }
  }, []);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    }
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateProfile = () => {
    setError('');
    setSuccess('');
    
    if (!profileData.name) {
      setError(language === 'np' ? 'कृपया नाम भर्नुहोस्' : 'Please enter your name');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Update local storage
    const userStr = localStorage.getItem('staffUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const updatedUser = {
          ...user,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          department: profileData.department,
          address: profileData.address,
          dateOfBirth: profileData.dateOfBirth,
          gender: profileData.gender,
          bloodGroup: profileData.bloodGroup,
          qualification: profileData.qualification,
          experience: profileData.experience
        };
        localStorage.setItem('staffUser', JSON.stringify(updatedUser));
        setStaffData(prev => ({
          ...prev,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          department: profileData.department
        }));
        setSuccess(language === 'np' ? '✅ प्रोफाइल सफलतापूर्वक अपडेट गरियो' : '✅ Profile updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (e) {
        setError(language === 'np' ? '❌ प्रोफाइल अपडेट गर्न असफल' : '❌ Failed to update profile');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleChangePassword = () => {
    setError('');
    setSuccess('');
    
    if (!passwordData.currentPassword) {
      setError(language === 'np' ? 'कृपया हालको पासवर्ड भर्नुहोस्' : 'Please enter current password');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setError(language === 'np' ? 'नयाँ पासवर्ड कम्तिमा ६ क्यारेक्टरको हुनुपर्छ' : 'New password must be at least 6 characters');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(language === 'np' ? 'पासवर्ड मिलेन' : 'Passwords do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setSuccess(language === 'np' ? '✅ पासवर्ड सफलतापूर्वक परिवर्तन गरियो' : '✅ Password changed successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('staffPreferences', JSON.stringify(preferences));
    localStorage.setItem('preferredLanguage', preferences.language);
    setLanguage(preferences.language);
    setSuccess(language === 'np' ? '✅ प्राथमिकताहरू सुरक्षित गरियो' : '✅ Preferences saved');
    setTimeout(() => setSuccess(''), 3000);
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
      profile: 'प्रोफाइल',
      password: 'पासवर्ड',
      preferences: 'प्राथमिकताहरू',
      profileInfo: 'प्रोफाइल जानकारी',
      personalInfo: 'व्यक्तिगत जानकारी',
      name: 'पूरा नाम',
      email: 'इमेल',
      phone: 'फोन नम्बर',
      department: 'विभाग',
      address: 'ठेगाना',
      dateOfBirth: 'जन्म मिति',
      gender: 'लिङ्ग',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
      bloodGroup: 'रक्त समूह',
      qualification: 'शैक्षिक योग्यता',
      experience: 'अनुभव',
      changePassword: 'पासवर्ड परिवर्तन',
      currentPassword: 'हालको पासवर्ड',
      newPassword: 'नयाँ पासवर्ड',
      confirmPassword: 'पासवर्ड पुष्टि गर्नुहोस्',
      save: 'सुरक्षित गर्नुहोस्',
      update: 'अपडेट गर्नुहोस्',
      language: 'भाषा',
      nepali: 'नेपाली',
      english: 'अंग्रेजी',
      theme: 'थीम',
      light: 'उज्यालो',
      dark: 'अध्यारो',
      notifications: 'सूचनाहरू',
      enableNotifications: 'सूचनाहरू सक्रिय गर्नुहोस्'
    },
    en: {
      pageTitle: 'Account Settings',
      profile: 'Profile',
      password: 'Password',
      preferences: 'Preferences',
      profileInfo: 'Profile Information',
      personalInfo: 'Personal Information',
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      department: 'Department',
      address: 'Address',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      bloodGroup: 'Blood Group',
      qualification: 'Qualification',
      experience: 'Experience',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      save: 'Save',
      update: 'Update',
      language: 'Language',
      nepali: 'Nepali',
      english: 'English',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      notifications: 'Notifications',
      enableNotifications: 'Enable Notifications'
    }
  };

  const t = content[language];

  return (
    <div className="staff-account-settings">
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
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">⚙️ {t.pageTitle}</h1>
            </div>

            {/* Staff Info Card */}
            <div className="staff-info-card">
              <div className="staff-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div className="staff-details">
                <h2>{staffData.name}</h2>
                <p>{staffData.role} | {staffData.department}</p>
                <div className="staff-meta">
                  <span>🆔 {staffData.employeeId}</span>
                  <span>📧 {staffData.email}</span>
                  <span>📞 {staffData.phone}</span>
                </div>
              </div>
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
                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                🔒 {t.password}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                ⚙️ {t.preferences}
              </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                <span>{error}</span>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="settings-container">
                <div className="settings-card">
                  <h3>{t.profileInfo}</h3>
                  
                  <div className="form-section">
                    <h4>{t.personalInfo}</h4>
                    
                    <div className="form-group">
                      <label>{t.name} <span className="required">*</span></label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder={t.name}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group half">
                        <label>{t.email}</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          placeholder={t.email}
                          disabled
                        />
                      </div>
                      <div className="form-group half">
                        <label>{t.phone}</label>
                        <input
                          type="text"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          placeholder={t.phone}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t.department}</label>
                      <input
                        type="text"
                        name="department"
                        value={profileData.department}
                        onChange={handleProfileChange}
                        placeholder={t.department}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t.address}</label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        placeholder={t.address}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group half">
                        <label>{t.dateOfBirth}</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={profileData.dateOfBirth}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="form-group half">
                        <label>{t.gender}</label>
                        <select name="gender" value={profileData.gender} onChange={handleProfileChange}>
                          <option value="male">{t.male}</option>
                          <option value="female">{t.female}</option>
                          <option value="other">{t.other}</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group half">
                        <label>{t.bloodGroup}</label>
                        <input
                          type="text"
                          name="bloodGroup"
                          value={profileData.bloodGroup}
                          onChange={handleProfileChange}
                          placeholder="A+, B+, O+, etc."
                        />
                      </div>
                      <div className="form-group half">
                        <label>{t.qualification}</label>
                        <input
                          type="text"
                          name="qualification"
                          value={profileData.qualification}
                          onChange={handleProfileChange}
                          placeholder={t.qualification}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t.experience}</label>
                      <input
                        type="text"
                        name="experience"
                        value={profileData.experience}
                        onChange={handleProfileChange}
                        placeholder="e.g., 5 years"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={handleUpdateProfile}>
                      💾 {t.update}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="settings-container">
                <div className="settings-card">
                  <h3>{t.changePassword}</h3>
                  
                  <div className="form-section">
                    <div className="form-group">
                      <label>{t.currentPassword} <span className="required">*</span></label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder={t.currentPassword}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t.newPassword} <span className="required">*</span></label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder={t.newPassword}
                      />
                      <small>{language === 'np' ? 'कम्तिमा ६ क्यारेक्टर' : 'Minimum 6 characters'}</small>
                    </div>

                    <div className="form-group">
                      <label>{t.confirmPassword} <span className="required">*</span></label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder={t.confirmPassword}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={handleChangePassword}>
                      🔒 {t.update}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="settings-container">
                <div className="settings-card">
                  <h3>⚙️ {t.preferences}</h3>
                  
                  <div className="form-section">
                    <div className="form-group">
                      <label>{t.language}</label>
                      <select 
                        name="language"
                        value={preferences.language} 
                        onChange={handlePreferenceChange}
                      >
                        <option value="np">{t.nepali}</option>
                        <option value="en">{t.english}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{t.theme}</label>
                      <select 
                        name="theme"
                        value={preferences.theme} 
                        onChange={handlePreferenceChange}
                      >
                        <option value="light">{t.light}</option>
                        <option value="dark">{t.dark}</option>
                      </select>
                    </div>

                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="notifications"
                          checked={preferences.notifications}
                          onChange={handlePreferenceChange}
                        />
                        <span>{t.enableNotifications}</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={handleSavePreferences}>
                      💾 {t.save}
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

        .staff-account-settings {
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

        /* Staff Info Card */
        .staff-info-card {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .staff-avatar {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-icon {
          font-size: 2rem;
          color: white;
        }

        .staff-details {
          flex: 1;
        }

        .staff-details h2 {
          font-size: 1.2rem;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .staff-details p {
          color: #64748b;
          font-size: 0.85rem;
          margin-bottom: 6px;
        }

        .staff-meta {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: #64748b;
          flex-wrap: wrap;
        }

        /* Tab Navigation */
        .tab-navigation {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          background: white;
          padding: 6px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 10px 24px;
          background: transparent;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          color: #64748b;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          background: #f1f5f9;
          color: #0288d1;
        }

        .tab-btn.active {
          background: #0288d1;
          color: white;
        }

        /* Messages */
        .success-message, .error-message {
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .success-message {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
        }

        .error-message {
          background: #ffebee;
          border-left: 4px solid #f44336;
        }

        .success-icon, .error-icon {
          font-size: 1.1rem;
        }

        /* Settings */
        .settings-container {
          margin-bottom: 24px;
        }

        .settings-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .settings-card h3 {
          padding: 16px 24px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          margin: 0;
        }

        .form-section {
          padding: 20px 24px;
        }

        .form-section h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
          padding-left: 8px;
          border-left: 3px solid #0288d1;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #475569;
          margin-bottom: 4px;
          font-size: 0.85rem;
        }

        .required {
          color: #ef4444;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          background: white;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #0288d1;
          box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.1);
        }

        .form-group input:disabled {
          background: #f1f5f9;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .form-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .form-group.half {
          flex: 1;
          min-width: 200px;
        }

        .checkbox-group {
          margin-top: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 500;
          color: #475569;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #0288d1;
        }

        .form-actions {
          padding: 16px 24px;
          display: flex;
          justify-content: flex-end;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          gap: 12px;
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
          font-size: 0.9rem;
        }

        .btn-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(2, 136, 209, 0.3);
        }

        @media (max-width: 768px) {
          .staff-account-settings {
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
          
          .staff-info-card {
            flex-direction: column;
            text-align: center;
          }
          
          .staff-meta {
            flex-direction: column;
            align-items: center;
          }
          
          .form-row {
            flex-direction: column;
          }
          
          .form-group.half {
            min-width: unset;
          }
          
          .tab-navigation {
            flex-direction: column;
          }
          
          .tab-btn {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
            padding: 12px;
          }
          
          .form-section {
            padding: 16px;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn-save {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffAccountSettings;