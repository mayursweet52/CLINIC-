import { ReactNode } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumb?: Array<{ label: string; href?: string }>
  breadcrumbs?: Array<{ label: string; href?: string }> // for backwards compat
  actions?: ReactNode
  action?: ReactNode // for backwards compat
}

export function PageHeader({ 
  title, 
  description, 
  breadcrumb, 
  breadcrumbs, 
  actions, 
  action 
}: PageHeaderProps) {
  const activeBreadcrumbs = breadcrumb || breadcrumbs
  const activeActions = actions || action

  return (
    <div className="flex flex-col gap-4 mb-6">
      {activeBreadcrumbs && activeBreadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-on-surface-variant">
          {activeBreadcrumbs.map((crumb, i) => {
            const isLast = i === activeBreadcrumbs.length - 1
            return (
              <div key={i} className="flex items-center gap-1.5">
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="hover:text-on-surface transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-on-surface">{crumb.label}</span>
                )}
                {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
              </div>
            )
          })}
        </nav>
      )}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-on-surface">{title}</h1>
          {description && <p className="text-sm text-on-surface-variant mt-1">{description}</p>}
        </div>
        {activeActions && <div className="flex gap-2 shrink-0">{activeActions}</div>}
      </div>
    </div>
  )
}
