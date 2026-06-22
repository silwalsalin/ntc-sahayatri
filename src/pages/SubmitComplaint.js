// src/pages/SubmitComplaint.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Try to import local images with fallback
let ntcLogo, govLogo, heroImage;
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
try {
  heroImage = require('../img/image.png');
} catch (e) {
  heroImage = null;
}

// Helper function to get current date in Nepali format
const getNepaliDate = () => {
  const date = new Date();
  const nepaliMonths = [
    'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज',
    'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
  ];
  const nepaliDays = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'];
  
  // Approximate conversion to BS (subtract 57 years, adjust month/day)
  // For demo purposes - in production use a proper Nepali date library
  let bsYear = date.getFullYear() - 57;
  let bsMonth = date.getMonth();
  let bsDay = date.getDate();
  let bsWeekday = date.getDay();
  
  // Simple adjustment for month/day offset
  // This is an approximation - real conversion requires a proper algorithm
  if (date.getMonth() < 3) {
    bsYear = date.getFullYear() - 56;
    bsMonth = date.getMonth() + 9;
  } else {
    bsYear = date.getFullYear() - 57;
    bsMonth = date.getMonth() - 3;
  }
  
  // Ensure month is within 0-11
  if (bsMonth < 0) {
    bsMonth += 12;
    bsYear -= 1;
  }
  
  // Format the date
  return {
    year: bsYear,
    month: nepaliMonths[bsMonth] || 'बैशाख',
    day: bsDay,
    weekday: nepaliDays[bsWeekday] || 'आइतबार',
    fullDate: `${nepaliDays[bsWeekday] || 'आइतबार'}, ${bsDay} ${nepaliMonths[bsMonth] || 'बैशाख'} ${bsYear}`,
    shortDate: `${bsYear}-${String(bsMonth + 1).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`,
    yearNp: String(bsYear),
    monthNp: nepaliMonths[bsMonth] || 'बैशाख',
    dayNp: String(bsDay),
    monthIndex: bsMonth,
    dayIndex: bsDay
  };
};

// Helper function to convert numbers to Nepali digits
const toNepaliDigits = (num) => {
  if (num === undefined || num === null || num === '') return '';
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const str = String(num);
  return str.replace(/\d/g, (digit) => nepaliDigits[parseInt(digit)]);
};

// Helper function to get current date in English format
const getEnglishDate = () => {
  const date = new Date();
  return {
    year: date.getFullYear(),
    month: date.toLocaleString('en-US', { month: 'long' }),
    day: date.getDate(),
    weekday: date.toLocaleString('en-US', { weekday: 'long' }),
    fullDate: date.toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    shortDate: date.toISOString().split('T')[0],
    yearEn: String(date.getFullYear()),
    monthEn: date.toLocaleString('en-US', { month: 'long' }),
    dayEn: String(date.getDate())
  };
};

const SubmitComplaint = () => {
  const navigate = useNavigate();
  
  // Language state
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'np';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Loading state for backend submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Success state to show message without leaving page
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // State for complaint form
  const [formData, setFormData] = useState({
    natureOfComplaint: '',
    name: '',
    state: '',
    district: '',
    municipality: '',
    wardNo: '',
    streetAddress: '',
    email: '',
    phone: '',
    description: ''
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // API URL from environment or default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 5000);
  };

  // Complete Nepal Location Data with all 77 districts (same as before)
  const locationData = {
    province1: { 
      np: 'कोशी प्रदेश', 
      en: 'Koshi Province', 
      districts: {
        'taplejung': { np: 'ताप्लेजुङ', en: 'Taplejung', municipalities: ['फुङलिङ नगरपालिका', 'सिदिङ्वा गाउँपालिका', 'मैवाखोला गाउँपालिका', 'मिक्वाखोला गाउँपालिका', 'आठराई त्रिवेणी गाउँपालिका', 'सिरीजङ्घा गाउँपालिका', 'पाथीभरा याङवरक गाउँपालिका'] },
        'panchthar': { np: 'पाँचथर', en: 'Panchthar', municipalities: ['फिदिम नगरपालिका', 'फालेलुङ गाउँपालिका', 'फाल्गुनन्द गाउँपालिका', 'हिलिहाङ गाउँपालिका', 'कुम्मायक गाउँपालिका', 'मिक्लाजुङ गाउँपालिका', 'तुम्बेवा गाउँपालिका', 'याङवरक गाउँपालिका'] },
        'ilam': { np: 'इलाम', en: 'Ilam', municipalities: ['इलाम नगरपालिका', 'सूर्योदय नगरपालिका', 'देउमाई नगरपालिका', 'माई नगरपालिका', 'माङसेबुङ गाउँपालिका', 'रोङ गाउँपालिका', 'फाकफोकथुम गाउँपालिका', 'चुलाचुली गाउँपालिका', 'सन्दकपुर गाउँपालिका', 'जिरीखिम्ती गाउँपालिका'] },
        'jhapa': { np: 'झापा', en: 'Jhapa', municipalities: ['मेचीनगर नगरपालिका', 'बिर्तामोड नगरपालिका', 'दमक नगरपालिका', 'भद्रपुर नगरपालिका', 'शिवसताक्षी नगरपालिका', 'अर्जुनधारा नगरपालिका', 'गौरादह नगरपालिका', 'कन्काई नगरपालिका', 'बाह्रदशी गाउँपालिका', 'हल्दिवारी गाउँपालिका', 'कमल गाउँपालिका', 'बुद्धशान्ति गाउँपालिका', 'झापा गाउँपालिका', 'बारहपोखरी गाउँपालिका'] },
        'morang': { np: 'मोरङ', en: 'Morang', municipalities: ['बिराटनगर महानगरपालिका', 'सुन्दरहरैंचा नगरपालिका', 'बेलवारी नगरपालिका', 'पथरी शनिश्चरे नगरपालिका', 'रंगेली नगरपालिका', 'लेटाङ नगरपालिका', 'उर्लावारी नगरपालिका', 'कटहरी गाउँपालिका', 'ग्रामथान गाउँपालिका', 'केरावारी गाउँपालिका', 'मिक्लाजुङ गाउँपालिका', 'धनपालथान गाउँपालिका', 'जहदा गाउँपालिका', 'बुढीगंगा गाउँपालिका'] },
        'sunsari': { np: 'सुनसरी', en: 'Sunsari', municipalities: ['धरान उपमहानगरपालिका', 'ईटहरी उपमहानगरपालिका', 'इनरुवा नगरपालिका', 'दुहबी नगरपालिका', 'रामधुनी नगरपालिका', 'बराहक्षेत्र नगरपालिका', 'कोशी गाउँपालिका', 'हरिनगरा गाउँपालिका', 'भोक्राहा नरसिंह गाउँपालिका', 'देवानगन्ज गाउँपालिका', 'गढी गाउँपालिका'] },
        'bhojpur': { np: 'भोजपुर', en: 'Bhojpur', municipalities: ['भोजपुर नगरपालिका', 'शदानन्द नगरपालिका', 'पौवादुङमा गाउँपालिका', 'रामप्रसाद राई गाउँपालिका', 'अरुण गाउँपालिका', 'साल्पासिलिछो गाउँपालिका', 'हतुवागढी गाउँपालिका', 'टेम्केमैयुङ गाउँपालिका'] },
        'dhankuta': { np: 'धनकुटा', en: 'Dhankuta', municipalities: ['धनकुटा नगरपालिका', 'पाख्रिवास नगरपालिका', 'महालक्ष्मी नगरपालिका', 'साँगुरीगढी गाउँपालिका', 'चौविसे गाउँपालिका', 'सहिदभूमि गाउँपालिका', 'खाल्सा छिन्ताङ गाउँपालिका'] },
        'terhathum': { np: 'तेह्रथुम', en: 'Terhathum', municipalities: ['म्याङलुङ नगरपालिका', 'लालीगुराँस नगरपालिका', 'आठराई गाउँपालिका', 'छथर गाउँपालिका', 'पेदाङ गाउँपालिका', 'मेन्छयायेम गाउँपालिका'] },
        'sankhuwasabha': { np: 'सङ्खुवासभा', en: 'Sankhuwasabha', municipalities: ['खाँदबारी नगरपालिका', 'चैनपुर नगरपालिका', 'धर्मदेवी नगरपालिका', 'पाँचखपन गाउँपालिका', 'मादी गाउँपालिका', 'सभापोखरी गाउँपालिका', 'सिलीचोङ गाउँपालिका', 'भोटखोला गाउँपालिका', 'चिचिला गाउँपालिका'] },
        'solukhumbu': { np: 'सोलुखुम्बु', en: 'Solukhumbu', municipalities: ['सोलुदुधकुण्ड नगरपालिका', 'नेचासल्यान गाउँपालिका', 'दुधकोशी गाउँपालिका', 'माप्या दुधकोशी गाउँपालिका', 'खुम्बु पासाङल्हामु गाउँपालिका', 'लिखुपिके गाउँपालिका', 'महाकुलुङ गाउँपालिका', 'सोताङ गाउँपालिका'] },
        'okhaldhunga': { np: 'ओखलढुंगा', en: 'Okhaldhunga', municipalities: ['सिद्धिचरण नगरपालिका', 'खिजिदेम्बा गाउँपालिका', 'चम्पादेवी गाउँपालिका', 'चिसंखुगढी गाउँपालिका', 'मानेभञ्ज्याङ गाउँपालिका', 'मोलुङ गाउँपालिका', 'लिकु गाउँपालिका', 'सुनकोशी गाउँपालिका'] },
        'khotang': { np: 'खोटाङ', en: 'Khotang', municipalities: ['दिप्रुङ नगरपालिका', 'हलेसी तुवाचुङ नगरपालिका', 'ऐसेलुखर्क गाउँपालिका', 'बराहपोखरी गाउँपालिका', 'कपिलकोट गाउँपालिका', 'खोटेहाङ गाउँपालिका', 'जन्तेढुङ्गा गाउँपालिका', 'केपिलासगढी गाउँपालिका', 'रावा बेसी गाउँपालिका', 'साकेला गाउँपालिका'] },
        'udayapur': { np: 'उदयपुर', en: 'Udayapur', municipalities: ['त्रियुगा नगरपालिका', 'चौदण्डीगढी नगरपालिका', 'कटारी नगरपालिका', 'बेलका नगरपालिका', 'उदयपुरगढी गाउँपालिका', 'रौतामाई गाउँपालिका', 'सुनकोशी गाउँपालिका', 'ताप्ली गाउँपालिका'] }
      }
    },
    province2: { 
      np: 'मधेश प्रदेश', 
      en: 'Madhesh Province', 
      districts: {
        'saptari': { np: 'सप्तरी', en: 'Saptari', municipalities: ['राजविराज नगरपालिका', 'कञ्चनरूप नगरपालिका', 'शम्भुनाथ नगरपालिका', 'सप्तकोशी नगरपालिका', 'सुरुङ्गा नगरपालिका', 'बोदेबरसाइन नगरपालिका', 'खडक नगरपालिका', 'तिरहुत गाउँपालिका', 'महादेवा गाउँपालिका', 'रुपनी गाउँपालिका', 'वलान-विहुल गाउँपालिका', 'राजगढ गाउँपालिका', 'विष्णुपुर गाउँपालिका', 'छिन्नमस्ता गाउँपालिका', 'आग्नीपुर गाउँपालिका'] },
        'siraha': { np: 'सिराहा', en: 'Siraha', municipalities: ['सिराहा नगरपालिका', 'लहान नगरपालिका', 'धनगढीमाई नगरपालिका', 'गोलबजार नगरपालिका', 'मिर्चैया नगरपालिका', 'कर्जन्हा नगरपालिका', 'सुखीपुर नगरपालिका', 'भगवानपुर गाउँपालिका', 'अर्नमा गाउँपालिका', 'औरही गाउँपालिका', 'बरियारपट्टी गाउँपालिका', 'लक्ष्मीपुर पटारी गाउँपालिका', 'नरहा गाउँपालिका', 'सखुवा नान्करकट्टी गाउँपालिका', 'विष्णुपुर गाउँपालिका', 'नवराजपुर गाउँपालिका'] },
        'dhanusa': { np: 'धनुषा', en: 'Dhanusa', municipalities: ['जनकपुरधाम उपमहानगरपालिका', 'धनुषाधाम नगरपालिका', 'क्षिरेश्वरनाथ नगरपालिका', 'गणेशमान चारनाथ नगरपालिका', 'मिथिला नगरपालिका', 'सबैला नगरपालिका', 'विदेह नगरपालिका', 'कमला नगरपालिका', 'मिथिला बिहारी नगरपालिका', 'हंसपुर नगरपालिका', 'लक्ष्मीनिया गाउँपालिका', 'औरही गाउँपालिका', 'बटेश्वर गाउँपालिका', 'मुखियापट्टी मुसहरनिया गाउँपालिका', 'जनकनन्दनी गाउँपालिका'] },
        'mahottari': { np: 'महोत्तरी', en: 'Mahottari', municipalities: ['बर्दिबास नगरपालिका', 'जलेश्वर नगरपालिका', 'गौशाला नगरपालिका', 'बलवा नगरपालिका', 'मनरा शिसवा नगरपालिका', 'मटिहानी नगरपालिका', 'भङ्गाहा नगरपालिका', 'रामगोपालपुर नगरपालिका', 'लोहरपट्टी नगरपालिका', 'एकडारा गाउँपालिका', 'सोनमा गाउँपालिका', 'साम्सी गाउँपालिका', 'पिपरा गाउँपालिका'] },
        'sarlahi': { np: 'सर्लाही', en: 'Sarlahi', municipalities: ['मलङ्गवा नगरपालिका', 'हरिवन नगरपालिका', 'लालबन्दी नगरपालिका', 'ईश्वरपुर नगरपालिका', 'बरहथवा नगरपालिका', 'हरिपुर नगरपालिका', 'गोडैता नगरपालिका', 'ब्रह्मपुरी नगरपालिका', 'कौडेना गाउँपालिका', 'चक्रघट्टा गाउँपालिका', 'चन्द्रनगर गाउँपालिका', 'धनकौल गाउँपालिका', 'पर्सा गाउँपालिका', 'बसबरिया गाउँपालिका', 'रामनगर गाउँपालिका'] },
        'rautahat': { np: 'रौतहट', en: 'Rautahat', municipalities: ['गौर नगरपालिका', 'बौधीमाई नगरपालिका', 'ब्रह्मपुरी नगरपालिका', 'गरुडा नगरपालिका', 'कटहरिया नगरपालिका', 'माधवनारायण नगरपालिका', 'चन्द्रपुर नगरपालिका', 'देवाही गोनाही नगरपालिका', 'गुजरा नगरपालिका', 'राजदेवी नगरपालिका', 'दुर्गाभगवती गाउँपालिका', 'यमुनामाई गाउँपालिका', 'परोहा गाउँपालिका', 'ईशनाथ गाउँपालिका'] },
        'bara': { np: 'बारा', en: 'Bara', municipalities: ['कलैया उपमहानगरपालिका', 'जीतपुरसिमरा उपमहानगरपालिका', 'कोल्हवी नगरपालिका', 'निजगढ नगरपालिका', 'महागढीमाई नगरपालिका', 'सिम्रौनगढ नगरपालिका', 'पचरौता नगरपालिका', 'अडर्सकोट गाउँपालिका', 'करैयामाई गाउँपालिका', 'देवताल गाउँपालिका', 'परवानीपुर गाउँपालिका', 'बारागढी गाउँपालिका', 'फेटा गाउँपालिका', 'प्रसौनी गाउँपालिका', 'सुवर्ण गाउँपालिका'] },
        'parsa': { np: 'पर्सा', en: 'Parsa', municipalities: ['बीरगञ्ज महानगरपालिका', 'बहुदरमाई नगरपालिका', 'पोखरिया नगरपालिका', 'विश्रामपुर नगरपालिका', 'धोबीनी गाउँपालिका', 'जगरनाथपुर गाउँपालिका', 'जिरा भवानी गाउँपालिका', 'कल्याणिया गाउँपालिका', 'पकाहा मैनपुर गाउँपालिका', 'पटेर्वा सुगौली गाउँपालिका', 'सखुवा प्रसौनी गाउँपालिका', 'ठोरी गाउँपालिका'] }
      }
    },
    province3: { 
      np: 'बागमती प्रदेश', 
      en: 'Bagmati Province', 
      districts: {
        'kathmandu': { np: 'काठमाडौं', en: 'Kathmandu', municipalities: ['काठमाडौं महानगरपालिका', 'कीर्तिपुर नगरपालिका', 'टोखा नगरपालिका', 'तारकेश्वर नगरपालिका', 'चन्द्रागिरी नगरपालिका', 'नागार्जुन नगरपालिका', 'गोकर्णेश्वर नगरपालिका', 'बुढानीलकण्ठ नगरपालिका', 'डाँछी गाउँपालिका', 'शंखरापुर गाउँपालिका', 'कागेश्वरी मनोहरा नगरपालिका'] },
        'lalitpur': { np: 'ललितपुर', en: 'Lalitpur', municipalities: ['ललितपुर महानगरपालिका', 'गोदावरी नगरपालिका', 'महालक्ष्मी नगरपालिका', 'बज्रबाराही गाउँपालिका', 'बागमती गाउँपालिका', 'कोन्ज्योसोम गाउँपालिका'] },
        'bhaktapur': { np: 'भक्तपुर', en: 'Bhaktapur', municipalities: ['भक्तपुर नगरपालिका', 'मध्यपुर थिमी नगरपालिका', 'सूर्यविनायक नगरपालिका', 'चाँगुनारायण नगरपालिका'] },
        'kavrepalanchok': { np: 'काभ्रेपलान्चोक', en: 'Kavrepalanchok', municipalities: ['बनेपा नगरपालिका', 'धुलिखेल नगरपालिका', 'पनौती नगरपालिका', 'नमोबुद्ध नगरपालिका', 'मण्डनदेउपुर नगरपालिका', 'खानीखोला गाउँपालिका', 'रोशी गाउँपालिका', 'बेथानचोक गाउँपालिका', 'तेमाल गाउँपालिका', 'महाभारत गाउँपालिका', 'भुम्लु गाउँपालिका'] },
        'sindhupalchok': { np: 'सिन्धुपाल्चोक', en: 'Sindhupalchok', municipalities: ['चौतारा नगरपालिका', 'मेलम्ची नगरपालिका', 'बाह्रबिसे नगरपालिका', 'इन्द्रावती गाउँपालिका', 'जुगल गाउँपालिका', 'पाँचपोखरी गाउँपालिका', 'बलेफी गाउँपालिका', 'सुनकोशी गाउँपालिका', 'हेलम्बु गाउँपालिका', 'त्रिपुरासुन्दरी गाउँपालिका', 'लिसाङखु गाउँपालिका'] },
        'rasuwa': { np: 'रसुवा', en: 'Rasuwa', municipalities: ['उत्तरगया गाउँपालिका', 'कालिका गाउँपालिका', 'गोसाइँकुण्ड गाउँपालिका', 'नौकुण्ड गाउँपालिका', 'पार्वतीकुण्ड गाउँपालिका', 'आमाछोदिङ्मो गाउँपालिका'] },
        'dhading': { np: 'धादिङ', en: 'Dhading', municipalities: ['धादिङबेसी नगरपालिका', 'निलकण्ठ नगरपालिका', 'खनियाबास गाउँपालिका', 'गजुरी गाउँपालिका', 'गल्छी गाउँपालिका', 'ज्वालामुखी गाउँपालिका', 'थाक्रे गाउँपालिका', 'नेत्रावती डबजोङ गाउँपालिका', 'बेनीघाट रोराङ गाउँपालिका', 'रुबी भ्याली गाउँपालिका', 'सिद्धलेक गाउँपालिका', 'त्रिपुरासुन्दरी गाउँपालिका', 'गंगाजमुना गाउँपालिका'] },
        'nuwakot': { np: 'नुवाकोट', en: 'Nuwakot', municipalities: ['विदुर नगरपालिका', 'ककनी गाउँपालिका', 'किस्पाङ गाउँपालिका', 'तादी गाउँपालिका', 'तारकेश्वर गाउँपालिका', 'दुप्चेश्वर गाउँपालिका', 'पञ्चकन्या गाउँपालिका', 'म्यागङ गाउँपालिका', 'सूर्यगढी गाउँपालिका', 'शिखर गाउँपालिका', 'बेलकोटगढी नगरपालिका', 'शिवपुरी गाउँपालिका'] },
        'sindhuli': { np: 'सिन्धुली', en: 'Sindhuli', municipalities: ['कमलामाई नगरपालिका', 'दुधौली नगरपालिका', 'मरिण गाउँपालिका', 'फिक्कल गाउँपालिका', 'घ्याङलेख गाउँपालिका', 'सुनकोशी गाउँपालिका', 'हरिहरपुरगढी गाउँपालिका', 'तिनपाटन गाउँपालिका', 'गोलन्जोर गाउँपालिका'] },
        'makwanpur': { np: 'मकवानपुर', en: 'Makwanpur', municipalities: ['हेटौंडा उपमहानगरपालिका', 'थाहा नगरपालिका', 'भीमफेदी गाउँपालिका', 'बकैया गाउँपालिका', 'बागमती गाउँपालिका', 'मकवानपुरगढी गाउँपालिका', 'मनहरी गाउँपालिका', 'राक्सिराङ गाउँपालिका', 'इन्द्रसरोवर गाउँपालिका', 'कैलाश गाउँपालिका'] },
        'ramechhap': { np: 'रामेछाप', en: 'Ramechhap', municipalities: ['मन्थली नगरपालिका', 'रामेछाप नगरपालिका', 'गोकुलगंगा गाउँपालिका', 'उमाकुण्ड गाउँपालिका', 'लिखु गाउँपालिका', 'दोरम्बा गाउँपालिका', 'खाँडादेवी गाउँपालिका', 'सुनापती गाउँपालिका', 'भञ्जीखोला गाउँपालिका'] },
        'dolakha': { np: 'दोलखा', en: 'Dolakha', municipalities: ['भीमेश्वर नगरपालिका', 'जिरी नगरपालिका', 'कालिञ्चोक गाउँपालिका', 'गौरीशंकर गाउँपालिका', 'तामाकोशी गाउँपालिका', 'बैतेश्वर गाउँपालिका', 'मेलुङ गाउँपालिका', 'शैलुङ गाउँपालिका', 'विगु गाउँपालिका'] },
        'chitwan': { np: 'चितवन', en: 'Chitwan', municipalities: ['भरतपुर महानगरपालिका', 'रत्ननगर नगरपालिका', 'कालिका नगरपालिका', 'खैरहनी नगरपालिका', 'माडी नगरपालिका', 'इच्छाकामना गाउँपालिका'] }
      }
    },
    province4: { 
      np: 'गण्डकी प्रदेश', 
      en: 'Gandaki Province', 
      districts: {
        'gorkha': { np: 'गोरखा', en: 'Gorkha', municipalities: ['गोरखा नगरपालिका', 'पालुङटार नगरपालिका', 'शहिद लखन गाउँपालिका', 'अजिरकोट गाउँपालिका', 'चुमनुव्री गाउँपालिका', 'धार्चे गाउँपालिका', 'भीमसेनथापा गाउँपालिका', 'सुलिकोट गाउँपालिका', 'सिरानचोक गाउँपालिका', 'गण्डकी गाउँपालिका'] },
        'lamjung': { np: 'लमजुङ', en: 'Lamjung', municipalities: ['बेसीशहर नगरपालिका', 'मध्यनेपाल नगरपालिका', 'राइनास नगरपालिका', 'सुन्दरबजार नगरपालिका', 'दोर्दी गाउँपालिका', 'क्व्होलासोथार गाउँपालिका', 'मर्स्याङ्दी गाउँपालिका', 'दूधपोखरी गाउँपालिका'] },
        'tanahu': { np: 'तनहुँ', en: 'Tanahun', municipalities: ['दमौली नगरपालिका', 'बन्दीपुर नगरपालिका', 'भानु नगरपालिका', 'शुक्लागण्डकी नगरपालिका', 'ब्यास नगरपालिका', 'ऋषिङ गाउँपालिका', 'देवघाट गाउँपालिका', 'म्याग्दे गाउँपालिका', 'आँबुखैरेनी गाउँपालिका', 'भिमाद गाउँपालिका', 'घिरिङ गाउँपालिका'] },
        'kaski': { np: 'कास्की', en: 'Kaski', municipalities: ['पोखरा महानगरपालिका', 'मादी नगरपालिका', 'रूपा गाउँपालिका', 'अन्नपूर्ण गाउँपालिका', 'माचापुच्छ्रे गाउँपालिका'] },
        'manang': { np: 'मनाङ', en: 'Manang', municipalities: ['चामे गाउँपालिका', 'नासो गाउँपालिका', 'नार्फु गाउँपालिका', 'मनाङ ङिस्याङ गाउँपालिका'] },
        'mustang': { np: 'मुस्ताङ', en: 'Mustang', municipalities: ['घरपझोङ गाउँपालिका', 'थासाङ गाउँपालिका', 'बाह्रगाउँ मुक्तिक्षेत्र गाउँपालिका', 'लोमान्थाङ गाउँपालिका', 'लोघेकर दामोदरकुण्ड गाउँपालिका'] },
        'myagdi': { np: 'म्याग्दी', en: 'Myagdi', municipalities: ['बेनी नगरपालिका', 'अन्नपूर्ण गाउँपालिका', 'मालिका गाउँपालिका', 'मंगला गाउँपालिका', 'धवलागिरी गाउँपालिका', 'रघुगंगा गाउँपालिका'] },
        'parbat': { np: 'पर्वत', en: 'Parbat', municipalities: ['कुश्मा नगरपालिका', 'फलेवास नगरपालिका', 'जलजला गाउँपालिका', 'पैयुँ गाउँपालिका', 'मोदी गाउँपालिका', 'बिहादी गाउँपालिका'] },
        'baglung': { np: 'बागलुङ', en: 'Baglung', municipalities: ['बागलुङ नगरपालिका', 'गलकोट नगरपालिका', 'जैमुनी नगरपालिका', 'ढोरपाटन नगरपालिका', 'बरेङ गाउँपालिका', 'काठेखोला गाउँपालिका', 'तमानखोला गाउँपालिका', 'निसीखोला गाउँपालिका', 'वडिगाड गाउँपालिका'] },
        'syangja': { np: 'स्याङ्जा', en: 'Syangja', municipalities: ['पुतलीबजार नगरपालिका', 'वालिङ नगरपालिका', 'चापाकोट नगरपालिका', 'गल्याङ नगरपालिका', 'विरुवा गाउँपालिका', 'अर्जुनचौपारी गाउँपालिका', 'कालीगण्डकी गाउँपालिका', 'फेदीखोला गाउँपालिका', 'आँधीखोला गाउँपालिका', 'हरिनास गाउँपालिका'] },
        'nawalpur': { np: 'नवलपुर', en: 'Nawalpur', municipalities: ['कावासोती नगरपालिका', 'गैंडाकोट नगरपालिका', 'देवचुली नगरपालिका', 'मध्यविन्दु नगरपालिका', 'बुलिङटार गाउँपालिका', 'बौदीकाली गाउँपालिका', 'हुप्सेकोट गाउँपालिका'] }
      }
    },
    province5: { 
      np: 'लुम्बिनी प्रदेश', 
      en: 'Lumbini Province', 
      districts: {
        'kapilbastu': { np: 'कपिलवस्तु', en: 'Kapilbastu', municipalities: ['कपिलवस्तु नगरपालिका', 'बाणगंगा नगरपालिका', 'बुद्धभूमि नगरपालिका', 'शिवराज नगरपालिका', 'महाराजगन्ज नगरपालिका', 'कृष्णनगर नगरपालिका', 'यशोधरा गाउँपालिका', 'विजयनगर गाउँपालिका', 'मायादेवी गाउँपालिका', 'सुद्धोधन गाउँपालिका'] },
        'rupandehi': { np: 'रुपन्देही', en: 'Rupandehi', municipalities: ['बुटवल उपमहानगरपालिका', 'तिलोत्तमा नगरपालिका', 'सिद्धार्थनगर नगरपालिका', 'देवदह नगरपालिका', 'लुम्बिनी सांस्कृतिक नगरपालिका', 'कञ्चन गाउँपालिका', 'गैडहवा गाउँपालिका', 'मायादेवी गाउँपालिका', 'कोटहीमाई गाउँपालिका', 'रोहिणी गाउँपालिका', 'सम्मरीमाई गाउँपालिका', 'शिवराज नगरपालिका'] },
        'arghakhanchi': { np: 'अर्घाखाँची', en: 'Arghakhanchi', municipalities: ['सन्धिखर्क नगरपालिका', 'सितगंगा नगरपालिका', 'भूमिकास्थान नगरपालिका', 'छत्रदेव गाउँपालिका', 'पाणिनी गाउँपालिका', 'मालारानी गाउँपालिका'] },
        'gulmi': { np: 'गुल्मी', en: 'Gulmi', municipalities: ['तम्घास नगरपालिका', 'रेसुङ्गा नगरपालिका', 'मुसिकोट नगरपालिका', 'कालीगण्डकी गाउँपालिका', 'गुल्मी दरबार गाउँपालिका', 'सत्यवती गाउँपालिका', 'चन्द्रकोट गाउँपालिका', 'रुरुक्षेत्र गाउँपालिका', 'छत्रकोट गाउँपालिका', 'धुर्कोट गाउँपालिका', 'मालिका गाउँपालिका'] },
        'palpa': { np: 'पाल्पा', en: 'Palpa', municipalities: ['तानसेन नगरपालिका', 'रामपुर नगरपालिका', 'पूर्वखोला गाउँपालिका', 'निस्दी गाउँपालिका', 'रिब्दीकोट गाउँपालिका', 'रैनादेवी छहरा गाउँपालिका', 'माथागढी गाउँपालिका', 'बगनासकाली गाउँपालिका', 'तिनाउ गाउँपालिका'] },
        'dang': { np: 'दाङ', en: 'Dang', municipalities: ['घोराही उपमहानगरपालिका', 'तुल्सीपुर उपमहानगरपालिका', 'लमही नगरपालिका', 'गढवा गाउँपालिका', 'राप्ती गाउँपालिका', 'बंगलाचुली गाउँपालिका', 'बबई गाउँपालिका', 'राजपुर गाउँपालिका', 'शान्तिनगर गाउँपालिका', 'धनगढी गाउँपालिका'] },
        'pyuthan': { np: 'प्युठान', en: 'Pyuthan', municipalities: ['प्युठान नगरपालिका', 'स्वर्गद्वारी नगरपालिका', 'ऐरावती गाउँपालिका', 'झिमरुक गाउँपालिका', 'मल्लरानी गाउँपालिका', 'नौवहिनी गाउँपालिका', 'गौमुखी गाउँपालिका', 'मण्डवी गाउँपालिका'] },
        'rolpa': { np: 'रोल्पा', en: 'Rolpa', municipalities: ['लिवाङ नगरपालिका', 'सुलिचौर नगरपालिका', 'थवाङ गाउँपालिका', 'परिवर्तन गाउँपालिका', 'माडी गाउँपालिका', 'रुन्टीगढी गाउँपालिका', 'गंगादेव गाउँपालिका', 'सुनछहरी गाउँपालिका', 'सुनिल स्मृति गाउँपालिका'] },
        'banke': { np: 'बाँके', en: 'Banke', municipalities: ['नेपालगञ्ज उपमहानगरपालिका', 'कोहलपुर नगरपालिका', 'राप्ती सोनारी गाउँपालिका', 'बैजनाथ गाउँपालिका', 'नरैनापुर गाउँपालिका', 'डुडुवा गाउँपालिका', 'खजुरा गाउँपालिका', 'जानकी गाउँपालिका'] },
        'bardiya': { np: 'बर्दिया', en: 'Bardiya', municipalities: ['गुलरिया नगरपालिका', 'राजापुर नगरपालिका', 'मधुवन नगरपालिका', 'ठाकुरबाबा नगरपालिका', 'बाँसगढी नगरपालिका', 'बर्बर्दिया गाउँपालिका', 'गेरुवा गाउँपालिका'] }
      }
    },
    province6: { 
      np: 'कर्णाली प्रदेश', 
      en: 'Karnali Province', 
      districts: {
        'western_ruku': { np: 'पश्चिमी रुकुम', en: 'Western Rukum', municipalities: ['मुसिकोट नगरपालिका', 'चौरजहारी नगरपालिका', 'आठबिसकोट नगरपालिका', 'बाँफिकोट गाउँपालिका', 'त्रिवेणी गाउँपालिका', 'सानीभेरी गाउँपालिका', 'पुथा उत्तरगंगा गाउँपालिका'] },
        'salyan': { np: 'सल्यान', en: 'Salyan', municipalities: ['शारदा नगरपालिका', 'बागचौर नगरपालिका', 'बनगाड कुपिण्डे नगरपालिका', 'कालिमाटी गाउँपालिका', 'त्रिवेणी गाउँपालिका', 'कपुरकोट गाउँपालिका', 'छत्रेश्वरी गाउँपालिका', 'दार्मा गाउँपालिका', 'सिद्धकुमाख गाउँपालिका'] },
        'dolpa': { np: 'डोल्पा', en: 'Dolpa', municipalities: ['ठुली भेरी नगरपालिका', 'त्रिपुरासुन्दरी नगरपालिका', 'डोल्पो बुद्ध गाउँपालिका', 'शे फोक्सुण्डो गाउँपालिका', 'मुड्केचुला गाउँपालिका', 'जगदुल्ला गाउँपालिका', 'काइके गाउँपालिका', 'छर्का तांग्सोन गाउँपालिका'] },
        'jumla': { np: 'जुम्ला', en: 'Jumla', municipalities: ['चन्दननाथ नगरपालिका', 'कनकासुन्दरी गाउँपालिका', 'सिञ्जा गाउँपालिका', 'हिमा गाउँपालिका', 'तिला गाउँपालिका', 'गुठीचौर गाउँपालिका', 'तातोपानी गाउँपालिका', 'पातारासी गाउँपालिका'] },
        'mugu': { np: 'मुगु', en: 'Mugu', municipalities: ['गमगढी नगरपालिका', 'सोरु गाउँपालिका', 'मुगुम कार्मारोङ गाउँपालिका', 'छायानाथ रारा गाउँपालिका'] },
        'humla': { np: 'हुम्ला', en: 'Humla', municipalities: ['सिमकोट गाउँपालिका', 'नाम्खा गाउँपालिका', 'खार्पुनाथ गाउँपालिका', 'सर्कीगाड गाउँपालिका', 'चंखेली गाउँपालिका', 'अदानचुली गाउँपालिका', 'ताँजाकोट गाउँपालिका'] },
        'kalikot': { np: 'कालिकोट', en: 'Kalikot', municipalities: ['खाँडाचक्र नगरपालिका', 'रास्कोट नगरपालिका', 'तिलागुफा नगरपालिका', 'पच्चालझरना गाउँपालिका', 'महावै गाउँपालिका', 'पलाता गाउँपालिका', 'नरहरिनाथ गाउँपालिका', 'कक्रेगाउँ गाउँपालिका', 'शुभकालिका गाउँपालिका', 'सान्नी त्रिवेणी गाउँपालिका'] },
        'dailekh': { np: 'दैलेख', en: 'Dailekh', municipalities: ['नारायण नगरपालिका', 'दुल्लु नगरपालिका', 'आठबीस नगरपालिका', 'चामुण्डा नगरपालिका', 'भैरवी गाउँपालिका', 'ठाँटीकाँध गाउँपालिका', 'गुराँस गाउँपालिका', 'डुंगेश्वर गाउँपालिका', 'महाबु गाउँपालिका', 'नवस्थान गाउँपालिका', 'सिंहासैन गाउँपालिका'] },
        'surkhet': { np: 'सुर्खेत', en: 'Surkhet', municipalities: ['वीरेन्द्रनगर नगरपालिका', 'भेरीगंगा नगरपालिका', 'गुर्भाकोट नगरपालिका', 'लेकबेशी नगरपालिका', 'पञ्चपुरी नगरपालिका', 'सिम्ता गाउँपालिका', 'चौकुने गाउँपालिका', 'बराहताल गाउँपालिका', 'चिङ्गाड गाउँपालिका'] },
        'jajarkot': { np: 'जाजरकोट', en: 'Jajarkot', municipalities: ['भेरी नगरपालिका', 'चेडागाड नगरपालिका', 'शिवालय गाउँपालिका', 'जुनीचाँदे गाउँपालिका', 'कुसे गाउँपालिका', 'नलगाड नगरपालिका'] }
      }
    },
    province7: { 
      np: 'सुदूरपश्चिम प्रदेश', 
      en: 'Sudurpashchim Province', 
      districts: {
        'bajura': { np: 'बाजुरा', en: 'Bajura', municipalities: ['बडीमालिका नगरपालिका', 'त्रिवेणी नगरपालिका', 'बुढीगंगा नगरपालिका', 'बुढीनन्दा नगरपालिका', 'जगन्नाथ गाउँपालिका', 'स्वामीकार्तिक गाउँपालिका', 'पाण्डव गाउँपालिका', 'हात्तीकाट गाउँपालिका', 'गौमुल गाउँपालिका'] },
        'bajhang': { np: 'बझाङ', en: 'Bajhang', municipalities: ['जयपृथ्वी नगरपालिका', 'बुङ्गल नगरपालिका', 'छबिसपाथिभेरा गाउँपालिका', 'दुर्गाथली गाउँपालिका', 'काँडा गाउँपालिका', 'केदारस्युँ गाउँपालिका', 'खप्तडछान्ना गाउँपालिका', 'मष्टा गाउँपालिका', 'साइपाल गाउँपालिका', 'तलकोट गाउँपालिका', 'थलारा गाउँपालिका'] },
        'doti': { np: 'डोटी', en: 'Doti', municipalities: ['दिपायल सिलगढी नगरपालिका', 'शिखर नगरपालिका', 'पूर्वीचौकी गाउँपालिका', 'बडीकेदार गाउँपालिका', 'जोरायल गाउँपालिका', 'केआइसिं गाउँपालिका', 'आदर्श गाउँपालिका', 'बोगटान गाउँपालिका'] },
        'achham': { np: 'अछाम', en: 'Achham', municipalities: ['मंगलसेन नगरपालिका', 'कमलबजार नगरपालिका', 'साँफेबगर नगरपालिका', 'पञ्चदेवल विनायक नगरपालिका', 'रामारोशन गाउँपालिका', 'चौरपाटी गाउँपालिका', 'तुर्माखाँद गाउँपालिका', 'ढकारी गाउँपालिका', 'बान्नीगढी जयगढ गाउँपालिका'] },
        'dadeldhura': { np: 'डडेल्धुरा', en: 'Dadeldhura', municipalities: ['अमरगढी नगरपालिका', 'परशुराम नगरपालिका', 'आलिताल गाउँपालिका', 'भागेश्वर गाउँपालिका', 'नवदुर्गा गाउँपालिका', 'अजयमेरु गाउँपालिका', 'गन्यापधुरा गाउँपालिका'] },
        'baitadi': { np: 'बैतडी', en: 'Baitadi', municipalities: ['दशरथचन्द नगरपालिका', 'पाटन नगरपालिका', 'मेलौली नगरपालिका', 'सुर्नया गाउँपालिका', 'सिगास गाउँपालिका', 'शिवनाथ गाउँपालिका', 'पञ्चेश्वर गाउँपालिका', 'दोगडाकेदार गाउँपालिका', 'दिलासैनी गाउँपालिका'] },
        'darchula': { np: 'दार्चुला', en: 'Darchula', municipalities: ['महाकाली नगरपालिका', 'शैल्यशिखर नगरपालिका', 'मालिकार्जुन गाउँपालिका', 'अपी हिमाल गाउँपालिका', 'दुहु गाउँपालिका', 'नौगाढ गाउँपालिका', 'लयाटी गाउँपालिका', 'लेकम गाउँपालिका'] },
        'kanchanpur': { np: 'कञ्चनपुर', en: 'Kanchanpur', municipalities: ['भीमदत्त नगरपालिका', 'पुनर्वास नगरपालिका', 'बेलौरी नगरपालिका', 'कृष्णपुर नगरपालिका', 'बेदकोट नगरपालिका', 'शुक्लाफाँटा नगरपालिका', 'महाकाली नगरपालिका', 'बेलडाँडी गाउँपालिका', 'लालझाँडी गाउँपालिका'] },
        'kailali': { np: 'कैलाली', en: 'Kailali', municipalities: ['धनगढी उपमहानगरपालिका', 'टीकापुर नगरपालिका', 'घोडाघोडी नगरपालिका', 'लम्की चुहा नगरपालिका', 'भजनी नगरपालिका', 'गोदावरी नगरपालिका', 'गौरीगंगा नगरपालिका', 'जानकी गाउँपालिका', 'बर्दगोरिया गाउँपालिका', 'मोहन्याल गाउँपालिका', 'कैलारी गाउँपालिका', 'चुरे गाउँपालिका'] }
      }
    }
  };

  const getDistricts = () => {
    if (!formData.state || !locationData[formData.state]) return [];
    const districts = locationData[formData.state].districts;
    return Object.keys(districts).map(key => ({
      value: key,
      label: language === 'np' ? districts[key].np : districts[key].en
    }));
  };

  const getMunicipalities = () => {
    if (!formData.state || !formData.district) return [];
    const stateData = locationData[formData.state];
    if (!stateData) return [];
    const districtData = stateData.districts[formData.district];
    if (!districtData || !districtData.municipalities) return [];
    
    return districtData.municipalities.map(mun => ({
      value: mun.toLowerCase().replace(/\s+/g, '_'),
      label: mun
    }));
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
      complaintDetails: 'उजुरीको विवरण',
      note: 'नोट: कृपया सही र विस्तृत जानकारी प्रदान गर्नुहोस् ताकि हामी तपाईंको समस्या छिटो समाधान गर्न सकौं।',
      natureOfComplaints: 'उजुरीको प्रकृति',
      selectNature: 'उजुरीको प्रकृति चयन गर्नुहोस्',
      serviceIssue: 'सेवा समस्या',
      billingIssue: 'बिलिङ समस्या',
      technicalIssue: 'प्राविधिक समस्या',
      networkCoverage: 'नेटवर्क कभरेज',
      signalIssue: 'सिग्नल समस्या',
      rechargeIssue: 'रिचार्ज समस्या',
      activationIssue: 'सक्रियता समस्या',
      otherComplaint: 'अन्य',
      problemCreatorName: 'उजुरीकर्ताको नाम',
      problemCreatorAddress: 'उजुरीकर्ताको ठेगाना',
      state: 'प्रदेश',
      district: 'जिल्ला',
      municipality: 'नगरपालिका/गाउँपालिका',
      wardNo: 'वडा नं.',
      streetAddress: 'टोल/गाउँ',
      emailAddress: 'इमेल ठेगाना',
      mobileNumber: 'मोबाइल नम्बर',
      relatedDocuments: 'सम्बन्धित कागजातहरू (यदि भएमा)',
      requiredField: 'आवश्यक फिल्ड',
      dropFile: 'आफ्नो फाइल यहाँ छोड्नुहोस् वा क्लिक गरेर अपलोड गर्नुहोस्',
      clickToUpload: 'अपलोड गर्न क्लिक गर्नुहोस्',
      complaintsBriefDescription: 'उजुरीको संक्षिप्त विवरण',
      enterComplaint: 'आफ्नो उजुरी प्रविष्ट गर्नुहोस्',
      registerComplaint: 'उजुरी दर्ता गर्नुहोस्',
      backToHome: 'गृह पृष्ठमा फर्कनुहोस्',
      footerTagline: 'एनटीसी सहयात्री - तपाईंको सेवामा सधैं',
      copyright: '© २०८२ एनटीसी गुनासो ट्र्याकिङ प्रणाली। सबै अधिकार सुरक्षित।',
      selectState: 'प्रदेश चयन गर्नुहोस्',
      selectDistrict: 'जिल्ला चयन गर्नुहोस्',
      selectMunicipality: 'नगरपालिका/गाउँपालिका चयन गर्नुहोस्',
      enterWardNo: 'वडा नं. प्रविष्ट गर्नुहोस्',
      submitting: 'दर्ता गर्दै...',
      submitSuccess: '✅ उजुरी सफलतापूर्वक दर्ता भयो!',
      ticketId: '📋 टिकेट नम्बर',
      password: '🔑 पासवर्ड',
      saveDetails: '💡 कृपया यो विवरण सुरक्षित राख्नुहोस्।',
      submitFailed: '❌ उजुरी दर्ता गर्न असफल। कृपया पछि प्रयास गर्नुहोस्।',
      close: 'बन्द गर्नुहोस्',
      trackNow: 'ट्र्याक गर्नुहोस्',
      enterStreetAddress: 'टोल/गाउँको नाम प्रविष्ट गर्नुहोस्',
      uploading: 'अपलोड हुँदै...',
      uploadComplete: 'अपलोड पूरा भयो',
      connectionError: 'सर्भरमा जडान हुन सकेन। कृपया पछि प्रयास गर्नुहोस्।',
      submittedDate: 'दर्ता मिति',
      submittedDateNp: 'नेपाली मिति',
      submittedDateEn: 'अंग्रेजी मिति',
      submittedDateNpDigits: 'नेपाली मिति (अंकमा)',
      dateLabel: '📅 मिति जानकारी'
    },
    en: {
      weAreHere: 'We are here for you',
      contactNumber: '01-4960008',
      emailAddress: 'coo@ntc.net.np',
      departmentName: 'Nepal Telecommunications Authority',
      departmentAddress: 'Bhadrakali Plaza, Kathmandu',
      serviceName: 'NTC Sahayatri',
      serviceSub: 'Complaint Tracking System',
      home: 'Home',
      faqs: 'FAQs',
      login: 'Login',
      complaintDetails: 'Complaint Details',
      note: 'Note: Kindly provide accurate and detailed information to help us resolve your issue quickly',
      natureOfComplaints: 'Nature of Complaints',
      selectNature: 'Select nature of complaint',
      serviceIssue: 'Service Issue',
      billingIssue: 'Billing Issue',
      technicalIssue: 'Technical Issue',
      networkCoverage: 'Network Coverage',
      signalIssue: 'Signal Issue',
      rechargeIssue: 'Recharge Issue',
      activationIssue: 'Activation Issue',
      otherComplaint: 'Other',
      problemCreatorName: "Problem Creator's Name",
      problemCreatorAddress: "Problem Creator's Address",
      state: 'State/Province',
      district: 'District',
      municipality: 'Municipality/Rural Municipality',
      wardNo: 'Ward No.',
      streetAddress: 'Tole/Village',
      emailAddress: 'Email Address',
      mobileNumber: 'Mobile Number',
      relatedDocuments: 'Related Documents (If any)',
      requiredField: 'Required field',
      dropFile: 'Drop your file here or click to upload from your computer',
      clickToUpload: 'Click to upload',
      complaintsBriefDescription: "Complaint's Brief Description",
      enterComplaint: 'Enter your complaint in detail',
      registerComplaint: 'Register Complaint',
      backToHome: 'Back to Home',
      footerTagline: 'NTC Sahayatri - Always at Your Service',
      copyright: '© 2026 NTC Complaint Tracking System. All rights reserved.',
      selectState: 'Select Province',
      selectDistrict: 'Select District',
      selectMunicipality: 'Select Municipality/Rural Municipality',
      enterWardNo: 'Enter Ward No.',
      submitting: 'Submitting...',
      submitSuccess: '✅ Complaint registered successfully!',
      ticketId: '📋 Ticket ID',
      password: '🔑 Password',
      saveDetails: '💡 Please save these details to track your complaint.',
      submitFailed: '❌ Failed to submit complaint. Please try again later.',
      close: 'Close',
      trackNow: 'Track Now',
      enterStreetAddress: 'Enter tole/village name',
      uploading: 'Uploading...',
      uploadComplete: 'Upload complete',
      connectionError: 'Cannot connect to server. Please try again later.',
      submittedDate: 'Submitted Date',
      submittedDateNp: 'Nepali Date',
      submittedDateEn: 'English Date',
      submittedDateNpDigits: 'Nepali Date (in digits)',
      dateLabel: '📅 Date Information'
    }
  };

  const t = content[language];

  const provinces = [
    { value: 'province1', np: 'कोशी प्रदेश', en: 'Koshi Province' },
    { value: 'province2', np: 'मधेश प्रदेश', en: 'Madhesh Province' },
    { value: 'province3', np: 'बागमती प्रदेश', en: 'Bagmati Province' },
    { value: 'province4', np: 'गण्डकी प्रदेश', en: 'Gandaki Province' },
    { value: 'province5', np: 'लुम्बिनी प्रदेश', en: 'Lumbini Province' },
    { value: 'province6', np: 'कर्णाली प्रदेश', en: 'Karnali Province' },
    { value: 'province7', np: 'सुदूरपश्चिम प्रदेश', en: 'Sudurpashchim Province' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '', municipality: '' }));
    } else if (name === 'district') {
      setFormData(prev => ({ ...prev, district: value, municipality: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size should be less than 5MB', 'error');
        return;
      }
      setSelectedFile(file);
      setUploadProgress(0);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size should be less than 5MB', 'error');
        return;
      }
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  // Function to get formatted date for display
  const getFormattedDate = () => {
    const nepaliDate = getNepaliDate();
    const englishDate = getEnglishDate();
    
    return {
      np: {
        full: nepaliDate.fullDate,
        short: nepaliDate.shortDate,
        withDigits: `${toNepaliDigits(nepaliDate.day)} ${nepaliDate.month} ${toNepaliDigits(nepaliDate.year)}`
      },
      en: {
        full: englishDate.fullDate,
        short: englishDate.shortDate
      }
    };
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!formData.natureOfComplaint) {
      showToast(language === 'np' ? 'कृपया उजुरीको प्रकृति चयन गर्नुहोस्।' : 'Please select nature of complaint.', 'error');
      return;
    }
    
    if (!formData.name) {
      showToast(language === 'np' ? 'कृपया पुरा नाम भर्नुहोस्।' : 'Please enter your name.', 'error');
      return;
    }
    
    if (!formData.email || !formData.phone) {
      showToast(language === 'np' ? 'कृपया इमेल र मोबाइल नम्बर भर्नुहोस्।' : 'Please enter email and mobile number.', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast(language === 'np' ? 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।' : 'Please enter a valid email address.', 'error');
      return;
    }
    
    const phoneRegex = /^[9][7-8][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      showToast(language === 'np' ? 'कृपया मान्य मोबाइल नम्बर प्रविष्ट गर्नुहोस् (९८XXXXXXXX)' : 'Please enter a valid mobile number (98XXXXXXXX)', 'error');
      return;
    }
    
    if (!formData.description) {
      showToast(language === 'np' ? 'कृपया उजुरीको विवरण भर्नुहोस्।' : 'Please describe your complaint.', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Get current date information
      const nepaliDate = getNepaliDate();
      const englishDate = getEnglishDate();
      
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add date information to the form data
      formDataToSend.append('submittedDateEn', englishDate.fullDate);
      formDataToSend.append('submittedDateNp', nepaliDate.fullDate);
      formDataToSend.append('submittedDateShort', englishDate.shortDate);
      formDataToSend.append('submittedDateNpShort', nepaliDate.shortDate);
      formDataToSend.append('submittedDateNpDigits', `${toNepaliDigits(nepaliDate.day)} ${nepaliDate.month} ${toNepaliDigits(nepaliDate.year)}`);
      formDataToSend.append('submittedYearNp', String(nepaliDate.year));
      formDataToSend.append('submittedMonthNp', nepaliDate.month);
      formDataToSend.append('submittedDayNp', String(nepaliDate.day));
      formDataToSend.append('submittedWeekdayNp', nepaliDate.weekday);
      formDataToSend.append('submittedYearEn', englishDate.yearEn);
      formDataToSend.append('submittedMonthEn', englishDate.monthEn);
      formDataToSend.append('submittedDayEn', englishDate.dayEn);
      formDataToSend.append('submittedWeekdayEn', englishDate.weekday);
      
      if (selectedFile) {
        formDataToSend.append('attachment', selectedFile);
      }
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await axios.post(`${API_URL}/complaints`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.data.success) {
        // Add date information to success data
        const formattedDate = getFormattedDate();
        const successDataWithDate = {
          ...response.data.data,
          dateInfo: {
            np: formattedDate.np,
            en: formattedDate.en,
            nepaliDate: nepaliDate,
            englishDate: englishDate
          }
        };
        setSuccessData(successDataWithDate);
        setShowSuccess(true);
        
        setFormData({
          natureOfComplaint: '',
          name: '',
          state: '',
          district: '',
          municipality: '',
          wardNo: '',
          streetAddress: '',
          email: '',
          phone: '',
          description: ''
        });
        setSelectedFile(null);
        setUploadProgress(0);
        
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        
        showToast(t.submitSuccess, 'success');
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
    <div className="submit-complaint-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>✕</button>
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

      {/* HEADER 2 - Department Level */}
      <div className="header-2">
        <div className="container-2">
          <div className="logo-left">
            <LogoImage src={ntcLogo} alt="NTC Logo" fallback="📡" className="ntc-logo" />
          </div>
          <div className="dept-text-center">
            <div className="dept-name">{t.departmentName}</div>
            <div className="dept-address">{t.departmentAddress}</div>
          </div>
          <div className="logo-right">
            <LogoImage src={govLogo} alt="Government Logo" fallback="🇳🇵" className="gov-logo" />
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
        <div className="submit-container">
          <div className="submit-card">
            <div className="submit-header">
              <h2>📋 {t.complaintDetails}</h2>
              <div className="note-box">
                <span className="note-icon">📌</span>
                <p>{t.note}</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmitComplaint} className="submit-form">
              {/* Nature of Complaints */}
              <div className="form-section">
                <h3 className="section-title">{t.natureOfComplaints} <span className="required-star">*</span></h3>
                <div className="form-group">
                  <select 
                    name="natureOfComplaint" 
                    value={formData.natureOfComplaint} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="">{t.selectNature}</option>
                    <option value="service">{t.serviceIssue}</option>
                    <option value="billing">{t.billingIssue}</option>
                    <option value="technical">{t.technicalIssue}</option>
                    <option value="network">{t.networkCoverage}</option>
                    <option value="signal">{t.signalIssue}</option>
                    <option value="recharge">{t.rechargeIssue}</option>
                    <option value="activation">{t.activationIssue}</option>
                    <option value="other">{t.otherComplaint}</option>
                  </select>
                </div>
              </div>

              {/* Problem Creator's Name */}
              <div className="form-section">
                <h3 className="section-title">{t.problemCreatorName} <span className="required-star">*</span></h3>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder={t.problemCreatorName}
                    required 
                  />
                </div>
              </div>

              {/* Problem Creator's Address */}
              <div className="form-section">
                <h3 className="section-title">{t.problemCreatorAddress}</h3>
                <div className="address-grid">
                  <div className="form-group">
                    <select 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange}
                    >
                      <option value="">{t.selectState}</option>
                      {provinces.map(province => (
                        <option key={province.value} value={province.value}>
                          {language === 'np' ? province.np : province.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <select 
                      name="district" 
                      value={formData.district} 
                      onChange={handleInputChange}
                      disabled={!formData.state}
                    >
                      <option value="">{t.selectDistrict}</option>
                      {getDistricts().map(district => (
                        <option key={district.value} value={district.value}>
                          {district.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <select 
                      name="municipality" 
                      value={formData.municipality} 
                      onChange={handleInputChange}
                      disabled={!formData.district}
                    >
                      <option value="">{t.selectMunicipality}</option>
                      {getMunicipalities().map(mun => (
                        <option key={mun.value} value={mun.value}>
                          {mun.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="wardNo" 
                      value={formData.wardNo} 
                      onChange={handleInputChange} 
                      placeholder={t.enterWardNo}
                    />
                  </div>
                  <div className="form-group full-width">
                    <input 
                      type="text" 
                      name="streetAddress" 
                      value={formData.streetAddress} 
                      onChange={handleInputChange} 
                      placeholder={t.enterStreetAddress}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Row */}
              <div className="form-row">
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder={t.emailAddress}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder={t.mobileNumber}
                    required 
                  />
                </div>
              </div>

              {/* Related Documents */}
              <div className="form-section">
                <h3 className="section-title">{t.relatedDocuments}</h3>
                <div className="document-upload">
                  <div className="required-fields">
                    <span className="required-badge">{t.requiredField}</span>
                    <span className="required-badge">{t.requiredField}</span>
                  </div>
                  <div 
                    className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <div className="drop-zone-content">
                      <span className="upload-icon">📁</span>
                      <p>{t.dropFile}</p>
                      <button type="button" className="upload-btn">{t.clickToUpload}</button>
                    </div>
                    <input 
                      type="file" 
                      id="fileInput" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }} 
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                  {selectedFile && (
                    <div className="selected-file">
                      <span>📄 {selectedFile.name}</span>
                      {isSubmitting && uploadProgress < 100 && (
                        <div className="upload-progress">
                          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                          <span className="progress-text">{uploadProgress}% {t.uploading}</span>
                        </div>
                      )}
                      {!isSubmitting && (
                        <button type="button" onClick={() => setSelectedFile(null)}>✕</button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Complaint Description */}
              <div className="form-section">
                <h3 className="section-title">{t.complaintsBriefDescription} <span className="required-star">*</span></h3>
                <div className="form-group">
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows="6" 
                    placeholder={t.enterComplaint}
                    required
                  ></textarea>
                </div>
              </div>
              
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? `⏳ ${t.submitting}` : `📌 ${t.registerComplaint}`}
              </button>
            </form>
            
            <div className="back-to-home">
              <button onClick={() => navigate('/')} className="btn-back">
                ← {t.backToHome}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal with Date Information */}
      {showSuccess && successData && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✅</div>
            <h3>{t.submitSuccess}</h3>
            <div className="success-details">
              <p><strong>{t.ticketId}:</strong> {language === 'np' ? successData.complaintNumberNp : successData.complaintNumber}</p>
              <p><strong>{t.password}:</strong> {successData.trackingPassword}</p>
              
              {/* Date Information Section */}
              <div className="date-info-section">
                <p className="date-label">{t.dateLabel}</p>
                <div className="date-display">
                  {/* Nepali Date */}
                  <div className="date-item nepali-date">
                    <span className="date-icon">🇳🇵</span>
                    <span className="date-label-text">{t.submittedDateNp}:</span>
                    <span className="date-value-text">{successData.dateInfo?.np?.full || ''}</span>
                  </div>
                  {/* Nepali Date with Digits */}
                  {successData.dateInfo?.np?.withDigits && (
                    <div className="date-item nepali-digits">
                      <span className="date-icon">🔢</span>
                      <span className="date-label-text">{t.submittedDateNpDigits}:</span>
                      <span className="date-value-text nepali-digit-value">{successData.dateInfo.np.withDigits}</span>
                    </div>
                  )}
                  {/* English Date */}
                  <div className="date-item english-date">
                    <span className="date-icon">🇬🇧</span>
                    <span className="date-label-text">{t.submittedDateEn}:</span>
                    <span className="date-value-text">{successData.dateInfo?.en?.full || ''}</span>
                  </div>
                </div>
              </div>
              
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

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .submit-complaint-page {
          font-family: 'Poppins', 'Mangal', 'Preeti', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
          color: #1a2c3e;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Toast Notification */
        .toast-notification {
          position: fixed;
          top: 200px;
          right: 20px;
          z-index: 3000;
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
        
        .toast-icon { font-size: 1.2rem; }
        .toast-message { font-size: 0.85rem; color: #1f2937; flex: 1; }
        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 1rem;
          padding: 0 4px;
        }
        .toast-close:hover { color: #666; }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Upload Progress */
        .upload-progress {
          margin-top: 8px;
          width: 100%;
        }
        .progress-bar {
          height: 4px;
          background: #1565c0;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .progress-text {
          font-size: 0.7rem;
          color: #1565c0;
          margin-left: 8px;
        }

        /* HEADER 1 */
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

        /* HEADER 2 */
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

        /* HEADER 3 */
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

        .submit-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .submit-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .submit-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .submit-header h2 {
          font-size: 1.8rem;
          color: #0d47a1;
          margin-bottom: 20px;
        }

        .note-box {
          background: #f0f7ff;
          border-left: 4px solid #1565c0;
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .note-icon { font-size: 1.2rem; }
        .note-box p { color: #2c4e6e; font-size: 0.9rem; margin: 0; }

        .submit-form { text-align: left; }
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
        .required-star { color: #dc3545; font-size: 1rem; }
        .form-group { margin-bottom: 16px; }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: white;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1565c0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
        }
        select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .full-width { grid-column: 1 / -1; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }

        /* Document Upload */
        .document-upload { margin-top: 8px; }
        .required-fields { display: flex; gap: 12px; margin-bottom: 16px; }
        .required-badge {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          color: #666;
        }
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
        .upload-icon { font-size: 3rem; }
        .drop-zone p { color: #888; font-size: 0.85rem; margin: 0; }
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
        .selected-file {
          margin-top: 16px;
          padding: 12px 16px;
          background: #e8f0fe;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .selected-file button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #dc3545; }

        .btn-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          color: white;
          border: none;
          border-radius: 40px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 20px;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(21, 101, 192, 0.3); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
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

        .success-modal {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.3s ease;
        }

        .success-icon { font-size: 4rem; margin-bottom: 20px; }
        .success-modal h3 { color: #0d47a1; font-size: 1.5rem; margin-bottom: 20px; }
        .success-details {
          background: #f0f7ff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: left;
        }
        .success-details p { margin: 10px 0; font-size: 1rem; }
        .success-details strong { color: #0d47a1; }
        
        /* Date Information Styling */
        .date-info-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #e0e0e0;
        }
        .date-label {
          font-weight: 600;
          color: #0d47a1;
          margin-bottom: 12px;
          font-size: 0.95rem;
        }
        .date-display {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .date-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 6px;
          flex-wrap: wrap;
        }
        .date-item.nepali-date {
          background: #e8f5e9;
        }
        .date-item.nepali-digits {
          background: #fff3e0;
        }
        .date-item.english-date {
          background: #e3f2fd;
        }
        .date-icon {
          font-size: 1rem;
        }
        .date-label-text {
          font-weight: 500;
          color: #555;
          font-size: 0.8rem;
        }
        .date-value-text {
          font-weight: 500;
          color: #1a2c3e;
          font-size: 0.85rem;
        }
        .nepali-digit-value {
          font-size: 1rem;
          color: #0d47a1;
          font-weight: 600;
        }
        
        .save-warning { color: #ff9800; font-size: 0.85rem; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; }
        .modal-buttons { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
        .btn-close, .btn-track {
          padding: 12px 24px;
          border: none;
          border-radius: 40px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-close { background: #f0f0f0; color: #666; }
        .btn-close:hover { background: #e0e0e0; }
        .btn-track { background: linear-gradient(135deg, #1565c0, #0d47a1); color: white; }
        .btn-track:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(21,101,192,0.3); }

        /* Footer */
        .footer {
          background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
          color: white;
          text-align: center;
          padding: 20px;
          margin-top: auto;
        }
        .footer-content p { margin: 5px 0; font-size: 0.85rem; }
        .copyright { opacity: 0.7; font-size: 0.75rem; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        /* Responsive */
        @media (max-width: 768px) {
          .main-content { margin-top: 330px; }
          .submit-card { padding: 28px 20px; }
          .submit-header h2 { font-size: 1.4rem; }
          .address-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; gap: 16px; }
          .container-1, .container-2, .container-3 { padding: 0 20px; }
          .contact-info-group { flex-direction: column; gap: 8px; }
          .success-modal { padding: 25px; margin: 20px; }
          .modal-buttons { flex-direction: column; }
          .header-left, .header-right, .logo-left, .logo-right, .nav-menu-left { justify-content: center; }
          .container-1, .container-2, .container-3 { flex-direction: column; text-align: center; }
          .date-item { flex-direction: column; align-items: flex-start; gap: 4px; }
        }

        @media (max-width: 480px) {
          .submit-card { padding: 20px 16px; }
          .section-title { font-size: 1rem; }
          .btn-submit { font-size: 0.95rem; padding: 14px; }
          .success-modal { padding: 20px; }
          .date-item { padding: 8px; }
          .date-value-text { font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default SubmitComplaint;