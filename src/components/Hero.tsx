import { useState, useEffect, useMemo } from "react";
import { Github, Linkedin, Mail, MapPin, ExternalLink, MessageSquare, UserPlus, MoreHorizontal } from "lucide-react";
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
    name: PROFILE.name,
    title: PROFILE.title,
    email: PROFILE.email,
    location: PROFILE.location,
    summary: PROFILE.summary,
    github_url: SOCIAL_LINKS.github,
    linkedin_url: SOCIAL_LINKS.linkedin,
    image_url: null,
  });

  const encodedEmail = useMemo(() => encodeEmail(profile.email), [profile.email]);
  const displayEmail = useMemo(() => obfuscateEmailDisplay(profile.email), [profile.email]);

  const handleEmailClick = () => {
    const email = decodeEmail(encodedEmail);
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  useEffect(() => {
    fetchProfile();
    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_settings' }, () => {
        fetchProfile();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase.from("profile_settings").select("*").maybeSingle();
      if (error) throw error;
      if (data) {
        setProfile({
          name: data.name,
          title: data.title,
          email: data.email,
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
    <section className="pt-16">
      {/* LinkedIn-style Profile Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-b-xl border border-border overflow-hidden shadow-lg">
          {/* Cover Banner */}
          <div className="relative h-48 sm:h-56 md:h-64">
            <img
              src={coverBanner}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info Section */}
          <div className="relative px-4 sm:px-6 md:px-8 pb-6">
            {/* Profile Picture - overlapping the cover */}
            <div className="relative -mt-16 sm:-mt-20 md:-mt-24 mb-4">
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-card overflow-hidden bg-card shadow-xl">
                <img
                  src={profile.image_url || profileImage}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Name & Title */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {profile.name}
                </h1>
                <p className="text-sm sm:text-base text-foreground/90 font-medium">
                  {profile.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                  <span>•</span>
                  <button
                    onClick={handleEmailClick}
                    className="text-primary hover:underline bg-transparent border-none cursor-pointer font-medium"
                    data-email={encodedEmail}
                  >
                    Contact info
                  </button>
                </div>

                {/* Connections-like info */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-primary font-medium pt-1">
                  <span className="hover:underline cursor-pointer">500+ connections</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-full gap-1.5 text-xs sm:text-sm"
                  onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Message
                </Button>
                <CVDownload />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 text-xs sm:text-sm"
                  onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Projects
                </Button>
              </div>
            </div>

            {/* Social Links Row */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
                    <Github className="h-4 w-4" />
                    <span className="hidden sm:inline">GitHub</span>
                  </Button>
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
                    <Linkedin className="h-4 w-4" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </Button>
                </a>
              )}
              <button
                onClick={handleEmailClick}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors bg-transparent border-none cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* About Section - LinkedIn style card */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 md:p-8 mt-2 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {profile.summary}
          </p>
        </div>
      </div>

      {/* Scrolling Ticker */}
      <div className="mt-6">
        <ScrollingTicker />
      </div>
    </section>
  );
}
