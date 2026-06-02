// src/pages/StaffComplaintWork.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const StaffComplaintWork = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // Editable fields
  const [status, setStatus] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [resolution, setResolution] = useState('');
  const [priority, setPriority] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Translations
  const translations = {
    np: {
      workOnComplaint: 'गुनासोमा कार्य गर्नुहोस्',
      complaintDetails: 'गुनासो विवरण',
      updateComplaint: 'गुनासो अपडेट गर्नुहोस्',
      editComplaint: 'गुनासो सम्पादन गर्नुहोस्',
      viewMode: 'दृश्य मोड',
      editMode: 'सम्पादन मोड',
      status: 'स्थिति',
      feedback: 'प्रतिक्रिया',
      satisfactionRating: 'सन्तुष्टि मूल्यांकन',
      resolution: 'समाधान विवरण',
      priority: 'प्राथमिकता',
      notes: 'नोटहरू',
      assignedTo: 'तोकिएको कर्मचारी',
      updateButton: 'अपडेट गर्नुहोस्',
      updating: 'अपडेट हुँदैछ...',
      back: 'फिर्ता',
      edit: 'सम्पादन गर्नुहोस्',
      cancel: 'रद्द गर्नुहोस्',
      save: 'सुरक्षित गर्नुहोस्',
      updateSuccessMsg: 'गुनासो सफलतापूर्वक अपडेट गरियो',
      updateErrorMsg: 'गुनासो अपडेट गर्न असफल',
      ticketId: 'टिकेट नम्बर',
      customer: 'ग्राहक',
      email: 'इमेल',
      phone: 'फोन',
      category: 'प्रकार',
      description: 'विवरण',
      submittedDate: 'पेश गरिएको मिति',
      selectStatus: 'स्थिति चयन गर्नुहोस्',
      selectPriority: 'प्राथमिकता चयन गर्नुहोस्',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      addNotes: 'नोटहरू थप्नुहोस्...',
      resolutionDetails: 'समाधान विवरण लेख्नुहोस्...',
      feedbackForCustomer: 'ग्राहकलाई प्रतिक्रिया लेख्नुहोस्...',
      updateHistory: 'अपडेट इतिहास',
      noUpdateHistory: 'कुनै अपडेट इतिहास छैन'
    },
    en: {
      workOnComplaint: 'Work on Complaint',
      complaintDetails: 'Complaint Details',
      updateComplaint: 'Update Complaint',
      editComplaint: 'Edit Complaint',
      viewMode: 'View Mode',
      editMode: 'Edit Mode',
      status: 'Status',
      feedback: 'Feedback',
      satisfactionRating: 'Satisfaction Rating',
      resolution: 'Resolution Details',
      priority: 'Priority',
      notes: 'Notes',
      assignedTo: 'Assigned To',
      updateButton: 'Update',
      updating: 'Updating...',
      back: 'Back',
      edit: 'Edit',
      cancel: 'Cancel',
      save: 'Save',
      updateSuccessMsg: 'Complaint updated successfully',
      updateErrorMsg: 'Failed to update complaint',
      ticketId: 'Ticket ID',
      customer: 'Customer',
      email: 'Email',
      phone: 'Phone',
      category: 'Category',
      description: 'Description',
      submittedDate: 'Submitted Date',
      selectStatus: 'Select Status',
      selectPriority: 'Select Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      addNotes: 'Add notes...',
      resolutionDetails: 'Write resolution details...',
      feedbackForCustomer: 'Write feedback for customer...',
      updateHistory: 'Update History',
      noUpdateHistory: 'No update history'
    }
  };

  const t = translations[language];

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const user = localStorage.getItem('user');
    
    if (!token || userRole !== 'staff') {
      navigate('/login');
    } else {
      try {
        const userData = user ? JSON.parse(user) : {};
        setStaffName(userData.fullName || userData.name || 'Staff');
      } catch (e) {
        setStaffName('Staff');
      }
      fetchComplaint();
    }
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:5000/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setComplaint(data);
        setStatus(data.status || 'pending');
        setPriority(data.priority || 'medium');
        setFeedback(data.feedback || '');
        setRating(data.satisfactionRating || 0);
        setResolution(data.resolution || '');
        setNotes(data.notes || '');
        setAssignedTo(data.assignedTo || '');
      } else {
        setComplaint(getSampleComplaint());
        setStatus('pending');
        setPriority('medium');
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      setComplaint(getSampleComplaint());
      setStatus('pending');
      setPriority('medium');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateError('');
    
    try {
      const token = localStorage.getItem('token');
      const updateData = { 
        status,
        priority,
        feedback,
        satisfactionRating: rating,
        resolution,
        notes,
        assignedTo,
        updatedAt: new Date().toISOString()
      };
      
      if (status === 'resolved' && !complaint.resolvedDate) {
        updateData.resolvedDate = new Date().toISOString();
      }
      
      const response = await axios.patch(
        `http://localhost:5000/api/staff/complaints/${id}/status`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success) {
        setUpdateSuccess(true);
        setEditMode(false);
        // Refresh complaint data
        await fetchComplaint();
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } else {
        setUpdateError(response.data?.message || t.updateErrorMsg);
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setUpdateError(error.response?.data?.message || t.updateErrorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const getSampleComplaint = () => {
    return {
      id: id,
      complaintNumber: `TCK-${id}`,
      name: 'राम बहादुर',
      nameEn: 'Ram Bahadur',
      email: 'ram@example.com',
      phone: '9841000001',
      category: 'Technical',
      categoryEn: 'Technical',
      complaint: 'Internet connection issue - slow speed and frequent disconnections',
      priority: 'high',
      status: 'pending',
      submittedDate: new Date().toISOString(),
      feedback: '',
      satisfactionRating: 0,
      resolution: '',
      notes: '',
      assignedTo: ''
    };
  };

  const getPriorityClass = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return 'priority-high';
    if (p === 'medium') return 'priority-medium';
    if (p === 'low') return 'priority-low';
    return 'priority-medium';
  };

  const getPriorityText = (priority) => {
    const p = (priority || '').toLowerCase();
    if (language === 'np') {
      if (p === 'high') return 'उच्च';
      if (p === 'medium') return 'मध्यम';
      if (p === 'low') return 'न्यून';
    } else {
      if (p === 'high') return 'High';
      if (p === 'medium') return 'Medium';
      if (p === 'low') return 'Low';
    }
    return priority;
  };

  const getStatusText = (status) => {
    const s = (status || '').toLowerCase();
    if (language === 'np') {
      if (s === 'pending') return 'विचाराधीन';
      if (s === 'in-progress') return 'प्रगतिमा';
      if (s === 'resolved') return 'समाधान';
    } else {
      if (s === 'pending') return 'Pending';
      if (s === 'in-progress') return 'In Progress';
      if (s === 'resolved') return 'Resolved';
    }
    return status;
  };

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'status-pending';
    if (s === 'in-progress') return 'status-progress';
    if (s === 'resolved') return 'status-resolved';
    return 'status-pending';
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`rating-star ${i <= rating ? 'active' : ''}`}
          onClick={() => setRating(i)}
          disabled={!editMode}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString(language === 'np' ? 'ne-NP' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (updateSuccess) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>{t.updateSuccessMsg}</h2>
          <p>Changes saved successfully!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-complaint-work">
      <Header language={language} setLanguage={setLanguage} adminName={staffName} userRole="staff" />
      
      <div className="work-container">
        <div className="sidebar-container">
          <Sidebar language={language} userRole="staff" />
        </div>
        
        <div className="main-container">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate('/staff-dashboard')}>
              ← {t.back}
            </button>
            <h1>{t.workOnComplaint}</h1>
            <div className="mode-toggle">
              <button 
                className={`mode-btn ${!editMode ? 'active' : ''}`}
                onClick={() => setEditMode(false)}
              >
                👁️ {t.viewMode}
              </button>
              <button 
                className={`mode-btn ${editMode ? 'active' : ''}`}
                onClick={() => setEditMode(true)}
              >
                ✏️ {t.editMode}
              </button>
            </div>
          </div>

          {updateError && (
            <div className="error-message">
              ⚠️ {updateError}
            </div>
          )}

          {complaint && (
            <div className="work-content">
              {/* Complaint Details */}
              <div className="details-card">
                <h2>{t.complaintDetails}</h2>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>{t.ticketId}:</label>
                    <span className="ticket-id">{complaint.complaintNumber || `TCK-${complaint.id}`}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t.submittedDate}:</label>
                    <span>{formatDate(complaint.submittedDate || complaint.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t.customer}:</label>
                    <span>{language === 'np' ? complaint.name : complaint.nameEn}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t.email}:</label>
                    <span>{complaint.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t.phone}:</label>
                    <span>{complaint.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t.category}:</label>
                    <span>{language === 'np' ? complaint.category : complaint.categoryEn}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>{t.description}:</label>
                    <p className="description-text">{complaint.complaint || complaint.description || 'No description'}</p>
                  </div>
                </div>
              </div>

              {/* Update/Edit Form */}
              <div className="update-card">
                <h2>{editMode ? t.editComplaint : t.updateComplaint}</h2>
                
                <div className="form-group">
                  <label>{t.status}</label>
                  {editMode ? (
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)} 
                      className="status-select"
                    >
                      <option value="pending">{getStatusText('pending')}</option>
                      <option value="in-progress">{getStatusText('in-progress')}</option>
                      <option value="resolved">{getStatusText('resolved')}</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${getStatusClass(status)}`}>
                      {getStatusText(status)}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>{t.priority}</label>
                  {editMode ? (
                    <select 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value)} 
                      className="priority-select"
                    >
                      <option value="high">{t.high}</option>
                      <option value="medium">{t.medium}</option>
                      <option value="low">{t.low}</option>
                    </select>
                  ) : (
                    <span className={`priority-badge ${getPriorityClass(priority)}`}>
                      {getPriorityText(priority)}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>{t.feedback}</label>
                  {editMode ? (
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={t.feedbackForCustomer}
                      rows="3"
                      className="feedback-textarea"
                    />
                  ) : (
                    <p className="readonly-text">{feedback || 'No feedback provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>{t.satisfactionRating}</label>
                  <div className="rating-stars">
                    {renderStars()}
                    {!editMode && rating === 0 && <span className="rating-placeholder">Not rated yet</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>{t.resolution}</label>
                  {editMode ? (
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder={t.resolutionDetails}
                      rows="3"
                      className="resolution-textarea"
                    />
                  ) : (
                    <p className="readonly-text">{resolution || 'No resolution provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>{t.notes}</label>
                  {editMode ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.addNotes}
                      rows="2"
                      className="notes-textarea"
                    />
                  ) : (
                    <p className="readonly-text">{notes || 'No notes added'}</p>
                  )}
                </div>

                {editMode && (
                  <div className="form-group">
                    <label>{t.assignedTo}</label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Staff email or name"
                      className="assigned-input"
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    className="btn-cancel" 
                    onClick={() => editMode ? setEditMode(false) : navigate('/staff-dashboard')}
                  >
                    {editMode ? t.cancel : t.back}
                  </button>
                  {editMode && (
                    <button 
                      className="btn-update" 
                      onClick={handleUpdate} 
                      disabled={updating}
                    >
                      {updating ? t.updating : t.save}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .staff-complaint-work {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
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
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .success-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        
        .success-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .success-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }
        
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .work-container {
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
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .back-btn {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: #10b981;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .back-btn:hover {
          background: #f0fdf4;
        }
        
        .page-header h1 {
          font-size: 1.6rem;
          font-weight: 600;
          color: #0f172a;
          flex: 1;
        }
        
        .mode-toggle {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 40px;
        }
        
        .mode-btn {
          padding: 6px 16px;
          border: none;
          background: transparent;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        
        .mode-btn.active {
          background: #10b981;
          color: white;
        }
        
        .work-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        .details-card, .update-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #e2e8f0;
        }
        
        .details-card h2, .update-card h2 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .detail-item.full-width {
          grid-column: span 2;
        }
        
        .detail-item label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }
        
        .detail-item span, .detail-item p {
          font-size: 0.9rem;
          color: #0f172a;
        }
        
        .description-text {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          line-height: 1.5;
        }
        
        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #10b981;
        }
        
        .status-badge, .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
          width: fit-content;
        }
        
        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
          color: #0f172a;
        }
        
        .status-select, .priority-select, .assigned-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
        }
        
        .feedback-textarea, .resolution-textarea, .notes-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
          resize: vertical;
        }
        
        .status-select:focus, .priority-select:focus, .feedback-textarea:focus, 
        .resolution-textarea:focus, .notes-textarea:focus, .assigned-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.1);
        }
        
        .readonly-text {
          background: #f8fafc;
          padding: 10px 12px;
          border-radius: 8px;
          color: #334155;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        
        .rating-stars {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .rating-star {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: #d1d5db;
          transition: color 0.2s;
        }
        
        .rating-star.active {
          color: #f59e0b;
        }
        
        .rating-star:hover:not(:disabled) {
          color: #f59e0b;
        }
        
        .rating-star:disabled {
          cursor: default;
        }
        
        .rating-placeholder {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-left: 8px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        
        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-cancel:hover {
          background: #e2e8f0;
        }
        
        .btn-update {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-update:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }
        
        .btn-update:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        @media (max-width: 1024px) {
          .work-content {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .work-container { margin-top: 280px; }
          .sidebar-container { top: 280px; }
          .main-container { padding: 16px; margin-left: 0; }
          .details-grid { grid-template-columns: 1fr; }
          .detail-item.full-width { grid-column: span 1; }
          .page-header { flex-direction: column; align-items: flex-start; }
          .mode-toggle { align-self: flex-start; }
        }
        
        @media (max-width: 480px) {
          .form-actions { flex-direction: column; }
          .btn-cancel, .btn-update { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default StaffComplaintWork;