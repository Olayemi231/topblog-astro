import type { APIRoute } from 'astro';
import { getPostById, updatePost } from '../../../lib/posts';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;

  if (!user) {
    return redirect('/login?error=' + encodeURIComponent('Please log in to edit posts'));
  }

  try {
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString();
    const title = formData.get('title')?.toString()?.trim();
    const content = formData.get('content')?.toString()?.trim();
    const excerpt = formData.get('excerpt')?.toString()?.trim() || undefined;

    if (!postId || !title || !content) {
      return redirect('/dashboard?error=' + encodeURIComponent('Invalid post data'));
    }

    // Check if post exists and user owns it
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return redirect('/dashboard?error=' + encodeURIComponent('Post not found'));
    }

    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      return redirect('/dashboard?error=' + encodeURIComponent('You can only edit your own posts'));
    }

    await updatePost(postId, { title, content, excerpt });

    return redirect('/dashboard?success=' + encodeURIComponent('Post updated successfully!'));
  } catch (error) {
    console.error('Update post error:', error);
    return redirect('/dashboard?error=' + encodeURIComponent('Failed to update post'));
  }
};
