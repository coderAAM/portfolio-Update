import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIChat } from "@/hooks/useAIChat";
import { cn } from "@/lib/utils";

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, clearMessages, isInitialized } = useAIChat("chatbot");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput("");
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleNewChat = () => {
    clearMessages();
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:scale-110",
          isOpen && "rotate-90"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[350px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden",
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/10 rounded-full">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">AI Assistant</h3>
              <p className="text-xs text-primary-foreground/70">Ask me anything</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              title="Start new chat"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-background">
          {!isInitialized ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <div className="flex gap-1 justify-center">
                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="mt-2">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Hi! How can I help you today?</p>
              <p className="text-xs mt-1">Ask about projects, skills, or experience</p>
            </div>
          ) : null}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="p-1.5 bg-primary/10 rounded-full h-fit">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="p-1.5 bg-primary rounded-full h-fit">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2 items-center">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading || !isInitialized}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !isInitialized}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
