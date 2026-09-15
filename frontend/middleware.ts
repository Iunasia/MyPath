import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes (/api/...)
  // - Next.js internals (/_next/...)
  // - Static files with extensions (e.g. favicon.ico, images)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
