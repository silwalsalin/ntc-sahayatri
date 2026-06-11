// src/pages/StaffDocumentation.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffDocumentation = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('np');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

  const [documentation, setDocumentation] = useState([]);
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [videoTutorials, setVideoTutorials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

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

  // Fetch documentation
  const fetchDocumentation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await axios.get('http://localhost:5000/api/staff/documentation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDocumentation(response.data.data.articles);
        setCategories(response.data.data.categories);
        setFaqs(response.data.data.faqs);
        setVideoTutorials(response.data.data.videos);
        setAnnouncements(response.data.data.announcements);
        setBackendStatus('connected');
      } else {
        setDocumentation(getSampleArticles());
        setCategories(getSampleCategories());
        setFaqs(getSampleFaqs());
        setVideoTutorials(getSampleVideos());
        setAnnouncements(getSampleAnnouncements());
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching documentation:', error);
      setDocumentation(getSampleArticles());
      setCategories(getSampleCategories());
      setFaqs(getSampleFaqs());
      setVideoTutorials(getSampleVideos());
      setAnnouncements(getSampleAnnouncements());
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Get sample categories
  const getSampleCategories = () => {
    return [
      { id: 'getting-started', name: 'Getting Started', name_np: 'सुरु गर्दै', icon: '🚀', color: '#3b82f6', count: 8 },
      { id: 'complaints', name: 'Complaint Management', name_np: 'गुनासो व्यवस्थापन', icon: '📋', color: '#10b981', count: 12 },
      { id: 'tasks', name: 'Task Management', name_np: 'कार्य व्यवस्थापन', icon: '✅', color: '#f59e0b', count: 6 },
      { id: 'reports', name: 'Reports & Analytics', name_np: 'रिपोर्ट र विश्लेषण', icon: '📊', color: '#8b5cf6', count: 5 },
      { id: 'performance', name: 'Performance', name_np: 'प्रदर्शन', icon: '⭐', color: '#ec4899', count: 4 },
      { id: 'faq', name: 'FAQ', name_np: 'बारम्बार सोधिने प्रश्नहरू', icon: '❓', color: '#64748b', count: 15 }
    ];
  };

  // Get sample articles
  const getSampleArticles = () => {
    return [
      {
        id: 1,
        title: 'Getting Started with Staff Portal',
        title_np: 'स्टाफ पोर्टल सुरु गर्दै',
        enTitle: 'Getting Started with Staff Portal',
        category: 'getting-started',
        content: 'Learn how to navigate and use the staff portal effectively. This comprehensive guide covers everything from login to advanced features...',
        content_np: 'स्टाफ पोर्टल प्रभावकारी रूपमा नेभिगेट गर्न र प्रयोग गर्न सिक्नुहोस्। यो व्यापक गाइडले लगइनदेखि उन्नत सुविधाहरू सम्म सबै कुरा समावेश गर्दछ...',
        enContent: 'Learn how to navigate and use the staff portal effectively...',
        author: 'Admin',
        date: '2024-01-01',
        readTime: 5,
        likes: 45,
        views: 1200,
        difficulty: 'beginner',
        tags: ['guide', 'tutorial', 'basics']
      },
      {
        id: 2,
        title: 'How to Handle Complaints',
        title_np: 'गुनासो कसरी ह्यान्डल गर्ने',
        enTitle: 'How to Handle Complaints',
        category: 'complaints',
        content: 'Step-by-step guide to managing and resolving customer complaints efficiently. Learn best practices for complaint resolution...',
        content_np: 'ग्राहक गुनासो प्रभावकारी रूपमा व्यवस्थापन र समाधान गर्न चरण-दर-चरण गाइड। गुनासो समाधानको लागि उत्तम अभ्यासहरू सिक्नुहोस्...',
        enContent: 'Step-by-step guide to managing and resolving customer complaints...',
        author: 'Support Team',
        date: '2024-01-05',
        readTime: 8,
        likes: 32,
        views: 890,
        difficulty: 'intermediate',
        tags: ['complaints', 'resolution', 'customer-service']
      },
      {
        id: 3,
        title: 'Task Management Guide',
        title_np: 'कार्य व्यवस्थापन गाइड',
        enTitle: 'Task Management Guide',
        category: 'tasks',
        content: 'Complete guide to managing your tasks efficiently. Learn how to prioritize, track, and complete tasks on time...',
        content_np: 'तपाईंको कार्यहरू प्रभावकारी रूपमा व्यवस्थापन गर्न पूर्ण गाइड। कार्यहरूलाई प्राथमिकता दिन, ट्र्याक गर्न र समयमै पूरा गर्न सिक्नुहोस्...',
        enContent: 'Complete guide to managing your tasks efficiently...',
        author: 'Admin',
        date: '2024-01-10',
        readTime: 6,
        likes: 28,
        views: 650,
        difficulty: 'beginner',
        tags: ['tasks', 'productivity', 'management']
      },
      {
        id: 4,
        title: 'Understanding Reports',
        title_np: 'रिपोर्टहरू बुझ्दै',
        enTitle: 'Understanding Reports',
        category: 'reports',
        content: 'How to generate and interpret various reports. This guide explains all report types and their uses...',
        content_np: 'विभिन्न रिपोर्टहरू कसरी उत्पन्न र व्याख्या गर्ने। यो गाइडले सबै रिपोर्ट प्रकार र तिनीहरूको प्रयोगहरू व्याख्या गर्दछ...',
        enContent: 'How to generate and interpret various reports...',
        author: 'Analytics Team',
        date: '2024-01-15',
        readTime: 7,
        likes: 22,
        views: 540,
        difficulty: 'intermediate',
        tags: ['reports', 'analytics', 'data']
      },
      {
        id: 5,
        title: 'Improving Your Performance',
        title_np: 'तपाईंको प्रदर्शन सुधार गर्दै',
        enTitle: 'Improving Your Performance',
        category: 'performance',
        content: 'Tips and tricks to improve your performance metrics. Learn how to achieve better results and exceed targets...',
        content_np: 'तपाईंको प्रदर्शन मेट्रिक्स सुधार गर्न टिप्स र ट्रिक्स। कसरी राम्रो परिणाम प्राप्त गर्ने र लक्ष्यहरू भन्दा बढी गर्ने सिक्नुहोस्...',
        enContent: 'Tips and tricks to improve your performance metrics...',
        author: 'HR Team',
        date: '2024-01-20',
        readTime: 4,
        likes: 38,
        views: 720,
        difficulty: 'advanced',
        tags: ['performance', 'productivity', 'goals']
      }
    ];
  };

  // Get sample FAQs
  const getSampleFaqs = () => {
    return [
      {
        id: 1,
        question: 'How do I change my password?',
        question_np: 'म कसरी मेरो पासवर्ड परिवर्तन गर्छु?',
        enQuestion: 'How do I change my password?',
        answer: 'Go to Profile > Security Settings > Change Password. Enter your current password and new password, then click Save.',
        answer_np: 'प्रोफाइल > सुरक्षा सेटिङ्स > पासवर्ड परिवर्तन गर्नुहोस्। आफ्नो हालको पासवर्ड र नयाँ पासवर्ड प्रविष्ट गर्नुहोस्, त्यसपछि सुरक्षित गर्नुहोस् क्लिक गर्नुहोस्।',
        enAnswer: 'Go to Profile > Security Settings > Change Password...',
        category: 'getting-started',
        helpful: 45,
        notHelpful: 3
      },
      {
        id: 2,
        question: 'How to update complaint status?',
        question_np: 'गुनासो स्थिति कसरी अपडेट गर्ने?',
        enQuestion: 'How to update complaint status?',
        answer: 'Click on the complaint from the list, then select "Update Status" from the dropdown menu. Choose the new status and add any notes.',
        answer_np: 'सूचीबाट गुनासोमा क्लिक गर्नुहोस्, त्यसपछि ड्रपडाउन मेनुबाट "स्थिति अपडेट गर्नुहोस्" चयन गर्नुहोस्। नयाँ स्थिति छान्नुहोस् र कुनै नोटहरू थप्नुहोस्।',
        enAnswer: 'Click on the complaint from the list...',
        category: 'complaints',
        helpful: 38,
        notHelpful: 2
      }
    ];
  };

  // Get sample videos
  const getSampleVideos = () => {
    return [
      { id: 1, title: 'Staff Portal Overview', title_np: 'स्टाफ पोर्टल अवलोकन', duration: '5:30', thumbnail: '🎬', category: 'getting-started' },
      { id: 2, title: 'Handling Complaints Tutorial', title_np: 'गुनासो ह्यान्डलिङ ट्युटोरियल', duration: '8:15', thumbnail: '🎬', category: 'complaints' },
      { id: 3, title: 'Task Management Tips', title_np: 'कार्य व्यवस्थापन सुझावहरू', duration: '6:45', thumbnail: '🎬', category: 'tasks' }
    ];
  };

  // Get sample announcements
  const getSampleAnnouncements = () => {
    return [
      { id: 1, title: 'New Documentation Available', title_np: 'नयाँ कागजात उपलब्ध', date: '2024-01-25', type: 'info' },
      { id: 2, title: 'Video Tutorials Added', title_np: 'भिडियो ट्युटोरियलहरू थपियो', date: '2024-01-20', type: 'success' }
    ];
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
      fetchDocumentation();
      loadRecentlyViewed();
      loadBookmarks();
    }
  }, [navigate]);

  const loadRecentlyViewed = () => {
    const stored = localStorage.getItem('recentlyViewedDocs');
    if (stored) {
      setRecentlyViewed(JSON.parse(stored));
    }
  };

  const loadBookmarks = () => {
    const stored = localStorage.getItem('bookmarkedDocs');
    if (stored) {
      setBookmarkedArticles(JSON.parse(stored));
    }
  };

  const saveRecentlyViewed = (article) => {
    const updated = [article, ...recentlyViewed.filter(a => a.id !== article.id)].slice(0, 5);
    setRecentlyViewed(updated);
    localStorage.setItem('recentlyViewedDocs', JSON.stringify(updated));
  };

  const toggleBookmark = (article) => {
    let updated;
    if (bookmarkedArticles.find(a => a.id === article.id)) {
      updated = bookmarkedArticles.filter(a => a.id !== article.id);
    } else {
      updated = [article, ...bookmarkedArticles];
    }
    setBookmarkedArticles(updated);
    localStorage.setItem('bookmarkedDocs', JSON.stringify(updated));
  };

  const handleLike = (articleId) => {
    setDocumentation(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, likes: article.likes + 1 }
          : article
      )
    );
  };

  const openArticle = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
    saveRecentlyViewed(article);
    setDocumentation(prev =>
      prev.map(a =>
        a.id === article.id
          ? { ...a, views: a.views + 1 }
          : a
      )
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    document.body.style.overflow = 'unset';
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
    document.body.style.overflow = 'unset';
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  // Filter articles
  const filteredArticles = documentation.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.title_np && article.title_np.toLowerCase().includes(searchTerm.toLowerCase())) ||
      article.enTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.enContent.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.question_np && faq.question_np.toLowerCase().includes(searchTerm.toLowerCase())) ||
      faq.enQuestion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const content = {
    np: {
      pageTitle: 'कागजात र सहायता',
      documentation: 'कागजात',
      searchPlaceholder: 'कागजात, लेख वा FAQ खोज्नुहोस्...',
      categories: 'श्रेणीहरू',
      allCategories: 'सबै श्रेणीहरू',
      popularArticles: 'लोकप्रिय लेखहरू',
      recentlyViewed: 'हालै हेरिएका',
      bookmarks: 'बुकमार्कहरू',
      videoTutorials: 'भिडियो ट्युटोरियलहरू',
      announcements: 'घोषणाहरू',
      frequentlyAskedQuestions: 'बारम्बार सोधिने प्रश्नहरू',
      readMore: 'थप पढ्नुहोस्',
      minutes: 'मिनेट',
      views: 'पटक हेरिएको',
      likes: 'मन पराएको',
      author: 'लेखक',
      published: 'प्रकाशित',
      helpful: 'सहयोगी?',
      yes: 'हो',
      no: 'होइन',
      backToDocs: 'कागजातमा फर्कनुहोस्',
      loading: 'लोड हुँदै...',
      refresh: 'रिफ्रेस',
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      needMoreHelp: 'थप सहायता चाहियो?',
      contactSupport: 'सहयोग सम्पर्क गर्नुहोस्',
      bookmark: 'बुकमार्क',
      bookmarked: 'बुकमार्क गरियो',
      watchVideo: 'भिडियो हेर्नुहोस्',
      duration: 'अवधि',
      beginner: 'सुरुवात',
      intermediate: 'मध्यवर्ती',
      advanced: 'उन्नत',
      difficulty: 'कठिनाई',
      tags: 'ट्यागहरू',
      previous: 'अघिल्लो',
      next: 'अर्को',
      page: 'पृष्ठ',
      of: 'को',
      close: 'बन्द गर्नुहोस्'
    },
    en: {
      pageTitle: 'Documentation & Help',
      documentation: 'Documentation',
      searchPlaceholder: 'Search documentation, articles or FAQs...',
      categories: 'Categories',
      allCategories: 'All Categories',
      popularArticles: 'Popular Articles',
      recentlyViewed: 'Recently Viewed',
      bookmarks: 'Bookmarks',
      videoTutorials: 'Video Tutorials',
      announcements: 'Announcements',
      frequentlyAskedQuestions: 'Frequently Asked Questions',
      readMore: 'Read More',
      minutes: 'min read',
      views: 'views',
      likes: 'likes',
      author: 'Author',
      published: 'Published',
      helpful: 'Was this helpful?',
      yes: 'Yes',
      no: 'No',
      backToDocs: 'Back to Documentation',
      loading: 'Loading...',
      refresh: 'Refresh',
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      needMoreHelp: 'Need more help?',
      contactSupport: 'Contact Support',
      bookmark: 'Bookmark',
      bookmarked: 'Bookmarked',
      watchVideo: 'Watch Video',
      duration: 'Duration',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      difficulty: 'Difficulty',
      tags: 'Tags',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      close: 'Close'
    }
  };

  const t = content[language];

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    return language === 'np' ? category.name_np || category.name : category.name;
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '📄';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#64748b';
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
    <div className="staff-documentation">
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

            {/* Announcements Banner */}
            {announcements.length > 0 && (
              <div className="announcements-banner">
                <span className="announcement-icon">📢</span>
                <div className="announcement-content">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className={`announcement-item ${announcement.type}`}>
                      {language === 'np' ? announcement.title_np || announcement.title : announcement.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">{t.documentation}</h1>
              <button className="refresh-btn" onClick={fetchDocumentation}>
                🔄 {t.refresh}
              </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories Section */}
            <div className="categories-section">
              <h2>{t.categories}</h2>
              <div className="categories-grid">
                <button
                  className={`category-card ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                  style={{ '--category-color': '#0288d1' }}
                >
                  <span className="category-icon">📚</span>
                  <span className="category-name">{t.allCategories}</span>
                  <span className="category-count">{documentation.length}</span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{ '--category-color': category.color }}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{getCategoryName(category.id)}</span>
                    <span className="category-count">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recently Viewed Section */}
            {recentlyViewed.length > 0 && (
              <div className="recently-viewed-section">
                <h2>🕐 {t.recentlyViewed}</h2>
                <div className="recently-viewed-list">
                  {recentlyViewed.map(article => (
                    <button key={article.id} className="recent-item" onClick={() => openArticle(article)}>
                      <span>{language === 'np' ? article.title_np || article.title : article.title}</span>
                      <small>{article.date}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Section */}
            <div className="articles-section">
              <h2>{t.popularArticles}</h2>
              <div className="articles-grid">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="article-card" onClick={() => openArticle(article)}>
                    <div className="article-header">
                      <span className="article-category-badge" style={{ backgroundColor: getCategoryColor(article.category) }}>
                        {getCategoryIcon(article.category)} {getCategoryName(article.category)}
                      </span>
                      <span className="article-read-time">📖 {article.readTime} {t.minutes}</span>
                    </div>
                    <h3>{language === 'np' ? (article.title_np || article.title) : article.title}</h3>
                    <p>{language === 'np' ? (article.content_np || article.content).substring(0, 100) : article.content.substring(0, 100)}...</p>
                    <div className="article-footer">
                      <div className="article-stats">
                        <span>👁️ {article.views}</span>
                        <span>❤️ {article.likes}</span>
                      </div>
                      <button 
                        className={`bookmark-btn ${bookmarkedArticles.find(a => a.id === article.id) ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(article); }}
                      >
                        {bookmarkedArticles.find(a => a.id === article.id) ? '🔖' : '📑'}
                      </button>
                      <button className="read-more-btn">{t.readMore} →</button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredArticles.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>{language === 'np' ? 'कुनै लेख फेला परेन' : 'No articles found'}</p>
                </div>
              )}
            </div>

            {/* Video Tutorials Section */}
            <div className="videos-section">
              <h2>🎬 {t.videoTutorials}</h2>
              <div className="videos-grid">
                {videoTutorials.map((video) => (
                  <div key={video.id} className="video-card" onClick={() => openVideoModal(video)}>
                    <div className="video-thumbnail">
                      <span className="video-icon">🎬</span>
                      <span className="video-duration">{video.duration}</span>
                    </div>
                    <h4>{language === 'np' ? (video.title_np || video.title) : video.title}</h4>
                    <button className="watch-btn">▶ {t.watchVideo}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
              <h2>{t.frequentlyAskedQuestions}</h2>
              <div className="faq-list">
                {filteredFaqs.map((faq) => (
                  <details key={faq.id} className="faq-item">
                    <summary className="faq-question">
                      <span className="faq-icon">❓</span>
                      <span>{language === 'np' ? (faq.question_np || faq.question) : faq.question}</span>
                    </summary>
                    <div className="faq-answer">
                      <span className="faq-answer-icon">💡</span>
                      <span>{language === 'np' ? (faq.answer_np || faq.answer) : faq.answer}</span>
                    </div>
                    <div className="faq-helpful">
                      <span>{t.helpful}?</span>
                      <button className="helpful-btn yes" onClick={(e) => { e.stopPropagation(); }}>👍 {faq.helpful}</button>
                      <button className="helpful-btn no" onClick={(e) => { e.stopPropagation(); }}>👎 {faq.notHelpful}</button>
                    </div>
                  </details>
                ))}
              </div>
              {filteredFaqs.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">❓</span>
                  <p>{language === 'np' ? 'कुनै FAQ फेला परेन' : 'No FAQs found'}</p>
                </div>
              )}
            </div>

            {/* Need More Help Section */}
            <div className="help-section">
              <div className="help-card">
                <span className="help-icon">💬</span>
                <h3>{t.needMoreHelp}</h3>
                <p>{language === 'np' ? 'हाम्रो सहयोग टोली तपाईंको लागि यहाँ छ' : 'Our support team is here for you'}</p>
                <button className="contact-support-btn" onClick={() => navigate('/staff/contact')}>
                  📞 {t.contactSupport}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Modal */}
      {showModal && selectedArticle && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{language === 'np' ? (selectedArticle.title_np || selectedArticle.title) : selectedArticle.title}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="article-meta">
                <span>👤 {t.author}: {selectedArticle.author}</span>
                <span>📅 {t.published}: {selectedArticle.date}</span>
                <span>⏱️ {selectedArticle.readTime} {t.minutes}</span>
                <span className={`difficulty-badge ${selectedArticle.difficulty}`}>
                  {selectedArticle.difficulty === 'beginner' ? t.beginner :
                   selectedArticle.difficulty === 'intermediate' ? t.intermediate : t.advanced}
                </span>
              </div>
              <div className="article-tags">
                {selectedArticle.tags?.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
              <div className="article-content">
                <p>{language === 'np' ? (selectedArticle.content_np || selectedArticle.content) : selectedArticle.content}</p>
              </div>
              <div className="article-feedback">
                <p>{t.helpful}</p>
                <div className="feedback-buttons">
                  <button className="feedback-btn yes" onClick={() => handleLike(selectedArticle.id)}>
                    👍 {t.yes}
                  </button>
                  <button className="feedback-btn no">👎 {t.no}</button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeModal}>{t.backToDocs}</button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="modal-overlay" onClick={closeVideoModal}>
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎬 {language === 'np' ? (selectedVideo.title_np || selectedVideo.title) : selectedVideo.title}</h2>
              <button className="modal-close" onClick={closeVideoModal}>✕</button>
            </div>
            <div className="modal-body video-body">
              <div className="video-player">
                <div className="video-placeholder">
                  <span className="video-play-icon">▶</span>
                  <p>{t.watchVideo}: {selectedVideo.title}</p>
                  <small>{t.duration}: {selectedVideo.duration}</small>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeVideoModal}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .staff-documentation {
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

        .announcements-banner {
          background: linear-gradient(135deg, #fef3c7, #fffbeb);
          border: 1px solid #fde68a;
          border-radius: 12px;
          padding: 12px 20px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .announcement-icon {
          font-size: 1.3rem;
        }

        .announcement-content {
          flex: 1;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .announcement-item {
          font-size: 0.85rem;
          color: #92400e;
        }

        .announcement-item.info { color: #1e40af; }
        .announcement-item.success { color: #166534; }
        .announcement-item.warning { color: #92400e; }

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

        .search-bar {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 12px 20px;
          margin-bottom: 24px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          font-size: 1.2rem;
          color: #94a3b8;
          margin-right: 12px;
        }

        .search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.95rem;
          background: transparent;
        }

        .categories-section, .articles-section, .videos-section, .faq-section, .help-section, .recently-viewed-section {
          margin-bottom: 32px;
        }

        .categories-section h2, .articles-section h2, .videos-section h2, .faq-section h2, .recently-viewed-section h2 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
          padding-left: 12px;
          border-left: 3px solid #0288d1;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }

        .category-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .category-card.active {
          border-color: var(--category-color, #0288d1);
          background: linear-gradient(135deg, #f0f9ff, #ffffff);
        }

        .category-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 8px;
        }

        .category-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: #0f172a;
        }

        .category-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #0288d1;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 20px;
        }

        .recently-viewed-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .recent-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          padding: 8px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .recent-item:hover {
          background: #f8fafc;
          border-color: #0288d1;
        }

        .recent-item small {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .article-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .article-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .article-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .article-category-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          color: white;
        }

        .article-read-time {
          font-size: 0.7rem;
          color: #64748b;
        }

        .article-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .article-card p {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.4;
          margin-bottom: 16px;
        }

        .article-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .article-stats {
          display: flex;
          gap: 12px;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .bookmark-btn {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          padding: 4px;
        }

        .bookmark-btn.active {
          color: #f59e0b;
        }

        .read-more-btn {
          background: none;
          border: none;
          color: #0288d1;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
        }

        .videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .video-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .video-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .video-thumbnail {
          position: relative;
          margin-bottom: 12px;
        }

        .video-icon {
          font-size: 3rem;
          display: block;
        }

        .video-duration {
          position: absolute;
          bottom: 0;
          right: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .video-card h4 {
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .watch-btn {
          background: linear-gradient(135deg, #0288d1, #0277bd);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .faq-question {
          padding: 16px 20px;
          background: #f8fafc;
          font-weight: 600;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          list-style: none;
        }

        .faq-question::-webkit-details-marker {
          display: none;
        }

        .faq-question::after {
          content: '▼';
          margin-left: auto;
          font-size: 0.8rem;
          transition: transform 0.2s;
        }

        details[open] .faq-question::after {
          transform: rotate(180deg);
        }

        .faq-icon {
          font-size: 1.2rem;
        }

        .faq-answer {
          padding: 16px 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #475569;
          line-height: 1.5;
        }

        .faq-answer-icon {
          font-size: 1rem;
        }

        .faq-helpful {
          padding: 12px 20px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.75rem;
          flex-wrap: wrap;
        }

        .helpful-btn {
          padding: 4px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.7rem;
          border: none;
          transition: all 0.2s;
        }

        .helpful-btn.yes {
          background: #d1fae5;
          color: #059669;
        }

        .helpful-btn.no {
          background: #fee2e2;
          color: #dc2626;
        }

        .helpful-btn:hover {
          transform: scale(1.05);
        }

        .help-section {
          margin-top: 32px;
        }

        .help-card {
          background: linear-gradient(135deg, #0288d1, #0277bd);
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          color: white;
        }

        .help-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

        .help-card h3 {
          font-size: 1.3rem;
          margin-bottom: 8px;
        }

        .help-card p {
          margin-bottom: 20px;
          opacity: 0.9;
        }

        .contact-support-btn {
          background: white;
          color: #0288d1;
          border: none;
          padding: 10px 24px;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .contact-support-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .empty-state {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 12px;
        }

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
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 700px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .video-modal {
          max-width: 600px;
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
          border-radius: 20px 20px 0 0;
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
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: #ef4444;
        }

        .modal-body {
          padding: 24px;
        }

        .article-meta {
          display: flex;
          gap: 20px;
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.8rem;
          color: #64748b;
          flex-wrap: wrap;
          align-items: center;
        }

        .difficulty-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .difficulty-badge.beginner { background: #d1fae5; color: #059669; }
        .difficulty-badge.intermediate { background: #fef3c7; color: #d97706; }
        .difficulty-badge.advanced { background: #fee2e2; color: #dc2626; }

        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .tag {
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          color: #475569;
        }

        .article-content {
          line-height: 1.6;
          color: #334155;
        }

        .article-content p {
          margin-bottom: 16px;
        }

        .article-feedback {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .feedback-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 12px;
        }

        .feedback-btn {
          padding: 6px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
        }

        .feedback-btn.yes {
          background: #d1fae5;
          color: #059669;
        }

        .feedback-btn.no {
          background: #fee2e2;
          color: #dc2626;
        }

        .feedback-btn:hover {
          transform: scale(1.05);
        }

        .video-body {
          text-align: center;
        }

        .video-player {
          background: #0f172a;
          border-radius: 12px;
          padding: 60px;
          margin-bottom: 16px;
        }

        .video-placeholder {
          color: white;
        }

        .video-play-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          border-radius: 0 0 20px 20px;
        }

        .btn-close {
          padding: 8px 24px;
          background: #e2e8f0;
          color: #475569;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #cbd5e1;
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
          
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .articles-grid, .videos-grid {
            grid-template-columns: 1fr;
          }
          
          .article-meta {
            flex-direction: column;
            gap: 8px;
          }
          
          .recently-viewed-list {
            flex-direction: column;
          }
          
          .announcements-banner {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffDocumentation;