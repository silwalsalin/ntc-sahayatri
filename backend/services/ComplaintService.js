const { db, generateComplaintNumber, generateComplaintNumberNp, generateTrackingPassword } = require('../database/db');

class ComplaintService {
    // Create new complaint
    async createComplaint(complaintData, file = null) {
        return new Promise((resolve, reject) => {
            const complaintNumber = generateComplaintNumber();
            const complaintNumberNp = generateComplaintNumberNp();
            const trackingPassword = generateTrackingPassword();
            
            const sql = `
                INSERT INTO complaints (
                    complaint_number, complaint_number_np, tracking_password,
                    nature_of_complaint, name, email, phone, state, district,
                    municipality, ward_no, street_address, description, priority
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                complaintNumber,
                complaintNumberNp,
                trackingPassword,
                complaintData.natureOfComplaint,
                complaintData.name,
                complaintData.email,
                complaintData.phone,
                complaintData.state || null,
                complaintData.district || null,
                complaintData.municipality || null,
                complaintData.wardNo || null,
                complaintData.streetAddress || null,
                complaintData.description,
                complaintData.priority || 'medium'
            ];
            
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    const complaintId = this.lastID;
                    
                    const historySql = `
                        INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by)
                        VALUES (?, NULL, 'pending', 'system')
                    `;
                    db.run(historySql, [complaintId]);
                    
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
    
    // Get public complaints
    async getPublicComplaints(limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, name, email, phone, description, status, priority, 
                       complaint_number, created_at
                FROM complaints 
                ORDER BY created_at DESC
                LIMIT ?
            `;
            
            db.all(sql, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }
    
    // Get complaint by number
    async getComplaintByNumber(complaintNumber, password) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM complaints 
                WHERE (complaint_number = ? OR complaint_number_np = ?) 
                AND tracking_password = ?
            `;
            
            db.get(sql, [complaintNumber, complaintNumber, password], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
    
    // Get complaint by ID
    async getComplaintById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM complaints WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
    
    // Get all complaints
    async getAllComplaints(filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT id, complaint_number, complaint_number_np, name, email, phone,
                       status, priority, created_at, resolved_at, description
                FROM complaints
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
            
            if (filters.search) {
                sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR complaint_number LIKE ?)`;
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            sql += ' ORDER BY created_at DESC';
            
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }
    
    // Update status
    async updateStatus(complaintId, newStatus, resolution = null, changedBy = 'admin') {
        return new Promise((resolve, reject) => {
            db.get('SELECT status FROM complaints WHERE id = ?', [complaintId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
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
                
                const sql = `UPDATE complaints SET ${updateFields.join(', ')} WHERE id = ?`;
                
                db.run(sql, params, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                });
            });
        });
    }
    
    // Assign complaint
    async assignComplaint(complaintId, assignedTo) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE complaints SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            db.run(sql, [assignedTo, complaintId], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }
    
    // Get statistics
    async getStatistics() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
                FROM complaints
            `;
            
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || {});
            });
        });
    }
    
    // Save attachment
    async saveAttachment(complaintId, fileData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO attachments (complaint_id, filename, original_name, file_path, file_size, mime_type)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            db.run(sql, [
                complaintId,
                fileData.filename,
                fileData.originalName,
                fileData.filePath,
                fileData.fileSize,
                fileData.mimeType
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
    }
    
    // Get attachments
    async getAttachments(complaintId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM attachments WHERE complaint_id = ?`;
            db.all(sql, [complaintId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }
}

module.exports = new ComplaintService();