'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const role = (form.elements.namedItem('role') as HTMLSelectElement).value;
    
    setTimeout(() => {
      if (role === 'Doctor') router.push('/staff');
      else if (role === 'Receptionist') router.push('/staff/receptionist');
      else router.push('/staff');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 p-6">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          ← Back to Portal
        </Link>

        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 text-xl font-bold border border-indigo-100 shadow-sm">
            S
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Staff Access</h2>
          <p className="text-slate-500 text-sm mb-8">Authorized personnel only. Secure your session.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Role</label>
              <select 
                name="role" 
                className="w-full px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all font-bold text-slate-900 cursor-pointer"
              >
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Staff ID</label>
              <input 
                type="text" 
                required 
                className="w-full px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all font-medium text-slate-900" 
                placeholder="EMP-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                required 
                className="w-full px-5 py-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all font-medium text-slate-900" 
                placeholder="••••••••"
              />
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {loading ? 'Authenticating...' : 'Secure Login →'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Access is logged and monitored. <span className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer">HIPAA Compliant</span> infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
