-- Create a table to track page visits
CREATE TABLE public.page_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL DEFAULT '/',
  visitor_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert visits (anonymous tracking)
CREATE POLICY "Anyone can insert page visits" 
ON public.page_visits 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can view visits (for admin dashboard)
CREATE POLICY "Authenticated users can view page visits" 
ON public.page_visits 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create an index for faster date-based queries
CREATE INDEX idx_page_visits_created_at ON public.page_visits (created_at DESC);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_visits;