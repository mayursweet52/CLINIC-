import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { DoctorDashboardClient } from "./DoctorDashboardClient";

export default async function DoctorPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  let userId = "dr-unknown";
  let name = "Doctor";

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345");
      const verified = await jwtVerify(token, secret);
      userId = (verified.payload.userId as string) || "dr-unknown";
      name = (verified.payload.name as string) || "Doctor";
    } catch (e) {
      console.error("Invalid token in DoctorPage", e);
    }
  }

  return <DoctorDashboardClient doctorId={userId} doctorName={name} />;
}
