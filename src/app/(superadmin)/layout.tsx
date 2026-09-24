import { ReactNode } from "react";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HeartPulse, LayoutDashboard, Building2, Bell, LogOut, User as UserIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/portal/login");
  }

  let user;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    if (payload.role !== "SUPERADMIN") {
      redirect("/portal/login"); // or /login if preferred, but existing app uses portal/login
    }
    user = payload;
  } catch {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Nav */}
      <header className="h-16 bg-surface-lowest/95 backdrop-blur border-b border-outline-variant sticky top-0 z-40">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Logo & Badge */}
          <div className="flex items-center gap-4">
            <Link href="/superadmin" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-on-primary" />
              </div>
              <span className="text-lg font-bold text-on-surface hidden sm:block">ClinicOS</span>
            </Link>
            <span className="px-2 py-0.5 rounded-md bg-tertiary-container text-on-tertiary-container text-xs font-medium">
              Platform Admin
            </span>
          </div>

          {/* Center: Links (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/superadmin" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/superadmin/clinics" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Clinics
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-on-surface-variant">
              <Bell className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-surface-variant text-on-surface-variant">
                  <UserIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{String(user.name || "Super Admin")}</p>
                    <p className="text-xs leading-none text-muted-foreground">{String(user.email)}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="w-full text-left">
                    <DropdownMenuItem className="text-error cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
