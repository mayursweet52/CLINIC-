export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">C</div>
            <h1 className="text-xl font-bold tracking-tight">ClinicOS <span className="text-blue-600">Health</span></h1>
          </div>
          <span className="text-sm font-medium text-slate-500">Secure Patient Portal</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-6">
        {children}
      </main>
      <footer className="py-6 text-center text-slate-400 text-sm">
        Powered by BusinessOS Health • Secure & Encrypted
      </footer>
    </div>
  );
}
