// src/pages/StaffComplaintSolve.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffComplaintSolve = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { complaint: initialComplaint } = location.state || {};
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  const [staffData, setStaffData] = useState({
    name: 'Ram Bahadur',
    role: 'Technical Support',
    email: 'ram@ntc.gov.np',
    phone: '9841234567'
  });

  const [complaint, setComplaint] = useState(initialComplaint || null);
  const [resolution, setResolution] = useState('');
  const [status, setStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch complaint details if not passed via state
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
      return;
    }
    
    if (!complaint && id) {
      fetchComplaintDetails(id);
    } else if (complaint) {
      setLoading(false);
      setStatus(complaint.status);
    } else {
      navigate('/staff/complaints/assigned');
    }
  }, [navigate, complaint, id]);

  const fetchComplaintDetails = async (complaintId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get(`http://localhost:5000/api/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const transformedComplaint = transformComplaintData(response.data.data);
        setComplaint(transformedComplaint);
        setStatus(transformedComplaint.status);
      } else {
        setError('Complaint not found');
        setTimeout(() => navigate('/staff/complaints/assigned'), 2000);
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      setError('Failed to load complaint details');
      setTimeout(() => navigate('/staff/complaints/assigned'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const transformComplaintData = (complaint) => ({
    id: complaint.id,
    ticketId: complaint.complaintNumber || `NTC-${complaint.id}`,
    name: complaint.name || 'N/A',
    enName: complaint.nameEn || complaint.name || 'N/A',
    email: complaint.email || 'N/A',
    phone: complaint.phone || 'N/A',
    category: complaint.category || 'general',
    category_np: complaint.categoryNp || getCategoryNepali(complaint.category),
    category_en: complaint.category || 'General',
    description: complaint.complaint || complaint.description || 'N/A',
    enDescription: complaint.complaintEn || complaint.complaint || complaint.description || 'N/A',
    status: mapStatus(complaint.status),
    date: complaint.date || formatDate(complaint.submittedDate),
    enDate: complaint.enDate || formatEnglishDate(complaint.submittedDate),
    channel: complaint.channel || 'वेबसाइट पोर्टल',
    enChannel: complaint.enChannel || 'Website Portal',
    priority: mapPriority(complaint.priority),
    address: complaint.address,
    landmark: complaint.landmark
  });

  const getCategoryNepali = (category) => {
    const categories = {
      'internet': 'इन्टरनेट',
      'recharge': 'रिचार्ज',
      'activation': 'सक्रियता',
      'billing': 'बिलिङ',
      'general': 'सामान्य'
    };
    return categories[category] || 'सामान्य';
  };

  const mapStatus = (status) => {
    if (!status) return 'pending';
    const statusMap = {
      'Pending': 'pending',
      'pending': 'pending',
      'In Progress': 'in-progress',
      'in-progress': 'in-progress',
      'Resolved': 'resolved',
      'resolved': 'resolved',
      'Closed': 'resolved',
      'closed': 'resolved',
      'Under Review': 'review',
      'review': 'review'
    };
    return statusMap[status] || 'pending';
  };

  const mapPriority = (priority) => {
    if (!priority) return 'medium';
    const priorityMap = {
      'High': 'high',
      'high': 'high',
      'Urgent': 'high',
      'Medium': 'medium',
      'medium': 'medium',
      'Low': 'low',
      'low': 'low'
    };
    return priorityMap[priority] || 'medium';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      const year = d.getFullYear() - 57;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '-';
    }
  };

  const formatEnglishDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toISOString().split('T')[0];
    } catch (error) {
      return '-';
    }
  };

  const handleUpdateStatus = async () => {
    if (!status) {
      setError(language === 'np' ? 'कृपया स्थिति चयन गर्नुहोस्' : 'Please select a status');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('staffToken');
      const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'resolved': 'Resolved',
        'review': 'Under Review'
      };
      
      const response = await axios.put(
        `http://localhost:5000/api/complaints/${complaint.id}/status`,
        { 
          status: statusMap[status],
          resolution: resolution,
          notes: updateNotes,
          actionTaken: actionTaken,
          followUpNeeded: followUpNeeded,
          followUpDate: followUpDate,
          updatedBy: staffData.name,
          updatedAt: new Date()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(language === 'np' 
          ? 'गुनासो सफलतापूर्वक अपडेट गरियो' 
          : 'Complaint updated successfully');
        setTimeout(() => {
          navigate('/staff/complaints/assigned');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setError(language === 'np' 
        ? 'अपडेट गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Update failed. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  const content = {
    np: {
      pageTitle: 'गुनासो समाधान',
      complaintDetails: 'गुनासोको विवरण',
      updateSection: 'गुनासो अपडेट गर्नुहोस्',
      ticketId: 'टिकेट नम्बर',
      complainant: 'उजुरीकर्ता',
      email: 'इमेल',
      phone: 'फोन',
      category: 'प्रकार',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      registeredDate: 'दर्ता मिति',
      description: 'गुनासो विवरण',
      channel: 'च्यानल',
      address: 'ठेगाना',
      landmark: 'सन्दर्भ स्थल',
      selectStatus: 'नयाँ स्थिति चयन गर्नुहोस्',
      resolution: 'समाधान विवरण',
      enterResolution: 'यो गुनासो कसरी समाधान गरियो?',
      actionTaken: 'गरिएको कार्य',
      enterAction: 'यो गुनासो समाधान गर्न के कार्य गरियो?',
      updateNotes: 'अपडेट नोटहरू',
      enterNotes: 'कुनै अतिरिक्त नोटहरू...',
      followUpNeeded: 'पुन: अनुगमन आवश्यक छ',
      followUpDate: 'पुन: अनुगमन मिति',
      selectDate: 'मिति चयन गर्नुहोस्',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      underReview: 'समीक्षामा',
      update: 'अपडेट गर्नुहोस्',
      updating: 'अपडेट हुँदै...',
      back: 'पछाडि फर्कनुहोस्',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      error: 'त्रुटि',
      loading: 'लोड हुँदै...',
      success: 'सफल',
      details: 'विवरण',
      updateInfo: 'अपडेट जानकारी',
      preview: 'पूर्वावलोकन'
    },
    en: {
      pageTitle: 'Solve Complaint',
      complaintDetails: 'Complaint Details',
      updateSection: 'Update Complaint',
      ticketId: 'Ticket ID',
      complainant: 'Complainant',
      email: 'Email',
      phone: 'Phone',
      category: 'Category',
      status: 'Status',
      priority: 'Priority',
      registeredDate: 'Registered Date',
      description: 'Complaint Description',
      channel: 'Channel',
      address: 'Address',
      landmark: 'Landmark',
      selectStatus: 'Select New Status',
      resolution: 'Resolution Details',
      enterResolution: 'How was this complaint resolved?',
      actionTaken: 'Action Taken',
      enterAction: 'What action was taken to resolve this complaint?',
      updateNotes: 'Update Notes',
      enterNotes: 'Any additional notes...',
      followUpNeeded: 'Follow Up Needed',
      followUpDate: 'Follow Up Date',
      selectDate: 'Select date',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      underReview: 'Under Review',
      update: 'Update',
      updating: 'Updating...',
      back: 'Back',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      error: 'Error',
      loading: 'Loading...',
      success: 'Success',
      details: 'Details',
      updateInfo: 'Update Info',
      preview: 'Preview'
    }
  };

  const t = content[language];

  const getPriorityClass = (priority) => {
    const classes = { high: 'priority-high', medium: 'priority-medium', low: 'priority-low' };
    return classes[priority] || 'priority-medium';
  };

  const getStatusClass = (status) => {
    const classes = { 
      pending: 'status-pending', 
      'in-progress': 'status-progress', 
      resolved: 'status-resolved',
      review: 'status-review'
    };
    return classes[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.error}</p>
      </div>
    );
  }

  return (
    <div className="staff-complaint-solve">
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
            <div className="page-header">
              <button className="back-btn" onClick={() => navigate('/staff/complaints/assigned')}>
                ← {t.back}
              </button>
              <h1>{t.pageTitle}</h1>
              <span className={`status-badge-header ${getStatusClass(complaint.status)}`}>
                {complaint.status === 'pending' ? t.pending : 
                 complaint.status === 'in-progress' ? t.inProgress :
                 complaint.status === 'resolved' ? t.resolved : t.underReview}
              </span>
            </div>

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

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                📋 {t.details}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'update' ? 'active' : ''}`}
                onClick={() => setActiveTab('update')}
              >
                ✏️ {t.updateInfo}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                👁️ {t.preview}
              </button>
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="complaint-card">
                <div className="card-header">
                  <h2>{t.complaintDetails}</h2>
                </div>

                <div className="complaint-info">
                  <div className="info-grid">
                    <div className="info-row">
                      <label>{t.ticketId}:</label>
                      <span className="ticket-id">{complaint.ticketId}</span>
                    </div>
                    <div className="info-row">
                      <label>{t.complainant}:</label>
                      <span>{language === 'np' ? complaint.name : complaint.enName}</span>
                    </div>
                    <div className="info-row">
                      <label>{t.email}:</label>
                      <span>{complaint.email}</span>
                    </div>
                    <div className="info-row">
                      <label>{t.phone}:</label>
                      <span>{complaint.phone}</span>
                    </div>
                    <div className="info-row">
                      <label>{t.category}:</label>
                      <span className="category-badge">
                        {language === 'np' ? complaint.category_np : complaint.category_en}
                      </span>
                    </div>
                    <div className="info-row">
                      <label>{t.priority}:</label>
                      <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                        {complaint.priority === 'high' ? t.high :
                         complaint.priority === 'medium' ? t.medium : t.low}
                      </span>
                    </div>
                    <div className="info-row">
                      <label>{t.registeredDate}:</label>
                      <span>{language === 'np' ? complaint.date : complaint.enDate}</span>
                    </div>
                    <div className="info-row">
                      <label>{t.channel}:</label>
                      <span>{language === 'np' ? complaint.channel : complaint.enChannel}</span>
                    </div>
                    {complaint.address && (
                      <div className="info-row">
                        <label>{t.address}:</label>
                        <span>{complaint.address}</span>
                      </div>
                    )}
                    {complaint.landmark && (
                      <div className="info-row">
                        <label>{t.landmark}:</label>
                        <span>{complaint.landmark}</span>
                      </div>
                    )}
                  </div>
                  <div className="description-section">
                    <label>{t.description}:</label>
                    <p className="description">{language === 'np' ? complaint.description : complaint.enDescription}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Update Tab */}
            {activeTab === 'update' && (
              <div className="update-card">
                <div className="card-header">
                  <h2>{t.updateSection}</h2>
                </div>

                <div className="update-form">
                  <div className="form-group">
                    <label>{t.selectStatus} <span className="required">*</span></label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="status-select"
                      disabled={updating}
                    >
                      <option value="">{t.selectStatus}</option>
                      <option value="pending">{t.pending}</option>
                      <option value="in-progress">{t.inProgress}</option>
                      <option value="review">{t.underReview}</option>
                      <option value="resolved">{t.resolved}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t.resolution}</label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder={t.enterResolution}
                      rows="4"
                      disabled={updating}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t.actionTaken}</label>
                    <textarea
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      placeholder={t.enterAction}
                      rows="3"
                      disabled={updating}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t.updateNotes}</label>
                    <textarea
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                      placeholder={t.enterNotes}
                      rows="3"
                      disabled={updating}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={followUpNeeded}
                          onChange={(e) => setFollowUpNeeded(e.target.checked)}
                          disabled={updating}
                        />
                        {t.followUpNeeded}
                      </label>
                    </div>

                    {followUpNeeded && (
                      <div className="form-group">
                        <label>{t.followUpDate}</label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="date-input"
                          disabled={updating}
                        />
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="btn-update" 
                      onClick={handleUpdateStatus}
                      disabled={updating || !status}
                    >
                      {updating ? t.updating : t.update}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="preview-card">
                <div className="card-header">
                  <h2>{t.preview}</h2>
                </div>

                <div className="preview-content">
                  <div className="preview-section">
                    <h3>Complaint Summary</h3>
                    <div className="preview-item">
                      <strong>Ticket ID:</strong> {complaint.ticketId}
                    </div>
                    <div className="preview-item">
                      <strong>Complainant:</strong> {language === 'np' ? complaint.name : complaint.enName}
                    </div>
                    <div className="preview-item">
                      <strong>Category:</strong> {language === 'np' ? complaint.category_np : complaint.category_en}
                    </div>
                  </div>

                  <div className="preview-section">
                    <h3>Update Information</h3>
                    <div className="preview-item">
                      <strong>New Status:</strong> 
                      <span className={`status-badge ${getStatusClass(status)}`}>
                        {status === 'pending' ? t.pending : 
                         status === 'in-progress' ? t.inProgress :
                         status === 'resolved' ? t.resolved : 
                         status === 'review' ? t.underReview : 'Not selected'}
                      </span>
                    </div>
                    {resolution && (
                      <div className="preview-item">
                        <strong>Resolution:</strong> {resolution}
                      </div>
                    )}
                    {actionTaken && (
                      <div className="preview-item">
                        <strong>Action Taken:</strong> {actionTaken}
                      </div>
                    )}
                    {updateNotes && (
                      <div className="preview-item">
                        <strong>Notes:</strong> {updateNotes}
                      </div>
                    )}
                    {followUpNeeded && (
                      <div className="preview-item">
                        <strong>Follow Up:</strong> Yes {followUpDate && `on ${followUpDate}`}
                      </div>
                    )}
                  </div>

                  <div className="preview-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => setActiveTab('update')}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-submit" 
                      onClick={handleUpdateStatus}
                      disabled={updating || !status}
                    >
                      {updating ? t.updating : t.update}
                    </button>
                  </div>
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

        .staff-complaint-solve {
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

        .content-wrapper {
          padding: 24px 32px;
          min-height: 100%;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .back-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
          font-weight: 500;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #f8fafc;
          border-color: #0288d1;
          color: #0288d1;
        }

        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          flex: 1;
        }

        .status-badge-header {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .error-message {
          background: #ffebee;
          border-left: 4px solid #f44336;
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
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .tab-navigation {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0;
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

        .complaint-card, .update-card, .preview-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .card-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-bottom: 1px solid #e2e8f0;
        }

        .card-header h2 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
        }

        .complaint-info {
          padding: 24px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .info-row label {
          width: 120px;
          font-weight: 600;
          color: #0f172a;
          flex-shrink: 0;
        }

        .info-row span {
          flex: 1;
          color: #334155;
          word-break: break-word;
        }

        .ticket-id {
          font-family: monospace;
          font-weight: 600;
          color: #0288d1;
        }

        .category-badge {
          display: inline-block;
          padding: 2px 10px;
          background: #e0f2fe;
          border-radius: 20px;
          font-size: 0.75rem;
        }

        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .status-review { background: #e0e7ff; color: #4f46e5; }

        .description-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .description-section label {
          font-weight: 600;
          color: #0f172a;
          display: block;
          margin-bottom: 8px;
        }

        .description {
          line-height: 1.6;
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          color: #334155;
        }

        .update-form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .required {
          color: #ef4444;
        }

        .status-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          background: white;
        }

        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          resize: vertical;
        }

        .form-group textarea:focus,
        .status-select:focus {
          outline: none;
          border-color: #0288d1;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-bottom: 0;
        }

        .checkbox-group input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .date-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }

        .btn-update {
          padding: 12px 32px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .btn-update:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(2, 136, 209, 0.3);
        }

        .btn-update:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .preview-content {
          padding: 24px;
        }

        .preview-section {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .preview-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .preview-item {
          padding: 8px 0;
          display: flex;
          gap: 12px;
        }

        .preview-item strong {
          min-width: 120px;
          color: #64748b;
        }

        .preview-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .btn-edit {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
        }

        .btn-edit:hover {
          background: #f8fafc;
          border-color: #0288d1;
          color: #0288d1;
        }

        .btn-submit {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(2, 136, 209, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          
          .content-wrapper {
            padding: 16px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .info-row {
            flex-direction: column;
          }
          
          .info-row label {
            width: 100%;
            margin-bottom: 4px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .btn-update {
            width: 100%;
          }
          
          .preview-item {
            flex-direction: column;
          }
          
          .preview-item strong {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffComplaintSolve;