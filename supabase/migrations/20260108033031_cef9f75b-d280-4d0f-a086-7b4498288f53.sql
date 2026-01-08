-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  reading_time INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can view published posts
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
FOR SELECT USING (published = true);

-- Owner can do everything
CREATE POLICY "Owner can insert blog posts" ON public.blog_posts
FOR INSERT WITH CHECK (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can update blog posts" ON public.blog_posts
FOR UPDATE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can delete blog posts" ON public.blog_posts
FOR DELETE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can view all blog posts" ON public.blog_posts
FOR SELECT USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

-- Add trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();