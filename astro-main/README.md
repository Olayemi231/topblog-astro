# TopBlog - Database-Backed Blogging Platform

A modern, full-featured blogging platform built with Astro, featuring server-side rendering, user authentication, and a beautiful dark-mode design.

## 🚀 Features

- **User Authentication**: Secure registration and login with bcrypt password hashing
- **Blog Management**: Create, edit, and delete blog posts with automatic excerpt generation
- **Comment System**: Engage with readers through a fully functional comment system
- **Admin Dashboard**: Complete administrative control over users and content
- **Responsive Design**: Beautiful, modern UI built with Tailwind CSS v4
- **Database-Backed**: SQLite database with Drizzle ORM for type-safe queries
- **Server-Side Rendering**: Fast page loads with Astro SSR

## 📋 Database Design

### Tables

#### Users

- `id` (TEXT, PRIMARY KEY): Unique user identifier
- `name` (TEXT): User's display name
- `email` (TEXT, UNIQUE): User's email address
- `password_hash` (TEXT): Bcrypt-hashed password
- `role` (TEXT): User role ('user' or 'admin')
- `created_at` (INTEGER): Timestamp of account creation
- `updated_at` (INTEGER): Timestamp of last update

#### Posts

- `id` (TEXT, PRIMARY KEY): Unique post identifier
- `title` (TEXT): Post title
- `content` (TEXT): Full post content
- `excerpt` (TEXT): Short preview text
- `author_id` (TEXT, FOREIGN KEY): References users.id
- `created_at` (INTEGER): Post creation timestamp
- `updated_at` (INTEGER): Last edit timestamp

#### Comments

- `id` (TEXT, PRIMARY KEY): Unique comment identifier
- `content` (TEXT): Comment text
- `post_id` (TEXT, FOREIGN KEY): References posts.id
- `user_id` (TEXT, FOREIGN KEY): References users.id
- `created_at` (INTEGER): Comment timestamp

#### Sessions

- `id` (TEXT, PRIMARY KEY): Session identifier
- `user_id` (TEXT, FOREIGN KEY): References users.id
- `expires_at` (INTEGER): Session expiration timestamp

### Relationships

- Users → Posts (One-to-Many): A user can author multiple posts
- Users → Comments (One-to-Many): A user can write multiple comments
- Posts → Comments (One-to-Many): A post can have multiple comments
- Users → Sessions (One-to-Many): A user can have multiple active sessions

All foreign keys use CASCADE deletion to maintain referential integrity.

## 🎨 Site Design & Navigation

### Pages

1. **Home Page** (`/`)

   - Hero section with call-to-action
   - Latest 5 blog posts in reverse chronological order
   - Feature highlights
   - Responsive post cards with author info

2. **Authentication Pages**

   - `/login` - User login with redirect support
   - `/register` - New user registration with password confirmation

3. **User Dashboard** (`/dashboard`)

   - Personal statistics (post count, role, status)
   - List of user's posts with edit/delete actions
   - Quick access to create new posts

4. **Post Management**

   - `/dashboard/new` - Create new blog post
   - `/dashboard/edit/[id]` - Edit existing post
   - Authorization checks ensure users can only edit their own posts

5. **Single Post View** (`/post/[id]`)

   - Full post content display
   - Author information
   - Comment section with real-time interaction
   - Edit/delete buttons for post owners and admins

6. **Admin Dashboard** (`/admin`)

   - System-wide user management
   - All posts overview with moderation tools
   - User deletion capabilities
   - Admin-only access

7. **Error Page** (`/404`)
   - Custom 404 page with brand styling

### Navigation Structure

- **Header**: Logo, navigation links, user profile/auth buttons
- **Footer**: Brand info, quick links, social media placeholders
- **Mobile-Responsive**: Hamburger menu for mobile devices

## 🛠️ Development Process

### 1. Project Initialization

```bash
npx create-astro@latest ./ --template minimal --install --git --yes
npx astro add tailwind node --yes
npm install drizzle-orm better-sqlite3 bcryptjs uuid
npm install -D drizzle-kit @types/better-sqlite3 @types/bcryptjs @types/uuid
```

### 2. Database Setup

- Created schema with Drizzle ORM (`src/lib/db/schema.ts`)
- Implemented database initialization (`src/lib/db/index.ts`)
- Added automatic admin user seeding on first run

### 3. Authentication System

- Built authentication utilities (`src/lib/auth.ts`)
- Implemented session management with 7-day expiration
- Created middleware for route protection (`src/middleware.ts`)
- Added API routes for login, register, and logout

### 4. Content Management

- Developed post CRUD operations (`src/lib/posts.ts`)
- Implemented comment system with user associations
- Created API routes for all database operations
- Added authorization checks for edit/delete actions

### 5. UI Development

- Designed custom Tailwind theme with dark mode
- Created reusable component classes
- Built responsive layouts with glassmorphism effects
- Added smooth animations and transitions

### 6. Admin Features

- Implemented admin-only dashboard
- Added user management capabilities
- Created system-wide content moderation tools

## 🚀 Deployment Instructions

### Local Development

1. **Clone and Install**

   ```bash
   cd /Users/innbuld/Desktop/astro
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file (or copy from `.env.example`):

   ```env
   DATABASE_URL=./data/blog.db
   SESSION_SECRET=your-super-secret-key-change-this-in-production
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=AdminPassword123!
   SITE_URL=http://localhost:4321
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:4321`

4. **Initial Admin Login**
   - Email: `admin@example.com` (or your ADMIN_EMAIL)
   - Password: `AdminPassword123!` (or your ADMIN_PASSWORD)

### Production Build

1. **Build the Project**

   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   node ./dist/server/entry.mjs
   ```

### Deployment Platforms

#### Vercel/Netlify (Serverless)

1. Change adapter in `astro.config.mjs`:

   ```javascript
   import vercel from "@astrojs/vercel/serverless";
   // or
   import netlify from "@astrojs/netlify";

   export default defineConfig({
     adapter: vercel(), // or netlify()
   });
   ```

2. Set environment variables in platform dashboard
3. Deploy via Git integration

#### VPS/Dedicated Server

1. Build the project locally or via CI/CD
2. Copy `dist/` folder to server
3. Install Node.js on server
4. Run with PM2 or similar process manager:
   ```bash
   pm2 start dist/server/entry.mjs --name TopBlog
   ```

#### Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY data ./data
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
```

### Important Notes

- **Database**: SQLite is great for small-to-medium sites. For high traffic, consider PostgreSQL with Drizzle
- **Sessions**: Currently stored in database. For distributed systems, use Redis
- **File Uploads**: Not implemented. Add Cloudinary or S3 integration for images
- **Email**: No email verification. Add nodemailer for production use

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **Session Management**: HTTP-only cookies with secure flag in production
- **CSRF Protection**: Astro's built-in origin checking enabled
- **SQL Injection**: Protected by Drizzle ORM's parameterized queries
- **Authorization**: Middleware-based route protection
- **Role-Based Access**: Admin vs User permissions

## 📦 Project Structure

```
/Users/innbuld/Desktop/astro/
├── src/
│   ├── env.d.ts                 # TypeScript definitions
│   ├── middleware.ts            # Auth & route protection
│   ├── layouts/
│   │   └── Layout.astro         # Main layout with nav/footer
│   ├── lib/
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── posts.ts             # Post & comment operations
│   │   └── db/
│   │       ├── index.ts         # Database connection
│   │       └── schema.ts        # Drizzle schema definitions
│   ├── pages/
│   │   ├── index.astro          # Home page
│   │   ├── login.astro          # Login page
│   │   ├── register.astro       # Registration page
│   │   ├── 404.astro            # Error page
│   │   ├── dashboard/
│   │   │   ├── index.astro      # User dashboard
│   │   │   ├── new.astro        # Create post
│   │   │   └── edit/[id].astro  # Edit post
│   │   ├── post/
│   │   │   └── [id].astro       # Single post view
│   │   ├── admin/
│   │   │   └── index.astro      # Admin dashboard
│   │   └── api/
│   │       ├── auth/            # Auth API routes
│   │       ├── posts/           # Post API routes
│   │       ├── comments/        # Comment API routes
│   │       └── admin/           # Admin API routes
│   └── styles/
│       └── global.css           # Tailwind + custom styles
├── public/
│   └── favicon.svg              # Site icon
├── data/
│   └── blog.db                  # SQLite database (auto-created)
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── astro.config.mjs             # Astro configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🎯 Key Technologies

- **Framework**: Astro 5.16.6 with SSR
- **Styling**: Tailwind CSS v4 with custom theme
- **Database**: SQLite + Drizzle ORM
- **Authentication**: bcryptjs + custom session management
- **Deployment**: Node.js adapter (standalone mode)
- **TypeScript**: Full type safety

## 🌐 Live Demo

**[Live Site Placeholder]**: https://your-TopBlog-demo.vercel.app

_(Update this link after deployment)_

## 📝 Usage Guide

### For Users

1. **Register**: Create an account at `/register`
2. **Create Posts**: Go to Dashboard → New Post
3. **Edit Posts**: Click edit on any of your posts
4. **Comment**: Visit any post and add your thoughts
5. **Manage Content**: View all your posts in the dashboard

### For Admins

1. **Access Admin Panel**: Navigate to `/admin`
2. **Manage Users**: View all users, delete accounts if needed
3. **Moderate Content**: Edit or delete any post system-wide
4. **Monitor Activity**: See all posts and comments in one place

## 🔧 Customization

### Change Theme Colors

Edit `src/styles/global.css` in the `@theme` section:

```css
@theme {
  --color-primary-500: #0ea5e9; /* Your primary color */
  --color-accent-500: #d946ef; /* Your accent color */
}
```

### Add Email Notifications

Install nodemailer and create email utilities in `src/lib/email.ts`

### Switch to PostgreSQL

1. Install `pg` and `drizzle-orm`
2. Update `src/lib/db/index.ts` to use PostgreSQL driver
3. Update connection string in `.env`

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Credits

Built with ❤️ using Astro, Tailwind CSS, and modern web technologies.

---

**Need Help?** Check the Astro documentation at https://docs.astro.build
