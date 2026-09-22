import { TimeSlot } from "../types"
import { cn } from "@/lib/utils"

interface SlotGridProps {
  slots: TimeSlot[]
  selectedTime?: string
  onSelect: (time: string) => void
}

export function SlotGrid({ slots, selectedTime, onSelect }: SlotGridProps) {
  if (!slots.length) {
    return <div className="text-center text-slate-500 dark:text-slate-400 py-8">No slots available for this date.</div>
  }

  return (
    <div>
      <div className="flex gap-4 mb-4 text-xs font-medium justify-end px-2">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800" /> Available</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800" /> Booked</div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time
          return (
            <button
              key={slot.time}
              disabled={!slot.available}
              onClick={() => slot.available && onSelect(slot.time)}
              className={cn(
                "py-2 rounded-md border text-sm font-medium transition-all text-center",
                !slot.available ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed" :
                isSelected ? "bg-primary border-primary text-white shadow-sm" :
                "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-primary text-slate-700 dark:text-slate-300 hover:text-primary"
              )}
            >
              {slot.time}
            </button>
          )
        })}
      </div>
    </div>
  )
}
