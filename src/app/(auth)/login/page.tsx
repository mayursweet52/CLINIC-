"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/features/auth/hooks";
import { Loader2, HeartPulse, Mail, Lock, Eye, EyeOff, Copy, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
      const role = (res as any).role?.toUpperCase() || (res as any).user?.role?.toUpperCase() || '';
      if (role === 'DOCTOR') router.push('/doctor');
      else if (role === 'RECEPTIONIST') router.push('/reception');
      else if (role === 'PHARMACIST') router.push('/pharmacy');
      else router.push('/admin');
    } catch (err) {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  const copyCreds = (email: string, role: string) => {
    navigator.clipboard.writeText(`${email}\nAarogya@2024`);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const demoAccounts = [
    { role: "Doctor", email: "ananya.sharma@aarogyaclinic.in" },
    { role: "Reception", email: "kavita.nair@aarogyaclinic.in" },
    { role: "Pharmacist", email: "suresh.patel@aarogyaclinic.in" },
    { role: "Admin", email: "vikram.singh@aarogyaclinic.in" }
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

          <p className="text-center text-xs text-on-surface-variant mt-4">
            Are you a patient?{" "}
            <a href="/portal/login" className="text-primary-600 font-semibold hover:underline">
              Go to Patient Portal →
            </a>
          </p>

          {/* Demo Credentials Box */}
          <div className="mt-8 bg-surface-low rounded-xl p-4 border border-outline-variant/20">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Demo Credentials</h3>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <div key={acc.role} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg hover:bg-surface-lowest transition-colors">
                  <div className="text-sm">
                    <span className="font-medium text-on-surface mr-2">{acc.role}:</span>
                    <span className="text-on-surface-variant break-all">{acc.email}</span>
                  </div>
                  <button 
                    onClick={() => copyCreds(acc.email, acc.role)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0"
                  >
                    {copiedRole === acc.role ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 text-medical-green" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
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
