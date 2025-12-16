-- Enable realtime for experience table
ALTER PUBLICATION supabase_realtime ADD TABLE public.experience;

-- Enable realtime for projects table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Enable realtime for profile_settings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_settings;