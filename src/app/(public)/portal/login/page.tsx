"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, HeartPulse, Eye, EyeOff, Copy, CheckCircle2 } from "lucide-react";

export default function PatientLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      phone: formData.get("phone"),
      password: formData.get("password"),
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

      toast.success(`Welcome, ${result.name}!`);
      setTimeout(() => router.push("/portal"), 800);
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  const copyDemo = () => {
    navigator.clipboard.writeText("Patient@123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 selection:bg-primary-100 selection:text-primary-900 transition-colors">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="bg-surface-lowest rounded-2xl p-8 shadow-md border border-outline-variant/20">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-on-surface text-center tracking-tight mb-2">Patient Portal</h1>
            <p className="text-sm text-on-surface-variant text-center">Access your medical records, appointments, and prescriptions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-outline-variant/30 bg-surface-low text-on-surface-variant text-sm font-medium">
                  +91
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  required
                  className="w-full pl-3 pr-4 py-2.5 rounded-r-lg bg-surface-low border border-outline-variant/30 text-on-surface focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-surface-low border border-outline-variant/30 text-on-surface focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end text-sm py-2">
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">Forgot password?</a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            New patient?{" "}
            <Link href="/portal/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Register here
            </Link>
          </p>

          {/* Demo Credentials Box */}
          <div className="mt-8 bg-surface-low rounded-xl p-4 border border-outline-variant/20">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Demo Account</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg hover:bg-surface-lowest transition-colors text-sm">
              <div>
                <span className="font-medium text-on-surface mr-2">Phone:</span>
                <span className="text-on-surface-variant">9876543210</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-on-surface">Password:</span>
                <span className="text-on-surface-variant font-mono">Patient@123</span>
              </div>
              <button 
                onClick={copyDemo}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0"
              >
                {copied ? (
                  <><CheckCircle2 className="w-3.5 h-3.5 text-medical-green" /> Copied!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
