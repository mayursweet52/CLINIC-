const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { key: '*', description: 'All access' },
    { key: 'appointment:read', description: 'Read appointments' },
    { key: 'appointment:write', description: 'Create/Edit appointments' },
    { key: 'patient:read', description: 'Read patient records' },
    { key: 'patient:write', description: 'Create/Edit patient records' },
    { key: 'user:manage', description: 'Manage staff and users' },
    { key: 'billing:read', description: 'Read invoices and billing' },
    { key: 'billing:write', description: 'Create invoices and payments' },
    { key: 'inventory:read', description: 'Read pharmacy inventory' },
    { key: 'inventory:write', description: 'Manage pharmacy inventory' }
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { description: p.description },
      create: p
    });
  }

  const roleMappings = [
    { role: 'DOCTOR', perms: ['appointment:read', 'appointment:write', 'patient:read', 'patient:write'] },
    { role: 'RECEPTIONIST', perms: ['appointment:read', 'appointment:write', 'patient:read', 'patient:write', 'billing:read'] },
    { role: 'PHARMACIST', perms: ['inventory:read', 'inventory:write', 'patient:read'] },
    { role: 'ACCOUNTANT', perms: ['billing:read', 'billing:write', 'patient:read'] },
    { role: 'ADMIN', perms: ['*'] }
  ];

  for (const rm of roleMappings) {
    for (const permKey of rm.perms) {
      const p = await prisma.permission.findUnique({ where: { key: permKey } });
      if (p) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: rm.role, permissionId: p.id } },
          update: {},
          create: { roleId: rm.role, permissionId: p.id }
        });
      }
    }
  }

  console.log("RBAC seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
