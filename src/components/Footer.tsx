import { Heart } from "lucide-react";
import { PROFILE } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 border-t border-border">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {currentYear} {PROFILE.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-destructive" /> using React & Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
