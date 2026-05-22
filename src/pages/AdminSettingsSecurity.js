// src/pages/AdminSettingsSecurity.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminSettingsSecurity = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    // Session Settings
    sessionTimeout: 30,
    sessionTimeoutUnit: 'minutes',
    extendSessionOnActivity: true,
    maxConcurrentSessions: 1,
    
    // Login Security
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    lockoutDurationUnit: 'minutes',
    loginAttemptWindow: 15,
    loginAttemptWindowUnit: 'minutes',
    
    // Password Policy
    passwordExpiryDays: 90,
    minPasswordLength: 8,
    maxPasswordLength: 32,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventPasswordReuse: 5,
    passwordHistoryDays: 180,
    
    // Two-Factor Authentication
    twoFactorAuth: false,
    twoFactorMethod: 'authenticator',
    backupCodesGenerated: false,
    
    // Account Security
    accountLockoutThreshold: 5,
    accountLockoutDuration: 30,
    forcePasswordChangeOnFirstLogin: true,
    notifyOnNewLogin: true,
    notifyOnPasswordChange: true,
    
    // IP Security
    enableIpWhitelist: false,
    ipWhitelist: '',
    enableIpBlacklist: false,
    ipBlacklist: '',
    
    // Audit Logging
    enableAuditLog: true,
    auditLogRetention: 90,
    logLoginAttempts: true,
    logFailedLogins: true,
    logPasswordChanges: true,
    logSettingsChanges: true,
    
    // Security Headers
    enableHSTS: true,
    enableCSP: true,
    enableXFrame: true,
    enableXSSProtection: true,
    
    // Current User Info
    lastPasswordChange: '2024-01-15',
    lastLogin: '2024-02-25 10:30:00',
    lastLoginIP: '192.168.1.100',
    activeSessions: 1
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      navigate('/admin-login');
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [navigate]);

  const content = {
    np: {
      securitySettings: 'सुरक्षा सेटिङ्स',
      sessionSecurity: 'सेसन सुरक्षा',
      loginSecurity: 'लगइन सुरक्षा',
      passwordPolicy: 'पासवर्ड नीति',
      twoFactorAuth: 'दुई-चरण प्रमाणीकरण',
      accountSecurity: 'खाता सुरक्षा',
      ipSecurity: 'आईपी सुरक्षा',
      auditLogging: 'अडिट लगिङ',
      securityHeaders: 'सुरक्षा हेडरहरू',
      saveSettings: 'सेटिङ्स सुरक्षित गर्नुहोस्',
      saving: 'सुरक्षित गर्दै...',
      changePassword: 'पासवर्ड परिवर्तन गर्नुहोस्',
      setup2FA: 'दुई-चरण प्रमाणीकरण सेटअप गर्नुहोस्',
      sessionTimeout: 'सेसन समय समाप्ति',
      minutes: 'मिनेट',
      hours: 'घण्टा',
      days: 'दिन',
      extendSessionOnActivity: 'गतिविधिमा सेसन विस्तार गर्नुहोस्',
      maxConcurrentSessions: 'अधिकतम समवर्ती सेसन',
      maxLoginAttempts: 'अधिकतम लगइन प्रयास',
      lockoutDuration: 'लकआउट अवधि',
      loginAttemptWindow: 'लगइन प्रयास विन्डो',
      passwordExpiryDays: 'पासवर्ड म्याद (दिन)',
      minPasswordLength: 'न्यूनतम पासवर्ड लम्बाइ',
      maxPasswordLength: 'अधिकतम पासवर्ड लम्बाइ',
      requireUppercase: 'अपरकेस अक्षर आवश्यक',
      requireLowercase: 'लोअरकेस अक्षर आवश्यक',
      requireNumbers: 'नम्बरहरू आवश्यक',
      requireSpecialChars: 'विशेष क्यारेक्टर आवश्यक',
      preventPasswordReuse: 'पासवर्ड पुन: प्रयोग रोक्नुहोस् (पटक)',
      passwordHistoryDays: 'पासवर्ड इतिहास अवधि (दिन)',
      twoFactorMethod: 'दुई-चरण विधि',
      authenticator: 'प्रमाणकर्ता एप',
      sms: 'एसएमएस',
      email: 'इमेल',
      backupCodesGenerated: 'ब्याकअप कोडहरू उत्पन्न गरियो',
      accountLockoutThreshold: 'खाता लकआउट सीमा',
      accountLockoutDuration: 'खाता लकआउट अवधि',
      forcePasswordChangeOnFirstLogin: 'पहिलो लगइनमा पासवर्ड परिवर्तन गर्न बाध्य गर्नुहोस्',
      notifyOnNewLogin: 'नयाँ लगइनमा सूचना दिनुहोस्',
      notifyOnPasswordChange: 'पासवर्ड परिवर्तनमा सूचना दिनुहोस्',
      enableIpWhitelist: 'आईपी श्वेतसूची सक्षम गर्नुहोस्',
      ipWhitelist: 'आईपी श्वेतसूची',
      enableIpBlacklist: 'आईपी कालोसूची सक्षम गर्नुहोस्',
      ipBlacklist: 'आईपी कालोसूची',
      enableAuditLog: 'अडिट लग सक्षम गर्नुहोस्',
      auditLogRetention: 'अडिट लग अवधारण (दिन)',
      logLoginAttempts: 'लगइन प्रयासहरू लग गर्नुहोस्',
      logFailedLogins: 'असफल लगइनहरू लग गर्नुहोस्',
      logPasswordChanges: 'पासवर्ड परिवर्तनहरू लग गर्नुहोस्',
      logSettingsChanges: 'सेटिङ्स परिवर्तनहरू लग गर्नुहोस्',
      enableHSTS: 'HSTS सक्षम गर्नुहोस्',
      enableCSP: 'CSP सक्षम गर्नुहोस्',
      enableXFrame: 'X-Frame-Options सक्षम गर्नुहोस्',
      enableXSSProtection: 'XSS सुरक्षा सक्षम गर्नुहोस्',
      currentPassword: 'हालको पासवर्ड',
      newPassword: 'नयाँ पासवर्ड',
      confirmPassword: 'पासवर्ड पुष्टि गर्नुहोस्',
      updatePassword: 'पासवर्ड अपडेट गर्नुहोस्',
      cancel: 'रद्द गर्नुहोस्',
      saveSuccess: 'सेटिङ्स सफलतापूर्वक सुरक्षित गरियो',
      passwordChanged: 'पासवर्ड सफलतापूर्वक परिवर्तन गरियो',
      passwordMismatch: 'पासवर्ड मेल खाएन',
      passwordTooShort: 'पासवर्ड धेरै छोटो छ',
      passwordWeak: 'पासवर्ड कमजोर छ',
      loading: 'लोड हुँदैछ...',
      lastPasswordChange: 'अन्तिम पासवर्ड परिवर्तन',
      lastLogin: 'अन्तिम लगइन',
      lastLoginIP: 'अन्तिम लगइन आईपी',
      activeSessions: 'सक्रिय सेसनहरू',
      viewActivity: 'गतिविधि हेर्नुहोस्',
      generateBackupCodes: 'ब्याकअप कोडहरू उत्पन्न गर्नुहोस्',
      scanQRCode: 'QR कोड स्क्यान गर्नुहोस्',
      enterCode: 'कोड प्रविष्ट गर्नुहोस्',
      verify: 'प्रमाणित गर्नुहोस्'
    },
    en: {
      securitySettings: 'Security Settings',
      sessionSecurity: 'Session Security',
      loginSecurity: 'Login Security',
      passwordPolicy: 'Password Policy',
      twoFactorAuth: 'Two-Factor Authentication',
      accountSecurity: 'Account Security',
      ipSecurity: 'IP Security',
      auditLogging: 'Audit Logging',
      securityHeaders: 'Security Headers',
      saveSettings: 'Save Settings',
      saving: 'Saving...',
      changePassword: 'Change Password',
      setup2FA: 'Setup Two-Factor Authentication',
      sessionTimeout: 'Session Timeout',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      extendSessionOnActivity: 'Extend session on activity',
      maxConcurrentSessions: 'Max Concurrent Sessions',
      maxLoginAttempts: 'Max Login Attempts',
      lockoutDuration: 'Lockout Duration',
      loginAttemptWindow: 'Login Attempt Window',
      passwordExpiryDays: 'Password Expiry (days)',
      minPasswordLength: 'Min Password Length',
      maxPasswordLength: 'Max Password Length',
      requireUppercase: 'Require Uppercase Letters',
      requireLowercase: 'Require Lowercase Letters',
      requireNumbers: 'Require Numbers',
      requireSpecialChars: 'Require Special Characters',
      preventPasswordReuse: 'Prevent Password Reuse (times)',
      passwordHistoryDays: 'Password History (days)',
      twoFactorMethod: 'Two-Factor Method',
      authenticator: 'Authenticator App',
      sms: 'SMS',
      email: 'Email',
      backupCodesGenerated: 'Backup Codes Generated',
      accountLockoutThreshold: 'Account Lockout Threshold',
      accountLockoutDuration: 'Account Lockout Duration',
      forcePasswordChangeOnFirstLogin: 'Force password change on first login',
      notifyOnNewLogin: 'Notify on new login',
      notifyOnPasswordChange: 'Notify on password change',
      enableIpWhitelist: 'Enable IP Whitelist',
      ipWhitelist: 'IP Whitelist',
      enableIpBlacklist: 'Enable IP Blacklist',
      ipBlacklist: 'IP Blacklist',
      enableAuditLog: 'Enable Audit Log',
      auditLogRetention: 'Audit Log Retention (days)',
      logLoginAttempts: 'Log login attempts',
      logFailedLogins: 'Log failed logins',
      logPasswordChanges: 'Log password changes',
      logSettingsChanges: 'Log settings changes',
      enableHSTS: 'Enable HSTS',
      enableCSP: 'Enable CSP',
      enableXFrame: 'Enable X-Frame-Options',
      enableXSSProtection: 'Enable XSS Protection',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      updatePassword: 'Update Password',
      cancel: 'Cancel',
      saveSuccess: 'Settings saved successfully',
      passwordChanged: 'Password changed successfully',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password is too short',
      passwordWeak: 'Password is weak',
      loading: 'Loading...',
      lastPasswordChange: 'Last Password Change',
      lastLogin: 'Last Login',
      lastLoginIP: 'Last Login IP',
      activeSessions: 'Active Sessions',
      viewActivity: 'View Activity',
      generateBackupCodes: 'Generate Backup Codes',
      scanQRCode: 'Scan QR Code',
      enterCode: 'Enter Code',
      verify: 'Verify'
    }
  };

  const t = content[language];

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = t.fillRequiredFields;
    }
    if (!passwordData.newPassword) {
      errors.newPassword = t.fillRequiredFields;
    } else if (passwordData.newPassword.length < securitySettings.minPasswordLength) {
      errors.newPassword = t.passwordTooShort;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = t.passwordMismatch;
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    alert(t.saveSuccess);
  };

  const handleUpdatePassword = () => {
    if (validatePassword()) {
      alert(t.passwordChanged);
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleSetup2FA = () => {
    setShow2FAModal(true);
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
    <div className="admin-security-settings">
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="settings-container">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="page-header">
            <div>
              <h1>🔒 {t.securitySettings}</h1>
              <p>{t.securitySettings}</p>
            </div>
            <div className="header-actions">
              <button className="password-btn" onClick={() => setShowPasswordModal(true)}>
                🔐 {t.changePassword}
              </button>
              {!securitySettings.twoFactorAuth && (
                <button className="twofa-btn" onClick={handleSetup2FA}>
                  📱 {t.setup2FA}
                </button>
              )}
              <button 
                className={`save-btn ${saving ? 'saving' : ''}`} 
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? <>⏳ {t.saving}</> : <>💾 {t.saveSettings}</>}
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="success-message">
              ✓ {t.saveSuccess}
            </div>
          )}

          {/* Account Info Cards */}
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">🕒</div>
              <div className="info-content">
                <div className="info-label">{t.lastPasswordChange}</div>
                <div className="info-value">{securitySettings.lastPasswordChange}</div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">📱</div>
              <div className="info-content">
                <div className="info-label">{t.lastLogin}</div>
                <div className="info-value">{securitySettings.lastLogin}</div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">🌐</div>
              <div className="info-content">
                <div className="info-label">{t.lastLoginIP}</div>
                <div className="info-value">{securitySettings.lastLoginIP}</div>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">💻</div>
              <div className="info-content">
                <div className="info-label">{t.activeSessions}</div>
                <div className="info-value">{securitySettings.activeSessions}</div>
              </div>
            </div>
          </div>

          {/* Session Security */}
          <div className="settings-card">
            <h3>{t.sessionSecurity}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>{t.sessionTimeout}</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={securitySettings.sessionTimeout}
                    onChange={handleSecurityChange}
                    min="1"
                    max="480"
                  />
                  <select name="sessionTimeoutUnit" value={securitySettings.sessionTimeoutUnit} onChange={handleSecurityChange}>
                    <option value="minutes">{t.minutes}</option>
                    <option value="hours">{t.hours}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t.maxConcurrentSessions}</label>
                <input
                  type="number"
                  name="maxConcurrentSessions"
                  value={securitySettings.maxConcurrentSessions}
                  onChange={handleSecurityChange}
                  min="1"
                  max="10"
                />
              </div>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="extendSessionOnActivity"
                  checked={securitySettings.extendSessionOnActivity}
                  onChange={handleSecurityChange}
                />
                <span>{t.extendSessionOnActivity}</span>
              </label>
            </div>
          </div>

          {/* Login Security */}
          <div className="settings-card">
            <h3>{t.loginSecurity}</h3>
            <div className="form-grid">
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
                <div className="input-group">
                  <input
                    type="number"
                    name="lockoutDuration"
                    value={securitySettings.lockoutDuration}
                    onChange={handleSecurityChange}
                    min="5"
                    max="60"
                  />
                  <select name="lockoutDurationUnit" value={securitySettings.lockoutDurationUnit} onChange={handleSecurityChange}>
                    <option value="minutes">{t.minutes}</option>
                    <option value="hours">{t.hours}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t.loginAttemptWindow}</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="loginAttemptWindow"
                    value={securitySettings.loginAttemptWindow}
                    onChange={handleSecurityChange}
                    min="5"
                    max="60"
                  />
                  <select name="loginAttemptWindowUnit" value={securitySettings.loginAttemptWindowUnit} onChange={handleSecurityChange}>
                    <option value="minutes">{t.minutes}</option>
                    <option value="hours">{t.hours}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Password Policy */}
          <div className="settings-card">
            <h3>{t.passwordPolicy}</h3>
            <div className="form-grid">
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
              <div className="form-group">
                <label>{t.maxPasswordLength}</label>
                <input
                  type="number"
                  name="maxPasswordLength"
                  value={securitySettings.maxPasswordLength}
                  onChange={handleSecurityChange}
                  min="8"
                  max="64"
                />
              </div>
              <div className="form-group">
                <label>{t.preventPasswordReuse}</label>
                <input
                  type="number"
                  name="preventPasswordReuse"
                  value={securitySettings.preventPasswordReuse}
                  onChange={handleSecurityChange}
                  min="1"
                  max="10"
                />
              </div>
              <div className="form-group">
                <label>{t.passwordHistoryDays}</label>
                <input
                  type="number"
                  name="passwordHistoryDays"
                  value={securitySettings.passwordHistoryDays}
                  onChange={handleSecurityChange}
                  min="30"
                  max="365"
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
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="settings-card">
            <h3>{t.twoFactorAuth}</h3>
            <div className="checkbox-group">
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
            {securitySettings.twoFactorAuth && (
              <>
                <div className="form-group">
                  <label>{t.twoFactorMethod}</label>
                  <select name="twoFactorMethod" value={securitySettings.twoFactorMethod} onChange={handleSecurityChange}>
                    <option value="authenticator">{t.authenticator}</option>
                    <option value="sms">{t.sms}</option>
                    <option value="email">{t.email}</option>
                  </select>
                </div>
                <div className="backup-codes-info">
                  <span>{t.backupCodesGenerated}: {securitySettings.backupCodesGenerated ? '✓' : '✗'}</span>
                  <button className="generate-codes-btn" onClick={() => alert(t.generateBackupCodes)}>
                    🔑 {t.generateBackupCodes}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Account Security */}
          <div className="settings-card">
            <h3>{t.accountSecurity}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>{t.accountLockoutThreshold}</label>
                <input
                  type="number"
                  name="accountLockoutThreshold"
                  value={securitySettings.accountLockoutThreshold}
                  onChange={handleSecurityChange}
                  min="3"
                  max="10"
                />
              </div>
              <div className="form-group">
                <label>{t.accountLockoutDuration}</label>
                <input
                  type="number"
                  name="accountLockoutDuration"
                  value={securitySettings.accountLockoutDuration}
                  onChange={handleSecurityChange}
                  min="15"
                  max="1440"
                />
              </div>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="forcePasswordChangeOnFirstLogin"
                  checked={securitySettings.forcePasswordChangeOnFirstLogin}
                  onChange={handleSecurityChange}
                />
                <span>{t.forcePasswordChangeOnFirstLogin}</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notifyOnNewLogin"
                  checked={securitySettings.notifyOnNewLogin}
                  onChange={handleSecurityChange}
                />
                <span>{t.notifyOnNewLogin}</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notifyOnPasswordChange"
                  checked={securitySettings.notifyOnPasswordChange}
                  onChange={handleSecurityChange}
                />
                <span>{t.notifyOnPasswordChange}</span>
              </label>
            </div>
          </div>

          {/* IP Security */}
          <div className="settings-card">
            <h3>{t.ipSecurity}</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableIpWhitelist"
                  checked={securitySettings.enableIpWhitelist}
                  onChange={handleSecurityChange}
                />
                <span>{t.enableIpWhitelist}</span>
              </label>
            </div>
            {securitySettings.enableIpWhitelist && (
              <div className="form-group full-width">
                <label>{t.ipWhitelist}</label>
                <textarea
                  name="ipWhitelist"
                  value={securitySettings.ipWhitelist}
                  onChange={handleSecurityChange}
                  rows="3"
                  placeholder="192.168.1.1&#10;10.0.0.0/24&#10;172.16.0.1"
                />
              </div>
            )}
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableIpBlacklist"
                  checked={securitySettings.enableIpBlacklist}
                  onChange={handleSecurityChange}
                />
                <span>{t.enableIpBlacklist}</span>
              </label>
            </div>
            {securitySettings.enableIpBlacklist && (
              <div className="form-group full-width">
                <label>{t.ipBlacklist}</label>
                <textarea
                  name="ipBlacklist"
                  value={securitySettings.ipBlacklist}
                  onChange={handleSecurityChange}
                  rows="3"
                  placeholder="192.168.1.100&#10;10.0.0.50"
                />
              </div>
            )}
          </div>

          {/* Audit Logging */}
          <div className="settings-card">
            <h3>{t.auditLogging}</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableAuditLog"
                  checked={securitySettings.enableAuditLog}
                  onChange={handleSecurityChange}
                />
                <span>{t.enableAuditLog}</span>
              </label>
            </div>
            {securitySettings.enableAuditLog && (
              <>
                <div className="form-group">
                  <label>{t.auditLogRetention}</label>
                  <input
                    type="number"
                    name="auditLogRetention"
                    value={securitySettings.auditLogRetention}
                    onChange={handleSecurityChange}
                    min="30"
                    max="365"
                  />
                </div>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="logLoginAttempts"
                      checked={securitySettings.logLoginAttempts}
                      onChange={handleSecurityChange}
                    />
                    <span>{t.logLoginAttempts}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="logFailedLogins"
                      checked={securitySettings.logFailedLogins}
                      onChange={handleSecurityChange}
                    />
                    <span>{t.logFailedLogins}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="logPasswordChanges"
                      checked={securitySettings.logPasswordChanges}
                      onChange={handleSecurityChange}
                    />
                    <span>{t.logPasswordChanges}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="logSettingsChanges"
                      checked={securitySettings.logSettingsChanges}
                      onChange={handleSecurityChange}
                    />
                    <span>{t.logSettingsChanges}</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Security Headers */}
          <div className="settings-card">
            <h3>{t.securityHeaders}</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableHSTS"
                  checked={securitySettings.enableHSTS}
                  onChange={handleSecurityChange}
                />
                <span>{t.enableHSTS}</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableCSP"
                  checked={securitySettings.enableCSP}
                  onChange={handleSecurityChange}
                />
                <span>{t.enableCSP}</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableXFrame"
                  checked={securitySettings.enableXFrame}
                  onChange={handleSecurityChange}
                />
                <span>{t.enableXFrame}</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableXSSProtection"
                  checked={securitySettings.enableXSSProtection}
                  onChange={handleSecurityChange}
                />
                <span>{t.enableXSSProtection}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔐 {t.changePassword}</h2>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t.currentPassword}</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
                {passwordErrors.currentPassword && <span className="error-text">{passwordErrors.currentPassword}</span>}
              </div>
              <div className="form-group">
                <label>{t.newPassword}</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
                {passwordErrors.newPassword && <span className="error-text">{passwordErrors.newPassword}</span>}
              </div>
              <div className="form-group">
                <label>{t.confirmPassword}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
                {passwordErrors.confirmPassword && <span className="error-text">{passwordErrors.confirmPassword}</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPasswordModal(false)}>{t.cancel}</button>
              <button className="btn-save" onClick={handleUpdatePassword}>{t.updatePassword}</button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📱 {t.setup2FA}</h2>
              <button className="modal-close" onClick={() => setShow2FAModal(false)}>✕</button>
            </div>
            <div className="modal-body twofa-body">
              <div className="qr-placeholder">
                <div className="qr-code">[QR CODE]</div>
                <p>{t.scanQRCode}</p>
              </div>
              <div className="form-group">
                <label>{t.enterCode}</label>
                <input type="text" placeholder="000000" />
              </div>
              <div className="backup-codes">
                <p>{t.generateBackupCodes}</p>
                <button className="generate-btn">🔑 {t.generateBackupCodes}</button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShow2FAModal(false)}>{t.cancel}</button>
              <button className="btn-save" onClick={() => {
                alert(t.saveSuccess);
                setShow2FAModal(false);
              }}>{t.verify}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-security-settings {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          min-height: 100vh;
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

        .settings-container {
          display: flex;
          margin-top: 195px;
          min-height: calc(100vh - 195px);
        }

        .sidebar-container {
          position: fixed;
          top: 195px;
          left: 0;
          width: 260px;
          height: calc(100vh - 195px);
          background: white;
          border-right: 1px solid #e2e8f0;
          z-index: 40;
        }

        .main-container {
          flex: 1;
          padding: 24px 32px;
          margin-left: 260px;
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
          flex-wrap: wrap;
        }

        .password-btn, .twofa-btn, .save-btn {
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          border: none;
          transition: all 0.2s;
        }

        .password-btn {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .password-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139,92,246,0.3);
        }

        .twofa-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .twofa-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }

        .save-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .success-message {
          background: #d1fae5;
          color: #059669;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          border-left: 4px solid #059669;
        }

        /* Info Cards */
        .info-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .info-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
        }

        .info-icon {
          font-size: 2rem;
        }

        .info-content {
          flex: 1;
        }

        .info-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
        }

        /* Settings Card */
        .settings-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .settings-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
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
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .input-group {
          display: flex;
          gap: 10px;
        }

        .input-group input {
          flex: 1;
        }

        .input-group select {
          width: 100px;
        }

        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          padding-top: 16px;
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

        .backup-codes-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 10px;
        }

        .generate-codes-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.75rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .modal-header h2 {
          font-size: 1.2rem;
          color: #0f172a;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #94a3b8;
        }

        .modal-body {
          padding: 24px;
        }

        .twofa-body {
          text-align: center;
        }

        .qr-placeholder {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
        }

        .qr-code {
          width: 150px;
          height: 150px;
          background: #e2e8f0;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #64748b;
        }

        .backup-codes {
          margin-top: 20px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .generate-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 10px;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.7rem;
          margin-top: 4px;
          display: block;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          text-align: right;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
          background: white;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-save {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .info-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .settings-container {
            margin-top: 280px;
          }
          .sidebar-container {
            top: 280px;
            height: calc(100vh - 280px);
          }
          .main-container {
            padding: 16px;
            margin-left: 0;
          }
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-actions {
            width: 100%;
          }
          .password-btn, .twofa-btn, .save-btn {
            flex: 1;
            text-align: center;
          }
          .info-cards {
            grid-template-columns: 1fr;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-group.full-width {
            grid-column: span 1;
          }
          .checkbox-group {
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .modal-footer {
            flex-direction: column;
          }
          .btn-cancel, .btn-save {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettingsSecurity;