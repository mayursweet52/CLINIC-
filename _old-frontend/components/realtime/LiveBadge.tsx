import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  isConnected: boolean;
  className?: string;
}

export function LiveBadge({ isConnected, className }: LiveBadgeProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        isConnected 
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400" 
          : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span 
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            isConnected ? "bg-emerald-500" : "bg-zinc-400"
          )}
        ></span>
      </span>
      {isConnected ? "Live" : "Reconnecting..."}
    </div>
  );
}
