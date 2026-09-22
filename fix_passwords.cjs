const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function run() {
  // Fix dr.smith first
  const hash = await bcrypt.hash('password123', 10);
  
  // Update ALL users to have proper bcrypt hash for password123
  const emails = [
    'dr.smith@clinic.com', 'admin@clinic.com', 'reception@clinic.com',
    'pharmacy@clinic.com', 'billing@clinic.com', 'dr.anjali@clinic.com',
    'dr.vikram@clinic.com', 'dr.sneha@clinic.com'
  ];
  
  for (const email of emails) {
    await p.user.update({
      where: { email },
      data: { passwordHash: hash }
    });
    console.log(`✓ Updated: ${email}`);
  }
  
  console.log('\nAll users now have password: password123');
  p.$disconnect();
}
run();
