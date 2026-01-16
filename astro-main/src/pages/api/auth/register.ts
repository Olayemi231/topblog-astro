import type { APIRoute } from 'astro';
import { register } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const confirmPassword = formData.get('confirmPassword')?.toString();

    if (!name || !email || !password || !confirmPassword) {
      return redirect('/register?error=' + encodeURIComponent('All fields are required'));
    }

    if (password !== confirmPassword) {
      return redirect('/register?error=' + encodeURIComponent('Passwords do not match'));
    }

    if (password.length < 8) {
      return redirect('/register?error=' + encodeURIComponent('Password must be at least 8 characters'));
    }

    const result = await register({ name, email, password });

    if ('error' in result) {
      return redirect('/register?error=' + encodeURIComponent(result.error));
    }

    // Set session cookie
    cookies.set('session', result.sessionId, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return redirect('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    return redirect('/register?error=' + encodeURIComponent('An error occurred during registration'));
  }
};
