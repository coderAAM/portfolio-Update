import { useState, useEffect, useMemo, useRef } from "react";
import { Github, Linkedin, Mail, MapPin, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROFILE, SOCIAL_LINKS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import profileImage from "@/assets/ahmed-new-profile.png";
import coverBanner from "@/assets/cover-banner.jpg";
import { CVDownload } from "@/components/CVDownload";
import { ScrollingTicker } from "@/components/ScrollingTicker";
import { encodeEmail, decodeEmail, obfuscateEmailDisplay } from "@/lib/email-obfuscation";
import gsap from "gsap";

interface ProfileData {
  name: string;
  title: string;
  email: string;
  location: string;
  summary: string;
  github_url: string | null;
  linkedin_url: string | null;
  image_url: string | null;
}

export function Hero() {
  const [profile, setProfile] = useState<ProfileData>({
    name: PROFILE.name, title: PROFILE.title, email: PROFILE.email,
    location: PROFILE.location, summary: PROFILE.summary,
    github_url: SOCIAL_LINKS.github, linkedin_url: SOCIAL_LINKS.linkedin, image_url: null,
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const profilePicRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const encodedEmail = useMemo(() => encodeEmail(profile.email), [profile.email]);

  const handleEmailClick = () => {
    const email = decodeEmail(encodedEmail);
    if (email) window.location.href = `mailto:${email}`;
  };

  useEffect(() => {
    fetchProfile();
    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_settings' }, () => fetchProfile())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
      .fromTo(profilePicRef.current, { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.8 }, 0.2)
      .fromTo(nameRef.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.6 }, 0.5)
      .fromTo(titleRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5 }, 0.7)
      .fromTo(metaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 0.8)
      .fromTo(buttonsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 0.9)
      .fromTo(aboutRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, 1.1);

    return () => { tl.kill(); };
  }, []);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase.from("profile_settings").select("*").maybeSingle();
      if (error) throw error;
      if (data) {
        setProfile({
          name: data.name, title: data.title, email: data.email,
          location: data.location, summary: data.summary,
          github_url: data.github_url, linkedin_url: data.linkedin_url, image_url: data.image_url,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  return (
    <section className="pt-16">
      <div ref={heroRef} className="max-w-4xl mx-auto" style={{ opacity: 0 }}>
        <div className="glass rounded-b-2xl overflow-hidden shadow-lg">
          {/* Cover Banner */}
          <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
            <img src={coverBanner} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="relative px-4 sm:px-6 md:px-8 pb-6">
            <div ref={profilePicRef} className="relative -mt-16 sm:-mt-20 md:-mt-24 mb-4" style={{ transformOrigin: "center center" }}>
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-card overflow-hidden bg-card shadow-xl ring-4 ring-primary/20">
                <img src={profile.image_url || profileImage} alt={profile.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-0 w-4 h-4 sm:w-5 sm:h-5 bg-accent rounded-full border-2 border-card" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h1 ref={nameRef} className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground" style={{ opacity: 0 }}>
                  {profile.name}
                </h1>
                <p ref={titleRef} className="text-sm sm:text-base text-foreground/90 font-medium" style={{ opacity: 0 }}>
                  {profile.title}
                </p>
                <div ref={metaRef} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground" style={{ opacity: 0 }}>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                  <span>•</span>
                  <button onClick={handleEmailClick} className="text-primary hover:underline bg-transparent border-none cursor-pointer font-medium" data-email={encodedEmail}>
                    Contact info
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-primary font-medium pt-1">
                  <span className="hover:underline cursor-pointer">500+ connections</span>
                </div>
              </div>

              <div ref={buttonsRef} className="flex flex-wrap gap-2" style={{ opacity: 0 }}>
                <Button size="sm" className="rounded-full gap-1.5 text-xs sm:text-sm glow-primary" onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}>
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </Button>
                <CVDownload />
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs sm:text-sm border-primary/30 hover:border-primary/60" onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}>
                  <ExternalLink className="h-3.5 w-3.5" /> View Projects
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10">
                    <Github className="h-4 w-4" /><span className="hidden sm:inline">GitHub</span>
                  </Button>
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10">
                    <Linkedin className="h-4 w-4" /><span className="hidden sm:inline">LinkedIn</span>
                  </Button>
                </a>
              )}
              <button onClick={handleEmailClick} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors bg-transparent border-none cursor-pointer">
                <Mail className="h-4 w-4" /><span className="hidden sm:inline">Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div ref={aboutRef} className="glass rounded-xl p-4 sm:p-6 md:p-8 mt-2 shadow-sm" style={{ opacity: 0 }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{profile.summary}</p>
        </div>
      </div>

      <div className="mt-6">
        <ScrollingTicker />
      </div>
    </section>
  );
}
