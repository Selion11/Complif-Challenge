import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Protección de rutas privadas (Dashboard General)
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Redirección de usuarios logueados (Login/Signup)
  if (token && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Protección de rutas de Administrador (Opcional/Seguridad extra)
  // Si intentan entrar a /register o configurar gobernanza sin ser admin,
  // el backend rebotará la petición, pero aquí podemos prevenir la carga visual.
  if (token && pathname === '/dashboard/register') {
    // Aquí podrías decodificar el token para verificar el rol 'admin'
    // Por ahora permitimos el paso y dejamos que el backend valide el JWT
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*', 
    '/login',
    '/signup'
  ],
};