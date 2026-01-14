-- Update RLS policies to use the correct user ID
-- Your current user ID from auth: 2f987c9c-4701-4cff-b58c-0373af6fc8eb

-- Drop old blog_posts policies
DROP POLICY IF EXISTS "Owner can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Owner can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Owner can delete blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Owner can view all blog posts" ON blog_posts;

-- Create new blog_posts policies with correct user ID
CREATE POLICY "Owner can insert blog posts" ON blog_posts
FOR INSERT WITH CHECK (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can update blog posts" ON blog_posts
FOR UPDATE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can delete blog posts" ON blog_posts
FOR DELETE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can view all blog posts" ON blog_posts
FOR SELECT USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

-- Drop old projects policies
DROP POLICY IF EXISTS "Owner can insert projects" ON projects;
DROP POLICY IF EXISTS "Owner can update projects" ON projects;
DROP POLICY IF EXISTS "Owner can delete projects" ON projects;

-- Create new projects policies with correct user ID
CREATE POLICY "Owner can insert projects" ON projects
FOR INSERT WITH CHECK (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can update projects" ON projects
FOR UPDATE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can delete projects" ON projects
FOR DELETE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);