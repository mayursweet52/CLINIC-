import { Card } from "@/components/ui/card"
import { Receipt, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientDashboard } from "../types"

interface BillCardProps {
  bill: PatientDashboard['pendingBills'][0]
}

export function BillCard({ bill }: BillCardProps) {
  return (
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">₹{bill.amount}</h4>
          <span className="text-sm text-slate-500">Due {bill.date}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <Download className="w-4 h-4 text-slate-600" />
        </Button>
        <Button size="sm" className="h-8 text-xs px-3">
          Pay Now
        </Button>
      </div>
    </Card>
  )
}
