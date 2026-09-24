"use client"
import { useState } from "react"
import { Bell, Menu, Search, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/useAuth"

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth()
  
  const initials = user?.name?.slice(0, 2).toUpperCase() || "U"

  return (
    <header className="fixed top-0 left-0 md:left-72 right-0 h-20 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 md:px-8">
      
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center w-full max-w-md gap-2 md:gap-0">
        <Button variant="ghost" size="icon" className="md:hidden shrink-0 text-on-surface" onClick={onMenuClick} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search patients, staff, records..."
            className="w-full pl-10 pr-4 py-2 bg-surface-low rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        
        {/* System Status Pill - hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-low">
          <span className="w-2.5 h-2.5 rounded-full bg-medical-green animate-pulse" />
          <span className="text-xs font-medium text-on-surface">
            System Online
          </span>
        </div>

        {/* Theme Toggle Wrapper (re-using existing logic via wrapper, or just keeping the existing ThemeToggle button if it handles icon inside. We wrap it to ensure it fits the design if possible, or just render it directly. The prompt says "Keep existing theme toggle logic", so I'll include the ThemeToggle directly if it handles the design, but let's restyle it if it's a child. Since we can't easily change the child without editing it, let's just use it.) */}
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>

        {/* Notifications Bell */}
        <Button variant="ghost" size="icon" className="relative w-10 h-10 rounded-lg bg-surface-low hover:bg-surface-high text-on-surface">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-error"></span>
        </Button>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-8 h-8 ml-2 rounded-full bg-primary-500 text-white flex items-center justify-center cursor-pointer font-semibold text-sm">
              {initials}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-surface-lowest border-outline-variant/30">
            <DropdownMenuLabel className="text-on-surface">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-outline-variant/30" />
            <DropdownMenuItem className="text-on-surface focus:bg-surface-low">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-on-surface focus:bg-surface-low">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-outline-variant/30" />
            <DropdownMenuItem onClick={() => logout()} className="text-error focus:bg-error-container focus:text-error cursor-pointer">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}
