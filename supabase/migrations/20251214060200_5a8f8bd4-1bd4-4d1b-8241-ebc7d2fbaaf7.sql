-- Create a table for profile settings (single row)
CREATE TABLE public.profile_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  location TEXT NOT NULL,
  summary TEXT NOT NULL,
  github_url TEXT,
  linkedin_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view profile settings (public portfolio)
CREATE POLICY "Anyone can view profile settings" 
ON public.profile_settings 
FOR SELECT 
USING (true);

-- Authenticated users can update profile settings
CREATE POLICY "Authenticated users can update profile settings" 
ON public.profile_settings 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Authenticated users can insert profile settings
CREATE POLICY "Authenticated users can insert profile settings" 
ON public.profile_settings 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profile_settings_updated_at
BEFORE UPDATE ON public.profile_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a table for experience entries
CREATE TABLE public.experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;

-- Anyone can view experience (public portfolio)
CREATE POLICY "Anyone can view experience" 
ON public.experience 
FOR SELECT 
USING (true);

-- Authenticated users can manage experience
CREATE POLICY "Authenticated users can insert experience" 
ON public.experience 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update experience" 
ON public.experience 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete experience" 
ON public.experience 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_experience_updated_at
BEFORE UPDATE ON public.experience
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();