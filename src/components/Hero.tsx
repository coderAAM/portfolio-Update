import { useState, useEffect, useMemo } from "react";
import { Github, Linkedin, Mail, MapPin, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROFILE, SOCIAL_LINKS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import profileImage from "@/assets/ahmed-new-profile.png";
import coverBanner from "@/assets/cover-banner.jpg";
import { CVDownload } from "@/components/CVDownload";
import { ScrollingTicker } from "@/components/ScrollingTicker";
import { encodeEmail, decodeEmail, obfuscateEmailDisplay } from "@/lib/email-obfuscation";

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
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-b-2xl overflow-hidden shadow-lg">
          {/* Cover Banner */}
          <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
            <img src={coverBanner} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="relative px-4 sm:px-6 md:px-8 pb-6 flex flex-col items-center text-center">
            <div className="relative -mt-16 sm:-mt-20 md:-mt-24 mb-4">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full border-4 border-card overflow-hidden bg-card shadow-xl ring-4 ring-primary/20 mx-auto">
                <img src={profile.image_url || profileImage} alt={profile.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 bg-accent rounded-full border-2 border-card" />
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="space-y-2 max-w-2xl">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {profile.name}
                </h1>
                <p className="text-sm sm:text-base text-foreground/90 font-medium">
                  {profile.title}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                  <span>•</span>
                  <button onClick={handleEmailClick} className="text-primary hover:underline bg-transparent border-none cursor-pointer font-medium" data-email={encodedEmail}>
                    Contact info
                  </button>
                </div>
                <div className="flex justify-center items-center gap-2 text-xs sm:text-sm text-primary font-medium pt-1">
                  <span className="hover:underline cursor-pointer">500+ connections</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Button size="sm" className="rounded-full gap-1.5 text-xs sm:text-sm" onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}>
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </Button>
                <CVDownload />
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs sm:text-sm border-primary/30 hover:border-primary/60" onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}>
                  <ExternalLink className="h-3.5 w-3.5" /> View Projects
                </Button>
              </div>
            </div>


            {/* Social Links */}
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-border/50 w-full">
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
        <div className="glass rounded-xl p-4 sm:p-6 md:p-8 mt-2 shadow-sm">
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
