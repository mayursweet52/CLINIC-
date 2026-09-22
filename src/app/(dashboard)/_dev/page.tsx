"use client"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { StatCard } from "@/components/shared/StatCard"
import { KpiGrid } from "@/components/shared/KpiGrid"
import { EmptyState } from "@/components/shared/EmptyState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { TableSkeleton } from "@/components/shared/TableSkeleton"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { Users, SearchX, CheckCircle, Download } from "lucide-react"
import { useState } from "react"

const MOCK_DATA = [
  { id: 1, name: "John Doe", status: "confirmed", amount: 1500 },
  { id: 2, name: "Jane Smith", status: "pending", amount: 2000 },
]

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { 
    accessorKey: "status", 
    header: "Status",
    cell: ({ row }: any) => <StatusBadge status={row.original.status} />
  },
  { 
    accessorKey: "amount", 
    header: "Amount",
    cell: ({ row }: any) => `₹${row.original.amount}`
  },
]

export default function DevPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-12 pb-12">
      <PageHeader 
        title="Development Sandbox" 
        description="Verifying all shared enterprise components"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Dev" }]}
        action={<Button><CheckCircle className="mr-2 h-4 w-4" /> Save</Button>}
      />

      <section>
        <SectionHeader title="KPI Grid & Stat Cards" description="Displaying 4 columns KPI grid" />
        <KpiGrid 
          items={[
            { label: "Total Patients", value: "1,248", icon: Users, trend: { value: "12%", isUp: true } },
            { label: "Revenue", value: "₹45,200", icon: Users, iconVariant: "success", trend: { value: "5%", isUp: true } },
            { label: "Cancellations", value: "12", icon: Users, iconVariant: "danger", trend: { value: "2%", isUp: false } },
            { label: "Active Staff", value: "24", icon: Users, iconVariant: "info" },
          ]}
        />
      </section>

      <section>
        <SectionHeader title="Status Badges" />
        <div className="flex flex-wrap gap-4">
          {['scheduled', 'confirmed', 'arrived', 'in-progress', 'completed', 'cancelled', 'no-show', 'pending', 'paid', 'partial', 'refunded'].map(status => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader 
          title="Data Table" 
          description="TanStack table implementation"
          action={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>}
        />
        <DataTable columns={columns} data={MOCK_DATA} />
      </section>

      <section>
        <SectionHeader title="Table Skeleton" />
        <TableSkeleton rows={3} cols={4} />
      </section>

      <section>
        <SectionHeader title="Empty States" />
        <div className="grid gap-6 md:grid-cols-2">
          <EmptyState 
            icon={SearchX} 
            title="No patients found" 
            description="Try adjusting your search filters to find what you're looking for." 
            action={<Button variant="outline">Clear Filters</Button>}
          />
          <EmptyState 
            variant="error"
            icon={CheckCircle} 
            title="Failed to load data" 
            description="There was a problem communicating with the server." 
            action={<Button variant="outline">Retry</Button>}
          />
        </div>
      </section>

      <section>
        <SectionHeader title="Dialogs" />
        <Button onClick={() => setDialogOpen(true)}>Open Confirm Dialog</Button>
        <ConfirmDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Delete Patient?"
          description="This action cannot be undone. This will permanently delete the patient record."
          variant="danger"
          confirmText="Delete"
          onConfirm={() => {
            setDialogOpen(false)
          }}
        />
      </section>
    </div>
  )
}
