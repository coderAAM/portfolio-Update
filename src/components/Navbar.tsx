import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (link: typeof navLinks[0]) => {
    setIsOpen(false);
    if (link.isRoute) { navigate(link.href); return; }
    if (location.pathname !== "/") { navigate("/" + link.href); return; }
    const element = document.querySelector(link.href);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "py-2 md:py-3 bg-card/60 backdrop-blur-2xl border-b border-border/30 shadow-lg shadow-primary/5"
            : "bg-transparent py-3 md:py-6"
        )}
      >
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors group"
            >
              <div className="relative">
                <Code2 className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-primary hover:to-accent transition-all duration-300">
                Ahmed Ali
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link)}
                  className="relative px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base rounded-lg hover:bg-primary/10 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full group-hover:w-3/4 transition-all duration-300" />
                </button>
              ))}
              <div className="ml-2">
                <NotificationBell />
              </div>
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

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[56px] z-[55] bg-card/80 backdrop-blur-2xl border-t border-border/30 overflow-y-auto">
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link)}
                className="text-foreground hover:text-primary hover:bg-primary/10 transition-all font-medium text-left py-4 px-4 rounded-xl text-lg border border-transparent hover:border-primary/20"
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
