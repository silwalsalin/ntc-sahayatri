// src/pages/ComplaintRegarding.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Try to import local images with fallback
let ntcLogo, govLogo;
try {
  ntcLogo = require('../img/ntc-logo.png');
} catch (e) {
  ntcLogo = null;
}
try {
  govLogo = require('../img/logo.png');
} catch (e) {
  govLogo = null;
}

const ComplaintRegarding = () => {
  const navigate = useNavigate();
  
  // Language state
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Success modal state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Reference number for tracking
  const [referenceNumber, setReferenceNumber] = useState('');
  
  // Character count for description
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const maxDescriptionChars = 2000;
  const minDescriptionChars = 20;
  
  // Form submission attempt flag
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // State for complaint form
  const [formData, setFormData] = useState({
    complaintType: '',
    subject: '',
    description: '',
    priority: 'medium',
    name: '',
    email: '',
    phone: '',
    address: '',
    landmark: '',
    preferredContact: 'phone'
  });

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // File input ref
  const fileInputRef = useRef(null);
  
  // API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Generate reference number
  const generateReferenceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const ref = `REF-${year}${month}${day}${hours}${minutes}${seconds}-${random}`;
    setReferenceNumber(ref);
  };

  useEffect(() => {
    generateReferenceNumber();
  }, []);

  // Show toast notification
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, duration);
  }, []);

  // Subject options based on complaint type
  const getSubjectOptions = () => {
    const commonSubjects = {
      np: {
        service: [
          'इन्टरनेट जडान समस्या', 
          'फोन कल ड्रप हुने', 
          'ढिलो इन्टरनेट स्पीड', 
          'सेवा नभएको', 
          'सेवा विच्छेद',
          'नयाँ जडानको लागि अनुरोध',
          'सेवा स्थानान्तरण',
          'सेवा स्तरको गुणस्तर'
        ],
        billing: [
          'बढी बिल आएको', 
          'बिल नआएको', 
          'रिचार्ज नभएको', 
          'पैसा कट्टी भएको', 
          'डबल चार्ज',
          'बिल विवरणमा त्रुटि',
          'अटो रिचार्ज समस्या',
          'प्याकेज बिलिङ त्रुटि'
        ],
        technical: [
          'वेबसाइट काम नगर्ने', 
          'एप क्र्याश हुने', 
          'लगइन समस्या', 
          'डाटा ढिलो', 
          'सफ्टवेयर त्रुटि',
          'पासवर्ड रिसेट समस्या',
          'दुई-चरण प्रमाणीकरण समस्या'
        ],
        network: [
          'नेटवर्क नभएको', 
          'सिग्नल कमजोर', 
          'कभरेज समस्या', 
          'रोमिङ समस्या', 
          '४जी/५जी समस्या',
          'नेटवर्क स्थिरता',
          'डाटा स्पीड घट्नु'
        ],
        other: [
          'अन्य समस्या', 
          'सुझाव', 
          'गुनासो', 
          'प्रश्न', 
          'जानकारी',
          'सेवा प्रतिक्रिया',
          'कर्मचारी व्यवहार'
        ]
      },
      en: {
        service: [
          'Internet Connection Issue', 
          'Call Drop Problem', 
          'Slow Internet Speed', 
          'Service Not Working', 
          'Service Disruption',
          'New Connection Request',
          'Service Transfer Request',
          'Service Quality Issue'
        ],
        billing: [
          'Excessive Billing', 
          'Bill Not Received', 
          'Recharge Not Credited', 
          'Wrong Deduction', 
          'Double Charge',
          'Bill Detail Error',
          'Auto Recharge Issue',
          'Package Billing Error'
        ],
        technical: [
          'Website Not Working', 
          'App Crashes', 
          'Login Issue', 
          'Data Delay', 
          'Software Bug',
          'Password Reset Issue',
          'Two-Factor Authentication Issue'
        ],
        network: [
          'No Network', 
          'Weak Signal', 
          'Coverage Issue', 
          'Roaming Problem', 
          '4G/5G Issue',
          'Network Stability',
          'Data Speed Dropping'
        ],
        other: [
          'Other Issue', 
          'Suggestion', 
          'General Complaint', 
          'Inquiry', 
          'Information Request',
          'Service Feedback',
          'Staff Behavior'
        ]
      }
    };
    
    const type = formData.complaintType || 'other';
    const lang = language === 'np' ? 'np' : 'en';
    const options = commonSubjects[lang][type] || commonSubjects[lang].other;
    return options;
  };

  const content = {
    np: {
      weAreHere: 'हामी तपाईंको लागि यहाँ छौं',
      contactNumber: 'सम्पर्क नम्बर: ०१-४९६०००८',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'नेपाल दूरसञ्चार प्राधिकरण',
      departmentAddress: 'भद्रकाली प्लाजा, काठमाडौं',
      serviceName: 'एनटीसी सहयात्री',
      serviceSub: 'गुनासो ट्र्याकिङ प्रणाली',
      home: 'गृह पृष्ठ',
      faqs: 'बारम्बार सोधिने प्रश्नहरू',
      login: 'लगइन',
      complaintRegarding: 'गुनासो सम्बन्धी',
      complaintInfo: 'गुनासो जानकारी',
      referenceNo: 'सन्दर्भ नम्बर',
      selectComplaintType: 'गुनासोको प्रकार चयन गर्नुहोस्',
      serviceRelated: 'सेवा सम्बन्धी',
      billingRelated: 'बिलिङ सम्बन्धी',
      technicalRelated: 'प्राविधिक सम्बन्धी',
      networkRelated: 'नेटवर्क सम्बन्धी',
      other: 'अन्य',
      subject: 'विषय',
      selectSubject: 'विषय चयन गर्नुहोस्',
      description: 'विवरण',
      enterDescription: 'गुनासोको विस्तृत विवरण लेख्नुहोस्',
      remainingChars: 'बाँकी अक्षर',
      priority: 'प्राथमिकता',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'न्यून',
      personalInfo: 'व्यक्तिगत जानकारी',
      fullName: 'पुरा नाम',
      enterFullName: 'आफ्नो पुरा नाम प्रविष्ट गर्नुहोस्',
      emailAddress: 'इमेल ठेगाना',
      enterEmail: 'example@email.com',
      mobileNumber: 'मोबाइल नम्बर',
      enterMobile: '९८XXXXXXXX',
      address: 'ठेगाना',
      enterAddress: 'आफ्नो ठेगाना प्रविष्ट गर्नुहोस्',
      landmark: 'नजिकैको चिन्ह',
      enterLandmark: 'नजिकैको प्रख्यात स्थान',
      preferredContact: 'सम्पर्कको माध्यम',
      contactPhone: 'फोन कल',
      contactEmail: 'इमेल',
      contactSMS: 'एसएमएस',
      attachments: 'संलग्नकहरू',
      dragDrop: 'फाइलहरू यहाँ तान्नुहोस् वा क्लिक गरेर अपलोड गर्नुहोस्',
      supportedFiles: 'समर्थित फाइलहरू: PDF, JPG, PNG, DOC (max 5MB)',
      maxFiles: 'अधिकतम ५ फाइलहरू मात्र अपलोड गर्न सकिन्छ',
      submitComplaint: 'गुनासो पेश गर्नुहोस्',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      required: 'आवश्यक',
      optional: 'वैकल्पिक',
      selectComplaintTypeError: 'कृपया गुनासोको प्रकार चयन गर्नुहोस्',
      selectSubjectError: 'कृपया विषय चयन गर्नुहोस्',
      descriptionError: 'कृपया विवरण भर्नुहोस्',
      descriptionMinError: 'कृपया कम्तीमा २० अक्षरको विवरण भर्नुहोस्',
      nameError: 'कृपया पुरा नाम भर्नुहोस्',
      nameMinError: 'नाम कम्तीमा ३ अक्षरको हुनुपर्छ',
      phoneError: 'कृपया मोबाइल नम्बर भर्नुहोस्',
      phoneInvalidError: 'कृपया मान्य मोबाइल नम्बर प्रविष्ट गर्नुहोस् (९८XXXXXXXX वा ९७XXXXXXXX)',
      emailInvalidError: 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्',
      successMessage: '✅ तपाईंको गुनासो सफलतापूर्वक पेश भयो!',
      ticketId: '📋 टिकेट नम्बर',
      password: '🔑 पासवर्ड',
      saveDetails: '💡 कृपया यो विवरण सुरक्षित राख्नुहोस्।',
      trackNow: '🔍 अहिले ट्र्याक गर्नुहोस्',
      close: 'बन्द गर्नुहोस्',
      fileTooLarge: 'फाइल ५MB भन्दा ठुलो छ',
      invalidFileType: 'अमान्य फाइल प्रकार। कृपया PDF, JPG, PNG, वा DOC मात्र अपलोड गर्नुहोस्',
      maxFilesExceeded: 'अधिकतम ५ फाइलहरू मात्र अपलोड गर्न सकिन्छ',
      submitting: 'पेश गर्दै...',
      clearForm: 'फारम खाली गर्नुहोस्',
      estimatedTime: 'अनुमानित प्रतिक्रिया समय: २४-४८ घण्टा',
      submitFailed: '❌ गुनासो पेश गर्न असफल। कृपया पछि प्रयास गर्नुहोस्।',
      formErrors: 'कृपया फारममा भएका त्रुटिहरू सच्याउनुहोस्',
      resetSuccess: 'फारम सफलतापूर्वक खाली गरियो',
      fileRemoved: 'फाइल हटाइयो',
      requiredFieldsInfo: 'तारांकित (*) चिन्ह लगाइएका फिल्डहरू अनिवार्य छन्',
      copyReference: 'सन्दर्भ नम्बर प्रतिलिपि गर्नुहोस्',
      copied: 'प्रतिलिपि गरियो!',
      connectionError: 'सर्भरमा जडान हुन सकेन। कृपया पछि प्रयास गर्नुहोस्।'
    },
    en: {
      weAreHere: 'We are here for you',
      contactNumber: 'Contact: 01-4960008',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'Nepal Telecommunications Authority',
      departmentAddress: 'Bhadrakali Plaza, Kathmandu',
      serviceName: 'NTC Sahayatri',
      serviceSub: 'Complaint Tracking System',
      home: 'Home',
      faqs: 'FAQs',
      login: 'Login',
      complaintRegarding: 'Complaint Regarding',
      complaintInfo: 'Complaint Information',
      referenceNo: 'Reference Number',
      selectComplaintType: 'Select complaint type',
      serviceRelated: 'Service Related',
      billingRelated: 'Billing Related',
      technicalRelated: 'Technical Related',
      networkRelated: 'Network Related',
      other: 'Other',
      subject: 'Subject',
      selectSubject: 'Select a subject',
      description: 'Description',
      enterDescription: 'Write detailed description of your complaint',
      remainingChars: 'characters remaining',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      personalInfo: 'Personal Information',
      fullName: 'Full Name',
      enterFullName: 'Enter your full name',
      emailAddress: 'Email Address',
      enterEmail: 'example@email.com',
      mobileNumber: 'Mobile Number',
      enterMobile: '98XXXXXXXX',
      address: 'Address',
      enterAddress: 'Enter your address',
      landmark: 'Nearby Landmark',
      enterLandmark: 'Nearby famous place',
      preferredContact: 'Preferred Contact Method',
      contactPhone: 'Phone Call',
      contactEmail: 'Email',
      contactSMS: 'SMS',
      attachments: 'Attachments',
      dragDrop: 'Drag & drop files here or click to upload',
      supportedFiles: 'Supported files: PDF, JPG, PNG, DOC (max 5MB)',
      maxFiles: 'Maximum 5 files can be uploaded',
      submitComplaint: 'Submit Complaint',
      backToHome: 'Back to Home',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      required: 'Required',
      optional: 'Optional',
      selectComplaintTypeError: 'Please select complaint type',
      selectSubjectError: 'Please select subject',
      descriptionError: 'Please enter description',
      descriptionMinError: 'Please enter at least 20 characters for description',
      nameError: 'Please enter your name',
      nameMinError: 'Name must be at least 3 characters',
      phoneError: 'Please enter mobile number',
      phoneInvalidError: 'Please enter a valid mobile number (98XXXXXXXX or 97XXXXXXXX)',
      emailInvalidError: 'Please enter a valid email address',
      successMessage: '✅ Your complaint has been submitted successfully!',
      ticketId: '📋 Ticket ID',
      password: '🔑 Password',
      saveDetails: '💡 Please save these details to track your complaint.',
      trackNow: '🔍 Track Now',
      close: 'Close',
      fileTooLarge: 'File is larger than 5MB',
      invalidFileType: 'Invalid file type. Please upload only PDF, JPG, PNG, or DOC files.',
      maxFilesExceeded: 'Maximum 5 files can be uploaded',
      submitting: 'Submitting...',
      clearForm: 'Clear Form',
      estimatedTime: 'Estimated response time: 24-48 hours',
      submitFailed: '❌ Failed to submit complaint. Please try again later.',
      formErrors: 'Please fix the errors in the form',
      resetSuccess: 'Form cleared successfully',
      fileRemoved: 'File removed',
      requiredFieldsInfo: 'Fields marked with (*) are required',
      copyReference: 'Copy reference number',
      copied: 'Copied!',
      connectionError: 'Cannot connect to server. Please try again later.'
    }
  };

  const t = content[language];

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(98|97|96)[0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  // Validate email
  const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate file
  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024;
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: t.invalidFileType };
    }
    if (file.size > maxSize) {
      return { valid: false, error: t.fileTooLarge };
    }
    return { valid: true, error: null };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      setDescriptionCharCount(value.length);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      if (selectedFiles.length + files.length > 5) {
        showToast(t.maxFilesExceeded, 'error');
        return;
      }
      
      const validFiles = [];
      const newErrors = [];
      
      files.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          newErrors.push(validation.error);
        }
      });
      
      if (newErrors.length > 0) {
        showToast(newErrors.join('\n'), 'error');
      }
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
      if (validFiles.length > 0) {
        showToast(`${validFiles.length} ${language === 'np' ? 'फाइल(हरू) चयन गरियो' : 'file(s) selected'}`, 'success', 2000);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      
      if (selectedFiles.length + files.length > 5) {
        showToast(t.maxFilesExceeded, 'error');
        return;
      }
      
      const validFiles = [];
      const newErrors = [];
      
      files.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          newErrors.push(validation.error);
        }
      });
      
      if (newErrors.length > 0) {
        showToast(newErrors.join('\n'), 'error');
      }
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
      if (validFiles.length > 0) {
        showToast(`${validFiles.length} ${language === 'np' ? 'फाइल(हरू) चयन गरियो' : 'file(s) selected'}`, 'success', 2000);
      }
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    showToast(t.fileRemoved, 'info', 1500);
  };

  const clearForm = () => {
    const confirmMessage = language === 'np' 
      ? 'के तपाईं सबै फारम डाटा खाली गर्न चाहनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।' 
      : 'Are you sure you want to clear all form data? This action cannot be undone.';
    
    if (window.confirm(confirmMessage)) {
      setFormData({
        complaintType: '',
        subject: '',
        description: '',
        priority: 'medium',
        name: '',
        email: '',
        phone: '',
        address: '',
        landmark: '',
        preferredContact: 'phone'
      });
      setSelectedFiles([]);
      setErrors({});
      setTouched({});
      setDescriptionCharCount(0);
      generateReferenceNumber();
      showToast(t.resetSuccess, 'success', 2000);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.complaintType) {
      newErrors.complaintType = t.selectComplaintTypeError;
    }
    
    if (!formData.subject) {
      newErrors.subject = t.selectSubjectError;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t.descriptionError;
    } else if (formData.description.trim().length < minDescriptionChars) {
      newErrors.description = t.descriptionMinError;
    }
    
    if (!formData.name.trim()) {
      newErrors.name = t.nameError;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = t.nameMinError;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t.phoneError;
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = t.phoneInvalidError;
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = t.emailInvalidError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const copyReferenceNumber = () => {
    navigator.clipboard.writeText(referenceNumber);
    showToast(t.copied, 'success', 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionAttempted(true);
    
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      showToast(t.formErrors, 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('complaintType', formData.complaintType);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('email', formData.email || '');
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('landmark', formData.landmark || '');
      formDataToSend.append('preferredContact', formData.preferredContact);
      formDataToSend.append('referenceNumber', referenceNumber);
      
      // Add files if selected
      selectedFiles.forEach(file => {
        formDataToSend.append('attachments', file);
      });
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await axios.post(`${API_URL}/complaint-regarding`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.data.success) {
        setSuccessData(response.data.data);
        setShowSuccess(true);
        
        // Reset form
        setFormData({
          complaintType: '',
          subject: '',
          description: '',
          priority: 'medium',
          name: '',
          email: '',
          phone: '',
          address: '',
          landmark: '',
          preferredContact: 'phone'
        });
        setSelectedFiles([]);
        setErrors({});
        setTouched({});
        setDescriptionCharCount(0);
        setSubmissionAttempted(false);
        generateReferenceNumber();
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      let errorMessage = t.submitFailed;
      if (error.code === 'ECONNABORTED') {
        errorMessage = language === 'np' ? 'सर्भरले समयमा प्रतिक्रिया दिएन। कृपया पछि प्रयास गर्नुहोस्।' : 'Server timeout. Please try again later.';
      } else if (error.response) {
        errorMessage = error.response.data?.message || t.submitFailed;
      } else if (error.request) {
        errorMessage = t.connectionError;
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
    showToast(lang === 'np' ? 'भाषा नेपालीमा परिवर्तन गरियो' : 'Language changed to English', 'info', 2000);
  };

  const LogoImage = ({ src, alt, fallback, className }) => {
    const [imgError, setImgError] = useState(false);
    
    if (imgError || !src) {
      return <div className={`logo-fallback ${className}`}>{fallback}</div>;
    }
    
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <div className="complaint-regarding-page">
      {/* Success Modal - ONLY show this, no other popup */}
      {showSuccess && successData && (
        <div className="success-modal-overlay" onClick={() => setShowSuccess(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✅</div>
            <h3>{t.successMessage}</h3>
            <div className="success-details">
              <p><strong>{t.referenceNo}:</strong> 
                <span className="highlight">{referenceNumber}</span>
                <button className="copy-small" onClick={copyReferenceNumber}>📋</button>
              </p>
              <p><strong>{t.ticketId}:</strong> 
                <span className="highlight">{language === 'np' ? successData.complaintNumberNp : successData.complaintNumber}</span>
              </p>
              <p><strong>{t.password}:</strong> 
                <span className="highlight password">{successData.trackingPassword}</span>
              </p>
              <p className="save-warning">⚠️ {t.saveDetails}</p>
            </div>
            <div className="modal-buttons">
              <button className="btn-close" onClick={() => setShowSuccess(false)}>
                {t.close}
              </button>
              <button className="btn-track" onClick={() => {
                sessionStorage.setItem('trackingId', successData.complaintNumber);
                sessionStorage.setItem('trackingPassword', successData.trackingPassword);
                navigate('/track-complaint');
              }}>
                🔍 {t.trackNow}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER 1 - Top Bar */}
      <div className="header-1">
        <div className="container-1">
          <div className="header-left">
            <div className="we-are-here">
              <span className="quote-text">{t.weAreHere}</span>
            </div>
          </div>
          <div className="header-right">
            <div className="contact-info-group">
              <div className="contact-info-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">{t.contactNumber}</span>
              </div>
              <div className="contact-info-item">
                <span className="contact-icon">✉️</span>
                <span className="contact-text">{t.emailAddress}</span>
              </div>
            </div>
            <div className="language-dropdown">
              <button 
                className="language-selector"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <span className="lang-icon">🌐</span>
                <span className="lang-text">{language === 'np' ? 'नेपाली' : 'English'}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {showLanguageDropdown && (
                <div className="dropdown-menu">
                  <button 
                    className={`dropdown-item ${language === 'np' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('np')}
                  >
                    <span className="lang-flag">🇳🇵</span>
                    <span>नेपाली</span>
                  </button>
                  <button 
                    className={`dropdown-item ${language === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    <span className="lang-flag">🇬🇧</span>
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HEADER 2 - Department Level with Logos */}
      <div className="header-2">
        <div className="container-2">
          <div className="logo-left">
            <LogoImage 
              src={ntcLogo} 
              alt="NTC Logo" 
              fallback="📡"
              className="ntc-logo"
            />
          </div>
          <div className="dept-text-center">
            <div className="dept-name">{t.departmentName}</div>
            <div className="dept-address">{t.departmentAddress}</div>
          </div>
          <div className="logo-right">
            <LogoImage 
              src={govLogo} 
              alt="Government Logo" 
              fallback="🇳🇵"
              className="gov-logo"
            />
          </div>
        </div>
      </div>

      {/* HEADER 3 - Navigation Bar */}
      <div className="header-3">
        <div className="container-3">
          <div className="nav-menu-left">
            <button onClick={() => navigate('/')} className="nav-btn">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">{t.home}</span>
            </button>
            <button onClick={() => navigate('/faqs')} className="nav-btn">
              <span className="nav-icon">❓</span>
              <span className="nav-text">{t.faqs}</span>
            </button>
          </div>
          <div className="login-btn-right">
            <button className="login-btn" onClick={() => navigate('/login')}>
              <span className="login-icon">🔐</span>
              <span className="login-text">{t.login}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="complaint-container">
          <div className="complaint-card">
            <div className="complaint-header">
              <div className="header-icon">📋</div>
              <h2>{t.complaintRegarding}</h2>
              <p>{t.complaintInfo}</p>
              <div className="reference-box" onClick={copyReferenceNumber}>
                <span className="reference-label">{t.referenceNo}:</span>
                <span className="reference-value">{referenceNumber}</span>
                <button type="button" className="copy-btn" title={t.copyReference}>📋</button>
              </div>
              <div className="required-info">
                <span className="required-star">*</span> {t.requiredFieldsInfo}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="complaint-form" noValidate>
              {/* Complaint Type */}
              <div className="form-section">
                <h3 className="section-title">
                  {t.selectComplaintType} <span className="required-star">*</span>
                </h3>
                <div className="complaint-types">
                  {[
                    { value: 'service', icon: '🔧', name: t.serviceRelated },
                    { value: 'billing', icon: '💰', name: t.billingRelated },
                    { value: 'technical', icon: '💻', name: t.technicalRelated },
                    { value: 'network', icon: '📡', name: t.networkRelated },
                    { value: 'other', icon: '📝', name: t.other }
                  ].map(type => (
                    <label key={type.value} className={`type-option ${formData.complaintType === type.value ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="complaintType"
                        value={type.value}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('complaintType')}
                      />
                      <span className="type-icon">{type.icon}</span>
                      <span className="type-name">{type.name}</span>
                    </label>
                  ))}
                </div>
                {submissionAttempted && (touched.complaintType || errors.complaintType) && errors.complaintType && 
                  <div className="error-message-field">{errors.complaintType}</div>}
              </div>

              {/* Subject - Dropdown */}
              <div className="form-section">
                <h3 className="section-title">
                  {t.subject} <span className="required-star">*</span>
                </h3>
                <div className="form-group">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('subject')}
                    required
                    disabled={!formData.complaintType}
                    className={submissionAttempted && errors.subject ? 'error-input' : ''}
                  >
                    <option value="">{t.selectSubject}</option>
                    {getSubjectOptions().map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {!formData.complaintType && (
                    <p className="helper-text">
                      {language === 'np' ? 'कृपया पहिले गुनासोको प्रकार चयन गर्नुहोस्' : 'Please select complaint type first'}
                    </p>
                  )}
                  {submissionAttempted && (touched.subject || errors.subject) && errors.subject && 
                    <div className="error-message-field">{errors.subject}</div>}
                </div>
              </div>

              {/* Description */}
              <div className="form-section">
                <h3 className="section-title">
                  {t.description} <span className="required-star">*</span>
                </h3>
                <div className="form-group">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('description')}
                    rows="6"
                    placeholder={`${t.enterDescription} (${t.descriptionMinError})`}
                    required
                    maxLength={maxDescriptionChars}
                    className={submissionAttempted && errors.description ? 'error-input' : ''}
                  ></textarea>
                  <div className="char-counter">
                    <span className={descriptionCharCount < minDescriptionChars ? 'char-warning' : ''}>
                      {descriptionCharCount} / {maxDescriptionChars} {t.remainingChars}
                      {descriptionCharCount > 0 && descriptionCharCount < minDescriptionChars && 
                        ` (${minDescriptionChars - descriptionCharCount} ${language === 'np' ? 'अक्षर थप्नुहोस्' : 'more characters needed'})`}
                    </span>
                  </div>
                  {submissionAttempted && (touched.description || errors.description) && errors.description && 
                    <div className="error-message-field">{errors.description}</div>}
                </div>
              </div>

              {/* Priority */}
              <div className="form-section">
                <h3 className="section-title">{t.priority}</h3>
                <div className="priority-options">
                  {[
                    { value: 'high', label: t.high, icon: '🔴', color: 'high' },
                    { value: 'medium', label: t.medium, icon: '🟡', color: 'medium' },
                    { value: 'low', label: t.low, icon: '🟢', color: 'low' }
                  ].map(priority => (
                    <label key={priority.value} className={`priority-option ${formData.priority === priority.value ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        onChange={handleInputChange}
                      />
                      <span className={`priority-badge ${priority.color}`}>
                        {priority.icon} {priority.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="form-section">
                <h3 className="section-title">{t.personalInfo}</h3>
                <div className="personal-info-grid">
                  <div className="form-group">
                    <label>{t.fullName} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('name')}
                      placeholder={t.enterFullName}
                      required
                      className={submissionAttempted && errors.name ? 'error-input' : ''}
                    />
                    {submissionAttempted && (touched.name || errors.name) && errors.name && 
                      <div className="error-message-field">{errors.name}</div>}
                  </div>
                  <div className="form-group">
                    <label>{t.emailAddress} <span className="optional">({t.optional})</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('email')}
                      placeholder={t.enterEmail}
                      className={submissionAttempted && errors.email ? 'error-input' : ''}
                    />
                    {submissionAttempted && (touched.email || errors.email) && errors.email && 
                      <div className="error-message-field">{errors.email}</div>}
                  </div>
                  <div className="form-group">
                    <label>{t.mobileNumber} <span className="required-star">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('phone')}
                      placeholder={t.enterMobile}
                      required
                      className={submissionAttempted && errors.phone ? 'error-input' : ''}
                    />
                    {submissionAttempted && (touched.phone || errors.phone) && errors.phone && 
                      <div className="error-message-field">{errors.phone}</div>}
                  </div>
                  <div className="form-group">
                    <label>{t.address} <span className="optional">({t.optional})</span></label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={t.enterAddress}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.landmark} <span className="optional">({t.optional})</span></label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder={t.enterLandmark}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.preferredContact}</label>
                    <select
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleInputChange}
                    >
                      <option value="phone">{t.contactPhone}</option>
                      <option value="email">{t.contactEmail}</option>
                      <option value="sms">{t.contactSMS}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="form-section">
                <h3 className="section-title">{t.attachments} <span className="optional">({t.optional})</span></h3>
                <div 
                  className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="drop-zone-content">
                    <span className="upload-icon">📎</span>
                    <p>{t.dragDrop}</p>
                    <button type="button" className="upload-btn">📁 {t.attachments}</button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    multiple
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </div>
                <p className="supported-files">{t.supportedFiles}</p>
                <p className="max-files">{t.maxFiles}</p>
                <p className="estimated-time">⏱️ {t.estimatedTime}</p>
                
                {selectedFiles.length > 0 && (
                  <div className="file-list">
                    <div className="file-list-header">
                      <span>{selectedFiles.length} {language === 'np' ? 'फाइल(हरू)' : 'file(s)'}</span>
                    </div>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-icon">
                          {file.type.includes('pdf') ? '📕' : 
                           file.type.includes('image') ? '🖼️' : 
                           file.type.includes('word') ? '📘' : '📄'}
                        </span>
                        <div className="file-info">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <button type="button" onClick={() => removeFile(index)} className="remove-file" title={t.fileRemoved}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-buttons">
                <button type="button" onClick={clearForm} className="btn-clear" disabled={isSubmitting}>
                  🗑️ {t.clearForm}
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      {t.submitting}
                    </>
                  ) : (
                    <>📌 {t.submitComplaint}</>
                  )}
                </button>
              </div>
            </form>
            
            <div className="back-to-home">
              <button onClick={() => navigate('/')} className="btn-back">
                ← {t.backToHome}
              </button>
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

        .complaint-regarding-page {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          color: #1a2c3e;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* HEADER 1 - Top Bar */
        .header-1 {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
          color: white;
          padding: 10px 0;
          z-index: 1040;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .container-1 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-left { display: flex; align-items: center; gap: 16px; }
        .we-are-here {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          padding: 6px 20px;
          border-radius: 40px;
          font-weight: 500;
        }
        .quote-text { font-size: 0.9rem; letter-spacing: 0.5px; font-weight: 600; }

        .header-right { display: flex; align-items: center; gap: 25px; flex-wrap: wrap; }
        .contact-info-group { display: flex; align-items: center; gap: 15px; }
        .contact-info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          background: rgba(255,255,255,0.1);
          padding: 5px 12px;
          border-radius: 30px;
          transition: all 0.3s ease;
        }
        .contact-info-item:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
        .contact-icon { font-size: 0.85rem; }
        .contact-text { font-size: 0.75rem; font-weight: 500; }

        /* Language Dropdown */
        .language-dropdown { position: relative; }
        .language-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 5px 12px;
          border-radius: 30px;
          cursor: pointer;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .language-selector:hover { background: rgba(255,255,255,0.25); }
        .lang-icon { font-size: 0.85rem; }
        .dropdown-arrow { font-size: 0.6rem; margin-left: 5px; }
        .dropdown-menu {
          position: absolute;
          top: 38px;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 1050;
          min-width: 120px;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 14px;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
          text-align: left;
        }
        .dropdown-item:hover { background: #f0f2f5; }
        .dropdown-item.active { background: #1565c0; color: white; }
        .lang-flag { font-size: 1rem; }

        /* HEADER 2 - Department Level */
        .header-2 {
          position: fixed;
          top: 55px;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #e8f0fe 0%, #ffffff 100%);
          color: #1a2c3e;
          padding: 12px 0;
          z-index: 1030;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-bottom: 1px solid rgba(21, 101, 192, 0.15);
        }
        .container-2 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
        }
        .logo-left { flex: 1; display: flex; justify-content: flex-start; }
        .logo-right { flex: 1; display: flex; justify-content: flex-end; }
        .ntc-logo, .gov-logo { height: 50px; width: auto; object-fit: contain; }
        .logo-fallback {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1565c0, #42a5f5);
          border-radius: 50%;
          color: white;
        }
        .dept-text-center { flex: 2; text-align: center; }
        .dept-name { font-size: 1rem; font-weight: 700; color: #0d47a1; letter-spacing: 1px; }
        .dept-address { font-size: 0.75rem; opacity: 0.7; color: #555; margin-top: 3px; }

        /* HEADER 3 - Navigation Bar */
        .header-3 {
          position: fixed;
          top: 119px;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
          color: white;
          padding: 12px 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1020;
        }
        .container-3 {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .nav-menu-left { display: flex; gap: 20px; align-items: center; }
        .nav-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 20px;
          border-radius: 40px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px); }
        .nav-icon { font-size: 1.1rem; }
        .nav-text { font-size: 0.95rem; }
        .login-btn-right { display: flex; align-items: center; }
        .login-btn {
          background: transparent;
          border: 2px solid white;
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 28px;
          border-radius: 40px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .login-btn:hover { background: white; color: #1565c0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-top: 195px;
          padding: 40px 0;
        }

        .complaint-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .complaint-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .complaint-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header-icon { font-size: 3rem; margin-bottom: 16px; }
        .complaint-header h2 { font-size: 1.8rem; color: #0d47a1; margin-bottom: 8px; }
        .complaint-header p { color: #6c8196; }

        .reference-box {
          margin-top: 15px;
          padding: 10px 20px;
          background: #e8f0fe;
          border-radius: 30px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .reference-box:hover { background: #d4e4f7; transform: translateY(-1px); }
        .reference-label { font-weight: 600; color: #0d47a1; }
        .reference-value { font-family: monospace; font-weight: 500; color: #1565c0; }
        .copy-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          opacity: 0.6;
          transition: opacity 0.2s;
          padding: 0 4px;
        }
        .copy-btn:hover { opacity: 1; }

        .required-info { margin-top: 12px; font-size: 0.7rem; color: #6c8196; }
        .required-star { color: #dc3545; margin-right: 2px; }

        .complaint-form { text-align: left; }
        .form-section {
          margin-bottom: 32px;
          border-bottom: 1px solid #e8e8e8;
          padding-bottom: 24px;
        }
        .form-section:last-of-type { border-bottom: none; }
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0d47a1;
          margin-bottom: 16px;
        }
        .optional { color: #888; font-size: 0.75rem; font-weight: normal; }
        .helper-text { font-size: 0.75rem; color: #f57c00; margin-top: 6px; }
        .error-message-field { color: #dc3545; font-size: 0.75rem; margin-top: 6px; }
        .error-input { border-color: #dc3545 !important; }
        .char-counter {
          text-align: right;
          font-size: 0.7rem;
          margin-top: 5px;
          color: #888;
        }
        .char-warning { color: #f57c00; }
        .estimated-time, .max-files { font-size: 0.7rem; color: #2e7d32; margin-top: 5px; }
        .max-files { color: #1565c0; }

        /* Complaint Types */
        .complaint-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }
        .type-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .type-option.active { border-color: #1565c0; background: #e3f2fd; }
        .type-option input { display: none; }
        .type-icon { font-size: 1.2rem; }
        .type-name { font-size: 0.85rem; font-weight: 500; }

        /* Priority Options */
        .priority-options { display: flex; gap: 15px; flex-wrap: wrap; }
        .priority-option { cursor: pointer; }
        .priority-option input { display: none; }
        .priority-badge {
          display: inline-block;
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .priority-badge.high { background: #ffebee; color: #c62828; }
        .priority-badge.medium { background: #fff8e1; color: #f57c00; }
        .priority-badge.low { background: #e8f5e9; color: #2e7d32; }
        .priority-option.active .priority-badge {
          border-color: #1565c0;
          transform: scale(1.05);
        }

        /* Personal Info Grid */
        .personal-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 8px;
          color: #2c4e6e;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: white;
        }
        .form-group select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1565c0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
        }

        /* Drop Zone */
        .drop-zone {
          border: 2px dashed #ccc;
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }
        .drop-zone.drag-active { border-color: #1565c0; background: #e3f2fd; }
        .drop-zone-content { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .upload-icon { font-size: 2.5rem; }
        .upload-btn {
          background: #1565c0;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        .upload-btn:hover { background: #0d47a1; }
        .supported-files { font-size: 0.7rem; color: #888; margin-top: 8px; }

        /* File List */
        .file-list { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
        .file-list-header { font-size: 0.8rem; font-weight: 500; color: #0d47a1; margin-bottom: 4px; }
        .file-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .file-icon { font-size: 1rem; }
        .file-info { flex: 1; }
        .file-name { font-size: 0.85rem; word-break: break-all; display: block; }
        .file-size { font-size: 0.7rem; color: #888; }
        .remove-file {
          background: none;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          color: #dc3545;
          padding: 0 5px;
        }
        .remove-file:hover { color: #c62828; }

        .form-buttons {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .btn-submit {
          flex: 2;
          padding: 16px;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          color: white;
          border: none;
          border-radius: 40px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(21, 101, 192, 0.3);
        }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .btn-clear {
          flex: 1;
          padding: 16px;
          background: #f5f5f5;
          color: #666;
          border: 2px solid #ddd;
          border-radius: 40px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-clear:hover:not(:disabled) { background: #e0e0e0; border-color: #ccc; }
        .btn-clear:disabled { opacity: 0.5; cursor: not-allowed; }

        .back-to-home { margin-top: 24px; text-align: center; }
        .btn-back {
          background: transparent;
          border: 2px solid #1565c0;
          color: #1565c0;
          padding: 10px 28px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }
        .btn-back:hover { background: #1565c0; color: white; }

        /* Success Modal */
        .success-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .success-modal {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 450px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .success-icon { font-size: 4rem; margin-bottom: 20px; }
        .success-modal h3 { color: #0d47a1; font-size: 1.3rem; margin-bottom: 20px; }
        .success-details {
          background: #f0f7ff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: left;
        }
        .success-details p { margin: 10px 0; font-size: 0.95rem; word-break: break-all; }
        .success-details strong { color: #0d47a1; }
        .highlight { color: #1565c0; font-weight: 600; }
        .password { font-family: monospace; letter-spacing: 1px; }
        .copy-small {
          background: none;
          border: none;
          cursor: pointer;
          margin-left: 8px;
          font-size: 0.8rem;
          opacity: 0.6;
        }
        .copy-small:hover { opacity: 1; }
        .save-warning { color: #ff9800; font-size: 0.8rem; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; }

        .modal-buttons { display: flex; gap: 15px; justify-content: center; }
        .btn-close, .btn-track {
          padding: 12px 24px;
          border: none;
          border-radius: 40px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-close { background: #f0f0f0; color: #666; }
        .btn-close:hover { background: #e0e0e0; }
        .btn-track { background: linear-gradient(135deg, #1565c0, #0d47a1); color: white; }
        .btn-track:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(21,101,192,0.3); }

    

        /* Responsive */
        @media (max-width: 768px) {
          .main-content { margin-top: 330px; }
          .complaint-card { padding: 28px 20px; }
          .complaint-header h2 { font-size: 1.4rem; }
          .personal-info-grid { grid-template-columns: 1fr; }
          .complaint-types { grid-template-columns: repeat(2, 1fr); }
          .container-1, .container-2, .container-3 { padding: 0 20px; flex-direction: column; text-align: center; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .contact-info-group { flex-direction: column; gap: 8px; }
          .logo-left, .logo-right { display: none; }
          .dept-text-center { flex: 1; }
          .success-modal { padding: 25px; margin: 20px; }
          .modal-buttons { flex-direction: column; }
          .form-buttons { flex-direction: column; }
        }

        @media (max-width: 480px) {
          .complaint-types { grid-template-columns: 1fr; }
          .priority-options { flex-direction: column; }
          .priority-badge { text-align: center; }
          .complaint-card { padding: 20px 16px; }
          .section-title { font-size: 1rem; }
          .btn-submit, .btn-clear { font-size: 0.9rem; padding: 12px; }
        }
      `}</style>
    </div>
  );
};

export default ComplaintRegarding;