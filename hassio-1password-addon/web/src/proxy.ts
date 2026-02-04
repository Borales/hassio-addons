import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

export default function proxy(request: NextRequest) {
  // Get locale from cookie, fallback to default
  const locale =
    request.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale;

  // Create response
  const response = NextResponse.next();

  // Set locale in request headers for consumption by the app
  response.headers.set('x-locale', locale);

  return response;
}

export const config = {
  // Match all routes except static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
