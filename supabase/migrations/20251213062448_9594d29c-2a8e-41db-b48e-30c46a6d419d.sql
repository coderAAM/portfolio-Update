-- Create messages table for contact form
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert messages (contact form)
CREATE POLICY "Anyone can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can view messages
CREATE POLICY "Authenticated users can view messages" 
ON public.messages 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only authenticated users can update messages (mark as read)
CREATE POLICY "Authenticated users can update messages" 
ON public.messages 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete messages
CREATE POLICY "Authenticated users can delete messages" 
ON public.messages 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Storage policies for profile images
CREATE POLICY "Anyone can view profile images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can update profile images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can delete profile images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-images');