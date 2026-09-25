"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  HeartPulse, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Stethoscope, 
  FileText, 
  FlaskConical, 
  Sparkles, 
  Phone, 
  Lock, 
  UserCheck, 
  ArrowRight,
  Zap
} from "lucide-react";

export default function PatientLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const isStaffEmail = phoneOrEmail.includes("@");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const data = {
      phone: phoneOrEmail.trim(),
      password: password,
    };

    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Login failed");
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${result.name || 'Patient'}!`);
      setTimeout(() => router.push("/portal"), 600);
    } catch (err) {
      toast.error("Something went wrong during login");
      setLoading(false);
    }
  }

  const fillDemo = () => {
    setPhoneOrEmail("9876543210");
    setPassword("Patient@123");
    toast.success("Demo credentials loaded! Click Sign In.");
  };

  const copyDemo = () => {
    navigator.clipboard.writeText("9876543210 | Patient@123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Decorative ambient background gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-medical-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Hero Section: Branding, Healthcare Trust & Value Props */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-6 pr-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold tracking-wide mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Patient Healthcare Experience</span>
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              Your Health Journey, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-teal-500">
                Connected & Effortless.
              </span>
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Access digital prescriptions, book doctor appointments, track real-time queue tokens, and view comprehensive lab diagnostics securely from anywhere.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Direct Doctor Consultations</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track live appointments, time slots, and queue tokens without waiting in line.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Instant Digital Prescriptions</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Download physician notes, dosage guidelines, and check pharmacy dispensation.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Lab Reports & Health Vitals</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Historical blood pressure, pulse, glucose levels, and pathology diagnostics.</p>
              </div>
            </div>
          </div>

          {/* Compliance & Security Assurance */}
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>256-bit Encrypted</span>
            </div>
            <span>•</span>
            <span>ABDM & HIPAA Compliant</span>
            <span>•</span>
            <span>Zero Data Leakage Guarantee</span>
          </div>
        </div>

        {/* Right Section: Modern Glassmorphic Login Card */}
        <div className="w-full lg:col-span-6 max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-7 sm:p-9 shadow-xl border border-slate-200/80 dark:border-slate-800 relative">
            
            {/* Role Switcher Pill Header */}
            <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6 text-xs font-semibold">
              <div className="flex-1 py-1.5 px-3 bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 rounded-lg shadow-xs text-center flex items-center justify-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Patient Portal</span>
              </div>
              <Link 
                href="/login" 
                className="flex-1 py-1.5 px-3 text-slate-600 dark:text-slate-300 hover:text-primary-600 text-center flex items-center justify-center gap-1 transition-colors"
              >
                <span>Doctor / Staff</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Title Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-tr from-primary-600 to-teal-500 text-white rounded-2xl flex items-center justify-center mb-3 shadow-md shadow-primary-500/20">
                <HeartPulse className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Patient Sign In</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                Enter your registered mobile number or email to access your health portal
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>

                {isStaffEmail && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span>Staff account detected?</span>
                    <Link href={`/login`} className="font-semibold underline hover:text-amber-900">
                      Go to Staff Login →
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-md shadow-primary-500/20 transition-all duration-200 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Portal"}
              </Button>
            </form>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
              New patient?{" "}
              <Link href="/portal/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Register here
              </Link>
            </p>

            {/* Quick Demo Credentials Card */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Demo Patient Access
                </span>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  ⚡ Auto-fill credentials
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    <span className="text-slate-400 mr-1.5">Phone:</span>
                    <span className="font-mono font-semibold">9876543210</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="text-slate-400 mr-1.5">Pass:</span>
                    <span className="font-mono">Patient@123</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyDemo}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 font-medium"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
