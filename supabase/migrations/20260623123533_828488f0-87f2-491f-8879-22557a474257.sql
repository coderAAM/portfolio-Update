
-- Drop overly-permissive chatbot policies (chatbot feature was removed)
DROP POLICY IF EXISTS "Anyone can insert conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Visitors can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;

-- Restrict to authenticated admin (owner) only
CREATE POLICY "Only admin can view chat conversations"
  ON public.chat_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Only admin can manage chat conversations"
  ON public.chat_conversations FOR ALL
  TO authenticated
  USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid)
  WITH CHECK (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Only admin can view chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);

CREATE POLICY "Only admin can manage chat messages"
  ON public.chat_messages FOR ALL
  TO authenticated
  USING (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid)
  WITH CHECK (auth.uid() = '2f987c9c-4701-4cff-b58c-0373af6fc8eb'::uuid);
