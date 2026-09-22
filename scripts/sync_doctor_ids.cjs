const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usersToSeed = [
    { id: 'doc-1', email: 'dr.smith@clinic.com', role: 'DOCTOR', name: 'Dr. Rajesh Sharma', department: 'Cardiology', passwordHash: 'hashed_password_123' },
    { id: 'doc-2', email: 'dr.anjali@clinic.com', role: 'DOCTOR', name: 'Dr. Anjali Patil', department: 'General Medicine', passwordHash: 'hashed_password_123' },
    { id: 'doc-3', email: 'dr.vikram@clinic.com', role: 'DOCTOR', name: 'Dr. Vikram Kulkarni', department: 'Orthopedics', passwordHash: 'hashed_password_123' },
    { id: 'doc-4', email: 'dr.sneha@clinic.com', role: 'DOCTOR', name: 'Dr. Sneha Deshmukh', department: 'Pediatrics', passwordHash: 'hashed_password_123' },
    { id: 'reception-1', email: 'reception@clinic.com', role: 'RECEPTIONIST', name: 'Receptionist Jane', passwordHash: 'hashed_password_123' },
    { id: 'admin-1', email: 'admin@clinic.com', role: 'ADMIN', name: 'Admin', passwordHash: 'hashed_password_123' },
    { id: 'pharmacy-1', email: 'pharmacy@clinic.com', role: 'PHARMACIST', name: 'Pharmacist', passwordHash: 'hashed_password_123' },
    { id: 'billing-1', email: 'billing@clinic.com', role: 'ACCOUNTANT', name: 'Cashier', passwordHash: 'hashed_password_123' },
  ];

  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'City Care Super Multi-Speciality Hospital', subdomain: 'citycare' }
    });
  }

  // Ensure these specific IDs and emails match perfectly
  for (const u of usersToSeed) {
    try {
      await prisma.user.upsert({
        where: { email: u.email },
        update: { 
          id: u.id, 
          role: u.role, 
          name: u.name, 
          department: u.department || null,
          passwordHash: u.passwordHash, 
          organizationId: org.id 
        },
        create: { 
          id: u.id,
          email: u.email, 
          role: u.role, 
          name: u.name, 
          department: u.department || null,
          passwordHash: u.passwordHash,
          organizationId: org.id
        }
      });
      console.log(`Seeded ${u.name} with ID ${u.id}`);
    } catch(err) {
      console.log(`Error seeding ${u.email}:`, err.message);
      // Sometimes updating ID is not allowed in prisma upsert, let's try raw SQL or delete/recreate
      if (err.message.includes('id')) {
        await prisma.user.deleteMany({ where: { email: u.email } });
        await prisma.user.create({
          data: {
            id: u.id,
            email: u.email, 
            role: u.role, 
            name: u.name, 
            department: u.department || null,
            passwordHash: u.passwordHash,
            organizationId: org.id
          }
        });
        console.log(`Re-created ${u.name} with ID ${u.id}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
