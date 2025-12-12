import { Github, Linkedin, Mail, MapPin, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROFILE, SOCIAL_LINKS } from "@/lib/constants";
import profileImage from "@/assets/ahmed-profile.jpg";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-slide-in-left">
            <div className="space-y-4">
              <p className="text-primary font-mono text-sm md:text-base tracking-wider">
                {"<Hello World />"}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                I'm{" "}
                <span className="text-gradient">{PROFILE.name}</span>
              </h1>
              <div className="flex items-center gap-2 text-lg md:text-xl text-muted-foreground">
                <span className="w-12 h-0.5 bg-primary" />
                <span className="font-medium">{PROFILE.title}</span>
              </div>
            </div>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
              {PROFILE.summary}
            </p>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <a href={`mailto:${PROFILE.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                {PROFILE.email}
              </a>
              <a href={`tel:${PROFILE.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                {PROFILE.phone}
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {PROFILE.location}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}>
                View Projects
                <ExternalLink className="h-5 w-5" />
              </Button>
              <Button variant="heroOutline" size="xl" onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}>
                Contact Me
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 glass rounded-full hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 glass rounded-full hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative animate-slide-in-right">
            <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-30 animate-pulse-glow" />
              
              {/* Image Container */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/30 glow-primary">
                <img
                  src={profileImage}
                  alt={PROFILE.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 p-4 glass rounded-xl animate-float">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="absolute -bottom-4 -left-4 p-4 glass rounded-xl animate-float" style={{ animationDelay: "0.5s" }}>
                <span className="text-2xl">💻</span>
              </div>
              <div className="absolute top-1/2 -right-8 p-4 glass rounded-xl animate-float" style={{ animationDelay: "1s" }}>
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
