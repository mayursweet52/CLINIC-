import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');

export async function middleware(request: NextRequest) {
  // Public routes to skip
  if (
    request.nextUrl.pathname.startsWith('/staff/login') ||
    request.nextUrl.pathname.startsWith('/health') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/api/public') ||
    request.nextUrl.pathname.startsWith('/superadmin') ||
    request.nextUrl.pathname.startsWith('/api/superadmin')
  ) {
    const res = NextResponse.next();
    res.headers.set('X-Frame-Options', 'DENY');
    return res;
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
      
      const newHeaders = new Headers(request.headers);
      newHeaders.set('x-user-id', payload.userId as string);
      newHeaders.set('x-user-role', payload.role as string);
      newHeaders.set('x-org-id', payload.orgId as string);

      const modifiedResponse = NextResponse.next({
        request: {
          headers: newHeaders,
        },
      });

      modifiedResponse.headers.set('X-XSS-Protection', '1; mode=block');
      modifiedResponse.headers.set('X-Frame-Options', 'DENY');
      modifiedResponse.headers.set('X-Content-Type-Options', 'nosniff');

      return modifiedResponse;
    } catch (err) {
      // Token is invalid/expired
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/staff/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/staff/:path*',
    '/superadmin/:path*'
  ],
};
