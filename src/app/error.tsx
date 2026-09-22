"use client"
import { useEffect } from "react"
import { ErrorState } from "@/components/shared/ErrorState"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ErrorState error={error} reset={reset} />
    </div>
  )
}
