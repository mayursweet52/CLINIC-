const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst();
  const doctor = await prisma.user.findUnique({ where: { id: 'doc-1' } });
  
  if (!doctor) {
    console.log('Doctor not found');
    return;
  }
  
  // Seed for all 7 days
  for (let i = 0; i <= 6; i++) {
    await prisma.doctorAvailability.upsert({
      where: {
        doctorId_dayOfWeek: {
          doctorId: 'doc-1',
          dayOfWeek: i
        }
      },
      update: {
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 15
      },
      create: {
        doctorId: 'doc-1',
        dayOfWeek: i,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 15,
        orgId: org.id
      }
    });
  }
  
  console.log('Availability seeded for doc-1');
}

main().catch(console.error).finally(() => prisma.$disconnect());
