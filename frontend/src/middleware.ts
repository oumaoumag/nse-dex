import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

// Define protected routes that require authentication
const protectedRoutes = ['/marketplace', '/trading', '/portfolio'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to public routes without authentication
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Get session token from next-auth
  const token = await getToken({ req: request });
  
  // If no token and not on a public route, redirect to login
  if (!token && !pathname.startsWith('/auth')) {
    const loginUrl = new URL('/auth/login', request.url);
    // Preserve the original URL as callbackUrl
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // No KYC check required, only authentication check is performed above
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}; 