# Rcmndo Setup Guide

This guide walks you through deploying rcmndo with Neon (PostgreSQL) and Vercel.

## Prerequisites

- Node.js 18+ installed locally
- A [Neon](https://neon.tech) account (free tier available)
- A [Vercel](https://vercel.com) account (free tier available)
- A [TMDB API key](https://developer.themoviedb.org/docs) (free)
- An email service for magic links (e.g., Resend, SendGrid, or any SMTP)

## Step 1: Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech) and create a new project
2. Choose a region close to your users
3. Once created, copy the connection string from the dashboard
   - It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

## Step 2: Set Up Email Service

For magic link authentication, you need an email service. Here are some options:

### Option A: Resend (Recommended)
1. Sign up at [Resend](https://resend.com)
2. Verify your domain or use their test domain
3. Create an API key
4. Use these settings:
   ```
   EMAIL_SERVER_HOST=smtp.resend.com
   EMAIL_SERVER_PORT=465
   EMAIL_SERVER_USER=resend
   EMAIL_SERVER_PASSWORD=re_your_api_key
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Option B: SendGrid
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key with Mail Send permissions
3. Use these settings:
   ```
   EMAIL_SERVER_HOST=smtp.sendgrid.net
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=apikey
   EMAIL_SERVER_PASSWORD=your_sendgrid_api_key
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Option C: Gmail (Development Only)
1. Enable 2FA on your Google account
2. Create an App Password at https://myaccount.google.com/apppasswords
3. Use these settings:
   ```
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your.email@gmail.com
   EMAIL_SERVER_PASSWORD=your_app_password
   EMAIL_FROM=your.email@gmail.com
   ```

## Step 3: Get TMDB API Key

1. Create an account at [TMDB](https://www.themoviedb.org/signup)
2. Go to Settings > API
3. Request an API key (choose "Developer" option)
4. Copy the API Key (v3 auth)

## Step 4: Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rcmndo.git
   cd rcmndo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`:
   ```
   # Database
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

   # NextAuth
   NEXTAUTH_SECRET=your-random-secret-here
   NEXTAUTH_URL=http://localhost:3000

   # Email (example with Resend)
   EMAIL_SERVER_HOST=smtp.resend.com
   EMAIL_SERVER_PORT=465
   EMAIL_SERVER_USER=resend
   EMAIL_SERVER_PASSWORD=re_your_api_key
   EMAIL_FROM=noreply@yourdomain.com

   # TMDB
   TMDB_API_KEY=your_tmdb_api_key
   ```

   Generate a secure NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

5. Push the database schema to Neon:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open http://localhost:3000 in your browser

## Step 5: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables in Vercel Dashboard:
   - Go to your project settings > Environment Variables
   - Add all the variables from your `.env.local`
   - Update `NEXTAUTH_URL` to your production URL (e.g., `https://rcmndo.vercel.app`)

### Option B: Deploy via GitHub

1. Push your code to GitHub

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "New Project" and import your repository

4. Add environment variables before deploying:
   - `DATABASE_URL` - Your Neon connection string
   - `NEXTAUTH_SECRET` - A secure random string
   - `NEXTAUTH_URL` - Your Vercel URL (e.g., `https://rcmndo.vercel.app`)
   - `EMAIL_SERVER_HOST` - Your email server host
   - `EMAIL_SERVER_PORT` - Your email server port
   - `EMAIL_SERVER_USER` - Your email username
   - `EMAIL_SERVER_PASSWORD` - Your email password
   - `EMAIL_FROM` - Your sender email address
   - `TMDB_API_KEY` - Your TMDB API key

5. Click "Deploy"

## Step 6: Run Database Migrations (Production)

After your first deployment, run the database push command to create the tables:

```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="your-neon-connection-string"
npm run db:push
```

Or you can use Vercel's environment variables:
```bash
vercel env pull .env.production.local
npm run db:push
```

## Troubleshooting

### "DATABASE_URL not set" during build
This is expected during build time. The app handles this gracefully by using a placeholder connection string during static generation.

### Email not sending
1. Check your spam folder
2. Verify your email service credentials
3. Make sure your sender domain is verified (for Resend/SendGrid)
4. Check the Vercel function logs for errors

### Database connection errors
1. Make sure your Neon database is not paused (free tier pauses after 5 minutes of inactivity)
2. Check that SSL mode is enabled in your connection string
3. Verify the connection string format

### NextAuth errors
1. Make sure `NEXTAUTH_SECRET` is set
2. Make sure `NEXTAUTH_URL` matches your actual domain
3. For production, don't include a trailing slash in `NEXTAUTH_URL`

## Neon + Vercel Integration (Optional)

For a seamless experience, you can use the Neon-Vercel integration:

1. Go to [Vercel Integrations](https://vercel.com/integrations/neon)
2. Install the Neon integration
3. Connect your Neon project
4. Vercel will automatically set the `DATABASE_URL` environment variable

This also enables:
- Automatic preview databases for PR previews
- Connection pooling optimization
- Automatic secret rotation

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for JWT encryption |
| `NEXTAUTH_URL` | Yes | Your app's base URL |
| `EMAIL_SERVER_HOST` | Yes | SMTP server hostname |
| `EMAIL_SERVER_PORT` | Yes | SMTP server port |
| `EMAIL_SERVER_USER` | Yes | SMTP username |
| `EMAIL_SERVER_PASSWORD` | Yes | SMTP password |
| `EMAIL_FROM` | Yes | Sender email address |
| `TMDB_API_KEY` | Yes | TMDB API key for movie/TV data |
