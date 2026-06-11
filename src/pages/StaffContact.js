// src/pages/StaffContact.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffContact = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('contact');

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium',
    attachment: null
  });

  const [messages, setMessages] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load staff data from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('staffUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setStaffData({
          id: user.id,
          name: user.name || 'Staff Member',
          role: user.role || 'Staff',
          email: user.email || '',
          phone: user.phone || '',
          department: user.department || 'Customer Support'
        });
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
  }, []);

  // Fetch contact data
  const fetchContactData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/staff/contact', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMessages(response.data.data.messages);
        setSupportTickets(response.data.data.tickets);
        setTeamMembers(response.data.data.teamMembers);
        setBackendStatus('connected');
      } else {
        setMessages(getSampleMessages());
        setSupportTickets(getSampleTickets());
        setTeamMembers(getSampleTeamMembers());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
      setMessages(getSampleMessages());
      setSupportTickets(getSampleTickets());
      setTeamMembers(getSampleTeamMembers());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Get sample messages
  const getSampleMessages = () => {
    return [
      { id: 1, from: 'Admin', message: language === 'np' ? 'टोलीमा स्वागत छ!' : 'Welcome to the team!', date: '2024-01-15', read: true },
      { id: 2, from: 'Supervisor', message: language === 'np' ? 'कृपया आफ्नो साप्ताहिक रिपोर्ट पेश गर्नुहोस्' : 'Please submit your weekly report', date: '2024-01-20', read: false },
      { id: 3, from: 'HR Department', message: language === 'np' ? 'भोलि बिहान १० बजे प्रशिक्षण सत्र' : 'Training session tomorrow at 10 AM', date: '2024-01-22', read: false }
    ];
  };

  // Get sample support tickets
  const getSampleTickets = () => {
    return [
      { id: 1, subject: language === 'np' ? 'लगइन समस्या' : 'Login issue', status: 'resolved', date: '2024-01-10', priority: 'high' },
      { id: 2, subject: language === 'np' ? 'रिपोर्ट उत्पादन त्रुटि' : 'Report generation error', status: 'in-progress', date: '2024-01-18', priority: 'medium' },
      { id: 3, subject: language === 'np' ? 'सुविधा अनुरोध' : 'Feature request', status: 'pending', date: '2024-01-20', priority: 'low' }
    ];
  };

  // Get sample team members with multi-language support
  const getSampleTeamMembers = () => {
    return [
      { id: 1, name: 'Admin', name_np: 'प्रशासक', role: 'System Administrator', role_np: 'प्रणाली प्रशासक', email: 'admin@ntc.gov.np', phone: '9841000001', avatar: '👨‍💼', online: true },
      { id: 2, name: 'Supervisor', name_np: 'पर्यवेक्षक', role: 'Team Supervisor', role_np: 'टोली पर्यवेक्षक', email: 'supervisor@ntc.gov.np', phone: '9841000002', avatar: '👩‍💼', online: true },
      { id: 3, name: 'IT Support', name_np: 'आईटी सहयोग', role: 'Technical Support', role_np: 'प्राविधिक सहयोग', email: 'support@ntc.gov.np', phone: '9841000003', avatar: '👨‍🔧', online: false },
      { id: 4, name: 'HR Department', name_np: 'मानव संसाधन', role: 'Human Resources', role_np: 'मानव संसाधन', email: 'hr@ntc.gov.np', phone: '9841000004', avatar: '👩‍💼', online: true }
    ];
  };

  // Send message
  const sendMessage = async () => {
    if (!formData.subject || !formData.message) {
      setError(language === 'np' ? 'कृपया विषय र सन्देश भर्नुहोस्' : 'Please fill subject and message');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.post(
        'http://localhost:5000/api/staff/contact/send',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(language === 'np' ? 'सन्देश सफलतापूर्वक पठाइयो' : 'Message sent successfully');
        setFormData({ subject: '', category: 'general', message: '', priority: 'medium', attachment: null });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Send failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(language === 'np' 
        ? 'सन्देश पठाउन असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Failed to send message. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSending(false);
    }
  };

  // Create support ticket
  const createTicket = async () => {
    if (!formData.subject || !formData.message) {
      setError(language === 'np' ? 'कृपया विषय र विवरण भर्नुहोस्' : 'Please fill subject and description');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.post(
        'http://localhost:5000/api/staff/contact/ticket',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(language === 'np' ? 'टिकट सफलतापूर्वक सिर्जना गरियो' : 'Ticket created successfully');
        setFormData({ subject: '', category: 'general', message: '', priority: 'medium', attachment: null });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Ticket creation failed');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError(language === 'np' 
        ? 'टिकट सिर्जना गर्न असफल। कृपया पुन: प्रयास गर्नुहोस्।' 
        : 'Failed to create ticket. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSending(false);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('staffToken');
      await axios.put(
        `http://localhost:5000/api/staff/contact/messages/${messageId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchContactData();
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  const getUnreadCount = () => {
    return messages.filter(m => !m.read).length;
  };

  // Helper function to get team member name
  const getTeamMemberName = (member) => {
    return language === 'np' ? (member.name_np || member.name) : member.name;
  };

  // Helper function to get team member role
  const getTeamMemberRole = (member) => {
    return language === 'np' ? (member.role_np || member.role) : member.role;
  };

  const content = {
    np: {
      pageTitle: 'सम्पर्क र सहयोग',
      contactSupport: 'सम्पर्क र सहयोग',
      sendMessage: 'सन्देश पठाउनुहोस्',
      createTicket: 'टिकट सिर्जना गर्नुहोस्',
      messages: 'सन्देशहरू',
      supportTickets: 'सहयोग टिकटहरू',
      teamMembers: 'टोली सदस्यहरू',
      contactInfo: 'सम्पर्क जानकारी',
      subject: 'विषय',
      category: 'श्रेणी',
      message: 'सन्देश',
      priority: 'प्राथमिकता',
      attachment: 'संलग्नक',
      chooseFile: 'फाइल छान्नुहोस्',
      send: 'पठाउनुहोस्',
      sending: 'पठाउँदै...',
      create: 'सिर्जना गर्नुहोस्',
      general: 'साधारण',
      technical: 'प्राविधिक',
      billing: 'बिलिङ',
      other: 'अन्य',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      from: 'बाट',
      date: 'मिति',
      status: 'स्थिति',
      actions: 'कार्यहरू',
      view: 'हेर्नुहोस्',
      reply: 'जवाफ दिनुहोस्',
      pending: 'विचाराधीन',
      inProgress: 'प्रगतिमा',
      resolved: 'समाधान',
      name: 'नाम',
      role: 'भूमिका',
      email: 'इमेल',
      phone: 'फोन',
      online: 'अनलाइन',
      offline: 'अफलाइन',
      contactViaEmail: 'इमेल मार्फत सम्पर्क गर्नुहोस्',
      contactViaPhone: 'फोन मार्फत सम्पर्क गर्नुहोस्',
      noMessages: 'कुनै सन्देश छैन',
      noTickets: 'कुनै टिकट छैन',
      refresh: 'रिफ्रेस',
      loading: 'लोड हुँदै...',
      back: 'पछाडि फर्कनुहोस्',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      emergencyContact: 'आपत्कालीन सम्पर्क',
      emergencyNumber: 'आपत्कालीन नम्बर: १६६००१',
      officeAddress: 'कार्यालय ठेगाना',
      officeHours: 'कार्यालय समय',
      supportEmail: 'सहयोग इमेल',
      supportPhone: 'सहयोग फोन',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      close: 'बन्द गर्नुहोस्'
    },
    en: {
      pageTitle: 'Contact & Support',
      contactSupport: 'Contact & Support',
      sendMessage: 'Send Message',
      createTicket: 'Create Ticket',
      messages: 'Messages',
      supportTickets: 'Support Tickets',
      teamMembers: 'Team Members',
      contactInfo: 'Contact Information',
      subject: 'Subject',
      category: 'Category',
      message: 'Message',
      priority: 'Priority',
      attachment: 'Attachment',
      chooseFile: 'Choose File',
      send: 'Send',
      sending: 'Sending...',
      create: 'Create',
      general: 'General',
      technical: 'Technical',
      billing: 'Billing',
      other: 'Other',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      from: 'From',
      date: 'Date',
      status: 'Status',
      actions: 'Actions',
      view: 'View',
      reply: 'Reply',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      name: 'Name',
      role: 'Role',
      email: 'Email',
      phone: 'Phone',
      online: 'Online',
      offline: 'Offline',
      contactViaEmail: 'Contact via Email',
      contactViaPhone: 'Contact via Phone',
      noMessages: 'No messages',
      noTickets: 'No tickets',
      refresh: 'Refresh',
      loading: 'Loading...',
      back: 'Back',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      emergencyContact: 'Emergency Contact',
      emergencyNumber: 'Emergency Number: 166001',
      officeAddress: 'Office Address',
      officeHours: 'Office Hours',
      supportEmail: 'Support Email',
      supportPhone: 'Support Phone',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      close: 'Close'
    }
  };

  const t = content[language];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="staff-contact">
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
              <h1 className="page-title">{t.contactSupport}</h1>
              <button className="refresh-btn" onClick={fetchContactData}>
                🔄 {t.refresh}
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

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                📧 {t.sendMessage}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
                onClick={() => setActiveTab('tickets')}
              >
                🎫 {t.supportTickets}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                💬 {t.messages} {getUnreadCount() > 0 && `(${getUnreadCount()})`}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
                onClick={() => setActiveTab('team')}
              >
                👥 {t.teamMembers}
              </button>
              <button 
                className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                ℹ️ {t.contactInfo}
              </button>
            </div>

            {/* Contact Form Tab */}
            {activeTab === 'contact' && (
              <div className="contact-form-container">
                <div className="form-card">
                  <div className="form-header">
                    <h2>{t.sendMessage}</h2>
                    <p>{language === 'np' ? 'प्रशासक वा सहयोग टोलीलाई सन्देश पठाउनुहोस्' : 'Send a message to admin or support team'}</p>
                  </div>
                  
                  <div className="form-group">
                    <label>{t.subject} <span className="required">*</span></label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder={t.subject}
                      disabled={sending}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>{t.category}</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} disabled={sending}>
                        <option value="general">{t.general}</option>
                        <option value="technical">{t.technical}</option>
                        <option value="billing">{t.billing}</option>
                        <option value="other">{t.other}</option>
                      </select>
                    </div>

                    <div className="form-group half">
                      <label>{t.priority}</label>
                      <select name="priority" value={formData.priority} onChange={handleInputChange} disabled={sending}>
                        <option value="high">{t.high}</option>
                        <option value="medium">{t.medium}</option>
                        <option value="low">{t.low}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t.message} <span className="required">*</span></label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t.message}
                      rows="6"
                      disabled={sending}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t.attachment}</label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        name="attachment"
                        onChange={handleFileChange}
                        disabled={sending}
                        className="file-input"
                      />
                      <span className="file-input-label">{t.chooseFile}</span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-submit" onClick={sendMessage} disabled={sending}>
                      {sending ? t.sending : t.send}
                    </button>
                  </div>
                </div>

                {/* Quick Support Options */}
                <div className="quick-support">
                  <div className="support-card">
                    <span className="support-icon">📞</span>
                    <h3>{t.supportPhone}</h3>
                    <p>01-4960008</p>
                    <small>{t.officeHours}: 9 AM - 5 PM</small>
                  </div>
                  <div className="support-card">
                    <span className="support-icon">✉️</span>
                    <h3>{t.supportEmail}</h3>
                    <p>support@ntc.gov.np</p>
                    <small>{t.contactViaEmail}</small>
                  </div>
                  <div className="support-card">
                    <span className="support-icon">🏢</span>
                    <h3>{t.officeAddress}</h3>
                    <p>Bhadrakali Plaza, Kathmandu</p>
                    <small>{t.officeHours}</small>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="tickets-container">
                <div className="form-card">
                  <div className="form-header">
                    <h2>{t.createTicket}</h2>
                    <p>{language === 'np' ? 'नयाँ सहयोग टिकट सिर्जना गर्नुहोस्' : 'Create a new support ticket'}</p>
                  </div>
                  
                  <div className="form-group">
                    <label>{t.subject} <span className="required">*</span></label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder={t.subject}
                      disabled={sending}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>{t.category}</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} disabled={sending}>
                        <option value="general">{t.general}</option>
                        <option value="technical">{t.technical}</option>
                        <option value="billing">{t.billing}</option>
                        <option value="other">{t.other}</option>
                      </select>
                    </div>

                    <div className="form-group half">
                      <label>{t.priority}</label>
                      <select name="priority" value={formData.priority} onChange={handleInputChange} disabled={sending}>
                        <option value="high">{t.high}</option>
                        <option value="medium">{t.medium}</option>
                        <option value="low">{t.low}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t.message} <span className="required">*</span></label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t.message}
                      rows="6"
                      disabled={sending}
                    />
                  </div>

                  <div className="form-actions">
                    <button className="btn-submit" onClick={createTicket} disabled={sending}>
                      {sending ? t.sending : t.create}
                    </button>
                  </div>
                </div>

                {/* Existing Tickets */}
                <div className="tickets-list-card">
                  <h3>{t.supportTickets}</h3>
                  <div className="tickets-table-wrapper">
                    <table className="tickets-table">
                      <thead>
                        <tr>
                          <th>{t.subject}</th>
                          <th>{t.date}</th>
                          <th>{t.priority}</th>
                          <th>{t.status}</th>
                          <th>{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supportTickets.map(ticket => (
                          <tr key={ticket.id}>
                            <td className="ticket-subject">{ticket.subject}</td>
                            <td className="ticket-date">{ticket.date}</td>
                            <td>
                              <span className={`priority-badge priority-${ticket.priority}`}>
                                {ticket.priority === 'high' ? t.high : 
                                 ticket.priority === 'medium' ? t.medium : t.low}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge status-${ticket.status === 'in-progress' ? 'in-progress' : ticket.status}`}>
                                {ticket.status === 'pending' ? t.pending :
                                 ticket.status === 'in-progress' ? t.inProgress : t.resolved}
                              </span>
                            </td>
                            <td>
                              <button className="view-btn" onClick={() => alert('View ticket details')}>{t.view}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {supportTickets.length === 0 && (
                    <div className="empty-state">
                      <span className="empty-icon">🎫</span>
                      <p>{t.noTickets}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="messages-container">
                <div className="messages-list-card">
                  <h3>{t.messages}</h3>
                  <div className="messages-list">
                    {messages.map(message => (
                      <div key={message.id} className={`message-item ${!message.read ? 'unread' : ''}`} onClick={() => markAsRead(message.id)}>
                        <div className="message-avatar">
                          <span className="avatar-icon">👤</span>
                        </div>
                        <div className="message-content">
                          <div className="message-header">
                            <strong>{message.from}</strong>
                            <span className="message-date">{message.date}</span>
                          </div>
                          <p>{message.message}</p>
                        </div>
                        {!message.read && <div className="unread-dot"></div>}
                      </div>
                    ))}
                  </div>
                  {messages.length === 0 && (
                    <div className="empty-state">
                      <span className="empty-icon">💬</span>
                      <p>{t.noMessages}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Members Tab */}
            {activeTab === 'team' && (
              <div className="team-container">
                <div className="team-grid">
                  {teamMembers.map(member => (
                    <div key={member.id} className="team-card">
                      <div className="team-avatar">
                        <span className="avatar-icon">{member.avatar}</span>
                        <span className={`online-status ${member.online ? 'online' : 'offline'}`}></span>
                      </div>
                      <div className="team-info">
                        <h3>{getTeamMemberName(member)}</h3>
                        <p>{getTeamMemberRole(member)}</p>
                        <div className="team-contact">
                          <a href={`mailto:${member.email}`} className="contact-link">📧 {t.email}</a>
                          <a href={`tel:${member.phone}`} className="contact-link">📞 {t.phone}</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info Tab */}
            {activeTab === 'info' && (
              <div className="info-container">
                <div className="info-grid">
                  <div className="info-card">
                    <span className="info-icon">📞</span>
                    <h3>{t.supportPhone}</h3>
                    <p className="info-value">01-4960008</p>
                    <p className="info-desc">{t.officeHours}: 9 AM - 5 PM</p>
                  </div>
                  <div className="info-card">
                    <span className="info-icon">✉️</span>
                    <h3>{t.supportEmail}</h3>
                    <p className="info-value">support@ntc.gov.np</p>
                    <p className="info-desc">{t.contactViaEmail}</p>
                  </div>
                  <div className="info-card">
                    <span className="info-icon">🏢</span>
                    <h3>{t.officeAddress}</h3>
                    <p className="info-value">Bhadrakali Plaza, Kathmandu</p>
                    <p className="info-desc">Nepal</p>
                  </div>
                  <div className="info-card">
                    <span className="info-icon">🚨</span>
                    <h3>{t.emergencyContact}</h3>
                    <p className="info-value">{t.emergencyNumber}</p>
                    <p className="info-desc">24/7 Available</p>
                  </div>
                </div>

                <div className="office-hours-card">
                  <h3>{t.officeHours}</h3>
                  <div className="hours-list">
                    <div className="hour-item">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="hour-item">
                      <span>Saturday</span>
                      <span>10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="hour-item">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
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

        .staff-contact {
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

        .form-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 24px;
        }

        .form-header {
          margin-bottom: 20px;
        }

        .form-header h2 {
          font-size: 1.2rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .form-header p {
          color: #64748b;
          font-size: 0.85rem;
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

        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none;
          border-color: #0288d1;
        }

        .form-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .form-group.half {
          flex: 1;
        }

        .file-input-wrapper {
          position: relative;
        }

        .file-input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .file-input-label {
          display: block;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }

        .file-input-label:hover {
          background: #f1f5f9;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
        }

        .btn-submit {
          padding: 10px 32px;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(2, 136, 209, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .quick-support {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .support-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .support-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .support-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 12px;
        }

        .support-card h3 {
          font-size: 0.9rem;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .support-card p {
          font-size: 0.85rem;
          color: #0288d1;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .support-card small {
          font-size: 0.7rem;
          color: #64748b;
        }

        .tickets-list-card, .messages-list-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
        }

        .tickets-list-card h3, .messages-list-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
          padding-left: 12px;
          border-left: 3px solid #0288d1;
        }

        .tickets-table-wrapper {
          overflow-x: auto;
        }

        .tickets-table {
          width: 100%;
          border-collapse: collapse;
        }

        .tickets-table th, .tickets-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .tickets-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .tickets-table td {
          color: #334155;
          font-size: 0.85rem;
        }

        .tickets-table tr:hover {
          background: #fafcff;
        }

        .ticket-subject {
          font-weight: 500;
          color: #0f172a;
        }

        .ticket-date {
          color: #64748b;
        }

        .priority-badge, .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #e0e7ff; color: #4f46e5; }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-in-progress { background: #dbeafe; color: #2563eb; }
        .status-resolved { background: #d1fae5; color: #059669; }

        .view-btn {
          padding: 4px 12px;
          background: #e2e8f0;
          color: #475569;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: #cbd5e1;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 500px;
          overflow-y: auto;
        }

        .message-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .message-item:hover {
          background: #f8fafc;
        }

        .message-item.unread {
          background: #e0f2fe;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0288d1, #0277bd);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-icon {
          font-size: 1.2rem;
        }

        .message-content {
          flex: 1;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .message-date {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .message-content p {
          font-size: 0.85rem;
          color: #334155;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .team-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          display: flex;
          gap: 16px;
          transition: all 0.2s;
        }

        .team-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .team-avatar {
          position: relative;
        }

        .team-avatar .avatar-icon {
          font-size: 2.5rem;
        }

        .online-status {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .online-status.online { background: #10b981; }
        .online-status.offline { background: #94a3b8; }

        .team-info h3 {
          font-size: 1rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .team-info p {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 12px;
        }

        .team-contact {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .contact-link {
          font-size: 0.7rem;
          color: #0288d1;
          text-decoration: none;
          transition: color 0.2s;
        }

        .contact-link:hover {
          color: #0277bd;
          text-decoration: underline;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .info-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          text-align: center;
          transition: all 0.2s;
        }

        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .info-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 12px;
        }

        .info-card h3 {
          font-size: 0.9rem;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .info-value {
          font-size: 1rem;
          font-weight: 600;
          color: #0288d1;
          margin-bottom: 4px;
        }

        .info-desc {
          font-size: 0.75rem;
          color: #64748b;
        }

        .office-hours-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
        }

        .office-hours-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
          padding-left: 12px;
          border-left: 3px solid #0288d1;
        }

        .hours-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hour-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .empty-state {
          text-align: center;
          padding: 60px;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .dashboard-layout {
            flex-direction: column;
          }
          
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          
          .content-wrapper {
            padding: 16px;
          }
          
          .form-row {
            flex-direction: column;
          }
          
          .quick-support {
            grid-template-columns: 1fr;
          }
          
          .team-grid {
            grid-template-columns: 1fr;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
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
        }
      `}</style>
    </div>
  );
};

export default StaffContact;