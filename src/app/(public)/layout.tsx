import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope, CalendarCheck, User, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 md:px-8 backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-teal-500 text-white shadow-sm shadow-primary-500/20">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">ClinicOS</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Enterprise Health Suite</span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            href="/book"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </Link>

          <Link
            href="/portal/login"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Portal</span>
          </Link>

          <ThemeToggle />

          <Button asChild size="sm" className="bg-primary-600 hover:bg-primary-700 text-white shadow-xs text-xs font-semibold">
            <Link href="/login" className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
