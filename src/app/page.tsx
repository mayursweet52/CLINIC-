import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="text-center w-full max-w-5xl px-6 relative z-10">
        <div className="mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide uppercase border border-indigo-100 mb-6 shadow-sm">
            Enterprise Clinic System v2.0
          </span>
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Modern Healthcare, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Simplified.
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A unified, secure, and highly scalable platform designed to streamline patient care, automate billing, and manage staff operations seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-16">
          <Link
            href="/patient/login"
            className="group relative p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-indigo-200 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col items-start text-left overflow-hidden"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-xl font-bold border border-blue-100 group-hover:scale-110 transition-transform">
              P
            </div>
            <h5 className="mb-3 text-2xl font-bold text-slate-900">
              Patient Portal
            </h5>
            <p className="text-slate-500 leading-relaxed mb-8 text-sm">
              Securely access your medical records, book new appointments, and view digital prescriptions from anywhere.
            </p>
            <div className="mt-auto flex items-center text-blue-600 font-semibold text-sm">
              Access Portal <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link
            href="/staff/login"
            className="group relative p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-indigo-200 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col items-start text-left overflow-hidden"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 text-xl font-bold border border-indigo-100 group-hover:scale-110 transition-transform">
              S
            </div>
            <h5 className="mb-3 text-2xl font-bold text-slate-900">
              Staff Portal
            </h5>
            <p className="text-slate-500 leading-relaxed mb-8 text-sm">
              Manage patient queues, access EMR, handle billing, and oversee pharmacy inventory in a unified dashboard.
            </p>
            <div className="mt-auto flex items-center text-indigo-600 font-semibold text-sm">
              Access Dashboard <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
