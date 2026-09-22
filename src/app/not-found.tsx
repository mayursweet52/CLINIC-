import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h2 className="mb-2 text-4xl font-bold tracking-tight">404</h2>
      <p className="mb-6 text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}
