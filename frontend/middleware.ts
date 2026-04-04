import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'itsupport_access_token';
const PUBLIC_PATHS = ['/login'];

function applySecurityHeaders(request: NextRequest, response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");

  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!hasAuthCookie && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return applySecurityHeaders(request, NextResponse.redirect(loginUrl));
  }

  if (hasAuthCookie && pathname === '/login') {
    const dashboardUrl = new URL('/', request.url);
    return applySecurityHeaders(request, NextResponse.redirect(dashboardUrl));
  }

  return applySecurityHeaders(request, NextResponse.next());
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)'],
};
