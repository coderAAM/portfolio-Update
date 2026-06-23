import { useEffect, useState } from "react";
import { ExternalLink, Github, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchProjects())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="projects" className="py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="glass rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-foreground">Featured</h2>
            {projects.length > 4 && (
              <Link to="/projects">
                <Button variant="ghost" size="sm" className="text-primary text-sm">Show all →</Button>
              </Link>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-6">Projects and portfolio work</p>

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-border/50 rounded-xl p-4 animate-pulse">
                  <div className="h-36 bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No projects yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="border border-border/50 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1">
                  <div className="relative h-36 overflow-hidden bg-muted">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <Folder className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {project.featured && <Badge className="absolute top-2 left-2 text-xs">Featured</Badge>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-[10px] font-normal">{tech}</Badge>
                      ))}
                      {project.technologies.length > 3 && <Badge variant="outline" className="text-[10px] font-normal">+{project.technologies.length - 3}</Badge>}
                    </div>
                    <div className="flex gap-2">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 hover:bg-primary/10"><Github className="h-3.5 w-3.5" />Code</Button>
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 hover:bg-accent/10"><ExternalLink className="h-3.5 w-3.5" />Live</Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
