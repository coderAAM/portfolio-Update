-- Allow authenticated users to delete chat conversations
CREATE POLICY "Authenticated users can delete conversations"
ON public.chat_conversations
FOR DELETE
USING (auth.role() = 'authenticated');

-- Allow authenticated users to update chat conversations
CREATE POLICY "Authenticated users can update conversations"
ON public.chat_conversations
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete chat messages
CREATE POLICY "Authenticated users can delete messages"
ON public.chat_messages
FOR DELETE
USING (auth.role() = 'authenticated');