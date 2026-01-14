import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PROFILE, SKILLS, EDUCATION, SOCIAL_LINKS } from "@/lib/constants";
import { CV_TEMPLATES, CVData } from "@/lib/cv-templates";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface Skill {
  name: string;
  level: string;
  category: string;
}

export function CVDownload() {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const pdfContentRef = useRef<HTMLDivElement>(null);
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
  const [skills, setSkills] = useState<Skill[]>([]);

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

    const { data: skillsData } = await supabase
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true });

    if (skillsData && skillsData.length > 0) {
      setSkills(skillsData);
    } else {
      const fallbackSkills = [
        ...SKILLS.languages.map(s => ({ ...s, category: "languages" })),
        ...SKILLS.databases.map(s => ({ ...s, category: "databases" })),
      ];
      setSkills(fallbackSkills);
    }
  };

  const getCVData = (): CVData => ({
    ...profile,
    experiences,
    skills,
    education: EDUCATION,
  });

  const openPreview = (templateId: string) => {
    const template = CV_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    setSelectedTemplate(templateId);
    setPreviewHtml(template.generate(getCVData()));
    setPreviewOpen(true);
  };

  const generatePDF = async () => {
    if (!selectedTemplate || !pdfContentRef.current) return;
    setLoading(true);

    try {
      const canvas = await html2canvas(pdfContentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${profile.name.replace(/\s+/g, "_")}_CV.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }

    setLoading(false);
    setPreviewOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="hero" 
            size="lg" 
            className="text-sm md:text-base"
          >
            <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Download CV
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top" className="w-56">
          {CV_TEMPLATES.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => openPreview(template.id)}
              className="cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              <div className="flex flex-col">
                <span className="font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground">{template.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span>CV Preview - {CV_TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/50 rounded-lg p-4">
            <div 
              ref={pdfContentRef}
              className="bg-white mx-auto shadow-lg"
              style={{ maxWidth: "210mm" }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 flex-shrink-0">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generatePDF} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
