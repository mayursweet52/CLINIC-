import React from "react";
import Link from "next/link";
import { Users, FileText, IndianRupee, BarChart2, Bell, Shield, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  { title: "Staff Management", href: "/admin/staff", icon: Users, color: "text-blue-500" },
  { title: "Patient Records", href: "/patients", icon: FileText, color: "text-emerald-500" },
  { title: "Billing", href: "/billing", icon: IndianRupee, color: "text-amber-500" },
  { title: "Reports", href: "/admin/reports", icon: BarChart2, color: "text-purple-500" },
  { title: "Notifications", href: "/admin/notifications", icon: Bell, color: "text-pink-500" },
  { title: "Audit Log", href: "/admin/audit", icon: Shield, color: "text-slate-500 dark:text-slate-400" },
  { title: "Settings", href: "/admin/settings", icon: Settings, color: "text-gray-500" },
];

export const QuickLinksGrid = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {quickLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          <Card className="p-5 rounded-xl border hover:shadow-md cursor-pointer transition-shadow h-full">
            <CardContent className="p-0 flex items-center space-x-4">
              <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-900 ${link.color}`}>
                <link.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">{link.title}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
