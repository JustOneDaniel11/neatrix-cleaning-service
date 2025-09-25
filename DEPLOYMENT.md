# Deployment Guide

This guide will walk you through deploying your CleanPro website to GitHub and Vercel.

## Prerequisites

- Git repository with all changes committed
- GitHub account
- Vercel account (can sign up with GitHub)

## Step 1: Create GitHub Repository

### Option A: Using GitHub Website
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the repository details:
   - **Repository name**: `cleaning-service-website` (or your preferred name)
   - **Description**: "Professional cleaning service website built with React and Supabase"
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Option B: Using GitHub CLI (if available)
```bash
gh repo create cleaning-service-website --public --description "Professional cleaning service website built with React and Supabase"
```

## Step 2: Connect Local Repository to GitHub

After creating the GitHub repository, you'll see instructions. Run these commands in your project directory:

```bash
# Add the remote origin (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/cleaning-service-website.git

# Rename the default branch to main (if not already)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "New Project"
3. Import your GitHub repository:
   - Find your `cleaning-service-website` repository
   - Click "Import"
4. Configure the project:
   - **Project Name**: `cleaning-service-website` (or your preferred name)
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following variables:
     ```
     VITE_SUPABASE_URL = your_supabase_project_url
     VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
     ```
6. Click "Deploy"

### Method 2: Vercel CLI

If you have Vercel CLI installed:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - What's your project's name? cleaning-service-website
# - In which directory is your code located? ./
```

## Step 4: Configure Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
5. Redeploy the project to apply the environment variables

## Step 5: Update Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "URL Configuration"
3. Update the following URLs:
   - **Site URL**: `https://your-vercel-app.vercel.app`
   - **Redirect URLs**: Add these URLs:
     - `https://your-vercel-app.vercel.app/email-verification-success`
     - `https://your-vercel-app.vercel.app/reset-password`
     - `https://your-vercel-app.vercel.app/dashboard`

Replace `your-vercel-app` with your actual Vercel app name.

## Step 6: Test Your Deployment

1. Visit your Vercel deployment URL
2. Test the following features:
   - User registration
   - Email verification (check your email)
   - Login/logout
   - Navigation between pages
   - Contact forms
   - Service booking

## Step 7: Set Up Custom Domain (Optional)

### In Vercel:
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### Update Supabase URLs:
After setting up a custom domain, update your Supabase URL configuration to use your custom domain instead of the Vercel subdomain.

## Continuous Deployment

Once connected to GitHub, Vercel will automatically deploy:
- **Production**: Every push to the `main` branch
- **Preview**: Every push to other branches or pull requests

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Ensure environment variables are set correctly
   - Check the build logs in Vercel dashboard

2. **Environment Variables Not Working**:
   - Make sure variables start with `VITE_`
   - Redeploy after adding environment variables
   - Check that variables are set in Vercel dashboard

3. **Supabase Connection Issues**:
   - Verify Supabase URL and key are correct
   - Check that redirect URLs are properly configured
   - Ensure Supabase project is active

4. **Email Verification Not Working**:
   - Check Supabase email template configuration
   - Verify redirect URLs include your production domain
   - Test with a real email address

## Monitoring and Analytics

### Vercel Analytics:
1. Go to your project dashboard
2. Navigate to "Analytics"
3. Enable Vercel Analytics for performance monitoring

### Error Monitoring:
Consider integrating error monitoring services like:
- Sentry
- LogRocket
- Bugsnag

## Security Checklist

- ✅ Environment variables are properly configured
- ✅ Supabase RLS (Row Level Security) policies are in place
- ✅ HTTPS is enabled (automatic with Vercel)
- ✅ Redirect URLs are properly configured
- ✅ No sensitive data in client-side code

## Next Steps

1. Set up monitoring and analytics
2. Configure custom domain
3. Set up automated testing
4. Implement error tracking
5. Add performance monitoring
6. Set up backup strategies

## Support

If you encounter issues during deployment:
1. Check Vercel deployment logs
2. Review Supabase project status
3. Verify all environment variables
4. Test locally first
5. Check GitHub repository permissions

---

Your CleanPro website is now live and ready to serve customers! 🎉