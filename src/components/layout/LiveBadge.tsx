"use client"
import { useRealtime } from "./RealtimeProvider"
import { cn } from "@/lib/utils"

export function LiveBadge() {
  const { isConnected } = useRealtime()

  return (
    <div className="flex items-center space-x-2 rounded-full border bg-background px-3 py-1 text-xs font-medium shadow-sm">
      <span className="relative flex h-2 w-2">
        {isConnected ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
          </>
        ) : (
          <span className="relative inline-flex h-2 w-2 rounded-full bg-muted-foreground"></span>
        )}
      </span>
      <span className={isConnected ? "text-foreground" : "text-muted-foreground"}>
        {isConnected ? "Live" : "Offline"}
      </span>
    </div>
  )
}
