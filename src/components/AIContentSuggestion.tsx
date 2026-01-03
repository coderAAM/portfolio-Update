import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIChat } from "@/hooks/useAIChat";
import { useToast } from "@/hooks/use-toast";

interface AIContentSuggestionProps {
  currentTitle: string;
  onSuggestion: (suggestion: string) => void;
}

export const AIContentSuggestion = ({ currentTitle, onSuggestion }: AIContentSuggestionProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { sendMessage } = useAIChat("suggestion");
  const { toast } = useToast();

  const generateSuggestion = async () => {
    if (!currentTitle.trim()) {
      toast({
        title: "Enter a project title first",
        description: "AI needs the project title to generate a description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Generate a professional project description for a project titled "${currentTitle}". 
      The description should be engaging, highlight key features, and be suitable for a portfolio. 
      Keep it to 2-3 sentences. Only provide the description, no extra text.`;
      
      const suggestion = await sendMessage(prompt);
      onSuggestion(suggestion);
      
      toast({
        title: "Suggestion generated!",
        description: "AI has created a description for your project.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={generateSuggestion}
      disabled={isGenerating}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          AI Suggest
        </>
      )}
    </Button>
  );
};
