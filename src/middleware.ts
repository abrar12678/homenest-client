import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // All dashboard routes require authentication (enforced client-side)
  // /properties/new requires agent role (enforced client-side)
  // This middleware just sets a header — real protection is client-side via API interceptor
  const response = NextResponse.next();
  response.headers.set('x-middleware-auth', 'checked');
  return response;
}

export const config = {
  matcher: ['/properties/new/:path*', '/dashboard/:path*'],
};