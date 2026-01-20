# rcmndo

A mobile-first web app for friends to recommend TV shows and movies and share how to watch them.

## Features

- **Friends-Only Feed**: See recommendations only from people you trust
- **TMDB Integration**: Search movies and TV shows with rich metadata
- **Where to Watch**: Know which streaming platform has your content
- **Personal Watchlist**: Save recommendations and track what you've watched
- **Reactions & Comments**: Engage with your friends' recommendations
- **Invite Links**: Add friends via shareable invite codes

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 (mobile-first, dark mode default)
- **Database**: Neon (Serverless PostgreSQL) with Drizzle ORM
- **Auth**: Supabase Auth (Magic Link / OTP)
- **External API**: TMDB for movie/TV metadata

## Prerequisites

- Node.js 18+
- npm or yarn
- Neon account (free tier works) - [neon.tech](https://neon.tech)
- Supabase account (free tier works) - for authentication
- TMDB API key (free)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rcmndo
npm install
```

### 2. Set Up Neon Database

1. Create a new project at [neon.tech](https://neon.tech)
2. Copy your connection string → `DATABASE_URL`
3. Run the database migration:

```bash
# Generate migration from schema
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push
```

Or manually run the SQL from `supabase/migrations/001_initial_schema.sql` in the Neon SQL editor (remove RLS policies as they're Supabase-specific).

### 3. Set Up Supabase (Auth Only)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Configure Auth:
   - Go to **Authentication > Providers**
   - Enable **Email** provider
   - Under **Email Templates**, customize if desired
   - Go to **Authentication > URL Configuration**
   - Add your site URL to **Site URL** (e.g., `http://localhost:3000` for development)
   - Add redirect URLs as needed

### 4. Set Up TMDB

1. Create an account at [themoviedb.org](https://www.themoviedb.org)
2. Go to **Settings > API**
3. Request an API key (choose "Developer" option)
4. Copy your API Key (v3 auth) → `TMDB_API_KEY`

### 5. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TMDB_API_KEY=your-tmdb-api-key
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repo
2. Add environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `TMDB_API_KEY`
3. Deploy!

### 3. Update Supabase Auth

After deployment, update your Supabase settings:
1. Go to **Authentication > URL Configuration**
2. Update **Site URL** to your Vercel domain
3. Add your Vercel URL to **Redirect URLs**

## Database Schema

### Tables

- **users** - User profiles
- **friendships** - Friend relationships with status
- **invite_links** - Shareable invite codes
- **titles** - Movies/TV shows from TMDB
- **recommendations** - User recommendations with notes
- **reactions** - Likes on recommendations
- **comments** - Comments on recommendations
- **watch_status** - User's watchlist tracking

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes with bottom nav
│   │   ├── feed/           # Home feed
│   │   ├── search/         # TMDB search
│   │   ├── recommend/      # Create recommendation
│   │   ├── watchlist/      # User's watchlist
│   │   ├── profile/        # User profile & settings
│   │   ├── friends/        # Friend management
│   │   └── title/[id]/     # Title detail page
│   ├── (auth)/             # Auth routes (no nav)
│   │   ├── login/
│   │   ├── signup/
│   │   └── onboarding/
│   └── api/
│       └── tmdb/           # TMDB API routes
├── components/
│   ├── layout/             # App shell, nav, header
│   ├── recommendation/     # Recommendation cards
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── db/                 # Drizzle ORM (schema, queries)
│   ├── supabase/           # Supabase auth clients
│   ├── tmdb.ts             # TMDB API helpers
│   └── utils.ts            # Utility functions
└── types/
    └── database.ts         # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx drizzle-kit generate` - Generate database migrations
- `npx drizzle-kit push` - Push schema to database
- `npx drizzle-kit studio` - Open Drizzle Studio (database GUI)

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
