"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  Pill, 
  FileText, 
  Settings, 
  Activity 
} from "lucide-react";
import { usePermissions } from "@/components/providers/PermissionsProvider";

const NAV_CONFIG = {
  doctor: [
    { name: "Dashboard", href: "/doctor", icon: Home, perm: "dashboard:read" },
    { name: "Appointments", href: "/doctor/appointments", icon: Calendar, perm: "appointment:read" },
    { name: "Patients", href: "/doctor/patients", icon: Users, perm: "patient:read" },
  ],
  receptionist: [
    { name: "Front Desk", href: "/reception", icon: Home, perm: "dashboard:read" },
    { name: "Appointments", href: "/reception/appointments", icon: Calendar, perm: "appointment:read" },
    { name: "Billing", href: "/reception/billing", icon: FileText, perm: "bill:read" },
  ],
  pharmacist: [
    { name: "Pharmacy", href: "/pharmacy", icon: Pill, perm: "pharmacy:dispense" },
  ],
  admin: [
    { name: "Overview", href: "/admin", icon: Home, perm: "dashboard:read" },
    { name: "Staff", href: "/admin/staff", icon: Users, perm: "user:manage" },
    { name: "Settings", href: "/admin/settings", icon: Settings, perm: "settings:manage" },
  ],
};

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { can } = usePermissions();
  
  // Fallback to receptionist if role is not recognized
  const allLinks = NAV_CONFIG[role as keyof typeof NAV_CONFIG] || NAV_CONFIG.receptionist;

  // Filter links by RBAC permissions (always show Dashboard/Home if no specific perm matches but it's basic access)
  const links = allLinks.filter(link => {
    if (link.perm === 'dashboard:read') return true; // Everyone gets their home dashboard
    if (can(link.perm)) return true;
    
    // Check wildcard fallbacks just in case
    if (link.perm === 'appointment:read' && can('appointment:read:own')) return true;
    return false;
  });

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold tracking-tight text-primary">ClinicOS</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
