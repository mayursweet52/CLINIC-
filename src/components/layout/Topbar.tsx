"use client"
import { useState, useEffect } from "react"
import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { CommandPalette } from "./CommandPalette"
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
  const [cmdOpen, setCmdOpen] = useState(false)
  const { logout } = useAuth()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCmdOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white dark:bg-slate-950/75 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 md:px-8">
        <Button
          variant="outline"
          className="relative h-9 w-full max-w-md justify-start rounded-[0.5rem] bg-slate-50 dark:bg-slate-900 dark:bg-slate-900 text-sm text-muted-foreground shadow-none sm:pr-12 md:w-80 lg:w-96"
          onClick={() => setCmdOpen(true)}
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          <span className="inline-flex">Search patients, actions...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between">
              Notifications
              <Button variant="link" className="h-auto p-0 text-xs font-normal">Mark all read</Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-2 h-6 w-px bg-border"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full">
              <span className="sr-only">Open user menu</span>
              <UserAvatar />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function UserAvatar() {
  const { user } = useAuth()
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100">
      {user?.name?.slice(0, 2).toUpperCase() || "U"}
    </div>
  )
}
