import type { APIRoute } from 'astro';
import { createPost } from '../../../lib/posts';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;

  if (!user) {
    return redirect('/login?error=' + encodeURIComponent('Please log in to create a post'));
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString()?.trim();
    const content = formData.get('content')?.toString()?.trim();
    const excerpt = formData.get('excerpt')?.toString()?.trim() || undefined;

    if (!title || !content) {
      return redirect('/dashboard/new?error=' + encodeURIComponent('Title and content are required'));
    }

    const post = await createPost({
      title,
      content,
      excerpt,
      authorId: user.id,
    });

    return redirect('/dashboard?success=' + encodeURIComponent('Post created successfully!'));
  } catch (error) {
    console.error('Create post error:', error);
    return redirect('/dashboard/new?error=' + encodeURIComponent('Failed to create post'));
  }
};
