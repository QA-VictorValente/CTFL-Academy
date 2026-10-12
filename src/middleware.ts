import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/capitulos',
  '/exercicios',
  '/flashcards',
  '/simulados',
  '/historico',
  '/revisao-erros',
  '/progresso',
  '/conquistas',
  '/perfil',
  '/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('ctfl_session')?.value;
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/capitulos/:path*',
    '/exercicios/:path*',
    '/flashcards/:path*',
    '/simulados/:path*',
    '/historico/:path*',
    '/revisao-erros/:path*',
    '/progresso/:path*',
    '/conquistas/:path*',
    '/perfil/:path*',
    '/admin/:path*',
  ],
};
