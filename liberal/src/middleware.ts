import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth?.user;
  const role = req.auth?.user?.role;

  // Admin routes -- require admin role
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/feed/hot', req.url));
  }

  // Protected routes -- require authentication
  if (pathname.startsWith('/submit') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (pathname === '/profile' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (pathname.startsWith('/profile/settings') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/submit', '/profile', '/profile/settings/:path*'],
};
