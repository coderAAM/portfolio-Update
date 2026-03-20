import { Github, Linkedin, Mail, MapPin, Code2, ExternalLink, Heart } from "lucide-react";
import { PROFILE, SOCIAL_LINKS } from "@/lib/constants";

const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const services = [
  "Full Stack Development",
  "MERN Stack Apps",
  "WordPress Development",
  "REST API Design",
  "UI/UX Implementation",
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">{PROFILE.name.split(" ")[0]} {PROFILE.name.split(" ")[1]}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {PROFILE.title}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {PROFILE.location}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Services</h3>
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li key={service} className="text-sm text-muted-foreground">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Connect</h3>
            <div className="space-y-3">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Github className="h-4 w-4 group-hover:text-primary transition-colors" />
                GitHub
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Linkedin className="h-4 w-4 group-hover:text-primary transition-colors" />
                LinkedIn
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href={`mailto:${PROFILE.email}`}
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Mail className="h-4 w-4 group-hover:text-primary transition-colors" />
                Email Me
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
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
