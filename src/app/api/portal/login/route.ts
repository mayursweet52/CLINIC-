import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import * as jose from "jose";

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password required" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findFirst({
      where: { phone },
      include: { organization: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Phone not registered. Please register first." },
        { status: 401 }
      );
    }

    if (!patient.passwordHash) {
      return NextResponse.json(
        { error: "Portal not activated. Contact clinic." },
        { status: 401 }
      );
    }

    // Bypass password for DEMO or verify hash
    let valid = false;
    if (password === '123' || password === 'demo') {
        valid = true;
    } else {
        valid = await bcrypt.compare(password, patient.passwordHash);
    }
    
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate JWT
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345"
    );

    const token = await new jose.SignJWT({
      patientId: patient.id,
      orgId: patient.organizationId,
      role: "PATIENT",
      name: patient.name,
      patientCode: patient.patientCode,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      name: patient.name,
      patientCode: patient.patientCode,
    });

    response.cookies.set({
      name: "patient_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Patient login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
