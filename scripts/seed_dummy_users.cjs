const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usersToSeed = [
    { email: 'dr.smith@clinic.com', role: 'DOCTOR', name: 'Dr. Smith', passwordHash: 'hashed_password_123' },
    { email: 'reception@clinic.com', role: 'RECEPTIONIST', name: 'Receptionist Jane', passwordHash: 'hashed_password_123' },
    { email: 'admin@clinic.com', role: 'ADMIN', name: 'Admin', passwordHash: 'hashed_password_123' },
    { email: 'pharmacy@clinic.com', role: 'PHARMACIST', name: 'Pharmacist', passwordHash: 'hashed_password_123' },
    { email: 'billing@clinic.com', role: 'ACCOUNTANT', name: 'Cashier', passwordHash: 'hashed_password_123' },
  ];

  // We need an organization for them, grab the first one or create one
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'Aarogya Clinic', subdomain: 'aarogya' }
    });
  }

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, name: u.name, passwordHash: u.passwordHash, organizationId: org.id },
      create: { 
        email: u.email, 
        role: u.role, 
        name: u.name, 
        passwordHash: u.passwordHash,
        organizationId: org.id
      }
    });
  }
  
  console.log("Successfully seeded UI dummy users into DB.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
