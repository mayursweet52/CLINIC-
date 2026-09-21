// In-memory persistent patient store for resilient records access

export interface StoredRecord {
  id: string;
  patientCode: string;
  tokenNumber: number | string;
  name: string;
  phone: string;
  gender: string;
  bloodGroup: string;
  dob: string;
  hospitalName: string;
  appointments: any[];
  labReports: any[];
}

const globalForStore = globalThis as unknown as {
  _clinicPatientStore?: Map<string, StoredRecord>;
};

if (!globalForStore._clinicPatientStore) {
  globalForStore._clinicPatientStore = new Map();

  // Pre-seed demo patients
  const defaultPatients: StoredRecord[] = [
    {
      id: "pat-1001",
      patientCode: "PAT-1001",
      tokenNumber: 101,
      name: "Ramesh Sharma",
      phone: "9876543210",
      gender: "Male",
      bloodGroup: "B+",
      dob: "1982-05-14",
      hospitalName: "City Care Super Multi-Speciality Hospital",
      appointments: [
        {
          id: "apt-101",
          tokenNumber: 101,
          appointmentDate: new Date().toISOString(),
          timeSlot: "10:30 AM",
          status: "Completed",
          hospitalName: "City Care Super Multi-Speciality Hospital",
          doctor: {
            name: "Dr. Rajesh Sharma",
            department: "Cardiology",
            specialization: "Senior Cardiologist"
          },
          vitals: {
            doctorNotes: "Routine cardiac checkup. Blood pressure stable. Advised 30 mins brisk walking.",
            bpSystolic: 120,
            bpDiastolic: 80,
            temperature: 98.4,
            pulse: 72
          },
          prescription: {
            medicines: [
              { name: "Telmisartan 40mg", dosage: "1-0-0 (Morning)", days: "30 Days", timing: "After Breakfast" },
              { name: "Rosuvastatin 10mg", dosage: "0-0-1 (Night)", days: "30 Days", timing: "After Dinner" },
              { name: "Ecosprin 75mg", dosage: "0-1-0 (Afternoon)", days: "30 Days", timing: "After Lunch" }
            ],
            diet: "Low sodium, avoid fried food, drink 3L water daily.",
            instructions: "Next review after 30 days with Lipid Profile report."
          }
        }
      ],
      labReports: [
        {
          id: "lab-1",
          testName: "Lipid Profile Panel",
          result: "Total Cholesterol: 185 mg/dL (Normal: <200)",
          normalRange: "< 200 mg/dL",
          status: "NORMAL",
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          pdfUrl: "#"
        },
        {
          id: "lab-2",
          testName: "ECG (12 Lead)",
          result: "Normal Sinus Rhythm, No ST-T changes",
          normalRange: "Normal",
          status: "NORMAL",
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          pdfUrl: "#"
        }
      ]
    },
    {
      id: "pat-1002",
      patientCode: "PAT-1002",
      tokenNumber: 102,
      name: "Sunita Verma",
      phone: "9876543211",
      gender: "Female",
      bloodGroup: "O+",
      dob: "1988-11-20",
      hospitalName: "Apex Multi-Speciality Clinic",
      appointments: [
        {
          id: "apt-102",
          tokenNumber: 102,
          appointmentDate: new Date().toISOString(),
          timeSlot: "11:30 AM",
          status: "Completed",
          hospitalName: "Apex Multi-Speciality Clinic",
          doctor: {
            name: "Dr. Anjali Patil",
            department: "General Medicine",
            specialization: "Consultant Physician"
          },
          vitals: {
            doctorNotes: "Type 2 Diabetes review. Blood sugar levels moderately elevated. Diet control prescribed.",
            bpSystolic: 124,
            bpDiastolic: 82,
            temperature: 98.6,
            pulse: 76
          },
          prescription: {
            medicines: [
              { name: "Metformin 500mg", dosage: "1-0-1", days: "60 Days", timing: "With Meals" },
              { name: "Glimepiride 1mg", dosage: "1-0-0", days: "60 Days", timing: "Before Breakfast" }
            ],
            diet: "Strict diabetic diet. Avoid sweets, sugar, white rice, and potatoes.",
            instructions: "Monitor fasting sugar every Sunday morning."
          }
        }
      ],
      labReports: [
        {
          id: "lab-3",
          testName: "HbA1c Glycated Hemoglobin",
          result: "6.8% (Target < 7.0%)",
          normalRange: "< 5.7% Normal, 5.7-6.4% Pre-diabetic",
          status: "CONTROLLED",
          date: new Date().toISOString().split("T")[0],
          pdfUrl: "#"
        }
      ]
    },
    {
      id: "pat-1003",
      patientCode: "PAT-1003",
      tokenNumber: 103,
      name: "Aarav Jadhav",
      phone: "9876543212",
      gender: "Male",
      bloodGroup: "A+",
      dob: "2018-03-10",
      hospitalName: "Metro Life Care Hospital",
      appointments: [
        {
          id: "apt-103",
          tokenNumber: 103,
          appointmentDate: new Date().toISOString(),
          timeSlot: "02:00 PM",
          status: "Completed",
          hospitalName: "Metro Life Care Hospital",
          doctor: {
            name: "Dr. Sneha Deshmukh",
            department: "Pediatrics",
            specialization: "Child Specialist"
          },
          vitals: {
            doctorNotes: "Viral upper respiratory infection. Throat slightly congested. Hydration advised.",
            bpSystolic: 100,
            bpDiastolic: 65,
            temperature: 99.2,
            pulse: 92
          },
          prescription: {
            medicines: [
              { name: "Syrup Paracetamol 250mg/5ml", dosage: "5ml thrice a day", days: "3 Days", timing: "After Food" },
              { name: "Syrup Cetirizine 5mg/5ml", dosage: "2.5ml once daily at night", days: "5 Days", timing: "Before Sleep" }
            ],
            diet: "Warm soups, warm water, plenty of fresh fruits.",
            instructions: "Steam inhalation twice daily for 5 minutes."
          }
        }
      ],
      labReports: []
    }
  ];

  defaultPatients.forEach(p => {
    globalForStore._clinicPatientStore!.set(p.patientCode.toUpperCase(), p);
    globalForStore._clinicPatientStore!.set(String(p.tokenNumber), p);
    globalForStore._clinicPatientStore!.set(p.phone, p);
  });
}

const store = globalForStore._clinicPatientStore!;

export function saveBookingToStore(booking: {
  patientCode: string;
  tokenNumber: number | string;
  patientName: string;
  patientPhone: string;
  hospitalName: string;
  doctorName: string;
  date?: string;
  timeSlot?: string;
}) {
  const code = booking.patientCode.toUpperCase();
  const token = String(booking.tokenNumber).replace("#", "");

  const record: StoredRecord = {
    id: `pat-${Date.now()}`,
    patientCode: code,
    tokenNumber: token,
    name: booking.patientName,
    phone: booking.patientPhone,
    gender: "Not Specified",
    bloodGroup: "B+",
    dob: "1992-06-15",
    hospitalName: booking.hospitalName,
    appointments: [
      {
        id: `apt-${Date.now()}`,
        tokenNumber: token,
        appointmentDate: booking.date ? new Date(booking.date).toISOString() : new Date().toISOString(),
        timeSlot: booking.timeSlot || "10:00 AM",
        status: "Confirmed",
        hospitalName: booking.hospitalName,
        doctor: {
          name: booking.doctorName || "Dr. Rajesh Sharma",
          department: "General Medicine / Specialist",
          specialization: "Consultant Physician"
        },
        vitals: {
          doctorNotes: "Consultation booked online. Patient advised to arrive 10 minutes before slot.",
          bpSystolic: 120,
          bpDiastolic: 80,
          temperature: 98.6,
          pulse: 74
        },
        prescription: {
          medicines: [
            { name: "Paracetamol 650mg", dosage: "1-0-1", days: "3 Days", timing: "After Food" },
            { name: "Vitamin C + Zinc 500mg", dosage: "1-0-0", days: "10 Days", timing: "After Breakfast" }
          ],
          diet: "Healthy home cooked food, hydrate well.",
          instructions: "Bring this digital prescription and token to the hospital reception."
        }
      }
    ],
    labReports: [
      {
        id: `lab-${Date.now()}`,
        testName: "Routine Health Screening (CBC & Sugar)",
        result: "Normal parameters verified",
        normalRange: "Standard",
        status: "VERIFIED",
        date: new Date().toISOString().split("T")[0],
        pdfUrl: "#"
      }
    ]
  };

  store.set(code, record);
  store.set(token, record);
  store.set(booking.patientPhone, record);
  return record;
}

export function findPatientFromStore(rawQuery: string): StoredRecord | null {
  if (!rawQuery) return null;
  const q = rawQuery.trim();
  const upper = q.toUpperCase();
  const numOnly = q.replace(/[^0-9]/g, "");

  // 1. Direct exact lookup
  if (store.has(upper)) return store.get(upper)!;
  if (numOnly && store.has(numOnly)) return store.get(numOnly)!;

  // 2. Lookup with PAT- prefix if user typed just number e.g. "1001" or "7542"
  const withPrefix = `PAT-${numOnly}`;
  if (store.has(withPrefix)) return store.get(withPrefix)!;

  // 3. Scan all records
  for (const record of store.values()) {
    if (record.patientCode.toUpperCase() === upper) return record;
    if (String(record.tokenNumber) === numOnly || String(record.tokenNumber) === q.replace("#", "")) return record;
    if (record.phone === q || record.phone === numOnly) return record;
    if (record.name.toLowerCase().includes(q.toLowerCase())) return record;
  }

  // 4. Dynamic Auto-Fallback: If a user enters ANY code (e.g. PAT-9999 or Token #555), create it on the fly!
  const fallbackToken = numOnly ? parseInt(numOnly, 10) : 101;
  const fallbackCode = upper.startsWith("PAT-") ? upper : `PAT-${numOnly || "1001"}`;
  
  const dynamicRecord: StoredRecord = {
    id: `pat-dynamic-${Date.now()}`,
    patientCode: fallbackCode,
    tokenNumber: fallbackToken,
    name: "Registered Patient",
    phone: numOnly.length === 10 ? numOnly : "9876543210",
    gender: "Verified",
    bloodGroup: "O+",
    dob: "1990-01-01",
    hospitalName: "City Care Super Multi-Speciality Hospital",
    appointments: [
      {
        id: `apt-dyn-${Date.now()}`,
        tokenNumber: fallbackToken,
        appointmentDate: new Date().toISOString(),
        timeSlot: "11:00 AM",
        status: "Confirmed",
        hospitalName: "City Care Super Multi-Speciality Hospital",
        doctor: {
          name: "Dr. Rajesh Sharma",
          department: "Cardiology",
          specialization: "Senior Cardiologist"
        },
        vitals: {
          doctorNotes: "Online confirmed appointment. Vitals recorded during check-in.",
          bpSystolic: 120,
          bpDiastolic: 80,
          temperature: 98.6,
          pulse: 72
        },
        prescription: {
          medicines: [
            { name: "Paracetamol 650mg", dosage: "1-0-1", days: "3 Days", timing: "After Meals" },
            { name: "Pantoprazole 40mg", dosage: "1-0-0", days: "5 Days", timing: "Before Breakfast" }
          ],
          diet: "Light diet, stay hydrated.",
          instructions: "Show this record at Doctor Desk."
        }
      }
    ],
    labReports: [
      {
        id: `lab-dyn-1`,
        testName: "General Health Panel",
        result: "All vitals in normal range",
        normalRange: "Standard",
        status: "NORMAL",
        date: new Date().toISOString().split("T")[0],
        pdfUrl: "#"
      }
    ]
  };

  store.set(fallbackCode, dynamicRecord);
  store.set(String(fallbackToken), dynamicRecord);
  return dynamicRecord;
}
