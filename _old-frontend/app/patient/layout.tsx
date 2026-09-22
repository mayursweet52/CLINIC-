import Link from 'next/link';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-blue-200">
              C
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Clinic<span className="text-slate-400 font-medium">OS</span></h1>
          </div>
          <nav>
            <ul className="flex items-center space-x-1 text-sm font-medium text-slate-500">
              <li><Link href="/patient" className="px-4 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-all">My Health</Link></li>
              <li><Link href="/patient/book" className="px-4 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-all">Book Appointment</Link></li>
              <li className="pl-4">
                <Link href="/" className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  Log Out
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
