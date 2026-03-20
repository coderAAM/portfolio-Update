import { useEffect, useState } from "react";
import { Briefcase, GraduationCap, Calendar } from "lucide-react";
import { EDUCATION } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string[];
  sort_order: number;
}

export function Experience() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
    const channel = supabase
      .channel('experience-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experience' }, () => fetchExperiences())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchExperiences() {
    try {
      const { data, error } = await supabase.from("experience").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="experience" className="py-4">
      <div className="max-w-4xl mx-auto px-4 space-y-2">
        <div className="glass rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Experience</h2>
          </div>

          {loading ? (
            <div className="space-y-6 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No experience added yet</p>
            </div>
          ) : (
            <div className="mt-4 space-y-0">
              {experiences.map((exp, index) => (
                <div key={exp.id} className={`flex gap-4 py-4 ${index < experiences.length - 1 ? "border-b border-border/50" : ""} hover:bg-primary/5 rounded-lg px-2 transition-colors`}>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground">{exp.title}</h3>
                    <p className="text-sm text-foreground/80">{exp.company}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />{exp.period}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {exp.description.slice(0, 2).map((item, i) => (
                        <li key={i} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Education</h2>
          </div>
          <div className="mt-4 space-y-0">
            {EDUCATION.map((edu, index) => (
              <div key={index} className={`flex gap-4 py-4 ${index < EDUCATION.length - 1 ? "border-b border-border/50" : ""} hover:bg-accent/5 rounded-lg px-2 transition-colors`}>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground">{edu.degree}</h3>
                  <p className="text-sm text-foreground/80">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{edu.period}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
