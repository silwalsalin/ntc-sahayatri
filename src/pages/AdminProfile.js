// src/pages/AdminProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    username: '',
    role: 'admin',
    department: '',
    position: '',
    officeLocation: '',
    joinDate: '',
    bio: '',
    profileImage: null,
    currentProfileImage: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [errors, setErrors] = useState({});

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    
    if (!token || !isLoggedIn || userRole !== 'admin') {
      navigate('/login');
    } else {
      try {
        const userData = user ? JSON.parse(user) : {};
        setProfileData(prev => ({
          ...prev,
          fullName: userData.fullName || userData.name || 'Admin User',
          email: userData.email || 'admin@ntc.gov.np',
          phoneNumber: userData.phoneNumber || '9841234567',
          username: userData.username || 'admin',
          department: userData.department || 'प्रशासन विभाग',
          position: userData.position || 'प्रमुख प्रशासक',
          officeLocation: userData.officeLocation || 'काठमाडौं',
          joinDate: userData.joinDate || '2020-01-01',
          bio: userData.bio || '',
          currentProfileImage: userData.profileImage || null
        }));
        setAdminName(userData.fullName || userData.name || 'Admin');
      } catch (e) {
        console.error('Error parsing user data:', e);
        setAdminName('Admin');
      }
      setTimeout(() => setLoading(false), 500);
    }
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const content = {
    np: {
      title: 'प्रशासक प्रोफाइल',
      profileInfo: 'प्रोफाइल जानकारी',
      personalInfo: 'व्यक्तिगत जानकारी',
      changePassword: 'पासवर्ड परिवर्तन गर्नुहोस्',
      fullName: 'पुरा नाम',
      email: 'इमेल ठेगाना',
      phoneNumber: 'फोन नम्बर',
      username: 'प्रयोगकर्ता नाम',
      role: 'भूमिका',
      department: 'विभाग',
      position: 'पद',
      officeLocation: 'कार्यालय स्थान',
      joinDate: 'सामेल मिति',
      bio: 'जीवनी',
      profileImage: 'प्रोफाइल तस्वीर',
      changePhoto: 'तस्वीर परिवर्तन गर्नुहोस्',
      removePhoto: 'तस्वीर हटाउनुहोस्',
      currentPassword: 'हालको पासवर्ड',
      newPassword: 'नयाँ पासवर्ड',
      confirmPassword: 'पासवर्ड पुष्टि गर्नुहोस्',
      saveChanges: 'परिवर्तन सुरक्षित गर्नुहोस्',
      saving: 'सुरक्षित गर्दै...',
      required: 'आवश्यक',
      passwordMismatch: 'पासवर्ड मिलेन',
      passwordMinLength: 'पासवर्ड कम्तीमा ६ वर्णको हुनुपर्छ',
      invalidEmail: 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्',
      invalidPhone: 'कृपया मान्य फोन नम्बर प्रविष्ट गर्नुहोस्',
      success: 'प्रोफाइल सफलतापूर्वक अद्यावधिक गरियो',
      passwordSuccess: 'पासवर्ड सफलतापूर्वक परिवर्तन गरियो',
      error: 'अद्यावधिक गर्दा त्रुटि भयो',
      loading: 'लोड हुँदैछ...',
      admin: 'प्रशासक',
      backToDashboard: 'ड्यासबोर्डमा फर्कनुहोस्'
    },
    en: {
      title: 'Admin Profile',
      profileInfo: 'Profile Information',
      personalInfo: 'Personal Information',
      changePassword: 'Change Password',
      fullName: 'Full Name',
      email: 'Email Address',
      phoneNumber: 'Phone Number',
      username: 'Username',
      role: 'Role',
      department: 'Department',
      position: 'Position',
      officeLocation: 'Office Location',
      joinDate: 'Join Date',
      bio: 'Bio',
      profileImage: 'Profile Image',
      changePhoto: 'Change Photo',
      removePhoto: 'Remove Photo',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      required: 'Required',
      passwordMismatch: 'Passwords do not match',
      passwordMinLength: 'Password must be at least 6 characters',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      success: 'Profile updated successfully',
      passwordSuccess: 'Password changed successfully',
      error: 'Error updating profile',
      loading: 'Loading...',
      admin: 'Admin',
      backToDashboard: 'Back to Dashboard'
    }
  };

  const t = content[language];

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.fullName.trim()) {
      newErrors.fullName = t.required;
    }

    if (!profileData.email.trim()) {
      newErrors.email = t.required;
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = t.invalidEmail;
    }

    if (!profileData.phoneNumber.trim()) {
      newErrors.phoneNumber = t.required;
    } else if (!/^[0-9]{10}$/.test(profileData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = t.invalidPhone;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t.required;
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = t.required;
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = t.passwordMinLength;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t.passwordMismatch;
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setProfileData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(t.success);
      setAdminName(profileData.fullName);
      
      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.fullName = profileData.fullName;
      user.email = profileData.email;
      user.phoneNumber = profileData.phoneNumber;
      localStorage.setItem('user', JSON.stringify(user));
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(t.error);
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(t.passwordSuccess);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage(t.error);
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } finally {
      setSaving(false);
    }
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
    <div className="admin-profile">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        adminName={adminName} 
        userRole="admin" 
      />
      
      <div className="dashboard-layout">
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar language={language} userRole="admin" />
        </div>
        
        <div className={`main-wrapper ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          <div className="main-content">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1>{t.title}</h1>
                <p>{t.profileInfo}</p>
              </div>
              <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
                {sidebarOpen ? '← Hide Menu' : '→ Show Menu'}
              </button>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="alert alert-success">
                <span>✅</span> {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="alert alert-error">
                <span>❌</span> {errorMessage}
              </div>
            )}

            {/* Profile Tabs */}
            <div className="profile-tabs">
              <button 
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span>👤</span> {t.personalInfo}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <span>🔒</span> {t.changePassword}
              </button>
            </div>

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-card">
                  {/* Profile Image Section */}
                  <div className="profile-image-section">
                    <div className="profile-image-container">
                      {profileData.profileImage ? (
                        <img 
                          src={URL.createObjectURL(profileData.profileImage)} 
                          alt="Profile" 
                          className="profile-image"
                        />
                      ) : profileData.currentProfileImage ? (
                        <img 
                          src={profileData.currentProfileImage} 
                          alt="Profile" 
                          className="profile-image"
                        />
                      ) : (
                        <div className="profile-image-placeholder">
                          <span className="placeholder-icon">👨‍💼</span>
                        </div>
                      )}
                    </div>
                    <div className="profile-image-actions">
                      <label className="upload-btn">
                        <input
                          type="file"
                          name="profileImage"
                          onChange={handleProfileChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        <span>📸</span> {t.changePhoto}
                      </label>
                      <button 
                        type="button" 
                        className="remove-btn"
                        onClick={() => setProfileData(prev => ({ ...prev, profileImage: null }))}
                      >
                        <span>🗑️</span> {t.removePhoto}
                      </button>
                    </div>
                  </div>

                  {/* Personal Information Fields */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t.fullName} <span className="required">*</span></label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleProfileChange}
                        className={errors.fullName ? 'error' : ''}
                      />
                      {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                      <label>{t.email} <span className="required">*</span></label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className={errors.email ? 'error' : ''}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label>{t.phoneNumber} <span className="required">*</span></label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleProfileChange}
                        className={errors.phoneNumber ? 'error' : ''}
                      />
                      {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                    </div>

                    <div className="form-group">
                      <label>{t.username}</label>
                      <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        disabled
                        className="disabled-field"
                      />
                      <small className="field-hint">Username cannot be changed</small>
                    </div>

                    <div className="form-group">
                      <label>{t.role}</label>
                      <input
                        type="text"
                        value={t.admin}
                        disabled
                        className="disabled-field"
                      />
                    </div>

                    <div className="form-group">
                      <label>{t.department}</label>
                      <input
                        type="text"
                        name="department"
                        value={profileData.department}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t.position}</label>
                      <input
                        type="text"
                        name="position"
                        value={profileData.position}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t.officeLocation}</label>
                      <input
                        type="text"
                        name="officeLocation"
                        value={profileData.officeLocation}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t.joinDate}</label>
                      <input
                        type="date"
                        name="joinDate"
                        value={profileData.joinDate}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>{t.bio}</label>
                      <textarea
                        name="bio"
                        rows="4"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={saving}>
                      {saving ? t.saving : t.saveChanges}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-card">
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>{t.currentPassword} <span className="required">*</span></label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={passwordErrors.currentPassword ? 'error' : ''}
                      />
                      {passwordErrors.currentPassword && <span className="error-message">{passwordErrors.currentPassword}</span>}
                    </div>

                    <div className="form-group full-width">
                      <label>{t.newPassword} <span className="required">*</span></label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={passwordErrors.newPassword ? 'error' : ''}
                      />
                      {passwordErrors.newPassword && <span className="error-message">{passwordErrors.newPassword}</span>}
                    </div>

                    <div className="form-group full-width">
                      <label>{t.confirmPassword} <span className="required">*</span></label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={passwordErrors.confirmPassword ? 'error' : ''}
                      />
                      {passwordErrors.confirmPassword && <span className="error-message">{passwordErrors.confirmPassword}</span>}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={saving}>
                      {saving ? t.saving : t.changePassword}
                    </button>
                  </div>
                </div>
              </form>
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

        .admin-profile {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: #f8fafc;
          min-height: 100vh;
          overflow: hidden;
        }

        /* Loading State */
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

        /* Layout - Matching AdminDashboard */
        .dashboard-layout {
          display: flex;
          height: calc(100vh - 70px);
          margin-top: 70px;
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .sidebar-wrapper {
          position: fixed;
          top: 70px;
          left: 0;
          width: 260px;
          height: calc(100vh - 70px);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
          background: white;
          border-right: 1px solid #e2e8f0;
          transform: translateX(0);
        }

        .sidebar-wrapper.closed {
          transform: translateX(-260px);
        }

        .main-wrapper {
          flex: 1;
          width: calc(100% - 260px);
          margin-left: 260px;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-wrapper.full-width {
          margin-left: 0;
          width: 100%;
        }

        .main-wrapper::-webkit-scrollbar {
          width: 8px;
        }

        .main-wrapper::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .main-wrapper::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }

        .main-wrapper::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        .main-content {
          padding: 24px 32px;
          min-height: 100%;
        }

        /* Page Header */
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

        .toggle-sidebar-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .toggle-sidebar-btn:hover {
          background: #e2e8f0;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        /* Alerts */
        .alert {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          animation: slideDown 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert-success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .alert-error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        /* Profile Tabs */
        .profile-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 2px solid #e2e8f0;
        }

        .tab-btn {
          background: transparent;
          border: none;
          padding: 12px 24px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          border-radius: 8px 8px 0 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tab-btn:hover {
          color: #3b82f6;
          background: #f8fafc;
        }

        .tab-btn.active {
          color: #3b82f6;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #3b82f6;
        }

        /* Form Cards */
        .form-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        /* Profile Image Section */
        .profile-image-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .profile-image-container {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 16px;
          border: 3px solid #3b82f6;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-icon {
          font-size: 3rem;
        }

        .profile-image-actions {
          display: flex;
          gap: 12px;
        }

        .upload-btn, .remove-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: #f1f5f9;
          color: #475569;
        }

        .upload-btn:hover, .remove-btn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #334155;
        }

        .required {
          color: #dc2626;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #dc2626;
        }

        .disabled-field {
          background: #f8fafc;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .field-hint {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 4px;
        }

        .error-message {
          font-size: 0.7rem;
          color: #dc2626;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-submit {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: #3b82f6;
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive - Matching AdminDashboard */
        @media (max-width: 1200px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-group.full-width {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .dashboard-layout {
            margin-top: 120px;
            height: calc(100vh - 120px);
          }
          .sidebar-wrapper {
            top: 120px;
            height: calc(100vh - 120px);
          }
          .main-wrapper {
            margin-left: 0;
            width: 100%;
          }
          .main-content {
            padding: 16px;
          }
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .page-header h1 {
            font-size: 1.4rem;
          }
          .form-card {
            padding: 20px;
          }
          .profile-tabs {
            gap: 8px;
          }
          .tab-btn {
            padding: 8px 16px;
            font-size: 0.8rem;
          }
          .profile-image-container {
            width: 100px;
            height: 100px;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 12px;
          }
          .form-card {
            padding: 16px;
          }
          .profile-image-actions {
            flex-direction: column;
          }
          .tab-btn span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminProfile;