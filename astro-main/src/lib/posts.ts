import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { posts, comments, users, type Post, type Comment } from './db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Post types with author info
export type PostWithAuthor = Post & {
  author: {
    id: string;
    name: string;
    email: string;
  };
};

export type CommentWithUser = Comment & {
  user: {
    id: string;
    name: string;
  };
};

// Generate excerpt from content
function generateExcerpt(content: string, maxLength: number = 150): string {
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

// Post CRUD
export async function createPost(data: {
  title: string;
  content: string;
  authorId: string;
  excerpt?: string;
}): Promise<Post> {
  const id = uuidv4();
  const now = new Date();
  const excerpt = data.excerpt || generateExcerpt(data.content);

  const [post] = await db.insert(posts).values({
    id,
    title: data.title,
    content: data.content,
    excerpt,
    authorId: data.authorId,
    createdAt: now,
    updatedAt: now,
  }).returning();

  return post;
}

export async function getPostById(id: string): Promise<PostWithAuthor | undefined> {
  const result = await db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    excerpt: posts.excerpt,
    authorId: posts.authorId,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    author: {
      id: users.id,
      name: users.name,
      email: users.email,
    },
  })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id));

  return result[0] as PostWithAuthor | undefined;
}

export async function getLatestPosts(limit: number = 5): Promise<PostWithAuthor[]> {
  const result = await db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    excerpt: posts.excerpt,
    authorId: posts.authorId,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    author: {
      id: users.id,
      name: users.name,
      email: users.email,
    },
  })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return result as PostWithAuthor[];
}

export async function getAllPosts(): Promise<PostWithAuthor[]> {
  const result = await db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    excerpt: posts.excerpt,
    authorId: posts.authorId,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    author: {
      id: users.id,
      name: users.name,
      email: users.email,
    },
  })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt));

  return result as PostWithAuthor[];
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  return db.select()
    .from(posts)
    .where(eq(posts.authorId, authorId))
    .orderBy(desc(posts.createdAt));
}

export async function updatePost(id: string, data: {
  title?: string;
  content?: string;
  excerpt?: string;
}): Promise<Post | undefined> {
  const updateData: Partial<Post> = {
    updatedAt: new Date(),
  };

  if (data.title) updateData.title = data.title;
  if (data.content) {
    updateData.content = data.content;
    updateData.excerpt = data.excerpt || generateExcerpt(data.content);
  }

  const [post] = await db.update(posts)
    .set(updateData)
    .where(eq(posts.id, id))
    .returning();

  return post;
}

export async function deletePost(id: string): Promise<boolean> {
  await db.delete(posts).where(eq(posts.id, id));
  return true;
}

// Comment CRUD
export async function createComment(data: {
  content: string;
  postId: string;
  userId: string;
}): Promise<Comment> {
  const id = uuidv4();

  const [comment] = await db.insert(comments).values({
    id,
    content: data.content,
    postId: data.postId,
    userId: data.userId,
    createdAt: new Date(),
  }).returning();

  return comment;
}

export async function getCommentsByPost(postId: string): Promise<CommentWithUser[]> {
  const result = await db.select({
    id: comments.id,
    content: comments.content,
    postId: comments.postId,
    userId: comments.userId,
    createdAt: comments.createdAt,
    user: {
      id: users.id,
      name: users.name,
    },
  })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));

  return result as CommentWithUser[];
}

export async function getAllComments(): Promise<(Comment & { user: { name: string }; post: { title: string } })[]> {
  const result = await db.select({
    id: comments.id,
    content: comments.content,
    postId: comments.postId,
    userId: comments.userId,
    createdAt: comments.createdAt,
    user: {
      name: users.name,
    },
    post: {
      title: posts.title,
    },
  })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .leftJoin(posts, eq(comments.postId, posts.id))
    .orderBy(desc(comments.createdAt));

  return result as (Comment & { user: { name: string }; post: { title: string } })[];
}

export async function deleteComment(id: string): Promise<boolean> {
  await db.delete(comments).where(eq(comments.id, id));
  return true;
}
