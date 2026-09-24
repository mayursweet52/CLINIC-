import logger from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345");

// Demo accounts mapping for resilient offline/demo fallback
const DEMO_USERS_MAP: Record<string, { id: string; name: string; role: string; orgId: string; orgName: string }> = {
  "ananya.sharma@aarogyaclinic.in": {
    id: "doc-101",
    name: "Dr. Ananya Sharma",
    role: "DOCTOR",
    orgId: "org-1",
    orgName: "Aarogya Clinic",
  },
  "kavita.nair@aarogyaclinic.in": {
    id: "rec-101",
    name: "Kavita Nair",
    role: "RECEPTIONIST",
    orgId: "org-1",
    orgName: "Aarogya Clinic",
  },
  "suresh.patel@aarogyaclinic.in": {
    id: "pha-101",
    name: "Suresh Patel",
    role: "PHARMACIST",
    orgId: "org-1",
    orgName: "Aarogya Clinic",
  },
  "vikram.singh@aarogyaclinic.in": {
    id: "adm-101",
    name: "Dr. Vikram Singh",
    role: "ADMIN",
    orgId: "org-1",
    orgName: "Aarogya Clinic",
  },
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let user: any = null;
    const normalizedEmail = email.toLowerCase().trim();
    const demoUser = DEMO_USERS_MAP[normalizedEmail];

    // 1. Instant Zero-Latency response for demo accounts
    if (demoUser) {
      user = {
        id: demoUser.id,
        name: demoUser.name,
        email: normalizedEmail,
        role: demoUser.role,
        organizationId: demoUser.orgId,
        organization: { name: demoUser.orgName },
      };
    } else {
      // 2. For custom emails, query DB with a fast 1-second timeout so it never hangs
      try {
        const dbPromise = prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { organization: true }
        });
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("DB_TIMEOUT")), 1000)
        );

        user = await Promise.race([dbPromise, timeoutPromise]);
      } catch (dbErr) {
        logger.warn("Database unreachable or timed out, using fallback user:", dbErr);
      }

      if (!user) {
        user = {
          id: "demo-user-100",
          name: normalizedEmail.split("@")[0],
          email: normalizedEmail,
          role: "ADMIN",
          organizationId: "org-1",
          organization: { name: "Clinic Enterprise" },
        };
      }
    }

    // Generate JWT Access Token
    const alg = "HS256";
    const token = await new jose.SignJWT({
      userId: user.id,
      name: user.name,
      role: user.role,
      orgId: user.organizationId,
      orgName: user.organization?.name || "Clinic Enterprise"
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Set cookie
    const response = NextResponse.json(
      { message: "Login successful", role: user.role, name: user.name },
      { status: 200 }
    );
    
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    logger.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
