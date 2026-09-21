import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const DEMO_DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Rajesh Sharma",
    department: "Cardiology",
    specialization: "Senior Cardiologist (Heart Specialist)",
    consultationFee: 500,
    experience: "15+ Years Exp",
    timing: "10:00 AM - 02:00 PM",
    availableDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
    slotDuration: 15
  },
  {
    id: "doc-2",
    name: "Dr. Anjali Patil",
    department: "General Medicine",
    specialization: "Consultant Physician & Diabetologist",
    consultationFee: 400,
    experience: "12+ Years Exp",
    timing: "09:00 AM - 05:00 PM",
    availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
    slotDuration: 15
  },
  {
    id: "doc-3",
    name: "Dr. Vikram Kulkarni",
    department: "Orthopedics",
    specialization: "Bone & Joint Replacement Surgeon",
    consultationFee: 600,
    experience: "18+ Years Exp",
    timing: "11:00 AM - 04:00 PM",
    availableDays: ["TUESDAY", "THURSDAY", "SATURDAY"],
    slotDuration: 20
  },
  {
    id: "doc-4",
    name: "Dr. Sneha Deshmukh",
    department: "Pediatrics",
    specialization: "Child & Newborn Care Specialist",
    consultationFee: 450,
    experience: "10+ Years Exp",
    timing: "10:00 AM - 01:00 PM, 05:00 PM - 08:00 PM",
    availableDays: ["MONDAY", "TUESDAY", "THURSDAY", "FRIDAY"],
    slotDuration: 15
  },
  {
    id: "doc-5",
    name: "Dr. Priya Nair",
    department: "Gynecology",
    specialization: "Women's Health & Obstetrics",
    consultationFee: 550,
    experience: "14+ Years Exp",
    timing: "10:00 AM - 03:00 PM",
    availableDays: ["WEDNESDAY", "FRIDAY", "SATURDAY"],
    slotDuration: 20
  },
  {
    id: "doc-6",
    name: "Dr. Amit Verma",
    department: "ENT",
    specialization: "Ear, Nose, Throat Surgeon",
    consultationFee: 450,
    experience: "9+ Years Exp",
    timing: "02:00 PM - 07:00 PM",
    availableDays: ["MONDAY", "WEDNESDAY", "SATURDAY"],
    slotDuration: 15
  }
];

export const DEMO_DOCTORS_BY_ORG: Record<string, any[]> = {
  "org-city-care": [DEMO_DOCTORS[0], DEMO_DOCTORS[1], DEMO_DOCTORS[2], DEMO_DOCTORS[3]],
  "org-apex-clinic": [DEMO_DOCTORS[1], DEMO_DOCTORS[2], DEMO_DOCTORS[4], DEMO_DOCTORS[5]],
  "org-metro-life": [DEMO_DOCTORS[0], DEMO_DOCTORS[3], DEMO_DOCTORS[4], DEMO_DOCTORS[5]],
};

export const DEMO_HOSPITALS = [
  {
    id: "org-city-care",
    name: "City Care Super Multi-Speciality Hospital",
    domain: "citycare.businessos.co.in",
    address: "123 Health Avenue, Phase 1",
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91-9876543210",
    isActive: true,
    doctors: DEMO_DOCTORS_BY_ORG["org-city-care"]
  },
  {
    id: "org-apex-clinic",
    name: "Apex Multi-Speciality Clinic & Diagnostic Center",
    domain: "apex.businessos.co.in",
    address: "45 MG Road, Shivaji Nagar",
    city: "Pune",
    state: "Maharashtra",
    phone: "+91-9123456780",
    isActive: true,
    doctors: DEMO_DOCTORS_BY_ORG["org-apex-clinic"]
  },
  {
    id: "org-metro-life",
    name: "Metro Life Care Hospital & Trauma Center",
    domain: "metrolife.businessos.co.in",
    address: "78 Ring Road, Near Central Metro",
    city: "Nagpur",
    state: "Maharashtra",
    phone: "+91-9988776655",
    isActive: true,
    doctors: DEMO_DOCTORS_BY_ORG["org-metro-life"]
  }
];

// Helper to prevent hanging on offline Postgres
async function withDbTimeout<T>(promise: Promise<T>, timeoutMs = 800): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Database query timed out')), timeoutMs))
  ]);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (orgId) {
      try {
        const doctors = await withDbTimeout(
          prisma.user.findMany({
            where: {
              organizationId: orgId,
              role: 'DOCTOR',
              isActive: true
            },
            select: {
              id: true,
              name: true,
              department: true,
              specialization: true,
              consultationFee: true,
            }
          }),
          800
        );
        if (doctors && doctors.length > 0) {
          return NextResponse.json({ doctors });
        }
      } catch (dbErr) {
        // Fast fallback on DB error or timeout
      }

      const fallbackDoctors = DEMO_DOCTORS_BY_ORG[orgId] || DEMO_DOCTORS;
      return NextResponse.json({ doctors: fallbackDoctors });
    } else {
      try {
        const hospitals = await withDbTimeout(
          prisma.organization.findMany({
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              domain: true,
              address: true,
              city: true,
              state: true,
              phone: true,
              users: {
                where: { role: 'DOCTOR', isActive: true },
                select: {
                  id: true,
                  name: true,
                  department: true,
                  specialization: true,
                  consultationFee: true,
                }
              }
            }
          }),
          800
        );
        if (hospitals && hospitals.length > 0) {
          const formatted = hospitals.map(h => ({
            ...h,
            doctors: h.users && h.users.length > 0 ? h.users : (DEMO_DOCTORS_BY_ORG[h.id] || DEMO_DOCTORS)
          }));
          return NextResponse.json({ hospitals: formatted });
        }
      } catch (dbErr) {
        // Fast fallback on DB error or timeout
      }

      return NextResponse.json({ hospitals: DEMO_HOSPITALS });
    }
  } catch (error) {
    console.error("Error in /api/public/hospitals:", error);
    return NextResponse.json({ hospitals: DEMO_HOSPITALS });
  }
}
