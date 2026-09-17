'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PatientLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/patient');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-sans relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 p-6">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          ← Back to Portal
        </Link>

        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-xl font-bold border border-blue-100 shadow-sm">
            P
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Patient Login</h2>
          <p className="text-slate-500 text-sm mb-8">Securely access your medical records and appointments.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Phone Number or ID</label>
              <input 
                type="text" 
                required 
                className="w-full px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-slate-900" 
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                required 
                className="w-full px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-slate-900" 
                placeholder="••••••••"
              />
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {loading ? 'Authenticating...' : 'Secure Login →'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              By logging in, you agree to our strict <span className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer">Data Privacy Policy</span>. Your medical data is encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
