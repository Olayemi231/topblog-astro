import type { APIRoute } from 'astro';
import { updateUser } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;

  if (!user || user.role !== 'admin') {
    return redirect('/?error=' + encodeURIComponent('Unauthorized access'));
  }

  try {
    const formData = await request.formData();
    const userId = formData.get('userId')?.toString();
    const newRole = formData.get('role')?.toString();

    if (!userId || !newRole) {
      return redirect('/admin?error=' + encodeURIComponent('Invalid data'));
    }

    if (newRole !== 'admin' && newRole !== 'user') {
      return redirect('/admin?error=' + encodeURIComponent('Invalid role'));
    }

    if (userId === user.id) {
      return redirect('/admin?error=' + encodeURIComponent('You cannot change your own role'));
    }

    await updateUser(userId, { role: newRole as 'admin' | 'user' });

    return redirect(`/admin?success=${encodeURIComponent(`User role updated to ${newRole}`)}`);
  } catch (error) {
    console.error('Update role error:', error);
    return redirect('/admin?error=' + encodeURIComponent('Failed to update user role'));
  }
};
