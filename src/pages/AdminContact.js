// src/pages/AdminContact.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminContact = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('support');

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium'
  });

  const [formErrors, setFormErrors] = useState({});

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
      contactSupport: 'सहायता सम्पर्क',
      getHelp: 'सहायता प्राप्त गर्नुहोस्',
      supportCenter: 'सहायता केन्द्र',
      faq: 'बारम्बार सोधिने प्रश्नहरू',
      contactForm: 'सम्पर्क फारम',
      yourName: 'तपाईंको नाम',
      yourEmail: 'तपाईंको इमेल',
      subject: 'विषय',
      category: 'प्रकार',
      message: 'सन्देश',
      priority: 'प्राथमिकता',
      sendMessage: 'सन्देश पठाउनुहोस्',
      sending: 'पठाउँदै...',
      messageSent: 'तपाईंको सन्देश सफलतापूर्वक पठाइयो। हामी चाँडै सम्पर्क गर्नेछौं।',
      fillRequiredFields: 'कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्',
      invalidEmail: 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्',
      general: 'साधारण',
      technical: 'प्राविधिक',
      billing: 'बिलिङ',
      account: 'खाता',
      other: 'अन्य',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      callUs: 'हामीलाई कल गर्नुहोस्',
      emailUs: 'हामीलाई इमेल गर्नुहोस्',
      liveChat: 'लाइभ च्याट',
      officeHours: 'कार्यालय समय',
      supportHours: 'सोमबार - शुक्रबार, ९:०० - १७:००',
      emergencySupport: 'आपातकालीन सहायता',
      emergencyNumber: '२४/७ आपातकालीन नम्बर',
      faqTitle: 'बारम्बार सोधिने प्रश्नहरू',
      faq1Q: 'म कसरी नयाँ गुनासो दर्ता गर्न सक्छु?',
      faq1A: 'ड्यासबोर्डको "नयाँ गुनासो थप्नुहोस्" बटनमा क्लिक गर्नुहोस् वा साइडबारको "गुनासोहरू" मेनु प्रयोग गर्नुहोस्।',
      faq2Q: 'मेरो गुनासोको स्थिति कसरी हेर्ने?',
      faq2A: 'गुनासो सूचीबाट आफ्नो गुनासोमा क्लिक गर्नुहोस् वा ट्र्याकिङ पृष्ठमा टिकेट नम्बर प्रविष्ट गर्नुहोस्।',
      faq3Q: 'गुनासो समाधान हुन कति समय लाग्छ?',
      faq3A: 'प्राथमिकता अनुसार, साधारण गुनासो २-३ दिनमा, उच्च प्राथमिकता २४ घण्टा भित्र समाधान गरिन्छ।',
      faq4Q: 'म कसरी आफ्नो प्रोफाइल अपडेट गर्न सक्छु?',
      faq4A: 'माथिल्लो दायाँ कुनामा रहेको आफ्नो नाममा क्लिक गरी "प्रोफाइल" विकल्प चयन गर्नुहोस्।',
      connectWithUs: 'हामीसँग जोडिनुहोस्',
      socialMedia: 'सामाजिक सञ्जाल',
      findUsOn: 'हामीलाई यहाँ पाउनुहोस्',
      loading: 'लोड हुँदैछ...'
    },
    en: {
      contactSupport: 'Contact Support',
      getHelp: 'Get Help',
      supportCenter: 'Support Center',
      faq: 'FAQ',
      contactForm: 'Contact Form',
      yourName: 'Your Name',
      yourEmail: 'Your Email',
      subject: 'Subject',
      category: 'Category',
      message: 'Message',
      priority: 'Priority',
      sendMessage: 'Send Message',
      sending: 'Sending...',
      messageSent: 'Your message has been sent successfully. We will contact you soon.',
      fillRequiredFields: 'Please fill all required fields',
      invalidEmail: 'Please enter a valid email address',
      general: 'General',
      technical: 'Technical',
      billing: 'Billing',
      account: 'Account',
      other: 'Other',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      callUs: 'Call Us',
      emailUs: 'Email Us',
      liveChat: 'Live Chat',
      officeHours: 'Office Hours',
      supportHours: 'Monday - Friday, 9:00 - 17:00',
      emergencySupport: 'Emergency Support',
      emergencyNumber: '24/7 Emergency Number',
      faqTitle: 'Frequently Asked Questions',
      faq1Q: 'How do I register a new complaint?',
      faq1A: 'Click the "Add New Complaint" button on the dashboard or use the "Complaints" menu in the sidebar.',
      faq2Q: 'How do I check my complaint status?',
      faq2A: 'Click on your complaint from the complaints list or enter the ticket number on the tracking page.',
      faq3Q: 'How long does it take to resolve a complaint?',
      faq3A: 'Depending on priority, general complaints take 2-3 days, high priority complaints are resolved within 24 hours.',
      faq4Q: 'How do I update my profile?',
      faq4A: 'Click on your name at the top right corner and select the "Profile" option.',
      connectWithUs: 'Connect With Us',
      socialMedia: 'Social Media',
      findUsOn: 'Find us on',
      loading: 'Loading...'
    }
  };

  const t = content[language];

  const categories = [
    { id: 'general', label: t.general, icon: '📝' },
    { id: 'technical', label: t.technical, icon: '💻' },
    { id: 'billing', label: t.billing, icon: '💰' },
    { id: 'account', label: t.account, icon: '👤' },
    { id: 'other', label: t.other, icon: '📌' }
  ];

  const priorities = [
    { id: 'high', label: t.high, color: '#dc2626' },
    { id: 'medium', label: t.medium, color: '#f59e0b' },
    { id: 'low', label: t.low, color: '#10b981' }
  ];

  const faqs = [
    { id: 1, question: t.faq1Q, answer: t.faq1A },
    { id: 2, question: t.faq2Q, answer: t.faq2A },
    { id: 3, question: t.faq3Q, answer: t.faq3A },
    { id: 4, question: t.faq4Q, answer: t.faq4A }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = t.fillRequiredFields;
    if (!formData.email) errors.email = t.fillRequiredFields;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t.invalidEmail;
    if (!formData.subject) errors.subject = t.fillRequiredFields;
    if (!formData.message) errors.message = t.fillRequiredFields;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setSendSuccess(true);
    
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: 'general',
      message: '',
      priority: 'medium'
    });
    
    setTimeout(() => setSendSuccess(false), 5000);
  };

  const handleLiveChat = () => {
    alert(t.liveChat);
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
    <div className="admin-contact">
      <Header language={language} setLanguage={setLanguage} adminName="Admin" />
      
      <div className="contact-container">
        <div className="sidebar-container">
          <Sidebar language={language} />
        </div>
        
        <div className="main-container">
          <div className="page-header">
            <div>
              <h1>💬 {t.contactSupport}</h1>
              <p>{t.getHelp}</p>
            </div>
          </div>

          {/* Contact Info Cards */}
          <div className="contact-cards">
            <div className="contact-card" onClick={() => alert(t.callUs)}>
              <div className="contact-card-icon">📞</div>
              <div className="contact-card-info">
                <h3>{t.callUs}</h3>
                <p>01-4960008</p>
                <span className="contact-card-hours">{t.supportHours}</span>
              </div>
            </div>
            <div className="contact-card" onClick={() => alert(t.emailUs)}>
              <div className="contact-card-icon">✉️</div>
              <div className="contact-card-info">
                <h3>{t.emailUs}</h3>
                <p>support@ntc.com.np</p>
                <span className="contact-card-hours">{t.supportHours}</span>
              </div>
            </div>
            <div className="contact-card" onClick={handleLiveChat}>
              <div className="contact-card-icon">💬</div>
              <div className="contact-card-info">
                <h3>{t.liveChat}</h3>
                <p>{t.liveChat}</p>
                <span className="contact-card-hours">24/7 Available</span>
              </div>
            </div>
            <div className="contact-card emergency">
              <div className="contact-card-icon">🚨</div>
              <div className="contact-card-info">
                <h3>{t.emergencySupport}</h3>
                <p>198 (Toll Free)</p>
                <span className="contact-card-hours">{t.emergencyNumber}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="contact-tabs">
            <button
              className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              📝 {t.contactForm}
            </button>
            <button
              className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
              onClick={() => setActiveTab('faq')}
            >
              ❓ {t.faqTitle}
            </button>
          </div>

          {/* Support Form Tab */}
          {activeTab === 'support' && (
            <div className="support-form-container">
              <div className="form-card">
                <h3>{t.contactForm}</h3>
                
                {sendSuccess && (
                  <div className="success-message">
                    ✓ {t.messageSent}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t.yourName} <span className="required">*</span></label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t.yourName}
                        className={formErrors.name ? 'error' : ''}
                      />
                      {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>{t.yourEmail} <span className="required">*</span></label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        className={formErrors.email ? 'error' : ''}
                      />
                      {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>{t.subject} <span className="required">*</span></label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder={t.subject}
                      className={formErrors.subject ? 'error' : ''}
                    />
                    {formErrors.subject && <span className="error-text">{formErrors.subject}</span>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t.category}</label>
                      <select name="category" value={formData.category} onChange={handleInputChange}>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.priority}</label>
                      <select name="priority" value={formData.priority} onChange={handleInputChange}>
                        {priorities.map(pri => (
                          <option key={pri.id} value={pri.id}>{pri.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>{t.message} <span className="required">*</span></label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder={t.message}
                      className={formErrors.message ? 'error' : ''}
                    />
                    {formErrors.message && <span className="error-text">{formErrors.message}</span>}
                  </div>
                  
                  <button type="submit" className="submit-btn" disabled={sending}>
                    {sending ? (
                      <>⏳ {t.sending}</>
                    ) : (
                      <>✉️ {t.sendMessage}</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="faq-container">
              <div className="faq-card">
                <h3>{t.faqTitle}</h3>
                <div className="faq-list">
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="faq-item">
                      <div className="faq-question">
                        <span className="faq-number">{index + 1}.</span>
                        <span>{faq.question}</span>
                      </div>
                      <div className="faq-answer">
                        <span className="answer-icon">📌</span>
                        <span>{faq.answer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Office Hours & Social Media */}
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">🏢</div>
              <div className="info-content">
                <h4>{t.officeHours}</h4>
                <p>{t.supportHours}</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <h4>{t.findUsOn}</h4>
                <p>Bhadrakali Plaza, Kathmandu</p>
              </div>
            </div>
            <div className="info-card social">
              <div className="info-icon">🌐</div>
              <div className="info-content">
                <h4>{t.socialMedia}</h4>
                <div className="social-links">
                  <button className="social-link" onClick={() => alert('Facebook')}>📘</button>
                  <button className="social-link" onClick={() => alert('Twitter')}>🐦</button>
                  <button className="social-link" onClick={() => alert('LinkedIn')}>🔗</button>
                  <button className="social-link" onClick={() => alert('Instagram')}>📷</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-contact {
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

        .contact-container {
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
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
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

        /* Contact Cards */
        .contact-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .contact-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
        }

        .contact-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .contact-card.emergency {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          border-color: #fca5a5;
        }

        .contact-card-icon {
          font-size: 2rem;
        }

        .contact-card-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .contact-card-info p {
          font-size: 0.85rem;
          color: #475569;
          font-weight: 500;
        }

        .contact-card-hours {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Tabs */
        .contact-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 12px;
        }

        .tab-btn {
          background: transparent;
          border: none;
          padding: 8px 20px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          color: #64748b;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .tab-btn.active {
          background: #eff6ff;
          color: #3b82f6;
        }

        /* Form Card */
        .support-form-container, .faq-container {
          margin-bottom: 32px;
        }

        .form-card, .faq-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          border: 1px solid #e2e8f0;
        }

        .form-card h3, .faq-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 6px;
        }

        .required {
          color: #ef4444;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: inherit;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #ef4444;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.7rem;
          margin-top: 4px;
          display: block;
        }

        .success-message {
          background: #d1fae5;
          color: #059669;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          border-left: 4px solid #059669;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* FAQ Styles */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .faq-item {
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .faq-question {
          display: flex;
          gap: 10px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .faq-number {
          color: #3b82f6;
          font-weight: 700;
        }

        .faq-answer {
          display: flex;
          gap: 10px;
          color: #475569;
          font-size: 0.85rem;
          line-height: 1.5;
          padding-left: 24px;
        }

        .answer-icon {
          font-size: 0.8rem;
        }

        /* Info Cards */
        .info-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .info-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
        }

        .info-icon {
          font-size: 2rem;
        }

        .info-content h4 {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .info-content p {
          font-size: 0.8rem;
          color: #64748b;
        }

        .social-links {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .social-link {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .social-link:hover {
          background: #e2e8f0;
          transform: scale(1.05);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .contact-cards {
            grid-template-columns: repeat(2, 1fr);
          }
          .info-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .contact-container {
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
          .contact-cards {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .info-cards {
            grid-template-columns: 1fr;
          }
          .contact-tabs {
            flex-direction: column;
            border-bottom: none;
          }
          .tab-btn {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .contact-card {
            flex-direction: column;
            text-align: center;
          }
          .info-card {
            flex-direction: column;
            text-align: center;
          }
          .social-links {
            justify-content: center;
          }
          .faq-question {
            flex-direction: column;
          }
          .faq-answer {
            padding-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminContact;