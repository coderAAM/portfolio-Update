-- Update remaining RLS policies to use the correct user ID
-- Your current user ID from auth: 2f987c9c-4701-4cff-b58c-0373af6fc8eb

-- Update profile_settings policies
DROP POLICY IF EXISTS "Owner can insert profile settings" ON profile_settings;
DROP POLICY IF EXISTS "Owner can update profile settings" ON profile_settings;

CREATE POLICY "Owner can insert profile settings" ON profile_settings
FOR INSERT WITH CHECK (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can update profile settings" ON profile_settings
FOR UPDATE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

-- Update skills policies
DROP POLICY IF EXISTS "Owner can insert skills" ON skills;
DROP POLICY IF EXISTS "Owner can update skills" ON skills;
DROP POLICY IF EXISTS "Owner can delete skills" ON skills;

CREATE POLICY "Owner can insert skills" ON skills
FOR INSERT WITH CHECK (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can update skills" ON skills
FOR UPDATE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can delete skills" ON skills
FOR DELETE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

-- Update education policies
DROP POLICY IF EXISTS "Owner can insert education" ON education;
DROP POLICY IF EXISTS "Owner can update education" ON education;
DROP POLICY IF EXISTS "Owner can delete education" ON education;

CREATE POLICY "Owner can insert education" ON education
FOR INSERT WITH CHECK (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can update education" ON education
FOR UPDATE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can delete education" ON education
FOR DELETE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

-- Update experience policies
DROP POLICY IF EXISTS "Owner can insert experience" ON experience;
DROP POLICY IF EXISTS "Owner can update experience" ON experience;
DROP POLICY IF EXISTS "Owner can delete experience" ON experience;

CREATE POLICY "Owner can insert experience" ON experience
FOR INSERT WITH CHECK (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can update experience" ON experience
FOR UPDATE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can delete experience" ON experience
FOR DELETE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

-- Update messages policies
DROP POLICY IF EXISTS "Owner can view messages" ON messages;
DROP POLICY IF EXISTS "Owner can update messages" ON messages;
DROP POLICY IF EXISTS "Owner can delete messages" ON messages;

CREATE POLICY "Owner can view messages" ON messages
FOR SELECT USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can update messages" ON messages
FOR UPDATE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can delete messages" ON messages
FOR DELETE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

-- Update chat_conversations policies
DROP POLICY IF EXISTS "Owner can update conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Owner can delete conversations" ON chat_conversations;

CREATE POLICY "Owner can update conversations" ON chat_conversations
FOR UPDATE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Owner can delete conversations" ON chat_conversations
FOR DELETE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

-- Update chat_messages policies
DROP POLICY IF EXISTS "Owner can delete chat messages" ON chat_messages;

CREATE POLICY "Owner can delete chat messages" ON chat_messages
FOR DELETE USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);