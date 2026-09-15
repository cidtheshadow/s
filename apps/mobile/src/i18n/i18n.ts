import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'Kisanify',
      tagline: 'Smart Farmer Procurement Platform',
      selectLanguage: 'Select Your Language / अपनी भाषा चुनें',
      continue: 'Continue',
      phoneLogin: 'Enter Mobile Number',
      phoneSubtitle: 'We will send a 6-digit OTP for verification',
      sendOtp: 'Send OTP',
      enterOtp: 'Enter Verification Code',
      otpSubtitle: 'Sent to {{phone}}',
      verifyOtp: 'Verify & Login',
      resendOtp: 'Resend OTP',
      invalidPhone: 'Please enter a valid 10-digit mobile number',
      invalidOtp: 'Please enter a 6-digit OTP',
      welcome: 'Welcome, {{name}}!',
      bookSlot: 'Book Mandi Slot',
      liveQueue: 'Live Queue Status',
      marketPrices: 'Live MSP & Market Prices',
      fileGrievance: 'File Grievance',
      logout: 'Logout'
    }
  },
  hi: {
    translation: {
      appName: 'किसानिफाई',
      tagline: 'स्मार्ट किसान खरीद मंच',
      selectLanguage: 'अपनी भाषा चुनें / Select Your Language',
      continue: 'आगे बढ़ें',
      phoneLogin: 'मोबाइल नंबर दर्ज करें',
      phoneSubtitle: 'सत्यापन के लिए हम 6-अंकीय OTP भेजेंगे',
      sendOtp: 'OTP भेजें',
      enterOtp: 'सत्यापन कोड दर्ज करें',
      otpSubtitle: '{{phone}} पर भेजा गया',
      verifyOtp: 'सत्यापित करें और लॉगिन करें',
      resendOtp: 'पुनः OTP भेजें',
      invalidPhone: 'कृपया सही 10-अंकीय मोबाइल नंबर दर्ज करें',
      invalidOtp: 'कृपया 6-अंकीय OTP दर्ज करें',
      welcome: 'स्वागत है, {{name}}!',
      bookSlot: 'मंडी स्लॉट बुक करें',
      liveQueue: 'लाइव कतार स्थिति',
      marketPrices: 'लाइव एमएसपी और मंडी भाव',
      fileGrievance: 'शिकायत दर्ज करें',
      logout: 'लॉगआउट'
    }
  },
  pa: {
    translation: {
      appName: 'ਕਿਸਾਨੀਫਾਈ',
      tagline: 'ਸਮਾਰਟ ਕਿਸਾਨ ਖਰੀਦ ਪਲੇਟਫਾਰਮ',
      selectLanguage: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
      continue: 'ਅੱਗੇ ਵਧੋ',
      phoneLogin: 'ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',
      phoneSubtitle: 'ਅਸੀਂ ਤਸਦੀਕ ਲਈ 6 ਅੰਕਾਂ ਦਾ OTP ਭੇਜਾਂਗੇ',
      sendOtp: 'OTP ਭੇਜੋ',
      enterOtp: 'ਤਸਦੀਕ ਕੋਡ ਦਰਜ ਕਰੋ',
      verifyOtp: 'ਤਸਦੀਕ ਕਰੋ ਅਤੇ ਲੌਗਇਨ ਕਰੋ',
      resendOtp: 'ਮੁੜ OTP ਭੇਜੋ',
      welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ, {{name}}!',
      bookSlot: 'ਮੰਡੀ ਸਲਾਟ ਬੁੱਕ ਕਰੋ',
      liveQueue: 'ਲਾਈਵ ਕਤਾਰ ਸਥਿਤੀ',
      marketPrices: 'ਲਾਈਵ ਐਮ.ਐਸ.ਪੀ. ਅਤੇ ਮੰਡੀ ਭਾਅ',
      logout: 'ਲੌਗਆਉਟ'
    }
  },
  mr: {
    translation: {
      appName: 'किसानिफाय',
      tagline: 'स्मार्ट शेतकरी खरेदी प्लॅटफॉर्म',
      selectLanguage: 'तुमची भाषा निवडा',
      continue: 'पुढे जा',
      phoneLogin: 'मोबाईल नंबर प्रविष्ट करा',
      phoneSubtitle: 'आम्ही पडताळणीसाठी ६ अंकी OTP पाठवू',
      sendOtp: 'OTP पाठवा',
      enterOtp: 'पडताळणी कोड प्रविष्ट करा',
      verifyOtp: 'पडताळणी करा आणि लॉगिन करा',
      resendOtp: 'पुन्हा OTP पाठवा',
      welcome: 'स्वागत आहे, {{name}}!',
      bookSlot: 'मंडी स्लॉट बुक करा',
      liveQueue: 'थेट रांग स्थिती',
      marketPrices: 'थेट एमएसपी आणि बाजार भाव',
      logout: 'लॉगआउट'
    }
  },
  te: {
    translation: {
      appName: 'కిసానీఫై',
      tagline: 'స్మార్ట్ రైతు కొనుగోలు వేదిక',
      selectLanguage: 'మీ భాషను ఎంచుకోండి',
      continue: 'కొనసాగించండి',
      phoneLogin: 'మొబైల్ సంఖ్యను నమోదు చేయండి',
      phoneSubtitle: 'ధృవీకరణ కోసం మేము 6 అంకెల OTP ని పంపుతాము',
      sendOtp: 'OTP పంపండి',
      enterOtp: 'ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      verifyOtp: 'ధృవీకరించండి & లాగిన్ చేయండి',
      resendOtp: 'మళ్లీ OTP పంపండి',
      welcome: 'స్వాగతం, {{name}}!',
      bookSlot: 'మండి స్లాట్ బుక్ చేయండి',
      liveQueue: 'లైవ్ క్యూ పరిస్థితి',
      marketPrices: 'లైవ్ MSP & మార్కెట్ ధరలు',
      logout: 'లాగౌట్'
    }
  },
  bn: {
    translation: {
      appName: 'কিসানিফাই',
      tagline: 'স্মার্ট কৃষক সংগ্রহ প্ল্যাটফর্ম',
      selectLanguage: 'আপনার ভাষা নির্বাচন করুন',
      continue: 'এগিয়ে যান',
      phoneLogin: 'মোবাইল নম্বর প্রবেশ করান',
      phoneSubtitle: 'যাচাইকরণের জন্য আমরা একটি ৬-সংখ্যার OTP পাঠাব',
      sendOtp: 'OTP পাঠান',
      enterOtp: 'যাচাইকরণ কোড লিখুন',
      verifyOtp: 'যাচাই করুন এবং লগইন করুন',
      resendOtp: 'পুনরায় OTP পাঠান',
      welcome: 'স্বাগতম, {{name}}!',
      bookSlot: 'মান্ডি স্লট বুক করুন',
      liveQueue: 'লাইভ সারির অবস্থান',
      marketPrices: 'লাইভ এমএসপি এবং বাজার দর',
      logout: 'লগআউট'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'hi', // Default language Hindi
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
