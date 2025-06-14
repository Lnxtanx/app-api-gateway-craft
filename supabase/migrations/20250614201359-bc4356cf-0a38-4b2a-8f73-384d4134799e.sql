
-- Create content_snapshots table for change detection
CREATE TABLE IF NOT EXISTS public.content_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  snapshot_data JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(api_id)
);

-- Create api_notifications table for change notifications
CREATE TABLE IF NOT EXISTS public.api_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_id TEXT NOT NULL,
  change_type TEXT NOT NULL,
  notification_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Create api_usage_patterns table for predictive caching
CREATE TABLE IF NOT EXISTS public.api_usage_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  parameters JSONB,
  user_location TEXT,
  access_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hour_of_day INTEGER,
  day_of_week INTEGER
);

-- Enable Row Level Security
ALTER TABLE public.content_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_patterns ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since these are for API monitoring)
CREATE POLICY "Public can view content snapshots" ON public.content_snapshots FOR SELECT USING (true);
CREATE POLICY "Public can insert content snapshots" ON public.content_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update content snapshots" ON public.content_snapshots FOR UPDATE USING (true);

CREATE POLICY "Public can view api notifications" ON public.api_notifications FOR SELECT USING (true);
CREATE POLICY "Public can insert api notifications" ON public.api_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update api notifications" ON public.api_notifications FOR UPDATE USING (true);

CREATE POLICY "Public can view usage patterns" ON public.api_usage_patterns FOR SELECT USING (true);
CREATE POLICY "Public can insert usage patterns" ON public.api_usage_patterns FOR INSERT WITH CHECK (true);

-- Enable realtime for api_notifications table
ALTER TABLE public.api_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.api_notifications;
