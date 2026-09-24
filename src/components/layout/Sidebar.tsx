"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  UserRound,
  Package,
  LineChart,
  ClipboardList,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const NAV_GROUPS = [
  {
    label: "MAIN",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "MANAGE",
    items: [
      { href: "/patients", label: "Patients", icon: UserRound },
      { href: "/staff", label: "Staff", icon: Users },
      { href: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck },
      { href: "/inventory", label: "Inventory", icon: Package },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { href: "/analytics", label: "Analytics", icon: LineChart },
      { href: "/audit", label: "Audit", icon: ClipboardList },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Clinic Settings", icon: Settings },
    ],
  },
]

export function Sidebar({ isMobile }: { isMobile?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (isMobile) return;
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved) {
      setCollapsed(JSON.parse(saved))
    }
  }, [isMobile])

  const toggleCollapse = () => {
    if (isMobile) return;
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(next))
  }

  const isCollapsed = isMobile ? false : collapsed;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-white dark:bg-slate-950 transition-all duration-300 dark:bg-slate-950",
        isCollapsed ? "w-16" : "w-[260px]",
        isMobile && "w-full"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="truncate font-semibold tracking-tight">Clinic Enterprise</span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 shrink-0", isCollapsed && "absolute -right-4 top-4 z-10 rounded-full border bg-background")}
          onClick={toggleCollapse}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="px-3">
              {!isCollapsed && (
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800",
                        isActive
                          ? "border-l-2 border-primary-600 bg-primary-50 text-primary-700 hover:bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400"
                          : "text-slate-700 dark:text-slate-300 dark:text-slate-300",
                        isCollapsed && "justify-center border-l-0 px-0"
                      )}
                    >
                      <Icon className={cn("h-[18px] w-[18px]", !isCollapsed && "mr-3")} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t p-3">
        <div
          className={cn(
            "flex items-center rounded-lg p-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium">{user?.name || 'User'}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase() || 'Role'}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
