const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
  const receptionist = await prisma.user.findFirst({ where: { role: 'RECEPTIONIST' } });
  
  console.log('Doctor:', doctor ? doctor.id : 'Not found');
  console.log('Receptionist:', receptionist ? receptionist.id : 'Not found');
}

main().catch(console.error).finally(() => prisma.$disconnect());
