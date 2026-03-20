import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const skillLogos: Record<string, string> = {
  JavaScript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  TypeScript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  React: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "React & Redux": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "Node.js & Express": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  Express: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  MongoDB: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  "MongoDB & Mongoose": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  PostgreSQL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  MySQL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
  Tailwind: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
  "HTML/CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  HTML: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  CSS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  Git: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  Docker: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  AWS: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg",
  WordPress: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg",
  Python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  Redux: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg",
  Firebase: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
  Linux: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  VS_Code: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
  Figma: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  NextJS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  GraphQL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg",
};

function getLogoUrl(name: string): string | null {
  if (skillLogos[name]) return skillLogos[name];
  // Try partial match
  const key = Object.keys(skillLogos).find(
    (k) => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
  );
  return key ? skillLogos[key] : null;
}

export function Skills() {
  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="skills" className="py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="glass rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-1">Skills</h2>
          <p className="text-sm text-muted-foreground mb-6">Top skills and technologies</p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {skills.map((skill) => {
              const logoUrl = getLogoUrl(skill.name);
              return (
                <div
                  key={skill.id}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-primary/10 hover:border-primary/30 hover:scale-105 transition-all duration-200 cursor-default"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={skill.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                        {skill.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-foreground text-center leading-tight line-clamp-2">
                    {skill.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider">
                    {skill.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
