import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PROFILE, SKILLS, EDUCATION, SOCIAL_LINKS } from "@/lib/constants";

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
    // Fetch profile
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

    // Fetch experiences
    const { data: expData } = await supabase
      .from("experience")
      .select("*")
      .order("sort_order", { ascending: true });

    if (expData) {
      setExperiences(expData);
    }
  };

  const generateCV = () => {
    setLoading(true);

    const cvContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profile.name} - CV</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #fff; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
    .name { font-size: 32px; font-weight: 700; color: #1e1b4b; margin-bottom: 5px; }
    .title { font-size: 18px; color: #6366f1; font-weight: 500; margin-bottom: 15px; }
    .contact { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; font-size: 13px; color: #666; }
    .contact span { display: flex; align-items: center; gap: 5px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: 700; color: #1e1b4b; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px; }
    .summary { color: #4b5563; text-align: justify; }
    .experience-item { margin-bottom: 20px; }
    .exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 5px; }
    .exp-title { font-weight: 600; color: #1e1b4b; font-size: 15px; }
    .exp-company { color: #6366f1; font-size: 14px; }
    .exp-period { color: #9ca3af; font-size: 13px; font-style: italic; }
    .exp-desc { padding-left: 20px; }
    .exp-desc li { color: #4b5563; margin-bottom: 5px; font-size: 13px; }
    .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .skill-category h4 { font-weight: 600; color: #1e1b4b; margin-bottom: 8px; font-size: 14px; }
    .skill-list { list-style: none; }
    .skill-list li { color: #4b5563; font-size: 13px; margin-bottom: 4px; padding-left: 15px; position: relative; }
    .skill-list li::before { content: "•"; color: #6366f1; position: absolute; left: 0; }
    .education-item { margin-bottom: 12px; }
    .edu-degree { font-weight: 600; color: #1e1b4b; font-size: 14px; }
    .edu-school { color: #6366f1; font-size: 13px; }
    .edu-period { color: #9ca3af; font-size: 12px; }
    .links { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
    .links a { color: #6366f1; text-decoration: none; font-size: 13px; margin-right: 20px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <header class="header">
    <h1 class="name">${profile.name}</h1>
    <p class="title">${profile.title}</p>
    <div class="contact">
      <span>📧 ${profile.email}</span>
      <span>📱 ${profile.phone}</span>
      <span>📍 ${profile.location}</span>
    </div>
  </header>

  <section class="section">
    <h2 class="section-title">Professional Summary</h2>
    <p class="summary">${profile.summary}</p>
  </section>

  <section class="section">
    <h2 class="section-title">Experience</h2>
    ${experiences.map((exp) => `
      <div class="experience-item">
        <div class="exp-header">
          <div>
            <div class="exp-title">${exp.title}</div>
            <div class="exp-company">${exp.company}</div>
          </div>
          <div class="exp-period">${exp.period}</div>
        </div>
        <ul class="exp-desc">
          ${exp.description.map((desc) => `<li>${desc}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </section>

  <section class="section">
    <h2 class="section-title">Skills</h2>
    <div class="skills-grid">
      <div class="skill-category">
        <h4>Languages & Frameworks</h4>
        <ul class="skill-list">
          ${SKILLS.languages.map((s) => `<li>${s.name} (${s.level})</li>`).join("")}
        </ul>
      </div>
      <div class="skill-category">
        <h4>Databases & Tools</h4>
        <ul class="skill-list">
          ${SKILLS.databases.map((s) => `<li>${s.name} (${s.level})</li>`).join("")}
        </ul>
      </div>
    </div>
  </section>

  <section class="section">
    <h2 class="section-title">Education</h2>
    ${EDUCATION.map((edu) => `
      <div class="education-item">
        <div class="edu-degree">${edu.degree}</div>
        <div class="edu-school">${edu.institution}</div>
        <div class="edu-period">${edu.period}</div>
      </div>
    `).join("")}
  </section>

  <div class="links">
    ${profile.github_url ? `<a href="${profile.github_url}" target="_blank">GitHub</a>` : ""}
    ${profile.linkedin_url ? `<a href="${profile.linkedin_url}" target="_blank">LinkedIn</a>` : ""}
  </div>
</body>
</html>`;

    // Create and download the HTML file
    const blob = new Blob([cvContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, "_")}_CV.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also open print dialog for PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(cvContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }

    setLoading(false);
  };

  return (
    <Button 
      variant="hero" 
      size="lg" 
      onClick={generateCV} 
      disabled={loading}
      className="text-sm md:text-base"
    >
      <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
      {loading ? "Generating..." : "Download CV"}
    </Button>
  );
}
