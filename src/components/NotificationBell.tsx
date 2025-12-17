import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUnreadCount = async () => {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("messages-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleBellClick = () => {
    setIsDialogOpen(true);
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password === "ahmed@admin2024") {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is logged in, go directly to admin
        toast({ title: "Access granted!", description: "Redirecting to admin panel." });
        setIsDialogOpen(false);
        navigate("/admin");
      } else {
        // User needs to login first
        toast({ title: "Please login first", description: "Redirecting to login page." });
        setIsDialogOpen(false);
        navigate("/auth");
      }
    } else {
      toast({
        title: "Invalid password",
        description: "Please enter the correct admin password.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {displayCount}
          </span>
        )}
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Admin Access Required
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}. Enter admin password to view.
            </p>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !password}>
                {loading ? "Verifying..." : "Access Admin"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
