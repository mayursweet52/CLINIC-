import Link from 'next/link';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
              B
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Business<span className="text-indigo-600 font-extrabold">OS</span> <span className="text-slate-400 font-medium text-sm ml-1">Super Admin</span></h1>
          </div>
          <nav>
            <ul className="flex items-center space-x-1 text-sm font-bold text-slate-500">
              <li><Link href="/superadmin" className="px-4 py-2 rounded-lg text-indigo-700 bg-indigo-50 transition-all">Organizations</Link></li>
              <li className="pl-4">
                <Link href="/staff/login" className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
