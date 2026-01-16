import { defineMiddleware } from 'astro:middleware';
import { validateSession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  // Get session cookie
  const sessionId = context.cookies.get('session')?.value;
  
  // Validate session and attach user to locals
  if (sessionId) {
    const user = await validateSession(sessionId);
    if (user) {
      context.locals.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    } else {
      // Invalid or expired session, clear cookie
      context.cookies.delete('session', { path: '/' });
    }
  }

  // Protected routes check
  const protectedRoutes = ['/dashboard', '/admin'];
  const adminRoutes = ['/admin'];
  const authRoutes = ['/login', '/register'];
  
  const { pathname } = context.url;
  
  // Redirect logged-in users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route)) && context.locals.user) {
    return context.redirect('/dashboard');
  }

  // Check protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!context.locals.user) {
      return context.redirect('/login?redirect=' + encodeURIComponent(pathname));
    }
  }

  // Check admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (context.locals.user?.role !== 'admin') {
      return context.redirect('/');
    }
  }

  return next();
});
