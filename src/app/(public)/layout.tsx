import { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Stethoscope } from "lucide-react"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900 dark:bg-slate-900">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/75 px-4 backdrop-blur-md dark:bg-slate-950/75 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">Clinic Enterprise</span>
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button asChild variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
