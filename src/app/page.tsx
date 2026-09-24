"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/context/LanguageContext";
import { Calendar, FileText, UserCheck, ShieldCheck, HeartPulse, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function MasterPortal() {
  const { t } = useLang();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-100 selection:text-primary-900 transition-colors">
      
      {/* Top Header Bar */}
      <header className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3 text-on-surface font-semibold text-lg">
          <div className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-sm">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span>ClinicOS</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <motion.main 
        className="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="text-center mb-12 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-100 text-primary-700 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm">
            <HeartPulse className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-bold text-on-surface tracking-tight mb-4">
            ClinicOS
          </h1>
          <p className="text-lg text-on-surface-variant font-medium max-w-xl mx-auto">
            Real-time clinic management made simple
          </p>
        </motion.div>

        {/* Portal Cards Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* Card 1: Book Appointment */}
          <Link href="/book" className="block outline-none group">
            <motion.div variants={itemVariants} className="bg-surface-lowest rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col border border-outline-variant/20">
              <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                <Calendar className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-semibold text-on-surface mb-2">Book Appointment</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Find hospitals, choose verified doctors, and get your token instantly.
              </p>
              <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-600">
                <ArrowRight className="w-6 h-6" />
              </div>
            </motion.div>
          </Link>

          {/* Card 2: My Health Records */}
          <Link href="/portal/login" className="block outline-none group">
            <motion.div variants={itemVariants} className="bg-surface-lowest rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col border border-outline-variant/20">
              <div className="w-14 h-14 bg-secondary-100 text-secondary-700 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-semibold text-on-surface mb-2">My Health Records</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                View prescriptions, invoices, lab reports with secure login.
              </p>
              <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-secondary-600">
                <ArrowRight className="w-6 h-6" />
              </div>
            </motion.div>
          </Link>

          {/* Card 3: Hospital Staff Login */}
          <Link href="/login" className="block outline-none group">
            <motion.div variants={itemVariants} className="bg-surface-lowest rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col border border-outline-variant/20">
              <div className="w-14 h-14 bg-tertiary-100 text-tertiary-700 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                <UserCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-semibold text-on-surface mb-2">Hospital Staff Login</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Dedicated portal for doctors, receptionists, pharmacists, and admins.
              </p>
              <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-tertiary-600">
                <ArrowRight className="w-6 h-6" />
              </div>
            </motion.div>
          </Link>

          {/* Card 4: Platform Owner */}
          <Link href="/login" className="block outline-none group">
            <motion.div variants={itemVariants} className="bg-surface-lowest rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col border border-outline-variant/20">
              <div className="w-14 h-14 bg-error-container text-error rounded-2xl flex items-center justify-center mb-4 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-semibold text-on-surface mb-2">Platform Owner</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Multi-tenant admin console for reports, audit logs, and clinic management.
              </p>
              <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-error">
                <ArrowRight className="w-6 h-6" />
              </div>
            </motion.div>
          </Link>

        </motion.div>
      </motion.main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs text-on-surface-variant font-medium">
        <p className="mb-2">© 2026 ClinicOS. HIPAA & SOC2 compliant.</p>
        <div className="flex justify-center gap-4">
          <a href="#" className="hover:text-on-surface transition-colors">Privacy</a>
          <a href="#" className="hover:text-on-surface transition-colors">Terms</a>
          <a href="#" className="hover:text-on-surface transition-colors">Security</a>
        </div>
      </footer>

    </div>
  );
}
