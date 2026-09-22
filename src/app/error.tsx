"use client"
import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { ErrorState } from "@/components/shared/ErrorState"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ErrorState error={error} reset={reset} />
    </div>
  )
}
