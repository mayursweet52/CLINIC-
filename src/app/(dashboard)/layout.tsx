import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let payload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const verified = await jwtVerify(token, secret);
    payload = verified.payload;
  } catch (error) {
    redirect("/login");
  }

  const user = {
    name: (payload.name as string) || "Staff Member",
    role: (payload.role as string)?.toLowerCase() || "receptionist",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
