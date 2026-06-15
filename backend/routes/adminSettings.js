// routes/adminSettings.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { 
    protect, 
    adminOnly,
    canViewGeneralSettings,
    canEditGeneralSettings,
    canViewEmailSettings,
    canEditEmailSettings,
    canViewSecuritySettings,
    canEditSecuritySettings,
    canViewBackupSettings,
    canEditBackupSettings,
    canViewNotificationSettings,
    canEditNotificationSettings,
    canPerformBackup,
    canSendTestEmail
} = require('../middleware/auth');

// Helper function to get settings
const getSettings = async (section) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT settings FROM admin_settings WHERE section = ?',
            [section],
            (err, row) => {
                if (err) reject(err);
                if (row) {
                    try {
                        resolve(JSON.parse(row.settings));
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    resolve(null);
                }
            }
        );
    });
};

// Helper function to save settings
const saveSettings = async (section, data, adminId) => {
    const settingsJson = JSON.stringify(data);
    
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT id FROM admin_settings WHERE section = ?',
            [section],
            (err, row) => {
                if (err) reject(err);
                
                if (row) {
                    db.run(
                        `UPDATE admin_settings 
                         SET settings = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? 
                         WHERE section = ?`,
                        [settingsJson, adminId, section],
                        (err) => {
                            if (err) reject(err);
                            resolve(true);
                        }
                    );
                } else {
                    db.run(
                        `INSERT INTO admin_settings (section, settings, created_at, updated_at, created_by, updated_by) 
                         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
                        [section, settingsJson, adminId, adminId],
                        (err) => {
                            if (err) reject(err);
                            resolve(true);
                        }
                    );
                }
            }
        );
    });
};

// Apply protect and adminOnly to all routes first
router.use(protect, adminOnly);

// GET /api/admin/settings/general
router.get('/general', canViewGeneralSettings, async (req, res) => {
    try {
        const settings = await getSettings('general');
        const defaultSettings = {
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
        };
        
        res.json({
            success: true,
            data: settings || defaultSettings
        });
    } catch (error) {
        console.error('Error fetching general settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/settings/general
router.put('/general', canEditGeneralSettings, async (req, res) => {
    try {
        const {
            siteName,
            siteName_np,
            siteDescription,
            siteDescription_np,
            siteEmail,
            sitePhone,
            siteAddress,
            siteAddress_np,
            timezone,
            dateFormat,
            timeFormat,
            defaultLanguage,
            itemsPerPage,
            enableRegistration,
            enablePublicComplaints,
            maintenanceMode
        } = req.body;
        
        const settings = {
            siteName,
            siteName_np,
            siteDescription,
            siteDescription_np,
            siteEmail,
            sitePhone,
            siteAddress,
            siteAddress_np,
            timezone,
            dateFormat,
            timeFormat,
            defaultLanguage,
            itemsPerPage: parseInt(itemsPerPage),
            enableRegistration,
            enablePublicComplaints,
            maintenanceMode,
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('general', settings, req.user.id);
        
        res.json({
            success: true,
            message: 'General settings saved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error saving general settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/settings/email
router.get('/email', canViewEmailSettings, async (req, res) => {
    try {
        const settings = await getSettings('email');
        const defaultSettings = {
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
        };
        
        // Don't send password back to client
        if (settings && settings.smtpPassword) {
            settings.smtpPassword = '********';
        }
        
        res.json({
            success: true,
            data: settings || defaultSettings
        });
    } catch (error) {
        console.error('Error fetching email settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/settings/email
router.put('/email', canEditEmailSettings, async (req, res) => {
    try {
        const {
            smtpHost,
            smtpPort,
            smtpUser,
            smtpPassword,
            smtpEncryption,
            fromEmail,
            fromName,
            fromName_np,
            sendComplaintConfirmation,
            sendComplaintUpdate,
            sendComplaintResolved,
            sendNewsletter
        } = req.body;
        
        // Get existing settings to preserve password if not changed
        let existingPassword = '';
        if (smtpPassword === '********') {
            const existing = await getSettings('email');
            existingPassword = existing?.smtpPassword || '';
        } else {
            existingPassword = smtpPassword;
        }
        
        const settings = {
            smtpHost,
            smtpPort: parseInt(smtpPort),
            smtpUser,
            smtpPassword: existingPassword,
            smtpEncryption,
            fromEmail,
            fromName,
            fromName_np,
            sendComplaintConfirmation,
            sendComplaintUpdate,
            sendComplaintResolved,
            sendNewsletter,
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('email', settings, req.user.id);
        
        // Return without password
        const responseSettings = { ...settings };
        responseSettings.smtpPassword = '********';
        
        res.json({
            success: true,
            message: 'Email settings saved successfully',
            data: responseSettings
        });
    } catch (error) {
        console.error('Error saving email settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/settings/security
router.get('/security', canViewSecuritySettings, async (req, res) => {
    try {
        const settings = await getSettings('security');
        const defaultSettings = {
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
        };
        
        res.json({
            success: true,
            data: settings || defaultSettings
        });
    } catch (error) {
        console.error('Error fetching security settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/settings/security
router.put('/security', canEditSecuritySettings, async (req, res) => {
    try {
        const {
            sessionTimeout,
            maxLoginAttempts,
            lockoutDuration,
            passwordExpiryDays,
            minPasswordLength,
            requireUppercase,
            requireLowercase,
            requireNumbers,
            requireSpecialChars,
            twoFactorAuth,
            ipWhitelist
        } = req.body;
        
        const settings = {
            sessionTimeout: parseInt(sessionTimeout),
            maxLoginAttempts: parseInt(maxLoginAttempts),
            lockoutDuration: parseInt(lockoutDuration),
            passwordExpiryDays: parseInt(passwordExpiryDays),
            minPasswordLength: parseInt(minPasswordLength),
            requireUppercase,
            requireLowercase,
            requireNumbers,
            requireSpecialChars,
            twoFactorAuth,
            ipWhitelist: ipWhitelist || '',
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('security', settings, req.user.id);
        
        res.json({
            success: true,
            message: 'Security settings saved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error saving security settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/settings/backup
router.get('/backup', canViewBackupSettings, async (req, res) => {
    try {
        const settings = await getSettings('backup');
        const defaultSettings = {
            autoBackup: true,
            backupFrequency: 'daily',
            backupTime: '02:00',
            backupRetention: 30,
            backupLocation: './backups/',
            lastBackup: null,
            lastBackupSize: null,
            updatedAt: null
        };
        
        res.json({
            success: true,
            data: settings || defaultSettings
        });
    } catch (error) {
        console.error('Error fetching backup settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/settings/backup
router.put('/backup', canEditBackupSettings, async (req, res) => {
    try {
        const {
            autoBackup,
            backupFrequency,
            backupTime,
            backupRetention,
            backupLocation,
            lastBackup,
            lastBackupSize
        } = req.body;
        
        const settings = {
            autoBackup,
            backupFrequency,
            backupTime,
            backupRetention: parseInt(backupRetention),
            backupLocation,
            lastBackup: lastBackup || null,
            lastBackupSize: lastBackupSize || null,
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('backup', settings, req.user.id);
        
        res.json({
            success: true,
            message: 'Backup settings saved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error saving backup settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/admin/settings/backup/now
router.post('/backup/now', canPerformBackup, async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const backupDir = './backups';
        
        // Create backup directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
        
        // Fetch all data for backup
        const users = await new Promise((resolve, reject) => {
            db.all('SELECT id, name, email, role, status, created_at FROM users', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        
        const complaints = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM complaints', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        
        const settings = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM admin_settings', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        
        const backupData = {
            timestamp: new Date().toISOString(),
            users,
            complaints,
            settings,
            metadata: {
                totalUsers: users.length,
                totalComplaints: complaints.length,
                version: '1.0.0',
                backupBy: req.user.id,
                backupByName: req.user.name
            }
        };
        
        // Write backup file
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        
        // Get file size
        const stats = fs.statSync(backupFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        // Update backup settings with last backup info
        const backupSettings = await getSettings('backup');
        if (backupSettings) {
            backupSettings.lastBackup = new Date().toISOString();
            backupSettings.lastBackupSize = `${fileSizeMB} MB`;
            await saveSettings('backup', backupSettings, req.user.id);
        }
        
        res.json({
            success: true,
            message: 'Backup created successfully',
            data: {
                lastBackup: new Date().toISOString(),
                size: `${fileSizeMB} MB`,
                file: backupFile,
                fileName: `backup_${timestamp}.json`
            }
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ success: false, message: 'Failed to create backup: ' + error.message });
    }
});

// GET /api/admin/settings/notifications
router.get('/notifications', canViewNotificationSettings, async (req, res) => {
    try {
        const settings = await getSettings('notifications');
        const defaultSettings = {
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
        };
        
        res.json({
            success: true,
            data: settings || defaultSettings
        });
    } catch (error) {
        console.error('Error fetching notification settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/settings/notifications
router.put('/notifications', canEditNotificationSettings, async (req, res) => {
    try {
        const {
            emailNotifications,
            smsNotifications,
            pushNotifications,
            notifyNewComplaint,
            notifyComplaintUpdate,
            notifyComplaintResolved,
            notifyNewUser,
            notifySystemUpdate,
            adminEmail,
            adminPhone
        } = req.body;
        
        const settings = {
            emailNotifications,
            smsNotifications,
            pushNotifications,
            notifyNewComplaint,
            notifyComplaintUpdate,
            notifyComplaintResolved,
            notifyNewUser,
            notifySystemUpdate,
            adminEmail: adminEmail || '',
            adminPhone: adminPhone || '',
            updatedAt: new Date().toISOString()
        };
        
        await saveSettings('notifications', settings, req.user.id);
        
        res.json({
            success: true,
            message: 'Notification settings saved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error saving notification settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/admin/settings/email/test
router.post('/email/test', canSendTestEmail, async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        const nodemailer = require('nodemailer');
        
        // Get email settings
        const emailSettings = await getSettings('email');
        
        if (!emailSettings || !emailSettings.smtpHost || !emailSettings.smtpUser || !emailSettings.smtpPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email settings not configured properly. Please configure SMTP settings first.' 
            });
        }
        
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: emailSettings.smtpHost,
            port: emailSettings.smtpPort,
            secure: emailSettings.smtpEncryption === 'ssl',
            auth: {
                user: emailSettings.smtpUser,
                pass: emailSettings.smtpPassword
            }
        });
        
        // Send email
        await transporter.sendMail({
            from: `${emailSettings.fromName} <${emailSettings.fromEmail}>`,
            to: to,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h2 style="color: white; margin: 0;">NTC Sahayatri</h2>
                    </div>
                    <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                        <p style="color: #1f2937; font-size: 16px; line-height: 1.5;">${message}</p>
                        <br>
                        <p style="color: #64748b; font-size: 14px;">This is a test email from your NTC Sahayatri system.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="color: #64748b; font-size: 12px; text-align: center;">
                            Sent from NTC Sahayatri Complaint Management System
                        </p>
                    </div>
                </div>
            `,
            text: message + '\n\nThis is a test email from your NTC Sahayatri system.'
        });
        
        res.json({
            success: true,
            message: `Test email sent successfully to ${to}`
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send test email: ' + error.message 
        });
    }
});

module.exports = router;