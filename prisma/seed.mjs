import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ClinicOS enterprise data...\n");

  // ═══════════════════════════════════════════════════
  // 1. SUPERADMIN (Platform Owner)
  // ═══════════════════════════════════════════════════
  const superadminPassword = await bcrypt.hash("SuperAdmin@2024", 10);
  
  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@clinicos.in" },
    update: {},
    create: {
      email: "superadmin@clinicos.in",
      passwordHash: superadminPassword,
      name: "Platform Admin",
      role: "SUPERADMIN",
      phone: "+91 99999 00000",
      organizationId: null, // Superadmin not tied to any org
    },
  });
  console.log("✅ SuperAdmin:", superadmin.email);

  // ═══════════════════════════════════════════════════
  // 2. AAROGYA ORGANIZATION (Primary Demo Clinic)
  // ═══════════════════════════════════════════════════
  const org = await prisma.organization.upsert({
    where: { slug: "aarogya-noida" },
    update: {
      name: "Aarogya Multispeciality Clinic",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
      address: "Sector 18, Noida, Uttar Pradesh",
      phone: "+91 120 456 7890",
      rating: 4.5,
      totalReviews: 124,
      isActive: true,
    },
    create: {
      name: "Aarogya Multispeciality Clinic",
      slug: "aarogya-noida",
      // Removed plan and settings as they aren't in schema
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
      address: "Sector 18, Noida, Uttar Pradesh",
      phone: "+91 120 456 7890",
      rating: 4.5,
      totalReviews: 124,
      isActive: true,
    },
  });
  console.log("✅ Organization:", org.name);

  // ═══════════════════════════════════════════════════
  // 3. DEPARTMENTS (4)
  // ═══════════════════════════════════════════════════
  const departmentData = [
    { name: "General Medicine", slug: "general-medicine", icon: "🩺", order: 1 },
    { name: "Orthopedics", slug: "orthopedics", icon: "🦴", order: 2 },
    { name: "Cardiology", slug: "cardiology", icon: "❤️", order: 3 },
    { name: "Pediatrics", slug: "pediatrics", icon: "👶", order: 4 },
  ];

  const departments = {};
  for (const dept of departmentData) {
    const created = await prisma.department.upsert({
      where: { 
        organizationId_slug: { 
          organizationId: org.id, 
          slug: dept.slug 
        } 
      },
      update: { name: dept.name, icon: dept.icon, order: dept.order },
      create: {
        organizationId: org.id,
        name: dept.name,
        slug: dept.slug,
        icon: dept.icon,
        order: dept.order,
        isActive: true,
      },
    });
    departments[dept.slug] = created;
  }
  console.log("✅ Departments:", Object.keys(departments).length);

  // ═══════════════════════════════════════════════════
  // 4. CONDITIONS (3 per department = 12 total)
  // ═══════════════════════════════════════════════════
  const conditionsData = {
    "general-medicine": [
      { name: "Fever, cold, cough", slug: "fever-cold-cough", icon: "🤒", keywords: ["fever", "cold", "cough", "flu"] },
      { name: "General checkup", slug: "general-checkup", icon: "🩺", keywords: ["checkup", "routine", "annual"] },
      { name: "Diabetes follow-up", slug: "diabetes-followup", icon: "💉", keywords: ["diabetes", "sugar", "glucose"] },
    ],
    "orthopedics": [
      { name: "Knee pain", slug: "knee-pain", icon: "🦵", keywords: ["knee", "joint", "leg"] },
      { name: "Back pain", slug: "back-pain", icon: "🦴", keywords: ["back", "spine", "lumbar"] },
      { name: "Fracture", slug: "fracture", icon: "🩹", keywords: ["fracture", "broken", "bone"] },
    ],
    "cardiology": [
      { name: "Chest pain", slug: "chest-pain", icon: "💔", keywords: ["chest", "heart", "angina"] },
      { name: "High BP", slug: "high-bp", icon: "🩸", keywords: ["bp", "blood pressure", "hypertension"] },
      { name: "Heart checkup", slug: "heart-checkup", icon: "❤️", keywords: ["heart", "cardiac", "ecg"] },
    ],
    "pediatrics": [
      { name: "Vaccination", slug: "vaccination", icon: "💉", keywords: ["vaccine", "immunization"] },
      { name: "Child fever", slug: "child-fever", icon: "🤒", keywords: ["child", "baby", "fever"] },
      { name: "Growth checkup", slug: "growth-checkup", icon: "📏", keywords: ["growth", "development"] },
    ],
  };

  let conditionCount = 0;
  for (const [deptSlug, conditions] of Object.entries(conditionsData)) {
    const dept = departments[deptSlug];
    for (const cond of conditions) {
      await prisma.condition.upsert({
        where: { 
          departmentId_slug: { 
            departmentId: dept.id, 
            slug: cond.slug 
          } 
        },
        update: { name: cond.name, icon: cond.icon, keywords: cond.keywords },
        create: {
          departmentId: dept.id,
          name: cond.name,
          slug: cond.slug,
          icon: cond.icon,
          keywords: cond.keywords,
        },
      });
      conditionCount++;
    }
  }
  console.log("✅ Conditions:", conditionCount);

  // ═══════════════════════════════════════════════════
  // 5. STAFF USERS
  // ═══════════════════════════════════════════════════
  const doctorHash = await bcrypt.hash("Aarogya@2024", 10);
  const receptionHash = await bcrypt.hash("Front@2024", 10);
  const pharmacyHash = await bcrypt.hash("Pharma@2024", 10);
  const adminHash = await bcrypt.hash("Admin@2024", 10);

  // Doctors
  const doctorsData = [
    {
      email: "ananya.sharma@aarogyaclinic.in",
      name: "Dr. Ananya Sharma",
      phone: "+91 98100 12345",
      bio: "MBBS, MD (General Medicine) · 10 years experience",
      yearsOfExperience: 10,
      averageRating: 4.8,
      totalReviews: 87,
      departmentSlugs: ["general-medicine"],
      profile: {
        specialization: "General Physician",
        licenseNumber: "UP-MED-2015-45231",
        consultationFee: 800,
      },
    },
    {
      email: "rohan.mehta@aarogyaclinic.in",
      name: "Dr. Rohan Mehta",
      phone: "+91 98100 12346",
      bio: "MBBS, MS (Orthopedics) · 12 years experience",
      yearsOfExperience: 12,
      averageRating: 4.7,
      totalReviews: 102,
      departmentSlugs: ["orthopedics"],
      profile: {
        specialization: "Orthopedic Surgeon",
        licenseNumber: "UP-MED-2013-38941",
        consultationFee: 1200,
      },
    },
    {
      email: "priya.iyer@aarogyaclinic.in",
      name: "Dr. Priya Iyer",
      phone: "+91 98100 12347",
      bio: "MBBS, MD (Pediatrics) · 8 years experience",
      yearsOfExperience: 8,
      averageRating: 4.9,
      totalReviews: 76,
      departmentSlugs: ["pediatrics"],
      profile: {
        specialization: "Pediatrician",
        licenseNumber: "UP-MED-2016-51207",
        consultationFee: 700,
      },
    },
  ];

  for (const doc of doctorsData) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {
        bio: doc.bio,
        yearsOfExperience: doc.yearsOfExperience,
        averageRating: doc.averageRating,
        totalReviews: doc.totalReviews,
      },
      create: {
        email: doc.email,
        passwordHash: doctorHash,
        name: doc.name,
        role: "DOCTOR",
        phone: doc.phone,
        organizationId: org.id,
        bio: doc.bio,
        yearsOfExperience: doc.yearsOfExperience,
        averageRating: doc.averageRating,
        totalReviews: doc.totalReviews,
        specialization: doc.profile.specialization,
        registrationNo: doc.profile.licenseNumber,
        consultationFee: doc.profile.consultationFee,
      },
    });

    // Assign to departments
    for (const deptSlug of doc.departmentSlugs) {
      const dept = departments[deptSlug];
      await prisma.doctorDepartment.upsert({
        where: { 
          doctorId_departmentId: { 
            doctorId: user.id, 
            departmentId: dept.id 
          } 
        },
        update: {},
        create: {
          doctorId: user.id,
          departmentId: dept.id,
        },
      });
    }

    console.log("✅ Doctor:", doc.name);
  }

  // Receptionist
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

  // Pharmacist
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

  // Admin
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
  // 6. PATIENTS
  // ═══════════════════════════════════════════════════
  const patientHash = await bcrypt.hash("Patient@123", 10);

  const patientsData = [
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

  for (const pt of patientsData) {
    await prisma.patient.upsert({
      where: { organizationId_patientCode: { organizationId: org.id, patientCode: pt.code } },
      update: { passwordHash: patientHash },
      create: {
        patientCode: pt.code,
        name: pt.name,
        phone: pt.phone,
        email: pt.email || null,
        passwordHash: patientHash,
        dob: new Date(pt.dob),
        gender: pt.gender,
        bloodGroup: pt.blood,
        address: pt.address,
        allergies: pt.allergies,
        chronicConds: pt.conditions,
        organizationId: org.id,
      },
    });
  }
  console.log("✅ Patients:", patientsData.length);

  // ═══════════════════════════════════════════════════
  // 7. DOCTOR AVAILABILITY
  // ═══════════════════════════════════════════════════
  const allDoctors = await prisma.user.findMany({
    where: { role: "DOCTOR", organizationId: org.id },
  });

  for (const doctor of allDoctors) {
    // Check if availability already exists
    const existing = await prisma.doctorAvailability.findFirst({
      where: { doctorId: doctor.id },
    });
    if (existing) continue;

    // Mon-Sat: 10-2
    for (const day of [1, 2, 3, 4, 5, 6]) {
      await prisma.doctorAvailability.create({
        data: {
          orgId: org.id,
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "14:00",
          slotDuration: 15,
          isActive: true,
        },
      });
    }
  }
  console.log("✅ Doctor availability set");

  // ═══════════════════════════════════════════════════
  // 8. INVENTORY
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
  console.log("✅ Inventory:", inventory.length);

  // ═══════════════════════════════════════════════════
  // 9. TODAY'S APPOINTMENTS
  // ═══════════════════════════════════════════════════
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const makeTime = (h, m = 0) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d;
  };

  // Clear today's old appointments
  await prisma.healthAppointment.deleteMany({
    where: {
      organizationId: org.id,
      appointmentDate: { gte: today },
    },
  });

  const allPatients = await prisma.patient.findMany({
    where: { organizationId: org.id },
    take: 5,
  });

  const ananya = allDoctors.find(d => d.email.includes("ananya"));
  const rohan = allDoctors.find(d => d.email.includes("rohan"));
  const priya = allDoctors.find(d => d.email.includes("priya"));

  if (ananya && rohan && priya && allPatients.length >= 3) {
    const appointments = [
      { patient: allPatients[0], doctor: ananya, time: makeTime(10, 0), status: "SCHEDULED", token: "Q-001", reason: "Diabetes follow-up" },
      { patient: allPatients[1], doctor: ananya, time: makeTime(10, 30), status: "SCHEDULED", token: "Q-002", reason: "Thyroid review" },
      { patient: allPatients[2], doctor: ananya, time: makeTime(11, 0), status: "ARRIVED", token: "Q-003", reason: "Fever and cold" },
      { patient: allPatients[0], doctor: rohan, time: makeTime(10, 15), status: "SCHEDULED", token: "Q-004", reason: "Knee pain" },
      { patient: allPatients[2], doctor: priya, time: makeTime(10, 45), status: "ARRIVED", token: "Q-005", reason: "Vaccination" },
    ];

    let counter = 1;
    for (const apt of appointments) {
      await prisma.healthAppointment.create({
        data: {
          organizationId: org.id,
          patientId: apt.patient.id,
          doctorId: apt.doctor.id,
          appointmentDate: apt.time,
          status: apt.status,
          timeSlot: "10:00",
          tokenNumber: counter,
          tokenDisplay: apt.token,
          publicToken: `tok-${Date.now()}-${counter}`,
        },
      });
      counter++;
    }
    console.log("✅ Appointments:", appointments.length);
  }

  // ═══════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════
  console.log("\n" + "=".repeat(60));
  console.log("✅ ClinicOS enterprise seed complete!");
  console.log("=".repeat(60));
  console.log("\n📋 LOGIN CREDENTIALS:\n");
  console.log("   SUPERADMIN:   superadmin@clinicos.in / SuperAdmin@2024");
  console.log("   Doctor:       ananya.sharma@aarogyaclinic.in / Aarogya@2024");
  console.log("   Doctor 2:     rohan.mehta@aarogyaclinic.in / Aarogya@2024");
  console.log("   Doctor 3:     priya.iyer@aarogyaclinic.in / Aarogya@2024");
  console.log("   Receptionist: kavita.nair@aarogyaclinic.in / Front@2024");
  console.log("   Pharmacist:   suresh.patel@aarogyaclinic.in / Pharma@2024");
  console.log("   Admin:        vikram.singh@aarogyaclinic.in / Admin@2024");
  console.log("   Patient:      9876543210 / Patient@123");
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
