"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StepProgress } from "@/features/booking/components/StepProgress";
import { HeartPulse, Search, MapPin, Star, User, Calendar, Clock, ChevronRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import confetti from "canvas-confetti";
import { QRCodeSVG } from "qrcode.react";

// Minimal mockup of types to avoid TS errors
type Clinic = { id: string; name: string; slug: string; city: string; rating: number; coverImageUrl: string | null; logoUrl: string | null; };
type Dept = { id: string; name: string; slug: string; icon: string | null; conditions: Condition[] };
type Condition = { id: string; name: string; slug: string; icon: string | null };
type Doctor = { id: string; name: string; specialization: string; consultationFee: number; averageRating: number; yearsOfExperience: number };
type Slot = { time: string; status: 'AVAILABLE' | 'BOOKED' };

function BookingWizard() {
  const searchParams = useSearchParams();
  const initClinic = searchParams.get("clinic");
  const initDoctor = searchParams.get("doctor");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Data State
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  
  // Selection State
  const [clinicSlug, setClinicSlug] = useState(initClinic || "");
  const [clinicId, setClinicId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [conditionId, setConditionId] = useState("");
  const [doctorId, setDoctorId] = useState(initDoctor || "");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState("");
  const [patient, setPatient] = useState({ name: "", phone: "", email: "", reason: "", symptoms: "" });
  
  // Success state
  const [successData, setSuccessData] = useState<any>(null);

  // Step 1 Data
  useEffect(() => {
    if (step === 1) fetchClinics();
  }, [step]);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/clinics");
      if (res.ok) {
        const data = await res.json();
        setClinics(data.clinics);
      }
    } finally {
      setLoading(false);
    }
  };

  // Skip to correct step based on init
  useEffect(() => {
    if (initClinic && step === 1) {
      setClinicSlug(initClinic);
      setStep(2);
    }
    // If doctor is preset, we assume clinic is too (or skip for demo)
  }, [initClinic]);

  // Step 2 Data
  useEffect(() => {
    if (step === 2 && clinicSlug) {
      fetch(`/api/public/clinics/${clinicSlug}/departments`)
        .then(res => res.json())
        .then(data => {
          if (data.departments) setDepartments(data.departments);
        });
    }
  }, [step, clinicSlug]);

  // Step 3 Data
  useEffect(() => {
    if (step === 3 && clinicSlug) {
      fetch(`/api/public/clinics/${clinicSlug}/doctors${departmentId ? `?departmentId=${departmentId}` : ''}`)
        .then(res => res.json())
        .then(data => {
          if (data.doctors) setDoctors(data.doctors);
        });
    }
  }, [step, clinicSlug, departmentId]);

  // Step 4 Data
  useEffect(() => {
    if (step === 4 && doctorId && selectedDate) {
      // Mock slots for now until we update the slot API
      setSlots([
        { time: "09:00", status: "AVAILABLE" },
        { time: "09:30", status: "BOOKED" },
        { time: "10:00", status: "AVAILABLE" },
        { time: "10:30", status: "AVAILABLE" },
        { time: "11:00", status: "AVAILABLE" }
      ]);
    }
  }, [step, doctorId, selectedDate]);

  const handleSlotClick = async (time: string) => {
    setSelectedTime(time);
    // Real implementation would lock via Redis here
    setStep(5);
  };

  const handleBook = async () => {
    if (!patient.name || !patient.phone || !patient.reason) {
      setError("Please fill all required fields");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: clinics.find(c => c.slug === clinicSlug)?.id || clinicSlug,
          departmentId: departmentId || undefined,
          conditionId: conditionId || undefined,
          doctorId,
          appointmentDate: selectedDate + "T00:00:00Z",
          timeSlot: selectedTime,
          patientName: patient.name,
          patientPhone: "+91" + patient.phone.replace(/^\+91/, ""),
          patientEmail: patient.email,
          reason: patient.reason,
          symptoms: patient.symptoms
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      
      setSuccessData(data);
      setStep(6);
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#14b8a6', '#0f766e']
        });
      }, 300);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Mini Nav */}
      <header className="h-16 bg-surface-lowest/95 backdrop-blur border-b border-outline-variant sticky top-0 z-40">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-primary" />
            <span className="font-bold">ClinicOS</span>
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-8">
        {step < 6 && <StepProgress currentStep={step} onStepClick={(s) => setStep(s)} />}
        
        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold mb-6">Select a Clinic</h1>
            {loading ? <p>Loading...</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clinics.map(clinic => (
                  <div 
                    key={clinic.id} 
                    className="border border-outline-variant rounded-xl p-4 cursor-pointer hover:border-primary transition-colors flex gap-4 bg-surface-lowest"
                    onClick={() => { setClinicSlug(clinic.slug); setClinicId(clinic.id); setStep(2); }}
                  >
                    <div className="w-16 h-16 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold overflow-hidden">
                      {clinic.logoUrl ? <img src={clinic.logoUrl} alt="" className="w-full h-full object-cover" /> : clinic.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold">{clinic.name}</h3>
                      <p className="text-sm text-on-surface-variant flex items-center gap-1"><MapPin className="w-3 h-3"/> {clinic.city}</p>
                      <p className="text-sm text-secondary flex items-center gap-1"><Star className="w-3 h-3 fill-current"/> {clinic.rating.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="icon" onClick={() => setStep(1)}><ArrowLeft className="w-5 h-5"/></Button>
              <h1 className="text-2xl font-bold">What are you looking for?</h1>
            </div>
            
            <div className="space-y-8">
              {departments.map(dept => (
                <div key={dept.id}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    {dept.icon} {dept.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dept.conditions?.map(cond => (
                      <button 
                        key={cond.id}
                        onClick={() => { setDepartmentId(dept.id); setConditionId(cond.id); setStep(3); }}
                        className="p-3 rounded-lg border border-outline-variant bg-surface-lowest text-left hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium flex items-center gap-2"
                      >
                        <span className="text-xl">{cond.icon || "🦠"}</span>
                        {cond.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => { setDepartmentId(""); setConditionId(""); setStep(3); }}
              >
                Not sure / Browse all doctors
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="icon" onClick={() => setStep(2)}><ArrowLeft className="w-5 h-5"/></Button>
              <h1 className="text-2xl font-bold">Select a Doctor</h1>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map(doc => (
                <div key={doc.id} className="border border-outline-variant rounded-xl p-5 bg-surface-lowest hover:border-primary transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
                      {doc.name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{doc.name}</h3>
                      <p className="text-sm text-on-surface-variant font-medium">{doc.specialization}</p>
                      <div className="text-xs text-on-surface-variant mt-1">{doc.yearsOfExperience} yrs exp • ₹{doc.consultationFee}</div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => { setDoctorId(doc.id); setStep(4); }}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="icon" onClick={() => setStep(3)}><ArrowLeft className="w-5 h-5"/></Button>
              <h1 className="text-2xl font-bold">Select Date & Time</h1>
            </div>
            
            <div className="bg-surface-lowest rounded-xl border border-outline-variant p-6">
              <label className="text-sm font-medium mb-2 block">Appointment Date</label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                min={new Date().toISOString().split("T")[0]}
                className="mb-6"
              />
              
              <label className="text-sm font-medium mb-2 block">Available Slots</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {slots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={slot.status === 'BOOKED'}
                    onClick={() => handleSlotClick(slot.time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      slot.status === 'BOOKED' 
                        ? 'bg-surface-high text-on-surface-variant cursor-not-allowed' 
                        : 'bg-primary-container/30 text-on-surface hover:bg-primary-container text-primary'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="icon" onClick={() => setStep(4)}><ArrowLeft className="w-5 h-5"/></Button>
              <h1 className="text-2xl font-bold">Patient Details</h1>
            </div>
            
            <div className="bg-surface-lowest rounded-xl border border-outline-variant p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} placeholder="Rahul Kumar" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input value={patient.phone} onChange={e => setPatient({...patient, phone: e.target.value})} placeholder="9876543210" type="tel" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for visit *</label>
                <Input value={patient.reason} onChange={e => setPatient({...patient, reason: e.target.value})} placeholder="e.g. Follow up, Fever, Knee pain" />
              </div>
              
              <Button 
                className="w-full mt-6" 
                size="lg" 
                onClick={handleBook} 
                disabled={loading}
              >
                {loading ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6 (Success) */}
        {step === 6 && successData && (
          <div className="animate-in zoom-in duration-500 max-w-lg mx-auto text-center mt-10">
            <div className="w-20 h-20 rounded-full bg-secondary text-on-secondary mx-auto flex items-center justify-center mb-6 shadow-lg animate-bounce">
              <Check className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-on-surface mb-2">Booking Confirmed!</h1>
            <p className="text-on-surface-variant mb-8">Your appointment has been scheduled successfully.</p>
            
            <div className="bg-surface-lowest rounded-2xl border border-outline-variant p-6 shadow-sm mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-secondary" />
              <p className="text-sm text-on-surface-variant font-medium mt-2">TOKEN NUMBER</p>
              <p className="text-4xl font-mono font-bold text-primary my-2">{successData.appointment?.tokenDisplay}</p>
              
              <div className="flex justify-center my-6">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-outline-variant inline-block">
                  <QRCodeSVG value={successData.trackingUrl} size={120} />
                </div>
              </div>
              
              <div className="border-t border-outline-variant/50 pt-4 mt-4 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-on-surface-variant" />
                  <div>
                    <p className="text-sm font-medium">{new Date(successData.appointment?.appointmentDate).toLocaleDateString()} at {successData.appointment?.timeSlot}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-on-surface-variant" />
                  <div>
                    <p className="text-sm font-medium">{patient.name}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="w-full" size="lg" asChild>
              <a href={successData.trackingUrl} target="_blank" rel="noreferrer">
                View Live Tracking
              </a>
            </Button>
            <Button variant="outline" className="w-full mt-3" asChild>
              <a href="/hospitals">Back to Home</a>
            </Button>
          </div>
        )}

      </main>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div>Loading wizard...</div>}>
      <BookingWizard />
    </Suspense>
  );
}
