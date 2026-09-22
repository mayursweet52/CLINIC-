import Link from 'next/link';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
              C
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Clinic<span className="text-slate-400 font-medium">OS</span></h1>
          </div>
          <nav>
            <ul className="flex items-center space-x-1 text-sm font-medium text-slate-500">
              <li><Link href="/staff" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-all">Doctor Dash</Link></li>
              <li><Link href="/staff/receptionist" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-all">Reception</Link></li>
              <li><Link href="/staff/pharmacy" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-all">Pharmacy</Link></li>
              <li><Link href="/staff/lab" className="px-3 py-2 rounded-lg hover:text-purple-700 hover:bg-purple-50 transition-all">🧪 Lab Desk</Link></li>
              <li><Link href="/staff/billing" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-all">Billing Desk</Link></li>
              <li><Link href="/superadmin" className="px-3 py-2 rounded-lg text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 font-bold transition-all">👑 Admin Hub</Link></li>
              <li className="pl-3">
                <Link href="/staff/login" className="px-3.5 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors font-bold text-xs flex items-center gap-1.5">
                  Logout
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}
