import { PrismaClient, Role, ApptStatus, PayStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data...");
  await prisma.billing.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.patientVisit.deleteMany();
  await prisma.healthAppointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Seeding Organization...");
  const org = await prisma.organization.create({
    data: {
      name: "City Care Hospital",
      domain: "citycare.businessos.co.in",
      address: "123 Health Avenue, Phase 1",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91-9876543210"
    },
  });

  console.log("Seeding Users / Staff (Including Doctors)...");
  const doctorSmith = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Dr. Smith",
      email: "dr.smith@clinic.com",
      passwordHash: "hashed_password_123",
      role: Role.DOCTOR,
      department: "Cardiology",
      phone: "+1-555-0101",
      specialization: "Cardiologist",
      registrationNo: "MED-12345",
      consultationFee: 500,
      availableDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      slotDuration: 15
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Admin Boss",
      email: "admin@clinic.com",
      passwordHash: "hashed_password_123",
      role: Role.ADMIN,
      department: "Management",
      phone: "+1-555-0999",
    },
  });

  const receptionistAlice = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Alice",
      email: "alice@clinic.com",
      passwordHash: "hashed_password_123",
      role: Role.RECEPTIONIST,
      department: "Front Desk",
      phone: "+1-555-0103",
    },
  });

  console.log("Seeding Patients...");
  const patientJohn = await prisma.patient.create({
    data: {
      organizationId: org.id,
      patientCode: "PAT-1001",
      name: "John Doe",
      phone: "123-456-7890",
      email: "john.doe@example.com",
      address: "123 Main St",
      dob: new Date("1990-01-01"),
      gender: "Male",
      bloodGroup: "O+",
      allergies: ["Dust", "Peanuts"],
      chronicConds: ["Diabetes"],
      emergencyContact: "987-654-3210"
    },
  });

  console.log("Seeding Appointments & Visits...");
  const appt1 = await prisma.healthAppointment.create({
    data: {
      organizationId: org.id,
      appointmentNo: "APT-001",
      patientId: patientJohn.id,
      doctorId: doctorSmith.id,
      appointmentDate: new Date(),
      timeSlot: "10:30 AM",
      status: ApptStatus.COMPLETED,
      fee: 500,
      isPaid: true
    },
  });

  const visit1 = await prisma.patientVisit.create({
    data: {
      organizationId: org.id,
      patientId: patientJohn.id,
      doctorId: doctorSmith.id,
      appointmentId: appt1.id,
      visitDate: new Date(),
      vitalsBP: "120/80",
      vitalsPulse: 72,
      vitalsTemp: 98.6,
      vitalsWeight: 70.5,
      chiefComplaint: "Fever and mild headache",
      diagnosis: "Viral Fever",
      notes: "Rest and take fluids",
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
  });

  console.log("Seeding Prescriptions & Lab Reports...");
  await prisma.prescription.create({
    data: {
      organizationId: org.id,
      patientId: patientJohn.id,
      visitId: visit1.id,
      doctorId: doctorSmith.id,
      medicines: [
        { name: "Paracetamol 500mg", dosage: "1-0-1", days: 3 },
        { name: "Vitamin C", dosage: "1-0-0", days: 7 }
      ],
      diet: "Liquid diet, avoid cold food",
      instructions: "Take medicine after meals",
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
  });

  await prisma.labReport.create({
    data: {
      organizationId: org.id,
      patientId: patientJohn.id,
      testName: "CBC",
      results: { hemoglobin: "13.5", wbc: "8000" },
      normalRange: "Hb: 13-17, WBC: 4000-11000",
      interpretation: "Normal Report",
      fileUrl: "https://example.com/report1.pdf"
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
