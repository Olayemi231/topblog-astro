import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Get database URL from environment (works in both dev and production)
const connectionString = 
  typeof process !== 'undefined' && process.env?.DATABASE_URL 
    ? process.env.DATABASE_URL 
    : import.meta.env?.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Required for Supabase Transaction Pooler
});

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    // Create posts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    // Create comments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL
      );
    `);

    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL
      );
    `);

    // Create indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);`);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Seed admin user
export async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    const existingAdmin = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, adminEmail.toLowerCase()))
      .limit(1);

    if (existingAdmin.length === 0) {
      console.log('🌱 Seeding initial admin user...');
      const id = uuidv4();
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const now = new Date();

      await db.insert(schema.users).values({
        id,
        name: 'Admin',
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ Admin user created: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Admin seeding error:', error);
  }
}

// Run initialization
initializeDatabase().then(() => seedAdmin()).catch(console.error);

export { schema };
