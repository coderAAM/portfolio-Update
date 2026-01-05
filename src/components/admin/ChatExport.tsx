import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ChatMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ChatConversation {
  id: string;
  visitor_id: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

interface ChatExportProps {
  conversations: ChatConversation[];
}

export function ChatExport({ conversations }: ChatExportProps) {
  const exportAsJSON = () => {
    const data = conversations.map((conv) => ({
      id: conv.id,
      visitor_id: conv.visitor_id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      messages: conv.messages?.map((msg) => ({
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at,
      })),
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    downloadFile(blob, "chatbot-conversations.json");
  };

  const exportAsCSV = () => {
    const headers = ["Conversation ID", "Visitor ID", "Message Role", "Message Content", "Message Time"];
    const rows: string[][] = [];

    conversations.forEach((conv) => {
      conv.messages?.forEach((msg) => {
        rows.push([
          conv.id,
          conv.visitor_id,
          msg.role,
          `"${msg.content.replace(/"/g, '""')}"`,
          new Date(msg.created_at).toLocaleString(),
        ]);
      });
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadFile(blob, "chatbot-conversations.csv");
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (conversations.length === 0) return null;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportAsJSON}>
        <Download className="h-4 w-4 mr-2" />
        Export JSON
      </Button>
      <Button variant="outline" size="sm" onClick={exportAsCSV}>
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
}
