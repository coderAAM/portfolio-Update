import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

// Get or create a visitor ID
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem("chatbot_visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("chatbot_visitor_id", visitorId);
  }
  return visitorId;
};

export const useAIChat = (type: "chatbot" | "suggestion" = "chatbot") => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load existing conversation on mount
  useEffect(() => {
    if (type !== "chatbot") {
      setIsInitialized(true);
      return;
    }

    const loadConversation = async () => {
      const visitorId = getVisitorId();
      
      // Try to find existing conversation
      const { data: conversations } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("visitor_id", visitorId)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        const convId = conversations[0].id;
        setConversationId(convId);
        
        // Load messages
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });

        if (msgs) {
          setMessages(msgs.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
        }
      }
      
      setIsInitialized(true);
    };

    loadConversation();
  }, [type]);

  // Create or get conversation
  const ensureConversation = async (): Promise<string> => {
    if (conversationId) return conversationId;

    const visitorId = getVisitorId();
    
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ visitor_id: visitorId })
      .select("id")
      .single();

    if (error) throw error;
    
    setConversationId(data.id);
    return data.id;
  };

  // Save message to database
  const saveMessage = async (convId: string, role: "user" | "assistant", content: string) => {
    await supabase
      .from("chat_messages")
      .insert({ conversation_id: convId, role, content });
    
    // Update conversation timestamp
    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);
  };

  const sendMessage = useCallback(async (input: string): Promise<string> => {
    const userMsg: Message = { role: "user", content: input };
    
    if (type === "chatbot") {
      setMessages(prev => [...prev, userMsg]);
    }
    
    setIsLoading(true);

    let assistantContent = "";

    try {
      // Save user message to database
      let convId: string | null = null;
      if (type === "chatbot") {
        convId = await ensureConversation();
        await saveMessage(convId, "user", input);
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: type === "chatbot" ? [...messages, userMsg] : [userMsg],
          type 
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      const updateAssistant = (nextChunk: string) => {
        assistantContent += nextChunk;
        if (type === "chatbot") {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
            }
            return [...prev, { role: "assistant", content: assistantContent }];
          });
        }
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch { /* ignore */ }
        }
      }

      // Save assistant message to database
      if (type === "chatbot" && convId && assistantContent) {
        await saveMessage(convId, "assistant", assistantContent);
      }

      return assistantContent;
    } catch (error) {
      console.error("AI chat error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [messages, type, conversationId]);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    
    // Create a new conversation
    if (type === "chatbot") {
      setConversationId(null);
    }
  }, [type]);

  return { messages, isLoading, sendMessage, clearMessages, isInitialized };
};
