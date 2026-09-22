import { Department } from "../types"
import { Card } from "@/components/ui/card"
import { Stethoscope, Heart, Brain, Baby, Bone, Eye } from "lucide-react"

interface DepartmentPickerProps {
  departments: Department[]
  selectedId?: string
  onSelect: (id: string) => void
}

const iconMap: Record<string, any> = {
  heart: Heart,
  brain: Brain,
  baby: Baby,
  stethoscope: Stethoscope,
  bone: Bone,
  eye: Eye,
}

export function DepartmentPicker({ departments, selectedId, onSelect }: DepartmentPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {departments.map((dept) => {
        const Icon = (dept.icon && iconMap[dept.icon]) ? iconMap[dept.icon] : Stethoscope
        const isSelected = selectedId === dept.id

        return (
          <Card 
            key={dept.id}
            className={`p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md flex flex-col items-center justify-center text-center h-32 gap-3 ${
              isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800'
            }`}
            onClick={() => onSelect(dept.id)}
          >
            <div className={`p-3 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{dept.name}</span>
          </Card>
        )
      })}
    </div>
  )
}
