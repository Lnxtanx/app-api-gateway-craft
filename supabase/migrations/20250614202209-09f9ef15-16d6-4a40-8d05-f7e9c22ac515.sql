
-- Create scrape_jobs table for distributed job management
CREATE TABLE IF NOT EXISTS public.scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  worker_region TEXT,
  anti_detection_profile TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN,
  result_data JSONB,
  error_message TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_priority_created ON public.scrape_jobs(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_started_at ON public.scrape_jobs(started_at);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_completed_at ON public.scrape_jobs(completed_at);

-- Create function to get job statistics
CREATE OR REPLACE FUNCTION public.get_job_statistics()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE started_at IS NULL),
    'processing', COUNT(*) FILTER (WHERE started_at IS NOT NULL AND completed_at IS NULL),
    'completed', COUNT(*) FILTER (WHERE success = true),
    'failed', COUNT(*) FILTER (WHERE success = false)
  ) INTO stats
  FROM public.scrape_jobs;
  
  RETURN stats;
END;
$$;

-- Create function to increment retry count
CREATE OR REPLACE FUNCTION public.increment_retry_count(job_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.scrape_jobs 
  SET retry_count = retry_count + 1
  WHERE id = job_id
  RETURNING retry_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Enable Row Level Security
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is a scraping service)
CREATE POLICY "Public access to scrape jobs" ON public.scrape_jobs
  FOR ALL USING (true);
