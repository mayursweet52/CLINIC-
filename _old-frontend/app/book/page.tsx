"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import {
  CheckCircle,
  Search,
  Calendar as CalendarIcon,
  Clock,
  HeartPulse,
  User,
  Pill,
  Stethoscope,
  ChevronLeft,
} from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";

const FALLBACK_DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Rajesh Sharma",
    department: "Cardiology",
    specialization: "Senior Cardiologist",
    consultationFee: 500,
    experience: "15+ Years",
  },
  {
    id: "doc-2",
    name: "Dr. Anjali Patil",
    department: "General Medicine",
    specialization: "Consultant Physician",
    consultationFee: 400,
    experience: "12+ Years",
  },
  {
    id: "doc-3",
    name: "Dr. Vikram Kulkarni",
    department: "Orthopedics",
    specialization: "Bone & Joint Surgeon",
    consultationFee: 600,
    experience: "18+ Years",
  },
  {
    id: "doc-4",
    name: "Dr. Sneha Deshmukh",
    department: "Pediatrics",
    specialization: "Child Care Specialist",
    consultationFee: 450,
    experience: "10+ Years",
  },
];

const DEPARTMENTS = [
  { name: "Cardiology", icon: HeartPulse, count: 2 },
  { name: "General Medicine", icon: Stethoscope, count: 5 },
  { name: "Orthopedics", icon: User, count: 3 },
  { name: "Pediatrics", icon: Pill, count: 2 },
];

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState<any>(null);
  const [date, setDate] = useState<Date>(startOfToday());
  const [timeSlot, setTimeSlot] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [reason, setReason] = useState("");
  const [consent, setConsent] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [availableSlots, setAvailableSlots] = useState<
    { time: string; available: boolean }[]
  >([]);

  // Generate next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfToday(), i),
  );

  useEffect(() => {
    if (step === 3 && doctor) {
      // Mock slots
      const times = [
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "12:30 PM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
      ];
      setAvailableSlots(
        times.map((t) => ({
          time: t,
          available: Math.random() > 0.3, // 70% chance of being available
        })),
      );
      setTimeSlot("");
    }
  }, [step, doctor, date]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsBooking(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessData({
        tokenNumber: "TKN-" + Math.floor(100 + Math.random() * 900),
        patientCode: "PAT-" + Math.floor(1000 + Math.random() * 9000),
        doctor: doctor.name,
        date: format(date, "dd MMM yyyy"),
        time: timeSlot,
      });
      setStep(5);
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const steps = ["Department", "Doctor", "Slot", "Details"];

  const renderProgress = () => {
    if (step === 5) return null;
    return (
      <div className="mb-8 mt-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200 z-0"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary-600 z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((s, idx) => {
            const isCompleted = step > idx + 1;
            const isCurrent = step === idx + 1;
            return (
              <div
                key={idx}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                    isCompleted
                      ? "bg-primary-600 border-primary-600 text-white"
                      : isCurrent
                        ? "bg-white border-primary-600 text-primary-600"
                        : "bg-white border-slate-300 text-slate-300"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`absolute top-7 text-[10px] font-medium whitespace-nowrap ${
                    isCurrent || isCompleted
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {s}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50 flex items-center">
        {step > 1 && step < 5 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="mr-3 text-slate-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-6 mr-3"></div>
        )}
        <h1 className="text-lg font-bold text-center flex-1 pr-9">
          Book Appointment
        </h1>
      </header>

      <main className="px-4 max-w-md mx-auto">
        {renderProgress()}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pt-6">
            <h2 className="text-xl font-bold mb-4">Select Department</h2>
            <div className="grid grid-cols-2 gap-3">
              {DEPARTMENTS.map((dept, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDepartment(dept.name);
                    setStep(2);
                  }}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left flex flex-col items-center justify-center gap-3 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <dept.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-sm">{dept.name}</h3>
                    <p className="text-xs text-slate-500">
                      {dept.count} Doctors
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pt-6">
            <h2 className="text-xl font-bold mb-4">Select Doctor</h2>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-3">
              {FALLBACK_DOCTORS.filter(
                (d) =>
                  (department ? d.department === department : true) &&
                  d.name.toLowerCase().includes(searchQuery.toLowerCase()),
              ).map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {doc.name.charAt(4)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{doc.name}</h3>
                    <p className="text-xs text-primary-600 font-medium">
                      {doc.specialization}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>{doc.experience}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        ₹{doc.consultationFee}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDoctor(doc);
                      setStep(3);
                    }}
                    className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-100 self-center"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pt-6">
            <h2 className="text-xl font-bold mb-4">Select Slot</h2>

            {/* Date Picker Horizontal Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mb-2">
              {next7Days.map((d, i) => {
                const isSelected =
                  format(date, "yyyy-MM-dd") === format(d, "yyyy-MM-dd");
                return (
                  <button
                    key={i}
                    onClick={() => setDate(d)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border ${
                      isSelected
                        ? "bg-primary-600 border-primary-600 text-white shadow-md"
                        : "bg-white border-slate-200 text-slate-600 hover:border-primary-300"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase">
                      {format(d, "EEE")}
                    </span>
                    <span className="text-xl font-bold mt-1">
                      {format(d, "d")}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm">Available Times</h3>
              <div className="flex gap-3 text-[10px] font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white border border-slate-300"></span>{" "}
                  Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-100"></span>{" "}
                  Booked
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {availableSlots.map((slot, i) => {
                const isSelected = timeSlot === slot.time;
                return (
                  <button
                    key={i}
                    disabled={!slot.available}
                    onClick={() => setTimeSlot(slot.time)}
                    className={`py-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      isSelected
                        ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                        : slot.available
                          ? "bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50"
                          : "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(4)}
              disabled={!timeSlot}
              className="w-full py-4 rounded-xl font-bold text-white bg-primary-600 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500"
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pt-6">
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6 flex gap-4 items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">
                  {format(date, "EEEE, dd MMM yyyy")}
                </p>
                <p className="text-primary-700 text-xs font-medium">
                  at {timeSlot} with {doctor?.name}
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Patient Details</h2>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Reason for visit
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none"
                  placeholder="Briefly describe your symptoms"
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="consent" className="text-xs text-slate-600">
                  I agree to the clinic's terms and conditions and consent to
                  receive booking updates via SMS/Email.
                </label>
              </div>

              <button
                type="submit"
                disabled={isBooking}
                className="w-full py-4 rounded-xl font-bold text-white bg-primary-600 disabled:opacity-50 mt-4 shadow-md shadow-primary-500/20"
              >
                {isBooking ? "Confirming..." : "Confirm Booking"}
              </button>
            </form>
          </div>
        )}

        {step === 5 && successData && (
          <div className="animate-in zoom-in-95 duration-500 pt-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Booking Confirmed!</h2>
            <p className="text-slate-500 text-sm mb-8">
              Your appointment has been successfully scheduled.
            </p>

            <div className="bg-white border border-slate-200 rounded-2xl w-full p-6 shadow-sm mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                Token Number
              </p>
              <p className="text-4xl font-mono font-bold text-primary-600 mb-6">
                {successData.tokenNumber}
              </p>

              <div className="border border-slate-100 p-4 rounded-xl inline-block mb-6">
                <QRCode value={successData.tokenNumber} size={120} />
              </div>

              <div className="text-left text-sm space-y-2 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-semibold">{successData.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time:</span>
                  <span className="font-semibold">
                    {successData.date} at {successData.time}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full space-y-3">
              <button className="w-full py-3.5 rounded-xl font-bold text-primary-700 bg-primary-50 border border-primary-200">
                Add to Calendar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 rounded-xl font-bold text-slate-600 bg-transparent hover:bg-slate-100"
              >
                Download Receipt
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
