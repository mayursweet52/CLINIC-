import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import { FloatingDemoWidget } from "@/components/FloatingDemoWidget"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: {
    template: "%s | Clinic Enterprise",
    default: "Clinic Enterprise",
  },
  description: "Enterprise Clinic Management System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 antialiased dark:bg-slate-950 dark:text-slate-50`}>
        <Providers>
          {children}
          <FloatingDemoWidget />
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
