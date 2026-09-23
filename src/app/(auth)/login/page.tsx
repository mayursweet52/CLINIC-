"use client"
import { useRouter } from "next/navigation"
import { useLogin } from "@/features/auth/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Stethoscope, UserCog, Pill, Users } from "lucide-react"

const DEMO_ACCOUNTS = [
  {
    role: "Doctor",
    email: "ananya.sharma@aarogyaclinic.in",
    icon: Stethoscope,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
  },
  {
    role: "Receptionist",
    email: "kavita.nair@aarogyaclinic.in",
    icon: Users,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
  },
  {
    role: "Pharmacist",
    email: "suresh.patel@aarogyaclinic.in",
    icon: Pill,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
  },
  {
    role: "Admin",
    email: "vikram.singh@aarogyaclinic.in",
    icon: UserCog,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
  }
]

export default function LoginPage() {
  const router = useRouter()
  const login = useLogin()

  const handleFastLogin = async (email: string) => {
    try {
      const res = await login.mutateAsync({ email, password: "demo-password" })
      const role = (res as any).role?.toUpperCase() || ''
      if (role === 'DOCTOR') router.push('/doctor')
      else if (role === 'RECEPTIONIST') router.push('/reception')
      else if (role === 'PHARMACIST') router.push('/pharmacy')
      else router.push('/admin')
    } catch (err) {}
  }

  return (
    <Card className="w-full shadow-xl border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">Demo Access</CardTitle>
        <CardDescription>Click a role card below to instantly log in.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 relative">
        {login.isPending && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            return (
              <button
                key={account.role}
                onClick={() => handleFastLogin(account.email)}
                className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md hover:border-primary/50 transition-all active:scale-95 group relative overflow-hidden"
              >
                <div className={`p-4 rounded-full mb-3 transition-transform group-hover:scale-110 ${account.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{account.role}</h3>
                <p className="text-xs text-slate-500 mt-1">One-click login</p>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
