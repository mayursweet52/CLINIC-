import { Doctor } from "../types"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2 } from "lucide-react"

interface DoctorCardProps {
  doctor: Doctor
  selected?: boolean
  onSelect: (id: string) => void
}

export function DoctorCard({ doctor, selected, onSelect }: DoctorCardProps) {
  return (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden flex items-center gap-4 ${
        selected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-slate-200'
      }`}
      onClick={() => onSelect(doctor.id)}
    >
      {selected && (
        <div className="absolute top-2 right-2 text-primary">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      )}
      <Avatar className="w-16 h-16 border border-slate-100">
        <AvatarImage src={doctor.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
          {doctor.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <h4 className="font-semibold text-slate-900">{doctor.name}</h4>
        <span className="text-sm text-slate-500">{doctor.specialty}</span>
        <span className="text-sm font-medium text-slate-900 mt-1">₹{doctor.consultationFee}</span>
      </div>
    </Card>
  )
}
