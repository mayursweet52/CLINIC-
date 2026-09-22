import { Card } from "@/components/ui/card"
import { Pill, FileText, ChevronRight } from "lucide-react"
import { PatientDashboard } from "../types"

interface PrescriptionCardProps {
  prescription: PatientDashboard['recentPrescriptions'][0]
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  return (
    <Card className="p-4 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">{prescription.doctorName}</h4>
          <div className="text-sm text-slate-500 dark:text-slate-400 flex gap-2">
            <span>{prescription.date}</span>
            <span>•</span>
            <span>{prescription.medicines} medicines</span>
          </div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-400" />
    </Card>
  )
}
