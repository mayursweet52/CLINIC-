import { Card } from "@/components/ui/card"
import { Calendar, Clock, User2 } from "lucide-react"
import { PatientDashboard } from "../types"

interface AppointmentCardProps {
  appointment: NonNullable<PatientDashboard['upcomingAppointment']>
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <Card className="p-4 bg-primary text-white shadow-md shadow-primary/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
          <span className="text-primary-100 text-sm">{appointment.specialty}</span>
        </div>
        <div className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
          {appointment.status}
        </div>
      </div>
      <div className="flex gap-4 text-sm text-primary-50">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {appointment.date}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {appointment.time}
        </div>
      </div>
    </Card>
  )
}
