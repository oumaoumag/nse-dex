import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require KYC
const protectedRoutes = ['/marketplace', '/trading', '/portfolio'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only check KYC status for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check if user is authenticated (has a session)
    const sessionToken = request.cookies.get('next-auth.session-token')?.value;
    
    if (!sessionToken) {
      // If not authenticated, redirect to login page
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Check if user has completed KYC
    const kycStatus = request.cookies.get('kyc-status')?.value;
    
    if (!kycStatus || kycStatus === 'none') {
      // If KYC is not completed, redirect to KYC page
      return NextResponse.redirect(new URL('/kyc', request.url));
    }
  }
  
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