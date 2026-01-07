-- Update RLS policies for all tables to only allow specific user (31f87836-1cd3-45a5-881c-859652683b5b)

-- Messages table
DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON public.messages;

CREATE POLICY "Owner can view messages" ON public.messages
FOR SELECT USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can update messages" ON public.messages
FOR UPDATE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can delete messages" ON public.messages
FOR DELETE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

-- Projects table
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

CREATE POLICY "Owner can insert projects" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can update projects" ON public.projects
FOR UPDATE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can delete projects" ON public.projects
FOR DELETE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

-- Experience table
DROP POLICY IF EXISTS "Authenticated users can insert experience" ON public.experience;
DROP POLICY IF EXISTS "Authenticated users can update experience" ON public.experience;
DROP POLICY IF EXISTS "Authenticated users can delete experience" ON public.experience;

CREATE POLICY "Owner can insert experience" ON public.experience
FOR INSERT WITH CHECK (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can update experience" ON public.experience
FOR UPDATE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can delete experience" ON public.experience
FOR DELETE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

-- Profile settings table
DROP POLICY IF EXISTS "Authenticated users can insert profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "Authenticated users can update profile settings" ON public.profile_settings;

CREATE POLICY "Owner can insert profile settings" ON public.profile_settings
FOR INSERT WITH CHECK (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can update profile settings" ON public.profile_settings
FOR UPDATE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

-- Skills table
DROP POLICY IF EXISTS "Authenticated users can insert skills" ON public.skills;
DROP POLICY IF EXISTS "Authenticated users can update skills" ON public.skills;
DROP POLICY IF EXISTS "Authenticated users can delete skills" ON public.skills;

CREATE POLICY "Owner can insert skills" ON public.skills
FOR INSERT WITH CHECK (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can update skills" ON public.skills
FOR UPDATE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can delete skills" ON public.skills
FOR DELETE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

-- Chat conversations table
DROP POLICY IF EXISTS "Authenticated users can update conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Authenticated users can delete conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can view their own conversations" ON public.chat_conversations;

CREATE POLICY "Visitors can view their own conversations" ON public.chat_conversations
FOR SELECT USING (true);

CREATE POLICY "Owner can update conversations" ON public.chat_conversations
FOR UPDATE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can delete conversations" ON public.chat_conversations
FOR DELETE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

-- Chat messages table
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON public.chat_messages;

CREATE POLICY "Owner can delete chat messages" ON public.chat_messages
FOR DELETE USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);