"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/context/LanguageContext";
import { Stethoscope, Calendar, FileText, UserCheck, ShieldCheck, Sparkles } from "lucide-react";

export default function MasterPortal() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-blue-100 selection:text-blue-900 transition-colors">
      <div className="max-w-4xl w-full animate-in zoom-in-95 duration-500">
        
        {/* Top Navbar / Language Switcher */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-xl">
            <Stethoscope className="w-6 h-6" />
            <span>Clinic<span className="text-slate-900 dark:text-slate-100">OS</span></span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/20 mx-auto mb-6">
            🏥
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
            BusinessOS <span className="text-blue-600 dark:text-blue-400">Health</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto">
            {t?.selectPortal || "Select your portal to continue into the system."}
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Patient Booking */}
          <Link 
            href="/book" 
            className="group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t?.bookAppointment || "Book Appointment"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t?.findHospitalsBook || "Find hospitals, choose verified doctors and get instant token."}
            </p>
          </Link>

          {/* Card 2: Patient Health Records */}
          <Link 
            href="/portal/login" 
            className="group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t?.myHealthRecords || "My Health Records"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t?.viewPrescriptions || "View your digital prescriptions, invoices & lab reports with mobile OTP."}
            </p>
          </Link>

          {/* Card 3: Hospital Staff Login */}
          <Link 
            href="/login" 
            className="group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <UserCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t?.hospitalStaffLogin || "Hospital Staff Login"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t?.doctorsReceptionists || "Dedicated dashboard for Doctors, Receptionists, and Pharmacists."}
            </p>
          </Link>

          {/* Card 4: Super Admin / Platform Owner */}
          <Link 
            href="/login" 
            className="group bg-slate-900 dark:bg-slate-800 p-8 rounded-3xl border border-slate-800 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:border-slate-600 transition-all flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-slate-800 dark:bg-slate-700 text-slate-300 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t?.platformOwner || "Platform Owner"}
            </h2>
            <p className="text-slate-400 text-sm">
              {t?.manageTenants || "Super Admin & Management Hub to view reports and audit logs."}
            </p>
          </Link>

        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 dark:text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
          <span>{t?.poweredBy || "Powered by BusinessOS • All Systems Operational"}</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Live
          </span>
        </div>

      </div>
    </div>
  );
}
