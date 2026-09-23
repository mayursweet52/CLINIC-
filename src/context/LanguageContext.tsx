"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "hi" | "mr";

export const translations = {
  en: {
    selectPortal: "Select your portal to continue into the system.",
    bookAppointment: "Book Appointment",
    findHospitalsBook: "Find hospitals, choose verified doctors and get instant token.",
    myHealthRecords: "My Health Records",
    viewPrescriptions: "View your digital prescriptions, invoices & lab reports with mobile OTP.",
    hospitalStaffLogin: "Hospital Staff Login",
    doctorsReceptionists: "Dedicated dashboard for Doctors, Receptionists, and Pharmacists.",
    platformOwner: "Platform Owner",
    manageTenants: "Super Admin & Management Hub to view reports and audit logs.",
    poweredBy: "Powered by BusinessOS • All Systems Operational",
  },
  hi: {
    selectPortal: "सिस्टम में प्रवेश करने के लिए अपना पोर्टल चुनें।",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    findHospitalsBook: "अस्पताल खोजें, डॉक्टर चुनें और तुरंत टोकन प्राप्त करें।",
    myHealthRecords: "स्वास्थ्य रिकॉर्ड",
    viewPrescriptions: "मोबाइल OTP से अपने प्रिस्क्रिप्शन, बिल और लैब रिपोर्ट देखें।",
    hospitalStaffLogin: "स्टाफ लॉगिन",
    doctorsReceptionists: "डॉक्टर, रिसेप्शनिस्ट और फार्मासिस्ट के लिए डैशबोर्ड।",
    platformOwner: "प्लेटफ़ॉर्म मालिक",
    manageTenants: "अस्पतालों, रिपोर्ट्स और ऑडिट लॉग्स के प्रबंधन का सुपर एडमिन हब।",
    poweredBy: "BusinessOS द्वारा संचालित • सभी सिस्टम सक्रिय",
  },
  mr: {
    selectPortal: "सिस्टममध्ये प्रवेश करण्यासाठी पोर्टल निवडा.",
    bookAppointment: "भेट बुक करा",
    findHospitalsBook: "रुग्णालय शोधा, डॉक्टर निवडा आणि लगेच टोकन मिळवा.",
    myHealthRecords: "आरोग्य अभिलेख",
    viewPrescriptions: "मोबाइल OTP द्वारे प्रिस्क्रिप्शन, बिले आणि लॅब रिपोर्ट्स पहा.",
    hospitalStaffLogin: "स्टाफ लॉगिन",
    doctorsReceptionists: "डॉक्टर, रिसेप्शनिस्ट आणि फार्मसिस्टसाठी डॅशबोर्ड.",
    platformOwner: "प्लॅटफॉर्म मालक",
    manageTenants: "रुग्णालये, रिपोर्ट्स आणि ऑडिट लॉग्सचे व्यवस्थापन करा.",
    poweredBy: "BusinessOS द्वारे संचालित • सर्व प्रणाली कार्यरत",
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
