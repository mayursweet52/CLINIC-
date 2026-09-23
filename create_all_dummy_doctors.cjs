const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('password123', 10);
  
  // Org check
  let org = await p.organization.findFirst();
  if (!org) {
    org = await p.organization.create({ data: { name: 'Aarogya Clinic', slug: 'aarogya' } });
  }

  const allDummyDoctors = [
    // Previous ones
    { name: 'Dr. John Smith', email: 'dr.smith@clinic.com', department: 'Cardiology' },
    { name: 'Dr. Anjali Sharma', email: 'dr.anjali@clinic.com', department: 'Neurology' },
    { name: 'Dr. Vikram Singh', email: 'dr.vikram@clinic.com', department: 'General Medicine' },
    { name: 'Dr. Sneha Patel', email: 'dr.sneha@clinic.com', department: 'Pediatrics' },
    { name: 'Dr. Rahul Verma', email: 'dr.rahul@clinic.com', department: 'Orthopedics' },
    { name: 'Dr. Priya Desai', email: 'dr.priya@clinic.com', department: 'Dermatology' },
    // Frontend hardcoded mock ones
    { name: 'Dr. Sarah Smith', email: 'dr.sarah@clinic.com', department: 'Cardiology' },
    { name: 'Dr. John Doe', email: 'dr.john@clinic.com', department: 'Cardiology' },
  ];

  console.log("=== Setting up ALL Dummy Doctor IDs ===\n");

  for (const doc of allDummyDoctors) {
    let user = await p.user.findUnique({ where: { email: doc.email } });
    if (!user) {
      user = await p.user.create({
        data: {
          name: doc.name,
          email: doc.email,
          passwordHash: hash,
          role: 'DOCTOR',
          department: doc.department,
          organizationId: org.id
        }
      });
      console.log(`[CREATED] ${doc.name} (${doc.department}) -> ${doc.email}`);
    } else {
      await p.user.update({
        where: { email: doc.email },
        data: { passwordHash: hash, department: doc.department, role: 'DOCTOR' }
      });
      console.log(`[UPDATED] ${doc.name} (${doc.department}) -> ${doc.email}`);
    }
  }
  
  console.log("\nPassword for ALL doctors is: password123");
  p.$disconnect();
}
run();
