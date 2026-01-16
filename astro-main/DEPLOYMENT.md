# 🚀 Deploying TopBlog to Vercel + Supabase

This guide will walk you through deploying your TopBlog application to Vercel with Supabase as the database.

## ✅ Prerequisites

- GitHub account
- Vercel account (free tier works!)
- Supabase account (free tier works!)

---

## Step 1: Set Up Supabase Database

1. **Go to [supabase.com](https://supabase.com)** and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `TopBlog` (or your preferred name)
   - **Database Password**: Create a strong password and **save it somewhere safe**
   - **Region**: Choose the region closest to your users
4. Click **"Create new project"** and wait ~2 minutes for setup

5. **Get your connection string:**
   - Go to **Settings** → **Database**
   - Scroll to **Connection String**
   - Select **URI** format
   - Copy the connection string (looks like this):
     ```
     postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
     ```
   - **Important**: Replace `[YOUR-PASSWORD]` with the password you created in step 3

---

## Step 2: Push Your Code to GitHub

1. **Initialize Git** (if not already done):

   ```bash
   git init
   git add .
   git commit -m "Initial commit - TopBlog"
   ```

2. **Create a new repository on GitHub:**

   - Go to [github.com/new](https://github.com/new)
   - Name it `TopBlog`
   - **Don't** initialize with README (you already have one)
   - Click **"Create repository"**

3. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/TopBlog.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. Click **"Add New..."** → **"Project"**

3. **Import your repository:**

   - Find `TopBlog` in the list
   - Click **"Import"**

4. **Configure your project:**

   - **Framework Preset**: Astro (should auto-detect)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)

5. **Add Environment Variables:**
   Click **"Environment Variables"** and add these:

   | Name             | Value                                                                          |
   | ---------------- | ------------------------------------------------------------------------------ |
   | `DATABASE_URL`   | Your Supabase connection string from Step 1                                    |
   | `SESSION_SECRET` | A random string (generate one at [randomkeygen.com](https://randomkeygen.com)) |
   | `ADMIN_EMAIL`    | Your admin email (e.g., `admin@yourdomain.com`)                                |
   | `ADMIN_PASSWORD` | A strong admin password                                                        |
   | `SITE_URL`       | Leave blank for now (we'll update after deployment)                            |

6. Click **"Deploy"**

7. **Wait for deployment** (~2-3 minutes)

8. **Update SITE_URL:**
   - Once deployed, copy your Vercel URL (e.g., `https://TopBlog-xyz.vercel.app`)
   - Go to **Settings** → **Environment Variables**
   - Edit `SITE_URL` and paste your Vercel URL
   - Click **"Save"**
   - Redeploy: Go to **Deployments** → Click the three dots on the latest deployment → **"Redeploy"**

---

## Step 4: Test Your Deployment

1. **Visit your site** at the Vercel URL

2. **Create your admin account:**

   - Go to `/login`
   - Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set in environment variables

3. **Create your first post!**

   - Go to Dashboard → New Post
   - Write something awesome

4. **Test the features:**
   - Create a regular user account
   - Comment on posts
   - Test edit/delete functionality

---

## 🎉 You're Live!

Your TopBlog is now live on the internet! Share your Vercel URL with friends.

---

## 📝 Post-Deployment Tips

### Custom Domain

1. Go to Vercel → Your Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `blog.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. Update `SITE_URL` environment variable to your custom domain

### Automatic Deployments

Every time you push to GitHub, Vercel will automatically deploy your changes!

```bash
# Make changes to your code
git add .
git commit -m "Added new feature"
git push

# Vercel will automatically deploy!
```

### Database Backups

Supabase automatically backs up your database. To manually export:

1. Go to Supabase Dashboard
2. **Database** → **Backups**
3. Click **"Download"** on any backup

### Monitoring

- **Vercel Analytics**: Enable in Vercel dashboard for visitor stats
- **Supabase Logs**: View database queries in Supabase dashboard

---

## 🔧 Troubleshooting

### "Cannot connect to database"

- Check that `DATABASE_URL` is correct in Vercel environment variables
- Make sure you replaced `[YOUR-PASSWORD]` with your actual Supabase password
- Verify Supabase project is active (not paused)

### "Admin login not working"

- Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel environment variables
- Try redeploying after setting environment variables

### "Build failed"

- Check the build logs in Vercel
- Make sure all dependencies are in `package.json`
- Try building locally first: `npm run build`

### Database tables not created

- The tables are created automatically on first deployment
- Check Supabase → **Table Editor** to verify tables exist
- If not, check Vercel → **Functions** logs for errors

---

## 🎯 Next Steps

- **Add Email Notifications**: Integrate with SendGrid or Resend
- **Add Image Uploads**: Use Cloudinary or Vercel Blob
- **Enable Analytics**: Add Vercel Analytics or Google Analytics
- **SEO Optimization**: Add sitemap and meta tags
- **Rate Limiting**: Protect against spam with Upstash Redis

---

## 💰 Costs

- **Vercel**: Free tier includes:
  - 100GB bandwidth/month
  - Unlimited deployments
  - Custom domains
- **Supabase**: Free tier includes:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users

Both are more than enough for most blogs!

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Astro Documentation](https://docs.astro.build)

---

**Need help?** Open an issue on GitHub or check the documentation links above.

Happy blogging! 🎉
