import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { PermissionsProvider } from "@/components/providers/PermissionsProvider";
import { getUserPermissions } from "@/lib/rbac";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let payload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345");
    const verified = await jwtVerify(token, secret);
    payload = verified.payload;
  } catch (error) {
    redirect("/login");
  }

  const userId = payload.userId as string;
  const role = (payload.role as string)?.toUpperCase() || "RECEPTIONIST";
  
  const permissions = await getUserPermissions(userId);

  const user = {
    name: (payload.name as string) || "Staff Member",
    role: role.toLowerCase(),
  };

  return (
    <PermissionsProvider role={role} permissions={permissions}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar role={user.role} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar user={user} />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            {children}
          </main>
        </div>
      </div>
    </PermissionsProvider>
  );
}
