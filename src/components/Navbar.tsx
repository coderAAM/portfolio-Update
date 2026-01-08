import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "/blog", label: "Blog", isRoute: true },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (link: typeof navLinks[0]) => {
    setIsOpen(false);
    
    // Handle route links (like /blog)
    if (link.isRoute) {
      window.location.href = link.href;
      return;
    }
    
    // Handle hash links
    if (location.pathname !== "/") {
      window.location.href = "/" + link.href;
      return;
    }
    const element = document.querySelector(link.href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "glass py-2 md:py-3" : "bg-transparent py-3 md:py-6"
        )}
      >
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              <Code2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span>Ahmed Ali</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link)}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium text-sm xl:text-base"
                >
                  {link.label}
                </button>
              ))}
              <NotificationBell />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-foreground p-2 -mr-2 hover:bg-primary/10 rounded-lg transition-colors z-[60]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Outside nav for proper fixed positioning */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[56px] z-[55] bg-background/98 backdrop-blur-lg animate-fade-in overflow-y-auto">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link)}
                className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors font-medium text-left py-4 px-4 rounded-lg text-lg"
              >
                {link.label}
              </button>
            ))}
            <div className="mt-4 px-4">
              <NotificationBell />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
