import { PrismaClient, Role, ApptStatus, PayStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.billing.deleteMany();
  await prisma.vitals.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('Seeding Organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'City Care Hospital',
      domain: 'citycare.businessos.co.in',
      address: '123 Health Avenue, Phase 1',
      city: 'Mumbai',
      state: 'Maharashtra',
      phone: '+91-9876543210'
    },
  });

  console.log('Seeding Users / Staff...');
  const doctorSmith = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Dr. Smith',
      email: 'dr.smith@clinic.com',
      passwordHash: 'hashed_password_123',
      role: Role.DOCTOR,
      department: 'Cardiology',
      phone: '+1-555-0101',
    },
  });

  const doctorAdams = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Dr. Adams',
      email: 'dr.adams@clinic.com',
      passwordHash: 'hashed_password_123',
      role: Role.DOCTOR,
      department: 'Pediatrics',
      phone: '+1-555-0102',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Admin Boss',
      email: 'admin@clinic.com',
      passwordHash: 'hashed_password_123',
      role: Role.ADMIN,
      department: 'Management',
      phone: '+1-555-0999',
    },
  });

  const receptionistAlice = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Alice',
      email: 'alice@clinic.com',
      passwordHash: 'hashed_password_123',
      role: Role.RECEPTIONIST,
      department: 'Front Desk',
      phone: '+1-555-0103',
    },
  });

  console.log('Seeding Patients...');
  const patientJohn = await prisma.patient.create({
    data: {
      organizationId: org.id,
      patientCode: 'PAT-1001',
      name: 'John Doe',
      age: 34,
      gender: 'Male',
      bloodGroup: 'O+',
      contactNumber: '123-456-7890',
      email: 'john.doe@example.com',
      address: '123 Main St',
      medicalHistory: 'Mild Hypertension. No known drug allergies.',
    },
  });

  const patientJane = await prisma.patient.create({
    data: {
      organizationId: org.id,
      patientCode: 'PAT-1002',
      name: 'Jane Roe',
      age: 28,
      gender: 'Female',
      bloodGroup: 'A+',
      contactNumber: '098-765-4321',
      email: 'jane.roe@example.com',
      address: '456 Elm St',
      medicalHistory: 'Asthma. Seasonal allergies to pollen.',
    },
  });

  console.log('Seeding Appointments & Vitals...');
  const appt1 = await prisma.appointment.create({
    data: {
      organizationId: org.id,
      patientId: patientJohn.id,
      doctorId: doctorSmith.id,
      appointmentDate: new Date(),
      timeSlot: '10:00 AM',
      status: ApptStatus.ARRIVED,
    },
  });

  await prisma.vitals.create({
    data: {
      appointmentId: appt1.id,
      patientId: patientJohn.id,
      bpSystolic: 120,
      bpDiastolic: 80,
      pulseBpm: 72,
      weightKg: 68.5,
      temperature: 98.6,
      symptoms: 'Routine checkup and occasional headache',
      doctorNotes: 'BP stable. Prescribed mild analgesics.',
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      organizationId: org.id,
      patientId: patientJane.id,
      doctorId: doctorAdams.id,
      appointmentDate: new Date(),
      timeSlot: '11:30 AM',
      status: ApptStatus.PENDING,
    },
  });

  console.log('Seeding Medicines...');
  await prisma.medicine.createMany({
    data: [
      { organizationId: org.id, name: 'Paracetamol 500mg', genericName: 'Acetaminophen', batchNo: 'B-101', stockQuantity: 150, unitPrice: 5.0, expiryDate: new Date('2027-12-31') },
      { organizationId: org.id, name: 'Amoxicillin 250mg', genericName: 'Amoxicillin Trihydrate', batchNo: 'B-102', stockQuantity: 45, unitPrice: 12.0, expiryDate: new Date('2027-06-30') },
      { organizationId: org.id, name: 'Cough Syrup 100ml', genericName: 'Dextromethorphan', batchNo: 'B-103', stockQuantity: 14, unitPrice: 8.5, expiryDate: new Date('2026-11-30') },
      { organizationId: org.id, name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', batchNo: 'B-104', stockQuantity: 90, unitPrice: 6.0, expiryDate: new Date('2028-01-15') },
    ],
  });

  console.log('Seeding Billing & Invoices...');
  await prisma.billing.create({
    data: {
      organizationId: org.id,
      invoiceNo: 'INV-1001',
      appointmentId: appt1.id,
      consultationFee: 100,
      medicineCharges: 45,
      totalAmount: 145,
      paymentStatus: PayStatus.PAID,
      paymentMethod: 'Card',
    },
  });

  await prisma.billing.create({
    data: {
      organizationId: org.id,
      invoiceNo: 'INV-1002',
      appointmentId: appt2.id,
      consultationFee: 150,
      medicineCharges: 0,
      totalAmount: 150,
      paymentStatus: PayStatus.UNPAID,
      paymentMethod: 'Cash',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
