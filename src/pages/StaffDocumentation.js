// src/pages/StaffDocumentation.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';

const StaffDocumentation = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const searchInputRef = useRef(null);

  const [staffData, setStaffData] = useState({
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: ''
  });

  // Documentation data - static content
  const documentation = [
    {
      id: 1,
      title: 'स्टाफ पोर्टल सुरु गर्दै',
      enTitle: 'Getting Started with Staff Portal',
      category: 'getting-started',
      content: 'स्टाफ पोर्टल प्रभावकारी रूपमा नेभिगेट गर्न र प्रयोग गर्न सिक्नुहोस्। यो व्यापक गाइडले लगइनदेखि उन्नत सुविधाहरू सम्म सबै कुरा समावेश गर्दछ। ड्यासबोर्ड नेभिगेसन, गुनासो व्यवस्थापन, र रिपोर्टिङ उपकरणहरू सहित सबै कुरा कभर गरिएको छ।',
      enContent: 'Learn how to navigate and use the staff portal effectively. This comprehensive guide covers everything from login to advanced features including dashboard navigation, complaint management, and reporting tools.',
      author: 'प्रशासक',
      enAuthor: 'Admin',
      date: '2024-01-01',
      readTime: 5,
      likes: 45,
      views: 1200,
      difficulty: 'beginner',
      tags: ['गाइड', 'ट्युटोरियल', 'आधारभूत'],
      featured: true
    },
    {
      id: 2,
      title: 'गुनासो कसरी ह्यान्डल गर्ने',
      enTitle: 'How to Handle Complaints',
      category: 'complaints',
      content: 'ग्राहक गुनासो प्रभावकारी रूपमा व्यवस्थापन र समाधान गर्न चरण-दर-चरण गाइड। गुनासो समाधानको लागि उत्तम अभ्यासहरू, संचार रणनीतिहरू, र पालना प्रक्रियाहरू सिक्नुहोस्।',
      enContent: 'Step-by-step guide to managing and resolving customer complaints efficiently. Learn best practices for complaint resolution, communication strategies, and follow-up procedures.',
      author: 'सहायता टोली',
      enAuthor: 'Support Team',
      date: '2024-01-05',
      readTime: 8,
      likes: 32,
      views: 890,
      difficulty: 'intermediate',
      tags: ['गुनासो', 'समाधान', 'ग्राहक सेवा'],
      featured: true
    },
    {
      id: 3,
      title: 'कार्य व्यवस्थापन गाइड',
      enTitle: 'Task Management Guide',
      category: 'tasks',
      content: 'तपाईंको कार्यहरू प्रभावकारी रूपमा व्यवस्थापन गर्न पूर्ण गाइड। कार्यहरूलाई प्राथमिकता दिन, ट्र्याक गर्न र समयमै पूरा गर्न सिक्नुहोस्। कार्य व्यवस्थापन प्रणालीको पूर्ण उपयोग गर्नुहोस्।',
      enContent: 'Complete guide to managing your tasks efficiently. Learn how to prioritize, track, and complete tasks on time using the task management system.',
      author: 'प्रशासक',
      enAuthor: 'Admin',
      date: '2024-01-10',
      readTime: 6,
      likes: 28,
      views: 650,
      difficulty: 'beginner',
      tags: ['कार्य', 'उत्पादकता', 'व्यवस्थापन'],
      featured: false
    },
    {
      id: 4,
      title: 'रिपोर्टहरू बुझ्दै',
      enTitle: 'Understanding Reports',
      category: 'reports',
      content: 'विभिन्न रिपोर्टहरू कसरी उत्पन्न र व्याख्या गर्ने। यो गाइडले सबै रिपोर्ट प्रकार र तिनीहरूको प्रयोगहरू व्याख्या गर्दछ। दैनिक, साप्ताहिक, मासिक, र अनुकूलन रिपोर्टहरू समावेश छन्।',
      enContent: 'How to generate and interpret various reports. This guide explains all report types and their uses, including daily, weekly, monthly, and custom reports.',
      author: 'विश्लेषण टोली',
      enAuthor: 'Analytics Team',
      date: '2024-01-15',
      readTime: 7,
      likes: 22,
      views: 540,
      difficulty: 'intermediate',
      tags: ['रिपोर्ट', 'विश्लेषण', 'डाटा'],
      featured: false
    },
    {
      id: 5,
      title: 'तपाईंको प्रदर्शन सुधार गर्दै',
      enTitle: 'Improving Your Performance',
      category: 'performance',
      content: 'तपाईंको प्रदर्शन मेट्रिक्स सुधार गर्न टिप्स र ट्रिक्स। कसरी राम्रो परिणाम प्राप्त गर्ने र लक्ष्यहरू भन्दा बढी गर्ने सिक्नुहोस्। प्रमाणित रणनीतिहरूको साथ आफ्नो प्रदर्शन बढाउनुहोस्।',
      enContent: 'Tips and tricks to improve your performance metrics. Learn how to achieve better results and exceed targets with proven strategies.',
      author: 'मानव संसाधन टोली',
      enAuthor: 'HR Team',
      date: '2024-01-20',
      readTime: 4,
      likes: 38,
      views: 720,
      difficulty: 'advanced',
      tags: ['प्रदर्शन', 'उत्पादकता', 'लक्ष्य'],
      featured: true
    },
    {
      id: 6,
      title: 'ग्राहक सेवा उत्कृष्ट अभ्यासहरू',
      enTitle: 'Customer Service Best Practices',
      category: 'complaints',
      content: 'उत्कृष्ट ग्राहक सेवा प्रदान गर्नका लागि आवश्यक सीप र प्रविधिहरू। प्रभावकारी संचार, समस्या समाधान, र ग्राहक सन्तुष्टि बढाउने तरिकाहरू सिक्नुहोस्।',
      enContent: 'Essential skills and techniques for providing excellent customer service. Learn effective communication, problem-solving, and ways to increase customer satisfaction.',
      author: 'प्रशिक्षण टोली',
      enAuthor: 'Training Team',
      date: '2024-01-25',
      readTime: 10,
      likes: 55,
      views: 1500,
      difficulty: 'beginner',
      tags: ['ग्राहक सेवा', 'संचार', 'सीप'],
      featured: true
    },
    {
      id: 7,
      title: 'डाटा सुरक्षा र गोपनीयता',
      enTitle: 'Data Security and Privacy',
      category: 'getting-started',
      content: 'प्रणालीमा डाटा सुरक्षा र गोपनीयता कायम राख्नका लागि महत्वपूर्ण दिशानिर्देशहरू। पासवर्ड व्यवस्थापन, डाटा ह्यान्डलिङ, र सुरक्षा सर्वोत्तम अभ्यासहरू।',
      enContent: 'Important guidelines for maintaining data security and privacy in the system. Password management, data handling, and security best practices.',
      author: 'आईटी टोली',
      enAuthor: 'IT Team',
      date: '2024-01-28',
      readTime: 6,
      likes: 42,
      views: 980,
      difficulty: 'intermediate',
      tags: ['सुरक्षा', 'गोपनीयता', 'डाटा'],
      featured: false
    },
    {
      id: 8,
      title: 'टोली सहकार्य उपकरणहरू',
      enTitle: 'Team Collaboration Tools',
      category: 'tasks',
      content: 'टोलीमा प्रभावकारी सहकार्यको लागि उपलब्ध उपकरण र प्रविधिहरूको बारेमा जान्नुहोस्। सन्देश, फाइल साझेदारी, र संयुक्त कार्य प्रवाहहरूको उपयोग गर्नुहोस्।',
      enContent: 'Learn about available tools and techniques for effective team collaboration. Utilize messaging, file sharing, and collaborative workflows.',
      author: 'प्रबन्धक',
      enAuthor: 'Manager',
      date: '2024-02-01',
      readTime: 5,
      likes: 30,
      views: 600,
      difficulty: 'beginner',
      tags: ['सहकार्य', 'टोली', 'संचार'],
      featured: false
    }
  ];

  const categories = [
    { id: 'getting-started', name: 'सुरु गर्दै', enName: 'Getting Started', icon: '🚀', color: '#3b82f6', count: 3 },
    { id: 'complaints', name: 'गुनासो व्यवस्थापन', enName: 'Complaint Management', icon: '📋', color: '#10b981', count: 2 },
    { id: 'tasks', name: 'कार्य व्यवस्थापन', enName: 'Task Management', icon: '✅', color: '#f59e0b', count: 2 },
    { id: 'reports', name: 'रिपोर्ट र विश्लेषण', enName: 'Reports & Analytics', icon: '📊', color: '#8b5cf6', count: 1 },
    { id: 'performance', name: 'प्रदर्शन', enName: 'Performance', icon: '⭐', color: '#ec4899', count: 1 }
  ];

  const faqs = [
    {
      id: 1,
      question: 'म कसरी मेरो पासवर्ड परिवर्तन गर्छु?',
      enQuestion: 'How do I change my password?',
      answer: 'प्रोफाइल > सुरक्षा सेटिङ्स > पासवर्ड परिवर्तन गर्नुहोस्। आफ्नो हालको पासवर्ड र नयाँ पासवर्ड प्रविष्ट गर्नुहोस्, त्यसपछि सुरक्षित गर्नुहोस् क्लिक गर्नुहोस्। नयाँ पासवर्ड कम्तिमा ६ क्यारेक्टर लामो हुनुपर्छ।',
      enAnswer: 'Go to Profile > Security Settings > Change Password. Enter your current password and new password, then click Save. Make sure your new password is at least 6 characters long.',
      category: 'getting-started',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: 2,
      question: 'गुनासो स्थिति कसरी अपडेट गर्ने?',
      enQuestion: 'How to update complaint status?',
      answer: 'सूचीबाट गुनासोमा क्लिक गर्नुहोस्, त्यसपछि ड्रपडाउन मेनुबाट "स्थिति अपडेट गर्नुहोस्" चयन गर्नुहोस्। नयाँ स्थिति छान्नुहोस् र कुनै नोटहरू वा समाधान विवरणहरू थप्नुहोस्।',
      enAnswer: 'Click on the complaint from the list, then select "Update Status" from the dropdown menu. Choose the new status and add any notes or resolution details before saving.',
      category: 'complaints',
      helpful: 38,
      notHelpful: 2
    },
    {
      id: 3,
      question: 'रिपोर्ट कसरी उत्पन्न गर्ने?',
      enQuestion: 'How to generate reports?',
      answer: 'रिपोर्ट सेक्सनमा जानुहोस्, रिपोर्ट प्रकार चयन गर्नुहोस्, मिति दायरा छान्नुहोस्, र "रिपोर्ट उत्पन्न गर्नुहोस्" क्लिक गर्नुहोस्। तपाईं रिपोर्टहरू PDF, Excel, वा CSV ढाँचामा निर्यात गर्न सक्नुहुन्छ।',
      enAnswer: 'Navigate to Reports section, select the report type, choose date range, and click "Generate Report". You can export reports in PDF, Excel, or CSV format.',
      category: 'reports',
      helpful: 30,
      notHelpful: 1
    },
    {
      id: 4,
      question: 'म कसरी आफ्नो प्रोफाइल अपडेट गर्छु?',
      enQuestion: 'How do I update my profile?',
      answer: 'सेटिङ्स > प्रोफाइलमा जानुहोस्। आफ्नो नाम, इमेल, फोन नम्बर र अन्य व्यक्तिगत जानकारी अपडेट गर्नुहोस्। परिवर्तनहरू सुरक्षित गर्न "अपडेट गर्नुहोस्" क्लिक गर्नुहोस्।',
      enAnswer: 'Go to Settings > Profile. Update your name, email, phone number and other personal information. Click "Update" to save changes.',
      category: 'getting-started',
      helpful: 50,
      notHelpful: 4
    },
    {
      id: 5,
      question: 'कार्य कसरी सिर्जना गर्ने?',
      enQuestion: 'How to create a task?',
      answer: 'ड्यासबोर्डमा "नयाँ कार्य" क्लिक गर्नुहोस्। शीर्षक, विवरण, प्राथमिकता, र म्याद थप्नुहोस्। कार्य सिर्जना गर्न "पुष्टि गर्नुहोस्" क्लिक गर्नुहोस्।',
      enAnswer: 'Click "New Task" on the dashboard. Add title, description, priority, and due date. Click "Confirm" to create the task.',
      category: 'tasks',
      helpful: 28,
      notHelpful: 2
    }
  ];

  const videoTutorials = [
    { id: 1, title: 'स्टाफ पोर्टल अवलोकन', enTitle: 'Staff Portal Overview', duration: '5:30', thumbnail: '🎬', category: 'getting-started', views: 1250 },
    { id: 2, title: 'गुनासो ह्यान्डलिङ ट्युटोरियल', enTitle: 'Handling Complaints Tutorial', duration: '8:15', thumbnail: '🎬', category: 'complaints', views: 890 },
    { id: 3, title: 'कार्य व्यवस्थापन सुझावहरू', enTitle: 'Task Management Tips', duration: '6:45', thumbnail: '🎬', category: 'tasks', views: 650 },
    { id: 4, title: 'प्रदर्शन मूल्यांकन गाइड', enTitle: 'Performance Review Guide', duration: '7:00', thumbnail: '🎬', category: 'performance', views: 430 }
  ];

  const announcements = [
    { id: 1, title: 'नयाँ कागजात उपलब्ध', enTitle: 'New Documentation Available', date: '2024-01-25', type: 'info' },
    { id: 2, title: 'भिडियो ट्युटोरियलहरू थपियो', enTitle: 'Video Tutorials Added', date: '2024-01-20', type: 'success' },
    { id: 3, title: 'प्रणाली अपडेट आउँदै', enTitle: 'System Update Coming Soon', date: '2024-02-01', type: 'warning' }
  ];

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

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

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const user = localStorage.getItem('staffUser');
    
    if (!token || !user) {
      navigate('/');
    } else {
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
      showToast(language === 'np' ? '📑 बुकमार्क हटाइयो' : '📑 Bookmark removed', 'info');
    } else {
      updated = [article, ...bookmarkedArticles];
      showToast(language === 'np' ? '🔖 बुकमार्क थपियो' : '🔖 Bookmark added', 'success');
    }
    setBookmarkedArticles(updated);
    localStorage.setItem('bookmarkedDocs', JSON.stringify(updated));
  };

  const handleLike = (articleId) => {
    showToast(language === 'np' ? '❤️ धन्यवाद! तपाईंको प्रतिक्रिया दर्ता भयो' : '❤️ Thanks! Your feedback recorded', 'success');
  };

  const openArticle = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
    saveRecentlyViewed(article);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    document.body.style.overflow = 'unset';
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
    document.body.style.overflow = 'hidden';
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

  // Get articles to display based on filters and sorting
  const getArticlesToDisplay = () => {
    let articles = [...documentation];
    
    if (selectedCategory !== 'all') {
      articles = articles.filter(article => article.category === selectedCategory);
    }
    
    if (showBookmarksOnly) {
      articles = articles.filter(article => bookmarkedArticles.find(a => a.id === article.id));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(term) ||
        article.enTitle.toLowerCase().includes(term) ||
        article.content.toLowerCase().includes(term) ||
        article.enContent.toLowerCase().includes(term)
      );
    }
    
    if (sortBy === 'popular') {
      articles.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'newest') {
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      articles.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'mostLiked') {
      articles.sort((a, b) => b.likes - a.likes);
    }
    
    return articles;
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.enQuestion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const articlesToDisplay = getArticlesToDisplay();

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
      welcome: 'स्वागत छ',
      dashboard: 'ड्यासबोर्ड',
      bookmark: 'बुकमार्क',
      bookmarked: 'बुकमार्क गरियो',
      watchVideo: 'भिडियो हेर्नुहोस्',
      duration: 'अवधि',
      beginner: 'सुरुवात',
      intermediate: 'मध्यवर्ती',
      advanced: 'उन्नत',
      difficulty: 'कठिनाई',
      tags: 'ट्यागहरू',
      close: 'बन्द गर्नुहोस्',
      showBookmarks: 'बुकमार्क देखाउनुहोस्',
      showAll: 'सबै देखाउनुहोस्',
      sortBy: 'क्रमबद्ध गर्नुहोस्',
      popular: 'लोकप्रिय',
      newest: 'नयाँ',
      oldest: 'पुरानो',
      mostLiked: 'सबैभन्दा मनपराइएको',
      clearSearch: 'खोजी सफा गर्नुहोस्',
      noResults: 'कुनै परिणाम फेला परेन',
      tryDifferentSearch: 'कृपया फरक खोजी शब्द प्रयास गर्नुहोस्',
      featured: 'विशेष',
      videoViews: 'पटक हेरिएको'
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
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      bookmark: 'Bookmark',
      bookmarked: 'Bookmarked',
      watchVideo: 'Watch Video',
      duration: 'Duration',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      difficulty: 'Difficulty',
      tags: 'Tags',
      close: 'Close',
      showBookmarks: 'Show Bookmarks',
      showAll: 'Show All',
      sortBy: 'Sort By',
      popular: 'Most Popular',
      newest: 'Newest First',
      oldest: 'Oldest First',
      mostLiked: 'Most Liked',
      clearSearch: 'Clear Search',
      noResults: 'No results found',
      tryDifferentSearch: 'Please try a different search term',
      featured: 'Featured',
      videoViews: 'views'
    }
  };

  const t = content[language];

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    return language === 'np' ? category.name : category.enName;
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '📄';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#64748b';
  };

  return (
    <div className="staff-documentation">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

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
            {/* Announcements Banner */}
            {announcements.length > 0 && (
              <div className="announcements-banner">
                <span className="announcement-icon">📢</span>
                <div className="announcement-content">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className={`announcement-item ${announcement.type}`}>
                      {language === 'np' ? announcement.title : announcement.enTitle}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">📚 {t.documentation}</h1>
                <p className="page-subtitle">
                  {language === 'np' 
                    ? 'उत्तर, गाइड, र सफलताका लागि स्रोतहरू खोज्नुहोस्' 
                    : 'Find answers, guides, and resources to help you succeed'}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  ✕
                </button>
              )}
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

            {/* Filters and Sorting Bar */}
            <div className="filters-bar">
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${!showBookmarksOnly ? 'active' : ''}`}
                  onClick={() => setShowBookmarksOnly(false)}
                >
                  📄 {t.showAll}
                </button>
                <button 
                  className={`filter-btn ${showBookmarksOnly ? 'active' : ''}`}
                  onClick={() => setShowBookmarksOnly(true)}
                >
                  🔖 {t.showBookmarks} ({bookmarkedArticles.length})
                </button>
              </div>
              <div className="sort-dropdown">
                <label>{t.sortBy}:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popular">{t.popular}</option>
                  <option value="newest">{t.newest}</option>
                  <option value="oldest">{t.oldest}</option>
                  <option value="mostLiked">{t.mostLiked}</option>
                </select>
              </div>
            </div>

            {/* Recently Viewed Section */}
            {recentlyViewed.length > 0 && !showBookmarksOnly && (
              <div className="recently-viewed-section">
                <h2>🕐 {t.recentlyViewed}</h2>
                <div className="recently-viewed-list">
                  {recentlyViewed.map(article => {
                    const articleData = documentation.find(d => d.id === article.id);
                    if (!articleData) return null;
                    return (
                      <button key={article.id} className="recent-item" onClick={() => openArticle(articleData)}>
                        <span className="recent-icon">📄</span>
                        <span>{language === 'np' ? articleData.title : articleData.enTitle}</span>
                        <small>{articleData.date}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Articles Section */}
            <div className="articles-section">
              <h2>{showBookmarksOnly ? t.bookmarks : t.popularArticles}</h2>
              <div className="articles-grid">
                {articlesToDisplay.map((article) => (
                  <div key={article.id} className={`article-card ${article.featured ? 'featured' : ''}`} onClick={() => openArticle(article)}>
                    {article.featured && <span className="featured-badge">⭐ {t.featured}</span>}
                    <div className="article-header">
                      <span className="article-category-badge" style={{ backgroundColor: getCategoryColor(article.category) }}>
                        {getCategoryIcon(article.category)} {getCategoryName(article.category)}
                      </span>
                      <span className="article-read-time">📖 {article.readTime} {t.minutes}</span>
                    </div>
                    <h3>{language === 'np' ? article.title : article.enTitle}</h3>
                    <p>{language === 'np' ? article.content.substring(0, 120) : article.enContent.substring(0, 120)}...</p>
                    <div className="article-footer">
                      <div className="article-stats">
                        <span>👁️ {article.views}</span>
                        <span>❤️ {article.likes}</span>
                      </div>
                      <div className="article-actions">
                        <button 
                          className={`bookmark-btn ${bookmarkedArticles.find(a => a.id === article.id) ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(article); }}
                          title={bookmarkedArticles.find(a => a.id === article.id) ? t.bookmarked : t.bookmark}
                        >
                          {bookmarkedArticles.find(a => a.id === article.id) ? '🔖' : '📑'}
                        </button>
                        <button className="read-more-btn">{t.readMore} →</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {articlesToDisplay.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>{t.noResults}</p>
                  <small>{t.tryDifferentSearch}</small>
                  {searchTerm && (
                    <button className="clear-search-btn-empty" onClick={() => setSearchTerm('')}>
                      {t.clearSearch}
                    </button>
                  )}
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
                    <h4>{language === 'np' ? video.title : video.enTitle}</h4>
                    <div className="video-stats">
                      <span>👁️ {video.views} {t.videoViews}</span>
                    </div>
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
                      <span>{language === 'np' ? faq.question : faq.enQuestion}</span>
                    </summary>
                    <div className="faq-answer">
                      <span className="faq-answer-icon">💡</span>
                      <span>{language === 'np' ? faq.answer : faq.enAnswer}</span>
                    </div>
                    <div className="faq-helpful">
                      <span>{t.helpful}?</span>
                      <button className="helpful-btn yes" onClick={(e) => { e.stopPropagation(); showToast(t.yes, 'success'); }}>👍 {faq.helpful}</button>
                      <button className="helpful-btn no" onClick={(e) => { e.stopPropagation(); showToast(t.no, 'info'); }}>👎 {faq.notHelpful}</button>
                    </div>
                  </details>
                ))}
              </div>
              {filteredFaqs.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">❓</span>
                  <p>{t.noResults}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article Modal */}
      {showModal && selectedArticle && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{language === 'np' ? selectedArticle.title : selectedArticle.enTitle}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="article-meta">
                <span>👤 {t.author}: {language === 'np' ? selectedArticle.author : selectedArticle.enAuthor}</span>
                <span>📅 {t.published}: {selectedArticle.date}</span>
                <span>⏱️ {selectedArticle.readTime} {t.minutes}</span>
                <span className={`difficulty-badge ${selectedArticle.difficulty}`}>
                  {selectedArticle.difficulty === 'beginner' ? t.beginner :
                   selectedArticle.difficulty === 'intermediate' ? t.intermediate : t.advanced}
                </span>
              </div>
              <div className="article-tags">
                {selectedArticle.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
              <div className="article-content">
                <p>{language === 'np' ? selectedArticle.content : selectedArticle.enContent}</p>
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
              <button 
                className={`bookmark-modal-btn ${bookmarkedArticles.find(a => a.id === selectedArticle.id) ? 'active' : ''}`}
                onClick={() => toggleBookmark(selectedArticle)}
              >
                {bookmarkedArticles.find(a => a.id === selectedArticle.id) ? '🔖 ' + t.bookmarked : '📑 ' + t.bookmark}
              </button>
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
              <h2>🎬 {language === 'np' ? selectedVideo.title : selectedVideo.enTitle}</h2>
              <button className="modal-close" onClick={closeVideoModal}>✕</button>
            </div>
            <div className="modal-body video-body">
              <div className="video-player">
                <div className="video-placeholder">
                  <span className="video-play-icon">▶</span>
                  <p>{t.watchVideo}: {language === 'np' ? selectedVideo.title : selectedVideo.enTitle}</p>
                  <small>{t.duration}: {selectedVideo.duration}</small>
                  <div className="video-actions">
                    <button className="watch-now-btn">
                      ▶ {t.watchVideo}
                    </button>
                  </div>
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

        .toast-notification {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 2000;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: slideInRight 0.3s ease;
          max-width: 350px;
        }

        .toast-notification.success { border-left: 4px solid #10b981; background: #ecfdf5; }
        .toast-notification.error { border-left: 4px solid #ef4444; background: #fef2f2; }
        .toast-notification.info { border-left: 4px solid #3b82f6; background: #eff6ff; }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.85rem;
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

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.95rem;
          background: transparent;
        }

        .search-input:focus {
          outline: none;
        }

        .clear-search-btn {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px 8px;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .clear-search-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .filter-buttons {
          display: flex;
          gap: 12px;
        }

        .filter-btn {
          padding: 6px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
        }

        .filter-btn.active {
          background: #0288d1;
          color: white;
          border-color: #0288d1;
        }

        .sort-dropdown {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-dropdown label {
          font-size: 0.8rem;
          color: #64748b;
        }

        .sort-dropdown select {
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
        }

        .categories-section, .articles-section, .videos-section, .faq-section, .recently-viewed-section {
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
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
          display: inline-block;
          background: #e2e8f0;
          color: #475569;
          font-size: 0.7rem;
          padding: 1px 8px;
          border-radius: 20px;
          margin-top: 4px;
        }

        .category-card.active .category-count {
          background: #0288d1;
          color: white;
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
          transform: translateX(4px);
        }

        .recent-icon {
          font-size: 1rem;
        }

        .recent-item small {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .article-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .article-card.featured {
          border: 2px solid #f59e0b;
          background: linear-gradient(135deg, #ffffff, #fffbeb);
        }

        .article-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .featured-badge {
          position: absolute;
          top: -10px;
          right: 12px;
          background: #f59e0b;
          color: white;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
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

        .article-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bookmark-btn {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          padding: 4px;
          transition: all 0.2s;
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
          transition: all 0.2s;
        }

        .read-more-btn:hover {
          transform: translateX(4px);
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
          margin-bottom: 8px;
        }

        .video-stats {
          font-size: 0.7rem;
          color: #94a3b8;
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
          transition: all 0.2s;
        }

        .watch-btn:hover {
          transform: scale(1.05);
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
          transition: all 0.2s;
        }

        .faq-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
          transition: background 0.2s;
        }

        .faq-question:hover {
          background: #f1f5f9;
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

        .clear-search-btn-empty {
          margin-top: 12px;
          padding: 6px 16px;
          background: #e2e8f0;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .clear-search-btn-empty:hover {
          background: #cbd5e1;
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

        .video-actions {
          margin-top: 16px;
        }

        .watch-now-btn {
          padding: 8px 24px;
          background: #0288d1;
          color: white;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .watch-now-btn:hover {
          background: #0277bd;
          transform: scale(1.05);
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-radius: 0 0 20px 20px;
          flex-wrap: wrap;
        }

        .bookmark-modal-btn {
          padding: 8px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .bookmark-modal-btn.active {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #d97706;
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
          .staff-documentation {
            height: auto;
            overflow: auto;
          }
          
          .dashboard-layout {
            flex-direction: column;
            height: auto;
            margin-top: 150px;
            overflow: visible;
          }
          
          .main-content {
            margin-left: 0;
            width: 100%;
            overflow-y: visible;
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
          
          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-buttons {
            justify-content: center;
          }
          
          .sort-dropdown {
            justify-content: center;
          }
          
          .article-card {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .categories-grid {
            grid-template-columns: 1fr;
          }
          
          .content-wrapper {
            padding: 12px;
          }
          
          .modal-content {
            max-width: 95%;
            margin: 10px;
          }
          
          .modal-header h2 {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffDocumentation;