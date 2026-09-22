"use client";
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/context/LanguageContext';

export default function MasterPortal() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-4xl w-full animate-in zoom-in-95 duration-500">
        
        {/* Language Switcher — top right */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-200 mx-auto mb-6">
            B
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            BusinessOS <span className="text-blue-600">Health</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">{t.selectPortal}</p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Patient Booking */}
          <Link href="/book" className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.bookAppointment}</h2>
            <p className="text-slate-500 text-sm">{t.findHospitalsBook}</p>
          </Link>

          {/* Patient Health Portal */}
          <Link href="/health" className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.myHealthRecords}</h2>
            <p className="text-slate-500 text-sm">{t.viewPrescriptions}</p>
          </Link>

          {/* Staff Login */}
          <Link href="/login" className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.hospitalStaffLogin}</h2>
            <p className="text-slate-500 text-sm">{t.doctorsReceptionists}</p>
          </Link>

          {/* Super Admin */}
          <Link href="/login" className="group bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm hover:shadow-2xl transition-all flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-800 text-slate-300 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t.platformOwner}</h2>
            <p className="text-slate-400 text-sm">{t.manageTenants}</p>
          </Link>

        </div>
        
        <div className="mt-12 text-center text-slate-400 text-sm font-medium">
          {t.poweredBy}
        </div>
      </div>
    </div>
  );
}
