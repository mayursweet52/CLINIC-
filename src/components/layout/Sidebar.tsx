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
  Settings,
  HeartPulse,
  Building2,
} from "lucide-react"
import { useAuth } from "@/features/auth/useAuth"

const NAV_GROUPS = [
  {
    label: "MAIN",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["DOCTOR", "RECEPTIONIST", "PHARMACIST", "ADMIN"] },
    ],
  },
  {
    label: "MANAGE",
    items: [
      { href: "/patients", label: "Patient Queue", icon: UserRound, roles: ["DOCTOR", "RECEPTIONIST", "ADMIN"] },
      { href: "/appointments", label: "Appointments", icon: ClipboardList, roles: ["DOCTOR", "RECEPTIONIST", "ADMIN"] },
      { href: "/records", label: "Medical Records", icon: LineChart, roles: ["DOCTOR", "RECEPTIONIST", "ADMIN"] },
      { href: "/pharmacy", label: "Pharmacy", icon: Package, roles: ["PHARMACIST", "ADMIN"] },
      { href: "/admin", label: "Administration", icon: Settings, roles: ["ADMIN"] },
      { href: "/admin/departments", label: "Departments", icon: Building2, roles: ["ADMIN"] },
    ],
  },
]

export function Sidebar({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname()
  const { user } = useAuth()
  
  const initials = user?.name?.slice(0, 2).toUpperCase() || "U"
  const roleDisplay = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "Role"

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-surface-low z-50 transition-all duration-300",
        isMobile ? "w-full" : "fixed left-0 top-0 w-72 pt-8 pb-6 hidden md:flex"
      )}
    >
      <div className={cn("px-6 mb-6 flex items-center gap-2", isMobile && "pt-6")}>
        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm">
          <HeartPulse className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="block font-semibold text-on-surface">ClinicOS</span>
          <span className="block text-xs text-on-surface-variant">Multi-Tenant SaaS</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_GROUPS.map((group) => {
          // Filter items based on user role (basic implementation based on provided logic)
          const visibleItems = group.items.filter(item => 
            !user?.role || item.roles.includes(user.role.toUpperCase())
          )
          
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-6">
              <p className="text-xs uppercase tracking-wider text-on-surface-variant px-2 mb-2">
                {group.label}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  // For the sake of the redesign, treat /doctor as active for dashboard if we are on /doctor
                  const isActive = pathname === item.href || (item.href === "/" && pathname.startsWith("/doctor"))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary-500 text-white font-semibold shadow-sm"
                          : "text-on-surface-variant hover:bg-surface-high hover:text-on-surface"
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="px-6 pt-4 border-t border-outline-variant/20 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-on-surface">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {roleDisplay}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
