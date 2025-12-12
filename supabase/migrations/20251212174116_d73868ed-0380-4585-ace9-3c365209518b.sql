-- Create projects table for portfolio
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public read access for projects (portfolio is public)
CREATE POLICY "Anyone can view projects" 
ON public.projects 
FOR SELECT 
USING (true);

-- Only authenticated users can manage projects (admin)
CREATE POLICY "Authenticated users can insert projects" 
ON public.projects 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" 
ON public.projects 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete projects" 
ON public.projects 
FOR DELETE 
TO authenticated
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();