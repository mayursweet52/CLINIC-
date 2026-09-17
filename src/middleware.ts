import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Security Headers (Anti-Theft, XSS Protection)
  const headers = new Headers(request.headers);
  const response = NextResponse.next({
    request: {
      headers,
    },
  });

  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 2. Mock Multi-Tenancy & Auth Context
  // In a real scenario, you would verify the JWT token from cookies here.
  // Example: const token = request.cookies.get('accessToken')?.value;
  // If token compromised or missing, block access to /api/ (except public routes).
  
  // For now, since JWT is not fully implemented, we let it pass.
  // We can also inject context headers that our backend API reads.
  // response.headers.set('x-user-role', 'DOCTOR');
  
  return response;
}

// Apply middleware to API routes and protected pages
export const config = {
  matcher: [
    '/api/:path*',
    '/staff/:path*',
    '/health',
  ],
};
