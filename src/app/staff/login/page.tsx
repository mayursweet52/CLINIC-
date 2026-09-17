'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffLogin() {
  const [email, setEmail] = useState('dr.smith@clinic.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Doctor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string, customRole?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    const targetEmail = customEmail || email;
    const targetPass = customPass || password;
    const targetRole = customRole || role;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPass, role: targetRole.toUpperCase() })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      
      const resData = await res.json();
      if (resData.role === 'RECEPTIONIST') {
        router.push('/staff/receptionist');
      } else {
        router.push('/staff');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const quickLogin = (loginRole: string, loginEmail: string) => {
    setEmail(loginEmail);
    setPassword('password123');
    setRole(loginRole);
    handleLogin(undefined, loginEmail, 'password123', loginRole);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-sans relative overflow-hidden py-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 p-6">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          ← Back to Master Hub
        </Link>

        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold border border-indigo-100 shadow-sm">
            S
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">Staff Access</h2>
          <p className="text-slate-500 text-xs mb-6">Clinic Management System Workstation</p>

          {/* Quick 1-Click Demo Logins */}
          <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">1-Click Instant Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => quickLogin('Doctor', 'dr.smith@clinic.com')}
                disabled={loading}
                className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all shadow-sm group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">🩺 Dr. Smith</p>
                <p className="text-[10px] text-slate-400">Doctor Console</p>
              </button>
              <button 
                type="button"
                onClick={() => quickLogin('Receptionist', 'reception@clinic.com')}
                disabled={loading}
                className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all shadow-sm group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">📋 Reception Desk</p>
                <p className="text-[10px] text-slate-400">Walk-In & Queue</p>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold text-slate-800"
              >
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 rounded-xl p-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all"
                placeholder="dr.smith@clinic.com"
                required
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 text-sm font-medium text-slate-900"
                placeholder="password123"
                required
              />
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In →'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Default password: <span className="font-mono text-slate-600 font-bold">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
