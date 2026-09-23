import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Aarogya Clinic demo data...\n");

  // ═══════════════════════════════════════════════════
  // 0. RBAC PERMISSIONS (CRITICAL FOR APP TO WORK)
  // ═══════════════════════════════════════════════════
  const permissions = [
    { key: 'appointment:create', category: 'Appointment', description: 'Create appointments' },
    { key: 'appointment:read', category: 'Appointment', description: 'Read appointments' },
    { key: 'appointment:read:own', category: 'Appointment', description: 'Read own appointments' },
    { key: 'appointment:update', category: 'Appointment', description: 'Update appointments' },
    { key: 'appointment:delete', category: 'Appointment', description: 'Delete appointments' },
    { key: 'patient:create', category: 'Patient', description: 'Create patients' },
    { key: 'patient:read', category: 'Patient', description: 'Read patients' },
    { key: 'patient:update', category: 'Patient', description: 'Update patients' },
    { key: 'prescription:create', category: 'Prescription', description: 'Create prescriptions' },
    { key: 'prescription:read', category: 'Prescription', description: 'Read prescriptions' },
    { key: 'bill:create', category: 'Billing', description: 'Create bills' },
    { key: 'bill:read', category: 'Billing', description: 'Read bills' },
    { key: 'bill:read:own', category: 'Billing', description: 'Read own bills' },
    { key: 'bill:update', category: 'Billing', description: 'Update bills' },
    { key: 'pharmacy:dispense', category: 'Pharmacy', description: 'Dispense pharmacy items' },
    { key: 'pharmacy:inventory', category: 'Pharmacy', description: 'Manage pharmacy inventory' },
    { key: 'report:read', category: 'Report', description: 'Read reports' },
    { key: 'report:export', category: 'Report', description: 'Export reports' },
    { key: 'user:manage', category: 'Admin', description: 'Manage users' },
    { key: 'settings:manage', category: 'Admin', description: 'Manage settings' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p,
    });
  }

  const allPerms = await prisma.permission.findMany();
  const permMap = Object.fromEntries(allPerms.map((p) => [p.key, p.id]));

  const roleMappings = {
    DOCTOR: ['appointment:read:own', 'patient:read', 'prescription:create'],
    RECEPTIONIST: ['appointment:create', 'appointment:read', 'appointment:update', 'appointment:delete', 'patient:read', 'patient:create'],
    PHARMACIST: ['pharmacy:dispense', 'pharmacy:inventory'],
    ADMIN: permissions.map(p => p.key), // admin -> *
    PATIENT: ['appointment:read:own', 'bill:read:own'],
  };

  for (const [role, perms] of Object.entries(roleMappings)) {
    for (const pKey of perms) {
      if (!permMap[pKey]) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role,
            permissionId: permMap[pKey],
          },
        },
        update: {},
        create: {
          roleId: role,
          permissionId: permMap[pKey],
        },
      });
    }
  }

  // ═══════════════════════════════════════════════════
  // 1. ORGANIZATION
  // ═══════════════════════════════════════════════════
  const org = await prisma.organization.upsert({
    where: { domain: "aarogya.in" },
    update: {},
    create: {
      name: "Aarogya Multispeciality Clinic",
      domain: "aarogya.in",
      address: "Sector 18, Noida, Uttar Pradesh",
      phone: "+91 120 456 7890",
    },
  });
  console.log("✅ Organization:", org.name);

  // ═══════════════════════════════════════════════════
  // 2. PASSWORD HASHES
  // ═══════════════════════════════════════════════════
  const doctorHash = await bcrypt.hash("Aarogya@2024", 10);
  const receptionHash = await bcrypt.hash("Front@2024", 10);
  const pharmacyHash = await bcrypt.hash("Pharma@2024", 10);
  const adminHash = await bcrypt.hash("Admin@2024", 10);

  // ═══════════════════════════════════════════════════
  // 3. DOCTORS
  // ═══════════════════════════════════════════════════
  const doctorData = [
    {
      email: "ananya.sharma@aarogyaclinic.in",
      name: "Dr. Ananya Sharma",
      phone: "+91 98100 12345",
      specialization: "General Physician",
      license: "UP-MED-2015-45231",
      fee: 800,
    },
    {
      email: "rohan.mehta@aarogyaclinic.in",
      name: "Dr. Rohan Mehta",
      phone: "+91 98100 12346",
      specialization: "Orthopedic Surgeon",
      license: "UP-MED-2013-38941",
      fee: 1200,
    },
    {
      email: "priya.iyer@aarogyaclinic.in",
      name: "Dr. Priya Iyer",
      phone: "+91 98100 12347",
      specialization: "Pediatrician",
      license: "UP-MED-2016-51207",
      fee: 700,
    },
  ];

  const doctors = [];
  for (const doc of doctorData) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        email: doc.email,
        passwordHash: doctorHash,
        name: doc.name,
        role: "DOCTOR",
        phone: doc.phone,
        organizationId: org.id,
        specialization: doc.specialization,
        registrationNo: doc.license,
        consultationFee: doc.fee,
      },
    });
    doctors.push(user);
    console.log("✅ Doctor:", doc.name);
  }

  // ═══════════════════════════════════════════════════
  // 4. STAFF (Receptionist, Pharmacist, Admin)
  // ═══════════════════════════════════════════════════
  await prisma.user.upsert({
    where: { email: "kavita.nair@aarogyaclinic.in" },
    update: {},
    create: {
      email: "kavita.nair@aarogyaclinic.in",
      passwordHash: receptionHash,
      name: "Kavita Nair",
      role: "RECEPTIONIST",
      phone: "+91 98100 12348",
      organizationId: org.id,
    },
  });
  console.log("✅ Receptionist: Kavita Nair");

  await prisma.user.upsert({
    where: { email: "suresh.patel@aarogyaclinic.in" },
    update: {},
    create: {
      email: "suresh.patel@aarogyaclinic.in",
      passwordHash: pharmacyHash,
      name: "Suresh Patel",
      role: "PHARMACIST",
      phone: "+91 98100 12349",
      organizationId: org.id,
    },
  });
  console.log("✅ Pharmacist: Suresh Patel");

  await prisma.user.upsert({
    where: { email: "vikram.singh@aarogyaclinic.in" },
    update: {},
    create: {
      email: "vikram.singh@aarogyaclinic.in",
      passwordHash: adminHash,
      name: "Vikram Singh",
      role: "ADMIN",
      phone: "+91 98100 12350",
      organizationId: org.id,
    },
  });
  console.log("✅ Admin: Vikram Singh");

  // ═══════════════════════════════════════════════════
  // 5. PATIENTS
  // ═══════════════════════════════════════════════════
  const patientData = [
    {
      code: "AMC-2024-0147",
      name: "Rajesh Kumar",
      phone: "9876543210",
      email: "rajesh.kumar@gmail.com",
      dob: "1979-08-14",
      gender: "MALE",
      blood: "B+",
      address: "B-42, Sector 15, Noida",
      allergies: ["Penicillin"],
      conditions: ["Type 2 Diabetes", "Hypertension"],
    },
    {
      code: "AMC-2024-0148",
      name: "Meera Joshi",
      phone: "9876543211",
      email: "meera.joshi@gmail.com",
      dob: "1992-03-22",
      gender: "FEMALE",
      blood: "O+",
      address: "C-18, Sector 12, Noida",
      allergies: [],
      conditions: ["Hypothyroidism"],
    },
    {
      code: "AMC-2024-0149",
      name: "Arjun Verma",
      phone: "9876543212",
      email: "",
      dob: "2016-11-08",
      gender: "MALE",
      blood: "A+",
      address: "A-7, Sector 20, Noida",
      allergies: [],
      conditions: [],
    },
    {
      code: "AMC-2024-0150",
      name: "Sunita Reddy",
      phone: "9876543213",
      email: "sunita.reddy@gmail.com",
      dob: "1968-12-05",
      gender: "FEMALE",
      blood: "AB+",
      address: "D-11, Sector 22, Noida",
      allergies: ["Sulfa drugs"],
      conditions: ["Arthritis"],
    },
    {
      code: "AMC-2024-0151",
      name: "Amit Chauhan",
      phone: "9876543214",
      email: "amit.chauhan@gmail.com",
      dob: "1985-06-18",
      gender: "MALE",
      blood: "A-",
      address: "E-33, Sector 10, Noida",
      allergies: [],
      conditions: [],
    },
  ];

  const patients = [];
  for (const pt of patientData) {
    const patient = await prisma.patient.upsert({
      where: { 
        organizationId_patientCode: {
          organizationId: org.id,
          patientCode: pt.code
        }
      },
      update: {},
      create: {
        patientCode: pt.code,
        name: pt.name,
        phone: pt.phone,
        email: pt.email || null,
        dob: new Date(pt.dob),
        gender: pt.gender,
        bloodGroup: pt.blood,
        address: pt.address,
        allergies: pt.allergies,
        chronicConds: pt.conditions,
        organizationId: org.id,
      },
    });
    patients.push(patient);
    console.log("✅ Patient:", pt.name);
  }

  // ═══════════════════════════════════════════════════
  // 6. DOCTOR AVAILABILITY
  // ═══════════════════════════════════════════════════
  for (const doctor of doctors) {
    for (const day of [1, 2, 3, 4, 5, 6]) {
      const morning = await prisma.doctorAvailability.findFirst({
        where: { doctorId: doctor.id, dayOfWeek: day, startTime: "10:00" },
      });
      if (!morning) {
        await prisma.doctorAvailability.create({
          data: {
            doctorId: doctor.id,
            orgId: org.id,
            dayOfWeek: day,
            startTime: "10:00",
            endTime: "14:00",
            slotDuration: 15,
            isActive: true,
          },
        });
      }
    }
    console.log("✅ Availability set for:", doctor.name);
  }

  // ═══════════════════════════════════════════════════
  // 7. TODAY'S APPOINTMENTS
  // ═══════════════════════════════════════════════════
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const makeTime = (h, m = 0) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d;
  };

  await prisma.healthAppointment.deleteMany({
    where: {
      organizationId: org.id,
      appointmentDate: { gte: today },
    },
  });

  const appointments = [
    { patient: patients[0], doctor: doctors[0], time: makeTime(10, 0), status: "SCHEDULED" },
    { patient: patients[1], doctor: doctors[0], time: makeTime(10, 30), status: "SCHEDULED" },
    { patient: patients[2], doctor: doctors[0], time: makeTime(11, 0), status: "ARRIVED" },
    { patient: patients[3], doctor: doctors[0], time: makeTime(11, 30), status: "IN_CONSULTATION" },
    { patient: patients[4], doctor: doctors[0], time: makeTime(12, 0), status: "COMPLETED" },
    { patient: patients[0], doctor: doctors[1], time: makeTime(10, 15), status: "SCHEDULED" },
    { patient: patients[2], doctor: doctors[2], time: makeTime(10, 45), status: "ARRIVED" },
  ];

  for (const apt of appointments) {
    await prisma.healthAppointment.create({
      data: {
        organizationId: org.id,
        patientId: apt.patient.id,
        doctorId: apt.doctor.id,
        appointmentDate: apt.time,
        timeSlot: apt.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: apt.status,
      },
    });
  }
  console.log(`✅ Created ${appointments.length} appointments for today`);

  // ═══════════════════════════════════════════════════
  // 8. PHARMACY INVENTORY
  // ═══════════════════════════════════════════════════
  const inventory = [
    { name: "Paracetamol 500mg", batch: "PCM2408A", qty: 850, price: 2.5, reorder: 200 },
    { name: "Cetirizine 10mg", batch: "CTZ2407B", qty: 42, price: 3.0, reorder: 100 },
    { name: "Amoxicillin 500mg", batch: "AMX2406C", qty: 380, price: 8.5, reorder: 150 },
    { name: "Metformin 500mg", batch: "MET2405D", qty: 620, price: 4.0, reorder: 200 },
    { name: "Amlodipine 5mg", batch: "AML2409E", qty: 78, price: 5.5, reorder: 150 },
    { name: "Pantoprazole 40mg", batch: "PAN2404F", qty: 340, price: 6.0, reorder: 100 },
    { name: "Azithromycin 500mg", batch: "AZI2408G", qty: 190, price: 18.0, reorder: 100 },
    { name: "ORS Sachet", batch: "ORS2409H", qty: 25, price: 15.0, reorder: 50 },
  ];

  for (const item of inventory) {
    const existing = await prisma.medicine.findFirst({
      where: { batchNo: item.batch, organizationId: org.id },
    });
    if (existing) {
      await prisma.medicine.update({
        where: { id: existing.id },
        data: { stockQuantity: item.qty },
      });
    } else {
      await prisma.medicine.create({
        data: {
          organizationId: org.id,
          name: item.name,
          batchNo: item.batch,
          stockQuantity: item.qty,
          unitPrice: item.price,
          reorderThreshold: item.reorder,
          expiryDate: new Date("2027-06-30"),
        },
      });
    }
  }
  console.log(`✅ Inventory: ${inventory.length} medicines`);

  // ═══════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════
  console.log("\n" + "=".repeat(60));
  console.log("✅ Aarogya Clinic seeded successfully!");
  console.log("=".repeat(60));
  console.log("\n📋 LOGIN CREDENTIALS:\n");
  console.log("   Doctor:       ananya.sharma@aarogyaclinic.in / Aarogya@2024");
  console.log("   Receptionist: kavita.nair@aarogyaclinic.in / Front@2024");
  console.log("   Pharmacist:   suresh.patel@aarogyaclinic.in / Pharma@2024");
  console.log("   Admin:        vikram.singh@aarogyaclinic.in / Admin@2024");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
