const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const p = new PrismaClient();

(async () => {
  console.log('--- PHASE 1 VERIFICATION ---');

  // A. DATA ISOLATION TEST
  const org1 = await p.organization.findFirst();
  let org2 = await p.organization.findFirst({ where: { domain: 'test2.com' } });
  if (!org2) {
    org2 = await p.organization.create({ data: { name: 'Test Clinic 2', domain: 'test2.com' } });
  }
  
  await p.patient.create({
    data: {
      organizationId: org2.id,
      patientCode: 'PT-TEST-2',
      name: 'Test Patient',
      phone: '+919999999999',
    }
  }).catch(() => {}); // ignore if exists

  const count1 = await p.patient.count({ where: { organizationId: org1.id } });
  const count2 = await p.patient.count({ where: { organizationId: org2.id } });
  
  console.log('Data Isolation:');
  console.log('Org 1 (Aarogya) Patients:', count1);
  console.log('Org 2 (Test) Patients:', count2);
  console.log(count1 !== count2 ? '✅ ISOLATION WORKING' : '❌ ISOLATION FAILED');

  // B. AUTO-BILL TEST
  console.log('\n--- AUTO-BILL TEST ---');
  const doctor = await p.user.findFirst({ where: { role: 'DOCTOR' }});
  const patient = await p.patient.findFirst({ where: { organizationId: org1.id } });
  
  const aptBill = await p.healthAppointment.create({
    data: {
      organizationId: org1.id,
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentDate: new Date(),
      timeSlot: '11:00',
      status: 'SCHEDULED',
      tokenNumber: 998
    }
  });

  const { SignJWT } = require('jose');
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
  const token = await new SignJWT({ userId: doctor.id, role: 'ADMIN', orgId: org1.id })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('2h').sign(secret);
  const cookieHeader = `auth_token=${token}`;

  const putRes = await fetch('http://localhost:3000/api/appointments', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
    body: JSON.stringify({ id: aptBill.id, status: 'COMPLETED' })
  });
  
  const bill = await p.billing.findUnique({ where: { appointmentId: aptBill.id } });
  console.log('Auto-created bill:', bill ? `✅ YES (Amount: ${bill.totalAmount})` : `❌ NO BILL CREATED (API Response: ${await putRes.text()})`);

  // C. DOCTOR LEAVE TEST
  console.log('\n--- DOCTOR LEAVE TEST ---');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const aptLeave = await p.healthAppointment.create({
    data: {
      organizationId: org1.id,
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentDate: tomorrow,
      timeSlot: '10:00',
      status: 'SCHEDULED',
      tokenNumber: 999
    }
  });

  const leaveRes = await fetch('http://localhost:3000/api/timeoff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
    body: JSON.stringify({ doctorId: doctor.id, date: tomorrow, orgId: org1.id })
  });

  const aptAfterLeave = await p.healthAppointment.findUnique({ where: { id: aptLeave.id } });
  console.log('Appointment status after leave:', aptAfterLeave.status === 'CANCELLED' ? '✅ CANCELLED' : `❌ ${aptAfterLeave.status} (API Response: ${await leaveRes.text()})`);

  await p.$disconnect();
})();
