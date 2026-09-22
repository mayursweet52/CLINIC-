import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./EmptyState"

export interface ErrorStateProps {
  error: Error
  reset?: () => void
}

export function ErrorState({ error, reset }: ErrorStateProps) {
  return (
    <EmptyState
      variant="error"
      icon={AlertTriangle}
      title="Something went wrong"
      description={error.message || "An unexpected error occurred while loading this content."}
      action={
        reset && (
          <Button variant="outline" onClick={reset}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )
      }
    />
  )
}
