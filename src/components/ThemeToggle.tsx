import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Default to light mode
    const savedTheme = localStorage.getItem("theme");
    const useDark = savedTheme === "dark";
    setIsDark(useDark);
    document.documentElement.classList.toggle("dark", useDark);
  }, []);


  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  return (
    <Button
      variant="glass"
      size="icon"
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 rounded-full"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
