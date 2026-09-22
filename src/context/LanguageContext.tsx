"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "hi" | "mr";

export const translations = {
  en: {
    // Navbar
    patientPortal: "Patient Portal",
    staffLogin: "Staff Login",
    bookAppointment: "Book Appointment",
    myHealthRecords: "My Health Records",
    hospitalStaffLogin: "Hospital Staff Login",
    platformOwner: "Platform Owner",
    // Book page
    findHospital: "Find a Hospital Near You",
    findHospitalSub: "Select a healthcare facility to book your appointment online.",
    selectDoctor: "Select a verified specialist to continue booking.",
    backToHospitals: "← Back to Hospitals",
    backToDoctors: "← Back to Doctors",
    available: "Available",
    fee: "Fee",
    patientFullName: "Patient Full Name",
    mobileNumber: "Mobile Number",
    date: "Date",
    timeSlot: "Time Slot",
    selectSlot: "Select Slot",
    confirmBooking: "Confirm Booking",
    confirming: "Confirming...",
    appointmentConfirmed: "Appointment Confirmed!",
    bookAnother: "Book Another Appointment",
    tokenNumber: "Token Number",
    patientCode: "Patient Code",
    scanAtCounter: "Scan at Check-in Counter",
    keepCodeSafe: "Keep your Patient Code safe. You can use it to view your prescriptions online.",
    // Home page
    selectPortal: "Select your portal to continue into the system.",
    doctorsReceptionists: "Doctors, Receptionists, and Pharmacists.",
    manageTenants: "Super Admin Dashboard to manage hospital tenants.",
    findHospitalsBook: "Find hospitals and book your token instantly.",
    viewPrescriptions: "View your prescriptions and lab reports using your Patient ID.",
    poweredBy: "Powered by BusinessOS • All Systems Operational",
    // Queue TV
    nowCalling: "NOW CALLING",
    waitingRoom: "Waiting Room",
    upNext: "UP NEXT",
    liveQueue: "Live Queue",
    // Health page
    patientId: "Patient ID / Mobile",
    searchRecords: "Search Records",
    searching: "Searching...",
    noHospitals: "No active hospitals found.",
    language: "Language",
  },
  hi: {
    patientPortal: "मरीज़ पोर्टल",
    staffLogin: "स्टाफ लॉगिन",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    myHealthRecords: "मेरे स्वास्थ्य रिकॉर्ड",
    hospitalStaffLogin: "अस्पताल स्टाफ लॉगिन",
    platformOwner: "प्लेटफ़ॉर्म मालिक",
    findHospital: "नज़दीकी अस्पताल खोजें",
    findHospitalSub: "ऑनलाइन अपॉइंटमेंट बुक करने के लिए अस्पताल चुनें।",
    selectDoctor: "बुकिंग जारी रखने के लिए विशेषज्ञ चुनें।",
    backToHospitals: "← अस्पतालों पर वापस जाएं",
    backToDoctors: "← डॉक्टरों पर वापस जाएं",
    available: "उपलब्ध",
    fee: "शुल्क",
    patientFullName: "मरीज़ का पूरा नाम",
    mobileNumber: "मोबाइल नंबर",
    date: "तारीख",
    timeSlot: "समय स्लॉट",
    selectSlot: "स्लॉट चुनें",
    confirmBooking: "बुकिंग पक्की करें",
    confirming: "पक्की हो रही है...",
    appointmentConfirmed: "अपॉइंटमेंट पक्की हो गई!",
    bookAnother: "दूसरी अपॉइंटमेंट बुक करें",
    tokenNumber: "टोकन नंबर",
    patientCode: "मरीज़ कोड",
    scanAtCounter: "काउंटर पर स्कैन करें",
    keepCodeSafe: "अपना मरीज़ कोड सुरक्षित रखें। इससे आप ऑनलाइन प्रिस्क्रिप्शन देख सकते हैं।",
    selectPortal: "सिस्टम में प्रवेश करने के लिए पोर्टल चुनें।",
    doctorsReceptionists: "डॉक्टर, रिसेप्शनिस्ट और फार्मासिस्ट।",
    manageTenants: "अस्पताल किरायेदारों का प्रबंधन करें।",
    findHospitalsBook: "अस्पताल खोजें और तुरंत टोकन बुक करें।",
    viewPrescriptions: "अपने मरीज़ ID से प्रिस्क्रिप्शन देखें।",
    poweredBy: "BusinessOS द्वारा संचालित • सभी सिस्टम सक्रिय",
    nowCalling: "अभी बुलाया जा रहा है",
    waitingRoom: "प्रतीक्षालय",
    upNext: "अगला",
    liveQueue: "लाइव कतार",
    patientId: "मरीज़ ID / मोबाइल",
    searchRecords: "रिकॉर्ड खोजें",
    searching: "खोज रहे हैं...",
    noHospitals: "कोई सक्रिय अस्पताल नहीं मिला।",
    language: "भाषा",
  },
  mr: {
    patientPortal: "रुग्ण पोर्टल",
    staffLogin: "स्टाफ लॉगिन",
    bookAppointment: "भेट बुक करा",
    myHealthRecords: "माझे आरोग्य अभिलेख",
    hospitalStaffLogin: "रुग्णालय स्टाफ लॉगिन",
    platformOwner: "प्लॅटफॉर्म मालक",
    findHospital: "जवळचे रुग्णालय शोधा",
    findHospitalSub: "ऑनलाइन भेट बुक करण्यासाठी रुग्णालय निवडा।",
    selectDoctor: "बुकिंग सुरू ठेवण्यासाठी तज्ञ निवडा।",
    backToHospitals: "← रुग्णालयांकडे परत जा",
    backToDoctors: "← डॉक्टरांकडे परत जा",
    available: "उपलब्ध",
    fee: "शुल्क",
    patientFullName: "रुग्णाचे पूर्ण नाव",
    mobileNumber: "मोबाइल नंबर",
    date: "तारीख",
    timeSlot: "वेळ स्लॉट",
    selectSlot: "स्लॉट निवडा",
    confirmBooking: "बुकिंग निश्चित करा",
    confirming: "निश्चित होत आहे...",
    appointmentConfirmed: "भेट निश्चित झाली!",
    bookAnother: "दुसरी भेट बुक करा",
    tokenNumber: "टोकन नंबर",
    patientCode: "रुग्ण कोड",
    scanAtCounter: "काउंटरवर स्कॅन करा",
    keepCodeSafe: "तुमचा रुग्ण कोड सुरक्षित ठेवा. त्याद्वारे तुम्ही ऑनलाइन प्रिस्क्रिप्शन पाहू शकता.",
    selectPortal: "सिस्टममध्ये प्रवेश करण्यासाठी पोर्टल निवडा।",
    doctorsReceptionists: "डॉक्टर, रिसेप्शनिस्ट आणि फार्मासिस्ट।",
    manageTenants: "रुग्णालय भाडेकरूंचे व्यवस्थापन करा।",
    findHospitalsBook: "रुग्णालय शोधा आणि लगेच टोकन बुक करा.",
    viewPrescriptions: "तुमच्या रुग्ण ID ने प्रिस्क्रिप्शन पहा.",
    poweredBy: "BusinessOS द्वारे संचालित • सर्व प्रणाली कार्यरत",
    nowCalling: "आता बोलावत आहे",
    waitingRoom: "प्रतीक्षा कक्ष",
    upNext: "पुढील",
    liveQueue: "लाइव्ह रांग",
    patientId: "रुग्ण ID / मोबाइल",
    searchRecords: "अभिलेख शोधा",
    searching: "शोधत आहे...",
    noHospitals: "कोणतेही सक्रिय रुग्णालय आढळले नाही.",
    language: "भाषा",
  },
};

type Translations = typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
