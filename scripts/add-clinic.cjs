const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addClinic(name, email, password, phone) {
  console.log(`\n🏥 Creating clinic: ${name}\n`);

  // 1. Create organization
  const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.local';
  
  const org = await prisma.organization.create({
    data: {
      name,
      domain,
      phone,
    },
  });
  console.log(`✅ Organization created: ${org.name} (${org.id})`);

  // 2. Create admin user
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: `${name} Admin`,
      role: 'ADMIN',
      phone,
      organizationId: org.id,
    },
  });
  console.log(`✅ Admin created: ${user.email}`);
  


  console.log(`\n🎉 Done! Login at: http://localhost:3000/login`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('');
}

const [,, name, email, password, phone] = process.argv;

if (!name || !email || !password) {
  console.log('Usage: node scripts/add-clinic.cjs "Clinic Name" "email" "password" "phone"');
  console.log('Example: node scripts/add-clinic.cjs "City Clinic" "admin@cityclinic.com" "Welcome@123" "+91 98765 43210"');
  process.exit(1);
}

addClinic(name, email, password, phone || '')
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
