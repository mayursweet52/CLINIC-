import Link from 'next/link';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-blue-700 text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">Patient Portal</h1>
          <nav>
            <ul className="flex space-x-2 text-sm font-medium">
              <li><Link href="/patient" className="px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">Dashboard</Link></li>
              <li><Link href="/patient/book" className="px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">Book Appointment</Link></li>
              <li><Link href="/" className="px-4 py-2 rounded-md text-blue-200 hover:text-white transition-colors">Log Out</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
