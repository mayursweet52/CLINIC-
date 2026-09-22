"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/context/LanguageContext";

const FALLBACK_DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Rajesh Sharma",
    department: "Cardiology",
    specialization: "Senior Cardiologist (Heart Specialist)",
    consultationFee: 500,
    experience: "15+ Years Exp",
    timing: "10:00 AM - 02:00 PM",
    availableDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
    slotDuration: 15
  },
  {
    id: "doc-2",
    name: "Dr. Anjali Patil",
    department: "General Medicine",
    specialization: "Consultant Physician & Diabetologist",
    consultationFee: 400,
    experience: "12+ Years Exp",
    timing: "09:00 AM - 05:00 PM",
    availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
    slotDuration: 15
  },
  {
    id: "doc-3",
    name: "Dr. Vikram Kulkarni",
    department: "Orthopedics",
    specialization: "Bone & Joint Replacement Surgeon",
    consultationFee: 600,
    experience: "18+ Years Exp",
    timing: "11:00 AM - 04:00 PM",
    availableDays: ["TUESDAY", "THURSDAY", "SATURDAY"],
    slotDuration: 20
  },
  {
    id: "doc-4",
    name: "Dr. Sneha Deshmukh",
    department: "Pediatrics",
    specialization: "Child & Newborn Care Specialist",
    consultationFee: 450,
    experience: "10+ Years Exp",
    timing: "10:00 AM - 01:00 PM, 05:00 PM - 08:00 PM",
    availableDays: ["MONDAY", "TUESDAY", "THURSDAY", "FRIDAY"],
    slotDuration: 15
  },
  {
    id: "doc-5",
    name: "Dr. Priya Nair",
    department: "Gynecology",
    specialization: "Women's Health & Obstetrics",
    consultationFee: 550,
    experience: "14+ Years Exp",
    timing: "10:00 AM - 03:00 PM",
    availableDays: ["WEDNESDAY", "FRIDAY", "SATURDAY"],
    slotDuration: 20
  },
  {
    id: "doc-6",
    name: "Dr. Amit Verma",
    department: "Dermatology",
    specialization: "Skin, Hair & Laser Specialist",
    consultationFee: 500,
    experience: "8+ Years Exp",
    timing: "02:00 PM - 07:00 PM",
    availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "FRIDAY", "SATURDAY"],
    slotDuration: 15
  },
  {
    id: "doc-7",
    name: "Dr. Sunita Rao",
    department: "ENT",
    specialization: "Ear, Nose & Throat Specialist",
    consultationFee: 450,
    experience: "11+ Years Exp",
    timing: "10:00 AM - 02:00 PM",
    availableDays: ["TUESDAY", "THURSDAY", "SATURDAY"],
    slotDuration: 15
  },
  {
    id: "doc-8",
    name: "Dr. Manoj Joshi",
    department: "Ophthalmology",
    specialization: "Eye Surgeon & Vision Care Specialist",
    consultationFee: 500,
    experience: "16+ Years Exp",
    timing: "09:30 AM - 01:30 PM",
    availableDays: ["MONDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    slotDuration: 15
  }
];

export default function BookAppointmentPage() {
  const { t } = useLang();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/public/hospitals")
      .then(res => res.json())
      .then(data => {
        if (data.hospitals && Array.isArray(data.hospitals) && data.hospitals.length > 0) {
          setHospitals(data.hospitals);
        }
      })
      .catch(err => console.error("Error fetching hospitals:", err));
  }, []);

  useEffect(() => {
    if (selectedDoctor && date) {
      setAvailableSlots([]);
      setTimeSlot("");
      fetch(`/api/availability/slots?doctorId=${selectedDoctor.id}&date=${date}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAvailableSlots(data);
          }
        })
        .catch(err => console.error("Error fetching slots:", err));
    }
  }, [selectedDoctor, date]);

  const handleTimeSlotChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTime = e.target.value;
    setTimeSlot(selectedTime);

    if (!selectedTime) return;

    const datetime = `${date}T${selectedTime}:00`;
    try {
      const lockRes = await fetch("/api/slots/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: selectedDoctor?.id, datetime }),
      });

      const lockData = await lockRes.json();
      if (!lockData.locked) {
        toast.error(lockData.reason || "Slot not available, someone else might be booking it");
        setTimeSlot("");
      }
    } catch (err) {
      console.error("Lock error", err);
    }
  };

  const handleHospitalSelect = (hospital: any) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setSuccessData(null);
    
    if (hospital.doctors && Array.isArray(hospital.doctors) && hospital.doctors.length > 0) {
      setDoctors(hospital.doctors);
    } else {
      setDoctors(FALLBACK_DOCTORS);
    }
    
    fetch(`/api/public/hospitals?orgId=${hospital.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.doctors && Array.isArray(data.doctors) && data.doctors.length > 0) {
          setDoctors(data.doctors);
        }
      })
      .catch(err => {
        console.warn("Background fetch doctors warning:", err);
      });
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeSlot) {
      toast.error("Please select a time slot");
      return;
    }
    setIsBooking(true);

    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: selectedHospital?.id || "org-city-care",
          doctorId: selectedDoctor?.id || "doc-1",
          patientName,
          patientPhone,
          date,
          timeSlot,
          datetime: `${date}T${timeSlot}:00`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessData(data);
        toast.success(t.appointmentConfirmed);
      } else {
        toast.error(data.error || "Failed to book");
      }
    } catch (err) {
      toast.error("An error occurred during booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const activeDoctors = (doctors && doctors.length > 0)
    ? doctors
    : (selectedHospital?.doctors && selectedHospital.doctors.length > 0)
      ? selectedHospital.doctors
      : FALLBACK_DOCTORS;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Clinic<span className="text-blue-600">OS</span></span>
          </div>
          <div className="flex items-center gap-4">
            {/* 🌐 Language Switcher */}
            <LanguageSwitcher />
            <Link href="/health" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">{t.patientPortal}</Link>
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">{t.staffLogin}</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {successData ? (
          <div className="max-w-2xl mx-auto text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t.appointmentConfirmed}</h2>
            <p className="text-slate-500 mb-8">Please visit {successData.hospitalName} at your scheduled time.</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">{t.tokenNumber}</p>
                <p className="text-2xl font-black text-indigo-600">#{successData.tokenNumber || "101"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">{t.patientCode}</p>
                <p className="text-2xl font-black text-slate-900">{successData.patientCode || "PAT-1001"}</p>
              </div>
            </div>

            <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">{t.scanAtCounter}</p>
              <QRCode value={JSON.stringify({ token: successData.tokenNumber, code: successData.patientCode })} size={140} />
            </div>
            
            <p className="text-sm text-slate-500 mb-6 font-medium">{t.keepCodeSafe}</p>
            <button onClick={() => { setSelectedHospital(null); setSelectedDoctor(null); setSuccessData(null); }} className="text-blue-600 font-bold hover:underline">{t.bookAnother}</button>
          </div>
        ) : !selectedHospital ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">{t.findHospital}</h2>
              <p className="text-slate-500 text-lg">{t.findHospitalSub}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hospitals.map(hospital => (
                <button
                  key={hospital.id}
                  onClick={() => handleHospitalSelect(hospital)}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
                    {hospital.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{hospital.name}</h3>
                  <div className="flex flex-col gap-1 mt-3">
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {hospital.city ? `${hospital.city}, ${hospital.state}` : "Location not provided"}
                    </p>
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {hospital.phone || "Phone not available"}
                    </p>
                  </div>
                </button>
              ))}
              {hospitals.length === 0 && <p className="text-slate-500 text-center col-span-2">{t.noHospitals}</p>}
            </div>
          </div>
        ) : !selectedDoctor ? (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <button onClick={() => setSelectedHospital(null)} className="text-slate-500 font-bold text-sm hover:text-slate-900 flex items-center gap-1.5">
              {t.backToHospitals}
            </button>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{selectedHospital.name}</h2>
              <p className="text-slate-500">{t.selectDoctor}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDoctors.map((doctor: any) => (
                <button
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all text-left flex items-start gap-4 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shadow-blue-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                    DR
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{doctor.name}</h3>
                      <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">{t.available}</span>
                    </div>
                    <p className="text-indigo-600 text-sm font-semibold">{doctor.specialization || doctor.department}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>🩺 {doctor.department}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">{t.fee}: ₹{doctor.consultationFee || 500}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in slide-in-from-bottom-8 duration-500">
            <button onClick={() => setSelectedDoctor(null)} className="text-slate-500 font-bold text-sm hover:text-slate-900 flex items-center gap-1.5 mb-6">
              {t.backToDoctors}
            </button>
            
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{t.bookAppointment}</h2>
            <p className="text-slate-500 text-sm mb-6">with <span className="font-bold text-slate-700">{selectedDoctor.name}</span> at {selectedHospital.name}</p>

            <form onSubmit={handleBook} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.patientFullName}</label>
                <input 
                  type="text" 
                  required 
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="John Doe" 
                  className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.mobileNumber}</label>
                <input 
                  type="tel" 
                  required 
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  placeholder="9876543210" 
                  className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.date}</label>
                  <input 
                    type="date" 
                    required 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.timeSlot}</label>
                  <select 
                    required 
                    value={timeSlot}
                    onChange={handleTimeSlotChange}
                    className="w-full p-4 bg-[#fafafa] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900 cursor-pointer"
                    disabled={!date || availableSlots.length === 0}
                  >
                    <option value="" disabled>
                      {!date ? "Select a date first" : availableSlots.length === 0 ? "No slots available" : t.selectSlot}
                    </option>
                    {availableSlots.map(slot => (
                      <option key={slot.time} value={slot.time} disabled={!slot.available}>
                        {slot.time} {!slot.available ? "(Unavailable)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95 mt-4"
              >
                {isBooking ? t.confirming : t.confirmBooking}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
