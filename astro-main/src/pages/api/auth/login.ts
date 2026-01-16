import type { APIRoute } from 'astro';
import { login } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const redirectUrl = formData.get('redirect')?.toString() || '/dashboard';

    if (!email || !password) {
      return redirect('/login?error=' + encodeURIComponent('Email and password are required'));
    }

    const result = await login(email, password);

    if (!result) {
      return redirect('/login?error=' + encodeURIComponent('Invalid email or password'));
    }

    // Set session cookie
    cookies.set('session', result.sessionId, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return redirect(redirectUrl);
  } catch (error) {
    console.error('Login error:', error);
    return redirect('/login?error=' + encodeURIComponent('An error occurred during login'));
  }
};
