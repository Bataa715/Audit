import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/admin/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check if user is admin (securely)
  let isAdmin = false;
  if (userCookie && token) {
    try {
      const user = JSON.parse(userCookie);
      isAdmin = user.isAdmin === true;
    } catch (error) {
      // Clear invalid cookies only if not on public routes
      if (!isPublicRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        response.cookies.delete('user');
        return response;
      }
    }
  }

  // Admin routes (excluding login)
  const isAdminRoute =
    pathname.startsWith('/admin') && pathname !== '/admin/login';

  if (isAdminRoute) {
    // Not logged in -> redirect to admin login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Logged in but not admin -> redirect to admin login (need admin account)
    if (!isAdmin) {
      // Clear cookies so they can login with admin account
      const response = NextResponse.redirect(
        new URL('/admin/login', request.url)
      );
      response.cookies.delete('token');
      response.cookies.delete('user');
      return response;
    }
  }

  // If user is not authenticated and trying to access protected route (non-admin)
  if (!token && !isPublicRoute && !isAdminRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login pages
  if (token) {
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname === '/admin/login' && isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|sounds|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
