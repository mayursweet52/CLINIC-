import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');

export async function middleware(request: NextRequest) {
  // Security Headers
  const headers = new Headers(request.headers);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Skip JWT verification for public routes
  if (request.nextUrl.pathname.startsWith('/staff/login') || request.nextUrl.pathname.startsWith('/health') || request.nextUrl.pathname.startsWith('/api/auth')) {
    return response;
  }

  // Check JWT token for protected routes
  const token = request.cookies.get('auth_token')?.value;

  if (request.nextUrl.pathname.startsWith('/staff') || request.nextUrl.pathname.startsWith('/api/')) {
    if (!token) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/staff/login', request.url));
    }

    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      
      // Pass the context downstream to the API via headers
      response.headers.set('x-user-id', payload.userId as string);
      response.headers.set('x-user-role', payload.role as string);
      response.headers.set('x-org-id', payload.orgId as string);
      
      return response;
    } catch (err) {
      // Token is invalid/expired
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/staff/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/staff/:path*',
    '/superadmin/:path*'
  ],
};
