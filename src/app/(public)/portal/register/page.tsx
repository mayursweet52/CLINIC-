"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, HeartPulse, User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function PatientRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (password !== confirm) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      password,
    };

    try {
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success(`Registered! Your ID: ${result.patientCode}`);
      setTimeout(() => router.push("/portal/login"), 1500);
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 selection:bg-primary-100 selection:text-primary-900 transition-colors">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-500 py-12">
        <div className="bg-surface-lowest rounded-2xl p-8 shadow-md border border-outline-variant/20">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-on-surface text-center tracking-tight mb-2">Create Patient Account</h1>
            <p className="text-sm text-on-surface-variant text-center">Register to access your medical records</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  minLength={2}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-low border border-outline-variant/30 text-on-surface focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-outline-variant/30 bg-surface-low text-on-surface-variant text-sm font-medium">
                  +91
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  required
                  minLength={10}
                  className="w-full pl-3 pr-4 py-2.5 rounded-r-lg bg-surface-low border border-outline-variant/30 text-on-surface focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-low border border-outline-variant/30 text-on-surface focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface-low border border-outline-variant/30 text-on-surface focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all text-sm"
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

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface-low border border-outline-variant/30 text-on-surface focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg shadow-sm transition-colors mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already registered?{" "}
            <Link href="/portal/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
