import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepProgressProps {
  currentStep: number
  steps: string[]
}

export function StepProgress({ currentStep, steps }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between w-full relative mb-8">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0">
        <div 
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep

        return (
          <div key={step} className="relative z-10 flex flex-col items-center gap-2">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border-2",
                isCompleted ? "bg-primary border-primary text-white" :
                isCurrent ? "bg-white border-primary text-primary" :
                "bg-white border-slate-200 text-slate-400"
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            <span className={cn(
              "text-xs font-medium hidden sm:block absolute -bottom-6 w-max",
              isCurrent ? "text-primary" : "text-slate-500"
            )}>
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}
