import type { APIRoute } from 'astro';
import { createComment, getPostById } from '../../../lib/posts';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;

  if (!user) {
    return redirect('/login?error=' + encodeURIComponent('Please log in to comment'));
  }

  try {
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString();
    const content = formData.get('content')?.toString()?.trim();

    if (!postId || !content) {
      return redirect('/post/' + postId + '?error=' + encodeURIComponent('Comment content is required'));
    }

    // Check if post exists
    const post = await getPostById(postId);
    if (!post) {
      return redirect('/?error=' + encodeURIComponent('Post not found'));
    }

    await createComment({
      content,
      postId,
      userId: user.id,
    });

    return redirect('/post/' + postId + '?success=' + encodeURIComponent('Comment posted!') + '#comments');
  } catch (error) {
    console.error('Create comment error:', error);
    return redirect('/?error=' + encodeURIComponent('Failed to post comment'));
  }
};
