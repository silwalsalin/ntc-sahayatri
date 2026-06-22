// src/pages/AdminProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [saving, setSaving] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Format number with Nepali digits
  const formatNumber = (num) => {
    if (language === 'np') {
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return num.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
    }
    return num.toString();
  };

  // Convert English date to Nepali (BS) date
  const convertToNepaliDate = (adDate) => {
    if (!adDate) return '';
    try {
      const date = new Date(adDate);
      if (isNaN(date.getTime())) return '';
      
      // Nepali date conversion (approximate - subtract 57 years and 3 months)
      const year = date.getFullYear() - 57;
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      const yearNp = year.toString().replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      const monthNp = month.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      const dayNp = day.replace(/\d/g, digit => nepaliDigits[parseInt(digit)]);
      
      return `${yearNp}-${monthNp}-${dayNp}`;
    } catch {
      return '';
    }
  };

  // Convert Nepali date to English date (for input value)
  const convertToEnglishDate = (nepaliDate) => {
    if (!nepaliDate) return '';
    // Simple conversion - this is a placeholder. In production, use a proper date conversion library
    try {
      const parts = nepaliDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]) + 57;
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      return '';
    } catch {
      return '';
    }
  };

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
    joinDateNp: '',
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
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const user = localStorage.getItem('adminUser') || localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!token || !isLoggedIn) {
      navigate('/admin-login');
      return;
    }
    
    try {
      const userData = user ? JSON.parse(user) : {};
      const joinDate = userData.joinDate || '2020-01-01';
      const joinDateNp = language === 'np' ? convertToNepaliDate(joinDate) : '';
      
      setProfileData(prev => ({
        ...prev,
        fullName: userData.fullName || userData.name || 'Admin User',
        email: userData.email || 'admin@ntc.gov.np',
        phoneNumber: userData.phoneNumber || '9841234567',
        username: userData.username || 'admin',
        department: userData.department || (language === 'np' ? 'प्रशासन विभाग' : 'Administration Department'),
        position: userData.position || (language === 'np' ? 'प्रमुख प्रशासक' : 'Chief Administrator'),
        officeLocation: userData.officeLocation || (language === 'np' ? 'काठमाडौं' : 'Kathmandu'),
        joinDate: joinDate,
        joinDateNp: joinDateNp,
        bio: userData.bio || '',
        currentProfileImage: userData.profileImage || null
      }));
      setAdminName(userData.fullName || userData.name || 'Admin');
    } catch (e) {
      console.error('Error parsing user data:', e);
      setAdminName('Admin');
    }
  }, [navigate, language]);

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
      admin: 'प्रशासक',
      backToDashboard: 'ड्यासबोर्डमा फर्कनुहोस्',
      usernameCannotChange: 'प्रयोगकर्ता नाम परिवर्तन गर्न सकिँदैन',
      tellAboutYourself: 'आफ्नो बारेमा बताउनुहोस्...',
      uploadPhoto: 'तस्वीर अपलोड गर्नुहोस्',
      selectDate: 'मिति चयन गर्नुहोस्',
      showingNepaliDate: 'नेपाली मिति'
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
      admin: 'Admin',
      backToDashboard: 'Back to Dashboard',
      usernameCannotChange: 'Username cannot be changed',
      tellAboutYourself: 'Tell us about yourself...',
      uploadPhoto: 'Upload Photo',
      selectDate: 'Select Date',
      showingNepaliDate: 'Nepali Date'
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
      
      // If join date is changed, update Nepali date
      if (name === 'joinDate' && language === 'np') {
        const joinDateNp = convertToNepaliDate(value);
        setProfileData(prev => ({
          ...prev,
          joinDate: value,
          joinDateNp: joinDateNp
        }));
      }
      
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(t.success);
      setAdminName(profileData.fullName);
      
      const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
      user.fullName = profileData.fullName;
      user.email = profileData.email;
      user.phoneNumber = profileData.phoneNumber;
      user.joinDate = profileData.joinDate;
      localStorage.setItem('adminUser', JSON.stringify(user));
      
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

  // Display join date based on language
  const getDisplayDate = () => {
    if (language === 'np' && profileData.joinDateNp) {
      return `(${t.showingNepaliDate}: ${profileData.joinDateNp})`;
    }
    return '';
  };

  return (
    <div className="admin-profile">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        adminName={adminName} 
        userRole="admin" 
      />
      
      <div className="dashboard-layout">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="content-wrapper">
            <div className="page-header">
              <div>
                <h1>{t.title}</h1>
                <p>{t.profileInfo}</p>
              </div>
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
                          alt={t.profileImage} 
                          className="profile-image"
                        />
                      ) : profileData.currentProfileImage ? (
                        <img 
                          src={profileData.currentProfileImage} 
                          alt={t.profileImage} 
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
                      <small className="field-hint">{t.usernameCannotChange}</small>
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
                      <div className="date-input-wrapper">
                        <input
                          type="date"
                          name="joinDate"
                          value={profileData.joinDate}
                          onChange={handleProfileChange}
                        />
                        {language === 'np' && profileData.joinDateNp && (
                          <span className="nepali-date-hint">{getDisplayDate()}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>{t.bio}</label>
                      <textarea
                        name="bio"
                        rows="4"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        placeholder={t.tellAboutYourself}
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

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-profile {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
          overflow: hidden;
        }

        /* ===== LAYOUT - Same as AdminComplaints ===== */
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

        /* Date Input Wrapper */
        .date-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .date-input-wrapper input {
          width: 100%;
        }

        .nepali-date-hint {
          font-size: 0.7rem;
          color: #3b82f6;
          font-weight: 500;
          padding: 4px 8px;
          background: #eff6ff;
          border-radius: 4px;
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
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1200px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-group.full-width {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .admin-profile {
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
          
          .content-wrapper {
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
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn-submit {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
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
          
          .form-group {
            gap: 4px;
          }
          
          .date-input-wrapper {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminProfile;