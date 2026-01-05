import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PROFILE, SKILLS, EDUCATION, SOCIAL_LINKS } from "@/lib/constants";
import html2pdf from "html2pdf.js";

interface ProfileData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  github_url: string | null;
  linkedin_url: string | null;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string[];
}

export function CVDownload() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: PROFILE.name,
    title: PROFILE.title,
    email: PROFILE.email,
    phone: PROFILE.phone,
    location: PROFILE.location,
    summary: PROFILE.summary,
    github_url: SOCIAL_LINKS.github,
    linkedin_url: SOCIAL_LINKS.linkedin,
  });
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: profileData } = await supabase
      .from("profile_settings")
      .select("*")
      .maybeSingle();

    if (profileData) {
      setProfile({
        name: profileData.name,
        title: profileData.title,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        summary: profileData.summary,
        github_url: profileData.github_url,
        linkedin_url: profileData.linkedin_url,
      });
    }

    const { data: expData } = await supabase
      .from("experience")
      .select("*")
      .order("sort_order", { ascending: true });

    if (expData) {
      setExperiences(expData);
    }
  };

  const generatePDF = async () => {
    setLoading(true);

    // Create a hidden container for the CV content
    const container = document.createElement("div");
    container.innerHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; color: #333; padding: 30px; background: #fff;">
        <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid #6366f1;">
          <h1 style="font-size: 28px; font-weight: 700; color: #1e1b4b; margin: 0 0 5px 0;">${profile.name}</h1>
          <p style="font-size: 16px; color: #6366f1; font-weight: 500; margin: 0 0 12px 0;">${profile.title}</p>
          <div style="font-size: 12px; color: #666;">
            <span style="margin-right: 15px;">📧 ${profile.email}</span>
            <span style="margin-right: 15px;">📱 ${profile.phone}</span>
            <span>📍 ${profile.location}</span>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px;">Professional Summary</h2>
          <p style="color: #4b5563; text-align: justify; font-size: 13px; margin: 0;">${profile.summary}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px;">Experience</h2>
          ${experiences.map((exp) => `
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                <div>
                  <div style="font-weight: 600; color: #1e1b4b; font-size: 14px;">${exp.title}</div>
                  <div style="color: #6366f1; font-size: 13px;">${exp.company}</div>
                </div>
                <div style="color: #9ca3af; font-size: 12px; font-style: italic;">${exp.period}</div>
              </div>
              <ul style="padding-left: 18px; margin: 5px 0 0 0;">
                ${exp.description.map((desc) => `<li style="color: #4b5563; margin-bottom: 3px; font-size: 12px;">${desc}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px;">Skills</h2>
          <div style="display: flex; gap: 30px;">
            <div style="flex: 1;">
              <h4 style="font-weight: 600; color: #1e1b4b; margin-bottom: 6px; font-size: 13px;">Languages & Frameworks</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${SKILLS.languages.map((s) => `<li style="color: #4b5563; font-size: 12px; margin-bottom: 3px;">• ${s.name} (${s.level})</li>`).join("")}
              </ul>
            </div>
            <div style="flex: 1;">
              <h4 style="font-weight: 600; color: #1e1b4b; margin-bottom: 6px; font-size: 13px;">Databases & Tools</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${SKILLS.databases.map((s) => `<li style="color: #4b5563; font-size: 12px; margin-bottom: 3px;">• ${s.name} (${s.level})</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
          ${EDUCATION.map((edu) => `
            <div style="margin-bottom: 10px;">
              <div style="font-weight: 600; color: #1e1b4b; font-size: 13px;">${edu.degree}</div>
              <div style="color: #6366f1; font-size: 12px;">${edu.institution}</div>
              <div style="color: #9ca3af; font-size: 11px;">${edu.period}</div>
            </div>
          `).join("")}
        </div>

        <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px;">
          ${profile.github_url ? `<a href="${profile.github_url}" style="color: #6366f1; text-decoration: none; margin-right: 20px;">GitHub</a>` : ""}
          ${profile.linkedin_url ? `<a href="${profile.linkedin_url}" style="color: #6366f1; text-decoration: none;">LinkedIn</a>` : ""}
        </div>
      </div>
    `;

    const options = {
      margin: 10,
      filename: `${profile.name.replace(/\s+/g, "_")}_CV.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(options).from(container).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }

    setLoading(false);
  };

  return (
    <Button 
      variant="hero" 
      size="lg" 
      onClick={generatePDF} 
      disabled={loading}
      className="text-sm md:text-base"
    >
      <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
      {loading ? "Generating..." : "Download CV"}
    </Button>
  );
}
