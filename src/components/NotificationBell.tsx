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

// Play notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log("Could not play notification sound:", error);
  }
};

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const fetchUnreadCount = async (playSound = false) => {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false);

    if (!error && count !== null) {
      if (playSound && count > unreadCount) {
        playNotificationSound();
        triggerAnimation();
      }
      setPreviousCount(unreadCount);
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
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [unreadCount]);

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
        <Bell 
          className={`h-5 w-5 transition-transform ${
            isAnimating ? "animate-[bell-ring_0.5s_ease-in-out_2]" : ""
          }`}
          style={{
            transformOrigin: "top center",
          }}
        />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
            isAnimating ? "animate-[pulse_0.3s_ease-in-out_3]" : ""
          }`}>
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
