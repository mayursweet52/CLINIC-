import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Stethoscope, Activity, Shield, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Stethoscope className="w-6 h-6" />
          <span>ClinicOS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/portal/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Patient Portal
          </Link>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Staff Login</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          ClinicOS 2.0 is Live
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Real-time <span className="text-primary">clinic management</span> made simple.
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl">
          A unified platform for doctors, receptionists, pharmacists, and patients. Streamline your entire clinic workflow with zero friction.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="text-base h-12 px-8">
            <Link href="/book">Book Appointment</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base h-12 px-8">
            <Link href="/login">Staff Login</Link>
          </Button>
        </div>
      </main>

      {/* Features */}
      <section className="bg-white py-24 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real-time Sync</h3>
              <p className="text-slate-600">Appointments, lab results, and billing are updated instantly across all staff dashboards via WebSockets.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise Security</h3>
              <p className="text-slate-600">HIPAA compliant architecture with role-based access control and detailed audit logs for every action.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Multi-role Workflows</h3>
              <p className="text-slate-600">Dedicated portals for Doctors, Receptionists, and Pharmacists tailored perfectly to their specific daily tasks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Stethoscope className="w-6 h-6" />
            <span>ClinicOS</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} Aarogya Clinic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
