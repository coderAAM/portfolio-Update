import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIChat } from "@/hooks/useAIChat";
import { useToast } from "@/hooks/use-toast";

interface AIExperienceSuggestionProps {
  jobTitle: string;
  company: string;
  onSuggestion: (suggestion: string) => void;
}

export const AIExperienceSuggestion = ({ jobTitle, company, onSuggestion }: AIExperienceSuggestionProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { sendMessage } = useAIChat("experience");
  const { toast } = useToast();

  const generateSuggestion = async () => {
    if (!jobTitle.trim()) {
      toast({
        title: "Enter a job title first",
        description: "AI needs the job title to generate descriptions.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Generate 3-4 professional bullet points for a resume/portfolio describing the responsibilities and achievements of a "${jobTitle}"${company ? ` at "${company}"` : ""}.
      Focus on:
      - Key responsibilities and daily tasks
      - Technologies used and skills applied
      - Measurable achievements and impact
      - Team collaboration and leadership if applicable
      
      Format each point on a new line. Each point should start with an action verb.
      Keep each point concise (one sentence).
      Only provide the bullet points, no extra text or bullet symbols.`;
      
      const suggestion = await sendMessage(prompt);
      onSuggestion(suggestion);
      
      toast({
        title: "Suggestions generated!",
        description: "AI has created experience descriptions.",
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
