import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name too short"),
  phone: z.string().min(10, "Invalid phone"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6, "Password min 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: (parsed.error as any).errors[0].message },
        { status: 400 }
      );
    }

    let { name, phone, email, password } = parsed.data;
    phone = phone.trim().replace(/\s+/g, '');

    // Default org (first one)
    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: "No clinic configured" }, { status: 500 });
    }

    const existing = await prisma.patient.findFirst({
      where: { organizationId: org.id, phone },
    });
    if (existing) {
      if (existing.passwordHash) {
        return NextResponse.json(
          { error: "Phone already registered. Please login." },
          { status: 409 }
        );
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      const updated = await prisma.patient.update({
        where: { id: existing.id },
        data: {
          name, // update name if they provided a better one during registration
          email: email || existing.email,
          passwordHash,
        },
      });

      return NextResponse.json({
        success: true,
        patientCode: updated.patientCode,
        message: "Account linked successfully",
      });
    }

    // Generate patient code
    const count = await prisma.patient.count({
      where: { organizationId: org.id },
    });
    const patientCode = `AMC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const passwordHash = await bcrypt.hash(password, 10);

    const patient = await prisma.patient.create({
      data: {
        organizationId: org.id,
        patientCode,
        name,
        phone,
        email: email || null,
        passwordHash,
        gender: "OTHER", // Default value as schema requires it
      },
    });

    return NextResponse.json({
      success: true,
      patientCode: patient.patientCode,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
