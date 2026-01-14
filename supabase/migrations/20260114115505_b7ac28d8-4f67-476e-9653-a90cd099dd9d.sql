-- Fix profile_settings security: restrict public read access
-- Create a view with only non-sensitive fields for public access

-- First, drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view profile settings" ON profile_settings;

-- Create a restrictive policy - only owner can view full profile
CREATE POLICY "Owner can view profile settings" ON profile_settings
FOR SELECT USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

-- Create a secure view for public profile data (without sensitive info)
CREATE OR REPLACE VIEW public.public_profile
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  title,
  location,
  summary,
  github_url,
  linkedin_url,
  image_url,
  website,
  created_at,
  updated_at
FROM profile_settings;
-- Note: email and phone are intentionally excluded for privacy

-- Grant access to the view
GRANT SELECT ON public.public_profile TO anon, authenticated;