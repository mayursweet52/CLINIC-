"use client"

import { usePatientDashboard } from "@/features/portal/hooks"
import { AppointmentCard } from "@/features/portal/components/AppointmentCard"
import { PrescriptionCard } from "@/features/portal/components/PrescriptionCard"
import { BillCard } from "@/features/portal/components/BillCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Calendar, Pill, User, Home, FileText } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function PortalDashboard() {
  const { data: dashboard, isLoading } = usePatientDashboard()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!dashboard) return null

  return (
    <div className="pb-20 min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-800">
            <AvatarImage src={dashboard.avatar} />
            <AvatarFallback>{dashboard.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Good morning,</p>
            <h1 className="font-bold text-slate-900 dark:text-slate-100">{dashboard.name}</h1>
          </div>
        </div>
        <button className="relative p-2 rounded-full hover:bg-slate-100 dark:bg-slate-800">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-4 h-4" /></div>
            <div>
              <div className="text-lg font-bold">1</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Upcoming</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText className="w-4 h-4" /></div>
            <div>
              <div className="text-lg font-bold">4</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Reports</div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointment */}
        {dashboard.upcomingAppointment && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Upcoming Appointment</h2>
            <AppointmentCard appointment={dashboard.upcomingAppointment} />
          </section>
        )}

        {/* Recent Prescriptions */}
        {dashboard.recentPrescriptions?.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Prescriptions</h2>
              <button className="text-sm text-primary font-medium">View all</button>
            </div>
            <div className="space-y-2">
              {dashboard.recentPrescriptions.map(rx => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          </section>
        )}

        {/* Pending Bills */}
        {dashboard.pendingBills?.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pending Bills</h2>
            <div className="space-y-2">
              {dashboard.pendingBills.map(bill => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-safe z-10 max-w-md left-1/2 -translate-x-1/2 rounded-t-2xl shadow-lg">
        <div className="flex justify-around p-3">
          <button className="flex flex-col items-center gap-1 p-2 text-primary">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-400">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium">Visits</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-400">
            <Pill className="w-5 h-5" />
            <span className="text-[10px] font-medium">Rx</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-400">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
