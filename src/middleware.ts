import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // During development, we are bypassing JWT middleware because 
  // auth is currently handled via UI state on the pages themselves.
  
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/staff/:path*",
    "/superadmin/:path*"
  ],
};

