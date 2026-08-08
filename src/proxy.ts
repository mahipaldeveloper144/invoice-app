import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Allow API routes to be handled by their respective API route handlers
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  let decodedToken = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      decodedToken = payload;
    } catch (error) {
      console.log('Proxy: Invalid token');
    }
  }

  const isPublicPath = pathname === '/login' || pathname === '/register';

  // If logged in: redirect root (/), /login, and /register to /dashboard
  if (decodedToken) {
    if (isPublicPath || pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // If not logged in: allow /login and /register, redirect everything else to /login
  if (!isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
