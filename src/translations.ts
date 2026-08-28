import { LanguageCode, EquipmentCategory, BookingStatus } from "./types";

export interface Translations {
  appName: string;
  tagline: string;
  roles: {
    customer: string;
    owner: string;
    admin: string;
  };
  common: {
    searchPlaceholder: string;
    all: string;
    filter: string;
    apply: string;
    cancel: string;
    confirm: string;
    close: string;
    loading: string;
    viewDetails: string;
    bookNow: string;
    perDay: string;
    perHour: string;
    verified: string;
    days: string;
    hours: string;
    km: string;
    hp: string;
    tons: string;
    distance: string;
    status: string;
    viewMap: string;
    callOperator: string;
    chat: string;
    active: string;
    completed: string;
    pending: string;
    accept: string;
    reject: string;
    save: string;
    uploadDoc: string;
    aiAnalyzing: string;
  };
  nav: {
    explore: string;
    voiceBooking: string;
    estimator: string;
    liveTracking: string;
    myBookings: string;
    fleet: string;
    calendar: string;
    earnings: string;
    maintenance: string;
    disputes: string;
    verifications: string;
    analytics: string;
    kotlinSource: string;
  };
  categories: Record<EquipmentCategory, string>;
  voice: {
    tapToSpeak: string;
    listening: string;
    processing: string;
    speakNowHint: string;
    samplePrompt1: string;
    samplePrompt2: string;
    samplePrompt3: string;
    aiRecognized: string;
    confirmBooking: string;
    voiceError: string;
  };
  pricing: {
    transparentEstimate: string;
    baseRental: string;
    mobilizationFreight: string;
    operatorWage: string;
    fuelCost: string;
    gstTax: string;
    securityDeposit: string;
    totalPayable: string;
    refundableNote: string;
    surgePricing: string;
  };
  tracking: {
    title: string;
    liveEta: string;
    speed: string;
    fuelLevel: string;
    engineRpm: string;
    engineHours: string;
    transitRoute: string;
    driverContact: string;
    sosAlert: string;
    immobilizer: string;
  };
  bookingStatusMap: Record<BookingStatus, string>;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appName: "HeavyHire AI",
    tagline: "AI-Powered Heavy Construction & Agricultural Equipment Marketplace",
    roles: {
      customer: "Customer",
      owner: "Fleet Owner",
      admin: "Admin Center",
    },
    common: {
      searchPlaceholder: "Search Excavators, JCBs, Harvesters, Tractors, Cranes...",
      all: "All",
      filter: "Filter",
      apply: "Apply",
      cancel: "Cancel",
      confirm: "Confirm",
      close: "Close",
      loading: "Loading...",
      viewDetails: "View Specs & Rates",
      bookNow: "Instant Book",
      perDay: "/day",
      perHour: "/hr",
      verified: "Vahan & RTO Verified",
      days: "days",
      hours: "hrs",
      km: "km",
      hp: "HP",
      tons: "Tons",
      distance: "Distance",
      status: "Status",
      viewMap: "Live GPS Track",
      callOperator: "Call Operator",
      chat: "AI Chat / Translate",
      active: "Active",
      completed: "Completed",
      pending: "Pending",
      accept: "Accept Request",
      reject: "Reject",
      save: "Save Changes",
      uploadDoc: "Upload RC / Fitness Document",
      aiAnalyzing: "Gemini AI inspecting document authenticity...",
    },
    nav: {
      explore: "Explore Machinery",
      voiceBooking: "AI Voice Booking",
      estimator: "AI Job Estimator",
      liveTracking: "Live Telemetry",
      myBookings: "My Rentals",
      fleet: "Fleet Manager",
      calendar: "Availability",
      earnings: "Earnings & Payouts",
      maintenance: "IoT Maintenance",
      disputes: "Dispute Arbiter",
      verifications: "KYC & Vahan",
      analytics: "Market Analytics",
      kotlinSource: "Kotlin / Compose MVVM",
    },
    categories: {
      earthmoving: "Excavators & JCBs",
      agricultural: "Harvesters & Tractors",
      concrete: "Concrete Mixers & Pumps",
      lifting: "Hydra Cranes & Booms",
      drilling: "Borewell & Piling Rigs",
      haulage: "Heavy Tippers & Dumpers",
      roadwork: "Compactors & Rollers",
    },
    voice: {
      tapToSpeak: "Tap to Speak (Kannada, Hindi, English)",
      listening: "Listening to your equipment requirements...",
      processing: "Gemini AI extracting parameters...",
      speakNowHint: "e.g., 'I need a 20-ton excavator in Bangalore for 3 days with rock breaker'",
      samplePrompt1: "I need a JCB 3DX in Mandya tomorrow for 2 days with operator",
      samplePrompt2: "ನನಗೆ ನಾಳೆ 1 ದಿನಕ್ಕೆ ಹಾರ್ವೆಸ್ಟರ್ ಬೇಕು ಮೈಸೂರಿನಲ್ಲಿ",
      samplePrompt3: "मुझे कल 2 दिन के लिए 20 टन का एक्सकेवेटर चाहिए रॉक ब्रेकर के साथ",
      aiRecognized: "AI Extracted Booking Parameters",
      confirmBooking: "Proceed to Checkout",
      voiceError: "Voice input could not be processed. Please try again.",
    },
    pricing: {
      transparentEstimate: "Transparent Price Breakdown",
      baseRental: "Equipment Base Rental",
      mobilizationFreight: "Mobilization & Transport (Flat / km)",
      operatorWage: "Certified Operator Wage",
      fuelCost: "Estimated Fuel Surcharge",
      gstTax: "Government GST (18%)",
      securityDeposit: "Refundable Escrow Deposit",
      totalPayable: "Total Escrow Amount",
      refundableNote: "Escrow deposit released automatically after post-rental digital condition sign-off.",
      surgePricing: "Seasonal Demand Multiplier",
    },
    tracking: {
      title: "Live GPS & IoT Telemetry Tracking",
      liveEta: "Estimated Arrival Time",
      speed: "Transit Speed",
      fuelLevel: "Diesel Tank",
      engineRpm: "Engine RPM",
      engineHours: "Total Work Hours",
      transitRoute: "Delivery Route Polyline",
      driverContact: "Assigned Operator / Pilot",
      sosAlert: "Emergency SOS / Breakdown Report",
      immobilizer: "Remote Anti-Theft Lock",
    },
    bookingStatusMap: {
      PENDING_APPROVAL: "Pending Owner Approval",
      ACCEPTED: "Booking Confirmed",
      DISPATCHED: "Machine Loaded on Trailer",
      IN_TRANSIT: "In-Transit to Job Site",
      WORKING_ON_SITE: "Active on Worksite",
      COMPLETED: "Job Completed & Signed-off",
      CANCELLED: "Cancelled / Refunded",
    },
  },

  kn: {
    appName: "ಹೆವಿಹೈರ್ AI",
    tagline: "ಭಾರೀ ನಿರ್ಮಾಣ ಮತ್ತು ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳ ಎಐ ಆಧಾರಿತ ಮಾರುಕಟ್ಟೆ",
    roles: {
      customer: "ಗ್ರಾಹಕರು",
      owner: "ಯಂತ್ರ ಮಾಲೀಕರು",
      admin: "ಆಡಳಿತ ಕೇಂದ್ರ",
    },
    common: {
      searchPlaceholder: "ಜೆಸಿಬಿ, ಹಿಟಾಚಿ, ಕಟಾವು ಯಂತ್ರ, ಟ್ರ್ಯಾಕ್ಟರ್, ಕ್ರೇನ್ ಹುಡುಕಿ...",
      all: "ಎಲ್ಲವೂ",
      filter: "ಫಿಲ್ಟರ್",
      apply: "ಅನ್ವಯಿಸು",
      cancel: "ರದ್ದುಮಾಡಿ",
      confirm: "ದೃಢೀಕರಿಸಿ",
      close: "ಮುಚ್ಚಿ",
      loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      viewDetails: "ವಿವರಗಳು ಮತ್ತು ದರ",
      bookNow: "ತಕ್ಷಣ ಬುಕ್ ಮಾಡಿ",
      perDay: "/ದಿನಕ್ಕೆ",
      perHour: "/ಗಂಟೆಗೆ",
      verified: "ವಾಹನ್ & ಆರ್‌ಟಿಒ ಪರಿಶೀಲಿತ",
      days: "ದಿನಗಳು",
      hours: "ಗಂಟೆಗಳು",
      km: "ಕಿ.ಮೀ",
      hp: "ಹೆಚ್‌ಪಿ",
      tons: "ಟನ್‌ಗಳು",
      distance: "ದೂರ",
      status: "ಸ್ಥಿತಿ",
      viewMap: "ಲೈವ್ ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕ್",
      callOperator: "ಆಪರೇಟರ್‌ಗೆ ಕರೆ",
      chat: "ಎಐ ಚಾಟ್ / ಅನುವಾದ",
      active: "ಸಕ್ರಿಯ",
      completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
      pending: "ಬಾಕಿ ಉಳಿದಿದೆ",
      accept: "ಬುಕಿಂಗ್ ಸ್ವೀಕರಿಸಿ",
      reject: "ತಿರಸ್ಕರಿಸಿ",
      save: "ಉಳಿಸಿ",
      uploadDoc: "ಆರ್‌ಸಿ / ಫಿಟ್‌ನೆಸ್ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್",
      aiAnalyzing: "ಜೆಮಿನಿ ಎಐ ದಾಖಲೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ...",
    },
    nav: {
      explore: "ಯಂತ್ರೋಪಕರಣಗಳು",
      voiceBooking: "ಧ್ವನಿ ಬುಕಿಂಗ್ (AI)",
      estimator: "ಪ್ರಾಜೆಕ್ಟ್ ಅಂದಾಜು",
      liveTracking: "ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್",
      myBookings: "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು",
      fleet: "ಯಂತ್ರಗಳ ನಿರ್ವಹಣೆ",
      calendar: "ಲಭ್ಯತೆಯ ಕ್ಯಾಲೆಂಡರ್",
      earnings: "ಗಳಿಕೆ ಮತ್ತು ಪಾವತಿಗಳು",
      maintenance: "ನಿರ್ವಹಣಾ ಜ್ಞಾಪನೆ",
      disputes: "ವಿವಾದ ಇತ್ಯರ್ಥ",
      verifications: "ಕೆವೈಸಿ ಪರಿಶೀಲನೆ",
      analytics: "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ",
      kotlinSource: "ಕೋಟ್ಲಿನ್ ಕಂಪೋಸ್ MVVM",
    },
    categories: {
      earthmoving: "ಉತ್ಖನಕ ಮತ್ತು ಜೆಸಿಬಿಗಳು",
      agricultural: "ಕಟಾವು ಯಂತ್ರ ಮತ್ತು ಟ್ರ್ಯಾಕ್ಟರ್",
      concrete: "ಕಾಂಕ್ರೀಟ್ ಮಿಕ್ಸರ್ ಮತ್ತು ಪಂಪ್",
      lifting: "ಹೈಡ್ರಾ ಕ್ರೇನ್‌ಗಳು",
      drilling: "ಬೋರ್‌ವೆಲ್ ರಿಗ್ಗಳು",
      haulage: "ಟಿಪ್ಪರ್ ಡಂಪರ್‌ಗಳು",
      roadwork: "ರೋಡ್ ರೋಲರ್ & ಕಾಂಪಾಕ್ಟರ್",
    },
    voice: {
      tapToSpeak: "ಧ್ವನಿ ಮೂಲಕ ಬುಕ್ ಮಾಡಲು ಸ್ಪರ್ಶಿಸಿ (ಕನ್ನಡ)",
      listening: "ನಿಮ್ಮ ಯಂತ್ರದ ಅಗತ್ಯತೆಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...",
      processing: "ಜೆಮಿನಿ ಎಐ ವಿವರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
      speakNowHint: "ಉದಾಹರಣೆ: 'ನನಗೆ ಮಂಡ್ಯದಲ್ಲಿ ನಾಳೆ 2 ದಿನಕ್ಕೆ ಜೆಸಿಬಿ ಬೇಕು'",
      samplePrompt1: "ನನಗೆ ಮಂಡ್ಯದಲ್ಲಿ ನಾಳೆ 2 ದಿನಕ್ಕೆ ಜೆಸಿಬಿ ಬೇಕು ಆಪರೇಟರ್ ಸಮೇತ",
      samplePrompt2: "ಮೈಸೂರಿನಲ್ಲಿ 3 ದಿನಕ್ಕೆ ಭತ್ತದ ಕಟಾವು ಯಂತ್ರ ಬೇಕು",
      samplePrompt3: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಬೇಸ್‌ಮೆಂಟ್ ಅಗೆಯಲು 20 ಟನ್ ಹಿಟಾಚಿ ಬೇಕು",
      aiRecognized: "ಎಐ ಗುರುತಿಸಿದ ಬುಕಿಂಗ್ ವಿವರಗಳು",
      confirmBooking: "ದೃಢೀಕರಣ ಮುಂದುವರಿಸಿ",
      voiceError: "ಧ್ವನಿ ಪ್ರಕ್ರಿಯೆ ಸಾಧ್ಯವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.",
    },
    pricing: {
      transparentEstimate: "ಪಾರದರ್ಶಕ ದರ ವಿವರಣೆ",
      baseRental: "ಯಂತ್ರದ ಮೂಲ ಬಾಡಿಗೆ",
      mobilizationFreight: "ಸಾಗಾಟ ವೆಚ್ಚ (ಪ್ರತಿ ಕಿ.ಮೀ ಗೆ)",
      operatorWage: "ಪ್ರಮಾಣೀಕೃತ ಆಪರೇಟರ್ ವೇತನ",
      fuelCost: "ಅಂದಾಜು ಡೀಸೆಲ್ ವೆಚ್ಚ",
      gstTax: "ಜಿಎಸ್‌ಟಿ ತೆರಿಗೆ (18%)",
      securityDeposit: "ಹಿಂತಿರುಗಿಸಬಹುದಾದ ಠೇವಣಿ",
      totalPayable: "ಒಟ್ಟು ಪಾವತಿ ಮೊತ್ತ",
      refundableNote: "ಯಂತ್ರ ಕೆಲಸ ಮುಗಿದ ನಂತರ ಠೇವಣಿ ಮೊತ್ತವನ್ನು ತಕ್ಷಣ ಹಿಂತಿರುಗಿಸಲಾಗುತ್ತದೆ.",
      surgePricing: "ಸೀಸನ್ ಡಿಮ್ಯಾಂಡ್ ಹೆಚ್ಚಳ",
    },
    tracking: {
      title: "ಲೈವ್ ಜಿಪಿಎಸ್ ಮತ್ತು ಟೆಲಿಮೆಟ್ರಿ ಟ್ರ್ಯಾಕಿಂಗ್",
      liveEta: "ತಲುಪುವ ಅಂದಾಜು ಸಮಯ",
      speed: "ಸಂಚಾರ ವೇಗ",
      fuelLevel: "ಡೀಸೆಲ್ ಪ್ರಮಾಣ",
      engineRpm: "ಎಂಜಿನ್ RPM",
      engineHours: "ಕೆಲಸ ಮಾಡಿದ ಒಟ್ಟು ಗಂಟೆಗಳು",
      transitRoute: "ಸಾಗುವ ಮಾರ್ಗ ನಕ್ಷೆ",
      driverContact: "ನೇಮಿಸಲಾದ ಆಪರೇಟರ್",
      sosAlert: "ತುರ್ತು ಎಸ್‌ಒಎಸ್ / ಬ್ರೇಕ್‌ಡೌನ್ ವರದಿ",
      immobilizer: "ರಿಮೋಟ್ ಎಂಜಿನ್ ಲಾಕ್",
    },
    bookingStatusMap: {
      PENDING_APPROVAL: "ಮಾಲೀಕರ ಒಪ್ಪಿಗೆಗೆ ಬಾಕಿ ಇದೆ",
      ACCEPTED: "ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ",
      DISPATCHED: "ಟ್ರೇಲರ್ ಮೇಲೆ ಯಂತ್ರ ಹೊರಟಿದೆ",
      IN_TRANSIT: "ಮಾರ್ಗ ಮಧ್ಯದಲ್ಲಿದೆ (ಲೈವ್ ಜಿಪಿಎಸ್)",
      WORKING_ON_SITE: "ಸೈಟ್‌ನಲ್ಲಿ ಕೆಲಸ ನಡೆಯುತ್ತಿದೆ",
      COMPLETED: "ಕೆಲಸ ಪೂರ್ಣಗೊಂಡಿದೆ",
      CANCELLED: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    },
  },

  hi: {
    appName: "हेवीहायर AI",
    tagline: "भारी निर्माण और कृषि मशीनरी का एआई-संचालित मार्केटप्लेस",
    roles: {
      customer: "ग्राहक",
      owner: "मशीन मालिक",
      admin: "एडमिन कंट्रोल",
    },
    common: {
      searchPlaceholder: "जेसीबी, एक्सकेवेटर, हार्वेस्टर, ट्रैक्टर, क्रेन खोजें...",
      all: "सभी",
      filter: "फ़िल्टर",
      apply: "लागू करें",
      cancel: "रद्द करें",
      confirm: "पुष्टि करें",
      close: "बंद करें",
      loading: "लोड हो रहा है...",
      viewDetails: "विवरण और दरें",
      bookNow: "तुरंत बुक करें",
      perDay: "/दिन",
      perHour: "/घंटा",
      verified: "वाहन एवं आरटीओ सत्यापित",
      days: "दिन",
      hours: "घंटे",
      km: "किमी",
      hp: "एचपी",
      tons: "टन",
      distance: "दूरी",
      status: "स्थिति",
      viewMap: "लाइव जीपीएस ट्रैक",
      callOperator: "ऑपरेटर को कॉल करें",
      chat: "एआई चैट / अनुवाद",
      active: "सक्रिय",
      completed: "पूर्ण",
      pending: "लंबित",
      accept: "स्वीकार करें",
      reject: "अस्वीकार करें",
      save: "सहेजें",
      uploadDoc: "आरसी / फिटनेस दस्तावेज अपलोड",
      aiAnalyzing: "जेमिनी एआई दस्तावेज की जांच कर रहा है...",
    },
    nav: {
      explore: "मशीनरी खोजें",
      voiceBooking: "वॉयस बुकिंग (AI)",
      estimator: "प्रोजेक्ट अनुमान",
      liveTracking: "लाइव ट्रैकिंग",
      myBookings: "मेरी बुकिंग",
      fleet: "मशीन बेड़ा",
      calendar: "उपलब्धता कैलेंडर",
      earnings: "कमाई और भुगतान",
      maintenance: "रखरखाव अलर्ट",
      disputes: "विवाद निवारण",
      verifications: "केवाईसी जांच",
      analytics: "मार्केट एनालिटिक्स",
      kotlinSource: "कोटलिन कंपोज़ MVVM",
    },
    categories: {
      earthmoving: "एक्सकेवेटर और जेसीबी",
      agricultural: "हार्वेस्टर और ट्रैक्टर",
      concrete: "कंक्रीट मिक्सर और पंप",
      lifting: "हाइड्रा क्रेन और बूम",
      drilling: "बोरवेल और पाइलिंग रिग",
      haulage: "डंपर और टिपर ट्रक",
      roadwork: "रोड रोलर और कॉम्पेक्टर",
    },
    voice: {
      tapToSpeak: "बोलकर बुक करें (हिंदी)",
      listening: "आपकी आवश्यकता सुनी जा रही है...",
      processing: "जेमिनी एआई विवरण निकाल रहा है...",
      speakNowHint: "उदा. 'मुझे कल 2 दिन के लिए इंदौर में 20 टन एक्सकेवेटर चाहिए'",
      samplePrompt1: "मुझे कल 2 दिन के लिए जेसीबी 3डीएक्स चाहिए ऑपरेटर के साथ",
      samplePrompt2: "मुझे 1 दिन के लिए कंबाइन हार्वेस्टर चाहिए",
      samplePrompt3: "नींव खुदाई के लिए 20 टन पोकलेन रॉक ब्रेकर के साथ चाहिए",
      aiRecognized: "एआई द्वारा पहचाने गए बुकिंग विवरण",
      confirmBooking: "बुकिंग की पुष्टि करें",
      voiceError: "ध्वनि इनपुट प्रोसेस नहीं हो सका। कृपया पुनः प्रयास करें।",
    },
    pricing: {
      transparentEstimate: "पारदर्शी मूल्य विवरण",
      baseRental: "मशीन का मूल किराया",
      mobilizationFreight: "परिवहन शुल्क (प्रति किमी)",
      operatorWage: "प्रमाणित ऑपरेटर मजदूरी",
      fuelCost: "अनुमानित डीजल लागत",
      gstTax: "सरकारी जीएसटी (18%)",
      securityDeposit: "वापसी योग्य सुरक्षा जमा",
      totalPayable: "कुल देय राशि",
      refundableNote: "काम पूरा होने और डिजिटल इंस्पेक्शन के बाद सुरक्षा जमा तुरंत वापस किया जाता है।",
      surgePricing: "सीजन मांग गुणांक",
    },
    tracking: {
      title: "लाइव जीपीएस और टेलीमेट्री ट्रैकिंग",
      liveEta: "पहुंचने का अनुमानित समय",
      speed: "गाड़ी की गति",
      fuelLevel: "डीजल टैंक स्तर",
      engineRpm: "इंजन आरपीएम",
      engineHours: "कुल कार्य घंटे",
      transitRoute: "परिवहन मार्ग नक्शा",
      driverContact: "निर्धारित ऑपरेटर",
      sosAlert: "आपातकालीन एसओएस / ब्रेकडाउन",
      immobilizer: "रिमोट इंजन लॉक",
    },
    bookingStatusMap: {
      PENDING_APPROVAL: "मालिक की मंजूरी लंबित",
      ACCEPTED: "बुकिंग कन्फर्म हो गई",
      DISPATCHED: "मशीन ट्रेलर पर रवाना",
      IN_TRANSIT: "रास्ते में है (लाइव जीपीएस)",
      WORKING_ON_SITE: "साइट पर काम जारी",
      COMPLETED: "काम पूरा हो चुका है",
      CANCELLED: "रद्द किया गया",
    },
  },
};
