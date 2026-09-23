import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/withPermission';
import { redis } from '@/lib/redis';

function getStartDate(range: string) {
  const now = new Date();
  switch (range) {
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '90d':
      now.setDate(now.getDate() - 90);
      break;
    case '1y':
      now.setFullYear(now.getFullYear() - 1);
      break;
    case '30d':
    default:
      now.setDate(now.getDate() - 30);
      break;
  }
  now.setHours(0, 0, 0, 0);
  return now;
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export const GET = withPermission('report:read', async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const orgId = (request as any).user?.orgId;

    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cacheKey = `analytics:${orgId}:${range}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const startDate = getStartDate(range);

    const whereOrg = { organizationId: orgId };
    const whereOrgAndDate = { organizationId: orgId, createdAt: { gte: startDate } };
    const whereApptDate = { organizationId: orgId, appointmentDate: { gte: startDate } };

    // 1. Revenue
    const bills = await prisma.billing.findMany({
      where: { ...whereOrgAndDate, paymentStatus: 'PAID' },
      select: { totalAmount: true, paymentMethod: true, paidAt: true, createdAt: true },
    });

    const revenueByMethod: Record<string, number> = { razorpay: 0, cash: 0, card: 0 };
    const revenueByDayMap: Record<string, number> = {};
    let totalRevenue = 0;

    bills.forEach(b => {
      totalRevenue += b.totalAmount;
      const method = (b.paymentMethod || 'cash').toLowerCase();
      revenueByMethod[method] = (revenueByMethod[method] || 0) + b.totalAmount;

      const dateStr = formatDate(b.paidAt || b.createdAt);
      revenueByDayMap[dateStr] = (revenueByDayMap[dateStr] || 0) + b.totalAmount;
    });

    const revenueByDay = Object.keys(revenueByDayMap).sort().map(date => ({
      date,
      amount: revenueByDayMap[date]
    }));

    // 2. Appointments
    const appointments = await prisma.healthAppointment.findMany({
      where: whereApptDate,
      select: { status: true, appointmentDate: true },
    });

    let totalAppts = 0;
    const apptByStatus: Record<string, number> = { SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0 };
    const apptByDayMap: Record<string, number> = {};

    appointments.forEach(a => {
      totalAppts++;
      apptByStatus[a.status] = (apptByStatus[a.status] || 0) + 1;
      
      const dateStr = formatDate(a.appointmentDate);
      apptByDayMap[dateStr] = (apptByDayMap[dateStr] || 0) + 1;
    });

    const apptByDay = Object.keys(apptByDayMap).sort().map(date => ({
      date,
      count: apptByDayMap[date]
    }));

    // 3. Patients
    const totalPatients = await prisma.patient.count({ where: whereOrg });
    const newPatients = await prisma.patient.count({ where: whereOrgAndDate });
    const returningPatients = Math.max(0, totalPatients - newPatients);

    // 4. Doctors
    const doctorsData = await prisma.user.findMany({
      where: { ...whereOrg, role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        appointments: {
          where: { appointmentDate: { gte: startDate } },
          select: {
            id: true,
            billing: {
              where: { paymentStatus: 'PAID' },
              select: { totalAmount: true }
            }
          }
        }
      }
    });

    const doctors = doctorsData.map(d => {
      let docRev = 0;
      d.appointments.forEach(a => {
         if (a.billing) {
           docRev += a.billing.totalAmount;
         }
      });
      return {
        id: d.id,
        name: d.name,
        appointments: d.appointments.length,
        revenue: docRev
      };
    });

    // 5. No Show Rate
    const noShowRate = totalAppts > 0 ? (apptByStatus.NO_SHOW || 0) / totalAppts : 0;

    // 6. Top Diagnoses
    const visits = await prisma.patientVisit.findMany({
      where: { ...whereOrg, visitDate: { gte: startDate } },
      select: { diagnosis: true }
    });

    const diagnosisMap: Record<string, number> = {};
    visits.forEach(v => {
      if (v.diagnosis) {
        const diags = v.diagnosis.split(',').map(d => d.trim());
        diags.forEach(d => {
          if (d) {
             diagnosisMap[d] = (diagnosisMap[d] || 0) + 1;
          }
        });
      }
    });
    
    const topDiagnoses = Object.keys(diagnosisMap)
      .map(name => ({ name, count: diagnosisMap[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const result = {
      revenue: {
        total: totalRevenue,
        byDay: revenueByDay,
        byMethod: revenueByMethod
      },
      appointments: {
        total: totalAppts,
        byStatus: apptByStatus,
        byDay: apptByDay
      },
      patients: {
        total: totalPatients,
        new: newPatients,
        returning: returningPatients
      },
      doctors,
      noShowRate,
      topDiagnoses
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
