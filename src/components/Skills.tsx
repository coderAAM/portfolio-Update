import { SKILLS } from "@/lib/constants";
import { Code2, Database, Palette, Server } from "lucide-react";

const skillIcons = {
  JavaScript: Code2,
  "React & Redux": Code2,
  "Node.js & Express": Server,
  TypeScript: Code2,
  "MongoDB & Mongoose": Database,
  "Tailwind CSS": Palette,
  "HTML/CSS": Palette,
  WordPress: Code2,
};

export function Skills() {
  return (
    <section id="skills" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-primary font-mono text-sm mb-2">{"<Skills />"}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Technical <span className="text-gradient">Expertise</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive toolkit of modern technologies for building exceptional web applications
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Languages & Frameworks */}
          <div className="glass rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Languages & Frameworks</h3>
            </div>
            <div className="space-y-6">
              {SKILLS.languages.map((skill, index) => {
                const Icon = skillIcons[skill.name as keyof typeof skillIcons] || Code2;
                return (
                  <div key={skill.name} className="space-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{skill.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        skill.level === "Expert" 
                          ? "bg-primary/20 text-primary" 
                          : "bg-accent/20 text-accent"
                      }`}>
                        {skill.level}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          skill.level === "Expert" 
                            ? "bg-gradient-to-r from-primary to-primary/70 w-[95%]" 
                            : "bg-gradient-to-r from-accent to-accent/70 w-[75%]"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Databases & Tools */}
          <div className="glass rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Database className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Databases & Tools</h3>
            </div>
            <div className="space-y-6">
              {SKILLS.databases.map((skill, index) => {
                const Icon = skillIcons[skill.name as keyof typeof skillIcons] || Database;
                return (
                  <div key={skill.name} className="space-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{skill.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        skill.level === "Expert" 
                          ? "bg-primary/20 text-primary" 
                          : "bg-accent/20 text-accent"
                      }`}>
                        {skill.level}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          skill.level === "Expert" 
                            ? "bg-gradient-to-r from-primary to-primary/70 w-[95%]" 
                            : "bg-gradient-to-r from-accent to-accent/70 w-[75%]"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tech Stack Icons */}
        <div className="mt-16 flex flex-wrap justify-center gap-6">
          {["React", "Node.js", "MongoDB", "Express", "TypeScript", "Tailwind", "WordPress", "Git"].map((tech) => (
            <div
              key={tech}
              className="px-6 py-3 glass rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all cursor-default"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
