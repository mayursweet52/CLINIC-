const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  console.log('\n🔍 LOGICAL AUDIT\n');
  
  // 1. Multi-tenant check
  const orgs = await prisma.organization.findMany();
  console.log('Organizations:', orgs.length);
  
  for (const org of orgs) {
    const patients = await prisma.patient.count({ where: { organizationId: org.id } });
    const appts = await prisma.healthAppointment.count({ where: { organizationId: org.id } });
    const users = await prisma.user.count({ where: { organizationId: org.id } });
    console.log(`  ${org.name}: ${users} users, ${patients} patients, ${appts} appointments`);
  }
  
  // 2. Orphan appointments (no patient link?) - Not possible in schema
  console.log('\n⚠️ Appointments without patientId: 0 (Schema enforces patientId)');
  
  // 3. Orphan prescriptions - Not possible in schema
  console.log('⚠️ Prescriptions without patientId: 0 (Schema enforces patientId)');
  
  // 4. Duplicate patient phones in same org
  const dups = await prisma.$queryRaw`
    SELECT phone, "organizationId", COUNT(*) as count
    FROM "Patient"
    GROUP BY phone, "organizationId"
    HAVING COUNT(*) > 1
  `;
  console.log('\n⚠️ Duplicate patient phones:', dups.length);
  
  // 5. Patients without passwordHash (registered?)
  const noPassword = await prisma.patient.count({
    where: { passwordHash: null }
  });
  console.log('⚠️ Patients without portal password:', noPassword);
  
  // 6. Today's appointments status breakdown
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAppts = await prisma.healthAppointment.groupBy({
    by: ['status'],
    where: { appointmentDate: { gte: today } },
    _count: true,
  });
  console.log('\nToday\'s appointments:');
  todayAppts.forEach(t => console.log(`  ${t.status}: ${t._count}`));
  
  // 7. Doctor with no availability
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    select: { id: true, name: true },
  });
  for (const doc of doctors) {
    const avail = await prisma.doctorAvailability.count({
      where: { doctorId: doc.id }
    });
    if (avail === 0) {
      console.log(`⚠️ Doctor ${doc.name} has NO availability slots`);
    }
  }
  
  await prisma.$disconnect();
}

audit().catch(console.error);
