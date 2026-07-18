import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPath = pathname === '/login' || pathname === '/register';

  let decodedToken = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      decodedToken = payload;
    } catch (error) {
      // Invalid token
      console.log('Proxy: Invalid token');
    }
  }

  // If public path and HAS valid token, redirect to dashboard
  if (isPublicPath && decodedToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If NOT public path and NO valid token, redirect to login
  if (!isPublicPath && !decodedToken && pathname !== '/') {
    const protectedPaths = ['/dashboard', '/customers', '/products', '/invoices', '/api'];
    if (protectedPaths.some(p => pathname.startsWith(p))) {
      // Allow public API routes if any (none currently identified)
      if (pathname.startsWith('/api/auth')) return NextResponse.next();
      
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/customers/:path*',
    '/products/:path*',
    '/invoices/:path*',
  ],
};
