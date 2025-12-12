import { Briefcase, GraduationCap, Calendar } from "lucide-react";
import { EXPERIENCE, EDUCATION } from "@/lib/constants";

export function Experience() {
  return (
    <section id="experience" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-primary font-mono text-sm mb-2">{"<Experience />"}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Professional <span className="text-gradient">Journey</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            My career path and educational background that shaped me as a developer
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Work Experience */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Work Experience</h3>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent" />

              <div className="space-y-8">
                {EXPERIENCE.map((exp, index) => (
                  <div key={index} className="relative pl-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-2 top-2 w-5 h-5 rounded-full bg-primary border-4 border-background" />
                    
                    <div className="glass rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>{exp.period}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-1">
                        {exp.title}
                      </h4>
                      <p className="text-sm text-primary mb-4">{exp.company}</p>
                      <ul className="space-y-2">
                        {exp.description.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-accent mt-1">▸</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-accent/10 rounded-xl">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold">Education</h3>
            </div>

            <div className="space-y-6">
              {EDUCATION.map((edu, index) => (
                <div
                  key={index}
                  className="glass rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300 border-l-4 border-accent"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{edu.period}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-1">
                    {edu.degree}
                  </h4>
                  <p className="text-sm text-accent">{edu.institution}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">2+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-accent mb-1">20+</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
