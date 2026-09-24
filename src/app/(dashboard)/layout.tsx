"use client"
import { ReactNode } from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/features/auth/useAuth"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Close mobile menu on navigate
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar />
      
      {/* Mobile Sidebar via Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-surface-low border-r-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content Area: Offset by sidebar width on desktop */}
      <div className="md:pl-72">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        
        {/* Main Content: padding top to clear 80px Topbar */}
        <main className="pt-20 px-4 md:px-8 py-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
