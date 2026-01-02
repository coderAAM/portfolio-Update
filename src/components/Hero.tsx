import { useState, useEffect } from "react";
import { Github, Linkedin, Mail, MapPin, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROFILE, SOCIAL_LINKS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import profileImage from "@/assets/ahmed-new-profile.png";

interface ProfileData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  github_url: string | null;
  linkedin_url: string | null;
  image_url: string | null;
}

export function Hero() {
  const [profile, setProfile] = useState<ProfileData>({
    name: PROFILE.name,
    title: PROFILE.title,
    email: PROFILE.email,
    phone: PROFILE.phone,
    location: PROFILE.location,
    summary: PROFILE.summary,
    github_url: SOCIAL_LINKS.github,
    linkedin_url: SOCIAL_LINKS.linkedin,
    image_url: null,
  });

  useEffect(() => {
    fetchProfile();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profile_settings' },
        () => {
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from("profile_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile({
          name: data.name,
          title: data.title,
          email: data.email,
          phone: data.phone,
          location: data.location,
          summary: data.summary,
          github_url: data.github_url,
          linkedin_url: data.linkedin_url,
          image_url: data.image_url,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 md:space-y-8 animate-slide-in-left text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-3 md:space-y-4">
              <p className="text-primary font-mono text-sm md:text-base tracking-wider">
                {"<Hello World />"}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                I'm{" "}
                <span className="text-gradient">{profile.name}</span>
              </h1>
              <div className="flex items-center gap-2 text-base md:text-lg lg:text-xl text-muted-foreground justify-center lg:justify-start">
                <span className="w-8 md:w-12 h-0.5 bg-primary" />
                <span className="font-medium">{profile.title}</span>
              </div>
            </div>

            <p className="text-muted-foreground text-sm md:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              {profile.summary}
            </p>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground justify-center lg:justify-start">
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">{profile.email}</span>
              </a>
              <a href={`tel:${profile.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">{profile.phone}</span>
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">{profile.location}</span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 md:gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="text-sm md:text-base" onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}>
                View Projects
                <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button variant="heroOutline" size="lg" className="text-sm md:text-base" onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}>
                Contact Me
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-2 md:pt-4 justify-center lg:justify-start">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 glass rounded-full hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 glass rounded-full hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative animate-slide-in-right order-1 lg:order-2">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mx-auto">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-30 animate-pulse-glow" />
              
              {/* Image Container */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/30 glow-primary">
                <img
                  src={profile.image_url || profileImage}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 p-2 md:p-4 glass rounded-xl animate-float">
                <span className="text-lg md:text-2xl">🚀</span>
              </div>
              <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 p-2 md:p-4 glass rounded-xl animate-float" style={{ animationDelay: "0.5s" }}>
                <span className="text-lg md:text-2xl">💻</span>
              </div>
              <div className="absolute top-1/2 -right-4 md:-right-8 p-2 md:p-4 glass rounded-xl animate-float hidden sm:block" style={{ animationDelay: "1s" }}>
                <span className="text-lg md:text-2xl">⚡</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
