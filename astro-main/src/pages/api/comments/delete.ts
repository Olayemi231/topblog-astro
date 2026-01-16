import type { APIRoute } from 'astro';
import { deleteComment } from '../../../lib/posts';
import { db } from '../../../lib/db';
import { comments } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;

  if (!user) {
    return redirect('/login?error=' + encodeURIComponent('Please log in'));
  }

  try {
    const formData = await request.formData();
    const commentId = formData.get('commentId')?.toString();
    const postId = formData.get('postId')?.toString();

    if (!commentId || !postId) {
      return redirect('/post/' + postId + '?error=' + encodeURIComponent('Invalid comment'));
    }

    // Check if user owns the comment or is admin
    const [comment] = await db.select().from(comments).where(eq(comments.id, commentId));
    
    if (!comment) {
      return redirect('/post/' + postId + '?error=' + encodeURIComponent('Comment not found'));
    }

    if (comment.userId !== user.id && user.role !== 'admin') {
      return redirect('/post/' + postId + '?error=' + encodeURIComponent('You can only delete your own comments'));
    }

    await deleteComment(commentId);

    return redirect('/post/' + postId + '?success=' + encodeURIComponent('Comment deleted') + '#comments');
  } catch (error) {
    console.error('Delete comment error:', error);
    return redirect('/?error=' + encodeURIComponent('Failed to delete comment'));
  }
};
