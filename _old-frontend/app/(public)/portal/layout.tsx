import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Hospital } from 'lucide-react';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('patient_token')?.value;
  
  let isAuthenticated = false;
  let phone = '';

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
      const { payload } = await jwtVerify(token, secret);
      isAuthenticated = true;
      phone = payload.phone as string;
    } catch {
      // Invalid token
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Hospital className="h-6 w-6" />
            ClinicOS Patient Portal
          </Link>
          
          {isAuthenticated && (
            <div className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
              {phone}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
