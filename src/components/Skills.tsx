import { Code2, Database, Palette, Server } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useGsapFadeIn, useGsapStagger } from "@/hooks/useGsapAnimation";

const skillIcons: Record<string, typeof Code2> = {
  JavaScript: Code2, "React & Redux": Code2, "Node.js & Express": Server,
  TypeScript: Code2, "MongoDB & Mongoose": Database, "Tailwind CSS": Palette,
  "HTML/CSS": Palette, WordPress: Code2, MongoDB: Database,
  PostgreSQL: Database, MySQL: Database, Git: Code2, Docker: Server, AWS: Server,
};

export function Skills() {
  const sectionRef = useGsapFadeIn<HTMLDivElement>();
  const skillsRef = useGsapStagger<HTMLDivElement>(".skill-item");

  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const languageSkills = skills.filter((s) => s.category === "languages");
  const databaseSkills = skills.filter((s) => s.category === "databases");

  return (
    <section id="skills" className="py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div ref={sectionRef} className="glass rounded-xl p-4 sm:p-6 md:p-8 shadow-sm" style={{ opacity: 0 }}>
          <h2 className="text-lg font-semibold text-foreground mb-1">Skills</h2>
          <p className="text-sm text-muted-foreground mb-6">Top skills and technologies</p>

          <div ref={skillsRef} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Languages & Frameworks</h3>
              </div>
              <div className="space-y-4">
                {languageSkills.map((skill) => {
                  const Icon = skillIcons[skill.name] || Code2;
                  return (
                    <div key={skill.name} className="skill-item flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-primary/5 rounded-lg px-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-sm text-foreground">{skill.name}</span>
                      </div>
                      <Badge variant={skill.level === "Expert" ? "default" : "secondary"} className="text-xs">{skill.level}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Databases & Tools</h3>
              </div>
              <div className="space-y-4">
                {databaseSkills.map((skill) => {
                  const Icon = skillIcons[skill.name] || Database;
                  return (
                    <div key={skill.name} className="skill-item flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-accent/5 rounded-lg px-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-sm text-foreground">{skill.name}</span>
                      </div>
                      <Badge variant={skill.level === "Expert" ? "default" : "secondary"} className="text-xs">{skill.level}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {["React", "Node.js", "MongoDB", "Express", "TypeScript", "Tailwind", "WordPress", "Git"].map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs font-normal hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-default">{tech}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
