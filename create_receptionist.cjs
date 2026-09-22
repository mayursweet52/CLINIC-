const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst();
  let receptionist = await prisma.user.findFirst({ where: { role: 'RECEPTIONIST' } });
  
  if (!receptionist) {
    receptionist = await prisma.user.create({
      data: {
        email: 'reception@clinic.com',
        passwordHash: 'hash',
        name: 'Receptionist Jane',
        role: 'RECEPTIONIST',
        organizationId: org.id
      }
    });
  }
  console.log('Receptionist ID:', receptionist.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
