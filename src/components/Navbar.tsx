import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import gsap from "gsap";

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
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Entry animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(navRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
      .fromTo(logoRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 0.3);

    if (linksRef.current) {
      const links = linksRef.current.querySelectorAll(".nav-link-item");
      tl.fromTo(links, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 }, 0.4);
    }

    return () => { tl.kill(); };
  }, []);

  // Mobile menu animation
  useEffect(() => {
    if (!mobileMenuRef.current) return;
    if (isOpen) {
      const items = mobileMenuRef.current.querySelectorAll(".mobile-nav-item");
      gsap.fromTo(mobileMenuRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(items, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: "power2.out", delay: 0.15 });
    }
  }, [isOpen]);

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
        ref={navRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "py-2 md:py-3 bg-card/60 backdrop-blur-2xl border-b border-border/30 shadow-lg shadow-primary/5"
            : "bg-transparent py-3 md:py-6"
        )}
        style={{ opacity: 0 }}
      >
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between">
            <Link
              ref={logoRef}
              to="/"
              className="flex items-center gap-2 text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors group"
              style={{ opacity: 0 }}
            >
              <div className="relative">
                <Code2 className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-primary hover:to-accent transition-all duration-300">
                Ahmed Ali
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div ref={linksRef} className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link)}
                  className="nav-link-item relative px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base rounded-lg hover:bg-primary/10 group"
                  style={{ opacity: 0 }}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full group-hover:w-3/4 transition-all duration-300" />
                </button>
              ))}
              <div className="nav-link-item ml-2" style={{ opacity: 0 }}>
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
        <div
          ref={mobileMenuRef}
          className="lg:hidden fixed inset-0 top-[56px] z-[55] bg-card/80 backdrop-blur-2xl border-t border-border/30 overflow-y-auto"
          style={{ opacity: 0 }}
        >
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link)}
                className="mobile-nav-item text-foreground hover:text-primary hover:bg-primary/10 transition-all font-medium text-left py-4 px-4 rounded-xl text-lg border border-transparent hover:border-primary/20"
              >
                {link.label}
              </button>
            ))}
            <div className="mobile-nav-item mt-4 px-4">
              <NotificationBell />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
