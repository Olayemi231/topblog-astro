import type { APIRoute } from 'astro';
import { deleteUser } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;

  if (!user || user.role !== 'admin') {
    return redirect('/?error=' + encodeURIComponent('Unauthorized access'));
  }

  try {
    const formData = await request.formData();
    const userIdToDelete = formData.get('userId')?.toString();

    if (!userIdToDelete) {
      return redirect('/admin?error=' + encodeURIComponent('Invalid user ID'));
    }

    if (userIdToDelete === user.id) {
      return redirect('/admin?error=' + encodeURIComponent('You cannot delete yourself'));
    }

    await deleteUser(userIdToDelete);

    return redirect('/admin?success=' + encodeURIComponent('User and all their data deleted successfully'));
  } catch (error) {
    console.error('Delete user error:', error);
    return redirect('/admin?error=' + encodeURIComponent('Failed to delete user'));
  }
};
