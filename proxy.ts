import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isLoggedIn = request.cookies.get('auth')?.value;
  const pathname = request.nextUrl.pathname;

  // Pathnames that should NOT be redirected to login
  const publicRoutes = ['/', '/login', '/auth', '/signup'];

  // Allow authenticated users to visit / or /login if they choose
  // if (isLoggedIn && (pathname === '/' || pathname === '/login')) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }
  
  // If user is trying to access a public route, allow it
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If not logged in and trying to access a protected route (like /dashboard), redirect to /
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|public|.*\\..*).*)'],
};
