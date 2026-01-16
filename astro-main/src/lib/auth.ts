import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { users, sessions, type User, type NewUser } from './db/schema';
import { eq, and, gt, lt } from 'drizzle-orm';

const SALT_ROUNDS = 12;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// User management
export async function createUser(data: { 
  name: string; 
  email: string; 
  password: string; 
  role?: 'user' | 'admin' 
}): Promise<User> {
  const passwordHash = await hashPassword(data.password);
  const id = uuidv4();
  const now = new Date();

  const [user] = await db.insert(users).values({
    id,
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    role: data.role || 'user',
    createdAt: now,
    updatedAt: now,
  }).returning();

  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function updateUser(id: string, data: Partial<{ 
  name: string; 
  email: string; 
  password: string; 
  role: 'user' | 'admin' 
}>): Promise<User | undefined> {
  const updateData: Partial<NewUser> = {
    updatedAt: new Date(),
  };

  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email.toLowerCase();
  if (data.password) updateData.passwordHash = await hashPassword(data.password);
  if (data.role) updateData.role = data.role;

  const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await db.delete(users).where(eq(users.id, id));
  return true;
}

export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users);
}

// Session management
export async function createSession(userId: string): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

export async function validateSession(sessionId: string): Promise<User | null> {
  const now = new Date();

  const [session] = await db.select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)));

  if (!session) return null;

  const user = await getUserById(session.userId);
  return user || null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date();
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
}

// Login/Register
export async function login(email: string, password: string): Promise<{ user: User; sessionId: string } | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  const sessionId = await createSession(user.id);
  return { user, sessionId };
}

export async function register(data: { 
  name: string; 
  email: string; 
  password: string 
}): Promise<{ user: User; sessionId: string } | { error: string }> {
  const existing = await getUserByEmail(data.email);
  if (existing) {
    return { error: 'Email already registered' };
  }

  const user = await createUser(data);
  const sessionId = await createSession(user.id);
  return { user, sessionId };
}
