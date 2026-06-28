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
  
  let bsYear = date.getFullYear() - 57;
  let bsMonth = date.getMonth();
  let bsDay = date.getDate();
  let bsWeekday = date.getDay();
  
  if (date.getMonth() < 3) {
    bsYear = date.getFullYear() - 56;
    bsMonth = date.getMonth() + 9;
  } else {
    bsYear = date.getFullYear() - 57;
    bsMonth = date.getMonth() - 3;
  }
  
  if (bsMonth < 0) {
    bsMonth += 12;
    bsYear -= 1;
  }
  
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
    subject: '',
    subjectEn: '',
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

  // Complete Nepal Location Data with all 77 districts and bilingual municipalities
  const locationData = {
    // Province 1 - Koshi Province (14 districts)
    province1: { 
      np: 'कोशी प्रदेश', 
      en: 'Koshi Province', 
      districts: {
        'taplejung': { 
          np: 'ताप्लेजुङ', 
          en: 'Taplejung', 
          municipalities: [
            { np: 'फुङलिङ नगरपालिका', en: 'Phungling Municipality' },
            { np: 'सिदिङ्वा गाउँपालिका', en: 'Sidingwa Rural Municipality' },
            { np: 'मैवाखोला गाउँपालिका', en: 'Maiwakhola Rural Municipality' },
            { np: 'मिक्वाखोला गाउँपालिका', en: 'Mikwakhola Rural Municipality' },
            { np: 'आठराई त्रिवेणी गाउँपालिका', en: 'Aathrai Tribeni Rural Municipality' },
            { np: 'सिरीजङ्घा गाउँपालिका', en: 'Sirijangha Rural Municipality' },
            { np: 'पाथीभरा याङवरक गाउँपालिका', en: 'Pathibhara Yangwarak Rural Municipality' }
          ] 
        },
        'panchthar': { 
          np: 'पाँचथर', 
          en: 'Panchthar', 
          municipalities: [
            { np: 'फिदिम नगरपालिका', en: 'Phidim Municipality' },
            { np: 'फालेलुङ गाउँपालिका', en: 'Phalelung Rural Municipality' },
            { np: 'फाल्गुनन्द गाउँपालिका', en: 'Falgunanda Rural Municipality' },
            { np: 'हिलिहाङ गाउँपालिका', en: 'Hilijhang Rural Municipality' },
            { np: 'कुम्मायक गाउँपालिका', en: 'Kummayak Rural Municipality' },
            { np: 'मिक्लाजुङ गाउँपालिका', en: 'Miklajung Rural Municipality' },
            { np: 'तुम्बेवा गाउँपालिका', en: 'Tumbewa Rural Municipality' },
            { np: 'याङवरक गाउँपालिका', en: 'Yangwarak Rural Municipality' }
          ] 
        },
        'ilam': { 
          np: 'इलाम', 
          en: 'Ilam', 
          municipalities: [
            { np: 'इलाम नगरपालिका', en: 'Ilam Municipality' },
            { np: 'सूर्योदय नगरपालिका', en: 'Suryodaya Municipality' },
            { np: 'देउमाई नगरपालिका', en: 'Deumai Municipality' },
            { np: 'माई नगरपालिका', en: 'Mai Municipality' },
            { np: 'माङसेबुङ गाउँपालिका', en: 'Mangsebung Rural Municipality' },
            { np: 'रोङ गाउँपालिका', en: 'Rong Rural Municipality' },
            { np: 'फाकफोकथुम गाउँपालिका', en: 'Phakphokthum Rural Municipality' },
            { np: 'चुलाचुली गाउँपालिका', en: 'Chulachuli Rural Municipality' },
            { np: 'सन्दकपुर गाउँपालिका', en: 'Sandakpur Rural Municipality' },
            { np: 'जिरीखिम्ती गाउँपालिका', en: 'Jirikhimti Rural Municipality' }
          ] 
        },
        'jhapa': { 
          np: 'झापा', 
          en: 'Jhapa', 
          municipalities: [
            { np: 'मेचीनगर नगरपालिका', en: 'Mechinagar Municipality' },
            { np: 'बिर्तामोड नगरपालिका', en: 'Birtamod Municipality' },
            { np: 'दमक नगरपालिका', en: 'Damak Municipality' },
            { np: 'भद्रपुर नगरपालिका', en: 'Bhadrapur Municipality' },
            { np: 'शिवसताक्षी नगरपालिका', en: 'Shivasatakshi Municipality' },
            { np: 'अर्जुनधारा नगरपालिका', en: 'Arjundhara Municipality' },
            { np: 'गौरादह नगरपालिका', en: 'Gauradaha Municipality' },
            { np: 'कन्काई नगरपालिका', en: 'Kankai Municipality' },
            { np: 'बाह्रदशी गाउँपालिका', en: 'Bahradashi Rural Municipality' },
            { np: 'हल्दिवारी गाउँपालिका', en: 'Haldibari Rural Municipality' },
            { np: 'कमल गाउँपालिका', en: 'Kamal Rural Municipality' },
            { np: 'बुद्धशान्ति गाउँपालिका', en: 'Buddhashanti Rural Municipality' },
            { np: 'झापा गाउँपालिका', en: 'Jhapa Rural Municipality' },
            { np: 'बारहपोखरी गाउँपालिका', en: 'Barahapokhari Rural Municipality' }
          ] 
        },
        'morang': { 
          np: 'मोरङ', 
          en: 'Morang', 
          municipalities: [
            { np: 'बिराटनगर महानगरपालिका', en: 'Biratnagar Metropolitan City' },
            { np: 'सुन्दरहरैंचा नगरपालिका', en: 'Sundar Haraicha Municipality' },
            { np: 'बेलवारी नगरपालिका', en: 'Belwari Municipality' },
            { np: 'पथरी शनिश्चरे नगरपालिका', en: 'Pathari Shanishchare Municipality' },
            { np: 'रंगेली नगरपालिका', en: 'Rangeli Municipality' },
            { np: 'लेटाङ नगरपालिका', en: 'Letang Municipality' },
            { np: 'उर्लावारी नगरपालिका', en: 'Urlabari Municipality' },
            { np: 'कटहरी गाउँपालिका', en: 'Katahari Rural Municipality' },
            { np: 'ग्रामथान गाउँपालिका', en: 'Gramthan Rural Municipality' },
            { np: 'केरावारी गाउँपालिका', en: 'Kerabari Rural Municipality' },
            { np: 'मिक्लाजुङ गाउँपालिका', en: 'Miklajung Rural Municipality' },
            { np: 'धनपालथान गाउँपालिका', en: 'Dhanpalthan Rural Municipality' },
            { np: 'जहदा गाउँपालिका', en: 'Jahada Rural Municipality' },
            { np: 'बुढीगंगा गाउँपालिका', en: 'Budhiganga Rural Municipality' }
          ] 
        },
        'sunsari': { 
          np: 'सुनसरी', 
          en: 'Sunsari', 
          municipalities: [
            { np: 'धरान उपमहानगरपालिका', en: 'Dharan Sub-Metropolitan City' },
            { np: 'ईटहरी उपमहानगरपालिका', en: 'Itahari Sub-Metropolitan City' },
            { np: 'इनरुवा नगरपालिका', en: 'Inaruwa Municipality' },
            { np: 'दुहबी नगरपालिका', en: 'Duhabi Municipality' },
            { np: 'रामधुनी नगरपालिका', en: 'Ramdhuni Municipality' },
            { np: 'बराहक्षेत्र नगरपालिका', en: 'Barahkshetra Municipality' },
            { np: 'कोशी गाउँपालिका', en: 'Koshi Rural Municipality' },
            { np: 'हरिनगरा गाउँपालिका', en: 'Haringara Rural Municipality' },
            { np: 'भोक्राहा नरसिंह गाउँपालिका', en: 'Bhokraha Narsingh Rural Municipality' },
            { np: 'देवानगन्ज गाउँपालिका', en: 'Devanaganj Rural Municipality' },
            { np: 'गढी गाउँपालिका', en: 'Gadhi Rural Municipality' }
          ] 
        },
        'bhojpur': { 
          np: 'भोजपुर', 
          en: 'Bhojpur', 
          municipalities: [
            { np: 'भोजपुर नगरपालिका', en: 'Bhojpur Municipality' },
            { np: 'शदानन्द नगरपालिका', en: 'Shadananda Municipality' },
            { np: 'पौवादुङमा गाउँपालिका', en: 'Pauwadungma Rural Municipality' },
            { np: 'रामप्रसाद राई गाउँपालिका', en: 'Ramprasad Rai Rural Municipality' },
            { np: 'अरुण गाउँपालिका', en: 'Arun Rural Municipality' },
            { np: 'साल्पासिलिछो गाउँपालिका', en: 'Salpasilichho Rural Municipality' },
            { np: 'हतुवागढी गाउँपालिका', en: 'Hatuvagadhi Rural Municipality' },
            { np: 'टेम्केमैयुङ गाउँपालिका', en: 'Temkemaiyung Rural Municipality' }
          ] 
        },
        'dhankuta': { 
          np: 'धनकुटा', 
          en: 'Dhankuta', 
          municipalities: [
            { np: 'धनकुटा नगरपालिका', en: 'Dhankuta Municipality' },
            { np: 'पाख्रिवास नगरपालिका', en: 'Pakribas Municipality' },
            { np: 'महालक्ष्मी नगरपालिका', en: 'Mahalaxmi Municipality' },
            { np: 'साँगुरीगढी गाउँपालिका', en: 'Sangurigadhi Rural Municipality' },
            { np: 'चौविसे गाउँपालिका', en: 'Chauwisse Rural Municipality' },
            { np: 'सहिदभूमि गाउँपालिका', en: 'Sahidbhumi Rural Municipality' },
            { np: 'खाल्सा छिन्ताङ गाउँपालिका', en: 'Khalsa Chhintang Rural Municipality' }
          ] 
        },
        'terhathum': { 
          np: 'तेह्रथुम', 
          en: 'Terhathum', 
          municipalities: [
            { np: 'म्याङलुङ नगरपालिका', en: 'Myanglung Municipality' },
            { np: 'लालीगुराँस नगरपालिका', en: 'Laligurans Municipality' },
            { np: 'आठराई गाउँपालिका', en: 'Aathrai Rural Municipality' },
            { np: 'छथर गाउँपालिका', en: 'Chhathar Rural Municipality' },
            { np: 'पेदाङ गाउँपालिका', en: 'Pedang Rural Municipality' },
            { np: 'मेन्छयायेम गाउँपालिका', en: 'Menchhyayem Rural Municipality' }
          ] 
        },
        'sankhuwasabha': { 
          np: 'सङ्खुवासभा', 
          en: 'Sankhuwasabha', 
          municipalities: [
            { np: 'खाँदबारी नगरपालिका', en: 'Khandbari Municipality' },
            { np: 'चैनपुर नगरपालिका', en: 'Chainpur Municipality' },
            { np: 'धर्मदेवी नगरपालिका', en: 'Dharmadevi Municipality' },
            { np: 'पाँचखपन गाउँपालिका', en: 'Panchkhapan Rural Municipality' },
            { np: 'मादी गाउँपालिका', en: 'Madi Rural Municipality' },
            { np: 'सभापोखरी गाउँपालिका', en: 'Sabhapokhari Rural Municipality' },
            { np: 'सिलीचोङ गाउँपालिका', en: 'Silichong Rural Municipality' },
            { np: 'भोटखोला गाउँपालिका', en: 'Bhotkhola Rural Municipality' },
            { np: 'चिचिला गाउँपालिका', en: 'Chichila Rural Municipality' }
          ] 
        },
        'solukhumbu': { 
          np: 'सोलुखुम्बु', 
          en: 'Solukhumbu', 
          municipalities: [
            { np: 'सोलुदुधकुण्ड नगरपालिका', en: 'Solududhkunda Municipality' },
            { np: 'नेचासल्यान गाउँपालिका', en: 'Nechasalyan Rural Municipality' },
            { np: 'दुधकोशी गाउँपालिका', en: 'Dudhkoshi Rural Municipality' },
            { np: 'माप्या दुधकोशी गाउँपालिका', en: 'Mapya Dudhkoshi Rural Municipality' },
            { np: 'खुम्बु पासाङल्हामु गाउँपालिका', en: 'Khumbu Pasang Lhamu Rural Municipality' },
            { np: 'लिखुपिके गाउँपालिका', en: 'Likhupike Rural Municipality' },
            { np: 'महाकुलुङ गाउँपालिका', en: 'Mahakulung Rural Municipality' },
            { np: 'सोताङ गाउँपालिका', en: 'Sotang Rural Municipality' }
          ] 
        },
        'okhaldhunga': { 
          np: 'ओखलढुंगा', 
          en: 'Okhaldhunga', 
          municipalities: [
            { np: 'सिद्धिचरण नगरपालिका', en: 'Siddhicharan Municipality' },
            { np: 'खिजिदेम्बा गाउँपालिका', en: 'Khijidemba Rural Municipality' },
            { np: 'चम्पादेवी गाउँपालिका', en: 'Champadevi Rural Municipality' },
            { np: 'चिसंखुगढी गाउँपालिका', en: 'Chisankhugadhi Rural Municipality' },
            { np: 'मानेभञ्ज्याङ गाउँपालिका', en: 'Manebhanjyang Rural Municipality' },
            { np: 'मोलुङ गाउँपालिका', en: 'Molung Rural Municipality' },
            { np: 'लिकु गाउँपालिका', en: 'Liku Rural Municipality' },
            { np: 'सुनकोशी गाउँपालिका', en: 'Sunkoshi Rural Municipality' }
          ] 
        },
        'khotang': { 
          np: 'खोटाङ', 
          en: 'Khotang', 
          municipalities: [
            { np: 'दिप्रुङ नगरपालिका', en: 'Diprung Municipality' },
            { np: 'हलेसी तुवाचुङ नगरपालिका', en: 'Halesi Tuwachung Municipality' },
            { np: 'ऐसेलुखर्क गाउँपालिका', en: 'Aiselukharka Rural Municipality' },
            { np: 'बराहपोखरी गाउँपालिका', en: 'Barahapokhari Rural Municipality' },
            { np: 'कपिलकोट गाउँपालिका', en: 'Kapilkot Rural Municipality' },
            { np: 'खोटेहाङ गाउँपालिका', en: 'Khotehang Rural Municipality' },
            { np: 'जन्तेढुङ्गा गाउँपालिका', en: 'Jantedhunga Rural Municipality' },
            { np: 'केपिलासगढी गाउँपालिका', en: 'Kepilasagadhi Rural Municipality' },
            { np: 'रावा बेसी गाउँपालिका', en: 'Rawa Besi Rural Municipality' },
            { np: 'साकेला गाउँपालिका', en: 'Sakela Rural Municipality' }
          ] 
        },
        'udayapur': { 
          np: 'उदयपुर', 
          en: 'Udayapur', 
          municipalities: [
            { np: 'त्रियुगा नगरपालिका', en: 'Triyuga Municipality' },
            { np: 'चौदण्डीगढी नगरपालिका', en: 'Chaudandigadhi Municipality' },
            { np: 'कटारी नगरपालिका', en: 'Katari Municipality' },
            { np: 'बेलका नगरपालिका', en: 'Belka Municipality' },
            { np: 'उदयपुरगढी गाउँपालिका', en: 'Udayapur Gadhi Rural Municipality' },
            { np: 'रौतामाई गाउँपालिका', en: 'Rautamai Rural Municipality' },
            { np: 'सुनकोशी गाउँपालिका', en: 'Sunkoshi Rural Municipality' },
            { np: 'ताप्ली गाउँपालिका', en: 'Tapali Rural Municipality' }
          ] 
        }
      }
    },
    // Province 2 - Madhesh Province (8 districts)
    province2: { 
      np: 'मधेश प्रदेश', 
      en: 'Madhesh Province', 
      districts: {
        'saptari': { 
          np: 'सप्तरी', 
          en: 'Saptari', 
          municipalities: [
            { np: 'राजविराज नगरपालिका', en: 'Rajbiraj Municipality' },
            { np: 'कञ्चनरूप नगरपालिका', en: 'Kanchanrup Municipality' },
            { np: 'शम्भुनाथ नगरपालिका', en: 'Shambhunath Municipality' },
            { np: 'सप्तकोशी नगरपालिका', en: 'Saptakoshi Municipality' },
            { np: 'सुरुङ्गा नगरपालिका', en: 'Surunga Municipality' },
            { np: 'बोदेबरसाइन नगरपालिका', en: 'Bodebarsain Municipality' },
            { np: 'खडक नगरपालिका', en: 'Khadak Municipality' },
            { np: 'तिरहुत गाउँपालिका', en: 'Tirhut Rural Municipality' },
            { np: 'महादेवा गाउँपालिका', en: 'Mahadeva Rural Municipality' },
            { np: 'रुपनी गाउँपालिका', en: 'Rupani Rural Municipality' },
            { np: 'बलान-बिहुल गाउँपालिका', en: 'Balan-Bihul Rural Municipality' },
            { np: 'राजगढ गाउँपालिका', en: 'Rajgadh Rural Municipality' },
            { np: 'विष्णुपुर गाउँपालिका', en: 'Bishnupur Rural Municipality' },
            { np: 'छिन्नमस्ता गाउँपालिका', en: 'Chhinnamasta Rural Municipality' },
            { np: 'आग्नीपुर गाउँपालिका', en: 'Agnipur Rural Municipality' }
          ] 
        },
        'siraha': { 
          np: 'सिराहा', 
          en: 'Siraha', 
          municipalities: [
            { np: 'सिराहा नगरपालिका', en: 'Siraha Municipality' },
            { np: 'लहान नगरपालिका', en: 'Lahan Municipality' },
            { np: 'धनगढीमाई नगरपालिका', en: 'Dhangadhimai Municipality' },
            { np: 'गोलबजार नगरपालिका', en: 'Golbazar Municipality' },
            { np: 'मिर्चैया नगरपालिका', en: 'Mirchaiya Municipality' },
            { np: 'कर्जन्हा नगरपालिका', en: 'Karjanha Municipality' },
            { np: 'सुखीपुर नगरपालिका', en: 'Sukhipur Municipality' },
            { np: 'भगवानपुर गाउँपालिका', en: 'Bhagwanpur Rural Municipality' },
            { np: 'अर्नमा गाउँपालिका', en: 'Arnama Rural Municipality' },
            { np: 'औरही गाउँपालिका', en: 'Aurahi Rural Municipality' },
            { np: 'बरियारपट्टी गाउँपालिका', en: 'Bariyarpatti Rural Municipality' },
            { np: 'लक्ष्मीपुर पटारी गाउँपालिका', en: 'Laxmipur Patari Rural Municipality' },
            { np: 'नरहा गाउँपालिका', en: 'Naraha Rural Municipality' },
            { np: 'सखुवा नान्करकट्टी गाउँपालिका', en: 'Sakhuwa Nankarkatti Rural Municipality' },
            { np: 'विष्णुपुर गाउँपालिका', en: 'Bishnupur Rural Municipality' },
            { np: 'नवराजपुर गाउँपालिका', en: 'Nawarajpur Rural Municipality' }
          ] 
        },
        'dhanusa': { 
          np: 'धनुषा', 
          en: 'Dhanusa', 
          municipalities: [
            { np: 'जनकपुरधाम उपमहानगरपालिका', en: 'Janakpur Sub-Metropolitan City' },
            { np: 'धनुषाधाम नगरपालिका', en: 'Dhanushadham Municipality' },
            { np: 'क्षिरेश्वरनाथ नगरपालिका', en: 'Ksireshwarnath Municipality' },
            { np: 'गणेशमान चारनाथ नगरपालिका', en: 'Ganeshman Charnath Municipality' },
            { np: 'मिथिला नगरपालिका', en: 'Mithila Municipality' },
            { np: 'सबैला नगरपालिका', en: 'Sabailla Municipality' },
            { np: 'विदेह नगरपालिका', en: 'Videha Municipality' },
            { np: 'कमला नगरपालिका', en: 'Kamala Municipality' },
            { np: 'मिथिला बिहारी नगरपालिका', en: 'Mithila Bihari Municipality' },
            { np: 'हंसपुर नगरपालिका', en: 'Hansapur Municipality' },
            { np: 'लक्ष्मीनिया गाउँपालिका', en: 'Laxminiya Rural Municipality' },
            { np: 'औरही गाउँपालिका', en: 'Aurahi Rural Municipality' },
            { np: 'बटेश्वर गाउँपालिका', en: 'Bateshwar Rural Municipality' },
            { np: 'मुखियापट्टी मुसहरनिया गाउँपालिका', en: 'Mukhiyapatti Musaharniya Rural Municipality' },
            { np: 'जनकनन्दनी गाउँपालिका', en: 'Janak Nandini Rural Municipality' }
          ] 
        },
        'mahottari': { 
          np: 'महोत्तरी', 
          en: 'Mahottari', 
          municipalities: [
            { np: 'बर्दिबास नगरपालिका', en: 'Bardibas Municipality' },
            { np: 'जलेश्वर नगरपालिका', en: 'Jaleshwar Municipality' },
            { np: 'गौशाला नगरपालिका', en: 'Gaushala Municipality' },
            { np: 'बलवा नगरपालिका', en: 'Balwa Municipality' },
            { np: 'मनरा शिसवा नगरपालिका', en: 'Manra Shiswa Municipality' },
            { np: 'मटिहानी नगरपालिका', en: 'Matihani Municipality' },
            { np: 'भङ्गाहा नगरपालिका', en: 'Bhangaha Municipality' },
            { np: 'रामगोपालपुर नगरपालिका', en: 'Ramgopalpur Municipality' },
            { np: 'लोहरपट्टी नगरपालिका', en: 'Loharpatti Municipality' },
            { np: 'एकडारा गाउँपालिका', en: 'Ekadara Rural Municipality' },
            { np: 'सोनमा गाउँपालिका', en: 'Sonama Rural Municipality' },
            { np: 'साम्सी गाउँपालिका', en: 'Samsi Rural Municipality' },
            { np: 'पिपरा गाउँपालिका', en: 'Pipra Rural Municipality' }
          ] 
        },
        'sarlahi': { 
          np: 'सर्लाही', 
          en: 'Sarlahi', 
          municipalities: [
            { np: 'मलङ्गवा नगरपालिका', en: 'Malangwa Municipality' },
            { np: 'हरिवन नगरपालिका', en: 'Harivan Municipality' },
            { np: 'लालबन्दी नगरपालिका', en: 'Lalbandi Municipality' },
            { np: 'ईश्वरपुर नगरपालिका', en: 'Ishwarpur Municipality' },
            { np: 'बरहथवा नगरपालिका', en: 'Barahathawa Municipality' },
            { np: 'हरिपुर नगरपालिका', en: 'Haripur Municipality' },
            { np: 'गोडैता नगरपालिका', en: 'Godaita Municipality' },
            { np: 'ब्रह्मपुरी नगरपालिका', en: 'Brahmapuri Municipality' },
            { np: 'कौडेना गाउँपालिका', en: 'Kaudena Rural Municipality' },
            { np: 'चक्रघट्टा गाउँपालिका', en: 'Chakraghatta Rural Municipality' },
            { np: 'चन्द्रनगर गाउँपालिका', en: 'Chandranagar Rural Municipality' },
            { np: 'धनकौल गाउँपालिका', en: 'Dhankaul Rural Municipality' },
            { np: 'पर्सा गाउँपालिका', en: 'Parsa Rural Municipality' },
            { np: 'बसबरिया गाउँपालिका', en: 'Basbaria Rural Municipality' },
            { np: 'रामनगर गाउँपालिका', en: 'Ramnagar Rural Municipality' }
          ] 
        },
        'rautahat': { 
          np: 'रौतहट', 
          en: 'Rautahat', 
          municipalities: [
            { np: 'गौर नगरपालिका', en: 'Gaur Municipality' },
            { np: 'बौधीमाई नगरपालिका', en: 'Baudhimai Municipality' },
            { np: 'ब्रह्मपुरी नगरपालिका', en: 'Brahmapuri Municipality' },
            { np: 'गरुडा नगरपालिका', en: 'Garuda Municipality' },
            { np: 'कटहरिया नगरपालिका', en: 'Katahariya Municipality' },
            { np: 'माधवनारायण नगरपालिका', en: 'Madhavnarayan Municipality' },
            { np: 'चन्द्रपुर नगरपालिका', en: 'Chandrapur Municipality' },
            { np: 'देवाही गोनाही नगरपालिका', en: 'Devahi Gonahi Municipality' },
            { np: 'गुजरा नगरपालिका', en: 'Gujara Municipality' },
            { np: 'राजदेवी नगरपालिका', en: 'Rajdevi Municipality' },
            { np: 'दुर्गाभगवती गाउँपालिका', en: 'Durgabhagwati Rural Municipality' },
            { np: 'यमुनामाई गाउँपालिका', en: 'Yamunamai Rural Municipality' },
            { np: 'परोहा गाउँपालिका', en: 'Paroha Rural Municipality' },
            { np: 'ईशनाथ गाउँपालिका', en: 'Ishnath Rural Municipality' }
          ] 
        },
        'bara': { 
          np: 'बारा', 
          en: 'Bara', 
          municipalities: [
            { np: 'कलैया उपमहानगरपालिका', en: 'Kalaiya Sub-Metropolitan City' },
            { np: 'जीतपुरसिमरा उपमहानगरपालिका', en: 'Jitpursimara Sub-Metropolitan City' },
            { np: 'कोल्हवी नगरपालिका', en: 'Kolhabi Municipality' },
            { np: 'निजगढ नगरपालिका', en: 'Nijgadh Municipality' },
            { np: 'महागढीमाई नगरपालिका', en: 'Mahagadhimai Municipality' },
            { np: 'सिम्रौनगढ नगरपालिका', en: 'Simraungadh Municipality' },
            { np: 'पचरौता नगरपालिका', en: 'Pacharauta Municipality' },
            { np: 'अडर्सकोट गाउँपालिका', en: 'Adarskot Rural Municipality' },
            { np: 'करैयामाई गाउँपालिका', en: 'Karaiyamai Rural Municipality' },
            { np: 'देवताल गाउँपालिका', en: 'Devtal Rural Municipality' },
            { np: 'परवानीपुर गाउँपालिका', en: 'Parwanipur Rural Municipality' },
            { np: 'बारागढी गाउँपालिका', en: 'Baragadhi Rural Municipality' },
            { np: 'फेटा गाउँपालिका', en: 'Pheta Rural Municipality' },
            { np: 'प्रसौनी गाउँपालिका', en: 'Prasauni Rural Municipality' },
            { np: 'सुवर्ण गाउँपालिका', en: 'Suvarna Rural Municipality' }
          ] 
        },
        'parsa': { 
          np: 'पर्सा', 
          en: 'Parsa', 
          municipalities: [
            { np: 'बीरगञ्ज महानगरपालिका', en: 'Birgunj Metropolitan City' },
            { np: 'बहुदरमाई नगरपालिका', en: 'Bahudarmai Municipality' },
            { np: 'पोखरिया नगरपालिका', en: 'Pokhariya Municipality' },
            { np: 'विश्रामपुर नगरपालिका', en: 'Bishrampur Municipality' },
            { np: 'धोबीनी गाउँपालिका', en: 'Dhobini Rural Municipality' },
            { np: 'जगरनाथपुर गाउँपालिका', en: 'Jagarnathpur Rural Municipality' },
            { np: 'जिरा भवानी गाउँपालिका', en: 'Jira Bhawani Rural Municipality' },
            { np: 'कल्याणिया गाउँपालिका', en: 'Kalyaniya Rural Municipality' },
            { np: 'पकाहा मैनपुर गाउँपालिका', en: 'Pakaha Mainpur Rural Municipality' },
            { np: 'पटेर्वा सुगौली गाउँपालिका', en: 'Paterwa Sugauli Rural Municipality' },
            { np: 'सखुवा प्रसौनी गाउँपालिका', en: 'Sakhuwa Prasauni Rural Municipality' },
            { np: 'ठोरी गाउँपालिका', en: 'Thori Rural Municipality' }
          ] 
        }
      }
    },
    // Province 3 - Bagmati Province (13 districts)
    province3: { 
      np: 'बागमती प्रदेश', 
      en: 'Bagmati Province', 
      districts: {
        'kathmandu': { 
          np: 'काठमाडौं', 
          en: 'Kathmandu', 
          municipalities: [
            { np: 'काठमाडौं महानगरपालिका', en: 'Kathmandu Metropolitan City' },
            { np: 'कीर्तिपुर नगरपालिका', en: 'Kirtipur Municipality' },
            { np: 'टोखा नगरपालिका', en: 'Tokha Municipality' },
            { np: 'तारकेश्वर नगरपालिका', en: 'Tarkeshwar Municipality' },
            { np: 'चन्द्रागिरी नगरपालिका', en: 'Chandragiri Municipality' },
            { np: 'नागार्जुन नगरपालिका', en: 'Nagarjun Municipality' },
            { np: 'गोकर्णेश्वर नगरपालिका', en: 'Gokarneshwar Municipality' },
            { np: 'बुढानीलकण्ठ नगरपालिका', en: 'Budhanilkantha Municipality' },
            { np: 'डाँछी गाउँपालिका', en: 'Daanchhi Rural Municipality' },
            { np: 'शंखरापुर गाउँपालिका', en: 'Shankharapur Rural Municipality' },
            { np: 'कागेश्वरी मनोहरा नगरपालिका', en: 'Kageshwari Manohara Municipality' }
          ] 
        },
        'lalitpur': { 
          np: 'ललितपुर', 
          en: 'Lalitpur', 
          municipalities: [
            { np: 'ललितपुर महानगरपालिका', en: 'Lalitpur Metropolitan City' },
            { np: 'गोदावरी नगरपालिका', en: 'Godawari Municipality' },
            { np: 'महालक्ष्मी नगरपालिका', en: 'Mahalaxmi Municipality' },
            { np: 'बागमती गाउँपालिका', en: 'Bagmati Rural Municipality' },
            { np: 'कोन्ज्योसोम गाउँपालिका', en: 'Konjyosom Rural Municipality' }
          ] 
        },
        'bhaktapur': { 
          np: 'भक्तपुर', 
          en: 'Bhaktapur', 
          municipalities: [
            { np: 'भक्तपुर नगरपालिका', en: 'Bhaktapur Municipality' },
            { np: 'मध्यपुर थिमी नगरपालिका', en: 'Madhyapur Thimi Municipality' },
            { np: 'सूर्यविनायक नगरपालिका', en: 'Suryabinayak Municipality' },
            { np: 'चाँगुनारायण नगरपालिका', en: 'Changunarayan Municipality' }
          ] 
        },
        'kavrepalanchok': { 
          np: 'काभ्रेपलान्चोक', 
          en: 'Kavrepalanchok', 
          municipalities: [
            { np: 'बनेपा नगरपालिका', en: 'Banepa Municipality' },
            { np: 'धुलिखेल नगरपालिका', en: 'Dhulikhel Municipality' },
            { np: 'पनौती नगरपालिका', en: 'Panauti Municipality' },
            { np: 'नमोबुद्ध नगरपालिका', en: 'Namobuddha Municipality' },
            { np: 'मण्डनदेउपुर नगरपालिका', en: 'Mandandeupur Municipality' },
            { np: 'खानीखोला गाउँपालिका', en: 'Khanikhola Rural Municipality' },
            { np: 'रोशी गाउँपालिका', en: 'Rosi Rural Municipality' },
            { np: 'बेथानचोक गाउँपालिका', en: 'Bethanchok Rural Municipality' },
            { np: 'तेमाल गाउँपालिका', en: 'Temal Rural Municipality' },
            { np: 'महाभारत गाउँपालिका', en: 'Mahabharat Rural Municipality' },
            { np: 'भुम्लु गाउँपालिका', en: 'Bhumlu Rural Municipality' }
          ] 
        },
        'sindhupalchok': { 
          np: 'सिन्धुपाल्चोक', 
          en: 'Sindhupalchok', 
          municipalities: [
            { np: 'चौतारा नगरपालिका', en: 'Chautara Municipality' },
            { np: 'मेलम्ची नगरपालिका', en: 'Melamchi Municipality' },
            { np: 'बाह्रबिसे नगरपालिका', en: 'Bahrabise Municipality' },
            { np: 'इन्द्रावती गाउँपालिका', en: 'Indrawati Rural Municipality' },
            { np: 'जुगल गाउँपालिका', en: 'Jugal Rural Municipality' },
            { np: 'पाँचपोखरी गाउँपालिका', en: 'Panchpokhari Rural Municipality' },
            { np: 'बलेफी गाउँपालिका', en: 'Balephi Rural Municipality' },
            { np: 'सुनकोशी गाउँपालिका', en: 'Sunkoshi Rural Municipality' },
            { np: 'हेलम्बु गाउँपालिका', en: 'Helambu Rural Municipality' },
            { np: 'त्रिपुरासुन्दरी गाउँपालिका', en: 'Tripurasundari Rural Municipality' },
            { np: 'लिसाङखु गाउँपालिका', en: 'Lisankhu Rural Municipality' }
          ] 
        },
        'rasuwa': { 
          np: 'रसुवा', 
          en: 'Rasuwa', 
          municipalities: [
            { np: 'उत्तरगया गाउँपालिका', en: 'Uttargaya Rural Municipality' },
            { np: 'कालिका गाउँपालिका', en: 'Kalika Rural Municipality' },
            { np: 'गोसाइँकुण्ड गाउँपालिका', en: 'Gosaikunda Rural Municipality' },
            { np: 'नौकुण्ड गाउँपालिका', en: 'Naukunda Rural Municipality' },
            { np: 'पार्वतीकुण्ड गाउँपालिका', en: 'Parvatikunda Rural Municipality' },
            { np: 'आमाछोदिङ्मो गाउँपालिका', en: 'Amachhodingmo Rural Municipality' }
          ] 
        },
        'dhading': { 
          np: 'धादिङ', 
          en: 'Dhading', 
          municipalities: [
            { np: 'धादिङबेसी नगरपालिका', en: 'Dhadingbesi Municipality' },
            { np: 'निलकण्ठ नगरपालिका', en: 'Nilkantha Municipality' },
            { np: 'खनियाबास गाउँपालिका', en: 'Khaniyabas Rural Municipality' },
            { np: 'गजुरी गाउँपालिका', en: 'Gajuri Rural Municipality' },
            { np: 'गल्छी गाउँपालिका', en: 'Galchi Rural Municipality' },
            { np: 'ज्वालामुखी गाउँपालिका', en: 'Jwalamukhi Rural Municipality' },
            { np: 'थाक्रे गाउँपालिका', en: 'Thakre Rural Municipality' },
            { np: 'नेत्रावती डबजोङ गाउँपालिका', en: 'Netrawati Dabjong Rural Municipality' },
            { np: 'बेनीघाट रोराङ गाउँपालिका', en: 'Benighat Rorang Rural Municipality' },
            { np: 'रुबी भ्याली गाउँपालिका', en: 'Rubi Valley Rural Municipality' },
            { np: 'सिद्धलेक गाउँपालिका', en: 'Siddhalek Rural Municipality' },
            { np: 'त्रिपुरासुन्दरी गाउँपालिका', en: 'Tripurasundari Rural Municipality' },
            { np: 'गंगाजमुना गाउँपालिका', en: 'Gangajamuna Rural Municipality' }
          ] 
        },
        'nuwakot': { 
          np: 'नुवाकोट', 
          en: 'Nuwakot', 
          municipalities: [
            { np: 'विदुर नगरपालिका', en: 'Vidur Municipality' },
            { np: 'बेलकोटगढी नगरपालिका', en: 'Belkotgadhi Municipality' },
            { np: 'ककनी गाउँपालिका', en: 'Kakani Rural Municipality' },
            { np: 'किस्पाङ गाउँपालिका', en: 'Kispang Rural Municipality' },
            { np: 'तादी गाउँपालिका', en: 'Tadi Rural Municipality' },
            { np: 'तारकेश्वर गाउँपालिका', en: 'Tarkeshwar Rural Municipality' },
            { np: 'दुप्चेश्वर गाउँपालिका', en: 'Dupcheshwar Rural Municipality' },
            { np: 'पञ्चकन्या गाउँपालिका', en: 'Panchakanya Rural Municipality' },
            { np: 'म्यागङ गाउँपालिका', en: 'Myagang Rural Municipality' },
            { np: 'सूर्यगढी गाउँपालिका', en: 'Suryagadhi Rural Municipality' },
            { np: 'शिखर गाउँपालिका', en: 'Shikhar Rural Municipality' },
            { np: 'शिवपुरी गाउँपालिका', en: 'Shivapuri Rural Municipality' }
          ] 
        },
        'sindhuli': { 
          np: 'सिन्धुली', 
          en: 'Sindhuli', 
          municipalities: [
            { np: 'कमलामाई नगरपालिका', en: 'Kamalamai Municipality' },
            { np: 'दुधौली नगरपालिका', en: 'Dudhauli Municipality' },
            { np: 'मरिण गाउँपालिका', en: 'Marin Rural Municipality' },
            { np: 'फिक्कल गाउँपालिका', en: 'Phikkal Rural Municipality' },
            { np: 'घ्याङलेख गाउँपालिका', en: 'Ghyanglekh Rural Municipality' },
            { np: 'सुनकोशी गाउँपालिका', en: 'Sunkoshi Rural Municipality' },
            { np: 'हरिहरपुरगढी गाउँपालिका', en: 'Hariharpurgadhi Rural Municipality' },
            { np: 'तिनपाटन गाउँपालिका', en: 'Tinpatan Rural Municipality' },
            { np: 'गोलन्जोर गाउँपालिका', en: 'Golanjor Rural Municipality' }
          ] 
        },
        'makwanpur': { 
          np: 'मकवानपुर', 
          en: 'Makwanpur', 
          municipalities: [
            { np: 'हेटौंडा उपमहानगरपालिका', en: 'Hetauda Sub-Metropolitan City' },
            { np: 'थाहा नगरपालिका', en: 'Thaha Municipality' },
            { np: 'भीमफेदी गाउँपालिका', en: 'Bhimfedi Rural Municipality' },
            { np: 'बकैया गाउँपालिका', en: 'Bakaiya Rural Municipality' },
            { np: 'बागमती गाउँपालिका', en: 'Bagmati Rural Municipality' },
            { np: 'मकवानपुरगढी गाउँपालिका', en: 'Makwanpurgadhi Rural Municipality' },
            { np: 'मनहरी गाउँपालिका', en: 'Manahari Rural Municipality' },
            { np: 'राक्सिराङ गाउँपालिका', en: 'Raksirang Rural Municipality' },
            { np: 'इन्द्रसरोवर गाउँपालिका', en: 'Indrasarowar Rural Municipality' },
            { np: 'कैलाश गाउँपालिका', en: 'Kailash Rural Municipality' }
          ] 
        },
        'ramechhap': { 
          np: 'रामेछाप', 
          en: 'Ramechhap', 
          municipalities: [
            { np: 'मन्थली नगरपालिका', en: 'Manthali Municipality' },
            { np: 'रामेछाप नगरपालिका', en: 'Ramechhap Municipality' },
            { np: 'गोकुलगंगा गाउँपालिका', en: 'Gokulganga Rural Municipality' },
            { np: 'उमाकुण्ड गाउँपालिका', en: 'Umakunda Rural Municipality' },
            { np: 'लिखु गाउँपालिका', en: 'Likhu Rural Municipality' },
            { np: 'दोरम्बा गाउँपालिका', en: 'Doramba Rural Municipality' },
            { np: 'खाँडादेवी गाउँपालिका', en: 'Khandadevi Rural Municipality' },
            { np: 'सुनापती गाउँपालिका', en: 'Sunapati Rural Municipality' },
            { np: 'भञ्जीखोला गाउँपालिका', en: 'Bhanjikhola Rural Municipality' }
          ] 
        },
        'dolakha': { 
          np: 'दोलखा', 
          en: 'Dolakha', 
          municipalities: [
            { np: 'भीमेश्वर नगरपालिका', en: 'Bhimeshwar Municipality' },
            { np: 'जिरी नगरपालिका', en: 'Jiri Municipality' },
            { np: 'कालिञ्चोक गाउँपालिका', en: 'Kalinchok Rural Municipality' },
            { np: 'गौरीशंकर गाउँपालिका', en: 'Gaurishankar Rural Municipality' },
            { np: 'तामाकोशी गाउँपालिका', en: 'Tamakoshi Rural Municipality' },
            { np: 'बैतेश्वर गाउँपालिका', en: 'Baiteshwar Rural Municipality' },
            { np: 'मेलुङ गाउँपालिका', en: 'Melung Rural Municipality' },
            { np: 'शैलुङ गाउँपालिका', en: 'Shailung Rural Municipality' },
            { np: 'बिगु गाउँपालिका', en: 'Bigu Rural Municipality' }
          ] 
        },
        'chitwan': { 
          np: 'चितवन', 
          en: 'Chitwan', 
          municipalities: [
            { np: 'भरतपुर महानगरपालिका', en: 'Bharatpur Metropolitan City' },
            { np: 'रत्ननगर नगरपालिका', en: 'Ratnanagar Municipality' },
            { np: 'कालिका नगरपालिका', en: 'Kalika Municipality' },
            { np: 'खैरहनी नगरपालिका', en: 'Khairahani Municipality' },
            { np: 'माडी नगरपालिका', en: 'Madi Municipality' },
            { np: 'इच्छाकामना गाउँपालिका', en: 'Ichchhakamana Rural Municipality' }
          ] 
        }
      }
    },
    // Province 4 - Gandaki Province (11 districts)
    province4: { 
      np: 'गण्डकी प्रदेश', 
      en: 'Gandaki Province', 
      districts: {
        'gorkha': { 
          np: 'गोरखा', 
          en: 'Gorkha', 
          municipalities: [
            { np: 'गोरखा नगरपालिका', en: 'Gorkha Municipality' },
            { np: 'पालुङटार नगरपालिका', en: 'Palungtar Municipality' },
            { np: 'शहिद लखन गाउँपालिका', en: 'Shahid Lakhan Rural Municipality' },
            { np: 'अजिरकोट गाउँपालिका', en: 'Ajirot Rural Municipality' },
            { np: 'चुमनुव्री गाउँपालिका', en: 'Chumanuvri Rural Municipality' },
            { np: 'धार्चे गाउँपालिका', en: 'Dharche Rural Municipality' },
            { np: 'भीमसेनथापा गाउँपालिका', en: 'Bhimsenthapa Rural Municipality' },
            { np: 'सुलिकोट गाउँपालिका', en: 'Sulikot Rural Municipality' },
            { np: 'सिरानचोक गाउँपालिका', en: 'Siranchok Rural Municipality' },
            { np: 'गण्डकी गाउँपालिका', en: 'Gandaki Rural Municipality' }
          ] 
        },
        'lamjung': { 
          np: 'लमजुङ', 
          en: 'Lamjung', 
          municipalities: [
            { np: 'बेसीशहर नगरपालिका', en: 'Besisahar Municipality' },
            { np: 'मध्यनेपाल नगरपालिका', en: 'Madhyanepal Municipality' },
            { np: 'राइनास नगरपालिका', en: 'Rainas Municipality' },
            { np: 'सुन्दरबजार नगरपालिका', en: 'Sundarbazar Municipality' },
            { np: 'दोर्दी गाउँपालिका', en: 'Dordi Rural Municipality' },
            { np: 'क्व्होलासोथार गाउँपालिका', en: 'Kwholasothar Rural Municipality' },
            { np: 'मर्स्याङ्दी गाउँपालिका', en: 'Marsyangdi Rural Municipality' },
            { np: 'दूधपोखरी गाउँपालिका', en: 'Dudhpokhari Rural Municipality' }
          ] 
        },
        'tanahu': { 
          np: 'तनहुँ', 
          en: 'Tanahun', 
          municipalities: [
            { np: 'दमौली नगरपालिका', en: 'Damauli Municipality' },
            { np: 'बन्दीपुर नगरपालिका', en: 'Bandipur Municipality' },
            { np: 'भानु नगरपालिका', en: 'Bhanu Municipality' },
            { np: 'शुक्लागण्डकी नगरपालिका', en: 'Shuklagandaki Municipality' },
            { np: 'ब्यास नगरपालिका', en: 'Byas Municipality' },
            { np: 'ऋषिङ गाउँपालिका', en: 'Rishing Rural Municipality' },
            { np: 'देवघाट गाउँपालिका', en: 'Devghat Rural Municipality' },
            { np: 'म्याग्दे गाउँपालिका', en: 'Myagde Rural Municipality' },
            { np: 'आँबुखैरेनी गाउँपालिका', en: 'Aambukhaireni Rural Municipality' },
            { np: 'भिमाद गाउँपालिका', en: 'Bhimad Rural Municipality' },
            { np: 'घिरिङ गाउँपालिका', en: 'Ghiring Rural Municipality' }
          ] 
        },
        'kaski': { 
          np: 'कास्की', 
          en: 'Kaski', 
          municipalities: [
            { np: 'पोखरा महानगरपालिका', en: 'Pokhara Metropolitan City' },
            { np: 'मादी नगरपालिका', en: 'Madi Municipality' },
            { np: 'रूपा गाउँपालिका', en: 'Rupa Rural Municipality' },
            { np: 'अन्नपूर्ण गाउँपालिका', en: 'Annapurna Rural Municipality' },
            { np: 'माचापुच्छ्रे गाउँपालिका', en: 'Machhapuchhre Rural Municipality' }
          ] 
        },
        'manang': { 
          np: 'मनाङ', 
          en: 'Manang', 
          municipalities: [
            { np: 'चामे गाउँपालिका', en: 'Chame Rural Municipality' },
            { np: 'नासो गाउँपालिका', en: 'Naso Rural Municipality' },
            { np: 'नार्फु गाउँपालिका', en: 'Narphu Rural Municipality' },
            { np: 'मनाङ ङिस्याङ गाउँपालिका', en: 'Manang Ngisyang Rural Municipality' }
          ] 
        },
        'mustang': { 
          np: 'मुस्ताङ', 
          en: 'Mustang', 
          municipalities: [
            { np: 'घरपझोङ गाउँपालिका', en: 'Gharapjhong Rural Municipality' },
            { np: 'थासाङ गाउँपालिका', en: 'Thasang Rural Municipality' },
            { np: 'बाह्रगाउँ मुक्तिक्षेत्र गाउँपालिका', en: 'Bahragaun Muktikshetra Rural Municipality' },
            { np: 'लोमान्थाङ गाउँपालिका', en: 'Lomanthang Rural Municipality' },
            { np: 'लोघेकर दामोदरकुण्ड गाउँपालिका', en: 'Loghekar Damodarkunda Rural Municipality' }
          ] 
        },
        'myagdi': { 
          np: 'म्याग्दी', 
          en: 'Myagdi', 
          municipalities: [
            { np: 'बेनी नगरपालिका', en: 'Beni Municipality' },
            { np: 'अन्नपूर्ण गाउँपालिका', en: 'Annapurna Rural Municipality' },
            { np: 'मालिका गाउँपालिका', en: 'Malika Rural Municipality' },
            { np: 'मंगला गाउँपालिका', en: 'Mangala Rural Municipality' },
            { np: 'धवलागिरी गाउँपालिका', en: 'Dhaulagiri Rural Municipality' },
            { np: 'रघुगंगा गाउँपालिका', en: 'Raghuganga Rural Municipality' }
          ] 
        },
        'parbat': { 
          np: 'पर्वत', 
          en: 'Parbat', 
          municipalities: [
            { np: 'कुश्मा नगरपालिका', en: 'Kushma Municipality' },
            { np: 'फलेवास नगरपालिका', en: 'Phalewas Municipality' },
            { np: 'जलजला गाउँपालिका', en: 'Jaljala Rural Municipality' },
            { np: 'पैयुँ गाउँपालिका', en: 'Paiyun Rural Municipality' },
            { np: 'मोदी गाउँपालिका', en: 'Modi Rural Municipality' },
            { np: 'बिहादी गाउँपालिका', en: 'Bihadi Rural Municipality' }
          ] 
        },
        'baglung': { 
          np: 'बागलुङ', 
          en: 'Baglung', 
          municipalities: [
            { np: 'बागलुङ नगरपालिका', en: 'Baglung Municipality' },
            { np: 'गलकोट नगरपालिका', en: 'Galkot Municipality' },
            { np: 'जैमुनी नगरपालिका', en: 'Jaimuni Municipality' },
            { np: 'ढोरपाटन नगरपालिका', en: 'Dhorpatan Municipality' },
            { np: 'बरेङ गाउँपालिका', en: 'Bareng Rural Municipality' },
            { np: 'काठेखोला गाउँपालिका', en: 'Kathekhola Rural Municipality' },
            { np: 'तमानखोला गाउँपालिका', en: 'Taman Khola Rural Municipality' },
            { np: 'निसीखोला गाउँपालिका', en: 'Nisikhola Rural Municipality' },
            { np: 'वडिगाड गाउँपालिका', en: 'Badigad Rural Municipality' }
          ] 
        },
        'syangja': { 
          np: 'स्याङ्जा', 
          en: 'Syangja', 
          municipalities: [
            { np: 'पुतलीबजार नगरपालिका', en: 'Putalibazar Municipality' },
            { np: 'वालिङ नगरपालिका', en: 'Waling Municipality' },
            { np: 'चापाकोट नगरपालिका', en: 'Chapakot Municipality' },
            { np: 'गल्याङ नगरपालिका', en: 'Galyang Municipality' },
            { np: 'बिरुवा गाउँपालिका', en: 'Biruwa Rural Municipality' },
            { np: 'अर्जुनचौपारी गाउँपालिका', en: 'Arjun Chaupari Rural Municipality' },
            { np: 'कालीगण्डकी गाउँपालिका', en: 'Kaligandaki Rural Municipality' },
            { np: 'फेदीखोला गाउँपालिका', en: 'Fedikhola Rural Municipality' },
            { np: 'आँधीखोला गाउँपालिका', en: 'Aandhikhola Rural Municipality' },
            { np: 'हरिनास गाउँपालिका', en: 'Harinas Rural Municipality' }
          ] 
        },
        'nawalpur': { 
          np: 'नवलपुर', 
          en: 'Nawalpur', 
          municipalities: [
            { np: 'कावासोती नगरपालिका', en: 'Kawasoti Municipality' },
            { np: 'गैंडाकोट नगरपालिका', en: 'Gaindakot Municipality' },
            { np: 'देवचुली नगरपालिका', en: 'Devchuli Municipality' },
            { np: 'मध्यविन्दु नगरपालिका', en: 'Madhyabindu Municipality' },
            { np: 'बुलिङटार गाउँपालिका', en: 'Bulingtar Rural Municipality' },
            { np: 'बौदीकाली गाउँपालिका', en: 'Baudikali Rural Municipality' },
            { np: 'हुप्सेकोट गाउँपालिका', en: 'Hupsekot Rural Municipality' }
          ] 
        }
      }
    },
    // Province 5 - Lumbini Province (12 districts)
    province5: { 
      np: 'लुम्बिनी प्रदेश', 
      en: 'Lumbini Province', 
      districts: {
        'kapilbastu': { 
          np: 'कपिलवस्तु', 
          en: 'Kapilvastu', 
          municipalities: [
            { np: 'कपिलवस्तु नगरपालिका', en: 'Kapilvastu Municipality' },
            { np: 'बाणगंगा नगरपालिका', en: 'Banganga Municipality' },
            { np: 'बुद्धभूमि नगरपालिका', en: 'Buddhabhumi Municipality' },
            { np: 'शिवराज नगरपालिका', en: 'Shivaraj Municipality' },
            { np: 'महाराजगन्ज नगरपालिका', en: 'Maharajganj Municipality' },
            { np: 'कृष्णनगर नगरपालिका', en: 'Krishnanagar Municipality' },
            { np: 'यशोधरा गाउँपालिका', en: 'Yashodhara Rural Municipality' },
            { np: 'बिजयनगर गाउँपालिका', en: 'Bijaynagar Rural Municipality' },
            { np: 'मायादेवी गाउँपालिका', en: 'Mayadevi Rural Municipality' },
            { np: 'सुद्धोधन गाउँपालिका', en: 'Suddhodhan Rural Municipality' }
          ] 
        },
        'rupandehi': { 
          np: 'रुपन्देही', 
          en: 'Rupandehi', 
          municipalities: [
            { np: 'बुटवल उपमहानगरपालिका', en: 'Butwal Sub-Metropolitan City' },
            { np: 'तिलोत्तमा नगरपालिका', en: 'Tilottama Municipality' },
            { np: 'सिद्धार्थनगर नगरपालिका', en: 'Siddharthanagar Municipality' },
            { np: 'देवदह नगरपालिका', en: 'Devdaha Municipality' },
            { np: 'लुम्बिनी सांस्कृतिक नगरपालिका', en: 'Lumbini Sanskritik Municipality' },
            { np: 'कञ्चन गाउँपालिका', en: 'Kanchan Rural Municipality' },
            { np: 'गैडहवा गाउँपालिका', en: 'Gaidahawa Rural Municipality' },
            { np: 'मायादेवी गाउँपालिका', en: 'Mayadevi Rural Municipality' },
            { np: 'कोटहीमाई गाउँपालिका', en: 'Kotahimai Rural Municipality' },
            { np: 'रोहिणी गाउँपालिका', en: 'Rohini Rural Municipality' },
            { np: 'सम्मरीमाई गाउँपालिका', en: 'Sammarimai Rural Municipality' },
            { np: 'शिवराज नगरपालिका', en: 'Shivaraj Municipality' }
          ] 
        },
        'arghakhanchi': { 
          np: 'अर्घाखाँची', 
          en: 'Arghakhanchi', 
          municipalities: [
            { np: 'सन्धिखर्क नगरपालिका', en: 'Sandhikharka Municipality' },
            { np: 'सितगंगा नगरपालिका', en: 'Sitganga Municipality' },
            { np: 'भूमिकास्थान नगरपालिका', en: 'Bhumikasthan Municipality' },
            { np: 'छत्रदेव गाउँपालिका', en: 'Chhatradev Rural Municipality' },
            { np: 'पाणिनी गाउँपालिका', en: 'Panini Rural Municipality' },
            { np: 'मालारानी गाउँपालिका', en: 'Malarani Rural Municipality' }
          ] 
        },
        'gulmi': { 
          np: 'गुल्मी', 
          en: 'Gulmi', 
          municipalities: [
            { np: 'तम्घास नगरपालिका', en: 'Tamghas Municipality' },
            { np: 'रेसुङ्गा नगरपालिका', en: 'Resunga Municipality' },
            { np: 'मुसिकोट नगरपालिका', en: 'Musikot Municipality' },
            { np: 'कालीगण्डकी गाउँपालिका', en: 'Kaligandaki Rural Municipality' },
            { np: 'गुल्मी दरबार गाउँपालिका', en: 'Gulmi Darabar Rural Municipality' },
            { np: 'सत्यवती गाउँपालिका', en: 'Satyawati Rural Municipality' },
            { np: 'चन्द्रकोट गाउँपालिका', en: 'Chandrakot Rural Municipality' },
            { np: 'रुरुक्षेत्र गाउँपालिका', en: 'Rurukshetra Rural Municipality' },
            { np: 'छत्रकोट गाउँपालिका', en: 'Chhatrakot Rural Municipality' },
            { np: 'धुर्कोट गाउँपालिका', en: 'Dhurkot Rural Municipality' },
            { np: 'मालिका गाउँपालिका', en: 'Malika Rural Municipality' }
          ] 
        },
        'palpa': { 
          np: 'पाल्पा', 
          en: 'Palpa', 
          municipalities: [
            { np: 'तानसेन नगरपालिका', en: 'Tansen Municipality' },
            { np: 'रामपुर नगरपालिका', en: 'Rampur Municipality' },
            { np: 'पूर्वखोला गाउँपालिका', en: 'Purwakhola Rural Municipality' },
            { np: 'निस्दी गाउँपालिका', en: 'Nisdi Rural Municipality' },
            { np: 'रिब्दीकोट गाउँपालिका', en: 'Ribdikot Rural Municipality' },
            { np: 'रैनादेवी छहरा गाउँपालिका', en: 'Rainadevi Chhahara Rural Municipality' },
            { np: 'माथागढी गाउँपालिका', en: 'Mathagadhi Rural Municipality' },
            { np: 'बगनासकाली गाउँपालिका', en: 'Bagnaskali Rural Municipality' },
            { np: 'तिनाउ गाउँपालिका', en: 'Tinau Rural Municipality' }
          ] 
        },
        'dang': { 
          np: 'दाङ', 
          en: 'Dang', 
          municipalities: [
            { np: 'घोराही उपमहानगरपालिका', en: 'Ghorahi Sub-Metropolitan City' },
            { np: 'तुल्सीपुर उपमहानगरपालिका', en: 'Tulsipur Sub-Metropolitan City' },
            { np: 'लमही नगरपालिका', en: 'Lamahi Municipality' },
            { np: 'गढवा गाउँपालिका', en: 'Gadhawa Rural Municipality' },
            { np: 'राप्ती गाउँपालिका', en: 'Rapti Rural Municipality' },
            { np: 'बंगलाचुली गाउँपालिका', en: 'Bangalachuli Rural Municipality' },
            { np: 'बबई गाउँपालिका', en: 'Babai Rural Municipality' },
            { np: 'राजपुर गाउँपालिका', en: 'Rajpur Rural Municipality' },
            { np: 'शान्तिनगर गाउँपालिका', en: 'Shantinagar Rural Municipality' },
            { np: 'धनगढी गाउँपालिका', en: 'Dhangadhi Rural Municipality' }
          ] 
        },
        'pyuthan': { 
          np: 'प्युठान', 
          en: 'Pyuthan', 
          municipalities: [
            { np: 'प्युठान नगरपालिका', en: 'Pyuthan Municipality' },
            { np: 'स्वर्गद्वारी नगरपालिका', en: 'Swargadwari Municipality' },
            { np: 'ऐरावती गाउँपालिका', en: 'Airawati Rural Municipality' },
            { np: 'झिमरुक गाउँपालिका', en: 'Jhimruk Rural Municipality' },
            { np: 'मल्लरानी गाउँपालिका', en: 'Mallarani Rural Municipality' },
            { np: 'नौवहिनी गाउँपालिका', en: 'Nauwahini Rural Municipality' },
            { np: 'गौमुखी गाउँपालिका', en: 'Gaumukhi Rural Municipality' },
            { np: 'मण्डवी गाउँपालिका', en: 'Mandavi Rural Municipality' }
          ] 
        },
        'rolpa': { 
          np: 'रोल्पा', 
          en: 'Rolpa', 
          municipalities: [
            { np: 'लिवाङ नगरपालिका', en: 'Libang Municipality' },
            { np: 'सुलिचौर नगरपालिका', en: 'Sulichaur Municipality' },
            { np: 'थवाङ गाउँपालिका', en: 'Thawang Rural Municipality' },
            { np: 'परिवर्तन गाउँपालिका', en: 'Parivartan Rural Municipality' },
            { np: 'माडी गाउँपालिका', en: 'Madi Rural Municipality' },
            { np: 'रुन्टीगढी गाउँपालिका', en: 'Runtigadhi Rural Municipality' },
            { np: 'गंगादेव गाउँपालिका', en: 'Gangadev Rural Municipality' },
            { np: 'सुनछहरी गाउँपालिका', en: 'Sunchhahari Rural Municipality' },
            { np: 'सुनिल स्मृति गाउँपालिका', en: 'Sunil Smriti Rural Municipality' }
          ] 
        },
        'banke': { 
          np: 'बाँके', 
          en: 'Banke', 
          municipalities: [
            { np: 'नेपालगञ्ज उपमहानगरपालिका', en: 'Nepalgunj Sub-Metropolitan City' },
            { np: 'कोहलपुर नगरपालिका', en: 'Kohalpur Municipality' },
            { np: 'राप्ती सोनारी गाउँपालिका', en: 'Rapti Sonari Rural Municipality' },
            { np: 'बैजनाथ गाउँपालिका', en: 'Baijanath Rural Municipality' },
            { np: 'नरैनापुर गाउँपालिका', en: 'Narainapur Rural Municipality' },
            { np: 'डुडुवा गाउँपालिका', en: 'Duduwa Rural Municipality' },
            { np: 'खजुरा गाउँपालिका', en: 'Khajura Rural Municipality' },
            { np: 'जानकी गाउँपालिका', en: 'Janaki Rural Municipality' }
          ] 
        },
        'bardiya': { 
          np: 'बर्दिया', 
          en: 'Bardiya', 
          municipalities: [
            { np: 'गुलरिया नगरपालिका', en: 'Gulariya Municipality' },
            { np: 'राजापुर नगरपालिका', en: 'Rajapur Municipality' },
            { np: 'मधुवन नगरपालिका', en: 'Madhuban Municipality' },
            { np: 'ठाकुरबाबा नगरपालिका', en: 'Thakurbaba Municipality' },
            { np: 'बाँसगढी नगरपालिका', en: 'Bansgadhi Municipality' },
            { np: 'बर्बर्दिया गाउँपालिका', en: 'Barbardiya Rural Municipality' },
            { np: 'गेरुवा गाउँपालिका', en: 'Geruwa Rural Municipality' }
          ] 
        }
      }
    },
    // Province 6 - Karnali Province (10 districts)
    province6: { 
      np: 'कर्णाली प्रदेश', 
      en: 'Karnali Province', 
      districts: {
        'western_ruku': { 
          np: 'पश्चिमी रुकुम', 
          en: 'Western Rukum', 
          municipalities: [
            { np: 'मुसिकोट नगरपालिका', en: 'Musikot Municipality' },
            { np: 'चौरजहारी नगरपालिका', en: 'Chaurjahari Municipality' },
            { np: 'आठबिसकोट नगरपालिका', en: 'Aathbiskot Municipality' },
            { np: 'बाँफिकोट गाउँपालिका', en: 'Banphikot Rural Municipality' },
            { np: 'त्रिवेणी गाउँपालिका', en: 'Tribeni Rural Municipality' },
            { np: 'सानीभेरी गाउँपालिका', en: 'Sanibheri Rural Municipality' },
            { np: 'पुथा उत्तरगंगा गाउँपालिका', en: 'Putha Uttarganga Rural Municipality' }
          ] 
        },
        'salyan': { 
          np: 'सल्यान', 
          en: 'Salyan', 
          municipalities: [
            { np: 'शारदा नगरपालिका', en: 'Sharada Municipality' },
            { np: 'बागचौर नगरपालिका', en: 'Bagchaur Municipality' },
            { np: 'बनगाड कुपिण्डे नगरपालिका', en: 'Bangad Kupinde Municipality' },
            { np: 'कालिमाटी गाउँपालिका', en: 'Kalimati Rural Municipality' },
            { np: 'त्रिवेणी गाउँपालिका', en: 'Tribeni Rural Municipality' },
            { np: 'कपुरकोट गाउँपालिका', en: 'Kapurkot Rural Municipality' },
            { np: 'छत्रेश्वरी गाउँपालिका', en: 'Chhatreshwari Rural Municipality' },
            { np: 'दार्मा गाउँपालिका', en: 'Darma Rural Municipality' },
            { np: 'सिद्धकुमाख गाउँपालिका', en: 'Siddhakumakh Rural Municipality' }
          ] 
        },
        'dolpa': { 
          np: 'डोल्पा', 
          en: 'Dolpa', 
          municipalities: [
            { np: 'ठुली भेरी नगरपालिका', en: 'Thuli Bheri Municipality' },
            { np: 'त्रिपुरासुन्दरी नगरपालिका', en: 'Tripurasundari Municipality' },
            { np: 'डोल्पो बुद्ध गाउँपालिका', en: 'Dolpo Buddha Rural Municipality' },
            { np: 'शे फोक्सुण्डो गाउँपालिका', en: 'She Phoksundo Rural Municipality' },
            { np: 'मुड्केचुला गाउँपालिका', en: 'Mudkechula Rural Municipality' },
            { np: 'जगदुल्ला गाउँपालिका', en: 'Jagadulla Rural Municipality' },
            { np: 'काइके गाउँपालिका', en: 'Kaike Rural Municipality' },
            { np: 'छर्का तांग्सोन गाउँपालिका', en: 'Chharka Tangson Rural Municipality' }
          ] 
        },
        'jumla': { 
          np: 'जुम्ला', 
          en: 'Jumla', 
          municipalities: [
            { np: 'चन्दननाथ नगरपालिका', en: 'Chandannath Municipality' },
            { np: 'कनकासुन्दरी गाउँपालिका', en: 'Kanakasundari Rural Municipality' },
            { np: 'सिञ्जा गाउँपालिका', en: 'Sinja Rural Municipality' },
            { np: 'हिमा गाउँपालिका', en: 'Hima Rural Municipality' },
            { np: 'तिला गाउँपालिका', en: 'Tila Rural Municipality' },
            { np: 'गुठीचौर गाउँपालिका', en: 'Guthichaur Rural Municipality' },
            { np: 'तातोपानी गाउँपालिका', en: 'Tatopani Rural Municipality' },
            { np: 'पातारासी गाउँपालिका', en: 'Patarasi Rural Municipality' }
          ] 
        },
        'mugu': { 
          np: 'मुगु', 
          en: 'Mugu', 
          municipalities: [
            { np: 'गमगढी नगरपालिका', en: 'Gamgadhi Municipality' },
            { np: 'सोरु गाउँपालिका', en: 'Soru Rural Municipality' },
            { np: 'मुगुम कार्मारोङ गाउँपालिका', en: 'Mugum Karmarong Rural Municipality' },
            { np: 'छायानाथ रारा गाउँपालिका', en: 'Chhayanath Rara Rural Municipality' }
          ] 
        },
        'humla': { 
          np: 'हुम्ला', 
          en: 'Humla', 
          municipalities: [
            { np: 'सिमकोट गाउँपालिका', en: 'Simkot Rural Municipality' },
            { np: 'नाम्खा गाउँपालिका', en: 'Namkha Rural Municipality' },
            { np: 'खार्पुनाथ गाउँपालिका', en: 'Kharpunath Rural Municipality' },
            { np: 'सर्कीगाड गाउँपालिका', en: 'Sarkigad Rural Municipality' },
            { np: 'चंखेली गाउँपालिका', en: 'Chankheli Rural Municipality' },
            { np: 'अदानचुली गाउँपालिका', en: 'Adanchuli Rural Municipality' },
            { np: 'ताँजाकोट गाउँपालिका', en: 'Tanjakot Rural Municipality' }
          ] 
        },
        'kalikot': { 
          np: 'कालिकोट', 
          en: 'Kalikot', 
          municipalities: [
            { np: 'खाँडाचक्र नगरपालिका', en: 'Khandachakra Municipality' },
            { np: 'रास्कोट नगरपालिका', en: 'Raskot Municipality' },
            { np: 'तिलागुफा नगरपालिका', en: 'Tilagupha Municipality' },
            { np: 'पच्चालझरना गाउँपालिका', en: 'Pachchaljharana Rural Municipality' },
            { np: 'महावै गाउँपालिका', en: 'Mahawai Rural Municipality' },
            { np: 'पलाता गाउँपालिका', en: 'Palata Rural Municipality' },
            { np: 'नरहरिनाथ गाउँपालिका', en: 'Naraharinath Rural Municipality' },
            { np: 'कक्रेगाउँ गाउँपालिका', en: 'Kakregaun Rural Municipality' },
            { np: 'शुभकालिका गाउँपालिका', en: 'Shubhakalika Rural Municipality' },
            { np: 'सान्नी त्रिवेणी गाउँपालिका', en: 'Sanni Triveni Rural Municipality' }
          ] 
        },
        'dailekh': { 
          np: 'दैलेख', 
          en: 'Dailekh', 
          municipalities: [
            { np: 'नारायण नगरपालिका', en: 'Narayan Municipality' },
            { np: 'दुल्लु नगरपालिका', en: 'Dullu Municipality' },
            { np: 'आठबीस नगरपालिका', en: 'Aathbis Municipality' },
            { np: 'चामुण्डा नगरपालिका', en: 'Chamunda Municipality' },
            { np: 'भैरवी गाउँपालिका', en: 'Bhairwi Rural Municipality' },
            { np: 'ठाँटीकाँध गाउँपालिका', en: 'Thantikandh Rural Municipality' },
            { np: 'गुराँस गाउँपालिका', en: 'Gurans Rural Municipality' },
            { np: 'डुंगेश्वर गाउँपालिका', en: 'Dungeshwar Rural Municipality' },
            { np: 'महाबु गाउँपालिका', en: 'Mahabu Rural Municipality' },
            { np: 'नवस्थान गाउँपालिका', en: 'Navasthan Rural Municipality' },
            { np: 'सिंहासैन गाउँपालिका', en: 'Sinhasain Rural Municipality' }
          ] 
        },
        'surkhet': { 
          np: 'सुर्खेत', 
          en: 'Surkhet', 
          municipalities: [
            { np: 'वीरेन्द्रनगर नगरपालिका', en: 'Birendranagar Municipality' },
            { np: 'भेरीगंगा नगरपालिका', en: 'Bheriganga Municipality' },
            { np: 'गुर्भाकोट नगरपालिका', en: 'Gurbhakot Municipality' },
            { np: 'लेकबेशी नगरपालिका', en: 'Lekbesi Municipality' },
            { np: 'पञ्चपुरी नगरपालिका', en: 'Panchapuri Municipality' },
            { np: 'सिम्ता गाउँपालिका', en: 'Simta Rural Municipality' },
            { np: 'चौकुने गाउँपालिका', en: 'Chaukune Rural Municipality' },
            { np: 'बराहताल गाउँपालिका', en: 'Barahatal Rural Municipality' },
            { np: 'चिङ्गाड गाउँपालिका', en: 'Chingad Rural Municipality' }
          ] 
        },
        'jajarkot': { 
          np: 'जाजरकोट', 
          en: 'Jajarkot', 
          municipalities: [
            { np: 'भेरी नगरपालिका', en: 'Bheri Municipality' },
            { np: 'चेडागाड नगरपालिका', en: 'Chedagad Municipality' },
            { np: 'नलगाड नगरपालिका', en: 'Nalgad Municipality' },
            { np: 'शिवालय गाउँपालिका', en: 'Shivalaya Rural Municipality' },
            { np: 'जुनीचाँदे गाउँपालिका', en: 'Juni Chande Rural Municipality' },
            { np: 'कुसे गाउँपालिका', en: 'Kuse Rural Municipality' }
          ] 
        }
      }
    },
    // Province 7 - Sudurpashchim Province (9 districts)
    province7: { 
      np: 'सुदूरपश्चिम प्रदेश', 
      en: 'Sudurpashchim Province', 
      districts: {
        'bajura': { 
          np: 'बाजुरा', 
          en: 'Bajura', 
          municipalities: [
            { np: 'बडीमालिका नगरपालिका', en: 'Badimalika Municipality' },
            { np: 'त्रिवेणी नगरपालिका', en: 'Tribeni Municipality' },
            { np: 'बुढीगंगा नगरपालिका', en: 'Budhiganga Municipality' },
            { np: 'बुढीनन्दा नगरपालिका', en: 'Budhinanda Municipality' },
            { np: 'जगन्नाथ गाउँपालिका', en: 'Jagannath Rural Municipality' },
            { np: 'स्वामीकार्तिक गाउँपालिका', en: 'Swamikartik Rural Municipality' },
            { np: 'पाण्डव गाउँपालिका', en: 'Pandav Rural Municipality' },
            { np: 'हात्तीकाट गाउँपालिका', en: 'Hattikat Rural Municipality' },
            { np: 'गौमुल गाउँपालिका', en: 'Gaumul Rural Municipality' }
          ] 
        },
        'bajhang': { 
          np: 'बझाङ', 
          en: 'Bajhang', 
          municipalities: [
            { np: 'जयपृथ्वी नगरपालिका', en: 'Jayaprithvi Municipality' },
            { np: 'बुङ्गल नगरपालिका', en: 'Bungal Municipality' },
            { np: 'छबिसपाथिभेरा गाउँपालिका', en: 'Chhabispathibhera Rural Municipality' },
            { np: 'दुर्गाथली गाउँपालिका', en: 'Durgathali Rural Municipality' },
            { np: 'काँडा गाउँपालिका', en: 'Kanda Rural Municipality' },
            { np: 'केदारस्युँ गाउँपालिका', en: 'Kedarsyun Rural Municipality' },
            { np: 'खप्तडछान्ना गाउँपालिका', en: 'Kaptadchhanna Rural Municipality' },
            { np: 'मष्टा गाउँपालिका', en: 'Mashta Rural Municipality' },
            { np: 'साइपाल गाउँपालिका', en: 'Saipal Rural Municipality' },
            { np: 'तलकोट गाउँपालिका', en: 'Talkot Rural Municipality' },
            { np: 'थलारा गाउँपालिका', en: 'Thalara Rural Municipality' }
          ] 
        },
        'doti': { 
          np: 'डोटी', 
          en: 'Doti', 
          municipalities: [
            { np: 'दिपायल सिलगढी नगरपालिका', en: 'Dipayal Silgadhi Municipality' },
            { np: 'शिखर नगरपालिका', en: 'Shikhar Municipality' },
            { np: 'पूर्वीचौकी गाउँपालिका', en: 'Purvichauki Rural Municipality' },
            { np: 'बडीकेदार गाउँपालिका', en: 'Badikedar Rural Municipality' },
            { np: 'जोरायल गाउँपालिका', en: 'Jorayal Rural Municipality' },
            { np: 'केआइसिं गाउँपालिका', en: 'K.I. Singh Rural Municipality' },
            { np: 'आदर्श गाउँपालिका', en: 'Adarsha Rural Municipality' },
            { np: 'बोगटान गाउँपालिका', en: 'Bogtan Rural Municipality' }
          ] 
        },
        'achham': { 
          np: 'अछाम', 
          en: 'Achham', 
          municipalities: [
            { np: 'मंगलसेन नगरपालिका', en: 'Mangalsen Municipality' },
            { np: 'कमलबजार नगरपालिका', en: 'Kamalbazar Municipality' },
            { np: 'साँफेबगर नगरपालिका', en: 'Sanphebagar Municipality' },
            { np: 'पञ्चदेवल विनायक नगरपालिका', en: 'Panchadeval Binayak Municipality' },
            { np: 'रामारोशन गाउँपालिका', en: 'Ramaroshan Rural Municipality' },
            { np: 'चौरपाटी गाउँपालिका', en: 'Chaurapati Rural Municipality' },
            { np: 'तुर्माखाँद गाउँपालिका', en: 'Turmakhad Rural Municipality' },
            { np: 'ढकारी गाउँपालिका', en: 'Dhakari Rural Municipality' },
            { np: 'बान्नीगढी जयगढ गाउँपालिका', en: 'Bannigadhi Jayagadh Rural Municipality' }
          ] 
        },
        'dadeldhura': { 
          np: 'डडेल्धुरा', 
          en: 'Dadeldhura', 
          municipalities: [
            { np: 'अमरगढी नगरपालिका', en: 'Amargadhi Municipality' },
            { np: 'परशुराम नगरपालिका', en: 'Parashuram Municipality' },
            { np: 'आलिताल गाउँपालिका', en: 'Alital Rural Municipality' },
            { np: 'भागेश्वर गाउँपालिका', en: 'Bhageshwar Rural Municipality' },
            { np: 'नवदुर्गा गाउँपालिका', en: 'Navadurga Rural Municipality' },
            { np: 'अजयमेरु गाउँपालिका', en: 'Ajayameru Rural Municipality' },
            { np: 'गन्यापधुरा गाउँपालिका', en: 'Ganyapadhura Rural Municipality' }
          ] 
        },
        'baitadi': { 
          np: 'बैतडी', 
          en: 'Baitadi', 
          municipalities: [
            { np: 'दशरथचन्द नगरपालिका', en: 'Dasharathchand Municipality' },
            { np: 'पाटन नगरपालिका', en: 'Patan Municipality' },
            { np: 'मेलौली नगरपालिका', en: 'Melauli Municipality' },
            { np: 'सुर्नया गाउँपालिका', en: 'Surnaya Rural Municipality' },
            { np: 'सिगास गाउँपालिका', en: 'Sigas Rural Municipality' },
            { np: 'शिवनाथ गाउँपालिका', en: 'Shivanath Rural Municipality' },
            { np: 'पञ्चेश्वर गाउँपालिका', en: 'Pancheshwar Rural Municipality' },
            { np: 'दोगडाकेदार गाउँपालिका', en: 'Dogadakedar Rural Municipality' },
            { np: 'दिलासैनी गाउँपालिका', en: 'Dilasaini Rural Municipality' }
          ] 
        },
        'darchula': { 
          np: 'दार्चुला', 
          en: 'Darchula', 
          municipalities: [
            { np: 'महाकाली नगरपालिका', en: 'Mahakali Municipality' },
            { np: 'शैल्यशिखर नगरपालिका', en: 'Shailyashikhar Municipality' },
            { np: 'मालिकार्जुन गाउँपालिका', en: 'Malikarjun Rural Municipality' },
            { np: 'अपी हिमाल गाउँपालिका', en: 'Api Himal Rural Municipality' },
            { np: 'दुहु गाउँपालिका', en: 'Duhu Rural Municipality' },
            { np: 'नौगाढ गाउँपालिका', en: 'Naugadh Rural Municipality' },
            { np: 'लयाटी गाउँपालिका', en: 'Layati Rural Municipality' },
            { np: 'लेकम गाउँपालिका', en: 'Lekam Rural Municipality' }
          ] 
        },
        'kanchanpur': { 
          np: 'कञ्चनपुर', 
          en: 'Kanchanpur', 
          municipalities: [
            { np: 'भीमदत्त नगरपालिका', en: 'Bhimdatta Municipality' },
            { np: 'पुनर्वास नगरपालिका', en: 'Punarbas Municipality' },
            { np: 'बेलौरी नगरपालिका', en: 'Belauri Municipality' },
            { np: 'कृष्णपुर नगरपालिका', en: 'Krishnapur Municipality' },
            { np: 'बेदकोट नगरपालिका', en: 'Bedkot Municipality' },
            { np: 'शुक्लाफाँटा नगरपालिका', en: 'Shuklaphanta Municipality' },
            { np: 'महाकाली नगरपालिका', en: 'Mahakali Municipality' },
            { np: 'बेलडाँडी गाउँपालिका', en: 'Beladandi Rural Municipality' },
            { np: 'लालझाँडी गाउँपालिका', en: 'Laljhadi Rural Municipality' }
          ] 
        },
        'kailali': { 
          np: 'कैलाली', 
          en: 'Kailali', 
          municipalities: [
            { np: 'धनगढी उपमहानगरपालिका', en: 'Dhangadhi Sub-Metropolitan City' },
            { np: 'टीकापुर नगरपालिका', en: 'Tikapur Municipality' },
            { np: 'घोडाघोडी नगरपालिका', en: 'Ghodaghodi Municipality' },
            { np: 'लम्की चुहा नगरपालिका', en: 'Lamki Chuha Municipality' },
            { np: 'भजनी नगरपालिका', en: 'Bhajani Municipality' },
            { np: 'गोदावरी नगरपालिका', en: 'Godawari Municipality' },
            { np: 'गौरीगंगा नगरपालिका', en: 'Gauriganga Municipality' },
            { np: 'जानकी गाउँपालिका', en: 'Janaki Rural Municipality' },
            { np: 'बर्दगोरिया गाउँपालिका', en: 'Bardgoriya Rural Municipality' },
            { np: 'मोहन्याल गाउँपालिका', en: 'Mohanyal Rural Municipality' },
            { np: 'कैलारी गाउँपालिका', en: 'Kailari Rural Municipality' },
            { np: 'चुरे गाउँपालिका', en: 'Chure Rural Municipality' }
          ] 
        }
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
      value: mun.np.toLowerCase().replace(/\s+/g, '_'),
      label: language === 'np' ? mun.np : mun.en
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
      subjectLabel: 'विषय',
      subjectPlaceholder: 'गुनासोको संक्षिप्त विषय प्रविष्ट गर्नुहोस्',
      subjectEnPlaceholder: 'Enter a brief subject for your complaint',
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
      subjectLabel: 'Subject',
      subjectPlaceholder: 'Enter a brief subject for your complaint',
      subjectEnPlaceholder: 'Enter a brief subject for your complaint',
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
    
    if (!formData.subject) {
      showToast(language === 'np' ? 'कृपया गुनासोको विषय प्रविष्ट गर्नुहोस्।' : 'Please enter a subject for your complaint.', 'error');
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
      
      // Create form data for submission
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add subject in English if not provided
      if (formData.subject && !formData.subjectEn) {
        formDataToSend.append('subjectEn', formData.subject);
      }
      
      // Add date information
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
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Try the main complaints endpoint
      let response = null;
      let lastError = null;
      
      const endpoints = [
        `${API_URL}/complaints`,
        `${API_URL}/public/complaints`,
        `${API_URL}/submit-complaint`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying to submit to endpoint:', endpoint);
          response = await axios.post(endpoint, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000
          });
          if (response.data && (response.data.success || response.data.id || response.data._id)) {
            console.log('Successfully submitted to endpoint:', endpoint);
            break;
          }
        } catch (err) {
          lastError = err;
          console.log('Failed at endpoint:', endpoint, err.response?.status, err.response?.data);
          continue;
        }
      }
      
      clearInterval(progressInterval);
      
      if (!response) {
        throw lastError || new Error('No endpoint responded successfully');
      }
      
      setUploadProgress(100);
      
      // Extract success data
      let complaintData = null;
      if (response.data) {
        if (response.data.success && response.data.data) {
          complaintData = response.data.data;
        } else if (response.data.success && response.data.complaint) {
          complaintData = response.data.complaint;
        } else if (response.data.data) {
          complaintData = response.data.data;
        } else if (response.data.id || response.data._id) {
          complaintData = response.data;
        } else if (response.data.complaintNumber) {
          complaintData = response.data;
        }
      }
      
      if (complaintData) {
        const formattedDate = getFormattedDate();
        const successDataWithDate = {
          ...complaintData,
          dateInfo: {
            np: formattedDate.np,
            en: formattedDate.en,
            nepaliDate: nepaliDate,
            englishDate: englishDate
          }
        };
        setSuccessData(successDataWithDate);
        setShowSuccess(true);
        
        // Reset form
        setFormData({
          natureOfComplaint: '',
          subject: '',
          subjectEn: '',
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
        throw new Error('No complaint data in response');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = t.submitFailed;
      if (error.code === 'ECONNABORTED') {
        errorMessage = language === 'np' ? 'सर्भरले समयमा प्रतिक्रिया दिएन। कृपया पछि प्रयास गर्नुहोस्।' : 'Server timeout. Please try again later.';
      } else if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || t.submitFailed;
        if (error.response.status === 404) {
          errorMessage = language === 'np' 
            ? 'सर्भरमा उजुरी दर्ता गर्ने मार्ग फेला परेन। कृपया पछि प्रयास गर्नुहोस्।' 
            : 'Complaint submission endpoint not found. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = t.connectionError;
      }
      
      showToast(errorMessage, 'error');
      setUploadProgress(0);
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

              {/* Subject Field */}
              <div className="form-section">
                <h3 className="section-title">{t.subjectLabel} <span className="required-star">*</span></h3>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleInputChange} 
                    placeholder={language === 'np' ? t.subjectPlaceholder : t.subjectEnPlaceholder}
                    required 
                  />
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
              <p><strong>{t.ticketId}:</strong> {successData.complaintNumber || successData.ticketId || 'N/A'}</p>
              <p><strong>{t.password}:</strong> {successData.trackingPassword || 'N/A'}</p>
              
              {/* Date Information Section */}
              <div className="date-info-section">
                <p className="date-label">{t.dateLabel}</p>
                <div className="date-display">
                  <div className="date-item nepali-date">
                    <span className="date-icon">🇳🇵</span>
                    <span className="date-label-text">{t.submittedDateNp}:</span>
                    <span className="date-value-text">{successData.dateInfo?.np?.full || ''}</span>
                  </div>
                  {successData.dateInfo?.np?.withDigits && (
                    <div className="date-item nepali-digits">
                      <span className="date-icon">🔢</span>
                      <span className="date-label-text">{t.submittedDateNpDigits}:</span>
                      <span className="date-value-text nepali-digit-value">{successData.dateInfo.np.withDigits}</span>
                    </div>
                  )}
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
                sessionStorage.setItem('trackingId', successData.complaintNumber || successData.ticketId);
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