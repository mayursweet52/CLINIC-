"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/features/auth/hooks";
import { Loader2, HeartPulse, Mail, Lock, Eye, EyeOff, Copy, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"; // Assuming sonner is used, or fallback

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await login.mutateAsync(data);
      const role = (res as any).role?.toUpperCase() || '';
      if (role === 'DOCTOR') router.push('/doctor');
      else if (role === 'RECEPTIONIST') router.push('/reception');
      else if (role === 'PHARMACIST') router.push('/pharmacy');
      else router.push('/admin');
    } catch (err) {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  const quickLogin = async (email: string) => {
    try {
      const res = await login.mutateAsync({ email, password: "Aarogya@2024" });
      const role = (res as any).role?.toUpperCase() || '';
      if (role === 'DOCTOR') router.push('/doctor');
      else if (role === 'RECEPTIONIST') router.push('/reception');
      else if (role === 'PHARMACIST') router.push('/pharmacy');
      else router.push('/admin');
    } catch {
      toast.error("Login failed. Please try again.");
    }
  };

  const copyCreds = (email: string, role: string) => {
    navigator.clipboard.writeText(`${email}\nAarogya@2024`);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const demoAccounts = [
    { role: "Doctor", email: "ananya.sharma@aarogyaclinic.in", badge: "🩺 Doctor" },
    { role: "Reception", email: "kavita.nair@aarogyaclinic.in", badge: "📋 Reception" },
    { role: "Pharmacist", email: "suresh.patel@aarogyaclinic.in", badge: "💊 Pharmacy" },
    { role: "Admin", email: "vikram.singh@aarogyaclinic.in", badge: "⚙️ Admin" }
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 selection:bg-primary-100 selection:text-primary-900 transition-colors">
      <div className="max-w-md w-full animate-in zoom-in-95 duration-500">
        
        {/* Card Structure */}
        <div className="bg-surface-lowest rounded-2xl shadow-md p-8 border border-outline-variant/20">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-on-surface text-center tracking-tight mb-2">Staff Login</h1>
            <p className="text-sm text-on-surface-variant text-center">Sign in to access your clinic dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email or Staff ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-low border ${errors.email ? 'border-error focus:ring-error' : 'border-outline-variant/30 focus:border-primary-500 focus:ring-primary-500'} text-on-surface focus:bg-surface-lowest focus:ring-2 focus:outline-none transition-all text-sm`}
                  placeholder="name@aarogyaclinic.in"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface-low border ${errors.password ? 'border-error focus:ring-error' : 'border-outline-variant/30 focus:border-primary-500 focus:ring-primary-500'} text-on-surface focus:bg-surface-lowest focus:ring-2 focus:outline-none transition-all text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-primary-500 focus:ring-primary-500 bg-surface-low border-outline-variant/30" />
                <span className="text-on-surface-variant">Remember me</span>
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full h-11 flex items-center justify-center rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in to Dashboard"}
            </button>
          </form>

          {/* Demo Credentials Box with 1-Click Login */}
          <div className="mt-8 bg-surface-low rounded-xl p-4 border border-outline-variant/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Demo Accounts (1-Click Instant Login)</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-medical-green/10 text-medical-green font-medium">⚡ Instant</span>
            </div>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <div key={acc.role} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-surface-lowest/60 hover:bg-surface-lowest border border-outline-variant/10 transition-colors">
                  <div className="text-sm">
                    <span className="font-semibold text-on-surface mr-2">{acc.badge}</span>
                    <span className="text-xs text-on-surface-variant block sm:inline">{acc.email}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      type="button"
                      onClick={() => copyCreds(acc.email, acc.role)}
                      className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface px-2 py-1 rounded transition-colors"
                      title="Copy credentials"
                    >
                      {copiedRole === acc.role ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-medical-green" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy</>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={login.isPending}
                      onClick={() => quickLogin(acc.email)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-xs disabled:opacity-50"
                    >
                      Login ⚡
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 text-xs text-center text-on-surface-variant">
              Password for all accounts: <strong className="font-mono bg-surface-highest px-1.5 py-0.5 rounded text-on-surface">Aarogya@2024</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
