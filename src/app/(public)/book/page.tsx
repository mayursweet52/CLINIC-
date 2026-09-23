"use client"

import { useState } from "react"
import { format, addDays } from "date-fns"
import { useDepartments, useDoctors, useSlots, useBookAppointment } from "@/features/booking/hooks"
import { StepProgress } from "@/features/booking/components/StepProgress"
import { DepartmentPicker } from "@/features/booking/components/DepartmentPicker"
import { DoctorCard } from "@/features/booking/components/DoctorCard"
import { SlotGrid } from "@/features/booking/components/SlotGrid"
import { PatientForm } from "@/features/booking/components/PatientForm"
import { SuccessScreen } from "@/features/booking/components/SuccessScreen"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

const STEPS = ["Department", "Doctor", "Time", "Details"]

export default function BookPage() {
  const [step, setStep] = useState(1)
  
  // Selections
  const [departmentId, setDepartmentId] = useState<string>("")
  const [doctorId, setDoctorId] = useState<string>("")
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [timeSlot, setTimeSlot] = useState<string>("")

  // Queries
  const { data: departments, isLoading: isLoadingDepts } = useDepartments()
  const { data: doctors, isLoading: isLoadingDoctors } = useDoctors(departmentId)
  const { data: slots, isLoading: isLoadingSlots } = useSlots(doctorId, date)
  const bookMutation = useBookAppointment()

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i))

  const handleNext = () => setStep(s => Math.min(STEPS.length, s + 1))
  const handleBack = () => setStep(s => Math.max(1, s - 1))

  const handleDepartmentSelect = (id: string) => {
    setDepartmentId(id)
    setDoctorId("")
    setTimeSlot("")
    handleNext()
  }

  const handleDoctorSelect = (id: string) => {
    setDoctorId(id)
    setTimeSlot("")
    handleNext()
  }

  const handleSlotSelect = (time: string) => {
    setTimeSlot(time)
    handleNext()
  }

  const onSubmit = async (data: any) => {
    await bookMutation.mutateAsync(data)
    setStep(5) // Success step
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
      {step < 5 && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Book Appointment</h1>
          <p className="text-slate-500 dark:text-slate-400">Schedule your visit in just a few clicks</p>
        </div>
      )}

      {step < 5 && <StepProgress currentStep={step} steps={STEPS} />}

      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mt-12 sm:mt-8 relative z-10">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl font-semibold mb-1">Select Department</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose the specialty you need</p>
            </div>
            {isLoadingDepts ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <DepartmentPicker 
                departments={departments || []} 
                selectedId={departmentId} 
                onSelect={handleDepartmentSelect} 
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0 -ml-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold mb-1">Select Doctor</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose from available specialists</p>
              </div>
            </div>
            {isLoadingDoctors ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : doctors?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {doctors.map(doc => (
                  <DoctorCard 
                    key={doc.id} 
                    doctor={doc} 
                    selected={doctorId === doc.id} 
                    onSelect={handleDoctorSelect} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-lg">
                No doctors available for this department.
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0 -ml-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold mb-1">Select Time</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose a convenient date and time</p>
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {dates.map((d) => {
                const isSelected = date === format(d, 'yyyy-MM-dd')
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { setDate(format(d, 'yyyy-MM-dd')); setTimeSlot("") }}
                    className={`flex flex-col items-center p-3 rounded-xl min-w-[80px] snap-start transition-all border ${
                      isSelected ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase mb-1 opacity-80">{format(d, 'EEE')}</span>
                    <span className="text-lg font-bold">{format(d, 'dd')}</span>
                    <span className="text-xs opacity-80">{format(d, 'MMM')}</span>
                  </button>
                )
              })}
            </div>

            <div className="pt-2">
              {isLoadingSlots ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <SlotGrid 
                  slots={slots || []} 
                  selectedTime={timeSlot} 
                  onSelect={handleSlotSelect} 
                />
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl font-semibold mb-1">Patient Details</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Please provide your contact information</p>
            </div>
            <PatientForm 
              initialData={{ departmentId, doctorId, date, timeSlot }}
              onSubmit={onSubmit}
              isSubmitting={bookMutation.isPending}
              onBack={handleBack}
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <SuccessScreen data={bookMutation.data!} />
            
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Clinic Queue
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm p-3 bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Token #998</span>
                    <span className="text-xs text-slate-500">In Consultation</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-medium">Dr. Sharma</span>
                    <span className="text-xs text-emerald-600 font-medium">Cardiology</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 opacity-70">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Token #999</span>
                    <span className="text-xs text-slate-500">Next in line</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-medium">Dr. Verma</span>
                    <span className="text-xs text-blue-600 font-medium">Pediatrics</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 opacity-50">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Token {bookMutation.data?.tokenNumber}</span>
                    <span className="text-xs text-slate-500">Scheduled</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-medium">Your slot</span>
                    <span className="text-xs text-slate-500 font-medium">{timeSlot}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
