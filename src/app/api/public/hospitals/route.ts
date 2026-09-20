import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  }
];

export const DEMO_DOCTORS_BY_ORG: Record<string, any[]> = {
  "org-city-care": [
    {
      id: "doc-1",
      name: "Dr. Smith",
      department: "Cardiology",
      specialization: "Senior Cardiologist",
      consultationFee: 500,
      availableDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
      slotDuration: 15
    },
    {
      id: "doc-2",
      name: "Dr. Anjali Sharma",
      department: "General Medicine",
      specialization: "Consultant Physician",
      consultationFee: 400,
      availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
      slotDuration: 15
    },
    {
      id: "doc-3",
      name: "Dr. Rajesh Patil",
      department: "Pediatrics",
      specialization: "Child Specialist",
      consultationFee: 450,
      availableDays: ["TUESDAY", "THURSDAY", "SATURDAY"],
      slotDuration: 15
    }
  ],
  "org-apex-clinic": [
    {
      id: "doc-4",
      name: "Dr. Neha Deshmukh",
      department: "Dermatology",
      specialization: "Cosmetic Dermatologist",
      consultationFee: 600,
      availableDays: ["MONDAY", "WEDNESDAY", "SATURDAY"],
      slotDuration: 20
    },
    {
      id: "doc-5",
      name: "Dr. Vikram Kulkarni",
      department: "Orthopedics",
      specialization: "Joint Replacement Surgeon",
      consultationFee: 700,
      availableDays: ["TUESDAY", "FRIDAY"],
      slotDuration: 20
    }
  ],
  "org-metro-life": [
    {
      id: "doc-6",
      name: "Dr. Amit Verma",
      department: "ENT",
      specialization: "Ear, Nose, Throat Surgeon",
      consultationFee: 500,
      availableDays: ["MONDAY", "THURSDAY", "SATURDAY"],
      slotDuration: 15
    },
    {
      id: "doc-7",
      name: "Dr. Priya Nair",
      department: "Gynecology",
      specialization: "Obstetrics & Women's Health",
      consultationFee: 650,
      availableDays: ["WEDNESDAY", "FRIDAY"],
      slotDuration: 20
    }
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (orgId) {
      try {
        // Fetch doctors for a specific hospital from DB
        const doctors = await prisma.user.findMany({
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
        });
        if (doctors && doctors.length > 0) {
          return NextResponse.json({ doctors });
        }
      } catch (dbErr) {
        console.warn("DB offline or empty, using demo doctors fallback for org:", orgId);
      }

      // Return demo doctors fallback
      const fallbackDoctors = DEMO_DOCTORS_BY_ORG[orgId] || DEMO_DOCTORS_BY_ORG["org-city-care"];
      return NextResponse.json({ doctors: fallbackDoctors });
    } else {
      try {
        // Fetch all active hospitals from DB
        const hospitals = await prisma.organization.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            domain: true,
            address: true,
            city: true,
            state: true,
            phone: true,
          }
        });
        if (hospitals && hospitals.length > 0) {
          return NextResponse.json({ hospitals });
        }
      } catch (dbErr) {
        console.warn("DB offline or empty, using demo hospitals fallback");
      }

      // Return demo hospitals fallback
      return NextResponse.json({ hospitals: DEMO_HOSPITALS });
    }
  } catch (error) {
    console.error("Failed to fetch hospital data, returning demo fallback:", error);
    return NextResponse.json({ hospitals: DEMO_HOSPITALS });
  }
}
