import { Code2 } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <Code2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
      </div>
      <p className="mt-4 text-muted-foreground text-sm animate-pulse">Loading...</p>
    </div>
  );
};
