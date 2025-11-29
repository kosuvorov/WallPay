-- WallPay MVP Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('user', 'brand', 'superadmin');

-- Wallpaper status enum
CREATE TYPE wallpaper_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  brand_name TEXT, -- Only for brand accounts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Superadmins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ============================================================
-- WALLPAPERS TABLE
-- ============================================================
CREATE TABLE public.wallpapers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url_1242 TEXT NOT NULL, -- 1242×2688 resolution
  image_url_1179 TEXT NOT NULL, -- 1179×2556 resolution
  status wallpaper_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id)
);

-- Indexes for performance
CREATE INDEX idx_wallpapers_brand_id ON public.wallpapers(brand_id);
CREATE INDEX idx_wallpapers_status ON public.wallpapers(status);
CREATE INDEX idx_wallpapers_created_at ON public.wallpapers(created_at DESC);

-- RLS Policies for wallpapers
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view their own wallpapers"
  ON public.wallpapers FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can insert their own wallpapers"
  ON public.wallpapers FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own pending wallpapers"
  ON public.wallpapers FOR UPDATE
  USING (auth.uid() = brand_id AND status = 'pending');

CREATE POLICY "Superadmins can view all wallpapers"
  ON public.wallpapers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can update all wallpapers"
  ON public.wallpapers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Users can view approved wallpapers"
  ON public.wallpapers FOR SELECT
  USING (status = 'approved');

-- ============================================================
-- DAILY WALLPAPER SELECTIONS TABLE
-- ============================================================
CREATE TABLE public.daily_wallpaper_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  live_date DATE NOT NULL,
  selected_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallpaper_id, live_date)
);

-- Index for querying today's wallpapers
CREATE INDEX idx_daily_selections_live_date ON public.daily_wallpaper_selections(live_date DESC);
CREATE INDEX idx_daily_selections_wallpaper_id ON public.daily_wallpaper_selections(wallpaper_id);

-- RLS Policies for daily selections
ALTER TABLE public.daily_wallpaper_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage daily selections"
  ON public.daily_wallpaper_selections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Users can view today's and future selections"
  ON public.daily_wallpaper_selections FOR SELECT
  USING (live_date >= CURRENT_DATE);

-- ============================================================
-- ANALYTICS EVENTS TABLE
-- ============================================================
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'wallpaper_set',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_analytics_wallpaper_id ON public.analytics_events(wallpaper_id);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_user_id ON public.analytics_events(user_id);

-- RLS Policies for analytics
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can view events for their wallpapers"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wallpapers w
      WHERE w.id = wallpaper_id AND w.brand_id = auth.uid()
    )
  );

CREATE POLICY "Superadmins can view all events"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for wallpapers table
CREATE TRIGGER update_wallpapers_updated_at
  BEFORE UPDATE ON public.wallpapers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get today's live wallpapers
CREATE OR REPLACE FUNCTION get_todays_wallpapers()
RETURNS TABLE (
  id UUID,
  brand_name TEXT,
  title TEXT,
  description TEXT,
  image_url_1242 TEXT,
  image_url_1179 TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.brand_name,
    w.title,
    w.description,
    w.image_url_1242,
    w.image_url_1179
  FROM public.wallpapers w
  INNER JOIN public.daily_wallpaper_selections dws 
    ON w.id = dws.wallpaper_id
  WHERE dws.live_date = CURRENT_DATE
    AND w.status = 'approved'
  ORDER BY RANDOM();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get wallpaper stats
CREATE OR REPLACE FUNCTION get_wallpaper_stats(wallpaper_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(ae.created_at) as date,
    COUNT(*) as count
  FROM public.analytics_events ae
  WHERE ae.wallpaper_id = wallpaper_uuid
    AND ae.created_at >= (CURRENT_DATE - days_back)
  GROUP BY DATE(ae.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DATA (for development/testing)
-- ============================================================

-- Create a superadmin user (you'll need to update this with your actual auth.users ID)
-- Run this after creating your first user via Supabase Auth:
-- INSERT INTO public.users (id, email, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin@wallpay.com', 'superadmin');
