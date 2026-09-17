import Link from 'next/link';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-indigo-800 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">Staff Portal</h1>
          <nav>
            <ul className="flex space-x-2 text-sm font-medium">
              <li><Link href="/staff" className="px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Doctor Dash</Link></li>
              <li><Link href="/staff/receptionist" className="px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Receptionist Dash</Link></li>
              <li><Link href="/staff/pharmacy" className="px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Pharmacy</Link></li>
              <li><Link href="/staff/finance" className="px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Finance</Link></li>
              <li><Link href="/staff/billing" className="px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Billing</Link></li>
              <li><Link href="/" className="px-4 py-2 rounded-md text-indigo-300 hover:text-white transition-colors">Log Out</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
