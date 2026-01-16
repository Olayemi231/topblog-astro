import type { APIRoute } from 'astro';
import { getPostById, deletePost } from '../../../lib/posts';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;

  if (!user) {
    return redirect('/login?error=' + encodeURIComponent('Please log in to delete posts'));
  }

  try {
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString();

    if (!postId) {
      return redirect('/dashboard?error=' + encodeURIComponent('Invalid post'));
    }

    // Check if post exists and user owns it
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return redirect('/dashboard?error=' + encodeURIComponent('Post not found'));
    }

    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      return redirect('/dashboard?error=' + encodeURIComponent('You can only delete your own posts'));
    }

    await deletePost(postId);

    return redirect('/dashboard?success=' + encodeURIComponent('Post deleted successfully!'));
  } catch (error) {
    console.error('Delete post error:', error);
    return redirect('/dashboard?error=' + encodeURIComponent('Failed to delete post'));
  }
};
