-- rcmndo Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUM TYPES
-- ===========================================

CREATE TYPE platform_type AS ENUM (
  'netflix',
  'prime',
  'disney',
  'hulu',
  'hbo',
  'apple',
  'peacock',
  'paramount',
  'other'
);

CREATE TYPE friendship_status AS ENUM ('pending', 'accepted');

CREATE TYPE watch_status_type AS ENUM ('saved', 'watching', 'watched');

CREATE TYPE title_type AS ENUM ('movie', 'tv');

-- ===========================================
-- TABLES
-- ===========================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for username lookups
CREATE INDEX idx_users_username ON public.users(username);

-- Friendships table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status friendship_status DEFAULT 'pending' NOT NULL,
  invite_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id),
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id)
);

-- Indexes for friendship lookups
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);

-- Invite links table
CREATE TABLE public.invite_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for invite code lookups
CREATE INDEX idx_invite_links_code ON public.invite_links(code);
CREATE INDEX idx_invite_links_user ON public.invite_links(user_id);

-- Titles table (movies and TV shows from TMDB)
CREATE TABLE public.titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_id INTEGER NOT NULL,
  type title_type NOT NULL,
  name TEXT NOT NULL,
  year INTEGER,
  poster_url TEXT,
  backdrop_url TEXT,
  overview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_tmdb_title UNIQUE (tmdb_id, type)
);

-- Indexes for title lookups
CREATE INDEX idx_titles_tmdb ON public.titles(tmdb_id, type);
CREATE INDEX idx_titles_name ON public.titles(name);

-- Recommendations table
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  note TEXT CHECK (char_length(note) <= 240),
  tags TEXT[] DEFAULT '{}',
  platform platform_type,
  watch_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_recommendation UNIQUE (user_id, title_id)
);

-- Indexes for recommendation lookups
CREATE INDEX idx_recommendations_user ON public.recommendations(user_id);
CREATE INDEX idx_recommendations_title ON public.recommendations(title_id);
CREATE INDEX idx_recommendations_created ON public.recommendations(created_at DESC);
CREATE INDEX idx_recommendations_platform ON public.recommendations(platform);

-- Reactions table (likes)
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'like' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_reaction UNIQUE (user_id, recommendation_id)
);

-- Indexes for reaction lookups
CREATE INDEX idx_reactions_recommendation ON public.reactions(recommendation_id);
CREATE INDEX idx_reactions_user ON public.reactions(user_id);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for comment lookups
CREATE INDEX idx_comments_recommendation ON public.comments(recommendation_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_created ON public.comments(created_at DESC);

-- Watch status table (user's personal watchlist)
CREATE TABLE public.watch_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  status watch_status_type DEFAULT 'saved' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_watch_status UNIQUE (user_id, title_id)
);

-- Indexes for watch status lookups
CREATE INDEX idx_watch_status_user ON public.watch_status(user_id);
CREATE INDEX idx_watch_status_title ON public.watch_status(title_id);
CREATE INDEX idx_watch_status_status ON public.watch_status(status);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function to get friend IDs for a user
CREATE OR REPLACE FUNCTION get_friend_ids(p_user_id UUID)
RETURNS TABLE (friend_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN f.requester_id = p_user_id THEN f.addressee_id
      ELSE f.requester_id
    END as friend_id
  FROM public.friendships f
  WHERE (f.requester_id = p_user_id OR f.addressee_id = p_user_id)
    AND f.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((requester_id = user1_id AND addressee_id = user2_id)
           OR (requester_id = user2_id AND addressee_id = user1_id))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate short invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_status_updated_at
  BEFORE UPDATE ON public.watch_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_status ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- USERS POLICIES
-- ===========================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can read friends' profiles
CREATE POLICY "Users can read friends profiles"
  ON public.users FOR SELECT
  USING (
    id IN (SELECT friend_id FROM get_friend_ids(auth.uid()))
  );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ===========================================
-- FRIENDSHIPS POLICIES
-- ===========================================

-- Users can read their own friendships
CREATE POLICY "Users can read own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can create friendship requests
CREATE POLICY "Users can create friendship requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can update friendships they're part of
CREATE POLICY "Users can update own friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can delete friendships they're part of
CREATE POLICY "Users can delete own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ===========================================
-- INVITE LINKS POLICIES
-- ===========================================

-- Users can read their own invite links
CREATE POLICY "Users can read own invite links"
  ON public.invite_links FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone authenticated can read valid invite links by code
CREATE POLICY "Anyone can read invite links by code"
  ON public.invite_links FOR SELECT
  USING (expires_at > NOW() AND used_by IS NULL);

-- Users can create their own invite links
CREATE POLICY "Users can create own invite links"
  ON public.invite_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update invite links (mark as used)
CREATE POLICY "Users can update invite links"
  ON public.invite_links FOR UPDATE
  USING (auth.uid() = user_id OR (expires_at > NOW() AND used_by IS NULL));

-- ===========================================
-- TITLES POLICIES
-- ===========================================

-- Everyone can read titles
CREATE POLICY "Anyone can read titles"
  ON public.titles FOR SELECT
  USING (true);

-- Authenticated users can insert titles
CREATE POLICY "Authenticated users can insert titles"
  ON public.titles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ===========================================
-- RECOMMENDATIONS POLICIES
-- ===========================================

-- Users can read their own recommendations
CREATE POLICY "Users can read own recommendations"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can read friends' recommendations
CREATE POLICY "Users can read friends recommendations"
  ON public.recommendations FOR SELECT
  USING (
    user_id IN (SELECT friend_id FROM get_friend_ids(auth.uid()))
  );

-- Users can insert their own recommendations
CREATE POLICY "Users can insert own recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recommendations
CREATE POLICY "Users can update own recommendations"
  ON public.recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own recommendations
CREATE POLICY "Users can delete own recommendations"
  ON public.recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- REACTIONS POLICIES
-- ===========================================

-- Users can read reactions on visible recommendations
CREATE POLICY "Users can read reactions"
  ON public.reactions FOR SELECT
  USING (
    recommendation_id IN (
      SELECT id FROM public.recommendations
      WHERE user_id = auth.uid()
         OR user_id IN (SELECT friend_id FROM get_friend_ids(auth.uid()))
    )
  );

-- Users can create their own reactions
CREATE POLICY "Users can create reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND recommendation_id IN (
      SELECT id FROM public.recommendations
      WHERE user_id = auth.uid()
         OR user_id IN (SELECT friend_id FROM get_friend_ids(auth.uid()))
    )
  );

-- Users can delete their own reactions
CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- COMMENTS POLICIES
-- ===========================================

-- Users can read comments on visible recommendations
CREATE POLICY "Users can read comments"
  ON public.comments FOR SELECT
  USING (
    recommendation_id IN (
      SELECT id FROM public.recommendations
      WHERE user_id = auth.uid()
         OR user_id IN (SELECT friend_id FROM get_friend_ids(auth.uid()))
    )
  );

-- Users can create comments on visible recommendations
CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND recommendation_id IN (
      SELECT id FROM public.recommendations
      WHERE user_id = auth.uid()
         OR user_id IN (SELECT friend_id FROM get_friend_ids(auth.uid()))
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- WATCH STATUS POLICIES
-- ===========================================

-- Users can read their own watch status
CREATE POLICY "Users can read own watch status"
  ON public.watch_status FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own watch status
CREATE POLICY "Users can insert own watch status"
  ON public.watch_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own watch status
CREATE POLICY "Users can update own watch status"
  ON public.watch_status FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own watch status
CREATE POLICY "Users can delete own watch status"
  ON public.watch_status FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- HELPER VIEWS
-- ===========================================

-- View for feed with all necessary data
CREATE OR REPLACE VIEW public.feed_view AS
SELECT
  r.id as recommendation_id,
  r.user_id,
  r.title_id,
  r.note,
  r.tags,
  r.platform,
  r.watch_url,
  r.created_at,
  u.name as user_name,
  u.username,
  u.avatar_url as user_avatar,
  t.tmdb_id,
  t.type as title_type,
  t.name as title_name,
  t.year as title_year,
  t.poster_url,
  t.backdrop_url,
  (SELECT COUNT(*) FROM public.reactions WHERE recommendation_id = r.id) as reaction_count,
  (SELECT COUNT(*) FROM public.comments WHERE recommendation_id = r.id) as comment_count
FROM public.recommendations r
JOIN public.users u ON r.user_id = u.id
JOIN public.titles t ON r.title_id = t.id;
