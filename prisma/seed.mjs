import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// ── Inline permission definitions (mirrors src/lib/rbac.ts) ──────────────────
const ALL_PERMISSIONS = [
  { key: 'appointment:create',   description: 'Create appointments',        category: 'appointment'  },
  { key: 'appointment:read',     description: 'View appointments',          category: 'appointment'  },
  { key: 'appointment:update',   description: 'Update appointments',        category: 'appointment'  },
  { key: 'appointment:delete',   description: 'Delete appointments',        category: 'appointment'  },
  { key: 'patient:create',       description: 'Register new patients',      category: 'patient'      },
  { key: 'patient:read',         description: 'View patient records',       category: 'patient'      },
  { key: 'patient:update',       description: 'Update patient records',     category: 'patient'      },
  { key: 'prescription:create',  description: 'Create prescriptions',       category: 'prescription' },
  { key: 'prescription:read',    description: 'View prescriptions',         category: 'prescription' },
  { key: 'bill:create',          description: 'Create bills',               category: 'billing'      },
  { key: 'bill:read',            description: 'View bills',                 category: 'billing'      },
  { key: 'bill:update',          description: 'Update billing status',      category: 'billing'      },
  { key: 'pharmacy:dispense',    description: 'Dispense medicines',         category: 'pharmacy'     },
  { key: 'pharmacy:inventory',   description: 'Manage inventory',           category: 'pharmacy'     },
  { key: 'report:read',          description: 'View reports',               category: 'reports'      },
  { key: 'report:export',        description: 'Export reports',             category: 'reports'      },
  { key: 'user:manage',          description: 'Manage staff',               category: 'admin'        },
  { key: 'settings:manage',      description: 'Manage org settings',        category: 'admin'        },
];

const ROLE_PERMISSIONS = {
  DOCTOR:        ['appointment:read','appointment:update','patient:read','patient:update','prescription:create','prescription:read','report:read'],
  RECEPTIONIST:  ['appointment:create','appointment:read','appointment:update','patient:create','patient:read','bill:read','bill:create','bill:update','report:read'],
  PHARMACIST:    ['pharmacy:dispense','pharmacy:inventory','appointment:read','patient:read','prescription:read'],
  ADMIN:         ['appointment:create','appointment:read','appointment:update','appointment:delete','patient:create','patient:read','patient:update','prescription:create','prescription:read','bill:create','bill:read','bill:update','pharmacy:dispense','pharmacy:inventory','report:read','report:export','user:manage','settings:manage'],
  SUPERADMIN:    ['appointment:create','appointment:read','appointment:update','appointment:delete','patient:create','patient:read','patient:update','prescription:create','prescription:read','bill:create','bill:read','bill:update','pharmacy:dispense','pharmacy:inventory','report:read','report:export','user:manage','settings:manage'],
  PATIENT:       ['appointment:read','bill:read','prescription:read'],
};


async function main() {
  console.log("Clearing existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.billing.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.patientVisit.deleteMany();
  await prisma.healthAppointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // ── Permissions ────────────────────────────────────────
  console.log("Seeding Permissions...");
  const createdPerms = {};
  for (const p of ALL_PERMISSIONS) {
    const perm = await prisma.permission.create({
      data: { key: p.key, description: p.description, category: p.category },
    });
    createdPerms[p.key] = perm.id;
  }

  // ── Role Permissions ────────────────────────────────────
  console.log("Seeding Role Permissions...");
  const roles = ["DOCTOR", "RECEPTIONIST", "PHARMACIST", "ADMIN", "SUPERADMIN", "PATIENT"];
  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role] || [];
    for (const permKey of perms) {
      const permId = createdPerms[permKey];
      if (permId) {
        await prisma.rolePermission.create({ data: { role, permissionId: permId } });
      }
    }
  }

  // ── Organization ───────────────────────────────────────
  console.log("Seeding Organization...");
  const org = await prisma.organization.create({
    data: {
      name: "City Care Hospital",
      domain: "citycare.businessos.co.in",
      address: "123 Health Avenue, Phase 1",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91-9876543210",
    },
  });

  // ── Users ──────────────────────────────────────────────
  console.log("Seeding Users...");
  const doctorSmith = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Dr. Smith",
      email: "dr.smith@clinic.com",
      passwordHash: "hashed_password_123",
      role: Role.DOCTOR,
      department: "Cardiology",
      phone: "+91-9876500001",
      specialization: "Cardiologist",
      registrationNo: "MED-12345",
      consultationFee: 500,
      availableDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      slotDuration: 15,
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Admin Boss",
      email: "admin@clinic.com",
      passwordHash: "hashed_password_123",
      role: Role.ADMIN,
      department: "Management",
      phone: "+91-9876500002",
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Alice Receptionist",
      email: "alice@clinic.com",
      passwordHash: "hashed_password_123",
      role: Role.RECEPTIONIST,
      department: "Front Desk",
      phone: "+91-9876500003",
    },
  });

  // ── Patient ────────────────────────────────────────────
  console.log("Seeding Patients...");
  const patientJohn = await prisma.patient.create({
    data: {
      organizationId: org.id,
      patientCode: "PAT-1001",
      name: "John Doe",
      phone: "123-456-7890",
      email: "john.doe@example.com",
      dob: new Date("1990-01-01"),
      gender: "Male",
      bloodGroup: "O+",
    },
  });

  // ── Appointment ────────────────────────────────────────
  const appt1 = await prisma.healthAppointment.create({
    data: {
      organizationId: org.id,
      patientId: patientJohn.id,
      doctorId: doctorSmith.id,
      appointmentDate: new Date(),
      timeSlot: "10:30 AM",
      status: "COMPLETED",
      fee: 500,
      isPaid: true,
    },
  });

  // ── Audit log entry ────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      userId: doctorSmith.id,
      orgId: org.id,
      action: "appointment:update",
      resource: "HealthAppointment",
      resourceId: appt1.id,
      after: { status: "COMPLETED" },
    },
  });

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
