const { db, generateComplaintNumber, generateComplaintNumberNp, generateTrackingPassword } = require('../database/db');

class ComplaintRegardingService {
    async createComplaint(complaintData, files = []) {
        return new Promise((resolve, reject) => {
            const complaintNumber = generateComplaintNumber();
            const complaintNumberNp = generateComplaintNumberNp();
            const trackingPassword = generateTrackingPassword();
            
            const sql = `
                INSERT INTO complaint_regarding (
                    complaint_number, complaint_number_np, tracking_password,
                    complaint_type, subject, description, priority, name, email, phone,
                    address, landmark, preferred_contact, reference_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                complaintNumber,
                complaintNumberNp,
                trackingPassword,
                complaintData.complaintType,
                complaintData.subject,
                complaintData.description,
                complaintData.priority || 'medium',
                complaintData.name,
                complaintData.email || null,
                complaintData.phone,
                complaintData.address || null,
                complaintData.landmark || null,
                complaintData.preferredContact || 'phone',
                complaintData.referenceNumber || null
            ];
            
            db.run(sql, params, function(err) {
                if (err) {
                    console.error('Database insert error:', err);
                    reject(err);
                } else {
                    const complaintId = this.lastID;
                    
                    if (files && files.length > 0) {
                        files.forEach(file => {
                            const attachSql = `
                                INSERT INTO complaint_regarding_attachments 
                                (complaint_id, filename, original_name, file_path, file_size, mime_type)
                                VALUES (?, ?, ?, ?, ?, ?)
                            `;
                            db.run(attachSql, [
                                complaintId,
                                file.filename,
                                file.originalname,
                                file.path,
                                file.size,
                                file.mimetype
                            ]);
                        });
                    }
                    
                    resolve({
                        id: complaintId,
                        complaintNumber,
                        complaintNumberNp,
                        trackingPassword
                    });
                }
            });
        });
    }
    
    async getAllComplaints(filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT id, complaint_number, complaint_number_np, name, email, phone,
                       subject, complaint_type, priority, status, created_at, resolved_at
                FROM complaint_regarding
                WHERE 1=1
            `;
            const params = [];
            
            if (filters.status && filters.status !== 'all') {
                sql += ' AND status = ?';
                params.push(filters.status);
            }
            
            if (filters.priority && filters.priority !== 'all') {
                sql += ' AND priority = ?';
                params.push(filters.priority);
            }
            
            if (filters.complaintType && filters.complaintType !== 'all') {
                sql += ' AND complaint_type = ?';
                params.push(filters.complaintType);
            }
            
            if (filters.search) {
                sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ? OR subject LIKE ?)`;
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            sql += ' ORDER BY created_at DESC';
            
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }
    
    async getComplaintById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM complaint_regarding WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
    
    async updateStatus(complaintId, newStatus, resolution = null, changedBy = 'admin') {
        return new Promise((resolve, reject) => {
            const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
            const params = [newStatus];
            
            if (resolution) {
                updateFields.push('resolution = ?');
                params.push(resolution);
            }
            
            if (newStatus === 'resolved') {
                updateFields.push('resolved_at = CURRENT_TIMESTAMP');
            }
            
            params.push(complaintId);
            
            const sql = `UPDATE complaint_regarding SET ${updateFields.join(', ')} WHERE id = ?`;
            
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }
    
    async getStatistics() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
                FROM complaint_regarding
            `;
            
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || {});
            });
        });
    }
}

module.exports = new ComplaintRegardingService();