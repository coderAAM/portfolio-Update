import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_PASSWORD, PROFILE, SOCIAL_LINKS, SKILLS, EXPERIENCE, EDUCATION } from "@/lib/constants";
import {
  Plus,
  Trash2,
  Edit,
  LogOut,
  Code2,
  Lock,
  X,
  Check,
  User,
  Briefcase,
} from "lucide-react";
import { Session } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    technologies: "",
    github_url: "",
    live_url: "",
    featured: false,
  });

  // Profile state (read-only display for now - stored in constants)
  const [profileData] = useState({
    name: PROFILE.name,
    title: PROFILE.title,
    email: PROFILE.email,
    phone: PROFILE.phone,
    location: PROFILE.location,
    summary: PROFILE.summary,
    github: SOCIAL_LINKS.github,
    linkedin: SOCIAL_LINKS.linkedin,
  });

  useEffect(() => {
    document.documentElement.classList.add("dark");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session && isAdminVerified) {
      fetchProjects();
    }
  }, [session, isAdminVerified]);

  const verifyAdminPassword = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminVerified(true);
      toast({ title: "Access granted!", description: "Welcome to admin panel." });
    } else {
      toast({
        title: "Invalid password",
        description: "Please enter the correct admin password.",
        variant: "destructive",
      });
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProjects(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      title: formData.title,
      description: formData.description,
      image_url: formData.image_url || null,
      technologies: formData.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      github_url: formData.github_url || null,
      live_url: formData.live_url || null,
      featured: formData.featured,
    };

    if (editingProject) {
      const { error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", editingProject.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Project updated!" });
        fetchProjects();
      }
    } else {
      const { error } = await supabase.from("projects").insert([projectData]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Project added!" });
        fetchProjects();
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Project deleted!" });
      fetchProjects();
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      image_url: project.image_url || "",
      technologies: project.technologies.join(", "),
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      featured: project.featured,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      technologies: "",
      github_url: "",
      live_url: "",
      featured: false,
    });
    setEditingProject(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdminVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md">
          <div className="glass rounded-2xl p-6 md:p-8 animate-scale-in">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <Lock className="h-7 w-7 md:h-8 md:w-8 text-destructive" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">Admin Access</h1>
              <p className="text-muted-foreground text-sm">
                Enter your admin password to continue
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                onKeyDown={(e) => e.key === "Enter" && verifyAdminPassword()}
              />
              <Button variant="hero" className="w-full" onClick={verifyAdminPassword}>
                Verify Access
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
                Back to Portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Code2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <h1 className="text-lg md:text-xl font-bold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline truncate max-w-32 md:max-w-none">
                {session?.user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Projects</h2>
                <p className="text-sm text-muted-foreground">Manage your portfolio projects</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button variant="hero" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProject ? "Edit Project" : "Add New Project"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="technologies">Technologies (comma separated) *</Label>
                      <Input
                        id="technologies"
                        value={formData.technologies}
                        onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                        placeholder="React, Node.js, MongoDB"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="github_url">GitHub URL</Label>
                        <Input
                          id="github_url"
                          value={formData.github_url}
                          onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                          placeholder="https://github.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="live_url">Live URL</Label>
                        <Input
                          id="live_url"
                          value={formData.live_url}
                          onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      />
                      <Label htmlFor="featured">Featured Project</Label>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button type="submit" variant="hero" className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        {editingProject ? "Update" : "Add"} Project
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
              <div className="text-center py-12 md:py-16 glass rounded-2xl">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">No Projects Yet</h3>
                <p className="text-sm text-muted-foreground mb-4 md:mb-6 px-4">
                  Add your first project to showcase your work
                </p>
                <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Project
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="glass rounded-xl overflow-hidden">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-32 md:h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 md:h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Code2 className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="p-3 md:p-4">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-semibold text-sm md:text-base truncate">{project.title}</h3>
                        {project.featured && (
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full whitespace-nowrap">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3 md:mb-4">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span key={tech} className="text-xs px-2 py-0.5 bg-muted rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(project)} className="flex-1 text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="text-xs">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="mx-4">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete "{project.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(project.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">View and manage your profile information</p>
            </div>

            <div className="glass rounded-2xl p-4 md:p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Full Name</Label>
                  <p className="font-medium mt-1">{profileData.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Title</Label>
                  <p className="font-medium mt-1 text-sm">{profileData.title}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium mt-1">{profileData.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <p className="font-medium mt-1">{profileData.phone}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Location</Label>
                <p className="font-medium mt-1">{profileData.location}</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Summary</Label>
                <p className="font-medium mt-1 text-sm leading-relaxed">{profileData.summary}</p>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-4">Social Links</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">GitHub</Label>
                    <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="font-medium mt-1 text-sm text-primary hover:underline block truncate">
                      {profileData.github}
                    </a>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">LinkedIn</Label>
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium mt-1 text-sm text-primary hover:underline block truncate">
                      {profileData.linkedin}
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-4">Skills</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Languages & Frameworks</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SKILLS.languages.map((skill) => (
                        <span key={skill.name} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Databases & Tools</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SKILLS.databases.map((skill) => (
                        <span key={skill.name} className="text-xs px-2 py-1 bg-accent/10 text-accent-foreground rounded-full">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-4">Experience</h3>
                <div className="space-y-4">
                  {EXPERIENCE.map((exp, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="font-medium text-sm">{exp.title}</h4>
                      <p className="text-xs text-muted-foreground">{exp.company} • {exp.period}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-4">Education</h3>
                <div className="space-y-4">
                  {EDUCATION.map((edu, index) => (
                    <div key={index} className="border-l-2 border-accent pl-4">
                      <h4 className="font-medium text-sm">{edu.degree}</h4>
                      <p className="text-xs text-muted-foreground">{edu.institution} • {edu.period}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mt-6">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Profile data is stored in the codebase (src/lib/constants.ts). 
                  To update your profile, modify the constants file directly or contact the developer.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;