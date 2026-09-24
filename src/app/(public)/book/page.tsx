"use client"

import { useState } from "react"
import { format, addDays } from "date-fns"
import { useDepartments, useDoctors, useSlots, useBookAppointment } from "@/features/booking/hooks"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2, CheckCircle2, CalendarPlus, UserPlus } from "lucide-react"
import { Stethoscope, Heart, Brain, Baby, Bone, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

const STEPS = ["Department", "Doctor", "Time", "Details"]

const iconMap: Record<string, any> = {
  heart: Heart,
  brain: Brain,
  baby: Baby,
  stethoscope: Stethoscope,
  bone: Bone,
  eye: Eye,
}

export default function BookPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  
  // Selections
  const [departmentId, setDepartmentId] = useState<string>("")
  const [doctorId, setDoctorId] = useState<string>("")
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [timeSlot, setTimeSlot] = useState<string>("")

  // Form
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [reason, setReason] = useState("")

  // Queries
  const { data: departments, isLoading: isLoadingDepts } = useDepartments()
  const { data: doctors, isLoading: isLoadingDoctors } = useDoctors(departmentId)
  const { data: slots, isLoading: isLoadingSlots } = useSlots(doctorId, date)
  const bookMutation = useBookAppointment()

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i))

  const handleNext = () => setStep(s => Math.min(STEPS.length + 1, s + 1))
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await bookMutation.mutateAsync({
      departmentId, doctorId, date, timeSlot,
      patientName, patientPhone, reason
    })
    setStep(5)
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-4 selection:bg-primary-100 selection:text-primary-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        {/* STEP PROGRESS INDICATOR */}
        {step < 5 && (
          <div className="mb-12 flex items-center justify-center relative">
            <div className="absolute left-1/2 top-4 -translate-x-1/2 w-3/4 h-0.5 bg-outline-variant/30 -z-10" />
            <div className="flex justify-between w-3/4">
              {STEPS.map((s, idx) => {
                const sIdx = idx + 1
                const isCompleted = step > sIdx
                const isActive = step === sIdx
                return (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isCompleted ? 'bg-medical-green text-white' : isActive ? 'bg-primary-500 text-white' : 'bg-surface-high text-on-surface-variant'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : sIdx}
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-primary-600' : 'text-on-surface-variant'}`}>
                      {s}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 1 - Department */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right-8 duration-500 text-center">
            <h1 className="text-3xl font-semibold text-on-surface mb-2">Choose Department</h1>
            <p className="text-on-surface-variant mb-8">Select the specialization you need</p>
            
            {isLoadingDepts ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                {departments?.map(dept => {
                  const Icon = (dept.icon && iconMap[dept.icon]) ? iconMap[dept.icon] : Stethoscope
                  return (
                    <div 
                      key={dept.id}
                      onClick={() => handleDepartmentSelect(dept.id)}
                      className="bg-surface-lowest rounded-xl p-6 shadow-sm hover:shadow-md cursor-pointer border border-outline-variant/20 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-medium text-on-surface">{dept.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-1">12 Doctors</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 - Doctor */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={handleBack} className="text-on-surface-variant hover:bg-surface-low rounded-full">
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-semibold text-on-surface">Select Doctor</h1>
            </div>

            <div className="mb-6">
              <input type="text" placeholder="Search doctors..." className="w-full bg-surface-lowest border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-on-surface" />
            </div>

            {isLoadingDoctors ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
            ) : doctors?.length ? (
              <div className="flex flex-col gap-3">
                {doctors.map(doc => (
                  <div key={doc.id} className="bg-surface-lowest border border-outline-variant/20 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-primary-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold">
                        {doc.name.replace('Dr. ', '').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-on-surface">{doc.name}</h4>
                        <p className="text-sm text-on-surface-variant">{doc.specialty}</p>
                        <p className="font-semibold text-primary-600 mt-0.5">₹{doc.consultationFee}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleDoctorSelect(doc.id)} className="bg-primary-100 text-primary-700 hover:bg-primary-200">
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-on-surface-variant bg-surface-low rounded-xl border border-outline-variant/20">
                No doctors available for this department.
              </div>
            )}
          </div>
        )}

        {/* STEP 3 - Slot Selection */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={handleBack} className="text-on-surface-variant hover:bg-surface-low rounded-full">
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-semibold text-on-surface">Select Time</h1>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {dates.map((d) => {
                const isSelected = date === format(d, 'yyyy-MM-dd')
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { setDate(format(d, 'yyyy-MM-dd')); setTimeSlot("") }}
                    className={`flex flex-col items-center p-3 rounded-xl min-w-[80px] snap-start transition-all border ${
                      isSelected ? 'bg-primary-500 border-primary-500 text-white shadow-md' : 'bg-surface-lowest border-outline-variant/20 text-on-surface-variant hover:bg-surface-low'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase mb-1">{format(d, 'EEE')}</span>
                    <span className="text-xl font-bold">{format(d, 'dd')}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-4 mb-4 text-xs font-medium text-on-surface-variant">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-surface-highest"></span> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-500"></span> Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error"></span> Booked</span>
              </div>
              
              {isLoadingSlots ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
              ) : slots?.length ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {slots.map((s: any) => {
                    const isSelected = timeSlot === s.time
                    const isBooked = !s.available
                    return (
                      <button
                        key={s.time}
                        disabled={isBooked}
                        onClick={() => handleSlotSelect(s.time)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all ${
                          isSelected ? 'bg-primary-500 text-white shadow-md' : 
                          isBooked ? 'bg-surface-high text-on-surface-variant cursor-not-allowed opacity-50' : 
                          'bg-surface-lowest text-on-surface hover:bg-primary-100 hover:text-primary-700 border border-outline-variant/20'
                        }`}
                      >
                        {s.time}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-on-surface-variant bg-surface-low rounded-xl border border-outline-variant/20">
                  No slots available for this date.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 - Patient Details */}
        {step === 4 && (
          <div className="animate-in slide-in-from-right-8 duration-500 flex justify-center">
            <div className="w-full max-w-md bg-surface-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/20">
              <div className="flex items-center gap-4 mb-6 -ml-2">
                <Button variant="ghost" size="icon" onClick={handleBack} className="text-on-surface-variant hover:bg-surface-low rounded-full">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-semibold text-on-surface">Patient Details</h1>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
                  <input required value={patientName} onChange={e=>setPatientName(e.target.value)} type="text" className="w-full rounded-lg bg-surface-low border border-outline-variant/30 px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Phone Number</label>
                  <input required value={patientPhone} onChange={e=>setPatientPhone(e.target.value)} type="tel" className="w-full rounded-lg bg-surface-low border border-outline-variant/30 px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Email (Optional)</label>
                  <input value={patientEmail} onChange={e=>setPatientEmail(e.target.value)} type="email" className="w-full rounded-lg bg-surface-low border border-outline-variant/30 px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Reason for Visit</label>
                  <textarea required value={reason} onChange={e=>setReason(e.target.value)} rows={3} className="w-full rounded-lg bg-surface-low border border-outline-variant/30 px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Briefly describe your symptoms..." />
                </div>

                <Button type="submit" disabled={bookMutation.isPending} className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-lg mt-2 font-medium">
                  {bookMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Booking"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 5 - Success */}
        {step === 5 && (
          <div className="animate-in zoom-in-95 duration-500 flex justify-center py-12">
            <div className="w-full max-w-sm text-center">
              <div className="w-24 h-24 bg-medical-green/10 text-medical-green rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-bold text-on-surface mb-2">Booking Confirmed!</h1>
              <p className="text-on-surface-variant mb-6">Your appointment has been scheduled successfully.</p>
              
              <div className="bg-surface-lowest border border-outline-variant/20 rounded-2xl p-6 mb-8 shadow-sm">
                <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-2">Token Number</p>
                <div className="text-5xl font-mono font-bold text-primary-600 mb-6">#{bookMutation.data?.tokenNumber || '14'}</div>
                
                <div className="w-40 h-40 mx-auto border-4 border-surface-low rounded-xl bg-surface-lowest flex items-center justify-center p-2 mb-2">
                  <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example')] bg-cover opacity-50" />
                </div>
                <p className="text-xs text-on-surface-variant">Show this at reception</p>
              </div>

              <div className="space-y-3">
                <Button className="w-full h-11 bg-primary-500 hover:bg-primary-600">
                  <CalendarPlus className="w-4 h-4 mr-2" /> Add to Calendar
                </Button>
                <Button variant="outline" className="w-full h-11 border-outline-variant/30 text-on-surface" onClick={() => router.push('/portal/register')}>
                  <UserPlus className="w-4 h-4 mr-2" /> Register for Portal
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
