"use client"

import { usePatientDashboard } from "@/features/portal/hooks"
import { Bell, Calendar, Pill, User, Home, FileText, ChevronRight, Download, CreditCard, Navigation } from "lucide-react"
import { Loader2 } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { StatCard } from "@/components/shared/StatCard"
import { Button } from "@/components/ui/button"

export default function PortalDashboard() {
  const { data: dashboard, isLoading } = usePatientDashboard()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
  }

  if (!dashboard) return null

  return (
    <div className="pb-24 min-h-screen bg-surface">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-surface-lowest/95 backdrop-blur-md border-b border-outline-variant/20 p-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
            {dashboard.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Hi, {dashboard.name.split(' ')[0]}</p>
            <h1 className="font-semibold text-on-surface text-sm">PT-89201</h1>
          </div>
        </div>
        <button className="relative p-2 rounded-full hover:bg-surface-low transition-colors text-on-surface-variant">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface-lowest" />
        </button>
      </header>

      <main className="p-4 space-y-8 max-w-4xl mx-auto mt-4">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Upcoming" value={1} icon={Calendar} color="primary" />
          <StatCard label="Prescriptions" value={dashboard.recentPrescriptions?.length || 0} icon={Pill} color="tertiary" />
          <StatCard label="Bills" value={dashboard.pendingBills?.length || 0} icon={FileText} color="error" />
          <StatCard label="Lab Reports" value={4} icon={FileText} color="secondary" />
        </div>

        {/* Section 1: Upcoming Appointment */}
        {dashboard.upcomingAppointment && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-on-surface px-1">Upcoming Appointment</h2>
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/40 dark:to-secondary-900/40 rounded-2xl p-6 shadow-sm border border-primary-100 dark:border-primary-800/30">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-primary-700 shadow-sm">
                    {dashboard.upcomingAppointment.doctorName.replace('Dr. ', '').substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface text-lg">{dashboard.upcomingAppointment.doctorName}</h3>
                    <p className="text-sm text-on-surface-variant">{dashboard.upcomingAppointment.specialty}</p>
                  </div>
                </div>
                <StatusBadge status={dashboard.upcomingAppointment.status} />
              </div>
              
              <div className="flex items-end justify-between mb-6 border-t border-primary-200/50 dark:border-primary-700/50 pt-4">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="text-xl font-bold text-on-surface">{dashboard.upcomingAppointment.date}</p>
                  <p className="text-sm font-medium text-on-surface-variant mt-0.5">{dashboard.upcomingAppointment.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Token</p>
                  <p className="text-3xl font-mono font-bold text-primary-600">#14</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
                  <Navigation className="w-4 h-4 mr-2" /> Get Directions
                </Button>
                <Button variant="outline" className="flex-1 bg-white/50 dark:bg-slate-950/50 border-outline-variant/30 text-on-surface hover:bg-white dark:hover:bg-slate-950">
                  Cancel
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Section 2: Recent Prescriptions */}
        {dashboard.recentPrescriptions?.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-on-surface">Recent Prescriptions</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">View All</button>
            </div>
            <div className="space-y-3">
              {dashboard.recentPrescriptions.map(rx => (
                <div key={rx.id} className="bg-surface-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between group hover:border-primary-300 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-tertiary-100 text-tertiary-700 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-on-surface text-sm">{rx.doctorName}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{rx.date} • {rx.medicines} medicines</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="ACTIVE" />
                    <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Pending Bills */}
        {dashboard.pendingBills?.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-on-surface">Recent Bills</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">View All</button>
            </div>
            <div className="space-y-3">
              {dashboard.pendingBills.map(bill => (
                <div key={bill.id} className="bg-surface-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-2xl font-bold text-on-surface">₹{bill.amount}</h4>
                      <StatusBadge status="PENDING" />
                    </div>
                    <p className="text-xs text-on-surface-variant">Generated on {bill.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-surface-lowest border-outline-variant/30 text-on-surface">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                    <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white">
                      <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 w-full bg-surface-lowest/95 backdrop-blur-md border-t border-outline-variant/20 pb-safe z-20 md:hidden">
        <div className="flex justify-around p-2">
          <button className="flex flex-col items-center gap-1 p-2 text-primary-600 group">
            <div className="px-4 py-1 rounded-full bg-primary-100 transition-colors">
              <Home className="w-5 h-5 fill-primary-600" />
            </div>
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-on-surface group">
            <div className="px-4 py-1 rounded-full group-hover:bg-surface-low transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Visits</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-on-surface group">
            <div className="px-4 py-1 rounded-full group-hover:bg-surface-low transition-colors">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Rx</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-on-surface group">
            <div className="px-4 py-1 rounded-full group-hover:bg-surface-low transition-colors">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
