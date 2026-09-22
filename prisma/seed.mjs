import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  // Upsert permissions
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p,
    });
  }

  // Get all permissions to map IDs
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

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
